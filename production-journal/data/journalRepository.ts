import type { JournalPost } from "@/domain/types";

const STORAGE_KEY = "creator-os:production-journal:posts:v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadPosts(): JournalPost[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalPost[]) : [];
  } catch {
    return [];
  }
}

export function savePosts(posts: JournalPost[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}
