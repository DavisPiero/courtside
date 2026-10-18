# Brief: accounts with Supabase (and the road to online play)

Status (2026-10-19, session 6d): a brief for David. Nothing here is built. Online accounts are on CLAUDE.md's
"out of scope" list until David says go.

## The real problem first: why players lose progress
Your save lives in the browser's storage (`localStorage`), on one device, in one browser. It disappears when:
- **Safari clears it by itself.** Safari on iPhone and iPad deletes a website's storage if the site hasn't been
  opened for **7 days**, unless it was added to the Home Screen. This is very likely why players lose progress.
- someone clears their history or website data, or uses a private tab;
- they switch device or browser (iPad to laptop): the save doesn't come with them.

Accounts fix all of this, but two small things help straight away. **My recommendation: do both before accounts.**

### Step 0: quick fixes, no accounts (half a session)
1. **Ask the browser to keep the save.** One line (`navigator.storage.persist()`) asks the browser not to clear
   storage by itself. Safari is stricter, but it helps elsewhere.
2. **"Add to Home Screen" prompt on iPad and iPhone.** Safari doesn't apply the 7-day rule to Home Screen apps.
   A one-time tip on the menu shows how (Share, then Add to Home Screen). It also opens full-screen, with no
   address bar.
3. **Save code backup.** In Settings: COPY SAVE CODE gives a long code; PASTE SAVE CODE on another device restores
   everything. No server, works today, and it's a safety net even after accounts exist.

## Step 1: accounts with Supabase (one to two sessions)
Supabase is a hosted database with logins built in, free at this size. The game stays a plain website on GitHub
Pages; it talks to Supabase from the browser.

**What you'd do (I can't create accounts for you):**
1. Make a free account at supabase.com and a project called "courtside".
2. Send me two things from the project's API settings: the **Project URL** and the **anon public key**. Both are
   meant to be public, so they can go in the game's code. The **service role key must never go in the game**;
   keep it to yourself.

**How players sign in. My recommendation: a grown-up's email, with no passwords.**
- Arlo and his friends are kids. Laws on children's data (COPPA in the US, similar rules in the UK and EU) make
  collecting a child's email or personal details a real legal job. The simple, safe route:
  - **Play without signing in**, as now. A "guest" save is created quietly in the background (Supabase anonymous
    sign-in), so even guests get a cloud backup on that device.
  - **"Save my progress"** asks for **a parent's email**. Supabase emails them a sign-in link (a "magic link":
    no password to forget). The guest save is attached to that email.
  - On a new device, the parent's email link brings the save back.
- Player names stay what they are now: the hooper's name, shown only in the game. No real names, no chat, no
  photos.
- Before launch we'd need a short privacy page saying what's stored (an email and the game save) and how to delete
  it. A delete button in Settings would remove both.

**What's stored (two small tables):**
| Table | What's in it | Who can read or change it |
|---|---|---|
| `profiles` | your id, the hooper's name, when you joined | only you |
| `saves` | your whole save (coins, cards, shoes, campaign stars, hooper) as one block, a version number, when it was last saved | only you |

"Only you" is enforced by Supabase's row-level security: one rule per table saying a row can only be touched by
the signed-in player it belongs to.

**How saving works:**
- The game keeps saving to the device exactly as now, so it works offline and stays fast.
- After every game, purchase or upgrade, it also sends the save to Supabase (bundled up, at most every few
  seconds).
- When the game starts and you're signed in, it compares the device save with the cloud save. If they differ, it
  keeps the one with **more progress**: more campaign stars, then more owned items, then the newer one. If that's
  unclear, it asks: "Keep this device's save or the cloud save?"

**Fits the project's rules:** Supabase's browser library loads as a plain `<script>` from a CDN (pinned to an
exact version), so it still runs from GitHub Pages with no build step. Double-clicking `index.html` would still
play, just without cloud saves.

## Step 2: things that need accounts but aren't live online play (a session each)
These are easy with Supabase and get most of the "online" feeling:
- **Leaderboards** for the 3-point and dunk contests, and for today's daily challenges.
- **Friend codes**: add a friend, see their hooper's rating and best scores.
- **Shared Daily Shop and events** run from the server instead of from the clock in the code.
- **Cheat protection for coins.** Today anyone can edit their save in the browser. That doesn't matter for solo
  play, but it does once there are leaderboards. The fix is to have the server do the important actions (award
  coins, open packs) through small database functions, so the coin count can't simply be typed in.

## Step 3: real online play (big: several sessions, and the hardest part of the whole game)
- **How it would work:** one player's game is the "host" and runs the match, exactly like the game runs now. The
  other player's game sends their button presses to the host and draws what the host sends back, 30 to 60 times a
  second. The two games connect directly to each other (WebRTC). Supabase is only used to find each other: lobby,
  invites and "match found".
- **The hard part is lag.** A 3v3 basketball game with fast steals and blocks feels bad with even a tenth of a
  second of delay. It needs prediction and smoothing (netcode). Start with **1-on-1 against a friend**, invite
  only, before anything bigger.
- **Safety:** invite by friend code only, no strangers, no text chat (quick emotes instead).
- **Cost:** still free or close to it at this size. Supabase's free tier covers thousands of players. Direct
  connections cost nothing; a small relay server might be needed for some home networks later.

## My recommendation and order
1. **Now:** Step 0 (persist, Home Screen tip, save code). Cheap, and it stops most lost saves this week.
2. **Next:** Step 1 accounts with parent-email sign-in. One to two sessions, after you've made the Supabase project.
3. **Then:** leaderboards and friend codes (Step 2).
4. **Only then** try 1-on-1 online (Step 3), as an experiment.

## Questions for David
1. Should I do Step 0 next session?
2. Are you happy with parent-email sign-in (no passwords, no kid emails)?
3. Should guests get an automatic cloud backup on their device, or only players who sign in?
4. For online play, is 1-on-1 with friends the right first step, or is 3v3 with friends the dream from day one?
