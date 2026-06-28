import type { EstimateLine, ExpenseLine, ProjectDocument } from "./types";

export const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
export const createLine = (): EstimateLine => ({ id: createId(), category: "制作人件費", name: "", description: "", unitPrice: 0, quantity: 1, unit: "式", tax: "税別" });
export const createSettlementLine = (): ExpenseLine => ({ id: createId(), date: "", category: "交通費", description: "", payee: "", amount: 0, tax: "税込", hasReceipt: true, paidBy: "", billable: true, memo: "" });

export const seedDocument: ProjectDocument = {
  id: "sample-project", projectName: "企業ブランドムービー制作", projectNo: "TKS-2026-0142", kind: "企業VP", status: "ヒアリング中",
  summary: "新商品PRと採用強化のための企業ブランドムービー。Web・SNSで認知拡大を狙う。", deliverableIdea: "企業紹介本編（約3分・横16:9）＋ 縦型ショート（30秒・9:16）", purpose: "採用サイト掲載・SNS広告での認知拡大", target: "20〜40代の求職者および新規取引先", referenceUrl: "", budget: "80〜100万円（税別）", undecided: "出演者の確定、ナレーションの有無、公開時期", internalMemo: "先方は映像発注が初めて。絵コンテ段階で認識を合わせる。",
  selectedRoles: ["映像制作者"], roleAnswers: { "映像制作者:動画の本数": "本編1本、縦型ショート1本", "映像制作者:横動画の有無": "あり", "映像制作者:縦動画の有無": "あり", "映像制作者:撮影日数": "2日", "映像制作者:BGMの有無": "あり", "映像制作者:テロップの有無": "あり", "映像制作者:素材データ納品の有無": "なし" },
  meetingTranscript: "",
  hearingType: "企業VP / SNSショート", requestedContent: "会社の雰囲気と新商品の魅力が伝わる映像を作りたい。", finalImage: "清潔感があり、採用にも使える明るいトーン。テンポはやや速め。", requiredCount: "本編1本、縦型ショート1本、サムネイル2点",
  hasVerticalVideo: "あり", hasHorizontalVideo: "あり", hasPhotoShoot: "要相談", budgetFixed: "あり", maxBudget: "100万円", competingQuote: "なし", budgetIncludes: "撮影、編集、BGM、テロップ、交通費", desiredShootDate: "2026-08-05", desiredDeliveryDate: "2026-09-10", publishDate: "2026-10-01",
  hasCast: "あり", hasNarration: "要相談", hasHairMake: "なし", needsStudio: "あり", needsLocationShoot: "あり", needsDrone: "なし", questionsToClient: "出演者の人数、公開媒体ごとの尺、ロゴデータの支給有無を確認。",
  client: { id: "sample-client", company: "〇〇〇", person: "〇〇〇", postalCode: "〇〇〇", address: "〇〇〇", phone: "〇〇〇", email: "〇〇〇", invoiceNo: "〇〇〇" },
  vendor: { name: "〇〇〇", person: "〇〇〇", postalCode: "〇〇〇", address: "〇〇〇", phone: "〇〇〇", email: "〇〇〇", invoiceNo: "〇〇〇", bankName: "〇〇〇", bankBranch: "〇〇〇", bankType: "普通", bankAccount: "〇〇〇", bankHolder: "〇〇〇" },
  shootDate: "2026-08-05", location: "〇〇〇", deliveryDate: "2026-09-10", deliverables: "本編動画 1本（横16:9）／ショート動画 1本（縦9:16）／サムネイル 2点", format: "MP4（H.264）, 1920×1080 / 1080×1920", revisions: "2", media: "自社Webサイト・SNS（YouTube / Instagram / X）", usagePeriod: "1年間", secondaryUse: "可（同一媒体内に限る）", snsPermission: "可", websitePermission: "可", portfolioPermission: "要相談",
  confirmationIntro: "本書は、下記案件における業務内容・条件について発注者・受注者双方の認識を確認するものです。", inScope: "撮影2日、編集、テロップ、選曲、カラコレ", outOfScope: "出演者キャスティング、ナレーション収録（別途見積）", notes: "", selectedNoteIds: ["common-valid-30days", "common-additional-estimate"], customNote: "", credit: "クレジット表記は別途確認", copyright: "著作権は受注者に帰属／使用許諾を発注者へ付与", dataHandover: "完パケのみ。素材・プロジェクトデータの引き渡しは別途。",
  issueDate: "2026-06-23", validUntil: "2026-07-31", paymentTerms: "納品月末締め、翌月末払い", discount: 0, taxRate: 10, withholdingEnabled: false, advance: 0,
  lines: [
    { id: "line-1", category: "制作人件費", name: "ディレクター", description: "企画〜編集統括", unitPrice: 80000, quantity: 1, unit: "式", tax: "税別", sourceRole: "映像制作者" },
    { id: "line-2", category: "制作人件費", name: "カメラマン", description: "撮影2日", unitPrice: 60000, quantity: 2, unit: "日", tax: "税別", sourceRole: "映像制作者" },
    { id: "line-3", category: "撮影機材費", name: "カメラ・レンズ一式", description: "FX9 + レンズ", unitPrice: 50000, quantity: 2, unit: "日", tax: "税別", sourceRole: "映像制作者" },
    { id: "line-4", category: "照明機材費", name: "照明機材一式", description: "", unitPrice: 30000, quantity: 2, unit: "日", tax: "税別", sourceRole: "映像制作者" },
    { id: "line-5", category: "編集費", name: "本編集・カラコレ", description: "本編＋ショート", unitPrice: 150000, quantity: 1, unit: "式", tax: "税別", sourceRole: "映像制作者" }
  ],
  dismissedEstimateCandidates: [],
  expenseLines: [
    { id: "settlement-1", date: "2026-08-05", category: "駐車場代", description: "本社撮影時コインパーキング", payee: "〇〇〇", amount: 1800, tax: "税込", hasReceipt: true, paidBy: "〇〇〇", billable: true, memo: "" },
    { id: "settlement-2", date: "2026-08-06", category: "食事代", description: "撮影スタッフ昼食", payee: "〇〇〇", amount: 6600, tax: "税込", hasReceipt: true, paidBy: "〇〇〇", billable: true, memo: "6名分" }
  ],
  deliveryDateActual: "2026-09-10", deliveryMethod: "Google Drive共有リンク", deliveryNotes: "検収後、必要に応じて軽微な修正に対応。",
  invoiceDate: "2026-09-30", paymentDue: "2026-10-31", updatedAt: new Date().toISOString(),
};
