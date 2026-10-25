# Hand-off for the next session

_Written 2026-10-25 (session 9). Replace this file at the end of each session; don't add a second one._

## State of the repo
- Branch `session9`, committed, not merged. `main` is session 8 (live). Merge only when David signs off.
- `./tools/smoke.sh` passes. Bench 30 games: +43.8 / +19.1 / +2.9 / -11.4. `./tools/bench.sh 10 v` now also prints
  `oopc` (oop chances a game) and `oops` (thrown).

## Read first
STATE.md. Halloween ends at midnight as 1 November begins; session 10's first drop should be ready around then.

## What changed (where to look)
- Oop cuts: `oopCut` and `cutter` in js/showtime.js (arc trigger for team 0, `G.cutT` cooldown, set in `init`);
  defender ball-watch `p.bw` in `ai()` js/gameplay.js; `watch` per level in `DIFF` js/core.js. Bench bot throws
  oops in `botHandler`.
- Leaning shots: `beginShot` sets `p.lean` from `G.in`; `LEAN` table and drift in `jumpForShot`; `human()` leaves
  speed alone while `p.leanAir`; green zone in `greenZone`; pose `leanPose` in js/anim.js (via `ctx.lean`,
  js/players.js); Lab rows `core.fade/side/leaner` in js/menus.js (`P0.labLean`). The bench bot doesn't lean;
  a hand test (bot always fading / side-stepping) scored the same / a bit worse.
- HACKER: js/shop.js `CODES` (hash 83558c3f); shoe `hacker`, `mark: "code"` in js/shoes.js `drawShoe`.
  `whereFrom` in js/menus.js for the Limited label.
- Showcase: `SAVE.prof.slots` (4 x "a:id" / "s:id" / ""), migrated from `show`/`shoe` in `saveLoadFrom` js/save.js;
  `slotItem`, `pickSlot` (tabs, swap) in js/profile.js; `.pptabs`, `.ppickbox.fixed` in css/style.css.
  Session 10 adds "t:" (trail) and "e:" (shot effect) to `slotItem` and a tab each to `pickSlot`.

## How to work on it
- Test muted: `http://localhost:8791/?mute&device=pc` via the `courtside` preview config.
- The browser pane caches scripts hard: fetch every changed file with `{cache: "reload"}`, then reload. The daily
  pop-up opens on load; remove `.pop.on` before screenshots.
- Back up `localStorage["courtside.save.v1"]` before testing and restore it after (sessionStorage survives reloads).
- To freeze a Lab pose: `LAB.speed = 0.00001`, `previewModel("lab").lt = 0.9`.

## Open questions for David
See STATE.md "Open with David".
