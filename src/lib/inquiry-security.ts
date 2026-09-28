import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export function isAllowedTurnstileHostname(hostname: string, siteUrl: string): boolean {
  try {
    const configured = new URL(siteUrl).hostname.toLowerCase();
    const base = configured.startsWith("www.") ? configured.slice(4) : configured;
    return hostname.toLowerCase() === base || hostname.toLowerCase() === `www.${base}`;
  } catch {
    return false;
  }
}

export function vercelClientIp(headers: Headers, production: boolean): string | null {
  if (!production) return "127.0.0.1";
  const value = headers.get("x-forwarded-for")?.trim();
  return value && isIP(value) !== 0 ? value : null;
}

export function inquiryRateKey(ip: string, secret: string): string {
  return createHmac("sha256", secret).update("inquiry-rate-limit/v1\0").update(ip).digest("hex");
}
