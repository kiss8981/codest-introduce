# Codest 회사 소개 사이트

Next.js·Tailwind CSS 기반 한국어 반응형 회사 소개 사이트입니다. 랜딩, Supabase 포트폴리오, 제작문의 페이지를 제공합니다.

```bash
yarn install
cp .env.example .env.local
yarn dev
```

포트폴리오는 Supabase 대시보드에서 관리합니다. 문의 폼은 Supabase와 Cloudflare Turnstile 설정이 준비되면 활성화됩니다. SMTP 설정은 문의 접수와 별개이며 확인 메일 발송에 필요합니다.

운영 설정·SQL·배치 및 콘텐츠 형식은 [운영 문서](docs/operations.md)를 참고하세요. 코드 정리는 `yarn format`, 핵심 검사는 `yarn format:check`, `yarn typecheck`, `yarn lint`, `yarn build`입니다.
