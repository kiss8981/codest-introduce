import type { Metadata } from "next";
import SiteFrame from "@/components/site/SiteFrame";
import ProjectCard from "@/components/site/ProjectCard";
import { getPortfolioProjects } from "@/lib/portfolio";

export const metadata: Metadata = { title: "포트폴리오", description: "Codest의 웹·앱 개발 작업 사례" };
export const revalidate = 600;
export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  return <SiteFrame><main className="site-shell site-main"><div className="portfolio-intro"><p className="eyebrow">WORK</p><h1 className="page-title">포트폴리오</h1><p className="lead">문제를 이해하고, 필요한 기능을 만들어 온 작업을 소개합니다.</p></div>{projects.length ? <div className="project-grid">{projects.map(project => <ProjectCard key={project.slug} project={project} />)}</div> : <p className="muted">포트폴리오를 준비하고 있습니다.</p>}</main></SiteFrame>;
}
