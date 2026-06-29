export type PortalAppStatus = "published" | "development";

export type PortalApp = {
  id: string;
  order: string;
  name: string;
  status: PortalAppStatus;
  category: string;
  description: string;
  href?: string;
  highlights: string[];
};

export const portalApps: PortalApp[] = [
  {
    id: "project-manager",
    order: "01",
    name: "クリエーター案件マネージャー",
    status: "published",
    category: "案件管理",
    description: "案件の概要、条件、見積、納品までの情報を整理し、仕事の抜け漏れを減らすためのアプリです。",
    href: "https://creator-project-manager.vercel.app/",
    highlights: ["案件整理", "見積準備", "条件確認", "納品管理"],
  },
  {
    id: "agreement",
    order: "02",
    name: "クリエーター契約アプリ",
    status: "published",
    category: "契約・確認",
    description: "仕事の条件や合意内容を見える形で残し、あとから確認できる状態にするためのアプリです。",
    href: "https://creator-agreement.vercel.app/",
    highlights: ["契約条件", "確認事項", "証拠保全", "トラブル予防"],
  },
  {
    id: "journal",
    order: "03",
    name: "制作日誌アプリの設計",
    status: "development",
    category: "制作記録",
    description: "撮影や制作の記録、気づき、振り返りを残し、次の現場に活かすためのアプリです。",
    highlights: ["現場メモ", "制作記録", "振り返り", "共有準備"],
  },
  {
    id: "shooting-materials",
    order: "04",
    name: "撮影素材ナビアプリ",
    status: "development",
    category: "撮影準備",
    description: "撮影素材、持ち物、確認事項を整理し、現場前の不安や忘れ物を減らすためのアプリです。",
    highlights: ["素材確認", "持ち物", "準備リスト", "現場前チェック"],
  },
  {
    id: "sns-strategy-room",
    order: "05",
    name: "SNS戦略会議室",
    status: "development",
    category: "SNS戦略",
    description: "投稿テーマ、企画、改善メモを整理し、SNS運用を継続しやすくするためのアプリです。",
    highlights: ["投稿企画", "戦略整理", "改善メモ", "運用会議"],
  },
];

export const publishedApps = portalApps.filter((app) => app.status === "published");
export const developmentApps = portalApps.filter((app) => app.status === "development");
