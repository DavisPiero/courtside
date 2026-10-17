# Courtside: state

_Updated 2026-10-17 (session 3)._

## Where we are
Branch `overhaul` holds two rounds of David's notes, not yet merged. `main` (the live site at
https://davispiero.github.io/courtside/) is still v1.0.

Round 2, done on `overhaul`:
- Music removed.
- Settings (Play, Practice, Settings on the main menu; also in pause): video effects, audio,
  gameplay, controls. Saved in the browser.
- Crisp pixel-art look: whole-pixel scaling, pixel UI font (Jersey 10), coloured outlines and rim
  light on players, bloom, fog, lighting, colour grade, vignette, scanlines, grain, all toggleable.
- All 30 teams, three popular players each (2026-27 rosters), with ratings that drive play.
- Defence shrinks your green zone (more on harder levels); the AI no longer blocks your jumpers;
  tall players are hard to block.
- Realistic proportions scaled by real height; buzz/bald/afro hair; jump-shot dip; defensive shuffle.
- Brief for campaign, currency and accounts: BRIEF-campaign.md (nothing built).

## Next
- David plays it and signs off, then merge to `main` and push.
- First outside playtest (still not done).
- Campaign, per BRIEF-campaign.md, once David answers its questions.

## Open with David (guesses until confirmed)
1. Player ratings, heights and skin tones are Claude's estimates (js/teams.js; easy to edit).
2. "Most popular" picks are Claude's judgement, e.g. Bronny over Walker Kessler for the Lakers.
3. Ankle-breaker stuns stay in Clean mode.
4. Team OFF/DEF rings: OFF = shooting, finishing, handling; DEF = defence (x2) and blocking.
5. Choosing from 30 teams is by arrows only; a team grid may be needed.
6. Brief questions: currency name, password-recovery choice, Supabase account.
