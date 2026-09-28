import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { CONSENT_VERSION, type InquiryInput } from "./schema";

export async function saveInquiry(data: InquiryInput) {
  const from = process.env.MAIL_FROM!;
  const { data: saved, error } = await db().rpc("submit_inquiry", {
    p_inquiry: {
      submission_id: data.submissionId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      consent_version: CONSENT_VERSION,
    },
    p_notification: {
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
    },
  });
  if (error?.message.includes("submission_conflict"))
    throw new ApiError("새 문의로 다시 작성해 주세요.", 409);
  if (error || !saved)
    throw new ApiError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", 500);
  return { inquiryId: saved.inquiry_id, created: saved.created };
}
