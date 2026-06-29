import Link from "next/link";
import { AppCard } from "@/components/AppCard";
import { availableApps, plannedApps, portalApps } from "@/data/apps";

const principles = [
  "必要なアプリへすぐ入れる",
  "書類・契約・記録をひとつの入口へ",
  "現場でもスマホで確認しやすい",
];

export default function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">CREATOR BUSINESS APP PORTAL</p>
          <h1>クリエイターの仕事を、ひとつの入口から。</h1>
          <p className="hero-lead">
            案件、契約、日誌、スケジュール、単価設計まで。制作の面倒な事務作業を、迷わず開ける
            <strong> クリエイター業務OS </strong>
            として育てていきます。
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/apps">
              アプリ一覧を見る
            </Link>
            <Link className="button secondary" href="/feedback">
              意見を送る
            </Link>
          </div>
          <div className="beta-note">
            <strong>Beta</strong>
            <span>一部の業務アプリを先行公開中です。使いやすさを確認しながら、少しずつ整えていきます。</span>
          </div>
        </div>
        <div className="hero-panel" aria-label="Creator OS の概要">
          <div className="panel-header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="panel-title-row">
            <div>
              <small>Today</small>
              <strong>Creator OS</strong>
            </div>
            <span className="live-badge">BETA</span>
          </div>
          <div className="preview-frame">
            <img src="/previews/project-manager.jpg" alt="クリエイター案件マネージャーの画面プレビュー" />
          </div>
          <div className="os-grid">
            {portalApps.slice(0, 5).map((app, index) => (
              <div className="os-tile" key={app.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{app.shortName}</strong>
                <small>{app.status}</small>
              </div>
            ))}
          </div>
          <div className="signal-row">
            {principles.map((item) => (
              <div key={item}>
                <span className="signal-dot"></span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">AVAILABLE NOW</p>
          <h2>まず使えるアプリ</h2>
          <p>案件、契約、記録など、制作の仕事で使うアプリをここから選べます。</p>
        </div>
        <div className="app-grid">
          {availableApps.map((app, index) => (
            <AppCard app={app} featured={index === 0} key={app.id} />
          ))}
        </div>
      </section>

      <section className="section-block split-section">
        <div>
          <p className="eyebrow">COMING NEXT</p>
          <h2>次に広がる業務サポート</h2>
          <p>
            準備中のアプリも、制作の予定管理や単価設計など、日々の不安を減らす機能として順次整えていきます。
          </p>
        </div>
        <div className="mini-list">
          {plannedApps.map((app) => (
            <div className="mini-item" key={app.id}>
              <span>{app.status}</span>
              <strong>{app.name}</strong>
              <p>{app.bestFor}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <p className="eyebrow">START</p>
          <h2>目的に合わせて、仕事の入口を選ぶ。</h2>
          <p>案件を整理したい、契約内容を残したい、現場の記録をつけたい。今の作業に近いアプリから開けます。</p>
        </div>
        <Link className="button primary" href="/apps">
          アプリを選ぶ
        </Link>
      </section>
    </main>
  );
}
