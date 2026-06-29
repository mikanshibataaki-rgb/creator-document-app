import type { AgreementContent } from "@/domain/schema";

export interface ManagerProject {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  fee: string;
  deliveryDate: string;
  paymentDue: string;
  commissionedAt: string;
  workDescription: string;
  deliverables: string;
  deliveryPlace: string;
}

const mockProjects: ManagerProject[] = [
  {
    id: "MGR-2026-001",
    title: "新商品プロモーション映像",
    clientName: "株式会社サンプル",
    clientEmail: "contact@example.jp",
    fee: "350000",
    deliveryDate: "2026-07-31",
    paymentDue: "2026-08-31",
    commissionedAt: "2026-06-25",
    workDescription: "新商品の魅力を伝えるWeb・SNS向けプロモーション映像の企画、撮影、編集。",
    deliverables: "60秒動画 1本／15秒縦型動画 2本",
    deliveryPlace: "オンライン納品",
  },
  {
    id: "MGR-2026-014",
    title: "採用インタビュー動画",
    clientName: "岐阜テクノ株式会社",
    clientEmail: "recruit@example.jp",
    fee: "480000",
    deliveryDate: "2026-09-15",
    paymentDue: "2026-10-31",
    commissionedAt: "2026-06-18",
    workDescription: "社員インタビュー3名の撮影、編集、字幕制作。",
    deliverables: "3分動画 3本／30秒ダイジェスト 1本",
    deliveryPlace: "オンライン納品",
  },
  {
    id: "MGR-2026-021",
    title: "観光施設SNS縦型動画",
    clientName: "一般社団法人みの観光",
    clientEmail: "media@example.jp",
    fee: "220000",
    deliveryDate: "2026-08-20",
    paymentDue: "2026-09-30",
    commissionedAt: "2026-06-22",
    workDescription: "観光施設を紹介する縦型ショート動画の撮影と編集。",
    deliverables: "30秒縦型動画 4本",
    deliveryPlace: "オンライン納品",
  },
];

export async function fetchManagerProjects(): Promise<ManagerProject[]> {
  return mockProjects;
}

export function applyManagerProject(current: AgreementContent, source: ManagerProject): AgreementContent {
  return {
    ...current,
    managerProjectId: source.id,
    projectName: source.title,
    clientName: source.clientName,
    clientEmail: source.clientEmail,
    fee: source.fee,
    deliveryDate: source.deliveryDate,
    paymentDue: source.paymentDue,
    commissionedAt: source.commissionedAt,
    workDescription: source.workDescription,
    deliverables: source.deliverables,
    deliveryPlace: source.deliveryPlace,
  };
}
