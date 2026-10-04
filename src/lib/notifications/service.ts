import "server-only";
import { ApiError } from "@/lib/http";
import { notificationWebhook } from "./schema";
import { sendNotification } from "./mailer";
import { claimNotification, finishNotification } from "./repository";

export async function dispatchNotification(input: unknown) {
  const parsed = notificationWebhook.safeParse(input);
  if (!parsed.success) throw new ApiError("알림 본문을 확인해 주세요.");
  const row = parsed.data.record;
  if (!(await claimNotification(row.id))) return { status: "already_processed" };
  const status = await sendNotification(row);
  await finishNotification(row.id, status);
  return { status };
}
