import { AccountAnalysisInput, PostRecord } from "./types";

const STUDIO_CONTEXT = `
あなたは岐阜スタジオ専用のSNS編集者です。
岐阜スタジオは岐阜県羽島市の撮影スタジオです。
文体は上品、信頼感、高級感を大切にします。
安っぽい宣伝文、過度な煽り、押し売り感は避けます。
予約導線は自然に入れます。
`.trim();

export function buildGeneratePrompt(post: PostRecord) {
  return `
${STUDIO_CONTEXT}

次の投稿ネタから、SNS別の投稿文と投稿前チェックを作ってください。
必ずJSONだけで返してください。説明文やMarkdownは不要です。

JSON形式:
{
  "generated_text_x": "X向け。短く、分かりやすく、拡散されやすい文章。",
  "generated_text_instagram": "Instagram向け。写真の魅力が伝わる丁寧な文章。",
  "generated_text_facebook": "Facebook向け。背景や想いが伝わる文章。",
  "generated_text_threads": "Threads向け。自然な会話調。",
  "final_text": "投稿前チェック後に最も使いやすい代表文。",
  "ai_check_result": "誤字脱字、宣伝臭さ、押し売り感、情報不足、予約導線、読みやすさ、炎上リスク、ブランド感のチェック結果。"
}

投稿タイトル: ${post.title}
カテゴリ: ${post.category}
対象SNS: ${post.target_sns.join(", ")}
対象読者: ${post.target_audience}
目的: ${post.purpose}
素材メモ: ${post.source_memo}
写真・素材メモ: ${post.media_note}
`.trim();
}

export function buildImprovePrompt(post: PostRecord) {
  return `
${STUDIO_CONTEXT}

次の投稿結果をもとに、改善メモを作ってください。
必ずJSONだけで返してください。説明文やMarkdownは不要です。

JSON形式:
{
  "ai_analysis": "数値と投稿内容から見た分析。",
  "improvement_memo": "良かった点、悪かった点、次回変えるべき点、次に投稿すべき内容、反応が良さそうな文体、反応が良さそうな投稿時間の仮説。"
}

投稿タイトル: ${post.title}
カテゴリ: ${post.category}
投稿文X: ${post.generated_text_x}
投稿文Instagram: ${post.generated_text_instagram}
投稿文Facebook: ${post.generated_text_facebook}
投稿文Threads: ${post.generated_text_threads}
最終投稿文: ${post.final_text}
投稿URL: ${post.post_url}
投稿日: ${post.posted_date}
いいね: ${post.likes}
リポスト: ${post.reposts}
コメント: ${post.comments}
インプレッション: ${post.impressions}
問い合わせ数: ${post.inquiries_count}
予約数: ${post.bookings_count}
現在のメモ: ${post.improvement_memo}
`.trim();
}

export function buildAccountAnalysisPrompt(input: AccountAnalysisInput) {
  return `
${STUDIO_CONTEXT}

岐阜スタジオのSNSアカウント状況を分析し、次に投稿すべき内容を提案してください。
完全自動投稿はしません。投稿担当者が判断しやすいように、実用的で上品な提案にしてください。
必ずJSONだけで返してください。説明文やMarkdownは不要です。

JSON形式:
{
  "summary": "現状分析の要約。",
  "what_to_post_next": "次に投稿すべき内容。優先順位つきで具体的に。",
  "suggested_posts": [
    {
      "title": "投稿ネタのタイトル",
      "category": "投稿カテゴリ",
      "target_sns": ["X", "Instagram"],
      "target_audience": "対象読者",
      "purpose": "投稿目的",
      "source_memo": "この投稿で書くべき内容のメモ"
    }
  ],
  "tone_direction": "反応が良さそうな文体。",
  "posting_time_hypothesis": "反応が良さそうな投稿時間の仮説。"
}

使える投稿カテゴリ:
ロケハン・下見DAY告知, 空き日告知, 部屋紹介, アンティークルーム紹介, 白部屋紹介, 和室紹介, 黒部屋紹介, メイクルーム紹介, コスプレ撮影向け, ポートレート撮影向け, 企業撮影向け, 映像撮影向け, 拡散依頼, キャンペーン告知, よくある質問, 予約導線投稿

Xアカウント: ${input.account_x}
Instagramアカウント: ${input.account_instagram}
Facebookアカウント: ${input.account_facebook}
Threadsアカウント: ${input.account_threads}
最近の投稿メモ: ${input.recent_posts_memo}
反応数・傾向メモ: ${input.metrics_memo}
今回の目標: ${input.business_goal}
`.trim();
}

export function parseJsonObject<T>(text: string): T {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
  return JSON.parse(jsonText) as T;
}
