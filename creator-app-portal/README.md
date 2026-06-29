# Creator OS

複数のクリエイター向けアプリへ移動するための入口ポータルサイトです。

## 起動

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3200
```

ブラウザで `http://127.0.0.1:3200` を開きます。

## 現在の範囲

- 入口ポータルサイト
- 公開中アプリ2件への外部リンク
- 開発中アプリ3件のカード表示
- スマホ、タブレット、PC向けのレスポンシブ表示

## 公開中アプリ

- クリエーター案件マネージャー: `https://creator-project-manager.vercel.app/`
- クリエーター契約アプリ: `https://creator-agreement.vercel.app/`

## 未対応

- ログイン
- 課金
- データ連携
- 管理者画面
- 共通DB

掲載アプリの変更は `data/apps.ts` で行います。
