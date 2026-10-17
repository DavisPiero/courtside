"use strict";
// Team select, starting a game and the tip-off.
const SEL = { a: 0, b: 1, pr: 0 };
function openSel(pr) {
  ac();
  SEL.pr = pr;
  $("menu").style.display = "none";
  $("sel").style.display = "grid";
  drawSel();
}
function drawSel() {
  const card = (t, i, row) =>
    `<button class="tc${(row ? SEL.b : SEL.a) === i ? " on" : ""}${row && SEL.a === i ? " dis" : ""}" data-r="${row}" data-i="${i}" style="--c:${t.k};--a:${t.t === "#22242c" ? "#c7cfe0" : t.t}"><b>${t.n}</b>${t.p.map((q) => `<i>${q[0]}<u>${q[2]}</u></i>`).join("")}</button>`;
  $("myt").innerHTML = TEAMS.map((t, i) => card(t, i, 0)).join("");
  $("opt").innerHTML = TEAMS.map((t, i) => card(t, i, 1)).join("");
  document.querySelectorAll(".tc").forEach(
    (b) =>
      (b.onclick = () => {
        const i = +b.dataset.i;
        if (b.dataset.r === "0") {
          SEL.a = i;
          if (SEL.b === i) SEL.b = (i + 1) % 4;
        } else if (i !== SEL.a) SEL.b = i;
        drawSel();
      }),
  );
}
function start(pr) {
  G.prac = pr;
  init();
  G.run = 1;
  G.pause = 0;
  $("menu").style.display = "none";
  $("hud").style.display = "block";
  $("pause").style.display = "none";
  initTip();
}
function initTip() {
  const L = G.pl,
    b = G.ball,
    at = (i, x, y, f) =>
      Object.assign(L[i], {
        x,
        y,
        f,
        vx: 0,
        vy: 0,
        z: 0,
        vz: 0,
        stt: "",
        hw: null,
        hw2: null,
        def: i === 2 || i === 5,
        fol: 0,
      });
  at(2, 45.4, 25, 0);
  at(5, 48.6, 25, Math.PI);
  at(0, 38, 15, 0);
  at(1, 38, 35, 0);
  at(3, 56, 35, Math.PI);
  at(4, 56, 15, Math.PI);
  Object.assign(b, {
    own: -1,
    mode: "cut",
    x: 47,
    y: 25,
    z: 7,
    vx: 0,
    vy: 0,
    vz: 0,
    made: false,
    missed: false,
    pT: 0,
    tip: 0,
  });
  G.ctrl = 2;
  G.tip = { t: 0, ph: "intro", w: 0, s: 0 };
  document.body.classList.add("bars");
  toast(TM[0].c + "  VS  " + TM[1].c, 1.4);
  sfx("whistle");
}
function tipUpd(dt) {
  const k = G.tip,
    b = G.ball,
    L = G.pl,
    A = L[2],
    B = L[5],
    press = (keys.has("Space") && !G.was.has("Space")) || G.click;
  G.click = 0;
  k.t += dt;
  if (k.ph === "intro") {
    if (k.t > 1.5) {
      k.ph = "toss";
      k.t = 0;
      $("meter").classList.add("on");
      toast("TIP-OFF!  PRESS SPACE OR CLICK IN THE GREEN", 9);
      sfx("whistle");
    }
    return;
  }
  if (k.ph === "toss") {
    const s = k.t / 2.1;
    k.s = s;
    $("nd").style.left = cl(s, 0, 1) * 96 + "%";
    b.z = 7 + 5.5 * (1 - ((s - 0.72) / 0.72) ** 2);
    b.spin += dt * 4;
    if (press || s >= 1) {
      const win = press && s >= 0.62 && s <= 0.82;
      k.ph = "tip";
      k.t = 0;
      k.w = win ? 0 : 1;
      $("meter").classList.remove("on");
      A.vz = B.vz = 14;
      A.hw = B.hw = [47, 25, 11.2];
      Object.assign(b, {
        mode: "pass",
        own: -1,
        sx: b.x,
        sy: b.y,
        sz: b.z,
        pt: 0,
        pd: 0.8,
        tgt: k.w * 3,
        tip: 1,
        last: k.w,
      });
      toast(
        win ? (Math.abs(s - 0.72) < 0.04 ? "PERFECT TIP!" : "YOU WIN THE TIP!") : "THEY WIN THE TIP",
        1.4,
      );
      if (win) {
        G.flash = 0.25;
        G.hype = 0.7;
      }
      sfx("pass");
    }
    return;
  }
  L.forEach((p) => {
    p.vx = p.vy = 0;
    integ(p, dt);
  });
  ballUpd(dt);
  if (k.t > 0.5) A.hw = B.hw = null;
  if (b.mode === "held") {
    G.tip = null;
    A.hw = B.hw = null;
    A.def = B.def = false;
    document.body.classList.remove("bars");
    G.sc = 24;
    toast("GAME ON!", 0.8);
    sfx("whistle");
  }
}
