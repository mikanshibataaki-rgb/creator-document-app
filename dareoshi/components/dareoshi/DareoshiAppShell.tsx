"use client";

import { useEffect, useState } from "react";
import { defaultData, LEGACY_STORAGE_KEY, normalizeData, STORAGE_KEY } from "./data";
import { ArticleScreen, DiagnosisResultScreen, DiagnosisScreen, ForecastScreen, GoalScreen, GuidesScreen, HomeScreen, OnboardingScreen, ProfileScreen, RoadScreen, SearchScreen, SuspiciousScreen } from "./screens";
import type { DareoshiData, GuideArticle, PlayerProfile, SavingsGoal, Screen } from "./types";

export function DareoshiAppShell() {
  const [data, setData] = useState<DareoshiData>(defaultData);
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [history, setHistory] = useState<Screen[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      const restored = current ? normalizeData(JSON.parse(current)) : legacy ? normalizeData(JSON.parse(legacy)) : defaultData;
      setData(restored);
      setScreen(restored.profile.onboardingDone ? "home" : "onboarding");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  const navigate = (next: Screen) => {
    setHistory((current) => [...current.slice(-8), screen]);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = (fallback: Screen = "home") => {
    const previous = history.at(-1) ?? fallback;
    setHistory(history.slice(0, -1));
    setScreen(previous);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateProfile = (patch: Partial<PlayerProfile>) => setData((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  const updateGoal = (patch: Partial<SavingsGoal>) => setData((current) => ({ ...current, goal: { ...current.goal, ...patch } }));
  const updateForecastActual = (id: string, amount?: number) => setData((current) => {
    const nextActuals = { ...current.forecastActuals };
    if (amount && Number.isFinite(amount) && amount > 0) nextActuals[id] = amount;
    else delete nextActuals[id];
    return { ...current, forecastActuals: nextActuals };
  });
  const selectArticle = (article: GuideArticle) => { setSelectedArticle(article); navigate("article"); };
  const finishDiagnosis = () => { updateProfile({ onboardingDone: true }); navigate("diagnosisResult"); };
  const deleteData = () => { localStorage.removeItem(STORAGE_KEY); setData(defaultData); setHistory([]); setSelectedArticle(null); setScreen("onboarding"); };

  if (!loaded) return <main className="grid min-h-screen place-items-center bg-cream"><div className="h-10 w-10 animate-pulse rounded-full border-4 border-coral border-r-transparent" aria-label="ロード中" /></main>;

  const page = (() => {
    switch (screen) {
      case "onboarding": return <OnboardingScreen onStart={() => navigate("diagnosis")} />;
      case "diagnosis": return <DiagnosisScreen profile={data.profile} updateProfile={updateProfile} onBack={() => back("onboarding")} onFinish={finishDiagnosis} />;
      case "diagnosisResult": return <DiagnosisResultScreen data={data} navigate={navigate} />;
      case "home": return <HomeScreen data={data} navigate={navigate} />;
      case "search": return <SearchScreen navigate={navigate} onArticle={selectArticle} />;
      case "forecast": return <ForecastScreen data={data} navigate={navigate} onActualChange={updateForecastActual} />;
      case "road": return <RoadScreen profile={data.profile} onBack={() => back("forecast")} />;
      case "goal": return <GoalScreen goal={data.goal} profile={data.profile} updateGoal={updateGoal} onBack={() => back()} />;
      case "guides": return <GuidesScreen navigate={navigate} onArticle={selectArticle} />;
      case "article": return selectedArticle ? <ArticleScreen article={selectedArticle} onBack={() => back("guides")} /> : <GuidesScreen navigate={navigate} onArticle={selectArticle} />;
      case "suspicious": return <SuspiciousScreen checked={data.suspiciousChecks} onChange={(suspiciousChecks) => setData((current) => ({ ...current, suspiciousChecks }))} onBack={() => back()} />;
      case "profile": return <ProfileScreen data={data} navigate={navigate} onRestart={() => navigate("diagnosis")} onDelete={deleteData} />;
    }
  })();

  return <main className="mx-auto min-h-[100dvh] w-full max-w-[480px] overflow-hidden bg-cream shadow-[0_0_64px_rgba(16,21,43,0.18)]">{page}</main>;
}
