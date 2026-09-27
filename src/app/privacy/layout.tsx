import Link from "next/link";
export default function LegacyLayout({ children }: { children: React.ReactNode }) { return <div className="legacy"><header className="legacy-header"><Link href="/">Codest</Link><Link href="/portfolio">포트폴리오</Link><Link href="/contact">제작문의</Link></header>{children}<footer className="legacy-footer"><Link href="/">홈으로</Link></footer></div>; }
