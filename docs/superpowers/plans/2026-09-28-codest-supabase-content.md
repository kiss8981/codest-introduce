# Codest Supabase 콘텐츠와 문의 개통 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Codest 포트폴리오를 Supabase DB·Storage에서 표시하고, 문의를 설정이 준비되는 대로 DB에 저장하며, 랜딩 문구와 환경변수를 정리한다.

**Architecture:** 기존 Next.js 16 App Router 서버가 Supabase를 조회하고 공개 포트폴리오만 약 600초 캐시한다. 문의는 Turnstile 검증 뒤 기존 RPC가 `inquiries`와 `notification`에 함께 저장하고, 메일은 Supabase Cron이 인증된 Next 배치 API를 호출해 발송한다. 포트폴리오와 사진은 운영자가 Supabase 대시보드에서 직접 관리한다.

**Tech Stack:** Next.js 16.3.6, React 19.3.0, Tailwind 3, TypeScript, Supabase Postgres·Storage, Cloudflare Turnstile, Nodemailer/Handlebars.

**Spec:** `docs/superpowers/specs/2026-09-28-codest-content-and-inquiries-design.md`

## Global Constraints

- 모바일·태블릿·데스크톱 반응형, 한국어 기본, 기존 Codest 로고 색상과 빈 이미지 자리 유지.
- Supabase 프로젝트는 사용자가 만들며 이 계획은 외부 프로젝트 생성이나 비밀값 커밋을 포함하지 않는다.
- 배포처는 Vercel. 문의 IP는 Vercel이 덮어쓰는 `x-forwarded-for`를 신뢰하고, 운영에서 헤더가 없으면 거부한다.
- 포트폴리오 버킷은 공개 `portfolio`. 공개 전 사진은 비공개 자료가 아니어야 한다.
- `/privacy` 내용과 문의 데이터 삭제 정책은 변경하지 않는다. 폼에는 새 탭 `/privacy` 링크가 있는 동의 체크만 둔다.
- `NOTIFICATION_BATCH_SECRET`은 유지한다. Supabase Cron의 5분 배치가 사용하는 인증값이다.
- 기존 미커밋 `src/lib/db.ts`·`src/lib/inquiry.ts`·`src/lib/notifications/*` 변경을 보존한다. 특히 알림 발송 동작은 이 작업 범위에서 재작성하지 않는다.
- 사용자가 세밀한 테스트를 원하지 않으므로 새 테스트 프레임워크나 큰 테스트 묶음을 도입하지 않는다. 아래의 최소 확인만 수행한다.
- 사용자가 요청한 Prettier를 정확한 버전으로 설치하고 저장소에 `format` 명령을 둔다. 기존 코드의 기능 변경 없이 포맷한다.

## Review Focus

1. 비공개 포트폴리오의 직접 URL과 사이트맵: 상세는 404, 목록·메인·사이트맵에서는 제외.
2. 다른 포트폴리오의 사진을 대표 이미지로 선택: DB가 연결을 거부.
3. 사진이 없거나 모바일 대표 이미지가 없음: 빈 이미지 영역 또는 일반 대표 이미지로 표시.
4. Turnstile의 잘못된 호스트명·action 또는 Vercel IP 헤더 누락: 문의·알림 행을 만들지 않고 거부.
5. Supabase 조회 오류와 진짜 빈 포트폴리오: 오류를 빈 목록으로 감추지 않음.

---

### Task 1: 포트폴리오 스키마와 사진 등록 절차

**Files:**
- Create: `supabase/migrations/202609280001_portfolio.sql`
- Modify: `docs/operations.md`

**Interfaces:**
- Produces: `public.portfolio`, `public.photo_map`, `public.portfolio_url`와 공개 Storage 버킷 `portfolio`의 등록 절차.
- Consumed by Task 2: `portfolio.id/slug/name/summary/description/category/stack/started_at/ended_at/is_maintained/is_published/featured/sort_order/thumbnail_photo_id/mobile_thumbnail_photo_id/updated_at`; `photo_map.id/portfolio_id/storage_key/filename/file_size_bytes/mime_type/alt_text/gallery_order`; `portfolio_url.portfolio_id/type/label/url/sort_order`.

- [ ] **Step 1: SQL 마이그레이션을 작성한다.** UUID PK, 고유 `slug`·`storage_key`, 길이·날짜·파일 크기·HTTPS URL 검증, 사진·URL의 포트폴리오 FK, 같은 포트폴리오의 대표 이미지 FK, `updated_at` 자동 갱신, RLS와 서버 역할 권한을 포함한다. 대표 이미지는 처음에 NULL로 두고 사진 행을 만든 뒤 연결할 수 있어야 한다.
- [ ] **Step 2: 대시보드 등록 순서를 `docs/operations.md`에 적는다.** 비공개 포트폴리오 생성 → 공개 `portfolio` 버킷에 이미지 업로드 → `photo_map`의 키·파일명·크기·갤러리 순서 입력 → 대표 이미지·URL 연결 → 공개. 이미지 삭제는 Storage와 DB에서 각각 처리한다.
- [ ] **Step 3: SQL을 최소 확인한다.** 사용자의 Supabase 프로젝트가 준비되면 SQL Editor에서 적용하고 비공개 포트폴리오·사진 한 건을 임시로 등록해 연결을 확인한다. 다른 포트폴리오의 사진을 대표 이미지로 지정하면 FK 오류가 나야 한다. 이 임시 데이터는 사이트 공개 전에 대시보드에서 정리한다.
- [ ] **Step 4: Task 1 파일만 커밋한다.** `git diff --check`가 통과해야 한다.

### Task 2: Supabase 포트폴리오 로더와 화면

**Files:**
- Replace: `src/lib/portfolio.ts`
- Modify: `src/components/site/ProjectCard.tsx`, `src/app/page.tsx`, `src/app/portfolio/page.tsx`, `src/app/portfolio/[slug]/page.tsx`, `src/app/sitemap.ts`
- Delete: `src/app/api/portfolio-assets/[...path]/route.ts`, `content/portfolio/school-bus.md`

**Interfaces:**
- Produces: `PortfolioProject`에 `id`, `slug`, `title`, `summary`, `body`, `category`, `stack`, `startedAt`, `endedAt`, `featured`, `isMaintained`, `cover`, `mobileCover`, `gallery: { id, src, alt }[]`, `urls: { type, label, url }[]`, `updatedAt`를 둔다. `getPortfolioProjects(): Promise<PortfolioProject[]>`와 `getPortfolioProject(slug: string): Promise<PortfolioProject | null>`를 유지한다.
- Consumes: Task 1의 세 테이블과 `db()`의 서버 전용 Supabase 클라이언트.

- [ ] **Step 1: DB 로더를 구현한다.** 공개 행만 정렬 조회하고 사진·URL을 연결한다. `gallery_order`가 NULL인 사진은 갤러리에서 제외한다. Storage 공개 URL은 `storage_key`로 만들고 모바일 대표 이미지가 없으면 일반 대표 이미지로 대체한다. Next의 `unstable_cache`로 목록 조회 결과를 600초 캐시한다. 설정이 없는 개발 환경은 빈 목록, 운영 설정 누락·조회 실패는 오류로 다룬다.
- [ ] **Step 2: 목록·메인·상세·사이트맵을 새 타입에 맞춘다.** 메인은 `featured`만, 상세는 제목과 요약 아래에 사진 갤러리, 다음에 Markdown 소개·제작 기간·현재 관리 여부·외부 링크를 둔다. 새 slug는 배포 없이 접근 가능하게 하고 비공개 slug는 404로 처리한다. 인라인 Markdown HTML·실행은 허용하지 않는다.
- [ ] **Step 3: GitHub 전용 로더·이미지 프록시·예제 파일을 제거한다.** 다른 포트폴리오 소스 대체 동작은 추가하지 않는다.
- [ ] **Step 4: 최소 화면 확인을 한다.** 공개·비공개 각 1건, 사진 없는 항목, 모바일 대표 이미지 없는 항목으로 메인·목록·상세·사이트맵을 확인한다. 비공개 직접 URL은 404이고 Supabase 오류는 빈 목록이 아니어야 한다. 프로젝트 연결 전에는 `yarn typecheck`와 `yarn lint`를 실행한다.
- [ ] **Step 5: Task 2 파일만 커밋한다.** `git diff --check`가 통과해야 한다.

### Task 3: 문의 폼과 환경변수 간소화

**Files:**
- Modify: `src/lib/inquiry.ts`, `src/app/api/inquiries/route.ts`, `src/components/site/InquiryForm.tsx`, `src/app/contact/page.tsx`, `.env.example`, `docs/operations.md`
- Create: `src/lib/inquiry-security.ts`, `src/lib/inquiry-security.test.ts`

**Interfaces:**
- Produces: `contactAvailability()`의 `{ enabled, siteKey }`, `CONSENT_VERSION = "privacy-link-v1"`, `isAllowedTurnstileHostname(hostname: string, siteUrl: string): boolean`, `vercelClientIp(headers: Headers, production: boolean): string | null`, `inquiryRateKey(ip: string, secret: string): string`; 문의 API의 기존 요청·응답 형식은 유지한다.
- Consumes: 기존 `submit_inquiry` RPC, `validateNotification()`, `TURNSTILE_SECRET_KEY`, `SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MAIL_FROM`.

- [ ] **Step 1: 작은 보안 헬퍼 테스트를 먼저 작성한다.** `node --test src/lib/inquiry-security.test.ts`에서 canonical/www 이외 Turnstile 호스트 거부, Vercel IP 헤더의 누락·복수 값 거부, 같은 IP·secret의 안정적인 해시를 확인한다. 처음에는 함수가 없어 실패해야 한다.
- [ ] **Step 2: `src/lib/inquiry-security.ts`의 세 함수를 구현하고 위 테스트를 통과시킨다.** `SITE_URL`의 호스트와 그 `www` 변형만 허용한다. 운영의 `x-forwarded-for`는 한 개의 유효한 IP여야 하고 개발에는 고정 로컬 키를 쓴다. 해시는 `TURNSTILE_SECRET_KEY`에 `inquiry-rate-limit/v1` 용도 구분 문자열을 적용한 HMAC으로 만든다.
- [ ] **Step 3: 수동 개통 플래그와 정책 환경변수를 제거한다.** `CONTACT_FORM_ENABLED`, `CONTACT_POLICY_*`는 사용하지 않는다. Supabase·Turnstile·유효한 발신 주소가 준비되면 폼을 활성화한다. SMTP 자격 증명이나 `NOTIFICATION_BATCH_SECRET`의 부재는 DB 접수를 막지 않는다.
- [ ] **Step 4: 폼의 개인정보 박스를 동의 체크와 새 탭 `/privacy` 링크로 바꾼다.** 링크에는 `rel="noopener noreferrer"`를 쓰고 체크는 필수로 유지한다. DB의 `consent_version`에는 코드 상수 `privacy-link-v1`을 저장한다. 접수 완료 문구에서 메일이 발송되었다는 표현을 제거한다.
- [ ] **Step 5: 문의 API에 보안 헬퍼를 연결한다.** Turnstile `action=inquiry`와 호스트명을 검사하고 Vercel IP에서 만든 제한 키를 기존 RPC에 전달한다. `TRUSTED_CLIENT_IP_HEADER`와 `INQUIRY_RATE_LIMIT_SECRET`은 삭제한다.
- [ ] **Step 6: 최소 접수 확인을 한다.** 잘못된 Turnstile 호스트·action과 운영 IP 헤더 누락은 DB 행을 만들지 않아야 한다. 정상 요청은 문의·대기 알림 각 1건을 만들고, 같은 제출 ID 재전송은 추가 행을 만들지 않아야 한다. SMTP 미설정이어도 정상 DB 접수는 가능해야 한다. `yarn typecheck`와 `yarn lint`를 실행한다.
- [ ] **Step 7: Task 3 파일만 커밋한다.** 기존 미커밋 알림 모듈 변경은 스테이징하지 않는다.

### Task 4: 랜딩 문구와 운영 문서 마무리

**Files:**
- Create: `.prettierrc.json`, `.prettierignore`
- Modify: `src/app/page.tsx`, `src/components/site/SiteFrame.tsx`, `.env.example`, `docs/operations.md`, `package.json`, `yarn.lock`

**Interfaces:**
- Consumes: Task 2의 `PortfolioProject`와 Task 3의 최종 환경변수 목록.
- Produces: 최종 랜딩 카피와 배포 설정 안내.

- [ ] **Step 1: 랜딩의 소개 영역을 제목과 “막연한 생각도 괜찮습니다. 함께 구체화해요.”로 줄인다.** 과정 설명은 승인된 세 문장 경계로 줄을 나누고 좁은 화면에서는 자연스럽게 감기게 한다. 푸터의 이메일 링크만 삭제한다.
- [ ] **Step 2: `.env.example`과 `docs/operations.md`를 최종 정리한다.** `GITHUB_*`, `PORTFOLIO_DIR`, `LOCAL_PREVIEW`, `CONTACT_FORM_ENABLED`, `CONTACT_POLICY_*`, `TURNSTILE_ALLOWED_HOSTNAMES`, `TRUSTED_CLIENT_IP_HEADER`, `INQUIRY_RATE_LIMIT_SECRET`을 제거한다. `NOTIFICATION_BATCH_SECRET`이 Vercel 서버와 Supabase Vault에 같은 값으로 필요함을 설명한다. `/privacy` 내용·문의 자동 삭제 정책은 변경하지 않는다.
- [ ] **Step 3: Prettier를 설정하고 실행한다.** `yarn add --dev --exact prettier@3.9.9`로 버전을 고정하고 `package.json`에 `format`(`prettier . --write`)과 `format:check`(`prettier . --check`)를 둔다. `.prettierrc.json`은 기존 따옴표·세미콜론 스타일을 유지하고 `.prettierignore`는 생성물·의존성을 제외한다. 저장소의 코드와 문서를 `yarn format`으로 정리하되 SQL과 환경변수 파일은 지원 범위 밖이면 그대로 둔다.
- [ ] **Step 4: 가벼운 최종 확인을 한다.** `yarn format:check`, `yarn typecheck`, `yarn lint`, `yarn build`, 데스크톱·모바일 랜딩과 문의 화면을 확인한다. 프로젝트 키가 아직 없어서 빌드나 실제 DB 접수를 확인할 수 없으면 그 한계를 기록하고 나머지 확인은 수행한다.
- [ ] **Step 5: Task 4 파일과 Prettier가 포맷한 파일만 커밋하고 `git status --short`를 확인한다.** 포맷 외의 사전 미커밋 코드 변경은 보존한다.
