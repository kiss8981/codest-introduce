import Image from "next/image";
import Link from "next/link";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return <div className="site">
    <header className="site-header"><div className="site-shell site-header-inner">
      <Link href="/" aria-label="Codest 홈"><Image className="site-logo" src="/brand/logo_white.png" alt="Codest" width={1024} height={1024} priority /></Link>
      <nav className="site-nav" aria-label="주 메뉴"><Link href="/portfolio">포트폴리오</Link><Link className="nav-contact" href="/contact">제작문의 ↗</Link></nav>
    </div></header>
    {children}
    <footer className="site-footer"><div className="site-shell site-footer-inner"><span>© {new Date().getFullYear()} Codest</span><div><Link href="/privacy">개인정보처리방침</Link> · <a href="mailto:kdh@codest.kr">kdh@codest.kr</a></div></div></footer>
  </div>;
}
