# Courtside: project rules

A 3v3 full-court basketball game in the browser, made for Arlo. David directs and makes the
art calls. See SPEC.md for what makes it fun and what we are not building, STATE.md for
where we are, HANDOFF.md for how the last session ended.

## Hard rules
- No build step. `index.html` must run by double-clicking it, and from GitHub Pages
  (https://davispiero.github.io/courtside/). Plain `<script>` files only, no ES modules
  (they break on `file://`).
- Everything is drawn in code on one canvas. No image files for players or courts.
- No music for now. If it returns, files must be free to redistribute and credited on screen.
- `Reference/` holds David's reference images. It is git-ignored and never published.
- Keep it fast: the game must hold 60 fps on a normal laptop.
- Work on a branch. Merge to `main` only when David signs off; `main` is the live site.

## How to run and check
- Play: double-click `index.html`, or `python3 -m http.server 8791` and open
  http://localhost:8791/?mute (the preview config in `.claude/launch.json` serves it).
  Always test with `?mute` so no sound plays. `&device=pc` or `&device=touch` skips the
  loading and device screens.
- Test another date for limited events: add `&date=2026-11-01` to the URL.
- Smoke test (loads the game headless, plays every mode/court/difficulty and each minigame and the Halloween quests, reports scores,
  then opens every menu screen at iPad and phone sizes and fails if a button is off screen):
  `./tools/smoke.sh`
- Difficulty bench (a bot that plays like a good kid against each level; prints the average margin):
  `./tools/bench.sh [games per level]`, add `v` for a per-game breakdown. Run it after any gameplay change.
  `SIZE=84,300 ./tools/bench.sh 10` plays the bot as a hooper of that height (in) and weight (lb).
- Sound: `M` mutes effects. Run it muted when testing.

## Code map
- `js/teams.js` all 30 teams, rosters and player ratings (edit freely)
- `js/hof.js` Hall of Fame league: each franchise's all-time top three (edit freely)
- `js/settings.js` the settings menu's options and saving them
- `js/save.js` your save: Court Coins, packs, campaign stars (on the device; also in your account when signed in)
- `js/anim.js` the animation system: keyframe clips for every move, blending, smoothing
- `js/packs.js` collectable animations (rarity, names), packs, Player Packs, Daily Shop (prices, odds), selling
- `js/shoes.js` the 33 shoes, Shoeboxes, the shoe in the Daily Shop, drawing a pixel shoe
- `js/hooper.js` your hooper's 8 stats, height and weight, upgrade prices, recommended ratings, the upgrade panel
- `js/campaign.js` campaign chapters, games, every story line, goals; your crew; NBA career (teams, offers, salary)
- `js/campui.js` campaign, hooper, story card, results, team choice screens; daily payday
- `js/league.js` Career League: seasons, schedule, simulated games, standings, playoffs, rewards
- `js/leagueui.js` the Career League hub screen
- `js/account.js` accounts (Supabase): sign in / up, the gear's ACCOUNT SETTINGS pop-up, delete check, cloud save sync, combining saves
- `js/profile.js` the account page: pixel profile pictures, titles (Developer for King), showcase, lifetime totals
- `js/event.js` limited events: Halloween 2026 dates, quests, rewards, the menu banner and quest pop-up
- `supabase/` the database setup (`setup.sql`) and David's setup steps (`README.md`). Never put the secret key in the game.
- `js/story.js` story scenes (characters talking) and in-game chatter
- `js/daily.js` daily reward ladder and three daily challenges (pool, rewards), the DAILY pop-up
- `js/shop.js` Shop (Daily Shop, Packs, Player Packs, Shoeboxes, Codes), pack opening and unboxing
- `js/touch.js` touch controls for Mobile / Tablet
- `js/core.js` helpers, options and difficulty, global state, screen sizing
- `js/projection.js` 3D projection and drawing primitives
- `js/arena.js` arena and street court (crowd, fences, floors, skyline)
- `js/courts.js` the court list (colours, scenery) and the Rooftop, Beach, The Cage and Haunted Hollow (limited) courts
- `js/players.js` player models (drawing; poses come from anim.js), ball
- `js/render.js` hoops, per-frame render, post effects
- `js/camera.js` cameras and cutscene cameras
- `js/gameplay.js` rules, moves, AI, input
- `js/loop.js` fixed-step simulation, HUD
- `js/showtime.js` On Fire, alley-oops, buzzer beaters, the win celebration and trophy
- `js/fx.js` particles for rare moves (glow by rarity, Witching Hour bats, Fire Breather, Supernova)
- `js/minigames.js` 3-point contest, dunk contest, 1-on-1
- `js/tutorial.js` the tutorial (court steps, then cards)
- `js/audio.js` sound effects (no music)
- `js/menus.js` menus, setup screen, tip-off
- `js/main.js` input listeners, start-up, smoke-test hook

## Animation
- Tune moves in `js/anim.js` (keyframes are plain numbers) and check them in Settings >
  Animation Lab at ¼ speed from front, side and back before calling them done.

## Out of scope (unless David asks)
Online play (BRIEF-online.md only), chat, fouls/free throws, substitutions, franchise management (trades, drafts).
