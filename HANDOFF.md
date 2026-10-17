# Hand-off for the next session

_Written 2026-10-17. Replace this file at the end of each session; don't add a second one._

## State of the repo
- Branch `main` only, clean, pushed to https://github.com/DavisPiero/courtside (public).
  GitHub Pages serves `main` at https://davispiero.github.io/courtside/ (rebuilds ~1 min after a push).
- `./tools/smoke.sh` passes (headless Chrome, plays every mode/court/difficulty).
- `Reference/` (David's 2K screenshots) is git-ignored and must stay unpublished.

## Read first
1. `CLAUDE.md`: rules, how to run (`?mute`, `&device=pc|touch`), code map.
2. `STATE.md`: where we are and the open questions.
3. `SPEC.md`: what makes it fun, every feature, what we're not building.
4. `DECISIONS.md`: one line per decision so far.
5. `BRIEF-campaign.md`: section 3 has the online-accounts plan (not built).

## How to work on it
- New branch per round; merge to `main` only when David signs off (main is the live site).
- Test muted: `http://localhost:8791/?mute` via the `courtside` preview config.
- Animations: edit keyframes in `js/anim.js`, check in Settings > Animation Lab at 1/4 speed.
- The browser pane stops drawing frames when hidden; to test gameplay there, step the game by
  hand from the console (`step(1/120)`), as the session did.

## What comes next
- David's review on a real iPad/phone (the double-tap zoom fix is unproven on iOS).
- An outside playtest with someone new.
- Whatever David's next notes are; online accounts only when he asks.

## Open questions for David
1. Are the Shop prices, odds and duplicate refunds right? (js/packs.js)
2. Are the campaign stories, invented crews, Coach Ray, and the chapter Legendaries right?
3. Are the player ratings, heights, skin tones and "most popular" picks right? (js/teams.js)
4. Should ankle-breaker stuns stay in Clean mode?
5. Is the OFF/DEF ring formula fine, and should team picking get a grid instead of arrows?
6. Is Hall of Famer too hard?
