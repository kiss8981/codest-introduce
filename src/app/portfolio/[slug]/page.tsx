import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteFrame from "@/components/site/SiteFrame";
import { markdownBody, pageTitle, primaryButton, sectionTitle, shell } from "@/components/site/styles";
import { getPortfolioProject, getPortfolioProjects, portfolioImageUrl } from "@/lib/portfolio";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPortfolioProjects()).map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await getPortfolioProject((await params).slug);
  return project
    ? { title: project.title, description: project.summary, ...(project.cover ? { openGraph: { images: [project.cover] } } : {}) }
    : { title: "프로젝트를 찾을 수 없습니다" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getPortfolioProject((await params).slug);
  if (!project) notFound();

  const coverClass = "mb-16 mt-12 block aspect-video w-full rounded-[18px] bg-[#dce7ee] object-cover md:mb-20";

  return (
    <SiteFrame>
      <main className={`${shell} py-16 md:py-24`}>
        <article className="mx-auto max-w-[900px]">
          <Link href="/portfolio" className="text-sm font-extrabold text-brand-deep hover:underline">← 포트폴리오</Link>
          <p className="mt-14 text-[13px] font-bold text-brand-deep">{project.category}</p>
          <h1 className={`${pageTitle} mt-5`}>{project.title}</h1>
          <p className="mt-6 break-keep text-xl leading-[1.7] text-brand-muted">{project.summary}</p>
          {project.cover ? <img className={coverClass} src={project.cover} alt="" /> : <div className={coverClass} aria-hidden="true" />}
          <div className={markdownBody}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt }) => {
                  const url = portfolioImageUrl(src);
                  return url ? <img src={url} alt={alt ?? ""} loading="lazy" /> : null;
                },
              }}
            >
              {project.body}
            </ReactMarkdown>
          </div>
          <div className="mt-20 border-t border-[#d8e1e7] pt-14">
            <h2 className={sectionTitle}>비슷한 프로젝트를 생각하고 계신가요?</h2>
            <Link className={`${primaryButton} mt-6`} href="/contact">제작 문의하기 ↗</Link>
          </div>
        </article>
      </main>
    </SiteFrame>
  );
}
