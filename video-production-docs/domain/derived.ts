import { activeEstimateLines, getCompletionDocumentName, getNoteOptionsForRoles, mergeRoleTemplates, ROLE_CONDITION_FIELDS, ROLE_WORKFLOW_WORDING, uniqueItems } from "./roleTemplates";
import type { CreatorRole, EstimateLine, ProjectDocument, RoleTemplateLine } from "./types";
import { createId } from "./seed";

export const answerKey = (scope: string, field: string) => `${scope}:${field}`;

export function findAnswer(document: ProjectDocument, field: string) {
  const exactCommon = document.roleAnswers[answerKey("共通", field)];
  if (exactCommon) return exactCommon;
  const exactRole = document.roleAnswers[answerKey("職業別", field)];
  if (exactRole) return exactRole;
  const exactCondition = Object.entries(document.roleAnswers).find(([key, value]) => key.endsWith(`:${field}`) && value)?.[1];
  return exactCondition ?? "";
}

export function isAffirmative(value: string) {
  return /(あり|有|必要|希望|可|する|はい|有り|〇|○|yes|true|2名|[1-9１-９])/i.test(value || "");
}

export function hearingSummary(document: ProjectDocument) {
  return {
    roles: document.selectedRoles.join(" / "),
    projectName: document.projectName,
    request: document.requestedContent || findAnswer(document, "何を作りたいか"),
    output: document.deliverableIdea || document.deliverables || mergeRoleTemplates(document.selectedRoles).outputNames.join(" / "),
    purpose: document.purpose || findAnswer(document, "この案件で一番達成したいこと"),
    target: document.target || findAnswer(document, "想定ターゲット"),
    budget: document.budget || findAnswer(document, "希望予算"),
    maxBudget: document.maxBudget || findAnswer(document, "上限予算"),
    dueDate: document.desiredDeliveryDate || document.deliveryDate || findAnswer(document, "最終納品日"),
    media: document.media || findAnswer(document, "使用媒体"),
    usagePeriod: document.usagePeriod || findAnswer(document, "使用期間"),
    referenceUrl: document.referenceUrl || findAnswer(document, "参考作品"),
    undecided: document.undecided || findAnswer(document, "未確定事項"),
    portfolio: document.portfolioPermission || findAnswer(document, "ポートフォリオ掲載可否") || findAnswer(document, "制作者のポートフォリオ掲載可否"),
    completionDocumentName: getCompletionDocumentName(document.selectedRoles)
  };
}

const candidate = (name: string, category = "制作費", description = "", sourceRole?: CreatorRole): RoleTemplateLine => ({ name, category, description, unitPrice: 0, quantity: 1, unit: "式", tax: "税別", sourceRole });

function roleCandidates(role: CreatorRole, document: ProjectDocument): RoleTemplateLine[] {
  const base = mergeRoleTemplates([role]).estimateLines;
  const has = (field: string) => isAffirmative(findAnswer(document, field));

  if (role === "映像制作者") {
    return [
      candidate("企画構成費", "制作費", "", role),
      has("撮影日数") || has("ロケ地") || has("撮影場所") ? candidate("撮影費", "制作人件費", "", role) : null,
      has("編集") || has("テロップ") || has("BGM") || has("カラコレ") ? candidate("編集費", "編集費", "", role) : null,
      has("テロップ") ? candidate("テロップ制作費", "編集費", "", role) : null,
      has("BGM") ? candidate("BGM選曲費", "音楽・効果費", "", role) : null,
      has("縦動画") ? candidate("縦動画制作費", "編集費", "", role) : null,
      has("サムネイル") ? candidate("サムネイル制作費", "編集費", "", role) : null,
      candidate("データ納品費", "広告宣伝・納品費", "", role)
    ].filter(Boolean) as RoleTemplateLine[];
  }

  if (role === "ヘアメイク") {
    return [
      candidate("ヘアメイク基本料金", "制作人件費", "", role),
      has("対象人数") || has("メイク人数") || has("ヘアセット人数") ? candidate("人数追加料金", "制作人件費", "", role) : null,
      has("拘束時間") ? candidate("拘束時間料金", "制作人件費", "", role) : null,
      has("撮影中の直し対応") ? candidate("撮影中直し対応費", "制作人件費", "", role) : null,
      has("早朝対応") || has("早朝料金") ? candidate("早朝料金", "制作人件費", "", role) : null,
      has("延長対応") || has("延長料金") ? candidate("延長料金", "制作人件費", "", role) : null,
      has("出張費") || has("対応場所") ? candidate("出張費", "ロケ費", "", role) : null,
      has("交通費") || has("駐車場") ? candidate("交通費", "ロケ費", "", role) : null,
      has("アシスタント有無") ? candidate("アシスタント費", "制作人件費", "", role) : null
    ].filter(Boolean) as RoleTemplateLine[];
  }

  if (role === "カメラマン") {
    return [
      candidate("撮影費", "制作人件費", "", role),
      has("レタッチ範囲") || has("レタッチ枚数") ? candidate("レタッチ費", "制作費", "", role) : null,
      has("スタジオ手配") || has("スタジオ利用の有無") || has("スタジオ利用") ? candidate("スタジオ費", "スタジオ費", "", role) : null,
      candidate("データ納品費", "広告宣伝・納品費", "", role),
      has("交通費") || has("交通費精算") ? candidate("交通費", "ロケ費", "", role) : null
    ].filter(Boolean) as RoleTemplateLine[];
  }

  return base;
}

export function estimateCandidatesFromHearing(document: ProjectDocument) {
  const candidates = document.selectedRoles.flatMap((role) => roleCandidates(role, document));
  const currentNames = new Set(activeEstimateLines(document.lines, document.selectedRoles).map((line) => line.name));
  const dismissed = new Set(document.dismissedEstimateCandidates ?? []);
  return uniqueItems(candidates, (item) => item.name).filter((item) => !currentNames.has(item.name) && !dismissed.has(item.name));
}

export function lineFromCandidate(candidateLine: RoleTemplateLine): EstimateLine {
  return {
    id: createId(),
    category: candidateLine.category ?? "制作費",
    name: candidateLine.name,
    description: candidateLine.description ?? "",
    unitPrice: candidateLine.unitPrice ?? 0,
    quantity: candidateLine.quantity ?? 1,
    unit: candidateLine.unit ?? "式",
    tax: candidateLine.tax ?? "税別"
    , sourceRole: candidateLine.sourceRole
  };
}

export function deliveryRowsFromHearing(document: ProjectDocument) {
  const rows = document.selectedRoles.flatMap((role) => {
    if (role === "映像制作者") return [["納品動画", document.deliverables], ["動画形式", document.format], ["本数", findAnswer(document, "本数")], ["納品方法", document.deliveryMethod]];
    if (role === "カメラマン") return [["納品写真", document.deliverables], ["枚数", findAnswer(document, "納品枚数") || findAnswer(document, "納品写真")], ["レタッチ済み枚数", findAnswer(document, "レタッチ枚数")], ["納品方法", document.deliveryMethod]];
    if (role === "ヘアメイク") return [["対応日", findAnswer(document, "対応日") || document.deliveryDateActual], ["対応場所", findAnswer(document, "対応場所") || document.location], ["対象人数", findAnswer(document, "対象人数")], ["業務完了内容", document.deliverables || ROLE_WORKFLOW_WORDING[role].outputName]];
    if (role === "イベント制作者") return [["開催日", findAnswer(document, "開催日")], ["会場", findAnswer(document, "会場") || document.location], ["担当範囲", findAnswer(document, "担当範囲")], ["業務完了内容", document.deliverables || ROLE_WORKFLOW_WORDING[role].outputName]];
    return [[ROLE_WORKFLOW_WORDING[role]?.outputName ?? "成果物／完了業務", document.deliverables]];
  });
  return uniqueItems(rows, ([label]) => label) as [string, string][];
}

export function conditionOutlineFromHearing(document: ProjectDocument) {
  return document.selectedRoles.map((role) => {
    const fields = ROLE_CONDITION_FIELDS[role] ?? [];
    const answered = fields.map((field) => [field, findAnswer(document, field)] as [string, string]).filter(([, value]) => value);
    return { role, title: ROLE_WORKFLOW_WORDING[role].conditionName, answered };
  });
}

export function selectedNotesForDocument(document: ProjectDocument, maxLines = 5) {
  const optionMap = new Map(getNoteOptionsForRoles(document.selectedRoles).map((option) => [option.id, option.text]));
  const selected = (document.selectedNoteIds ?? []).map((id) => optionMap.get(id)).filter((text): text is string => Boolean(text));
  const custom = (document.customNote ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  return Array.from(new Set([...selected, ...custom])).slice(0, maxLines);
}
