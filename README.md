# Creator OS

Creator OS は、クリエイター向け業務支援アプリ群をまとめる親リポジトリ／モノレポです。

このリポジトリには、案件管理、契約、制作記録、SNS運用など、複数の関連アプリを段階的に配置しています。

## 入口ポータル

⑦クリエーターOSの入口ポータル本体は、次のフォルダです。

```text
creator-app-portal
```

このポータルは、公開中アプリや開発中アプリへ移動するためのトップページです。

## Vercel公開設定

Vercelで⑦クリエーターOSの入口ポータルを公開する場合は、Vercel側で次の設定にしてください。

```text
Root Directory: creator-app-portal
Framework Preset: Next.js
Build Command: npm run build または空欄
Output Directory: 空欄
```

Root Directory がリポジトリ直下のままだと、入口ポータルではなく別の場所を見に行き、404になる可能性があります。

## 現在の状態

- ベータ版です。
- 開発中アプリを含みます。
- 入口ポータルから公開中アプリへ移動できます。
- ログイン、課金、データ連携は今後の段階で実装予定です。
- 現時点では、管理者画面や共通DBは本格実装していません。

## 注意事項

このリポジトリには、複数のアプリ本体が含まれています。

既存アプリ本体を不用意に変更しないでください。特に、次のようなフォルダを変更する場合は、目的と影響範囲を確認してから作業してください。

```text
video-production-docs
creator-agreement
production-journal
sns-command-room
sns_auto_system
dareoshi-editor
```

⑦クリエーターOSの入口ポータルだけを変更する場合は、原則として `creator-app-portal` 配下のみを編集します。
