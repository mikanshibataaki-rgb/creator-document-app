import type { DocumentKind, EstimateLine, ProjectDocument, SettlementLine, TaxKind, Totals } from "./types";
import { activeEstimateLines } from "./roleTemplates";

export const yen = (value: number) => `¥${Math.round(value || 0).toLocaleString("ja-JP")}`;
export const jpDate = (value: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? `${year}年${month}月${day}日` : value;
};

const FILE_LABELS: Record<DocumentKind, string> = {
  guide: "聞き取りカンペ",
  hearing: "聞き取りシート",
  sheet: "案件シート",
  estimate: "見積書",
  settlement: "精算書",
  confirmation: "業務内容確認書",
  delivery: "納品書",
  invoice: "請求書",
};

const safeFilePart = (value: string, fallback: string) => (value || fallback)
  .replace(/[\\/:*?"<>|]/g, " ")
  .replace(/\s+/g, "_")
  .slice(0, 60);

export function recommendedPdfFileName(document: ProjectDocument, kind: DocumentKind) {
  const rawDate = kind === "invoice" ? document.invoiceDate : kind === "delivery" ? document.deliveryDateActual : document.issueDate;
  const date = (rawDate || new Date().toISOString().slice(0, 10)).replaceAll("-", "");
  const label = kind === "delivery"
    ? (document.selectedRoles.some((role) => ["俳優・モデル", "ヘアメイク", "スタイリスト", "配信者", "イベント制作者"].includes(role)) ? "業務完了報告書" : "納品書")
    : FILE_LABELS[kind];
  return `${date}_${safeFilePart(document.client.company, "クライアント未設定")}_${label}_${safeFilePart(document.projectName, "案件名未設定")}.pdf`;
}

function splitTax(amount: number, tax: TaxKind, taxRate: number) {
  const safeAmount = Number(amount) || 0;
  if (tax === "税別") {
    const net = safeAmount;
    const taxAmount = Math.floor(net * (taxRate / 100));
    return { net, tax: taxAmount, gross: net + taxAmount };
  }
  if (tax === "税込") {
    const gross = safeAmount;
    const net = Math.round(gross / (1 + taxRate / 100));
    return { net, tax: gross - net, gross };
  }
  return { net: safeAmount, tax: 0, gross: safeAmount };
}

export function lineAmount(line: EstimateLine, taxRate: number) {
  return splitTax(line.unitPrice * line.quantity, line.tax, taxRate);
}

export function settlementAmount(line: SettlementLine, taxRate: number) {
  return splitTax(line.amount, line.tax, taxRate);
}

export function calculateTotals(document: ProjectDocument): Totals {
  const visibleLines = activeEstimateLines(document.lines, document.selectedRoles);
  const estimateBeforeDiscount = visibleLines.reduce((sum, line) => {
    const amount = lineAmount(line, document.taxRate);
    return { net: sum.net + amount.net, tax: sum.tax + amount.tax, gross: sum.gross + amount.gross };
  }, { net: 0, tax: 0, gross: 0 });
  const subtotal = estimateBeforeDiscount.net;
  const discount = Math.min(Math.max(document.discount, 0), subtotal);
  const taxableSubtotal = visibleLines.filter((line) => line.tax === "税別" || line.tax === "税込").reduce((sum, line) => sum + lineAmount(line, document.taxRate).net, 0);
  const taxableDiscount = subtotal ? discount * (taxableSubtotal / subtotal) : 0;
  const taxableBase = Math.max(0, taxableSubtotal - taxableDiscount);
  const tax = Math.floor(taxableBase * (document.taxRate / 100));
  const afterDiscount = subtotal - discount;
  const withholding = document.withholdingEnabled ? Math.floor(afterDiscount * 0.1021) : 0;
  const total = afterDiscount + tax - withholding;
  const settlement = (document.expenseLines ?? []).filter((line) => line.billable).reduce((sum, line) => {
    const amount = settlementAmount(line, document.taxRate);
    return { net: sum.net + amount.net, tax: sum.tax + amount.tax, gross: sum.gross + amount.gross };
  }, { net: 0, tax: 0, gross: 0 });
  const invoiceNet = afterDiscount + settlement.net;
  const invoiceTax = tax + settlement.tax;
  const invoiceTotal = total + settlement.gross;
  return {
    subtotal, discount, taxableBase, tax, withholding, total, advance: document.advance, balance: total - document.advance,
    estimateNet: afterDiscount, estimateTax: tax, estimateGross: total,
    settlementNet: settlement.net, settlementTax: settlement.tax, settlementGross: settlement.gross,
    invoiceNet, invoiceTax, invoiceTotal
  };
}
