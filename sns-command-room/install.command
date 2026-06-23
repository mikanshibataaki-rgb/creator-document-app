#!/bin/zsh
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js / npm が見つかりません。"
  echo "https://nodejs.org/ からLTS版をインストールしてから、もう一度このファイルを開いてください。"
  echo ""
  echo "Enterキーを押すと閉じます。"
  read
  exit 1
fi

npm install

echo ""
echo "インストールが完了しました。Enterキーを押すと閉じます。"
read
