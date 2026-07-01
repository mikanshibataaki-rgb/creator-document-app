# フォルダ整理監査メモ 2026-07-01

対象: `/Users/shibataakihiro/Documents/New project` 周辺

このメモは現状確認用です。削除、移動、GitHub反映はまだ行っていません。

## 結論

いま一番の混乱原因は、`New project` 全体が `creator-os.git` としてGit管理されている一方で、その中に複数アプリが並んでいることです。

つまりGitHub Desktop上では「Creator OS」に見えていても、実体はポータル単体ではなく、案件マネージャー、契約アプリ、だれおし、SNS司令室などを含む親フォルダです。

## Gitリポジトリ

| 場所 | GitHub接続先 | 状態 |
| --- | --- | --- |
| `/Users/shibataakihiro/Documents/New project` | `mikanshibataaki-rgb/creator-os` | 未コミット変更なし |
| `/Users/shibataakihiro/Documents/creator-agreement` | `mikanshibataaki-rgb/creator-agreement` | 未コミット変更なし |
| `/Users/shibataakihiro/Documents/GitHub/dareoshi-beta` | `mikanshibataaki-rgb/dareoshi-beta` | 未コミット変更あり |

`GitHub/dareoshi-beta` の未コミット変更:

- `components/dareoshi/data.ts`
- `components/dareoshi/screens.tsx`

## 主なアプリ候補

| 表示名 | 現在の候補フォルダ | メモ |
| --- | --- | --- |
| クリエーター案件マネージャー | `video-production-docs` | README上は `Creator OS / クリエイター案件マネージャー β` |
| クリエーター契約アプリ | `creator-agreement` と `/Users/shibataakihiro/Documents/creator-agreement` | 2か所に存在し、差分あり |
| だれおし | `dareoshi` と `/Users/shibataakihiro/Documents/GitHub/dareoshi-beta` | 2か所に存在し、差分あり |
| クリエーターOS | `creator-app-portal` | ポータルサイト本体。ただし親リポジトリ名も `creator-os` |

## 容量

| 対象 | 容量 |
| --- | ---: |
| `/Users/shibataakihiro/Documents/New project` | 約5.9GB |
| `/Users/shibataakihiro/Documents/creator-agreement` | 約529MB |
| `/Users/shibataakihiro/Documents/GitHub/dareoshi-beta` | 約367MB |
| `New project/backups` | 約1.8GB |
| `New project/creator-agreement` | 約550MB |
| `New project/video-production-docs` | 約628MB |
| `New project/creator-app-portal` | 約416MB |
| `New project/dareoshi` | 約367MB |

大きい生成物:

- `backups/`: 約1.8GB
- 各アプリの `node_modules`: だいたい200MBから400MB
- 各アプリの `.next`: 数MBから267MB
- `creator-app-portal.zip`: 約187MB
- `dareoshi.zip`: 約202MB
- `dareoshi 2.zip`: 約267MB

## Git管理上の注意

`New project` のGit管理対象に、次の動画・一時出力が入っています。

- `creator-promo-system/.export-tmp/.../*.webm`
- `creator-promo-system/exports/.../*.mp4`
- `creator-promo-system/exports/checks/*.png`

動画を書き出す運用を続けるなら、今後リポジトリ容量が増えやすいです。

## 危険なのでまだ消さないもの

- `/Users/shibataakihiro/Documents/GitHub/dareoshi-beta`
  - 未コミット変更があるため、整理前に内容確認が必要です。
- `/Users/shibataakihiro/Documents/creator-agreement`
  - 単独Gitリポジトリで、`New project/creator-agreement` と差分があります。
- `New project/dareoshi`
  - `GitHub/dareoshi-beta` と中身が違います。
- `New project/creator-agreement`
  - 単独版と差分があります。

## 追加確認 2026-07-01

### だれおし

`/Users/shibataakihiro/Documents/GitHub/dareoshi-beta` の未コミット変更は、次の2ファイルです。

- `components/dareoshi/data.ts`
- `components/dareoshi/screens.tsx`

内容は、トップ画面を「生活防衛ポータル」寄りに広げる変更と、危険な断定表現の検知追加です。

追加された危険表現:

- `税金が安くなります`
- `必ず得します`

確認結果:

- `npm run typecheck`: 成功
- `npm run build`: 成功
- ビルド後もGit差分は上記2ファイルのみ

`New project/dareoshi` と `GitHub/dareoshi-beta` は単なる同一コピーではありません。`GitHub/dareoshi-beta` のほうが、公式リンク、リスク表示、注意文、トップ画面の拡張が進んでいる箇所があります。

現時点の判断:

- 正式候補は `/Users/shibataakihiro/Documents/GitHub/dareoshi-beta`
- `New project/dareoshi` は、すぐ削除せず退避候補

### クリエーター契約アプリ

`/Users/shibataakihiro/Documents/creator-agreement` は単独Gitリポジトリで、未コミット変更なしでした。

`New project/creator-agreement` との差分:

- 単独版では `案件マネージャーから取り込む` 導線が削除済み
- 単独版では `data/managerSource.ts` が存在しない
- 単独版の `start.command` は `3101`
- `New project` 内版の `start.command` は `3100`

確認結果:

- `npm run typecheck`: 成功
- `npm run build`: 成功
- ビルド確認で `next-env.d.ts` が一時更新されたが、確認作業の副産物として戻し済み

現時点の判断:

- 正式候補は `/Users/shibataakihiro/Documents/creator-agreement`
- `New project/creator-agreement` は、すぐ削除せず退避候補

### Git管理と秘密情報

`New project` のGit管理対象に、`.env` 本体、`node_modules`、`.next`、zipは基本入っていません。

管理対象として確認された環境ファイルは、テンプレート用の `sns-command-room/.env.example` のみです。

## 整理方針案

### 案A: 4アプリをそれぞれ独立リポジトリにする

おすすめ度: 高

- `creator-project-manager`
- `creator-agreement`
- `dareoshi-beta`
- `creator-os`

GitHub Desktopで見たときに分かりやすく、アプリ同士が混ざりにくいです。

### 案B: `creator-os` を親リポジトリとして、アプリ群を全部まとめる

おすすめ度: 中

1つの大きな箱として管理できますが、GitHub Desktopでは「Creator OSの中に全部ある」状態になります。今回の気持ち悪さは残りやすいです。

## まずやるべき安全な順番

1. `GitHub/dareoshi-beta` の未コミット変更を確認して、残すか決める
2. `creator-agreement` の単独版と `New project` 内版の差分を確認して、正式版を決める
3. `creator-os` はポータル単体にするか、親リポジトリのままにするか決める
4. 決まったあとでバックアップを作る
5. GitHub Desktopから古い登録だけを外す
6. そのあと不要な生成物を削除する

## 容量について

内蔵SSDの空き容量は約225GBあります。今すぐ外付けSSD必須ではありません。

ただし、現在すでに内蔵SSDは約88%使用中です。動画素材、MP4書き出し、zipバックアップを増やすなら、外付けSSDを用意したほうが安全です。

おすすめ:

- 開発中のコード: 内蔵SSD
- 動画素材、書き出しMP4、古いzip、退避バックアップ: 外付けSSD
- GitHubに送るもの: ソースコード中心。`node_modules`、`.next`、古いzip、動画書き出しは基本送らない

## すぐ減らせる候補

実行前に確認が必要です。

- `.next`
- `node_modules`
- 古いzip
- `backups`
- `creator-promo-system/.export-tmp`
- `creator-promo-system/exports`

これらは合計で数GB減らせます。ただし `backups` とzipは念のため外付けSSDか別フォルダへ退避してから削除するのが安全です。
