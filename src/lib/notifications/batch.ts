import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { renderNotification } from "./render";
import { validateNotification } from "./schema";

type Status = "sent" | "failed" | "needs_review";
type Row = { id: string; to: string; recipt: unknown; type: string; payload: unknown };

async function send(row: Row): Promise<Status> {
  let mail: ReturnType<typeof renderNotification>;
  let recipt: ReturnType<typeof validateNotification>["recipt"];
  try { const parsed = validateNotification({ to: row.to, recipt: row.recipt, type: row.type, payload: row.payload }); recipt = parsed.recipt; mail = renderNotification(parsed.type, parsed.payload); }
  catch { console.error("notification_invalid", row.id); return "failed"; }
  const recipients = [...new Set([row.to.toLowerCase(), ...(recipt.bcc ?? []).map(value => value.toLowerCase())])];
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST ?? "mail.smtp2go.com", port, secure, requireTLS: !secure, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000, disableFileAccess: true, disableUrlAccess: true });
  try {
    const info = await transport.sendMail({ from: recipt.from, to: row.to, replyTo: recipt.replyTo, bcc: recipt.bcc, subject: mail.subject, html: mail.html, text: mail.text, messageId: `<${row.id}@codest.kr>`, disableFileAccess: true, disableUrlAccess: true });
    const accepted = new Set(info.accepted.map(value => (typeof value === "string" ? value : value.address).toLowerCase()));
    if (recipients.every(value => accepted.has(value))) return "sent";
    return accepted.size ? "needs_review" : "failed";
  } catch (error) {
    console.error("notification_send_uncertain", row.id, error instanceof Error ? error.name : "unknown");
    return "needs_review";
  } finally { transport.close(); }
}

export async function runNotificationBatch() {
  const start = Date.now();
  const result = { processed: 0, sent: 0, failed: 0, needsReview: 0 };
  for (let index = 0; index < 10 && Date.now() - start < 30000; index++) {
    const { data: row, error } = await db().rpc("claim_notification");
    if (error) throw new Error(`알림 확보 실패: ${error.code}`);
    if (!row) break;
    const status = await send(row as Row);
    const { data: finished, error: finishError } = await db().rpc("finish_notification", { p_id: row.id, p_status: status });
    if (finishError || !finished) throw new Error(`알림 결과 저장 실패: ${row.id}`);
    result.processed++;
    if (status === "sent") result.sent++;
    else if (status === "failed") result.failed++;
    else result.needsReview++;
  }
  return result;
}
