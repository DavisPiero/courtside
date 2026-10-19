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
  if (!SAVE.hooper.ht) Object.assign(SAVE.hooper, { ht: SIZE.ht0, wt: SIZE.wt0 });
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
// ---------- height and weight (free to change on EDIT HOOPER; a trade-off, not an upgrade, so the RATING ignores it)
// 6'4" and 200 lb is the old fixed size and has no bonuses or drawbacks. Height already counts in games for every
// player (blocks, contests, shooting over people, steal reach, dunking, js/gameplay.js); on top of that your size moves
// these stats, in rating points: taller is slower and handles worse; heavier is slower, jumps lower, tires sooner,
// but finishes through contact, wins bumps and gets up sooner from a knockdown.
const SIZE = { ht0: 76, wt0: 200, htMin: 66, htMax: 84, wtMin: 150, wtMax: 300, wtStep: 5 };
function sizeFx(ht, wt) {
  const dh = ht - SIZE.ht0,
    dw = (wt - SIZE.wt0) / 10;
  return {
    spd: -0.6 * dh - 0.5 * dw,
    hnd: -0.8 * dh,
    hop: -0.8 * dw,
    stm: -1 * dw,
    fin: 0.8 * dw,
  };
}
const ftIn = (h) => `${Math.floor(h / 12)}'${h % 12}"`;
// Your hooper as a roster row (see js/teams.js), plus range, stamina and weight at the end. Size changes the game
// numbers here, after the rating is worked out.
function hooperRow() {
  return sizedRow(hooper(), SAVE.name || "ROOKIE", hooperOvr(), SAVE.skin, SAVE.hair);
}
// Stats H (with ht and wt) as a roster row. Also used by the bench (?bench&size=84,300) to measure builds.
function sizedRow(H, name, ovr, skin, hair) {
  const F = sizeFx(H.ht, H.wt),
    r = (v, d) => Math.round(cl(v + d, 25, 110));
  return [name, "SG", ovr, H.ht, r(H.spd, F.spd), H.acc, r(H.fin, F.fin), r(H.hnd, F.hnd), H.dfn, r(H.hop, F.hop), skin, hair, H.rng, r(H.stm, F.stm), H.wt];
}
// What your build does, for the SIZE box: arrows up (green) or down (red), one to three each.
function drawSize() {
  const H = hooper(),
    F = sizeFx(H.ht, H.wt),
    dh = H.ht - SIZE.ht0,
    dw = (H.wt - SIZE.wt0) / 10;
  $("heroHt").textContent = ftIn(H.ht);
  $("heroWt").textContent = H.wt + " LB";
  const rows = [
    ["SPEED", F.spd, "How fast you run."],
    ["HANDLING", F.hnd, "Ankle breakers, and how hard you are to steal from."],
    ["HOPS", F.hop, "Jump height for dunks and blocks."],
    ["STAMINA", F.stm, "How long you can sprint."],
    ["FINISHING", F.fin + dh * 1.5, "Layups through contact, and how often you can dunk."],
    ["REACH", dh * 1.5, "Blocks, contests, steal reach, shooting over defenders."],
    ["STRENGTH", dw * 1.2, "Winning bumps, getting up quicker after a knockdown."],
  ].filter((x) => Math.abs(x[1]) >= 0.5);
  rows.sort((a, b) => b[1] - a[1]);
  $("heroFx").innerHTML = rows.length
    ? rows.map(([n, v, d]) => `<div class="${v > 0 ? "pos" : "neg"}" title="${d}"><span>${n}</span><b>${(v > 0 ? "▲" : "▼").repeat(Math.min(3, Math.ceil(Math.abs(v) / 3.5)))}</b></div>`).join("")
    : `<p>Balanced: no bonuses, no drawbacks.</p>`;
}
function sizeStep(k, d) {
  const H = hooper();
  if (k === "ht") H.ht = cl(H.ht + d, SIZE.htMin, SIZE.htMax);
  else H.wt = cl(H.wt + d * SIZE.wtStep, SIZE.wtMin, SIZE.wtMax);
  writeSave();
  drawSize();
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
