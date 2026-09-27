import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const metaSchema = z.object({
  title: z.string().min(1), summary: z.string().min(1),
  cover: z.string().nullish(),
  category: z.string().default("프로젝트"), stack: z.array(z.string()).default([]),
  publishedAt: z.coerce.date(), featured: z.boolean().default(false), draft: z.boolean().default(false),
});
export type PortfolioProject = z.infer<typeof metaSchema> & { slug: string; body: string };
const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function portfolioImageUrl(source: string | undefined): string | null {
  if (!source) return null;
  try {
    const absolute = new URL(source);
    return absolute.protocol === "https:" ? absolute.href : null;
  } catch {
    const config = githubConfig();
    if (!config || source.startsWith("/") || source.startsWith("." + ".")) return null;
    const base = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.ref}/${config.dir}/`;
    const url = new URL(source, base);
    if (!url.href.startsWith(base)) return null;
    if (process.env.GITHUB_TOKEN) {
      const relative = url.pathname.slice(new URL(base).pathname.length);
      return `/api/portfolio-assets/${relative.split("/").map(part => encodeURIComponent(decodeURIComponent(part))).join("/")}`;
    }
    return url.href;
  }
}

function parseProject(slug: string, markdown: string): PortfolioProject | null {
  if (!slugPattern.test(slug)) return null;
  const parsed = matter(markdown);
  const meta = metaSchema.parse(parsed.data);
  if (meta.draft) return null;
  const cover = meta.cover ? portfolioImageUrl(meta.cover) : null;
  if (meta.cover && !cover) throw new Error(`${slug}: 대표 이미지 경로가 올바르지 않습니다.`);
  return { ...meta, cover, slug, body: parsed.content };
}

function githubConfig() {
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_REF = "main", PORTFOLIO_DIR = "content/portfolio" } = process.env;
  if (!GITHUB_OWNER || !GITHUB_REPO) return null;
  if (![GITHUB_OWNER, GITHUB_REPO, GITHUB_REF].every(x => /^[\w.-]+$/.test(x)) || !/^[\w/.-]+$/.test(PORTFOLIO_DIR) || PORTFOLIO_DIR.includes("..")) throw new Error("포트폴리오 저장소 설정이 올바르지 않습니다.");
  return { owner: GITHUB_OWNER, repo: GITHUB_REPO, ref: GITHUB_REF, dir: PORTFOLIO_DIR };
}

async function githubJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }, next: { revalidate: 600 } });
  if (!response.ok) throw new Error(`GitHub 포트폴리오 요청 실패 (${response.status})`);
  return response.json();
}

async function sourceFiles(): Promise<{ slug: string; markdown: string }[]> {
  if (process.env.LOCAL_PREVIEW === "true" && process.env.NODE_ENV !== "production") {
    const directory = path.join(process.cwd(), "content", "portfolio");
    const names = (await fs.readdir(directory)).filter(name => /^[a-z0-9][a-z0-9-]*\.md$/.test(name));
    return Promise.all(names.map(async name => ({ slug: name.slice(0, -3), markdown: await fs.readFile(path.join(directory, name), "utf8") })));
  }
  const config = githubConfig();
  if (!config) return [];
  const base = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.dir}`;
  const listing = await githubJson(`${base}?ref=${encodeURIComponent(config.ref)}`);
  if (!Array.isArray(listing)) throw new Error("포트폴리오 파일 목록 형식이 올바르지 않습니다.");
  const files = listing.filter((item): item is { name: string; type: string } => typeof item === "object" && item !== null && "name" in item && "type" in item && typeof item.name === "string" && item.type === "file" && /^[a-z0-9][a-z0-9-]*\.md$/.test(item.name));
  return Promise.all(files.map(async file => {
    const detail = await githubJson(`${base}/${encodeURIComponent(file.name)}?ref=${encodeURIComponent(config.ref)}`) as { content?: string; encoding?: string };
    if (detail.encoding !== "base64" || !detail.content) throw new Error(`${file.name}: Markdown 파일을 읽을 수 없습니다.`);
    return { slug: file.name.slice(0, -3), markdown: Buffer.from(detail.content.replace(/\s/g, ""), "base64").toString("utf8") };
  }));
}

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  const files = await sourceFiles();
  const projects = files.map(file => parseProject(file.slug, file.markdown)).filter((item): item is PortfolioProject => item !== null);
  return projects.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getPortfolioProject(slug: string) {
  if (!slugPattern.test(slug)) return null;
  return (await getPortfolioProjects()).find(project => project.slug === slug) ?? null;
}
