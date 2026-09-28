import { NextResponse } from "next/server";
import { apiResponse, jsonBody } from "@/lib/http";
import { dispatchNotification } from "@/lib/notifications/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.NOTIFICATION_WEBHOOK_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  return apiResponse(async () => dispatchNotification(await jsonBody(request)));
}
