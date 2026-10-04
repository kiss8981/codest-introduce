# Codest 사이트 운영

## 실행과 배포

Node 20.9 이상에서 `yarn install`, `yarn dev`로 실행합니다. 운영 배포는 Vercel의 `codest-introduce` 프로젝트에서 `main` 브랜치를 사용합니다. Vercel 환경변수에는 `.env.example`의 항목을 설정하고 `SITE_URL=https://codest.kr`을 사용합니다. 서버 전용 Supabase·SMTP·Turnstile·웹훅 비밀값은 브라우저 코드에 넣지 않습니다.

Codest Web Supabase 프로젝트에는 다음 SQL을 순서대로 적용합니다.

1. `supabase/migrations/202609270001_inquiries_notifications.sql`
2. `supabase/migrations/202609280001_portfolio.sql`
3. `supabase/migrations/202609280002_simple_inquiry.sql`

세 SQL은 모두 Codest Web 프로젝트에 적용되어 있습니다. 세 번째 SQL은 문의 내용의 최소 길이를 1자로 바꾸고, 기존 30초 배치와 IP 제한 정리 작업을 해제합니다. 문의 데이터의 자동 삭제는 하지 않습니다.

## 포트폴리오 관리

`/admin/portfolio`에서 관리자 이메일과 비밀번호로 로그인한 뒤 한 화면에서 프로젝트, 사진, 링크를 등록·수정합니다. 소개글은 서식 버튼으로 작성하지만 기존 `portfolio.description`에 Markdown으로 저장합니다. 새 프로젝트는 비공개로 시작하고, `사이트에 공개`를 켠 뒤 저장하면 공개 페이지에 나타납니다.

관리자 로그인은 Supabase Auth를 사용합니다. 관리자 계정 `kdh@codest.kr`은 **Authentication → Users**에 생성되어 있습니다. **Project Settings → API Keys**의 공개용 publishable key를 배포 환경의 `SUPABASE_PUBLISHABLE_KEY`에 설정합니다. 다른 이메일을 쓰려면 `PORTFOLIO_ADMIN_EMAIL`도 설정합니다. 공개용 키만 브라우저에 전달하고, 관리자 API는 Supabase Auth 토큰의 이메일을 매 요청마다 확인합니다.

사진은 Supabase Storage의 공개 `portfolio` 버킷으로 브라우저에서 직접 업로드합니다. 버킷은 이미 만들어져 있습니다. 서버가 관리자 권한을 확인하고 업로드 토큰을 발급하므로 Vercel 함수의 파일 크기 제한을 거치지 않습니다. 공개 버킷에는 비공개 자료를 올리지 않습니다.

## 제작문의와 알림

문의 폼은 Cloudflare Turnstile 보이지 않음 모드를 사용합니다. Turnstile 확인 후 `inquiries`와 `notification` 행을 한 트랜잭션으로 저장합니다. 방문자는 DB 저장 직후 접수번호를 받습니다. SMTP 설정이 없어도 DB 접수는 가능하지만, 메일을 보내려면 SMTP2GO 환경변수와 아래 웹훅이 필요합니다.

배치는 사용하지 않습니다. Supabase **Database → Webhooks**에서 `public.notification`의 **INSERT** 이벤트를 등록합니다. URL은 배포된 `https://codest.kr/api/internal/notifications`, Method는 `POST`, 헤더는 `Content-Type: application/json`과 `Authorization: Bearer <NOTIFICATION_WEBHOOK_SECRET>`입니다. Vercel의 `NOTIFICATION_WEBHOOK_SECRET`과 웹훅 헤더의 값은 동일한 긴 무작위 문자열로 설정합니다. 웹훅은 삽입된 알림 행을 본문으로 전달하므로 서버가 발송 내용을 다시 조회하지 않습니다. 중복 발송을 막는 상태 변경과 결과 기록에는 DB 업데이트가 필요합니다.

현재 알림 유형은 `inquiry_received.v1` 하나이며, `src/lib/notifications/templates/inquiry-received.v1.html.hbs`로 메일을 만듭니다. 문의자에게 보내는 메일 한 건에 `kdh@codest.kr`을 BCC로 넣습니다. `sent`는 SMTP 서버 접수를 뜻하고 실제 받은편지함 도착을 보장하지 않습니다. 웹훅 호출 자체가 실패하면 행은 `pending`으로 남을 수 있으므로 Supabase의 Webhook 실행 이력과 `notification.status`를 확인합니다. 자동 재발송은 설정하지 않았습니다.
