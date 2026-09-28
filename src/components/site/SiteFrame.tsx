import Image from "next/image";
import Link from "next/link";
import { shell } from "./styles";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-brand-ink">
      <header className="relative z-20 border-b border-[#edf0f2] bg-white">
        <div
          className={`${shell} flex min-h-[68px] items-center justify-between gap-4 sm:min-h-[76px]`}
        >
          <Link href="/" aria-label="Codest 홈" className="shrink-0">
            <Image
              className="block h-[34px] w-[114px] object-cover object-center brightness-0 sm:h-10 sm:w-[142px]"
              src="/brand/logo_white.png"
              alt="Codest"
              width={1024}
              height={1024}
              priority
            />
          </Link>
          <nav
            className="flex items-center gap-4 text-xs font-bold sm:gap-8 sm:text-sm"
            aria-label="주 메뉴"
          >
            <Link href="/portfolio" className="whitespace-nowrap hover:text-brand-deep">
              포트폴리오
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-navy px-3 py-2.5 text-white hover:bg-[#16466e] sm:gap-4 sm:px-5 sm:py-3"
            >
              제작문의 <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="bg-[#f5f8fa] pt-14 md:pt-16">
        <div className={`${shell} flex flex-col justify-between gap-10 pb-12 md:flex-row md:pb-16`}>
          <div>
            <strong className="text-2xl font-extrabold tracking-[-0.045em]">
              코디스트(Codest)
            </strong>
            <p className="mt-3 text-sm text-brand-muted">
              아이디어가 서비스가 되는 순간까지 함께합니다.
            </p>
            <div className="mt-6 space-y-1 text-[13px] leading-6 text-brand-muted">
              <p>사업자등록번호 : 511-19-01516</p>
              <p>대표 : 김도현</p>
            </div>
          </div>
          <nav
            className="flex flex-wrap content-start gap-x-7 gap-y-4 text-sm font-semibold md:max-w-[500px] md:justify-end"
            aria-label="하단 메뉴"
          >
            <Link href="/portfolio" className="hover:text-brand-deep">
              포트폴리오
            </Link>
            <Link href="/contact" className="hover:text-brand-deep">
              제작문의
            </Link>
            <Link href="/privacy" className="hover:text-brand-deep">
              개인정보처리방침
            </Link>
          </nav>
        </div>
        <div className={`${shell} border-t border-[#e0e7eb] py-6 text-xs text-[#8794a0]`}>
          © {new Date().getFullYear()} Codest
        </div>
      </footer>
    </div>
  );
}
