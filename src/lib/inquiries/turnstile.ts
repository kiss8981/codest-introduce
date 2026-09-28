import "server-only";
import { ApiError } from "@/lib/http";

export function isAllowedTurnstileHostname(hostname: string, siteUrl: string): boolean {
  try {
    const configured = new URL(siteUrl).hostname.toLowerCase();
    const base = configured.startsWith("www.") ? configured.slice(4) : configured;
    return hostname.toLowerCase() === base || hostname.toLowerCase() === `www.${base}`;
  } catch {
    return false;
  }
}

export async function verifyTurnstile(token: string) {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token }),
    cache: "no-store",
  }).catch(() => null);
  const result = (await response?.json().catch(() => null)) as {
    success?: boolean;
    hostname?: string;
    action?: string;
  } | null;
  if (
    !result?.success ||
    !result.hostname ||
    result.action !== "inquiry" ||
    !isAllowedTurnstileHostname(result.hostname, process.env.SITE_URL!)
  )
    throw new ApiError("로봇 확인을 다시 완료해 주세요.");
}
