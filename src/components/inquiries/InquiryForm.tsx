"use client";

import { useCallback, useState } from "react";
import TurnstileWidget from "./TurnstileWidget";
import { outlineButton, primaryButton } from "@/components/site/styles";

type InquiryFormProps = {
  enabled: boolean;
  siteKey?: string;
};

const initialForm = { name: "", phone: "", email: "", message: "", consent: false };
const fieldClass =
  "w-full rounded-[11px] border border-[#dce6ec] bg-[#f8fafb] px-4 py-4 text-[15px] text-brand-ink outline-none placeholder:text-[#9caab5] focus:border-brand-blue focus:ring-[3px] focus:ring-[#dceff9] disabled:cursor-not-allowed disabled:text-[#6e7c88]";
const labelClass = "text-sm font-extrabold text-brand-ink";

export default function InquiryForm({ enabled, siteKey }: InquiryFormProps) {
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
      const result = (await response.json()) as { inquiryId?: string; error?: string };
      if (!response.ok || !result.inquiryId)
        throw new Error(result.error ?? "접수 중 문제가 발생했습니다.");
      setSuccess(result.inquiryId);
      setSubmissionId(crypto.randomUUID());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "접수 중 문제가 발생했습니다. 다시 시도해 주세요.",
      );
      setToken(null);
      setResetKey((value) => value + 1);
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="py-6" role="status">
        <span
          className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#d6f4e5] text-2xl text-[#18784b]"
          aria-hidden="true"
        >
          ✓
        </span>
        <h2 className="mt-5 text-3xl font-extrabold">문의가 접수되었습니다.</h2>
        <p className="mt-3 leading-7 text-brand-muted">내용을 확인한 뒤 연락드리겠습니다.</p>
        <p className="mt-5 break-all rounded-xl bg-brand-soft p-4 text-[13px] text-brand-muted">
          접수번호 {success}
        </p>
        <button
          type="button"
          className={`${outlineButton} mt-6`}
          onClick={() => {
            setSuccess(null);
            setForm(initialForm);
          }}
        >
          새 문의 작성하기
        </button>
      </div>
    );
  }

  return (
    <form className="relative grid gap-6" onSubmit={submit}>
      {!enabled && (
        <div
          className="rounded-xl bg-[#eaf5fc] px-5 py-4 text-sm leading-6 text-[#225374]"
          role="status"
        >
          <strong>온라인 접수를 준비하고 있어요.</strong>
          <p className="mt-1">
            양식은 미리보기로 보여드리고 있습니다. 지금은 이메일로 편하게 문의해 주세요.
          </p>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <label className={labelClass} htmlFor="inquiry-name">
            이름 <span className="text-brand-deep">*</span>
          </label>
          <input
            className={fieldClass}
            id="inquiry-name"
            type="text"
            autoComplete="name"
            placeholder="성함을 알려주세요"
            required
            maxLength={80}
            disabled={!enabled}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <label className={labelClass} htmlFor="inquiry-phone">
            전화번호 <span className="text-brand-deep">*</span>
          </label>
          <input
            className={fieldClass}
            id="inquiry-phone"
            type="tel"
            autoComplete="tel"
            placeholder="연락받을 번호"
            required
            maxLength={30}
            disabled={!enabled}
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={labelClass} htmlFor="inquiry-email">
          이메일 <span className="text-brand-deep">*</span>
        </label>
        <input
          className={fieldClass}
          id="inquiry-email"
          type="email"
          autoComplete="email"
          placeholder="답장받을 이메일"
          required
          maxLength={254}
          disabled={!enabled}
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <label className={labelClass} htmlFor="inquiry-message">
          제작내용 <span className="text-brand-deep">*</span>
        </label>
        <textarea
          className={`${fieldClass} min-h-[175px] resize-y leading-7`}
          id="inquiry-message"
          required
          minLength={1}
          maxLength={5000}
          disabled={!enabled}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          placeholder="어떤 서비스를 만들고 싶으신가요? 목적이나 필요한 기능을 아는 만큼 적어주세요."
        />
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-[#394d5b]">
        <input
          className="mt-1 h-[17px] w-[17px] shrink-0 accent-brand-blue"
          type="checkbox"
          required
          disabled={!enabled}
          checked={form.consent}
          onChange={(event) => setForm({ ...form, consent: event.target.checked })}
        />
        <span>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-deep underline underline-offset-2"
          >
            개인정보처리방침
          </a>
          에 동의합니다. <em className="not-italic text-brand-deep">(필수)</em>
        </span>
      </label>
      {enabled && siteKey && (
        <TurnstileWidget
          siteKey={siteKey}
          resetKey={resetKey}
          onToken={handleToken}
          onFailure={setRobotError}
        />
      )}
      {robotError && (
        <p className="text-sm leading-7 text-[#b43435]" role="alert">
          {robotError}{" "}
          <button
            className="underline"
            type="button"
            onClick={() => {
              setRobotError(null);
              setToken(null);
              setResetKey((value) => value + 1);
            }}
          >
            다시 시도
          </button>
        </p>
      )}
      {error && (
        <p className="text-sm leading-7 text-[#b43435]" role="alert">
          {error}{" "}
          <a className="underline" href="mailto:kdh@codest.kr">
            이메일로 문의하기
          </a>
        </p>
      )}
      {enabled ? (
        <button
          className={`${primaryButton} w-full`}
          type="submit"
          disabled={!token || pending || !form.consent}
        >
          {pending ? "접수 중..." : "문의 접수하기 ↗"}
        </button>
      ) : (
        <a className={`${primaryButton} w-full`} href="mailto:kdh@codest.kr">
          이메일로 문의하기 ↗
        </a>
      )}
    </form>
  );
}
