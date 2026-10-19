# Hand-off for the next session

_Written 2026-10-19 (session 7). Replace this file at the end of each session; don't add a second one._

## State of the repo
- Branch `session7`, committed, **not merged** (David hasn't signed it off). `main` is session 6d and live.
- `./tools/smoke.sh` passes. Bench at default size: about +39 / +11 / -6 / -17 (noise around 6d's numbers).

## Read first
STATE.md, then `supabase/README.md` if David hasn't run the setup yet. If he has, test a real sign-up with him.

## What changed (where to look)
- Size: `SIZE`, `sizeFx()`, `sizedRow()`, `drawSize()`, `sizeStep()` in js/hooper.js; `SAVE.hooper.ht/wt`. In games:
  row slot 14 is weight; `mass()` / `downFor()` and the push share in `separate()` (js/gameplay.js); body width in
  js/players.js. Bench builds: `SIZE=84,300 ./tools/bench.sh 10`.
- Accounts: js/account.js (`ACC`, `accAuth` → `accAttach` merges, `accDirty` / `accPush` sync with a revision check,
  the pop-up `drawAcct`). js/save.js: `saveFresh`, `saveLoadFrom`, `saveHasProgress`, `saveMerge`, `writeSave(quiet)`.
  Device owner in `localStorage["courtside.acct"]`. Tests set `ACC.state = "off"` and never load the library.
- Supabase: `supabase/setup.sql` (profiles, saves, row rules, `username_free`, `delete_me`, the new-player trigger).
  Library pinned to supabase-js 2.117.2 with an SRI hash in js/account.js; a new version needs a new hash
  (`openssl dgst -sha384 -binary file | openssl base64 -A`).
- League: js/league.js (season data in `SAVE.league`, `leagueNew`, `leagueSign`, `startLeague`, `leagueRecord`,
  playoffs), js/leagueui.js (hub), `#league` in index.html, `G.league` set by `startLeague` and cleared by every
  other way into a game. Results: `showResults()` reads `G.league.extra`. Smoke plays a season on Rookie with the
  bench bot so it reaches a ring.

## How to work on it
- Test muted: `http://localhost:8791/?mute&device=touch` via the `courtside` preview config.
- The browser pane caches scripts hard: fetch every changed file with `{cache: "reload"}`, then reload.
- Back up `localStorage["courtside.save.v1"]` before testing and restore it after; clear `courtside.acct` too.
- I can't create real accounts; David does the first real sign-up. The iPad keyboard for email/password is untested.

## What comes next
David runs the Supabase setup and tests accounts, then signs off session 7. Then league part 2 or two players on
one device (BRIEF-online.md step 1): David picks.

## Open questions for David
See STATE.md "Open with David" (size effects, account behaviour, league numbers, the online brief's four
questions, and the carried-over list).
