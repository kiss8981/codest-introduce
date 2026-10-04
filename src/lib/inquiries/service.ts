import "server-only";
import { ApiError } from "@/lib/http";
import { contactAvailability } from "./config";
import { saveInquiry } from "./repository";
import { inquirySchema } from "./schema";
import { verifyTurnstile } from "./turnstile";

export async function submitInquiry(input: unknown) {
  if (!contactAvailability().enabled)
    throw new ApiError("문의 양식을 준비 중입니다. 이메일로 연락해 주세요.", 503);
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) throw new ApiError("입력 내용을 확인해 주세요.");
  await verifyTurnstile(parsed.data.turnstileToken);
  return saveInquiry(parsed.data);
}
