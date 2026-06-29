"use client";

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { calculateTotals, recommendedPdfFileName } from "@/domain/format";
import { createId, seedDocument } from "@/domain/seed";
import type { Client, DocumentKind, ProjectDocument, SavedDocumentRecord } from "@/domain/types";
import { getPrimaryRoleColorMeta } from "@/domain/roleTemplates";
import { localDocumentRepository } from "@/data/documentRepository";
import { DocumentPreview } from "@/features/documents/DocumentPreview";
import { emptyClient, type FormTab, ProjectForms } from "@/features/editor/ProjectForms";
import { RoadmapOverlay } from "@/features/workspace/RoadmapOverlay";

type Theme = "dark" | "light";

const tabs: { id: FormTab; label: string; short: string; document?: DocumentKind }[] = [
  { id: "roles", label: "職業選択", short: "職業", document: "hearing" }, { id: "hearing", label: "聞き取り", short: "聞取", document: "hearing" },
  { id: "parties", label: "取引先", short: "取引先", document: "sheet" },
  { id: "estimate", label: "見積作成", short: "見積", document: "estimate" }, { id: "settlement", label: "精算・領収書", short: "精算", document: "settlement" },
  { id: "confirmation", label: "業務内容確認", short: "確認", document: "confirmation" }, { id: "delivery", label: "納品／業務完了", short: "納品", document: "delivery" },
  { id: "invoice", label: "請求", short: "請求", document: "invoice" },
  { id: "export", label: "PDF出力", short: "出力" }, { id: "records", label: "作成済み書類", short: "保存" },
];
const documentTabs: { id: DocumentKind; label: string }[] = [{ id: "guide", label: "聞き取りカンペ" }, { id: "hearing", label: "聞き取りシート" }, { id: "sheet", label: "案件シート" }, { id: "estimate", label: "見積書" }, { id: "settlement", label: "精算書" }, { id: "confirmation", label: "業務内容確認書" }, { id: "delivery", label: "納品/完了書類" }, { id: "invoice", label: "請求書" }];

export function DocumentWorkspace() {
  const [document, setDocumentState] = useState<ProjectDocument>(seedDocument);
  const [clients, setClients] = useState<Client[]>([seedDocument.client]);
  const [records, setRecords] = useState<SavedDocumentRecord[]>([]);
  const [tab, setTab] = useState<FormTab>("roles");
  const [documentKind, setDocumentKind] = useState<DocumentKind>("hearing");
  const [mobilePane, setMobilePane] = useState<"form" | "preview">("form");
  const [splitPercent, setSplitPercent] = useState(56);
  const [previewScale, setPreviewScale] = useState(0.58);
  const [saveState, setSaveState] = useState<"loading" | "saved" | "saving">("loading");
  const [theme, setTheme] = useState<Theme>("dark");
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const hydrated = useRef(false);
  const splitAreaRef = useRef<HTMLDivElement>(null);
  const formPaneRef = useRef<HTMLElement>(null);
  const previewPaneRef = useRef<HTMLElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const totals = useMemo(() => calculateTotals(document), [document]);
  const roleColor = useMemo(() => getPrimaryRoleColorMeta(document.selectedRoles), [document.selectedRoles]);
  const roleAccentStyle = { "--role-accent": roleColor.color, "--role-accent-soft": roleColor.soft, "--role-accent-border": roleColor.border, "--form-pane-size": `${splitPercent}%` } as CSSProperties;

  useEffect(() => { void (async () => { const [saved, savedClients, savedRecords] = await Promise.all([localDocumentRepository.load(), localDocumentRepository.loadClients(), localDocumentRepository.loadRecords()]); if (saved) { const legacy = saved as ProjectDocument & { settlementLines?: ProjectDocument["expenseLines"]; dismissedEstimateCandidates?: string[] }; setDocumentState({ ...seedDocument, ...saved, client: { ...seedDocument.client, ...saved.client }, vendor: { ...seedDocument.vendor, ...saved.vendor }, selectedRoles: saved.selectedRoles ?? seedDocument.selectedRoles, roleAnswers: saved.roleAnswers ?? seedDocument.roleAnswers, meetingTranscript: saved.meetingTranscript ?? "", selectedNoteIds: saved.selectedNoteIds ?? [], customNote: saved.customNote ?? "", lines: (saved.lines ?? seedDocument.lines).map((line) => ({ ...line, tax: String(line.tax) === "課税" ? "税別" : line.tax })), dismissedEstimateCandidates: legacy.dismissedEstimateCandidates ?? [], expenseLines: saved.expenseLines ?? legacy.settlementLines ?? seedDocument.expenseLines }); } if (savedClients.length) setClients(savedClients); setRecords(savedRecords); hydrated.current = true; setSaveState("saved"); })(); }, []);
  useEffect(() => { if (!hydrated.current) return; setSaveState("saving"); const timer = window.setTimeout(async () => { await localDocumentRepository.save({ ...document, updatedAt: new Date().toISOString() }); setSaveState("saved"); }, 500); return () => window.clearTimeout(timer); }, [document]);

  useEffect(() => { try { const saved = window.localStorage.getItem("creator-os:theme"); if (saved === "light" || saved === "dark") setTheme(saved); } catch {} }, []);
  useEffect(() => { const root = window.document.documentElement; root.classList.toggle("dark", theme === "dark"); try { window.localStorage.setItem("creator-os:theme", theme); } catch {} }, [theme]);

  useEffect(() => {
    const node = previewViewportRef.current;
    if (!node) return;
    const updateScale = () => {
      const width = node.getBoundingClientRect().width;
      const next = Math.min(1, Math.max(0.36, (width - 32) / 794));
      setPreviewScale(Number(next.toFixed(3)));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const setDocument = (updater: (current: ProjectDocument) => ProjectDocument) => setDocumentState((current) => updater(current));
  const update = <K extends keyof ProjectDocument>(key: K, value: ProjectDocument[K]) => setDocumentState((current) => ({ ...current, [key]: value }));
  const goTab = (next: FormTab) => { setTab(next); const match = tabs.find((item) => item.id === next); if (match?.document) setDocumentKind(match.document); };
  const scrollMobilePane = (pane: "form" | "preview") => {
    setMobilePane(pane);
    window.setTimeout(() => {
      const target = pane === "form" ? formPaneRef.current : previewPaneRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };
  const startSplitResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = splitAreaRef.current;
    if (!node) return;
    event.preventDefault();
    const rect = node.getBoundingClientRect();
    const move = (moveEvent: PointerEvent) => {
      const raw = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(72, Math.max(36, raw)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.document.body.style.cursor = "";
      window.document.body.style.userSelect = "";
    };
    window.document.body.style.cursor = "col-resize";
    window.document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const saveClient = async () => { const client = document.client.id ? document.client : { ...document.client, id: createId() }; const next = clients.some((item) => item.id === client.id) ? clients.map((item) => item.id === client.id ? client : item) : [...clients, client]; setClients(next); update("client", client); await localDocumentRepository.saveClients(next); };
  const deleteClient = async (id: string) => { const next = clients.filter((item) => item.id !== id); setClients(next); await localDocumentRepository.saveClients(next); if (document.client.id === id) update("client", emptyClient()); };
  const printableName = recommendedPdfFileName(document, documentKind);
  const printCurrent = () => {
    const previousTitle = window.document.title;
    window.document.title = printableName.replace(/\.pdf$/i, "");
    window.addEventListener("afterprint", () => { window.document.title = previousTitle; }, { once: true });
    window.print();
  };
  const saveRecord = async () => {
    if (["guide", "hearing", "sheet"].includes(documentKind)) return;
    const now = new Date().toISOString();
    const record: SavedDocumentRecord = { id: createId(), documentKind: documentKind as SavedDocumentRecord["documentKind"], document: { ...document, updatedAt: now }, amount: documentKind === "settlement" ? totals.settlementGross : documentKind === "invoice" ? totals.invoiceTotal : totals.estimateGross, status: document.status, createdAt: now, updatedAt: now };
    const next = [record, ...records];
    setRecords(next);
    await localDocumentRepository.saveRecords(next);
  };
  const duplicateRecord = (record: SavedDocumentRecord) => {
    const now = new Date().toISOString();
    setDocumentState({ ...record.document, id: createId(), projectNo: `${record.document.projectNo}-COPY`, status: "ヒアリング中", issueDate: now.slice(0, 10), invoiceDate: now.slice(0, 10), updatedAt: now });
    setDocumentKind(record.documentKind);
    goTab(record.documentKind === "estimate" ? "estimate" : record.documentKind === "settlement" ? "settlement" : record.documentKind === "confirmation" ? "confirmation" : record.documentKind === "delivery" ? "delivery" : "invoice");
  };
  const deleteRecord = async (id: string) => { const next = records.filter((record) => record.id !== id); setRecords(next); await localDocumentRepository.saveRecords(next); };
  const clearLocalData = async () => {
    if (!window.confirm("この端末に保存された案件・取引先・作成済み書類をすべて削除します。元に戻せません。削除しますか？")) return;
    await localDocumentRepository.clearAll();
    setDocumentState({ ...seedDocument, id: createId() });
    setClients([]);
    setRecords([]);
  };

  return <main className="flex min-h-screen flex-col bg-canvas text-fg lg:h-screen lg:overflow-hidden" style={roleAccentStyle}>
    {roadmapOpen && <RoadmapOverlay onClose={() => setRoadmapOpen(false)} />}
    <header className="no-print z-30 border-b border-line bg-surface">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5"><span className="h-8 w-1.5 shrink-0" style={{ backgroundColor: roleColor.color }}/><div className="min-w-0"><h1 className="truncate font-display text-sm font-semibold tracking-tight sm:text-lg">クリエイター案件マネージャー <span className="ml-1.5 hidden align-middle text-[10px] font-sans font-bold tracking-brand sm:inline" style={{ color: roleColor.color }}>CREATOR OS</span></h1><p className="hidden text-xs text-fg-faint sm:block">職業を選ぶ → 聞き取る → 取引書類を一本の線にする　<span className="text-fg-muted">企画・開発：東海制作</span></p></div></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-fg-faint sm:inline">{saveState === "saving" ? "保存中…" : saveState === "saved" ? "保存済み" : "読込中…"}</span>
          <button type="button" onClick={() => setRoadmapOpen(true)} className="min-h-9 whitespace-nowrap rounded-full border border-line-strong px-2.5 text-xs font-bold text-fg-muted transition hover:border-brand hover:text-brand sm:px-4"><span className="sm:hidden">展望</span><span className="hidden sm:inline">今後の展望</span></button>
          <div className="no-print flex items-center rounded-full border border-line-strong p-0.5 text-xs" role="group" aria-label="背景テーマ">{(["light", "dark"] as const).map((mode) => <button key={mode} onClick={() => setTheme(mode)} aria-pressed={theme === mode} className={`min-h-8 rounded-full px-3 font-bold transition ${theme === mode ? "bg-fg text-canvas" : "text-fg-faint hover:text-fg"}`}>{mode === "light" ? "白" : "黒"}</button>)}</div>
          <button onClick={printCurrent} className="min-h-10 whitespace-nowrap rounded-full bg-brand px-3 text-xs font-bold text-white shadow-sm transition hover:bg-brand-bright sm:px-5 sm:text-sm">PDF出力</button>
        </div>
      </div>
      <div className="flex border-t border-line lg:hidden">{(["form", "preview"] as const).map((pane) => <button key={pane} onClick={() => scrollMobilePane(pane)} style={mobilePane === pane ? { borderColor: roleColor.color, color: roleColor.color } : undefined} className={`min-h-12 flex-1 border-b-2 text-sm font-bold ${mobilePane === pane ? "" : "border-transparent text-fg-faint"}`}>{pane === "form" ? "入力" : "プレビュー"}</button>)}</div>
    </header>
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
      <aside className="no-print hidden w-60 shrink-0 flex-col border-r border-line bg-[#111113] p-4 lg:flex">
        <div className="mb-6 rounded-xl border border-line bg-surface/60 p-4">
          <p className="text-[10px] font-bold tracking-brand" style={{ color: roleColor.color }}>CREATOR OS</p>
          <h2 className="mt-2 text-sm font-bold text-fg">App Launcher</h2>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">案件・書類・AI補助を一つの作業空間にまとめます。</p>
        </div>
        <nav className="space-y-2" aria-label="Creator OS">
          {[
            { label: "Home", sub: "職業と案件の起点", active: tab === "roles", action: () => goTab("roles") },
            { label: "Projects", sub: "聞き取り・案件作成", active: ["hearing", "parties", "estimate", "settlement", "confirmation", "delivery", "invoice"].includes(tab), action: () => goTab("hearing") },
            { label: "Documents", sub: "PDF出力・保存", active: ["export", "records"].includes(tab), action: () => goTab("export") },
            { label: "Roadmap", sub: "今後の展望", active: roadmapOpen, action: () => setRoadmapOpen(true) },
          ].map((item) => <button key={item.label} type="button" onClick={item.action} className={`group w-full rounded-xl border px-3 py-3 text-left transition duration-200 ${item.active ? "bg-surface text-fg" : "border-transparent text-fg-muted hover:bg-[#1e1e24] hover:text-fg"}`} style={item.active ? { borderColor: roleColor.border, boxShadow: `inset 3px 0 0 ${roleColor.color}` } : undefined}>
            <span className="flex items-center gap-2 text-sm font-bold"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.active ? roleColor.color : "var(--fg-3)" }} />{item.label}</span>
            <span className="mt-1 block pl-3.5 text-[11px] leading-relaxed text-fg-faint">{item.sub}</span>
          </button>)}
        </nav>
        <div className="mt-auto rounded-xl border border-line bg-surface/50 p-4">
          <p className="text-[10px] font-bold tracking-[.16em] text-fg-faint">CURRENT PROJECT</p>
          <p className="mt-2 line-clamp-2 text-sm font-bold text-fg">{document.projectName || "案件名未設定"}</p>
          <p className="mt-1 text-xs text-fg-muted">{document.selectedRoles.join(" / ") || "職種未選択"}</p>
        </div>
      </aside>
      <div ref={splitAreaRef} className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
      <section ref={formPaneRef} className="no-print flex w-full min-w-0 flex-col border-r border-line bg-surface lg:min-w-[360px] lg:flex-[0_0_var(--form-pane-size)]">
        <nav className="scrollbar-thin flex shrink-0 overflow-x-auto border-b border-line px-2" aria-label="作成手順">{tabs.map((item, index) => <button key={item.id} onClick={() => goTab(item.id)} style={tab === item.id ? { borderColor: roleColor.color } : undefined} className={`min-h-14 shrink-0 border-b-2 px-3 text-sm transition ${tab === item.id ? "font-bold text-fg" : "border-transparent text-fg-faint hover:text-fg"}`}><span className="mr-1 text-[10px] text-fg-faint">{index + 1}</span><span className="hidden 2xl:inline">{item.label}</span><span className="2xl:hidden">{item.short}</span></button>)}</nav>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-5 pb-24 sm:p-7 sm:pb-24 lg:pb-7"><ProjectForms tab={tab} document={document} documentKind={documentKind} totals={totals} clients={clients} records={records} recommendedFileName={printableName} update={update} setDocument={setDocument} saveClient={saveClient} selectClient={(id) => { const client = clients.find((item) => item.id === id); if (client) update("client", client); }} newClient={() => update("client", emptyClient())} deleteClient={deleteClient} onPrint={printCurrent} onSaveRecord={saveRecord} onDuplicateRecord={duplicateRecord} onDeleteRecord={deleteRecord} onClearLocalData={clearLocalData} onSelectDocument={setDocumentKind} />
          <div className="mt-8 flex justify-between border-t border-line pt-5">{(() => { const index = tabs.findIndex((item) => item.id === tab); return <><button disabled={index === 0} onClick={() => goTab(tabs[index - 1].id)} className="min-h-11 px-3 text-sm font-semibold text-fg-muted disabled:opacity-30">← 戻る</button><button disabled={index === tabs.length - 1} onClick={() => goTab(tabs[index + 1].id)} className="min-h-11 rounded-full bg-fg px-6 text-sm font-bold text-canvas disabled:opacity-30">次へ →</button></>; })()}</div>
        </div>
      </section>
      <button type="button" aria-label="入力とプレビューの幅を変更" title="ドラッグして幅を変更" onPointerDown={startSplitResize} className="no-print hidden w-3 shrink-0 cursor-col-resize items-center justify-center border-x border-line bg-canvas transition hover:bg-surface-2 lg:flex">
        <span className="h-12 w-1 rounded-full" style={{ backgroundColor: roleColor.color }} />
      </button>
      <section ref={previewPaneRef} className="preview-pane flex min-h-[80vh] min-w-0 flex-col bg-preview lg:min-h-0 lg:flex-1">
        <nav className="no-print scrollbar-thin flex shrink-0 overflow-x-auto border-b border-line bg-preview px-3 pt-2">{documentTabs.map((item) => <button key={item.id} onClick={() => setDocumentKind(item.id)} style={documentKind === item.id ? { borderTopColor: roleColor.color } : undefined} className={`min-h-11 shrink-0 rounded-t-xl border-t-2 px-4 text-sm font-semibold transition ${documentKind === item.id ? "bg-white text-ink shadow-sm" : "border-transparent text-fg-faint hover:text-fg-muted"}`}>{item.label}</button>)}</nav>
        <div ref={previewViewportRef} className="doc-viewport scrollbar-thin flex-1 overflow-auto p-4 pb-24 sm:p-8 sm:pb-24 lg:p-4 lg:pb-4 xl:p-5"><div className="flex justify-center"><div className="doc-zoom origin-top" style={{ zoom: previewScale } as CSSProperties}><DocumentPreview kind={documentKind} document={document} totals={totals} /></div></div></div>
      </section>
      </div>
    </div>
    <nav className="no-print fixed bottom-3 left-3 z-40 grid w-[calc(100vw-1.5rem)] max-w-[360px] rounded-2xl border border-line bg-surface/95 p-1 shadow-float backdrop-blur lg:hidden" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }} aria-label="モバイルナビ">
      {[
        { label: "Home", jp: "ホーム", active: tab === "roles", action: () => { setMobilePane("form"); goTab("roles"); } },
        { label: "Projects", jp: "案件", active: ["hearing", "parties", "estimate", "settlement", "confirmation", "delivery", "invoice"].includes(tab), action: () => { goTab("hearing"); scrollMobilePane("form"); } },
        { label: "Docs", jp: "書類", active: mobilePane === "preview" || ["export", "records"].includes(tab), action: () => scrollMobilePane("preview") },
        { label: "Notice", jp: "通知", active: roadmapOpen, action: () => setRoadmapOpen(true) },
      ].map((item) => <button key={item.label} type="button" onClick={item.action} className={`min-h-12 rounded-xl text-center transition ${item.active ? "bg-surface-2 text-fg" : "text-fg-faint"}`} style={item.active ? { boxShadow: `inset 0 3px 0 ${roleColor.color}` } : undefined}>
        <span className="block text-[10px] font-bold">{item.label}</span>
        <span className="block text-[11px]">{item.jp}</span>
      </button>)}
    </nav>
  </main>;
}
