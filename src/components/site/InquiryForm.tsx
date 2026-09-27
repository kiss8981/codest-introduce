"use client";

import { useCallback, useState } from "react";
import TurnstileWidget from "./TurnstileWidget";

type InquiryFormProps = {
  enabled: boolean;
  policy?: string;
  version?: string;
  siteKey?: string;
};

const initialForm = { name: "", phone: "", email: "", message: "", consent: false, website: "" };

export default function InquiryForm({ enabled, policy, version, siteKey }: InquiryFormProps) {
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [robotError, setRobotError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const handleToken = useCallback((value: string | null) => {
    setToken(value);
    if (value) setRobotError(null);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !token || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, submissionId, turnstileToken: token }),
      });
      const result = await response.json() as { inquiryId?: string; error?: string };
      if (!response.ok || !result.inquiryId) throw new Error(result.error ?? "접수 중 문제가 발생했습니다.");
      setSuccess(result.inquiryId);
      setSubmissionId(crypto.randomUUID());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "접수 중 문제가 발생했습니다. 다시 시도해 주세요.");
      setToken(null);
      setResetKey(value => value + 1);
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="form-success" role="status">
        <span className="success-mark" aria-hidden="true">✓</span>
        <h2>문의가 접수되었습니다.</h2>
        <p>내용을 확인한 뒤 연락드리겠습니다. 확인 메일은 발송 대기 중입니다.</p>
        <p className="receipt-id">접수번호 {success}</p>
        <button type="button" className="button button-outline" onClick={() => { setSuccess(null); setForm(initialForm); }}>새 문의 작성하기</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      {!enabled && <div className="setup-note" role="status"><strong>온라인 접수를 준비하고 있어요.</strong><p>양식은 미리보기로 보여드리고 있습니다. 지금은 이메일로 편하게 문의해 주세요.</p></div>}
      <div className="honeypot" aria-hidden="true"><label htmlFor="inquiry-website">웹사이트</label><input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => setForm({ ...form, website: event.target.value })} /></div>
      <div className="field-row">
        <div className="field"><label htmlFor="inquiry-name">이름 <span>*</span></label><input id="inquiry-name" autoComplete="name" placeholder="성함을 알려주세요" required maxLength={80} disabled={!enabled} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div>
        <div className="field"><label htmlFor="inquiry-phone">전화번호 <span>*</span></label><input id="inquiry-phone" type="tel" autoComplete="tel" placeholder="연락받을 번호" required maxLength={30} disabled={!enabled} value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></div>
      </div>
      <div className="field"><label htmlFor="inquiry-email">이메일 <span>*</span></label><input id="inquiry-email" type="email" autoComplete="email" placeholder="답장받을 이메일" required maxLength={254} disabled={!enabled} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></div>
      <div className="field"><label htmlFor="inquiry-message">제작내용 <span>*</span></label><textarea id="inquiry-message" required minLength={20} maxLength={5000} disabled={!enabled} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} placeholder="어떤 서비스를 만들고 싶으신가요? 목적이나 필요한 기능을 아는 만큼 적어주세요." /><small>간단히 적어주셔도 괜찮습니다. (20자 이상)</small></div>
      <div className="policy-box"><strong>개인정보 수집·이용 안내</strong>{enabled ? <><p>{policy}</p><small>안내 버전: {version}</small></> : <p>운영자가 개인정보 안내를 확정하면 이곳에 표시됩니다.</p>}</div>
      <label className="check-row"><input type="checkbox" required disabled={!enabled} checked={form.consent} onChange={event => setForm({ ...form, consent: event.target.checked })} /><span>위 개인정보 수집·이용 안내에 동의합니다. <em>(필수)</em></span></label>
      {enabled && siteKey && <TurnstileWidget siteKey={siteKey} resetKey={resetKey} onToken={handleToken} onFailure={setRobotError} />}
      {robotError && <p className="form-error" role="alert">{robotError} <button type="button" onClick={() => { setRobotError(null); setToken(null); setResetKey(value => value + 1); }}>다시 시도</button></p>}
      {error && <p className="form-error" role="alert">{error} <a href="mailto:kdh@codest.kr">이메일로 문의하기</a></p>}
      {enabled
        ? <button className="button button-primary form-submit" type="submit" disabled={!token || pending || !form.consent}>{pending ? "접수 중..." : "문의 접수하기 ↗"}</button>
        : <a className="button button-primary form-submit" href="mailto:kdh@codest.kr">이메일로 문의하기 ↗</a>}
    </form>
  );
}
