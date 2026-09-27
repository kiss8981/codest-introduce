import Image from "next/image";
import Link from "next/link";
import SiteFrame from "@/components/site/SiteFrame";
import ProjectCard from "@/components/site/ProjectCard";
import { getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 600;

export default async function Home() {
  const projects = (await getPortfolioProjects()).filter(project => project.featured).slice(0, 3);

  return (
    <SiteFrame>
      <main>
        <section className="home-hero">
          <div className="site-shell hero-inner">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-light">CODEST · WEB & APP STUDIO</p>
              <h1 className="display">좋은 아이디어가<br /><span>좋은 서비스가</span> 되도록.</h1>
              <p className="hero-description">웹사이트 하나부터 앱, 운영 도구까지.<br />무엇을 만들고 싶은지 편하게 들려주세요.<br />필요한 것을 함께 정리하고 끝까지 만들어갑니다.</p>
              <div className="button-row">
                <Link className="button button-primary" href="/contact">우리 프로젝트 이야기하기 <span aria-hidden="true">↗</span></Link>
                <Link className="button button-ghost" href="/portfolio">작업 둘러보기 <span aria-hidden="true">→</span></Link>
              </div>
            </div>
            <div className="hero-mark" aria-hidden="true">
              <Image src="/brand/logo_short.png" alt="" width={1024} height={1024} priority />
            </div>
          </div>
          <div className="site-shell hero-footnote">아이디어의 시작부터, 실제 사용되는 순간까지.</div>
        </section>

        <section className="intro-section section-space">
          <div className="site-shell editorial-heading">
            <div><p className="eyebrow">ABOUT CODEST</p><h2 className="section-title">만들고 싶은 것이 있다면,<br />그 이야기부터 시작해요.</h2></div>
            <p className="editorial-copy">처음부터 모든 게 정해져 있을 필요는 없습니다. 어떤 사람이, 어떤 순간에 쓰게 될지 함께 생각하고 웹과 앱에 꼭 필요한 경험을 만듭니다.</p>
          </div>
        </section>

        <section className="work-section section-space">
          <div className="site-shell">
            <div className="section-heading">
              <div><p className="eyebrow">OUR WORK</p><h2 className="section-title">우리가 만든 서비스</h2><p className="section-description">작은 문제 하나를 해결하는 일부터, 새로운 서비스의 시작까지.</p></div>
              <Link className="text-link" href="/portfolio">전체 프로젝트 보기 <span aria-hidden="true">↗</span></Link>
            </div>
            {projects.length
              ? <div className="project-grid">{projects.map(project => <ProjectCard key={project.slug} project={project} />)}</div>
              : <p className="empty-work">소개할 프로젝트를 준비하고 있습니다.</p>}
          </div>
        </section>

        <section className="services-section section-space">
          <div className="site-shell services-layout">
            <div className="services-intro"><p className="eyebrow">WHAT WE DO</p><h2 className="section-title">웹과 앱,<br />필요한 만큼<br />제대로 만듭니다.</h2><p>새 서비스의 첫 화면부터 매일 쓰는 운영 도구까지, 목적에 맞는 방법을 함께 찾습니다.</p></div>
            <div className="service-list">
              <div className="service-item"><span>01</span><div><h3>웹 서비스</h3><p>브랜드를 소개하는 웹사이트부터 사용자와 만나는 서비스까지.</p></div></div>
              <div className="service-item"><span>02</span><div><h3>모바일 앱</h3><p>손안에서 자연스럽게 이어지는 사용 경험을 만듭니다.</p></div></div>
              <div className="service-item"><span>03</span><div><h3>운영 시스템</h3><p>반복되는 일을 줄이고 중요한 일에 집중할 수 있는 도구를 만듭니다.</p></div></div>
            </div>
          </div>
        </section>

        <section className="process-section section-space">
          <div className="site-shell">
            <div className="editorial-heading"><div><p className="eyebrow">HOW WE WORK</p><h2 className="section-title">하나씩 이야기하고,<br />함께 완성합니다.</h2></div><p className="editorial-copy">막연한 아이디어도 괜찮습니다. 만들 범위와 일정을 정리한 뒤 화면과 기능을 구현하고, 실제 사용을 앞두고 함께 확인합니다.</p></div>
            <div className="process-list"><div><span>01</span><strong>이야기 나누기</strong></div><div><span>02</span><strong>범위와 일정 정하기</strong></div><div><span>03</span><strong>디자인하고 만들기</strong></div><div><span>04</span><strong>확인하고 출시하기</strong></div></div>
          </div>
        </section>

        <section className="home-cta section-space"><div className="site-shell cta-inner"><div><p className="eyebrow eyebrow-light">LET’S MAKE IT REAL</p><h2 className="section-title">어떤 서비스를 생각하고 계신가요?</h2><p>한두 문장으로 시작해도 좋아요. 편하게 들려주세요.</p></div><Link className="button button-white" href="/contact">제작 이야기 나누기 <span aria-hidden="true">↗</span></Link></div></section>
      </main>
    </SiteFrame>
  );
}
