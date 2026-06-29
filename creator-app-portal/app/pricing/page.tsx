import Link from "next/link";

export const metadata = {
  title: "利用案内 | Creator OS",
};

const guideItems = [
  {
    name: "案件を整理する",
    label: "おすすめ",
    text: "聞き取り、見積、確認書類、請求までをまとめて確認したい場合に向いています。",
  },
  {
    name: "条件を残す",
    label: "契約",
    text: "仕事の条件や合意内容を残して、あとから確認できる状態にしたい場合に使います。",
  },
  {
    name: "現場を記録する",
    label: "日誌",
    text: "撮影や制作中のメモ、振り返り、気づきを残したい場合に向いています。",
  },
];

export default function PricingPage() {
  return (
    <main className="sub-page">
      <section className="page-heading">
        <p className="eyebrow">GUIDE</p>
        <h1>使うアプリに迷ったら</h1>
        <p>今の仕事で困っていることに近い入口を選ぶと、必要なアプリを見つけやすくなります。</p>
      </section>
      <section className="plan-grid">
        {guideItems.map((item) => (
          <article className="plan-card" key={item.name}>
            <span>{item.label}</span>
            <h2>{item.name}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
      <section className="info-panel">
        <h2>最初のおすすめ</h2>
        <p>案件の情報が散らかりやすい場合は、まず「クリエイター案件マネージャー」から始めると全体像をつかみやすくなります。</p>
        <Link className="button secondary" href="/apps">
          アプリ一覧へ戻る
        </Link>
      </section>
    </main>
  );
}
