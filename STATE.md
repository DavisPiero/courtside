# Courtside: state

_Updated 2026-10-17._

## Where we are
Branch `overhaul` holds the whole first round of David's notes, not yet merged. `main`
(the live site at https://davispiero.github.io/courtside/) is still v1.0.

Done on `overhaul`:
- Code split into readable files (`js/`, `css/`); startup freeze fixed.
- Steals are instant; dunk replay is 1.65 s (was about 4.2 s).
- Your controlled player's name floats above their head; no names or numbers on jerseys.
- Setup screen after `Reference/`: split-screen teams, Mayhem/Clean, Arena/Street, four difficulties.
- Clean mode switches off punch, slide and blood. Difficulty tunes the opponent AI.
- Street court: dusk skyline, chain-link fences, asphalt, pole hoops, chain nets.
- Better models: size by position, neckline, ears, face, run cycle, landing, pass and swipe poses.
- Four dribble moves on E (crossover, between the legs, behind the back, spin), never the same twice running.
- Cleaner UI everywhere. Music: five CC BY beats by Kevin MacLeod, credit bottom left.
- Smoke test `./tools/smoke.sh`; `?mute` in the address for silent testing.

## Next
- David plays it and signs off (or sends notes). Then merge to `main` and push.
- First outside playtest: one person who has never seen it; note where they get stuck.

## Open with David (guesses until confirmed)
1. Music is instrumental hip-hop/trap beats, not rap with vocals (couldn't check lyrics for a kids' game).
2. Ankle-breaker stuns stay in Clean mode (they're basketball, not mayhem).
3. Team OFF/DEF ratings on the setup screen are worked out from player ratings (invented formula).
4. Hall of Famer may be too hard: in bot-vs-bot tests it wins by 10+ points a quarter.
5. Music streams from incompetech.com, so it needs internet. Downloading the files into the repo would fix that.
