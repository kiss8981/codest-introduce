import type { Metadata } from "next";
import SiteFrame from "@/components/site/SiteFrame";
import ProjectCard from "@/components/site/ProjectCard";
import { getPortfolioProjects } from "@/lib/portfolio";

export const metadata: Metadata = { title: "포트폴리오", description: "Codest의 웹·앱 개발 작업 사례" };
export const revalidate = 600;

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  return (
    <SiteFrame>
      <main>
        <section className="portfolio-banner">
          <div className="site-shell"><p className="eyebrow">OUR WORK</p><h1 className="page-title">우리가 만든 서비스</h1><p>필요한 기능을 고민하고, 사람들이 쓰는 화면으로 만들어 온 작업들입니다.</p></div>
        </section>
        <section className="site-shell portfolio-list section-space">
          {projects.length
            ? <div className="project-grid">{projects.map(project => <ProjectCard key={project.slug} project={project} />)}</div>
            : <p className="empty-work">소개할 프로젝트를 준비하고 있습니다.</p>}
        </section>
      </main>
    </SiteFrame>
  );
}
