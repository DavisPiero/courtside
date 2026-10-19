"use strict";
// The player's save: Court Coins (CC), owned and equipped animation packs, campaign progress.
// Stored in this browser, and in your account when you're signed in (js/account.js). Reset with resetSave() from the console if needed.
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
  freeBox: {}, // free shoeboxes you've won and not opened yet: box id -> how many (the code SNEAKERHEAD)
  shoes: [], // shoe ids you own (js/shoes.js)
  shoe: "", // the shoe your team wears ("" = plain team-colour sneakers)
  codes: [], // codes already redeemed in the Shop
  hooper: null, // your hooper's eight stats (js/hooper.js); null until first worked out from your progress
  best: {}, // best scores in the minigames
  daily: null, // today's challenges and the daily-reward ladder (js/daily.js)
  league: null, // the Career League season (js/league.js)
  ev: {}, // limited-time events (js/event.js): event id -> { q: quests done, p: progress on the current one }
  prof: { pic: "ball", title: "", show: ["", "", ""], shoe: "" }, // your account page (js/profile.js): picture, title, showcase
  life: {}, // lifetime totals from session 8 on, for unlocking titles: games, wins, dunks, stl, threes, ankles, blk
};
// A brand-new save, for signing out (js/account.js). Taken before loadSave() fills SAVE in.
const SAVE_FRESH = JSON.stringify(SAVE);
const saveFresh = () => JSON.parse(SAVE_FRESH);
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
    saveLoadFrom(JSON.parse(localStorage.getItem(SAVE_GAME_KEY) || "{}"));
  } catch (e) {
    /* private window or blocked storage: start fresh */
  }
}
// Fill SAVE from a stored save s (from this device or from your account), mending anything missing.
function saveLoadFrom(s) {
  const F = saveFresh();
  for (const k in SAVE) SAVE[k] = s && k in s ? s[k] : F[k];
  SAVE.nba = Object.assign({ team: "", tier: 0, offers: [], offerTier: -1 }, SAVE.nba);
  SAVE.equip = Object.assign({ dunk: "dunk.basic", layup: "layup.basic", cel: "cel.basic", shot: "shot.basic", moves: [] }, SAVE.equip);
  SAVE.prof = Object.assign({ pic: "ball", title: "", show: ["", "", ""], shoe: "" }, SAVE.prof);
  if (!Array.isArray(SAVE.prof.show)) SAVE.prof.show = ["", "", ""];
  for (const k of ["free", "freeBox", "best", "stars", "seen", "ev", "life"]) if (!SAVE[k] || typeof SAVE[k] !== "object") SAVE[k] = {};
  for (const k of ["shoes", "codes", "owned"]) if (!Array.isArray(SAVE[k])) SAVE[k] = [];
  if (typeof SAVE.cc !== "number" || !(SAVE.cc >= 0)) SAVE.cc = 0;
}
// quiet: don't send it to your account (it just came from there).
function writeSave(quiet) {
  try {
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(SAVE));
  } catch (e) {
    /* progress kept for this visit only */
  }
  ccShow();
  if (!quiet && typeof accDirty === "function") accDirty();
}
// Has anyone played on this save? (Then signing in adds it to the account.)
function saveHasProgress(s) {
  return s.cc > 0 || s.owned.length > 0 || s.shoes.length > 0 || Object.keys(s.stars).length > 0 || Object.values(s.free).some((n) => n > 0) || Object.values(s.freeBox).some((n) => n > 0) || !!s.name;
}
// Add a guest save (b) on this device to an account save (a): coins added together, collections combined, the best of
// every star, score and hooper stat kept. Campaign and career state (NBA team, contract, story, daily) come from
// whichever save has more stars. A code used in both saves only pays its coins once.
function saveMerge(a, b) {
  const F = saveFresh(),
    A = { ...F, ...a },
    B = { ...F, ...b },
    starsOf = (s) => Object.values(s.stars || {}).reduce((n, v) => n + v, 0),
    lead = starsOf(B) > starsOf(A) ? B : A,
    M = JSON.parse(JSON.stringify(lead)),
    uni = (x, y) => [...new Set([...(x || []), ...(y || [])])],
    sum = (x, y) => {
      const o = { ...(x || {}) };
      for (const k in y || {}) o[k] = (o[k] || 0) + y[k];
      return o;
    },
    max = (x, y) => {
      const o = { ...(x || {}) };
      for (const k in y || {}) o[k] = Math.max(o[k] || 0, y[k]);
      return o;
    };
  M.cc = (A.cc || 0) + (B.cc || 0);
  M.owned = uni(A.owned, B.owned);
  M.shoes = uni(A.shoes, B.shoes);
  M.codes = uni(A.codes, B.codes);
  M.free = sum(A.free, B.free);
  M.freeBox = sum(A.freeBox, B.freeBox);
  M.stars = max(A.stars, B.stars);
  M.best = max(A.best, B.best);
  M.seen = { ...(B.seen || {}), ...(A.seen || {}) };
  M.life = sum(A.life, B.life);
  // Events: keep whichever save got further through each event's quests.
  M.ev = { ...(B.ev || {}) };
  for (const k in A.ev || {}) if (!M.ev[k] || A.ev[k].q > M.ev[k].q || (A.ev[k].q === M.ev[k].q && A.ev[k].p > M.ev[k].p)) M.ev[k] = A.ev[k];
  for (const k of (B.codes || []).filter((k) => (A.codes || []).includes(k))) {
    const c = typeof CODES !== "undefined" && CODES[k];
    if (!c) continue;
    if (c.cc) M.cc -= Math.min(c.cc, B.cc || 0);
    if (c.box && M.freeBox[c.box] > (A.freeBox[c.box] || 0)) M.freeBox[c.box]--;
  }
  M.cc = Math.max(0, M.cc);
  if (A.hooper || B.hooper) {
    const h = { ...(B.hooper || {}), ...(A.hooper || {}) };
    for (const k in B.hooper || {}) if (k !== "ht" && k !== "wt") h[k] = Math.max((A.hooper && A.hooper[k]) || 0, B.hooper[k]);
    M.hooper = h;
  }
  // Never lose a signed NBA team because the other save led on stars.
  const other = lead === A ? B : A;
  if (!(M.nba && M.nba.team) && other.nba && other.nba.team) Object.assign(M, { nba: other.nba, payday: other.payday });
  if (!M.league && other.league) M.league = other.league;
  // The look of your hooper and what's equipped stay as they were on the account.
  for (const k of ["name", "skin", "hair", "equip", "shoe", "daily", "prof"]) M[k] = a && a[k] !== undefined && (k !== "name" || a.name) ? A[k] : B[k];
  return M;
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
// (every reward went up about a quarter in session 6b, prices stayed the same)
// Each entry: [label, stat in G.st, coins each]
const STYLE_PAY = [
  ["Perfect releases", "greens", 5],
  ["Dunks", "dunks", 8],
  ["Ankle breakers", "ankles", 6],
  ["Threes", "threes", 4],
  ["Steals", "stl", 4],
  ["Blocks", "blk", 5],
];
// Mayhem's punch is strong, so it costs you: every punch thrown takes PUNCH_CUT % off the game's coins,
// up to PUNCH_CAP %. free: punches a campaign goal asks for (they don't count).
const PUNCH_CUT = 6,
  PUNCH_CAP = 50;
// Coins for a finished game. extra: [label, coins] rows from the campaign (stars, first clear).
function payout(won, extra, free) {
  const rows = [[won ? "Win" : "Played", won ? 38 : 13]];
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
