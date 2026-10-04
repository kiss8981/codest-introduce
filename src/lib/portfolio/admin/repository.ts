import "server-only";
import { db } from "@/lib/db";
import type { AdminLink, AdminPhoto, AdminPortfolio } from "./types";
import { ApiError } from "@/lib/http";
import { publicUploadUrl } from "@/lib/uploads/storage";
import type { PortfolioInput } from "./schema";

function queryError(code: string | undefined, fallback: string): never {
  throw new ApiError(
    code === "23505" ? "이미 사용 중인 주소나 링크입니다." : fallback,
    code === "23505" ? 409 : 500,
  );
}

export async function findProject(id: string) {
  const { data, error } = await db()
    .from("portfolio")
    .select("id, slug")
    .eq("id", id)
    .maybeSingle();
  if (error) queryError(error.code, "프로젝트를 확인하지 못했습니다.");
  if (!data) throw new ApiError("프로젝트를 찾을 수 없습니다.", 404);
  return data;
}

export async function listProjects(): Promise<{ projects: AdminPortfolio[] }> {
  const client = db();
  const [projectResult, photoResult, linkResult] = await Promise.all([
    client.from("portfolio").select("*").order("created_at", { ascending: false }),
    client.from("photo_map").select("*").order("gallery_order", { ascending: true }),
    client.from("portfolio_url").select("*").order("sort_order", { ascending: true }),
  ]);
  if (projectResult.error)
    queryError(projectResult.error.code, "포트폴리오를 불러오지 못했습니다.");
  if (photoResult.error) queryError(photoResult.error.code, "사진을 불러오지 못했습니다.");
  if (linkResult.error) queryError(linkResult.error.code, "링크를 불러오지 못했습니다.");

  const photos = (photoResult.data ?? []) as Omit<AdminPhoto, "public_url">[];
  const links = (linkResult.data ?? []) as (AdminLink & { portfolio_id: string })[];
  const projects = (projectResult.data ?? []).map((row) => ({
    ...row,
    photos: photos
      .filter((photo) => photo.portfolio_id === row.id)
      .map((photo) => ({
        ...photo,
        public_url: publicUploadUrl("portfolio", photo.storage_key),
      })),
    links: links.filter((link) => link.portfolio_id === row.id),
  })) as AdminPortfolio[];
  return { projects };
}

export async function insertProject(input: PortfolioInput) {
  const { links } = input;
  const fields = {
    slug: input.slug,
    name: input.name,
    summary: input.summary,
    description: input.description,
    category: input.category,
    stack: input.stack,
    started_at: input.started_at,
    ended_at: input.ended_at,
    is_maintained: input.is_maintained,
    is_published: input.is_published,
    featured: input.featured,
    sort_order: input.sort_order,
    thumbnail_photo_id: input.thumbnail_photo_id,
    mobile_thumbnail_photo_id: input.mobile_thumbnail_photo_id,
  };
  const client = db();
  const { data, error } = await client.from("portfolio").insert(fields).select("id, slug").single();
  if (error) queryError(error.code, "포트폴리오를 저장하지 못했습니다.");
  if (links.length) {
    const result = await client.from("portfolio_url").insert(
      links.map((link) => ({
        portfolio_id: data.id,
        type: link.type,
        label: link.label,
        url: link.url,
        sort_order: link.sort_order,
      })),
    );
    if (result.error) {
      await client.from("portfolio").delete().eq("id", data.id);
      queryError(result.error.code, "링크를 저장하지 못했습니다.");
    }
  }
  return { id: data.id };
}

export async function saveProject(input: PortfolioInput) {
  if (!input.id) throw new ApiError("프로젝트 ID가 필요합니다.");
  const { id, links, photos, ...fields } = input;
  const client = db();
  const owned = await client.from("photo_map").select("id").eq("portfolio_id", id);
  if (owned.error) queryError(owned.error.code, "사진을 확인하지 못했습니다.");
  const photoIds = new Set((owned.data ?? []).map((photo) => photo.id));
  if (
    [
      fields.thumbnail_photo_id,
      fields.mobile_thumbnail_photo_id,
      ...photos.map((photo) => photo.id),
    ].some((value) => value && !photoIds.has(value))
  )
    throw new ApiError("다른 프로젝트의 사진은 사용할 수 없습니다.");
  const existing = await client.from("portfolio_url").select("id").eq("portfolio_id", id);
  if (existing.error) queryError(existing.error.code, "링크를 확인하지 못했습니다.");
  const ownedLinks = new Set((existing.data ?? []).map((link) => link.id));
  if (links.some((link) => link.id && !ownedLinks.has(link.id)))
    throw new ApiError("다른 프로젝트의 링크는 사용할 수 없습니다.");

  const updated = await client.from("portfolio").update(fields).eq("id", id);
  if (updated.error) queryError(updated.error.code, "포트폴리오를 저장하지 못했습니다.");
  for (const photo of photos) {
    const result = await client
      .from("photo_map")
      .update({ alt_text: photo.alt_text, gallery_order: photo.gallery_order })
      .eq("id", photo.id)
      .eq("portfolio_id", id);
    if (result.error) queryError(result.error.code, "사진을 저장하지 못했습니다.");
  }
  for (const link of links.filter((item) => item.id)) {
    const result = await client
      .from("portfolio_url")
      .update({ type: link.type, label: link.label, url: link.url, sort_order: link.sort_order })
      .eq("id", link.id!)
      .eq("portfolio_id", id);
    if (result.error) queryError(result.error.code, "링크를 저장하지 못했습니다.");
  }
  const newLinks = links.filter((link) => !link.id);
  if (newLinks.length) {
    const result = await client.from("portfolio_url").insert(
      newLinks.map((link) => ({
        portfolio_id: id,
        type: link.type,
        label: link.label,
        url: link.url,
        sort_order: link.sort_order,
      })),
    );
    if (result.error) queryError(result.error.code, "링크를 저장하지 못했습니다.");
  }
  const keep = new Set(links.map((link) => link.id).filter(Boolean));
  const removed = [...ownedLinks].filter((linkId) => !keep.has(linkId));
  if (removed.length) {
    const result = await client
      .from("portfolio_url")
      .delete()
      .eq("portfolio_id", id)
      .in("id", removed);
    if (result.error) queryError(result.error.code, "링크를 삭제하지 못했습니다.");
  }
  return { id };
}

export async function removeProject(id: string) {
  const client = db();
  const photos = await client.from("photo_map").select("storage_key").eq("portfolio_id", id);
  if (photos.error) queryError(photos.error.code, "사진을 확인하지 못했습니다.");
  const deleted = await client.from("portfolio").delete().eq("id", id);
  if (deleted.error) queryError(deleted.error.code, "프로젝트를 삭제하지 못했습니다.");
  return (photos.data ?? []).map((photo) => photo.storage_key);
}
