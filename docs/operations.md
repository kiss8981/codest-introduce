# Codest 사이트 운영

## 시작

Node 20.9 이상을 사용합니다. `yarn install` 후 `.env.example`을 `.env.local`로 복사하고 `yarn dev`를 실행합니다. Supabase 설정이 없는 개발 화면에서는 포트폴리오가 준비 중으로 표시됩니다. 운영에서는 Supabase 연결이 필요합니다.

## 포트폴리오

Codest Web Supabase 프로젝트에는 `supabase/migrations/202609280001_portfolio.sql`을 적용하고 공개 `portfolio` 버킷을 만들었습니다. 다른 프로젝트에 배포할 때만 SQL을 한 번 적용하고, Storage 대시보드에서 같은 이름의 공개 버킷을 만들며 이미지 MIME 유형을 JPEG, PNG, WebP, AVIF, GIF로 제한합니다. 공개 버킷의 파일은 링크를 아는 사람이 볼 수 있으므로 비공개 자료를 업로드하지 마세요.

등록은 Table Editor에서 `portfolio` 행을 `is_published=false`로 먼저 만드는 순서입니다. `slug`는 상세 URL에 쓸 영문 소문자·숫자·하이픈 문자열로 입력합니다. Storage의 `portfolio` 버킷에 사진을 업로드하고 `photo_map` 행마다 해당 포트폴리오의 `id`, 버킷 안 파일 경로인 `storage_key`, `filename`, 바이트 단위 `file_size_bytes`, `mime_type`, `alt_text`를 입력합니다. 상세 상단 갤러리에 보일 사진은 `gallery_order`를 0, 1, 2 순서로 채우고 모바일 전용 대표 사진처럼 갤러리에서 제외할 사진은 비워 둡니다.

이후 `portfolio.thumbnail_photo_id`와 선택적인 `mobile_thumbnail_photo_id`에 같은 포트폴리오 사진의 `id`를 넣고, `portfolio_url`에 GitHub·미리보기 등의 링크를 등록합니다. `description`은 짧은 Markdown 소개이며 목록용 한 줄 소개는 `summary`입니다. 확인 후 `is_published=true`로 바꿉니다. 공개 항목은 약 10분마다 갱신되고 새 `slug`도 배포 없이 열립니다. 사진 행을 지우기 전에는 대표 사진 참조를 해제해야 하며, DB 행과 Storage 파일은 각각 별도로 삭제합니다.

## 문의 개통

1. Codest Web 프로젝트에는 `supabase/migrations/202609270001_inquiries_notifications.sql`을 적용했습니다. 다른 프로젝트에 배포할 때만 SQL Editor에서 적용합니다. `inquiries`에는 원문과 동의 기록, `notification`에는 발송 건을 보관합니다. 두 테이블 모두 RLS를 사용하며 공개 클라이언트 접근을 허용하지 않습니다.
2. Cloudflare Turnstile 위젯을 보이지 않음 모드로 만들고 허용 도메인을 등록합니다. Site key는 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret은 `TURNSTILE_SECRET_KEY`에 설정합니다. `SITE_URL`의 호스트와 `www` 변형만 검증에 허용하며 테스트 키는 운영에서 거부됩니다.
3. 문의 폼의 필수 동의 링크는 `/privacy`를 새 탭으로 엽니다. DB에는 동의 버전 `privacy-link-v1`이 기록됩니다. `/privacy`에는 제작문의 수집 항목과 보이지 않음 모드의 Cloudflare Turnstile 개인정보 부록 링크를 추가했고, 기존 앱 안내는 유지했습니다.
4. Vercel이 설정하는 `x-forwarded-for`의 단일 유효 IP를 문의 제한에 사용합니다. 운영에서 헤더가 없거나 잘못되면 접수를 거부합니다. 원 IP는 DB에 저장하지 않으며, `TURNSTILE_SECRET_KEY`에서 용도 구분된 HMAC 제한값으로 15분간 최대 3건을 허용합니다. 문의를 접수할 때 만료된 제한값만 지웁니다. 문의 데이터는 자동 삭제하지 않습니다. 공개 요청 본문은 16KB로 제한하고 숨김 스팸 필드도 확인합니다.
5. `SUPABASE_URL`, 서버 전용 `SUPABASE_SECRET_KEY`(`sb_secret_...`), `SITE_URL`, Turnstile 키와 유효한 `MAIL_FROM`을 설정하면 문의 폼이 활성화됩니다. 접수 시 문의와 `pending` 알림이 한 트랜잭션으로 저장됩니다. SMTP 설정이나 메일 배치 설정이 없어도 DB 접수는 가능합니다.
6. SMTP2GO에서 `codest.kr` 발신 도메인이 Verified 상태이고 SMTP 인증이 정상 동작하는 것을 확인했습니다. 다른 도메인을 쓰면 계정 화면에 제시된 CNAME을 DNS에 추가하고, Dooray 수신용 MX는 유지합니다. 인증을 확인한 `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM=kdh@codest.kr` 등을 설정합니다.

접수 요청은 Turnstile 검증 뒤 문의와 알림을 한 DB 트랜잭션에서 저장합니다. 방문자는 저장 직후 접수번호를 받고 메일은 30초 간격의 배치에서 처리됩니다. 전송 오류 시 폼 값과 제출 ID를 유지하고 새 Turnstile 토큰으로 재시도합니다. 제출 ID가 같으면 중복 저장하지 않습니다.

## 메일 배치

`NOTIFICATION_BATCH_SECRET`을 무작위 값으로 Vercel 서버 환경과 Supabase Vault에 동일하게 설정하고, `supabase/operations/schedule-notifications.sql`의 안내에 따라 Cron 작업을 등록합니다. 이 값은 30초마다 공개 Next API `POST /api/internal/notifications`를 호출하는 배치를 인증합니다. 서버는 최대 10건을 순차 처리합니다. `pending`을 원자적으로 `processing`으로 확보하고 결과를 `sent`, `failed`, `needs_review`로 기록합니다. 자동 재발송은 하지 않습니다. `processing`에 오래 남은 건이나 `needs_review`는 SMTP2GO 발송 이력을 대조한 뒤 수동 처리합니다. 스케줄 중단은 `unschedule-notifications.sql`을 실행합니다.

`notification`은 정확히 `id`, `to`, `recipt`, `type`, `payload`, `status`, `created_at`, `sent_at`의 여덟 컬럼입니다. `recipt`는 요청한 표기를 그대로 사용하며 `{ "from": { "name": "Codest", "address": "kdh@codest.kr" }, "replyTo": ["kdh@codest.kr"], "bcc": ["kdh@codest.kr"] }` 형태입니다. 문의자 이메일이 `to`, 대표 메일이 `bcc`인 메일 한 건을 발송합니다. 배열에 여러 회신·숨은 참조 주소를 넣을 수 있습니다. `to`는 독립된 TEXT로 향후 전화번호도 담을 수 있지만 현재 발송기는 이메일만 지원합니다. 현재 지원하는 `type`은 `inquiry_received.v1` 하나이며 템플릿은 `src/lib/notifications/templates/inquiry-received.v1.html.hbs`입니다. `payload`는 치환 값만 저장합니다. HTML은 Handlebars가 기본 이스케이프하며 일반 텍스트 대안도 같이 보냅니다. `sent`는 SMTP 접수이며 실제 받은편지함 도착 보장은 아닙니다.

실제 SMTP 발신·숨은 참조 수신, Dooray 답장 도착과 모바일 메일 렌더링은 인증 정보와 운영 도메인이 연결된 뒤 별도로 확인해야 합니다.
