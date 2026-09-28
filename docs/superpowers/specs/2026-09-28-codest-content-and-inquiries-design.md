# Codest 콘텐츠와 문의 운영 설계

작성일: 2026-09-28
상태: 사용자 수정 의견 반영, 재검토 대기. 구현 계획은 별도 검토 대상.

## 목적과 범위

웹·앱 제작을 의뢰하려는 방문자가 한국어 회사 소개와 작업 사례를 보고 문의를 남긴다. 방문자는 모바일·태블릿·데스크톱에서 같은 정보를 읽고, 운영자는 별도 관리자 화면 없이 Supabase 대시보드에서 문의와 포트폴리오를 관리한다. 기존의 흰 화면 중심 구성과 Codest 로고 색상, 빈 이미지 영역을 유지한다. 이 문서는 기존 GitHub Markdown 포트폴리오를 Supabase로 옮기고 문의 DB 접수를 개통하는 변경만 다룬다.

Supabase 프로젝트는 사용자가 직접 만들고 있고 사이트는 Vercel에 배포한다. 사이트 코드에 비밀값을 넣지 않으며, 실제 연결과 공개 접수에는 프로젝트 URL·서버 키와 Turnstile 설정이 필요하다. SMTP2GO와 배치 설정은 확인 메일 발송에 필요하지만 DB 접수를 막지는 않는다.

## 랜딩과 공통 화면

- “만들고 싶은 것이 있다면, 그 이야기부터 시작해요.” 영역은 제목과 짧은 보조 문장 하나만 남겨 긴 두 열 설명을 줄인다. 보조 문장은 “막연한 생각도 괜찮습니다. 함께 구체화해요.”로 한다.
- “하나씩 이야기하고, 함께 완성합니다.” 설명은 다음 문장 경계에서 줄을 나눈다: “막연한 아이디어도 괜찮습니다.” / “만들 범위와 일정을 정리한 뒤 화면과 기능을 구현하고,” / “실제 사용을 앞두고 함께 확인합니다.” 좁은 화면에서는 강제 가로 넘침 없이 자연스럽게 감긴다.
- 푸터의 `kdh@codest.kr` 링크를 삭제한다. 문의 페이지의 연락 수단과 메일 발송 주소는 유지한다.

## 포트폴리오 데이터

Storage에는 공개 가능한 이미지 파일만 저장한다. 공개 `portfolio` 버킷 하나를 사용하며 업로드는 Supabase Storage 대시보드에서 한다. DB에 이미지 바이너리를 저장하지 않는다. Table Editor에서 아래 세 테이블의 행을 등록·수정한다. SQL 컬럼명은 snake_case를 사용한다.

공개 버킷의 파일은 포트폴리오가 비공개여도 파일 주소를 아는 사람이 열 수 있으므로 비공개 자료를 올리지 않는다.

| 테이블 | 컬럼 | 의미 |
| --- | --- | --- |
| `portfolio` | `id`, `slug`(고유), `name`, `summary`, `description`, `category`, `stack`, `started_at`, `ended_at`, `is_maintained`, `is_published`, `featured`, `sort_order`, `thumbnail_photo_id`, `mobile_thumbnail_photo_id`, `created_at`, `updated_at` | `description`은 짧은 Markdown 소개, `summary`는 한 줄 소개. `is_maintained`는 현재 Codest가 관리 중이라는 뜻이며 서비스의 운영 상태와 구분한다. 날짜는 날짜형이고 종료일은 비울 수 있다. |
| `photo_map` | `id`, `portfolio_id`, `storage_key`(고유), `filename`, `file_size_bytes`, `mime_type`, `alt_text`, `gallery_order`, `created_at` | 사진 한 행이 하나의 포트폴리오를 가리킨다. `gallery_order`가 있는 사진만 그 순서대로 상세 갤러리에 나오며, 모바일 전용 썸네일처럼 갤러리에서 제외할 사진은 이 값을 비운다. |
| `portfolio_url` | `id`, `portfolio_id`, `type`, `label`, `url`, `sort_order` | GitHub·미리보기 등 외부 링크를 순서대로 보인다. `type`은 향후 종류를 추가할 수 있는 문자열이며 `label`은 선택이다. 공개 링크는 HTTPS 주소로 제한한다. |

`portfolio.thumbnail_photo_id`와 `mobile_thumbnail_photo_id`는 반드시 같은 포트폴리오의 `photo_map` 행을 가리키거나 비어 있어야 한다. 모바일 썸네일이 없으면 일반 썸네일을 쓴다. 기존 목록의 분류·기술 목록과 메인 화면의 추천 항목을 유지하려고 `category`, `stack`, `featured`를 포함한다. `slug`는 상세 URL에 필요하고 `is_published`는 작성 중인 항목을 숨긴다. `sort_order`는 등록 날짜와 관계없이 목록 배치를 정한다. 공개 테이블은 사이트 서버만 조회하고 방문자가 수정할 수 없게 한다.

`ended_at`이 있으면 `started_at`보다 빠를 수 없고 `file_size_bytes`는 음수가 될 수 없다. 대표 이미지와 갤러리 사진은 없을 수 있다. 공개 전에는 `photo_map.storage_key`가 공개 버킷의 실제 객체를 가리키는지 대시보드에서 확인한다.

운영자는 비공개 포트폴리오 행을 먼저 만들고, Storage에 이미지를 올린 뒤 `photo_map`에 경로·파일명·크기와 포트폴리오 ID를 입력한다. 이어 대표 이미지와 링크를 연결하고 최종 확인 후 공개한다. 파일을 삭제할 때는 Storage 객체와 DB 행을 각각 정리한다. DB 행 삭제만으로 Storage 파일이 없어지지는 않는다.

## 포트폴리오 표시 흐름

Next 서버는 공개 포트폴리오와 연결된 사진·링크를 Supabase에서 읽어 약 10분 주기로 재검증한다. 메인에는 `featured` 공개 항목, 목록에는 모든 공개 항목, 상세에는 `slug`와 일치하는 공개 항목만 보인다. 상세는 제목·한 줄 소개 다음에 `photo_map` 갤러리를 먼저 보여주고, 그 아래에 간단한 Markdown 소개와 외부 링크를 둔다. 모바일·데스크톱 썸네일은 화면 폭에 따라 선택한다. 이미지가 없으면 기존의 빈 이미지 영역을 유지한다.

Markdown은 기존 `react-markdown`/GFM 렌더러를 사용하며 임의 HTML이나 스크립트를 실행하지 않는다. DB 조회 실패는 빈 포트폴리오로 표시하지 않고 오류로 다룬다. 아직 공개 항목이 없는 경우에만 준비 중 화면을 보인다. 새 `slug`의 상세 주소와 사이트맵도 배포 없이 재검증 뒤 반영한다. GitHub Markdown 로더·관련 환경변수·이미지 프록시를 제거하고, 운영에서 로컬 예제 콘텐츠로 조용히 대체하지 않는다.

개발 환경에서 Supabase 설정이 아직 없으면 빈 상태로 화면을 확인할 수 있게 한다. 운영 환경에서 서버 연결 설정이 없거나 조회가 실패하면 설정·조회 오류로 다뤄 빈 포트폴리오처럼 보이지 않게 한다.

## 문의 저장과 메일

기존 입력 항목과 서버 검증, Cloudflare Turnstile, 중복 제출 ID, 15분당 제출 제한을 유지한다. Vercel이 덮어쓰는 `x-forwarded-for`에서 클라이언트 IP를 읽고, 기존 `TURNSTILE_SECRET_KEY`에서 용도를 구분해 생성한 해시 키로 IP 제한값을 만든다. 운영 환경에서 신뢰할 수 있는 Vercel IP 헤더가 없으면 접수를 거부한다. Turnstile의 응답 호스트명은 `SITE_URL`의 도메인과 그 `www` 변형을 기준으로 확인하고 `action=inquiry`도 검사한다. 검증이 끝나면 기존 `submit_inquiry` 함수가 `inquiries`와 범용 `notification` 대기 건을 한 트랜잭션에서 저장한다. DB 저장에 실패하면 성공 안내를 하지 않고 폼 입력을 보존한다. 접수 화면은 DB 저장 직후 완료를 알리되, 메일이 이미 발송되었다고 말하지 않는다.

수동 개통 플래그 `CONTACT_FORM_ENABLED`를 없앤다. Supabase·Turnstile과 유효한 발신 주소 `MAIL_FROM`이 갖춰지면 문의와 알림을 저장할 수 있다. SMTP2GO와 배치가 준비되기 전에도 `notification`은 `pending`으로 남는다. 이후 기존 Nodemailer/Handlebars 배치가 이를 발송한다. 접수자에게 확인 메일 한 통을 보내고 담당자 `kdh@codest.kr`을 BCC로 넣는 기존 계약을 유지한다. 문의·알림 테이블은 공개 조회를 허용하지 않는다.

폼에는 개인정보 안내 전문을 복사하지 않고 “개인정보처리방침을 확인하고 동의합니다” 체크박스만 둔다. `/privacy` 링크는 새 탭에서 열고, 동의가 확인된 문의에 코드 상수 `privacy-link-v1`을 기존 `consent_version`으로 기록한다. `CONTACT_POLICY_TEXT`와 `CONTACT_POLICY_VERSION` 환경변수는 제거한다. 현재 `/privacy` 페이지는 이전 앱용 내용이지만 사용자의 요청에 따라 이 작업에서 내용이나 보유·삭제 정책을 수정하지 않는다. 문의 자동 삭제도 추가하지 않는다. 프로젝트 키와 Turnstile secret, SMTP 자격 증명은 서버 환경변수에만 둔다.

## 운영과 확인

새 Supabase 프로젝트에 기존 문의·알림 SQL과 포트폴리오 SQL을 순서대로 적용하고 공개 이미지 버킷을 만든다. 포트폴리오 조회에 필요한 서버 설정과 문의 설정을 `.env.example` 및 운영 문서에 적는다. 실제 키는 저장소에 커밋하지 않는다. SMTP2GO 도메인 인증과 배치 스케줄은 메일 개통 단계에서 연결한다.

환경변수에서 GitHub 콘텐츠용 `GITHUB_*`, `PORTFOLIO_DIR`, `LOCAL_PREVIEW`와 수동 개통용 `CONTACT_FORM_ENABLED`, `CONTACT_POLICY_*`, `TURNSTILE_ALLOWED_HOSTNAMES`, `TRUSTED_CLIENT_IP_HEADER`, `INQUIRY_RATE_LIMIT_SECRET`을 제거한다. `NOTIFICATION_BATCH_SECRET`은 외부에서 접근 가능한 메일 배치 API를 Supabase Cron만 호출하게 하는 인증값이라 유지하며, Vercel 서버와 Supabase Vault에 같은 값을 설정한다. Vercel Cron은 선택하지 않는다. 기존 5분 간격 요구에 비해 Hobby 플랜의 최소 간격이 하루이기 때문이다. 문의 데이터의 자동 보관기간·삭제 작업은 추가하지 않는다.

확인은 타입 검사·린트·빌드, 공개/비공개 포트폴리오 표시와 이미지 없는 상태, 문의 저장 실패 시 폼 보존, 실제 프로젝트 연결 후 1건의 접수·대기 알림 확인에 한정한다. 세밀한 중복 테스트는 추가하지 않는다. Supabase Free는 활동량이 적으면 일시 중지될 수 있으므로 실제 운영 요금제 선택은 프로젝트 소유자가 결정한다.
