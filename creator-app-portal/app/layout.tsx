import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator OS | クリエイター業務アプリ集",
  description: "クリエイター、映像制作者、フリーランス向けの業務支援アプリをまとめた入口サイトです。",
};

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/apps", label: "アプリ一覧" },
  { href: "/feedback", label: "フィードバック" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <div className="site-shell">
          <header className="site-header" aria-label="サイトヘッダー">
            <Link className="brand" href="/" aria-label="Creator OS ホーム">
              <span className="brand-mark">C</span>
              <span>
                <strong>Creator OS</strong>
                <small>業務アプリ集</small>
              </span>
            </Link>
            <nav className="nav-links" aria-label="主要ナビゲーション">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
          <footer className="site-footer">
            <p>Creator OS beta. クリエイターの業務を軽くするための入口です。</p>
            <p>Designed for creators, studios, and small production teams.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
