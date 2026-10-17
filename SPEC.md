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
- **STREET, "King of the Courts"**: street courts, Mayhem games allowed. The Block, The City, The
  Summer Jam. Rival: Tank.
- **NBA, "Road to the Ring"**: arenas and NBA teams, professional rules only (never Mayhem).
  Undrafted tryout with Coach Ray: Summer League, The League, The Finals.
Each has 3 chapters x 6 games with a story card and 3 stars (win, twist goal, style goal). Winning
unlocks the next game. Beating a chapter's boss for the first time unlocks that chapter's Legendary
animation (shown on the chapter map). Your crew (you, Dex, Big Lou) improves with every boss beaten.

## Court Coins (CC), the Shop and the Inventory
Earn CC for winning and for style (perfect releases, dunks, ankle breakers, threes, steals, blocks),
plus new stars and first wins in the campaign. Spend them in the **Shop** on packs that contain
random animations: Street (150 CC, 1 card), Pro (400, 2, one Rare+), All-Star (900, 3, one Epic+),
Hall of Fame (2000, 3, one Legendary). Odds are shown on every pack. Duplicates turn into coins.
37 animations in five categories (dunks, layups, dribble moves, jump shots, celebrations), each
Common, Rare, Epic or Legendary; better ones are flashier. The **Inventory** only equips what you
own (one per category, up to 3 extra dribble moves) and shows what's still locked. No real money, ever.

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
