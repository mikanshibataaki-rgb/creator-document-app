import Link from "next/link";

export const metadata = {
  title: "フィードバック | Creator OS",
};

const prompts = [
  "最初に開きたいアプリはどれか",
  "名前が分かりにくいアプリはあるか",
  "追加してほしい機能はあるか",
  "スマホで見たときに押しにくい場所はあるか",
];

export default function FeedbackPage() {
  return (
    <main className="sub-page">
      <section className="page-heading">
        <p className="eyebrow">FEEDBACK</p>
        <h1>ご意見・ご要望</h1>
        <p>使ってみて分かりにくいところや、追加してほしい業務アプリがあればお知らせください。</p>
      </section>
      <section className="feedback-layout">
        <div className="info-panel">
          <h2>確認してほしいこと</h2>
          <ul className="check-list">
            {prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </div>
        <div className="feedback-card">
          <span>Feedback</span>
          <h2>より使いやすい入口へ</h2>
          <p>
            現場で迷わず使えるように、アプリ名、説明文、並び順、スマホでの見やすさを少しずつ改善していきます。
          </p>
          <Link className="button primary" href="/apps">
            アプリ一覧を確認する
          </Link>
        </div>
      </section>
    </main>
  );
}
