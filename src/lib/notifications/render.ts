import "server-only";
import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import { z } from "zod";

const inquiry = z.object({ name: z.string().min(1).max(80), phone: z.string().min(1).max(30), email: z.email(), message: z.string().min(20).max(5000), receiptId: z.string().uuid() });
const notice = z.object({ title: z.string().min(1).max(200).refine(value => !/[\r\n]/.test(value)), message: z.string().min(1).max(5000) });
const schemas = { "inquiry_received.v1": inquiry, "notice.v1": notice } as const;
export type NotificationType = keyof typeof schemas;

const compiled = new Map<NotificationType, Handlebars.TemplateDelegate>();
function template(type: NotificationType) {
  let found = compiled.get(type);
  if (!found) {
    const file = type === "inquiry_received.v1" ? "inquiry-received.v1.html.hbs" : "notice.v1.html.hbs";
    found = Handlebars.compile(fs.readFileSync(path.join(process.cwd(), "src/lib/notifications/templates", file), "utf8"), { strict: true });
    compiled.set(type, found);
  }
  return found;
}

export function renderNotification(type: string, raw: unknown) {
  if (!(type in schemas)) throw new Error("알 수 없는 알림 유형");
  const kind = type as NotificationType;
  const payload = kind === "inquiry_received.v1" ? inquiry.parse(raw) : notice.parse(raw);
  const messageLines = payload.message.split(/\r?\n/);
  const html = template(kind)({ ...payload, messageLines });
  if (kind === "inquiry_received.v1") {
    const item = payload as z.infer<typeof inquiry>;
    return { subject: "[Codest] 제작문의가 접수되었습니다", html, text: `안녕하세요, ${item.name}님.\n제작문의가 접수되었습니다. 내용을 확인한 뒤 연락드리겠습니다.\n\n접수번호: ${item.receiptId}\n이름: ${item.name}\n전화번호: ${item.phone}\n이메일: ${item.email}\n제작내용:\n${item.message}\n\n이 메일에 답장하시면 Codest 담당자에게 전달됩니다.` };
  }
  const item = payload as z.infer<typeof notice>;
  return { subject: `[Codest] ${item.title}`, html, text: `${item.title}\n\n${item.message}` };
}
