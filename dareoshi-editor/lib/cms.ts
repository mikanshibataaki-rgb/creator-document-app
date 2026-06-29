export type SourceRank = "S" | "A" | "B" | "C" | "D";
export type ContentStatus = "draft" | "review" | "published" | "expired" | "archived";

export type SourceInfo = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  rank: SourceRank;
  checkedAt: string;
  note?: string;
};

export type ArticleCategory =
  | "tax"
  | "insurance"
  | "pension"
  | "health"
  | "home"
  | "car"
  | "work"
  | "investment"
  | "ceremony"
  | "law"
  | "consumer"
  | "local"
  | "religion"
  | "election"
  | "life";

export type DareoshiArticle = {
  id: string;
  title: string;
  category: ArticleCategory;
  tags: string[];
  summary3Lines: string[];
  easyExplanation: string;
  relatedPeople: string[];
  actionItems: string[];
  riskIfIgnored: string;
  officialSources: SourceInfo[];
  lastCheckedAt: string;
  nextReviewAt?: string;
  status: ContentStatus;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
};

export type ForecastLabel = "目安" | "要確認" | "確定入力済み" | "公式確認推奨";

export type ForecastCategory =
  | "tax"
  | "insurance"
  | "home"
  | "car"
  | "work"
  | "investment"
  | "ceremony"
  | "law"
  | "consumer"
  | "local"
  | "life";

export type ForecastCard = {
  id: string;
  title: string;
  category: ForecastCategory;
  displayMonths: number[];
  targetConditions: string[];
  estimateAmountText?: string;
  timingText: string;
  reasonText: string;
  actionItems: string[];
  label: ForecastLabel;
  officialSources: SourceInfo[];
  lastCheckedAt: string;
  nextReviewAt?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type LocalInfoType =
  | "給付金"
  | "PayPay還元"
  | "商品券"
  | "水道料金"
  | "ゴミ袋"
  | "補助金"
  | "防災"
  | "税金"
  | "保険"
  | "子育て"
  | "若者支援"
  | "その他";

export type LocalInfoCard = {
  id: string;
  prefecture: string;
  city: string;
  title: string;
  type: LocalInfoType;
  summary3Lines: string[];
  easyExplanation: string;
  targetText: string;
  amountText?: string;
  startDate?: string;
  deadline?: string;
  officialSources: SourceInfo[];
  lastCheckedAt: string;
  nextReviewAt?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CmsData = {
  articles: DareoshiArticle[];
  forecastCards: ForecastCard[];
  localInfoCards: LocalInfoCard[];
  sources: SourceInfo[];
};

export type SourceCandidate = {
  publisher: string;
  rank: SourceRank;
  searchKeyword: string;
  urlHint?: string;
};

export type ArticleIdea = {
  id: string;
  title: string;
  category: ArticleCategory;
  tags: string[];
  targetReader: string;
  whyNow: string;
  angle: string;
  suggestedSummary: string[];
  sourceCandidates: SourceCandidate[];
  priority: "高" | "中";
  isAlreadyCreated?: boolean;
};

export type WarningLevel = "danger" | "warning" | "info";

export type CmsWarning = {
  id: string;
  kind: "article" | "forecast" | "local" | "source";
  itemId: string;
  itemTitle: string;
  level: WarningLevel;
  message: string;
  dueDate?: string;
};

export type ViewKey =
  | "dashboard"
  | "articles"
  | "ideas"
  | "article-edit"
  | "forecasts"
  | "forecast-edit"
  | "locals"
  | "local-edit"
  | "sources"
  | "review"
  | "export";

export const STORAGE_KEY = "dareoshi-editor-cms-v1";

export const sourceRankOptions: SourceRank[] = ["S", "A", "B", "C", "D"];
export const contentStatusOptions: ContentStatus[] = ["draft", "review", "published", "expired", "archived"];
export const forecastLabelOptions: ForecastLabel[] = ["目安", "要確認", "確定入力済み", "公式確認推奨"];
export const localInfoTypeOptions: LocalInfoType[] = ["給付金", "PayPay還元", "商品券", "水道料金", "ゴミ袋", "補助金", "防災", "税金", "保険", "子育て", "若者支援", "その他"];
export const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

export const articleCategories: { value: ArticleCategory; label: string }[] = [
  { value: "tax", label: "税金" },
  { value: "insurance", label: "保険" },
  { value: "pension", label: "年金" },
  { value: "health", label: "健康・医療" },
  { value: "home", label: "住まい" },
  { value: "car", label: "車" },
  { value: "work", label: "働き方" },
  { value: "investment", label: "投資" },
  { value: "ceremony", label: "冠婚葬祭" },
  { value: "law", label: "法律・契約" },
  { value: "consumer", label: "消費者トラブル" },
  { value: "local", label: "地域制度" },
  { value: "religion", label: "宗教に関係するお金" },
  { value: "election", label: "選挙・社会制度" },
  { value: "life", label: "生活" }
];

export const forecastCategories: { value: ForecastCategory; label: string }[] = articleCategories
  .filter((category) => category.value !== "pension" && category.value !== "health" && category.value !== "religion" && category.value !== "election")
  .map((category) => ({ value: category.value as ForecastCategory, label: category.label }));

export const statusLabels: Record<ContentStatus, string> = {
  draft: "下書き",
  review: "要確認",
  published: "公開",
  expired: "期限切れ",
  archived: "非公開"
};

export const rankLabels: Record<SourceRank, string> = {
  S: "S：国・省庁・自治体公式",
  A: "A：公的相談機関・公共性の高い団体",
  B: "B：業界団体・専門家監修",
  C: "C：民間企業の解説",
  D: "D：SNS・個人ブログ等"
};

export function categoryLabel(category: ArticleCategory | ForecastCategory) {
  return articleCategories.find((item) => item.value === category)?.label ?? category;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function fromLines(value: string[]) {
  return value.join("\n");
}

export function hasOfficialUrl(sources: SourceInfo[]) {
  return sources.some((source) => source.url.trim().length > 0);
}

export function isOnlyRankD(sources: SourceInfo[]) {
  return sources.length > 0 && sources.every((source) => source.rank === "D");
}

export function daysSince(dateText?: string) {
  if (!dateText) return Number.POSITIVE_INFINITY;
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export function daysUntil(dateText?: string) {
  if (!dateText) return Number.POSITIVE_INFINITY;
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export function isPast(dateText?: string) {
  return daysUntil(dateText) < 0;
}

export function isNear(dateText?: string, withinDays = 30) {
  const days = daysUntil(dateText);
  return Number.isFinite(days) && days >= 0 && days <= withinDays;
}

function warningId(kind: CmsWarning["kind"], itemId: string, message: string) {
  return `${kind}-${itemId}-${message}`;
}

function pushWarning(warnings: CmsWarning[], warning: Omit<CmsWarning, "id">) {
  warnings.push({ ...warning, id: warningId(warning.kind, warning.itemId, warning.message) });
}

export function validateArticle(article: DareoshiArticle): CmsWarning[] {
  const warnings: CmsWarning[] = [];
  const base = { kind: "article" as const, itemId: article.id, itemTitle: article.title || "無題の記事" };
  if (!hasOfficialUrl(article.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "公式URLが未設定です" });
  if (isOnlyRankD(article.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "Dランクのソースのみです" });
  if (!article.lastCheckedAt) pushWarning(warnings, { ...base, level: "danger", message: "最終確認日が未入力です" });
  if (daysSince(article.lastCheckedAt) >= 180) pushWarning(warnings, { ...base, level: "warning", message: "最終確認日から180日以上経過しています", dueDate: article.lastCheckedAt });
  if (isPast(article.nextReviewAt)) pushWarning(warnings, { ...base, level: "danger", message: "次回確認日を過ぎています", dueDate: article.nextReviewAt });
  if (isNear(article.nextReviewAt)) pushWarning(warnings, { ...base, level: "warning", message: "次回確認日が近いです", dueDate: article.nextReviewAt });
  if (article.status === "published" && !hasOfficialUrl(article.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "公開中なのに公式ソースがありません" });
  if (article.summary3Lines.filter(Boolean).length === 0) pushWarning(warnings, { ...base, level: "danger", message: "3行要約が空です" });
  if (!article.easyExplanation.trim()) pushWarning(warnings, { ...base, level: "danger", message: "やさしい説明が空です" });
  if (article.actionItems.filter(Boolean).length === 0) pushWarning(warnings, { ...base, level: "danger", message: "今やることが空です" });
  if (article.status === "review") pushWarning(warnings, { ...base, level: "info", message: "ステータスが要確認です" });
  return warnings;
}

export function validateForecast(card: ForecastCard): CmsWarning[] {
  const warnings: CmsWarning[] = [];
  const base = { kind: "forecast" as const, itemId: card.id, itemTitle: card.title || "無題の出金予報" };
  if (!hasOfficialUrl(card.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "公式URLが未設定です" });
  if (card.displayMonths.length === 0) pushWarning(warnings, { ...base, level: "danger", message: "表示月が未設定です" });
  if (card.targetConditions.length === 0) pushWarning(warnings, { ...base, level: "warning", message: "表示条件が空です" });
  if (!card.lastCheckedAt) pushWarning(warnings, { ...base, level: "danger", message: "最終確認日が未入力です" });
  if (daysSince(card.lastCheckedAt) >= 180) pushWarning(warnings, { ...base, level: "warning", message: "最終確認日から180日以上経過しています", dueDate: card.lastCheckedAt });
  if (isPast(card.nextReviewAt)) pushWarning(warnings, { ...base, level: "danger", message: "次回確認日を過ぎています", dueDate: card.nextReviewAt });
  if (isNear(card.nextReviewAt)) pushWarning(warnings, { ...base, level: "warning", message: "次回確認日が近いです", dueDate: card.nextReviewAt });
  if (card.status === "published" && !hasOfficialUrl(card.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "公開中なのに公式ソースがありません" });
  if (card.status === "review") pushWarning(warnings, { ...base, level: "info", message: "ステータスが要確認です" });
  return warnings;
}

export function validateLocalInfo(card: LocalInfoCard): CmsWarning[] {
  const warnings: CmsWarning[] = [];
  const base = { kind: "local" as const, itemId: card.id, itemTitle: card.title || "無題の地域情報" };
  if (!hasOfficialUrl(card.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "公式URLが未設定です" });
  if (!card.prefecture.trim() || !card.city.trim()) pushWarning(warnings, { ...base, level: "danger", message: "都道府県または市区町村が空です" });
  if (isPast(card.deadline)) pushWarning(warnings, { ...base, level: "danger", message: "申請期限を過ぎています", dueDate: card.deadline });
  if (isNear(card.deadline, 14)) pushWarning(warnings, { ...base, level: "warning", message: "申請期限が近いです", dueDate: card.deadline });
  if (!card.lastCheckedAt) pushWarning(warnings, { ...base, level: "danger", message: "最終確認日が未入力です" });
  if (daysSince(card.lastCheckedAt) >= 180) pushWarning(warnings, { ...base, level: "warning", message: "最終確認日から180日以上経過しています", dueDate: card.lastCheckedAt });
  if (isPast(card.nextReviewAt)) pushWarning(warnings, { ...base, level: "danger", message: "次回確認日を過ぎています", dueDate: card.nextReviewAt });
  if (isNear(card.nextReviewAt)) pushWarning(warnings, { ...base, level: "warning", message: "次回確認日が近いです", dueDate: card.nextReviewAt });
  if (card.status === "published" && !hasOfficialUrl(card.officialSources)) pushWarning(warnings, { ...base, level: "danger", message: "公開中なのに公式ソースがありません" });
  if (card.status === "review") pushWarning(warnings, { ...base, level: "info", message: "ステータスが要確認です" });
  return warnings;
}

export function allWarnings(data: CmsData) {
  return [
    ...data.articles.flatMap(validateArticle),
    ...data.forecastCards.flatMap(validateForecast),
    ...data.localInfoCards.flatMap(validateLocalInfo)
  ].sort((a, b) => {
    const weight: Record<WarningLevel, number> = { danger: 0, warning: 1, info: 2 };
    return weight[a.level] - weight[b.level] || (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  });
}

export function canPublishArticle(article: DareoshiArticle) {
  return hasOfficialUrl(article.officialSources) && article.summary3Lines.length > 0 && article.easyExplanation.trim().length > 0 && article.actionItems.length > 0;
}

export function canPublishForecast(card: ForecastCard) {
  return hasOfficialUrl(card.officialSources) && card.displayMonths.length > 0 && card.lastCheckedAt.trim().length > 0;
}

export function canPublishLocalInfo(card: LocalInfoCard) {
  return hasOfficialUrl(card.officialSources) && card.prefecture.trim().length > 0 && card.city.trim().length > 0 && card.lastCheckedAt.trim().length > 0;
}

export function emptySource(): SourceInfo {
  const now = todayIso();
  return {
    id: createId("source"),
    title: "",
    url: "",
    publisher: "",
    rank: "S",
    checkedAt: now,
    note: ""
  };
}

export function emptyArticle(): DareoshiArticle {
  const now = todayIso();
  return {
    id: createId("article"),
    title: "",
    category: "tax",
    tags: [],
    summary3Lines: ["", "", ""],
    easyExplanation: "",
    relatedPeople: [],
    actionItems: [],
    riskIfIgnored: "",
    officialSources: [emptySource()],
    lastCheckedAt: now,
    nextReviewAt: "",
    status: "draft",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。詳細な条件や最新情報は、必ず公式ページを確認してください。",
    createdAt: now,
    updatedAt: now
  };
}

const articleIdeaBank: Omit<ArticleIdea, "isAlreadyCreated">[] = [
  {
    id: "idea-national-pension-20",
    title: "20歳になったら国民年金って何をするの？",
    category: "pension",
    tags: ["年金", "20歳", "学生"],
    targetReader: "20歳前後の学生・フリーター・新社会人",
    whyNow: "成人直後に急に届く書類としてつまずきやすいテーマです。",
    angle: "納付・免除・学生納付特例を、最初に迷わないように整理する。",
    suggestedSummary: ["20歳になると国民年金に関係する手続きが出てきます。", "学生や収入が少ない人には猶予・免除の制度があります。", "放置せず、日本年金機構や市区町村の案内を確認しましょう。"],
    sourceCandidates: [{ publisher: "日本年金機構", rank: "S", searchKeyword: "日本年金機構 20歳 国民年金 学生納付特例", urlHint: "https://www.nenkin.go.jp/" }],
    priority: "高"
  },
  {
    id: "idea-student-loan-repayment",
    title: "奨学金の返還が始まる前に見ること",
    category: "life",
    tags: ["奨学金", "返還", "新社会人"],
    targetReader: "卒業前後の学生・新社会人",
    whyNow: "返還開始の時期や口座設定を見落とすと、初任給の時期に不安が出やすいです。",
    angle: "返還開始時期、猶予、減額返還をやさしく整理する。",
    suggestedSummary: ["奨学金は卒業後すぐではなく、決まった時期から返還が始まります。", "収入が厳しい場合に使える制度があります。", "返還開始前にJASSOの案内と口座を確認しましょう。"],
    sourceCandidates: [{ publisher: "日本学生支援機構", rank: "S", searchKeyword: "JASSO 奨学金 返還 猶予 減額返還", urlHint: "https://www.jasso.go.jp/" }],
    priority: "高"
  },
  {
    id: "idea-retirement-health-insurance",
    title: "会社を辞めたあと、健康保険はどうなる？",
    category: "insurance",
    tags: ["退職", "健康保険", "国保"],
    targetReader: "退職・転職予定の人",
    whyNow: "退職後に保険料や手続きを知らず困るケースが多いテーマです。",
    angle: "任意継続・国民健康保険・扶養の違いを、個別判断せず選択肢として説明する。",
    suggestedSummary: ["会社を辞めると健康保険の切り替えが必要になることがあります。", "任意継続・国保・扶養など選択肢があります。", "期限があるため、退職前後に公式情報を確認しましょう。"],
    sourceCandidates: [{ publisher: "厚生労働省", rank: "S", searchKeyword: "厚生労働省 退職 健康保険 任意継続 国民健康保険" }],
    priority: "高"
  },
  {
    id: "idea-resident-tax-after-retirement",
    title: "退職後に住民税の請求が来る理由",
    category: "tax",
    tags: ["住民税", "退職", "後払い"],
    targetReader: "退職・転職した人",
    whyNow: "住民税は前年所得ベースなので、収入が減った後に請求を重く感じやすいです。",
    angle: "後払いの仕組みと、納付書が届いたときの確認行動を説明する。",
    suggestedSummary: ["住民税は前年の収入をもとに計算されます。", "退職後も納付書が届くことがあります。", "支払いが難しい場合は放置せず自治体へ相談しましょう。"],
    sourceCandidates: [{ publisher: "財務省", rank: "S", searchKeyword: "財務省 住民税 所得税 違い", urlHint: "https://www.mof.go.jp/tax_information/qanda020.html" }, { publisher: "自治体公式サイト", rank: "S", searchKeyword: "市区町村 住民税 退職 納付書" }],
    priority: "高"
  },
  {
    id: "idea-sidejob-tax-20man",
    title: "副業20万円ルールで誤解しやすいこと",
    category: "work",
    tags: ["副業", "確定申告", "住民税"],
    targetReader: "副業を始めた会社員",
    whyNow: "SNSで単純化されやすく、住民税や条件を見落としやすいテーマです。",
    angle: "所得税と住民税を混同しないように、公式確認前提で整理する。",
    suggestedSummary: ["副業の申告は、収入ではなく所得で考える場面があります。", "所得税と住民税で確認ポイントが違うことがあります。", "迷ったら国税庁と市区町村の案内を確認しましょう。"],
    sourceCandidates: [{ publisher: "国税庁", rank: "S", searchKeyword: "国税庁 給与所得者 確定申告 20万円", urlHint: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm" }, { publisher: "自治体公式サイト", rank: "S", searchKeyword: "市区町村 副業 住民税 申告" }],
    priority: "高"
  },
  {
    id: "idea-first-rent-contract",
    title: "初めての賃貸契約で見るべきお金",
    category: "home",
    tags: ["賃貸", "初期費用", "契約"],
    targetReader: "一人暮らしを始める人",
    whyNow: "家賃だけ見て契約すると、初期費用や更新・退去費用で驚きやすいです。",
    angle: "敷金・礼金・仲介手数料・火災保険・保証料を一覧で理解できる記事にする。",
    suggestedSummary: ["賃貸は家賃以外にも初期費用がかかります。", "更新料や退去費用も契約前に確認したい項目です。", "契約書と国のガイドラインを見ながら判断しましょう。"],
    sourceCandidates: [{ publisher: "国土交通省", rank: "S", searchKeyword: "国土交通省 賃貸 退去 原状回復 ガイドライン", urlHint: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk3_000021.html" }, { publisher: "国民生活センター", rank: "A", searchKeyword: "国民生活センター 賃貸 原状回復 トラブル" }],
    priority: "高"
  },
  {
    id: "idea-rent-renewal-fee",
    title: "賃貸の更新料、いついくら来る？",
    category: "home",
    tags: ["更新料", "賃貸", "一人暮らし"],
    targetReader: "一人暮らし中の人",
    whyNow: "入居から1〜2年後に突然まとまって来る支払いとして忘れやすいです。",
    angle: "契約書で見る場所、地域差、更新月前の準備を説明する。",
    suggestedSummary: ["賃貸では契約更新時に更新料が発生する場合があります。", "金額や有無は契約内容や地域で変わります。", "契約書と管理会社からの案内を早めに確認しましょう。"],
    sourceCandidates: [{ publisher: "国土交通省", rank: "S", searchKeyword: "国土交通省 賃貸借契約 更新料" }, { publisher: "国民生活センター", rank: "A", searchKeyword: "国民生活センター 賃貸 更新料 相談" }],
    priority: "中"
  },
  {
    id: "idea-car-cost-total",
    title: "車は買ったあと毎月いくらかかる？",
    category: "car",
    tags: ["車", "維持費", "車検"],
    targetReader: "車を買いたい人・地方で車が必要な人",
    whyNow: "若者の大きな買い物で、購入後の維持費を見落としやすいです。",
    angle: "税金・保険・車検・駐車場・ガソリン・修理を“買った後”の出費として整理する。",
    suggestedSummary: ["車は本体価格だけでなく、維持費が続きます。", "税金・保険・車検・駐車場代を年額で見ると判断しやすくなります。", "購入前に通知や公式情報で確認しましょう。"],
    sourceCandidates: [{ publisher: "国土交通省", rank: "S", searchKeyword: "国土交通省 自動車重量税 車検", urlHint: "https://www.mlit.go.jp/jidosha/jidosha_fr1_000076.html" }, { publisher: "自治体公式サイト", rank: "S", searchKeyword: "自動車税 軽自動車税 自治体 公式" }],
    priority: "高"
  },
  {
    id: "idea-medical-high-cost",
    title: "入院費が高くなったときに使える制度",
    category: "health",
    tags: ["入院", "医療費", "高額療養費"],
    targetReader: "急な医療費が不安な人",
    whyNow: "医療費不安で受診を遅らせる前に知っておく価値があります。",
    angle: "高額療養費制度を、対象・申請先・注意点に分けてやさしく説明する。",
    suggestedSummary: ["医療費が高くなった場合に使える公的制度があります。", "年齢や所得、加入している健康保険で扱いが変わります。", "病院窓口や保険者に早めに確認しましょう。"],
    sourceCandidates: [{ publisher: "厚生労働省", rank: "S", searchKeyword: "厚生労働省 高額療養費制度", urlHint: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" }],
    priority: "高"
  },
  {
    id: "idea-injury-work-school",
    title: "ケガで働けない・学校に行けない時のお金",
    category: "health",
    tags: ["ケガ", "休業", "保険"],
    targetReader: "アルバイト・会社員・学生",
    whyNow: "事故やけがの時、医療費だけでなく収入減も問題になります。",
    angle: "傷病手当金、労災、学校保険などを“可能性がある制度”として紹介する。",
    suggestedSummary: ["ケガや病気では医療費だけでなく収入の不安も出ます。", "働き方や状況によって使える制度が変わります。", "会社・学校・保険者に確認しましょう。"],
    sourceCandidates: [{ publisher: "厚生労働省", rank: "S", searchKeyword: "厚生労働省 傷病手当金 労災 休業" }, { publisher: "日本年金機構・保険者", rank: "S", searchKeyword: "協会けんぽ 傷病手当金" }],
    priority: "中"
  },
  {
    id: "idea-cooling-off",
    title: "その契約、クーリング・オフできるかも",
    category: "consumer",
    tags: ["契約", "クーリングオフ", "消費者トラブル"],
    targetReader: "エステ・副業講座・訪問販売などを契約した人",
    whyNow: "若者が高額契約や勧誘で困った時に、早く知るほど役立ちます。",
    angle: "対象になる契約・期間・相談先を断定しすぎず整理する。",
    suggestedSummary: ["一部の契約は、一定期間内なら取り消せる場合があります。", "すべての契約が対象ではありません。", "迷ったら消費者ホットライン188へ相談しましょう。"],
    sourceCandidates: [{ publisher: "消費者庁", rank: "S", searchKeyword: "消費者庁 クーリングオフ", urlHint: "https://www.caa.go.jp/" }, { publisher: "国民生活センター", rank: "A", searchKeyword: "国民生活センター クーリングオフ" }],
    priority: "高"
  },
  {
    id: "idea-revolving-credit",
    title: "リボ払い・後払いで気をつけること",
    category: "consumer",
    tags: ["リボ払い", "後払い", "カード"],
    targetReader: "クレカや後払いを使い始めた人",
    whyNow: "少額に見える支払いが長期化しやすく、初見で仕組みが分かりにくいです。",
    angle: "手数料・支払総額・毎月の残高確認を、責めずに説明する。",
    suggestedSummary: ["リボ払いは毎月の支払いを一定にできますが、手数料がかかります。", "支払いが長引くと総額が増えることがあります。", "利用明細と支払い方法を確認しましょう。"],
    sourceCandidates: [{ publisher: "日本クレジット協会", rank: "B", searchKeyword: "日本クレジット協会 リボ払い 仕組み" }, { publisher: "国民生活センター", rank: "A", searchKeyword: "国民生活センター リボ払い トラブル" }],
    priority: "高"
  },
  {
    id: "idea-investment-scam",
    title: "絶対儲かると言われた時に確認すること",
    category: "investment",
    tags: ["投資詐欺", "SNS勧誘", "暗号資産"],
    targetReader: "SNSや友人から投資話を聞いた人",
    whyNow: "SNS勧誘・紹介制・高利回りの話は若者に刺さりやすく、被害も重くなりがちです。",
    angle: "詐欺と断定せず、送金前に止まるためのチェックリストを作る。",
    suggestedSummary: ["投資に絶対儲かるはありません。", "高利回り・紹介制・急かす話は慎重に確認しましょう。", "送金前に金融庁や消費生活センターの情報を見ましょう。"],
    sourceCandidates: [{ publisher: "金融庁", rank: "S", searchKeyword: "金融庁 詐欺的な投資勧誘 注意", urlHint: "https://www.fsa.go.jp/ordinary/chuui/attention.html" }, { publisher: "消費者庁", rank: "S", searchKeyword: "消費者庁 投資詐欺 相談" }],
    priority: "高"
  },
  {
    id: "idea-nisa-order",
    title: "NISAの前に生活防衛費を確認しよう",
    category: "investment",
    tags: ["NISA", "生活防衛費", "投資"],
    targetReader: "投資を始めたい人",
    whyNow: "NISAブームで始める前の順番を整理する記事が必要です。",
    angle: "制度説明よりも、生活費と投資資金を分ける実用記事にする。",
    suggestedSummary: ["NISAは投資の利益が非課税になる制度です。", "ただし投資なので元本割れがあります。", "生活防衛費を残してから始めると安心です。"],
    sourceCandidates: [{ publisher: "金融庁", rank: "S", searchKeyword: "金融庁 NISA 特設サイト", urlHint: "https://www.fsa.go.jp/policy/nisa2/" }, { publisher: "J-FLEC", rank: "A", searchKeyword: "J-FLEC 投資 リスク 生活防衛費" }],
    priority: "高"
  },
  {
    id: "idea-minimum-wage",
    title: "バイト代、最低賃金を下回ってない？",
    category: "work",
    tags: ["アルバイト", "最低賃金", "労働"],
    targetReader: "学生・フリーター",
    whyNow: "自分の時給が正しいか分からない人にとって実用性が高いテーマです。",
    angle: "地域別最低賃金、深夜割増、相談先を紹介する。",
    suggestedSummary: ["最低賃金は都道府県ごとに決まっています。", "深夜や残業では割増が関係する場合があります。", "不安な場合は労働局など公式窓口に相談できます。"],
    sourceCandidates: [{ publisher: "厚生労働省", rank: "S", searchKeyword: "厚生労働省 最低賃金 地域別" }, { publisher: "都道府県労働局", rank: "S", searchKeyword: "労働局 最低賃金 相談" }],
    priority: "中"
  },
  {
    id: "idea-unpaid-wages",
    title: "給料が振り込まれない時に最初にすること",
    category: "work",
    tags: ["未払い賃金", "アルバイト", "労働相談"],
    targetReader: "アルバイト・フリーター・新社会人",
    whyNow: "若者が泣き寝入りしやすいテーマで、行動手順が役立ちます。",
    angle: "証拠を残す、勤務先に確認、労働基準監督署等へ相談の流れを説明する。",
    suggestedSummary: ["給料の未払いは放置しない方がいい問題です。", "勤務記録ややり取りを残しておきましょう。", "解決しない場合は公的窓口へ相談できます。"],
    sourceCandidates: [{ publisher: "厚生労働省", rank: "S", searchKeyword: "厚生労働省 未払い賃金 相談" }, { publisher: "労働基準監督署", rank: "S", searchKeyword: "労働基準監督署 賃金未払い" }],
    priority: "高"
  },
  {
    id: "idea-wedding-funeral-money",
    title: "ご祝儀・香典、急に必要になるお金",
    category: "ceremony",
    tags: ["冠婚葬祭", "ご祝儀", "香典"],
    targetReader: "社会人になったばかりの人",
    whyNow: "金額相場そのものより、急な移動費・服装・宿泊費も含めた準備が必要です。",
    angle: "地域差・関係性の差を断定せず、急な出費として備える記事にする。",
    suggestedSummary: ["冠婚葬祭では、ご祝儀や香典以外にも移動費がかかることがあります。", "金額は地域や関係性で変わります。", "迷ったら家族や信頼できる人に確認しましょう。"],
    sourceCandidates: [{ publisher: "自治体・公的相談機関", rank: "A", searchKeyword: "冠婚葬祭 香典 ご祝儀 公的 相談" }],
    priority: "中"
  },
  {
    id: "idea-donation-trouble",
    title: "高額な寄付・献金を求められた時の相談先",
    category: "religion",
    tags: ["高額献金", "勧誘", "消費者トラブル"],
    targetReader: "高額な寄付や勧誘で不安がある人",
    whyNow: "思想や信仰の評価ではなく、お金と契約・相談先の情報として必要です。",
    angle: "特定宗教を評価せず、高額支出や勧誘トラブルの相談先に限定する。",
    suggestedSummary: ["高額な寄付や献金で生活が苦しくなる場合は相談できます。", "信仰内容の良し悪しではなく、お金と生活の問題として考えます。", "公的相談窓口や専門機関に早めに相談しましょう。"],
    sourceCandidates: [{ publisher: "消費者庁", rank: "S", searchKeyword: "消費者庁 霊感商法 寄付 相談" }, { publisher: "国民生活センター", rank: "A", searchKeyword: "国民生活センター 霊感商法 高額献金" }],
    priority: "中"
  },
  {
    id: "idea-moving-procedures",
    title: "引っ越したら必要なお金と手続き",
    category: "local",
    tags: ["引っ越し", "転入届", "住所変更"],
    targetReader: "実家を出る人・転居する人",
    whyNow: "引っ越しはお金と行政手続きが同時に来るため、抜け漏れしやすいです。",
    angle: "転入届・国保・年金・ライフライン・免許証などをチェックリスト化する。",
    suggestedSummary: ["引っ越し後は住所に関係する手続きがあります。", "国保や年金など、人によって必要な手続きが変わります。", "市区町村の公式ページで期限を確認しましょう。"],
    sourceCandidates: [{ publisher: "自治体公式サイト", rank: "S", searchKeyword: "市区町村 引っ越し 転入届 手続き" }, { publisher: "マイナポータル", rank: "S", searchKeyword: "マイナポータル 引越し 手続き" }],
    priority: "高"
  },
  {
    id: "idea-election-moving",
    title: "引っ越したら投票はどこでできる？",
    category: "election",
    tags: ["選挙", "引っ越し", "期日前投票"],
    targetReader: "選挙前に引っ越した人・初めて投票する人",
    whyNow: "政治的誘導ではなく、手続きとして知らないと投票機会を逃しやすいです。",
    angle: "支持政党ではなく、投票場所・期日前投票・住民票移動に限定する。",
    suggestedSummary: ["投票できる場所は、住民票や選挙人名簿と関係します。", "引っ越し直後は確認が必要な場合があります。", "自治体や総務省の公式情報を見ましょう。"],
    sourceCandidates: [{ publisher: "総務省", rank: "S", searchKeyword: "総務省 選挙 引っ越し 投票 期日前投票" }, { publisher: "自治体選挙管理委員会", rank: "S", searchKeyword: "市区町村 選挙管理委員会 投票 引っ越し" }],
    priority: "中"
  },
  {
    id: "idea-my-number-card-lost",
    title: "マイナンバーカードをなくした時の手続き",
    category: "law",
    tags: ["マイナンバー", "紛失", "手続き"],
    targetReader: "身分証をなくして不安な人",
    whyNow: "個人情報そのものは取得せず、紛失時の公式手続きだけ案内する価値があります。",
    angle: "停止連絡・再発行・本人確認書類を、公式窓口確認前提で説明する。",
    suggestedSummary: ["マイナンバーカードをなくしたら、まず利用停止の手続きが必要です。", "再発行には市区町村での手続きが関係します。", "公式窓口で最新情報を確認しましょう。"],
    sourceCandidates: [{ publisher: "マイナンバーカード総合サイト", rank: "S", searchKeyword: "マイナンバーカード 紛失 利用停止 再発行 公式" }, { publisher: "自治体公式サイト", rank: "S", searchKeyword: "市区町村 マイナンバーカード 紛失 再発行" }],
    priority: "中"
  },
  {
    id: "idea-phone-contract",
    title: "スマホ契約で見落としやすいお金",
    category: "consumer",
    tags: ["スマホ", "契約", "解約"],
    targetReader: "スマホを自分名義で契約する人",
    whyNow: "端末代・通信料・オプション・解約条件を混同しやすいテーマです。",
    angle: "月額だけでなく、端末分割・オプション・契約条件を確認する記事にする。",
    suggestedSummary: ["スマホ契約は月額料金だけでは判断しにくいことがあります。", "端末代・オプション・解約条件も確認しましょう。", "分からない場合は契約書面や公的相談窓口を確認できます。"],
    sourceCandidates: [{ publisher: "総務省", rank: "S", searchKeyword: "総務省 携帯電話 契約 トラブル" }, { publisher: "国民生活センター", rank: "A", searchKeyword: "国民生活センター スマホ 契約 トラブル" }],
    priority: "高"
  },
  {
    id: "idea-disaster-money",
    title: "災害時に必要になるお金と手続き",
    category: "life",
    tags: ["防災", "保険", "罹災証明"],
    targetReader: "一人暮らし・実家を出た人",
    whyNow: "防災用品だけでなく、被災後の証明書や保険請求も生活に直結します。",
    angle: "罹災証明・保険・現金・避難用品をお金と手続きの視点で整理する。",
    suggestedSummary: ["災害時は生活用品だけでなく、お金と手続きも必要になります。", "罹災証明や保険請求が関係する場合があります。", "自治体と内閣府・消防庁などの公式情報を確認しましょう。"],
    sourceCandidates: [{ publisher: "内閣府防災", rank: "S", searchKeyword: "内閣府 防災 罹災証明 生活再建" }, { publisher: "自治体公式サイト", rank: "S", searchKeyword: "市区町村 罹災証明 申請" }],
    priority: "中"
  },
  {
    id: "idea-furusato-tax-first",
    title: "ふるさと納税、始める前に確認すること",
    category: "tax",
    tags: ["ふるさと納税", "控除", "年末"],
    targetReader: "ふるさと納税を初めて使う人",
    whyNow: "SNSで得に見えやすい一方、控除上限や手続きの誤解が起きやすいです。",
    angle: "買い物ではなく寄附と控除の制度として、上限・手続き・期限を説明する。",
    suggestedSummary: ["ふるさと納税は寄附に対する税の制度です。", "控除上限や手続き方法を確認する必要があります。", "総務省や自治体の公式情報を確認しましょう。"],
    sourceCandidates: [{ publisher: "総務省", rank: "S", searchKeyword: "総務省 ふるさと納税 公式 控除 上限" }],
    priority: "中"
  }
];

export function recommendArticleIdeas(existingArticles: DareoshiArticle[], limit = 20): ArticleIdea[] {
  const existingTitleSet = new Set(existingArticles.map((article) => article.title.trim()).filter(Boolean));
  return articleIdeaBank.slice(0, limit).map((idea) => ({
    ...idea,
    isAlreadyCreated: existingTitleSet.has(idea.title)
  }));
}

export function articleFromIdea(idea: ArticleIdea): DareoshiArticle {
  const now = todayIso();
  return {
    id: createId("article"),
    title: idea.title,
    category: idea.category,
    tags: idea.tags,
    summary3Lines: idea.suggestedSummary,
    easyExplanation: "",
    relatedPeople: [idea.targetReader],
    actionItems: [],
    riskIfIgnored: "",
    officialSources: idea.sourceCandidates.map((candidate) => ({
      id: createId("source"),
      title: candidate.searchKeyword,
      url: "",
      publisher: candidate.publisher,
      rank: candidate.rank,
      checkedAt: "",
      note: `公式URLを検索して貼る。検索候補：${candidate.searchKeyword}${candidate.urlHint ? ` / URL候補：${candidate.urlHint}` : ""}`
    })),
    lastCheckedAt: "",
    nextReviewAt: "",
    status: "draft",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。詳細な条件や最新情報は、必ず公式ページを確認してください。",
    createdAt: now,
    updatedAt: now
  };
}

export function emptyForecastCard(): ForecastCard {
  const now = todayIso();
  return {
    id: createId("forecast"),
    title: "",
    category: "tax",
    displayMonths: [],
    targetConditions: [],
    estimateAmountText: "",
    timingText: "",
    reasonText: "",
    actionItems: [],
    label: "要確認",
    officialSources: [emptySource()],
    lastCheckedAt: now,
    nextReviewAt: "",
    status: "draft",
    createdAt: now,
    updatedAt: now
  };
}

export function emptyLocalInfoCard(): LocalInfoCard {
  const now = todayIso();
  return {
    id: createId("local"),
    prefecture: "",
    city: "",
    title: "",
    type: "その他",
    summary3Lines: ["", "", ""],
    easyExplanation: "",
    targetText: "",
    amountText: "",
    startDate: "",
    deadline: "",
    officialSources: [emptySource()],
    lastCheckedAt: now,
    nextReviewAt: "",
    status: "draft",
    createdAt: now,
    updatedAt: now
  };
}

export const defaultCmsData: CmsData = {
  sources: [
    {
      id: "source-mof-resident-tax",
      title: "住民税について教えてください。所得税とはどう違うのですか",
      url: "https://www.mof.go.jp/tax_information/qanda020.html",
      publisher: "財務省",
      rank: "S",
      checkedAt: "2026-06-27",
      note: "住民税の基本説明"
    },
    {
      id: "source-nta-tax-return",
      title: "給与所得者で確定申告が必要な人",
      url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm",
      publisher: "国税庁",
      rank: "S",
      checkedAt: "2026-06-27",
      note: "副業・給与所得者向け"
    },
    {
      id: "source-caa-hotline",
      title: "消費者ホットライン",
      url: "https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/",
      publisher: "消費者庁",
      rank: "S",
      checkedAt: "2026-06-27",
      note: "消費者トラブル相談"
    }
  ],
  articles: [
    {
      id: "article-resident-tax",
      title: "社会人2年目、手取りが減るって本当？",
      category: "tax",
      tags: ["住民税", "会社員", "社会人2年目"],
      summary3Lines: [
        "住民税は、前年の収入などに応じてかかる地方税です。",
        "会社員は6月ごろから給与明細に反映されることがあります。",
        "社会人2年目・退職後・副業ありの人は、特に確認しておきたい税金です。"
      ],
      easyExplanation: "住民税は、住んでいる地域のサービスを支えるためのお金です。前年の収入をもとに翌年払う形になるため、働き始めた翌年や退職後に急に来たと感じやすい税金です。",
      relatedPeople: ["新社会人2年目の人", "退職・転職をした人", "副業をしている人", "自宅に納付書が届いた人"],
      actionItems: ["給与明細を見る", "自宅に届いた封筒を確認する", "分からなければ市区町村に確認する", "支払いが難しい場合は放置せず相談する"],
      riskIfIgnored: "支払いを放置すると、督促や延滞金につながる可能性があります。難しい場合は、早めに自治体や窓口に相談しましょう。",
      officialSources: [
        {
          id: "source-mof-resident-tax",
          title: "住民税について教えてください。所得税とはどう違うのですか",
          url: "https://www.mof.go.jp/tax_information/qanda020.html",
          publisher: "財務省",
          rank: "S",
          checkedAt: "2026-06-27"
        }
      ],
      lastCheckedAt: "2026-06-27",
      nextReviewAt: "2026-12-27",
      status: "published",
      disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。詳細な条件や最新情報は、必ず公式ページを確認してください。",
      createdAt: "2026-06-27",
      updatedAt: "2026-06-27"
    },
    {
      id: "article-investment-check",
      title: "NISAを始める前に確認すること",
      category: "investment",
      tags: ["NISA", "生活防衛費", "投資詐欺"],
      summary3Lines: [
        "NISAは投資で得た利益が非課税になる制度です。",
        "ただし、投資なので元本割れの可能性があります。",
        "生活防衛費と怪しい誘いへの注意を確認してから始めましょう。"
      ],
      easyExplanation: "NISAは制度として便利ですが、投資そのものは必ず増えるものではありません。生活費や急な出費の備えを残したうえで、自分が理解できる商品から考えるのが安全です。",
      relatedPeople: ["NISAを始めたい人", "投資に興味がある人", "SNSで投資話を見た人"],
      actionItems: ["生活防衛費を確認する", "元本割れの意味を確認する", "急かす勧誘は一度止まる"],
      riskIfIgnored: "生活費を削って投資したり、怪しい勧誘に乗ると、損失や契約トラブルにつながる可能性があります。",
      officialSources: [
        {
          id: "source-fsa-nisa",
          title: "NISA特設ウェブサイト",
          url: "https://www.fsa.go.jp/policy/nisa2/",
          publisher: "金融庁",
          rank: "S",
          checkedAt: "2026-06-27"
        }
      ],
      lastCheckedAt: "2026-06-27",
      nextReviewAt: "2026-09-30",
      status: "review",
      disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。投資判断は自分で理解したうえで行い、最新情報は公式ページを確認してください。",
      createdAt: "2026-06-27",
      updatedAt: "2026-06-27"
    },
    {
      id: "article-draft-local",
      title: "地域の給付金を見るときの注意",
      category: "local",
      tags: ["地域制度", "給付金"],
      summary3Lines: [],
      easyExplanation: "",
      relatedPeople: ["自治体の制度を調べたい人"],
      actionItems: [],
      riskIfIgnored: "期限や対象条件を見落とすと、申請できる制度を逃す可能性があります。",
      officialSources: [],
      lastCheckedAt: "",
      nextReviewAt: "",
      status: "draft",
      disclaimer: "自治体ごとに条件が異なります。申請前に必ず公式ページを確認してください。",
      createdAt: "2026-06-27",
      updatedAt: "2026-06-27"
    }
  ],
  forecastCards: [
    {
      id: "forecast-resident-tax",
      title: "住民税の確認",
      category: "tax",
      displayMonths: [6],
      targetConditions: ["会社員", "社会人2年目", "副業あり", "退職予定"],
      estimateAmountText: "数千円〜数万円/月",
      timingText: "6月ごろ通知が多い",
      reasonText: "前年の収入に応じて、6月ごろから住民税の支払いが始まることがあります。",
      actionItems: ["給与明細を見る", "自宅に届いた書類を確認する", "分からなければ市区町村に確認する"],
      label: "要確認",
      officialSources: [
        {
          id: "source-mof-resident-tax",
          title: "住民税について教えてください。所得税とはどう違うのですか",
          url: "https://www.mof.go.jp/tax_information/qanda020.html",
          publisher: "財務省",
          rank: "S",
          checkedAt: "2026-06-27"
        }
      ],
      lastCheckedAt: "2026-06-27",
      nextReviewAt: "2026-12-27",
      status: "published",
      createdAt: "2026-06-27",
      updatedAt: "2026-06-27"
    },
    {
      id: "forecast-side-job-tax",
      title: "副業の確定申告準備",
      category: "work",
      displayMonths: [1, 2, 3],
      targetConditions: ["副業あり", "個人活動中"],
      estimateAmountText: "利益・経費で変動",
      timingText: "2〜3月ごろ",
      reasonText: "副業収入がある人は、確定申告や住民税の確認が必要になる可能性があります。",
      actionItems: ["売上と経費を分けて記録する", "源泉徴収や支払調書を保存する", "国税庁の案内を確認する"],
      label: "公式確認推奨",
      officialSources: [
        {
          id: "source-nta-tax-return",
          title: "給与所得者で確定申告が必要な人",
          url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm",
          publisher: "国税庁",
          rank: "S",
          checkedAt: "2026-06-27"
        }
      ],
      lastCheckedAt: "2026-06-27",
      nextReviewAt: "2026-11-30",
      status: "review",
      createdAt: "2026-06-27",
      updatedAt: "2026-06-27"
    }
  ],
  localInfoCards: [
    {
      id: "local-gifu-sample",
      prefecture: "岐阜県",
      city: "岐阜市",
      title: "若者向け支援制度の確認枠",
      type: "若者支援",
      summary3Lines: [
        "地域制度は自治体ごとに内容が変わります。",
        "対象者・期限・申請方法を公式ページで確認する必要があります。",
        "このカードは将来の地域情報表示のサンプルです。"
      ],
      easyExplanation: "だれおし本体では、将来的に自治体ごとの給付金・商品券・若者向け支援などを表示する予定です。MVPでは実データ連携をしていないため、必ず自治体公式サイトで確認する前提です。",
      targetText: "岐阜市に住んでいる人、または引っ越し予定がある人",
      amountText: "制度により異なる",
      startDate: "2026-04-01",
      deadline: "2026-05-31",
      officialSources: [
        {
          id: "source-gifu-city",
          title: "岐阜市公式ホームページ",
          url: "https://www.city.gifu.lg.jp/",
          publisher: "岐阜市",
          rank: "S",
          checkedAt: "2026-06-27",
          note: "サンプル。実制度掲載前に該当ページへ差し替え"
        }
      ],
      lastCheckedAt: "2026-06-27",
      nextReviewAt: "2026-07-27",
      status: "expired",
      createdAt: "2026-06-27",
      updatedAt: "2026-06-27"
    }
  ]
};

export function normalizeCmsData(raw: unknown): CmsData {
  const data = raw as Partial<CmsData>;
  return {
    articles: Array.isArray(data.articles) ? data.articles : defaultCmsData.articles,
    forecastCards: Array.isArray(data.forecastCards) ? data.forecastCards : defaultCmsData.forecastCards,
    localInfoCards: Array.isArray(data.localInfoCards) ? data.localInfoCards : defaultCmsData.localInfoCards,
    sources: Array.isArray(data.sources) ? data.sources : defaultCmsData.sources
  };
}

export function collectSources(data: CmsData) {
  const map = new Map<string, SourceInfo>();
  for (const source of data.sources) map.set(source.id, source);
  for (const article of data.articles) {
    for (const source of article.officialSources) map.set(source.id, source);
  }
  for (const card of data.forecastCards) {
    for (const source of card.officialSources) map.set(source.id, source);
  }
  for (const card of data.localInfoCards) {
    for (const source of card.officialSources) map.set(source.id, source);
  }
  return Array.from(map.values());
}

export function exportCmsJson(data: CmsData, includeReview: boolean) {
  const allowedStatuses: ContentStatus[] = includeReview ? ["published", "review"] : ["published"];
  return {
    articles: data.articles.filter((item) => allowedStatuses.includes(item.status)),
    forecastCards: data.forecastCards.filter((item) => allowedStatuses.includes(item.status)),
    localInfoCards: data.localInfoCards.filter((item) => allowedStatuses.includes(item.status)),
    sources: collectSources(data)
  };
}
