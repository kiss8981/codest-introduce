import { primaryButton, sectionTitle, shell } from "@/components/site/styles";

export default function DriverPage() {
  return (
    <main>
      <section className={`${shell} grid items-center gap-12 py-20 md:grid-cols-2 md:gap-8 md:py-28`}>
        <div>
          <h1 className={`${sectionTitle} max-w-[560px]`}>스쿨버스 위치를 실시간으로 확인하세요</h1>
          <p className="mt-6 max-w-[520px] break-keep text-lg leading-8 text-brand-muted">스쿨버스 위치를 실시간으로 확인하고, QR코드로 탑승자를 확인해 정산을 쉽게 처리할 수 있습니다.</p>
          <a className={`${primaryButton} mt-8`} href="mailto:kdh@codest.kr">이용 문의하기 ↗</a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mx-auto h-auto w-full max-w-[320px]" alt="스쿨버스 앱 화면" src="/images/driver/mockup.png" />
      </section>
      <section className={`${shell} pb-16 text-center md:pb-20`}>
        <h2 className="text-2xl font-semibold">파트너사</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mx-auto mt-8 h-16 w-auto max-w-full object-contain" src="/images/logo/jeilogo.png" alt="파트너사 로고" />
      </section>
      <section className="bg-[#f5f8fa] py-20 md:py-28">
        <div className={`${shell} text-center`}>
          <h2 className={sectionTitle}>탑승확인 및 정산</h2>
          <p className="mx-auto mt-6 max-w-[750px] break-keep text-lg leading-8 text-brand-muted">스쿨버스 탑승자를 QR코드로 간편하게 확인하고, 탑승 횟수에 따라 정산을 쉽게 처리하세요.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mx-auto mt-12 h-auto w-full max-w-[900px] rounded-xl border border-[#d8e1e7] shadow-md" alt="스쿨버스 탑승 확인 화면" src="/images/driver/boarding.png" />
        </div>
      </section>
    </main>
  );
}
