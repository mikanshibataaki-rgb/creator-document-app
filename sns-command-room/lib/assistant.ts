import { PostCategory, SnsName } from "./types";

export const POST_PURPOSES = [
  "集客",
  "告知",
  "空き日案内",
  "部屋紹介",
  "再告知",
  "お知らせ"
] as const;

export const TARGET_AUDIENCES = [
  "カメラマン",
  "コスプレイヤー",
  "モデル",
  "映像制作者",
  "企業担当者"
] as const;

export const STUDIO_ROOMS = [
  "白部屋",
  "アンティーク部屋",
  "黒スタジオ",
  "スタジオ全体"
] as const;

export const POST_TONES = [
  "高級感",
  "親しみ",
  "映画的",
  "実用的",
  "予約につなげる"
] as const;

export type PostPurpose = (typeof POST_PURPOSES)[number];
export type TargetAudience = (typeof TARGET_AUDIENCES)[number];
export type StudioRoom = (typeof STUDIO_ROOMS)[number];
export type PostTone = (typeof POST_TONES)[number];

export type TodayPostRequest = {
  purpose: PostPurpose;
  audience: TargetAudience;
  room: StudioRoom;
  tone: PostTone;
  memo: string;
};

export type SnsTexts = Record<SnsName, string>;

export type TodayPostResult = {
  texts: SnsTexts;
  usedFallback: boolean;
  errorMessage?: string;
};

export type ImprovementResult = {
  improvedText: string;
  reservationExpression: string;
  repostTexts: SnsTexts;
  usedFallback: boolean;
  errorMessage?: string;
};

export const AI_UNAVAILABLE_MESSAGE =
  "AI機能が利用できません。OpenAI APIキーまたは利用上限をご確認ください。";

export function buildTodayPostPrompt(input: TodayPostRequest) {
  return `
あなたは岐阜スタジオ専用のSNS投稿アシスタントです。
岐阜スタジオは岐阜県羽島市の撮影スタジオです。
自然光、白部屋、アンティーク部屋、黒スタジオを活かした撮影に向いています。
文体は安っぽくせず、押し売り感を避け、上品で信頼感のある内容にしてください。

以下の条件で、SNS別投稿文を作ってください。
必ずJSONだけで返してください。Markdownや説明文は不要です。

条件:
投稿目的: ${input.purpose}
対象: ${input.audience}
部屋: ${input.room}
トーン: ${input.tone}
補足メモ: ${input.memo || "なし"}

出力JSON:
{
  "X": "短め。わかりやすく、予約や詳細はプロフィール導線へ自然につなげる。",
  "Instagram": "写真の魅力が伝わる。最後に自然な予約導線。ハッシュタグも含める。",
  "Facebook": "少し丁寧。背景や用途が伝わる文章。",
  "Threads": "自然な会話調。親しみやすく、軽すぎない。"
}
`.trim();
}

export function buildImprovePostPrompt(sourceText: string) {
  return `
あなたは岐阜スタジオ専用のSNS投稿改善アシスタントです。
次の投稿文を、予約につながりやすく、上品で信頼感のある内容に改善してください。
必ずJSONだけで返してください。Markdownや説明文は不要です。

元の投稿文:
${sourceText}

出力JSON:
{
  "improvedText": "改善版投稿文",
  "reservationExpression": "もっと予約につながる表現",
  "repostTexts": {
    "X": "X向けの再投稿案",
    "Instagram": "Instagram向けの再投稿案。ハッシュタグも含める。",
    "Facebook": "Facebook向けの再投稿案",
    "Threads": "Threads向けの再投稿案"
  }
}
`.trim();
}

export function fallbackTodayPost(input: TodayPostRequest): SnsTexts {
  const base = `${input.room}を使った${input.audience}向けの撮影に。岐阜県羽島市の岐阜スタジオで、${input.tone}を意識した1枚を残せます。`;
  const reservation = "ご予約・詳細はプロフィールリンクからご確認ください。";

  return {
    X: `${input.room}で${input.audience}向けの撮影を考えている方へ。\n${base}\n${reservation}`,
    Instagram: `${base}\n\n${input.purpose}として、撮影前のイメージづくりにも役立つ空間です。\n${reservation}\n\n#岐阜スタジオ #岐阜撮影スタジオ #羽島市 #撮影スタジオ #${input.room.replace("部屋", "")}`,
    Facebook: `${input.room}を使った撮影をご検討中の方へ。\n\n${base}\nポートレート、コスプレ、商用撮影など、目的に合わせてご利用いただけます。\n\n${reservation}`,
    Threads: `${input.room}、${input.audience}向けの撮影にも使いやすいです。\n${input.tone}を大切にしたい撮影の候補にぜひ。\n${reservation}`
  };
}

export function fallbackImprovement(sourceText: string): Omit<ImprovementResult, "usedFallback"> {
  const improvedText = `${sourceText}\n\n撮影のご相談・ご予約はプロフィールリンクからご確認ください。`;
  return {
    improvedText,
    reservationExpression:
      "「気になる方はプロフィールリンクから空き状況をご確認ください」と入れると、押し売り感を抑えながら予約導線を作れます。",
    repostTexts: {
      X: improvedText.slice(0, 180),
      Instagram: `${improvedText}\n\n#岐阜スタジオ #岐阜撮影スタジオ #自然光スタジオ #ポートレート撮影 #コスプレ撮影`,
      Facebook: improvedText,
      Threads: `${sourceText}\n\n気になる方は、プロフィールリンクから空き状況を見てみてください。`
    }
  };
}

export function purposeToCategory(purpose: PostPurpose): PostCategory {
  if (purpose === "空き日案内") {
    return "空き日告知";
  }
  if (purpose === "部屋紹介") {
    return "部屋紹介";
  }
  if (purpose === "再告知") {
    return "予約導線投稿";
  }
  if (purpose === "告知" || purpose === "お知らせ") {
    return "よくある質問";
  }
  return "予約導線投稿";
}

export function parseSnsTexts(text: string): SnsTexts {
  const parsed = parseJson(text) as Partial<SnsTexts>;
  return {
    X: parsed.X || "",
    Instagram: parsed.Instagram || "",
    Facebook: parsed.Facebook || "",
    Threads: parsed.Threads || ""
  };
}

export function parseImprovement(text: string): Omit<ImprovementResult, "usedFallback"> {
  const parsed = parseJson(text) as Partial<Omit<ImprovementResult, "usedFallback">>;
  return {
    improvedText: parsed.improvedText || "",
    reservationExpression: parsed.reservationExpression || "",
    repostTexts: {
      X: parsed.repostTexts?.X || "",
      Instagram: parsed.repostTexts?.Instagram || "",
      Facebook: parsed.repostTexts?.Facebook || "",
      Threads: parsed.repostTexts?.Threads || ""
    }
  };
}

function parseJson(text: string): unknown {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
  return JSON.parse(jsonText);
}
