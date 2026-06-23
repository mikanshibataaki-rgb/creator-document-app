export type MetaConnectInput = {
  instagramUserId: string;
  instagramAccessToken: string;
  facebookPageId: string;
  facebookAccessToken: string;
  threadsUserId: string;
  threadsAccessToken: string;
  limit: number;
};

export type MetaPostSummary = {
  platform: "Instagram" | "Facebook" | "Threads";
  text: string;
  createdAt: string;
  permalink: string;
  likes?: number;
  comments?: number;
  shares?: number;
  impressions?: number;
  reach?: number;
  saves?: number;
  replies?: number;
  reposts?: number;
  views?: number;
};

type ApiRecord = Record<string, unknown>;

export async function fetchMetaPostSummaries(
  input: MetaConnectInput
): Promise<MetaPostSummary[]> {
  const limit = Math.min(Math.max(input.limit || 5, 1), 25);
  const results = await Promise.allSettled([
    input.instagramUserId && input.instagramAccessToken
      ? fetchInstagramPosts(input.instagramUserId, input.instagramAccessToken, limit)
      : Promise.resolve([]),
    input.facebookPageId && input.facebookAccessToken
      ? fetchFacebookPosts(input.facebookPageId, input.facebookAccessToken, limit)
      : Promise.resolve([]),
    input.threadsUserId && input.threadsAccessToken
      ? fetchThreadsPosts(input.threadsUserId, input.threadsAccessToken, limit)
      : Promise.resolve([])
  ]);

  return results.flatMap<MetaPostSummary>((result) =>
    result.status === "fulfilled" ? result.value : []
  );
}

export function buildMetaMemo(posts: MetaPostSummary[]) {
  if (!posts.length) {
    return "Meta連携で取得できた投稿はありません。ID、アクセストークン、権限を確認してください。";
  }

  return posts
    .map((post) => {
      const metrics = [
        post.likes !== undefined ? `いいね:${post.likes}` : "",
        post.comments !== undefined ? `コメント:${post.comments}` : "",
        post.shares !== undefined ? `シェア:${post.shares}` : "",
        post.replies !== undefined ? `返信:${post.replies}` : "",
        post.reposts !== undefined ? `リポスト:${post.reposts}` : "",
        post.views !== undefined ? `表示:${post.views}` : "",
        post.impressions !== undefined ? `インプレッション:${post.impressions}` : "",
        post.reach !== undefined ? `リーチ:${post.reach}` : "",
        post.saves !== undefined ? `保存:${post.saves}` : ""
      ]
        .filter(Boolean)
        .join(" / ");

      return [
        `【${post.platform}】${post.createdAt}`,
        post.text || "本文なし",
        metrics ? `反応: ${metrics}` : "反応: 取得なし",
        post.permalink ? `URL: ${post.permalink}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

async function fetchInstagramPosts(
  userId: string,
  accessToken: string,
  limit: number
): Promise<MetaPostSummary[]> {
  const url = new URL(`https://graph.facebook.com/v20.0/${userId}/media`);
  url.searchParams.set(
    "fields",
    "id,caption,timestamp,like_count,comments_count,media_type,permalink"
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);

  const data = await fetchJson(url);
  const posts = Array.isArray(data.data) ? data.data : [];

  return Promise.all(
    posts.map(async (post) => {
      const record = post as ApiRecord;
      const insights = await fetchInstagramInsights(String(record.id), accessToken);
      return {
        platform: "Instagram" as const,
        text: String(record.caption ?? ""),
        createdAt: String(record.timestamp ?? ""),
        permalink: String(record.permalink ?? ""),
        likes: toNumber(record.like_count),
        comments: toNumber(record.comments_count),
        impressions: insights.impressions,
        reach: insights.reach,
        saves: insights.saved
      };
    })
  );
}

async function fetchInstagramInsights(mediaId: string, accessToken: string) {
  const url = new URL(`https://graph.facebook.com/v20.0/${mediaId}/insights`);
  url.searchParams.set("metric", "impressions,reach,saved,shares");
  url.searchParams.set("access_token", accessToken);

  try {
    const data = await fetchJson(url);
    return metricsArrayToObject(data.data);
  } catch {
    return {};
  }
}

async function fetchFacebookPosts(
  pageId: string,
  accessToken: string,
  limit: number
): Promise<MetaPostSummary[]> {
  const url = new URL(`https://graph.facebook.com/v20.0/${pageId}/posts`);
  url.searchParams.set(
    "fields",
    "id,message,created_time,permalink_url,likes.summary(true),comments.summary(true),shares,insights.metric(post_impressions,post_impressions_unique,post_engaged_users)"
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);

  const data = await fetchJson(url);
  const posts = Array.isArray(data.data) ? data.data : [];

  return posts.map((post) => {
    const record = post as ApiRecord;
    const insights = metricsArrayToObject(getNestedData(record.insights));
    return {
      platform: "Facebook" as const,
      text: String(record.message ?? ""),
      createdAt: String(record.created_time ?? ""),
      permalink: String(record.permalink_url ?? ""),
      likes: getSummaryTotal(record.likes),
      comments: getSummaryTotal(record.comments),
      shares: toNumber((record.shares as ApiRecord | undefined)?.count),
      impressions: insights.post_impressions,
      reach: insights.post_impressions_unique
    };
  });
}

async function fetchThreadsPosts(
  userId: string,
  accessToken: string,
  limit: number
): Promise<MetaPostSummary[]> {
  const url = new URL(`https://graph.threads.net/v1.0/${userId}/threads`);
  url.searchParams.set("fields", "id,text,timestamp,permalink");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);

  const data = await fetchJson(url);
  const posts = Array.isArray(data.data) ? data.data : [];

  return Promise.all(
    posts.map(async (post) => {
      const record = post as ApiRecord;
      const insights = await fetchThreadsInsights(String(record.id), accessToken);
      return {
        platform: "Threads" as const,
        text: String(record.text ?? ""),
        createdAt: String(record.timestamp ?? ""),
        permalink: String(record.permalink ?? ""),
        likes: insights.likes,
        replies: insights.replies,
        reposts: insights.reposts,
        shares: insights.shares,
        views: insights.views
      };
    })
  );
}

async function fetchThreadsInsights(mediaId: string, accessToken: string) {
  const url = new URL(`https://graph.threads.net/v1.0/${mediaId}/insights`);
  url.searchParams.set("metric", "views,likes,replies,reposts,quotes,shares");
  url.searchParams.set("access_token", accessToken);

  try {
    const data = await fetchJson(url);
    return metricsArrayToObject(data.data);
  } catch {
    return {};
  }
}

async function fetchJson(url: URL): Promise<ApiRecord> {
  const response = await fetch(url);
  const data = (await response.json()) as ApiRecord;

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

function metricsArrayToObject(value: unknown): Record<string, number> {
  if (!Array.isArray(value)) {
    return {};
  }

  const output: Record<string, number> = {};
  for (const item of value) {
    if (!isRecord(item) || typeof item.name !== "string") {
      continue;
    }

    const firstValue = Array.isArray(item.values) ? item.values[0] : undefined;
    const valueFromValues = isRecord(firstValue) ? firstValue.value : undefined;
    const valueFromTotal = isRecord(item.total_value) ? item.total_value.value : undefined;
    output[item.name] = toNumber(valueFromValues ?? valueFromTotal) ?? 0;
  }

  return output;
}

function getNestedData(value: unknown) {
  return isRecord(value) ? value.data : undefined;
}

function getSummaryTotal(value: unknown) {
  if (!isRecord(value) || !isRecord(value.summary)) {
    return undefined;
  }

  return toNumber(value.summary.total_count);
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }
  return undefined;
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null;
}
