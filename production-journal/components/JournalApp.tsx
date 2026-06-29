"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { loadPosts, savePosts } from "@/data/journalRepository";
import { samplePosts } from "@/data/samplePosts";
import { calculatePoints, levelFor, levels, totalPoints } from "@/domain/points";
import type { AdminReviewStatus, JournalMedia, JournalPost, JournalView, Permissions, User } from "@/domain/types";

const activeUser: User = {
  id: "local-user",
  name: "制作スタッフ",
  role: "プロジェクトメンバー",
  avatar: "制",
};

const defaultPermissions: Permissions = {
  isPublic: false,
  canUseForArticle: false,
  canUseForSNS: false,
  allowNamePublic: false,
};

type Draft = {
  title: string;
  body: string;
  projectName: string;
  place: string;
  media: JournalMedia[];
  permissions: Permissions;
};

const emptyDraft = (): Draft => ({
  title: "",
  body: "",
  projectName: "月灯りのカノン",
  place: "",
  media: [],
  permissions: { ...defaultPermissions },
});

function formatDate(value: string, long = false) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    ...(long ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function displayName(post: JournalPost) {
  if (post.permissions.allowNamePublic) return post.authorName;
  return post.authorRole || "プロジェクトメンバー";
}

function permissionLabel(post: JournalPost) {
  if (!post.permissions.isPublic) return "内部記録";
  if (post.permissions.canUseForSNS) return "SNS共有可";
  if (post.permissions.canUseForArticle) return "掲載可";
  return "公開可";
}

export function JournalApp() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [view, setView] = useState<JournalView>("feed");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState("all");
  const [articleOnly, setArticleOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [storageMessage, setStorageMessage] = useState("");
  const [roleMode, setRoleMode] = useState<"contributor" | "admin">("contributor");
  const [timelineScope, setTimelineScope] = useState<"all" | "public">("all");
  const [adminFilter, setAdminFilter] = useState<"all" | "pending" | "approved" | "internal">("pending");
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    const stored = loadPosts();
    if (!stored.length) {
      setPosts(samplePosts);
      return;
    }

    const userPosts = stored.filter((post) => !post.id.startsWith("sample-"));
    const storedSamples = new Map(
      stored
        .filter((post) => post.id.startsWith("sample-"))
        .map((post) => [post.id, post]),
    );
    const migratedUserPosts = userPosts.map((post) => ({
      ...post,
      adminReviewStatus:
        post.adminReviewStatus ??
        "pending",
    }));
    const mergedSamples = samplePosts.map((sample) => ({
      ...sample,
      adminReviewStatus:
        storedSamples.get(sample.id)?.adminReviewStatus ??
        sample.adminReviewStatus,
    }));
    setPosts([...migratedUserPosts, ...mergedSamples]);
  }, []);

  useEffect(() => {
    if (posts.length) savePosts(posts);
  }, [posts]);

  const authors = useMemo(
    () => Array.from(new Map(posts.map((post) => [post.authorId, displayName(post)])).entries()),
    [posts],
  );

  const filteredPosts = useMemo(
    () =>
      [...posts]
        .filter((post) => (authorFilter === "all" ? true : post.authorId === authorFilter))
        .filter((post) => (articleOnly ? post.permissions.canUseForArticle : true))
        .filter((post) => {
          const query = searchText.trim().toLowerCase();
          if (!query) return true;
          return [post.title, post.body, post.place, post.authorName, post.authorRole]
            .some((value) => value.toLowerCase().includes(query));
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [posts, authorFilter, articleOnly, searchText],
  );

  const publishedPoints = totalPoints(posts);
  const currentLevel = levelFor(publishedPoints);
  const nextLevel = levels.find((level) => level.min > publishedPoints);
  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;
  const publicCandidates = posts.filter(
    (post) => post.status === "published" && post.permissions.canUseForArticle,
  );
  const internalPosts = posts.filter(
    (post) => post.status === "published" && !post.permissions.isPublic,
  );
  const drafts = posts.filter((post) => post.status === "draft");
  const approvedPosts = posts.filter((post) => post.adminReviewStatus === "approved");
  const pendingPosts = posts.filter(
    (post) => post.status === "published" && (post.adminReviewStatus ?? "pending") === "pending",
  );
  const latestPost = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  function resetComposer() {
    setDraft(emptyDraft());
    setEditingId(null);
    setStorageMessage("");
    setVoiceMessage("");
  }

  function openComposer(post?: JournalPost) {
    if (post) {
      setEditingId(post.id);
      setDraft({
        title: post.title,
        body: post.body,
        projectName: post.projectName,
        place: post.place,
        media: post.media,
        permissions: { ...post.permissions },
      });
    } else {
      resetComposer();
    }
    setView("compose");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeRole(nextRole: "contributor" | "admin") {
    setRoleMode(nextRole);
    setView(nextRole === "admin" ? "admin" : "feed");
    setTimelineScope("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openTimeline(scope: "all" | "public") {
    setTimelineScope(scope);
    setRoleMode("contributor");
    setView("timeline");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateReviewStatus(postId: string, status: AdminReviewStatus) {
    const now = new Date().toISOString();
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, adminReviewStatus: status, updatedAt: now } : post,
      ),
    );
  }

  function commitPost(status: "draft" | "published") {
    const now = new Date().toISOString();
    const imageCount = draft.media.filter((item) => item.type === "image").length;
    const videoCount = draft.media.filter((item) => item.type === "video").length;
    const points = calculatePoints({
      body: draft.body,
      imageCount,
      videoCount,
      place: draft.place,
      permissions: draft.permissions,
    });

    if (editingId) {
      setPosts((current) =>
        current.map((post) =>
          post.id === editingId
            ? { ...post, ...draft, status, points, updatedAt: now }
            : post,
        ),
      );
    } else {
      const post: JournalPost = {
        id: crypto.randomUUID(),
        authorId: activeUser.id,
        authorName: activeUser.name,
        authorRole: activeUser.role,
        ...draft,
        status,
        adminReviewStatus: "pending",
        points,
        createdAt: now,
        updatedAt: now,
      };
      setPosts((current) => [post, ...current]);
    }

    resetComposer();
    setView("feed");
  }

  function submitPost(event: FormEvent) {
    event.preventDefault();
    if (!draft.body.trim() && !draft.media.length) {
      setStorageMessage("本文または写真・映像を追加してください。");
      return;
    }
    commitPost("published");
  }

  function deletePost(post: JournalPost) {
    if (!window.confirm(`「${post.title || "無題の記録"}」を削除しますか？`)) return;
    setPosts((current) => current.filter((item) => item.id !== post.id));
    setSelectedId(null);
  }

  async function addMedia(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const next: JournalMedia[] = [];
    let hasTemporaryVideo = false;

    for (const file of files) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      if (type === "image" && file.size <= 1_500_000) {
        const previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        });
        next.push({ id: crypto.randomUUID(), type, name: file.name, size: file.size, previewUrl, persisted: true });
      } else {
        next.push({
          id: crypto.randomUUID(),
          type,
          name: file.name,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
          persisted: false,
        });
        if (type === "video") hasTemporaryVideo = true;
      }
    }

    setDraft((current) => ({ ...current, media: [...current.media, ...next] }));
    setStorageMessage(
      hasTemporaryVideo
        ? "映像はこの画面では確認できますが、ローカルMVPのため再読み込み後はファイル名だけ残ります。"
        : "",
    );
    event.target.value = "";
  }

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const BrowserSpeechRecognition = (
      window as typeof window & {
        SpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
          onend: () => void;
          onerror: () => void;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
          onend: () => void;
          onerror: () => void;
        };
      }
    ).SpeechRecognition ??
      (
        window as typeof window & {
          webkitSpeechRecognition?: new () => {
            lang: string;
            interimResults: boolean;
            continuous: boolean;
            start: () => void;
            stop: () => void;
            onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
            onend: () => void;
            onerror: () => void;
          };
        }
      ).webkitSpeechRecognition;

    if (!BrowserSpeechRecognition) {
      setVoiceMessage("このブラウザは音声入力に対応していません。");
      return;
    }

    const recognition = new BrowserSpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setDraft((current) => ({
        ...current,
        body: `${current.body}${current.body ? "\n" : ""}${transcript}`,
      }));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setVoiceMessage("マイクを利用できませんでした。ブラウザの許可設定を確認してください。");
    };
    recognitionRef.current = recognition;
    setVoiceMessage("聞き取り中です。");
    setListening(true);
    recognition.start();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("feed")} aria-label="制作日誌 ホーム">
          <span className="brand-mark">C</span>
          <span><small>CREATOR OS</small><strong>制作日誌</strong></span>
        </button>
        <div className="header-actions">
          <div className="role-switch" aria-label="表示する立場">
            <button className={roleMode === "contributor" ? "active" : ""} onClick={() => changeRole("contributor")}>投稿者</button>
            <button className={roleMode === "admin" ? "active" : ""} onClick={() => changeRole("admin")}>管理者A</button>
          </div>
          <div className="user-chip">
            <span className="avatar">{roleMode === "admin" ? "A" : activeUser.avatar}</span>
            <span><strong>{roleMode === "admin" ? "Aさん" : activeUser.name}</strong><small>{roleMode === "admin" ? "プロジェクト管理者" : activeUser.role}</small></span>
          </div>
        </div>
      </header>

      {(view === "feed" || view === "admin") && (
        <section className={`hero ${roleMode === "admin" ? "admin-hero" : ""}`}>
          <div>
            <p className="eyebrow">{roleMode === "admin" ? "PROJECT CONTROL" : "PRODUCTION JOURNAL"}</p>
            <h1>{roleMode === "admin" ? <>記録を確認し、<br />公開へ進める。</> : <>現場の空気を、<br />そのまま残す。</>}</h1>
            <p className="hero-copy">{roleMode === "admin" ? "投稿者の許可を確認し、公開候補を承認または差し戻します。" : "文章を整えなくても大丈夫。まずは言葉や写真を放り込んでください。"}</p>
          </div>
          {roleMode === "admin" ? (
            <div className="level-card admin-summary-card">
              <div className="level-top"><span>確認が必要</span><strong>{pendingPosts.length}件</strong></div>
              <div className="meter"><span style={{ width: `${posts.length ? (approvedPosts.length / posts.length) * 100 : 0}%` }} /></div>
              <div className="level-bottom"><strong>承認済み {approvedPosts.length}件</strong><span>全記録 {posts.length}件</span></div>
            </div>
          ) : (
            <div className="level-card">
              <div className="level-top"><span>現在の記録レベル</span><strong>{currentLevel.name}</strong></div>
              <div className="meter"><span style={{ width: `${nextLevel ? Math.min(100, (publishedPoints / nextLevel.min) * 100) : 100}%` }} /></div>
              <div className="level-bottom"><strong>{publishedPoints} pt</strong><span>{nextLevel ? `次の称号まで ${nextLevel.min - publishedPoints} pt` : "最高レベル"}</span></div>
            </div>
          )}
        </section>
      )}

      {roleMode === "contributor" ? (
        <nav className="view-tabs" aria-label="表示切り替え">
          <button className={view === "feed" ? "active" : ""} onClick={() => setView("feed")}>記録一覧</button>
          <button className={view === "compose" ? "active" : ""} onClick={() => openComposer()}>放り込む</button>
          <button className={view === "timeline" ? "active" : ""} onClick={() => openTimeline("all")}>制作絵巻</button>
        </nav>
      ) : (
        <nav className="view-tabs admin-tabs" aria-label="管理者表示">
          <button className="active" onClick={() => setView("admin")}>確認待ち</button>
          <button onClick={() => openTimeline("public")}>公開プレビュー</button>
          <button disabled>メンバー</button>
        </nav>
      )}

      {view === "compose" && (
        <Composer
          draft={draft}
          editing={Boolean(editingId)}
          listening={listening}
          voiceMessage={voiceMessage}
          storageMessage={storageMessage}
          onChange={setDraft}
          onMedia={addMedia}
          onVoice={toggleVoice}
          onSubmit={submitPost}
          onDraft={() => commitPost("draft")}
          onCancel={() => { resetComposer(); setView("feed"); }}
        />
      )}

      {view === "feed" && (
        <section className="content-section">
          <div className="project-overview">
            <div>
              <p className="eyebrow">CURRENT PROJECT</p>
              <h2>月灯りのカノン</h2>
              <p>企画から完成試写まで、制作の記憶を時系列で残しています。</p>
            </div>
            <dl>
              <div><dt>記録</dt><dd>{posts.length}<small>件</small></dd></div>
              <div><dt>参加者</dt><dd>{authors.length}<small>人</small></dd></div>
              <div><dt>最終更新</dt><dd className="date-value">{latestPost ? formatDate(latestPost.createdAt) : "—"}</dd></div>
            </dl>
            <button className="primary-button" onClick={() => openComposer()}>今日の記録を追加</button>
          </div>
          <div className="section-heading">
            <div><p className="eyebrow">RECENT NOTES</p><h2>みんなの記録</h2></div>
            <button className="primary-button desktop-action" onClick={() => openComposer()}>＋ 放り込む</button>
          </div>
          <div className="filters">
            <label className="search-filter">記録を検索
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="言葉・場所・名前" />
            </label>
            <label>投稿者
              <select value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)}>
                <option value="all">すべて</option>
                {authors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </label>
            <label className="check-filter">
              <input type="checkbox" checked={articleOnly} onChange={(event) => setArticleOnly(event.target.checked)} />
              掲載OKのみ
            </label>
          </div>
          <div className="post-grid">
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                canEdit={post.authorId === activeUser.id}
                onOpen={() => setSelectedId(post.id)}
                onEdit={() => openComposer(post)}
              />
            ))}
          </div>
          {!filteredPosts.length && <div className="empty-state">条件に合う記録はありません。</div>}
        </section>
      )}

      {view === "timeline" && (
        <Timeline
          posts={filteredPosts.filter((post) =>
            post.status === "published" &&
            (timelineScope === "all" || (
              post.permissions.isPublic &&
              post.permissions.canUseForArticle &&
              post.adminReviewStatus === "approved"
            )),
          )}
          scope={timelineScope}
          onOpen={setSelectedId}
        />
      )}

      {view === "admin" && (
        <AdminDashboard
          posts={posts}
          candidateCount={publicCandidates.length}
          internalCount={internalPosts.length}
          draftCount={drafts.length}
          approvedCount={approvedPosts.length}
          filter={adminFilter}
          onFilter={setAdminFilter}
          onOpen={setSelectedId}
          onReview={updateReviewStatus}
        />
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          posts={posts}
          onClose={() => setSelectedId(null)}
          onSelect={setSelectedId}
          onEdit={() => { setSelectedId(null); openComposer(selectedPost); }}
          onDelete={() => deletePost(selectedPost)}
          mode={roleMode}
          onReview={(status) => updateReviewStatus(selectedPost.id, status)}
        />
      )}
    </main>
  );
}

function AdminDashboard(props: {
  posts: JournalPost[];
  candidateCount: number;
  internalCount: number;
  draftCount: number;
  approvedCount: number;
  filter: "all" | "pending" | "approved" | "internal";
  onFilter: (filter: "all" | "pending" | "approved" | "internal") => void;
  onOpen: (id: string) => void;
  onReview: (id: string, status: AdminReviewStatus) => void;
}) {
  const reviewPosts = [...props.posts]
    .filter((post) => {
      if (props.filter === "pending") return (post.adminReviewStatus ?? "pending") === "pending";
      if (props.filter === "approved") return post.adminReviewStatus === "approved";
      if (props.filter === "internal") return !post.permissions.isPublic;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div><p className="eyebrow">ADMIN REVIEW</p><h2>Aさんの確認画面</h2></div>
        <span className="admin-note">ローカル試作版</span>
      </div>
      <div className="admin-stats">
        <article><span>全記録</span><strong>{props.posts.length}</strong><small>件</small></article>
        <article><span>掲載候補</span><strong>{props.candidateCount}</strong><small>件</small></article>
        <article><span>承認済み</span><strong>{props.approvedCount}</strong><small>件</small></article>
        <article><span>内部／下書き</span><strong>{props.internalCount + props.draftCount}</strong><small>件</small></article>
      </div>
      <div className="admin-guide">
        <strong>まず確認すること</strong>
        <p>掲載OK・公開OK・名前表示OKが、投稿者の希望どおりになっているか確認します。</p>
      </div>
      <div className="admin-filters" aria-label="確認一覧の絞り込み">
        {[
          ["pending", "確認待ち"],
          ["approved", "承認済み"],
          ["internal", "内部記録"],
          ["all", "すべて"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={props.filter === value ? "active" : ""}
            onClick={() => props.onFilter(value as typeof props.filter)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="review-list">
        {reviewPosts.map((post) => (
          <article key={post.id} className="review-row">
            <span className={`review-status ${post.permissions.canUseForArticle ? "candidate" : ""}`}>
              {post.status === "draft"
                ? "下書き"
                : post.adminReviewStatus === "approved"
                  ? "承認済み"
                  : post.adminReviewStatus === "revision"
                    ? "修正希望"
                    : post.permissions.canUseForArticle
                      ? "確認待ち"
                      : "内部のみ"}
            </span>
            <button className="review-main" onClick={() => props.onOpen(post.id)}>
              <strong>{post.title || "無題の記録"}</strong>
              <small>{displayName(post)} ／ {formatDate(post.createdAt, true)}</small>
            </button>
            <span className="review-permissions">
              <i className={post.permissions.isPublic ? "on" : ""}>公開</i>
              <i className={post.permissions.canUseForSNS ? "on" : ""}>SNS</i>
              <i className={post.permissions.allowNamePublic ? "on" : ""}>名前</i>
            </span>
            <span className="review-actions">
              <button
                className="approve-button"
                disabled={!post.permissions.isPublic || !post.permissions.canUseForArticle}
                onClick={() => props.onReview(post.id, "approved")}
              >
                承認
              </button>
              <button className="revision-button" onClick={() => props.onReview(post.id, "revision")}>修正希望</button>
            </span>
          </article>
        ))}
        {!reviewPosts.length && <div className="empty-state">この条件の記録はありません。</div>}
      </div>
    </section>
  );
}

function Composer(props: {
  draft: Draft;
  editing: boolean;
  listening: boolean;
  voiceMessage: string;
  storageMessage: string;
  onChange: (draft: Draft) => void;
  onMedia: (event: ChangeEvent<HTMLInputElement>) => void;
  onVoice: () => void;
  onSubmit: (event: FormEvent) => void;
  onDraft: () => void;
  onCancel: () => void;
}) {
  const { draft } = props;
  const imageCount = draft.media.filter((item) => item.type === "image").length;
  const videoCount = draft.media.filter((item) => item.type === "video").length;
  const previewPoints = calculatePoints({
    body: draft.body,
    imageCount,
    videoCount,
    place: draft.place,
    permissions: draft.permissions,
  });

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => props.onChange({ ...draft, [key]: value });
  const togglePermission = (key: keyof Permissions) => {
    const enabled = !draft.permissions[key];
    const next = { ...draft.permissions, [key]: enabled };
    if (key === "canUseForSNS" && enabled) {
      next.isPublic = true;
      next.canUseForArticle = true;
    }
    if (key === "isPublic" && !enabled) {
      next.canUseForSNS = false;
    }
    update("permissions", next);
  };

  return (
    <section className="composer-wrap">
      <div className="section-heading">
        <div><p className="eyebrow">DROP A MEMORY</p><h2>{props.editing ? "記録を編集する" : "今日の出来事を放り込む"}</h2></div>
        <span className="point-preview">投稿予定 <strong>+{previewPoints} pt</strong></span>
      </div>
      <form className="composer" onSubmit={props.onSubmit}>
        <div className="field-row">
          <label>案件名<input value={draft.projectName} onChange={(event) => update("projectName", event.target.value)} placeholder="プロジェクト名" /></label>
          <label>場所<input value={draft.place} onChange={(event) => update("place", event.target.value)} placeholder="撮影地・会場・店舗など" /></label>
        </div>
        <label>ひとことタイトル<input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="例：湖畔に朝靄が残った" /></label>
        <label>本文
          <textarea value={draft.body} onChange={(event) => update("body", event.target.value)} placeholder="整えなくて大丈夫です。起きたこと、感じたこと、忘れたくないことをそのまま。" rows={7} />
        </label>
        <div className="input-tools">
          <button type="button" className={`tool-button ${props.listening ? "listening" : ""}`} onClick={props.onVoice}>
            {props.listening ? "■ 聞き取りを止める" : "● 音声で追記"}
          </button>
          <label className="tool-button file-button">＋ 写真・映像
            <input type="file" accept="image/*,video/*" multiple onChange={props.onMedia} />
          </label>
          <span>{props.voiceMessage}</span>
        </div>
        {draft.media.length > 0 && (
          <div className="media-preview">
            {draft.media.map((media) => (
              <div key={media.id} className="media-item">
                {media.type === "image" ? <img src={media.previewUrl} alt="" /> : <video src={media.previewUrl} controls />}
                <button type="button" onClick={() => update("media", draft.media.filter((item) => item.id !== media.id))}>削除</button>
                <span>{media.name}</span>
              </div>
            ))}
          </div>
        )}
        {props.storageMessage && <p className="notice">{props.storageMessage}</p>}

        <fieldset className="permission-box">
          <legend>この記録の扱い</legend>
          <p>初期状態は内部記録です。外に出してよい範囲だけ選んでください。</p>
          <PermissionToggle checked={draft.permissions.canUseForArticle} onChange={() => togglePermission("canUseForArticle")} title="制作日誌・活動報告に掲載してよい" />
          <PermissionToggle checked={draft.permissions.isPublic} onChange={() => togglePermission("isPublic")} title="外部に公開してよい" />
          <PermissionToggle checked={draft.permissions.canUseForSNS} onChange={() => togglePermission("canUseForSNS")} title="SNSで共有してよい" />
          <PermissionToggle checked={draft.permissions.allowNamePublic} onChange={() => togglePermission("allowNamePublic")} title="外部公開時に名前を表示してよい" />
        </fieldset>
        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={props.onCancel}>キャンセル</button>
          <button type="button" className="secondary-button" onClick={props.onDraft}>下書き保存</button>
          <button type="submit" className="primary-button">{props.editing ? "更新する" : "放り込む"}</button>
        </div>
      </form>
    </section>
  );
}

function PermissionToggle(props: { checked: boolean; onChange: () => void; title: string }) {
  return (
    <label className="permission-toggle">
      <span>{props.title}</span>
      <input type="checkbox" checked={props.checked} onChange={props.onChange} />
      <i aria-hidden="true" />
    </label>
  );
}

function PostCard(props: { post: JournalPost; index: number; canEdit: boolean; onOpen: () => void; onEdit: () => void }) {
  const { post } = props;
  return (
    <article className={`post-card tone-${props.index % 4}`} onClick={props.onOpen}>
      <div className="card-meta">
        <span>{formatDate(post.createdAt)}</span>
        <span className={`visibility-badge ${post.permissions.isPublic ? "public" : ""}`}>{permissionLabel(post)}</span>
      </div>
      <p className="project-label">{post.projectName}</p>
      <h3>{post.title || "無題の記録"}</h3>
      <p className="post-body">{post.body || "写真・映像の記録"}</p>
      {post.media.length > 0 && (
        <div className="card-media">
          {post.media[0].type === "image" && post.media[0].persisted ? <img src={post.media[0].previewUrl} alt="" /> : <span>映像・写真 {post.media.length}件</span>}
        </div>
      )}
      <footer>
        <div className="author-line"><span className="mini-avatar">{displayName(post).slice(0, 1)}</span><span><strong>{displayName(post)}</strong><small>{post.authorRole}</small></span></div>
        <div className="card-actions">
          <span>+{post.points} pt</span>
          {props.canEdit && <button onClick={(event) => { event.stopPropagation(); props.onEdit(); }}>編集</button>}
        </div>
      </footer>
      {post.status === "draft" && <span className="draft-ribbon">下書き</span>}
    </article>
  );
}

const timelinePhases = [
  { id: "planning", number: "第一章", title: "企画", description: "物語の輪郭が生まれる", from: "2026-01-01", to: "2026-05-24" },
  { id: "preparation", number: "第二章", title: "準備", description: "仲間と場所を集める", from: "2026-05-25", to: "2026-06-21" },
  { id: "shooting", number: "第三章", title: "撮影", description: "現場で生まれた判断と記憶", from: "2026-06-22", to: "2026-06-30" },
  { id: "completion", number: "第四章", title: "編集・完成", description: "素材が作品へ変わる", from: "2026-07-01", to: "2099-12-31" },
];

function Timeline(props: { posts: JournalPost[]; scope: "all" | "public"; onOpen: (id: string) => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activePhase, setActivePhase] = useState("planning");
  const sortedPosts = [...props.posts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const phases = timelinePhases.map((phase) => ({
    ...phase,
    posts: sortedPosts.filter((post) => {
      const date = post.createdAt.slice(0, 10);
      return date >= phase.from && date <= phase.to;
    }),
  })).filter((phase) => phase.posts.length);
  const phaseIds = phases.map((phase) => phase.id).join("|");

  useEffect(() => {
    if (phases.length && !phases.some((phase) => phase.id === activePhase)) {
      setActivePhase(phases[0].id);
    }
  }, [activePhase, phaseIds, phases]);

  function moveToPhase(phaseId: string) {
    const container = scrollRef.current;
    const marker = container?.querySelector<HTMLElement>(`[data-phase="${phaseId}"]`);
    if (!container || !marker) return;
    container.scrollTo({ left: Math.max(0, marker.offsetLeft - 18), behavior: "smooth" });
    setActivePhase(phaseId);
  }

  function updateActivePhase() {
    const container = scrollRef.current;
    if (!container) return;
    const markers = Array.from(container.querySelectorAll<HTMLElement>("[data-phase]"));
    if (!markers.length) return;
    const current = markers.reduce((selected, marker) =>
      marker.offsetLeft <= container.scrollLeft + container.clientWidth * .42 ? marker : selected,
    );
    setActivePhase(current.dataset.phase ?? phases[0]?.id ?? "planning");
  }

  return (
    <section className="timeline-section">
      <div className="section-heading timeline-heading">
        <div>
          <p className="eyebrow">{props.scope === "public" ? "PUBLIC PREVIEW" : "EMA-KI TIMELINE"}</p>
          <h2>{props.scope === "public" ? "公開版 制作絵巻" : "制作絵巻"}</h2>
        </div>
        <p>{props.scope === "public" ? "承認済みの公開可能な記録だけを、1本の時間軸で表示しています。" : "企画から完成まで、すべての記録を1本の絵巻として横にたどれます。"}</p>
      </div>
      <div className="timeline-guide">
        <span>横にスワイプ</span><b aria-hidden="true">→</b>
      </div>
      <nav className="phase-nav" aria-label="絵巻の章">
        {phases.map((phase) => (
          <button
            key={phase.id}
            className={activePhase === phase.id ? "active" : ""}
            onClick={() => moveToPhase(phase.id)}
          >
            <small>{phase.number}</small>{phase.title}<i>{phase.posts.length}</i>
          </button>
        ))}
      </nav>
      {phases.length > 0 && (
        <div className="timeline-scroll" ref={scrollRef} onScroll={updateActivePhase}>
          <div className="timeline-track">
            {phases.map((phase) => (
              <div className="timeline-phase-run" key={phase.id}>
                <header className="timeline-milestone" data-phase={phase.id}>
                  <span>{phase.number}</span>
                  <strong>{phase.title}</strong>
                  <em>{phase.description}</em>
                </header>
                {phase.posts.map((post, index) => (
                  <button key={post.id} className={`timeline-note note-${index % 3}`} onClick={() => props.onOpen(post.id)}>
                    <small>{formatDate(post.createdAt)} ／ {post.place}</small>
                    <strong>{post.title || "無題の記録"}</strong>
                    <span>{post.body.slice(0, 52)}{post.body.length > 52 ? "…" : ""}</span>
                    <em>{displayName(post)}</em>
                  </button>
                ))}
              </div>
            ))}
            <div className="timeline-end">
              <small>TO BE CONTINUED</small>
              <strong>記録は、これからも続く。</strong>
            </div>
          </div>
        </div>
      )}
      {!phases.length && <div className="empty-state">公開できる記録はまだありません。</div>}
    </section>
  );
}

function PostDetail(props: {
  post: JournalPost;
  posts: JournalPost[];
  onClose: () => void;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  mode: "contributor" | "admin";
  onReview: (status: AdminReviewStatus) => void;
}) {
  const sameAuthor = props.posts
    .filter((post) => post.authorId === props.post.authorId && post.status === "published")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const currentIndex = sameAuthor.findIndex((post) => post.id === props.post.id);
  const previous = sameAuthor[currentIndex - 1];
  const next = sameAuthor[currentIndex + 1];

  return (
    <div className="modal-backdrop" onMouseDown={props.onClose}>
      <article className="post-detail" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={props.onClose} aria-label="閉じる">×</button>
        <p className="eyebrow">{props.post.projectName}</p>
        <h2>{props.post.title || "無題の記録"}</h2>
        <div className="detail-meta">
          <span>{formatDate(props.post.createdAt, true)}</span><span>{props.post.place || "場所未設定"}</span>
        </div>
        <p className="detail-body">{props.post.body || "写真・映像の記録"}</p>
        {props.post.media.length > 0 && (
          <div className="detail-media">
            {props.post.media.map((media) =>
              media.type === "image" && media.persisted
                ? <img key={media.id} src={media.previewUrl} alt="" />
                : <div key={media.id} className="media-placeholder">{media.type === "video" ? "映像" : "写真"}：{media.name}</div>,
            )}
          </div>
        )}
        <div className="detail-author"><span className="avatar">{displayName(props.post).slice(0, 1)}</span><span><strong>{displayName(props.post)}</strong><small>{props.post.authorRole}</small></span></div>
        <div className="permission-summary">
          <span>{props.post.permissions.isPublic ? "公開OK" : "内部記録"}</span>
          <span>{props.post.permissions.canUseForArticle ? "掲載OK" : "掲載不可"}</span>
          <span>{props.post.permissions.canUseForSNS ? "SNS共有OK" : "SNS共有不可"}</span>
          <span>{props.post.permissions.allowNamePublic ? "名前表示OK" : "名前は匿名"}</span>
        </div>
        <div className="post-navigation">
          <button disabled={!previous} onClick={() => previous && props.onSelect(previous.id)}>← 前の日誌</button>
          <button disabled={!next} onClick={() => next && props.onSelect(next.id)}>次の日誌 →</button>
        </div>
        {props.mode === "admin" ? (
          <div className="admin-detail-actions">
            <p>投稿者の許可を確認してから操作してください。</p>
            <div>
              <button className="revision-button large" onClick={() => props.onReview("revision")}>修正をお願いする</button>
              <button
                className="approve-button large"
                disabled={!props.post.permissions.isPublic || !props.post.permissions.canUseForArticle}
                onClick={() => props.onReview("approved")}
              >
                公開候補として承認
              </button>
            </div>
          </div>
        ) : props.post.authorId === activeUser.id ? (
          <div className="detail-actions">
            <button className="danger-button" onClick={props.onDelete}>削除</button>
            <button className="secondary-button" onClick={props.onEdit}>編集する</button>
          </div>
        ) : (
          <p className="sample-note">これは制作絵巻の見本記録です。</p>
        )}
      </article>
    </div>
  );
}
