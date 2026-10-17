# Hand-off for the next session

_Written 2026-10-18 (session 4). Replace this file at the end of each session; don't add a second one._

## State of the repo
- Session 4 is merged to `main` and pushed (live). No open branches.
- `./tools/smoke.sh` passes; it now also plays the 3-point contest, dunk contest and 1-on-1 with the AI.

## Read first
1. `CLAUDE.md` (code map has 5 new files). 2. `STATE.md` for open questions. 3. `SPEC.md` (new Minigames and
Showtime sections). 4. `DECISIONS.md`.

## How to work on it
- Test muted: `http://localhost:8791/?mute&device=pc` via the `courtside` preview config.
- The browser pane caches scripts hard: fetch every script with `{cache: "reload"}`, then reload.
- A hidden pane pauses the game: set `pause = () => {}` and drive it by hand: `step(1/120); T += 1/120;`.
- Back up `localStorage["courtside.save.v1"]` before testing and restore it after (testing writes `SAVE.hooper`).
- Players can be left out of a game with `p.gone = 1` (minigames, tutorial); `park()` keeps them off court.
- `G.mg` is the running minigame, `G.win` the win celebration, `G.bb` a live buzzer shot, `G.fire[t]` On Fire.
- New dunks with special motion go in `RIM_FX` (js/anim.js): high, slow, spin (count), glide, honey, trail, turn.
- `styleOf()` returns the dunk-contest round's dunk while one is running.

## What comes next
- David's notes and answers to STATE.md's open questions.
- Phone/iPad check (the tutorial panel and OOP button on touch especially) and an outside playtest.
