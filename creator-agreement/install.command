#!/bin/zsh

set -e
cd "$(dirname "$0")"

echo "Creator Agreement の準備をしています..."
npm install

echo ""
echo "準備が完了しました。"
echo "次回から start.command をダブルクリックしてください。"
read "?Enterキーで閉じます。"
