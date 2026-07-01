"use client";

import { useState, type ReactNode } from "react";
import { BETA_NOTICE, guides, monthlySaving, roadEvents, takeHomeEstimate, warnDangerousPhrases, yen } from "./data";
import type { AmountConfidence, ArticleCategory, DareoshiData, GuideArticle, OfficialLink, PlayerProfile, RiskLevel, SavingsGoal, Screen } from "./types";
import { BottomNav, OptionGrid, PopButton, PopCard, PopIcon, PopMeter, PopTag, PopToggle, PopTopBar } from "./ui";

type Navigate = (screen: Screen) => void;

type ForecastCard = {
  id: string;
  title: string;
  category: string;
  icon: string;
  detail: string;
  timing: string;
  estimate: string;
  deadline: string;
  caution: string;
  reason: string;
  actionItems: string[];
  sourceTitle: string;
  sourceUrl: string;
  officialLinks: OfficialLink[];
  lastUpdatedAt: string;
  lastCheckedAt: string;
  riskLevel: RiskLevel;
  amountConfidence: AmountConfidence;
  trust: "目安" | "要確認" | "公式確認推奨";
  tone: string;
  prep: number;
};

type AttentionItem = {
  id: string;
  name: string;
  plain: string;
  amount: string;
  deadline: string;
  caution: string;
  icon: string;
  tone: string;
};

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="block">
      <span className="mb-2 block text-xs font-extrabold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-5 text-muted">{hint}</span>}
    </div>
  );
}

function AppScreen({ children, screen, navigate, withNav = true }: { children: ReactNode; screen: Screen; navigate: Navigate; withNav?: boolean }) {
  return (
    <section className={`min-h-[100dvh] bg-cream text-ink ${withNav ? "pb-24" : ""}`}>
      {children}
      {withNav && <BottomNav screen={screen} navigate={navigate} />}
    </section>
  );
}

function SectionTitle({ label, title, action }: { label: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">{label}</p>
        <h2 className="mt-1 font-rounded text-xl font-extrabold leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function BetaNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-3xl border border-slate/10 bg-white/85 shadow-card backdrop-blur-xl ${compact ? "px-4 py-3" : "p-4"}`}>
      <p className="text-[10px] font-black tracking-[0.2em] text-sky">BETA / 気づくためのメモ</p>
      <p className="mt-2 text-xs font-bold leading-6 text-ink/70">{BETA_NOTICE} 最後は公式情報でチェック。迷ったら専門家に確認してください。</p>
    </div>
  );
}

function riskNotice(level: RiskLevel) {
  const notices: Record<RiskLevel, string> = {
    low: "これは一般的な目安です。実際の費用や条件は状況によって変わります。",
    medium: "金額や期限は、契約内容・地域・時期によって変わる場合があります。実際の通知・契約書・見積書を確認してください。",
    high: "この内容は税金・保険・制度に関する一般情報です。条件によって結果が変わるため、最終判断は公式情報または専門家に確認してください。",
    critical: "この内容は個別判断が必要になる場合があります。だれおしでは最終判断を行いません。公式情報または専門家に確認してください。",
  };
  return notices[level];
}

function amountConfidenceLabel(confidence: AmountConfidence) {
  const labels: Record<AmountConfidence, string> = {
    fixed: "確定値",
    estimate: "目安",
    range: "幅のある目安",
    unknown: "条件により変動",
  };
  return labels[confidence];
}

function DateMeta({ lastUpdatedAt, lastCheckedAt }: { lastUpdatedAt: string; lastCheckedAt: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-muted">
      <div className="rounded-2xl bg-white/80 px-3 py-2">最終更新日：{lastUpdatedAt}</div>
      <div className="rounded-2xl bg-white/80 px-3 py-2">情報確認日：{lastCheckedAt}</div>
    </div>
  );
}

function OfficialLinksBox({ links }: { links: OfficialLink[] }) {
  return (
    <div className="mt-4 rounded-3xl border border-slate/10 bg-white/90 p-4 text-ink shadow-card">
      <h3 className="font-rounded text-base font-black">公式情報・確認先</h3>
      {links.length ? (
        <div className="mt-3 space-y-2">
          {links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="block rounded-2xl bg-slate/5 px-3 py-3 text-sm font-bold leading-6 underline decoration-2 underline-offset-4">
              {link.sourceName}：{link.title}
              <span className="mt-1 block text-xs text-muted no-underline">{link.purpose}</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs font-bold leading-6 text-muted">公式情報は今後追加予定です。内容は自治体・関係機関などで確認してください。</p>
      )}
    </div>
  );
}

function RiskNoticeCard({ level }: { level: RiskLevel }) {
  const tone = level === "critical" ? "bg-danger text-white" : level === "high" ? "bg-orange text-ink" : level === "medium" ? "bg-lemon text-ink" : "bg-sky text-ink";
  return (
    <div className={`mt-4 rounded-3xl p-4 shadow-card ${tone}`}>
      <p className="text-[10px] font-black tracking-[0.2em] opacity-75">最後は公式でチェック</p>
      <p className="mt-2 text-xs font-bold leading-6">{riskNotice(level)}</p>
    </div>
  );
}

function linksFromSources(article: GuideArticle): OfficialLink[] {
  if (article.officialLinks?.length) return article.officialLinks;
  return article.officialSources.map((source) => ({
    title: source.title,
    url: source.url,
    sourceName: source.publisher,
    purpose: `${source.publisher}で最新情報や条件を確認する`,
  }));
}

function articleRiskLevel(article: GuideArticle): RiskLevel {
  if (article.riskLevel) return article.riskLevel;
  if (["tax", "insurance", "investment", "law", "local"].includes(article.category)) return article.category === "investment" ? "critical" : "high";
  if (["home", "car"].includes(article.category)) return "medium";
  return "low";
}

function articleAmountConfidence(article: GuideArticle): AmountConfidence {
  if (article.amountConfidence) return article.amountConfidence;
  if (["tax", "insurance", "investment", "law", "local"].includes(article.category)) return "unknown";
  if (["home", "car"].includes(article.category)) return "range";
  return "estimate";
}

function categoryLabel(category: ArticleCategory) {
  const labels: Record<ArticleCategory, string> = {
    tax: "税金",
    insurance: "保険",
    home: "住まい",
    car: "車",
    work: "働き方",
    investment: "投資",
    ceremony: "冠婚葬祭",
    law: "法律・契約",
    consumer: "消費者トラブル",
    local: "地域",
    religion: "宗教・冠婚葬祭",
    election: "選挙・制度",
    life: "生活",
  };
  return labels[category];
}

function marginFromSavingsRange(range: string) {
  const values: Record<string, number> = {
    "0〜5万円": 28,
    "5〜15万円": 48,
    "15〜30万円": 68,
    "30万円以上": 84,
  };
  return values[range] ?? 50;
}

function forecastCards(profile: PlayerProfile): ForecastCard[] {
  const cards: ForecastCard[] = [
    {
      id: "resident-tax",
      title: profile.job === "会社員" ? "住民税の通知に注意" : "税金・保険の支払い確認",
      category: "税金",
      icon: "🧾",
      detail: profile.job === "会社員" ? "社会人2年目は、6月ごろから住民税で手取りが変わることがあります。" : "働き方によって、税金や保険の支払いタイミングが変わります。",
      timing: "今月〜来月",
      estimate: profile.job === "会社員" ? "数千円〜数万円/月" : "働き方で変動",
      deadline: "6月ごろ通知が多い",
      caution: "自治体・前年収入で変わります。通知書が届いたら金額を確認してください。",
      reason: `${profile.job}として働いているため、住民税や保険料の通知・給与明細確認が関係する可能性があります。`,
      actionItems: ["給与明細を見る", "自宅に届いた封筒を確認する", "分からなければ市区町村に確認する"],
      sourceTitle: "財務省：住民税について",
      sourceUrl: "https://www.mof.go.jp/tax_information/qanda020.html",
      officialLinks: [{ title: "住民税について", url: "https://www.mof.go.jp/tax_information/qanda020.html", sourceName: "財務省", purpose: "住民税と所得税の違い、基本的な仕組みを確認する" }],
      lastUpdatedAt: "2026-07-01",
      lastCheckedAt: "2026-06-27",
      riskLevel: "high",
      amountConfidence: "unknown",
      trust: "要確認",
      tone: "bg-lemon text-ink",
      prep: 72,
    },
    profile.hasCar
      ? {
          id: "car-cost",
          title: "車の維持費",
          category: "車",
          icon: "🚗",
          detail: "車検、自動車税、任意保険、駐車場代はまとまって来ると重くなります。",
          timing: "3か月以内",
          estimate: "年数万円〜数十万円",
          deadline: "5月・車検月",
          caution: "車種、契約、地域で大きく変わります。通知書と契約内容を確認してください。",
          reason: "車ありを選んでいるため、車検・税金・保険・駐車場代の確認が必要になりやすいです。",
          actionItems: ["車検月を確認する", "保険の更新月を見る", "駐車場代を毎月費に入れる"],
          sourceTitle: "国土交通省：自動車重量税額について",
          sourceUrl: "https://www.mlit.go.jp/jidosha/jidosha_fr1_000076.html",
          officialLinks: [{ title: "自動車重量税額について", url: "https://www.mlit.go.jp/jidosha/jidosha_fr1_000076.html", sourceName: "国土交通省", purpose: "車検時などに関係する重量税の情報を確認する" }],
          lastUpdatedAt: "2026-07-01",
          lastCheckedAt: "2026-06-27",
          riskLevel: "medium",
          amountConfidence: "range",
          trust: "公式確認推奨",
          tone: "bg-orange text-ink",
          prep: 58,
        }
      : {
          id: "subscription-phone",
          title: "サブスク・通信費",
          category: "固定費",
          icon: "📱",
          detail: "少額の固定費は、見直すだけで毎月の余白が戻ることがあります。",
          timing: "今月",
          estimate: "月数百円〜数万円",
          deadline: "毎月の引き落とし日",
          caution: "契約中のサービス一覧で、使っていないものを確認してください。",
          reason: "車なしの場合でも、毎月の固定費が出金の原因になりやすいため表示しています。",
          actionItems: ["契約中のサブスクを見る", "通信プランを確認する", "使っていない支払いを止める"],
          sourceTitle: "消費者庁：消費者ホットライン",
          sourceUrl: "https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/",
          officialLinks: [{ title: "消費者ホットライン", url: "https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/", sourceName: "消費者庁", purpose: "契約や支払いで困ったときの相談先を確認する" }],
          lastUpdatedAt: "2026-07-01",
          lastCheckedAt: "2026-06-27",
          riskLevel: "low",
          amountConfidence: "range",
          trust: "目安",
          tone: "bg-sky text-ink",
          prep: 64,
        },
    profile.sideHustle
      ? {
          id: "side-hustle-tax",
          title: "副業の税金準備",
          category: "税金",
          icon: "🧑‍💻",
          detail: "確定申告、住民税、予定納税の可能性があります。売上と経費を今から分けておくと安心です。",
          timing: "今年中",
          estimate: "利益・経費で変動",
          deadline: "2〜3月ごろ",
          caution: "所得税だけでなく住民税も確認してください。迷う場合は公式案内や専門家へ。",
          reason: "副業ありを選んでいるため、確定申告や住民税の確認が必要になる可能性があります。",
          actionItems: ["売上と経費を分けて記録する", "源泉徴収や支払調書を保存する", "国税庁の案内を確認する"],
          sourceTitle: "国税庁：給与所得者で確定申告が必要な人",
          sourceUrl: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm",
          officialLinks: [{ title: "給与所得者で確定申告が必要な人", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm", sourceName: "国税庁", purpose: "副業収入などで確定申告が関係するケースを確認する" }],
          lastUpdatedAt: "2026-07-01",
          lastCheckedAt: "2026-06-27",
          riskLevel: "high",
          amountConfidence: "unknown",
          trust: "公式確認推奨",
          tone: "bg-lavender text-ink",
          prep: 46,
        }
      : {
          id: profile.living === "一人暮らし" ? "rent-renewal" : "emergency-cost",
          title: profile.living === "一人暮らし" ? "住まいの更新・退去費" : "急な生活費",
          category: profile.living === "一人暮らし" ? "住まい" : "まさか費",
          icon: profile.living === "一人暮らし" ? "🏠" : "🛟",
          detail: profile.living === "一人暮らし" ? "更新料、火災保険、退去費用は忘れがちです。" : "医療費、スマホ故障、冠婚葬祭は急に来ることがあります。",
          timing: "3か月以内",
          estimate: profile.living === "一人暮らし" ? "家賃1か月分前後〜" : "1万円〜10万円台",
          deadline: profile.living === "一人暮らし" ? "契約更新月" : "急に発生",
          caution: profile.living === "一人暮らし" ? "契約書と管理会社の案内を確認してください。" : "実際の金額は状況で変わります。まずは予備費として見てください。",
          reason: profile.living === "一人暮らし" ? "一人暮らしを選んでいるため、賃貸更新や退去費用が関係しやすいです。" : "急な医療費や冠婚葬祭は、誰にでも起こる可能性があるため表示しています。",
          actionItems: profile.living === "一人暮らし" ? ["契約書を見る", "更新月を確認する", "退去時の条件を確認する"] : ["予備費を少し確保する", "保険証を確認する", "急な予定用の支払い枠を見ておく"],
          sourceTitle: profile.living === "一人暮らし" ? "国土交通省：原状回復ガイドライン" : "厚生労働省：高額療養費制度",
          sourceUrl: profile.living === "一人暮らし" ? "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk3_000021.html" : "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html",
          officialLinks: profile.living === "一人暮らし"
            ? [{ title: "原状回復をめぐるトラブルとガイドライン", url: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk3_000021.html", sourceName: "国土交通省", purpose: "退去費用や原状回復の考え方を確認する" }]
            : [{ title: "高額療養費制度を利用される皆さまへ", url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html", sourceName: "厚生労働省", purpose: "医療費が高額になった場合の制度を確認する" }],
          lastUpdatedAt: "2026-07-01",
          lastCheckedAt: "2026-06-27",
          riskLevel: profile.living === "一人暮らし" ? "medium" : "high",
          amountConfidence: "range",
          trust: "目安",
          tone: "bg-mint text-ink",
          prep: 55,
        },
  ];

  if (profile.investmentInterest) {
    cards.push({
      id: "investment-check",
      title: "投資の前に確認",
      category: "投資",
      icon: "🌱",
      detail: "NISAを始める前に、生活防衛費と怪しい誘いの見分け方を確認しましょう。",
      timing: "始める前",
      estimate: "金額より順番が大事",
      deadline: "口座開設・購入前",
      caution: "投資は元本割れがあります。生活費と分けて考えてください。",
      reason: "投資・NISAに興味ありを選んでいるため、始める前の確認として表示しています。",
      actionItems: ["生活防衛費を確認する", "元本割れの意味を確認する", "急かす勧誘は一度止まる"],
      sourceTitle: "金融庁：NISA特設ウェブサイト",
      sourceUrl: "https://www.fsa.go.jp/policy/nisa2/",
      officialLinks: [
        { title: "NISA特設ウェブサイト", url: "https://www.fsa.go.jp/policy/nisa2/", sourceName: "金融庁", purpose: "NISA制度の基本を確認する" },
        { title: "詐欺的な投資勧誘等にご注意ください", url: "https://www.fsa.go.jp/ordinary/chuui/attention.html", sourceName: "金融庁", purpose: "投資勧誘で注意したい点を確認する" },
      ],
      lastUpdatedAt: "2026-07-01",
      lastCheckedAt: "2026-06-27",
      riskLevel: "critical",
      amountConfidence: "unknown",
      trust: "要確認",
      tone: "bg-white text-ink",
      prep: 68,
    });
  }

  if (profile.city) {
    cards.push({
      id: "local-info",
      title: "地域のお知らせ枠",
      category: "地域",
      icon: "📍",
      detail: `${profile.prefecture}${profile.city}の制度も、今後ここに表示予定です。MVPでは実データ連携はありません。`,
      timing: "地域設定あり",
      estimate: "将来対応",
      deadline: "未対応",
      caution: "地域の制度・キャンペーンは、対象条件・期限・予算上限が変わる場合があります。申請前に自治体公式サイトで確認してください。",
      reason: "市区町村が入力されているため、将来の地域情報表示枠として表示しています。",
      actionItems: ["自治体公式サイトを確認する", "制度の期限と条件を見る", "申請前に最新情報を確認する"],
      sourceTitle: "総務省：地方公共団体",
      sourceUrl: "https://www.soumu.go.jp/",
      officialLinks: [{ title: "地方公共団体", url: "https://www.soumu.go.jp/", sourceName: "総務省", purpose: "自治体公式情報の入口を確認する" }],
      lastUpdatedAt: "2026-07-01",
      lastCheckedAt: "2026-06-27",
      riskLevel: "high",
      amountConfidence: "unknown",
      trust: "公式確認推奨",
      tone: "bg-white text-ink",
      prep: 40,
    });
  }

  warnDangerousPhrases("forecastCards", cards);
  return cards;
}

function diagnosisAttentionItems(profile: PlayerProfile): AttentionItem[] {
  const items: AttentionItem[] = [
    {
      id: "resident-tax",
      name: "住民税の確認",
      plain: "住民税の通知",
      amount: "数千円〜数万円/月",
      deadline: "6月ごろ",
      caution: "前年の収入と自治体で変わります。",
      icon: "🧾",
      tone: "bg-coral text-white",
    },
    profile.hasCar
      ? {
          id: "car-inspection",
          name: "車検・自動車税の確認",
          plain: "車検・自動車税・保険",
          amount: "年数万円〜数十万円",
          deadline: "車検月・5月ごろ",
          caution: "車種と契約で大きく変わります。",
          icon: "🚗",
          tone: "bg-orange text-ink",
        }
      : {
          id: "revolving-credit",
          name: "後払い・リボ払いの注意",
          plain: "後払い・カード手数料",
          amount: "使い方次第で増える",
          deadline: "毎月の支払日",
          caution: "支払い方法と手数料を確認してください。",
          icon: "💳",
          tone: "bg-sky text-ink",
        },
    profile.living === "一人暮らし"
      ? {
          id: "rent-renewal",
          name: "賃貸更新料の確認",
          plain: "賃貸更新・退去費",
          amount: "家賃1か月分前後〜",
          deadline: "契約更新月",
          caution: "契約書と管理会社の案内を確認。",
          icon: "🏠",
          tone: "bg-lavender text-ink",
        }
      : {
          id: "move-out",
          name: "一人暮らし初期費用",
          plain: "敷金・礼金・家具家電",
          amount: "数十万円になることも",
          deadline: "引っ越し前",
          caution: "家賃だけで判断しないこと。",
          icon: "📦",
          tone: "bg-lavender text-ink",
        },
    profile.sideHustle
      ? {
          id: "tax-return",
          name: "副業の確定申告",
          plain: "副業の申告・住民税",
          amount: "利益・経費で変動",
          deadline: "2〜3月ごろ",
          caution: "売上と経費の記録を残してください。",
          icon: "🧾",
          tone: "bg-lemon text-ink",
        }
      : {
          id: "ceremony",
          name: "冠婚葬祭ラッシュ",
          plain: "ご祝儀・香典・移動費",
          amount: "1回1万円〜数万円",
          deadline: "急に発生",
          caution: "予備費として少し見ておくと安心です。",
          icon: "💌",
          tone: "bg-lemon text-ink",
        },
    profile.investmentInterest
      ? {
          id: "investment-scam",
          name: "怪しい投資話の注意",
          plain: "高利回り・紹介制の勧誘",
          amount: "損失リスクあり",
          deadline: "送金・契約前",
          caution: "強い利益を約束する話や、急かす話は一度止まりましょう。",
          icon: "🕵️",
          tone: "bg-mint text-ink",
        }
      : {
          id: "medical",
          name: "まさかの医療費",
          plain: "通院・入院・薬代",
          amount: "数千円〜数万円以上",
          deadline: "急に発生",
          caution: "保険証や使える制度を確認してください。",
          icon: "🏥",
          tone: "bg-mint text-ink",
        },
  ];

  return items.slice(0, 5);
}

function forecastStatus(card: ForecastCard, actuals: Record<string, number>) {
  return actuals[card.id] ? "確定入力済み" : card.trust;
}

function statusTone(status: string) {
  if (status === "確定入力済み") return "bg-mint text-ink";
  if (status === "公式確認推奨") return "bg-ink text-white";
  if (status === "要確認") return "bg-coral text-white";
  return "bg-white text-ink";
}

function TakeHomeMemo({ profile, compact = false }: { profile: PlayerProfile; compact?: boolean }) {
  const estimate = takeHomeEstimate(profile);
  if (!estimate.gross) {
    return (
      <PopCard className="bg-white text-ink">
        <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">TAKE HOME</p>
        <h2 className="mt-2 font-rounded text-xl font-extrabold">ざっくり手取りメモ</h2>
        <p className="mt-2 text-sm leading-6 text-muted">額面月収を入れると、税金や保険で引かれる目安を表示できます。</p>
      </PopCard>
    );
  }

  return (
    <PopCard className={`${compact ? "bg-white" : "bg-sky"} text-ink`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">TAKE HOME</p>
          <h2 className="mt-2 font-rounded text-xl font-extrabold">ざっくり手取りメモ</h2>
        </div>
        <span className="rounded-full border-2 border-ink bg-lemon px-3 py-1 text-xs font-extrabold">目安</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-md border-2 border-ink bg-white/80 p-3">
          <p className="text-[11px] font-extrabold text-muted">額面月収</p>
          <p className="mt-1 font-number text-lg font-bold">{yen(estimate.gross)}</p>
        </div>
        <div className="rounded-md border-2 border-ink bg-white/80 p-3">
          <p className="text-[11px] font-extrabold text-muted">手取り目安</p>
          <p className="mt-1 font-number text-lg font-bold">{yen(estimate.takeHome)}</p>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-white/75 p-3">
        <div className="flex items-center justify-between text-sm font-extrabold">
          <span>税金・保険などで引かれる目安</span>
          <span>{yen(estimate.deduction)}</span>
        </div>
        <div className="mt-3 h-3 rounded-full border-2 border-ink bg-white p-[2px]">
          <div className="h-full rounded-full bg-coral" style={{ width: `${Math.min(60, Math.max(8, estimate.deductionRate * 2))}%` }} />
        </div>
        <p className="mt-2 text-xs font-bold leading-5 text-muted">だいたい{estimate.deductionRate}%前後として見た概算です。{estimate.note}</p>
      </div>
    </PopCard>
  );
}

function ForecastDisclaimer() {
  return (
    <PopCard className="bg-white text-ink">
      <div className="flex gap-3">
        <PopIcon name="shield" className="h-6 w-6 shrink-0 text-coral" />
        <div>
          <p className="font-rounded font-extrabold">出金予報は、天気予報のような目安です。</p>
          <p className="mt-2 text-xs font-bold leading-6 text-muted">実際の税額・保険料・制度の条件は、勤務先・契約内容・自治体・年度で変わります。支払い前や申請前は、公式情報で確認してください。</p>
        </div>
      </div>
    </PopCard>
  );
}

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);
  const stories = [
    {
      label: "START",
      title: "来月、何でお金が減るか知ってる？",
      text: "だれおしは家計簿ではなく、あなたの未来の出金予報アプリ。大人になると急に来る請求を、その前に知らせます。",
      sticker: "未来の出金予報",
      tone: "bg-mint",
    },
    {
      label: "YOUR LIFE",
      title: "全部じゃなく、関係あることだけ。",
      text: "車がある人には車の維持費。副業ありなら税金。一人暮らしなら更新料や退去費用。必要な情報だけに絞ります。",
      sticker: "ログインなし",
      tone: "bg-sky",
    },
    {
      label: "SAFE FIRST",
      title: "買うな、ではなく。好きなものを守る。",
      text: "名前・番地・口座・カード・マイナンバーは取りません。入力した情報は、この端末のブラウザ内に保存されます。",
      sticker: "口座連携なし",
      tone: "bg-lemon",
    },
  ];
  const story = stories[step];
  const last = step === stories.length - 1;

  return (
    <AppScreen screen="onboarding" navigate={() => undefined} withNav={false}>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden px-5 pb-7 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,21,43,0.06)_1px,transparent_1px),linear-gradient(rgba(16,21,43,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        <div className="relative flex items-center justify-between">
          <p className="font-rounded text-lg font-extrabold">だれおし</p>
          <button type="button" onClick={onStart} className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_#10152B]">SKIP</button>
        </div>
        <div className="relative mt-5 flex gap-2">
          {stories.map((_, index) => (
            <span key={index} className="h-2 flex-1 rounded-full bg-white/80">
              <span className={`block h-full rounded-full bg-coral transition-all ${index <= step ? "w-full" : "w-0"}`} />
            </span>
          ))}
        </div>
        <div key={story.label} className="screen-enter relative flex flex-1 flex-col">
          <div className="mt-8">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">{story.label}</p>
            <h1 className="mt-4 font-rounded text-[2.35rem] font-extrabold leading-[1.18]">{story.title}</h1>
            <p className="mt-5 text-[15px] font-medium leading-7 text-ink/72">{story.text}</p>
          </div>
          <div className="relative mt-8 h-72">
            <div className="absolute left-0 top-4 w-[78%] -rotate-2 rounded-lg border-2 border-ink bg-white p-5 shadow-sticker">
              <p className="text-[10px] font-extrabold tracking-[0.18em] text-muted">THIS MONTH</p>
              <p className="mt-3 font-rounded text-2xl font-extrabold">大人になると、急に請求が来る。</p>
              <p className="mt-3 text-sm leading-6 text-muted">だれおしは、その前に教える。</p>
            </div>
            <div className={`absolute bottom-8 right-0 grid h-28 w-28 rotate-6 place-items-center rounded-full border-2 border-ink ${story.tone} p-4 text-center font-rounded text-lg font-extrabold shadow-sticker`}>
              {story.sticker}
            </div>
            <div className="absolute bottom-0 left-6 rounded-lg border-2 border-ink bg-lavender px-4 py-3 text-[10px] font-extrabold tracking-[0.12em] shadow-[3px_3px_0_#10152B]">NO BANK LINK</div>
          </div>
          <div className="mt-auto pt-8">
            <div className="mb-4">
              <BetaNotice compact />
            </div>
            {last ? (
              <PopButton onClick={onStart}>わたし診断をはじめる <PopIcon name="chevron" /></PopButton>
            ) : (
              <PopButton onClick={() => setStep((value) => value + 1)}>次へ <PopIcon name="chevron" /></PopButton>
            )}
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

export function DiagnosisScreen({ profile, updateProfile, onBack, onFinish }: { profile: PlayerProfile; updateProfile: (patch: Partial<PlayerProfile>) => void; onBack: () => void; onFinish: () => void }) {
  const [step, setStep] = useState(1);
  const labels = ["基本", "お金", "暮らし", "地域"];
  const next = () => (step === 4 ? onFinish() : setStep((current) => current + 1));

  return (
    <AppScreen screen="diagnosis" navigate={() => undefined} withNav={false}>
      <PopTopBar title={`わたし診断 / ${labels[step - 1]}`} onBack={step === 1 ? onBack : () => setStep((current) => current - 1)} />
      <div className="px-5 py-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((item) => <span key={item} className={`h-2 flex-1 rounded-full ${item <= step ? "bg-coral" : "bg-white"}`} />)}
        </div>
        <p className="mt-3 text-[10px] font-extrabold tracking-[0.18em] text-muted">STEP {step}/4</p>
        {step === 1 && (
          <div className="mt-8">
            <PopTag tone="bg-lavender text-ink">あなたの基本</PopTag>
            <h2 className="mt-5 font-rounded text-2xl font-extrabold">まずは、ざっくりで大丈夫。</h2>
            <p className="mt-3 text-sm leading-6 text-muted">正確な個人情報は使いません。レンジで入力できます。</p>
            <div className="mt-7 space-y-6">
              <Field label="年齢レンジ">
                <select aria-label="年齢レンジ" value={profile.ageRange} onChange={(event) => updateProfile({ ageRange: event.target.value })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 font-bold outline-none">
                  {["18〜20歳", "21〜23歳", "24〜26歳", "27〜29歳"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="働き方">
                <OptionGrid options={["会社員", "学生", "フリーター", "個人活動中"]} value={profile.job} onChange={(job) => updateProfile({ job })} />
              </Field>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="mt-8">
            <PopTag tone="bg-lemon text-ink">お金まわり</PopTag>
            <h2 className="mt-5 font-rounded text-2xl font-extrabold">年収も貯金も、レンジでOK。</h2>
            <div className="mt-7 space-y-5">
              <Field label="年収レンジ">
                <select aria-label="年収レンジ" value={profile.incomeRange} onChange={(event) => updateProfile({ incomeRange: event.target.value })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 font-bold outline-none">
                  {["200万円未満", "200〜299万円", "300〜399万円", "400〜499万円", "500万円以上"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="ざっくり額面月収" hint="手取りの目安にだけ使います。正確な給与額でなくても問題ありません。">
                <div className="relative">
                  <input aria-label="ざっくり額面月収" type="number" min="0" step="1000" value={profile.grossMonthlyIncome} onChange={(event) => updateProfile({ grossMonthlyIncome: Number(event.target.value) })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 pr-12 text-right font-number font-bold outline-none" />
                  <span className="absolute right-4 top-4 text-xs font-extrabold text-ink">円</span>
                </div>
              </Field>
              <TakeHomeMemo profile={profile} compact />
              <Field label="貯金レンジ" hint="正確な金額ではなく、備えの目安として使います。">
                <select aria-label="貯金レンジ" value={profile.savingsRange} onChange={(event) => updateProfile({ savingsRange: event.target.value })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 font-bold outline-none">
                  {["0〜5万円", "5〜15万円", "15〜30万円", "30万円以上"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </Field>
              <PopToggle checked={profile.sideHustle} onChange={(sideHustle) => updateProfile({ sideHustle })} label="副業あり" />
              <PopToggle checked={profile.investmentInterest} onChange={(investmentInterest) => updateProfile({ investmentInterest })} label="投資・NISAに興味あり" />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="mt-8">
            <PopTag tone="bg-mint text-ink">暮らし</PopTag>
            <h2 className="mt-5 font-rounded text-2xl font-extrabold">関係ありそうな出費を絞ります。</h2>
            <div className="mt-7 space-y-5">
              <Field label="住まい">
                <OptionGrid options={["実家暮らし", "一人暮らし", "同居・同棲", "その他"]} value={profile.living} onChange={(living) => updateProfile({ living })} />
              </Field>
              <PopToggle checked={profile.hasCar} onChange={(hasCar) => updateProfile({ hasCar })} label="車あり" />
              <PopToggle checked={profile.retirementPlan} onChange={(retirementPlan) => updateProfile({ retirementPlan })} label="近いうちに退職・転職の予定あり" />
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="mt-8">
            <PopTag tone="bg-sky text-ink">地域</PopTag>
            <h2 className="mt-5 font-rounded text-2xl font-extrabold">地域情報も、必要なら表示します。</h2>
            <p className="mt-3 text-sm leading-6 text-muted">都道府県・市区町村まで。番地は入力しません。</p>
            <div className="mt-7 space-y-5">
              <Field label="都道府県">
                <input aria-label="都道府県" value={profile.prefecture} onChange={(event) => updateProfile({ prefecture: event.target.value })} placeholder="例：岐阜県" className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 font-bold outline-none placeholder:text-muted" />
              </Field>
              <Field label="市区町村">
                <input aria-label="市区町村" value={profile.city} onChange={(event) => updateProfile({ city: event.target.value })} placeholder="例：岐阜市" className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 font-bold outline-none placeholder:text-muted" />
              </Field>
              <p className="rounded-lg border-2 border-ink bg-white p-4 text-sm font-medium leading-6 shadow-[2px_2px_0_#10152B]">名前・番地・勤務先・マイナンバー・銀行口座・クレジットカード・証券口座は取得しません。入力内容は、この端末のブラウザだけに保存されます。</p>
            </div>
          </div>
        )}
        <div className="mt-10">
          <PopButton onClick={next}>{step === 4 ? "ホームを見る" : "次へ"} <PopIcon name="chevron" /></PopButton>
        </div>
      </div>
    </AppScreen>
  );
}

export function DiagnosisResultScreen({ data, navigate }: { data: DareoshiData; navigate: Navigate }) {
  const attentionItems = diagnosisAttentionItems(data.profile);

  return (
    <AppScreen screen="diagnosisResult" navigate={navigate} withNav={false}>
      <div className="min-h-[100dvh] px-5 pb-7 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="rounded-lg border-2 border-ink bg-ink p-5 text-white shadow-sticker">
          <p className="text-[10px] font-extrabold tracking-[0.18em] text-mint">YOUR FORECAST</p>
          <h1 className="mt-4 font-rounded text-3xl font-extrabold leading-tight">今年あなたに関係ありそうなお金と手続きです。</h1>
          <p className="mt-4 text-sm font-medium leading-7 text-white/75">金額はまだ目安です。あとで実際の金額を入れると、予報カードが自分専用に育ちます。</p>
        </div>

        <div className="mt-5">
          <TakeHomeMemo profile={data.profile} />
        </div>

        <div className="mt-5">
          <BetaNotice compact />
        </div>

        <div className="mt-6 space-y-4">
          {attentionItems.map((item, index) => (
            <PopCard key={item.id} className={`${item.tone} ${index % 2 ? "rotate-1" : "-rotate-1"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold tracking-[0.18em] opacity-75">注意 {index + 1}</p>
                  <h2 className="mt-2 font-rounded text-xl font-extrabold">{item.name}</h2>
                  <p className="mt-1 text-sm font-bold opacity-80">{item.plain}</p>
                </div>
                <span className="text-4xl">{item.icon}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border-2 border-ink bg-white/80 p-3 text-ink">
                  <p className="text-[11px] font-extrabold text-muted">目安</p>
                  <p className="mt-1 text-sm font-extrabold">{item.amount}</p>
                </div>
                <div className="rounded-md border-2 border-ink bg-white/80 p-3 text-ink">
                  <p className="text-[11px] font-extrabold text-muted">時期</p>
                  <p className="mt-1 text-sm font-extrabold">{item.deadline}</p>
                </div>
              </div>
              <div className="mt-3">
                <DateMeta lastUpdatedAt="2026-07-01" lastCheckedAt="2026-06-27" />
              </div>
              <p className="mt-3 rounded-md bg-white/75 p-3 text-xs font-bold leading-5 text-ink">{item.caution}</p>
            </PopCard>
          ))}
        </div>

        <div className="mt-7 space-y-3">
          <PopButton onClick={() => navigate("home")}>ホームで予報を見る <PopIcon name="chevron" /></PopButton>
          <button type="button" onClick={() => navigate("forecast")} className="w-full rounded-lg border-2 border-ink bg-white px-5 py-4 font-rounded font-extrabold text-ink shadow-[3px_3px_0_#10152B]">出金予報で答え合わせする</button>
        </div>
      </div>
    </AppScreen>
  );
}

export function HomeScreen({ data, navigate }: { data: DareoshiData; navigate: Navigate }) {
  const cards = forecastCards(data.profile);
  const main = cards[0];
  const monthly = monthlySaving(data.goal);
  const statuses = cards.map((card) => forecastStatus(card, data.forecastActuals));
  const stats = [
    { label: "今月の要確認", value: statuses.filter((status) => status === "要確認").length, tone: "bg-lemon" },
    { label: "公式確認推奨", value: statuses.filter((status) => status === "公式確認推奨").length, tone: "bg-orange" },
    { label: "確認済み", value: statuses.filter((status) => status === "確定入力済み").length, tone: "bg-mint" },
    { label: "今後注意", value: cards.length, tone: "bg-sky" },
  ];
  const categories = [
    { icon: "🧾", label: "お金・税金", desc: "住民税、確定申告、控除", count: guides.filter((guide) => guide.category === "tax").length, screen: "guides" as Screen },
    { icon: "🏠", label: "住まい", desc: "一人暮らし、更新、退去費", count: guides.filter((guide) => guide.category === "home").length, screen: "guides" as Screen },
    { icon: "🚗", label: "車・交通", desc: "車検、税金、保険", count: guides.filter((guide) => guide.category === "car").length, screen: "forecast" as Screen },
    { icon: "💼", label: "仕事・副業", desc: "副業、退職後の手続き", count: cards.filter((card) => card.category.includes("税金")).length, screen: "forecast" as Screen },
    { icon: "🌱", label: "投資・NISA", desc: "始める前の確認", count: guides.filter((guide) => guide.category === "investment").length, screen: "guides" as Screen },
    { icon: "🏥", label: "保険・医療", desc: "入院、医療費、保険", count: guides.filter((guide) => guide.category === "life").length, screen: "guides" as Screen },
    { icon: "💌", label: "冠婚葬祭", desc: "急な予定と出費", count: 1, screen: "forecast" as Screen },
    { icon: "📍", label: "地域情報", desc: "今後対応予定の地域枠", count: data.profile.city ? 1 : 0, screen: "profile" as Screen },
    { icon: "🕵️", label: "怪しい誘い", desc: "送金・契約前のチェック", count: 1, screen: "suspicious" as Screen },
  ];
  const picks = ["リボ払い", "NISA", "住民税", "退職後の国保", "車検", "マルチ商法", "副業詐欺", "スマホ分割"];

  return (
    <AppScreen screen="home" navigate={navigate}>
      <header className="relative overflow-hidden border-b border-slate/10 bg-white px-5 pb-7 pt-[max(1.4rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] bg-[size:18px_18px] opacity-[0.10]" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-sky/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] text-sky">誰も教えてくれなかったのに</p>
            <h1 className="mt-3 font-rounded text-[2.6rem] font-black leading-[1.02] tracking-[-0.08em]">あなたのお金と手続きの現在地</h1>
            <p className="mt-4 text-sm font-medium leading-7 text-muted">だれおしは、答えを断定するのではなく、確認しておくと安心な情報に気づくための生活防衛ポータルです。</p>
          </div>
          <button type="button" aria-label="わたしを開く" onClick={() => navigate("profile")} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white shadow-card">
            <PopIcon name="user" />
          </button>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-2">
          {[data.profile.job, data.profile.living, data.profile.hasCar ? "車あり" : "車なし"].map((item) => (
            <span key={item} className="rounded-full bg-slate/5 px-2 py-2 text-center text-xs font-black text-ink">{item}</span>
          ))}
        </div>
      </header>

      <div className="space-y-7 px-5 py-6">
        <BetaNotice compact />

        <section>
          <SectionTitle label="STATUS" title="いまの確認状況" action={<button type="button" onClick={() => navigate("forecast")} className="text-sm font-extrabold text-coral">出金予報へ</button>} />
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-3xl p-4 shadow-card ${stat.tone} text-ink`}>
                <p className="text-[11px] font-black text-ink/65">{stat.label}</p>
                <p className="mt-2 font-number text-4xl font-black tracking-[-0.06em]">{stat.value}</p>
                <p className="mt-1 text-[11px] font-bold text-ink/60">件</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle label="TODAY" title="今日のだれおし" action={<button type="button" onClick={() => navigate("forecast")} className="text-sm font-extrabold text-coral">詳しく見る</button>} />
          <PopCard onClick={() => navigate("forecast")} className="bg-ink text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <PopTag tone="bg-white text-ink">{main.timing}</PopTag>
                  <PopTag tone={statusTone(forecastStatus(main, data.forecastActuals))}>{forecastStatus(main, data.forecastActuals)}</PopTag>
                </div>
                <h2 className="mt-4 font-rounded text-2xl font-extrabold leading-tight">{main.title}</h2>
              </div>
              <span className="text-5xl">{main.icon}</span>
            </div>
            <p className="mt-4 text-sm font-medium leading-6">{main.detail}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="rounded-2xl bg-white/10 p-3">目安：{main.estimate}</div>
              <div className="rounded-2xl bg-white/10 p-3">時期：{main.deadline}</div>
            </div>
            <p className="mt-4 text-xs font-bold leading-6 text-white/70">これは気づくためのメモです。条件によって変わるため、公式情報も確認してください。</p>
          </PopCard>
        </section>

        <section>
          <SectionTitle label="CATEGORY" title="カテゴリから探す" />
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <PopCard key={category.label} onClick={() => navigate(category.screen)} className="bg-white text-ink">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="rounded-full bg-slate/5 px-2 py-1 text-[11px] font-black text-muted">{category.count}件</span>
                </div>
                <p className="mt-3 font-rounded text-base font-black leading-5">{category.label}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-muted">{category.desc}</p>
              </PopCard>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle label="FORECAST" title="近いうちに来そうな出費" action={<button type="button" onClick={() => navigate("road")} className="text-sm font-extrabold text-coral">年間を見る</button>} />
          <div className="space-y-3">
            {cards.slice(1, 4).map((card) => (
              <PopCard key={card.title} onClick={() => navigate("forecast")} className="bg-white text-ink">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-ink bg-cream text-2xl">{card.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-extrabold text-coral">{card.timing}</span>
                      <span className="text-xs font-extrabold text-muted">/{forecastStatus(card, data.forecastActuals)}</span>
                    </div>
                    <p className="mt-1 font-rounded font-extrabold">{card.title}</p>
                  </div>
                  <PopIcon name="chevron" className="h-5 w-5 shrink-0" />
                </div>
              </PopCard>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle label="PICK UP" title="SNSで話題になりやすいお金の落とし穴" />
          <PopCard className="bg-white text-ink">
            <div className="flex flex-wrap gap-2">
              {picks.map((pick) => <span key={pick} className="rounded-full bg-slate/5 px-3 py-2 text-xs font-black text-ink">{pick}</span>)}
            </div>
            <p className="mt-4 rounded-2xl bg-lemon/80 p-3 text-xs font-bold leading-6 text-ink">編集部ピックアップ・サンプル表示です。今後、話題度データに対応予定です。</p>
          </PopCard>
        </section>

        <section>
          <SectionTitle label="TAKE HOME" title="額面と手取り、どれくらい違う？" />
          <TakeHomeMemo profile={data.profile} compact />
        </section>

        <section>
          <SectionTitle label="MY PLAN" title="好きなものを守る準備" />
          <div className="grid grid-cols-2 gap-3">
            <PopCard onClick={() => navigate("goal")} className="bg-sky text-ink">
              <span className="text-3xl">🎯</span>
              <p className="mt-4 font-rounded text-lg font-extrabold leading-6">ほしいもの計画</p>
              <p className="mt-2 font-number text-xl font-bold">{yen(monthly)}</p>
              <p className="mt-1 text-xs font-bold text-ink/65">毎月の目安</p>
            </PopCard>
            <PopCard onClick={() => navigate("suspicious")} className="bg-mint text-ink">
              <span className="text-3xl">🕵️</span>
              <p className="mt-4 font-rounded text-lg font-extrabold leading-6">SNSで見た怪しい話チェック</p>
              <p className="mt-2 text-xs font-bold text-ink/65">送金や契約の前に、気軽に確認</p>
            </PopCard>
          </div>
        </section>

        {data.profile.city && (
          <PopCard onClick={() => navigate("profile")} className="bg-lemon text-ink">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📍</span>
              <div>
                <p className="text-xs font-extrabold text-coral">{data.profile.prefecture} {data.profile.city}</p>
                <p className="mt-1 font-rounded font-extrabold">地域情報は今後対応予定</p>
                <p className="mt-1 text-xs leading-5 text-ink/70">あなたの地域の制度も、今後ここに表示予定です。地域の制度・キャンペーンは、対象条件・期限・予算上限が変わる場合があります。申請前に自治体公式サイトで確認してください。</p>
              </div>
            </div>
          </PopCard>
        )}

        <section>
          <SectionTitle label="GUIDE" title="今日の1枚メモ" action={<button type="button" onClick={() => navigate("guides")} className="text-sm font-extrabold text-coral">もっと見る</button>} />
          <PopCard onClick={() => navigate("guides")} className="bg-white text-ink">
            <div className="flex gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-lg border-2 border-ink bg-coral text-2xl">🧾</span>
              <div>
                <p className="text-xs font-extrabold text-coral">税金 / 3分</p>
                <p className="mt-1 font-rounded font-extrabold leading-6">社会人2年目、手取りが減るって本当？</p>
                <p className="mt-1 text-xs leading-5 text-muted">住民税の仕組みを、先に知っておこう。</p>
              </div>
            </div>
          </PopCard>
        </section>
      </div>
    </AppScreen>
  );
}

export function ForecastScreen({ data, navigate, onActualChange }: { data: DareoshiData; navigate: Navigate; onActualChange: (id: string, amount?: number) => void }) {
  const cards = forecastCards(data.profile);
  return (
    <AppScreen screen="forecast" navigate={navigate}>
      <PopTopBar title="今月の出金予報" action={<button type="button" onClick={() => navigate("road")} className="text-sm font-extrabold text-coral">年間</button>} />
      <div className="px-5 py-6">
        <PopCard className="bg-white text-ink">
          <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">FORECAST</p>
          <h2 className="mt-3 font-rounded text-2xl font-extrabold">予報と確定を、混ぜない。</h2>
          <p className="mt-2 text-sm leading-6 text-muted">目安は準備用。実際の金額が分かったら入力すると、次回から「確定入力済み」として残ります。</p>
        </PopCard>
        <div className="mt-4">
          <ForecastDisclaimer />
        </div>
        <div className="mt-6 space-y-4">
          {cards.map((card) => (
            <PopCard key={card.id} className={card.tone}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <PopTag tone="bg-white text-ink">{card.timing}</PopTag>
                    <PopTag tone={statusTone(forecastStatus(card, data.forecastActuals))}>{forecastStatus(card, data.forecastActuals)}</PopTag>
                  </div>
                  <h2 className="mt-3 font-rounded text-xl font-extrabold">{card.title}</h2>
                  <p className="mt-1 text-xs font-extrabold text-ink/60">{card.category}</p>
                </div>
                <span className="text-4xl">{card.icon}</span>
              </div>
              <p className="mt-3 text-sm font-medium leading-6">{card.detail}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border-2 border-ink bg-white/80 p-3 text-ink">
                  <p className="text-[11px] font-extrabold text-muted">目安金額</p>
                  <p className="mt-1 text-sm font-extrabold">{card.estimate}</p>
                  <p className="mt-1 text-[11px] font-bold text-muted">金額の見方：{amountConfidenceLabel(card.amountConfidence)}</p>
                </div>
                <div className="rounded-md border-2 border-ink bg-white/80 p-3 text-ink">
                  <p className="text-[11px] font-extrabold text-muted">期限・時期</p>
                  <p className="mt-1 text-sm font-extrabold">{card.deadline}</p>
                </div>
              </div>
              <div className="mt-3">
                <DateMeta lastUpdatedAt={card.lastUpdatedAt} lastCheckedAt={card.lastCheckedAt} />
              </div>
              <div className="mt-3 rounded-md bg-white/75 p-3 text-xs font-bold leading-5 text-ink">
                <p className="text-muted">あなたに関係ありそうな理由</p>
                <p className="mt-1">{card.reason}</p>
              </div>
              <div className="mt-3 rounded-md bg-white/75 p-3 text-xs font-bold leading-5 text-ink">
                <p className="text-muted">今やること</p>
                <ul className="mt-2 space-y-1">
                  {card.actionItems.map((item) => <li key={item}>□ {item}</li>)}
                </ul>
              </div>
              <p className="mt-3 rounded-md bg-white/75 p-3 text-xs font-bold leading-5 text-ink">{card.caution}</p>
              <div className="mt-4 rounded-lg border-2 border-ink bg-white p-3 text-ink">
                <label className="block">
                  <span className="text-xs font-extrabold text-muted">実際はいくらだった？</span>
                  <div className="relative mt-2">
                    <input
                      aria-label={`${card.title}の実際の金額`}
                      type="number"
                      min="0"
                      value={data.forecastActuals[card.id] ?? ""}
                      onChange={(event) => onActualChange(card.id, event.target.value ? Number(event.target.value) : undefined)}
                      placeholder="例：12000"
                      className="w-full rounded-md border-2 border-ink bg-cream px-3 py-3 pr-10 text-right font-number font-bold outline-none"
                    />
                    <span className="absolute right-3 top-3 text-xs font-extrabold">円</span>
                  </div>
                </label>
                {data.forecastActuals[card.id] && <p className="mt-2 text-xs font-extrabold text-coral">確定入力済み：{yen(data.forecastActuals[card.id])}</p>}
              </div>
              <div className="mt-4">
                <PopMeter value={card.prep} label="準備のしやすさ" tone="bg-ink" />
              </div>
              <RiskNoticeCard level={card.riskLevel} />
              <OfficialLinksBox links={card.officialLinks} />
            </PopCard>
          ))}
        </div>
        <PopButton onClick={() => navigate("road")} className="mt-7">年間出金ロードを見る <PopIcon name="flag" /></PopButton>
      </div>
    </AppScreen>
  );
}

export function RoadScreen({ profile, onBack }: { profile: PlayerProfile; onBack: () => void }) {
  return (
    <AppScreen screen="road" navigate={() => undefined} withNav={false}>
      <PopTopBar title="年間出金ロード" onBack={onBack} />
      <div className="px-5 py-6">
        <PopCard className="relative overflow-hidden bg-ink text-white">
          <span className="absolute -right-6 -top-7 text-8xl opacity-15">🗓️</span>
          <div className="relative">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-mint">ANNUAL FORECAST</p>
            <h2 className="mt-3 font-rounded text-3xl font-extrabold leading-tight">年間出金ロード</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">1月〜12月に発生しやすいお金と手続きを、時系列で先に確認できます。</p>
          </div>
        </PopCard>
        <div className="relative mt-8 space-y-4 before:absolute before:bottom-4 before:left-6 before:top-4 before:w-1 before:rounded-full before:bg-ink">
          {roadEvents.map((event, index) => {
            const hiddenByProfile = event.month === "5月" && !profile.hasCar;
            return (
              <div key={event.month} className={`relative pl-14 ${hiddenByProfile ? "opacity-45" : ""}`}>
                <span className={`absolute left-[14px] top-5 z-10 grid h-6 w-6 place-items-center rounded-full border-2 border-ink ${index % 3 === 0 ? "bg-coral" : index % 3 === 1 ? "bg-lemon" : "bg-mint"}`}>
                  <span className="h-2 w-2 rounded-full bg-ink" />
                </span>
                <PopCard className={`${event.tone} ${index % 2 ? "rotate-1" : "-rotate-1"} relative overflow-hidden`}>
                  <span className="absolute -right-3 -top-4 text-6xl opacity-20">{event.icon}</span>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border-2 border-ink bg-white text-2xl">{event.icon}</span>
                    <div>
                      <p className="text-[10px] font-extrabold tracking-[0.18em]">{event.month}</p>
                      <p className="mt-1 font-rounded font-extrabold">{event.title}</p>
                      <p className="mt-1 text-xs opacity-75">{event.sub}</p>
                    </div>
                  </div>
                </PopCard>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-muted">制度や支払時期は地域・契約内容で異なります。公式案内も確認してください。</p>
      </div>
    </AppScreen>
  );
}

export function GoalScreen({ goal, profile, updateGoal, onBack }: { goal: SavingsGoal; profile: PlayerProfile; updateGoal: (patch: Partial<SavingsGoal>) => void; onBack: () => void }) {
  const monthly = monthlySaving(goal);
  const margin = marginFromSavingsRange(profile.savingsRange);
  return (
    <AppScreen screen="goal" navigate={() => undefined} withNav={false}>
      <PopTopBar title="ほしいもの計画" onBack={onBack} />
      <div className="px-5 py-6">
        <PopCard className="relative overflow-hidden bg-sky text-ink">
          <span className="absolute -right-5 -top-6 text-8xl opacity-20">🎁</span>
          <div className="relative">
            <PopTag tone="bg-white text-ink">MY PLAN</PopTag>
            <h2 className="mt-4 font-rounded text-2xl font-extrabold">欲しいものを、安心して買うために。</h2>
            <p className="mt-3 text-sm leading-6">買うな、ではなく。買える時期と毎月の目安を見ます。</p>
          </div>
        </PopCard>
        <div className="mt-6 space-y-5">
          <Field label="ほしいもの">
            <input aria-label="ほしいもの" value={goal.name} onChange={(event) => updateGoal({ name: event.target.value })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 font-bold outline-none" />
          </Field>
          <Field label="目標金額">
            <div className="relative">
              <input aria-label="目標金額" type="number" min="0" value={goal.amount} onChange={(event) => updateGoal({ amount: Number(event.target.value) })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 pr-12 text-right font-number font-bold outline-none" />
              <span className="absolute right-4 top-4 text-xs font-extrabold text-ink">円</span>
            </div>
          </Field>
          <Field label="いつまでに">
            <div className="relative">
              <input aria-label="いつまでに" type="number" min="1" value={goal.months} onChange={(event) => updateGoal({ months: Math.max(1, Number(event.target.value)) })} className="w-full rounded-lg border-2 border-ink bg-white px-4 py-4 pr-16 text-right font-number font-bold outline-none" />
              <span className="absolute right-4 top-4 text-xs font-extrabold text-ink">か月</span>
            </div>
          </Field>
        </div>
        <PopCard className="mt-6 bg-lemon text-ink">
          <p className="text-[10px] font-extrabold tracking-[0.18em]">毎月の目安</p>
          <p className="mt-3 font-number text-4xl font-bold">{yen(monthly)}</p>
          <p className="mt-2 text-sm font-medium">{yen(goal.amount)} ÷ {goal.months}か月</p>
          <div className="mt-5">
            <PopMeter value={margin} label="今月の余裕メーター" tone="bg-mint" />
          </div>
          <p className="mt-3 text-xs font-bold leading-5 text-ink/65">貯金レンジから見たざっくり目安です。実際の収入・固定費で変わります。</p>
        </PopCard>
        {profile.hasCar && (
          <PopCard className="mt-4 bg-orange text-ink">
            <div className="flex gap-3">
              <span className="text-3xl">🚗</span>
              <p className="text-sm font-medium leading-6">車を買う場合は、購入後も税金・任意保険・車検・駐車場の維持費があります。</p>
            </div>
          </PopCard>
        )}
      </div>
    </AppScreen>
  );
}

export function GuidesScreen({ onArticle, navigate }: { onArticle: (article: GuideArticle) => void; navigate: Navigate }) {
  const [category, setCategory] = useState<ArticleCategory | "all">("all");
  const options: { value: ArticleCategory | "all"; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "tax", label: "税金" },
    { value: "home", label: "住まい" },
    { value: "car", label: "車" },
    { value: "life", label: "生活" },
    { value: "investment", label: "投資" },
  ];
  const visible = category === "all" ? guides : guides.filter((guide) => guide.category === category);

  return (
    <AppScreen screen="guides" navigate={navigate}>
      <PopTopBar title="だれおしガイド" />
      <div className="px-5 py-6">
        <PopCard className="bg-mint text-ink">
          <p className="text-[10px] font-extrabold tracking-[0.18em]">GUIDE</p>
          <h2 className="mt-3 font-rounded text-2xl font-extrabold">知らなかったことを、短く読む。</h2>
          <p className="mt-3 text-sm leading-6">お金と手続きの話を、専門用語少なめでまとめています。</p>
        </PopCard>
        <div className="soft-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {options.map((option) => (
            <button key={option.value} type="button" onClick={() => setCategory(option.value)} className={`shrink-0 rounded-full border-2 border-ink px-3 py-2 text-xs font-extrabold ${category === option.value ? "bg-lemon text-ink shadow-[2px_2px_0_#10152B]" : "bg-white text-ink"}`}>{option.label}</button>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          {visible.map((guide) => (
            <PopCard key={guide.id} onClick={() => onArticle(guide)} className={`text-ink ${guide.tone}`}>
              <div className="flex gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white text-3xl">{guide.icon}</span>
                <div>
                  <p className="text-xs font-extrabold text-ink/70">{categoryLabel(guide.category)} / {guide.minutes}</p>
                  <p className="mt-2 font-rounded font-extrabold leading-6">{guide.title}</p>
                  <p className="mt-2 text-xs leading-5 text-ink/70">{guide.summary3Lines[0]}</p>
                </div>
              </div>
            </PopCard>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}

export function SearchScreen({ navigate, onArticle }: { navigate: Navigate; onArticle: (article: GuideArticle) => void }) {
  const [query, setQuery] = useState("");
  const results = guides.filter((guide) => `${guide.title}${categoryLabel(guide.category)}${guide.summary3Lines.join("")}`.includes(query));
  const shortcuts: { icon: string; label: string; screen: Screen }[] = [
    { icon: "🧾", label: "税金", screen: "guides" },
    { icon: "🚗", label: "車", screen: "forecast" },
    { icon: "🏠", label: "一人暮らし", screen: "guides" },
    { icon: "📍", label: "地域", screen: "profile" },
  ];

  return (
    <AppScreen screen="search" navigate={navigate}>
      <PopTopBar title="さがす" />
      <div className="px-5 py-6">
        <div className="rounded-lg border-2 border-ink bg-white p-1 shadow-sticker">
          <div className="flex items-center gap-2 rounded-md bg-cream px-3 py-3 text-ink">
            <PopIcon name="search" className="h-5 w-5" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="税金、車検、入院…" className="min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-muted" />
          </div>
        </div>
        {!query && (
          <div className="mt-7">
            <SectionTitle label="POPULAR" title="よく見るテーマ" />
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((item) => (
                <PopCard key={item.label} onClick={() => navigate(item.screen)} className="bg-white text-ink">
                  <span className="text-3xl">{item.icon}</span>
                  <p className="mt-4 font-rounded font-extrabold">{item.label}</p>
                </PopCard>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 space-y-3">
          {results.map((guide) => (
            <PopCard key={guide.id} onClick={() => onArticle(guide)} className="bg-white text-ink">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{guide.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-coral">{categoryLabel(guide.category)}</p>
                  <p className="mt-1 font-rounded font-extrabold">{guide.title}</p>
                </div>
                <PopIcon name="chevron" />
              </div>
            </PopCard>
          ))}
        </div>
        {query && !results.length && <p className="py-12 text-center text-sm font-bold text-muted">見つかりませんでした</p>}
      </div>
    </AppScreen>
  );
}

export function ArticleScreen({ article, onBack }: { article: GuideArticle; onBack: () => void }) {
  return (
    <AppScreen screen="article" navigate={() => undefined} withNav={false}>
      <PopTopBar title="記事詳細" onBack={onBack} />
      <article className="px-5 py-6">
        <PopCard className={`relative overflow-hidden text-ink ${article.tone}`}>
          <span className="absolute -right-5 -bottom-7 text-9xl opacity-20">{article.icon}</span>
          <div className="relative">
            <PopTag tone="bg-white text-ink">{categoryLabel(article.category)}</PopTag>
            <h1 className="mt-5 font-rounded text-3xl font-extrabold leading-tight">{article.title}</h1>
            <p className="mt-4 text-base font-medium leading-8">{article.summary3Lines[0]}</p>
          </div>
        </PopCard>
        <div className="mt-4">
          <BetaNotice compact />
        </div>
        <div className="mt-6 space-y-4">
          <PopCard className="bg-white text-ink">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">01</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">これは何？</h2>
            <p className="mt-3 text-sm font-bold leading-7">{article.whatIsThis ?? article.easyExplanation}</p>
            <div className="mt-4 rounded-2xl bg-slate/5 p-3">
              <p className="text-[10px] font-black tracking-[0.18em] text-sky">まず3行で</p>
              <ul className="mt-2 space-y-2 text-sm font-bold leading-7">
                {article.summary3Lines.map((line) => <li key={line}>・{line}</li>)}
              </ul>
            </div>
          </PopCard>
          <PopCard className="bg-lemon text-ink">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">02</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">どんな人が関係ありそう？</h2>
            <ul className="mt-3 grid gap-2 text-sm font-bold">
              {article.relatedPeople.map((person) => <li key={person} className="rounded-md border-2 border-ink bg-cream px-3 py-2">・{person}</li>)}
            </ul>
          </PopCard>
          <PopCard className="bg-white text-ink">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">03</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">いつ気をつける？</h2>
            <p className="mt-3 text-sm font-bold leading-7">{article.timingText ?? `${categoryLabel(article.category)}に関係する通知・契約・支払いの前に確認しておくと安心です。`}</p>
          </PopCard>
          <PopCard className="bg-coral text-white">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">04</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">放置すると困ること</h2>
            <p className="mt-3 text-sm font-bold leading-7">{article.riskIfIgnored}</p>
          </PopCard>
          <PopCard className="bg-mint text-ink">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">05</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">今やること</h2>
            <ul className="mt-3 space-y-2 text-sm font-bold">
              {article.actionItems.map((item) => <li key={item} className="rounded-md border-2 border-ink bg-white/75 px-3 py-2">□ {item}</li>)}
            </ul>
          </PopCard>
          <PopCard className="bg-sky text-ink">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">06</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">公式で確認すること</h2>
            <ul className="mt-3 space-y-2 text-sm font-bold">
              {(article.officialCheckItems ?? ["公式情報の対象条件", "期限や金額", "自分の状況に当てはまるか"]).map((item) => <li key={item} className="rounded-2xl bg-white/75 px-3 py-2">・{item}</li>)}
            </ul>
            <OfficialLinksBox links={linksFromSources(article)} />
            <div className="mt-4">
              <DateMeta lastUpdatedAt={article.lastUpdatedAt ?? "2026-07-01"} lastCheckedAt={article.lastCheckedAt} />
            </div>
            <div className="mt-3 rounded-2xl bg-white/75 p-3 text-xs font-bold text-muted">金額の見方：{amountConfidenceLabel(articleAmountConfidence(article))}</div>
            <RiskNoticeCard level={articleRiskLevel(article)} />
            <p className="mt-4 rounded-md bg-white/75 p-3 text-xs font-bold leading-6 text-muted">{article.disclaimer}</p>
          </PopCard>
          <PopCard className="bg-white text-ink">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">補足</p>
            <h2 className="mt-2 font-rounded text-xl font-extrabold">やさしく説明</h2>
            <p className="mt-3 text-sm font-bold leading-7">{article.easyExplanation}</p>
          </PopCard>
        </div>
      </article>
    </AppScreen>
  );
}

const suspiciousSignals = [
  ["強い利益を約束された", "投資は増えるとは限りません。"],
  ["月利10%など、強すぎる数字が出た", "高い利益を急に約束する話は要注意です。"],
  ["LINEグループに招待された", "閉じた場所で急かされていないか確認。"],
  ["友達紹介で報酬が出る", "紹介が主目的の仕組みかもしれません。"],
  ["最初にお金を払う必要がある", "支払う前に、契約や会社情報を確認。"],
  ["今すぐ決めてと言われた", "考える時間をくれない誘いは一度止まろう。"],
];

export function SuspiciousScreen({ checked, onChange, onBack }: { checked: string[]; onChange: (values: string[]) => void; onBack: () => void }) {
  const risk = checked.length === 0 ? { label: "まずは情報を確認", tone: "bg-sky", icon: "🔎" } : checked.length < 3 ? { label: "少し注意", tone: "bg-lemon", icon: "⚠️" } : { label: "危険な可能性があります", tone: "bg-danger text-white", icon: "🛑" };
  const toggle = (label: string) => onChange(checked.includes(label) ? checked.filter((item) => item !== label) : [...checked, label]);

  return (
    <AppScreen screen="suspicious" navigate={() => undefined} withNav={false}>
      <PopTopBar title="怪しい誘いチェック" onBack={onBack} />
      <div className="px-5 py-6">
        <PopCard className={`relative overflow-hidden text-ink ${risk.tone}`}>
          <span className="absolute -right-5 -top-7 text-8xl opacity-25">{risk.icon}</span>
          <div className="relative">
            <PopTag tone="bg-white text-ink">CHECK</PopTag>
            <h2 className="mt-4 font-rounded text-2xl font-extrabold">送金・契約の前に、一回止まる。</h2>
            <p className="mt-3 text-sm leading-6">当てはまるものを選ぶと、注意したいポイントが見えてきます。</p>
          </div>
        </PopCard>
        <div className="mt-6 space-y-3">
          {suspiciousSignals.map(([label, note]) => {
            const active = checked.includes(label);
            return (
              <button key={label} type="button" onClick={() => toggle(label)} className={`flex w-full items-start gap-3 rounded-lg border-2 border-ink p-4 text-left shadow-[2px_2px_0_#10152B] ${active ? "bg-coral text-white" : "bg-white text-ink"}`}>
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink ${active ? "bg-lemon text-ink" : "bg-cream text-transparent"}`}><PopIcon name="check" className="h-4 w-4" /></span>
                <span>
                  <span className="block font-bold">{label}</span>
                  <span className={`mt-1 block text-xs leading-5 ${active ? "text-white/80" : "text-muted"}`}>{note}</span>
                </span>
              </button>
            );
          })}
        </div>
        <PopCard className={`mt-6 ${risk.tone}`}>
          <div className="flex gap-3">
            <span className="text-3xl">{risk.icon}</span>
            <div>
              <p className="font-rounded font-extrabold">{risk.label}</p>
              <p className="mt-2 text-sm leading-6">{checked.length >= 3 ? "いったん止まりましょう。契約・送金の前に、家族や消費生活センター、消費者ホットライン188など第三者へ相談してみてください。" : "断定はしません。気になる項目があれば、送金や契約の前に確認する時間を取りましょう。相談先に迷ったら消費者ホットライン188も使えます。"}</p>
            </div>
          </div>
        </PopCard>
      </div>
    </AppScreen>
  );
}

export function ProfileScreen({ data, onRestart, onDelete, navigate }: { data: DareoshiData; onRestart: () => void; onDelete: () => void; navigate: Navigate }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <AppScreen screen="profile" navigate={navigate}>
      <PopTopBar title="わたし / データ管理" />
      <div className="px-5 py-6">
        <PopCard className="relative overflow-hidden bg-lavender text-ink">
          <span className="absolute -right-6 -top-7 text-8xl opacity-20">🙂</span>
          <div className="relative flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-lg border-2 border-ink bg-lemon text-3xl">私</span>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em]">MY INFO</p>
              <p className="mt-2 font-rounded text-xl font-extrabold">{data.profile.ageRange}・{data.profile.job}</p>
              <p className="mt-1 text-xs">{data.profile.living} / {data.profile.incomeRange}</p>
            </div>
          </div>
        </PopCard>
        <div className="mt-6 space-y-4">
          <BetaNotice compact />
          <PopCard onClick={onRestart} className="bg-white text-ink">
            <div className="flex items-center gap-3">
              <PopIcon name="user" className="h-6 w-6 text-coral" />
              <div className="flex-1">
                <p className="font-rounded font-extrabold">わたしの状況を編集</p>
                <p className="mt-1 text-xs text-muted">働き方・住まい・地域を更新</p>
              </div>
              <PopIcon name="chevron" />
            </div>
          </PopCard>
          <PopCard className="bg-white text-ink">
            <div className="flex gap-3">
              <PopIcon name="shield" className="h-6 w-6 shrink-0 text-sky" />
              <div>
                <p className="font-rounded font-extrabold">情報の取り扱いについて</p>
                <div className="mt-3 space-y-2 text-xs font-bold leading-6 text-muted">
                  <p>だれおしは、あなたに関係ありそうなお金・手続きに気づくためのベータ版アプリです。</p>
                  <p>表示内容は一般的な情報・目安であり、個別の税務・法律・制度判断を行うものではありません。</p>
                  <p>制度や金額は変更される場合があります。最終判断は、公式情報または専門家に確認してください。</p>
                  <p>現在はベータ版として改善中です。正式監修済みのような表現は使いません。</p>
                </div>
              </div>
            </div>
          </PopCard>
          <PopCard className="bg-mint text-ink">
            <div className="flex gap-3">
              <PopIcon name="save" className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-rounded font-extrabold">データはこの端末に保存されます</p>
                <p className="mt-2 text-xs leading-6">ログインなし。入力内容はサーバーではなく、このブラウザ内に保存されます。</p>
              </div>
            </div>
          </PopCard>
          <PopCard className="bg-white text-ink">
            <h2 className="font-rounded font-extrabold">取らない情報</h2>
            <div className="mt-3 space-y-2 text-sm font-bold">
              <p>名前・番地・勤務先は取りません。</p>
              <p>銀行口座・クレジットカード・証券口座は取りません。</p>
              <p>マイナンバーは取りません。</p>
            </div>
          </PopCard>
          <PopCard className="bg-lemon text-ink">
            <div className="flex gap-3">
              <PopIcon name="trash" className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-rounded font-extrabold">いつでも削除できます</p>
                <p className="mt-2 text-xs leading-6">下のボタンから、診断内容・目標・チェック結果をまとめて削除できます。</p>
              </div>
            </div>
          </PopCard>
          <div className="pt-3">
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-coral">DATA DELETE</p>
            {!confirming ? (
              <button type="button" onClick={() => setConfirming(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-danger bg-white px-4 py-4 font-bold text-danger">
                <PopIcon name="trash" />すべてのデータを削除
              </button>
            ) : (
              <PopCard className="mt-3 bg-danger text-white">
                <p className="font-rounded font-extrabold">本当に削除しますか？</p>
                <p className="mt-2 text-xs leading-5">診断内容、目標、チェック内容は元に戻せません。</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setConfirming(false)} className="rounded-lg border-2 border-ink bg-white px-3 py-3 font-bold text-ink">やめる</button>
                  <button type="button" onClick={onDelete} className="rounded-lg border-2 border-ink bg-lemon px-3 py-3 font-bold text-ink">削除する</button>
                </div>
              </PopCard>
            )}
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
