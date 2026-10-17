"use strict";
// The player's save: Court Coins (CC), owned and equipped animation packs, campaign progress.
// Stored in this browser only (no accounts yet). Reset with resetSave() from the console if needed.
const SAVE_GAME_KEY = "courtside.save.v1";
const SAVE = {
  name: "", // your hooper's name in the campaign
  skin: 3, // your hooper's skin tone (0-5) and hair style (0 short, 1 tall top, 2 buzz, 3 bald, 4 afro)
  hair: 0,
  cc: 0,
  owned: [], // animation ids you have collected
  equip: { dunk: "dunk.basic", layup: "layup.basic", cel: "cel.basic", shot: "shot.basic", moves: [] }, // moves: equipped dribble moves
  stars: {}, // campaign game id -> best stars (0-3)
  seen: {}, // story scenes already watched (chapter openings play once by themselves)
  storyV: 0, // story version this save's campaign progress belongs to
  // NBA career: team code you signed with, the offer tier you last answered, current offers, and the last
  // day (yyyymmdd) your contract paid out (0 = not yet).
  nba: { team: "", tier: 0, offers: [], offerTier: -1 },
  payday: 0,
  free: {}, // free packs you've won and not opened yet: pack id -> how many (a chapter boss gives an All-Star Pack)
  shoes: [], // shoe ids you own (js/shoes.js)
  shoe: "", // the shoe your team wears ("" = plain team-colour sneakers)
  codes: [], // codes already redeemed in the Shop
  hooper: null, // your hooper's eight stats (js/hooper.js); null until first worked out from your progress
  best: {}, // best scores in the minigames
};
// The story was rewritten in session 2 (2026-10-17), so campaign progress starts again once.
// Coins, animations and what you have equipped are kept.
const STORY_V = 2;
function storyReset() {
  if (SAVE.storyV >= STORY_V) return;
  const had = Object.keys(SAVE.stars).length > 0;
  SAVE.stars = {};
  SAVE.seen = had ? { newStory: 1 } : {};
  SAVE.storyV = STORY_V;
  try {
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(SAVE));
  } catch (e) {}
}
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_GAME_KEY) || "{}");
    for (const k in SAVE) if (k in s) SAVE[k] = s[k];
    SAVE.nba = Object.assign({ team: "", tier: 0, offers: [], offerTier: -1 }, SAVE.nba);
    SAVE.equip = Object.assign({ dunk: "dunk.basic", layup: "layup.basic", cel: "cel.basic", shot: "shot.basic", moves: [] }, SAVE.equip);
    for (const k of ["free", "best"]) if (!SAVE[k] || typeof SAVE[k] !== "object") SAVE[k] = {};
    for (const k of ["shoes", "codes"]) if (!Array.isArray(SAVE[k])) SAVE[k] = [];
  } catch (e) {
    /* private window or blocked storage: start fresh */
  }
}
function writeSave() {
  try {
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(SAVE));
  } catch (e) {
    /* progress kept for this visit only */
  }
  ccShow();
}
function resetSave() {
  try {
    localStorage.removeItem(SAVE_GAME_KEY);
  } catch (e) {}
  location.reload();
}
// Coin balance in every place that shows it.
function ccShow() {
  document.querySelectorAll(".ccbal").forEach((e) => (e.textContent = SAVE.cc.toLocaleString() + " CC"));
}

// ---------- earning Court Coins: play with style, not just win
// Each entry: [label, stat in G.st, coins each]
const STYLE_PAY = [
  ["Perfect releases", "greens", 4],
  ["Dunks", "dunks", 6],
  ["Ankle breakers", "ankles", 5],
  ["Threes", "threes", 3],
  ["Steals", "stl", 3],
  ["Blocks", "blk", 4],
];
// Mayhem's punch is strong, so it costs you: every punch thrown takes PUNCH_CUT % off the game's coins,
// up to PUNCH_CAP %. free: punches a campaign goal asks for (they don't count).
const PUNCH_CUT = 6,
  PUNCH_CAP = 50;
// Coins for a finished game. extra: [label, coins] rows from the campaign (stars, first clear).
function payout(won, extra, free) {
  const rows = [[won ? "Win" : "Played", won ? 30 : 10]];
  for (const [label, k, each] of STYLE_PAY) if (G.st[k]) rows.push([`${label} ×${G.st[k]}`, G.st[k] * each]);
  for (const r of extra || []) rows.push(r);
  let total = rows.reduce((a, r) => a + r[1], 0);
  const n = Math.max(0, (G.st.pun || 0) - (free || 0)),
    pct = Math.min(PUNCH_CAP, n * PUNCH_CUT);
  if (pct) {
    const cut = Math.round((total * pct) / 100);
    rows.push([`Punches ×${n} (−${pct}%)`, -cut]);
    total -= cut;
  }
  SAVE.cc += total;
  writeSave();
  return { rows, total };
}
loadSave();
storyReset();
