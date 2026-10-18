"use strict";
// Minigames, from MINIGAMES on the main menu. Short, one-player challenges that pay a few Court Coins.
// - 3-POINT CONTEST: 60 seconds, five racks of five balls around the arc. Release in the green. The last ball on
//   each rack is the money ball (2 points). You don't move: just shoot.
// - DUNK CONTEST: three dunks. Drive from half court and dunk. Five judges score each one out of 10, for the
//   dunk's rarity, your speed, the dribble moves you do on the way in and how far out you take off. The same dunk
//   twice loses points. Each round uses the next dunk you own, so collecting dunks pays off here.
// - 1-ON-1: you against one NBA star, full court, first to 11.
// You play as your hooper (or OKC's star if you haven't made one).
SCREENS.push("mini");
const MINIS = [
  { k: "three", n: "3-POINT CONTEST", d: "60 seconds. Five racks around the arc. Release in the green. Last ball on each rack is worth 2.", pay: (s) => s * 5 },
  { k: "dunk", n: "DUNK CONTEST", d: "Three dunks for the judges. Rarer dunks, more speed and a dribble move on the way in all score more.", pay: (s) => Math.round(s * 0.625) },
  { k: "1v1", n: "1-ON-1", d: "You against one NBA star, full court. First to 11.", pay: (s, won) => (won ? 100 : 25) },
];
const MINI_BEST_BONUS = 30;
function openMini() {
  $("miniCards").innerHTML = MINIS.map(
    (m) => `<button class="dcard mcard" data-k="${m.k}"><b>${m.n}</b><span>${m.d}</span><em>${SAVE.best[m.k] !== undefined ? (m.k === "1v1" ? `WINS: ${SAVE.best[m.k]}` : `BEST: ${SAVE.best[m.k]}`) : "NEW!"}</em></button>`,
  ).join("");
  $("miniCards").querySelectorAll(".mcard").forEach((b) => (b.onclick = () => startMini(b.dataset.k)));
  $("bMiniX").onclick = () => showPlay();
  show("mini");
}
// You: your hooper's crew colours, or the Thunder.
const miniYou = () => (SAVE.name ? crewTeam() : NBA("OKC"));
// Three spots per rack around the arc of the right-hand hoop (team 0 shoots at x = 88.75).
const RACKS = [-80, -40, 0, 40, 80].map((a) => {
  const r = (a * Math.PI) / 180;
  return [HX(0) - Math.cos(r) * 24.6, 25 + Math.sin(r) * 24.6];
});
function startMini(k) {
  const you = miniYou();
  let opp = NBA("SAS");
  if (k === "1v1") {
    // A random star from the league's top ten teams.
    const pool = teamRank().slice(20),
      t = NBA(pool[(Math.random() * pool.length) | 0]),
      st = t.p.slice().sort((a, b) => b[2] - a[2]);
    opp = { ...t, p: st };
  }
  Object.assign(OPT, { mode: "clean", court: k === "1v1" ? "cage" : "arena", diff: 1 });
  G.rules = { ...RULES_STD, nq: 1, qlen: k === "three" ? 60 : 999, target: k === "1v1" ? 11 : 0 };
  G.camp = null;
  G.mg = { k, score: 0, rack: 0, ball: 0, wait: 0, round: 0, last: null, judged: 0, moves: new Set(), log: [] };
  setTeamObjs(you, opp);
  start(0);
  G.tip = null;
  document.body.classList.remove("bars");
  G.pl.forEach((p) => (p.gone = k === "1v1" ? p.i !== 0 : p.id !== 0));
  if (k === "three") placeRack();
  else if (k === "dunk") placeDunk();
  else setPoss(0);
  park();
  toast(MINIS.find((m) => m.k === k).n, 1.4);
}
// Players who aren't in this minigame wait far off the court.
function park() {
  G.pl.forEach((p) => p.gone && Object.assign(p, { x: -400 - p.id * 10, y: -400, vx: 0, vy: 0, z: 0, oop: 0 }));
}
function giveBall(p) {
  Object.assign(G.ball, { own: p.id, mode: "held", made: false, missed: false, vx: 0, vy: 0, vz: 0, h: 0 });
  G.poss = 0;
  G.ctrl = p.id;
}
function placeRack() {
  const m = G.mg,
    p = G.pl[0],
    [x, y] = RACKS[m.rack];
  Object.assign(p, { x, y, vx: 0, vy: 0, z: 0, vz: 0, f: Math.atan2(25 - y, HX(0) - x), sp: 0, stt: "", fol: 0 });
  giveBall(p);
}
// The dunk for this round: your equipped dunk first, then the other dunks you own in turn.
function dunkFor(r) {
  const own = [SAVE.equip.dunk, ...ANIMS.filter((a) => a.cat === "dunk" && owns(a.id) && a.id !== SAVE.equip.dunk).map((a) => a.id)];
  return own[r % own.length];
}
function placeDunk() {
  const m = G.mg,
    p = G.pl[0];
  m.style = dunkFor(m.round);
  m.moves = new Set();
  m.judged = 0;
  Object.assign(p, { x: 50, y: 25 + (m.round - 1) * 6, vx: 0, vy: 0, z: 0, vz: 0, f: 0, stt: "", fol: 0 });
  p.sp = stats(NM[0], 0).sp;
  giveBall(p);
  toast(`DUNK ${m.round + 1}: ${animName(m.style).toUpperCase()}`, 1.6);
}
// Every step of a minigame (from step()).
function mgUpd(dt) {
  const m = G.mg,
    b = G.ball,
    p = G.pl[0];
  park();
  if (m.k === "1v1") return;
  G.sc = 24; // no shot clock
  if (m.k === "three") {
    // When a shot comes down (in or out), the next ball comes a moment later.
    if (m.flying && b.mode !== "shot") m.wait = 0.45;
    m.flying = b.mode === "shot";
    if (m.wait > 0) {
      m.wait -= dt;
      if (m.wait <= 0) nextBall();
    }
  }
  if (m.k === "dunk") {
    // Stay in the half you start in.
    if (p.x < 47) p.x = 47;
    if (m.cutSeen && !G.cut && !m.judged) judgeDunk();
    // A ball that got away (not from a dunk) comes straight back.
    if (!m.cutSeen && b.own < 0 && b.mode === "loose") giveBall(p);
    if (m.judged && T > m.judged) {
      m.cutSeen = 0;
      m.round++;
      $("ttl").className = "";
      if (m.round >= 3) return end();
      placeDunk();
    }
  }
}
function nextBall() {
  const m = G.mg;
  m.wait = 0;
  m.ball++;
  if (m.ball >= 5) {
    m.ball = 0;
    m.rack++;
    if (m.rack >= 5) return end();
  }
  placeRack();
}
// A basket in a minigame. Returns true if the minigame took care of it.
function mgScored(t, pts, p) {
  const m = G.mg;
  if (!m || m.k === "1v1") return false;
  if (m.k === "three") {
    const v = m.ball === 4 ? 2 : 1;
    m.score += v;
    G.home = m.score;
    toast(v === 2 ? "MONEY BALL! +2" : "+1", 0.6);
    spark(HX(0), 25, 10, v === 2 ? 30 : 14, v === 2 ? "#ffcf5c" : null);
    sfx("swish");
    G.rim[0] = 1;
  } else sfx("dunk");
  return true;
}
// The judges: base 28, plus the dunk's rarity, speed into it, dribble moves on the way and a long take-off.
function judgeDunk() {
  const m = G.mg,
    rar = { starter: 0, common: 2, rare: 4, epic: 6, legendary: 8, iconic: 9, mythic: 10, godlike: 12, gametime: 12 }[ANIM[m.style].rarity] || 0,
    spd = Math.min(4, (m.speed || 0) / 4),
    mv = Math.min(4, m.moves.size),
    far = (m.takeoff || 0) > 12 ? 3 : 0,
    seen = m.log.includes(m.style) ? -6 : 0;
  let total = Math.round(cl(28 + rar + spd + mv + far + seen + rn(-2, 2), 20, 50));
  // Five judges' cards that add up to the total.
  const cards = [0, 0, 0, 0, 0].map(() => Math.floor(total / 5));
  for (let i = 0; i < total % 5; i++) cards[i]++;
  for (let i = 0; i < 2; i++) {
    const a = (Math.random() * 5) | 0,
      z = (Math.random() * 5) | 0;
    if (cards[a] < 10 && cards[z] > 1 && a !== z) cards[a]++, cards[z]--;
  }
  m.log.push(m.style);
  m.score += total;
  G.home = m.score;
  m.judged = T + 2.4;
  $("ttl").innerHTML = `${total}${total >= 50 ? " PERFECT!" : ""}<small>${cards.join(" · ")}${seen ? " · SEEN IT BEFORE" : ""}</small>`;
  $("ttl").className = "on";
  sfx(total >= 45 ? "cheer" : "coins");
}
// Called when a dunk cutscene starts in the dunk contest: remember how fast and far out you went.
function mgDunkStart(p) {
  const m = G.mg;
  if (!m || m.k !== "dunk") return;
  m.cutSeen = 1;
  m.speed = hy(p.vx, p.vy);
  m.takeoff = hy(HX(0) - p.x, 25 - p.y);
}
// Score line for the scoreboard while a minigame runs.
function mgHud() {
  const m = G.mg;
  if (m.k === "three") {
    $("qt").textContent = `RACK ${Math.min(5, m.rack + 1)}`;
    return;
  }
  if (m.k === "dunk") {
    $("qt").textContent = `DUNK ${Math.min(3, m.round + 1)}/3`;
    $("clk").textContent = m.score;
  }
}
// Minigame over: coins, best score, results screen.
function mgEnd() {
  const m = G.mg,
    M = MINIS.find((x) => x.k === m.k),
    won = m.k === "1v1" ? G.home > G.away : true,
    score = m.k === "1v1" ? G.home : m.score,
    rows = [];
  let best = false;
  if (m.k === "1v1") {
    if (won) SAVE.best["1v1"] = (SAVE.best["1v1"] || 0) + 1;
    else if (SAVE.best["1v1"] === undefined) SAVE.best["1v1"] = 0;
  } else if (SAVE.best[m.k] === undefined || score > SAVE.best[m.k]) {
    best = SAVE.best[m.k] !== undefined;
    SAVE.best[m.k] = score;
  }
  const pay = M.pay(score, won);
  rows.push([m.k === "1v1" ? (won ? "Win" : "Played") : `Score ${score}`, pay]);
  if (best) rows.push(["New best!", MINI_BEST_BONUS]);
  SAVE.cc += rows.reduce((a, r) => a + r[1], 0);
  // daily challenges pay themselves
  rows.push(...dailyEvent({ mini: m.k, won, margin: G.home - G.away, st: G.st, court: OPT.court, diff: OPT.diff, score }));
  const total = rows.reduce((a, r) => a + r[1], 0);
  writeSave();
  G.mg = null;
  $("res").classList.toggle("won", won);
  $("resTitle").textContent = m.k === "1v1" ? (won ? "WIN!" : "LOSS") : M.n;
  $("resScore").textContent = m.k === "1v1" ? `${TM[0].c} ${G.home} – ${G.away} ${TM[1].p[0][0]}` : `${score} POINTS${best ? " · NEW BEST!" : ""}`;
  $("resOutro").innerHTML = "";
  $("resGoals").innerHTML = m.k === "1v1" ? "" : `<div class="meta">Best: ${SAVE.best[m.k]}</div>`;
  $("resPay").innerHTML = rows.map(([l, v]) => `<div>${l}<b>+${v}</b></div>`).join("") + `<div class="tot">COURT COINS<b>+${total} CC</b></div>`;
  const acts = [
    ["PLAY AGAIN", "pri", () => startMini(m.k)],
    ["MINIGAMES", "", openMini],
    ["MENU", "", () => show("menu")],
  ];
  $("resAct").innerHTML = acts.map(([l, c], i) => `<button class="btn ${c}" data-i="${i}">${l}</button>`).join("");
  $("resAct").querySelectorAll("button").forEach((b) => (b.onclick = acts[+b.dataset.i][2]));
  show("res");
}
