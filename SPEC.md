# Courtside: spec

## What makes it fun
- **Fast, no-rules basketball.** Possessions are short, the rim is always close, and big
  moments (dunks, ankle breakers, a punch that drops someone) land hard and are over fast.
- **Every press does something you can see.** Dribble moves, slides and shots read
  clearly on the player model, so you feel in control.
- **A choice of feel.** Mayhem for chaos, Clean for straight basketball, and four
  difficulty levels so a beginner and an expert both get a good game.

## Modes and options (chosen on the setup screen)
- **Mode:** Mayhem (punch, slide, blood) or Clean (no punch, slide or blood: just dribble,
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
- Only the player you control has a name, floating above their head. No names or numbers
  on any jersey.
- Steals are instant: no steal cutscene. Dunk cutscenes are short (about 1.5 seconds).
- Dribble moves (E) cycle through crossover, between the legs, behind the back and spin,
  each animated on the model.
- No music for now (removed 2026-10-17). Sound effects only.

## Not building
Fouls, free throws, out of bounds, substitutions, seasons/franchise, online play, touch
controls, more than 3v3.
