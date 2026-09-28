import Image from "next/image";
import Link from "next/link";
import SiteFrame from "@/components/site/SiteFrame";
import ProjectCard from "@/components/site/ProjectCard";
import {
  button,
  section,
  sectionTitle,
  shell,
  textLink,
  primaryButton,
} from "@/components/site/styles";
import { getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 600;

export default async function Home() {
  const projects = (await getPortfolioProjects()).filter((project) => project.featured).slice(0, 3);

  return (
    <SiteFrame>
      <main>
        <section className="overflow-hidden bg-brand-navy text-white">
          <div
            className={`${shell} relative grid min-h-[620px] items-center gap-8 lg:min-h-[660px] lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]`}
          >
            <div className="relative z-10 py-24 md:py-28">
              <h1 className="max-w-[780px] break-keep text-[clamp(2.6rem,5.1vw,4.375rem)] font-extrabold leading-[1.22] tracking-[-0.06em]">
                <span className="block">좋은 아이디어가</span>
                <span className="block text-[#9ddfff]">좋은 서비스가 되도록.</span>
              </h1>
              <p className="mt-8 max-w-[520px] break-keep text-base leading-[1.9] text-[#c4d5e2] md:text-lg">
                웹사이트 하나부터 앱, 운영 도구까지. 무엇을 만들고 싶은지 편하게 들려주세요. 필요한
                것을 함께 정리하고 끝까지 만들어갑니다.
              </p>
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link className={primaryButton} href="/contact">
                  우리 프로젝트 이야기하기 <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  className={`${button} border border-[#657d94] text-white hover:bg-[#1b3854]`}
                  href="/portfolio"
                >
                  작업 둘러보기 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div
              className="pointer-events-none absolute right-[-130px] top-16 w-[320px] opacity-20 sm:right-[-80px] sm:w-[410px] lg:static lg:w-auto lg:opacity-100"
              aria-hidden="true"
            >
              <Image
                src="/brand/logo_short.png"
                alt=""
                width={1024}
                height={1024}
                priority
                className="mx-auto h-auto w-full max-w-[480px]"
              />
            </div>
          </div>
          <div className={`${shell} border-t border-[#31506b] py-6 text-sm text-[#a9c1d3]`}>
            아이디어의 시작부터, 실제 사용되는 순간까지.
          </div>
        </section>

        <section className={`${section}`}>
          <div className={shell}>
            <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className={sectionTitle}>우리가 만든 서비스</h2>
                <p className="mt-5 break-keep text-[17px] leading-7 text-brand-muted">
                  작은 문제 하나를 해결하는 일부터, 새로운 서비스의 시작까지.
                </p>
              </div>
              <Link className={textLink} href="/portfolio">
                전체 프로젝트 보기 <span aria-hidden="true">↗</span>
              </Link>
            </div>
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
          </div>
        </section>

        <section className={`${section} bg-[#f5f8fa]`}>
          <div
            className={`${shell} grid gap-12 lg:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)] lg:gap-20 xl:gap-28`}
          >
            <div>
              <h2 className={`${sectionTitle} max-w-[440px] text-balance`}>
                웹과 앱, 필요한 만큼 제대로 만듭니다.
              </h2>
              <p className="mt-6 max-w-[370px] break-keep text-[17px] leading-[1.8] text-brand-muted">
                새 서비스의 첫 화면부터 매일 쓰는 운영 도구까지, 목적에 맞는 방법을 함께 찾습니다.
              </p>
            </div>
            <div className="border-t border-[#cbd6dd]">
              {[
                ["01", "웹 서비스", "브랜드를 소개하는 웹사이트부터 사용자와 만나는 서비스까지."],
                ["02", "모바일 앱", "손안에서 자연스럽게 이어지는 사용 경험을 만듭니다."],
                [
                  "03",
                  "운영 시스템",
                  "반복되는 일을 줄이고 중요한 일에 집중할 수 있는 도구를 만듭니다.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="grid grid-cols-[42px_1fr] gap-3 border-b border-[#cbd6dd] py-7 sm:grid-cols-[58px_1fr]"
                >
                  <span className="pt-2 text-[13px] font-extrabold text-brand-deep">{number}</span>
                  <div>
                    <h3 className="text-[26px] font-extrabold tracking-[-0.04em]">{title}</h3>
                    <p className="mt-2 break-keep text-base leading-[1.75] text-brand-muted">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${section} bg-white`}>
          <div className={shell}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:items-center lg:gap-16 xl:gap-24">
              <h2 className={`${sectionTitle} max-w-[670px] text-balance`}>
                하나씩 이야기하고, 함께 완성합니다.
              </h2>
              <p className="max-w-[440px] break-keep text-[17px] leading-[1.9] text-[#526574] lg:ml-auto lg:text-lg">
                막연한 아이디어도 괜찮습니다.
                <br className="hidden lg:block" /> 만들 범위와 일정을 정리한 뒤 화면과 기능을
                구현하고,
                <br className="hidden lg:block" /> 실제 사용을 앞두고 함께 확인합니다.
              </p>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-8 md:mt-20 md:grid-cols-4">
              {[
                "이야기 나누기",
                "범위와 일정 정하기",
                "디자인하고 만들기",
                "확인하고 출시하기",
              ].map((label, index) => (
                <div key={label} className="border-t-2 border-[#8cb6cf] pt-6">
                  <span className="mb-6 block text-[13px] font-extrabold text-brand-deep">
                    0{index + 1}
                  </span>
                  <strong className="break-keep text-base font-bold md:text-[19px]">{label}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${section} bg-[#123b60] text-white`}>
          <div
            className={`${shell} flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-end`}
          >
            <div>
              <h2 className={`${sectionTitle} text-balance`}>어떤 서비스를 생각하고 계신가요?</h2>
              <p className="mt-5 text-lg text-[#bed4e6]">
                한두 문장으로 시작해도 좋아요. 편하게 들려주세요.
              </p>
            </div>
            <Link
              className={`${button} shrink-0 bg-white text-[#0b2941] hover:bg-[#dff4ff]`}
              href="/contact"
            >
              제작 이야기 나누기 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
