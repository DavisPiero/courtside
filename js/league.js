"use strict";
// Career League (BRIEF-league.md, part 1): after winning the NBA Finals your hooper plays season after season.
// A season: pre-season (stay or take an offer), 12 games against 12 of the other 29 teams, standings for all 30 (the
// games you don't play are simulated from team ratings), then the top 8 play off: best of 3, the Finals best of 5.
// Your team is you plus your NBA team's best two (js/campaign.js nbaTeam), and SAVE.nba.team is your team here too,
// so the daily contract keeps paying. Saved in SAVE.league.
const LG = {
  games: 12, // regular-season games
  poTeams: 8,
  need: [2, 2, 3], // wins to take a series: quarter-finals, semi-finals, Finals
  rec0: 90, // recommended rating in season 1, +2 a season up to 99
  winCC: 50, // on top of the usual game coins
  playoffCC: 500,
  seriesCC: 750,
  ringCC: 2000, // and a free Hall of Fame Pack
  rules: { nq: 4, qlen: 30 }, // four 30-second quarters, like the NBA campaign
};
const ROUND_NAMES = ["QUARTER-FINALS", "SEMI-FINALS", "THE FINALS"];
const leagueOpen = () => nbaCleared() >= 3; // you've won the NBA Finals
const lg = () => SAVE.league;
const lgRec = (L) => Math.min(99, LG.rec0 + (L.season - 1) * 2);

// ---------- team strength (for simulated games and for how hard your games are)
// The league's best ten get 1.5 rating points better each season (up to 8); Zeke Knox's team gets 2 more.
function lgStrength(code) {
  const L = lg(),
    top = teamRank().slice(-10).includes(code);
  return teamOvr(NBA(code)) + (top ? Math.min(8, (L.season - 1) * 1.5) : 0) + (code === L.knox ? 2 : 0);
}
// Chance team a beats team b.
const lgWinP = (a, b) => 1 / (1 + Math.exp(-(lgStrength(a) - lgStrength(b)) / 3.5));
const lgSim = (a, b) => (Math.random() < lgWinP(a, b) ? a : b);

// ---------- a new season
function leagueNew() {
  const prev = lg();
  SAVE.league = {
    season: prev ? prev.season + 1 : 1,
    phase: "pre", // pre | reg | po | done
    rings: prev ? prev.rings : 0,
    hist: prev ? prev.hist : [], // past seasons: { s, team, w, l, finish }
    champ: prev && prev.phase === "done" ? prev.champion : "", // last season's champion: "the target on their back"
    lastFinish: prev ? prev.finish : "champion", // season 1: you just won the Finals
    team: "",
    knox: "",
    sched: [],
    res: [], // your results: { o: opponent, w: 1/0, s: "54-48" }
    rec: {}, // every team's record: code -> [wins, losses]
    po: null, // playoffs: { round, series: [[{ a, b, wa, wb }]] }
    finish: "",
    champion: "",
    offers: [],
  };
  lgOffers();
  writeSave();
}
// Three offers: the best ten teams if you went deep last season, the middle ten if you missed the playoffs.
function lgOffers() {
  const L = lg(),
    R = teamRank(),
    good = L.lastFinish === "champion" || L.lastFinish === "finals" || L.lastFinish === "semis" || L.lastFinish === "playoffs",
    pool = (good ? R.slice(-10) : R.slice(10, 20)).filter((c) => c !== SAVE.nba.team);
  L.offers = [];
  while (L.offers.length < 3 && pool.length) L.offers.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
}
// Sign (or stay), then make the schedule. Returns the signing bonus paid.
function leagueSign(code) {
  const L = lg(),
    bonus = code !== SAVE.nba.team ? SIGN_BONUS : 0;
  SAVE.cc += bonus;
  SAVE.nba.team = code;
  L.team = code;
  // Zeke Knox signs wherever you didn't: one of the best ten.
  const top = teamRank()
    .slice(-10)
    .filter((c) => c !== code);
  L.knox = top[(Math.random() * top.length) | 0];
  const others = TEAMS.map((t) => t.c).filter((c) => c !== code && c !== L.knox);
  for (let i = others.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [others[i], others[j]] = [others[j], others[i]];
  }
  L.sched = others.slice(0, LG.games - 1);
  L.sched.splice(6, 0, L.knox); // the rivalry game, halfway through
  L.rec = Object.fromEntries(TEAMS.map((t) => [t.c, [0, 0]]));
  L.phase = "reg";
  writeSave();
  return bonus;
}

// ---------- your next game
function lgNext() {
  const L = lg();
  if (L.phase === "reg") {
    const o = L.sched[L.res.length];
    return { opp: o, label: `GAME ${L.res.length + 1} OF ${LG.games}`, rival: o === L.knox };
  }
  if (L.phase === "po") {
    const s = lgMySeries();
    if (!s) return null;
    const o = s.a === L.team ? s.b : s.a,
      me = s.a === L.team ? s.wa : s.wb,
      them = s.a === L.team ? s.wb : s.wa;
    return { opp: o, label: `${ROUND_NAMES[L.po.round]} · GAME ${s.wa + s.wb + 1} · SERIES ${me}-${them}`, rival: o === L.knox, po: 1 };
  }
  return null;
}
// How hard it is: All-Star, Hall of Famer against the best ten from season 2, and always against last season's
// champion and in the Finals. Defending champions get every team a level harder.
function lgDiff(o) {
  const L = lg(),
    top = teamRank().slice(-10).includes(o);
  let d = 2;
  if ((L.season > 1 && top) || o === L.champ || (L.po && L.po.round === 2)) d = 3;
  if (L.champ && L.champ === L.team) d = 3;
  return d;
}
function lgOppTeam(o) {
  const L = lg(),
    boost = teamRank().slice(-10).includes(o) ? Math.round(Math.min(8, (L.season - 1) * 1.5)) : 0,
    t = o === L.knox ? withKnox(o, 1) : NBA(o),
    up = (R) => R.map((v, i) => (i >= 2 && i <= 9 && i !== 3 ? Math.min(99, v + boost) : v));
  return { ...t, p: t.p.map(up) };
}
function startLeague() {
  const L = lg(),
    nx = lgNext();
  if (!nx) return;
  Object.assign(OPT, { court: "arena", mode: "clean", diff: lgDiff(nx.opp) });
  G.rules = { ...RULES_STD, ...LG.rules };
  G.camp = G.mg = null;
  const s = nx.po && lgMySeries();
  G.league = { opp: nx.opp, clinch: !!(s && L.po.round === 2 && (s.a === L.team ? s.wa : s.wb) === LG.need[2] - 1), extra: [] };
  setTeamObjs(nbaTeam(), lgOppTeam(nx.opp));
  start(0);
}

// ---------- after your game: record it, simulate everyone else, pay rewards. Returns the extra pay rows.
function leagueRecord(won, score) {
  const L = lg(),
    o = G.league.opp,
    rows = [];
  if (won) rows.push(["League win", LG.winCC]);
  if (L.phase === "reg") {
    L.res.push({ o, w: won ? 1 : 0, s: score });
    L.rec[L.team][won ? 0 : 1]++;
    L.rec[o][won ? 1 : 0]++;
    // Everyone else plays one game this round.
    const rest = TEAMS.map((t) => t.c).filter((c) => c !== L.team && c !== o);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    for (let i = 0; i + 1 < rest.length; i += 2) {
      const w = lgSim(rest[i], rest[i + 1]);
      L.rec[w][0]++;
      L.rec[w === rest[i] ? rest[i + 1] : rest[i]][1]++;
    }
    if (L.res.length >= LG.games) {
      const seeds = lgTable().slice(0, LG.poTeams);
      L.po = { round: 0, series: [[[0, 7], [3, 4], [1, 6], [2, 5]].map(([x, y]) => ({ a: seeds[x], b: seeds[y], wa: 0, wb: 0 }))] };
      L.phase = "po";
      if (seeds.includes(L.team)) {
        rows.push(["Made the playoffs!", LG.playoffCC]);
        lgSimOthers();
      } else {
        L.finish = "missed";
        lgSimRest();
      }
    }
  } else if (L.phase === "po") {
    const s = lgMySeries();
    if (s) {
      if ((s.a === L.team) === won) s.wa++;
      else s.wb++;
      const need = LG.need[L.po.round];
      if (s.wa >= need || s.wb >= need) {
        const iWon = (s.wa >= need) === (s.a === L.team);
        if (iWon) {
          rows.push([L.po.round === 2 ? "CHAMPIONS!" : "Series won", LG.seriesCC]);
          if (L.po.round === 2) {
            rows.push(["Ring bonus", LG.ringCC]);
            SAVE.free.hof = (SAVE.free.hof || 0) + 1;
            L.rings++;
            L.finish = "champion";
            L.champion = L.team;
            G.league.ring = 1;
            lgDone();
          } else lgAdvance();
        } else {
          L.finish = ["playoffs", "semis", "finals"][L.po.round];
          lgSimRest();
        }
      }
    }
  }
  writeSave();
  return rows;
}
// The other series of this round, played out at once.
function lgSimOthers() {
  const L = lg();
  for (const s of L.po.series[L.po.round]) {
    if (s.a === L.team || s.b === L.team) continue;
    const need = LG.need[L.po.round];
    while (s.wa < need && s.wb < need) lgSim(s.a, s.b) === s.a ? s.wa++ : s.wb++;
  }
}
const lgWinner = (s) => (s.wa > s.wb ? s.a : s.b);
// Everyone in this round is done: make the next round.
function lgAdvance() {
  const L = lg(),
    cur = L.po.series[L.po.round];
  lgSimOthers();
  if (L.po.round === 2) return lgDone();
  const next = [];
  for (let i = 0; i < cur.length; i += 2) next.push({ a: lgWinner(cur[i]), b: lgWinner(cur[i + 1]), wa: 0, wb: 0 });
  L.po.round++;
  L.po.series.push(next);
  lgSimOthers();
}
// You're out (or missed the playoffs): play out the rest of the playoffs to crown a champion.
function lgSimRest() {
  const L = lg();
  for (;;) {
    const cur = L.po.series[L.po.round],
      need = LG.need[L.po.round];
    for (const s of cur) while (s.wa < need && s.wb < need) lgSim(s.a, s.b) === s.a ? s.wa++ : s.wb++;
    if (L.po.round === 2) break;
    const next = [];
    for (let i = 0; i < cur.length; i += 2) next.push({ a: lgWinner(cur[i]), b: lgWinner(cur[i + 1]), wa: 0, wb: 0 });
    L.po.round++;
    L.po.series.push(next);
  }
  L.champion = lgWinner(L.po.series[2][0]);
  lgDone();
}
function lgDone() {
  const L = lg();
  L.phase = "done";
  if (!L.champion) L.champion = lgWinner(L.po.series[2][0]);
  const r = L.rec[L.team];
  L.hist.push({ s: L.season, team: L.team, w: r[0], l: r[1], finish: L.finish });
}
// Your series in the current playoff round (null if you're not in it).
function lgMySeries() {
  const L = lg();
  if (!L.po || L.phase !== "po") return null;
  return L.po.series[L.po.round].find((s) => s.a === L.team || s.b === L.team) || null;
}
// All 30 teams, best record first (ties: the stronger team).
function lgTable() {
  const L = lg();
  return Object.keys(L.rec).sort((a, b) => {
    const A = L.rec[a],
      B = L.rec[b];
    return B[0] - A[0] || A[1] - B[1] || lgStrength(b) - lgStrength(a);
  });
}
const FINISH_TEXT = { champion: "CHAMPIONS", finals: "LOST IN THE FINALS", semis: "LOST IN THE SEMI-FINALS", playoffs: "LOST IN THE QUARTER-FINALS", missed: "MISSED THE PLAYOFFS" };
