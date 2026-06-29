import { jsPDF } from "jspdf";
import type { AgreementContent, Project, Signature, TimelineEvent } from "@/domain/schema";

let fontBase64 = "";

async function loadFont() {
  if (fontBase64) return fontBase64;
  const response = await fetch("/fonts/NotoSansJP.ttf");
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)));
  }
  fontBase64 = btoa(binary);
  return fontBase64;
}

function yen(value: string) {
  return `${Number(value || 0).toLocaleString("ja-JP")}円`;
}

function date(value: string) {
  return value ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`)) : "未設定";
}

export async function createAgreementPdf(
  project: Project,
  content: AgreementContent,
  events: TimelineEvent[],
  signature?: Signature,
) {
  const font = await loadFont();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("NotoSansJP.ttf", font);
  doc.addFont("NotoSansJP.ttf", "NotoSansJP", "normal");
  doc.setFont("NotoSansJP");

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const bodyWidth = pageWidth - margin * 2;
  let y = 22;

  const footer = () => {
    doc.setDrawColor(220);
    doc.line(margin, 282, pageWidth - margin, 282);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(`${project.projectNumber} / Ver.${project.versionNumber}`, margin, 288);
    doc.text(`PDF保存日時 ${new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}`, pageWidth - margin, 288, { align: "right" });
  };

  const newPageIfNeeded = (height: number) => {
    if (y + height < 275) return;
    footer();
    doc.addPage();
    doc.setFont("NotoSansJP");
    y = 20;
  };

  const heading = (text: string) => {
    newPageIfNeeded(16);
    doc.setTextColor(50);
    doc.setFontSize(12);
    doc.text(text, margin, y);
    doc.setDrawColor(190, 166, 116);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);
    y += 11;
  };

  const row = (label: string, value: string) => {
    const lines = doc.splitTextToSize(value || "未設定", bodyWidth - 42) as string[];
    const height = Math.max(9, lines.length * 5 + 4);
    newPageIfNeeded(height);
    doc.setFillColor(247, 246, 242);
    doc.rect(margin, y - 4, 38, height, "F");
    doc.setFontSize(8);
    doc.setTextColor(105);
    doc.text(label, margin + 3, y + 1);
    doc.setTextColor(35);
    doc.setFontSize(9);
    doc.text(lines, margin + 42, y + 1);
    y += height;
  };

  doc.setTextColor(154, 122, 67);
  doc.setFontSize(8);
  doc.text("CREATOR CONTRACT DRAFT", pageWidth / 2, y, { align: "center" });
  y += 10;
  doc.setTextColor(28);
  doc.setFontSize(20);
  doc.text("契約書・発注確認書", pageWidth / 2, y, { align: "center" });
  y += 11;
  doc.setFontSize(14);
  doc.text(content.projectName || "名称未設定", pageWidth / 2, y, { align: "center" });
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(`契約番号 ${project.projectNumber} / Ver.${project.versionNumber}`, pageWidth / 2, y, { align: "center" });
  y += 14;

  heading("当事者");
  row("発注者", `${content.clientName}\n${content.clientEmail}`);
  row("受注者", `${content.creatorName}\n${content.creatorEmail}`);

  heading("依頼する仕事の内容");
  row("依頼内容", content.workDescription);
  row("納品するもの", content.deliverables);
  row("作業範囲", content.inScope);
  row("対象外", content.outOfScope);

  heading("報酬と支払い");
  row("報酬", `${yen(content.fee)}（${content.taxTreatment}）`);
  row("業務委託日", date(content.commissionedAt));
  row("支払期日", date(content.paymentDue));
  row("支払方法", content.paymentMethod);
  heading("納品と修正");
  row("納期", date(content.deliveryDate));
  row("納品場所", content.deliveryPlace);
  row("確認期限", content.inspectionDays ? `納品後${content.inspectionDays}日以内` : "未設定");

  footer();
  doc.addPage();
  doc.setFont("NotoSansJP");
  y = 20;
  heading("使用範囲と権利");
  row("無料修正", content.revisionCount ? `${content.revisionCount}回まで` : "未設定");
  row("追加修正", content.additionalRevisionFee);
  row("著作権", content.copyright);
  row("使用範囲・二次利用", content.usageScope);
  row("SNS掲載・実績公開", content.portfolioPermission === "可" ? `可 / ${content.portfolioTiming} / ${content.creditRequired}` : content.portfolioPermission || "未確認");

  heading("キャンセル・追加対応");
  row("追加修正・再編集料金", content.reEditingFee);
  row("天候・順延", content.weatherPostponementState === "on" ? content.weatherPostponement : content.weatherPostponementState === "na" ? "該当なし" : "使用しない");
  row("ロケ地・許可", content.locationPermitState === "on" ? content.locationPermit : content.locationPermitState === "na" ? "該当なし" : "使用しない");
  row("出演者の権利", content.portraitRightsState === "on" ? content.portraitRights : content.portraitRightsState === "na" ? "該当なし" : "使用しない");
  row("BGM・素材", content.musicRightsState === "on" ? content.musicRights : content.musicRightsState === "na" ? "該当なし" : "使用しない");
  row("キャンセル時の扱い", content.cancellation);
  row("損害賠償上限", content.liabilityLimit);

  heading("双方確認と注意事項");
  row("送信者の確認", events.find((event) => event.eventType === "sender_confirmed")?.occurredAt ? "送信者がこの内容を契約書・発注確認書のたたき台として確認" : "未確認");
  row("受信者の確認", signature ? `${signature.signerName} / ${new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeStyle: "medium" }).format(new Date(signature.agreedAt))}` : "未確認");
  row("注意事項", "本書は入力内容をもとに作成された契約書・発注確認書のたたき台です。法的効力や個別案件への適合性を保証するものではありません。重要な契約は専門家へご確認ください。");

  footer();
  const filename = `${project.projectNumber}_契約書_${content.projectName.replace(/[\\/:*?\"<>|]/g, "_")}_Ver${project.versionNumber}.pdf`;
  doc.save(filename);
  return filename;
}
