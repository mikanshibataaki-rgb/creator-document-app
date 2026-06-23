import type { EstimateLine, ProjectDocument, SettlementLine, TaxKind, Totals } from "./types";

export const yen = (value: number) => `¥${Math.round(value || 0).toLocaleString("ja-JP")}`;
export const jpDate = (value: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? `${year}年${month}月${day}日` : value;
};

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
  const estimateBeforeDiscount = document.lines.reduce((sum, line) => {
    const amount = lineAmount(line, document.taxRate);
    return { net: sum.net + amount.net, tax: sum.tax + amount.tax, gross: sum.gross + amount.gross };
  }, { net: 0, tax: 0, gross: 0 });
  const subtotal = estimateBeforeDiscount.net;
  const discount = Math.min(Math.max(document.discount, 0), subtotal);
  const taxableSubtotal = document.lines.filter((line) => line.tax === "税別" || line.tax === "税込").reduce((sum, line) => sum + lineAmount(line, document.taxRate).net, 0);
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
