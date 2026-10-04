import type { MetadataRoute } from "next";
import { getPortfolioProjects } from "@/lib/portfolio/public/repository";

export const revalidate = 600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://codest.kr";
  const pages = ["", "/portfolio", "/contact", "/privacy", "/driver"];
  return [
    ...pages.map((path) => ({ url: new URL(path || "/", base).href, lastModified: new Date() })),
    ...(await getPortfolioProjects()).map((project) => ({
      url: new URL(`/portfolio/${project.slug}`, base).href,
      lastModified: new Date(project.updatedAt),
    })),
  ];
}
