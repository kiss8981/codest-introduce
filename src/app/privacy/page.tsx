import Markdown from "@/app/components/Markdown";
import { shell } from "@/components/site/styles";

const text = `
# 개인정보처리방침
#### 코디스트(Codest)에서는 프로그램 운영시 수집된 디바이스 및 사용자의 개인정보보호를 위해 아래와 같이 동의받고 있으며, 정보보호를 위해 노력하고 있습니다.

## 웹사이트 제작문의
제작문의 양식을 통해 이름, 전화번호, 이메일, 제작내용 및 동의 시각을 수집합니다. 문의 확인과 회신을 위해 해당 정보를 Supabase에 저장하고, 접수 확인 메일을 SMTP2GO로 발송합니다. 접수 메일은 코디스트 담당자에게 숨은참조로도 전달됩니다. 문의 정보의 열람·정정을 원하시면 [kdh@codest.kr](mailto:kdh@codest.kr)로 연락해 주세요.

문의 양식의 스팸과 자동 제출을 막기 위해 Cloudflare Turnstile을 사용합니다. Turnstile은 방문자의 IP 주소, 브라우저 정보 등의 신호를 처리할 수 있습니다. 자세한 내용은 [Cloudflare Turnstile 개인정보 부록](https://www.cloudflare.com/turnstile-privacy-policy/)을 확인해 주세요.

## 기사 위치 공유 앱

## 개인정보 처리의 목적
다음 목적을 위하여 개인정보를 처리하고 있으며, 다음 목적 이외의 용도로는 사용하지 않습니다. 
- 서비스 제공

## 수집하는 개인정보의 항목
디바이스 및 맞춤광고를 위해 아래와 같은 개인정보를 수집하고 있습니다.
- 수집항목 : 디바이스 정보, 실시간 위치 정보
- 개인정보 수집방법 : 기사 위치 공유 앱

## 개인정보의 보유 및 이용기간
앱에서 개인정보 수집 및 이용목적이 달성된 후에는 외부에 절대 노출되지 않으며, 사용 후 학교 내부 규정에 따라 폐기 조치됩니다.

## 동의 거부 권리 및 동의거부에 따른 제한사항
위 정보 수집 및 이용에 대하여 동의를 거부할 권리가 있습니다. 다만 동의를 거부할 경우 일부 프로그램 이용에 대하여 제한될 수 있습니다.

## 개인정보 처리방침 변경 시 고지 의무
개인정보 처리방침의 변경이 있는 경우 시행 7일 전 사전에 이용자에게 고지합니다.

## 수집한 개인정보의 위탁

| 업무 위탁업체 | 위탁 개인정보 | 업무 위탁 목적 |
|------------|-----------|-------------|
| Google, Inc. (Google Analytics, Google Optimize) | 인터넷 프로토콜(IP), 브라우저/기기 정보, 접속한 페이지 등 | 통계 작성 및 학술 연구, 유저 타케팅 및 A/B 테스트 |
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
