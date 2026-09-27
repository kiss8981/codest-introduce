import { z } from "zod";

export const inquirySchema = z.object({
  submissionId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(1).max(30).refine(value => (value.match(/\d/g) ?? []).length >= 8 && /^[+\d\s()-]+$/.test(value), "전화번호를 확인해 주세요."),
  email: z.email().max(254),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
  website: z.string().max(200).default(""),
  turnstileToken: z.string().min(1),
});

export function contactAvailability() {
  const policy = process.env.CONTACT_POLICY_TEXT;
  const version = process.env.CONTACT_POLICY_VERSION;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const enabled = process.env.CONTACT_FORM_ENABLED === "true" && !!policy && !!version && !!siteKey && !!process.env.TURNSTILE_SECRET_KEY && !!process.env.TURNSTILE_ALLOWED_HOSTNAMES && !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.SMTP_USER && !!process.env.SMTP_PASS && z.email().safeParse(process.env.MAIL_FROM).success && !!process.env.NOTIFICATION_BATCH_SECRET && !!process.env.INQUIRY_RATE_LIMIT_SECRET && !!process.env.TRUSTED_CLIENT_IP_HEADER;
  return { enabled, policy, version, siteKey };
}
