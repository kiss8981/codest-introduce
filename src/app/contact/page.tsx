import type { Metadata } from "next";
import SiteFrame from "@/components/site/SiteFrame";
import InquiryForm from "@/components/site/InquiryForm";
import { contactAvailability } from "@/lib/inquiry";

export const metadata: Metadata = { title: "제작문의", description: "Codest에 웹·앱 서비스 제작을 문의해 주세요." };
export const dynamic = "force-dynamic";
export default function ContactPage() {
  const setup = contactAvailability();
  return <SiteFrame><main className="site-shell site-main contact-layout"><div><p className="eyebrow">CONTACT</p><h1 className="page-title">함께 만들<br />서비스를 알려주세요.</h1><p className="lead">구상 중인 아이디어부터 구체적인 개발 계획까지 편하게 남겨주세요. 내용을 확인하고 연락드리겠습니다.</p><p className="muted">직접 문의: <a className="site-text-link" href="mailto:kdh@codest.kr">kdh@codest.kr ↗</a></p></div><div>{setup.enabled ? <InquiryForm policy={setup.policy!} version={setup.version!} siteKey={setup.siteKey!} /> : <div className="policy-box"><strong>온라인 문의 양식을 준비 중입니다.</strong><p>지금은 이메일로 제작 내용을 보내주시면 확인 후 연락드리겠습니다.</p><a className="button button-primary" href="mailto:kdh@codest.kr">이메일로 문의하기 ↗</a></div>}</div></main></SiteFrame>;
}
