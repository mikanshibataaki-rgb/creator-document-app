import type { JournalPost, Permissions } from "./types";

export const levels = [
  { name: "見習い", min: 0 },
  { name: "常連", min: 50 },
  { name: "記録者", min: 150 },
  { name: "語り部", min: 350 },
  { name: "案内人", min: 700 },
  { name: "主筆", min: 1200 },
];

export function calculatePoints(input: {
  body: string;
  imageCount: number;
  videoCount: number;
  place: string;
  permissions: Permissions;
}) {
  return (
    5 +
    Math.min(10, Math.floor(input.body.trim().length / 20)) +
    Math.min(5, input.imageCount) * 3 +
    Math.min(2, input.videoCount) * 8 +
    (input.place.trim() ? 2 : 0) +
    (input.permissions.isPublic ? 3 : 0)
  );
}

export function levelFor(points: number) {
  return [...levels].reverse().find((level) => points >= level.min) ?? levels[0];
}

export function totalPoints(posts: JournalPost[]) {
  return posts.filter((post) => post.status === "published").reduce((sum, post) => sum + post.points, 0);
}
