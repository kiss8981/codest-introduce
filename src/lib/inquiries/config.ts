import "server-only";
import { z } from "zod";

export function contactAvailability() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const enabled =
    !!siteKey &&
    !!process.env.TURNSTILE_SECRET_KEY &&
    !!process.env.SITE_URL &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SECRET_KEY &&
    z.email().safeParse(process.env.MAIL_FROM).success;
  return { enabled, siteKey };
}
