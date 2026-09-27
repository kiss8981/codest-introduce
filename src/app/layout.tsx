import type { Metadata } from "next";
import "./globals.css";
import "./github-markdown.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://codest.kr"),
  title: { default: "Codest — 웹·앱 개발", template: "%s | Codest" },
  description: "아이디어를 실제로 쓰이는 웹·앱 서비스로 만듭니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
