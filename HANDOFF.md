# Hand-off for the next session

_Written 2026-10-18 (session 6b). Replace this file at the end of each session; don't add a second one._

## State of the repo
- Session 6b is merged to `main` and pushed (live). No open branches.
- `./tools/smoke.sh` passes. Scores vary from run to run; this session changed no rules.

## What changed (where to look)
- Menu: `.menu-l` lost its max-width (it clipped the logo and buttons). `#navMain` / `#navPlay` sit in one grid cell
  inside `.mtrack`; `menuSlide()` and `showPlay()` in `js/menus.js`. Anything that used to go "back to PLAY" calls
  `showPlay()`. `fitCheck()` has `cutSide()`, which fails anything clipped sideways by a parent.
- Codes: `drawCodes()` in `js/shop.js`; on touch the input is read-only and `CODE_KEYS` buttons type into it
  (pointerdown, so the double-tap blocker in `js/touch.js` can't eat taps).
- Unpinned BACK: the Shop, Inventory and Settings boxes have class `nopin`; the sticky rule skips them.
- Coins: `STYLE_PAY` and `payout()` in `js/save.js`, `QUICK_BONUS` and star pay in `js/campui.js`, `MINIS` pay and
  `MINI_BEST_BONUS` in `js/minigames.js`, `SALARY` / `SIGN_BONUS` in `js/campaign.js`.
- Daily: `js/daily.js` (`DAILY_REWARDS`, `CHALLENGES`, `CHALLENGE_CC`); `SAVE.daily`; `dailyEvent()` is called from
  `showResults()` and `mgEnd()`; `dailyAuto()` from `show("menu")`; `#daily` pop-up in index.html.

## How to work on it
- Test muted: `http://localhost:8791/?mute&device=touch` via the `courtside` preview config.
- The browser pane caches scripts hard: fetch every changed file with `{cache: "reload"}`, then reload.
- Back up `localStorage["courtside.save.v1"]` before testing and restore it after.
- The iPad keyboard can't be tested here; the code keyboard sidesteps it, but check it on the real iPad.

## What comes next
- David tests 6b on the iPad. Then the roadmap items in STATE.md.
