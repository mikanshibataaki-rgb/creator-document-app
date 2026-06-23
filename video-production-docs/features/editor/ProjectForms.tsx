import { CATEGORY_OPTIONS, CREATOR_ROLES, KIND_OPTIONS, ROLE_ESTIMATE_TEMPLATES, ROLE_HEARING_FIELDS, SETTLEMENT_CATEGORY_OPTIONS, STATUS_OPTIONS, TAX_OPTIONS, UNIT_OPTIONS, YES_NO_HEARING_OPTIONS, YES_NO_OPTIONS } from "@/domain/constants";
import { createId, createLine, createSettlementLine } from "@/domain/seed";
import type { Client, CreatorRole, EstimateLine, ExpenseLine, ProjectDocument, Totals } from "@/domain/types";
import { settlementAmount, yen } from "@/domain/format";
import { Field, Section, formGridClass } from "@/components/ui/Field";

export type FormTab = "roles" | "hearing" | "parties" | "project" | "conditions" | "estimate" | "settlement" | "confirmation" | "delivery" | "invoice" | "export";

interface Props {
  tab: FormTab; document: ProjectDocument; totals: Totals; clients: Client[];
  update: <K extends keyof ProjectDocument>(key: K, value: ProjectDocument[K]) => void;
  setDocument: (updater: (current: ProjectDocument) => ProjectDocument) => void;
  saveClient: () => void; selectClient: (id: string) => void; newClient: () => void; deleteClient: (id: string) => void;
  onPrint: () => void;
}

const buttonClass = "min-h-11 rounded-xl border border-neutral-300 px-4 text-sm font-semibold transition hover:bg-neutral-50";
const miniButtonClass = "min-h-9 rounded-lg px-3 text-xs font-bold transition";

function updateNested<T extends "client" | "vendor">(setDocument: Props["setDocument"], group: T, key: keyof ProjectDocument[T], value: string) {
  setDocument((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
}

function BooleanSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label} value={value} onChange={onChange} options={YES_NO_HEARING_OPTIONS} full={false} />;
}

export function ProjectForms(props: Props) {
  const { tab, document: d, totals, clients, update, setDocument } = props;
  const changeLine = (id: string, key: keyof EstimateLine, value: string | number) => setDocument((current) => ({ ...current, lines: current.lines.map((line) => line.id === id ? { ...line, [key]: value } : line) }));
  const changeSettlement = (id: string, key: keyof ExpenseLine, value: string | number | boolean) => setDocument((current) => ({ ...current, expenseLines: (current.expenseLines ?? []).map((line) => line.id === id ? { ...line, [key]: value } : line) }));
  const toggleRole = (role: CreatorRole) => setDocument((current) => ({ ...current, selectedRoles: current.selectedRoles.includes(role) ? current.selectedRoles.filter((item) => item !== role) : [...current.selectedRoles, role] }));
  const updateRoleAnswer = (role: CreatorRole, field: string, value: string) => setDocument((current) => ({ ...current, roleAnswers: { ...current.roleAnswers, [`${role}:${field}`]: value } }));
  const addTemplateLines = (role: CreatorRole) => {
    const items = ROLE_ESTIMATE_TEMPLATES[role] ?? [];
    setDocument((current) => ({ ...current, lines: [...current.lines, ...items.map((name) => ({ ...createLine(), id: createId(), category: role === "Web制作者" ? "制作費" : "制作人件費", name }))] }));
  };

  if (tab === "roles") return <Section title="職業選択" description="あなたの職業を選ぶと、次の聞き取り項目と見積テンプレートがその職種向けに変わります。複数選択できます。">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CREATOR_ROLES.map((role) => {
        const active = d.selectedRoles.includes(role);
        return <button key={role} type="button" onClick={() => toggleRole(role)} className={`min-h-14 rounded-2xl border px-4 text-left text-sm font-bold transition ${active ? "border-brand bg-brand text-white shadow-sm" : "border-neutral-200 bg-white text-ink hover:border-brand/50 hover:bg-brand-soft"}`}>
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">{active ? "✓" : ""}</span>{role}
        </button>;
      })}
    </div>
    <div className="mt-5 rounded-2xl bg-neutral-950 p-5 text-white"><p className="text-xs font-bold tracking-[.18em] text-brand">SELECTED ROLES</p><p className="mt-2 text-sm leading-relaxed text-neutral-300">{d.selectedRoles.length ? d.selectedRoles.join(" / ") : "まだ選択されていません。まず職業を選ぶと、このアプリが“あなた用の聞き取り表”になります。"}</p></div>
  </Section>;

  if (tab === "hearing") return <Section title="聞き取り" description="最初に、お客さんの言葉のまま要望を集めます。ここが後工程の材料になります。"><div className={formGridClass}>
    <Field label="何を作ってほしいか" value={d.requestedContent} onChange={(v) => update("requestedContent", v)} rows={3} />
    <Field label="完成物のイメージ" value={d.finalImage} onChange={(v) => update("finalImage", v)} rows={3} />
    <Field label="使用目的" value={d.purpose} onChange={(v) => update("purpose", v)} full={false} />
    <Field label="ターゲット" value={d.target} onChange={(v) => update("target", v)} full={false} />
    <Field label="使用媒体" value={d.media} onChange={(v) => update("media", v)} />
    <Field label="希望予算" value={d.budget} onChange={(v) => update("budget", v)} full={false} />
    <Field label="上限予算" value={d.maxBudget} onChange={(v) => update("maxBudget", v)} full={false} />
    <Field label="相見積もりか" value={d.competingQuote} onChange={(v) => update("competingQuote", v)} options={["未確認", "はい", "いいえ"]} full={false} />
    <Field label="希望納期" value={d.desiredDeliveryDate} onChange={(v) => update("desiredDeliveryDate", v)} type="date" full={false} />
    <Field label="参考URL" value={d.referenceUrl} onChange={(v) => update("referenceUrl", v)} type="url" />
    <Field label="未確定事項" value={d.undecided} onChange={(v) => update("undecided", v)} rows={2} />
    <Field label="社内メモ" value={d.internalMemo} onChange={(v) => update("internalMemo", v)} rows={2} hint="PDFには出力されません。" />
    {d.selectedRoles.length > 0 && <div className="col-span-1 space-y-5 border-t border-neutral-200 pt-5 sm:col-span-2">{d.selectedRoles.map((role) => <div key={role} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><h3 className="mb-3 text-sm font-bold text-ink">{role}向けの確認項目</h3><div className={formGridClass}>{ROLE_HEARING_FIELDS[role].map((field) => <Field key={`${role}:${field}`} label={field} value={d.roleAnswers[`${role}:${field}`] ?? ""} onChange={(v) => updateRoleAnswer(role, field, v)} full={false} />)}</div></div>)}</div>}
  </div></Section>;

  if (tab === "project") return <Section title="案件整理" description="聞き取り内容を、社内で扱いやすい案件シートに整理します。"><div className={formGridClass}>
    <Field label="案件名" value={d.projectName} onChange={(v) => update("projectName", v)} />
    <Field label="案件番号" value={d.projectNo} onChange={(v) => update("projectNo", v)} full={false} />
    <Field label="ステータス" value={d.status} onChange={(v) => update("status", v)} options={STATUS_OPTIONS} full={false} />
    <Field label="案件種別" value={d.kind} onChange={(v) => update("kind", v)} options={KIND_OPTIONS} full={false} />
    <Field label="依頼の概要" value={d.summary} onChange={(v) => update("summary", v)} rows={3} />
    <Field label="作りたいもの" value={d.deliverableIdea} onChange={(v) => update("deliverableIdea", v)} rows={2} />
    <Field label="使用目的" value={d.purpose} onChange={(v) => update("purpose", v)} full={false} />
    <Field label="ターゲット" value={d.target} onChange={(v) => update("target", v)} full={false} />
    <Field label="希望予算" value={d.budget} onChange={(v) => update("budget", v)} full={false} />
    <Field label="参考URL" value={d.referenceUrl} onChange={(v) => update("referenceUrl", v)} type="url" full={false} />
    <Field label="未確定事項" value={d.undecided} onChange={(v) => update("undecided", v)} rows={2} />
    <Field label="社内メモ" value={d.internalMemo} onChange={(v) => update("internalMemo", v)} rows={2} hint="PDFには出力されません。" />
  </div></Section>;

  if (tab === "parties") return <Section title="取引先・自社情報" description="聞き取り後に発注者情報を固めます。取引先はブラウザ内に保存できます。"><div className="space-y-8">
    <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">発注者</h3><div className="flex gap-2"><button className={buttonClass} onClick={props.newClient}>新規</button><button className={`${buttonClass} border-brand bg-brand text-white hover:bg-brand-dark`} onClick={props.saveClient}>取引先を保存</button></div></div>
      <label className="mb-4 block"><span className="mb-1.5 block text-xs font-semibold text-neutral-600">登録済み取引先</span><select className="min-h-11 w-full rounded-xl border border-neutral-300 px-3" value={d.client.id} onChange={(e) => props.selectClient(e.target.value)}><option value="">新規入力</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</select></label>
      <div className={formGridClass}>
        <Field label="会社名" value={d.client.company} onChange={(v) => updateNested(setDocument, "client", "company", v)} />
        <Field label="担当者" value={d.client.person} onChange={(v) => updateNested(setDocument, "client", "person", v)} full={false} />
        <Field label="電話番号" value={d.client.phone} onChange={(v) => updateNested(setDocument, "client", "phone", v)} type="tel" full={false} />
        <Field label="郵便番号" value={d.client.postalCode} onChange={(v) => updateNested(setDocument, "client", "postalCode", v)} full={false} />
        <Field label="メール" value={d.client.email} onChange={(v) => updateNested(setDocument, "client", "email", v)} type="email" full={false} />
        <Field label="住所" value={d.client.address} onChange={(v) => updateNested(setDocument, "client", "address", v)} />
        <Field label="インボイス登録番号" value={d.client.invoiceNo} onChange={(v) => updateNested(setDocument, "client", "invoiceNo", v)} />
      </div>
      {clients.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{clients.map((client) => <button key={client.id} onClick={() => props.deleteClient(client.id)} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs text-neutral-500 hover:text-brand">{client.company} ×</button>)}</div>}
    </div>
    <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5"><h3 className="mb-4 font-bold">受注者（自社）</h3><div className={formGridClass}>
      <Field label="法人名 / 屋号" value={d.vendor.name} onChange={(v) => updateNested(setDocument, "vendor", "name", v)} />
      <Field label="担当者" value={d.vendor.person} onChange={(v) => updateNested(setDocument, "vendor", "person", v)} full={false} />
      <Field label="電話番号" value={d.vendor.phone} onChange={(v) => updateNested(setDocument, "vendor", "phone", v)} full={false} />
      <Field label="郵便番号" value={d.vendor.postalCode} onChange={(v) => updateNested(setDocument, "vendor", "postalCode", v)} full={false} />
      <Field label="メール" value={d.vendor.email} onChange={(v) => updateNested(setDocument, "vendor", "email", v)} full={false} />
      <Field label="住所" value={d.vendor.address} onChange={(v) => updateNested(setDocument, "vendor", "address", v)} />
      <Field label="登録番号" value={d.vendor.invoiceNo} onChange={(v) => updateNested(setDocument, "vendor", "invoiceNo", v)} />
      <Field label="銀行" value={d.vendor.bankName} onChange={(v) => updateNested(setDocument, "vendor", "bankName", v)} full={false} />
      <Field label="支店" value={d.vendor.bankBranch} onChange={(v) => updateNested(setDocument, "vendor", "bankBranch", v)} full={false} />
      <Field label="口座種別" value={d.vendor.bankType} onChange={(v) => updateNested(setDocument, "vendor", "bankType", v)} options={["普通", "当座"]} full={false} />
      <Field label="口座番号" value={d.vendor.bankAccount} onChange={(v) => updateNested(setDocument, "vendor", "bankAccount", v)} full={false} />
      <Field label="口座名義" value={d.vendor.bankHolder} onChange={(v) => updateNested(setDocument, "vendor", "bankHolder", v)} />
    </div></div>
  </div></Section>;

  if (tab === "conditions") return <Section title="制作条件" description="見積書・確認書・納品書の共通前提です。"><div className={formGridClass}>
    <Field label="撮影日" value={d.shootDate} onChange={(v) => update("shootDate", v)} type="date" full={false} /><Field label="納品予定日" value={d.deliveryDate} onChange={(v) => update("deliveryDate", v)} type="date" full={false} />
    <Field label="撮影場所" value={d.location} onChange={(v) => update("location", v)} /><Field label="納品物" value={d.deliverables} onChange={(v) => update("deliverables", v)} rows={2} /><Field label="納品形式" value={d.format} onChange={(v) => update("format", v)} />
    <Field label="修正回数" value={d.revisions} onChange={(v) => update("revisions", v)} full={false} /><Field label="使用期間" value={d.usagePeriod} onChange={(v) => update("usagePeriod", v)} full={false} />
    <Field label="使用媒体" value={d.media} onChange={(v) => update("media", v)} /><Field label="二次利用" value={d.secondaryUse} onChange={(v) => update("secondaryUse", v)} />
    <Field label="SNS掲載" value={d.snsPermission} onChange={(v) => update("snsPermission", v)} options={YES_NO_OPTIONS} full={false} /><Field label="HP掲載" value={d.websitePermission} onChange={(v) => update("websitePermission", v)} options={YES_NO_OPTIONS} full={false} /><Field label="ポートフォリオ掲載" value={d.portfolioPermission} onChange={(v) => update("portfolioPermission", v)} options={YES_NO_OPTIONS} full={false} />
  </div></Section>;

  if (tab === "estimate") return <Section title="見積作成" description="職業別テンプレートから明細を追加できます。税別は外税、税込は内税で計算します。" action={<button className={`${buttonClass} bg-ink text-white`} onClick={() => setDocument((c) => ({ ...c, lines: [...c.lines, createLine()] }))}>＋ 明細</button>}>
    {d.selectedRoles.some((role) => ROLE_ESTIMATE_TEMPLATES[role]?.length) && <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="mb-3 text-xs font-bold tracking-[.16em] text-neutral-500">おすすめ見積テンプレート</p><div className="flex flex-wrap gap-2">{d.selectedRoles.filter((role) => ROLE_ESTIMATE_TEMPLATES[role]?.length).map((role) => <button key={role} className={`${miniButtonClass} bg-white text-ink ring-1 ring-neutral-200 hover:bg-brand hover:text-white`} onClick={() => addTemplateLines(role)}>＋ {role}</button>)}</div></div>}
    <div className="space-y-3">{d.lines.map((line, index) => <div key={line.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-neutral-400">明細 {index + 1}</span><button className="min-h-9 px-2 text-sm text-neutral-400 hover:text-brand" onClick={() => setDocument((c) => ({ ...c, lines: c.lines.filter((item) => item.id !== line.id) }))}>削除</button></div>
      <div className={formGridClass}><Field label="分類" value={line.category} onChange={(v) => changeLine(line.id, "category", v)} options={CATEGORY_OPTIONS} full={false} /><Field label="品名" value={line.name} onChange={(v) => changeLine(line.id, "name", v)} full={false} /><Field label="摘要" value={line.description} onChange={(v) => changeLine(line.id, "description", v)} />
        <Field label="単価" value={line.unitPrice} onChange={(v) => changeLine(line.id, "unitPrice", Number(v))} type="number" full={false} /><Field label="数量" value={line.quantity} onChange={(v) => changeLine(line.id, "quantity", Number(v))} type="number" full={false} /><Field label="単位" value={line.unit} onChange={(v) => changeLine(line.id, "unit", v)} options={UNIT_OPTIONS} full={false} /><Field label="税区分" value={line.tax} onChange={(v) => changeLine(line.id, "tax", v)} options={TAX_OPTIONS} full={false} />
      </div><div className="mt-3 border-t border-neutral-100 pt-3 text-right text-sm font-bold">{yen(line.unitPrice * line.quantity)} <span className="text-xs font-normal text-neutral-400">入力額 / {line.tax}</span></div>
    </div>)}</div>
    <div className={`mt-5 ${formGridClass}`}><Field label="発行日" value={d.issueDate} onChange={(v) => update("issueDate", v)} type="date" full={false} /><Field label="有効期限" value={d.validUntil} onChange={(v) => update("validUntil", v)} type="date" full={false} /><Field label="支払条件" value={d.paymentTerms} onChange={(v) => update("paymentTerms", v)} /><Field label="値引き（税抜）" value={d.discount} onChange={(v) => update("discount", Number(v))} type="number" full={false} /><Field label="税率（%）" value={d.taxRate} onChange={(v) => update("taxRate", Number(v))} options={[10, 8, 0]} full={false} /><Field label="前金" value={d.advance} onChange={(v) => update("advance", Number(v))} type="number" full={false} />
      <label className="flex min-h-11 items-center gap-3 text-sm"><input className="h-5 w-5 accent-brand" type="checkbox" checked={d.withholdingEnabled} onChange={(e) => update("withholdingEnabled", e.target.checked)} />源泉徴収（10.21%）</label>
    </div><div className="mt-5 rounded-2xl bg-neutral-900 p-5 text-white"><div className="flex justify-between text-sm text-neutral-300"><span>制作費 税抜</span><span>{yen(totals.estimateNet)}</span></div><div className="mt-1 flex justify-between text-sm text-neutral-300"><span>消費税</span><span>{yen(totals.estimateTax)}</span></div><div className="mt-2 flex justify-between text-lg font-bold"><span>見積合計</span><span>{yen(totals.estimateGross)}</span></div></div>
  </Section>;

  if (tab === "settlement") return <Section title="精算・領収書" description="見積とは別に、立替・領収書精算を管理します。" action={<button className={`${buttonClass} bg-ink text-white`} onClick={() => setDocument((c) => ({ ...c, expenseLines: [...(c.expenseLines ?? []), createSettlementLine()] }))}>＋ 精算</button>}>
    <div className="space-y-3">{(d.expenseLines ?? []).map((line, index) => {
      const amount = settlementAmount(line, d.taxRate);
      return <div key={line.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-neutral-400">精算 {index + 1}</span><button className="min-h-9 px-2 text-sm text-neutral-400 hover:text-brand" onClick={() => setDocument((c) => ({ ...c, expenseLines: (c.expenseLines ?? []).filter((item) => item.id !== line.id) }))}>削除</button></div>
        <div className={formGridClass}>
          <Field label="日付" value={line.date} onChange={(v) => changeSettlement(line.id, "date", v)} type="date" full={false} />
          <Field label="費目" value={line.category} onChange={(v) => changeSettlement(line.id, "category", v)} options={SETTLEMENT_CATEGORY_OPTIONS} full={false} />
          <Field label="内容" value={line.description} onChange={(v) => changeSettlement(line.id, "description", v)} />
          <Field label="支払先" value={line.payee} onChange={(v) => changeSettlement(line.id, "payee", v)} full={false} />
          <Field label="金額" value={line.amount} onChange={(v) => changeSettlement(line.id, "amount", Number(v))} type="number" full={false} />
          <Field label="税区分" value={line.tax} onChange={(v) => changeSettlement(line.id, "tax", v)} options={TAX_OPTIONS} full={false} />
          <Field label="立替者" value={line.paidBy} onChange={(v) => changeSettlement(line.id, "paidBy", v)} full={false} />
          <label className="flex min-h-11 items-center gap-3 text-sm"><input className="h-5 w-5 accent-brand" type="checkbox" checked={line.hasReceipt} onChange={(e) => changeSettlement(line.id, "hasReceipt", e.target.checked)} />領収書あり</label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input className="h-5 w-5 accent-brand" type="checkbox" checked={line.billable} onChange={(e) => changeSettlement(line.id, "billable", e.target.checked)} />精算対象</label>
          <Field label="備考" value={line.memo} onChange={(v) => changeSettlement(line.id, "memo", v)} />
        </div>
        <div className="mt-3 flex justify-end gap-4 border-t border-neutral-100 pt-3 text-sm"><span className="text-neutral-400">税抜 {yen(amount.net)}</span><strong>{yen(amount.gross)}</strong></div>
      </div>;
    })}</div>
    <div className="mt-5 rounded-2xl bg-neutral-900 p-5 text-white"><div className="flex justify-between text-sm text-neutral-300"><span>精算費 税抜</span><span>{yen(totals.settlementNet)}</span></div><div className="mt-1 flex justify-between text-sm text-neutral-300"><span>消費税</span><span>{yen(totals.settlementTax)}</span></div><div className="mt-2 flex justify-between text-lg font-bold"><span>精算合計</span><span>{yen(totals.settlementGross)}</span></div></div>
  </Section>;

  if (tab === "confirmation") return <Section title="業務内容確認" description="共通データを利用し、契約前の認識差を減らします。"><div className={formGridClass}>
    <Field label="前文" value={d.confirmationIntro} onChange={(v) => update("confirmationIntro", v)} rows={2} /><Field label="対応範囲" value={d.inScope} onChange={(v) => update("inScope", v)} rows={2} /><Field label="対応しない範囲" value={d.outOfScope} onChange={(v) => update("outOfScope", v)} rows={2} /><Field label="備考" value={d.notes} onChange={(v) => update("notes", v)} rows={2} /><Field label="クレジット表記" value={d.credit} onChange={(v) => update("credit", v)} /><Field label="著作権" value={d.copyright} onChange={(v) => update("copyright", v)} /><Field label="データ引き渡し" value={d.dataHandover} onChange={(v) => update("dataHandover", v)} />
  </div></Section>;

  if (tab === "delivery") return <Section title="納品書" description="納品日・納品形式・納品方法を整理します。"><div className={formGridClass}>
    <Field label="納品日" value={d.deliveryDateActual} onChange={(v) => update("deliveryDateActual", v)} type="date" full={false} />
    <Field label="案件名" value={d.projectName} onChange={(v) => update("projectName", v)} />
    <Field label="納品物" value={d.deliverables} onChange={(v) => update("deliverables", v)} rows={2} />
    <Field label="納品形式" value={d.format} onChange={(v) => update("format", v)} />
    <Field label="納品方法" value={d.deliveryMethod} onChange={(v) => update("deliveryMethod", v)} />
    <Field label="備考" value={d.deliveryNotes} onChange={(v) => update("deliveryNotes", v)} rows={2} />
  </div></Section>;

  if (tab === "invoice") return <Section title="請求書" description="制作費に精算費を足して、請求金額に反映します。"><div className={formGridClass}><Field label="請求日" value={d.invoiceDate} onChange={(v) => update("invoiceDate", v)} type="date" full={false} /><Field label="支払期限" value={d.paymentDue} onChange={(v) => update("paymentDue", v)} type="date" full={false} /><Field label="銀行" value={d.vendor.bankName} onChange={(v) => updateNested(setDocument, "vendor", "bankName", v)} full={false} /><Field label="支店" value={d.vendor.bankBranch} onChange={(v) => updateNested(setDocument, "vendor", "bankBranch", v)} full={false} /><Field label="口座種別" value={d.vendor.bankType} onChange={(v) => updateNested(setDocument, "vendor", "bankType", v)} options={["普通", "当座"]} full={false} /><Field label="口座番号" value={d.vendor.bankAccount} onChange={(v) => updateNested(setDocument, "vendor", "bankAccount", v)} full={false} /><Field label="口座名義" value={d.vendor.bankHolder} onChange={(v) => updateNested(setDocument, "vendor", "bankHolder", v)} /></div><div className="mt-5 rounded-2xl bg-neutral-900 p-5 text-white"><div className="flex justify-between text-sm"><span>制作費</span><span>{yen(totals.estimateGross)}</span></div><div className="mt-1 flex justify-between text-sm"><span>精算費</span><span>{yen(totals.settlementGross)}</span></div><div className="mt-2 flex justify-between border-t border-white/20 pt-2 text-lg font-bold"><span>請求合計</span><span>{yen(totals.invoiceTotal)}</span></div></div></Section>;

  return <Section title="PDF出力" description="右側で書類を選び、ブラウザの印刷機能からPDFとして保存します。"><div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-neutral-500">案件名</dt><dd className="text-right font-semibold">{d.projectName}</dd></div><div className="flex justify-between"><dt className="text-neutral-500">発注者</dt><dd className="font-semibold">{d.client.company}</dd></div><div className="flex justify-between"><dt className="text-neutral-500">制作費</dt><dd className="font-semibold">{yen(totals.estimateGross)}</dd></div><div className="flex justify-between"><dt className="text-neutral-500">精算費</dt><dd className="font-semibold">{yen(totals.settlementGross)}</dd></div><div className="flex justify-between"><dt className="text-neutral-500">請求金額</dt><dd className="font-bold">{yen(totals.invoiceTotal)}</dd></div></dl></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"><button onClick={props.onPrint} className={`${miniButtonClass} bg-brand text-white sm:col-span-3`}>表示中の書類をPDF出力</button></div><p className="mt-3 text-xs leading-relaxed text-neutral-500">印刷設定は「A4」「倍率100%」「背景グラフィックあり」を推奨します。</p></Section>;
}

export const emptyClient = (): Client => ({ id: createId(), company: "", person: "", postalCode: "", address: "", phone: "", email: "", invoiceNo: "" });
