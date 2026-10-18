# Courtside: state

_Updated 2026-10-18, session 6b in progress on branch `session6b` (not merged)._

## Where we are
`main` (live) has sessions 1 to 6a. 6a is David's first batch of session-6 notes:
- Screens no longer shrink to fit. Every panel is full size, scrolls when it's taller than the screen, and keeps
  its buttons pinned at the bottom. The Shop, Inventory and Settings stay one size on every tab.
- Code box: fixes for iPad typing (text selection, the iPad Enter key, no autocorrect, auto capitals).
- Bloom is off by default (switched off once for old settings) and about half as strong when it's on.
- Main menu: one big yellow PLAY button that opens Campaign, Quick Play and Minigames.
- Quick Play: mode, court and difficulty are chips that open a pop-up.
- On Fire: red outline on the players and ball, the meter glows orange with ON FIRE, and an orange flash.
- Code SNEAKERHEAD: the Gametime "Launched" sneaker plus a free Premium Shoebox.
- BRIEF-gameplay.md: ideas for making the core game more fun for longer.
Smoke test passes (all modes, courts, levels, minigames; fit check at 5 sizes, now also same size across tabs).

## On the branch (6b, waiting for David)
- Main menu no longer cut off on iPad; fit check now catches anything clipped sideways.
- PLAY slides the buttons left and brings in CAMPAIGN / QUICK PLAY / MINIGAMES / BACK (the PLAY screen is gone).
- Codes on touch: Courtside's own on-screen keyboard; "ENTER A CODE" heading above the box.
- Shop, Inventory, Settings: BACK sits at the end of the page instead of following the scroll.
- Every coin reward up about 25%. BRIEF-ideas.md: 13 ideas for new things.

## Next
- David checks 6a on the real iPad, above all the code box.
- Later (was 6b): tutorial lessons 9 onwards as real drills; better pack and shoebox opening and shoebox
  models; 12 more shoes and 16 more animations.
- 6c: fluid controls, with ragdoll only for ankle breakers and punches (no hit-freeze or glitch); rebuild
  The Cage (a fenced night cage under the bridge, green and teal, pillars, trains overhead, a burning barrel).
- First outside playtest (still not done).

## Open with David (guesses until confirmed)
0. Which ideas from BRIEF-ideas.md to build (my pick: daily challenges and win streak).
1. Launched look: purple and black high-top, orange rocket-flame stripe, glowing purple sole (my guess).
2. Which ideas from BRIEF-gameplay.md to build, and whether to do two players on one device.
3. Carried over: punch penalty, upgrade, shoebox and shoe prices, Gametime purple vs Epic, shoe art and
   trophy as first passes, minigame rewards, no buzzer replay.
4. The 3-point contest bot scores 0 in the smoke test (it did before this session too): the bot, not the game,
   as far as I can tell. Not looked into yet.
