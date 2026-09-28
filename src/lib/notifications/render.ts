import "server-only";
import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import { z } from "zod";

const inquiry = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(1).max(30),
  email: z.email(),
  message: z.string().min(20).max(5000),
  receiptId: z.string().uuid(),
});
let compiled: Handlebars.TemplateDelegate | undefined;

function template() {
  compiled ??= Handlebars.compile(
    fs.readFileSync(
      path.join(process.cwd(), "src/lib/notifications/templates/inquiry-received.v1.html.hbs"),
      "utf8",
    ),
    { strict: true },
  );
  return compiled;
}

export function renderNotification(type: string, raw: unknown) {
  if (type !== "inquiry_received.v1") throw new Error("알 수 없는 알림 유형");
  const payload = inquiry.parse(raw);
  const messageLines = payload.message.split(/\r?\n/);
  const html = template()({ ...payload, messageLines });
  return {
    subject: "[Codest] 제작문의가 접수되었습니다",
    html,
    text: `안녕하세요, ${payload.name}님.\n제작문의가 접수되었습니다. 내용을 확인한 뒤 연락드리겠습니다.\n\n접수번호: ${payload.receiptId}\n이름: ${payload.name}\n전화번호: ${payload.phone}\n이메일: ${payload.email}\n제작내용:\n${payload.message}\n\n이 메일에 답장하시면 Codest 담당자에게 전달됩니다.`,
  };
}
