# Courtside: state

_Updated 2026-10-19, session 7, merged to `main` and live (David signed it off)._

## Where we are
`main` (live) has sessions 1 to 7. Session 7 added:
- **Hooper height and weight** on EDIT HOOPER (5'6" to 7'0", 150 to 300 lb) with trade-offs, a SIZE box and a body
  drawn to match. Bench: no build is clearly best.
- **Accounts** (Supabase): ACCOUNT button on the main menu; create account (email, username, password), sign in,
  forgot / change password, sign out, delete account; the save syncs to the account; guest progress is added on
  sign-in. David ran the Supabase setup (checked: username check answers, tables refuse signed-out visitors);
  no real account has been made yet.
- **Career League part 1**: a third card on the Campaign screen (after winning the NBA Finals). Pre-season offers,
  12 games, standings, simulated games, playoffs, rings, rewards.
- **BRIEF-online.md**: the plan for online 1-on-1 with friends.
Smoke test passes (every mode, court, level, minigame, a whole league season to a ring; fit check at 5 sizes
including the ACCOUNT pop-up and the league hub).

## Next
1. David makes the first real account on the live site and tries signing in on the iPad.
2. Career League part 2 (All-Star Weekend, awards, story scenes, trophy room), or the first step of
   BRIEF-online.md (two players on one device). David picks.
3. Still waiting: the iPad check of 6b, the first outside playtest.

## Open with David (guesses until confirmed)
1. Height/weight effects and their sizes are my guesses (js/hooper.js `sizeFx`). Does 7'0" feel right in a game?
2. Accounts: email confirmation on; signing out wipes the device (keeps today's daily); two devices: newest cloud
   save wins. Coins from a code used in both saves pay once.
3. League numbers: rewards, difficulty steps, +1.5 a season for the best ten, 90 to 99 recommended rating.
4. BRIEF-online.md questions: court for online games, coins for online games, where challenges can pop up, emotes.
5. Carried over: difficulty in his hands, daily numbers, which ideas from BRIEF-ideas.md next, punch penalty and
   prices, Scorpion dunk, the 3-point contest bot scoring 0 in the smoke test.
