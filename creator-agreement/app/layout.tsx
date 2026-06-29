import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Agreement — 契約書・発注確認書の作成支援",
  description: "クリエイターと発注者が仕事前の取り決めを整理し、契約書・発注確認書のたたき台を作成できるβ版アプリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
