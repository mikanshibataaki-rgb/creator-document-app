import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "制作日誌 | Creator OS",
  description: "制作現場の言葉、写真、映像を気軽に残す制作アーカイブ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
