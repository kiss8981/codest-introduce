import type { Metadata } from "next";
import SiteFrame from "@/components/site/SiteFrame";
import InquiryForm from "@/components/site/InquiryForm";
import { contactAvailability } from "@/lib/inquiry";

export const metadata: Metadata = { title: "제작문의", description: "Codest에 웹·앱 서비스 제작을 문의해 주세요." };
export const dynamic = "force-dynamic";

export default function ContactPage() {
  const setup = contactAvailability();
  return (
    <SiteFrame>
      <main className="contact-page">
        <section className="contact-banner"><div className="site-shell"><p className="eyebrow">LET’S TALK</p><h1 className="page-title">함께 이야기해 볼까요?</h1><p>아이디어가 막 떠오른 단계여도 괜찮아요.<br />어떤 서비스를 생각하고 계신지 편하게 알려주세요.</p></div></section>
        <div className="site-shell contact-content">
          <div className="contact-form-panel">
            <div className="form-heading"><p className="eyebrow">PROJECT INQUIRY</p><h2>프로젝트에 대해 알려주세요</h2><p>아는 만큼만 적어주셔도 됩니다.</p></div>
            <InquiryForm enabled={setup.enabled} policy={setup.policy} version={setup.version} siteKey={setup.siteKey} />
          </div>
          <aside className="contact-aside">
            <p className="eyebrow">START HERE</p>
            <h2>한 번에 다 정하지<br />않아도 괜찮습니다.</h2>
            <p>하고 싶은 일, 필요한 기능, 지금 고민인 점을 적어주세요. 내용을 살펴보고 연락드리겠습니다.</p>
            <div className="contact-steps"><div><span>01</span>내용을 보내주세요</div><div><span>02</span>함께 범위를 정해요</div><div><span>03</span>만들어 나갑니다</div></div>
            <p className="contact-direct">이메일이 더 편하신가요?<br /><a href="mailto:kdh@codest.kr">kdh@codest.kr <span aria-hidden="true">↗</span></a></p>
          </aside>
        </div>
      </main>
    </SiteFrame>
  );
}
