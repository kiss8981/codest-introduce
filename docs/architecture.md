# 코드 구조

`src/app`에는 페이지와 얇은 API 라우트만 둡니다. 요청 검증·업무 흐름·DB 접근은 `src/lib/<기능>`으로 옮깁니다. 화면은 `src/components/<기능>`에 두고, 여러 기능이 공유하는 화면 요소만 `src/components/site`에 둡니다.

| 위치                                                                  | 책임                                             |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| `src/lib/<기능>/schema.ts`                                            | 입력 형식과 타입                                 |
| `src/lib/<기능>/service.ts`                                           | 검증된 동작의 순서와 결과 처리                   |
| `src/lib/<기능>/repository.ts`                                        | Supabase 테이블·RPC 접근                         |
| `src/lib/<기능>/<연동>.ts`                                            | Turnstile, SMTP, 템플릿 등 해당 기능의 외부 연동 |
| `src/lib/auth`, `src/lib/uploads`, `src/lib/http.ts`, `src/lib/db.ts` | 여러 기능이 쓰는 인증·업로드·HTTP·DB 도구        |

포트폴리오는 공개 조회와 관리자 작업이 달라 `public`과 `admin`을 분리합니다. 공개 조회는 `public/repository.ts`, 관리 작업은 `admin/service.ts`와 `admin/repository.ts`를 사용합니다. 사진은 `admin/photos/service.ts`에서 업로드·삭제를 조율하고 `admin/photos/repository.ts`에서 사진 레코드를 다룹니다. 포트폴리오 소개는 `description`에 Markdown으로 저장하고, 편집기에서만 서식 버튼을 제공합니다.

관리자 UI는 인증 화면(`PortfolioAdminApp`), 목록과 저장 흐름(`PortfolioWorkspace`), 폼 골격(`PortfolioForm`), 사진·링크·추가 정보 섹션으로 나눴습니다. 문의 UI와 포트폴리오 UI는 각 기능 폴더에 두며, `SiteFrame`과 공통 스타일만 `site`에 둡니다.
