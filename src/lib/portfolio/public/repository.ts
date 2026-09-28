import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { photoRow, portfolioRow, urlRow } from "./schema";
import type { PortfolioProject } from "./types";

const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;

async function loadPortfolioProjects(): Promise<PortfolioProject[]> {
  const client = db();
  const { data: rawProjects, error: projectError } = await client
    .from("portfolio")
    .select(
      "id, slug, name, summary, description, category, stack, started_at, ended_at, is_maintained, featured, thumbnail_photo_id, mobile_thumbnail_photo_id, updated_at",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (projectError) throw new Error(`포트폴리오 조회 실패: ${projectError.code}`);
  const projects = z.array(portfolioRow).parse(rawProjects);
  if (!projects.length) return [];

  const ids = projects.map((project) => project.id);
  const [photoResult, urlResult] = await Promise.all([
    client
      .from("photo_map")
      .select("id, portfolio_id, storage_key, alt_text, gallery_order, created_at")
      .in("portfolio_id", ids),
    client
      .from("portfolio_url")
      .select("id, portfolio_id, type, label, url, sort_order")
      .in("portfolio_id", ids),
  ]);
  if (photoResult.error) throw new Error(`포트폴리오 사진 조회 실패: ${photoResult.error.code}`);
  if (urlResult.error) throw new Error(`포트폴리오 링크 조회 실패: ${urlResult.error.code}`);

  const photos = z.array(photoRow).parse(photoResult.data);
  const urls = z.array(urlRow).parse(urlResult.data);
  const publicUrl = (key: string) =>
    client.storage.from("portfolio").getPublicUrl(key).data.publicUrl;

  return projects.map((project) => {
    const ownPhotos = photos.filter((photo) => photo.portfolio_id === project.id);
    const coverPhoto = ownPhotos.find((photo) => photo.id === project.thumbnail_photo_id);
    const mobilePhoto = ownPhotos.find((photo) => photo.id === project.mobile_thumbnail_photo_id);
    const cover = coverPhoto
      ? publicUrl(coverPhoto.storage_key)
      : mobilePhoto
        ? publicUrl(mobilePhoto.storage_key)
        : null;
    const mobileCover = mobilePhoto ? publicUrl(mobilePhoto.storage_key) : cover;
    const gallery = ownPhotos
      .filter((photo) => photo.gallery_order !== null)
      .sort(
        (a, b) =>
          a.gallery_order! - b.gallery_order! ||
          a.created_at.localeCompare(b.created_at) ||
          a.id.localeCompare(b.id),
      )
      .map((photo) => ({ id: photo.id, src: publicUrl(photo.storage_key), alt: photo.alt_text }));
    const projectUrls = urls
      .filter((url) => url.portfolio_id === project.id)
      .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id))
      .map((url) => ({ type: url.type, label: url.label, url: url.url }));

    return {
      id: project.id,
      slug: project.slug,
      title: project.name,
      summary: project.summary,
      body: project.description,
      category: project.category,
      stack: project.stack,
      startedAt: project.started_at,
      endedAt: project.ended_at,
      isMaintained: project.is_maintained,
      featured: project.featured,
      cover,
      mobileCover,
      gallery,
      urls: projectUrls,
      updatedAt: project.updated_at,
    };
  });
}

const cachedProjects = unstable_cache(loadPortfolioProjects, ["codest-portfolio-v1"], {
  revalidate: 600,
  tags: ["codest-portfolio"],
});

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    if (process.env.NODE_ENV !== "production") return [];
    throw new Error("운영 포트폴리오용 Supabase 설정이 필요합니다.");
  }
  return cachedProjects();
}

export async function getPortfolioProject(slug: string): Promise<PortfolioProject | null> {
  if (!slugPattern.test(slug)) return null;
  return (await getPortfolioProjects()).find((project) => project.slug === slug) ?? null;
}
