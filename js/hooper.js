"use strict";
// Your hooper's stats, and upgrading them with Court Coins (on the EDIT HOOPER screen).
// Eight stats from 50 to 99. Your rating is their average. Each upgrade adds UP_STEP to one stat and costs more
// the higher that stat already is. New hoopers start at 50; anyone who has reached the NBA starts at 75
// (the NBA entry level); a hooper part-way through the Street campaign starts a little under the recommended
// rating for their next game.
// k: save key, n: name, d: what it does in a game.
const HSTATS = [
  { k: "spd", n: "SPEED", d: "How fast you run." },
  { k: "acc", n: "ACCURACY", d: "A bigger green zone and better jump shots." },
  { k: "rng", n: "RANGE", d: "Long shots: the green zone shrinks less with distance." },
  { k: "fin", n: "FINISHING", d: "Layups and dunks through traffic." },
  { k: "hnd", n: "HANDLING", d: "More ankle breakers, harder to steal from." },
  { k: "dfn", n: "DEFENCE", d: "Steals and tighter contests." },
  { k: "hop", n: "HOPS", d: "Jump higher, dunk more often, block more shots." },
  { k: "stm", n: "STAMINA", d: "Sprint for longer." },
];
const UP_STEP = 2,
  STAT_MAX = 99,
  NBA_ENTRY = 75;
// Price of the next upgrade for a stat at value v: 50 CC at 50, about 165 at 75, about 500 near 99.
const upCost = (v) => Math.round((50 * Math.pow(1.1, (v - 50) / UP_STEP)) / 5) * 5;
// Recommended rating for each campaign game: Street climbs 50 -> 74, the NBA 75 -> 90.
function recRating(cid, ci, gi) {
  const n = ci * 6 + gi;
  return cid === "nba" ? Math.round(NBA_ENTRY + (n * 15) / 17) : Math.round(50 + (n * 24) / 17);
}
// Starting stats for a save that has none yet, worked out from campaign progress.
function startRating() {
  if (nbaOpen()) return NBA_ENTRY;
  const g = allGames("street"),
    next = g.findIndex((x) => !starsOf(x.id));
  if (next <= 0) return 50;
  return Math.max(50, recRating("street", Math.floor(next / 6), next % 6) - 3);
}
function hooper() {
  if (!SAVE.hooper) {
    const v = startRating();
    SAVE.hooper = Object.fromEntries(HSTATS.map((s) => [s.k, v]));
    writeSave();
  }
  // Reaching the NBA lifts anything still under the entry level.
  if (nbaOpen() && !SAVE.hooper.nba) {
    for (const s of HSTATS) SAVE.hooper[s.k] = Math.max(NBA_ENTRY, SAVE.hooper[s.k] || 0);
    SAVE.hooper.nba = 1;
    writeSave();
  }
  return SAVE.hooper;
}
const hooperOvr = () => Math.round(HSTATS.reduce((a, s) => a + hooper()[s.k], 0) / HSTATS.length);
// Buy one upgrade. Returns true if it worked.
function upgradeStat(k) {
  const H = hooper(),
    v = H[k],
    cost = upCost(v);
  if (v >= STAT_MAX || SAVE.cc < cost) return false;
  SAVE.cc -= cost;
  H[k] = Math.min(STAT_MAX, v + UP_STEP);
  writeSave();
  return true;
}
// Your hooper as a roster row (see js/teams.js), plus range and stamina at the end.
function hooperRow() {
  const H = hooper();
  return [SAVE.name || "ROOKIE", "SG", hooperOvr(), 76, H.spd, H.acc, H.fin, H.hnd, H.dfn, H.hop, SAVE.skin, SAVE.hair, H.rng, H.stm];
}
// The upgrade panel on the hooper screen.
function drawUpgrades() {
  const H = hooper();
  $("heroOvr").innerHTML = `<b>${hooperOvr()}</b><i>RATING</i>`;
  $("heroUps").innerHTML = HSTATS.map((s) => {
    const v = H[s.k],
      cost = upCost(v),
      max = v >= STAT_MAX,
      can = !max && SAVE.cc >= cost;
    return `<div class="up" title="${s.d}"><span>${s.n}</span><i><b style="width:${((v - 40) / 59) * 100}%"></b></i><u>${v}</u>
      <button class="btn${can ? " pri" : ""}" data-up="${s.k}"${can ? "" : " disabled"}>${max ? "MAX" : `+${UP_STEP} · ${cost} CC`}</button></div>`;
  }).join("");
  $("heroUps").querySelectorAll("[data-up]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!upgradeStat(b.dataset.up)) return;
        sfx("coins");
        burst(b, "#3cff9a", 14);
        drawUpgrades();
      }),
  );
  ccShow();
}
