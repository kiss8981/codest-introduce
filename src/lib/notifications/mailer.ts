import "server-only";
import nodemailer from "nodemailer";
import { renderNotification } from "./template";
import { validateNotification, type DeliveryStatus } from "./schema";

export type NotificationMessage = {
  id: string;
  to: string;
  recipt: unknown;
  type: string;
  payload: unknown;
};

export async function sendNotification(row: NotificationMessage): Promise<DeliveryStatus> {
  let mail: ReturnType<typeof renderNotification>;
  let recipt: ReturnType<typeof validateNotification>["recipt"];
  try {
    const parsed = validateNotification({
      to: row.to,
      recipt: row.recipt,
      type: row.type,
      payload: row.payload,
    });
    recipt = parsed.recipt;
    mail = renderNotification(parsed.type, parsed.payload);
  } catch {
    console.error("notification_invalid", row.id);
    return "failed";
  }
  const recipients = [
    ...new Set([row.to.toLowerCase(), ...(recipt.bcc ?? []).map((value) => value.toLowerCase())]),
  ];
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "mail.smtp2go.com",
    port,
    secure,
    requireTLS: !secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  try {
    const info = await transport.sendMail({
      from: recipt.from,
      to: row.to,
      replyTo: recipt.replyTo,
      bcc: recipt.bcc,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      messageId: `<${row.id}@codest.kr>`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    const accepted = new Set(
      info.accepted.map((value) =>
        (typeof value === "string" ? value : value.address).toLowerCase(),
      ),
    );
    if (recipients.every((value) => accepted.has(value))) return "sent";
    return accepted.size ? "needs_review" : "failed";
  } catch (error) {
    console.error(
      "notification_send_uncertain",
      row.id,
      error instanceof Error ? error.name : "unknown",
    );
    return "needs_review";
  } finally {
    transport.close();
  }
}
