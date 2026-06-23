export const POST_CATEGORIES = [
  "ロケハン・下見DAY告知",
  "空き日告知",
  "部屋紹介",
  "アンティークルーム紹介",
  "白部屋紹介",
  "和室紹介",
  "黒部屋紹介",
  "メイクルーム紹介",
  "コスプレ撮影向け",
  "ポートレート撮影向け",
  "企業撮影向け",
  "映像撮影向け",
  "拡散依頼",
  "キャンペーン告知",
  "よくある質問",
  "予約導線投稿"
] as const;

export const POST_STATUSES = [
  "ネタ",
  "下書き",
  "AI生成済み",
  "確認中",
  "投稿待ち",
  "投稿済み",
  "反応記録済み",
  "分析済み",
  "保留",
  "ボツ"
] as const;

export const SNS_OPTIONS = ["X", "Instagram", "Facebook", "Threads"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
export type PostStatus = (typeof POST_STATUSES)[number];
export type SnsName = (typeof SNS_OPTIONS)[number];

export type PostRecord = {
  id: string;
  title: string;
  category: PostCategory;
  target_sns: SnsName[];
  target_audience: string;
  purpose: string;
  source_memo: string;
  generated_text_x: string;
  generated_text_instagram: string;
  generated_text_facebook: string;
  generated_text_threads: string;
  final_text: string;
  media_note: string;
  scheduled_date: string;
  posted_date: string;
  post_url: string;
  status: PostStatus;
  priority: number;
  likes: number;
  reposts: number;
  comments: number;
  impressions: number;
  inquiries_count: number;
  bookings_count: number;
  ai_check_result: string;
  ai_analysis: string;
  improvement_memo: string;
  created_at: string;
  updated_at: string;
};

export type PostInput = Partial<PostRecord> & {
  title: string;
  category: PostCategory;
  source_memo: string;
};

export type AiGenerateResult = {
  generated_text_x: string;
  generated_text_instagram: string;
  generated_text_facebook: string;
  generated_text_threads: string;
  final_text: string;
  ai_check_result: string;
};

export type AiImproveResult = {
  ai_analysis: string;
  improvement_memo: string;
};

export type AccountAnalysisInput = {
  account_x: string;
  account_instagram: string;
  account_facebook: string;
  account_threads: string;
  recent_posts_memo: string;
  metrics_memo: string;
  business_goal: string;
};

export type AccountAnalysisResult = {
  summary: string;
  what_to_post_next: string;
  suggested_posts: Array<{
    title: string;
    category: PostCategory;
    target_sns: SnsName[];
    target_audience: string;
    purpose: string;
    source_memo: string;
  }>;
  tone_direction: string;
  posting_time_hypothesis: string;
};
