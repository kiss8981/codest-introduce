import type { Metadata } from "next";
import SiteFrame from "@/components/site/SiteFrame";
import InquiryForm from "@/components/site/InquiryForm";
import { pageTitle, shell } from "@/components/site/styles";
import { contactAvailability } from "@/lib/inquiry";

export const metadata: Metadata = { title: "제작문의", description: "Codest에 웹·앱 서비스 제작을 문의해 주세요." };
export const dynamic = "force-dynamic";

export default function ContactPage() {
  const setup = contactAvailability();

  return (
    <SiteFrame>
      <main>
        <section className="bg-[#e9f3f9] py-16 md:py-20">
          <div className={shell}>
            <h1 className={pageTitle}>함께 이야기해 볼까요?</h1>
            <p className="mt-6 max-w-[650px] break-keep text-base leading-[1.85] text-[#526574] md:text-lg">아이디어가 막 떠오른 단계여도 괜찮아요. 어떤 서비스를 생각하고 계신지 편하게 알려주세요.</p>
          </div>
        </section>
        <div className={`${shell} grid gap-14 py-16 md:py-20 lg:grid-cols-[minmax(260px,.78fr)_minmax(0,1.22fr)] lg:gap-12 xl:gap-24`}>
          <div className="min-w-0 lg:order-2 lg:border-l lg:border-[#dce6ec] lg:pl-10 xl:pl-14">
            <div className="mb-9">
              <h2 className="break-keep text-[clamp(1.5rem,2.5vw,2rem)] font-extrabold tracking-[-0.05em]">프로젝트에 대해 알려주세요</h2>
              <p className="mt-2 text-[15px] text-brand-muted">아는 만큼만 적어주셔도 됩니다.</p>
            </div>
            <InquiryForm enabled={setup.enabled} policy={setup.policy} version={setup.version} siteKey={setup.siteKey} />
          </div>
          <aside className="max-w-[600px] lg:order-1">
            <h2 className="max-w-[400px] break-keep text-balance text-[clamp(1.75rem,3vw,2.45rem)] font-extrabold leading-[1.35] tracking-[-0.055em]">한 번에 다 정하지 않아도 괜찮습니다.</h2>
            <p className="mt-6 break-keep text-base leading-[1.85] text-brand-muted">하고 싶은 일, 필요한 기능, 지금 고민인 점을 적어주세요. 내용을 살펴보고 연락드리겠습니다.</p>
            <div className="mt-11 border-t border-[#d8e1e7] text-[15px] font-bold">
              {[
                ["01", "내용을 보내주세요"],
                ["02", "함께 범위를 정해요"],
                ["03", "만들어 나갑니다"],
              ].map(([number, label]) => <div key={number} className="flex gap-6 border-b border-[#d8e1e7] py-4"><span className="text-xs font-extrabold text-brand-deep">{number}</span>{label}</div>)}
            </div>
            <p className="mt-10 text-[15px] leading-7 text-brand-muted">이메일이 더 편하신가요?<br /><a href="mailto:kdh@codest.kr" className="text-lg font-extrabold text-brand-deep hover:underline">kdh@codest.kr ↗</a></p>
          </aside>
        </div>
      </main>
    </SiteFrame>
  );
}
