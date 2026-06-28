# Creator OS / クリエイター案件マネージャー β

職種を選び、案件を聞き取り、その内容から取引書類を作成するクリエイター向け案件管理アプリです。

単なる見積書・請求書作成ツールではなく、クリエイターの実務フローに合わせて、

```txt
職業選択 → 聞き取り → 取引先 → 見積 → 精算 → 業務内容確認 → 納品／業務完了 → 請求 → PDF出力 → 保存・複製
```

を一つの画面で扱えることを目指しています。

## 現在の状態

β版です。ログインやクラウド保存はまだありません。

入力データはブラウザの `localStorage` に保存されます。外部API送信、AI API接続、Google連携、外部共有URL発行は現時点では行っていません。

## 主な機能

- 職種選択
- 職種ごとの聞き取り項目切り替え
- 手入力による案件ヒアリング
- 議事録貼り付け欄
- 議事録からの簡易抽出候補UI
- 聞き取りシート
- 案件シート
- 見積書
- 精算書
- 業務内容確認書
- 納品書／業務完了報告書
- 請求書
- PDF出力
- 作成済み書類の保存
- 書類の複製・再利用
- 今後の展望ページ

## 対応職種

- 映像制作者
- カメラマン
- 編集者
- デザイナー
- イラストレーター
- Web制作者
- ライター
- 音楽制作者
- ナレーター
- 俳優・モデル
- ヘアメイク
- スタイリスト
- 配信者
- SNS運用者
- イベント制作者

## デザイン方針

Creator OS UI/UX Design System v1.0 をベースにしています。

- ダークテーマを基本にしたプロツール風UI
- Adobe / Figma / DaVinci Resolve などの制作ツールに近い没入感
- 案件・書類・成果物を主役にする控えめなUI
- 職種や機能識別には彩度を抑えたMuted Paletteを使用
- アクセントカラーは大きな面ではなく、ドット・細い線・バッジに限定
- PCでは3カラム構造
- スマホでは下部ナビゲーションと入力優先UI

## カラーパレット

### Core

- Base: `#0d0d0f`
- Surface: `#16161a`
- Border: `#2c2c30`
- Primary Accent: `#e53e3e`
- Text Primary: `#ffffff`
- Text Secondary: `#b5b5bc`
- Text Muted: `#636366`

### Role Accent

- Video & Audio: `#4a90e2`
- Design & Visual: `#9b51e0`
- Text & Media: `#27ae60`
- Human & Stage: `#d97706`
- Stream & Live: `#f43f5e`

## 技術構成

- Next.js
- React
- TypeScript
- Tailwind CSS
- localStorage

## 起動方法

```bash
npm install
npm run dev
```

標準では `http://localhost:3000` で起動します。

LAN内のスマホで確認したい場合は、開発サーバーを `0.0.0.0` で起動してください。

```bash
npm run dev -- --hostname 0.0.0.0
```

本番ビルド確認:

```bash
npm run build
npm run start -- --hostname 0.0.0.0
```

型チェック:

```bash
npm run typecheck
```

## ディレクトリ構成

```txt
app/
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
data/
  documentRepository.ts
domain/
  constants.ts
  derived.ts
  format.ts
  roleTemplates.ts
  seed.ts
  types.ts
features/
  documents/
  editor/
  workspace/
```

## 重要な設計

### 聞き取りを中心にする

このアプリでは、聞き取り内容を案件データの中心にしています。

見積書・確認書・納品書・請求書は、それぞれ独立して作るのではなく、聞き取り内容と採用済み見積明細を参照して生成します。

### 職種ごとに出し分ける

選択していない職種の項目・見積候補・備考は表示しない方針です。

複数職種を選択した場合のみ、選択された職種の項目を統合します。

### 保存境界を分ける

`data/documentRepository.ts` を保存境界にしています。

現時点では `localStorage` 保存ですが、将来的にSupabaseやクラウド保存へ差し替えやすい構造を想定しています。

## PDF出力

ブラウザの印刷機能を使ってPDF出力します。

推奨:

- A4
- 倍率100%
- 背景グラフィックあり
- 選択中の帳票のみ印刷

## セキュリティ・注意

- 現時点ではログイン機能はありません。
- 入力データはこの端末のブラウザに保存されます。
- 共有PCでの利用には注意してください。
- 外部共有URLは発行されません。
- AI APIやGoogle APIにはまだ接続していません。
- APIキーや秘密情報をコードに含めないでください。

## 今後の予定

- AIによる議事録解析
- AIによる見積候補生成
- 抜け漏れチェック
- Googleログイン
- Googleカレンダー連携
- Googleスプレッドシート連携
- クラウド保存
- 書類テンプレート保存
- チーム共有
- クライアント入力URL
- 電子契約連携
- 会計ソフト連携

## 開発元

企画・開発: 東海制作
