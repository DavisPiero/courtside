"use strict";
// Career League screen: the season hub (next game, standings, schedule, playoff bracket), pre-season offers and the
// season's end. The season itself is in js/league.js.
SCREENS.push("league");
const LUI = { tab: "table" };

function openLeague() {
  if (!lg()) leagueNew();
  drawLeague();
  show("league");
}
const teamChip = (c, me) => `<span class="lgt${me ? " me" : ""}" style="--tc:${NBA(c).k}">${NBA(c).n}</span>`;
function drawLeague() {
  const L = lg(),
    rec = L.rec[L.team] || [0, 0],
    my = hooperOvr(),
    rr = lgRec(L);
  $("lgTitle").textContent = `CAREER LEAGUE · SEASON ${L.season}`;
  $("lgTop").innerHTML =
    (L.team ? `<div><i>TEAM</i><b>${NBA(L.team).n}</b></div><div><i>RECORD</i><b>${rec[0]}-${rec[1]}</b></div>` : `<div><i>PRE-SEASON</i><b>CHOOSE YOUR TEAM</b></div>`) +
    `<div><i>RINGS</i><b>${L.rings}</b></div>` +
    `<div class="${my >= rr ? "ok" : "lo"}"><i>YOUR RATING / RECOMMENDED</i><b>${my} / ${rr}</b></div>`;
  $("league").querySelector(".lgmain").classList.toggle("pre", L.phase === "pre");
  drawLgNext();
  drawLgTabs();
  $("bLgX").onclick = openCamp;
  $("bLgHero").onclick = () => openHero(false);
  ccShow();
  fitSoon();
}
// The left side: offers, next game, or the season's end.
function drawLgNext() {
  const L = lg(),
    N = $("lgNext");
  if (L.phase === "pre") {
    const card = (code, cur) => {
      const t = NBA(code),
        m = mates(t);
      return `<button class="offer${cur ? " cur" : ""}" data-c="${code}" style="--tc:${t.k}">
        <i>${cur ? "STAY WITH" : "OFFER"}</i><b>${t.n}</b>
        <span>Play with ${m.map((q) => `${q[0]} <em>${q[2]}</em>`).join(" and ")}</span>
        <em>${cur ? "No bonus" : `+${SIGN_BONUS} BONUS`}</em></button>`;
    };
    N.innerHTML =
      `<p class="lgsay">${L.season === 1 ? "COACH RAY: “Twenty years, no ring. Then you showed up. Now let's do it again.”" : "A new season. Teams have called. Stay, or move?"}</p>` +
      (L.hist.length ? `<p class="lgsay lghist">${L.hist.slice(-3).map((h) => `Season ${h.s}: ${NBA(h.team).n}, ${h.w}-${h.l}, ${FINISH_TEXT[h.finish]}`).join("<br>")}</p>` : "") +
      `<div class="offers lgoffers">${SAVE.nba.team ? card(SAVE.nba.team, 1) : ""}${L.offers.map((c) => card(c)).join("")}</div>`;
    N.querySelectorAll(".offer").forEach(
      (b) =>
        (b.onclick = () => {
          const bonus = leagueSign(b.dataset.c);
          drawLeague();
          if (bonus) flashBanner(`SIGNED! +${bonus} CC SIGNING BONUS`);
        }),
    );
    return;
  }
  if (L.phase === "done") {
    const champ = L.champion === L.team;
    N.innerHTML = `<div class="lgend${champ ? " gold" : ""}"><i>SEASON ${L.season} IS OVER</i><b>${FINISH_TEXT[L.finish] || ""}</b>
      <span>Champions: ${NBA(L.champion).n}</span>${champ ? `<span>Ring number ${L.rings}! A free Hall of Fame Pack is waiting in the Shop.</span>` : ""}</div>
      <button class="btn pri" id="bLgNew">START SEASON ${L.season + 1}</button>`;
    $("bLgNew").onclick = () => (leagueNew(), drawLeague());
    return;
  }
  const nx = lgNext(),
    t = NBA(nx.opp),
    d = lgDiff(nx.opp);
  N.innerHTML = `<div class="lgnextc" style="--tc:${t.k}"><i>${nx.label}</i><b>${t.n}</b>
    ${nx.rival ? `<em class="rival">RIVALRY: ZEKE KNOX</em>` : ""}${nx.opp === L.champ ? `<em class="rival">LAST SEASON'S CHAMPIONS</em>` : ""}
    <span class="lgbest">Their best: ${mates(t).map((q) => `${q[0]} <em>${q[2]}</em>`).join(", ")}</span>
    <span>Difficulty: ${DIFF[d].name}</span></div>
    <button class="btn pri" id="bLgPlay">PLAY</button>`;
  $("bLgPlay").onclick = startLeague;
}
// The right side: standings, your schedule, the playoff bracket.
function drawLgTabs() {
  const L = lg(),
    tabs = [["table", "STANDINGS"], ["sched", "SCHEDULE"], ["po", "PLAYOFFS"]];
  if (LUI.tab === "po" && !L.po) LUI.tab = "table";
  $("lgTabs").innerHTML = tabs.map(([k, n]) => `<button data-t="${k}" class="${LUI.tab === k ? "on" : ""}"${k === "po" && !L.po ? " disabled" : ""}>${n}</button>`).join("");
  $("lgTabs").querySelectorAll("button").forEach((b) => (b.onclick = () => ((LUI.tab = b.dataset.t), drawLgTabs())));
  const box = $("lgList");
  if (L.phase === "pre") return (box.innerHTML = "");
  if (LUI.tab === "table")
    box.innerHTML = lgTable()
      .map((c, i) => `${i === LG.poTeams ? `<div class="lgline">PLAYOFF LINE</div>` : ""}<div class="lgrow${c === L.team ? " me" : ""}"><u>${i + 1}</u>${teamChip(c, c === L.team)}<b>${L.rec[c][0]}-${L.rec[c][1]}</b></div>`)
      .join("");
  else if (LUI.tab === "sched")
    box.innerHTML = L.sched
      .map((c, i) => {
        const r = L.res[i];
        return `<div class="lgrow${i === L.res.length && L.phase === "reg" ? " next" : ""}"><u>${i + 1}</u>${teamChip(c)}${c === L.knox ? "<em>RIVAL</em>" : ""}<b class="${r ? (r.w ? "w" : "l") : ""}">${r ? (r.w ? "W " : "L ") + r.s : i === L.res.length && L.phase === "reg" ? "NEXT" : ""}</b></div>`;
      })
      .join("");
  else
    box.innerHTML = L.po.series
      .map(
        (rd, ri) =>
          `<div class="lgline">${ROUND_NAMES[ri]}</div>` +
          rd.map((s) => `<div class="lgser">${teamChip(s.a, s.a === L.team)}<b>${s.wa}-${s.wb}</b>${teamChip(s.b, s.b === L.team)}</div>`).join(""),
      )
      .join("");
}
// After a league game: record it, then the usual results screen with the league's extras.
function leagueEnd() {
  G.league.extra = leagueRecord(G.home > G.away, `${G.home}-${G.away}`);
  showResults();
}
