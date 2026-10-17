"use strict";
// Input listeners, button wiring and start-up.
addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code.startsWith("Arrow") || (e.ctrlKey && G.run && !G.pause))
    e.preventDefault();
  keys.add(e.code);
  if (!e.repeat) BUF[e.code] = T;
  ac();
  if (e.code === "KeyN" && !e.repeat) musToggle();
  if (!G.run) return;
  if (e.code === "Escape") pause();
  if (e.code === "KeyR" && !G.cut && !G.dead && !G.tip) setPoss(G.poss);
  if (e.code === "KeyC") G.cm = G.cm === "c" ? "b" : "c";
  if (e.code === "Enter" && G.cut && G.cut.t < G.cut.d * 0.7) G.cut.t = G.cut.d * 0.7;
  if (e.code === "KeyM") {
    AU.mute ^= 1;
    toast(AU.mute ? "MUTED" : "SOUND ON", 0.6);
  }
});
addEventListener("mousedown", (e) => {
  ac();
  if (G.run && !G.pause && e.button === 0) G.click = 1;
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => keys.clear());
addEventListener("resize", rs);
$("go").onclick = () => openSel(0);
$("pr").onclick = () => openSel(1);
$("play").onclick = () => {
  setTeams(SEL.a, SEL.b);
  $("sel").style.display = "none";
  start(SEL.pr);
};
$("bk").onclick = () => {
  $("sel").style.display = "none";
  $("menu").style.display = "grid";
};
$("rs").onclick = pause;
$("mu").onclick = musToggle;
$("ct").onclick = () => {
  const e = $("ctl");
  e.style.display = e.style.display === "none" ? "block" : "none";
};
$("lm").onclick = () => $("mf").click();
$("mf").onchange = (e) => {
  const l = [...e.target.files];
  if (!l.length) return;
  MUS.list = l.map((x) => ({
    s: URL.createObjectURL(x),
    n: x.name.replace(/\.[^.]+$/, "").replace(/_/g, " "),
  }));
  MUS.q = [];
  MUS.fail = 0;
  MUS.on = 1;
  $("mu").textContent = "MUSIC: ON";
  musNext();
};
$("qt2").onclick = () => {
  G.run = 0;
  G.pause = 0;
  G.cut = G.tip = null;
  document.body.classList.remove("cine", "bars");
  $("ttl").className = "";
  $("meter").classList.remove("on");
  $("vm").style.display = "none";
  $("pause").style.display = "none";
  $("hud").style.display = "none";
  $("menu").style.display = "grid";
};
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
requestAnimationFrame(loop);
