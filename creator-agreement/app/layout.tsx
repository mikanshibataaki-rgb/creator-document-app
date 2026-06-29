import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Agreement — 仕事の確認事項",
  description: "クリエイターの口約束を、分かりやすい合意へ整える画面試作",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
