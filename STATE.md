# Courtside: state

_Updated 2026-10-17, end of session 1 (six rounds of notes)._

## Where we are
Everything is merged to `main`, pushed, and live at https://davispiero.github.io/courtside/.
No open branches. Smoke test passes on every mode, court and difficulty.

The game now has: a loading screen and Computer / Mobile-Tablet choice; Street and NBA campaigns
(3 chapters x 6 games each, Legendary reward per chapter); Quick Play with all 30 NBA teams and
stat-driven players; Clean / Mayhem; arena and street courts; 4 difficulties; Court Coins; a Shop
of random animation packs with rarities; an equip-only Inventory; 41 animations on a keyframe
system; an Animation Lab; settings for video effects; touch controls; a pixel-art look.

## Next
- David tests on a real iPad and phone, especially fast double-taps (zoom fix not proven on iOS).
- First outside playtest, still not done: one new player, note where they get stuck.
- Online accounts: brief exists (BRIEF-campaign.md, section 3); not started by David's choice.

## Open with David (guesses until confirmed)
1. Pack prices, odds, duplicate refunds and the 3x bonus for new animations (js/packs.js).
2. Campaign stories, crews (The Twins, Skywalkers, Old School, Neon Nights, The Kings), Coach Ray,
   and which Legendary each chapter gives (js/campaign.js).
3. Player ratings, heights and skin tones are estimates; "most popular" picks are judgement (js/teams.js).
4. Ankle-breaker stuns stay in Clean mode.
5. Team OFF/DEF ring formula; choosing among 30 teams is arrows only (a grid may be better).
6. Hall of Famer difficulty may be too hard (AI wins by 10+ in bot tests).
