import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteFrame from "@/components/site/SiteFrame";
import { getPortfolioProject, getPortfolioProjects, portfolioImageUrl } from "@/lib/portfolio";

export const revalidate = 600;
export const dynamicParams = true;
export async function generateStaticParams() { return (await getPortfolioProjects()).map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await getPortfolioProject((await params).slug);
  return project ? { title: project.title, description: project.summary, ...(project.cover ? { openGraph: { images: [project.cover] } } : {}) } : { title: "프로젝트를 찾을 수 없습니다" };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getPortfolioProject((await params).slug);
  if (!project) notFound();
  return <SiteFrame><main className="site-shell site-main"><article className="portfolio-detail"><Link className="site-text-link" href="/portfolio">← 포트폴리오</Link><p className="eyebrow" style={{ marginTop: 58 }}>{project.category}</p><h1 className="page-title">{project.title}</h1><p className="lead">{project.summary}</p>{project.cover ? <img className="project-cover" src={project.cover} alt="" /> : <div className="project-cover" aria-hidden="true" />}<div className="portfolio-body"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: ({ src, alt }) => { const url = portfolioImageUrl(src); return url ? <img src={url} alt={alt ?? ""} loading="lazy" /> : null; } }}>{project.body}</ReactMarkdown></div><div className="cta-section"><h2 className="section-title">비슷한 프로젝트를 생각하고 계신가요?</h2><Link className="button button-primary" href="/contact">제작 문의하기 ↗</Link></div></article></main></SiteFrame>;
}
