import type { Metadata } from "next";
import SiteFrame from "@/components/site/SiteFrame";
import ProjectCard from "@/components/portfolio/ProjectCard";
import { pageTitle, shell } from "@/components/site/styles";
import { getPortfolioProjects } from "@/lib/portfolio/public/repository";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "Codest의 웹·앱 개발 작업 사례",
};
export const revalidate = 600;

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  return (
    <SiteFrame>
      <main>
        <section className="bg-white pb-16 pt-20 md:pb-20 md:pt-24">
          <div className={shell}>
            <h1 className={pageTitle}>우리가 만든 서비스</h1>
            <p className="mt-6 max-w-[600px] break-keep text-lg leading-[1.8] text-[#526574]">
              필요한 기능을 고민하고, 사람들이 쓰는 화면으로 만들어 온 작업들입니다.
            </p>
          </div>
        </section>
        <section className={`${shell} min-h-[460px] pb-24 pt-10 md:pb-32 md:pt-14`}>
          {projects.length ? (
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  wide={projects.length % 2 === 1 && index === 0}
                />
              ))}
            </div>
          ) : (
            <p className="grid min-h-[250px] place-items-center rounded-[18px] border border-dashed border-[#c7d4dd] px-6 text-center text-brand-muted">
              소개할 프로젝트를 준비하고 있습니다.
            </p>
          )}
        </section>
      </main>
    </SiteFrame>
  );
}
