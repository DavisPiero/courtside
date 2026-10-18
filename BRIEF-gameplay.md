# Brief: making the core game more fun, for longer

Status (2026-10-18, session 6): ideas only. Nothing here is built until David picks it.

The test for "timeless": **a game with nothing unlocked, no coins and no story should still be fun to
play again tomorrow.** Packs, shoes and the campaign keep you coming back, but the minute-to-minute
basketball has to carry the game on its own. Games that last (NBA Jam, Rocket League, Mario Kart) all have
three things: controls that feel good in your hands, simple choices that beat each other, and moments
you want to tell someone about.

## 1. Controls that feel fluid (already planned for session 6c)
What David means by "ragdolly": the player flows from one thing to the next, never stuck in an animation.
- **Momentum.** Players speed up and slow down over a few frames instead of starting and stopping dead,
  and lean into turns. Sprinting into a dribble move or a shot carries that speed into it.
- **Cancel windows.** The last part of a dribble move can go straight into a shot, a pass or another move.
  Chaining moves is the skill a good player learns.
- **Buffered presses.** A press just before a move ends still counts, so nothing feels dropped.
- **Instant response.** Every press shows on the model the same frame (a dip, a lean), even if the move
  itself takes longer.
- **Ragdoll only where it lands hardest:** an ankle breaker (the defender's legs go, they flop and get up)
  and a punch (they drop). No hit-freeze and no glitch effect (David).

## 2. Choices that beat each other
Right now most attacks work against most defence. Make each one have an answer, so you read the defender
instead of mashing:
- **Shot vs contest:** already there (a close defender shrinks the green). Show it more clearly: the green
  zone visibly shrinks as they close.
- **Dribble move vs steal:** a steal attempt during a dribble move fails and stumbles the defender (an
  ankle-breaker chance); a steal while you stand still works more often. Moving the ball becomes the answer
  to a reaching defender.
- **Drive vs staying in front:** a defender squared up in your path stops a straight drive, so you need a
  move or a pass first.
- **Same move twice:** the AI starts to read a move you repeat, so variety pays.

## 3. Defence you want to play
Defence is the half kids skip. Give it its own big moments:
- **Perfect block:** jump at the right time and the ball gets swatted into the crowd, with the same kind of
  "PERFECT!" the shot meter gives.
- **Perfect steal:** a well-timed steal starts a fast break with your teammates already running.
- **Switch is quick:** the right player is selected without thinking (the closest to the ball).

## 4. Big moments, often
- **Sudden death:** a tied game goes to "next basket wins". Every tie ends in a shot to remember.
- **Game-winners in slow motion:** like buzzer beaters, for any go-ahead basket in the last 5 seconds.
- **A replay of the best play** after the game (a short loop, no menus).
- **The crowd reacts** to runs and comebacks (louder, standing), so the arena feels the momentum.

## 5. Variety without new content
- **Quick Play twists** (optional, one at a time): first to 21, dunks count 3, no threes, giant ball.
- **Courts that play differently**, a little: wind at the beach nudges long shots, the street court is
  slippery after rain. Small enough not to feel unfair.

## 6. Playing with someone
- **Two players on one device** (keyboard split, or two thumbs each on a tablet) is the most timeless idea
  here: kids remember games they played *with someone*. It isn't on the "not building" list (only online
  play is), but it's a big job. **David's call.**

## What I would build first
1. Fluid controls and the ankle-breaker/punch ragdoll (session 6c, already agreed).
2. Choices that beat each other: dribble move vs steal, and the visible shrinking green.
3. Perfect blocks and perfect steals.
Then decide on two-player.

## How we'd know it worked
The smoke test's bot already plays every court and level. Add numbers it reports per game:
- **Lead changes** (more is better), and **how close games finish** at Pro (most within 6 points).
- **Where points come from** (dunks, layups, mid-range, threes): no single one over half.
- **Possession length** (short, around 8 to 12 seconds, matches "fast, no-rules").
And the real test: put it in front of a new player and watch where they smile and where they stop.
