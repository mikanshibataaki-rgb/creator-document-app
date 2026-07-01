export type Screen =
  | "onboarding"
  | "diagnosis"
  | "diagnosisResult"
  | "home"
  | "search"
  | "forecast"
  | "road"
  | "goal"
  | "guides"
  | "article"
  | "suspicious"
  | "profile";

export type PlayerProfile = {
  onboardingDone: boolean;
  ageRange: string;
  job: string;
  incomeRange: string;
  grossMonthlyIncome: number;
  savingsRange: string;
  living: string;
  prefecture: string;
  city: string;
  hasCar: boolean;
  sideHustle: boolean;
  retirementPlan: boolean;
  investmentInterest: boolean;
};

export type SavingsGoal = {
  name: string;
  amount: number;
  months: number;
};

export type SourceRank = "S" | "A" | "B" | "C" | "D";

export type SourceInfo = {
  title: string;
  url: string;
  publisher: string;
  rank: SourceRank;
  checkedAt: string;
};

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type AmountConfidence = "fixed" | "estimate" | "range" | "unknown";

export type OfficialLink = {
  title: string;
  url: string;
  sourceName: string;
  purpose: string;
};

export type ArticleCategory =
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
  | "religion"
  | "election"
  | "life";

export type DareoshiArticle = {
  id: string;
  title: string;
  category: ArticleCategory;
  whatIsThis?: string;
  summary3Lines: string[];
  easyExplanation: string;
  relatedPeople: string[];
  timingText?: string;
  actionItems: string[];
  riskIfIgnored: string;
  officialSources: SourceInfo[];
  officialLinks?: OfficialLink[];
  officialCheckItems?: string[];
  lastUpdatedAt?: string;
  lastCheckedAt: string;
  nextReviewAt?: string;
  riskLevel?: RiskLevel;
  amountConfidence?: AmountConfidence;
  status: "draft" | "review" | "published" | "expired";
  disclaimer: string;
  minutes: string;
  icon: string;
  tone: string;
};

export type DareoshiData = {
  profile: PlayerProfile;
  goal: SavingsGoal;
  emergencyChecks: string[];
  suspiciousChecks: string[];
  forecastActuals: Record<string, number>;
};

export type GuideArticle = DareoshiArticle;
