# Codest 회사 소개 사이트

Next.js 기반 한국어 반응형 회사 소개 사이트입니다. 랜딩, GitHub Markdown 포트폴리오, 제작문의 페이지를 제공합니다.

```bash
yarn install
cp .env.example .env.local
yarn dev
```

로컬 포트폴리오 예시를 보려면 `.env.local`에 `LOCAL_PREVIEW=true`를 지정하세요. 문의 폼은 Supabase, Cloudflare Turnstile, SMTP2GO 및 운영자가 확정한 개인정보 안내가 설정되기 전에는 입력 양식을 미리보기로 보여주고 이메일 문의 링크를 제공합니다.

운영 설정·SQL·배치 및 콘텐츠 형식은 [운영 문서](docs/operations.md)를 참고하세요. 핵심 검사는 `yarn typecheck`, `yarn lint`, `yarn build`입니다.
