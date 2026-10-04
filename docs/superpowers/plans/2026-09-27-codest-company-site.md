# Codest Company Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Codest의 작업 사례를 GitHub Markdown으로 소개하고, 반응형 제작문의 폼에서 접수한 내용을 Supabase에 저장한 뒤 접수자와 담당자에게 배치 메일을 보낸다.

**Architecture:** Next App Router의 마케팅 화면과 기존 서비스 화면을 route group으로 분리한다. 서버 전용 GitHub 로더가 검증한 콘텐츠를 600초 캐시하며, 문의 API는 입력과 Turnstile 토큰을 검증한 후 문의와 범용 알림을 하나의 DB 트랜잭션에 저장한다. 별도 인증된 Node.js 배치가 `notification`의 type/payload로 Handlebars 메일을 렌더링해 Nodemailer와 SMTP2GO로 발송한다.

**Tech Stack:** Next.js 16 안정 버전, React 19, TypeScript, Tailwind 3, react-markdown/remark-gfm, gray-matter, Zod, Supabase Postgres, Cloudflare Turnstile, Handlebars, Nodemailer, SMTP2GO, Vitest, Playwright. 기존 Yarn Classic과 `yarn.lock`을 유지한다.

**Spec:** `docs/superpowers/specs/2026-09-27-codest-company-site-design.md` — 2026-09-27 승인된 기본 설계에 사용자의 Turnstile·메일 템플릿·디자인 기준 요청을 추가 반영했다. 서비스 자격증명과 개인정보 운영 정책은 별도 연결 입력이다.

## Global Constraints

- Next.js 16.3.6과 React/React DOM 19.3.0을 기준으로 실제 설치 시 안정 패치·peer dependencies를 다시 확인하고 잠금 파일에 고정한다. Node 24, Tailwind 3, App Router, TypeScript를 유지한다.
- 랜딩 `/`, `/portfolio`, `/portfolio/[slug]`, `/contact`를 구현한다. `/driver`, `/privacy` URL과 기존 서비스·정책 내용을 보존한다.
- 모든 페이지는 반응형이다. 검증 폭은 320, 390, 768, 1440px이며 모바일은 한 열, 프로젝트 목록 데스크톱은 두 열이다.
- 배경 `#080C12`, 표면 `#111923`, 본문 `#F4F7FA`, 보조 설명 `#A4AFBD`, 강조 `#20C0FF`, 보조 시안 `#30D0FF`를 사용한다. 큰 작업 사례와 여백을 중심으로 구성한다.
- Linear의 왼쪽 정렬·절제된 명암과 Work & Co의 타이포그래피·사례 구성을 직접 참고한다. 반복 둥근 카드, 발광·유리 패널·오로라 배경·그라데이션 제목·장식용 배지·가상 대시보드는 사용하지 않는다.
- 제공된 로고 외의 새 이미지 영역은 빈칸으로 둔다. 포트폴리오 커버는 16:10 비율을 유지하고 가상의 실적·고객·이미지를 추가하지 않는다.
- 문의는 이름 80자, 전화번호 30자, 이메일 254자, 제작내용 20~5000자와 개인정보 동의를 검증한다.
- `notification` 컬럼은 `id`, `to`, `recipt`, `type`, `payload`, `status`, `created_at`, `sent_at`의 8개뿐이다. `to`는 독립된 TEXT, `recipt`는 nullable JSONB이며 문의 ID/FK를 추가하지 않는다. 제목과 완성된 본문은 type/payload로 생성한다.
- 템플릿 type은 `inquiry_received.v1`, `notice.v1`로 시작한다. Handlebars 기본 HTML 이스케이프를 유지하고 사용자 입력을 템플릿 코드로 실행하지 않는다. HTML과 일반 텍스트 대체 본문을 함께 보낸다.
- Turnstile Managed 위젯과 서버 Siteverify 검증을 적용한다. `action=inquiry`, 허용 hostname 확인, 300초·1회용 토큰 처리, 새 토큰과 같은 submission_id로 재시도를 지원한다.
- 메일의 `to`는 접수자 이메일, `recipt.from`은 `{name:"Codest",address:"kdh@codest.kr"}`, `replyTo`와 `bcc`는 각각 `["kdh@codest.kr"]`이다. 문의당 알림 한 건을 만든다.
- Supabase Cron 5분 주기, 배치당 최대 10건, SMTP2GO와 Nodemailer, Dooray MX 유지. 자동 재시도·응답 코드 저장·세부 발송 로그 테이블·SMS 구현은 범위 밖이다.
- 입력 재시도는 `submission_id`로 구분한다. 접수 API에서 메일을 보내지 않는다. `sent`는 SMTP 접수 성공을 의미한다.
- 비밀정보는 서버에만 둔다. 두 업무 테이블과 RPC는 공개 역할에서 접근할 수 없다. 운영 서비스 설정이 없을 때 성공을 가장하지 않는다.

## Review Focus

- 한글 긴 문장·URL·Markdown 표가 320px 화면을 밀어내지 않고 메뉴·폼을 키보드로 사용할 수 있어야 한다. Task 3, 7, 8에서 확인한다.
- 네트워크 응답이 끊겨 같은 문의를 동시에 다시 제출해도 문의와 알림은 각각 한 건이어야 한다. Task 4, 5, 7에서 확인한다.
- 접수자는 SMTP에 접수되고 Bcc만 거절된 경우 전체를 재발송하지 않아야 한다. Task 6에서 확인한다.
- GitHub의 오류·초안 전환·새 slug·잘못된 이미지 경로가 정상 빈 목록이나 누출된 초안으로 바뀌지 않아야 한다. Task 2, 8에서 확인한다.
- Turnstile 만료·재사용·외부 검증 장애, HTML 삽입·잘못된 payload, 설정 누락·전화번호 대상으로 인해 검증을 우회하거나 잘못 발송하지 않아야 한다. Task 5, 6, 7, 8에서 확인한다.

## File Structure and Execution Order

| 영역 | 파일과 역할 |
| --- | --- |
| 런타임 | `package.json`, `yarn.lock`, `eslint.config.mjs`, `tsconfig.json`, `.node-version`: 지원 버전과 독립적인 검사 명령 |
| 마케팅 | `src/app/(site)`: 랜딩·포트폴리오·문의와 전용 레이아웃. `src/components/site`: 공통 메뉴·푸터·빈 이미지 영역 |
| 기존 페이지 | `src/app/(legacy)`: 기존 헤더·푸터와 `/driver`, `/privacy`. URL은 유지 |
| 콘텐츠 | `src/lib/portfolio`: 모델·Markdown 파서·GitHub 접근·캐시 로더. `content/portfolio`: 이미지 없는 개발 예제 |
| 문의 | `src/lib/inquiries`: 입력·Turnstile 검증·접수 서비스·메일 payload. `src/app/api/inquiries/route.ts`: 공개 접수 |
| 알림 | `src/lib/notifications`: 모델·DB 저장소·타입별 Handlebars 템플릿·SMTP·배치. `src/app/api/internal/notifications/route.ts`: 인증된 실행 |
| DB | `supabase/migrations`: 업무 테이블·최소 빈도 제한 저장소·트랜잭션 RPC. `supabase/operations`: 스케줄과 수동 재처리 |
| 검증·운영 | `tests/unit`, `tests/db`, `tests/e2e`, `README.md`, `.env.example`, `docs/operations.md` |

실행을 시작할 때 `using-git-worktrees`를 따라 연결된 체크아웃을 확인하고 적합한 worktree를 재사용한다. 별도 격리가 필요하면 앱의 managed worktree 도구를 사용한다. 이 계획 작성 중에는 제품 코드·의존성·외부 서비스에 변경하지 않는다.

### Task 1: Next.js 업데이트와 실행 가능한 기반

**Files:** Modify `package.json`, `yarn.lock`, `tsconfig.json`, `next.config.mjs`, `.gitignore`; replace `.eslintrc.json` with `eslint.config.mjs`; create `.node-version`, `vitest.config.ts`, `playwright.config.ts`.

**Interfaces:** `yarn lint` → ESLint CLI, `yarn typecheck` → `tsc --noEmit`, `yarn test:unit` → `vitest run` with `tests/unit/**/*.test.ts` inclusion, `yarn test:e2e` → Playwright, `yarn build` → Next production build. Playwright starts a loopback-only local server and uses explicit fixture configuration.

- [ ] **Step 1:** Record current Node/Yarn versions, route behavior and baseline lint/build errors. Inspect actual registry versions and official Next 16 upgrade notes before editing dependencies.
- [ ] **Step 2:** Upgrade Next, React, React DOM and matching types/ESLint config together; keep Tailwind 3 and one Yarn lockfile. Configure flat ESLint and the independent validation scripts. Do not add tests that only assert configuration text.
- [ ] **Step 3:** Add Vitest/Playwright dev dependencies and configurations required by subsequent tasks; ignore their output directories. Keep browser installation local to available tooling and report missing runtime support rather than hiding skipped checks.
- [ ] **Step 4:** Run `yarn lint`, `yarn typecheck`, `yarn build`; resolve upgrade regressions without deleting existing page content. Check `/`, `/driver`, `/privacy` start under the upgraded runtime. Success means zero command failures and existing routes render.
- [ ] **Step 5:** Commit scoped changes as `chore: upgrade Next.js and validation tooling`.

### Task 2: GitHub Markdown을 검증하고 캐시하는 콘텐츠 로더

**Files:** Create `src/lib/portfolio/{types,parse,github,load}.ts`, `content/portfolio/school-bus.md`, `tests/unit/portfolio.test.ts`, `tests/fixtures/portfolio/*`; modify `package.json`, `yarn.lock`, `.env.example`.

**Interfaces:**
- `PortfolioProject = {slug:string; title:string; summary:string; cover:string|null; category:string; stack:string[]; publishedAt:string; featured:boolean; draft:boolean; body:string}` in `types.ts`.
- `parseProject(slug:string, markdown:string, baseUrl:URL): PortfolioProject` and `resolveImageUrl(source:string, baseUrl:URL): string|null` in `parse.ts`.
- `fetchPortfolioFiles(config:GitHubConfig): Promise<{slug:string; markdown:string; baseUrl:string}[]>` in `github.ts`; `GitHubConfig={owner:string; repo:string; ref:string; directory:string; token?:string}` exported there.
- `listProjects(): Promise<PortfolioProject[]>`, `getProject(slug:string): Promise<PortfolioProject|null>` in `load.ts`. `null` means confirmed missing/draft; unavailable source throws `PortfolioLoadError`. Modules that fetch credentials or local files import `server-only`.

- [ ] **Step 1:** Add parser/loader tests for missing or null cover, malformed front matter, duplicate slug, relative image resolution, draft filtering, unknown slug, unsafe schemes and unavailable GitHub. Named acceptance assertions include:
  - `missing_cover_keeps_project`: `expect(project.cover).toBeNull()`.
  - `draft_is_not_public`: `expect(publicProjects.map(p => p.slug)).not.toContain("draft")`.
  - `github_failure_is_not_empty`: `await expect(fetchPortfolioFiles(config)).rejects.toThrow()` for a 403/500 response.
  - `image_path_stays_in_repository`: traversal beyond the configured repository and non-HTTPS absolute images resolve to `null`.
- [ ] **Step 2:** Run `yarn test:unit tests/unit/portfolio.test.ts`; confirm failure because the new behavior does not exist.
- [ ] **Step 3:** Implement front matter parsing with gray-matter and Zod. Default `cover=null`, `stack=[]`, `featured=false`, `draft=false`; require nonempty title/summary/category and a valid `publishedAt`. Use filename slug `[a-z0-9]+(?:-[a-z0-9]+)*`, newest-first sorting, and reject duplicate slugs.
- [ ] **Step 4:** Read the configured directory through the GitHub Contents API, with `owner/repo/ref/directory` encoded and token restricted to `api.github.com`. Resolve the configured ref to a commit SHA before reading the directory and files so one refresh is consistent. Fetch only `.md` files, use bounded concurrency (4), a 1MiB limit per Markdown file and 10-second request deadlines. Reject failed responses and directory listings of 1,000 entries (API limit) rather than silently truncating, and throw on an invalid project instead of caching a partial snapshot. Add tests for a changing branch and a failed file among valid files.
- [ ] **Step 5:** Cache the fully validated published snapshot for 600 seconds with Next `unstable_cache` while retaining the current non-Cache-Components model. Include repository configuration in its key; do not use a module-local Map as the production cache. A failed revalidation throws so the last good snapshot survives. `generateStaticParams` consumers must allow new paths after deployment.
- [ ] **Step 6:** Configure `PORTFOLIO_SOURCE=github|local`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_REF`, `GITHUB_PORTFOLIO_DIR`, optional `GITHUB_TOKEN`. Local mode must be explicitly selected; a loopback-only preview may also opt in with `LOCAL_PREVIEW=true` and a loopback `SITE_URL` for production-build tests. Normal deployment never silently falls back. Add an image-free school-bus example using only existing `/driver` facts and no invented role, technology or performance claims.
- [ ] **Step 7:** Run the targeted tests and typecheck, then commit `feat: load portfolio Markdown from GitHub`. Defer actual Next cache survival/new-slug verification to Task 8's production-server test.

### Task 3: 모든 소개 화면의 반응형 레이아웃

**Files:** Modify `src/app/layout.tsx`, `src/app/globals.css`, `src/app/components/Header.tsx`; move `src/app/page.tsx` → `src/app/(site)/page.tsx`, `src/app/driver/page.tsx` → `src/app/(legacy)/driver/page.tsx`, `src/app/privacy/page.tsx` → `src/app/(legacy)/privacy/page.tsx`; create `src/app/(site)/{layout.tsx,site.css,error.tsx}`, `src/app/(legacy)/layout.tsx`, `src/app/(site)/portfolio/{page.tsx,[slug]/page.tsx,[slug]/not-found.tsx}`, `src/components/site/{SiteHeader,SiteFooter,ImageSlot,ProjectCard,PortfolioMarkdown}.tsx`, `src/app/{sitemap.ts,robots.ts}`, `tests/e2e/site.spec.ts`; copy supplied logos to `public/images/brand/`.

**Interfaces:** Consumes Task 2 `listProjects/getProject`. `ImageSlot({src,alt,ratio?}:{src:string|null;alt:string;ratio?:string})` preserves layout without a fabricated image. `ProjectCard({project}:{project:PortfolioProject})`. `PortfolioMarkdown({project}:{project:PortfolioProject})` uses the safe image resolver from Task 2 and does not alter the old Markdown component.

- [ ] **Step 1:** Reopen Linear and Work & Co in a browser and compare their typography, whitespace and project hierarchy against the spec's reference table before styling. Implement the route-group separation and brand shell. Root owns only HTML/body/fonts; `(legacy)` retains the old Header/Footer; `(site)` owns dark styles and the new navigation. Restrict CSS to `.site`; do not globally repaint legacy pages. Update the old header's contact link to `/contact` and its menu accessibility. Preserve existing privacy text exactly during the move.
- [ ] **Step 2:** Copy `C:/Users/Administrator/Downloads/logo_white.png` and `logo_short.png` without editing raster files. Account for transparent padding with CSS positioning/clipping, not image distortion. Use only these images in new UI until portfolio authors supply covers.
- [ ] **Step 3:** Build the five landing sections and portfolio grid/detail from the spec, with no search/filter or fabricated proof. Hero copy is “아이디어를, 실제로 쓰이는 서비스로.”; links are `제작 문의하기` and `포트폴리오 보기`. Use a left-aligned hero, a broad blank visual area, unframed project entries and text/number/divider-based service and process sections. Keep blue concentrated in primary actions; do not fill blank imagery with decoration. If portfolio loading is unavailable show a visible unavailable notice, retaining the landing's other sections rather than claiming there are no projects.
- [ ] **Step 4:** Render safe Markdown with no raw HTML/MDX. Constrain tables/code blocks to locally scroll; wrap long URLs. Use route `revalidate=600`, async `params`, dynamic slug generation and genuine 404 for missing/draft pages. Derive page metadata/sitemap from published content and `SITE_URL`; only set image metadata when a valid image exists. Never return a successful empty sitemap on upstream failure.
- [ ] **Step 5:** Add Playwright assertions for published detail navigation, direct draft/missing 404, broken-image absence, and menu keyboard use. Across 320/390/768/1440px assert `document.documentElement.scrollWidth <= window.innerWidth` for landing, list, detail, driver and privacy; include a long URL and table fixture. Add a reduced-motion run and inspect screenshots manually. These are user-behavior checks, not snapshots of implementation markup.
- [ ] **Step 6:** Fix any legacy overflow (notably driver image margins) with responsive styling while preserving text/images. Compare actual screenshots with both references for alignment, type hierarchy, spacing, project-area proportion and color restraint; remove prohibited decoration before calling the design complete. Run `yarn test:e2e tests/e2e/site.spec.ts`, lint and typecheck; commit `feat: build responsive Codest pages and portfolio`.

### Task 4: Supabase 테이블과 원자적인 접수·알림 RPC

**Files:** Create `supabase/migrations/202609270001_inquiries_notifications.sql`, `src/lib/db/{client,types}.ts`, `src/lib/notifications/{types,repository}.ts`, `src/lib/inquiries/repository.ts`, `vitest.db.config.ts`, `tests/db/setup.ts`, `tests/db/{inquiries,notifications,permissions}.test.ts`; modify package scripts/dependencies for Supabase client and test-only `pg`.

**Interfaces:**
- `NotificationRecipt={from:{name?:string;address:string};replyTo?:string[];bcc?:string[]}`; `NewNotification={to:string;recipt:NotificationRecipt|null;type:string;payload:Record<string,string>}`; `NotificationRow=NewNotification & {id:string;status:"pending"|"processing"|"sent"|"failed"|"needs_review";created_at:string;sent_at:string|null}` in `notifications/types.ts`.
- `InquiryRecord={id:string;submission_id:string;name:string;phone:string;email:string;message:string;consent_version:string;consented_at:string}` in `db/types.ts`; DB owns created_at and status.
- RPC `submit_inquiry(p_inquiry jsonb,p_notification jsonb,p_limit_key text)` → `{inquiry_id:uuid,created:boolean}`; `enqueue_notification(p_notification jsonb)` → uuid; `claim_notification()` → zero or one notification row; `finish_notification(p_id uuid,p_status text)` → boolean; `consume_inquiry_limit(p_key text)` → boolean, callable internally.
- TS `saveInquiry(record:InquiryRecord,notification:NewNotification,limitKey:string): Promise<{inquiryId:string;created:boolean}>`, `enqueueNotification(input:NewNotification):Promise<string>`, `claimNotification():Promise<NotificationRow|null>`, `finishNotification(id:string,status:"sent"|"failed"|"needs_review"):Promise<boolean>`.
- `yarn test:db` → `vitest run --config vitest.db.config.ts`, restricted to `tests/db/**/*.test.ts`, with file parallelism disabled and explicit concurrent connections inside race tests.

- [ ] **Step 1:** Write real Postgres tests for rollback if notification insert fails, concurrent identical submission → one inquiry/one notification, conflicting content → conflict, claim races → one owner, generic notification with no inquiry, phone string with null recipt stored, and anon/authenticated permission denial. Test setup must refuse non-loopback hosts or a database name not ending in `_test`; use an explicitly disposable local Postgres with Supabase roles, not a production project.
  - `concurrent_replay`: `expect(results.filter(result => result.created)).toHaveLength(1)` and `expect(notificationCount).toBe(1)` after two simultaneous calls with the same submission ID.
  - `claim_once`: `expect(claimResults.filter(Boolean)).toHaveLength(1)` for one queued row and two connections.
  - `atomic_rollback`: `expect(inquiryCount).toBe(0)` after an intentionally invalid notification insert aborts the transaction.
- [ ] **Step 2:** Run `yarn test:db` against `TEST_DATABASE_URL` and confirm tests fail before migration. If no disposable DB is available, report this verification as pending; do not substitute mocks and label it passed.
- [ ] **Step 3:** Create inquiries columns from spec, unique submission_id, exact eight notification columns (`"to"` quoted in SQL), status constraints, created_at defaults and a partial pending index. `to` and type are nonempty TEXT, recipt nullable JSONB, payload a non-null JSONB object; no subject/body columns. Keep contact data out of a separate small `inquiry_rate_limits` table whose rows contain only hashed key, time window and count. Add a DB assertion that template payload and generic notifications persist without any inquiry FK.
- [ ] **Step 4:** Implement submission transaction with a per-submission advisory transaction lock, normalized-content comparison, limit check, inquiry insert and notification insert. Existing identical submission returns its original ID without new notification or consuming another rate slot. Compare only inquiry content and consent version; never persist/compare Turnstile tokens. Default limit: 5 new submissions per 10-minute window per hashed client key. Clean expired counters; counter updates are atomic across instances.
- [ ] **Step 5:** Implement oldest-first claim with `FOR UPDATE SKIP LOCKED` and pending→processing in one transaction, one row per call. Finalization only changes a processing row; only sent writes sent_at. Prevent edits to addressing/content after processing begins. Retain stopped processing rows for manual review; never reset them automatically.
- [ ] **Step 6:** Enable RLS, revoke tables/RPC from PUBLIC, anon and authenticated; allow service-role execution only with fixed function search_path and explicitly qualified objects. Implement server-only Supabase wrappers with no browser session persistence. Test permissions by changing DB role, not just checking SQL strings.
- [ ] **Step 7:** Run DB tests, typecheck, commit `feat: persist inquiries and generic notification queue`.

### Task 5: 검증된 문의 접수 API

**Files:** Create `src/lib/inquiries/{schema,receipt,submit,rate-limit,turnstile}.ts`, `src/lib/config/{server,contact-policy}.ts`, `src/app/api/inquiries/route.ts`, `tests/unit/inquiries.test.ts`, `tests/unit/inquiry-route.test.ts`, `tests/unit/turnstile.test.ts`; extend `.env.example`.

**Interfaces:**
- `InquiryInput={submissionId:string;name:string;phone:string;email:string;message:string;consent:true;website?:string;turnstileToken:string}`; `parseInquiry(input:unknown):InquiryInput` in schema.ts. Export shared client-safe schema only; no server imports in it.
- `createReceipt(input:InquiryInput,inquiryId:string,fromAddress:string):NewNotification` in receipt.ts.
- `verifyTurnstile(token:string):Promise<"valid"|"invalid"|"unavailable">` in turnstile.ts calls Siteverify with the server secret, checks action and allowed hostnames, and never stores/logs the token.
- `submitInquiry(input:InquiryInput,limitKey:string):Promise<{inquiryId:string;created:boolean}>` generates record UUID/time and calls Task 4 saveInquiry. `getContactAvailability():{enabled:boolean;reason?:string}` from server config.
- `ContactPolicy={version:string;purpose:string;items:string[];retention:string;processors:{name:string;purpose:string}[]}` and `getContactPolicy():ContactPolicy|null` in contact-policy.ts; values come from the owner-supplied file, with no invented policy defaults.
- `POST /api/inquiries`: 201 new / 200 replay `{ok:true,inquiryId}`, 400 invalid/missing token, 403 failed Turnstile, 409 conflicting submission, 413 oversized, 429 limited, 503 service verification/storage unavailable. Failure bodies contain a public message and optional field errors, never DB/Cloudflare details.

- [ ] **Step 1:** Write failing tests for all four required fields, no consent, UUID format, each spec length boundary, phone with separators/+country code (7–15 digits), multiple-email/header injection, honeypot, >32KiB streamed body, malformed JSON, duplicate replay, 409 conflict, 429 limit and DB unavailable. Assert Nodemailer is never called by submission.
  - `message_bounds`: `expect(() => parseInquiry({...validInput,message:"x".repeat(19)})).toThrow()`; 20 and 5000 characters pass, 5001 throws.
  - `db_unavailable`: `expect(response.status).toBe(503)` and `expect(await response.json()).not.toHaveProperty("inquiryId")` when saveInquiry rejects.
  - `fixed_receipt`: `expect(createReceipt(validInput,id,"kdh@codest.kr").recipt?.bcc).toEqual(["kdh@codest.kr"])` despite extra attacker-supplied addressing keys in the raw request.
  - `turnstile_blocks_storage`: `expect(saveInquiry).not.toHaveBeenCalled()` for missing/expired/reused token, action/hostname mismatch and Siteverify timeout; statuses are 400/403/503 as defined above.
  - `fresh_token_replay`: two requests with the same inquiry content/submissionId and different valid tokens return the same inquiryId; `expect(notificationCount).toBe(1)` in the integrated route/DB check.
- [ ] **Step 2:** Run `yarn test:unit tests/unit/inquiries.test.ts tests/unit/inquiry-route.test.ts tests/unit/turnstile.test.ts` and confirm expected failures.
- [ ] **Step 3:** Implement normalization and server-side validation with Zod. Apply limits to the actual bytes read, not just Content-Length. Preserve all user fields on failure via structured form errors; derive consent version/time on the server. Do not permit client JSON to set notification addresses/options or title.
- [ ] **Step 4:** Implement Siteverify POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with a 5-second timeout, a token length of 1–2048, success=true, action=inquiry and exact hostname allowlist checks. Validate every submission before DB calls, including replay requests; on failure require a fresh client token, with no bypass or cached validation result. Create notification type `inquiry_received.v1`, payload `{name,phone,email,message,receiptId:inquiryId}` and fixed from/replyTo/bcc. Do not render HTML or store turnstileToken at receipt creation. A fresh proposed inquiry ID on a replay does not change the existing saved result.
- [ ] **Step 5:** HMAC client address with `INQUIRY_RATE_LIMIT_SECRET`. Honor only a configured deployment proxy header known to be overwritten by trusted ingress, never arbitrary forwarded headers. Without trusted client-IP configuration, the production form stays unavailable. Local preview uses an explicit development loopback key. Keep raw IP, message bodies and email addresses out of logs.
- [ ] **Step 6:** Require `CONTACT_FORM_ENABLED=true`, Supabase configuration, consent policy, mail settings and valid Turnstile keys/hostnames for first activation; this is a configuration check, not a live SMTP probe on each request. Runtime SMTP outages must not disable stored submissions. Missing policy/setup produces 503 and the UI fallback contact link. Only the Turnstile site key may be public; reject known Cloudflare testing keys outside explicit loopback preview/tests.
- [ ] **Step 7:** Run unit tests and typecheck, commit `feat: accept validated inquiries atomically`.

### Task 6: Handlebars HTML 템플릿과 SMTP2GO 배치 발송

**Files:** Create `src/lib/notifications/{schema,render,smtp,batch}.ts`, `src/lib/notifications/templates/{inquiry-received.v1,notice.v1}.html.hbs`, `src/app/api/internal/notifications/route.ts`, `tests/unit/{notification-templates,notifications,notification-route}.test.ts`, `supabase/operations/{schedule-notifications,unschedule-notifications,resend-notification}.sql`; modify `package.json`, `yarn.lock`, `next.config.mjs`, `.env.example`.

**Interfaces:** Consumes Task 4 types/repository. `renderNotification(type:string,payload:Record<string,string>):{subject:string;html:string;text:string}` from render.ts uses a fixed registry and per-type Zod schema. `parseEmailNotification(row:NotificationRow):{from:NotificationRecipt["from"];to:string;replyTo?:string[];bcc?:string[];subject:string;html:string;text:string;messageId:string}` composes validated addresses and rendered output. `sendNotification(row:NotificationRow):Promise<"sent"|"failed"|"needs_review">`; `runNotificationBatch():Promise<{processed:number;sent:number;failed:number;needsReview:number}>`.

- [ ] **Step 1:** Write failing mocked-SMTP tests: all envelope recipients accepted→sent; only to accepted/Bcc rejected→needs_review; clear pre-send failure→failed; ambiguous disconnect→needs_review; phone to/invalid recipt→failed without SMTP call; arbitrary JSON headers/attachments/envelope excluded. Assert replyTo/from are not counted as envelope recipients and multiple Bcc/replyTo addresses map correctly. Use Nodemailer's stream transport to assert Bcc is absent from MIME headers.
  - `template_selection`: `expect(renderNotification("inquiry_received.v1",receiptPayload).subject).toBe("[Codest] 제작문의가 접수되었습니다")`; `notice.v1` requires title/message and no inquiry.
  - `escaped_payload`: with message `<img src=x onerror=alert(1)> & {{name}}`, `expect(rendered.html).toContain("&lt;img")`; no executable tag is emitted, literal `{{name}}` is not recompiled, and rendered.text retains the original readable text.
  - `unknown_or_incomplete_template`: unknown type and missing required payload result in failed with `expect(sendMail).not.toHaveBeenCalled()`. Preserve Korean text and multi-line messages; reject newline in notice titles.
  - `partial_acceptance`: `expect(await sendNotification(row)).toBe("needs_review")` when only row.to appears in accepted; `expect(sendMail).toHaveBeenCalledTimes(1)`.
  - `phone_is_not_email`: `expect(await sendNotification(phoneRow)).toBe("failed")`; `expect(sendMail).not.toHaveBeenCalled()`.
  - `bcc_not_exposed`: `expect(mimeHeaders).not.toMatch(/^Bcc:/im)` while the transport envelope includes the Bcc address.
- [ ] **Step 2:** Add batch tests: wrong secret→401 with no DB work; more than 10 pending→at most 10 processed; early time-budget exhaustion leaves unclaimed rows pending; DB-finalization failure leaves processing and does not retry; generic notification does not read inquiries. Run all three targeted notification unit suites and confirm failure.
- [ ] **Step 3:** Implement Node SMTP transport with `mail.smtp2go.com`, port587, secure=false, requireTLS=true; support configured port465/secure=true. Use SMTP_USER/PASS, bounded connection/greeting/socket timeouts and no certificate bypass. Treat timeout after submission as uncertain. Avoid Promise.race retries that leave an old transport sending in the background.
- [ ] **Step 4:** Install Handlebars and implement an allowlisted template registry. The inquiry schema uses the spec's contact bounds and required receiptId; notice.v1 requires title (1–200 chars, no CR/LF) and message (1–5000). Read only the two fixed template paths and cache compilation; use normal escaped expressions, derive messageLines for safe line breaks, and never compile payload values or expose prototype access. Generate subject/plain text separately so they remain readable. Inquiry subject is `[Codest] 제작문의가 접수되었습니다` and both body alternatives include “내용을 확인한 뒤 연락드리겠습니다.”. Add outputFileTracingIncludes for `/api/internal/notifications` to package `src/lib/notifications/templates/**/*.hbs` and verify they are present in a production artifact.
- [ ] **Step 5:** Build the email HTML as a maximum-600px single-column table layout with inline CSS, Codest name, restrained blue accents, receipt fields and reply instructions. Generate synthetic-data HTML previews at 360/600px, inspect escaping/long-content layout, and verify Nodemailer produces multipart HTML/plain text without a visible Bcc header. Validate rows before sending; set Message-ID from notification UUID, map only explicit allowed fields, disable file/URL access, and compare unique to+bcc against accepted. Log only ID and a sanitized category; do not store rendered HTML or SMTP responses.
- [ ] **Step 6:** Implement sequential claim/send/finalize with a maximum of 10 and a 45-second batch budget, with no new claim unless at least 15 seconds remain. Use connection/greeting timeouts of 5 seconds, socket timeout 10 seconds, and a total send deadline of 15 seconds that closes its transport and records an uncertain outcome; never retry that send. Verify the deployed host supports a 60-second endpoint budget. A terminated process leaves processing for manual review. Final DB errors stop the batch and return server failure.
- [ ] **Step 7:** Require `Authorization: Bearer <NOTIFICATION_BATCH_SECRET>` before opening a DB connection. Write idempotent schedule/unschedule SQL using Vault references and a 5-minute Cron expression; never embed real keys. Resend SQL copies type/payload into a new row for only confirmed failed addresses and retains original history. Keep old versioned templates when introducing an incompatible template contract.
- [ ] **Step 8:** Run targeted unit tests plus Task 4 claim tests; commit `feat: render and batch notification emails through SMTP2GO`.

### Task 7: 반응형 문의 폼과 개인정보 안내

**Files:** Create `src/app/(site)/contact/page.tsx`, `src/components/site/{InquiryForm,TurnstileWidget}.tsx`, `src/content/contact-policy.json.example`, `tests/e2e/contact.spec.ts`; modify `src/app/(legacy)/privacy/page.tsx` to display a separately labeled website-inquiry section when configured.

**Interfaces:** Consumes Task 5 shared InquiryInput/schema, availability and contact policy. `InquiryForm({consentVersion,siteKey}:{consentVersion:string;siteKey:string})` calls `/api/inquiries` without importing server config or DB modules. `TurnstileWidget({siteKey,resetKey,onToken}:{siteKey:string;resetKey:number;onToken:(token:string|null)=>void})` owns rendering/reset/cleanup and reports null on expiry/error. Policy loader reads an owner-filled `src/content/contact-policy.json`; absent file means unavailable form, never invented retention terms.

- [ ] **Step 1:** Add browser tests for required labels, valid submission→receipt confirmation, disabled button while submitting, validation error association, network failure preserving all values, same submissionId on retry and a new ID only for a new submission. Include a 390px keyboard/touch flow and assert no horizontal overflow at all four widths.
  - `retry_keeps_input`: `await expect(page.getByLabel("제작내용")).toHaveValue(originalMessage)` after a lost response; `expect(secondRequest.submissionId).toBe(firstRequest.submissionId)` after retry.
  - `submit_pending`: `await expect(page.getByRole("button",{name:"문의 접수하기"})).toBeDisabled()` while the response is pending.
  - `expired_challenge`: after the expiry callback, `await expect(page.getByRole("button",{name:"문의 접수하기"})).toBeDisabled()` and all form values remain; a new token re-enables eligible submission.
  - `new_token_same_submission`: after a lost response, `expect(secondRequest.turnstileToken).not.toBe(firstRequest.turnstileToken)` and the submissionId remains equal. Verify script-load failure shows retry/contact guidance rather than an endless spinner.
- [ ] **Step 2:** Run `yarn test:e2e tests/e2e/contact.spec.ts` to show the missing form failures. Mock the API only for UI-state tests; use Task 4/5 integration tests for real persistence.
- [ ] **Step 3:** Build name/phone/email/message fields using suitable input types/autocomplete and accessible errors. Present consent purpose/items/retention from the configured policy, clear pending/success states, and no file upload/budget/login. Load the official Turnstile script once, explicitly render Managed mode with action=inquiry, use flexible size or compact for narrow containers, and clean up on unmount. No token means submit disabled. On expired/error callbacks and every failed/lost submission reset the widget and clear the token while retaining UUID and inputs. Real tests use official Cloudflare testing keys; UI callback tests may mock the script without adding a product bypass.
- [ ] **Step 4:** Render `mailto:kdh@codest.kr` instead of an active form when setup is unavailable. Add a separate website-inquiry privacy section without modifying the old app/location policy. Mark development-only policy fixtures explicitly and prevent them from activating a public deployment.
- [ ] **Step 5:** Run contact browser tests, lint/typecheck and manually inspect the full form at 390/768/1440px. Commit `feat: add responsive inquiry form and receipt feedback`.

### Task 8: 운영 문서와 실제 경로 검증

**Files:** Create `docs/operations.md`, `tests/e2e/content-cache.spec.ts`, `tests/fixtures/github-server.mjs`; update `README.md`, `.env.example`, `.gitignore`, Playwright configuration and fix only defects found in this verification.

**Interfaces:** No new product interfaces. Environment inventory: PORTFOLIO_SOURCE, LOCAL_PREVIEW (local preview only), GITHUB_OWNER/REPO/REF/PORTFOLIO_DIR/TOKEN, SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, TURNSTILE_ALLOWED_HOSTNAMES, SMTP_HOST/PORT/SECURE/USER/PASS, MAIL_FROM, CONTACT_FORM_ENABLED, INQUIRY_RATE_LIMIT_SECRET, TRUSTED_CLIENT_IP_HEADER, NOTIFICATION_BATCH_SECRET. Test-only settings: TEST_DATABASE_URL and TEST_GITHUB_API_BASE_URL. Only the Turnstile site key is public; secrets must not use NEXT_PUBLIC prefixes.

- [ ] **Step 1:** Document portfolio metadata and relative images, blank covers, configuration, reference-derived design rules, approved colors/logos, setup commands, SQL migration/scheduler steps, manual failure review, and rollback/unschedule. Add Turnstile widget/domain/test-key setup and the type/payload contract, Handlebars templates and HTML previews. Explain that recipt retains the user's exact spelling and to can later store phone numbers, with SMS not yet implemented.
- [ ] **Step 2:** Add a loopback-only GitHub fixture server for production-server integration checks. TEST_GITHUB_API_BASE_URL requires LOCAL_PREVIEW=true, a loopback SITE_URL and API URL, no GitHub token, and must be rejected on a declared production deployment. Verify the actual Next cache across a successful refresh followed by 403/500, and a new slug/draft change after 600 seconds. Assert old good content survives upstream failure, new public slugs appear after revalidation without rebuilding, drafts disappear, and absence of any valid cache shows an error. Do not rely on mocked Next cache functions. Long waits must be asynchronous with progress updates.
  - `stale_snapshot_survives`: after the upstream switches to 500 and revalidation runs, `await expect(page.getByRole("heading",{name:publishedTitle})).toBeVisible()`.
  - `new_slug_without_build`: after adding a published file to the fixture and refreshing the snapshot, `expect((await page.goto(newProjectUrl))?.status()).toBe(200)` without restarting/rebuilding the app; a subsequently hidden draft must return 404 after successful revalidation.
- [ ] **Step 3:** Run `yarn lint`, `yarn typecheck`, `yarn test:unit`, `yarn test:db`, `yarn build` and the full browser suite in explicit local fixture mode. Record which checks ran and any missing external/runtime prerequisites. A production build must not require secrets just to render contact fallback; GitHub pages must surface configuration failure honestly rather than presenting fixtures as production data.
- [ ] **Step 4:** Inspect screenshots of all new pages and legacy routes across 320/390/768/1440px, plus keyboard navigation, visible focus, color contrast, reduced motion and long-content cases. Compare typography, alignment, whitespace and portfolio hierarchy with the references. Confirm no prohibited decorative patterns, broken images, invented imagery, layout-shifting slots, clipped Turnstile widget or brand styles leaking into old pages. Review rendered HTML email previews with long Korean text and escaped markup.
- [ ] **Step 5:** Review client build outputs and request payloads for server secrets; inspect sanitized failure logs. Verify a fresh checkout's documented setup steps and that fixture switches cannot silently publish example data.
- [ ] **Step 6:** When the user supplies a real GitHub repository, Supabase connection, Turnstile keys/allowed domains, SMTP2GO credentials/domain verification, production URL and privacy policy: apply only the authorized configuration, preserve Dooray MX, and check a verified inquiry save, scheduled batch execution, recipient+Bcc delivery, HTML rendering in available Gmail/Outlook/Dooray clients and Reply-To arrival. Use approved testing keys for automated verification; let the user complete any live interactive challenge. Do not claim unavailable client/delivery checks passed. Missing service inputs do not block completion of code and mock/local checks.
- [ ] **Step 7:** Perform the implementation workflow's whole-branch review, resolve actionable findings, rerun only affected checks, and commit `docs: document Codest setup and verify delivery flows`. Do not deploy or send arbitrary live test emails unless their target/environment is authorized.

## Self-Review and Handoff

- Spec coverage: framework Task1; Markdown/ISR Task2+8; reference-driven branding/images/responsiveness Task3+7+8; inquiry/RLS/idempotency Task4+5; Turnstile Task5+7+8; generic JSON addressing/type+payload/Handlebars/batch SMTP Task4+6; privacy/operational setup Task7+8.
- Interface review: `to` always remains the independent string column; `recipt` never contains to. `replyTo` uses Nodemailer's casing inside JSON. The DB stores type/payload; renderNotification alone produces subject/html/text. Only `submit_inquiry` couples the initial saves; the generic batch has no inquiry dependency. Turnstile tokens never enter persisted inquiry data or content comparison.
- Verification boundaries: local DB permissions/concurrency and actual Next cache behavior require integration tests. SMTP mocks prove control flow; production recipient delivery requires the final service-connection check.
- Recommendation: Native execution in this session. Eight tasks share types and page/data interfaces, and this repository is small enough for one implementer to maintain consistency with a final independent review.
- State: implementation plan written; awaiting user plan review and execution-method choice. No product implementation started by this document.

## Technical References

- [Next.js16 migration](https://nextjs.org/docs/app/guides/upgrading/version-16) — runtime/dependency changes and ESLint migration.
- [Next data cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) and [ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration) — explicit revalidation and on-demand paths.
- [GitHub repository contents](https://docs.github.com/en/rest/repos/contents) — authenticated server access to Markdown files.
- [Supabase Cron](https://supabase.com/docs/guides/cron) — scheduled batch invocation.
- [Nodemailer message configuration](https://nodemailer.com/message) and [address formats](https://nodemailer.com/message/addresses) — from, replyTo, Bcc and address validation/mapping.
- [Cloudflare server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) and [widget rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/) — token validation, expiry/reset and widget lifecycle.
- [Handlebars expressions](https://handlebarsjs.com/guide/expressions.html) — default HTML escaping and safe template substitution.
- [Linear](https://linear.app/), [Work & Co](https://work.co/) and [Work & Co clients](https://work.co/clients/) — visual reference checks in Task3 and Task8.
