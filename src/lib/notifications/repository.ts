import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import type { DeliveryStatus } from "./schema";

export async function claimNotification(id: string): Promise<boolean> {
  const { data, error } = await db()
    .from("notification")
    .update({ status: "processing" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw new ApiError("알림 상태를 변경하지 못했습니다.", 500);
  return Boolean(data);
}

export async function finishNotification(id: string, status: DeliveryStatus): Promise<void> {
  const { error } = await db()
    .from("notification")
    .update({ status, sent_at: status === "sent" ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("status", "processing");
  if (error) throw new ApiError("알림 결과를 기록하지 못했습니다.", 500);
}
