# Courtside: state

_Updated 2026-10-17 (session 4)._

## Where we are
Branch `overhaul` holds three rounds of David's notes, not merged or pushed. David reviews first,
then we push. `main` (the live site, https://davispiero.github.io/courtside/) is still v1.0.

Round 3, done on `overhaul`:
- Loading screen (spinning pixel ball), then Computer or Mobile / Tablet.
- Team select starts on Clean; hover/tap tips for Clean and Mayhem. Plain white name tag.
- Campaign "Streets to the League": your hooper, 5 chapters x 6 games, story cards, 3 stars each.
- Court Coins (CC) for winning and style; results screen with stars and payout.
- 17 animation packs (dunks, dribble moves, celebrations, shot forms) in the Inventory,
  with buy, equip and a live preview. Packs change the real in-game animations.
- Touch controls: floating joystick, context-sensitive buttons, Mayhem buttons, pause, camera,
  tap to skip. Bigger touch menus, compact phone layout, turn-sideways prompt.

Tested: smoke test passes (every mode/court/difficulty); campaign flow, results, buying and
equipping, every pack preview, every dunk pack in a real dunk; touch controls by scripted touches
at phone (844x390) and iPad (1180x820) sizes. Not tested: a real phone or iPad in hand.

## Next
- David reviews (ideally on a real iPad and phone), then push.
- First outside playtest, still not done.

## Open with David (guesses until confirmed)
1. Campaign story, opponents, goals and rewards are invented (js/campaign.js).
2. Pack prices (150-500 CC) and earnings (~60-170 CC a game) are first guesses.
3. Your crew mates are named Dex and Big Lou.
4. Earlier guesses still open: player ratings and skin tones, "most popular" picks, ankle breakers in
   Clean mode, team OFF/DEF formula, arrows-only team picking.
