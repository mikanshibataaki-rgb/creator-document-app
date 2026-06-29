import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outputDir = path.join(root, "output", "pdf");
fs.mkdirSync(outputDir, { recursive: true });

const font = fs.readFileSync(path.join(root, "public", "fonts", "NotoSansJP.ttf")).toString("base64");
const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
doc.addFileToVFS("NotoSansJP.ttf", font);
doc.addFont("NotoSansJP.ttf", "NotoSansJP", "normal");
doc.setFont("NotoSansJP");

const pageWidth = 210;
const margin = 18;
const bodyWidth = pageWidth - margin * 2;
let y = 22;

const footer = () => {
  doc.setDrawColor(220);
  doc.line(margin, 282, pageWidth - margin, 282);
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text("CA-2026-001 / Ver.1", margin, 288);
  doc.text("契約書・発注確認書の確認用PDF", pageWidth - margin, 288, { align: "right" });
};

const newPageIfNeeded = (height) => {
  if (y + height < 275) return;
  footer();
  doc.addPage();
  doc.setFont("NotoSansJP");
  y = 20;
};

const heading = (text) => {
  newPageIfNeeded(16);
  doc.setTextColor(50);
  doc.setFontSize(12);
  doc.text(text, margin, y);
  doc.setDrawColor(190, 166, 116);
  doc.line(margin, y + 3, pageWidth - margin, y + 3);
  y += 11;
};

const row = (label, value) => {
  const lines = doc.splitTextToSize(value || "未設定", bodyWidth - 42);
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
doc.text("採用インタビュー動画", pageWidth / 2, y, { align: "center" });
y += 12;
doc.setFontSize(8);
doc.setTextColor(110);
doc.text("契約番号 CA-2026-001 / Ver.1", pageWidth / 2, y, { align: "center" });
y += 14;

heading("当事者");
row("発注者", "岐阜テクノ株式会社\nrecruit@example.jp");
row("受注者", "東海制作\ncreator@example.jp");
heading("依頼する仕事の内容");
row("依頼内容", "社員インタビュー3名の撮影、編集、字幕制作。");
row("納品するもの", "3分動画 3本／30秒ダイジェスト 1本");
row("作業範囲", "企画、構成、撮影1日、編集、色調整、BGM選定");
row("対象外", "出演者手配、遠方交通費、商品CG制作");
heading("報酬と支払い");
row("報酬", "480,000円（税別）");
row("業務委託日", "2026年6月18日");
row("支払期日", "2026年10月31日");
row("支払方法", "指定口座への銀行振込");
heading("納品と修正");
row("納期", "2026年9月15日");
row("納品場所", "オンライン納品");
row("確認期限", "納品後5日以内");
footer();
doc.addPage();
doc.setFont("NotoSansJP");
y = 20;
heading("使用範囲と権利");
row("無料修正", "2回まで");
row("追加修正", "1回 20,000円から");
row("著作権", "制作者に帰属する");
row("使用範囲・二次利用", "自社Webサイト、公式SNS、店頭サイネージ");
row("SNS掲載・実績公開", "可 / 納品後すぐ / クレジット不要");
heading("キャンセル・追加対応");
row("追加修正・再編集料金", "内容確認後に別途見積します。");
row("天候・順延", "悪天候で撮影が難しい場合は双方で順延日を相談し、追加実費は事前確認します。");
row("ロケ地・許可", "撮影場所の許可取得は発注者が行い、申請費用は発注者が負担します。");
row("出演者の権利", "出演者の撮影・利用許諾は発注者が取得します。");
row("BGM・素材", "有料BGM・素材の利用料は見積確認後、発注者が負担します。");
row("キャンセル時の扱い", "撮影7日前以降は見積額の50%、前日・当日は100%とします。");
row("損害賠償上限", "個別に協議");
heading("双方確認と注意事項");
row("送信者の確認", "送信者がこの内容を契約書・発注確認書のたたき台として確認");
row("受信者の確認", "山田 太郎 / 2026年6月25日 21:09");
row("注意事項", "本書は入力内容をもとに作成された契約書・発注確認書のたたき台です。法的効力や個別案件への適合性を保証するものではありません。重要な契約は専門家へご確認ください。");
footer();

const output = path.join(outputDir, "creator-agreement-sample.pdf");
fs.writeFileSync(output, Buffer.from(doc.output("arraybuffer")));
console.log(output);
