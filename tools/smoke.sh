#!/bin/sh
# Loads the game in headless Chrome, plays every mode/court/difficulty for a 2-minute quarter, prints scores.
# Then opens every menu screen at iPad, iPhone and laptop sizes and checks no button is off the screen.
# Exit code 0 = pass. Usage: ./tools/smoke.sh
cd "$(dirname "$0")/.." || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=$("$CHROME" --headless=new --disable-gpu --mute-audio --virtual-time-budget=120000 --window-size=1280,720 \
  --dump-dom "file://$(pwd)/index.html?smoke" 2>/dev/null | sed -n '/<pre id="smoke">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
if [ -z "$OUT" ]; then echo "SMOKE FAIL: the game did not load"; exit 1; fi
echo "$OUT"
echo "$OUT" | grep -q "SMOKE PASS" || exit 1

# Screen sizes the game sees (headless Chrome loses 87 px of height to its own window, so it is added back):
# iPad landscape in Safari with the tab bar, iPad without it, iPhone landscape, small iPhone landscape, laptop.
FAIL=0
for SIZE in 1180x688 1180x760 844x350 667x300 1280x720; do
  W=${SIZE%x*}; H=$((${SIZE#*x} + 87))
  FIT=$("$CHROME" --headless=new --disable-gpu --mute-audio --virtual-time-budget=8000 --window-size=$W,$H \
    --dump-dom "file://$(pwd)/index.html?fitcheck" 2>/dev/null | sed -n '/<pre id="smoke">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
  if [ -z "$FIT" ]; then echo "FIT FAIL $SIZE: the game did not load"; FAIL=1; continue; fi
  echo "$FIT" | grep -q "FIT PASS" && echo "$FIT" | head -1 || { echo "$FIT"; FAIL=1; }
done
exit $FAIL
