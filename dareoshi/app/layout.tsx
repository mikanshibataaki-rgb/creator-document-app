import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "だれおし｜誰も教えてくれなかったのに",
  description: "大人のお金と手続きを、必要になる前にやさしく知らせるアプリ",
  applicationName: "だれおし",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "だれおし",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10152B",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
