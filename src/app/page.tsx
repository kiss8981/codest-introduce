import Link from "next/link";
import SiteFrame from "@/components/site/SiteFrame";
import ProjectCard from "@/components/site/ProjectCard";
import { getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 600;
export default async function Home() {
  const projects = (await getPortfolioProjects()).filter(project => project.featured).slice(0, 3);
  return <SiteFrame><main>
    <div className="site-shell hero"><div className="hero-copy"><p className="eyebrow">WEB · APP DEVELOPMENT</p><h1 className="display">아이디어를,<br />실제로 쓰이는<br />서비스로.</h1><p className="lead">Codest는 웹과 앱의 기획부터 개발, 출시 이후의 운영까지 함께합니다. 필요한 기능을 분명하게 정리하고, 사용하기 좋은 서비스로 구현합니다.</p><div className="button-row"><Link className="button button-primary" href="/contact">제작 문의하기 ↗</Link><Link className="button button-secondary" href="/portfolio">포트폴리오 보기</Link></div></div><div className="hero-visual" aria-hidden="true" /></div>
    <section className="section"><div className="site-shell"><div className="section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2 className="section-title">작업 사례</h2></div><Link className="site-text-link" href="/portfolio">전체 포트폴리오 ↗</Link></div>{projects.length ? <div className="project-grid">{projects.map(project => <ProjectCard key={project.slug} project={project} />)}</div> : <p className="muted">포트폴리오를 준비하고 있습니다.</p>}</div></section>
    <section className="section"><div className="site-shell"><p className="eyebrow">WHAT WE BUILD</p><h2 className="section-title">필요한 서비스를 만듭니다.</h2><div className="rule-list"><div className="rule-item"><strong>웹 서비스</strong><p>고객이 편하게 쓰는 웹사이트부터 복잡한 업무 서비스까지 개발합니다.</p></div><div className="rule-item"><strong>모바일 앱</strong><p>사용 흐름을 고려한 모바일 앱을 설계하고 구현합니다.</p></div><div className="rule-item"><strong>운영 시스템</strong><p>데이터와 업무 과정을 한곳에서 관리할 수 있는 도구를 만듭니다.</p></div></div></div></section>
    <section className="section"><div className="site-shell"><p className="eyebrow">OUR PROCESS</p><h2 className="section-title">처음 이야기부터 출시까지</h2><div className="process-list"><div><span>01</span><strong>상담</strong></div><div><span>02</span><strong>범위·일정 협의</strong></div><div><span>03</span><strong>디자인·개발</strong></div><div><span>04</span><strong>검수·출시</strong></div></div></div></section>
    <section className="cta-section"><div className="site-shell"><p className="eyebrow">START A PROJECT</p><h2 className="section-title">만들고 싶은 서비스가 있으신가요?</h2><p className="lead">아이디어 단계여도 괜찮습니다. 필요한 내용을 편하게 알려주세요.</p><Link className="button button-primary" href="/contact">제작 문의하기 ↗</Link></div></section>
  </main></SiteFrame>;
}
