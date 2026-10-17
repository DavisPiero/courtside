# Courtside: project rules

A 3v3 full-court basketball game in the browser, made for Arlo. David directs and makes the
art calls. See SPEC.md for what makes it fun and what we are not building, STATE.md for
where we are.

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
- Smoke test (loads the game headless, plays every mode/court/difficulty, reports scores):
  `./tools/smoke.sh`
- Sound: `M` mutes effects. Run it muted when testing.

## Code map
- `js/teams.js` all 30 teams, rosters and player ratings (edit freely)
- `js/settings.js` the settings menu's options and saving them
- `js/save.js` your save: Court Coins, packs, campaign stars (browser storage only)
- `js/packs.js` the animation packs: names, prices, descriptions
- `js/campaign.js` campaign chapters, games, story lines, goals; your crew
- `js/campui.js` campaign, hooper, story and results screens
- `js/touch.js` touch controls for Mobile / Tablet
- `js/core.js` helpers, options and difficulty, global state, screen sizing
- `js/projection.js` 3D projection and drawing primitives
- `js/arena.js` arena and street courts (crowd, fences, floors)
- `js/players.js` player models and animation, ball
- `js/render.js` hoops, per-frame render, post effects
- `js/camera.js` cameras and cutscene cameras
- `js/gameplay.js` rules, moves, AI, input
- `js/loop.js` fixed-step simulation, HUD
- `js/audio.js` sound effects (no music)
- `js/menus.js` menus, setup screen, tip-off
- `js/main.js` input listeners, start-up, smoke-test hook

## Out of scope (unless David asks)
Online accounts (brief only, not until David asks), online play, fouls/free throws, substitutions, seasons, saving progress.
