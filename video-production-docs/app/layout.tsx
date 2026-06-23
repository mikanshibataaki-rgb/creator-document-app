import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "制作案件ドキュメント",
  description: "映像制作の案件シート・見積書・確認書・請求書を一元作成",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
