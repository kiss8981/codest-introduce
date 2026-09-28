import assert from "node:assert/strict";
import { test } from "node:test";
import { inquiryRateKey, isAllowedTurnstileHostname, vercelClientIp } from "./inquiry-security.ts";

test("Turnstile 호스트는 사이트 도메인과 www만 허용한다", () => {
  assert.equal(isAllowedTurnstileHostname("codest.kr", "https://codest.kr"), true);
  assert.equal(isAllowedTurnstileHostname("www.codest.kr", "https://codest.kr"), true);
  assert.equal(isAllowedTurnstileHostname("fake-codest.kr", "https://codest.kr"), false);
});

test("운영 IP 헤더는 단일 유효 주소만 허용한다", () => {
  assert.equal(vercelClientIp(new Headers(), true), null);
  assert.equal(
    vercelClientIp(new Headers({ "x-forwarded-for": "192.0.2.1, 192.0.2.2" }), true),
    null,
  );
  assert.equal(vercelClientIp(new Headers({ "x-forwarded-for": "192.0.2.1" }), true), "192.0.2.1");
  assert.equal(vercelClientIp(new Headers(), false), "127.0.0.1");
});

test("문의 제한 키는 같은 IP와 비밀값에 대해 안정적이다", () => {
  assert.equal(inquiryRateKey("192.0.2.1", "secret"), inquiryRateKey("192.0.2.1", "secret"));
  assert.notEqual(inquiryRateKey("192.0.2.1", "secret"), inquiryRateKey("192.0.2.2", "secret"));
});
