import { z } from "zod";

export const inquirySchema = z.object({
  submissionId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .refine(
      value =>
        (value.match(/\d/g) ?? []).length >= 8 && /^[+\d\s()-]+$/.test(value),
      "전화번호를 확인해 주세요.",
    ),
  email: z.email().max(254),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
  website: z.string().max(200).default(""),
  turnstileToken: z.string().min(1),
});

export const CONSENT_VERSION = "privacy-link-v1";

export function contactAvailability() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const enabled =
    !!siteKey &&
    !!process.env.TURNSTILE_SECRET_KEY &&
    !!process.env.SITE_URL &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    z.email().safeParse(process.env.MAIL_FROM).success;
  return { enabled, siteKey };
}
