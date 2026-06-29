"use client";

import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  allWarnings,
  articleFromIdea,
  articleCategories,
  canPublishArticle,
  canPublishForecast,
  canPublishLocalInfo,
  categoryLabel,
  collectSources,
  contentStatusOptions,
  defaultCmsData,
  emptyArticle,
  emptyForecastCard,
  emptyLocalInfoCard,
  emptySource,
  exportCmsJson,
  forecastCategories,
  forecastLabelOptions,
  fromLines,
  hasOfficialUrl,
  isOnlyRankD,
  isPast,
  localInfoTypeOptions,
  monthOptions,
  normalizeCmsData,
  rankLabels,
  recommendArticleIdeas,
  sourceRankOptions,
  statusLabels,
  toLines,
  todayIso,
  validateArticle,
  validateForecast,
  validateLocalInfo,
  type ArticleCategory,
  type ArticleIdea,
  type CmsData,
  type CmsWarning,
  type ContentStatus,
  type DareoshiArticle,
  type ForecastCard,
  type ForecastCategory,
  type ForecastLabel,
  type LocalInfoCard,
  type LocalInfoType,
  type SourceInfo,
  type SourceRank,
  type ViewKey
} from "@/lib/cms";

type NavItem = {
  key: ViewKey;
  label: string;
  sub: string;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "ダッシュボード", sub: "全体の安全確認" },
  { key: "articles", label: "記事", sub: "ガイド記事" },
  { key: "ideas", label: "記事候補", sub: "おすすめ20件" },
  { key: "forecasts", label: "出金予報", sub: "予報カード" },
  { key: "locals", label: "地域情報", sub: "地域カード" },
  { key: "sources", label: "ソース管理", sub: "公式URL" },
  { key: "review", label: "要再確認", sub: "古い・危ない情報" },
  { key: "export", label: "JSON出力", sub: "公開アプリ用" }
];

function Button({
  children,
  onClick,
  tone = "primary",
  type = "button",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const tones = {
    primary: "bg-navy text-white hover:bg-navy/90",
    secondary: "bg-white text-ink border border-line hover:bg-slate-50",
    danger: "bg-coral text-coralText border border-red-200 hover:bg-red-100",
    ghost: "bg-transparent text-muted hover:bg-slate-100"
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-line bg-card p-5 shadow-card ${className}`}>{children}</section>;
}

function SectionHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-ink">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-5 text-muted">{hint}</span>}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-navy focus:ring-4 focus:ring-sky/60 ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium leading-6 outline-none transition focus:border-navy focus:ring-4 focus:ring-sky/60 ${props.className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-navy focus:ring-4 focus:ring-sky/60 ${props.className ?? ""}`}
    />
  );
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const tone: Record<ContentStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    review: "bg-lemon text-lemonText",
    published: "bg-mint text-mintText",
    expired: "bg-coral text-coralText",
    archived: "bg-slate-200 text-slate-500"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone[status]}`}>{statusLabels[status]}</span>;
}

function RankBadge({ rank }: { rank: SourceRank }) {
  const tone: Record<SourceRank, string> = {
    S: "bg-mint text-mintText",
    A: "bg-sky text-skyText",
    B: "bg-lavender text-lavenderText",
    C: "bg-lemon text-lemonText",
    D: "bg-coral text-coralText"
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${tone[rank]}`}>{rank}</span>;
}

function WarningPill({ warning }: { warning: CmsWarning }) {
  const tone = warning.level === "danger" ? "bg-coral text-coralText" : warning.level === "warning" ? "bg-lemon text-lemonText" : "bg-sky text-skyText";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {warning.level === "danger" ? "要対応" : warning.level === "warning" ? "確認" : "メモ"}：{warning.message}
    </span>
  );
}

function WarningPanel({ warnings }: { warnings: CmsWarning[] }) {
  if (!warnings.length) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-mint p-4 text-sm font-bold text-mintText">
        重大な警告はありません。公開前に内容と公式ページだけ目視確認してください。
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-black text-amber-900">保存・公開前に確認</p>
      <div className="flex flex-wrap gap-2">
        {warnings.map((warning) => <WarningPill key={warning.id} warning={warning} />)}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center">
      <p className="text-lg font-black text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function SourceEditor({
  sources,
  onChange
}: {
  sources: SourceInfo[];
  onChange: (sources: SourceInfo[]) => void;
}) {
  const update = (index: number, patch: Partial<SourceInfo>) => {
    onChange(sources.map((source, sourceIndex) => sourceIndex === index ? { ...source, ...patch } : source));
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-ink">公式情報・参考情報</p>
          <p className="mt-1 text-xs text-muted">公開根拠はS〜Aを中心に。Dランクのみの場合は警告が出ます。</p>
        </div>
        <Button onClick={() => onChange([...sources, emptySource()])} tone="secondary">ソース追加</Button>
      </div>
      {sources.map((source, index) => (
        <div key={source.id} className="rounded-3xl border border-line bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RankBadge rank={source.rank} />
              <span className="text-xs font-bold text-muted">ソース {index + 1}</span>
            </div>
            <Button onClick={() => onChange(sources.filter((item) => item.id !== source.id))} tone="ghost">削除</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="出典名">
              <TextInput value={source.title} onChange={(event) => update(index, { title: event.target.value })} placeholder="例：住民税について" />
            </Field>
            <Field label="公式URL">
              <TextInput value={source.url} onChange={(event) => update(index, { url: event.target.value })} placeholder="https://..." />
            </Field>
            <Field label="発行元">
              <TextInput value={source.publisher} onChange={(event) => update(index, { publisher: event.target.value })} placeholder="例：財務省" />
            </Field>
            <Field label="ソースランク">
              <Select value={source.rank} onChange={(event) => update(index, { rank: event.target.value as SourceRank })}>
                {sourceRankOptions.map((rank) => <option key={rank} value={rank}>{rankLabels[rank]}</option>)}
              </Select>
            </Field>
            <Field label="最終確認日">
              <TextInput type="date" value={source.checkedAt} onChange={(event) => update(index, { checkedAt: event.target.value })} />
            </Field>
            <Field label="備考">
              <TextInput value={source.note ?? ""} onChange={(event) => update(index, { note: event.target.value })} placeholder="確認した箇所・注意点など" />
            </Field>
          </div>
        </div>
      ))}
      {!sources.length && <EmptyState title="ソースがありません" description="公式URLなしで公開できないため、最低1件は公式ソースを追加してください。" />}
    </div>
  );
}

function StatCard({ label, value, tone = "bg-white", hint }: { label: string; value: number | string; tone?: string; hint?: string }) {
  return (
    <Card className={`${tone} shadow-soft`}>
      <p className="text-xs font-black text-muted">{label}</p>
      <p className="mt-3 font-number text-3xl font-black text-ink">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>}
    </Card>
  );
}

function DataHealth({ data }: { data: CmsData }) {
  const warnings = allWarnings(data);
  const danger = warnings.filter((warning) => warning.level === "danger").length;
  const warning = warnings.filter((item) => item.level === "warning").length;
  const published = data.articles.filter((item) => item.status === "published").length;
  const review = data.articles.filter((item) => item.status === "review").length;
  const noOfficial = warnings.filter((item) => item.message.includes("公式URL") || item.message.includes("公式ソース")).length;
  const oldChecked = warnings.filter((item) => item.message.includes("180日")).length;
  const near = warnings.filter((item) => item.message.includes("近い")).length;
  const expired = [
    ...data.articles.filter((item) => item.status === "expired"),
    ...data.forecastCards.filter((item) => item.status === "expired"),
    ...data.localInfoCards.filter((item) => item.status === "expired" || isPast(item.deadline))
  ].length;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="公開中の記事数" value={published} tone="bg-mint" />
      <StatCard label="下書きの記事数" value={data.articles.filter((item) => item.status === "draft").length} />
      <StatCard label="要確認の記事数" value={review} tone="bg-lemon" />
      <StatCard label="期限切れ情報" value={expired} tone="bg-coral" />
      <StatCard label="公式URL未設定" value={noOfficial} tone={noOfficial ? "bg-coral" : "bg-white"} />
      <StatCard label="最終確認日が古い" value={oldChecked} tone={oldChecked ? "bg-lemon" : "bg-white"} />
      <StatCard label="次回確認日が近い" value={near} tone={near ? "bg-lemon" : "bg-white"} />
      <StatCard label="地域 / 出金予報カード" value={`${data.localInfoCards.length} / ${data.forecastCards.length}`} hint={`重大警告 ${danger}件・確認 ${warning}件`} />
    </div>
  );
}

function Dashboard({
  data,
  setView
}: {
  data: CmsData;
  setView: (view: ViewKey) => void;
}) {
  const warnings = allWarnings(data);
  return (
    <div>
      <SectionHeader
        title="ダッシュボード"
        description="公開前に危ない情報、古い情報、公式URLなしのコンテンツをここで見つけます。"
        action={<Button onClick={() => setView("review")}>要再確認リストを見る</Button>}
      />
      <DataHealth data={data} />
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionHeader title="優先して確認するもの" description="上から順に直すと公開リスクを下げられます。" />
          <div className="space-y-3">
            {warnings.slice(0, 8).map((warning) => (
              <div key={warning.id} className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <WarningPill warning={warning} />
                  {warning.dueDate && <span className="text-xs font-bold text-muted">日付：{warning.dueDate}</span>}
                </div>
                <p className="mt-2 text-sm font-black text-ink">{warning.itemTitle}</p>
              </div>
            ))}
            {!warnings.length && <EmptyState title="今すぐ対応が必要な項目はありません" description="ただし、制度情報は変わるため公開前の目視確認は続けてください。" />}
          </div>
        </Card>
        <Card className="bg-navy text-white">
          <p className="text-xs font-black text-white/60">運用ルール</p>
          <h3 className="mt-3 text-2xl font-black leading-tight">公式URLなしでは公開しない。</h3>
          <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
            <p>記事は量産より安全性を優先します。</p>
            <p>S〜Aランクを中心に、最終確認日と次回確認日を必ず残してください。</p>
            <p>税務・法律・医療は個別判断ではなく、一般情報と公式確認への案内に留めます。</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  children
}: {
  value: T | "all";
  onChange: (value: T | "all") => void;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value as T | "all")}>
      <option value="all">すべて</option>
      {children}
    </Select>
  );
}

function ArticleList({
  data,
  onNew,
  onResearch,
  onEdit,
  onDelete
}: {
  data: CmsData;
  onNew: () => void;
  onResearch: () => void;
  onEdit: (article: DareoshiArticle) => void;
  onDelete: (id: string) => void;
}) {
  const [category, setCategory] = useState<ArticleCategory | "all">("all");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [rank, setRank] = useState<SourceRank | "all">("all");
  const articles = data.articles.filter((article) => {
    if (category !== "all" && article.category !== category) return false;
    if (status !== "all" && article.status !== status) return false;
    if (rank !== "all" && !article.officialSources.some((source) => source.rank === rank)) return false;
    return true;
  });
  return (
    <div>
      <SectionHeader
        title="記事一覧"
        description="カテゴリ・ステータス・ソースランクで絞り込み、危ない記事を見つけます。"
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={onResearch} tone="secondary">おすすめ20件をリサーチ</Button>
            <Button onClick={onNew}>新規記事を作成</Button>
          </div>
        }
      />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="カテゴリ">
            <FilterSelect value={category} onChange={setCategory}>
              {articleCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </FilterSelect>
          </Field>
          <Field label="ステータス">
            <FilterSelect value={status} onChange={setStatus}>
              {contentStatusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
            </FilterSelect>
          </Field>
          <Field label="ソースランク">
            <FilterSelect value={rank} onChange={setRank}>
              {sourceRankOptions.map((item) => <option key={item} value={item}>{rankLabels[item]}</option>)}
            </FilterSelect>
          </Field>
        </div>
      </Card>
      <div className="cms-scrollbar overflow-x-auto rounded-3xl border border-line bg-white shadow-card">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="bg-paper text-xs font-black text-muted">
            <tr>
              <th className="px-4 py-3">記事</th>
              <th className="px-4 py-3">カテゴリ</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">ソース</th>
              <th className="px-4 py-3">確認日</th>
              <th className="px-4 py-3">警告</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {articles.map((article) => {
              const warnings = validateArticle(article);
              return (
                <tr key={article.id} className={warnings.some((warning) => warning.level === "danger") ? "bg-red-50/65" : ""}>
                  <td className="px-4 py-4">
                    <p className="font-black text-ink">{article.title || "無題の記事"}</p>
                    <p className="mt-1 text-xs text-muted">{article.tags.join(" / ") || "タグなし"}</p>
                  </td>
                  <td className="px-4 py-4 font-bold">{categoryLabel(article.category)}</td>
                  <td className="px-4 py-4"><StatusBadge status={article.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {article.officialSources.map((source) => <RankBadge key={source.id} rank={source.rank} />)}
                      {!article.officialSources.length && <span className="text-xs font-black text-coralText">未設定</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-muted">
                    <p>最終：{article.lastCheckedAt || "未入力"}</p>
                    <p>次回：{article.nextReviewAt || "未設定"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-[280px] flex-wrap gap-1">
                      {warnings.slice(0, 3).map((warning) => <WarningPill key={warning.id} warning={warning} />)}
                      {warnings.length > 3 && <span className="text-xs font-bold text-muted">ほか{warnings.length - 3}件</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button onClick={() => onEdit(article)} tone="secondary">編集</Button>
                      <Button onClick={() => onDelete(article.id)} tone="danger">削除</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticleIdeasScreen({
  ideas,
  onResearch,
  onAddDraft,
  onAddAllDrafts,
  onEditDraft
}: {
  ideas: ArticleIdea[];
  onResearch: () => void;
  onAddDraft: (idea: ArticleIdea) => void;
  onAddAllDrafts: () => void;
  onEditDraft: (idea: ArticleIdea) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyTitles = async () => {
    await navigator.clipboard.writeText(ideas.map((idea, index) => `${index + 1}. ${idea.title}`).join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div>
      <SectionHeader
        title="記事候補リサーチ"
        description="だれおしで記事にすると良さそうなテーマを20件まとめて出します。外部API・自動公開なし。公式確認が必要な“企画候補”です。"
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={onResearch}>おすすめ20件をリサーチ</Button>
            <Button onClick={copyTitles} tone="secondary" disabled={!ideas.length}>{copied ? "コピー済み" : "タイトルをコピー"}</Button>
            <Button onClick={onAddAllDrafts} tone="secondary" disabled={!ideas.length}>未作成をまとめて下書き追加</Button>
          </div>
        }
      />
      <Card className="mb-5 bg-lemon">
        <h3 className="text-lg font-black text-lemonText">安全ルール</h3>
        <div className="mt-3 grid gap-3 text-sm font-bold leading-6 text-lemonText md:grid-cols-3">
          <p>候補は記事の自動生成ではありません。本文は編集者が確認して書きます。</p>
          <p>下書き化しても公式URLは空のままなので、公開前警告が出ます。</p>
          <p>S〜Aランクの公式情報を確認してから公開してください。</p>
        </div>
      </Card>
      {!ideas.length ? (
        <EmptyState title="まだ候補がありません" description="「おすすめ20件をリサーチ」を押すと、記事候補が20件まとめて表示されます。" />
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea, index) => (
            <Card key={idea.id} className={idea.isAlreadyCreated ? "bg-slate-50 opacity-75" : ""}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-navy px-3 py-1 text-xs font-black text-white">#{index + 1}</span>
                    <span className="rounded-full bg-sky px-3 py-1 text-xs font-black text-skyText">{categoryLabel(idea.category)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${idea.priority === "高" ? "bg-coral text-coralText" : "bg-lemon text-lemonText"}`}>優先度：{idea.priority}</span>
                    {idea.isAlreadyCreated && <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">作成済み</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-black text-ink">{idea.title}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-muted">対象：{idea.targetReader}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{idea.whyNow}</p>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl bg-paper p-4">
                      <p className="text-xs font-black text-muted">切り口</p>
                      <p className="mt-2 text-sm font-bold leading-6">{idea.angle}</p>
                    </div>
                    <div className="rounded-2xl bg-paper p-4">
                      <p className="text-xs font-black text-muted">3行要約のたたき台</p>
                      <ul className="mt-2 space-y-1 text-sm font-bold leading-6">
                        {idea.suggestedSummary.map((line) => <li key={line}>・{line}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-line bg-white p-4">
                    <p className="text-xs font-black text-muted">公式確認候補</p>
                    <div className="mt-2 grid gap-2">
                      {idea.sourceCandidates.map((source) => (
                        <div key={`${idea.id}-${source.publisher}-${source.searchKeyword}`} className="rounded-xl bg-paper px-3 py-2 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <RankBadge rank={source.rank} />
                            <span className="font-black">{source.publisher}</span>
                          </div>
                          <p className="mt-1 text-xs font-bold text-muted">検索語：{source.searchKeyword}</p>
                          {source.urlHint && <p className="mt-1 break-all text-xs font-bold text-skyText">URL候補：{source.urlHint}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 xl:w-56 xl:flex-col">
                  <Button onClick={() => onEditDraft(idea)} disabled={idea.isAlreadyCreated}>下書きで開く</Button>
                  <Button onClick={() => onAddDraft(idea)} tone="secondary" disabled={idea.isAlreadyCreated}>下書き追加</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleEditor({
  article,
  onSave,
  onCancel
}: {
  article: DareoshiArticle;
  onSave: (article: DareoshiArticle) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(article);
  const warnings = validateArticle(draft);
  const publishBlocked = draft.status === "published" && !canPublishArticle(draft);
  return (
    <div>
      <SectionHeader
        title={article.title ? "記事編集" : "記事新規作成"}
        description="すべての記事を同じ型で管理し、公式情報と確認日を必ず残します。"
        action={<Button onClick={onCancel} tone="secondary">一覧へ戻る</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <h3 className="mb-4 text-lg font-black">基本情報</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="タイトル">
                <TextInput value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              </Field>
              <Field label="カテゴリ">
                <Select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ArticleCategory })}>
                  {articleCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </Field>
              <Field label="タグ" hint="カンマ区切りで入力">
                <TextInput value={draft.tags.join(", ")} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} placeholder="住民税, 会社員" />
              </Field>
              <Field label="ステータス">
                <Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ContentStatus })}>
                  {contentStatusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
                </Select>
              </Field>
              <Field label="最終確認日">
                <TextInput type="date" value={draft.lastCheckedAt} onChange={(event) => setDraft({ ...draft, lastCheckedAt: event.target.value })} />
              </Field>
              <Field label="次回確認日">
                <TextInput type="date" value={draft.nextReviewAt ?? ""} onChange={(event) => setDraft({ ...draft, nextReviewAt: event.target.value })} />
              </Field>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-lg font-black">本文構成</h3>
            <div className="space-y-4">
              <Field label="まず3行で" hint="1行ごとに入力。高校生でも一瞬で分かる要約にします。">
                <TextArea value={fromLines(draft.summary3Lines)} onChange={(event) => setDraft({ ...draft, summary3Lines: toLines(event.target.value) })} />
              </Field>
              <Field label="やさしく説明">
                <TextArea value={draft.easyExplanation} onChange={(event) => setDraft({ ...draft, easyExplanation: event.target.value })} />
              </Field>
              <Field label="あなたに関係ありそうな人" hint="1行1項目">
                <TextArea value={fromLines(draft.relatedPeople)} onChange={(event) => setDraft({ ...draft, relatedPeople: toLines(event.target.value) })} />
              </Field>
              <Field label="今やること" hint="1行1項目。公開アプリではチェックリスト表示されます。">
                <TextArea value={fromLines(draft.actionItems)} onChange={(event) => setDraft({ ...draft, actionItems: toLines(event.target.value) })} />
              </Field>
              <Field label="放置するとどうなる？">
                <TextArea value={draft.riskIfIgnored} onChange={(event) => setDraft({ ...draft, riskIfIgnored: event.target.value })} />
              </Field>
              <Field label="注意書き">
                <TextArea value={draft.disclaimer} onChange={(event) => setDraft({ ...draft, disclaimer: event.target.value })} />
              </Field>
            </div>
          </Card>
          <Card>
            <SourceEditor sources={draft.officialSources} onChange={(officialSources) => setDraft({ ...draft, officialSources })} />
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="sticky top-4">
            <h3 className="text-lg font-black">公開前チェック</h3>
            <div className="mt-4">
              <WarningPanel warnings={warnings} />
            </div>
            {publishBlocked && (
              <p className="mt-4 rounded-2xl bg-coral p-4 text-sm font-black leading-6 text-coralText">
                公開ステータスにするには、公式URL・3行要約・やさしい説明・今やることが必要です。
              </p>
            )}
            <div className="mt-5 grid gap-3">
              <Button disabled={publishBlocked} onClick={() => onSave({ ...draft, updatedAt: todayIso() })}>保存する</Button>
              <Button onClick={onCancel} tone="secondary">キャンセル</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ForecastList({
  cards,
  onNew,
  onEdit,
  onDelete
}: {
  cards: ForecastCard[];
  onNew: () => void;
  onEdit: (card: ForecastCard) => void;
  onDelete: (id: string) => void;
}) {
  const [category, setCategory] = useState<ForecastCategory | "all">("all");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [month, setMonth] = useState<string>("all");
  const visible = cards.filter((card) => {
    if (category !== "all" && card.category !== category) return false;
    if (status !== "all" && card.status !== status) return false;
    if (month !== "all" && !card.displayMonths.includes(Number(month))) return false;
    return true;
  });
  return (
    <div>
      <SectionHeader title="出金予報カード一覧" description="表示月・条件・公式ソースを管理します。" action={<Button onClick={onNew}>新規カードを作成</Button>} />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="カテゴリ">
            <FilterSelect value={category} onChange={setCategory}>
              {forecastCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </FilterSelect>
          </Field>
          <Field label="表示月">
            <Select value={month} onChange={(event) => setMonth(event.target.value)}>
              <option value="all">すべて</option>
              {monthOptions.map((item) => <option key={item} value={item}>{item}月</option>)}
            </Select>
          </Field>
          <Field label="ステータス">
            <FilterSelect value={status} onChange={setStatus}>
              {contentStatusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
            </FilterSelect>
          </Field>
        </div>
      </Card>
      <div className="grid gap-4">
        {visible.map((card) => {
          const warnings = validateForecast(card);
          return (
            <Card key={card.id} className={warnings.some((warning) => warning.level === "danger") ? "border-red-200 bg-red-50" : ""}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={card.status} />
                    <span className="rounded-full bg-sky px-3 py-1 text-xs font-black text-skyText">{categoryLabel(card.category)}</span>
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-black text-muted">{card.displayMonths.map((item) => `${item}月`).join(" / ") || "月未設定"}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-black">{card.title || "無題の出金予報"}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{card.reasonText || "理由未入力"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{warnings.slice(0, 3).map((warning) => <WarningPill key={warning.id} warning={warning} />)}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => onEdit(card)} tone="secondary">編集</Button>
                  <Button onClick={() => onDelete(card.id)} tone="danger">削除</Button>
                </div>
              </div>
            </Card>
          );
        })}
        {!visible.length && <EmptyState title="出金予報カードがありません" description="条件を変えるか、新規カードを作成してください。" />}
      </div>
    </div>
  );
}

function ForecastEditor({
  card,
  onSave,
  onCancel
}: {
  card: ForecastCard;
  onSave: (card: ForecastCard) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(card);
  const warnings = validateForecast(draft);
  const publishBlocked = draft.status === "published" && !canPublishForecast(draft);
  const toggleMonth = (month: number) => {
    setDraft({
      ...draft,
      displayMonths: draft.displayMonths.includes(month)
        ? draft.displayMonths.filter((item) => item !== month)
        : [...draft.displayMonths, month].sort((a, b) => a - b)
    });
  };
  return (
    <div>
      <SectionHeader title="出金予報カード編集" description="公開アプリの今月予報・年間予報に使うカードを管理します。" action={<Button onClick={onCancel} tone="secondary">一覧へ戻る</Button>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <h3 className="mb-4 text-lg font-black">基本情報</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="タイトル">
                <TextInput value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              </Field>
              <Field label="カテゴリ">
                <Select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ForecastCategory })}>
                  {forecastCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </Field>
              <Field label="ラベル">
                <Select value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value as ForecastLabel })}>
                  {forecastLabelOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="ステータス">
                <Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ContentStatus })}>
                  {contentStatusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
                </Select>
              </Field>
              <Field label="目安金額">
                <TextInput value={draft.estimateAmountText ?? ""} onChange={(event) => setDraft({ ...draft, estimateAmountText: event.target.value })} placeholder="例：数千円〜数万円/月" />
              </Field>
              <Field label="発生しやすい時期">
                <TextInput value={draft.timingText} onChange={(event) => setDraft({ ...draft, timingText: event.target.value })} placeholder="例：6月ごろ" />
              </Field>
              <Field label="最終確認日">
                <TextInput type="date" value={draft.lastCheckedAt} onChange={(event) => setDraft({ ...draft, lastCheckedAt: event.target.value })} />
              </Field>
              <Field label="次回確認日">
                <TextInput type="date" value={draft.nextReviewAt ?? ""} onChange={(event) => setDraft({ ...draft, nextReviewAt: event.target.value })} />
              </Field>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-black">表示月</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {monthOptions.map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => toggleMonth(month)}
                    className={`rounded-xl border px-3 py-2 text-sm font-black ${draft.displayMonths.includes(month) ? "border-navy bg-navy text-white" : "border-line bg-white text-ink"}`}
                  >
                    {month}月
                  </button>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-lg font-black">表示内容</h3>
            <div className="space-y-4">
              <Field label="表示条件" hint="1行1条件。例：会社員 / 副業あり / 車あり">
                <TextArea value={fromLines(draft.targetConditions)} onChange={(event) => setDraft({ ...draft, targetConditions: toLines(event.target.value) })} />
              </Field>
              <Field label="あなたに関係ありそうな理由">
                <TextArea value={draft.reasonText} onChange={(event) => setDraft({ ...draft, reasonText: event.target.value })} />
              </Field>
              <Field label="今やること" hint="1行1項目">
                <TextArea value={fromLines(draft.actionItems)} onChange={(event) => setDraft({ ...draft, actionItems: toLines(event.target.value) })} />
              </Field>
            </div>
          </Card>
          <Card>
            <SourceEditor sources={draft.officialSources} onChange={(officialSources) => setDraft({ ...draft, officialSources })} />
          </Card>
        </div>
        <Card className="h-fit">
          <h3 className="text-lg font-black">公開前チェック</h3>
          <div className="mt-4"><WarningPanel warnings={warnings} /></div>
          {publishBlocked && <p className="mt-4 rounded-2xl bg-coral p-4 text-sm font-black leading-6 text-coralText">公開には公式URL・表示月・最終確認日が必要です。</p>}
          <div className="mt-5 grid gap-3">
            <Button disabled={publishBlocked} onClick={() => onSave({ ...draft, updatedAt: todayIso() })}>保存する</Button>
            <Button onClick={onCancel} tone="secondary">キャンセル</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LocalInfoList({
  cards,
  onNew,
  onEdit,
  onDelete
}: {
  cards: LocalInfoCard[];
  onNew: () => void;
  onEdit: (card: LocalInfoCard) => void;
  onDelete: (id: string) => void;
}) {
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<LocalInfoType | "all">("all");
  const visible = cards.filter((card) => {
    if (prefecture && !card.prefecture.includes(prefecture)) return false;
    if (city && !card.city.includes(city)) return false;
    if (type !== "all" && card.type !== type) return false;
    return true;
  });
  return (
    <div>
      <SectionHeader title="地域情報カード一覧" description="給付金・商品券・水道料金など、期限切れが起こりやすい情報を管理します。" action={<Button onClick={onNew}>新規地域カード</Button>} />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="都道府県">
            <TextInput value={prefecture} onChange={(event) => setPrefecture(event.target.value)} placeholder="例：岐阜県" />
          </Field>
          <Field label="市区町村">
            <TextInput value={city} onChange={(event) => setCity(event.target.value)} placeholder="例：岐阜市" />
          </Field>
          <Field label="種別">
            <Select value={type} onChange={(event) => setType(event.target.value as LocalInfoType | "all")}>
              <option value="all">すべて</option>
              {localInfoTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
        </div>
      </Card>
      <div className="grid gap-4">
        {visible.map((card) => {
          const warnings = validateLocalInfo(card);
          const expired = card.status === "expired" || isPast(card.deadline);
          return (
            <Card key={card.id} className={expired ? "border-red-300 bg-red-50" : ""}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={card.status} />
                    <span className="rounded-full bg-sky px-3 py-1 text-xs font-black text-skyText">{card.type}</span>
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-black text-muted">{card.prefecture || "都道府県未入力"} / {card.city || "市区町村未入力"}</span>
                    {expired && <span className="rounded-full bg-coral px-3 py-1 text-xs font-black text-coralText">期限切れ</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-black">{card.title || "無題の地域情報"}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{card.summary3Lines[0] || "3行要約未入力"}</p>
                  <p className="mt-2 text-xs font-bold text-muted">期限：{card.deadline || "未設定"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{warnings.slice(0, 3).map((warning) => <WarningPill key={warning.id} warning={warning} />)}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => onEdit(card)} tone="secondary">編集</Button>
                  <Button onClick={() => onDelete(card.id)} tone="danger">削除</Button>
                </div>
              </div>
            </Card>
          );
        })}
        {!visible.length && <EmptyState title="地域情報カードがありません" description="条件を変えるか、新規カードを作成してください。" />}
      </div>
    </div>
  );
}

function LocalInfoEditor({
  card,
  onSave,
  onCancel
}: {
  card: LocalInfoCard;
  onSave: (card: LocalInfoCard) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(card);
  const warnings = validateLocalInfo(draft);
  const publishBlocked = draft.status === "published" && !canPublishLocalInfo(draft);
  return (
    <div>
      <SectionHeader title="地域情報カード編集" description="地域情報は期限切れしやすいので、期限・公式URL・確認日を強めに管理します。" action={<Button onClick={onCancel} tone="secondary">一覧へ戻る</Button>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <h3 className="mb-4 text-lg font-black">基本情報</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="都道府県">
                <TextInput value={draft.prefecture} onChange={(event) => setDraft({ ...draft, prefecture: event.target.value })} />
              </Field>
              <Field label="市区町村">
                <TextInput value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
              </Field>
              <Field label="タイトル">
                <TextInput value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              </Field>
              <Field label="種別">
                <Select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as LocalInfoType })}>
                  {localInfoTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="金額または還元率">
                <TextInput value={draft.amountText ?? ""} onChange={(event) => setDraft({ ...draft, amountText: event.target.value })} />
              </Field>
              <Field label="ステータス">
                <Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ContentStatus })}>
                  {contentStatusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
                </Select>
              </Field>
              <Field label="申請開始日">
                <TextInput type="date" value={draft.startDate ?? ""} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} />
              </Field>
              <Field label="申請期限">
                <TextInput type="date" value={draft.deadline ?? ""} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} />
              </Field>
              <Field label="最終確認日">
                <TextInput type="date" value={draft.lastCheckedAt} onChange={(event) => setDraft({ ...draft, lastCheckedAt: event.target.value })} />
              </Field>
              <Field label="次回確認日">
                <TextInput type="date" value={draft.nextReviewAt ?? ""} onChange={(event) => setDraft({ ...draft, nextReviewAt: event.target.value })} />
              </Field>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-lg font-black">内容</h3>
            <div className="space-y-4">
              <Field label="まず3行で">
                <TextArea value={fromLines(draft.summary3Lines)} onChange={(event) => setDraft({ ...draft, summary3Lines: toLines(event.target.value) })} />
              </Field>
              <Field label="やさしく説明">
                <TextArea value={draft.easyExplanation} onChange={(event) => setDraft({ ...draft, easyExplanation: event.target.value })} />
              </Field>
              <Field label="対象者">
                <TextArea value={draft.targetText} onChange={(event) => setDraft({ ...draft, targetText: event.target.value })} />
              </Field>
            </div>
          </Card>
          <Card>
            <SourceEditor sources={draft.officialSources} onChange={(officialSources) => setDraft({ ...draft, officialSources })} />
          </Card>
        </div>
        <Card className="h-fit">
          <h3 className="text-lg font-black">公開前チェック</h3>
          <div className="mt-4"><WarningPanel warnings={warnings} /></div>
          {publishBlocked && <p className="mt-4 rounded-2xl bg-coral p-4 text-sm font-black leading-6 text-coralText">公開には公式URL・地域・最終確認日が必要です。</p>}
          <div className="mt-5 grid gap-3">
            <Button disabled={publishBlocked} onClick={() => onSave({ ...draft, updatedAt: todayIso() })}>保存する</Button>
            <Button onClick={onCancel} tone="secondary">キャンセル</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SourcesScreen({
  data,
  onSave
}: {
  data: CmsData;
  onSave: (sources: SourceInfo[]) => void;
}) {
  const collected = collectSources(data);
  const [sources, setSources] = useState(data.sources);
  return (
    <div>
      <SectionHeader title="ソース管理" description="共通で使う公式URLを登録します。記事やカード内のソースも下に一覧表示します。" action={<Button onClick={() => onSave(sources)}>共通ソースを保存</Button>} />
      <Card>
        <SourceEditor sources={sources} onChange={setSources} />
      </Card>
      <Card className="mt-5">
        <h3 className="text-lg font-black">全コンテンツ内のソース</h3>
        <div className="mt-4 grid gap-3">
          {collected.map((source) => (
            <div key={source.id} className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex flex-wrap items-center gap-2">
                <RankBadge rank={source.rank} />
                <p className="font-black">{source.title || "無題のソース"}</p>
              </div>
              <p className="mt-1 text-xs font-bold text-muted">{source.publisher || "発行元未入力"} / 確認日：{source.checkedAt || "未入力"}</p>
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-bold text-skyText underline">{source.url}</a> : <p className="mt-2 text-sm font-black text-coralText">URL未設定</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReviewList({
  data,
  onOpen
}: {
  data: CmsData;
  onOpen: (warning: CmsWarning) => void;
}) {
  const warnings = allWarnings(data);
  return (
    <div>
      <SectionHeader title="要再確認リスト" description="次回確認日が近い、期限切れ、公式URL未設定、要確認ステータスのものをまとめて表示します。" />
      <div className="space-y-3">
        {warnings.map((warning) => (
          <Card key={warning.id} className={warning.level === "danger" ? "border-red-200 bg-red-50" : warning.level === "warning" ? "border-amber-200 bg-amber-50" : ""}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <WarningPill warning={warning} />
                  <span className="text-xs font-black text-muted">{warning.kind === "article" ? "記事" : warning.kind === "forecast" ? "出金予報" : "地域情報"}</span>
                  {warning.dueDate && <span className="text-xs font-bold text-muted">日付：{warning.dueDate}</span>}
                </div>
                <p className="mt-2 text-lg font-black">{warning.itemTitle}</p>
              </div>
              <Button onClick={() => onOpen(warning)} tone="secondary">編集で開く</Button>
            </div>
          </Card>
        ))}
        {!warnings.length && <EmptyState title="要再確認の項目はありません" description="確認日が近づくとここに表示されます。" />}
      </div>
    </div>
  );
}

function ExportScreen({ data }: { data: CmsData }) {
  const [includeReview, setIncludeReview] = useState(false);
  const [copied, setCopied] = useState("");
  const exported = useMemo(() => exportCmsJson(data, includeReview), [data, includeReview]);
  const files = [
    { name: "articles.json", value: exported.articles },
    { name: "forecastCards.json", value: exported.forecastCards },
    { name: "localInfoCards.json", value: exported.localInfoCards },
    { name: "sources.json", value: exported.sources }
  ];
  const copy = async (name: string, value: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(name);
    window.setTimeout(() => setCopied(""), 1800);
  };
  const download = (name: string, value: unknown) => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <SectionHeader title="JSONエクスポート" description="公開アプリ本体に渡すためのJSONを生成します。初期値は公開中のみです。" />
      <Card className="mb-5">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={includeReview} onChange={(event) => setIncludeReview(event.target.checked)} className="mt-1 h-5 w-5 accent-navy" />
          <span>
            <span className="block font-black">要確認も含めてエクスポート</span>
            <span className="mt-1 block text-sm leading-6 text-muted">通常は status: published のみ。検証用に review も含めたい場合だけONにします。</span>
          </span>
        </label>
      </Card>
      <div className="grid gap-5">
        {files.map((file) => {
          const json = JSON.stringify(file.value, null, 2);
          return (
            <Card key={file.name}>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black">{file.name}</h3>
                  <p className="mt-1 text-xs font-bold text-muted">{Array.isArray(file.value) ? `${file.value.length}件` : "JSON"}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => copy(file.name, file.value)} tone="secondary">{copied === file.name ? "コピー済み" : "コピー"}</Button>
                  <Button onClick={() => download(file.name, file.value)}>ダウンロード</Button>
                </div>
              </div>
              <pre className="cms-scrollbar max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{json}</pre>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function EditorApp() {
  const [data, setData] = useState<CmsData>(defaultCmsData);
  const [view, setView] = useState<ViewKey>("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [editingArticle, setEditingArticle] = useState<DareoshiArticle | null>(null);
  const [editingForecast, setEditingForecast] = useState<ForecastCard | null>(null);
  const [editingLocal, setEditingLocal] = useState<LocalInfoCard | null>(null);
  const [articleIdeas, setArticleIdeas] = useState<ArticleIdea[]>([]);
  const warnings = allWarnings(data);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setData(saved ? normalizeCmsData(JSON.parse(saved)) : defaultCmsData);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setData(defaultCmsData);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  const openArticle = (article: DareoshiArticle) => {
    setEditingArticle({ ...article, officialSources: article.officialSources.map((source) => ({ ...source })) });
    setView("article-edit");
  };

  const researchArticleIdeas = () => {
    setArticleIdeas(recommendArticleIdeas(data.articles, 20));
    setView("ideas");
  };

  const markIdeaCreated = (title: string) => {
    setArticleIdeas((current) => current.map((idea) => idea.title === title ? { ...idea, isAlreadyCreated: true } : idea));
  };

  const addIdeaDraft = (idea: ArticleIdea) => {
    if (data.articles.some((article) => article.title === idea.title)) {
      markIdeaCreated(idea.title);
      return;
    }
    const draft = articleFromIdea(idea);
    setData((current) => ({ ...current, articles: [draft, ...current.articles] }));
    markIdeaCreated(idea.title);
  };

  const addAllIdeaDrafts = () => {
    const existingTitles = new Set(data.articles.map((article) => article.title));
    const drafts = articleIdeas
      .filter((idea) => !idea.isAlreadyCreated && !existingTitles.has(idea.title))
      .map(articleFromIdea);
    if (!drafts.length) return;
    setData((current) => ({ ...current, articles: [...drafts, ...current.articles] }));
    setArticleIdeas((current) => current.map((idea) => ({ ...idea, isAlreadyCreated: true })));
  };

  const openIdeaDraft = (idea: ArticleIdea) => {
    setEditingArticle(articleFromIdea(idea));
    setView("article-edit");
  };

  const openForecast = (card: ForecastCard) => {
    setEditingForecast({ ...card, officialSources: card.officialSources.map((source) => ({ ...source })) });
    setView("forecast-edit");
  };

  const openLocal = (card: LocalInfoCard) => {
    setEditingLocal({ ...card, officialSources: card.officialSources.map((source) => ({ ...source })) });
    setView("local-edit");
  };

  const saveArticle = (article: DareoshiArticle) => {
    setData((current) => ({
      ...current,
      articles: current.articles.some((item) => item.id === article.id)
        ? current.articles.map((item) => item.id === article.id ? article : item)
        : [article, ...current.articles]
    }));
    setEditingArticle(null);
    setView("articles");
  };

  const saveForecast = (card: ForecastCard) => {
    setData((current) => ({
      ...current,
      forecastCards: current.forecastCards.some((item) => item.id === card.id)
        ? current.forecastCards.map((item) => item.id === card.id ? card : item)
        : [card, ...current.forecastCards]
    }));
    setEditingForecast(null);
    setView("forecasts");
  };

  const saveLocal = (card: LocalInfoCard) => {
    setData((current) => ({
      ...current,
      localInfoCards: current.localInfoCards.some((item) => item.id === card.id)
        ? current.localInfoCards.map((item) => item.id === card.id ? card : item)
        : [card, ...current.localInfoCards]
    }));
    setEditingLocal(null);
    setView("locals");
  };

  const deleteArticle = (id: string) => {
    if (!window.confirm("この記事を削除しますか？")) return;
    setData((current) => ({ ...current, articles: current.articles.filter((item) => item.id !== id) }));
  };

  const deleteForecast = (id: string) => {
    if (!window.confirm("この出金予報カードを削除しますか？")) return;
    setData((current) => ({ ...current, forecastCards: current.forecastCards.filter((item) => item.id !== id) }));
  };

  const deleteLocal = (id: string) => {
    if (!window.confirm("この地域情報カードを削除しますか？")) return;
    setData((current) => ({ ...current, localInfoCards: current.localInfoCards.filter((item) => item.id !== id) }));
  };

  const openWarningTarget = (warning: CmsWarning) => {
    if (warning.kind === "article") {
      const item = data.articles.find((article) => article.id === warning.itemId);
      if (item) openArticle(item);
    }
    if (warning.kind === "forecast") {
      const item = data.forecastCards.find((card) => card.id === warning.itemId);
      if (item) openForecast(item);
    }
    if (warning.kind === "local") {
      const item = data.localInfoCards.find((card) => card.id === warning.itemId);
      if (item) openLocal(item);
    }
  };

  const renderView = () => {
    if (view === "dashboard") return <Dashboard data={data} setView={setView} />;
    if (view === "articles") return <ArticleList data={data} onNew={() => openArticle(emptyArticle())} onResearch={researchArticleIdeas} onEdit={openArticle} onDelete={deleteArticle} />;
    if (view === "ideas") return <ArticleIdeasScreen ideas={articleIdeas} onResearch={researchArticleIdeas} onAddDraft={addIdeaDraft} onAddAllDrafts={addAllIdeaDrafts} onEditDraft={openIdeaDraft} />;
    if (view === "article-edit" && editingArticle) return <ArticleEditor article={editingArticle} onSave={saveArticle} onCancel={() => setView("articles")} />;
    if (view === "forecasts") return <ForecastList cards={data.forecastCards} onNew={() => openForecast(emptyForecastCard())} onEdit={openForecast} onDelete={deleteForecast} />;
    if (view === "forecast-edit" && editingForecast) return <ForecastEditor card={editingForecast} onSave={saveForecast} onCancel={() => setView("forecasts")} />;
    if (view === "locals") return <LocalInfoList cards={data.localInfoCards} onNew={() => openLocal(emptyLocalInfoCard())} onEdit={openLocal} onDelete={deleteLocal} />;
    if (view === "local-edit" && editingLocal) return <LocalInfoEditor card={editingLocal} onSave={saveLocal} onCancel={() => setView("locals")} />;
    if (view === "sources") return <SourcesScreen data={data} onSave={(sources) => setData((current) => ({ ...current, sources }))} />;
    if (view === "review") return <ReviewList data={data} onOpen={openWarningTarget} />;
    if (view === "export") return <ExportScreen data={data} />;
    return <Dashboard data={data} setView={setView} />;
  };

  if (!loaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper">
        <div className="rounded-3xl border border-line bg-white p-6 text-center shadow-card">
          <p className="text-sm font-black text-muted">だれおし編集室を読み込み中</p>
          <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-4 border-sky border-t-navy" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-line bg-white/90 p-5 lg:block">
          <div className="rounded-3xl bg-navy p-5 text-white">
            <p className="text-xs font-black text-white/60">INTERNAL CMS</p>
            <h1 className="mt-2 text-2xl font-black">だれおし編集室</h1>
            <p className="mt-3 text-xs leading-5 text-white/70">公式情報と確認日を守るための内部管理ツール</p>
          </div>
          <nav className="mt-5 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setView(item.key)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${view === item.key ? "bg-sky text-skyText" : "hover:bg-paper"}`}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span className="mt-1 block text-xs font-bold text-muted">{item.sub}</span>
              </button>
            ))}
          </nav>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-line bg-white/85 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black text-muted">だれおし編集室</p>
                <h1 className="text-xl font-black">公開アプリの信頼性を支える内部CMS</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-coral px-3 py-1 text-xs font-black text-coralText">重大 {warnings.filter((warning) => warning.level === "danger").length}</span>
                <span className="rounded-full bg-lemon px-3 py-1 text-xs font-black text-lemonText">確認 {warnings.filter((warning) => warning.level === "warning").length}</span>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-mintText">localStorage保存</span>
              </div>
            </div>
            <div className="cms-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${view === item.key ? "bg-navy text-white" : "bg-paper text-ink"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>
          <div className="px-4 py-6 lg:px-8">
            {renderView()}
          </div>
        </section>
      </div>
    </main>
  );
}
