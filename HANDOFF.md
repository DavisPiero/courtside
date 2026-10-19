# Hand-off for the next session

_Written 2026-10-19 (session 8). Replace this file at the end of each session; don't add a second one._

## State of the repo
- Work is on branch `session8`, committed, not merged. `main` is still session 7 (live).
- `./tools/smoke.sh` passes (now includes Haunted Hollow, the Halloween quests, the account page, its choosers,
  the gear pop-up and the delete check). Bench (10 games): +42.5 / +15.6 / +1.1 / -9.8.

## Read first
STATE.md. If David signs off, merge quickly: Halloween ends at midnight as 1 November begins (device clock).

## What changed (where to look)
- Steals: `exposed(v, q, back)` and `humanSteal()` in js/gameplay.js (×1.35, behind = 0.6, REACHED = `p.swT`
  pushed to +1.2 s). Swipe clip `ACTIONS.swipe` in js/anim.js (arm and twist only).
- Rarity rename: `limited` everywhere (packs, shoes, shop, audio, css). Saves never stored rarity, so nothing to migrate.
- Halloween: js/event.js (`EVENTS.halloween26`, `evGame`, banner `evBanner`, pop-up `openEvent`), results hook in
  js/campui.js `showResults`, `SAVE.ev`. Court `haunt` in js/courts.js (`limited: "halloween26"`, `courtIds()`
  hides it after the end). Jack-O in js/shoes.js (`mark: "pumpkin"`). Witching Hour: `dunk.witch` in packs/anim.
- Particles: js/fx.js. `moveFx` runs every step from `fxStep` (js/loop.js); special particles (`g`, `st`, `bat`)
  are drawn by `fxDraw` from js/render.js. Cap 420. Not shown in the Animation Lab (it draws portraits, not the court).
- Celestial: `RARITY.celestial`, `RARITIES`, `RANK`, HoF odds, `SINGLE_PRICE`, Daily Shop (own seed) in js/packs.js;
  shop TIERS/banner, audio notes, css `.r-celestial`. New moves: Comet, Supernova, Heaven's Gate, Phantom
  (`MOVES.phantom.spins = 2`), Angel Glide, Fire Breather.
- Account page: js/profile.js (`PICS`, `TITLES`, `myTitle`, `lifeCount`, `openProf`, choosers), `#prof` screen,
  `.pop` pop-ups (`#acct`, `#ppick`, `#accDel`) now sit outside the menu. js/account.js: `accButton` draws the
  picture, `accDelete` opens the are-you-sure, `accDeleteNow` deletes. `SAVE.prof`, `SAVE.life` (merged on sign-in).

## How to work on it
- Test muted: `http://localhost:8791/?mute&device=pc` via the `courtside` preview config. `&date=2026-11-01` tests
  the event being over.
- The browser pane caches scripts hard: fetch every changed file with `{cache: "reload"}`, then reload. When the
  pane is hidden, step the game by hand (`step`, `camUpd`, `render`) and use zoom for a fresh screenshot.
- Back up `localStorage["courtside.save.v1"]` before testing and restore it after; clear `courtside.acct` too.

## What comes next
David's sign-off and merge; David registers King. Then league part 2 or two players on one device.

## Open questions for David
See STATE.md "Open with David".
