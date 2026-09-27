# Codest 사이트 운영

## 시작

Node 20.9 이상을 사용합니다. `yarn install` 후 `.env.example`을 `.env.local`로 복사하고 `yarn dev`를 실행합니다. `LOCAL_PREVIEW=true`는 개발 환경에서만 `content/portfolio/*.md` 예제를 읽습니다. 운영에서는 GitHub 저장소 환경변수를 설정해야 합니다. 설정이 없으면 포트폴리오는 준비 중으로 표시됩니다.

## 포트폴리오

GitHub 저장소의 `content/portfolio/slug.md` 파일을 읽습니다. 경로와 브랜치는 `PORTFOLIO_DIR`, `GITHUB_REF`로 바꿀 수 있습니다. 비공개 저장소는 읽기 전용 `GITHUB_TOKEN`을 서버에만 설정합니다. 본문은 Markdown/GFM이며 HTML·MDX 실행은 허용하지 않습니다. Front matter 예:

```yaml
---
title: 프로젝트 제목
summary: 한 줄 소개
cover: null
category: 웹 서비스
stack: [Next.js, React]
publishedAt: 2026-09-27
featured: true
draft: false
---
```

대표 이미지는 비워 두거나 검증된 HTTPS URL 또는 콘텐츠 디렉터리 안의 상대 경로를 입력합니다. Markdown 본문의 상대 이미지 경로도 같은 디렉터리 기준으로 해석합니다. 비공개 저장소의 상대 이미지는 토큰을 브라우저에 노출하지 않고 서버가 읽어 전달합니다. 목록과 상세는 약 10분 간격으로 갱신됩니다. 새 파일은 재검증 뒤 배포 없이 열립니다. `draft: true` 파일은 노출하지 않습니다. 처음에는 `LOCAL_PREVIEW=true`로 예제 레이아웃을 볼 수 있으며, 예제는 운영 자동 대체 콘텐츠가 아닙니다.

## 문의 개통

1. Supabase SQL Editor에 `supabase/migrations/202609270001_inquiries_notifications.sql`을 적용합니다. `inquiries`에는 원문과 동의 기록, `notification`에는 범용 발송 건을 보관합니다. 두 테이블 모두 RLS를 사용하며 공개 클라이언트 접근을 허용하지 않습니다.
2. Cloudflare Turnstile Managed 위젯을 만들고 허용 도메인을 등록합니다. Site key는 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret은 `TURNSTILE_SECRET_KEY`에 설정합니다. `TURNSTILE_ALLOWED_HOSTNAMES`에 정확한 호스트명을 쉼표로 나열합니다. 테스트 키는 운영에서 거부됩니다.
3. 사이트 운영자가 확정한 개인정보 수집 목적·항목·보유기간·거부권 고지문과 버전을 `CONTACT_POLICY_TEXT`, `CONTACT_POLICY_VERSION`에 설정합니다. 기존 `/privacy`는 과거 앱·위치 정보 안내이므로 이 고지를 대신하지 않습니다.
4. 신뢰할 수 있는 프록시가 반드시 덮어쓰는 실제 클라이언트 IP 헤더의 이름을 `TRUSTED_CLIENT_IP_HEADER`에 설정하고 무작위 `INQUIRY_RATE_LIMIT_SECRET`을 지정합니다. 임의의 클라이언트가 설정할 수 있는 forwarded 헤더는 사용하지 마세요. 원 IP는 DB에 저장하지 않습니다. 별도 내부 스키마의 HMAC 제한값으로 15분간 최대 3건을 허용하며 스케줄 작업이 만료값을 지웁니다. 공개 요청 본문은 16KB로 제한하고 숨김 스팸 필드도 확인합니다.
5. SMTP2GO에서 `codest.kr` 발신 도메인을 인증하고 SMTP User를 만듭니다. 계정 화면에 제시된 CNAME을 DNS에 추가하며 Dooray 수신용 MX는 유지합니다. `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM=kdh@codest.kr` 등을 설정합니다.
6. 모든 설정을 확인한 뒤 `CONTACT_FORM_ENABLED=true`로 설정합니다. 하나라도 빠지면 폼 대신 `kdh@codest.kr` 메일 링크가 표시됩니다.

접수 요청은 Turnstile 검증 뒤 문의와 알림을 한 DB 트랜잭션에서 저장합니다. 방문자는 저장 직후 접수번호를 받고 메일은 5분 배치에서 처리됩니다. 전송 오류 시 폼 값과 제출 ID를 유지하고 새 Turnstile 토큰으로 재시도합니다. 제출 ID가 같으면 중복 저장하지 않습니다.

## 메일 배치

`NOTIFICATION_BATCH_SECRET`을 무작위 값으로 설정하고, `supabase/operations/schedule-notifications.sql`의 안내에 따라 Vault 비밀값과 Cron 작업을 등록합니다. 5분마다 `POST /api/internal/notifications`를 호출합니다. 서버는 최대 10건을 순차 처리합니다. `pending`을 원자적으로 `processing`으로 확보하고 결과를 `sent`, `failed`, `needs_review`로 기록합니다. 자동 재발송은 하지 않습니다. `processing`에 오래 남은 건이나 `needs_review`는 SMTP2GO 발송 이력을 대조한 뒤 수동 처리합니다. 스케줄 중단은 `unschedule-notifications.sql`을 실행합니다.

`notification`은 정확히 `id`, `to`, `recipt`, `type`, `payload`, `status`, `created_at`, `sent_at`의 여덟 컬럼입니다. `recipt`는 요청한 표기를 그대로 사용하며 `{ "from": { "name": "Codest", "address": "kdh@codest.kr" }, "replyTo": ["kdh@codest.kr"], "bcc": ["kdh@codest.kr"] }` 형태입니다. 배열에 여러 회신·숨은 참조 주소를 넣을 수 있습니다. `to`는 독립된 TEXT로 향후 전화번호도 담을 수 있지만 현재 발송기는 이메일만 지원합니다. `type`은 `inquiry_received.v1` 또는 범용 `notice.v1`이며 템플릿은 `src/lib/notifications/templates/`에 있습니다. `payload`는 해당 유형의 치환 값만 저장합니다. HTML은 Handlebars가 기본 이스케이프하며 일반 텍스트 대안도 같이 보냅니다. `sent`는 SMTP 접수이며 실제 받은편지함 도착 보장은 아닙니다.

실제 SMTP 발신·숨은 참조 수신, Dooray 답장 도착과 모바일 메일 렌더링은 인증 정보와 운영 도메인이 연결된 뒤 별도로 확인해야 합니다.
