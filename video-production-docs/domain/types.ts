export type TaxKind = "税別" | "税込" | "非課税" | "不課税";
export type DocumentKind = "hearing" | "sheet" | "estimate" | "settlement" | "confirmation" | "delivery" | "invoice";
export type CreatorRole = "映像制作者" | "カメラマン" | "編集者" | "デザイナー" | "イラストレーター" | "Web制作者" | "ライター" | "音楽制作者" | "ナレーター" | "俳優・モデル" | "ヘアメイク" | "スタイリスト" | "配信者" | "SNS運用者" | "イベント制作者";

export interface EstimateLine {
  id: string; category: string; name: string; description: string;
  unitPrice: number; quantity: number; unit: string; tax: TaxKind;
}

export interface ExpenseLine {
  id: string; date: string; category: string; description: string; payee: string;
  amount: number; tax: TaxKind; hasReceipt: boolean; paidBy: string; billable: boolean; memo: string;
}
export type SettlementLine = ExpenseLine;

export interface Client {
  id: string; company: string; person: string; postalCode: string;
  address: string; phone: string; email: string; invoiceNo: string;
}

export interface Vendor {
  name: string; person: string; postalCode: string; address: string; phone: string;
  email: string; invoiceNo: string; bankName: string; bankBranch: string;
  bankType: string; bankAccount: string; bankHolder: string;
}

export interface ProjectDocument {
  id: string; projectName: string; projectNo: string; kind: string; status: string;
  summary: string; deliverableIdea: string; purpose: string; target: string; referenceUrl: string;
  budget: string; undecided: string; internalMemo: string; client: Client; vendor: Vendor;
  selectedRoles: CreatorRole[]; roleAnswers: Record<string, string>;
  hearingType: string; requestedContent: string; finalImage: string; requiredCount: string;
  hasVerticalVideo: string; hasHorizontalVideo: string; hasPhotoShoot: string; budgetFixed: string;
  maxBudget: string; competingQuote: string; budgetIncludes: string; desiredShootDate: string;
  desiredDeliveryDate: string; publishDate: string; hasCast: string; hasNarration: string;
  hasHairMake: string; needsStudio: string; needsLocationShoot: string; needsDrone: string;
  questionsToClient: string;
  shootDate: string; location: string; deliveryDate: string; deliverables: string; format: string;
  revisions: string; media: string; usagePeriod: string; secondaryUse: string;
  snsPermission: string; websitePermission: string; portfolioPermission: string;
  confirmationIntro: string; inScope: string; outOfScope: string; notes: string;
  credit: string; copyright: string; dataHandover: string; issueDate: string; validUntil: string;
  paymentTerms: string; discount: number; taxRate: number; withholdingEnabled: boolean; advance: number;
  lines: EstimateLine[]; expenseLines: ExpenseLine[];
  deliveryDateActual: string; deliveryMethod: string; deliveryNotes: string;
  invoiceDate: string; paymentDue: string; updatedAt: string;
}

export interface Totals {
  subtotal: number; discount: number; taxableBase: number; tax: number;
  withholding: number; total: number; advance: number; balance: number;
  estimateNet: number; estimateTax: number; estimateGross: number;
  settlementNet: number; settlementTax: number; settlementGross: number;
  invoiceNet: number; invoiceTax: number; invoiceTotal: number;
}
