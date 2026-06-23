import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNS司令室 Ver.1",
  description: "岐阜スタジオ専用SNS投稿管理アプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
