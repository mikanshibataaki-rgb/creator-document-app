"use client";

import { useEffect } from "react";

const roadmapSections = [
  {
    title: "職種ごとの案件管理",
    text: "職種を選ぶだけで、その仕事に合った聞き取り項目・見積候補・確認書・納品書を自動で切り替えます。",
    items: ["映像・写真", "デザイン・イラスト", "Web・ライティング", "音楽・ナレーション", "ヘアメイク・スタイリング", "SNS・イベント"],
  },
  {
    title: "AIによる案件整理",
    text: "会議の議事録や打ち合わせ内容を解析し、案件情報と追加確認事項を候補として整理します。",
    items: ["聞き取り内容", "案件シート", "見積候補", "抜け漏れ確認"],
  },
  {
    title: "AIによる見積もり支援",
    text: "過去案件や職種別条件を参考に、必要な明細や見落としやすい費用を提案します。",
    items: ["見積候補", "必要項目", "相場の参考", "請求漏れ警告"],
  },
  {
    title: "Googleサービスとの連携",
    text: "Googleアカウントを起点に、スケジュールや顧客・請求情報を日常のツールへつなげます。",
    items: ["撮影日をカレンダーへ登録", "顧客一覧をシートへ保存", "請求一覧を自動作成"],
  },
  {
    title: "保存・複製・テンプレート",
    text: "一度作った書類や案件設定を再利用し、毎回ゼロから入力する手間を減らします。",
    items: ["クラウド保存", "書類の複製・編集", "案件への流用", "会社別テンプレート"],
  },
  {
    title: "チームとクライアント共有",
    text: "制作スタッフ間の共同管理と、クライアント自身が入力できる聞き取りフォームを目指します。",
    items: ["チーム共有", "権限管理", "入力URL共有", "チャット・ファイル共有"],
  },
  {
    title: "ポートフォリオ・売上分析",
    text: "案件の権利条件と数字を蓄積し、実績管理と経営判断につなげます。",
    items: ["実績公開可否の検索", "月別・職種別売上", "顧客ランキング", "利益率・リピート率"],
  },
  {
    title: "セキュリティと外部連携",
    text: "仕事の大切な情報を安全に扱い、普段利用する契約・会計サービスとも連携できる設計を進めます。",
    items: ["Googleログイン", "暗号化・バックアップ", "電子契約連携", "freee・マネーフォワード連携"],
  },
];

const futureIdeas = [
  "AIによる契約書チェック・契約書自動作成",
  "職種・地域・案件規模別の相場データベース",
  "インボイス・源泉徴収・消費税の自動計算",
  "契約漏れ・見積漏れ・請求漏れのAI警告",
  "案件ごとの利益率・原価率の可視化",
  "複数AIを活用した業務支援",
  "案件終了後の振り返り・ナレッジ蓄積",
];

export function RoadmapOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950 text-white">
    <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <div><p className="text-[10px] font-bold tracking-[.24em] text-brand">CREATOR OS ROADMAP</p><p className="mt-0.5 text-sm font-bold">今後の展望</p></div>
        <button type="button" onClick={onClose} className="min-h-10 rounded-full border border-white/20 px-4 text-sm font-bold transition hover:bg-white hover:text-black">アプリへ戻る</button>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-16">
      <section className="max-w-4xl">
        <p className="text-xs font-bold tracking-[.22em] text-brand">VISION</p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">クリエイターの仕事を、<br className="hidden sm:block" />もっとシンプルに。</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-neutral-300 sm:text-base">
          <p>このアプリは、見積書や請求書を作るだけのサービスではありません。</p>
          <p>クリエイターが本来集中すべき「作品づくり」に専念できるよう、面倒な事務作業や案件管理を支援するプラットフォームを目指しています。</p>
          <p>現在も継続的に開発を進めており、聞き取りから売上管理までを一つにつなぐ機能を段階的に追加していきます。</p>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/15 pb-4"><div><p className="text-xs font-bold tracking-[.18em] text-brand">IN DEVELOPMENT</p><h2 className="mt-2 text-2xl font-bold">現在開発中・追加予定</h2></div><span className="text-xs text-neutral-500">β版から順次拡張</span></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roadmapSections.map((section, index) => <article key={section.title} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
            <span className="text-xs font-bold text-brand">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-lg font-bold">{section.title}</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-400">{section.text}</p>
            <ul className="mt-4 space-y-2 text-xs leading-5 text-neutral-300">{section.items.map((item) => <li key={item} className="flex gap-2"><span className="text-brand">—</span><span>{item}</span></li>)}</ul>
          </article>)}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-3xl bg-white p-6 text-neutral-950 sm:p-9">
          <p className="text-xs font-bold tracking-[.2em] text-brand">THE GOAL</p>
          <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">クリエイターの仕事を最初から最後まで支える業務プラットフォームへ。</h2>
          <p className="mt-5 text-sm leading-7 text-neutral-600">聞き取り、案件整理、見積、業務内容確認、制作、精算、納品、請求、売上管理までを一つのアプリで完結できる環境を目指します。AIと連携しながら事務作業をできる限り自動化し、「創ること」に使える時間を増やします。</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-6 sm:p-9">
          <p className="text-xs font-bold tracking-[.2em] text-brand">FUTURE IDEAS</p>
          <h2 className="mt-3 text-xl font-bold">さらに検討している構想</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-neutral-300">{futureIdeas.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"/><span>{item}</span></li>)}</ul>
        </div>
      </section>

      <footer className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>現在は端末内保存を中心としたβ版です。外部AI・Google API・クラウド保存は未接続です。</p>
        <p className="font-bold tracking-[.12em] text-neutral-300">企画・開発：東海制作</p>
      </footer>
    </main>
  </div>;
}
