import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteFrame from "@/components/site/SiteFrame";
import {
  markdownBody,
  pageTitle,
  primaryButton,
  sectionTitle,
  shell,
} from "@/components/site/styles";
import { getPortfolioProject, getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPortfolioProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = await getPortfolioProject((await params).slug);
  return project
    ? {
        title: project.title,
        description: project.summary,
        ...(project.cover ? { openGraph: { images: [project.cover] } } : {}),
      }
    : { title: "프로젝트를 찾을 수 없습니다" };
}

function month(value: string) {
  return value.slice(0, 7).replace("-", ".");
}

const linkNames: Record<string, string> = {
  github: "GitHub",
  preview: "사이트 보기",
  app_store: "App Store",
  play_store: "Google Play",
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getPortfolioProject((await params).slug);
  if (!project) notFound();

  return (
    <SiteFrame>
      <main className={`${shell} py-16 md:py-24`}>
        <article className="mx-auto max-w-[1000px]">
          <Link
            href="/portfolio"
            className="text-sm font-extrabold text-brand-deep hover:underline"
          >
            ← 포트폴리오
          </Link>
          <p className="mt-14 text-[13px] font-bold text-brand-deep">{project.category}</p>
          <h1 className={`${pageTitle} mt-5`}>{project.title}</h1>
          <p className="mt-6 max-w-[760px] break-keep text-xl leading-[1.7] text-brand-muted">
            {project.summary}
          </p>

          <div className="mt-12 space-y-5 md:mt-16 md:space-y-8">
            {project.gallery.length ? (
              project.gallery.map((photo) => (
                <img
                  key={photo.id}
                  className="block max-h-[800px] w-full rounded-[18px] bg-[#dce7ee] object-contain"
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                />
              ))
            ) : (
              <div className="aspect-video w-full rounded-[18px] bg-[#dce7ee]" aria-hidden="true" />
            )}
          </div>

          <div className="mt-14 grid gap-10 border-b border-[#d8e1e7] pb-16 md:mt-20 md:grid-cols-[minmax(0,1fr)_220px] md:gap-16">
            <div className={markdownBody}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: () => null }}>
                {project.body}
              </ReactMarkdown>
            </div>
            <dl className="space-y-5 text-sm leading-6">
              {(project.startedAt || project.endedAt) && (
                <div>
                  <dt className="font-bold text-brand-ink">제작 기간</dt>
                  <dd className="mt-1 text-brand-muted">
                    {project.startedAt ? month(project.startedAt) : ""}
                    {project.startedAt && project.endedAt ? " — " : ""}
                    {project.endedAt ? month(project.endedAt) : ""}
                  </dd>
                </div>
              )}
              {project.isMaintained && (
                <div>
                  <dt className="font-bold text-brand-ink">현재 관리 중</dt>
                  <dd className="mt-1 text-brand-muted">Codest가 계속 함께하고 있습니다.</dd>
                </div>
              )}
              {project.stack.length > 0 && (
                <div>
                  <dt className="font-bold text-brand-ink">사용 기술</dt>
                  <dd className="mt-1 text-brand-muted">{project.stack.join(" · ")}</dd>
                </div>
              )}
              {project.urls.length > 0 && (
                <div>
                  <dt className="font-bold text-brand-ink">관련 링크</dt>
                  <dd className="mt-2 flex flex-col items-start gap-2">
                    {project.urls.map((link, index) => (
                      <a
                        key={`${link.type}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-deep hover:underline"
                      >
                        {link.label ?? linkNames[link.type] ?? link.type} ↗
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-20">
            <h2 className={sectionTitle}>비슷한 프로젝트를 생각하고 계신가요?</h2>
            <Link className={`${primaryButton} mt-6`} href="/contact">
              제작 문의하기 ↗
            </Link>
          </div>
        </article>
      </main>
    </SiteFrame>
  );
}
