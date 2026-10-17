"use strict";
// Campaign screens: create your hooper, chapter map, story card, results (also used after Quick Play).
const CUI = { ch: 0, ci: 0, gi: 0, heroP: null };
SCREENS.push("hero", "camp", "story", "res", "inv", "shop", "open", "lab");

// ---------- your hooper: name, skin tone, hair
function openHero(first) {
  $("heroName").value = SAVE.name;
  const draw = () => {
    $("heroSkin").innerHTML = SK.map((c, i) => `<button data-i="${i}" style="background:${c}" class="${SAVE.skin === i ? "on" : ""}" aria-label="Skin tone ${i + 1}"></button>`).join("");
    $("heroSkin").querySelectorAll("button").forEach((b) => (b.onclick = () => ((SAVE.skin = +b.dataset.i), draw())));
    $("heroHair").innerHTML = ["SHORT", "TALL", "BUZZ", "BALD", "AFRO"].map((l, i) => `<button data-i="${i}" class="${SAVE.hair === i ? "on" : ""}">${l}</button>`).join("");
    $("heroHair").querySelectorAll("button").forEach((b) => (b.onclick = () => ((SAVE.hair = +b.dataset.i), draw())));
  };
  draw();
  $("bHeroX").onclick = () => show(first ? "menu" : "camp");
  $("bHeroOk").onclick = () => {
    SAVE.name = ($("heroName").value || "ROOKIE").toUpperCase().replace(/[^A-Z0-9 .'-]/g, "").trim().slice(0, 12) || "ROOKIE";
    writeSave();
    openCamp();
  };
  show("hero");
}
function heroPreview() {
  if (!$("hero").classList.contains("on")) return;
  const nm = ($("heroName").value || "ROOKIE").toUpperCase();
  const T0 = { ...crewTeam() };
  if (!CUI.heroP) CUI.heroP = portraitPlayer(0, 0, 9, -1);
  Object.assign(CUI.heroP, { team: T0, sk: SK[SAVE.skin], look: 91, pos: "SG", ht: 76, hair: SAVE.hair, name: nm });
  CUI.heroP.port.t = T;
  CUI.heroP.port.ball = [0.95, -0.6, 0.55 + Math.abs(Math.sin(T * 5.5)) * 2.6];
  renderModel($("heroCv"), CUI.heroP, 0.75);
}

// ---------- chapter map
function openCamp() {
  if (!SAVE.name) return openHero(true);
  // Open on the furthest chapter you've unlocked.
  CUI.ch = 0;
  for (let i = 0; i < CAMP.length; i++) if (gameUnlocked(i, 0)) CUI.ch = i;
  drawCamp();
  ccShow();
  show("camp");
}
const starStr = (n) => "★★★".split("").map((s, i) => (i < n ? `<i>${s}</i>` : s)).join("");
function drawCamp() {
  const ch = CAMP[CUI.ch],
    open = gameUnlocked(CUI.ch, 0);
  $("chTitle").textContent = `CHAPTER ${CUI.ch + 1}: ${ch.title}`;
  $("chSub").textContent = open ? ch.sub : "Locked. Beat the last boss to open it.";
  $("chPrev").onclick = () => ((CUI.ch = Math.max(0, CUI.ch - 1)), drawCamp());
  $("chNext").onclick = () => ((CUI.ch = Math.min(CAMP.length - 1, CUI.ch + 1)), drawCamp());
  $("campRows").innerHTML = ch.games
    .map((gm, gi) => {
      const opp = gm.opp(),
        lock = !gameUnlocked(CUI.ch, gi),
        boss = gi === 5,
        what = gm.rules.target ? `First to ${gm.rules.target}` : `${gm.rules.nq > 1 ? gm.rules.nq + " × " : ""}${gm.rules.qlen / 60} min`;
      return `<div class="cg${lock ? " lock" : ""}" data-g="${gi}">
        <div class="num${boss ? " boss" : ""}">${boss ? "BOSS" : gi + 1}</div>
        <b>${lock ? "???" : "VS " + opp.n}</b>
        <span>${lock ? "Win the game before to unlock" : `${gm.court === "street" ? "Street" : "Arena"} · ${gm.mode === "mayhem" ? "MAYHEM" : "Clean"} · ${DIFF[gm.diff].name} · ${what}`}</span>
        <div class="stars">${starStr(starsOf(gm.id))}</div></div>`;
    })
    .join("");
  $("campRows").querySelectorAll(".cg:not(.lock)").forEach((r) => (r.onclick = () => openStory(CUI.ch, +r.dataset.g)));
  $("bCampX").onclick = () => show("menu");
  $("bHeroEdit").onclick = () => openHero(false);
}

// ---------- story card and goals
const goalText = (gl) => GOAL_TEXT[gl.k](gl);
function openStory(ci, gi) {
  CUI.ci = ci;
  CUI.gi = gi;
  const gm = CAMP[ci].games[gi];
  $("storyLines").innerHTML = gm.intro.map(([who, t]) => `<p><b>${who === "HERO" ? SAVE.name : who}</b>${t}</p>`).join("");
  $("storyGoals").innerHTML =
    gm.goals.map((gl) => `<div>${goalText(gl)}</div>`).join("") +
    (gm.rules.start[1] ? `<div class="meta">You start down ${gm.rules.start[1]}-${gm.rules.start[0]}.</div>` : "");
  $("bStoryX").onclick = () => show("camp");
  $("bStoryGo").onclick = () => startCamp(ci, gi);
  show("story");
}
function startCamp(ci, gi) {
  const gm = CAMP[ci].games[gi];
  Object.assign(OPT, { court: gm.court, mode: gm.mode, diff: gm.diff });
  G.rules = { ...gm.rules };
  G.camp = { ci, gi };
  setTeamObjs(crewTeam(), gm.opp());
  start(0);
}
function startQuick(pr) {
  G.rules = { ...RULES_STD };
  G.camp = null;
  setTeams(SEL.a, SEL.b);
  start(pr);
}

// ---------- results: score, stars, Court Coins
function showResults() {
  const won = G.home > G.away,
    camp = G.camp,
    extra = [];
  let met = [],
    gm = null;
  if (camp) {
    gm = CAMP[camp.ci].games[camp.gi];
    met = gm.goals.map((gl) => goalMet(gl, won));
    const n = won ? met.filter(Boolean).length : 0,
      prev = starsOf(gm.id);
    if (n > prev) {
      extra.push([`New stars ×${n - prev}`, (n - prev) * 25]);
      if (prev === 0) extra.push(["First win bonus", 50 + camp.ci * 25]);
      SAVE.stars[gm.id] = n;
    }
  }
  const pay = payout(won, extra);
  $("res").classList.toggle("won", won);
  $("resTitle").textContent = won ? (camp && gm.outro && camp.gi === 5 ? "BOSS DOWN!" : "WIN!") : G.home === G.away ? "TIE" : "LOSS";
  $("resScore").textContent = `${TM[0].c} ${G.home} – ${G.away} ${TM[1].c}`;
  $("resOutro").innerHTML = won && gm && gm.outro ? gm.outro.map(([who, t]) => `<p><b>${who}</b>${t}</p>`).join("") : "";
  $("resGoals").innerHTML = gm ? gm.goals.map((gl, i) => `<div class="${won && met[i] ? "ok" : ""}">${goalText(gl)}</div>`).join("") : "";
  $("resPay").innerHTML =
    pay.rows.map(([l, v]) => `<div>${l}<b>+${v}</b></div>`).join("") + `<div class="tot">COURT COINS<b>+${pay.total} CC</b></div>`;
  const acts = [];
  if (camp) {
    const nextG = camp.gi < 5 ? [camp.ci, camp.gi + 1] : camp.ci < CAMP.length - 1 ? [camp.ci + 1, 0] : null;
    if (won && nextG) acts.push(["NEXT GAME", "pri", () => openStory(...nextG)]);
    acts.push(["RETRY", won ? "" : "pri", () => openStory(camp.ci, camp.gi)]);
    acts.push(["CAMPAIGN", "", openCamp]);
  } else {
    acts.push(["PLAY AGAIN", "pri", () => openSel(0)]);
    acts.push(["MENU", "", () => show("menu")]);
  }
  $("resAct").innerHTML = acts.map(([l, c], i) => `<button class="btn ${c}" data-i="${i}">${l}</button>`).join("");
  $("resAct").querySelectorAll("button").forEach((b) => (b.onclick = acts[+b.dataset.i][2]));
  show("res");
}
