import type { Metadata } from "next";
import { Nanum_Gothic } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./github-markdown.css";

const nanum_Gothic = Nanum_Gothic({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "코디스트",
  description: "최신 기술을 바탕으로 앱, 웹 서비스를 제작합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={nanum_Gothic.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
