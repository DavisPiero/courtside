"use strict";
// Input listeners, button wiring and start-up.
addEventListener("keydown", (e) => {
  if (e.target && e.target.tagName === "INPUT") {
    if (e.code === "Enter") $("bHeroOk").click();
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
    if (e.code === "Escape") show("menu");
    return;
  }
  // Escape steps back out of menu screens.
  if (!G.run && e.code === "Escape") {
    const back = { inv: "menu", shop: "menu", open: "shop", campPick: "menu", camp: "campPick", story: "camp", hero: "menu" };
    if ($("open").classList.contains("on")) return openShop();
    if ($("lab").classList.contains("on")) return $("bLabX").click();
    for (const k in back) if ($(k).classList.contains("on")) return show(back[k]);
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
});
addEventListener("mousedown", (e) => {
  ac();
  if (G.touch) return; // touch play punches with its own button
  if (G.run && !G.pause && e.button === 0) G.click = 1;
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => keys.clear());
addEventListener("resize", rs);
$("bPlay").onclick = () => openSel(0);
$("bPrac").onclick = () => openSel(1);
$("bSet").onclick = () => openSettings("menu");
$("bStart").onclick = () => startQuick(SEL.pr);
$("bCamp").onclick = openCamp;
$("bInv").onclick = openInv;
$("bShop").onclick = openShop;
$("bLab").onclick = openLab;
$("bBack").onclick = () => show("menu");
$("bRes").onclick = pause;
$("bPSet").onclick = () => openSettings("pause");
$("bQuit").onclick = quitToMenu;
function quitToMenu() {
  G.run = 0;
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
else {
  requestAnimationFrame(loop);
  // ?device=pc or ?device=touch skips the loading and device screens (for testing).
  const dv = (location.search.match(/[?&]device=(pc|touch)/) || [])[1];
  if (dv) chooseDevice(dv);
  else bootLoad();
}

// Smoke test (tools/smoke.sh): AI plays both teams for a 2-minute quarter in every mode, court and difficulty.
// Your side always plays at Pro, so the score margin shows how hard each level is.
function smoke() {
  const out = [];
  let ok = true;
  for (const mode of ["mayhem", "clean"])
    for (const court of ["arena", "street"])
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
  G.run = 0;
  G.auto = 0;
  const pre = document.createElement("pre");
  pre.id = "smoke";
  pre.textContent = (ok ? "SMOKE PASS" : "SMOKE FAIL") + "\n" + out.join("\n");
  document.body.appendChild(pre);
}
