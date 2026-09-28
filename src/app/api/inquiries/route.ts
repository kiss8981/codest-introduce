import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CONSENT_VERSION, contactAvailability, inquirySchema } from "@/lib/inquiry";
import { inquiryRateKey, isAllowedTurnstileHostname, vercelClientIp } from "@/lib/inquiry-security";
import { validateNotification } from "@/lib/notifications/schema";

export const runtime = "nodejs";
const testSecrets = new Set([
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
]);
const maxBytes = 16384;

async function readLimitedJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("too_large");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function POST(request: Request) {
  const setup = contactAvailability();
  if (!setup.enabled)
    return NextResponse.json(
      { error: "문의 양식을 준비 중입니다. 이메일로 연락해 주세요." },
      { status: 503 },
    );
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    return NextResponse.json({ error: "요청 형식을 확인해 주세요." }, { status: 415 });
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes)
    return NextResponse.json({ error: "입력 내용이 너무 깁니다." }, { status: 413 });
  let input: unknown;
  try {
    input = await readLimitedJson(request);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "too_large"
            ? "입력 내용이 너무 깁니다."
            : "입력 내용을 확인해 주세요.",
      },
      { status: error instanceof Error && error.message === "too_large" ? 413 : 400 },
    );
  }
  const result = inquirySchema.safeParse(input);
  if (!result.success)
    return NextResponse.json({ error: "입력 내용을 확인해 주세요." }, { status: 400 });
  const data = result.data;
  if (data.website)
    return NextResponse.json({ error: "입력 내용을 확인해 주세요." }, { status: 400 });
  const clientIp = vercelClientIp(request.headers, process.env.NODE_ENV === "production");
  if (!clientIp)
    return NextResponse.json({ error: "접속 정보를 확인할 수 없습니다." }, { status: 400 });
  const testKey = testSecrets.has(process.env.TURNSTILE_SECRET_KEY!);
  if (process.env.NODE_ENV === "production" && testKey)
    return NextResponse.json({ error: "보안 설정 오류" }, { status: 503 });
  const challenge = (await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: data.turnstileToken,
      remoteip: clientIp,
    }),
    cache: "no-store",
  })
    .then((response) => response.json())
    .catch(() => null)) as { success?: boolean; hostname?: string; action?: string } | null;
  if (
    !challenge?.success ||
    !challenge.hostname ||
    !isAllowedTurnstileHostname(challenge.hostname, process.env.SITE_URL!) ||
    challenge.action !== (testKey ? "test" : "inquiry")
  )
    return NextResponse.json({ error: "로봇 확인을 다시 완료해 주세요." }, { status: 400 });
  const rateKey = inquiryRateKey(clientIp, process.env.TURNSTILE_SECRET_KEY!);
  const from = process.env.MAIL_FROM!;
  const inquiry = {
    submission_id: data.submissionId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    consent_version: CONSENT_VERSION,
  };
  const notification = validateNotification({
    to: data.email,
    recipt: { from: { name: "Codest", address: from }, replyTo: [from], bcc: [from] },
    type: "inquiry_received.v1",
    payload: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      receiptId: "00000000-0000-4000-8000-000000000000",
    },
  });
  const { data: saved, error } = await db().rpc("submit_inquiry", {
    p_inquiry: inquiry,
    p_notification: notification,
    p_limit_key: rateKey,
  });
  if (error) {
    if (error.message.includes("rate_limited"))
      return NextResponse.json({ error: "잠시 후 다시 문의해 주세요." }, { status: 429 });
    if (error.message.includes("submission_conflict"))
      return NextResponse.json({ error: "새 문의로 다시 작성해 주세요." }, { status: 409 });
    console.error("inquiry_save_failed", error.code);
    return NextResponse.json(
      { error: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { inquiryId: saved.inquiry_id, created: saved.created },
    { status: saved.created ? 201 : 200 },
  );
}
