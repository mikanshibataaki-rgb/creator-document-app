"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculateTotals } from "@/domain/format";
import { seedDocument } from "@/domain/seed";
import type { Client, DocumentKind, ProjectDocument } from "@/domain/types";
import { localDocumentRepository } from "@/data/documentRepository";
import { DocumentPreview } from "@/features/documents/DocumentPreview";
import { emptyClient, type FormTab, ProjectForms } from "@/features/editor/ProjectForms";

const tabs: { id: FormTab; label: string; short: string; document?: DocumentKind }[] = [
  { id: "roles", label: "職業選択", short: "職業", document: "hearing" }, { id: "hearing", label: "聞き取り", short: "聞取", document: "hearing" }, { id: "parties", label: "取引先", short: "取引先", document: "hearing" },
  { id: "project", label: "案件整理", short: "案件", document: "sheet" }, { id: "conditions", label: "制作条件", short: "条件", document: "sheet" },
  { id: "estimate", label: "見積作成", short: "見積", document: "estimate" }, { id: "settlement", label: "精算・領収書", short: "精算", document: "settlement" },
  { id: "confirmation", label: "業務内容確認", short: "確認", document: "confirmation" }, { id: "delivery", label: "納品書", short: "納品", document: "delivery" },
  { id: "invoice", label: "請求書", short: "請求", document: "invoice" },
  { id: "export", label: "PDF出力", short: "出力" },
];
const documentTabs: { id: DocumentKind; label: string }[] = [{ id: "hearing", label: "聞き取りシート" }, { id: "sheet", label: "案件シート" }, { id: "estimate", label: "見積書" }, { id: "settlement", label: "精算書" }, { id: "confirmation", label: "業務内容確認書" }, { id: "delivery", label: "納品書" }, { id: "invoice", label: "請求書" }];

export function DocumentWorkspace() {
  const [document, setDocumentState] = useState<ProjectDocument>(seedDocument);
  const [clients, setClients] = useState<Client[]>([seedDocument.client]);
  const [tab, setTab] = useState<FormTab>("roles");
  const [documentKind, setDocumentKind] = useState<DocumentKind>("hearing");
  const [mobilePane, setMobilePane] = useState<"form" | "preview">("form");
  const [saveState, setSaveState] = useState<"loading" | "saved" | "saving">("loading");
  const hydrated = useRef(false);
  const totals = useMemo(() => calculateTotals(document), [document]);

  useEffect(() => { void (async () => { const [saved, savedClients] = await Promise.all([localDocumentRepository.load(), localDocumentRepository.loadClients()]); if (saved) { const legacy = saved as ProjectDocument & { settlementLines?: ProjectDocument["expenseLines"] }; setDocumentState({ ...seedDocument, ...saved, client: { ...seedDocument.client, ...saved.client }, vendor: { ...seedDocument.vendor, ...saved.vendor }, selectedRoles: saved.selectedRoles ?? seedDocument.selectedRoles, roleAnswers: saved.roleAnswers ?? seedDocument.roleAnswers, lines: (saved.lines ?? seedDocument.lines).map((line) => ({ ...line, tax: String(line.tax) === "課税" ? "税別" : line.tax })), expenseLines: saved.expenseLines ?? legacy.settlementLines ?? seedDocument.expenseLines }); } if (savedClients.length) setClients(savedClients); hydrated.current = true; setSaveState("saved"); })(); }, []);
  useEffect(() => { if (!hydrated.current) return; setSaveState("saving"); const timer = window.setTimeout(async () => { await localDocumentRepository.save({ ...document, updatedAt: new Date().toISOString() }); setSaveState("saved"); }, 500); return () => window.clearTimeout(timer); }, [document]);

  const setDocument = (updater: (current: ProjectDocument) => ProjectDocument) => setDocumentState((current) => updater(current));
  const update = <K extends keyof ProjectDocument>(key: K, value: ProjectDocument[K]) => setDocumentState((current) => ({ ...current, [key]: value }));
  const goTab = (next: FormTab) => { setTab(next); const match = tabs.find((item) => item.id === next); if (match?.document) setDocumentKind(match.document); };
  const saveClient = async () => { const client = document.client.id ? document.client : { ...document.client, id: crypto.randomUUID() }; const next = clients.some((item) => item.id === client.id) ? clients.map((item) => item.id === client.id ? client : item) : [...clients, client]; setClients(next); update("client", client); await localDocumentRepository.saveClients(next); };
  const deleteClient = async (id: string) => { const next = clients.filter((item) => item.id !== id); setClients(next); await localDocumentRepository.saveClients(next); if (document.client.id === id) update("client", emptyClient()); };

  return <main className="flex min-h-screen flex-col bg-paper lg:h-screen lg:overflow-hidden">
    <header className="no-print z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><span className="h-9 w-1.5 shrink-0 rounded-full bg-brand"/><div className="min-w-0"><h1 className="truncate text-base font-bold sm:text-lg">クリエイター案件マネージャー <span className="ml-1 text-xs font-medium text-brand">BETA</span></h1><p className="hidden text-xs text-neutral-500 sm:block">職業を選ぶ → 聞き取る → 取引書類を自動生成</p></div></div>
        <div className="flex items-center gap-3"><span className="hidden text-xs text-neutral-400 sm:inline">{saveState === "saving" ? "保存中…" : saveState === "saved" ? "ローカル保存済み" : "読込中…"}</span><button onClick={() => window.print()} className="min-h-11 rounded-xl bg-brand px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-dark">PDF出力</button></div>
      </div>
      <div className="flex border-t border-neutral-100 lg:hidden">{(["form", "preview"] as const).map((pane) => <button key={pane} onClick={() => setMobilePane(pane)} className={`min-h-12 flex-1 border-b-2 text-sm font-bold ${mobilePane === pane ? "border-brand text-brand" : "border-transparent text-neutral-400"}`}>{pane === "form" ? "入力" : "プレビュー"}</button>)}</div>
    </header>
    <div className="flex min-h-0 flex-1">
      <section className={`${mobilePane === "form" ? "flex" : "hidden"} no-print w-full min-w-0 flex-col border-r border-neutral-200 bg-white lg:flex lg:w-[46%] xl:w-[42%]`}>
        <nav className="scrollbar-thin flex shrink-0 overflow-x-auto border-b border-neutral-200 px-2" aria-label="作成手順">{tabs.map((item, index) => <button key={item.id} onClick={() => goTab(item.id)} className={`min-h-14 shrink-0 border-b-2 px-3 text-sm transition ${tab === item.id ? "border-brand font-bold text-ink" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}><span className="mr-1 text-[10px] text-neutral-300">{index + 1}</span><span className="hidden 2xl:inline">{item.label}</span><span className="2xl:hidden">{item.short}</span></button>)}</nav>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-5 sm:p-7"><ProjectForms tab={tab} document={document} totals={totals} clients={clients} update={update} setDocument={setDocument} saveClient={saveClient} selectClient={(id) => { const client = clients.find((item) => item.id === id); if (client) update("client", client); }} newClient={() => update("client", emptyClient())} deleteClient={deleteClient} onPrint={() => window.print()} />
          <div className="mt-8 flex justify-between border-t border-neutral-200 pt-5">{(() => { const index = tabs.findIndex((item) => item.id === tab); return <><button disabled={index === 0} onClick={() => goTab(tabs[index - 1].id)} className="min-h-11 px-3 text-sm font-semibold text-neutral-500 disabled:opacity-30">← 戻る</button><button disabled={index === tabs.length - 1} onClick={() => goTab(tabs[index + 1].id)} className="min-h-11 rounded-xl bg-ink px-5 text-sm font-bold text-white disabled:opacity-30">次へ →</button></>; })()}</div>
        </div>
      </section>
      <section className={`${mobilePane === "preview" ? "flex" : "hidden"} preview-pane min-w-0 flex-1 flex-col bg-neutral-100 lg:flex`}>
        <nav className="no-print scrollbar-thin flex shrink-0 overflow-x-auto border-b border-neutral-200 bg-neutral-100 px-3 pt-2">{documentTabs.map((item) => <button key={item.id} onClick={() => setDocumentKind(item.id)} className={`min-h-11 shrink-0 rounded-t-xl border-t-2 px-4 text-sm font-semibold ${documentKind === item.id ? "border-brand bg-white text-ink" : "border-transparent text-neutral-400"}`}>{item.label}</button>)}</nav>
        <div className="doc-viewport scrollbar-thin flex-1 overflow-auto p-4 sm:p-7"><div className="flex min-w-max justify-center"><DocumentPreview kind={documentKind} document={document} totals={totals} /></div></div>
      </section>
    </div>
  </main>;
}
