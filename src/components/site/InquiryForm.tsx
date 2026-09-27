"use client";
import { useCallback, useState } from "react";
import TurnstileWidget from "./TurnstileWidget";

export default function InquiryForm({ policy, version, siteKey }: { policy: string; version: string; siteKey: string }) {
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [robotError, setRobotError] = useState<string | null>(null);
  const handleToken = useCallback((value: string | null) => { setToken(value); if (value) setRobotError(null); }, []);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", consent: false, website: "" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || pending) return;
    setPending(true); setError(null);
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, submissionId, turnstileToken: token }) });
      const result = await response.json() as { inquiryId?: string; error?: string };
      if (!response.ok || !result.inquiryId) throw new Error(result.error ?? "접수 중 문제가 발생했습니다.");
      setSuccess(result.inquiryId);
      setSubmissionId(crypto.randomUUID());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "접수 중 문제가 발생했습니다. 다시 시도해 주세요.");
      setToken(null); setResetKey(value => value + 1);
    } finally { setPending(false); }
  }

  if (success) return <div className="form-success" role="status"><h2 className="section-title">문의가 접수되었습니다.</h2><p>내용을 확인한 뒤 연락드리겠습니다. 확인 메일은 발송 대기 중입니다.</p><p className="muted">접수번호: {success}</p><button type="button" className="button button-secondary" onClick={() => { setSuccess(null); setForm({ name: "", phone: "", email: "", message: "", consent: false, website: "" }); }}>새 문의 작성하기</button></div>;
  return <form className="contact-form" onSubmit={submit}>
    <div style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true"><label htmlFor="inquiry-website">웹사이트</label><input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => setForm({ ...form, website: event.target.value })} /></div>
    <div className="field"><label htmlFor="inquiry-name">이름</label><input id="inquiry-name" autoComplete="name" required maxLength={80} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div>
    <div className="field"><label htmlFor="inquiry-phone">전화번호</label><input id="inquiry-phone" type="tel" autoComplete="tel" required maxLength={30} value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></div>
    <div className="field"><label htmlFor="inquiry-email">이메일</label><input id="inquiry-email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></div>
    <div className="field"><label htmlFor="inquiry-message">제작내용</label><textarea id="inquiry-message" required minLength={20} maxLength={5000} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} placeholder="어떤 서비스를 만들고 싶으신지 알려주세요." /></div>
    <div className="policy-box"><strong>개인정보 수집·이용 안내</strong><p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{policy}</p><small>안내 버전: {version}</small></div>
    <label className="check-row"><input type="checkbox" required checked={form.consent} onChange={event => setForm({ ...form, consent: event.target.checked })} /><span>위 개인정보 수집·이용 안내에 동의합니다.</span></label>
    <TurnstileWidget siteKey={siteKey} resetKey={resetKey} onToken={handleToken} onFailure={setRobotError} />
    {robotError && <p className="form-error" role="alert">{robotError} <button type="button" onClick={() => { setRobotError(null); setToken(null); setResetKey(value => value + 1); }}>다시 시도</button></p>}
    {error && <p className="form-error" role="alert">{error} <a href="mailto:kdh@codest.kr">이메일로 문의하기</a></p>}
    <button className="button button-primary" type="submit" disabled={!token || pending || !form.consent}>{pending ? "접수 중..." : "문의 접수하기"}</button>
  </form>;
}
