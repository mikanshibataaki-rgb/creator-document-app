import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator OS | クリエイター向け業務アプリポータル",
  description: "案件管理、契約、制作記録、撮影準備、SNS戦略を支えるクリエイター向けOSの入口サイトです。",
};

const navItems = [
  { href: "/#apps", label: "Apps" },
  { href: "/#about", label: "About" },
  { href: "/#status", label: "Status" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <div className="site-shell">
          <header className="site-header" aria-label="サイトヘッダー">
            <Link className="brand" href="/" aria-label="Creator OS ホーム">
              <span className="brand-mark">OS</span>
              <strong>Creator OS</strong>
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
            <div>
              <strong>Creator OS</strong>
              <p>For creators, studios, and small creative teams.</p>
            </div>
            <p>Beta / Work in progress.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
