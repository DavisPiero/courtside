# Brief: Career League (after the NBA campaign)

Status (2026-10-18, session 6c): a draft for David. Nothing here is built. Seasons are on the "out of scope"
list in CLAUDE.md; this brief is the case for lifting that, for this one mode.

## The idea in one line
Win the Finals and the story is over, but your hooper's career isn't: you keep playing **season after season** in
a 30-team league, chasing rings, awards and records, with your crew cheering you on.

## Why it's fun (the test it has to pass)
- **There's always a next game that matters.** Every game moves you up or down the standings.
- **Short.** A season is about 12 games, not 82. Each game is the campaign's four 30-second quarters, so a season
  is roughly half an hour.
- **Your choices stick.** You choose your team, chase a better contract, take a trade offer. The hooper you upgrade
  carries over from season to season.
- **Big moments come back every season:** a rivalry game, All-Star Weekend, the playoffs, a ring ceremony.

## How a season goes
1. **Pre-season.** Pick your team. You can stay, or take an offer from teams that want you; the better you played,
   the better the teams. You get a signing bonus and a new daily salary.
2. **Regular season: 12 games.** Your team plays 12 of the other 29. A standings table shows all 30 teams. Games
   you don't play are simulated in a second, from the players' ratings. Each game shows a recommended rating,
   like the campaign.
3. **All-Star Weekend (halfway).** If you're playing well you're voted in. You play the 3-point contest and the dunk
   contest as events, for a trophy and coins.
4. **Playoffs.** The top 8 by record. Best-of-3 series (best-of-5 for the Finals). Losing ends the season.
5. **Awards and the off-season.** MVP, Dunk of the Year, the scoring title. Ring count goes up if you won. Your
   rival changes teams, a new rookie shows up, then on to the next season.

## Getting harder
- Season 1 is All-Star. Every season after, the league's best teams get 1 to 2 rating points better, up to Hall
  of Famer. The adaptive AI (session 6c) still applies, so blowouts stay rare.
- Defending champions get "the target on their back": every team plays them a level harder.

## Rewards (all in-game coins, no real money)
| What | Reward (a first guess) |
|---|---|
| Regular-season win | the usual game coins + 50 |
| Make the playoffs | 500 CC |
| Each series won | 750 CC |
| Ring | 2000 CC + a Legendary pack |
| MVP / All-Star | 1000 CC / 400 CC |
| Records (most points in a game, and so on) | a badge on your hooper card |

## Story, kept light
- Coach Ray becomes your actual coach after the Finals ("Twenty years, no ring. Then you showed up.").
- Dex and Big Lou open a sneaker shop with your first ring money, which ties into the shoes.
- Zeke Knox stays the rival: he signs wherever you didn't, and you meet him in the playoffs most seasons.
- Short scenes only at the big moments: season start, All-Star, playoffs, ring night. Most games have none.

## Screens it needs
- **Season hub:** next game, record, standings (top 5 and your team), "simulate other games" happens on its own.
- **Standings and schedule:** all 30 teams, a playoff line drawn at 8th.
- **Playoff bracket:** the 8 teams, series scores.
- **Trophy room:** rings, awards and records (overlaps with idea 6 in BRIEF-ideas.md).

## What it needs under the hood
- The save grows: season number, schedule, results, standings, awards, ring count. Still browser storage only.
- A quick result sim for games you don't play: team ratings plus some luck. No game engine needed.
- No new court or engine work. It reuses Quick Play's game, the campaign's results screen and the minigames.

## Size
Two sessions:
1. The season loop: schedule, standings, sim, playoffs, rings.
2. All-Star Weekend, awards, the story scenes, the trophy room.

## Questions for David
1. Should 12 games a season and best-of-3 playoffs (best-of-5 Finals) be shorter or longer?
2. Do teams outside yours get today's rosters, or can players move between teams over the seasons (trades)?
3. Does your hooper age and retire one day, or play forever?
4. Can you start the Career League straight away, or only after winning the NBA campaign? (Draft: only after.)
5. Is "Career League" the right name? Other options: "The Dynasty", "Legacy Mode".
