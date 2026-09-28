import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runNotificationBatch } from "@/lib/notifications/batch";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const secret = process.env.NOTIFICATION_BATCH_SECRET;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (
    !secret ||
    !token ||
    token.length !== secret.length ||
    !timingSafeEqual(Uint8Array.from(Buffer.from(token)), Uint8Array.from(Buffer.from(secret)))
  )
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS)
    return NextResponse.json({ error: "SMTP 설정이 필요합니다." }, { status: 503 });
  try {
    return NextResponse.json(await runNotificationBatch());
  } catch (error) {
    console.error("notification_batch_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "배치 실행에 실패했습니다." }, { status: 500 });
  }
}
