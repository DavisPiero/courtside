#!/bin/sh
# Loads the game in headless Chrome, plays every mode/court/difficulty for a 2-minute quarter, prints scores.
# Exit code 0 = pass. Usage: ./tools/smoke.sh
cd "$(dirname "$0")/.." || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=$("$CHROME" --headless=new --disable-gpu --mute-audio --virtual-time-budget=120000 --window-size=1280,720 \
  --dump-dom "file://$(pwd)/index.html?smoke" 2>/dev/null | sed -n '/<pre id="smoke">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
if [ -z "$OUT" ]; then echo "SMOKE FAIL: the game did not load"; exit 1; fi
echo "$OUT"
echo "$OUT" | grep -q "SMOKE PASS"
