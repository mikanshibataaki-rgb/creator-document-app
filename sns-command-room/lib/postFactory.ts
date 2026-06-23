import { PostInput, PostRecord } from "./types";

export function createPost(input: PostInput): PostRecord {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: input.title,
    category: input.category,
    target_sns: input.target_sns ?? ["X", "Instagram", "Facebook", "Threads"],
    target_audience: input.target_audience ?? "",
    purpose: input.purpose ?? "",
    source_memo: input.source_memo,
    generated_text_x: input.generated_text_x ?? "",
    generated_text_instagram: input.generated_text_instagram ?? "",
    generated_text_facebook: input.generated_text_facebook ?? "",
    generated_text_threads: input.generated_text_threads ?? "",
    final_text: input.final_text ?? "",
    media_note: input.media_note ?? "",
    scheduled_date: input.scheduled_date ?? "",
    posted_date: input.posted_date ?? "",
    post_url: input.post_url ?? "",
    status: input.status ?? "ネタ",
    priority: input.priority ?? 3,
    likes: input.likes ?? 0,
    reposts: input.reposts ?? 0,
    comments: input.comments ?? 0,
    impressions: input.impressions ?? 0,
    inquiries_count: input.inquiries_count ?? 0,
    bookings_count: input.bookings_count ?? 0,
    ai_check_result: input.ai_check_result ?? "",
    ai_analysis: input.ai_analysis ?? "",
    improvement_memo: input.improvement_memo ?? "",
    created_at: now,
    updated_at: now
  };
}
