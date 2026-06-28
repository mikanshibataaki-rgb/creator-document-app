import { jpDate, lineAmount, settlementAmount, yen } from "@/domain/format";
import { activeEstimateLines, getCompletionDocumentName, getConditionSections, getInterviewGuideForRoles, getPrimaryRoleColorMeta, getUnifiedRoleFieldGroups, mergeRoleTemplates, ROLE_WORKFLOW_WORDING } from "@/domain/roleTemplates";
import { conditionOutlineFromHearing, deliveryRowsFromHearing, hearingSummary, selectedNotesForDocument } from "@/domain/derived";
import type { DocumentKind, ProjectDocument, Totals } from "@/domain/types";

const pageClass = "doc-page relative bg-white p-[14mm] text-[10px] leading-relaxed text-neutral-800 shadow-sheet ring-1 ring-black/5 dark:shadow-float dark:ring-white/10";

function Header({ title, number, date, dateLabel = "発行日", extra }: { title: string; number: string; date: string; dateLabel?: string; extra?: React.ReactNode }) {
  return <header className="mb-7 flex items-start justify-between border-b-2 border-ink pb-4"><div><p className="mb-1 text-[9px] font-bold tracking-[.2em] text-brand">TOKAI PRODUCTION DOCUMENT</p><h1 className="font-display text-[26px] font-bold tracking-[.18em] text-ink">{title}</h1></div><div className="text-right leading-5 text-neutral-500"><div>No. {number || "—"}</div><div>{dateLabel}：{jpDate(date)}</div>{extra}</div></header>;
}

function Parties({ d }: { d: ProjectDocument }) {
  return <><RoleAccent d={d} /><div className="mb-7 grid grid-cols-2 gap-12"><div><div className="mb-2 border-b border-neutral-400 pb-1 text-[15px] font-bold text-ink">{d.client.company || "（発注者未入力）"} 御中</div>{d.client.person && <div>ご担当：{d.client.person} 様</div>}<div>〒{d.client.postalCode}</div><div>{d.client.address}</div></div><div><div className="text-[13px] font-bold text-ink">{d.vendor.name}</div><div>担当：{d.vendor.person}</div><div>〒{d.vendor.postalCode} {d.vendor.address}</div><div>TEL：{d.vendor.phone}</div><div>{d.vendor.email}</div><div>登録番号：{d.vendor.invoiceNo}</div></div></div></>;
}

function Amount({ label, value }: { label: string; value: number }) {
  return <div className="avoid-break mb-6 inline-flex items-baseline border-2 border-ink px-5 py-2"><span className="mr-4 text-neutral-500">{label}</span><strong className="text-[22px] text-ink">{yen(value)}</strong><span className="ml-2 text-neutral-500">（税込）</span></div>;
}

function RoleAccent({ d }: { d: ProjectDocument }) {
  if (!d.selectedRoles.length) return null;
  const color = getPrimaryRoleColorMeta(d.selectedRoles);
  return <div className="avoid-break mb-5 flex items-center gap-2 rounded border px-3 py-2 text-[9px]" style={{ borderColor: color.border, backgroundColor: color.soft }}>
    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.color }} />
    <span className="font-bold text-ink">職種</span>
    <span className="text-neutral-600">{d.selectedRoles.join(" / ")}</span>
  </div>;
}

function Rows({ rows }: { rows: [string, string | number][] }) {
  return <table className="w-full border-collapse border border-neutral-200"><tbody>{rows.filter(([, value]) => value !== "").map(([label, value]) => <tr key={label} className="border-b border-neutral-200 align-top"><th className="w-[28%] bg-neutral-50 px-3 py-1.5 text-left font-semibold text-neutral-600">{label}</th><td className="whitespace-pre-wrap px-3 py-1.5 text-[10px] text-ink">{value || "—"}</td></tr>)}</tbody></table>;
}

function NotesBlock({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return <div className="avoid-break mt-5 border-t border-neutral-200 pt-3 text-[9px] leading-snug text-neutral-600"><div className="mb-1 font-bold text-ink">備考</div><ul className="space-y-0.5">{notes.slice(0, 5).map((text) => <li key={text}>・{text}</li>)}</ul></div>;
}

const compactText = (value: string, limit = 120) => value && value.length > limit ? `${value.slice(0, limit)}…（詳細は別紙参照）` : value;

function Lines({ d }: { d: ProjectDocument }) {
  const visibleLines = activeEstimateLines(d.lines, d.selectedRoles);
  return <table className="mb-4 w-full table-fixed border-collapse"><thead><tr className="bg-ink text-white"><th className="w-[40%] px-3 py-2 text-left">品名 / 摘要</th><th className="w-[14%] px-2 py-2 text-right">入力額</th><th className="w-[9%] px-2 py-2 text-right">数量</th><th className="w-[9%] px-2 py-2 text-center">単位</th><th className="w-[10%] px-2 py-2 text-center">税</th><th className="w-[18%] px-3 py-2 text-right">税込額</th></tr></thead><tbody>{visibleLines.filter((line) => line.name && lineAmount(line, d.taxRate).gross > 0).map((line) => { const amount = lineAmount(line, d.taxRate); return <tr key={line.id} className="border-b border-neutral-200 align-top"><td className="px-3 py-2"><div className="font-bold text-ink">{line.name || "—"}</div>{line.description && <div className="text-neutral-500">{line.description}</div>}<div className="text-[8px] text-neutral-400">{line.category}</div></td><td className="px-2 py-2 text-right tabular-nums">{yen(line.unitPrice)}</td><td className="px-2 py-2 text-right">{line.quantity}</td><td className="px-2 py-2 text-center">{line.unit}</td><td className="px-2 py-2 text-center">{line.tax}</td><td className="px-3 py-2 text-right font-bold tabular-nums">{yen(amount.gross)}</td></tr>; })}</tbody></table>;
}

function TotalsTable({ totals, taxRate }: { totals: Totals; taxRate: number }) {
  const rows: [string, number][] = [["小計（税抜）", totals.subtotal], ...(totals.discount ? [["値引き", -totals.discount] as [string, number]] : []), [`消費税（${taxRate}%）`, totals.tax], ...(totals.withholding ? [["源泉徴収", -totals.withholding] as [string, number]] : [])];
  return <div className="avoid-break flex justify-end"><table className="w-[250px]"><tbody>{rows.map(([label, value]) => <tr key={label}><td className="px-2 py-1 text-right text-neutral-500">{label}</td><td className="px-2 py-1 text-right tabular-nums">{value < 0 ? `-${yen(-value)}` : yen(value)}</td></tr>)}<tr className="border-t-2 border-ink text-[13px] font-bold"><td className="px-2 py-2 text-right">合計</td><td className="px-2 py-2 text-right">{yen(totals.total)}</td></tr>{totals.advance > 0 && <><tr><td className="px-2 py-1 text-right text-neutral-500">前金</td><td className="px-2 py-1 text-right">{yen(totals.advance)}</td></tr><tr className="font-bold"><td className="px-2 py-1 text-right">残金</td><td className="px-2 py-1 text-right">{yen(totals.balance)}</td></tr></>}</tbody></table></div>;
}

function Hearing({ d }: { d: ProjectDocument }) {
  const visibleRoleFields = new Set(getUnifiedRoleFieldGroups(d.selectedRoles).flatMap((group) => group.fields));
  const visibleConditionScopes = new Set(getConditionSections(d.selectedRoles).map((section) => section.title));
  const answerGroups = Object.entries(d.roleAnswers).filter(([key, value]) => {
    if (!value) return false;
    const [scope, ...rest] = key.split(":");
    const field = rest.join(":");
    return scope === "共通" || visibleConditionScopes.has(scope) || (scope === "職業別" && visibleRoleFields.has(field));
  }).reduce<Record<string, [string, string][]>>((groups, [key, value]) => {
    const [scope, ...rest] = key.split(":");
    const field = rest.join(":");
    groups[scope] = [...(groups[scope] ?? []), [field, value]];
    return groups;
  }, {});
  return <article className={pageClass}><Header title="聞き取りシート" number={d.projectNo} date={d.issueDate} /><RoleAccent d={d} /><Rows rows={[
    ["選択職業", d.selectedRoles.join(" / ")], ["何を作ってほしいか", d.requestedContent], ["完成物のイメージ", d.finalImage], ["使用目的", d.purpose], ["ターゲット", d.target], ["使用媒体", d.media], ["希望予算", d.budget], ["上限予算", d.maxBudget], ["相見積もり", d.competingQuote], ["希望納期", jpDate(d.desiredDeliveryDate)], ["参考URL", d.referenceUrl], ["未確定事項", d.undecided]
  ]} />{Object.entries(answerGroups).map(([scope, rows]) => <section key={scope} className="mt-5"><h2 className="mb-2 text-[10px] font-bold tracking-[.18em] text-brand">{scope}</h2><Rows rows={rows} /></section>)}</article>;
}

function HearingGuide({ d }: { d: ProjectDocument }) {
  const guide = getInterviewGuideForRoles(d.selectedRoles);
  const groups = Object.entries(guide.reduce<Record<string, typeof guide>>((result, item) => ({ ...result, [item.category]: [...(result[item.category] ?? []), item] }), {}));
  return <article className={pageClass}><Header title="聞き取りカンペ" number={d.projectNo} date={d.issueDate} /><RoleAccent d={d} />
    <div className="mb-5 flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 px-4 py-3"><div><div className="font-bold text-ink">対象職種</div><div>{d.selectedRoles.join(" / ") || "未選択"}</div></div><div className="text-right text-neutral-500">{guide.length}項目</div></div>
    <div className="space-y-5">{groups.map(([category, questions]) => <section key={category} className="avoid-break"><h2 className="mb-2 border-b border-ink pb-1 text-[11px] font-bold tracking-wider text-ink">{category}</h2><div className="space-y-2">{questions.map((item, index) => <div key={item.id} className="grid grid-cols-[22px_1fr_32%] gap-2 border-b border-neutral-200 pb-2"><span className="font-bold text-brand">{index + 1}</span><div><div className="font-bold text-ink">{item.question}</div><div className="mt-0.5 text-[8px] leading-snug text-neutral-500">なぜ聞く？ {item.reason}</div></div><div className="min-h-8 border-b border-dotted border-neutral-400 text-[8px] text-neutral-400">メモ</div></div>)}</div></section>)}</div>
  </article>;
}

function Sheet({ d }: { d: ProjectDocument }) {
  const conditionSections = conditionOutlineFromHearing(d);
  const summary = hearingSummary(d);
  const outputs = Array.from(new Set(d.selectedRoles.map((role) => ROLE_WORKFLOW_WORDING[role]?.outputName).filter(Boolean))).join(" / ");
  const Item = ({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) => <div className={wide ? "col-span-2" : ""}><dt className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">{label}</dt><dd className="m-0 whitespace-pre-wrap text-[12px] leading-5 text-ink">{value || "—"}</dd></div>;
  return <article className={pageClass}><header className="mb-7 flex items-start justify-between border-b-2 border-ink pb-5"><div><p className="mb-1 text-[9px] font-bold tracking-[.2em] text-brand">PROJECT SHEET</p><h1 className="font-display text-[23px] font-bold text-ink">{summary.projectName || "（案件名未入力）"}</h1></div><div className="text-right leading-5"><div>{d.projectNo}</div><div>{summary.roles || d.kind}</div><span className="mt-1 inline-block rounded bg-ink px-2 py-0.5 text-white">{d.status}</span></div></header><RoleAccent d={d} /><section className="mb-6"><h2 className="mb-4 text-[10px] font-bold tracking-[.18em] text-brand">01 / HEARING SUMMARY</h2><dl className="grid grid-cols-2 gap-x-8 gap-y-5"><Item label="依頼内容" value={summary.request} wide /><Item label={outputs ? `作りたいもの（${outputs}）` : "作りたいもの"} value={summary.output} wide /><Item label="使用目的" value={summary.purpose} /><Item label="ターゲット" value={summary.target} /><Item label="希望予算" value={summary.budget} /><Item label="上限予算" value={summary.maxBudget} /><Item label="希望納期" value={jpDate(summary.dueDate)} /><Item label="参考URL" value={summary.referenceUrl} /><Item label="使用媒体 / 期間" value={`${summary.media} / ${summary.usagePeriod}`} /><Item label="ポートフォリオ掲載可否" value={summary.portfolio} /></dl></section><section className="border-t border-neutral-200 pt-5"><h2 className="mb-4 text-[10px] font-bold tracking-[.18em] text-brand">02 / HEARING CONDITIONS</h2>{conditionSections.length ? <div className="space-y-4">{conditionSections.map((section) => <div key={section.title}><h3 className="mb-2 text-[10px] font-bold text-ink">{section.title}</h3><dl className="grid grid-cols-2 gap-x-8 gap-y-2">{section.answered.length ? section.answered.slice(0, 12).map(([field, value]) => <Item key={`${section.title}:${field}`} label={field} value={value} />) : <Item label="確認状況" value="聞き取り未入力" />}</dl></div>)}</div> : <dl className="grid grid-cols-2 gap-x-8 gap-y-4"><Item label="実施日／納期" value={jpDate(summary.dueDate)} /><Item label="場所／対応場所" value={d.location} /></dl>}</section><section className="mt-5 border-t border-neutral-200 pt-5"><h2 className="mb-4 text-[10px] font-bold tracking-[.18em] text-brand">03 / OUTPUT & RIGHTS</h2><dl className="grid grid-cols-2 gap-x-8 gap-y-4"><Item label="成果物／完了業務" value={d.deliverables || summary.output} /><Item label="形式／報告形式" value={d.format} /><Item label="二次利用" value={d.secondaryUse} /><Item label="著作権・使用権" value={d.copyright} /><Item label="元データ納品有無" value={d.dataHandover} /><Item label="掲載可否" value={`SNS:${d.snsPermission} / HP:${d.websitePermission} / Portfolio:${d.portfolioPermission}`} /></dl></section>{summary.undecided && <div className="mt-6 rounded border border-red-200 bg-brand-soft p-3"><strong className="text-brand">未確定事項</strong><div className="mt-1 text-[11px]">{summary.undecided}</div></div>}</article>;
}

function Estimate({ d, totals }: { d: ProjectDocument; totals: Totals }) {
  const notes = selectedNotesForDocument(d);
  return <article className={pageClass}><Header title="御 見 積 書" number={d.projectNo} date={d.issueDate} extra={<div>有効期限：{jpDate(d.validUntil)}</div>} /><Parties d={d} /><div className="mb-3 text-[12px]">件名：<strong>{d.projectName}</strong></div><Amount label="お見積金額" value={totals.total} /><Lines d={d} /><TotalsTable totals={totals} taxRate={d.taxRate} /><div className="avoid-break mt-5 border-t border-neutral-200 pt-3 text-neutral-600"><div>お支払条件：{d.paymentTerms}</div><div>納品予定：{jpDate(d.deliveryDate)}</div></div><NotesBlock notes={notes} /></article>;
}

function Settlement({ d, totals }: { d: ProjectDocument; totals: Totals }) {
  return <article className={pageClass}><Header title="精 算 書" number={d.projectNo} date={d.issueDate} /><Parties d={d} /><div className="mb-3 text-[12px]">件名：<strong>{d.projectName}</strong></div><Amount label="精算金額" value={totals.settlementGross} /><table className="mb-4 w-full table-fixed border-collapse"><thead><tr className="bg-ink text-white"><th className="w-[13%] px-2 py-2 text-left">日付</th><th className="w-[13%] px-2 py-2 text-left">費目</th><th className="w-[24%] px-2 py-2 text-left">内容</th><th className="w-[16%] px-2 py-2 text-left">支払先</th><th className="w-[12%] px-2 py-2 text-center">領収書</th><th className="w-[10%] px-2 py-2 text-center">税</th><th className="w-[12%] px-2 py-2 text-right">金額</th></tr></thead><tbody>{(d.expenseLines ?? []).filter((line) => settlementAmount(line, d.taxRate).gross > 0).map((line) => { const amount = settlementAmount(line, d.taxRate); return <tr key={line.id} className="border-b border-neutral-200 align-top"><td className="px-2 py-2">{jpDate(line.date)}</td><td className="px-2 py-2">{line.category}</td><td className="px-2 py-2"><div className="font-bold text-ink">{line.description || "—"}</div>{line.memo && <div className="text-neutral-500">{line.memo}</div>}<div className="text-[8px] text-neutral-400">立替：{line.paidBy || "—"} / {line.billable ? "精算対象" : "対象外"}</div></td><td className="px-2 py-2">{line.payee}</td><td className="px-2 py-2 text-center">{line.hasReceipt ? "あり" : "なし"}</td><td className="px-2 py-2 text-center">{line.tax}</td><td className="px-2 py-2 text-right font-bold">{yen(amount.gross)}</td></tr>; })}</tbody></table><div className="avoid-break flex justify-end"><table className="w-[250px]"><tbody><tr><td className="px-2 py-1 text-right text-neutral-500">精算費</td><td className="px-2 py-1 text-right">{yen(totals.settlementNet)}</td></tr><tr><td className="px-2 py-1 text-right text-neutral-500">消費税</td><td className="px-2 py-1 text-right">{yen(totals.settlementTax)}</td></tr><tr className="border-t-2 border-ink text-[13px] font-bold"><td className="px-2 py-2 text-right">合計</td><td className="px-2 py-2 text-right">{yen(totals.settlementGross)}</td></tr></tbody></table></div></article>;
}

function Delivery({ d }: { d: ProjectDocument }) {
  const name = getCompletionDocumentName(d.selectedRoles);
  const rows = deliveryRowsFromHearing(d);
  return <article className={pageClass}><Header title={name} number={d.projectNo} date={d.deliveryDateActual || d.deliveryDate} dateLabel={name === "納品書" ? "納品日" : "完了日"} /><Parties d={d} /><Rows rows={[[name === "納品書" ? "納品日" : "業務完了日", jpDate(d.deliveryDateActual || d.deliveryDate)], ["案件名", d.projectName], ["発注者", `${d.client.company}（${d.client.person}）`], ["受注者", `${d.vendor.name}（${d.vendor.person}）`], ...rows, ["備考", compactText(d.deliveryNotes)]]} /><div className="avoid-break mt-10 flex justify-end"><div className="text-center"><div className="mb-1 text-neutral-500">{name === "納品書" ? "受領確認" : "完了確認"}</div><div className="flex h-20 w-20 items-center justify-center border border-neutral-400 text-neutral-300">印</div></div></div></article>;
}

function Invoice({ d, totals }: { d: ProjectDocument; totals: Totals }) {
  const invoiceLines = mergeRoleTemplates(d.selectedRoles).invoiceLines;
  return <article className={pageClass}><Header title="請 求 書" number={d.projectNo} date={d.invoiceDate} dateLabel="請求日" extra={<div>支払期限：{jpDate(d.paymentDue)}</div>} /><Parties d={d} /><div className="mb-3 text-[12px]">件名：<strong>{d.projectName}</strong></div><Amount label="合計請求金額" value={totals.invoiceTotal} /><div className="avoid-break mb-6 rounded border border-neutral-200 p-4"><table className="w-full"><tbody><tr><td className="py-1 text-neutral-500">制作費小計</td><td className="py-1 text-right font-bold">{yen(totals.estimateNet)}</td></tr><tr><td className="py-1 text-neutral-500">精算費小計</td><td className="py-1 text-right font-bold">{yen(totals.settlementNet)}</td></tr><tr><td className="py-1 text-neutral-500">消費税</td><td className="py-1 text-right">{yen(totals.invoiceTax)}</td></tr>{totals.withholding > 0 && <tr><td className="py-1 text-neutral-500">源泉徴収</td><td className="py-1 text-right">-{yen(totals.withholding)}</td></tr>}<tr className="border-t-2 border-ink text-[13px] font-bold"><td className="py-2">合計請求金額</td><td className="py-2 text-right">{yen(totals.invoiceTotal)}</td></tr></tbody></table></div>{invoiceLines.length > 0 && <div className="avoid-break mb-5 rounded border border-neutral-200 p-3"><h2 className="mb-2 text-[11px] font-bold text-ink">請求書項目</h2><div className="grid grid-cols-2 gap-1 text-neutral-600">{invoiceLines.map((line) => <div key={line}>・{line}</div>)}</div></div>}<h2 className="mb-2 text-[11px] font-bold text-ink">制作費明細</h2><Lines d={d} />{totals.settlementGross > 0 && <div className="avoid-break mb-5 rounded border border-neutral-200 p-3 text-neutral-600">精算費：{yen(totals.settlementGross)}（別紙精算書参照）</div>}<div className="avoid-break mt-7 rounded border border-neutral-300 p-4"><div className="mb-1 font-bold">お振込先</div><div>{d.vendor.bankName} {d.vendor.bankBranch} ／ {d.vendor.bankType} {d.vendor.bankAccount}</div><div>{d.vendor.bankHolder}</div><div className="mt-1 text-neutral-500">振込手数料は貴社にてご負担をお願いいたします。</div></div></article>;
}

function Confirmation({ d, totals }: { d: ProjectDocument; totals: Totals }) {
  const summary = hearingSummary(d);
  const conditions = conditionOutlineFromHearing(d).map((section) => `${section.title}：${section.answered.length ? section.answered.map(([field, value]) => `${field}=${value}`).join("、") : "聞き取り未入力"}`).join("\n");
  const notes = selectedNotesForDocument(d);
  const rows: [string, string][] = [["案件名", summary.projectName], ["発注者", `${d.client.company}（${d.client.person}）`], ["受注者", `${d.vendor.name}（${d.vendor.person}）`], ["業務内容", summary.output || summary.request], ["使用目的", summary.purpose], ["職種別条件", conditions], ["実施日／納期", jpDate(summary.dueDate)], ["成果物／完了業務", d.deliverables || summary.output], ["形式／報告形式", d.format], ["報酬額（税込）", yen(totals.total)], ["精算費", "実費精算が発生する場合は別紙精算書に基づく"], ["支払条件", d.paymentTerms], ["修正回数／リテイク回数", `${d.revisions}回まで`], ["対応範囲", d.inScope || summary.request], ["対応しない範囲", d.outOfScope], ["使用媒体 / 期間", `${summary.media} / ${summary.usagePeriod}`], ["二次利用", d.secondaryUse], ["ポートフォリオ掲載可否", summary.portfolio], ["掲載可否", `SNS：${d.snsPermission} / HP：${d.websitePermission} / ポートフォリオ：${d.portfolioPermission}`], ["クレジット表記", d.credit], ["著作権・使用権", d.copyright], ["元データ納品有無", d.dataHandover], ["追加費用条件", notes.join("\n")], ["キャンセル規定", d.roleAnswers["共通:キャンセル規定"] || d.roleAnswers["詳細条件確認:キャンセル規定"] || "別途協議"], ["備考", notes.join("\n")]];
  return <article className={pageClass}><Header title="業務内容確認書" number={d.projectNo} date={d.issueDate} /><RoleAccent d={d} /><p className="mb-5 text-neutral-600">{d.confirmationIntro}</p><Rows rows={rows} /><div className="avoid-break mt-7 flex justify-end gap-5">{["発注者", "受注者"].map((role) => <div key={role} className="text-center"><div className="mb-1 text-neutral-500">{role} 確認</div><div className="flex h-20 w-20 items-center justify-center border border-neutral-400 text-neutral-300">印</div></div>)}</div></article>;
}

export function DocumentPreview({ kind, document, totals }: { kind: DocumentKind; document: ProjectDocument; totals: Totals }) {
  if (kind === "guide") return <HearingGuide d={document} />;
  if (kind === "hearing") return <Hearing d={document} />;
  if (kind === "sheet") return <Sheet d={document} />;
  if (kind === "estimate") return <Estimate d={document} totals={totals} />;
  if (kind === "settlement") return <Settlement d={document} totals={totals} />;
  if (kind === "confirmation") return <Confirmation d={document} totals={totals} />;
  if (kind === "delivery") return <Delivery d={document} />;
  return <Invoice d={document} totals={totals} />;
}
