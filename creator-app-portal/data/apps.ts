export type PortalApp = {
  id: string;
  name: string;
  shortName: string;
  status: "利用できます" | "準備中" | "設計中";
  category: string;
  description: string;
  bestFor: string;
  href?: string;
  localFolder?: string;
  command?: string;
  highlights: string[];
};

export const portalApps: PortalApp[] = [
  {
    id: "project-manager",
    name: "クリエイター案件マネージャー",
    shortName: "案件管理",
    status: "利用できます",
    category: "案件・書類",
    description: "聞き取りから見積、確認書、納品書、請求書までをひとつの流れで整理します。",
    bestFor: "案件の抜け漏れ、見積、請求まわりをまとめたい人",
    href: "http://127.0.0.1:3000",
    localFolder: "video-production-docs",
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    highlights: ["聞き取り", "見積", "A4書類", "請求"],
  },
  {
    id: "agreement",
    name: "クリエイター契約アプリ",
    shortName: "契約確認",
    status: "利用できます",
    category: "契約・証拠",
    description: "仕事の条件、確認事項、同意記録を残し、トラブルを減らすための契約補助アプリです。",
    bestFor: "口約束を減らし、仕事の条件をきちんと残したい人",
    href: "http://127.0.0.1:3100",
    localFolder: "creator-agreement",
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    highlights: ["条件確認", "同意記録", "PDF", "証拠保全"],
  },
  {
    id: "journal",
    name: "クリエイター作業日誌アプリ",
    shortName: "作業日誌",
    status: "利用できます",
    category: "記録・振り返り",
    description: "制作現場の記録、写真、気づき、下書きを残して、あとから見返せる日誌アプリです。",
    bestFor: "現場メモ、作業記録、振り返りを軽く残したい人",
    href: "http://127.0.0.1:3001",
    localFolder: "production-journal",
    command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
    highlights: ["日誌", "下書き", "写真メモ", "振り返り"],
  },
  {
    id: "schedule",
    name: "クリエイター制作スケジュール",
    shortName: "制作予定",
    status: "準備中",
    category: "進行管理",
    description: "打ち合わせ、撮影、編集、確認、納品までの予定を見やすく整理する予定管理アプリです。",
    bestFor: "制作の段取りを見える化して、遅れや確認漏れを減らしたい人",
    localFolder: "未作成",
    highlights: ["予定", "締切", "確認日", "納品"],
  },
  {
    id: "income",
    name: "クリエイター単価・目標年収診断アプリ",
    shortName: "単価診断",
    status: "設計中",
    category: "お金・経営",
    description: "目標年収、稼働日数、固定費から、必要な単価や案件数の目安を考える診断アプリです。",
    bestFor: "安売りを避け、現実的な単価を考えたいフリーランス",
    localFolder: "未作成",
    highlights: ["目標年収", "単価", "稼働日", "固定費"],
  },
];

export const availableApps = portalApps.filter((app) => app.status === "利用できます");
export const plannedApps = portalApps.filter((app) => app.status !== "利用できます");
