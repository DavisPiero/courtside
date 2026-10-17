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
};
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_GAME_KEY) || "{}");
    for (const k in SAVE) if (k in s) SAVE[k] = s[k];
    SAVE.equip = Object.assign({ dunk: "dunk.basic", layup: "layup.basic", cel: "cel.basic", shot: "shot.basic", moves: [] }, SAVE.equip);
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
// Coins for a finished game. extra: [label, coins] rows from the campaign (stars, first clear).
function payout(won, extra) {
  const rows = [[won ? "Win" : "Played", won ? 30 : 10]];
  for (const [label, k, each] of STYLE_PAY) if (G.st[k]) rows.push([`${label} ×${G.st[k]}`, G.st[k] * each]);
  for (const r of extra || []) rows.push(r);
  const total = rows.reduce((a, r) => a + r[1], 0);
  SAVE.cc += total;
  writeSave();
  return { rows, total };
}
loadSave();
