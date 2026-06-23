"use client";

import { useEffect, useMemo, useState } from "react";

import {
  POST_PURPOSES,
  POST_TONES,
  STUDIO_ROOMS,
  TARGET_AUDIENCES,
  TodayPostRequest,
  TodayPostResult,
  ImprovementResult,
  purposeToCategory
} from "@/lib/assistant";
import { PostRecord, SNS_OPTIONS, SnsName } from "@/lib/types";

type SaveForm = {
  sns: SnsName;
  postUrl: string;
  postedAt: string;
  memo: string;
};

const initialRequest: TodayPostRequest = {
  purpose: "集客",
  audience: "カメラマン",
  room: "白部屋",
  tone: "高級感",
  memo: ""
};

const initialSaveForm: SaveForm = {
  sns: "X",
  postUrl: "",
  postedAt: new Date().toISOString().slice(0, 16),
  memo: ""
};

const snsOpenUrls: Record<SnsName, string> = {
  X: "https://twitter.com/intent/tweet",
  Instagram: "https://www.instagram.com/",
  Facebook: "https://www.facebook.com/",
  Threads: "https://www.threads.net/"
};

const snsTextFields: Record<SnsName, keyof Pick<
  PostRecord,
  "generated_text_x" | "generated_text_instagram" | "generated_text_facebook" | "generated_text_threads"
>> = {
  X: "generated_text_x",
  Instagram: "generated_text_instagram",
  Facebook: "generated_text_facebook",
  Threads: "generated_text_threads"
};

export default function Home() {
  const [request, setRequest] = useState<TodayPostRequest>(initialRequest);
  const [result, setResult] = useState<TodayPostResult | null>(null);
  const [history, setHistory] = useState<PostRecord[]>([]);
  const [saveForm, setSaveForm] = useState<SaveForm>(initialSaveForm);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [improvement, setImprovement] = useState<ImprovementResult | null>(null);
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const selectedHistory = useMemo(
    () => history.find((post) => post.id === selectedHistoryId) ?? history[0],
    [history, selectedHistoryId]
  );

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    const response = await fetch("/api/posts");
    const data = (await response.json()) as PostRecord[];
    setHistory(data);
    if (!selectedHistoryId && data[0]) {
      setSelectedHistoryId(data[0].id);
    }
  }

  async function makeTodayPost() {
    setMessage("");
    setImprovement(null);
    setIsBusy(true);

    const response = await fetch("/api/ai/today", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const data = (await response.json()) as TodayPostResult;
    setResult(data);
    setIsBusy(false);

    if (data.usedFallback) {
      setMessage(data.errorMessage || "AI機能が利用できないため、仮テンプレートで作成しました。");
      return;
    }

    setMessage("今日の投稿文を作りました。コピーして各SNSに貼り付けてください。");
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage("コピーしました。");
  }

  function openSns(sns: SnsName) {
    const text = result?.texts[sns] || "";
    const url = sns === "X"
      ? `${snsOpenUrls.X}?text=${encodeURIComponent(text)}`
      : snsOpenUrls[sns];
    window.open(url, "_blank", "noreferrer");
  }

  async function savePostedUrl() {
    setMessage("");

    if (!result) {
      setMessage("先に「今日の投稿を作る」を押してください。");
      return;
    }
    if (!saveForm.postUrl.trim()) {
      setMessage("投稿後URLを貼ってください。");
      return;
    }

    const sns = saveForm.sns;
    const generatedText = result.texts[sns];
    setIsBusy(true);
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${request.purpose} - ${request.room} - ${sns}`,
        category: purposeToCategory(request.purpose),
        target_sns: [sns],
        target_audience: request.audience,
        purpose: request.purpose,
        source_memo: [
          `投稿目的: ${request.purpose}`,
          `対象: ${request.audience}`,
          `部屋: ${request.room}`,
          `トーン: ${request.tone}`,
          request.memo ? `補足: ${request.memo}` : "",
          saveForm.memo ? `保存メモ: ${saveForm.memo}` : ""
        ].filter(Boolean).join("\n"),
        [`${snsTextFields[sns]}`]: generatedText,
        final_text: generatedText,
        media_note: request.room,
        posted_date: saveForm.postedAt,
        post_url: saveForm.postUrl,
        status: "投稿済み",
        priority: 3
      })
    });
    const data = await response.json();
    setIsBusy(false);

    if (!response.ok) {
      setMessage(data.error ?? "保存に失敗しました。");
      return;
    }

    setSaveForm({ ...initialSaveForm, sns });
    await loadHistory();
    setSelectedHistoryId(data.id);
    setMessage("投稿URLを保存しました。履歴に追加されています。");
  }

  async function improveHistory(post: PostRecord) {
    const sourceText = post.final_text || post.generated_text_x || post.generated_text_instagram;
    if (!sourceText) {
      setMessage("改善する投稿文がありません。");
      return;
    }

    setMessage("");
    setIsBusy(true);
    const response = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sourceText })
    });
    const data = (await response.json()) as ImprovementResult;
    setImprovement(data);
    setIsBusy(false);

    if (data.usedFallback) {
      setMessage(data.errorMessage || "AI機能が利用できないため、仮テンプレートで改善案を作りました。");
      return;
    }

    setMessage("改善案を作りました。再投稿に使う文をコピーできます。");
  }

  return (
    <main className="appShell assistantShell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Gifu Studio</p>
          <h1>SNS司令室 Ver.1</h1>
          <p className="subtitle">
            SNS投稿にかかる「考える時間」と「書く時間」を減らす半自動AIアシスタントです。
          </p>
        </div>
        <div className="statusStrip">
          <span>履歴 {history.length}件</span>
          <span>Meta連携は任意</span>
        </div>
      </header>

      {message ? <div className="message">{message}</div> : null}

      <section className="assistantGrid">
        <section className="panel makePanel">
          <div className="sectionHeader">
            <div>
              <h2>今日の投稿を作る</h2>
              <p>下の4つを選んで、ボタンを押すだけです。</p>
            </div>
            <button className="primaryButton" onClick={makeTodayPost} disabled={isBusy}>
              {isBusy ? "作成中..." : "今日の投稿を作る"}
            </button>
          </div>

          <div className="choiceGrid">
            <label>
              投稿目的
              <select
                value={request.purpose}
                onChange={(event) =>
                  setRequest({ ...request, purpose: event.target.value as TodayPostRequest["purpose"] })
                }
              >
                {POST_PURPOSES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              対象
              <select
                value={request.audience}
                onChange={(event) =>
                  setRequest({ ...request, audience: event.target.value as TodayPostRequest["audience"] })
                }
              >
                {TARGET_AUDIENCES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              部屋
              <select
                value={request.room}
                onChange={(event) =>
                  setRequest({ ...request, room: event.target.value as TodayPostRequest["room"] })
                }
              >
                {STUDIO_ROOMS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              トーン
              <select
                value={request.tone}
                onChange={(event) =>
                  setRequest({ ...request, tone: event.target.value as TodayPostRequest["tone"] })
                }
              >
                {POST_TONES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            補足メモ 任意
            <textarea
              value={request.memo}
              onChange={(event) => setRequest({ ...request, memo: event.target.value })}
              rows={3}
              placeholder="例: 今週末の空きあり、白部屋の自然光、プロフィールリンクから予約"
            />
          </label>
        </section>

        <section className="panel guidePanel">
          <h2>使い方</h2>
          <ol className="simpleSteps">
            <li>「今日の投稿を作る」を押します。</li>
            <li>使いたいSNS文の「コピー」を押します。</li>
            <li>「SNSを開く」で投稿画面を開き、貼り付けます。</li>
            <li>投稿後、URLを貼って保存します。</li>
          </ol>
          <p className="hintText">
            OpenAI APIが使えない時も、仮テンプレートで投稿文を出します。Meta APIは使わなくても大丈夫です。
          </p>
        </section>
      </section>

      <section className="resultGrid">
        <section className="panel">
          <div className="sectionHeader">
            <h2>SNS別投稿文</h2>
          </div>

          {result ? (
            <div className="snsTextGrid">
              {SNS_OPTIONS.map((sns) => (
                <article className="snsTextCard" key={sns}>
                  <div className="sectionHeader">
                    <h3>{sns}</h3>
                    <div className="inlineActions">
                      <button onClick={() => copyText(result.texts[sns])}>コピー</button>
                      <button onClick={() => openSns(sns)}>{sns}を開く</button>
                    </div>
                  </div>
                  <textarea readOnly value={result.texts[sns]} rows={sns === "X" ? 5 : 9} />
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyState compact">
              まず「今日の投稿を作る」を押してください。
            </div>
          )}
        </section>

        <section className="panel">
          <div className="sectionHeader">
            <h2>投稿後URLを保存</h2>
          </div>

          <div className="choiceGrid single">
            <label>
              SNS種別
              <select
                value={saveForm.sns}
                onChange={(event) => setSaveForm({ ...saveForm, sns: event.target.value as SnsName })}
              >
                {SNS_OPTIONS.map((sns) => (
                  <option key={sns}>{sns}</option>
                ))}
              </select>
            </label>
            <label>
              投稿日時
              <input
                type="datetime-local"
                value={saveForm.postedAt}
                onChange={(event) => setSaveForm({ ...saveForm, postedAt: event.target.value })}
              />
            </label>
          </div>

          <label>
            投稿URL
            <input
              value={saveForm.postUrl}
              onChange={(event) => setSaveForm({ ...saveForm, postUrl: event.target.value })}
              placeholder="投稿後にURLを貼ります"
            />
          </label>

          <label>
            メモ 任意
            <textarea
              value={saveForm.memo}
              onChange={(event) => setSaveForm({ ...saveForm, memo: event.target.value })}
              rows={3}
              placeholder="例: 週末の空き告知として投稿"
            />
          </label>

          <button className="primaryButton" onClick={savePostedUrl} disabled={isBusy}>
            投稿URLを保存
          </button>
        </section>
      </section>

      <section className="historyGrid">
        <section className="panel">
          <div className="sectionHeader">
            <h2>投稿履歴</h2>
          </div>

          <div className="historyList">
            {history.map((post) => (
              <button
                key={post.id}
                className={`historyItem ${selectedHistory?.id === post.id ? "active" : ""}`}
                onClick={() => setSelectedHistoryId(post.id)}
              >
                <strong>{post.title}</strong>
                <span>{post.posted_date || "日時未設定"}</span>
                <small>{post.target_sns.join(", ")} / {post.purpose}</small>
              </button>
            ))}
            {!history.length ? <p className="emptyText">履歴はまだありません。</p> : null}
          </div>
        </section>

        <section className="panel">
          <div className="sectionHeader">
            <h2>履歴の再利用・改善</h2>
            {selectedHistory ? (
              <button onClick={() => improveHistory(selectedHistory)} disabled={isBusy}>
                再投稿用に改善
              </button>
            ) : null}
          </div>

          {selectedHistory ? (
            <div className="historyDetail">
              <p className="historyMeta">
                {selectedHistory.target_sns.join(", ")} / {selectedHistory.posted_date || "日時未設定"}
              </p>
              <a href={selectedHistory.post_url} target="_blank" rel="noreferrer">
                投稿URLを開く
              </a>
              <textarea readOnly value={selectedHistory.final_text} rows={6} />
              <button onClick={() => copyText(selectedHistory.final_text)}>
                履歴の投稿文を再コピー
              </button>
            </div>
          ) : (
            <div className="emptyState compact">履歴を選んでください。</div>
          )}

          {improvement ? (
            <div className="improvementBox">
              <h3>改善版投稿文</h3>
              <textarea readOnly value={improvement.improvedText} rows={5} />
              <button onClick={() => copyText(improvement.improvedText)}>改善版をコピー</button>

              <h3>もっと予約につながる表現</h3>
              <p>{improvement.reservationExpression}</p>

              <h3>SNS別の再投稿案</h3>
              {SNS_OPTIONS.map((sns) => (
                <div className="miniText" key={sns}>
                  <strong>{sns}</strong>
                  <textarea readOnly value={improvement.repostTexts[sns]} rows={4} />
                  <button onClick={() => copyText(improvement.repostTexts[sns])}>
                    {sns}案をコピー
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </section>

      <details className="optionalSettings">
        <summary>任意：Meta API連携</summary>
        <p>
          Meta API連携は必須ではありません。未設定でもSNS司令室は使えます。InstagramやFacebookの自動取得は、あとで必要になった時だけ設定してください。
        </p>
      </details>
    </main>
  );
}
