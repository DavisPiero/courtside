# Courtside: state

_Updated 2026-10-18, session 6b, merged to `main` and live (David: merge and push without waiting)._

## Where we are
`main` (live) has sessions 1 to 6b. 6b:
- Main menu no longer cut off on iPad; the fit check now fails on anything clipped sideways.
- PLAY slides the buttons left and brings in CAMPAIGN / QUICK PLAY / MINIGAMES / BACK (no PLAY screen any more).
- Codes on touch use Courtside's own on-screen keyboard; "ENTER A CODE" heading above the box.
- Shop, Inventory, Settings: BACK sits at the end of the page instead of following the scroll.
- Every coin reward up about 25% (prices unchanged).
- DAILY: a 7-day reward ladder and three daily challenges, from a button by the coins on the main menu.
- BRIEF-ideas.md: 13 ideas for new things.
- Roadmap items done the same day: tutorial steps 9 to 12 are real drills; pack and shoebox opening reworked
  (rip strip, light that hints at rarity, three pixel shoebox models, lid blasts off); 12 more shoes (45) and
  16 more animations (100).
Smoke test passes (all modes, courts, levels, minigames; fit check at 5 sizes including the DAILY pop-up).

## On the branch `session6c-difficulty` (not merged)
- Every difficulty is harder, plus adaptive AI; `tools/bench.sh` measures it (bot margins +37 / +17 / +3 / -13,
  down from +88 / +69 / +62 / +43).
- Code BIG LEAGUE (2000 CC) and a SPACE key on the code keyboard.
- BRIEF-league.md: a draft of the Career League after the NBA campaign.

## Next
- David checks 6b on the iPad: the code keyboard, the menu, the DAILY pop-up.
- 6c: fluid controls, ragdoll only for ankle breakers and punches; rebuild The Cage.
- First outside playtest (still not done).

## Open with David (guesses until confirmed)
- Is the new difficulty right in his hands? The bench bot is a guess at a good kid; tune DIFF in js/core.js.
- The questions at the end of BRIEF-league.md.
1. Daily numbers: reward ladder (100, 150, Street Pack, 250, Shoebox, 400, All-Star Pack) and challenge pay
   (75 / 100 / 150). A missed day doesn't reset the ladder (my guess).
2. Which other ideas from BRIEF-ideas.md and BRIEF-gameplay.md to build; two players on one device.
3. Carried over: punch penalty, upgrade, shoebox and shoe prices, Gametime purple vs Epic, shoe art and
   trophy as first passes, minigame rewards, no buzzer replay.
4. New shoes, animations and their rarities are my picks; Scorpion dunk's heel kick is milder than I wanted
   (the legs can only reach so far). The Griddy replaced Push-Ups.
5. The 3-point contest bot scores 0 in the smoke test (the bot, not the game, as far as I can tell).
