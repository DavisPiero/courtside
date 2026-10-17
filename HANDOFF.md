# Hand-off for the next session

_Written 2026-10-17 (session 3). Replace this file at the end of each session; don't add a second one._

## State of the repo
- `main` is the live site. Session 3 was merged and pushed on David's instruction; no open branches.
- `./tools/smoke.sh` passes (it now loops over every court in `COURT_IDS`).

## Read first
1. `CLAUDE.md` (code map now has js/courts.js). 2. `STATE.md` for open questions. 3. `SPEC.md`. 4. `DECISIONS.md`.

## How to work on it
- Test muted: `http://localhost:8791/?mute` via the `courtside` preview config.
- The browser pane caches scripts hard: fetch each script with `{cache: "reload"}`, then reload.
- A hidden pane pauses the game (visibilitychange) and stops requestAnimationFrame. To test gameplay there,
  set `pause = () => {}` and drive the simulation by hand: `for (...) { step(1/120); T += 1/120; }`.
- Courts: add one by adding an entry to `COURTS` in js/courts.js (floor/out colours, fog, bg, around) and a
  button in index.html's court picker. Everything but `arena` gets street pole hoops.
- NBA career lives at the end of the helpers in js/campaign.js (`nbaOpen`, `offerTier`, `nbaOffers`, `nbaTeam`,
  `altTeam`, `knoxTeam`); the screens and `payday()` are in js/campui.js. Save fields: `SAVE.nba`, `SAVE.payday`.
- Back up `localStorage["courtside.save.v1"]` before testing campaign flows and restore it after.

## What comes next
- David's answers to STATE.md's open questions.
- Real iPad/phone check; an outside playtest.
