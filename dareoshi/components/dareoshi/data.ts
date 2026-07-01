import type { DareoshiData, GuideArticle } from "./types";

export const STORAGE_KEY = "dareoshi-pop-v4";
export const LEGACY_STORAGE_KEY = "dareoshi-mvp-v1";
export const BETA_NOTICE = "だれおしは現在ベータ版です。表示内容は一般的な情報・目安であり、制度や金額は変更される場合があります。";

export const dangerousPhrases = [
  "必ず",
  "絶対",
  "申請できます",
  "もらえます",
  "対象です",
  "必要です",
  "入るべきです",
  "大丈夫です",
  "税金が安くなります",
  "必ず得します",
] as const;

export function warnDangerousPhrases(label: string, items: unknown[]) {
  if (process.env.NODE_ENV === "production") return;
  items.forEach((item, index) => {
    const text = JSON.stringify(item);
    const hits = dangerousPhrases.filter((phrase) => text.includes(phrase));
    if (hits.length) {
      console.warn(`[だれおし dangerousPhrases] ${label}[${index}] に断定的に見える表現があります: ${hits.join(", ")}`);
    }
  });
}

export const defaultData: DareoshiData = {
  profile: {
    onboardingDone: false,
    ageRange: "24〜26歳",
    job: "会社員",
    incomeRange: "300〜399万円",
    grossMonthlyIncome: 250000,
    savingsRange: "5〜15万円",
    living: "一人暮らし",
    prefecture: "",
    city: "",
    hasCar: false,
    sideHustle: false,
    retirementPlan: false,
    investmentInterest: true,
  },
  goal: { name: "ほしい車", amount: 2000000, months: 36 },
  emergencyChecks: [],
  suspiciousChecks: [],
  forecastActuals: {},
};

export const guides: GuideArticle[] = [
  {
    id: "resident-tax",
    category: "tax",
    title: "社会人2年目、手取りが減るって本当？",
    summary3Lines: [
      "住民税は、前年の収入などに応じてかかる地方税です。",
      "会社員は6月ごろから給与明細に反映されることがあります。",
      "社会人2年目・退職後・副業ありの人は、特に確認しておきたい税金です。",
    ],
    easyExplanation: "住民税は、住んでいる地域のサービスを支えるためのお金です。所得税と違い、前年の収入をもとに翌年払う形になるため、働き始めた翌年や退職後に「急に来た」と感じやすい税金です。",
    relatedPeople: ["新社会人2年目の人", "退職・転職をした人", "副業をしている人", "自宅に納付書が届いた人"],
    actionItems: ["給与明細を見る", "自宅に届いた封筒を確認する", "分からなければ市区町村に確認する", "支払いが難しい場合は放置せず相談する"],
    riskIfIgnored: "支払いを放置すると、督促や延滞金につながる可能性があります。難しい場合は、早めに自治体や窓口に相談しましょう。",
    officialSources: [
      {
        title: "住民税について教えてください。所得税とはどう違うのですか",
        url: "https://www.mof.go.jp/tax_information/qanda020.html",
        publisher: "財務省",
        rank: "S",
        checkedAt: "2026-06-27",
      },
    ],
    lastCheckedAt: "2026-06-27",
    nextReviewAt: "2026-12-27",
    status: "review",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。詳細な条件や最新情報は公式ページを確認してください。",
    minutes: "3分",
    icon: "🧾",
    tone: "bg-lemon text-ink",
  },
  {
    id: "move-out",
    category: "home",
    title: "退去費用でびっくりしないために",
    summary3Lines: [
      "賃貸では、更新料・火災保険・退去費用が発生することがあります。",
      "退去時の原状回復は、契約内容や使い方で負担が変わります。",
      "引っ越し前に契約書と管理会社からの案内を確認しておくと安心です。",
    ],
    easyExplanation: "家賃だけを見ていると、更新や退去のタイミングでまとまった出費に驚くことがあります。特に原状回復は、通常の古くなり方なのか、自分の不注意による傷や汚れなのかで扱いが変わります。",
    relatedPeople: ["一人暮らしの人", "引っ越し予定がある人", "賃貸更新月が近い人", "退去費用が不安な人"],
    actionItems: ["契約書を見る", "更新月と更新料を確認する", "入居時の写真があれば残しておく", "退去前に管理会社へ確認する"],
    riskIfIgnored: "条件を知らないまま退去すると、想定外の請求に驚くことがあります。納得できない請求がある場合は、消費生活センターなどに相談できます。",
    officialSources: [
      {
        title: "原状回復をめぐるトラブルとガイドライン",
        url: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk3_000021.html",
        publisher: "国土交通省",
        rank: "S",
        checkedAt: "2026-06-27",
      },
      {
        title: "賃貸住宅の原状回復トラブル",
        url: "https://www.kokusen.go.jp/soudan_topics/data/chintai.html",
        publisher: "国民生活センター",
        rank: "A",
        checkedAt: "2026-06-27",
      },
    ],
    lastCheckedAt: "2026-06-27",
    nextReviewAt: "2026-12-27",
    status: "review",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。契約内容や地域によって条件が変わるため、契約書と公式情報を確認してください。",
    minutes: "4分",
    icon: "🏠",
    tone: "bg-mint text-ink",
  },
  {
    id: "car-cost",
    category: "car",
    title: "車は本体価格だけでは買えない",
    summary3Lines: [
      "車は買ったあとも、税金・保険・車検・駐車場代がかかります。",
      "車検では重量税など、車種や時期で変わる費用があります。",
      "購入前に、毎月と年1回の維持費を分けて見ておきましょう。",
    ],
    easyExplanation: "車の出費は、本体価格だけでは終わりません。毎月の駐車場・保険・ガソリンに加えて、税金や車検のように年単位で来る支払いもあります。買えるかどうかは、購入後の維持費まで含めて考えるのが安全です。",
    relatedPeople: ["車を持っている人", "車を買いたい人", "地方で車が必要な人", "初めて車検を受ける人"],
    actionItems: ["車検月を確認する", "保険の更新月を見る", "駐車場代を毎月費に入れる", "税金と車検費用を年額でメモする"],
    riskIfIgnored: "車検や税金の時期にまとまった出費が重なると、生活費やほしいもの計画に影響することがあります。通知書や契約内容を早めに確認しましょう。",
    officialSources: [
      {
        title: "自動車重量税額について",
        url: "https://www.mlit.go.jp/jidosha/jidosha_fr1_000076.html",
        publisher: "国土交通省",
        rank: "S",
        checkedAt: "2026-06-27",
      },
      {
        title: "次回自動車重量税額照会サービス",
        url: "https://www.nextmvtt.mlit.go.jp/",
        publisher: "国土交通省",
        rank: "S",
        checkedAt: "2026-06-27",
      },
    ],
    lastCheckedAt: "2026-06-27",
    nextReviewAt: "2026-12-27",
    status: "review",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。車種・地域・契約で費用が変わるため、通知書や公式サービスで確認してください。",
    minutes: "5分",
    icon: "🚗",
    tone: "bg-coral text-white",
  },
  {
    id: "hospital",
    category: "life",
    title: "もし明日、入院したらいくら必要？",
    summary3Lines: [
      "病気やけがでは、医療費だけでなく生活費の不安も出ます。",
      "医療費が高くなった場合に使える公的制度があります。",
      "困ったときは、病院窓口や加入している健康保険に確認しましょう。",
    ],
    easyExplanation: "急な入院や通院は、金額が読みにくい出費です。ただし、日本には医療費の自己負担が重くなりすぎないようにする制度があります。まずは保険証、限度額、勤務先や学校の制度を確認するのが大切です。",
    relatedPeople: ["一人暮らしの人", "貯金が少なめの人", "健康保険の仕組みが不安な人", "急な医療費が心配な人"],
    actionItems: ["保険証を確認する", "高額療養費制度を調べる", "勤務先・学校の制度を確認する", "不安な場合は病院窓口で相談する"],
    riskIfIgnored: "費用が怖くて受診を遅らせると、体調も出費も悪化することがあります。支払いが不安なときは、早めに窓口へ相談しましょう。",
    officialSources: [
      {
        title: "高額療養費制度を利用される皆さまへ",
        url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html",
        publisher: "厚生労働省",
        rank: "S",
        checkedAt: "2026-06-27",
      },
    ],
    lastCheckedAt: "2026-06-27",
    nextReviewAt: "2026-12-27",
    status: "review",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。所得・年齢・加入している健康保険で条件が変わるため、公式情報や窓口を確認してください。",
    minutes: "4分",
    icon: "🏥",
    tone: "bg-sky text-ink",
  },
  {
    id: "nisa",
    category: "investment",
    title: "NISAを始める、その前に",
    summary3Lines: [
      "NISAは投資で得た利益が非課税になる制度です。",
      "ただし、投資なので元本割れの可能性があります。",
      "生活防衛費と怪しい誘いへの注意を確認してから始めましょう。",
    ],
    easyExplanation: "NISAは制度として便利に使える場合がありますが、投資そのものは増えるとは限りません。生活費や急な出費の備えを残したうえで、自分が理解できる商品から考えるのが安全です。強い利益を約束するような話とは分けて考えましょう。",
    relatedPeople: ["NISAを始めたい人", "投資に興味がある人", "SNSで投資話を見た人", "生活費と投資資金が混ざっている人"],
    actionItems: ["生活防衛費を確認する", "毎月いくらまでなら無理がないか決める", "元本割れの意味を確認する", "急かす勧誘は一度止まる"],
    riskIfIgnored: "生活費を削って投資したり、怪しい勧誘に乗ると、損失や契約トラブルにつながる可能性があります。契約や送金の前に公式情報を確認しましょう。",
    officialSources: [
      {
        title: "NISA特設ウェブサイト",
        url: "https://www.fsa.go.jp/policy/nisa2/",
        publisher: "金融庁",
        rank: "S",
        checkedAt: "2026-06-27",
      },
      {
        title: "詐欺的な投資勧誘等にご注意ください",
        url: "https://www.fsa.go.jp/ordinary/chuui/attention.html",
        publisher: "金融庁",
        rank: "S",
        checkedAt: "2026-06-27",
      },
    ],
    lastCheckedAt: "2026-06-27",
    nextReviewAt: "2026-12-27",
    status: "review",
    disclaimer: "この説明は、公式情報をもとに、だれおし向けに要約・再構成しています。投資判断は自分で理解したうえで行い、最新情報は公式ページを確認してください。",
    minutes: "3分",
    icon: "🌱",
    tone: "bg-lavender text-ink",
  },
];

warnDangerousPhrases("guides", guides);

export const roadEvents = [
  { month: "1月", title: "源泉徴収票・家計見直し", sub: "前年の収入と控除を確認", icon: "🧾", tone: "bg-lemon" },
  { month: "2月", title: "確定申告の準備", sub: "副業・医療費・控除を整理", icon: "📄", tone: "bg-lavender" },
  { month: "3月", title: "確定申告・引っ越し", sub: "申告期限と初期費用に注意", icon: "📦", tone: "bg-sky" },
  { month: "4月", title: "新生活・国保・年金", sub: "退職や転居後の手続き", icon: "🌸", tone: "bg-mint" },
  { month: "5月", title: "自動車税・軽自動車税", sub: "車ありなら通知を確認", icon: "🚗", tone: "bg-orange" },
  { month: "6月", title: "住民税の通知・給与明細確認", sub: "手取りが変わることも", icon: "📬", tone: "bg-coral text-white" },
  { month: "7月", title: "予定納税の確認", sub: "対象者は通知内容を確認", icon: "🗓️", tone: "bg-sky" },
  { month: "8月", title: "帰省・旅行・冠婚葬祭", sub: "移動費と急な予定を見ておく", icon: "🧳", tone: "bg-lemon" },
  { month: "9月", title: "保険更新・車検確認", sub: "契約更新と期限を確認", icon: "🛡️", tone: "bg-mint" },
  { month: "10月", title: "住民税普通徴収・賃貸更新", sub: "納付書と契約書を確認", icon: "🏠", tone: "bg-lavender" },
  { month: "11月", title: "予定納税の確認", sub: "対象者は支払い時期を確認", icon: "📌", tone: "bg-sky" },
  { month: "12月", title: "年末調整・保険料控除・ふるさと納税", sub: "書類と期限を確認", icon: "🎁", tone: "bg-coral text-white" },
];

export function yen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function monthlySaving(goal: DareoshiData["goal"]) {
  return Math.ceil(goal.amount / Math.max(goal.months, 1) / 100) * 100;
}

export function takeHomeEstimate(profile: DareoshiData["profile"]) {
  const gross = Number.isFinite(profile.grossMonthlyIncome) && profile.grossMonthlyIncome > 0 ? profile.grossMonthlyIncome : 0;
  const rate = profile.job === "会社員"
    ? gross >= 300000 ? 0.22 : gross >= 200000 ? 0.2 : 0.17
    : profile.job === "個人活動中" ? 0.18
      : profile.job === "フリーター" ? 0.14
        : 0.08;
  const deduction = Math.ceil((gross * rate) / 1000) * 1000;
  const takeHome = Math.max(0, gross - deduction);
  const socialInsurance = profile.job === "会社員" ? Math.round(deduction * 0.65) : Math.round(deduction * 0.45);
  const taxAndOther = Math.max(0, deduction - socialInsurance);
  return {
    gross,
    takeHome,
    deduction,
    deductionRate: Math.round(rate * 100),
    socialInsurance,
    taxAndOther,
    note: "勤務先・扶養・地域・保険・年齢で変わるため、正確な給与計算ではなく目安です。",
  };
}

export function normalizeData(raw: unknown): DareoshiData {
  const saved = raw as {
    profile?: Record<string, unknown>;
    goal?: Partial<DareoshiData["goal"]>;
    emergencyChecks?: unknown;
    suspiciousChecks?: unknown;
    forecastActuals?: unknown;
  };
  const profile: Record<string, unknown> = saved.profile ?? {};
  const rawActuals = saved.forecastActuals && typeof saved.forecastActuals === "object" ? saved.forecastActuals as Record<string, unknown> : {};
  const forecastActuals: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawActuals)) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) forecastActuals[key] = amount;
  }
  return {
    profile: {
      ...defaultData.profile,
      onboardingDone: Boolean(profile.onboardingDone),
      ageRange: String(profile.ageRange ?? defaultData.profile.ageRange),
      job: String(profile.job ?? profile.work ?? defaultData.profile.job),
      incomeRange: String(profile.incomeRange ?? defaultData.profile.incomeRange),
      grossMonthlyIncome: Number.isFinite(Number(profile.grossMonthlyIncome)) ? Number(profile.grossMonthlyIncome) : defaultData.profile.grossMonthlyIncome,
      savingsRange: String(profile.savingsRange ?? defaultData.profile.savingsRange),
      living: String(profile.living ?? defaultData.profile.living),
      prefecture: String(profile.prefecture ?? ""),
      city: String(profile.city ?? ""),
      hasCar: Boolean(profile.hasCar ?? profile.car),
      sideHustle: Boolean(profile.sideHustle ?? profile.sideJob),
      retirementPlan: Boolean(profile.retirementPlan),
      investmentInterest: Boolean(profile.investmentInterest),
    },
    goal: {
      name: String(saved.goal?.name ?? defaultData.goal.name),
      amount: Number(saved.goal?.amount ?? defaultData.goal.amount),
      months: Math.max(1, Number(saved.goal?.months ?? defaultData.goal.months)),
    },
    emergencyChecks: Array.isArray(saved.emergencyChecks) ? saved.emergencyChecks : [],
    suspiciousChecks: Array.isArray(saved.suspiciousChecks) ? saved.suspiciousChecks : [],
    forecastActuals,
  };
}
