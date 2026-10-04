# Codest 사이트 운영

## 실행과 배포

Node 20.9 이상에서 `yarn install`, `yarn dev`로 실행합니다. 운영 배포는 Vercel의 `codest-introduce` 프로젝트에서 `main` 브랜치를 사용합니다. Vercel 환경변수에는 `.env.example`의 항목을 설정하고 `SITE_URL=https://codest.kr`을 사용합니다. 서버 전용 Supabase·SMTP·Turnstile·웹훅 비밀값은 브라우저 코드에 넣지 않습니다.

Codest Web Supabase 프로젝트에는 다음 SQL을 순서대로 적용합니다.

1. `supabase/migrations/202609270001_inquiries_notifications.sql`
2. `supabase/migrations/202609280001_portfolio.sql`
3. `supabase/migrations/202609280002_simple_inquiry.sql`
4. `supabase/migrations/202610040001_notification_webhook.sql`

네 SQL 모두 Codest Web 프로젝트에 적용되어 있습니다. 세 번째 SQL은 문의 내용의 최소 길이를 1자로 바꾸고, 기존 30초 배치와 IP 제한 정리 작업을 해제합니다. 네 번째 SQL은 새 알림을 즉시 전달하는 트리거입니다. 문의 데이터의 자동 삭제는 하지 않습니다.

## 포트폴리오 관리

`/admin/portfolio`에서 관리자 이메일과 비밀번호로 로그인한 뒤 한 화면에서 프로젝트, 사진, 링크를 등록·수정합니다. 소개글은 서식 버튼으로 작성하지만 기존 `portfolio.description`에 Markdown으로 저장합니다. 새 프로젝트는 비공개로 시작하고, `사이트에 공개`를 켠 뒤 저장하면 공개 페이지에 나타납니다.

관리자 로그인은 Supabase Auth를 사용합니다. 관리자 계정 `kdh@codest.kr`은 **Authentication → Users**에 생성되어 있습니다. **Project Settings → API Keys**의 공개용 publishable key를 배포 환경의 `SUPABASE_PUBLISHABLE_KEY`에 설정합니다. 다른 이메일을 쓰려면 `PORTFOLIO_ADMIN_EMAIL`도 설정합니다. 공개용 키만 브라우저에 전달하고, 관리자 API는 Supabase Auth 토큰의 이메일을 매 요청마다 확인합니다.

사진은 Supabase Storage의 공개 `portfolio` 버킷으로 브라우저에서 직접 업로드합니다. 버킷은 이미 만들어져 있습니다. 서버가 관리자 권한을 확인하고 업로드 토큰을 발급하므로 Vercel 함수의 파일 크기 제한을 거치지 않습니다. 공개 버킷에는 비공개 자료를 올리지 않습니다.

## 제작문의와 알림

문의 폼은 Cloudflare Turnstile 보이지 않음 모드를 사용합니다. Turnstile 확인 후 `inquiries`와 `notification` 행을 한 트랜잭션으로 저장합니다. 방문자는 DB 저장 직후 접수번호를 받습니다. SMTP 설정이 없어도 DB 접수는 가능하지만, 메일을 보내려면 SMTP2GO 환경변수와 아래 웹훅이 필요합니다.

배치는 사용하지 않습니다. Supabase Vault에 `codest_notification_webhook`이라는 이름으로 인증키를 저장하고, Vercel Production의 `NOTIFICATION_WEBHOOK_SECRET`에 같은 값을 설정합니다. 네 번째 SQL의 `notification` INSERT 트리거는 Vault에서 키를 읽어 `https://codest.kr/api/internal/notifications`로 행 본문을 전달합니다. 넓은 권한을 추가하는 Database Webhooks 통합 설치는 필요하지 않습니다. Vercel 환경변수를 추가하거나 바꾼 뒤에는 Production을 재배포해야 합니다. 서버는 발송 내용을 다시 조회하지 않으며, 중복 발송을 막는 상태 변경과 결과 기록에만 DB 업데이트를 사용합니다.

현재 알림 유형은 `inquiry_received.v1` 하나이며, `src/lib/notifications/templates/inquiry-received.v1.html.hbs`로 메일을 만듭니다. 문의자에게 보내는 메일 한 건에 `kdh@codest.kr`을 BCC로 넣습니다. `sent`는 SMTP 서버 접수를 뜻하고 실제 받은편지함 도착을 보장하지 않습니다. 요청 실패 시 행은 `pending`으로 남을 수 있으므로 `net._http_response`의 최근 오류와 `notification.status`를 확인합니다. 트리거를 설치하기 전에 생성된 `pending` 행은 자동 발송되지 않습니다. 자동 재발송은 설정하지 않았습니다.
