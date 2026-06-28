import type { AiFollowupRule, CreatorRole, EstimateLine, HearingFieldGroup, InterviewGuideQuestion, NoteOption, RoleColorGroup, RoleTemplate, RoleTemplateLine } from "./types";

export const ROLE_COLOR_META: Record<RoleColorGroup, { label: string; color: string; soft: string; border: string }> = {
  videoAudio: { label: "Video & Audio", color: "#4a90e2", soft: "rgba(74,144,226,0.12)", border: "rgba(74,144,226,0.38)" },
  designVisual: { label: "Design & Visual", color: "#9b51e0", soft: "rgba(155,81,224,0.13)", border: "rgba(155,81,224,0.38)" },
  textMedia: { label: "Text & Media", color: "#27ae60", soft: "rgba(39,174,96,0.12)", border: "rgba(39,174,96,0.36)" },
  humanStage: { label: "Human & Stage", color: "#d97706", soft: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.38)" },
  streamLive: { label: "Stream & Live", color: "#f43f5e", soft: "rgba(244,63,94,0.13)", border: "rgba(244,63,94,0.40)" }
};

export const ROLE_COLOR_GROUPS: Record<CreatorRole, RoleColorGroup> = {
  "映像制作者": "videoAudio",
  "カメラマン": "videoAudio",
  "編集者": "videoAudio",
  "音楽制作者": "videoAudio",
  "ナレーター": "videoAudio",
  "デザイナー": "designVisual",
  "イラストレーター": "designVisual",
  "Web制作者": "designVisual",
  "ライター": "textMedia",
  "SNS運用者": "textMedia",
  "俳優・モデル": "humanStage",
  "ヘアメイク": "humanStage",
  "スタイリスト": "humanStage",
  "イベント制作者": "humanStage",
  "配信者": "streamLive"
};

export function getRoleColorMeta(role?: CreatorRole) {
  return ROLE_COLOR_META[role ? ROLE_COLOR_GROUPS[role] : "videoAudio"];
}

export function getPrimaryRoleColorMeta(roles: CreatorRole[]) {
  return getRoleColorMeta(roles[0]);
}

export const COMMON_NOTE_OPTIONS: NoteOption[] = [
  { id: "common-valid-30days", text: "本見積の有効期限は発行日より30日間です。" },
  { id: "common-additional-estimate", text: "仕様変更・追加作業が発生した場合は、別途お見積りいたします。" },
  { id: "common-payment-terms", text: "お支払い条件は記載の通りとします。" },
  { id: "common-transfer-fee", text: "振込手数料はご依頼者様のご負担にてお願いいたします。" },
  { id: "common-portfolio-check", text: "実績公開の可否は、別途確認のうえ取り扱います。" },
  { id: "common-supplied-rights", text: "支給素材に関する権利処理はご依頼者様にてお願いいたします。" }
];

const note = (role: CreatorRole, index: number, text: string): NoteOption => ({ id: `${role}-${index}`, text });
const guide = (category: string, question: string, reason: string, id = `${category}:${question}`): InterviewGuideQuestion => ({ id, category, question, reason });

export const COMMON_INTERVIEW_GUIDE: InterviewGuideQuestion[] = [
  guide("依頼の概要", "今回、何を作りたいですか？", "案件の中心を最初に合わせるため。"),
  guide("依頼の概要", "この案件で一番達成したいことは何ですか？", "見積や提案の優先順位を決めるため。"),
  guide("依頼の概要", "依頼の背景や、今困っていることはありますか？", "表面的な依頼だけでなく本当の課題を把握するため。"),
  guide("目的・ターゲット", "誰に向けた制作物ですか？", "表現、媒体、納品形式が変わるため。"),
  guide("目的・ターゲット", "見た人にどんな行動を取ってほしいですか？", "成果物のゴールを明確にするため。"),
  guide("成果物", "最終的に必要な成果物は何ですか？", "納品漏れと追加費用トラブルを防ぐため。"),
  guide("成果物", "参考にしたい作品や、避けたい雰囲気はありますか？", "認識違いを早めに減らすため。"),
  guide("使用媒体・使用期間", "どこで、どのくらいの期間使いますか？", "使用条件・権利条件・料金設計に関わるため。"),
  guide("使用媒体・使用期間", "二次利用や広告利用の予定はありますか？", "後日の追加利用トラブルを防ぐため。"),
  guide("スケジュール", "希望納期、公開日、初稿確認日は決まっていますか？", "逆算して作業量と特急対応の有無を判断するため。"),
  guide("予算", "希望予算と上限予算はありますか？", "提案範囲と見積の現実性を合わせるため。"),
  guide("予算", "相見積もりですか？", "提案の粒度とスピードを調整するため。"),
  guide("修正・追加対応", "修正回数や確認者の人数はどのくらいですか？", "修正増加による工数超過を防ぐため。"),
  guide("権利・実績公開", "実績・ポートフォリオ・SNS掲載は可能ですか？", "公開可否を後から揉めないようにするため。"),
  guide("精算・交通費", "交通費、駐車場代、材料費などは別途精算でよいですか？", "立替費用の未回収を防ぐため。"),
  guide("未確定事項", "まだ決まっていないこと、社内確認が必要なことはありますか？", "次回確認事項として残すため。")
];

const ROLE_INTERVIEW_GUIDE: Partial<Record<CreatorRole, InterviewGuideQuestion[]>> = {
  "ヘアメイク": [
    guide("ヘアメイク", "対応日はいつですか？", "スケジュールと拘束時間を確定するため。"),
    guide("ヘアメイク", "対応場所はどこですか？", "出張費・交通費・準備物が変わるため。"),
    guide("ヘアメイク", "集合時間と終了予定時間は何時ですか？", "早朝料金・延長料金の有無を判断するため。"),
    guide("ヘアメイク", "対象人数は何名ですか？", "基本料金と人数追加料金に関わるため。"),
    guide("ヘアメイク", "ヘアセット人数とメイク人数は何名ですか？", "必要人員と作業時間を見積もるため。"),
    guide("ヘアメイク", "撮影中のお直し対応は必要ですか？", "拘束範囲と追加費用を明確にするため。"),
    guide("ヘアメイク", "早朝対応や延長の可能性はありますか？", "当日の追加請求トラブルを防ぐため。"),
    guide("ヘアメイク", "控室、鏡、椅子、電源はありますか？", "現場で対応できない事態を避けるため。"),
    guide("ヘアメイク", "肌トラブルやアレルギーの確認は必要ですか？", "安全面と責任範囲を確認するため。"),
    guide("精算・交通費", "交通費・駐車場代は別途精算ですか？", "立替費用を明確にするため。"),
    guide("権利・実績公開", "作例・ポートフォリオ掲載は可能ですか？", "実績公開可否を事前に確認するため。")
  ],
  "カメラマン": [
    guide("カメラマン", "撮影ジャンルは何ですか？", "必要機材・人員・撮影時間が変わるため。"),
    guide("カメラマン", "撮影日・場所・時間は決まっていますか？", "拘束時間と交通費を見積もるため。"),
    guide("カメラマン", "納品枚数は何枚希望ですか？", "選定・現像・納品作業量を把握するため。"),
    guide("カメラマン", "レタッチは必要ですか？", "編集工数と納期が変わるため。"),
    guide("カメラマン", "RAW納品は必要ですか？", "納品条件と追加料金に関わるため。"),
    guide("使用媒体・使用期間", "使用媒体は何ですか？", "商用利用・広告利用の条件を決めるため。"),
    guide("使用媒体・使用期間", "商用利用・二次利用はありますか？", "使用範囲のトラブルを防ぐため。"),
    guide("権利・実績公開", "モデルリリースや撮影許可は誰が確認しますか？", "権利処理の責任範囲を明確にするため。"),
    guide("精算・交通費", "交通費・スタジオ費は別途精算ですか？", "実費精算の扱いを先に決めるため。"),
    guide("権利・実績公開", "作例・ポートフォリオ掲載は可能ですか？", "実績公開可否を事前に確認するため。")
  ],
  "映像制作者": [
    guide("映像制作者", "どんな動画を作りたいですか？", "成果物の方向性を最初に合わせるため。"),
    guide("映像制作者", "動画の目的は何ですか？", "構成・尺・媒体を決める軸になるため。"),
    guide("映像制作者", "動画尺と本数は決まっていますか？", "撮影・編集工数に直結するため。"),
    guide("映像制作者", "横動画・縦動画・ショート動画は必要ですか？", "納品形式と編集工数が変わるため。"),
    guide("映像制作者", "撮影は必要ですか？", "人員・機材・ロケ費を見積もるため。"),
    guide("映像制作者", "編集範囲はどこまでですか？", "編集費・MA・カラコレなどの範囲を決めるため。"),
    guide("映像制作者", "テロップ・BGM・ナレーションは必要ですか？", "外注費や権利処理の有無を確認するため。"),
    guide("修正・追加対応", "修正回数は何回想定ですか？", "修正トラブルを防ぐため。"),
    guide("成果物", "素材データやプロジェクトデータ納品は必要ですか？", "通常納品と別条件になることが多いため。"),
    guide("使用媒体・使用期間", "使用媒体・使用期間・二次利用はどうしますか？", "利用範囲と料金条件を決めるため。"),
    guide("権利・実績公開", "作例・ポートフォリオ掲載は可能ですか？", "実績公開可否を事前に確認するため。")
  ]
};

const ROLE_NOTE_OPTIONS: Partial<Record<CreatorRole, NoteOption[]>> = {
  "ヘアメイク": [
    note("ヘアメイク", 1, "対応人数・拘束時間が変更となる場合は、別途費用が発生する場合があります。"),
    note("ヘアメイク", 2, "早朝・深夜対応、延長対応は別途料金となります。"),
    note("ヘアメイク", 3, "交通費・駐車場代・出張費は別途精算となります。"),
    note("ヘアメイク", 4, "肌トラブル・アレルギー等がある場合は、事前にお知らせください。"),
    note("ヘアメイク", 5, "撮影中のお直し対応範囲は、事前確認内容に準じます。"),
    note("ヘアメイク", 6, "控室・鏡・椅子・電源等の準備が必要な場合があります。")
  ],
  "カメラマン": [
    note("カメラマン", 1, "撮影時間・納品枚数・レタッチ枚数が変更となる場合は、別途費用が発生します。"),
    note("カメラマン", 2, "RAWデータ納品は別途料金となります。"),
    note("カメラマン", 3, "商用利用・二次利用・広告利用は事前確認内容に準じます。"),
    note("カメラマン", 4, "モデルリリース・撮影許可はご依頼者様にてご確認ください。"),
    note("カメラマン", 5, "交通費・駐車場代・スタジオ費は別途精算となります。")
  ],
  "映像制作者": [
    note("映像制作者", 1, "修正回数を超える修正は別途費用となります。"),
    note("映像制作者", 2, "BGM・ナレーション・素材購入費が発生する場合は別途精算となります。"),
    note("映像制作者", 3, "撮影日数・編集範囲・納品形式の変更は別途お見積りとなります。"),
    note("映像制作者", 4, "素材データ・プロジェクトデータの納品は別途条件確認が必要です。"),
    note("映像制作者", 5, "使用媒体・使用期間・二次利用は事前確認内容に準じます。")
  ],
  "デザイナー": [
    note("デザイナー", 1, "修正回数を超える修正は別途費用となります。"),
    note("デザイナー", 2, "ai/psd等の元データ納品は別途条件確認が必要です。"),
    note("デザイナー", 3, "印刷費・入稿代行費は別途お見積りとなります。"),
    note("デザイナー", 4, "商標登録・二次利用・展開利用は別途条件確認が必要です。")
  ],
  "Web制作者": [
    note("Web制作者", 1, "サーバー費・ドメイン費・外部サービス利用料は別途ご負担となります。"),
    note("Web制作者", 2, "公開後の保守・更新作業は別途契約となります。"),
    note("Web制作者", 3, "仕様変更・機能追加は別途お見積りとなります。"),
    note("Web制作者", 4, "原稿・写真・ロゴ等の支給素材はご依頼者様にてご準備ください。")
  ]
};

export const COMMON_HEARING_GROUPS: HearingFieldGroup[] = [
  { title: "基本情報", fields: ["案件名", "会社名", "担当者", "電話番号", "メール", "URL"] },
  { title: "依頼内容", fields: ["何を作りたいか", "完成物のイメージ", "この案件で一番達成したいこと", "依頼背景", "成功の判断基準", "想定ターゲット", "ターゲットに取ってほしい行動", "参考作品", "競合", "好きな雰囲気", "避けたい表現", "必ず入れたい要素", "絶対に入れたくない要素"] },
  { title: "素材", fields: ["ロゴ支給", "写真支給", "動画支給", "原稿支給", "ブランドガイドライン", "支給素材一覧"] },
  { title: "スケジュール", fields: ["初回打ち合わせ日", "初稿希望日", "仮納品日", "最終納品日", "公開予定日", "急ぎ案件か", "夜間作業可否", "納期変更可能性"] },
  { title: "担当者", fields: ["窓口担当者", "確認者人数", "最終決裁者", "LINE利用可否", "Chatwork利用可否", "メール必須か"] },
  { title: "契約", fields: ["NDA必要", "契約書有無", "インボイス登録", "支払サイト", "源泉徴収", "前金割合", "キャンセル規定", "延期時の扱い"] },
  { title: "権利", fields: ["使用媒体", "使用期間", "二次利用", "著作権譲渡", "元データ納品", "AI学習利用可否", "実績公開可否"] },
  { title: "作例・ポートフォリオ", fields: ["制作者のポートフォリオ掲載可否", "SNS掲載可否", "HP掲載可否", "YouTube掲載可否", "営業資料への掲載可否", "コンテスト応募利用可否", "映画祭出品利用可否", "メイキング映像公開可否", "ビフォーアフター掲載可否", "公開可能時期", "クレジット表記方法", "匿名希望の有無"] },
  { title: "予算", fields: ["希望予算", "上限予算", "相見積もり有無", "支払い方法"] },
  { title: "リスク", fields: ["懸念事項", "未確定事項", "個人情報の扱い", "AI利用禁止", "実績公開禁止", "社内メモ"] }
];

export const ROLE_HEARING_GROUPS: Record<CreatorRole, HearingFieldGroup[]> = {
  "映像制作者": [
    { title: "撮影", fields: ["動画目的", "尺", "本数", "横動画", "縦動画", "正方形", "撮影日数", "ロケ地", "ロケハン", "控室", "駐車場", "電源", "発電機", "ドローン", "夜景撮影", "水辺撮影", "高所撮影", "雨天予備日"] },
    { title: "人員", fields: ["出演者", "ナレーター", "エキストラ", "ヘアメイク", "スタイリスト"] },
    { title: "編集", fields: ["テロップ", "BGM", "効果音", "MA", "カラコレ", "LUT", "CG", "VFX", "字幕", "サムネイル", "ショート動画切り抜き", "ティザー制作"] },
    { title: "データ", fields: ["プロジェクトデータ納品", "HDD返却", "バックアップ期間", "アーカイブ期間"] }
  ],
  "カメラマン": [{ title: "写真撮影", fields: ["撮影ジャンル", "撮影時間", "撮影人数", "カット数", "納品枚数", "レタッチ範囲", "RAW納品", "スタジオ手配", "背景紙", "小物", "ヘアメイク", "スタイリスト", "ストロボ", "自然光", "ドローン", "モノクロ納品", "アルバム制作", "プリント有無", "モデルリリース", "商用利用", "二次利用", "交通費精算"] }],
  "編集者": [{ title: "動画編集", fields: ["編集する動画本数", "素材尺", "完成尺", "構成作成", "カット編集", "テロップ量", "BGMの有無", "効果音", "カラー補正", "サムネイル制作", "ショート動画切り抜き", "修正回数", "プロジェクトデータ納品", "素材管理", "納品形式"] }],
  "デザイナー": [{ title: "デザイン", fields: ["制作物種類", "サイズ", "点数", "WEB", "印刷", "印刷会社指定", "ロゴ支給", "写真支給", "原稿支給", "ブランドガイドライン", "希望トーン", "NGデザイン", "ラフ案数", "修正回数", "AIデータ納品", "PSD納品", "商標登録予定", "ファビコン", "バナー制作", "SNS展開", "パッケージ展開"] }],
  "イラストレーター": [{ title: "イラスト", fields: ["用途", "点数", "サイズ", "カラー", "モノクロ", "背景有無", "キャラクター数", "表情差分", "ポーズ差分", "PSD納品", "Live2D利用", "VTuber利用", "グッズ化", "商用利用", "海外利用", "AI学習禁止", "NFT利用禁止"] }],
  "Web制作者": [{ title: "Web制作", fields: ["新規制作", "リニューアル", "ページ数", "必要機能", "問い合わせフォーム", "予約機能", "決済機能", "CMS", "ブログ", "SEO", "スマホ対応", "多言語対応", "会員機能", "管理画面", "LINE連携", "SSL", "GA4", "Search Console", "保守契約", "更新代行"] }],
  "ライター": [{ title: "ライティング", fields: ["記事種類", "本数", "文字数", "取材有無", "SEOキーワード", "トーン", "校正回数", "CMS入稿", "記名記事", "無記名記事", "ファクトチェック", "著作権", "二次利用"] }],
  "音楽制作者": [{ title: "音楽制作", fields: ["楽曲用途", "曲数", "秒数", "BPM", "曲調", "参考楽曲", "歌あり", "仮歌", "ミックス", "マスタリング", "ステム納品", "YouTube利用", "CM利用", "Spotify配信", "使用地域", "改変可否", "著作権管理"] }],
  "ナレーター": [{ title: "ナレーション", fields: ["原稿文字数", "秒数", "使用媒体", "使用期間", "宅録", "スタジオ収録", "声のトーン", "読み速度", "リテイク回数", "ファイル形式", "買取か使用許諾か", "クレジット表記", "実績公開可否"] }],
  "俳優・モデル": [{ title: "出演", fields: ["拘束時間", "出演媒体", "使用期間", "競合排他の有無", "衣装自前の有無", "ヘアメイク", "交通費", "二次利用", "肖像利用範囲", "実績公開可否"] }],
  "ヘアメイク": [{ title: "ヘアメイク対応条件", fields: ["対応日", "対応場所", "集合時間", "終了予定時間", "拘束時間", "対象人数", "ヘアセット人数", "メイク人数", "撮影／イベント内容", "衣装チェンジ有無", "撮影中の直し対応", "早朝対応", "延長対応", "出張費", "交通費", "駐車場", "控室・メイクスペース", "電源・鏡・椅子の有無", "アシスタント有無", "使用道具・消耗品", "肌トラブル・アレルギー確認", "キャンセル規定"] }],
  "スタイリスト": [{ title: "スタイリスト", fields: ["拘束時間", "人数", "衣装点数", "メイク人数", "ヘアセット人数", "出張費", "駐車場", "小道具準備", "衣装返却", "汚損破損時対応", "アシスタント有無", "延長料金", "早朝料金"] }],
  "配信者": [{ title: "配信", fields: ["配信内容", "配信時間", "出演人数", "配信媒体", "配信画質", "機材手配", "回線確認", "アーカイブ納品", "告知投稿", "切り抜き制作", "コメント管理", "二次利用"] }],
  "SNS運用者": [{ title: "SNS運用", fields: ["運用媒体", "投稿本数", "投稿頻度", "企画範囲", "撮影有無", "画像制作", "動画制作", "キャプション作成", "コメント対応", "レポート提出", "広告運用の有無", "KPI"] }],
  "イベント制作者": [{ title: "イベント制作", fields: ["イベント種別", "開催日", "会場", "想定人数", "進行台本", "スタッフ手配", "配信有無", "記録撮影", "備品手配", "受付対応", "安全管理", "雨天対応"] }]
};

const line = (name: string, category = "制作費", description = "", unitPrice = 0): RoleTemplateLine => ({ name, category, description, unitPrice, quantity: 1, unit: "式", tax: "税別" });
const withRole = (role: CreatorRole, lines: RoleTemplateLine[]) => lines.map((item) => ({ ...item, sourceRole: role }));

export const ROLE_TEMPLATES: Record<CreatorRole, RoleTemplate> = {
  "映像制作者": {
    hearingExample: "企業紹介ムービーを制作したい。採用サイトとSNSで使用予定。3分程度の本編と、縦型ショート動画を1本希望。撮影は2日間、編集、テロップ、BGM、カラコレまで含めたい。",
    projectExample: "採用サイトとSNSで使用する企業紹介ムービー制作。3分本編、縦型ショート、サムネイルまでを制作する。",
    estimateLines: withRole("映像制作者", ["企画構成費", "撮影費", "ディレクター費", "カメラマン費", "照明費", "録音費", "機材費", "編集費", "テロップ制作費", "カラコレ費", "BGM選曲費", "データ納品費"].map((name) => line(name, name.includes("撮影") || name.includes("機材") || name.includes("照明") || name.includes("録音") ? "制作人件費" : "編集費"))),
    invoiceLines: ["企業紹介ムービー制作費", "撮影費", "編集費", "追加修正費", "交通費精算"],
    deliveryText: "下記制作物を納品いたしました。\n本編動画、縦型ショート動画、サムネイル画像を指定形式にて納品いたします。",
    confirmText: "本案件は、映像制作に関する企画、撮影、編集、納品を行うものです。撮影日数、修正回数、使用媒体、素材データの取り扱いについて双方で確認します。",
    rightsText: "完成動画の使用媒体、使用期間、二次利用、素材データ・プロジェクトデータの納品有無、実績公開可否を本書で確認します。",
    deliverables: "本編動画、縦型ショート動画、サムネイル画像", format: "MP4 / JPG", deliveryMethod: "オンラインストレージ共有"
  },
  "カメラマン": {
    hearingExample: "プロフィール写真とWeb掲載用写真を撮影したい。撮影時間は3時間程度、納品枚数は30枚、うち10枚はレタッチ希望。SNSとホームページで使用予定。",
    projectExample: "プロフィール写真およびWeb掲載用写真の撮影。セレクト済み写真とレタッチ済み写真を納品する。",
    estimateLines: withRole("カメラマン", ["撮影費", "レタッチ費", "スタジオ費", "アシスタント費", "機材費", "交通費", "データ納品費", "追加カット費"].map((name) => line(name, name.includes("交通") ? "ロケ費" : "制作費"))),
    invoiceLines: ["写真撮影費", "レタッチ費", "スタジオ利用料", "交通費精算"],
    deliveryText: "下記写真データを納品いたしました。\nセレクト済み写真データおよびレタッチ済みデータを指定形式にて納品いたします。",
    confirmText: "本案件は、写真撮影および写真データ納品を行うものです。撮影時間、納品枚数、レタッチ範囲、使用媒体、実績公開可否について双方で確認します。",
    rightsText: "写真データの使用媒体、商用利用、二次利用、モデルリリース、実績公開可否を本書で確認します。",
    deliverables: "セレクト済み写真データ、レタッチ済み写真データ", format: "JPG / PNG", deliveryMethod: "オンラインストレージ共有"
  },
  "編集者": {
    hearingExample: "YouTube動画の編集を依頼したい。素材尺は60分、完成尺は10分程度。テロップ、BGM、効果音、サムネイル制作も希望。",
    projectExample: "YouTube動画の編集、テロップ、BGM、効果音、サムネイル制作を行う。",
    estimateLines: withRole("編集者", ["編集費", "テロップ制作費", "BGM選曲費", "効果音制作費", "カラー補正費", "サムネイル制作費", "追加修正費"].map((name) => line(name, "編集費"))),
    invoiceLines: ["動画編集費", "テロップ制作費", "サムネイル制作費", "追加修正費"],
    deliveryText: "下記編集済み動画データを納品いたしました。\n完成動画および指定されたサムネイル画像を納品いたします。",
    confirmText: "本案件は、動画編集および関連データ納品を行うものです。完成尺、修正回数、素材管理、プロジェクトデータ納品有無について双方で確認します。",
    rightsText: "編集済み動画の使用媒体、二次利用、プロジェクトデータ納品有無、実績公開可否を確認します。",
    deliverables: "編集済み動画、サムネイル画像", format: "MP4 / JPG", deliveryMethod: "オンラインストレージ共有"
  },
  "デザイナー": {
    hearingExample: "新サービスのロゴとSNS用バナーを制作したい。シンプルで高級感のある雰囲気を希望。ロゴはWeb、印刷物、SNSで使用予定。",
    projectExample: "新サービスのロゴおよびSNS用バナー制作。Web、印刷物、SNSで使用するデザインデータを納品する。",
    estimateLines: withRole("デザイナー", ["デザイン費", "ロゴ制作費", "バナー制作費", "ラフ案作成費", "修正費", "入稿データ作成費", "元データ納品費"].map((name) => line(name, "制作費"))),
    invoiceLines: ["ロゴデザイン制作費", "バナー制作費", "入稿データ作成費", "追加修正費"],
    deliveryText: "下記デザインデータを納品いたしました。\n確認済みデザインデータを指定形式にて納品いたします。",
    confirmText: "本案件は、デザイン制作およびデータ納品を行うものです。制作点数、修正回数、納品形式、元データ納品、使用範囲について双方で確認します。",
    rightsText: "デザインの使用範囲、商標登録予定、元データ納品、著作権譲渡、実績公開可否を確認します。",
    deliverables: "ロゴデータ、バナーデータ、入稿用データ", format: "AI / PSD / PDF / PNG / JPG", deliveryMethod: "オンラインストレージ共有"
  },
  "イラストレーター": {
    hearingExample: "SNSアイコン用のキャラクターイラストを制作したい。表情差分を3点希望。商用利用予定で、グッズ化の可能性もあります。",
    projectExample: "SNSアイコン用キャラクターイラスト制作。表情差分と商用利用条件を含めて納品する。",
    estimateLines: withRole("イラストレーター", ["イラスト制作費", "ラフ制作費", "表情差分制作費", "背景制作費", "商用利用費", "二次利用費", "元データ納品費", "著作権譲渡費"].map((name) => line(name, "制作費"))),
    invoiceLines: ["イラスト制作費", "差分制作費", "商用利用費", "追加修正費"],
    deliveryText: "下記イラストデータを納品いたしました。\n完成イラストおよび指定された差分データを納品いたします。",
    confirmText: "本案件は、イラスト制作およびデータ納品を行うものです。使用範囲、商用利用、二次利用、著作権譲渡、実績公開可否について双方で確認します。",
    rightsText: "商用利用、グッズ化、海外利用、AI学習禁止、NFT利用禁止、著作権譲渡の有無を確認します。",
    deliverables: "完成イラスト、差分データ", format: "PNG / JPG / PSD", deliveryMethod: "オンラインストレージ共有"
  },
  "Web制作者": {
    hearingExample: "会社ホームページをリニューアルしたい。5ページ程度、スマホ対応、問い合わせフォーム、SEO基本設定を希望。公開後の保守も相談したい。",
    projectExample: "会社ホームページのリニューアル制作。スマホ対応、問い合わせフォーム、SEO基本設定、公開後保守を含めて検討する。",
    estimateLines: withRole("Web制作者", ["Webディレクション費", "設計費", "デザイン費", "コーディング費", "CMS構築費", "問い合わせフォーム実装費", "SEO基本設定費", "サーバー設定費", "ドメイン設定費", "保守管理費", "保守費"].map((name) => line(name, "制作費"))),
    invoiceLines: ["Webサイト制作費", "CMS構築費", "サーバー設定費", "保守管理費"],
    deliveryText: "下記Webサイト制作物を納品いたしました。\n公開用データ、管理画面情報、関連設定情報を納品いたします。",
    confirmText: "本案件は、Webサイト制作および公開設定を行うものです。ページ数、実装範囲、サーバー管理、保守対応、公開後修正について双方で確認します。",
    rightsText: "サイトデータ、CMS、ドメイン・サーバー管理、保守範囲、公開後修正、著作権および実績公開可否を確認します。",
    deliverables: "公開用Webサイト、管理画面情報、設定情報", format: "Web公開 / HTML / CMS", deliveryMethod: "本番公開および管理情報共有"
  },
  "ライター": {
    hearingExample: "採用サイト用の社員インタビュー記事を3本制作したい。各2,000字程度、オンライン取材あり。写真は支給予定。",
    projectExample: "採用サイト用の社員インタビュー記事制作。オンライン取材、原稿執筆、校正を行う。",
    estimateLines: withRole("ライター", ["企画構成費", "取材費", "原稿執筆費", "校正費", "SEO調整費", "CMS入稿費", "追加修正費"].map((name) => line(name, "制作費"))),
    invoiceLines: ["記事執筆費", "取材費", "校正費", "CMS入稿費"],
    deliveryText: "下記原稿データを納品いたしました。\n確認済み原稿を指定形式にて納品いたします。",
    confirmText: "本案件は、記事制作および原稿納品を行うものです。記事本数、文字数、取材有無、校正回数、著作権、記名有無について双方で確認します。",
    rightsText: "記事の著作権、記名・無記名、二次利用、掲載媒体、実績公開可否を確認します。",
    deliverables: "確認済み原稿データ", format: "Google Docs / Word / Markdown", deliveryMethod: "ドキュメント共有"
  },
  "音楽制作者": {
    hearingExample: "YouTube動画用のオリジナルBGMを制作したい。30秒程度のループ可能な楽曲を希望。明るく爽やかな雰囲気。",
    projectExample: "YouTube動画用オリジナルBGM制作。30秒程度のループ可能な楽曲として納品する。",
    estimateLines: withRole("音楽制作者", ["作曲費", "編曲費", "ミックス費", "マスタリング費", "使用許諾費", "ステム納品費", "買取費", "追加修正費"].map((name) => line(name, "音楽・効果費"))),
    invoiceLines: ["楽曲制作費", "ミックス費", "マスタリング費", "使用許諾費"],
    deliveryText: "下記音源データを納品いたしました。\n完成音源、必要に応じてステムデータを指定形式にて納品いたします。",
    confirmText: "本案件は、楽曲制作および音源データ納品を行うものです。使用媒体、使用期間、二次利用、著作権管理、改変可否について双方で確認します。",
    rightsText: "楽曲の使用許諾、買取、使用媒体、使用期間、配信可否、著作権管理、改変可否を確認します。",
    deliverables: "完成音源、ステムデータ", format: "WAV / MP3", deliveryMethod: "オンラインストレージ共有"
  },
  "ナレーター": {
    hearingExample: "企業紹介動画用のナレーションを収録したい。原稿は約800字。落ち着いた信頼感のある声を希望。Webと展示会で使用予定。",
    projectExample: "企業紹介動画用ナレーション収録。Webと展示会で使用する音声データを納品する。",
    estimateLines: withRole("ナレーター", ["ナレーション収録費", "宅録費", "スタジオ収録費", "リテイク費", "使用許諾費", "音声整音費"].map((name) => line(name, "録音・MA費"))),
    invoiceLines: ["ナレーション収録費", "リテイク費", "使用許諾費"],
    deliveryText: "下記ナレーション音声データを納品いたしました。\n確認済み音声データを指定形式にて納品いたします。",
    confirmText: "本案件は、ナレーション収録および音声データ納品を行うものです。原稿文字数、使用媒体、使用期間、リテイク回数、収録方法について双方で確認します。",
    rightsText: "音声の使用媒体、使用期間、買取または使用許諾、クレジット表記、実績公開可否を確認します。",
    deliverables: "ナレーション音声データ", format: "WAV / MP3", deliveryMethod: "オンラインストレージ共有"
  },
  "俳優・モデル": {
    hearingExample: "広告撮影への出演を依頼したい。拘束は半日程度で、Web広告とSNSで使用予定。衣装とヘアメイクの手配も確認したい。",
    projectExample: "広告撮影への出演業務。拘束時間、媒体、肖像利用範囲を確認する。",
    estimateLines: withRole("俳優・モデル", ["出演料", "拘束時間料金", "使用許諾費", "競合排他費", "延長料金", "交通費"].map((name) => line(name, "出演費"))),
    invoiceLines: ["出演料", "使用許諾費", "延長料金", "交通費精算"],
    deliveryText: "本業務は出演対応を完了いたしました。\n指定日時・場所にて出演業務を実施済みです。",
    confirmText: "本案件は、撮影・広告等における出演業務を行うものです。拘束時間、使用媒体、使用期間、肖像利用範囲、競合排他について双方で確認します。",
    rightsText: "肖像利用範囲、使用媒体、使用期間、二次利用、競合排他、実績公開可否を確認します。",
    deliverables: "出演業務完了", format: "業務実施", deliveryMethod: "現地対応"
  },
  "ヘアメイク": {
    hearingExample: "プロフィール撮影用のヘアメイクを依頼したい。対象は2名、撮影前のメイクと撮影中の簡単な直しを希望。",
    projectExample: "プロフィール撮影用ヘアメイク業務。対象者2名、撮影前準備と撮影中の簡易直しを行う。",
    estimateLines: withRole("ヘアメイク", ["ヘアメイク基本料金", "人数追加料金", "拘束時間料金", "撮影中直し対応費", "早朝料金", "延長料金", "出張費", "交通費", "アシスタント費"].map((name) => line(name, "制作人件費"))),
    invoiceLines: ["ヘアメイク費", "延長料金", "出張費", "交通費精算"],
    deliveryText: "本業務はヘアメイク対応を完了いたしました。\n指定日時・場所にて対応業務を実施済みです。",
    confirmText: "本案件は、撮影・イベント等におけるヘアメイク業務を行うものです。対象人数、拘束時間、延長料金、早朝対応、交通費について双方で確認します。",
    rightsText: "実績公開可否、ビフォーアフター掲載可否、メイキング公開可否、クレジット表記を確認します。",
    deliverables: "ヘアメイク対応完了", format: "業務実施", deliveryMethod: "現地対応"
  },
  "スタイリスト": {
    hearingExample: "広告撮影用のスタイリングを依頼したい。出演者2名分の衣装提案と小物準備を希望。衣装返却まで含めたい。",
    projectExample: "広告撮影用スタイリング業務。出演者2名分の衣装提案、小物準備、返却対応を行う。",
    estimateLines: withRole("スタイリスト", ["スタイリング費", "衣装リース費", "小物準備費", "買い出し費", "返却対応費", "延長料金", "交通費"].map((name) => line(name, "美術費"))),
    invoiceLines: ["スタイリング費", "衣装リース費", "小物準備費", "交通費精算"],
    deliveryText: "本業務はスタイリング対応を完了いたしました。\n指定条件に基づき、衣装・小物の準備および対応業務を実施済みです。",
    confirmText: "本案件は、撮影・イベント等におけるスタイリング業務を行うものです。衣装点数、返却対応、汚損破損時の扱い、延長料金について双方で確認します。",
    rightsText: "衣装・小物の利用範囲、汚損破損時対応、実績公開可否、クレジット表記を確認します。",
    deliverables: "スタイリング対応完了", format: "業務実施", deliveryMethod: "現地対応"
  },
  "配信者": {
    hearingExample: "新商品のライブ配信を行いたい。1時間程度の配信で、アーカイブと告知投稿、切り抜き素材も相談したい。",
    projectExample: "新商品ライブ配信の企画・実施・アーカイブ納品を行う。",
    estimateLines: withRole("配信者", ["配信企画費", "配信出演費", "機材費", "配信オペレーション費", "アーカイブ納品費", "告知投稿費", "切り抜き制作費"].map((name) => line(name, "制作費"))),
    invoiceLines: ["ライブ配信費", "告知投稿費", "アーカイブ納品費", "切り抜き制作費"],
    deliveryText: "下記配信関連データを納品いたしました。\n配信アーカイブおよび指定された関連素材を納品いたします。",
    confirmText: "本案件は、配信の企画、実施、関連データ納品を行うものです。配信媒体、配信時間、アーカイブ、二次利用について双方で確認します。",
    rightsText: "配信アーカイブの使用範囲、二次利用、切り抜き利用、実績公開可否を確認します。",
    deliverables: "配信アーカイブ、関連素材", format: "MP4 / URL", deliveryMethod: "配信URLおよびデータ共有"
  },
  "SNS運用者": {
    hearingExample: "InstagramとXの運用を依頼したい。月8本の投稿企画、画像制作、キャプション作成、月次レポートを希望。",
    projectExample: "SNS運用支援。投稿企画、画像制作、キャプション作成、レポート提出を行う。",
    estimateLines: withRole("SNS運用者", ["SNS運用費", "投稿企画費", "画像制作費", "キャプション作成費", "レポート作成費", "広告運用費"].map((name) => line(name, "広告宣伝・納品費"))),
    invoiceLines: ["SNS運用費", "画像制作費", "レポート作成費", "広告運用費"],
    deliveryText: "下記SNS運用成果物を納品いたしました。\n投稿素材、キャプション、運用レポートを納品いたします。",
    confirmText: "本案件は、SNS運用に関する企画、制作、投稿支援、レポート作成を行うものです。運用媒体、投稿本数、対応範囲、レポート内容について双方で確認します。",
    rightsText: "投稿素材の使用範囲、二次利用、実績公開可否、アカウント権限の扱いを確認します。",
    deliverables: "投稿素材、キャプション、運用レポート", format: "PNG / JPG / テキスト / PDF", deliveryMethod: "共有フォルダおよび管理ツール"
  },
  "イベント制作者": {
    hearingExample: "新商品発表イベントの制作を依頼したい。会場手配、進行台本、スタッフ手配、記録撮影まで相談したい。",
    projectExample: "新商品発表イベントの制作進行。会場、進行、スタッフ、記録素材を管理する。",
    estimateLines: withRole("イベント制作者", ["イベント企画費", "制作進行費", "会場手配費", "進行台本制作費", "スタッフ手配費", "備品手配費", "記録撮影費"].map((name) => line(name, "制作費"))),
    invoiceLines: ["イベント制作費", "進行管理費", "スタッフ手配費", "備品手配費"],
    deliveryText: "本業務はイベント制作対応を完了いたしました。\n実施内容および関連資料を納品いたします。",
    confirmText: "本案件は、イベント制作および進行管理を行うものです。会場、スタッフ、備品、進行、記録撮影、安全管理について双方で確認します。",
    rightsText: "イベント記録素材の使用範囲、参加者情報の扱い、実績公開可否を確認します。",
    deliverables: "進行資料、実施報告、関連データ", format: "PDF / ドキュメント / 写真・動画", deliveryMethod: "共有フォルダ"
  }
};

for (const [role, options] of Object.entries(ROLE_NOTE_OPTIONS) as [CreatorRole, NoteOption[]][]) {
  ROLE_TEMPLATES[role].noteOptions = options;
}

for (const role of Object.keys(ROLE_TEMPLATES) as CreatorRole[]) {
  const colorGroup = ROLE_COLOR_GROUPS[role];
  ROLE_TEMPLATES[role].colorGroup = colorGroup;
  ROLE_TEMPLATES[role].themeColor = ROLE_COLOR_META[colorGroup].color;
}

export const AI_FOLLOWUP_RULES: AiFollowupRule[] = [
  { whenIncludes: ["YouTube", "動画"], questions: ["サムネイルは必要ですか？", "Shorts切り抜きは必要ですか？", "字幕は必要ですか？", "広告運用しますか？"] },
  { whenIncludes: ["Web", "ホームページ"], questions: ["問い合わせフォームは必要ですか？", "CMS更新は必要ですか？", "公開後の保守は必要ですか？", "サーバー・ドメイン管理は誰が行いますか？"] },
  { whenIncludes: ["イラスト", "商用"], questions: ["グッズ化の可能性はありますか？", "著作権譲渡は必要ですか？", "AI学習やNFT利用の禁止は明記しますか？"] }
];

export const ROLE_WORKFLOW_WORDING: Record<CreatorRole, { conditionName: string; outputName: string; completionDocumentName: string }> = {
  "映像制作者": { conditionName: "映像制作条件", outputName: "動画データ", completionDocumentName: "納品書" },
  "カメラマン": { conditionName: "撮影条件", outputName: "納品写真", completionDocumentName: "納品書" },
  "編集者": { conditionName: "編集条件", outputName: "編集済み動画", completionDocumentName: "納品書" },
  "デザイナー": { conditionName: "デザイン制作条件", outputName: "デザイン成果物", completionDocumentName: "納品書" },
  "イラストレーター": { conditionName: "イラスト制作条件", outputName: "イラスト成果物", completionDocumentName: "納品書" },
  "Web制作者": { conditionName: "Web制作条件", outputName: "公開URL、Webサイト、管理画面情報", completionDocumentName: "納品書" },
  "ライター": { conditionName: "執筆条件", outputName: "原稿", completionDocumentName: "納品書" },
  "音楽制作者": { conditionName: "音楽制作条件", outputName: "音源データ", completionDocumentName: "納品書" },
  "ナレーター": { conditionName: "収録条件", outputName: "音声データ", completionDocumentName: "納品書" },
  "俳優・モデル": { conditionName: "出演条件", outputName: "出演業務", completionDocumentName: "業務完了報告書" },
  "ヘアメイク": { conditionName: "ヘアメイク対応条件", outputName: "ヘアメイク対応", completionDocumentName: "業務完了報告書" },
  "スタイリスト": { conditionName: "スタイリング条件", outputName: "スタイリング対応", completionDocumentName: "業務完了報告書" },
  "配信者": { conditionName: "配信条件", outputName: "配信業務", completionDocumentName: "業務完了報告書" },
  "SNS運用者": { conditionName: "SNS運用条件", outputName: "運用報告", completionDocumentName: "運用報告書" },
  "イベント制作者": { conditionName: "イベント制作条件", outputName: "イベント制作・運営業務", completionDocumentName: "業務完了報告書" }
};

export const ROLE_CONDITION_FIELDS: Record<CreatorRole, string[]> = {
  "映像制作者": ["動画尺", "本数", "撮影日数", "撮影場所", "BGM", "テロップ", "カラコレ", "字幕", "サムネイル", "素材データ"],
  "カメラマン": ["撮影日", "撮影場所", "撮影時間", "納品写真", "レタッチ枚数", "RAW納品", "モデルリリース", "商用利用"],
  "編集者": ["素材支給", "編集尺", "本数", "テロップ", "BGM", "SE", "カラコレ", "修正回数", "プロジェクトデータ納品"],
  "デザイナー": ["制作物種類", "サイズ", "点数", "入稿データ", "元データ", "ai/psd納品", "修正回数", "商標利用"],
  "イラストレーター": ["点数", "サイズ", "カラー/モノクロ", "背景有無", "差分", "商用利用", "グッズ化", "著作権譲渡", "元データ"],
  "Web制作者": ["ページ数", "必要機能", "CMS", "問い合わせフォーム", "決済機能", "サーバー", "ドメイン", "保守"],
  "ライター": ["記事本数", "文字数", "取材有無", "校正回数", "CMS入稿", "記名/無記名", "著作権"],
  "音楽制作者": ["曲数", "秒数", "BPM", "曲調", "WAV/MP3", "ステムデータ", "使用許諾", "買取", "著作権管理"],
  "ナレーター": ["原稿文字数", "収録方法", "声のトーン", "読み速度", "WAV/MP3", "リテイク条件", "使用許諾"],
  "俳優・モデル": ["出演日", "拘束時間", "使用媒体", "肖像利用", "衣装", "ヘアメイク", "交通費", "キャンセル規定"],
  "ヘアメイク": ["対応日", "対応場所", "集合時間", "終了予定時間", "拘束時間", "対象人数", "ヘアセット人数", "メイク人数", "撮影/イベント内容", "衣装チェンジ有無", "撮影中の直し対応", "早朝対応", "延長対応", "出張費", "交通費", "駐車場", "控室・メイクスペース", "電源・鏡・椅子の有無", "アシスタント有無", "使用道具・消耗品", "肌トラブル・アレルギー確認", "キャンセル規定"],
  "スタイリスト": ["対応日", "対応場所", "拘束時間", "対象人数", "衣装点数", "小物", "買い出し", "返却対応", "汚損破損条件", "延長料金", "交通費"],
  "配信者": ["配信日時", "配信媒体", "配信時間", "出演内容", "PR表記", "アーカイブ有無", "二次利用", "レポート提出"],
  "SNS運用者": ["対象SNS", "投稿本数", "投稿頻度", "画像制作", "動画制作", "分析レポート", "広告運用", "コメント対応"],
  "イベント制作者": ["開催日", "会場", "搬入時間", "集合時間", "進行表", "担当範囲", "スタッフ人数", "備品", "雨天対応", "緊急連絡先"]
};

export const COMMON_REQUIRED_FIELDS = ["案件名", "依頼内容", "目的", "ターゲット", "希望予算", "上限予算", "納期または実施日", "使用媒体", "使用期間", "二次利用", "著作権・使用権", "元データ納品有無", "修正回数／リテイク回数", "追加費用条件", "キャンセル規定", "支払条件", "源泉徴収", "税区分", "ポートフォリオ掲載可否", "SNS掲載可否", "HP掲載可否", "営業資料掲載可否", "クレジット表記"];

export function uniqueItems<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function getNoteOptionsForRoles(roles: CreatorRole[]) {
  return uniqueItems([...COMMON_NOTE_OPTIONS, ...roles.flatMap((role) => ROLE_TEMPLATES[role]?.noteOptions ?? [])], (item) => item.text);
}

export function getInterviewGuideForRoles(roles: CreatorRole[]) {
  const generated = roles.flatMap((role) => ROLE_INTERVIEW_GUIDE[role] ?? (ROLE_CONDITION_FIELDS[role] ?? []).slice(0, 8).map((field) => guide(ROLE_WORKFLOW_WORDING[role].conditionName, `${field}について確認しましたか？`, "職種ごとの見積漏れ・確認漏れを防ぐため。", `${role}:${field}`)));
  return uniqueItems([...COMMON_INTERVIEW_GUIDE, ...generated], (item) => item.question);
}

export function getUnifiedRoleFieldGroups(roles: CreatorRole[]): HearingFieldGroup[] {
  const merged = roles.flatMap((role) => ROLE_HEARING_GROUPS[role] ?? []);
  const byTitle = new Map<string, string[]>();
  for (const group of merged) {
    byTitle.set(group.title, [...(byTitle.get(group.title) ?? []), ...group.fields]);
  }
  return Array.from(byTitle.entries()).map(([title, fields]) => ({ title, fields: Array.from(new Set(fields)) }));
}

export function mergeRoleTemplates(roles: CreatorRole[]) {
  const templates = roles.map((role) => ROLE_TEMPLATES[role]);
  const wordings = roles.map((role) => ROLE_WORKFLOW_WORDING[role]);
  return {
    hearingExample: templates.map((item) => item.hearingExample).filter(Boolean).join("\n\n"),
    projectExample: templates.map((item) => item.projectExample).filter(Boolean).join("\n\n"),
    estimateLines: uniqueItems(templates.flatMap((item) => item.estimateLines), (item) => item.name),
    invoiceLines: Array.from(new Set(templates.flatMap((item) => item.invoiceLines))),
    deliveryText: templates.map((item) => item.deliveryText).filter(Boolean).join("\n\n"),
    confirmText: templates.map((item) => item.confirmText).filter(Boolean).join("\n\n"),
    rightsText: templates.map((item) => item.rightsText).filter(Boolean).join("\n\n"),
    deliverables: Array.from(new Set(templates.map((item) => item.deliverables).filter(Boolean))).join(" / "),
    format: Array.from(new Set(templates.map((item) => item.format).filter(Boolean))).join(" / "),
    deliveryMethod: Array.from(new Set(templates.map((item) => item.deliveryMethod).filter(Boolean))).join(" / "),
    conditionNames: Array.from(new Set(wordings.map((item) => item.conditionName))),
    outputNames: Array.from(new Set(wordings.map((item) => item.outputName))),
    completionDocumentNames: Array.from(new Set(wordings.map((item) => item.completionDocumentName)))
  };
}

export function getCompletionDocumentName(roles: CreatorRole[]) {
  const names = Array.from(new Set(roles.map((role) => ROLE_WORKFLOW_WORDING[role]?.completionDocumentName).filter(Boolean)));
  if (names.length === 0) return "納品書";
  if (names.length === 1) return names[0];
  if (names.includes("運用報告書")) return "納品書／業務完了・運用報告書";
  if (names.includes("業務完了報告書")) return "納品書／業務完了報告書";
  return "納品書";
}

export function getConditionSections(roles: CreatorRole[]): HearingFieldGroup[] {
  return roles.map((role) => ({ title: ROLE_WORKFLOW_WORDING[role].conditionName, fields: Array.from(new Set([...ROLE_CONDITION_FIELDS[role], ...COMMON_REQUIRED_FIELDS])) }));
}

const LEGACY_ROLE_LINE_NAMES: Record<CreatorRole, string[]> = {
  "映像制作者": ["ディレクター", "カメラマン", "カメラ・レンズ一式", "照明機材一式", "本編集・カラコレ"],
  "カメラマン": [],
  "編集者": [],
  "デザイナー": [],
  "イラストレーター": [],
  "Web制作者": [],
  "ライター": [],
  "音楽制作者": [],
  "ナレーター": [],
  "俳優・モデル": [],
  "ヘアメイク": [],
  "スタイリスト": [],
  "配信者": [],
  "SNS運用者": [],
  "イベント制作者": []
};

export function estimateLineNamesForRole(role: CreatorRole) {
  return new Set([...(ROLE_TEMPLATES[role]?.estimateLines ?? []).map((line) => line.name), ...(LEGACY_ROLE_LINE_NAMES[role] ?? [])]);
}

export function roleForKnownEstimateLine(name: string): CreatorRole | undefined {
  return (Object.keys(ROLE_TEMPLATES) as CreatorRole[]).find((role) => estimateLineNamesForRole(role).has(name));
}

export function isEstimateLineVisibleForRoles(line: EstimateLine, roles: CreatorRole[]) {
  if (roles.length === 0) return true;
  if (line.sourceRole) return roles.includes(line.sourceRole);
  const knownRole = roleForKnownEstimateLine(line.name);
  if (!knownRole) return true;
  return roles.includes(knownRole);
}

export function activeEstimateLines(lines: EstimateLine[], roles: CreatorRole[]) {
  return lines.filter((line) => isEstimateLineVisibleForRoles(line, roles));
}
