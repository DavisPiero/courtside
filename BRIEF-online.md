# Brief: online 1-on-1 with friends

Status (2026-10-19, session 7): a brief for David. Nothing here is built. It builds on the accounts made in session 7
(Supabase: email, username, password). Online play is still on CLAUDE.md's "out of scope" list until David says go.

## The idea in one line
Challenge a friend by username, and play the 1-on-1 minigame against them live: your hooper against theirs, on The
Cage, first to 11.

## Why it's fun (the test it has to pass)
- **It's your hooper against your friend's.** The upgrades, size, dribble moves, dunks and shoes you've collected
  are what you bring. Bragging rights are the point.
- **Short.** First to 11 is three or four minutes. Easy to say "one more".
- **It has to feel like the offline game.** If a steal or a block feels late, it isn't fun. That is the whole
  difficulty of this feature (see "Lag" below).

## How a match goes (what the player sees)
1. **FRIENDS** (a new tab on the ACCOUNT pop-up): type a friend's username, SEND REQUEST. They accept on their side.
   Only friends can challenge you. No strangers, no search, no public lists.
2. **CHALLENGE**: next to a friend who is online (a green dot), press CHALLENGE. They get a pop-up on their menu:
   "ARLO_7 wants to play 1-ON-1. ACCEPT / NOT NOW". It expires after 30 seconds.
3. **Connecting** screen (a few seconds): both hoopers side by side with their ratings, a "connection" bar (green,
   yellow, red).
4. **The game**: the 1-on-1 minigame as today, but the other player is a person. A small ping number in a corner.
5. **Results**: the winner, the score, both players' stats. REMATCH or BACK. Coins for playing (a first guess: 50
   for a win, 15 for a loss, and only for the first 5 online games a day, so it can't be farmed with a friend).
6. **Emotes, not chat**: four buttons (GG, NICE!, WOW and a pixel face). No typing to each other, ever.

## How it works underneath (plain language)
**Supabase finds the other player; the two games then talk directly.**
- **Friends and challenges** are rows in the database, protected by the same row rules as saves (you can only see
  your own friends and challenges). Supabase **Realtime** (built in, free) tells your game the moment a challenge
  arrives and shows who is online ("presence").
- **The match itself** runs over a **direct connection between the two browsers (WebRTC)**. Supabase only passes the
  first "here's how to reach me" messages. Direct is the fastest possible route and costs nothing.
- **Some home networks block direct connections.** Then the game falls back to a relay server (called TURN). A free
  public one is fine for testing; for real use, a paid one (Cloudflare or Twilio) costs pennies at this size.
- **One game is the host** (whoever sent the challenge). The host runs the real game, exactly as the game runs today.
  The other game sends its button presses 60 times a second and draws what the host sends back.

## Lag: the hard part
The guest presses STEAL, the press travels to the host (say 40 ms), the host's answer travels back (another 40 ms).
Without help, the guest's player would react a tenth of a second late, every time.
- **Prediction**: the guest's game moves its own player straight away, as if the host had already agreed, and
  quietly corrects if the host disagrees. Running and dribbling feel instant.
- **Smoothing**: the other player and the ball are drawn a fraction behind, sliding between updates, so nothing
  jumps.
- **Fair calls**: for steals, blocks and shot timing, the host checks what the guest saw when they pressed (it
  "rewinds" by the guest's lag). So a good steal on the guest's screen is a steal.
- **The shot meter** is timed on the shooter's own device and the result sent to the host, so a perfect release
  always counts.
- **Host advantage** remains a little. That's normal, and fine between friends. REMATCH swaps the host.

## What changes in the game's code
- `js/online.js` (new): friends, challenges, presence, the connection, sending inputs and game state.
- `js/gameplay.js` and `js/loop.js`: the game step must be run from "inputs for both players" instead of reading
  the keyboard directly, so the host can feed in the guest's presses. This is the biggest change, and it also
  makes **two players on one device** (an idea from BRIEF-ideas.md) almost free.
- The ball, scores and clock become one "game state" that can be packed into a small message (about 200 bytes,
  30 times a second).
- `supabase/setup.sql`: tables `friends` and `challenges`, with row rules. A server function accepts a challenge so
  no one can fake one.

## Safety (Arlo and his friends are kids)
- Friends by exact username only; requests can be declined and friends removed. A BLOCK button.
- No text chat, no voice, no real names, no photos. Usernames are checked against a list of bad words at sign-up
  (to add before online play opens).
- No matchmaking with strangers in this version.
- A REPORT button that emails David the username (later, if needed).

## Cheating
The host runs the game, so a host could in principle cheat by editing the code. Between friends, that doesn't
matter much. Coins from online games are capped per day, so cheating wins nothing worth having. Proper protection
(a server that runs every match) costs real money and is not worth it at this size.

## Cost
Supabase free tier: Realtime for friends, challenges and presence is well inside its limits. Direct connections:
free. A relay for blocked networks: free tier or a few pence a month.

## Size and order (each step is something you can play)
1. **Two players on one device** (half a session): the game step takes inputs for two players. Fun on its own
   (keyboard: WASD vs arrows) and the base for everything after.
2. **Friends** (one session): add by username, accept, remove, block, online dots.
3. **Online 1-on-1, first version** (one to two sessions): challenge, connect, play with no prediction. Fine on
   good Wi-Fi, so we learn early whether it works at home.
4. **Make it feel good** (one to two sessions): prediction, smoothing, fair calls, the ping display, rematch.
5. **Later**: 2v2 or 3v3 with friends (each player controls one hooper), online leaderboards.

## My recommendation
Start with step 1 (two players on one device) next: it's cheap, Arlo gets something new straight away, and it does
the hardest code change in a setting where lag can't confuse things. Then friends, then online.

## Questions for David
1. Is first-to-11 on The Cage right for online, or should you pick the court?
2. Coins for online games: yes (capped as above), or no coins so it's purely for fun?
3. Should the challenge pop-up interrupt you anywhere in the menus, or only on the main menu?
4. Emotes: which four?
