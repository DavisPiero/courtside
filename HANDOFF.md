# Hand-off for the next session

_Written 2026-10-18 (session 6a). Replace this file at the end of each session; don't add a second one._

## State of the repo
- Session 6a is merged to `main` and pushed (live). No open branches.
- `./tools/smoke.sh` passes. Scores vary from run to run; this session changed no rules.

## What changed (where to look)
- Fit: `js/menus.js` `fitPanel()` now only toggles `.fitscroll` (no scaling). CSS "fit to screen" block:
  `.scr > .box` has a max-height of the screen and scrolls; `.shopbox`, `.inv` and `#sets .box` have a fixed height.
  `fitCheck()` in `js/main.js` also fails if a Shop or Settings tab changes the panel's size.
- PLAY screen: `#playPick` in index.html; back buttons from Campaign, Minigames and Quick Play return there.
- Quick Play pop-ups: `SU_OPTS`, `drawChips()` and `openPick()` in `js/menus.js`; `#pick` in index.html.
- On Fire: `drawP()` / `fireSil()` / `ringPix()` in `js/players.js`; `#vm.fire` in CSS; flash in `js/showtime.js`.
- Codes: `CODES` in `js/shop.js` (SNEAKERHEAD = e01fa49e); `SAVE.freeBox` for free shoeboxes; the `launched` shoe
  in `js/shoes.js` (`mark: "flame"`, `glow` can be a colour).
- Bloom: `SET.bloom` 0 and `bloomV` 2 in `js/settings.js`; strength in `js/render.js`.

## How to work on it
- Test muted: `http://localhost:8791/?mute&device=touch` via the `courtside` preview config.
- The browser pane caches scripts hard: fetch every changed file with `{cache: "reload"}`, then reload.
- Back up `localStorage["courtside.save.v1"]` before testing and restore it after.
- The iPad keyboard can't be tested here: the code box fix is checked on desktop only.

## What comes next
- David tests 6a on the iPad. Then 6b and 6c (see STATE.md).
