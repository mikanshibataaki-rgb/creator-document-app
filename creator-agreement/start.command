#!/bin/zsh

set -e
cd "$(dirname "$0")"

PORT=3100
URL="http://127.0.0.1:${PORT}"

if [ ! -d "node_modules" ]; then
  echo "初回準備をしています..."
  npm install
fi

echo "Creator Agreement を起動しています..."
npm run dev -- --hostname 127.0.0.1 --port "$PORT" &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for i in {1..30}; do
  if curl -sS "$URL" >/dev/null 2>&1; then
    open -a "Google Chrome" "$URL"
    echo ""
    echo "Chromeで開きました。"
    echo "この画面を閉じるとアプリも停止します。"
    wait "$SERVER_PID"
    exit 0
  fi
  sleep 1
done

echo "起動に時間がかかっています。"
echo "Chromeで $URL を開いてください。"
wait "$SERVER_PID"
