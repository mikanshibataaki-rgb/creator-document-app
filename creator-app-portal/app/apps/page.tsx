import { AppCard } from "@/components/AppCard";
import { developmentApps, publishedApps } from "@/data/apps";

export const metadata = {
  title: "Apps | Creator OS",
};

export default function AppsPage() {
  return (
    <main className="sub-page">
      <section className="page-heading">
        <p className="eyebrow">APPS</p>
        <h1>Creator OS Apps</h1>
        <p>公開中のアプリと開発中のアプリを一覧で確認できます。</p>
      </section>

      <section className="app-section">
        <div className="app-section-heading">
          <span>Live Apps</span>
          <h2>公開中アプリ</h2>
        </div>
        <div className="app-grid live-grid">
          {publishedApps.map((app) => (
            <AppCard app={app} key={app.id} />
          ))}
        </div>
      </section>

      <section className="app-section">
        <div className="app-section-heading">
          <span>Coming Soon</span>
          <h2>開発中アプリ</h2>
        </div>
        <div className="app-grid">
          {developmentApps.map((app) => (
            <AppCard app={app} key={app.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
