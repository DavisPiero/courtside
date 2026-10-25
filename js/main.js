"use strict";
// Input listeners, button wiring and start-up.
addEventListener("keydown", (e) => {
  if (e.target && e.target.tagName === "INPUT") {
    if ((e.key === "Enter" || e.code === "Enter") && e.target.id === "heroName") $("bHeroOk").click();
    return; // typing a name: keys aren't game controls
  }
  if (e.code === "Space" || e.code.startsWith("Arrow") || (e.ctrlKey && G.run && !G.pause))
    e.preventDefault();
  keys.add(e.code);
  if (!e.repeat) BUF[e.code] = T;
  ac();
  if (e.code === "KeyM" && !e.repeat) {
    sndToggle();
    if (G.run) toast(AU.mute ? "SOUND OFF" : "SOUND ON", 0.6);
  }
  if ($("setup").classList.contains("on")) {
    // Setup screen: A/D your team, arrows the opponent, Enter to start, Esc back.
    if (e.code === "KeyA") cycle(0, -1);
    if (e.code === "KeyD") cycle(0, 1);
    if (e.code === "ArrowLeft") cycle(1, -1);
    if (e.code === "ArrowRight") cycle(1, 1);
    if (e.code === "Enter") {
      e.preventDefault(); // stop the focused button (e.g. PLAY) from also being pressed
      $("bStart").click();
    }
    if (e.code === "Escape") pickOpen() ? closePick() : SEL.grid >= 0 ? closeGrid() : (SEL.pr ? show("menu") : showPlay());
    return;
  }
  // Escape steps back out of menu screens.
  if (!G.run && e.code === "Escape") {
    const back = { inv: "menu", shop: "menu", open: "shop", campPick: "play", camp: "campPick", story: "camp", hero: "play", mini: "play" };
    if ($("open").classList.contains("on")) return openShop();
    if ($("lab").classList.contains("on")) return $("bLabX").click();
    if ($("daily").classList.contains("on")) return closeDaily();
    if ($("acct").classList.contains("on")) return closeAcct();
    if ($("menu").classList.contains("on")) return menuSlide(0);
    for (const k in back) if ($(k).classList.contains("on")) return back[k] === "play" ? showPlay() : show(back[k]);
  }
  if ($("sets").classList.contains("on")) {
    if (e.code === "Escape") $("bSetX").click();
    return;
  }
  if (!G.run) return;
  if (e.code === "Enter" || e.code === "Space") e.preventDefault(); // keys are for the game, not focused buttons
  if (e.code === "Escape") pause();
  if (e.code === "KeyR" && !G.cut && !G.dead && !G.tip) setPoss(G.poss);
  if (e.code === "KeyC") {
    SET.camera = SET.camera === "chase" ? "broadcast" : "chase";
    applySetting("camera");
    saveSettings();
  }
  if (e.code === "Enter" && G.cut && G.cut.t < G.cut.d * 0.7) G.cut.t = G.cut.d * 0.7;
  if (e.code === "Enter" || e.code === "Space") winSkip();
});
addEventListener("mousedown", (e) => {
  ac();
  if (G.touch) return; // touch play punches with its own button
  if (G.run && !G.pause && e.button === 0) G.click = 1;
  if (G.run && !G.pause) winSkip();
});
addEventListener("keyup", (e) => keys.delete(e.code));
// Every menu button clicks; hovering one ticks (mouse only).
const UI_BTN = ".btn, .tabs button, .seg button, .dcard, .arr, .tile, .offer, .tpick";
addEventListener("pointerdown", (e) => {
  const b = e.target.closest && e.target.closest(UI_BTN);
  if (b && !b.disabled && (!G.run || G.pause)) (ac(), sfx("click"));
});
addEventListener("pointerover", (e) => {
  const b = e.pointerType === "mouse" && e.target.closest && e.target.closest(UI_BTN);
  if (b && !b.disabled && (!G.run || G.pause) && b !== UI_LAST.b) sfx("hover");
  UI_LAST.b = b;
});
const UI_LAST = { b: null };
addEventListener("blur", () => keys.clear());
addEventListener("resize", rs);
$("bPlay").onclick = () => openSel(0);
$("bPrac").onclick = () => openSel(1);
$("bSet").onclick = () => openSettings("menu");
$("bStart").onclick = () => startQuick(SEL.pr);
$("bGo").onclick = () => menuSlide(1);
$("bPlayX").onclick = () => menuSlide(0);
$("bCamp").onclick = openCamp;
$("bMini").onclick = openMini;
$("bTut").onclick = () => openTutorial();
$("bInv").onclick = openInv;
$("bShop").onclick = openShop;
$("bLab").onclick = openLab;
$("bBack").onclick = () => (SEL.pr ? show("menu") : showPlay());
$("bRes").onclick = pause;
$("bPSet").onclick = () => openSettings("pause");
$("bQuit").onclick = quitToMenu;
function quitToMenu() {
  G.run = 0;
  G.mg = G.win = G.bb = null;
  TUT.on = 0;
  $("tut").className = "";
  G.pause = 0;
  G.cut = G.tip = null;
  document.body.classList.remove("cine", "bars");
  $("ttl").className = "";
  $("meter").classList.remove("on");
  $("vm").style.display = "none";
  hudOn(0);
  show("menu");
}
function sndToggle() {
  SET.sfx = SET.sfx ? 0 : 1;
  applySetting("sfx");
  saveSettings();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden && G.run && !G.pause) pause();
});
window.addEventListener("error", (e) => {
  let b = $("err");
  if (!b) {
    b = document.createElement("div");
    b.id = "err";
    b.style.cssText =
      "position:fixed;z-index:99;left:10px;right:10px;bottom:10px;padding:10px;background:#401d25;color:#fff;font:13px system-ui";
    document.body.appendChild(b);
  }
  b.textContent = "Game error: " + e.message + " (line " + e.lineno + ")";
});
rs();
init();
if (/[?&]smoke\b/.test(location.search)) smoke();
else if (/[?&]bench\b/.test(location.search)) bench();
else if (/[?&]fitcheck\b/.test(location.search)) document.fonts.ready.then(fitCheck); // sizes need the real font
else {
  requestAnimationFrame(loop);
  // ?device=pc or ?device=touch skips the loading and device screens (for testing).
  const dv = (location.search.match(/[?&]device=(pc|touch)/) || [])[1];
  if (dv) chooseDevice(dv);
  else bootLoad();
}

// Fit check (tools/smoke.sh runs it at iPad and phone sizes): opens every menu screen on touch and lists any
// button that is off the screen or hidden under something. Buttons inside a scrolling list don't count.
function fitCheck() {
  const out = [],
    bad = [],
    hide = () => document.querySelectorAll(".scr").forEach((s) => s.classList.remove("on"));
  // Cut off sideways by a parent that hides what's wider than itself? (A button's middle can still show.)
  const cutSide = (el, w) => {
    const r = el.getBoundingClientRect(),
      right = r.left + (w || r.width);
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflowX === "visible") continue;
      const ar = a.getBoundingClientRect();
      if (r.left < ar.left - 1 || right > ar.right + 1) return true;
    }
    return right > innerWidth + 1;
  };
  const check = (id) => {
    fitScreens();
    // with a pop-up open, only its buttons matter (the screen behind is covered on purpose)
    const pop = ["accDel", "acct", "ppick"].find((k) => $(k).classList.contains("on")),
      root = pop ? $(pop) : pickOpen() && id === "setup" ? $("pick") : id === "menu" && $("daily").classList.contains("on") ? $("daily") : id === "menu" && $("event").classList.contains("on") ? $("event") : $(id);
    for (const b of root.querySelectorAll("button, input")) {
      const r = b.getBoundingClientRect();
      // a scrolling list, or the scrolling middle of a panel, may hide buttons; a pinned button row may not
      if (!r.width || !r.height || b.closest(".rows") || b.closest(".pgrid") || b.closest(".ppgrid") || b.closest("[inert]") || (b.closest(".fitscroll") && !b.closest(".fitscroll:not(.nopin) > .act"))) continue;
      const off = r.bottom > innerHeight + 1 || r.right > innerWidth + 1 || r.top < -1 || r.left < -1,
        h = off ? null : document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (off || !h || !(b === h || b.contains(h)) || cutSide(b)) bad.push(`${id}: ${(b.textContent || b.id).trim().slice(0, 20)}`);
    }
    // the logo too (David's iPad, 6b: the menu column cut off the E and the right-hand buttons)
    for (const t of root.querySelectorAll(".brand")) if (cutSide(t, t.scrollWidth)) bad.push(`${id}: logo cut off`);
    const p = $(id).querySelector(":scope > .box, :scope > .dv, :scope > .menu-l");
    out.push(`${id.padEnd(9)} ${p && p.classList.contains("fitscroll") ? "scrolls" : "fits"}`);
    return p && p.getBoundingClientRect();
  };
  const run = (id, fn) => {
    try {
      hide();
      closeAcct();
      closeEvent();
      fn();
      check(id);
    } catch (e) {
      bad.push(`${id}: ERROR ${e.message}`);
    }
  };
  chooseDevice("touch");
  SAVE.name = SAVE.name || "ROOKIE";
  run("menu", () => show("menu"));
  run("device", () => show("device"));
  run("setup", () => openSel());
  run("setup", () => (openSel(), openPick("court")));
  run("setup", () => (openSel(), openPick("diff")));
  run("setup", () => (closePick(), openSel()));
  run("hero", () => openHero());
  run("menu", showPlay);
  run("menu", () => (show("menu"), openDaily()));
  run("menu", () => (show("menu"), closeDaily(), openEvent()));
  // The account page as a guest and signed in (a long name, a full showcase), its choosers, the gear's pop-up
  // in every state, and the are-you-sure for deleting.
  SAVE.prof.slots = ["a:dunk.basic", "a:cel.basic", "s:" + SHOES[0].id, ""];
  run("prof", () => openProf());
  for (const v of ["signin", "up", "in"])
    run("prof", () => {
      Object.assign(ACC, { state: v === "in" ? "in" : "out", view: v, name: "FITCHECK_LONGNAME", user: v === "in" ? { email: "a.very.long.email.address@example.com" } : null });
      openProf();
      openAcct();
    });
  run("prof", () => (openProf(), closeAcct()));
  run("prof", () => (openProf(), accDelete()));
  run("prof", () => (openProf(), pickPic()));
  run("prof", () => (openProf(), pickTitle()));
  run("prof", () => (openProf(), pickSlot(0, "a")));
  run("prof", () => (openProf(), pickSlot(3, "s")));
  ACC.state = "off";
  ACC.user = null;
  run("campPick", () => $("campPick").classList.add("on"));
  run("camp", () => pickCamp("street"));
  run("mini", () => openMini());
  // Tabbed screens must keep one size on every tab (David's iPad screenshots: the Shop jumped about).
  const same = (id, tabs, open) => {
    let first = null;
    for (const t of tabs) {
      hide();
      open(t);
      const r = check(id);
      if (!r) continue;
      if (!first) first = r;
      else if (Math.abs(r.width - first.width) > 1 || Math.abs(r.height - first.height) > 1 || Math.abs(r.top - first.top) > 1)
        bad.push(`${id}: ${t} tab is a different size (${Math.round(r.width)}x${Math.round(r.height)} vs ${Math.round(first.width)}x${Math.round(first.height)})`);
    }
  };
  same("shop", ["daily", "packs", "players", "boxes", "codes"], (t) => ((SHOPUI.tab = t), openShop()));
  run("inv", () => openInv());
  run("lab", () => openLab());
  same("sets", ["VIDEO", "AUDIO", "GAMEPLAY", "CONTROLS"], (t) => ((SETUI.tab = t), openSettings("menu")));
  run("sign", () => openSign(() => {}));
  // Career League hub at each stage of a season (results made up, no games played).
  const lgFake = (n) => {
    for (let i = 0; i < n && lgNext(); i++) (G.league = { opp: lgNext().opp, extra: [] }), leagueRecord(i % 3 > 0, "50-44");
  };
  SAVE.nba.team = SAVE.nba.team || "BOS";
  SAVE.league = null;
  run("league", () => openLeague());
  run("league", () => (leagueSign(lg().offers[0]), (LUI.tab = "table"), openLeague()));
  run("league", () => (lgFake(5), (LUI.tab = "sched"), openLeague()));
  run("league", () => (lgFake(9), (LUI.tab = "po"), openLeague()));
  run("league", () => (lgFake(20), openLeague()));
  SAVE.league = null;
  G.league = null;
  run("pause", () => $("pause").classList.add("on"));
  run("tutc", () => $("tutc").classList.add("on"));
  run("res", () => {
    // a won boss game: the longest results screen
    CUI.cid = "street";
    CAMP = CAMPAIGNS.street.chapters;
    startCamp(2, 5);
    G.home = 22;
    G.away = 2;
    G.run = 0;
    showResults();
  });
  const pre = document.createElement("pre");
  pre.id = "smoke";
  pre.textContent = `${bad.length ? "FIT FAIL" : "FIT PASS"} ${innerWidth}x${innerHeight}\n${out.join("\n")}${bad.length ? "\nOFF SCREEN:\n" + bad.join("\n") : ""}`;
  document.body.appendChild(pre);
}

// Difficulty bench (tools/bench.sh): a bot that plays like a good kid (js/gameplay.js botHandler) against each level,
// several 3-minute games on the Arena, Clean. The average margin is the number to tune: a real kid should win
// on Rookie, win close on Pro, have a fight on All-Star and usually lose on Hall of Famer.
function bench() {
  const out = [],
    N = +(location.search.match(/[?&]n=(\d+)/) || [0, 6])[1];
  for (let diff = 0; diff < 4; diff++) {
    const m = [],
      st = {};
    for (let g = 0; g < N; g++) {
      Object.assign(OPT, { mode: "clean", court: "arena", diff });
      setTeams(...DEFAULT_TEAMS);
      // ?size=HT,WT: the bot's player is a hooper with every stat at 80 and that build (js/hooper.js).
      const sz = location.search.match(/[?&]size=(\d+),(\d+)/);
      if (sz) NM[0] = sizedRow({ ...Object.fromEntries(HSTATS.map((s) => [s.k, 80])), ht: +sz[1], wt: +sz[2] }, "BENCH", 80, 3, 0);
      start(0);
      G.tip = null;
      G.auto = 2;
      G.time = 180;
      G.bc = { sh: 0, mk: 0, rim: 0, pos: 0 };
      document.body.classList.remove("bars");
      setPoss(g % 2);
      let n = 0;
      while (G.run && G.q === 1 && n < 120 * 400) {
        step(1 / 120);
        T += 1 / 120;
        n++;
      }
      m.push(G.home - G.away);
      for (const k of ["dunks", "greens", "threes", "stl", "ankles", "oopc", "oops"]) (st[k] = (st[k] || 0) + (G.st[k] || 0) / N);
      st.them = (st.them || 0) + G.away / N;
      for (const k in G.bc) st["ai" + k] = (st["ai" + k] || 0) + G.bc[k] / N;
    }
    const avg = m.reduce((a, b) => a + b, 0) / N;
    out.push(`BENCH ${DIFF[diff].name.padEnd(14)} avg ${(avg >= 0 ? "+" : "") + avg.toFixed(1)}  (${m.join(" ")})`);
    if (/[?&]v\b/.test(location.search)) out.push("   per game: " + Object.entries(st).map(([k, v]) => k + " " + v.toFixed(1)).join(", "));
  }
  G.run = 0;
  G.auto = 0;
  G.bc = null;
  const pre = document.createElement("pre");
  pre.id = "smoke";
  pre.textContent = out.join("\n");
  document.body.appendChild(pre);
}
// Smoke test (tools/smoke.sh): AI plays both teams for a 2-minute quarter in every mode, court and difficulty.
// Your side always plays at Pro, so the score margin shows how hard each level is.
function smoke() {
  const out = [];
  let ok = true;
  for (const mode of ["mayhem", "clean"])
    for (const court of COURT_IDS)
      for (let diff = 0; diff < 4; diff++) {
        try {
          Object.assign(OPT, { mode, court, diff });
          setTeams(...DEFAULT_TEAMS);
          start(0);
          G.tip = null;
          G.auto = 1;
          G.time = 120; // a 2-minute quarter keeps the test quick
          document.body.classList.remove("bars");
          setPoss(0);
          let n = 0;
          while (G.run && G.q === 1) {
            step(1 / 120);
            T += 1 / 120;
            if (++n % 60 === 0) {
              camUpd(1 / 120);
              render();
              hud();
            }
            if (n > 120 * 400) throw new Error("quarter never ended");
          }
          out.push(`${mode.padEnd(7)} ${court.padEnd(7)} ${DIFF[diff].name.padEnd(14)} you ${G.home} - ${G.away} them`);
        } catch (e) {
          ok = false;
          out.push(`${mode} ${court} ${DIFF[diff].name}: ERROR ${e.message} ${(e.stack || "").split("\n")[1] || ""}`);
        }
      }
  // Minigames: the AI plays you in each one until it ends.
  for (const k of ["three", "dunk", "1v1"]) {
    try {
      startMini(k);
      G.auto = 1;
      let n = 0;
      while (G.run && G.mg) {
        step(1 / 120);
        T += 1 / 120;
        if (++n % 60 === 0) (camUpd(1 / 120), render(), hud());
        if (n > 120 * 300) throw new Error("minigame never ended");
      }
      out.push(`minigame ${k.padEnd(6)} ${$("resScore").textContent}`);
    } catch (e) {
      ok = false;
      out.push(`minigame ${k}: ERROR ${e.message} ${(e.stack || "").split("\n")[1] || ""}`);
    }
  }
  // Halloween quests: games on other courts don't count; eight good games on Haunted Hollow finish the track and
  // give the coins, the Jack-O shoes and the Witching Hour dunk. (Only while the event is on.)
  try {
    if (eventOn("halloween26")) {
      SAVE.ev = {};
      const had = { shoe: ownsShoe("jacko"), dunk: SAVE.owned.includes("dunk.witch") },
        cc0 = SAVE.cc,
        good = { won: true, margin: 15, st: { pts: 30, stl: 4, dunks: 6, threes: 4 }, court: "haunt", diff: 2 };
      evGame({ ...good, court: "street" });
      if (evDone("halloween26") !== 0) throw new Error("a game on another court counted");
      for (let i = 0; i < 9; i++) evGame(good);
      const S = SAVE.ev.halloween26;
      if (S.q !== 8 || !ownsShoe("jacko") || !SAVE.owned.includes("dunk.witch")) throw new Error(`quests ${S.q}/8, shoes ${ownsShoe("jacko")}, dunk ${SAVE.owned.includes("dunk.witch")}`);
      out.push(`halloween quests 8/8, +${SAVE.cc - cc0} CC, Jack-O and Witching Hour granted${had.shoe || had.dunk ? " (already owned)" : ""}`);
    } else out.push("halloween over: quests skipped");
  } catch (e) {
    ok = false;
    out.push(`halloween: ERROR ${e.message}`);
  }
  // Career League: a whole season, the AI playing your games, through to a champion.
  try {
    SAVE.nba.team = "BOS";
    SAVE.league = null;
    leagueNew();
    leagueSign(lg().offers[0]);
    let games = 0;
    while (lg().phase !== "done") {
      startLeague();
      G.tip = null;
      G.auto = 2; // the bench bot (a good kid) on Rookie, so the test reaches the playoffs
      OPT.diff = 0;
      let n = 0;
      while (G.run && G.league) {
        step(1 / 120);
        T += 1 / 120;
        if (++n % 240 === 0) (camUpd(1 / 120), render(), hud());
        if (n > 120 * 400) throw new Error("league game never ended");
      }
      if (G.run) G.run = 0;
      if (++games > 40) throw new Error("season never ended");
    }
    const L = lg(),
      r = L.rec[L.team];
    out.push(`league  season 1 ${L.team} ${r[0]}-${r[1]}, ${FINISH_TEXT[L.finish]}, champions ${L.champion}, ${games} games`);
  } catch (e) {
    ok = false;
    out.push(`league: ERROR ${e.message} ${(e.stack || "").split("\n")[1] || ""}`);
  }
  G.run = 0;
  G.auto = 0;
  const pre = document.createElement("pre");
  pre.id = "smoke";
  pre.textContent = (ok ? "SMOKE PASS" : "SMOKE FAIL") + "\n" + out.join("\n");
  document.body.appendChild(pre);
}
