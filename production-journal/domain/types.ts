export type MediaType = "image" | "video";
export type PostStatus = "draft" | "published";
export type AdminReviewStatus = "pending" | "approved" | "revision";

export type JournalMedia = {
  id: string;
  type: MediaType;
  name: string;
  size: number;
  previewUrl: string;
  persisted: boolean;
};

export type Permissions = {
  isPublic: boolean;
  canUseForArticle: boolean;
  canUseForSNS: boolean;
  allowNamePublic: boolean;
};

export type JournalPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  projectName: string;
  place: string;
  title: string;
  body: string;
  media: JournalMedia[];
  permissions: Permissions;
  status: PostStatus;
  adminReviewStatus?: AdminReviewStatus;
  points: number;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  role: string;
  avatar: string;
};

export type JournalView = "feed" | "compose" | "timeline" | "admin";
