import { AppCard } from "@/components/AppCard";
import { portalApps } from "@/data/apps";

export const metadata = {
  title: "アプリ一覧 | Creator OS",
};

export default function AppsPage() {
  return (
    <main className="sub-page">
      <section className="page-heading">
        <p className="eyebrow">APP LIBRARY</p>
        <h1>アプリ一覧</h1>
        <p>制作の仕事で使う業務アプリをまとめています。目的に近いカードを選んでください。</p>
      </section>
      <section className="app-grid full-grid" aria-label="掲載アプリ">
        {portalApps.map((app) => (
          <AppCard app={app} key={app.id} />
        ))}
      </section>
      <section className="info-panel">
        <h2>迷ったとき</h2>
        <p>まずは「案件管理」から開くと、聞き取り、見積、確認書類までの流れをまとめて確認できます。</p>
      </section>
    </main>
  );
}
