# Courtside: spec

## What makes it fun
- **Fast, no-rules basketball.** Possessions are short, the rim is always close, and big
  moments (dunks, ankle breakers, a punch that drops someone) land hard and are over fast.
- **Every press does something you can see.** Dribble moves, slides and shots read
  clearly on the player model, so you feel in control.
- **A choice of feel.** Mayhem for chaos, Clean for straight basketball, and four
  difficulty levels so a beginner and an expert both get a good game.

## Start-up
Loading screen with a spinning pixel basketball, then "How are you playing?": Computer (keyboard
and mouse) or Mobile / Tablet (touch controls). Main menu: Campaign, Quick Play, Practice,
Inventory, Settings, plus your Court Coins.

## Campaigns
Create your hooper (name, skin, hair), then choose your road:
- **STREET, "King of the Courts"**: street courts, Mayhem games allowed. You're the new kid on the block;
  Dex and Big Lou are your crew. The Block, The City, The Summer Jam. Rivals: Tank (becomes a friend), then
  King and the Kings, who try to poach Dex.
- **NBA, "Road to the Ring"**: arenas and NBA teams, professional rules only (never Mayhem). Undrafted;
  Coach Ray (never won a ring) gives you a tryout. Summer League, The League, The Finals. Rival: Zeke Knox,
  a made-up lottery pick (Washington, then traded to OKC for the Finals).
Each has 3 chapters x 6 games with 3 stars (win, twist goal, style goal). Winning unlocks the next game.
**The story is told in scenes**: two characters on screen, the speaker steps forward in a pose that fits the
line, text types out, tap to go on, SKIP to jump. Each chapter opens with a title card and scene (once; replay
with CHAPTER STORY), every game has a scene before it and after it (win or loss), and beating a boss plays the
chapter's ending. During campaign games your crew, Coach Ray, the announcer and the rival talk in a speech
bubble under the scoreboard (dunks, ankle breakers, comebacks, half time, close finishes).
Beating a chapter's boss for the first time unlocks that chapter's Legendary animation. Your crew improves with
every boss beaten. Campaign progress was reset once for the new story (2026-10-17); coins and animations kept.

## Court Coins (CC), the Shop and the Inventory
Earn CC for winning and for style (perfect releases, dunks, ankle breakers, threes, steals, blocks), plus new
stars and first wins in the campaign, plus 100 CC for every finished Quick Play game. The **Shop** has three tabs:
- **Daily Shop**: five single animations (a featured Iconic or Legendary, an Epic, two Rares, a Common), the
  same for everyone on the same day, new at local midnight with a countdown. Prices: Common 120, Rare 300,
  Epic 700, Legendary 1400, Iconic 2000.
- **Packs**: random animations with the odds shown: Street (150 CC, 1 card), Pro (400, 2, one Rare+),
  All-Star (900, 3, one Epic+), Hall of Fame (2000, 3, one Legendary). New animations 3x as likely.
- **Player Packs** (1200 CC): Jordan, Kobe, Curry, Iverson, Shaq, LeBron. One of that player's three ICONIC
  signature moves plus a bonus card (Rare 60%, Epic 32%, Legendary 8%).
**Opening a pack** is a show: the pack shakes and tears, cards deal out face down, and you tap each one. A card
shakes and its glow climbs through the rarity colours (with a rising tick) before it flips; sometimes a low card
flickers one step higher first. Epic and up flash; Legendary and Iconic shake the screen, burst confetti and
show a banner. REVEAL ALL plays them quickly. Duplicates turn into coins.
71 animations in five categories (dunks, layups, dribble moves, jump shots, celebrations): Common, Rare, Epic,
Legendary, and 18 Iconic. The **Inventory** only equips what you own (one per category, up to 3 extra dribble
moves). No real money, ever.

## Animation
Every move is a keyframed clip with eased timing, blended and smoothed so nothing snaps; moves are
exaggerated so they read in pixel art. Settings > Animation Lab shows any move at 1×, ½× or ¼× speed
from the front, side or back.

## Touch controls
Floating joystick on the left (edge = sprint), right-thumb cluster: one big button plus two, with
labels that change with possession (SHOOT/PASS/MOVE, or JUMP-BLOCK/SWITCH/STEAL). Punch and Slide
in Mayhem only. Pause and camera top-left. Bigger menus on touch; compact layout on phones;
"turn sideways" prompt in portrait. No accidental zoom: double taps and pinches are blocked, and the
page snaps back if a browser zooms anyway.

## Modes and options (chosen on the setup screen)
- **Mode:** (starts on Clean; hover or tap for a description) Mayhem (punch, slide, blood) or Clean (no punch, slide or blood: just dribble,
  pass, shoot, steal, block). Ankle-breaker stuns from dribble moves stay in both.
- **Court:** Arena (official indoor court, crowd, jumbotron) or Street (asphalt, chain-link
  fences, pole hoops, chain nets, no crowd).
- **Difficulty:** Rookie (easy), Pro (normal), All-Star (hard), Hall of Famer (expert).
  Changes opponent speed, shooting, steal attempts, defensive tightness and decisions.
- **League:** a switch at the top: NBA (today's teams) or HALL OF FAME (each franchise's three best players
  of all time, rated at their peak, in js/hof.js). Click a team's name for a grid of all 30.
- **Quick Play length:** four 1-minute quarters.
- **Teams:** all 30 NBA teams (2026-27), each team's three most popular players, split-screen select
  (see `Reference/`). Each player's height, speed, shooting, finishing, handling, defence and blocking
  shape how they play.
- **Shooting:** the shot meter's green zone shrinks as defenders close in, more on harder difficulties.
  The AI doesn't block your jump shots; tall players are hard to block.
- **Settings:** video (pixel size, lighting, fog, bloom, reflections, colour grade, vignette, scanlines,
  grain, shake), audio, gameplay (camera, name tag, shot meter), controls. Saved in the browser.

## Presentation rules
- Crisp, high-res pixel art: the world renders at low resolution and scales by whole pixels. Pixel UI
  type (Jersey 10) that stays readable. Realistic body proportions, scaled by each player's real height.
- Only the player you control has a name, in plain white pixel letters above their head. No names
  or numbers on any jersey.
- Steals are instant: no steal cutscene. Dunk cutscenes are short (about 1.5 seconds).
- Dribble moves (E) cycle through crossover, between the legs, behind the back and spin,
  each animated on the model.
- No music for now (removed 2026-10-17). Sound effects only.

## Not building
Fouls, free throws, out of bounds, substitutions, seasons/franchise, online play or accounts (for
now), real-money purchases (ever), more than 3v3.
