# Hand-off for the next session

_Written 2026-10-17 (session 2). Replace this file at the end of each session; don't add a second one._

## State of the repo
- `main` is the live site. Session 2 was signed off, merged and pushed; no open branches.
- `./tools/smoke.sh` passes.

## Read first
1. `CLAUDE.md` (rules, how to run, code map: new files js/hof.js, js/story.js, js/shop.js).
2. `STATE.md` for open questions. 3. `SPEC.md`. 4. `DECISIONS.md`.

## How to work on it
- Test muted: `http://localhost:8791/?mute` via the `courtside` preview config.
- The browser pane caches scripts hard: after edits, fetch each script with `{cache: "reload"}`, then reload.
- The pane stops animating when hidden; show it (show_pane "preview") to check CSS animations like the
  pack opening. Headless Chrome with `--virtual-time-budget` freezes CSS animations, so don't judge those there.
- Animation contact sheets: render previewAnim into canvases at chosen times (see session 2's sheet.html
  trick: a copy of index.html with `<base href>` pointing at the project, shot with headless Chrome).
- Story lines are plain data in js/campaign.js; characters and chatter lines in js/story.js.
- The campaign reset is `storyReset()` in js/save.js (bump `STORY_V` to reset again).

## What comes next
- David's answers to STATE.md's open questions.
- Real iPad/phone check; an outside playtest.
