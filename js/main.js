"use strict";
// Input listeners, button wiring and start-up.
addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code.startsWith("Arrow") || (e.ctrlKey && G.run && !G.pause))
    e.preventDefault();
  keys.add(e.code);
  if (!e.repeat) BUF[e.code] = T;
  ac();
  if (e.code === "KeyN" && !e.repeat) musToggle();
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
    if (e.code === "Enter") $("bStart").click();
    if (e.code === "Escape") show("menu");
    return;
  }
  if ($("ctls").classList.contains("on") && e.code === "Escape") return $("bCtlX").click();
  if (!G.run) return;
  if (e.code === "Escape") pause();
  if (e.code === "KeyR" && !G.cut && !G.dead && !G.tip) setPoss(G.poss);
  if (e.code === "KeyC") G.cm = G.cm === "c" ? "b" : "c";
  if (e.code === "Enter" && G.cut && G.cut.t < G.cut.d * 0.7) G.cut.t = G.cut.d * 0.7;
});
addEventListener("mousedown", (e) => {
  ac();
  if (G.run && !G.pause && e.button === 0) G.click = 1;
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => keys.clear());
addEventListener("resize", rs);
$("bPlay").onclick = () => openSel(0);
$("bPrac").onclick = () => openSel(1);
$("bCtl").onclick = () => openControls("menu");
$("bStart").onclick = () => {
  setTeams(SEL.a, SEL.b);
  start(SEL.pr);
};
$("bBack").onclick = () => show("menu");
$("bRes").onclick = pause;
$("bPCtl").onclick = () => openControls("pause");
$("mu").onclick = musToggle;
$("bSnd").onclick = sndToggle;
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
  AU.mute ^= 1;
  $("bSnd").textContent = "SOUND: " + (AU.mute ? "OFF" : "ON");
}
$("bSnd").textContent = "SOUND: " + (AU.mute ? "OFF" : "ON");
$("mu").textContent = "MUSIC: " + (MUS.on ? "ON" : "OFF");
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
else requestAnimationFrame(loop);

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
          setTeams(0, 1);
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
