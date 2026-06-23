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

PORT=3010
echo "SNS司令室を起動します。"
echo "ブラウザで http://localhost:${PORT} を開きます。"
echo "この黒い画面は、アプリを使っている間は閉じないでください。"
echo ""

npm run dev -- -p ${PORT} &
SERVER_PID=$!
sleep 3
open http://localhost:${PORT}
wait $SERVER_PID
