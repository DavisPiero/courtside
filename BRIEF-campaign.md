# Brief: campaign, currency and online accounts

Status (2026-10-17): campaign and currency are BUILT (sections 1-2, currency named Court Coins).
Section 3 step one (save on this computer) is built. Online accounts (step two) are NOT built:
David said no online services yet.

## 1. Campaign: "Streets to the League"
**Story.** You're an unknown kid with a crew of two on the street courts. Win your way up:
the block → the city → summer league → the arena, where the NBA teams are the bosses.
Each step unlocks a new court, new rivals and a short line of story between games.

**Why it's fun.** Every game has a twist, so it isn't just "win again":
- *Win by 10*, *first to 21*, *no mayhem* (Clean mode), *mayhem only*.
- *Ankle-breaker challenge*: drop 3 defenders in a game.
- *Hold the lead*: start up 8 with 1 minute left.
- *Rivals*: a named street rival who trash-talks between games and comes back stronger.

Each game gives 1–3 stars: win, beat the twist, play stylishly. Stars open the next chapter,
so a kid can replay for 3 stars without being stuck behind one hard game.

**Shape.** 5 chapters × 6 games, about 30 games. Chapter 1 is fully street (uses the street court).
Chapter 5 ends against the best NBA team on Hall of Famer.

## 2. Currency: "Hype" **(name: you decide)**
**Earned by playing with style, not just winning.** Greens, dunks, ankle breakers, steals and
stars all pay out. Losing still earns a little, so nobody gets stuck broke.

**Spent on animation packs.** Each pack changes how your player looks when they do something:
- *Dunk packs*: windmill, 360, between-the-legs, reverse.
- *Dribble packs*: new moves added to the E rotation (hesi, snatch-back, double cross).
- *Celebration packs*: after a bucket.
- *Shot style packs*: different jump-shot forms.

Prices about 1 pack per 3–4 games. No real money, ever. That keeps it a kids' game and avoids
app-store and payment rules entirely.

## 3. Saving progress and online accounts
**Step one: save on this computer.** Campaign progress, Hype and owned packs saved in the browser
(like Settings already are). Works offline, no account. I'd build this first.

**Step two: accounts that sync anywhere.** GitHub Pages can only host files, so accounts need a small
online service. Recommendation: **Supabase** (free tier: database, sign-in, row-level security).
- **Username + password only, no email.** Supabase sign-in normally needs an email, so the game
  would turn the username into a private placeholder login behind the scenes. You never see an email box.
- **The catch:** with no email there's **no password reset**. Forget it, lose the save.
  Options: a recovery code shown once at sign-up, or an optional email later. **(you decide)**
- **Kids' privacy:** collect nothing but a username. Warn "don't use your real name". No chat, no
  friends list, no public profiles. That keeps it clear of children's-privacy rules.
- **Passwords:** never stored by the game; the service stores them hashed.
- **Cheating:** a determined player could edit their own Hype. For a family game that's fine.
  Leaderboards would need the server to check results.
- **What's stored per player:** username, chapter and stars per game, Hype, owned packs,
  equipped packs, settings.
- **Cost:** free at family scale.

**What I need from you before building accounts:** a Supabase account (I can't create
accounts for you), the currency name, and the recovery choice above.

## Suggested order
1. Campaign chapter 1 (street) with local save.
2. Hype earning + a shop with 2–3 packs.
3. Remaining chapters.
4. Online accounts and sync.
