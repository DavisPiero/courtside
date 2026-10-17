"use strict";
// Touch controls (Mobile / Tablet). Layout follows the conventions of the best mobile action games:
// - Left thumb: a floating joystick that appears where you touch the left side. Push to the edge to sprint.
// - Right thumb: one big main button plus two in an arc. Labels change with the situation
//   (with the ball: SHOOT / PASS / MOVE; on defence: JUMP / SWITCH / STEAL), so three buttons do everything.
// - Mayhem adds PUNCH and SLIDE. Pause and camera sit top-left, out of the thumbs' way.
// Buttons feed the same virtual keys as the keyboard, so the game logic doesn't care which you use.
const TOUCH = { stick: null, held: {} };
G.joy = null;
(function buildTouch() {
  const el = document.createElement("div");
  el.id = "touch";
  el.innerHTML = `
    <div class="tzone" id="tStickZone"><div class="tstick" id="tStick"><i></i></div></div>
    <div class="tbtns">
      <button class="tb big" data-b="main"><b>SHOOT</b></button>
      <button class="tb" data-b="pass"><b>PASS</b></button>
      <button class="tb" data-b="move"><b>MOVE</b></button>
      <button class="tb sm mh" data-b="punch"><b>PUNCH</b></button>
      <button class="tb sm mh" data-b="slide"><b>SLIDE</b></button>
    </div>
    <div class="ttop">
      <button class="tb tiny" data-b="pause" aria-label="Pause"><b>II</b></button>
      <button class="tb tiny" data-b="cam" aria-label="Camera"><b>CAM</b></button>
    </div>
    <div class="tskip" id="tSkip">TAP TO SKIP</div>`;
  document.body.appendChild(el);
  const rot = document.createElement("div");
  rot.id = "rotate";
  rot.innerHTML = `<div><b>↻</b>TURN YOUR DEVICE SIDEWAYS</div>`;
  document.body.appendChild(rot);

  // ---------- joystick
  const zone = $("tStickZone"),
    stick = $("tStick"),
    knob = stick.querySelector("i"),
    R = () => (stick.offsetWidth || 150) * 0.42; // how far the knob can travel
  zone.addEventListener("pointerdown", (e) => {
    if (TOUCH.stick) return;
    e.preventDefault();
    try {
      zone.setPointerCapture(e.pointerId);
    } catch (err) {}
    TOUCH.stick = { id: e.pointerId, x: e.clientX, y: e.clientY };
    stick.style.left = e.clientX + "px";
    stick.style.top = e.clientY + "px";
    stick.classList.add("on");
    G.joy = { x: 0, y: 0, m: 0 };
  });
  zone.addEventListener("pointermove", (e) => {
    const s = TOUCH.stick;
    if (!s || s.id !== e.pointerId) return;
    let dx = e.clientX - s.x,
      dy = e.clientY - s.y;
    const r = R(),
      d = Math.hypot(dx, dy) || 1,
      m = Math.min(1, d / r);
    // If the thumb drifts past the edge, drag the stick along with it (feels better than hitting a wall).
    if (d > r * 1.25) {
      s.x += (dx / d) * (d - r * 1.25);
      s.y += (dy / d) * (d - r * 1.25);
      stick.style.left = s.x + "px";
      stick.style.top = s.y + "px";
      dx = e.clientX - s.x;
      dy = e.clientY - s.y;
    }
    G.joy = { x: (dx / d) * m, y: (dy / d) * m, m };
    knob.style.transform = `translate(${(dx / d) * m * r}px, ${(dy / d) * m * r}px)`;
    stick.classList.toggle("sprint", m > 0.92);
  });
  const endStick = (e) => {
    const s = TOUCH.stick;
    if (!s || s.id !== e.pointerId) return;
    TOUCH.stick = null;
    G.joy = null;
    knob.style.transform = "";
    stick.classList.remove("on", "sprint");
  };
  zone.addEventListener("pointerup", endStick);
  zone.addEventListener("pointercancel", endStick);

  // ---------- buttons: press and release map to the keyboard keys
  const buzz = () => navigator.vibrate && navigator.vibrate(8);
  el.querySelectorAll(".tb").forEach((btn) => {
    const down = (e) => {
      e.preventDefault();
      try {
        btn.setPointerCapture(e.pointerId);
      } catch (err) {}
      btn.classList.add("dn");
      buzz();
      ac();
      const k = btn.dataset.b;
      if (k === "pause") return pause();
      if (k === "cam") {
        SET.camera = SET.camera === "chase" ? "broadcast" : "chase";
        applySetting("camera");
        return saveSettings();
      }
      if (k === "punch") return (G.click = 1);
      const code = touchCode(k);
      TOUCH.held[e.pointerId] = code;
      keys.add(code);
      BUF[code] = T;
    };
    const up = (e) => {
      btn.classList.remove("dn");
      const code = TOUCH.held[e.pointerId];
      if (code) keys.delete(code);
      delete TOUCH.held[e.pointerId];
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  });
  // Tap anywhere during the dunk replay to skip it.
  $("tSkip").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (G.cut && G.cut.t < G.cut.d * 0.7) G.cut.t = G.cut.d * 0.7;
  });
})();
// Which key a button presses right now: the right-thumb buttons change with possession.
function touchCode(k) {
  const b = G.ball,
    mine = b && b.own === G.ctrl;
  if (k === "main") return "Space";
  if (k === "pass") return "KeyQ";
  if (k === "move") return mine ? "KeyE" : "KeyF";
  if (k === "slide") return "ControlLeft";
  return "";
}
// Every frame: show the right controls with the right labels.
function touchUpd() {
  const on = G.touch && G.run && !G.pause;
  document.body.classList.toggle("tplay", !!on);
  document.body.classList.toggle("tmayhem", !!on && mayhem());
  if (!on) {
    G.joy = null;
    return;
  }
  const b = G.ball,
    mine = b.own === G.ctrl,
    ours = b.own >= 0 && b.own < 3,
    lab = (k, t) => {
      const e = document.querySelector(`#touch [data-b="${k}"] b`);
      if (e.textContent !== t) e.textContent = t;
    };
  lab("main", G.tip ? "TIP" : mine ? (G.shot ? "RELEASE" : "SHOOT") : ours ? "JUMP" : "BLOCK");
  lab("pass", mine ? "PASS" : "SWITCH");
  lab("move", mine ? "MOVE" : "STEAL");
  document.body.classList.toggle("tcut", !!G.cut);
  document.body.classList.toggle("ttip", !!G.tip);
}
// Phones held upright get a "turn sideways" prompt during play and menus.
function orientCheck() {
  const portrait = innerHeight > innerWidth * 1.05;
  document.body.classList.toggle("portrait", !!G.touch && portrait && innerWidth < 900);
}
addEventListener("resize", orientCheck);
