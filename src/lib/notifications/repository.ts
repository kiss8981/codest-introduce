import "server-only";
import { db } from "@/lib/db";
import { validateNotification } from "./schema";

export async function enqueueNotification(input: unknown): Promise<string> {
  const notification = validateNotification(input);
  const { data, error } = await db().rpc("enqueue_notification", {
    p_notification: notification,
  });
  if (error || typeof data !== "string")
    throw new Error(`알림 등록 실패: ${error?.code ?? "unknown"}`);
  return data;
}
