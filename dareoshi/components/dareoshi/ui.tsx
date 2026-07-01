"use client";

import type { ReactNode } from "react";
import type { Screen } from "./types";

type IconName =
  | "home"
  | "search"
  | "forecast"
  | "guide"
  | "user"
  | "back"
  | "chevron"
  | "shield"
  | "target"
  | "map"
  | "save"
  | "trash"
  | "spark"
  | "flag"
  | "check"
  | "warning";

export function PopIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>,
    forecast: <><rect x="4" y="5" width="16" height="15" rx="1" /><path d="M8 3v4M16 3v4M4 10h16M8 15l2 2 5-5" /></>,
    guide: <><path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3z" /><path d="M8 4v13a3 3 0 0 0-3 3" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    back: <><path d="m14 18-6-6 6-6" /><path d="M8 12h11" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    shield: <><path d="M12 3 5 6v6c0 4.7 3.1 7.7 7 9 3.9-1.3 7-4.3 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>,
    save: <><path d="M5 3h12l3 3v15H4V4z" /><path d="M7 3v6h9V3M8 21v-7h8v7" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>,
    spark: <><path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    flag: <><path d="M6 21V4" /><path d="M7 5c4-3 6 3 11 0v9c-5 3-7-3-11 0" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    warning: <><path d="M12 3 2 21h20z" /><path d="M12 9v5M12 18h.01" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">{paths[name]}</svg>;
}

export function PopCard({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const classes = `rounded-lg border-2 border-ink/90 bg-cream p-4 shadow-sticker ${className}`;
  return onClick ? <button type="button" onClick={onClick} className={`${classes} w-full text-left transition active:translate-x-1 active:translate-y-1 active:shadow-none`}>{children}</button> : <div className={classes}>{children}</div>;
}

export function PopButton({ children, onClick, className = "", type = "button" }: { children: ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-mint px-5 py-3 font-rounded text-base font-extrabold text-ink shadow-sticker transition active:translate-x-1 active:translate-y-1 active:shadow-none ${className}`}>{children}</button>;
}

export function PopTag({ children, tone = "bg-lemon text-ink" }: { children: ReactNode; tone?: string }) {
  return <span className={`inline-flex rounded-full border-2 border-ink px-2 py-1 text-[10px] font-extrabold tracking-[0.12em] ${tone}`}>{children}</span>;
}

export function PopMeter({ value, label = "準備度", tone = "bg-mint" }: { value: number; label?: string; tone?: string }) {
  return <div><div className="mb-1 flex items-center justify-between text-[11px] font-bold text-ink"><span>{label}</span><span>{value}/100</span></div><div className="h-3 rounded-full border-2 border-ink bg-white p-[2px]"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} /></div></div>;
}

export function PopTopBar({ title, onBack, action }: { title: string; onBack?: () => void; action?: ReactNode }) {
  return <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b-2 border-ink bg-cream px-4 py-3 shadow-[0_2px_0_#58D7FF]"><div className="flex min-w-0 items-center gap-3">{onBack && <button type="button" onClick={onBack} aria-label="戻る" className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-lemon shadow-[2px_2px_0_#10152B]"><PopIcon name="back" /></button>}<h1 className="truncate font-rounded text-base font-extrabold leading-5 text-ink">{title}</h1></div>{action ?? <span className="w-9" />}</header>;
}

export function OptionGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="grid grid-cols-2 gap-2">{options.map((option) => <button type="button" key={option} onClick={() => onChange(option)} className={`min-h-12 rounded-lg border-2 border-ink px-2 text-sm font-bold text-ink ${value === option ? "bg-mint shadow-[2px_2px_0_#10152B]" : "bg-white"}`}>{option}</button>)}</div>;
}

export function PopToggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (next: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-lg border-2 border-ink bg-white p-3 text-left shadow-[2px_2px_0_#10152B]"><span className="font-bold text-ink">{label}</span><span className={`grid h-7 w-7 place-items-center rounded-md border-2 border-ink ${checked ? "bg-mint" : "bg-cream"}`}>{checked && <PopIcon name="check" className="h-5 w-5" />}</span></button>;
}

export function BottomNav({ screen, navigate }: { screen: Screen; navigate: (screen: Screen) => void }) {
  const tabs: { screen: Screen; label: string; icon: IconName }[] = [
    { screen: "home", label: "ホーム", icon: "home" },
    { screen: "search", label: "さがす", icon: "search" },
    { screen: "forecast", label: "予報", icon: "forecast" },
    { screen: "guides", label: "ガイド", icon: "guide" },
    { screen: "profile", label: "わたし", icon: "user" },
  ];
  const activeMap: Partial<Record<Screen, Screen>> = { road: "forecast", goal: "home", article: "guides", suspicious: "home" };
  const active = activeMap[screen] ?? screen;
  return <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t-2 border-ink bg-cream px-1 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">{tabs.map((tab) => { const selected = active === tab.screen; return <button type="button" key={tab.screen} onClick={() => navigate(tab.screen)} className={`flex min-w-14 flex-col items-center gap-1 px-1 py-1 text-[11px] font-extrabold ${selected ? "text-ink" : "text-muted"}`}><span className={`grid h-7 w-8 place-items-center rounded-md ${selected ? "bg-mint text-ink shadow-[2px_2px_0_#10152B]" : ""}`}><PopIcon name={tab.icon} className="h-4 w-4" /></span>{tab.label}</button>; })}</nav>;
}
