"use strict";
// Campaign screens: create your hooper, chapter map, story card, results (also used after Quick Play).
const CUI = { cid: "street", ch: 0, ci: 0, gi: 0, heroP: null };
SCREENS.push("hero", "campPick", "camp", "sign", "story", "res", "inv", "shop", "open", "lab");

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
  $("bHeroX").onclick = () => (first ? show("menu") : openCamp());
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

// ---------- choose a campaign: Street (Mayhem allowed) or NBA (professional rules only)
function openCamp() {
  if (!SAVE.name) return openHero(true);
  const count = (cid) => {
    const g = allGames(cid);
    return `${g.reduce((a, x) => a + starsOf(x.id), 0)} / ${g.length * 3} ★`;
  };
  $("cpNew").style.display = SAVE.seen.newStory ? "" : "none";
  $("cpStreetStars").textContent = count("street");
  // The NBA campaign opens once you've won the Street campaign's Summer Jam.
  const open = nbaOpen();
  $("cpNba").classList.toggle("lock", !open);
  $("cpNbaStars").textContent = open ? count("nba") + (offersWaiting() ? " · NEW OFFERS!" : "") : "🔒 WIN THE STREET CAMPAIGN TO GET SCOUTED";
  const go = (cid) => {
    if (SAVE.seen.newStory) {
      delete SAVE.seen.newStory;
      writeSave();
    }
    pickCamp(cid);
  };
  $("cpStreet").onclick = () => go("street");
  $("cpNba").onclick = () => (!open ? null : SAVE.nba.team ? go("nba") : openSign(() => go("nba")));
  $("bCpX").onclick = () => show("menu");
  $("bCpHero").onclick = () => openHero(false);
  show("campPick");
}
// ---------- chapter map
function pickCamp(cid) {
  CUI.cid = cid;
  CAMP = CAMPAIGNS[cid].chapters;
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
  $("chTitle").textContent = `${CUI.cid === "nba" ? "NBA" : "STREET"} · CHAPTER ${CUI.ch + 1}: ${ch.title}`;
  const rw = ANIM[ch.reward],
    got = starsOf(ch.games[5].id) > 0;
  $("chReward").className = "reward r-" + rw.rarity;
  $("chReward").innerHTML = `Beat the boss to unlock: <b>${RARITY[rw.rarity].name} ${rw.name}</b>${got ? ' <span class="got">✓ UNLOCKED</span>' : ""}`;
  $("chSub").textContent = open ? ch.sub : "Locked. Beat the last boss to open it.";
  // NBA: who you play for, what your contract pays, and new offers after each chapter.
  const nba = CUI.cid === "nba" && SAVE.nba.team;
  $("chContract").classList.toggle("on", !!nba);
  if (nba) {
    const t = NBA(SAVE.nba.team),
      wait = offersWaiting();
    $("chContract").style.setProperty("--tc", t.k);
    $("chContract").innerHTML = `<span>Playing for the <b>${t.n}</b> with ${mates(t).map((q) => q[0]).join(" and ")} · contract <b>${salary()} CC a day</b></span>
      <button class="btn${wait ? " new" : ""}" id="bContract">${wait ? "NEW OFFERS!" : "CONTRACT"}</button>`;
    $("bContract").onclick = () => openSign(() => pickCamp("nba"));
  }
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
        <span>${lock ? "Win the game before to unlock" : `${COURTS[gm.court].name[0] + COURTS[gm.court].name.slice(1).toLowerCase()} · ${gm.mode === "mayhem" ? "MAYHEM" : "Clean"} · ${DIFF[gm.diff].name} · ${what}`}</span>
        <div class="stars">${starStr(starsOf(gm.id))}</div></div>`;
    })
    .join("");
  $("campRows").querySelectorAll(".cg:not(.lock)").forEach((r) => (r.onclick = () => openStory(CUI.ch, +r.dataset.g)));
  $("bCampX").onclick = openCamp;
  // Watch the chapter's opening again (and its ending, once you've beaten the boss).
  $("bCampStory").disabled = !open;
  $("bCampStory").onclick = () => {
    const back = () => (drawCamp(), show("camp")),
      ci = CUI.ch;
    playScene(ch.intro, () => (got ? playScene(ch.outro, back, null, ci, ["CHAPTER " + (ci + 1) + " COMPLETE", ch.title]) : back()), null, ci, chapCard(ci));
  };
}

// ---------- story: the chapter's opening scene (first time only), the game's scene, then the goals card
const goalText = (gl) => GOAL_TEXT[gl.k](gl);
const chapCard = (ci) => [`${CUI.cid === "nba" ? "ROAD TO THE RING" : "KING OF THE COURTS"} · CHAPTER ${ci + 1}`, CAMP[ci].title];
// skip: go straight to the goals card (Retry).
function openStory(ci, gi, skip) {
  CUI.ch = ci;
  CUI.ci = ci;
  CUI.gi = gi;
  const ch = CAMP[ci],
    gm = ch.games[gi],
    opp = gm.opp(),
    key = CUI.cid + ci,
    card = () => storyCard(ci, gi, opp),
    intro = () => playScene(gm.intro, card, opp, ci);
  OPT.court = gm.court; // the court behind the story is the one you're about to play on
  if (skip) return card();
  if (gi === 0 && !SAVE.seen[key]) {
    SAVE.seen[key] = 1;
    writeSave();
    return playScene(ch.intro, intro, opp, ci, chapCard(ci));
  }
  intro();
}
function storyCard(ci, gi, opp) {
  const gm = CAMP[ci].games[gi],
    last = gm.intro[gm.intro.length - 1];
  $("storyVs").innerHTML = `<i>${gi === 5 ? "BOSS GAME" : "GAME " + (gi + 1)}</i><b>VS ${opp.n}</b>`;
  $("storyLines").innerHTML = last ? `<p><b>${last[0] === "HERO" ? SAVE.name : last[0] || "&nbsp;"}</b>${last[1].replace(/HERO/g, SAVE.name)}</p>` : "";
  $("storyGoals").innerHTML =
    gm.goals.map((gl) => `<div>${goalText(gl)}</div>`).join("") +
    (gm.rules.start[1] ? `<div class="meta">You start down ${gm.rules.start[1]}-${gm.rules.start[0]}.</div>` : "");
  $("bStoryX").onclick = () => (drawCamp(), show("camp"));
  if (gi === 5) {
    const rw = ANIM[CAMP[ci].reward];
    $("storyGoals").innerHTML += `<div class="meta r-${rw.rarity}">Boss reward: <span class="rtag">${RARITY[rw.rarity].name}</span> ${rw.name}</div>`;
  }
  $("bStoryGo").onclick = () => startCamp(ci, gi);
  show("story");
}
// After a campaign game: the win or loss scene, then (first boss win) the chapter's ending, then results.
const LOSE_LINES = { street: [["DEX", "Shake it off. We run it back."]], nba: [["COACH RAY", "Again. From the top."]] };
function campEnd() {
  const c = G.camp,
    ch = CAMPAIGNS[c.cid].chapters[c.ci],
    gm = ch.games[c.gi],
    won = G.home > G.away,
    firstBoss = won && c.gi === 5 && !(SAVE.stars[gm.id] > 0),
    then = () => (firstBoss && ch.outro ? playScene(ch.outro, showResults, TM[1], c.ci, ["CHAPTER " + (c.ci + 1) + " COMPLETE", ch.title]) : showResults());
  playScene(won ? gm.outro : gm.lose || LOSE_LINES[c.cid], then, TM[1], c.ci);
}
function startCamp(ci, gi) {
  const gm = CAMP[ci].games[gi];
  // The NBA campaign is always professional rules, whatever a game says.
  Object.assign(OPT, { court: gm.court, mode: CUI.cid === "nba" ? "clean" : gm.mode, diff: gm.diff });
  G.rules = { ...gm.rules };
  G.camp = { cid: CUI.cid, ci, gi };
  setTeamObjs(CUI.cid === "nba" ? nbaTeam() : crewTeam(), gm.opp());
  start(0);
}
// Quick Play: four 1-minute quarters.
const QUICK_RULES = { nq: 4, qlen: 60 };
const QUICK_BONUS = 100; // every finished Quick Play game pays this, win or lose
function startQuick(pr) {
  G.rules = { ...RULES_STD, ...QUICK_RULES };
  G.camp = null;
  setTeamObjs(LT()[SEL.a], LT()[SEL.b]);
  start(pr);
}

// ---------- results: score, stars, Court Coins
function showResults() {
  const won = G.home > G.away,
    camp = G.camp,
    extra = [];
  let met = [],
    gm = null;
  let unlocked = null;
  if (camp) {
    CAMP = CAMPAIGNS[camp.cid].chapters;
    CUI.cid = camp.cid;
    gm = CAMP[camp.ci].games[camp.gi];
    met = gm.goals.map((gl) => goalMet(gl, won));
    const n = won ? met.filter(Boolean).length : 0,
      prev = starsOf(gm.id);
    if (n > prev) {
      extra.push([`New stars ×${n - prev}`, (n - prev) * 25]);
      if (prev === 0) extra.push(["First win bonus", 50 + camp.ci * 25]);
      // Beating a chapter boss for the first time unlocks that chapter's Legendary animation.
      if (prev === 0 && camp.gi === 5) {
        const id = CAMP[camp.ci].reward;
        unlocked = ANIM[id];
        if (owns(id)) extra.push([`Already had ${unlocked.name}`, RARITY.legendary.refund]);
        else {
          SAVE.owned.push(id);
          if (unlocked.cat === "dribble" && SAVE.equip.moves.length < MAX_MOVES) SAVE.equip.moves.push(id);
        }
      }
      SAVE.stars[gm.id] = n;
    }
  }
  if (!camp) extra.push(["Game finished", QUICK_BONUS]);
  // Punches a "drop N players" goal needs are free: two thrown for each drop asked for.
  const dropGoal = gm && gm.goals.find((gl) => gl.k === "drops");
  const pay = payout(won, extra, dropGoal ? dropGoal.n * 2 : 0);
  $("res").classList.toggle("won", won);
  $("resTitle").textContent = won ? (camp && gm.outro && camp.gi === 5 ? "BOSS DOWN!" : "WIN!") : G.home === G.away ? "TIE" : "LOSS";
  $("resScore").textContent = `${TM[0].c} ${G.home} – ${G.away} ${TM[1].c}`;
  $("resOutro").innerHTML = ""; // the story lines played as a scene before this screen
  $("resGoals").innerHTML =
    (unlocked ? `<div class="meta res-unlock r-legendary">LEGENDARY UNLOCKED: ${unlocked.name}! Equip it in the Inventory.</div>` : "") +
    (gm ? gm.goals.map((gl, i) => `<div class="${won && met[i] ? "ok" : ""}">${goalText(gl)}</div>`).join("") : "");
  $("resPay").innerHTML =
    pay.rows.map(([l, v]) => `<div class="${v < 0 ? "neg" : ""}">${l}<b>${v < 0 ? "−" + -v : "+" + v}</b></div>`).join("") + `<div class="tot">COURT COINS<b>+${pay.total} CC</b></div>`;
  const acts = [];
  if (camp) {
    const nextG = camp.gi < 5 ? [camp.ci, camp.gi + 1] : camp.ci < CAMP.length - 1 ? [camp.ci + 1, 0] : null;
    // Winning the Summer Jam gets you scouted; clearing an NBA chapter brings better offers.
    const scouted = camp.cid === "street" && gm.id === STREET_FINAL && won && !SAVE.nba.team;
    if (scouted) acts.push(["CHOOSE YOUR NBA TEAM", "pri", () => openSign(() => pickCamp("nba"))]);
    else if (camp.cid === "nba" && won && offersWaiting()) acts.push(["NEW OFFERS", "pri", () => openSign(() => pickCamp("nba"))]);
    if (won && nextG) acts.push(["NEXT GAME", acts.length ? "" : "pri", () => openStory(...nextG)]);
    acts.push(["RETRY", won ? "" : "pri", () => openStory(camp.ci, camp.gi, 1)]);
    acts.push(["CAMPAIGN", "", () => pickCamp(camp.cid)]);
  } else {
    acts.push(["PLAY AGAIN", "pri", () => openSel(0)]);
    acts.push(["MENU", "", () => show("menu")]);
  }
  $("resAct").innerHTML = acts.map(([l, c], i) => `<button class="btn ${c}" data-i="${i}">${l}</button>`).join("");
  $("resAct").querySelectorAll("button").forEach((b) => (b.onclick = acts[+b.dataset.i][2]));
  show("res");
}

// ---------- NBA career: choose a team, re-sign or move after each NBA chapter. then: where to go after.
function openSign(then) {
  const N = SAVE.nba,
    wait = offersWaiting(),
    tier = offerTier(),
    pay = salary(),
    card = (code, cur) => {
      const t = NBA(code),
        m = mates(t);
      return `<button class="offer${cur ? " cur" : ""}" data-c="${code}" style="--tc:${t.k}">
        <i>${cur ? "STAY WITH" : "OFFER"}</i><b>${t.n}</b><span>${t.city}</span>
        <span>Play with ${m.map((q) => `${q[0]} <em>${q[2]}</em>`).join(" and ")}</span>
        <em>${pay} CC a day</em></button>`;
    };
  $("signTitle").textContent = !N.team ? "SCOUTED! CHOOSE YOUR TEAM" : wait ? "NEW OFFERS" : "YOUR CONTRACT";
  $("signSub").textContent = !N.team
    ? "Three teams from the bottom of the league want you. Win with them and better teams will call. Your contract pays Court Coins every day."
    : wait
      ? `You cleared a chapter. ${["", "Teams from the middle of the league", "The best teams in the league"][tier]} want you. Stay, or move up. Pay goes up either way.`
      : `You play for the ${NBA(N.team).n}. Your contract pays ${pay} CC a day. Beat this chapter's boss for new offers.`;
  const codes = wait ? nbaOffers() : [];
  $("signOffers").innerHTML = (N.team ? card(N.team, 1) : "") + codes.map((c) => card(c)).join("");
  $("signOffers").querySelectorAll(".offer").forEach(
    (b) =>
      (b.onclick = () => {
        if (wait || !N.team) signWith(b.dataset.c);
        then();
      }),
  );
  // You can't leave without a team the first time: the NBA campaign needs one.
  $("bSignX").onclick = () => (N.team ? then() : openCamp());
  ccShow();
  show("sign");
}
// Payday: your NBA contract pays once a day, the first time the menu opens that day (missed days add up to a week).
function payday() {
  if (!SAVE.nba.team) return;
  const today = dayKey(new Date());
  if (SAVE.payday === today) return;
  let days = 1;
  if (SAVE.payday) {
    const y = Math.floor(SAVE.payday / 10000),
      m = Math.floor(SAVE.payday / 100) % 100,
      d = SAVE.payday % 100;
    days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d).getTime()) / 864e5);
  }
  days = Math.max(1, Math.min(PAY_DAYS_MAX, days));
  const amt = salary() * days;
  SAVE.cc += amt;
  SAVE.payday = today;
  writeSave();
  const el = $("payday");
  el.textContent = `PAYDAY! +${amt} CC · ${NBA(SAVE.nba.team).n} CONTRACT${days > 1 ? ` (${days} DAYS)` : ""}`;
  el.classList.add("on");
  sfx("rare");
  setTimeout(() => el.classList.remove("on"), 4000);
}
