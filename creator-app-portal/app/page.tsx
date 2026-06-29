import { AppCard } from "@/components/AppCard";
import { developmentApps, publishedApps, portalApps } from "@/data/apps";

const statusItems = [
  { label: "公開中", value: "2", detail: "すぐに開けるアプリ" },
  { label: "開発中", value: "3", detail: "近日公開予定のアプリ" },
  { label: "対象", value: "Creators", detail: "個人・スタジオ・小規模チーム" },
];

export default function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">CREATOR WORKFLOW PORTAL</p>
          <h1>クリエイターの仕事を、もっと整理しやすく。</h1>
          <p className="hero-lead">
            案件管理、契約、制作記録、撮影準備、SNS戦略まで。
            <br />
            クリエイターの現場で起きる面倒な作業を、ひとつずつアプリで支えるための入口です。
          </p>
          <p className="hero-note">
            現在はベータ版・開発中のアプリを含みます。実際の業務で使いながら改善していくクリエイター向けOSです。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#live-apps">
              公開中のアプリを見る
            </a>
            <a className="button button-secondary" href="#development-apps">
              開発中のアプリを見る
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-label="Creator OS のステータス概要">
          <div className="visual-window">
            <div className="visual-header">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="visual-title">
              <span>Creator OS</span>
              <strong>Apps Gateway</strong>
            </div>
            <div className="visual-preview">
              <img src="/previews/project-manager.jpg" alt="クリエーター案件マネージャーの画面プレビュー" />
            </div>
            <div className="visual-grid">
              {portalApps.map((app) => (
                <div className="visual-tile" key={app.id}>
                  <span>{app.order}</span>
                  <strong>{app.category}</strong>
                  <small>{app.status === "published" ? "Live" : "Soon"}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="apps">
        <div className="section-heading">
          <p className="eyebrow">APPS</p>
          <h2>必要な業務アプリへ、ここから移動できます。</h2>
          <p>公開中のアプリは外部URLで開きます。開発中のアプリは準備が整い次第、順次追加していきます。</p>
        </div>

        <div className="app-section" id="live-apps">
          <div className="app-section-heading">
            <span>Live Apps</span>
            <h3>公開中アプリ</h3>
          </div>
          <div className="app-grid live-grid">
            {publishedApps.map((app) => (
              <AppCard app={app} key={app.id} />
            ))}
          </div>
        </div>

        <div className="app-section" id="development-apps">
          <div className="app-section-heading">
            <span>Coming Soon</span>
            <h3>開発中アプリ</h3>
          </div>
          <div className="app-grid">
            {developmentApps.map((app) => (
              <AppCard app={app} key={app.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-block about-section" id="about">
        <div>
          <p className="eyebrow">ABOUT</p>
          <h2>制作の周辺業務を、ひとつずつ軽くする。</h2>
        </div>
        <p>
          Creator OSは、クリエイターや小規模チームが日々の制作に集中しやすくなるよう、
          案件・契約・記録・準備・発信の入口をまとめるポータルです。
        </p>
      </section>

      <section className="section-block status-section" id="status">
        <div className="section-heading compact-heading">
          <p className="eyebrow">STATUS</p>
          <h2>現在の公開状況</h2>
        </div>
        <div className="status-grid">
          {statusItems.map((item) => (
            <div className="status-panel" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
