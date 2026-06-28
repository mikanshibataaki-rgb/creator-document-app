import { useState } from "react";
import { CATEGORY_OPTIONS, CREATOR_ROLES, KIND_OPTIONS, SETTLEMENT_CATEGORY_OPTIONS, STATUS_OPTIONS, TAX_OPTIONS, UNIT_OPTIONS, YES_NO_OPTIONS } from "@/domain/constants";
import { activeEstimateLines, COMMON_HEARING_GROUPS, getCompletionDocumentName, getConditionSections, getInterviewGuideForRoles, getNoteOptionsForRoles, getPrimaryRoleColorMeta, getRoleColorMeta, getUnifiedRoleFieldGroups, mergeRoleTemplates, ROLE_TEMPLATES } from "@/domain/roleTemplates";
import { createId, createLine, createSettlementLine } from "@/domain/seed";
import type { Client, CreatorRole, DocumentKind, EstimateLine, ExpenseLine, ProjectDocument, SavedDocumentRecord, Totals } from "@/domain/types";
import { settlementAmount, yen } from "@/domain/format";
import { estimateCandidatesFromHearing, lineFromCandidate } from "@/domain/derived";
import { CollapsibleSection, Field, Section, formGridClass } from "@/components/ui/Field";

export type FormTab = "roles" | "hearing" | "parties" | "estimate" | "settlement" | "confirmation" | "delivery" | "invoice" | "export" | "records";

interface Props {
  tab: FormTab; document: ProjectDocument; documentKind: DocumentKind; totals: Totals; clients: Client[]; records: SavedDocumentRecord[]; recommendedFileName: string;
  update: <K extends keyof ProjectDocument>(key: K, value: ProjectDocument[K]) => void;
  setDocument: (updater: (current: ProjectDocument) => ProjectDocument) => void;
  saveClient: () => void; selectClient: (id: string) => void; newClient: () => void; deleteClient: (id: string) => void;
  onPrint: () => void; onSaveRecord: () => void; onDuplicateRecord: (record: SavedDocumentRecord) => void; onDeleteRecord: (id: string) => void; onClearLocalData: () => void;
  onSelectDocument: (kind: DocumentKind) => void;
}

const buttonClass = "min-h-11 rounded-xl border border-line-strong px-4 text-sm font-semibold transition hover:bg-surface-2";
const miniButtonClass = "min-h-9 rounded-lg px-3 text-xs font-bold transition";

type ExtractionCandidate = {
  id: string;
  label: string;
  value: string;
  target: keyof ProjectDocument | "roleAnswer" | "estimateCandidate";
  scope?: string;
  field?: string;
  category?: string;
  selected: boolean;
};

const findFirst = (text: string, patterns: RegExp[]) => patterns.map((pattern) => text.match(pattern)?.[1]?.trim()).find(Boolean) ?? "";
const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

function updateNested<T extends "client" | "vendor">(setDocument: Props["setDocument"], group: T, key: keyof ProjectDocument[T], value: string) {
  setDocument((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
}

export function ProjectForms(props: Props) {
  const { tab, document: d, totals, clients, update, setDocument } = props;
  const [extractionCandidates, setExtractionCandidates] = useState<ExtractionCandidate[]>([]);
  const [hearingMode, setHearingMode] = useState<"manual" | "transcript">("manual");
  const changeLine = (id: string, key: keyof EstimateLine, value: string | number) => setDocument((current) => ({ ...current, lines: current.lines.map((line) => line.id === id ? { ...line, [key]: value } : line) }));
  const changeSettlement = (id: string, key: keyof ExpenseLine, value: string | number | boolean) => setDocument((current) => ({ ...current, expenseLines: (current.expenseLines ?? []).map((line) => line.id === id ? { ...line, [key]: value } : line) }));
  const roleFieldGroups = getUnifiedRoleFieldGroups(d.selectedRoles);
  const selectedTemplate = mergeRoleTemplates(d.selectedRoles);
  const primaryColor = getPrimaryRoleColorMeta(d.selectedRoles);
  const conditionSections = getConditionSections(d.selectedRoles);
  const completionDocumentName = getCompletionDocumentName(d.selectedRoles);
  const estimateCandidates = estimateCandidatesFromHearing(d);
  const visibleEstimateLines = activeEstimateLines(d.lines, d.selectedRoles);
  const noteOptions = getNoteOptionsForRoles(d.selectedRoles);
  const interviewGuide = getInterviewGuideForRoles(d.selectedRoles);
  const interviewGuideGroups = Object.entries(interviewGuide.reduce<Record<string, typeof interviewGuide>>((groups, item) => ({ ...groups, [item.category]: [...(groups[item.category] ?? []), item] }), {}));
  const roleAnswerValue = (scope: string, field: string) => d.roleAnswers[`${scope}:${field}`] ?? Object.entries(d.roleAnswers).find(([key]) => key.endsWith(`:${field}`))?.[1] ?? "";
  const updateRoleAnswer = (scope: string, field: string, value: string) => setDocument((current) => ({ ...current, roleAnswers: { ...current.roleAnswers, [`${scope}:${field}`]: value } }));
  const updateCommonField = (field: string, value: string) => {
    if (field === "案件名") update("projectName", value);
    else if (field === "会社名") updateNested(setDocument, "client", "company", value);
    else if (field === "担当者" || field === "窓口担当者") updateNested(setDocument, "client", "person", value);
    else if (field === "電話番号") updateNested(setDocument, "client", "phone", value);
    else if (field === "メール") updateNested(setDocument, "client", "email", value);
    else if (field === "何を作りたいか") update("requestedContent", value);
    else if (field === "完成物のイメージ" || field === "好きな雰囲気") update("finalImage", value);
    else if (field === "使用目的" || field === "この案件で一番達成したいこと") update("purpose", value);
    else if (field === "想定ターゲット") update("target", value);
    else if (field === "参考作品" || field === "URL") update("referenceUrl", value);
    else if (field === "使用媒体") update("media", value);
    else if (field === "使用期間") update("usagePeriod", value);
    else if (field === "希望予算") update("budget", value);
    else if (field === "上限予算") update("maxBudget", value);
    else if (field === "相見積もり有無") update("competingQuote", value);
    else if (field === "公開予定日") update("publishDate", value);
    else if (field === "最終納品日" || field === "希望納期") update("desiredDeliveryDate", value);
    else if (field === "未確定事項") update("undecided", value);
    else if (field === "社内メモ") update("internalMemo", value);
    else if (field === "二次利用") update("secondaryUse", value);
    else if (field === "著作権譲渡") update("copyright", value);
    else if (field === "元データ納品") update("dataHandover", value);
    else if (field === "実績公開可否" || field === "制作者のポートフォリオ掲載可否") update("portfolioPermission", value);
    else if (field === "SNS掲載可否") update("snsPermission", value);
    else if (field === "HP掲載可否") update("websitePermission", value);
    else updateRoleAnswer("共通", field, value);
  };
  const commonFieldValue = (field: string) => {
    if (field === "案件名") return d.projectName;
    if (field === "会社名") return d.client.company;
    if (field === "担当者" || field === "窓口担当者") return d.client.person;
    if (field === "電話番号") return d.client.phone;
    if (field === "メール") return d.client.email;
    if (field === "何を作りたいか") return d.requestedContent;
    if (field === "完成物のイメージ" || field === "好きな雰囲気") return d.finalImage;
    if (field === "使用目的" || field === "この案件で一番達成したいこと") return d.purpose;
    if (field === "想定ターゲット") return d.target;
    if (field === "参考作品" || field === "URL") return d.referenceUrl;
    if (field === "使用媒体") return d.media;
    if (field === "使用期間") return d.usagePeriod;
    if (field === "希望予算") return d.budget;
    if (field === "上限予算") return d.maxBudget;
    if (field === "相見積もり有無") return d.competingQuote;
    if (field === "公開予定日") return d.publishDate;
    if (field === "最終納品日" || field === "希望納期") return d.desiredDeliveryDate;
    if (field === "未確定事項") return d.undecided;
    if (field === "社内メモ") return d.internalMemo;
    if (field === "二次利用") return d.secondaryUse;
    if (field === "著作権譲渡") return d.copyright;
    if (field === "元データ納品") return d.dataHandover;
    if (field === "実績公開可否" || field === "制作者のポートフォリオ掲載可否") return d.portfolioPermission;
    if (field === "SNS掲載可否") return d.snsPermission;
    if (field === "HP掲載可否") return d.websitePermission;
    return roleAnswerValue("共通", field);
  };
  const applyRoleTextTemplates = (roles: CreatorRole[], force = false) => {
    if (!roles.length) return;
    const template = mergeRoleTemplates(roles);
    const hasContent = [d.requestedContent, d.summary, d.deliverableIdea, d.deliveryNotes, d.confirmationIntro, d.copyright, d.deliverables].some((value) => value.trim());
    if (hasContent && !force && typeof window !== "undefined" && !window.confirm("選択した職業のテンプレートを反映しますか？既存入力がある項目はテンプレート文で上書きされます。")) return;
    setDocument((current) => ({
      ...current,
      requestedContent: template.hearingExample || current.requestedContent,
      summary: template.projectExample || current.summary,
      deliverableIdea: template.projectExample || current.deliverableIdea,
      deliverables: template.deliverables || current.deliverables,
      format: template.format || current.format,
      deliveryMethod: template.deliveryMethod || current.deliveryMethod,
      deliveryNotes: template.deliveryText || current.deliveryNotes,
      confirmationIntro: template.confirmText || current.confirmationIntro,
      copyright: template.rightsText || current.copyright
    }));
  };
  const toggleNote = (id: string) => setDocument((current) => {
    const selected = new Set(current.selectedNoteIds ?? []);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    return { ...current, selectedNoteIds: Array.from(selected) };
  });
  const toggleRole = (role: CreatorRole) => {
    const adding = !d.selectedRoles.includes(role);
    const nextRoles = adding ? [...d.selectedRoles, role] : d.selectedRoles.filter((item) => item !== role);
    setDocument((current) => {
      const nextTemplate = mergeRoleTemplates(nextRoles);
      const allTemplates = Object.values(ROLE_TEMPLATES);
      const isKnownComposition = (key: "deliverables" | "format" | "deliveryMethod" | "deliveryText" | "confirmText" | "rightsText", value: string) => {
        let remaining = value;
        for (const template of allTemplates) remaining = remaining.replaceAll(template[key] ?? "", "");
        return remaining.replace(/[\s/／,、・]+/g, "") === "";
      };
      const isTemplateComposition = (key: "hearingExample" | "projectExample", value: string) => {
        let remaining = value;
        for (const template of allTemplates) remaining = remaining.replaceAll(template[key], "");
        return remaining.replace(/\s+/g, "") === "";
      };
      const validNoteIds = new Set(getNoteOptionsForRoles(nextRoles).map((option) => option.id));
      return {
        ...current,
        selectedRoles: nextRoles,
        requestedContent: isTemplateComposition("hearingExample", current.requestedContent) ? nextTemplate.hearingExample : current.requestedContent,
        summary: isTemplateComposition("projectExample", current.summary) ? nextTemplate.projectExample : current.summary,
        deliverableIdea: isTemplateComposition("projectExample", current.deliverableIdea) ? nextTemplate.projectExample : current.deliverableIdea,
        deliverables: isKnownComposition("deliverables", current.deliverables) ? nextTemplate.deliverables : current.deliverables,
        format: isKnownComposition("format", current.format) ? nextTemplate.format : current.format,
        deliveryMethod: isKnownComposition("deliveryMethod", current.deliveryMethod) ? nextTemplate.deliveryMethod : current.deliveryMethod,
        deliveryNotes: isKnownComposition("deliveryText", current.deliveryNotes) ? nextTemplate.deliveryText : current.deliveryNotes,
        confirmationIntro: isKnownComposition("confirmText", current.confirmationIntro) ? nextTemplate.confirmText : current.confirmationIntro,
        copyright: isKnownComposition("rightsText", current.copyright) ? nextTemplate.rightsText : current.copyright,
        selectedNoteIds: (current.selectedNoteIds ?? []).filter((id) => validNoteIds.has(id)),
        dismissedEstimateCandidates: []
      };
    });
  };
  const addTemplateLines = (role: CreatorRole) => {
    const items = ROLE_TEMPLATES[role]?.estimateLines ?? [];
    setDocument((current) => {
      const existing = new Set(current.lines.map((line) => line.name));
      return { ...current, lines: [...current.lines, ...items.filter((item) => !existing.has(item.name)).map((item) => ({ ...createLine(), id: createId(), category: item.category ?? "制作費", name: item.name, description: item.description ?? "", unitPrice: item.unitPrice ?? 0, quantity: item.quantity ?? 1, unit: item.unit ?? "式", tax: item.tax ?? "税別", sourceRole: role }))] };
    });
  };
  const extractFromTranscript = () => {
    const text = d.meetingTranscript.trim();
    if (!text) {
      setExtractionCandidates([]);
      return;
    }
    const next: ExtractionCandidate[] = [];
    const add = (label: string, value: string, target: ExtractionCandidate["target"], extra: Partial<ExtractionCandidate> = {}) => {
      if (!value) return;
      next.push({ id: `${target}:${label}:${next.length}`, label, value, target, selected: true, ...extra });
    };
    add("案件名", findFirst(text, [/案件名(?:は|[:：])\s*([^。\n]+)/, /件名(?:は|[:：])\s*([^。\n]+)/]), "projectName");
    add("依頼内容", findFirst(text, [/依頼内容(?:は|[:：])\s*([^。\n]+)/, /作りたい(?:もの|こと)(?:は|[:：])\s*([^。\n]+)/, /([^。\n]+制作したい)/]), "requestedContent");
    add("目的", findFirst(text, [/目的(?:は|[:：])\s*([^。\n]+)/, /使用目的(?:は|[:：])\s*([^。\n]+)/]), "purpose");
    add("ターゲット", findFirst(text, [/ターゲット(?:は|[:：])\s*([^。\n]+)/, /対象(?:は|[:：])\s*([^。\n]+)/]), "target");
    add("希望予算", findFirst(text, [/希望予算(?:は|[:：])\s*([^。\n]+)/, /予算(?:は|[:：])\s*([^。\n]+)/, /(\d+[〜~\-ー]?\d*万円(?:前後|程度|以内)?)/]), "budget");
    add("上限予算", findFirst(text, [/上限予算(?:は|[:：])\s*([^。\n]+)/, /上限(?:は|[:：])\s*([^。\n]+)/]), "maxBudget");
    add("希望納期", findFirst(text, [/希望納期(?:は|[:：])\s*([^。\n]+)/, /納期(?:は|[:：])\s*([^。\n]+)/, /(20\d{2}[\/\-.年]\d{1,2}[\/\-.月]\d{1,2}日?)/]), "desiredDeliveryDate");
    add("使用媒体", findFirst(text, [/使用媒体[:：]\s*([^\n]+)/]) || [hasAny(text, ["YouTube"]) ? "YouTube" : "", hasAny(text, ["Instagram"]) ? "Instagram" : "", hasAny(text, ["Web", "ホームページ", "サイト"]) ? "Webサイト" : "", hasAny(text, ["SNS"]) ? "SNS" : ""].filter(Boolean).join(" / "), "media");
    add("使用期間", findFirst(text, [/使用期間[:：]\s*([^\n]+)/, /(半年|1年|一年|2年|二年|無期限)/]), "usagePeriod");
    add("未確定事項", findFirst(text, [/未確定事項(?:は|[:：])\s*([^。\n]+)/, /確認事項(?:は|[:：])\s*([^。\n]+)/]), "undecided");

    if (d.selectedRoles.includes("映像制作者")) {
      if (hasAny(text, ["縦動画", "ショート", "Shorts", "リール"])) add("職種別条件：縦動画", "あり", "roleAnswer", { scope: "職業別", field: "縦動画" });
      if (hasAny(text, ["横動画", "16:9"])) add("職種別条件：横動画", "あり", "roleAnswer", { scope: "職業別", field: "横動画" });
      if (hasAny(text, ["テロップ", "字幕"])) add("職種別条件：テロップ", "あり", "roleAnswer", { scope: "職業別", field: "テロップ" });
      if (hasAny(text, ["BGM", "音楽"])) add("職種別条件：BGM", "あり", "roleAnswer", { scope: "職業別", field: "BGM" });
      if (hasAny(text, ["撮影"])) add("見積候補：撮影費", "撮影費", "estimateCandidate", { category: "制作人件費" });
      if (hasAny(text, ["編集"])) add("見積候補：編集費", "編集費", "estimateCandidate", { category: "編集費" });
      if (hasAny(text, ["テロップ", "字幕"])) add("見積候補：テロップ制作費", "テロップ制作費", "estimateCandidate", { category: "編集費" });
    }
    if (d.selectedRoles.includes("カメラマン")) {
      if (hasAny(text, ["レタッチ", "補正"])) add("職種別条件：レタッチ", "あり", "roleAnswer", { scope: "職業別", field: "レタッチ範囲" });
      if (hasAny(text, ["RAW", "raw"])) add("職種別条件：RAW納品", "あり", "roleAnswer", { scope: "職業別", field: "RAW納品" });
      if (hasAny(text, ["スタジオ"])) add("見積候補：スタジオ費", "スタジオ費", "estimateCandidate", { category: "スタジオ費" });
      add("見積候補：撮影費", "撮影費", "estimateCandidate", { category: "制作人件費" });
    }
    if (d.selectedRoles.includes("ヘアメイク")) {
      if (hasAny(text, ["早朝"])) add("職種別条件：早朝対応", "あり", "roleAnswer", { scope: "職業別", field: "早朝対応" });
      if (hasAny(text, ["延長"])) add("職種別条件：延長対応", "あり", "roleAnswer", { scope: "職業別", field: "延長対応" });
      if (hasAny(text, ["直し", "お直し"])) add("職種別条件：撮影中の直し対応", "あり", "roleAnswer", { scope: "職業別", field: "撮影中の直し対応" });
      if (hasAny(text, ["アレルギー", "肌トラブル"])) add("追加確認：肌トラブル・アレルギー", "事前確認が必要", "roleAnswer", { scope: "職業別", field: "肌トラブル・アレルギー確認" });
      add("見積候補：ヘアメイク基本料金", "ヘアメイク基本料金", "estimateCandidate", { category: "制作人件費" });
    }
    if (next.length === 0) add("追加確認が必要な項目", "議事録から明確な項目を抽出できませんでした。重要項目を手入力で確認してください。", "questionsToClient");
    setExtractionCandidates(next);
  };
  const toggleExtractionCandidate = (id: string) => setExtractionCandidates((current) => current.map((item) => item.id === id ? { ...item, selected: !item.selected } : item));
  const applyExtractionCandidates = () => setDocument((current) => {
    const next = { ...current, roleAnswers: { ...current.roleAnswers }, lines: [...current.lines] };
    for (const item of extractionCandidates.filter((candidate) => candidate.selected)) {
      if (item.target === "roleAnswer" && item.scope && item.field) {
        const key = `${item.scope}:${item.field}`;
        if (!next.roleAnswers[key]) next.roleAnswers[key] = item.value;
      } else if (item.target === "estimateCandidate") {
        if (!next.lines.some((line) => line.name === item.value)) next.lines.push({ ...createLine(), id: createId(), name: item.value, category: item.category ?? "制作費", sourceRole: d.selectedRoles[0] });
      } else {
        const key = item.target as keyof ProjectDocument;
        if (typeof next[key] === "string" && !next[key]) (next as Record<string, unknown>)[key] = item.value;
      }
    }
    return next;
  });

  if (tab === "roles") return <Section title="職業選択" description="あなたの職業を選ぶと、次の聞き取り項目と見積テンプレートがその職種向けに変わります。複数選択できます。">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CREATOR_ROLES.map((role) => {
        const active = d.selectedRoles.includes(role);
        const color = getRoleColorMeta(role);
        return <button key={role} type="button" onClick={() => toggleRole(role)} style={{ borderColor: active ? color.color : undefined, boxShadow: active ? `inset 4px 0 0 ${color.color}` : undefined }} className={`relative min-h-16 overflow-hidden rounded-2xl border bg-surface px-4 py-3 text-left transition hover:bg-surface-2 ${active ? "text-fg shadow-sm" : "border-line text-fg hover:border-line-strong"}`}>
          <span className="mb-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-fg-muted"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.color }} />{color.label}</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: active ? color.color : "currentColor", color: active ? color.color : undefined }}>{active ? "✓" : ""}</span>
          </span>
          <span className="block text-sm font-bold">{role}</span>
        </button>;
      })}
    </div>
    <div className="mt-5 rounded-2xl border p-5 text-white" style={{ background: "linear-gradient(135deg, #111113 0%, #18181b 100%)", borderColor: primaryColor.border }}>
      <p className="text-xs font-bold tracking-[.18em]" style={{ color: primaryColor.color }}>SELECTED ROLES</p>
      {d.selectedRoles.length ? <div className="mt-3 flex flex-wrap gap-2">{d.selectedRoles.map((role) => {
        const color = getRoleColorMeta(role);
        return <span key={role} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold text-neutral-100" style={{ borderColor: color.border, backgroundColor: color.soft }}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.color }} />{role}</span>;
      })}</div> : <p className="mt-2 text-sm leading-relaxed text-neutral-300">まだ選択されていません。まず職業を選ぶと、このアプリが“あなた用の聞き取り表”になります。</p>}
      {d.selectedRoles.length > 0 && <button type="button" onClick={() => applyRoleTextTemplates(d.selectedRoles)} className="mt-4 min-h-11 rounded-xl bg-white px-4 text-sm font-bold text-neutral-950">選択職業の見本文を反映</button>}
    </div>
  </Section>;

  if (tab === "hearing") return <Section title="聞き取り" description="手入力派と議事録派が迷わないように、入力方法を分けました。">
    <div className="mb-5 grid grid-cols-2 rounded-2xl border border-line bg-surface p-1">
      {([["manual", "手入力", "フォームに直接入力"], ["transcript", "議事録入力", "カンペと文字起こしから候補作成"]] as const).map(([id, label, desc]) => <button key={id} type="button" onClick={() => { setHearingMode(id); props.onSelectDocument(id === "manual" ? "hearing" : "guide"); }} className={`rounded-xl px-3 py-3 text-left transition ${hearingMode === id ? "bg-fg text-canvas shadow-sm" : "text-fg-muted hover:bg-surface-2"}`}><span className="block text-sm font-bold">{label}</span><span className="mt-0.5 block text-[11px] opacity-70">{desc}</span></button>)}
    </div>

    {hearingMode === "manual" ? <div className="space-y-3">
        <CollapsibleSection title="基本情報・依頼内容" description="案件シートと全書類の見出しに使います。" defaultOpen><div className={formGridClass}>
          <Field label="案件名" value={d.projectName} onChange={(v) => update("projectName", v)} />
          <Field label="案件番号" value={d.projectNo} onChange={(v) => update("projectNo", v)} full={false} />
          <Field label="ステータス" value={d.status} onChange={(v) => update("status", v)} options={STATUS_OPTIONS} full={false} />
          <Field label="何を作りたいか" value={d.requestedContent} onChange={(v) => update("requestedContent", v)} rows={2} />
          <Field label="完成物のイメージ" value={d.finalImage} onChange={(v) => update("finalImage", v)} rows={2} />
          <Field label="参考URL" value={d.referenceUrl} onChange={(v) => update("referenceUrl", v)} type="url" />
        </div></CollapsibleSection>
        <CollapsibleSection title="目的・ターゲット" defaultOpen><div className={formGridClass}><Field label="目的" value={d.purpose} onChange={(v) => update("purpose", v)} /><Field label="ターゲット" value={d.target} onChange={(v) => update("target", v)} /></div></CollapsibleSection>
        <CollapsibleSection title="予算・スケジュール" defaultOpen><div className={formGridClass}>
          <Field label="希望予算" value={d.budget} onChange={(v) => update("budget", v)} full={false} /><Field label="上限予算" value={d.maxBudget} onChange={(v) => update("maxBudget", v)} full={false} />
          <Field label="相見積もり" value={d.competingQuote} onChange={(v) => update("competingQuote", v)} full={false} /><Field label="希望納期" value={d.desiredDeliveryDate} onChange={(v) => update("desiredDeliveryDate", v)} type="date" full={false} />
          <Field label="実施日／撮影日" value={d.shootDate} onChange={(v) => update("shootDate", v)} type="date" full={false} /><Field label="場所／対応場所" value={d.location} onChange={(v) => update("location", v)} full={false} />
        </div></CollapsibleSection>
        {roleFieldGroups.length > 0 && <CollapsibleSection title="職種別詳細" description={`選択中：${d.selectedRoles.join(" / ")}`} defaultOpen><div className="space-y-6">{roleFieldGroups.map((group) => <div key={group.title} className="border-l-2 pl-4" style={{ borderColor: primaryColor.color }}><p className="mb-3 text-xs font-bold tracking-[.16em]" style={{ color: primaryColor.color }}>{group.title}</p><div className={formGridClass}>{group.fields.map((field) => <Field key={`role:${field}`} label={field} value={roleAnswerValue("職業別", field)} onChange={(v) => updateRoleAnswer("職業別", field, v)} full={false} />)}</div></div>)}</div></CollapsibleSection>}
        <CollapsibleSection title="使用媒体・権利・実績公開"><div className={formGridClass}>
          <Field label="使用媒体" value={d.media} onChange={(v) => update("media", v)} /><Field label="使用期間" value={d.usagePeriod} onChange={(v) => update("usagePeriod", v)} full={false} />
          <Field label="二次利用" value={d.secondaryUse} onChange={(v) => update("secondaryUse", v)} full={false} /><Field label="著作権・使用権" value={d.copyright} onChange={(v) => update("copyright", v)} />
          <Field label="ポートフォリオ掲載可否" value={d.portfolioPermission} onChange={(v) => update("portfolioPermission", v)} options={YES_NO_OPTIONS} full={false} /><Field label="SNS掲載可否" value={d.snsPermission} onChange={(v) => update("snsPermission", v)} options={YES_NO_OPTIONS} full={false} />
          <Field label="HP掲載可否" value={d.websitePermission} onChange={(v) => update("websitePermission", v)} options={YES_NO_OPTIONS} full={false} />
        </div></CollapsibleSection>
        <CollapsibleSection title="成果物・修正・納品"><div className={formGridClass}>
          <Field label="成果物／完了業務" value={d.deliverables} onChange={(v) => update("deliverables", v)} rows={2} /><Field label="形式／報告形式" value={d.format} onChange={(v) => update("format", v)} />
          <Field label="納品方法／報告方法" value={d.deliveryMethod} onChange={(v) => update("deliveryMethod", v)} /><Field label="修正回数／リテイク回数" value={d.revisions} onChange={(v) => update("revisions", v)} full={false} />
          <Field label="元データ納品" value={d.dataHandover} onChange={(v) => update("dataHandover", v)} />
        </div></CollapsibleSection>
        <CollapsibleSection title="精算・交通費"><div className={formGridClass}><Field label="予算に含めたいもの" value={d.budgetIncludes} onChange={(v) => update("budgetIncludes", v)} /><Field label="交通費・実費精算条件" value={roleAnswerValue("共通", "交通費・実費精算条件")} onChange={(v) => updateRoleAnswer("共通", "交通費・実費精算条件", v)} /></div></CollapsibleSection>
        <CollapsibleSection title="備考・未確定事項"><div className={formGridClass}><Field label="未確定事項" value={d.undecided} onChange={(v) => update("undecided", v)} rows={2} /><Field label="社内メモ" value={d.internalMemo} onChange={(v) => update("internalMemo", v)} rows={2} hint="PDFには出力されません。" /></div><div className="mt-5 space-y-2">{noteOptions.map((option) => <label key={option.id} className="flex gap-3 rounded-xl border border-line bg-surface-2 p-3 text-sm leading-relaxed"><input type="checkbox" checked={(d.selectedNoteIds ?? []).includes(option.id)} onChange={() => toggleNote(option.id)} className="mt-1 h-4 w-4 shrink-0 accent-brand" /><span>{option.text}</span></label>)}</div><div className="mt-4"><Field label="自由記述備考" value={d.customNote ?? ""} onChange={(v) => update("customNote", v)} rows={3} /></div></CollapsibleSection>
        {selectedTemplate.hearingExample && <div className="rounded-2xl border bg-surface p-4" style={{ borderColor: primaryColor.border }}><p className="mb-2 text-xs font-bold tracking-[.18em]" style={{ color: primaryColor.color }}>職種別の入力例</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedTemplate.hearingExample}</p></div>}
    </div> : <div className="space-y-5">
      <div className="rounded-2xl border bg-neutral-950 p-5 text-white" style={{ borderColor: primaryColor.border }}><p className="text-xs font-bold tracking-[.18em]" style={{ color: primaryColor.color }}>TRANSCRIPT INPUT</p><h3 className="mt-1 text-lg font-bold">議事録入力カンペ</h3><div className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-200"><p>録音を文字起こしした文章を貼り付けてください。</p><p>Zoom議事録やNotta、Whisperなどの文字起こしをそのまま貼り付けられます。</p><p>AIが内容を解析し、案件情報の候補を作成します。</p><p className="text-fg-faint">β版では簡易抽出でUIを確認できます。抽出結果はすぐ確定せず、確認してから反映します。</p></div></div>
      <aside className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em]" style={{ color: primaryColor.color }}>MEETING SCRIPT</p><h3 className="mt-1 text-lg font-bold text-fg">聞き取りカンペ</h3><p className="mt-1 text-xs leading-relaxed text-fg-muted">会議中はこの順番で聞き、あとで文字起こしを下に貼り付けると整理しやすくなります。</p></div><span className="shrink-0 rounded-full border bg-surface-2 px-3 py-1 text-xs font-bold text-fg-muted" style={{ borderColor: primaryColor.border }}>{interviewGuide.length}問</span></div>
        <div className="grid gap-4 xl:grid-cols-2">{interviewGuideGroups.map(([category, questions]) => <div key={category} className="rounded-2xl border bg-surface-2 p-4" style={{ borderColor: primaryColor.border }}><h4 className="mb-3 text-sm font-bold text-fg">{category}</h4><ol className="space-y-3">{questions.map((item, index) => <li key={item.id} className="grid grid-cols-[28px_1fr] gap-3 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-bold ring-1" style={{ color: primaryColor.color, borderColor: primaryColor.border }}>{index + 1}</span><div><p className="font-bold leading-relaxed text-fg">{item.question}</p><p className="mt-0.5 text-xs leading-relaxed text-fg-muted">なぜ聞く？ {item.reason}</p></div></li>)}</ol></div>)}</div>
      </aside>
      <div className="rounded-2xl border border-line bg-surface p-4"><div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-fg">議事録貼り付け</h3><p className="mt-1 text-xs text-fg-muted">文字起こしした議事録をここに貼り付けてください。</p></div><button type="button" onClick={extractFromTranscript} className={`${miniButtonClass} bg-fg text-canvas`}>議事録から項目を抽出</button></div><textarea className="h-[300px] w-full rounded-2xl border border-line-strong bg-surface px-4 py-3 text-sm leading-relaxed text-fg outline-none transition focus:border-brand focus:ring-1 focus:ring-brand" value={d.meetingTranscript} onChange={(event) => update("meetingTranscript", event.target.value)} placeholder="文字起こしした議事録をここに貼り付けてください" /></div>
      <div className="rounded-2xl border border-line bg-surface p-4"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[.18em] text-brand">AI EXTRACTION RESULT</p><h3 className="mt-1 text-sm font-bold text-fg">AI抽出結果</h3><p className="mt-1 text-xs leading-relaxed text-fg-muted">チェックした内容だけを反映します。既存データは勝手に上書きしません。</p></div>{extractionCandidates.length > 0 && <button type="button" onClick={applyExtractionCandidates} className={`${miniButtonClass} bg-brand text-white`}>選択した内容を反映</button>}</div>{extractionCandidates.length > 0 ? <div className="space-y-2">{extractionCandidates.map((candidate) => <label key={candidate.id} className="flex gap-3 rounded-xl border border-line bg-surface-2 p-3 text-sm leading-relaxed"><input type="checkbox" checked={candidate.selected} onChange={() => toggleExtractionCandidate(candidate.id)} className="mt-1 h-4 w-4 shrink-0 accent-brand" /><span><span className="font-bold text-fg">{candidate.label}を反映</span><span className="mx-2 text-neutral-300">→</span><span className="text-fg">{candidate.value}</span></span></label>)}</div> : <div className="rounded-xl bg-surface-2 p-4 text-sm text-fg-muted">まだ抽出結果はありません。議事録を貼り付けて「議事録から項目を抽出」を押してください。</div>}</div>
    </div>}
  </Section>;

  if (tab === "parties") return <Section title="取引先・自社情報" description="聞き取り後に発注者情報を固めます。取引先はブラウザ内に保存できます。"><div className="space-y-8">
    <div className="rounded-2xl border border-line p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">発注者</h3><div className="flex gap-2"><button className={buttonClass} onClick={props.newClient}>新規</button><button className={`${buttonClass} border-brand bg-brand text-white hover:bg-brand-dark`} onClick={props.saveClient}>取引先を保存</button></div></div>
      <label className="mb-4 block"><span className="mb-1.5 block text-xs font-semibold text-fg-muted">登録済み取引先</span><select className="min-h-11 w-full rounded-xl border border-line-strong px-3" value={d.client.id} onChange={(e) => props.selectClient(e.target.value)}><option value="">新規入力</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</select></label>
      <div className={formGridClass}>
        <Field label="会社名" value={d.client.company} onChange={(v) => updateNested(setDocument, "client", "company", v)} />
        <Field label="担当者" value={d.client.person} onChange={(v) => updateNested(setDocument, "client", "person", v)} full={false} />
        <Field label="電話番号" value={d.client.phone} onChange={(v) => updateNested(setDocument, "client", "phone", v)} type="tel" full={false} />
        <Field label="郵便番号" value={d.client.postalCode} onChange={(v) => updateNested(setDocument, "client", "postalCode", v)} full={false} />
        <Field label="メール" value={d.client.email} onChange={(v) => updateNested(setDocument, "client", "email", v)} type="email" full={false} />
        <Field label="住所" value={d.client.address} onChange={(v) => updateNested(setDocument, "client", "address", v)} />
        <Field label="インボイス登録番号" value={d.client.invoiceNo} onChange={(v) => updateNested(setDocument, "client", "invoiceNo", v)} />
      </div>
      {clients.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{clients.map((client) => <button key={client.id} onClick={() => props.deleteClient(client.id)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-fg-muted hover:text-brand">{client.company} ×</button>)}</div>}
    </div>
    <div className="rounded-2xl border border-line p-4 sm:p-5"><h3 className="mb-4 font-bold">受注者（自社）</h3><div className={formGridClass}>
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

  if (tab === "estimate") return <Section title="見積作成" description="聞き取り内容から見積候補を生成します。採用した候補だけが見積書・請求書へ反映されます。" action={<button className={`${buttonClass} bg-fg text-canvas`} onClick={() => setDocument((c) => ({ ...c, lines: [...c.lines, createLine()] }))}>＋ 明細</button>}>
    {estimateCandidates.length > 0 && <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: primaryColor.border, backgroundColor: primaryColor.soft }}><p className="mb-2 text-xs font-bold tracking-[.16em]" style={{ color: primaryColor.color }}>聞き取りから生成された見積候補</p><p className="mb-3 text-xs text-fg-muted">採用すると見積明細に追加されます。不要な候補は削除できます。</p><div className="space-y-2">{estimateCandidates.map((candidate) => <div key={candidate.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface p-3 text-sm"><div className="border-l-2 pl-3" style={{ borderColor: primaryColor.color }}><span className="font-bold text-fg">{candidate.name}</span>{candidate.category && <span className="ml-2 text-xs text-fg-faint">{candidate.category}</span>}</div><div className="flex gap-2"><button className={`${miniButtonClass} bg-fg text-canvas`} onClick={() => setDocument((current) => ({ ...current, lines: [...current.lines, lineFromCandidate(candidate)] }))}>採用</button><button className={`${miniButtonClass} bg-surface-2 text-fg-muted`} onClick={() => setDocument((current) => ({ ...current, dismissedEstimateCandidates: [...(current.dismissedEstimateCandidates ?? []), candidate.name] }))}>削除</button></div></div>)}</div></div>}
    {d.selectedRoles.some((role) => ROLE_TEMPLATES[role]?.estimateLines.length) && <div className="mb-4 rounded-2xl border border-line bg-surface-2 p-4"><p className="mb-3 text-xs font-bold tracking-[.16em] text-fg-muted">おすすめ見積テンプレート</p><div className="flex flex-wrap gap-2">{d.selectedRoles.filter((role) => ROLE_TEMPLATES[role]?.estimateLines.length).map((role) => {
      const color = getRoleColorMeta(role);
      return <button key={role} style={{ borderColor: color.border }} className={`${miniButtonClass} border bg-surface text-fg hover:bg-surface-2`} onClick={() => addTemplateLines(role)}><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color.color }} />＋ {role}テンプレートを追加</button>;
    })}</div></div>}
    <div className="space-y-3">{visibleEstimateLines.map((line, index) => {
      const color = getRoleColorMeta(line.sourceRole ?? d.selectedRoles[0]);
      return <div key={line.id} className="rounded-2xl border bg-surface p-4" style={{ borderColor: color.border, boxShadow: line.sourceRole ? `inset 3px 0 0 ${color.color}` : undefined }}>
      <div className="mb-3 flex items-center justify-between gap-3"><span className="text-xs font-bold text-fg-faint">明細 {index + 1}{line.sourceRole && <span className="ml-2 rounded-full border px-2 py-0.5" style={{ borderColor: color.border, color: color.color }}>{line.sourceRole}</span>}</span><button className="min-h-9 px-2 text-sm text-fg-faint hover:text-brand" onClick={() => setDocument((c) => ({ ...c, lines: c.lines.filter((item) => item.id !== line.id) }))}>削除</button></div>
      <div className={formGridClass}><Field label="分類" value={line.category} onChange={(v) => changeLine(line.id, "category", v)} options={CATEGORY_OPTIONS} full={false} /><Field label="品名" value={line.name} onChange={(v) => changeLine(line.id, "name", v)} full={false} /><Field label="摘要" value={line.description} onChange={(v) => changeLine(line.id, "description", v)} />
        <Field label="単価" value={line.unitPrice} onChange={(v) => changeLine(line.id, "unitPrice", Number(v))} type="number" full={false} /><Field label="数量" value={line.quantity} onChange={(v) => changeLine(line.id, "quantity", Number(v))} type="number" full={false} /><Field label="単位" value={line.unit} onChange={(v) => changeLine(line.id, "unit", v)} options={UNIT_OPTIONS} full={false} /><Field label="税区分" value={line.tax} onChange={(v) => changeLine(line.id, "tax", v)} options={TAX_OPTIONS} full={false} />
      </div><div className="mt-3 border-t border-line pt-3 text-right text-sm font-bold">{yen(line.unitPrice * line.quantity)} <span className="text-xs font-normal text-fg-faint">入力額 / {line.tax}</span></div>
    </div>;
    })}</div>
    <div className={`mt-5 ${formGridClass}`}><Field label="発行日" value={d.issueDate} onChange={(v) => update("issueDate", v)} type="date" full={false} /><Field label="有効期限" value={d.validUntil} onChange={(v) => update("validUntil", v)} type="date" full={false} /><Field label="支払条件" value={d.paymentTerms} onChange={(v) => update("paymentTerms", v)} /><Field label="値引き（税抜）" value={d.discount} onChange={(v) => update("discount", Number(v))} type="number" full={false} /><Field label="税率（%）" value={d.taxRate} onChange={(v) => update("taxRate", Number(v))} options={[10, 8, 0]} full={false} /><Field label="前金" value={d.advance} onChange={(v) => update("advance", Number(v))} type="number" full={false} />
      <label className="flex min-h-11 items-center gap-3 text-sm"><input className="h-5 w-5 accent-brand" type="checkbox" checked={d.withholdingEnabled} onChange={(e) => update("withholdingEnabled", e.target.checked)} />源泉徴収（10.21%）</label>
    </div><div className="mt-5 rounded-2xl bg-neutral-900 p-5 text-white"><div className="flex justify-between text-sm text-neutral-300"><span>制作費 税抜</span><span>{yen(totals.estimateNet)}</span></div><div className="mt-1 flex justify-between text-sm text-neutral-300"><span>消費税</span><span>{yen(totals.estimateTax)}</span></div><div className="mt-2 flex justify-between text-lg font-bold"><span>見積合計</span><span>{yen(totals.estimateGross)}</span></div></div>
  </Section>;

  if (tab === "settlement") return <Section title="精算・領収書" description="見積とは別に、立替・領収書精算を管理します。" action={<button className={`${buttonClass} bg-fg text-canvas`} onClick={() => setDocument((c) => ({ ...c, expenseLines: [...(c.expenseLines ?? []), createSettlementLine()] }))}>＋ 精算</button>}>
    <div className="space-y-3">{(d.expenseLines ?? []).map((line, index) => {
      const amount = settlementAmount(line, d.taxRate);
      return <div key={line.id} className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-fg-faint">精算 {index + 1}</span><button className="min-h-9 px-2 text-sm text-fg-faint hover:text-brand" onClick={() => setDocument((c) => ({ ...c, expenseLines: (c.expenseLines ?? []).filter((item) => item.id !== line.id) }))}>削除</button></div>
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
        <div className="mt-3 flex justify-end gap-4 border-t border-line pt-3 text-sm"><span className="text-fg-faint">税抜 {yen(amount.net)}</span><strong>{yen(amount.gross)}</strong></div>
      </div>;
    })}</div>
    <div className="mt-5 rounded-2xl bg-neutral-900 p-5 text-white"><div className="flex justify-between text-sm text-neutral-300"><span>精算費 税抜</span><span>{yen(totals.settlementNet)}</span></div><div className="mt-1 flex justify-between text-sm text-neutral-300"><span>消費税</span><span>{yen(totals.settlementTax)}</span></div><div className="mt-2 flex justify-between text-lg font-bold"><span>精算合計</span><span>{yen(totals.settlementGross)}</span></div></div>
  </Section>;

  if (tab === "confirmation") return <Section title="業務内容確認" description="共通データを利用し、契約前の認識差を減らします。"><div className={formGridClass}>
    <Field label="前文" value={d.confirmationIntro} onChange={(v) => update("confirmationIntro", v)} rows={2} /><Field label="対応範囲" value={d.inScope} onChange={(v) => update("inScope", v)} rows={2} /><Field label="対応しない範囲" value={d.outOfScope} onChange={(v) => update("outOfScope", v)} rows={2} /><Field label="クレジット表記" value={d.credit} onChange={(v) => update("credit", v)} /><Field label="著作権" value={d.copyright} onChange={(v) => update("copyright", v)} /><Field label="データ引き渡し" value={d.dataHandover} onChange={(v) => update("dataHandover", v)} />
  </div></Section>;

  if (tab === "delivery") return <Section title={completionDocumentName} description={`${completionDocumentName}に表示する完了日・成果物・方法を整理します。`}><div className={formGridClass}>
    <Field label="納品日／業務完了日" value={d.deliveryDateActual} onChange={(v) => update("deliveryDateActual", v)} type="date" full={false} />
    <Field label="案件名" value={d.projectName} onChange={(v) => update("projectName", v)} />
    <Field label={selectedTemplate.outputNames.length ? `成果物／完了業務（${selectedTemplate.outputNames.join(" / ")}）` : "成果物／完了業務"} value={d.deliverables} onChange={(v) => update("deliverables", v)} rows={2} />
    <Field label="形式／報告形式" value={d.format} onChange={(v) => update("format", v)} />
    <Field label="納品方法／報告方法" value={d.deliveryMethod} onChange={(v) => update("deliveryMethod", v)} />
    <Field label="備考" value={d.deliveryNotes} onChange={(v) => update("deliveryNotes", v)} rows={2} />
  </div></Section>;

  if (tab === "invoice") return <Section title="請求書" description="制作費に精算費を足して、請求金額に反映します。"><div className={formGridClass}><Field label="請求日" value={d.invoiceDate} onChange={(v) => update("invoiceDate", v)} type="date" full={false} /><Field label="支払期限" value={d.paymentDue} onChange={(v) => update("paymentDue", v)} type="date" full={false} /><Field label="銀行" value={d.vendor.bankName} onChange={(v) => updateNested(setDocument, "vendor", "bankName", v)} full={false} /><Field label="支店" value={d.vendor.bankBranch} onChange={(v) => updateNested(setDocument, "vendor", "bankBranch", v)} full={false} /><Field label="口座種別" value={d.vendor.bankType} onChange={(v) => updateNested(setDocument, "vendor", "bankType", v)} options={["普通", "当座"]} full={false} /><Field label="口座番号" value={d.vendor.bankAccount} onChange={(v) => updateNested(setDocument, "vendor", "bankAccount", v)} full={false} /><Field label="口座名義" value={d.vendor.bankHolder} onChange={(v) => updateNested(setDocument, "vendor", "bankHolder", v)} /></div><div className="mt-5 rounded-2xl bg-neutral-900 p-5 text-white"><div className="flex justify-between text-sm"><span>制作費</span><span>{yen(totals.estimateGross)}</span></div><div className="mt-1 flex justify-between text-sm"><span>精算費</span><span>{yen(totals.settlementGross)}</span></div><div className="mt-2 flex justify-between border-t border-white/20 pt-2 text-lg font-bold"><span>請求合計</span><span>{yen(totals.invoiceTotal)}</span></div></div></Section>;

  if (tab === "export") return <Section title="PDF出力" description="右側で書類を選び、選択中の帳票だけをA4で印刷します。">
    <div className="rounded-2xl border border-line bg-surface-2 p-5"><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-fg-muted">案件名</dt><dd className="text-right font-semibold">{d.projectName}</dd></div><div className="flex justify-between"><dt className="text-fg-muted">発注者</dt><dd className="font-semibold">{d.client.company}</dd></div><div className="flex justify-between"><dt className="text-fg-muted">制作費</dt><dd className="font-semibold">{yen(totals.estimateGross)}</dd></div><div className="flex justify-between"><dt className="text-fg-muted">精算費</dt><dd className="font-semibold">{yen(totals.settlementGross)}</dd></div><div className="flex justify-between"><dt className="text-fg-muted">請求金額</dt><dd className="font-bold">{yen(totals.invoiceTotal)}</dd></div></dl></div>
    <div className="mt-4 rounded-2xl border border-brand/20 bg-brand-soft p-4"><p className="text-xs font-bold text-brand">推奨ファイル名</p><p className="mt-2 break-all text-sm font-semibold text-fg">{props.recommendedFileName}</p></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={props.onPrint} className={`${buttonClass} border-brand bg-brand text-white`}>表示中の書類をPDF出力</button>{!["guide", "hearing", "sheet"].includes(props.documentKind) && <button onClick={props.onSaveRecord} className={`${buttonClass} bg-fg text-canvas`}>この書類を保存</button>}</div>
    <p className="mt-3 text-xs leading-relaxed text-fg-muted">A4・倍率100%・背景グラフィックありを推奨します。保存先のファイル名には上記をご利用ください。</p>
  </Section>;

  if (tab === "records") {
    const labels: Record<SavedDocumentRecord["documentKind"], string> = { estimate: "見積書", settlement: "精算書", confirmation: "業務内容確認書", delivery: "納品／業務完了書", invoice: "請求書" };
    return <Section title="作成済み書類" description="保存した書類を複製し、新しい案件の下書きとして再利用できます。">
      <div className="mb-4 rounded-2xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-fg-muted">データは外部送信されず、この端末のブラウザ内に保存されています。共有PCでは利用後に削除してください。</div>
      <div className="space-y-3">{props.records.length ? props.records.map((record) => {
        const color = getPrimaryRoleColorMeta(record.document.selectedRoles);
        return <div key={record.id} className="rounded-2xl border bg-surface p-4" style={{ borderColor: color.border, boxShadow: `inset 3px 0 0 ${color.color}` }}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold" style={{ color: color.color }}>{labels[record.documentKind]}</p><h3 className="mt-1 font-bold">{record.document.projectName || "案件名未設定"}</h3><p className="mt-1 text-xs text-fg-muted">{record.document.client.company || "クライアント未設定"}・{yen(record.amount)}・{record.status}</p><p className="mt-1 text-[11px] text-fg-faint">作成 {record.createdAt.slice(0, 10)} ／ 更新 {record.updatedAt.slice(0, 10)}</p></div><div className="flex gap-2"><button onClick={() => props.onDuplicateRecord(record)} className={`${miniButtonClass} bg-fg text-canvas`}>複製して編集</button><button onClick={() => props.onDeleteRecord(record.id)} className={`${miniButtonClass} bg-surface-2 text-fg-muted`}>削除</button></div></div></div>;
      }) : <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-fg-muted">保存済みの書類はありません。PDF出力画面から保存できます。</div>}</div>
      <div className="mt-8 border-t border-line pt-5"><h3 className="text-sm font-bold">この端末の保存データ</h3><p className="mt-1 text-xs leading-relaxed text-fg-muted">案件、取引先、作成済み書類を一括削除します。元に戻せません。</p><button onClick={props.onClearLocalData} className="mt-3 min-h-11 rounded-xl border border-brand px-4 text-sm font-bold text-brand">保存データをすべて削除</button></div>
    </Section>;
  }

  return null;
}

export const emptyClient = (): Client => ({ id: createId(), company: "", person: "", postalCode: "", address: "", phone: "", email: "", invoiceNo: "" });
