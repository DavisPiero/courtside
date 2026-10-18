#!/bin/sh
# Difficulty bench: a bot that plays like a good kid (sprints, dribble moves, human shot timing, mashes STEAL)
# plays several 3-minute games against each level. Prints the average margin (positive = the bot won).
# Usage: ./tools/bench.sh [games per level, default 6]
cd "$(dirname "$0")/.." || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --mute-audio --virtual-time-budget=300000 --window-size=1280,720 \
  --dump-dom "file://$(pwd)/index.html?bench&n=${1:-6}${2:+&v}" 2>/dev/null | sed -n '/<pre id="smoke">/,/<\/pre>/p' | sed 's/<[^>]*>//g'
