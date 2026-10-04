import Markdown from "@/components/site/Markdown";
import { shell } from "@/components/site/styles";

const text = `
# 개인정보처리방침
#### 코디스트(Codest)에서는 프로그램 운영시 수집된 디바이스 및 사용자의 개인정보보호를 위해 아래와 같이 동의받고 있으며, 정보보호를 위해 노력하고 있습니다.

## 개인정보 처리의 목적
다음 목적을 위하여 개인정보를 처리하고 있으며, 다음 목적 이외의 용도로는 사용하지 않습니다. 
- 서비스 제공

## 수집하는 개인정보의 항목
디바이스 및 맞춤광고를 위해 아래와 같은 개인정보를 수집하고 있습니다.
### 기사 위치 공유 앱
- 수집항목 : 디바이스 정보, 실시간 위치 정보
### 제작문의
- 수집항목 : 이름, 이메일, 전화번호, 문의 내용

## 개인정보의 보유 및 이용기간
앱에서 개인정보 수집 및 이용목적이 달성된 후에는 외부에 절대 노출되지 않으며, 사용 후 학교 내부 규정에 따라 폐기 조치됩니다.

## 동의 거부 권리 및 동의거부에 따른 제한사항
위 정보 수집 및 이용에 대하여 동의를 거부할 권리가 있습니다. 다만 동의를 거부할 경우 일부 프로그램 이용에 대하여 제한될 수 있습니다.

## 개인정보 처리방침 변경 시 고지 의무
개인정보 처리방침의 변경이 있는 경우 시행 7일 전 사전에 이용자에게 고지합니다.

## 수집한 개인정보의 위탁

| 업무 위탁업체 | 위탁 개인정보 | 업무 위탁 목적 | 비고
|------------|-----------|-------------|-------------|
| Google, Inc. (Google Analytics, Google Optimize) | 인터넷 프로토콜(IP), 브라우저/기기 정보, 접속한 페이지 등 | 통계 작성 및 학술 연구, 유저 타케팅 및 A/B 테스트 |
| Cloudflare, Inc. (Cloudflare Turnstile) | 인터넷 프로토콜(IP), 브라우저/기기 정보, 접속한 페이지 등 | 스팸 및 자동 제출 방지 | [Cloudflare Turnstile 개인정보 부록](https://www.cloudflare.com/turnstile-privacy-policy/)
| Supabase, Inc. (Supabase) | 이메일, 이름, 전화번호, 문의 내용 | 제작문의 접수 및 알림 전송 |
`;

export default function Privacy() {
  return (
    <main className={`${shell} min-h-screen py-20 md:py-28`}>
      <div className="mx-auto max-w-[900px]">
        <Markdown markdown={text} />
      </div>
    </main>
  );
}
