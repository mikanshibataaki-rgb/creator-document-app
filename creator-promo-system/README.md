# creator-promo-system

映像制作者・クリエイター向けアプリの紹介体験を、同じデザイン品質とアニメーション品質で展開するためのプロモーションシステムです。

最初のプロモーションとして `クリエイター案件マネージャー` を実装しています。今後は `src/promos/` にデータを追加し、共通Sceneを組み合わせることで別アプリの紹介にも流用できます。

## 技術構成

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion for React
- Lucide React

## 実行手順

```bash
npm install
npm run dev
npm run build
```

MP4を書き出す:

```bash
npm run export:mp4
```

出力先:

```txt
exports/
```

## 確認用URL

通常再生:

```txt
http://127.0.0.1:5173/
```

秒数を固定して確認:

```txt
http://127.0.0.1:5173/?t=17&pause=1
```

別プロモーションを確認:

```txt
http://127.0.0.1:5173/?promo=creator-contract
```

## 設計

```txt
src/
  components/
    ui/
    scenes/
  hooks/
  animations/
  theme/
  utils/
  promos/
```

## 追加済みプロモーションデータ

- `creator-project-manager.ts`
- `creator-contract.ts`
- `nani-suru.ts`
- `production-diary.ts`
- `asset-navi.ts`
- `dareoshi.ts`
- `creator-os.ts`

## 重要な考え方

- Scene内にアプリ固有の文章を書かない
- 文章、職種、質問、フローは `src/promos/` で管理する
- 色は `src/theme/theme.ts` で管理する
- Motion設定は `src/animations/animations.ts` で共通化する
- Timelineは `src/utils/timeline.ts` と `src/hooks/useTimeline.ts` で一元管理する
- 40秒自動再生、スクロールなしのシングルページとして設計する

## MP4書き出しへの考慮

現時点ではブラウザ上のプロモーションサイトとして動作します。各Sceneの表示時間は固定Timelineで管理しているため、将来的にPlaywrightやRemotionなどの書き出し処理を追加しやすい構成です。
