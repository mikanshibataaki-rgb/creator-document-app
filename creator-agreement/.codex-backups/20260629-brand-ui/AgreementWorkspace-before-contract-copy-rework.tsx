"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { initialContent } from "@/domain/defaults";
import type {
  AgreementContent,
  AgreementVersion,
  OptionalClauseState,
  Project,
  ProjectStatus,
  PrototypeDatabase,
  Recipient,
  Signature,
} from "@/domain/schema";
import {
  createEvent,
  createId,
  getContent,
  loadDatabase,
  nowIso,
  resetDatabase,
  saveDatabase,
} from "@/data/localRepository";
import { applyManagerProject, fetchManagerProjects, type ManagerProject } from "@/data/managerSource";
import { hashText, requestTimestamp, sendVerificationEmail } from "@/services/adapters";
import { createAgreementPdf } from "@/services/pdf";

type Screen = "list" | "edit" | "preview" | "complete" | "roadmap";
type ThemeMode = "dark" | "light";
type Check = { level: "required" | "recommended" | "law"; title: string; detail: string; field: keyof AgreementContent; step: number };

const statuses: ProjectStatus[] = ["下書き", "送信済み", "閲覧済み", "同意済み", "期限切れ", "取消済み"];
const steps = ["基本情報", "仕事の内容", "お金と日程", "権利・公開", "撮影・もしもの時"];

const stepFields: (keyof AgreementContent)[][] = [
  ["managerProjectId", "category", "projectName", "clientName", "clientEmail", "creatorName", "creatorEmail", "commissionedAt"],
  ["workDescription", "deliverables", "deliveryFormat", "deliveryMethod", "inScope", "outOfScope"],
  ["fee", "taxTreatment", "deliveryDate", "deliveryPlace", "paymentDue", "paymentMethod", "inspectionDays"],
  ["revisionCount", "additionalRevisionFee", "copyright", "usageScope", "portfolioPermission"],
  ["weatherPostponement", "locationPermit", "portraitRights", "musicRights", "reEditingFee", "cancellation", "liabilityLimit"],
];

const helpText: Record<string, { title: string; text: string }> = {
  copyright: { title: "著作権の帰属とは？", text: "完成した作品を誰が所有し、どの範囲で使えるかを決める項目です。" },
  inspection: { title: "検査・確認の期限とは？", text: "納品後、発注者が内容を確認して連絡するまでの期間です。" },
  liability: { title: "損害賠償上限とは？", text: "万一損害が生じた場合に、負担する金額の上限をあらかじめ整理する項目です。" },
  rights: { title: "肖像権・パブリシティ権とは？", text: "出演者の顔や名前を撮影・公開・広告利用してよいかに関する権利です。" },
};

function formatDate(value: string) {
  if (!value) return "未設定";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
}

function formatDateTime(value: string) {
  if (!value) return "未記録";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function yen(value: string) {
  const number = Number(value);
  return number > 0 ? `${number.toLocaleString("ja-JP")}円` : "未設定";
}

function getChecks(content: AgreementContent): Check[] {
  const checks: Check[] = [];
  const add = (level: Check["level"], title: string, detail: string, field: keyof AgreementContent, step: number) =>
    checks.push({ level, title, detail, field, step });

  if (!content.clientName) add("law", "発注者名を設定してください", "発注者の明示事項として設定を勧めます。", "clientName", 0);
  if (!content.creatorName) add("law", "受注者名を設定してください", "取引する当事者を明確にします。", "creatorName", 0);
  if (!content.commissionedAt) add("law", "業務委託日を設定してください", "発注者の明示事項として設定を勧めます。", "commissionedAt", 0);
  if (!content.workDescription) add("law", "仕事の内容を設定してください", "給付内容・役務内容を分かりやすく記録します。", "workDescription", 1);
  if (!content.fee || Number(content.fee) <= 0) add("law", "報酬額を確認してください", "発注者の明示事項として設定を勧めます。", "fee", 2);
  if (!content.deliveryDate) add("law", "納期を設定してください", "給付・役務提供の日として設定を勧めます。", "deliveryDate", 2);
  if (!content.deliveryPlace) add("law", "納品・作業場所を設定してください", "給付・役務提供の場所として設定を勧めます。", "deliveryPlace", 2);
  if (!content.paymentDue) add("law", "支払期日を設定してください", "発注者の明示事項として設定を勧めます。", "paymentDue", 2);
  if (!content.paymentMethod) add("law", "支払方法を設定してください", "支払方法を使用する場合は明示を勧めます。", "paymentMethod", 2);
  if (!content.inspectionDays) add("law", "検査・確認の期限を設定してください", "検査を行う場合は完了日が分かるようにします。", "inspectionDays", 2);
  if (!content.revisionCount) add("recommended", "無料修正回数を決めましょう", "追加作業の認識違いを防ぎやすくなります。", "revisionCount", 3);
  if (!content.copyright) add("recommended", "著作権の取り扱いを確認しましょう", "制作者に残すか、譲渡するかを選びます。", "copyright", 3);
  if (!content.portfolioPermission) add("recommended", "実績公開の可否を確認しましょう", "ポートフォリオやSNSへの掲載可否を明確にします。", "portfolioPermission", 3);
  if (!content.cancellation) add("recommended", "中止・延期時の対応を決めましょう", "撮影準備後のキャンセル費用を整理します。", "cancellation", 4);
  if (!content.reEditingFee) add("recommended", "納品後の再編集料金を確認しましょう", "納品後に内容を作り直す場合の扱いを整理します。", "reEditingFee", 4);
  return checks;
}

function Icon({ name }: { name: "shield" | "search" | "plus" | "copy" | "bell" | "download" | "help" | "check" | "arrow" | "import" | "clock" }) {
  const paths = {
    shield: <path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M5 20h14" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.8.4-1.3.9-1.3 1.9M12 17h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    import: <><path d="M12 3v12m-4-4 4 4 4-4" /><rect x="4" y="17" width="16" height="4" rx="1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`field${wide ? " field-wide" : ""}`}><span className="field-label">{label}</span>{hint && <span className="field-hint">{hint}</span>}{children}</label>;
}

function ClauseField({
  label,
  state,
  value,
  onState,
  onValue,
  placeholder,
}: {
  label: string;
  state: OptionalClauseState;
  value: string;
  onState: (value: OptionalClauseState) => void;
  onValue: (value: string) => void;
  placeholder: string;
}) {
  return <div className="clause-field">
    <div className="clause-head"><b>{label}</b><div className="segmented compact">
      {([["on", "使う"], ["off", "OFF"], ["na", "該当なし"]] as const).map(([id, text]) =>
        <button type="button" key={id} className={state === id ? "active" : ""} onClick={() => onState(id)}>{text}</button>
      )}
    </div></div>
    {state === "on" && <textarea rows={2} value={value} onChange={(event) => onValue(event.target.value)} placeholder={placeholder} />}
  </div>;
}

function HelpButton({ id, onOpen }: { id: keyof typeof helpText; onOpen: (id: keyof typeof helpText) => void }) {
  return <button type="button" className="help-button" aria-label={`${helpText[id].title}の説明`} onClick={() => onOpen(id)}><Icon name="help" />これは何？</button>;
}

function SecurityGuide() {
  return <aside className="security-guide">
    <div><Icon name="shield" /></div>
    <p><b>安心して試すための案内</b></p>
    <ul>
      <li>入力内容はこの端末のブラウザに保存されます。</li>
      <li>共有URLを作成しない限り、外部には送信されません。</li>
      <li>共有PCで使う場合は、確認後に試作データを削除してください。</li>
    </ul>
  </aside>;
}

export function AgreementWorkspace() {
  const [database, setDatabase] = useState<PrototypeDatabase | null>(null);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [screen, setScreen] = useState<Screen>("list");
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "すべて">("すべて");
  const [dateFilter, setDateFilter] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [importOpen, setImportOpen] = useState(false);
  const [managerProjects, setManagerProjects] = useState<ManagerProject[]>([]);
  const [helpId, setHelpId] = useState<keyof typeof helpText | null>(null);
  const [signerName, setSignerName] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [saved, setSaved] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    const loaded = loadDatabase();
    setDatabase(loaded);
    setActiveProjectId(loaded.projects[0]?.id ?? "");
    const storedTheme = window.localStorage.getItem("creator-os-theme");
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("creator-os-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!database || !hydrated.current) return;
    setSaved(false);
    const timer = window.setTimeout(() => {
      saveDatabase(database);
      setSaved(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [database]);

  useEffect(() => {
    if (!database || screen !== "preview") return;
    const project = database.projects.find((item) => item.id === activeProjectId);
    const version = database.agreementVersions.find((item) => item.id === project?.currentVersionId);
    if (!project || !version?.lockedAt || project.status !== "送信済み") return;
    if (database.timelineEvents.some((event) => event.agreementVersionId === version.id && event.eventType === "agreement_viewed")) return;
    const viewedAt = nowIso();
    setDatabase({
      ...database,
      projects: database.projects.map((item) => item.id === project.id ? { ...item, status: "閲覧済み", updatedAt: viewedAt } : item),
      timelineEvents: [...database.timelineEvents, createEvent(project.id, version.id, "agreement_viewed", "相手側の確認画面を閲覧（試作）", "recipient")],
    });
  }, [screen, activeProjectId, database]);

  const activeProject = database?.projects.find((project) => project.id === activeProjectId);
  const activeVersion = database?.agreementVersions.find((version) => version.id === activeProject?.currentVersionId);
  const content = activeVersion?.content ?? initialContent;
  const events = useMemo(
    () => database?.timelineEvents.filter((event) => event.projectId === activeProjectId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) ?? [],
    [database, activeProjectId],
  );
  const signature = database?.signatures.find((item) => item.agreementVersionId === activeProject?.currentVersionId);
  const recipient = database?.recipients.find((item) => item.agreementVersionId === activeProject?.currentVersionId);
  const checks = useMemo(() => getChecks(content), [content]);
  const blockingChecks = checks.filter((check) => check.level === "required" || check.level === "law");
  const locked = Boolean(activeVersion?.lockedAt);
  const stepStates = useMemo(() => stepFields.map((fields) => {
    const missing = checks.filter((check) => fields.includes(check.field)).length;
    const filled = fields.filter((field) => Boolean(String(content[field] ?? "").trim())).length;
    return { missing, filled, total: fields.length };
  }), [checks, content]);

  const filteredProjects = useMemo(() => {
    if (!database) return [];
    return database.projects.filter((project) => {
      const projectContent = getContent(database, project);
      const matchesSearch = `${project.title} ${projectContent.clientName}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "すべて" || project.status === statusFilter;
      const matchesDate = !dateFilter || project.createdAt.slice(0, 10) === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [database, search, statusFilter, dateFilter]);

  const patchDatabase = (updater: (current: PrototypeDatabase) => PrototypeDatabase) => setDatabase((current) => current ? updater(current) : current);

  const updateContent = <K extends keyof AgreementContent>(key: K, value: AgreementContent[K]) => {
    if (!activeProject || !activeVersion || locked) return;
    patchDatabase((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, title: key === "projectName" ? String(value) : project.title, managerProjectId: key === "managerProjectId" ? String(value) : project.managerProjectId, updatedAt: nowIso() } : project),
      agreementVersions: current.agreementVersions.map((version) => version.id === activeVersion.id ? { ...version, content: { ...version.content, [key]: value } } : version),
    }));
  };

  const openProject = (projectId: string, target: Screen = "edit") => {
    setActiveProjectId(projectId);
    setScreen(target);
    setStep(0);
    window.scrollTo({ top: 0 });
  };

  const addProject = () => {
    if (!database) return;
    const now = nowIso();
    const projectId = createId("project");
    const versionId = createId("version");
    const serial = String(database.projects.length + 1).padStart(3, "0");
    const project: Project = {
      id: projectId,
      projectNumber: `CA-2026-${serial}`,
      managerProjectId: "",
      title: "新しい映像制作案件",
      category: "映像制作",
      status: "下書き",
      currentVersionId: versionId,
      versionNumber: 1,
      nextReminderAt: "",
      createdAt: now,
      updatedAt: now,
    };
    const version: AgreementVersion = { id: versionId, projectId, versionNumber: 1, content: { ...initialContent, managerProjectId: "", projectName: project.title, clientName: "", clientEmail: "" }, contentHash: "", createdBy: "sender", createdAt: now, lockedAt: "", replacedAt: "" };
    setDatabase({ ...database, projects: [project, ...database.projects], agreementVersions: [version, ...database.agreementVersions], timelineEvents: [...database.timelineEvents, createEvent(projectId, versionId, "project_created", "案件を作成しました", "sender")] });
    openProject(projectId);
  };

  const duplicateProject = (source: Project) => {
    if (!database) return;
    const sourceContent = getContent(database, source);
    const now = nowIso();
    const projectId = createId("project");
    const versionId = createId("version");
    const serial = String(database.projects.length + 1).padStart(3, "0");
    const project: Project = { ...source, id: projectId, projectNumber: `CA-2026-${serial}`, title: `${source.title}（複製）`, status: "下書き", currentVersionId: versionId, versionNumber: 1, nextReminderAt: "", createdAt: now, updatedAt: now };
    const version: AgreementVersion = { id: versionId, projectId, versionNumber: 1, content: { ...sourceContent, projectName: project.title }, contentHash: "", createdBy: "sender", createdAt: now, lockedAt: "", replacedAt: "" };
    setDatabase({ ...database, projects: [project, ...database.projects], agreementVersions: [version, ...database.agreementVersions], timelineEvents: [...database.timelineEvents, createEvent(projectId, versionId, "project_duplicated", `${source.projectNumber}から複製しました`, "sender")] });
    openProject(projectId);
  };

  const openImport = async () => {
    setManagerProjects(await fetchManagerProjects());
    setImportOpen(true);
  };

  const importProject = (source: ManagerProject) => {
    if (!activeProject || !activeVersion) return;
    const nextContent = applyManagerProject(content, source);
    patchDatabase((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, title: source.title, managerProjectId: source.id, updatedAt: nowIso() } : project),
      agreementVersions: current.agreementVersions.map((version) => version.id === activeVersion.id ? { ...version, content: nextContent } : version),
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, activeVersion.id, "project_imported", `案件マネージャー ${source.id} から取り込みました`, "sender")],
    }));
    setImportOpen(false);
  };

  const planReminder = () => {
    if (!activeProject || !activeVersion) return;
    const next = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    patchDatabase((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, nextReminderAt: next, updatedAt: nowIso() } : project),
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, activeVersion.id, "reminder_planned", "リマインド送信（予定）", "sender", { scheduledAt: next })],
    }));
  };

  const confirmVersion = async () => {
    if (!activeProject || !activeVersion || blockingChecks.length) return;
    const hash = await hashText(JSON.stringify(content));
    const stamp = await requestTimestamp(hash);
    patchDatabase((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, status: "送信済み", updatedAt: nowIso() } : project),
      agreementVersions: current.agreementVersions.map((version) => version.id === activeVersion.id ? { ...version, contentHash: hash, lockedAt: stamp.timestampedAt } : version),
      shareLinks: [...current.shareLinks, { id: createId("link"), agreementVersionId: activeVersion.id, tokenHash: `prototype-${hash.slice(0, 24)}`, expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(), revokedAt: "", createdAt: nowIso() }],
      timelineEvents: [
        ...current.timelineEvents,
        createEvent(activeProject.id, activeVersion.id, "sender_confirmed", `送信者がVer.${activeProject.versionNumber}を申し込み内容として確定`, "sender"),
        createEvent(activeProject.id, activeVersion.id, "share_link_created", "確認用URLを発行（試作）", "system"),
      ],
    }));
    setScreen("preview");
  };

  const createNewVersion = () => {
    if (!database || !activeProject || !activeVersion) return;
    const now = nowIso();
    const versionId = createId("version");
    const nextNumber = activeProject.versionNumber + 1;
    patchDatabase((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, currentVersionId: versionId, versionNumber: nextNumber, status: "下書き", updatedAt: now } : project),
      agreementVersions: [
        ...current.agreementVersions.map((version) => version.id === activeVersion.id ? { ...version, replacedAt: now } : version),
        { ...activeVersion, id: versionId, versionNumber: nextNumber, content: { ...activeVersion.content }, contentHash: "", createdAt: now, lockedAt: "", replacedAt: "" },
      ],
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, versionId, "version_replaced", `Ver.${nextNumber}を作成しました`, "sender")],
    }));
    setScreen("edit");
  };

  const requestEmail = async () => {
    if (!activeProject || !activeVersion) return;
    const result = await sendVerificationEmail(content.clientEmail);
    const item: Recipient = { id: createId("recipient"), agreementVersionId: activeVersion.id, name: signerName, email: content.clientEmail, verificationStatus: result.status, verifiedAt: "" };
    patchDatabase((current) => ({
      ...current,
      recipients: [...current.recipients.filter((entry) => entry.agreementVersionId !== activeVersion.id), item],
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, activeVersion.id, "verification_requested", "メール確認を依頼（試作）", "recipient")],
    }));
  };

  const verifyEmail = () => {
    if (!activeProject || !activeVersion || !recipient) return;
    patchDatabase((current) => ({
      ...current,
      recipients: current.recipients.map((entry) => entry.id === recipient.id ? { ...entry, verificationStatus: "確認済み", verifiedAt: nowIso() } : entry),
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, activeVersion.id, "email_verified", "メールアドレスを確認（試作）", "recipient")],
    }));
  };

  const acceptAgreement = () => {
    if (!activeProject || !activeVersion || !recipient || recipient.verificationStatus !== "確認済み" || !signerName || !consentChecked) return;
    const agreedAt = nowIso();
    const item: Signature = { id: createId("signature"), agreementVersionId: activeVersion.id, recipientId: recipient.id, signatureType: "name", signerName, signatureData: signerName, agreedAt, agreementText: "内容を確認し、この条件に同意します", ipAddress: "prototype-not-recorded", userAgent: navigator.userAgent };
    patchDatabase((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, status: "同意済み", updatedAt: agreedAt } : project),
      signatures: [...current.signatures, item],
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, activeVersion.id, "agreement_accepted", `${signerName}さんが内容に同意しました`, "recipient")],
    }));
    setScreen("complete");
  };

  const downloadPdf = async () => {
    if (!activeProject) return;
    const filename = await createAgreementPdf(activeProject, content, events, signature);
    const fileHash = await hashText(`${activeProject.currentVersionId}:${filename}:${JSON.stringify(content)}`);
    patchDatabase((current) => ({
      ...current,
      generatedFiles: [...current.generatedFiles, { id: createId("file"), agreementVersionId: activeProject.currentVersionId, fileType: "agreement_pdf", storagePath: filename, fileHash, createdAt: nowIso() }],
      timelineEvents: [...current.timelineEvents, createEvent(activeProject.id, activeProject.currentVersionId, "pdf_generated", `PDFを作成しました（${filename}）`, "system")],
    }));
  };

  if (!database || !activeProject || !activeVersion) return <main className="loading-screen">読み込み中…</main>;

  return <main className="app-shell" data-theme={theme}>
    <header className="app-header">
      <button className="brand-button" onClick={() => setScreen("list")}>
        <span className="brand-mark"><Icon name="shield" /></span>
        <span><b>Creator Agreement</b><small>仕事の確認事項を、安全な合意へ。</small></span>
      </button>
      <div className="header-actions">
        <span className={`save-status ${saved ? "is-saved" : ""}`}><span className="save-dot" />{saved ? "この端末に保存済み" : "保存中…"}</span>
        <button className="ghost-button theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "白背景にする" : "黒背景にする"}</button>
        <button className="ghost-button roadmap-button" onClick={() => setScreen("roadmap")}>今後の展望</button>
        {screen !== "list" && <button className="ghost-button" onClick={() => setScreen("list")}>案件一覧</button>}
      </div>
    </header>

    <div className="prototype-note"><Icon name="shield" /><span><strong>画面確認用の試作です。</strong> 外部送信・本番URL・法的効力の保証は行いません。保存先はこの端末のブラウザです。</span></div>

    {screen === "list" && <section className="list-screen">
      <div className="page-heading">
        <div><span className="eyebrow">AGREEMENT PROJECTS</span><h1>仕事の確認事項</h1><p>依頼内容、報酬、納期、対応範囲を整理し、仕事前の認識違いを減らします。</p></div>
        <button className="primary-button" onClick={addProject}><Icon name="plus" />新しい確認事項を作る</button>
      </div>
      <div className="brand-overview">
        <div><span>01</span><b>案件内容を整理</b><small>依頼内容や条件を確認し、必要な情報を分かりやすく整理できます。</small></div>
        <div><span>02</span><b>確認事項を作成</b><small>報酬、納期、対応範囲などをまとめ、仕事前の認識違いを防ぎます。</small></div>
        <div><span>03</span><b>保存して再利用</b><small>作成した確認事項はこの端末に保存され、必要に応じて複製できます。</small></div>
      </div>
      <div className="filter-bar">
        <label className="search-box"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="案件名・発注者名で検索" /></label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | "すべて")}><option>すべて</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        {(search || statusFilter !== "すべて" || dateFilter) && <button className="text-button" onClick={() => { setSearch(""); setStatusFilter("すべて"); setDateFilter(""); }}>絞り込みを解除</button>}
      </div>
      <SecurityGuide />
      <div className="project-list">
        {filteredProjects.map((project) => {
          const projectContent = getContent(database, project);
          return <article className="project-card" key={project.id}>
            <button className="project-main" onClick={() => openProject(project.id)}>
              <div className="project-meta"><span className={`status status-${project.status}`}>{project.status}</span><span>{project.projectNumber}</span><span>Ver.{project.versionNumber}</span></div>
              <h2>{project.title}</h2>
              <p>{projectContent.clientName || "発注者未設定"}　・　{yen(projectContent.fee)}　・　納期 {formatDate(projectContent.deliveryDate)}</p>
              {project.nextReminderAt && <small><Icon name="bell" />次回リマインド予定 {formatDateTime(project.nextReminderAt)}</small>}
            </button>
            <div className="project-actions">
              <button onClick={() => openProject(project.id)}>開く</button>
              <button onClick={() => duplicateProject(project)}><Icon name="copy" />複製</button>
            </div>
          </article>;
        })}
        {!filteredProjects.length && <div className="empty-state">条件に合う案件がありません。</div>}
      </div>
      <button className="reset-link" onClick={() => { const next = resetDatabase(); setDatabase(next); setActiveProjectId(next.projects[0].id); }}>試作データを初期状態に戻す</button>
    </section>}

    {screen === "roadmap" && <section className="roadmap-screen">
      <div className="page-heading">
        <div><span className="eyebrow">ROADMAP</span><h1>今後の展望</h1><p>確認事項の作成、共有、保存をもっと簡単にするため、段階的に機能を追加していきます。</p></div>
        <button className="primary-button" onClick={() => setScreen("list")}>案件一覧へ戻る</button>
      </div>
      <div className="roadmap-grid">
        <article><span>現在できること</span><h2>確認事項の作成から同意記録まで</h2><p>案件作成、抜け漏れ確認、相手側プレビュー、同意、PDF保存までをブラウザ内で体験できます。</p></article>
        <article><span>次に追加予定</span><h2>AIによる入力補助</h2><p>入力内容を確認し、不足しやすい項目や追加で確認したい内容を分かりやすく案内できるようにします。</p></article>
        <article><span>今後の連携機能</span><h2>Google連携とクラウド保存</h2><p>書類保存、Google連携、クラウド保存、チーム利用に対応し、必要な情報を安全に管理しやすくします。</p></article>
        <article><span>安心の強化</span><h2>セキュリティと証拠保全</h2><p>認証、履歴、PDF原本、タイムスタンプなどを段階的に強化し、無理なく信頼できる記録を残せるようにします。</p></article>
      </div>
      <SecurityGuide />
    </section>}

    {(screen === "edit" || screen === "preview" || screen === "complete") && <div className="detail-shell">
      <aside className="detail-sidebar">
        <div className="side-project">
          <span className={`status status-${activeProject.status}`}>{activeProject.status}</span>
          <h2>{activeProject.title}</h2>
          <p>{activeProject.projectNumber} / Ver.{activeProject.versionNumber}</p>
          {activeProject.managerProjectId && <small>共通案件ID {activeProject.managerProjectId}</small>}
        </div>
        <nav>
          <button className={screen === "edit" ? "active" : ""} onClick={() => setScreen("edit")}>内容を編集</button>
          <button className={screen === "preview" ? "active" : ""} onClick={() => setScreen("preview")}>相手側プレビュー</button>
          {signature && <button className={screen === "complete" ? "active" : ""} onClick={() => setScreen("complete")}>同意完了</button>}
          <button onClick={() => setScreen("roadmap")}>今後の展望</button>
        </nav>
        <div className="side-actions">
          <button onClick={planReminder}><Icon name="bell" />リマインドを送る</button>
          <small>次回予定<br />{activeProject.nextReminderAt ? formatDateTime(activeProject.nextReminderAt) : "未設定"}</small>
          <button onClick={() => duplicateProject(activeProject)}><Icon name="copy" />この案件を複製</button>
          <button onClick={downloadPdf}><Icon name="download" />完成PDFを保存</button>
          {locked && <button className="gold-outline" onClick={createNewVersion}>新しいバージョンを作る</button>}
        </div>
        <div className="side-timeline">
          <h3><Icon name="clock" />タイムライン</h3>
          {events.slice(0, 7).map((event) => <div key={event.id}><span /><p><b>{event.label}</b><small>{formatDateTime(event.occurredAt)}</small></p></div>)}
        </div>
      </aside>

      {screen === "edit" && <section className="editor-screen">
        <div className="page-heading compact-heading">
          <div><span className="eyebrow">VIDEO PRODUCTION</span><h1>確認事項を整える</h1><p>{locked ? "確定済みの内容は編集できません。修正は新しいバージョンを作成してください。" : "分かる範囲から入力してください。"}</p></div>
          <button className="secondary-button" disabled={locked} onClick={openImport}><Icon name="import" />案件マネージャーから取り込む</button>
        </div>
        <div className="step-nav">{steps.map((label, index) => <button key={label} className={`${step === index ? "active" : ""} ${stepStates[index].missing ? "has-alert" : "is-filled"}`} onClick={() => setStep(index)}><span>{index + 1}</span><small>{label}<em>{stepStates[index].missing ? `未確認 ${stepStates[index].missing}` : "入力済み"}</em></small></button>)}</div>
        <fieldset disabled={locked} className="form-card">
          {step === 0 && <><div className="section-title"><span>01</span><div><h2>誰と、どの案件を進めるか</h2><p>案件マネージャーとの共通IDもここで保持します。</p></div></div><div className="form-grid">
            <Field label="共通案件ID"><input name="managerProjectId" value={content.managerProjectId} onChange={(event) => updateContent("managerProjectId", event.target.value)} /></Field>
            <Field label="業種"><input value={content.category} onChange={(event) => updateContent("category", event.target.value)} /></Field>
            <Field label="案件名" wide><input name="projectName" value={content.projectName} onChange={(event) => updateContent("projectName", event.target.value)} /></Field>
            <Field label="発注者名"><input name="clientName" value={content.clientName} onChange={(event) => updateContent("clientName", event.target.value)} /></Field>
            <Field label="発注者メール"><input type="email" value={content.clientEmail} onChange={(event) => updateContent("clientEmail", event.target.value)} /></Field>
            <Field label="受注者名"><input name="creatorName" value={content.creatorName} onChange={(event) => updateContent("creatorName", event.target.value)} /></Field>
            <Field label="受注者メール"><input type="email" value={content.creatorEmail} onChange={(event) => updateContent("creatorEmail", event.target.value)} /></Field>
            <Field label="業務委託日"><input name="commissionedAt" type="date" value={content.commissionedAt} onChange={(event) => updateContent("commissionedAt", event.target.value)} /></Field>
          </div></>}
          {step === 1 && <><div className="section-title"><span>02</span><div><h2>何を、どこまで作るか</h2><p>給付内容と作業範囲を明確にします。</p></div></div><div className="form-grid">
            <Field label="仕事の内容" wide><textarea name="workDescription" rows={4} value={content.workDescription} onChange={(event) => updateContent("workDescription", event.target.value)} /></Field>
            <Field label="納品物" wide><input value={content.deliverables} onChange={(event) => updateContent("deliverables", event.target.value)} /></Field>
            <Field label="納品形式"><input value={content.deliveryFormat} onChange={(event) => updateContent("deliveryFormat", event.target.value)} /></Field>
            <Field label="納品方法"><input value={content.deliveryMethod} onChange={(event) => updateContent("deliveryMethod", event.target.value)} /></Field>
            <Field label="料金に含む作業" wide><textarea rows={3} value={content.inScope} onChange={(event) => updateContent("inScope", event.target.value)} /></Field>
            <Field label="料金に含まない作業" wide><textarea rows={3} value={content.outOfScope} onChange={(event) => updateContent("outOfScope", event.target.value)} /></Field>
          </div></>}
          {step === 2 && <><div className="section-title"><span>03</span><div><h2>金額と日付を揃える</h2><p>発注者向けの明示項目も中立に確認します。</p></div></div><div className="form-grid">
            <Field label="報酬額"><input name="fee" inputMode="numeric" value={content.fee} onChange={(event) => updateContent("fee", event.target.value.replace(/\D/g, ""))} /></Field>
            <Field label="税の扱い"><select value={content.taxTreatment} onChange={(event) => updateContent("taxTreatment", event.target.value)}><option>税別</option><option>税込</option><option>非課税</option></select></Field>
            <Field label="納期"><input name="deliveryDate" type="date" value={content.deliveryDate} onChange={(event) => updateContent("deliveryDate", event.target.value)} /></Field>
            <Field label="納品・作業場所"><input name="deliveryPlace" value={content.deliveryPlace} onChange={(event) => updateContent("deliveryPlace", event.target.value)} /></Field>
            <Field label="支払期日"><input name="paymentDue" type="date" value={content.paymentDue} onChange={(event) => updateContent("paymentDue", event.target.value)} /></Field>
            <Field label="支払方法"><input name="paymentMethod" value={content.paymentMethod} onChange={(event) => updateContent("paymentMethod", event.target.value)} /></Field>
            <Field label="検査・確認の期限" hint="納品後何日以内に確認するか"><input name="inspectionDays" inputMode="numeric" value={content.inspectionDays} onChange={(event) => updateContent("inspectionDays", event.target.value.replace(/\D/g, ""))} /></Field>
          </div></>}
          {step === 3 && <><div className="section-title"><span>04</span><div><h2>修正・権利・実績公開</h2><p>誤解が生じやすい条件を、簡単な選択で整えます。</p></div></div><div className="form-grid">
            <Field label="無料修正回数"><input name="revisionCount" inputMode="numeric" value={content.revisionCount} onChange={(event) => updateContent("revisionCount", event.target.value.replace(/\D/g, ""))} /></Field>
            <Field label="追加修正の料金"><input value={content.additionalRevisionFee} onChange={(event) => updateContent("additionalRevisionFee", event.target.value)} placeholder="例：1回 20,000円〜" /></Field>
            <Field label="著作権の取り扱い" wide><select name="copyright" value={content.copyright} onChange={(event) => updateContent("copyright", event.target.value)}><option value="">選択してください</option><option>制作者に帰属する</option><option>代金支払後に発注者へ譲渡する</option><option>案件ごとの個別条件に従う</option></select></Field>
            <Field label="利用できる範囲" wide><input value={content.usageScope} onChange={(event) => updateContent("usageScope", event.target.value)} /></Field>
          </div><div className="portfolio-box"><h3>この仕事をポートフォリオ・SNS・Webに掲載してよいですか？</h3><div className="segmented large">
            {(["可", "不可"] as const).map((value) => <button type="button" key={value} className={content.portfolioPermission === value ? "active" : ""} onClick={() => updateContent("portfolioPermission", value)}>{value === "可" ? "掲載してよい" : "掲載しない"}</button>)}
          </div>{content.portfolioPermission === "可" && <div className="form-grid portfolio-options"><Field label="公開時期"><select value={content.portfolioTiming} onChange={(event) => updateContent("portfolioTiming", event.target.value)}><option>納品後すぐ</option><option>公開後</option><option>一定期間後</option></select></Field><Field label="クレジット"><select value={content.creditRequired} onChange={(event) => updateContent("creditRequired", event.target.value)}><option>クレジット不要</option><option>制作者名を記載</option><option>事前確認する</option></select></Field></div>}</div></>}
          {step === 4 && <><div className="section-title"><span>05</span><div><h2>撮影と万一の取り決め</h2><p>案件に不要な項目は「該当なし」を選べます。</p></div></div><div className="clause-list">
            <ClauseField label="天候による撮影順延と費用負担" state={content.weatherPostponementState} value={content.weatherPostponement} onState={(value) => updateContent("weatherPostponementState", value)} onValue={(value) => updateContent("weatherPostponement", value)} placeholder="順延日や追加実費の負担を記載" />
            <ClauseField label="ロケ地・撮影許可" state={content.locationPermitState} value={content.locationPermit} onState={(value) => updateContent("locationPermitState", value)} onValue={(value) => updateContent("locationPermit", value)} placeholder="許可取得者と費用負担を記載" />
            <ClauseField label="出演者の肖像権・パブリシティ権" state={content.portraitRightsState} value={content.portraitRights} onState={(value) => updateContent("portraitRightsState", value)} onValue={(value) => updateContent("portraitRights", value)} placeholder="出演者の許諾取得者を記載" />
            <ClauseField label="BGM・素材の権利と費用負担" state={content.musicRightsState} value={content.musicRights} onState={(value) => updateContent("musicRightsState", value)} onValue={(value) => updateContent("musicRights", value)} placeholder="素材の許諾と費用負担を記載" />
          </div><div className="form-grid after-clauses">
            <Field label="納品後の再編集料金" wide><input name="reEditingFee" value={content.reEditingFee} onChange={(event) => updateContent("reEditingFee", event.target.value)} placeholder="例：内容確認後に別途見積" /></Field>
            <Field label="中止・延期時の対応" wide><textarea name="cancellation" rows={3} value={content.cancellation} onChange={(event) => updateContent("cancellation", event.target.value)} /></Field>
            <Field label="損害賠償上限" wide><input value={content.liabilityLimit} onChange={(event) => updateContent("liabilityLimit", event.target.value)} placeholder="例：受領済み報酬額を上限とする／個別協議" /></Field>
          </div></>}
        </fieldset>
        <div className="editor-footer"><button className="ghost-button" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>← 戻る</button>{step < 4 ? <button className="primary-button" onClick={() => setStep(step + 1)}>次へ <Icon name="arrow" /></button> : <button className="primary-button" onClick={() => setScreen("preview")}>相手側を確認 <Icon name="arrow" /></button>}</div>
      </section>}

      {screen === "preview" && <section className="preview-screen">
        <div className="preview-topbar"><div><span>相手側の表示プレビュー</span><b>Ver.{activeProject.versionNumber} {locked ? "確定済み" : "下書き"}</b></div>{!locked && <button className="primary-button" disabled={blockingChecks.length > 0} onClick={confirmVersion}>{blockingChecks.length ? `明示項目をあと${blockingChecks.length}件確認` : "送信者として内容を確定"}</button>}</div>
        <div className="preview-grid">
          <div className="check-column">
            <div className={`check-summary ${checks.length ? "" : "complete"}`}><Icon name={checks.length ? "help" : "check"} /><div><span>抜け漏れ確認</span><h2>{checks.length ? `確認したい項目が${checks.length}件あります` : "必要な確認が整いました"}</h2></div></div>
            {checks.map((check) => <button className="check-item" key={`${check.field}-${check.title}`} onClick={() => { setScreen("edit"); setStep(check.step); window.setTimeout(() => document.querySelector<HTMLElement>(`[name="${check.field}"]`)?.focus(), 50); }}><span className={`level-dot ${check.level}`} /><span><b>{check.title}</b><small>{check.detail}</small></span><span>›</span></button>)}
            <div className="law-note"><b>フリーランス法チェックについて</b><p>法令の適用や有効性を断定せず、発注者が明示を検討する項目の入力状況を確認しています。</p></div>
            <div className="pdf-guide"><b>PDF出力の確認</b><p>出力対象：Ver.{activeProject.versionNumber} の仕事の確認事項</p><p>推奨ファイル名：日付_{content.clientName || "発注者名"}_確認事項_{content.projectName || activeProject.title}.pdf</p></div>
          </div>
          <article className="agreement-card">
            {activeVersion.replacedAt && <div className="old-version-notice">新しい内容があります。このバージョンでは同意できません。</div>}
            <header className="agreement-header"><div className="agreement-logo"><Icon name="shield" /></div><span>仕事の確認事項</span><h1>{content.projectName}</h1><p>大切な条件を、分かりやすくまとめました。</p></header>
            <div className="agreement-body">
              <div className="party-grid"><div><span>発注者</span><b>{content.clientName || "未設定"}</b></div><div><span>受注者</span><b>{content.creatorName || "未設定"}</b></div></div>
              <section className="summary-section"><span>01</span><div><h2>お願いする仕事</h2><p>{content.workDescription || "未設定"}</p></div></section>
              <div className="condition-grid"><div><span>報酬</span><b>{yen(content.fee)} <small>{content.taxTreatment}</small></b></div><div><span>納期</span><b>{formatDate(content.deliveryDate)}</b></div><div><span>支払期日</span><b>{formatDate(content.paymentDue)}</b></div><div><span>納品物</span><b>{content.deliverables || "未設定"}</b></div></div>
              <section className="detail-section"><h2>納品と確認</h2><dl><div><dt>納品場所</dt><dd>{content.deliveryPlace || "未設定"}</dd></div><div><dt>支払方法</dt><dd>{content.paymentMethod || "未設定"}</dd></div><div><dt>確認期限 <HelpButton id="inspection" onOpen={setHelpId} /></dt><dd>{content.inspectionDays ? `納品後${content.inspectionDays}日以内` : "未設定"}</dd></div></dl></section>
              <section className="detail-section"><h2>修正・権利・公開</h2><dl><div><dt>無料修正</dt><dd>{content.revisionCount ? `${content.revisionCount}回まで` : "未設定"}</dd></div><div><dt>著作権 <HelpButton id="copyright" onOpen={setHelpId} /></dt><dd>{content.copyright || "未設定"}</dd></div><div><dt>実績公開</dt><dd>{content.portfolioPermission === "可" ? `可 / ${content.portfolioTiming} / ${content.creditRequired}` : content.portfolioPermission || "未確認"}</dd></div></dl></section>
              <section className="detail-section"><h2>撮影時の確認</h2><dl><div><dt>天候・順延</dt><dd>{content.weatherPostponementState === "on" ? content.weatherPostponement : content.weatherPostponementState === "na" ? "該当なし" : "使用しない"}</dd></div><div><dt>撮影許可</dt><dd>{content.locationPermitState === "on" ? content.locationPermit : content.locationPermitState === "na" ? "該当なし" : "使用しない"}</dd></div><div><dt>出演者の権利 <HelpButton id="rights" onOpen={setHelpId} /></dt><dd>{content.portraitRightsState === "on" ? content.portraitRights : content.portraitRightsState === "na" ? "該当なし" : "使用しない"}</dd></div><div><dt>BGM・素材</dt><dd>{content.musicRightsState === "on" ? content.musicRights : content.musicRightsState === "na" ? "該当なし" : "使用しない"}</dd></div></dl></section>
              <section className="detail-section"><h2>万一のとき</h2><dl><div><dt>中止・延期</dt><dd>{content.cancellation || "未設定"}</dd></div><div><dt>再編集料金</dt><dd>{content.reEditingFee || "未設定"}</dd></div><div><dt>損害賠償上限 <HelpButton id="liability" onOpen={setHelpId} /></dt><dd>{content.liabilityLimit || "個別に協議"}</dd></div></dl></section>
              {!locked && <div className="preview-lock-note">送信者が内容を確定すると、相手の確認・同意画面が有効になります。</div>}
              {locked && !signature && !activeVersion.replacedAt && <div className="consent-box">
                <label className="consent-check"><input type="checkbox" checked={consentChecked} onChange={(event) => setConsentChecked(event.target.checked)} /><span>内容を確認し、この条件に同意します</span></label>
                <input value={signerName} onChange={(event) => setSignerName(event.target.value)} placeholder="氏名を入力" />
                {!recipient && <button disabled={!signerName} onClick={requestEmail}>メール確認へ進む</button>}
                {recipient?.verificationStatus === "確認待ち" && <button onClick={verifyEmail}>確認メールを開いた想定で「確認済み」にする</button>}
                {recipient?.verificationStatus === "確認済み" && <><p className="verified"><Icon name="check" />メール確認済み（試作）</p><button disabled={!consentChecked || !signerName} onClick={acceptAgreement}>内容を確認して同意する</button></>}
                <small>試作のためメールは実送信せず、状態の流れだけ確認します。</small>
              </div>}
              {signature && <div className="accepted-box"><Icon name="check" /><div><b>{signature.signerName}さんが内容に同意しました</b><span>{formatDateTime(signature.agreedAt)}</span></div></div>}
            </div>
          </article>
        </div>
      </section>}

      {screen === "complete" && <section className="complete-screen">
        <div className="complete-card"><div className="complete-icon"><Icon name="check" /></div><span>確認が完了しました</span><h1>双方の合意内容を記録しました</h1><p>送信者が確定したVer.{activeProject.versionNumber}と、{signature?.signerName}さんが確認した内容は同一です。</p><div className="complete-meta"><div><span>契約番号</span><b>{activeProject.projectNumber}</b></div><div><span>同意日時</span><b>{formatDateTime(signature?.agreedAt ?? "")}</b></div><div><span>メール確認</span><b>{recipient?.verificationStatus ?? "未確認"}</b></div></div><button className="primary-button large-button" onClick={downloadPdf}><Icon name="download" />双方共通の完成PDFをダウンロード</button><small>PDFには仕事の条件、契約番号、バージョン、同意記録の概要が含まれます。</small></div>
      </section>}
    </div>}

    {importOpen && <div className="modal-backdrop" onMouseDown={() => setImportOpen(false)}><div className="modal-card import-modal" onMouseDown={(event) => event.stopPropagation()}><span className="eyebrow">CREATOR PROJECT MANAGER</span><h2>取り込む案件を選ぶ</h2><p>共通案件IDをキーに、案件マネージャーの情報を入力欄へ反映します。</p>{managerProjects.map((project) => <button className="import-card" key={project.id} onClick={() => importProject(project)}><span>{project.id}</span><b>{project.title}</b><small>{project.clientName} / {yen(project.fee)} / 納期 {formatDate(project.deliveryDate)}</small></button>)}<button className="ghost-button" onClick={() => setImportOpen(false)}>閉じる</button></div></div>}
    {helpId && <div className="modal-backdrop" onMouseDown={() => setHelpId(null)}><div className="modal-card help-modal" onMouseDown={(event) => event.stopPropagation()}><div className="help-icon"><Icon name="help" /></div><h2>{helpText[helpId].title}</h2><p>{helpText[helpId].text}</p><small>この説明は一般的な理解を助けるためのもので、法律相談ではありません。</small><button className="primary-button" onClick={() => setHelpId(null)}>わかりました</button></div></div>}
  </main>;
}
