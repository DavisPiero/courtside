"use strict";
// Team select, starting a game and the tip-off.
// ---------- screens
// Only one full-screen layer shows at a time: menu, setup, pause or controls. The HUD shows during play.
function show(id) {
  for (const s of ["menu", "setup", "pause", "ctls"]) $(s).classList.toggle("on", s === id);
}
function hudOn(on) {
  $("hud").style.display = on ? "block" : "none";
}
// Controls list, built for the current mode so Clean mode doesn't list punch and slide.
function openControls(back) {
  const rows = [
    ["WASD", "Move"],
    ["Shift", "Sprint"],
    ["Space", "Shoot (release in the green) / jump / block"],
    ["Q", "Pass / switch player"],
    ["E", "Dribble move (changes every press)"],
    ["F", "Steal / contest"],
    ...(mayhem() ? [["Click", "Punch: drops them, takes the ball"], ["L-Ctrl", "Slide: sweeps the ball carrier"]] : []),
    ["C", "Chase / broadcast camera"],
    ["Enter", "Skip dunk replay"],
    ["Esc", "Pause"],
    ["M", "Sound on / off"],
  ];
  $("ctlList").innerHTML = rows.map(([k, t]) => `<div><kbd>${k}</kbd>${t}</div>`).join("");
  $("bCtlX").onclick = () => show(back);
  show("ctls");
}

// ---------- setup screen: teams side by side (after the reference), then mode, court and difficulty
const SEL = { a: 0, b: 1, pr: 0 };
function openSel(pr) {
  ac();
  SEL.pr = pr;
  show("setup");
  drawSel();
}
// Team ratings for the rings. OVR is the roster average; OFF leans on the best scorer, DEF on the big man.
function ratings(t) {
  const r = t.p.map((q) => q[2]),
    avg = r.reduce((a, b) => a + b, 0) / r.length,
    best = Math.max(...r),
    big = t.p.find((q) => q[1] === "C" || q[1] === "PF"),
    def = big ? (big[2] * 2 + avg) / 3 : avg - 2;
  return { OVR: Math.round(avg), OFF: Math.round((best + avg) / 2), DEF: Math.round(def) };
}
const star = (t) => t.p.reduce((a, q, i) => (q[2] > t.p[a][2] ? i : a), 0);
const accent = (t) => (t.t === "#22242c" ? "#c7cfe0" : t.t);
function drawSel() {
  const side = (el, ti, right) => {
    const t = TEAMS[ti],
      r = ratings(t),
      rings = Object.entries(r).map(([k, v]) => `<div class="ring"><b>${v}</b><i>${k}</i></div>`),
      arrows = `<button class="arr" data-d="-1" aria-label="Previous team">‹</button><b>${t.n}</b><button class="arr" data-d="1" aria-label="Next team">›</button>`;
    el.style.setProperty("--tc", t.k);
    el.innerHTML = `<div class="wm">${t.c}</div><canvas class="port"></canvas>
      <div class="info"><i class="lbl">${right ? "OPPONENT" : "YOUR TEAM"}</i><div class="tn">${arrows}</div>
      <div class="city">${t.city}</div><div class="rings">${(right ? rings : rings.reverse()).join("")}</div></div>`;
    el.querySelectorAll(".arr").forEach((b) => (b.onclick = () => cycle(right, +b.dataset.d)));
  };
  side($("sideA"), SEL.a, 0);
  side($("sideB"), SEL.b, 1);
  const A = TEAMS[SEL.a].p,
    B = TEAMS[SEL.b].p;
  $("roster").innerHTML =
    `<div class="ra">${A.map((q) => `${q[0]} <u>${q[2]}</u><span>${q[1]}</span>`).join("<br>")}</div><i class="sep"></i>` +
    `<div>${B.map((q) => `<span>${q[1]}</span><u>${q[2]}</u> ${q[0]}`).join("<br>")}</div>`;
  document.querySelectorAll("#setup .seg").forEach((g) =>
    g.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("on", String(OPT[g.dataset.k]) === b.dataset.v);
      b.onclick = () => {
        OPT[g.dataset.k] = g.dataset.k === "diff" ? +b.dataset.v : b.dataset.v;
        drawSel();
      };
    }),
  );
  PORT.length = 0;
}
// Step one side through the teams, skipping the team the other side has.
function cycle(right, d) {
  const n = TEAMS.length;
  if (right) do SEL.b = (SEL.b + d + n) % n; while (SEL.b === SEL.a);
  else do SEL.a = (SEL.a + d + n) % n; while (SEL.a === SEL.b);
  drawSel();
}
// Portraits: the team's star drawn with the in-game model, large, dribbling. Redrawn every frame while visible.
const PORT = [],
  PK = 40, // portrait model scale (sprite pixels per foot)
  PW = 260,
  PH = 440;
function portraits() {
  if (!$("setup").classList.contains("on")) return;
  const saved = { ...V };
  for (const [el, ti, right] of [
    [$("sideA"), SEL.a, 0],
    [$("sideB"), SEL.b, 1],
  ]) {
    const cv2 = el.querySelector("canvas.port");
    if (!cv2) continue;
    const t = TEAMS[ti],
      i = star(t),
      q = t.p[i];
    let P0 = PORT[right];
    if (!P0 || P0.ti !== ti) {
      P0 = PORT[right] = {
        ti,
        id: 6 + right,
        team: t,
        look: ti * 3 + i,
        sk: SK[ti * 3 + i],
        pos: q[1],
        x: 0, y: 0, z: 0, vx: 0, vy: 0, f: 0, ph: 0, hand: right ? 1 : -1,
        port: { spr: mkSpr(PW, PH), k: PK, t: 0, ball: [0, 0, 0] },
      };
    }
    const tt = T,
      bounce = Math.abs(Math.sin(tt * 5.5));
    P0.port.t = tt;
    P0.port.ball = [0.95, P0.hand * 0.6, 0.55 + bounce * 2.6];
    // A camera three-quarters in front, turned so the player faces the middle of the screen.
    const a = right ? -0.75 : 0.75;
    Object.assign(V, { x: Math.cos(a) * 30, y: Math.sin(a) * 30, z: 4.2, p: 0.02, fl: 1 });
    V.yaw = Math.atan2(-V.y, -V.x);
    setV();
    buildSprite(P0);
    const S = P0.spr;
    if (!S) continue;
    // Ball: projected with the same camera, drawn as a pixel disc onto the sprite.
    const L = P0.port.ball,
      K = PK * (BODY[P0.pos] || [1])[0],
      bx = S.ox + (L[0] * Rx + L[1] * Ry) * K,
      by = S.oy - (L[0] * Ux + L[1] * Uy + L[2] * Uz) * K,
      g = S.cv.getContext("2d"),
      br = Math.round(0.55 * K);
    g.fillStyle = "#2a0f08";
    g.beginPath();
    g.arc(Math.round(bx), Math.round(by), br + 1, 0, 7);
    g.fill();
    g.fillStyle = "#d8692a";
    g.beginPath();
    g.arc(Math.round(bx), Math.round(by), br, 0, 7);
    g.fill();
    g.fillStyle = "#f59a4a";
    g.beginPath();
    g.arc(Math.round(bx - br * 0.3), Math.round(by - br * 0.3), Math.round(br * 0.45), 0, 7);
    g.fill();
    g.strokeStyle = "#2a0f08";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(bx - br, by);
    g.lineTo(bx + br, by);
    g.moveTo(bx, by - br);
    g.lineTo(bx, by + br);
    g.stroke();
    // Fit to the panel: whole-pixel scale, feet on the bottom edge.
    const hgt = cv2.clientHeight || 400,
      sc = Math.max(1, Math.ceil((hgt * devicePixelRatio) / PH)),
      w = PW * sc,
      h = PH * sc;
    if (cv2.width !== w || cv2.height !== h) {
      cv2.width = w;
      cv2.height = h;
    }
    const x2 = cv2.getContext("2d");
    x2.imageSmoothingEnabled = false;
    x2.clearRect(0, 0, w, h);
    x2.drawImage(S.cv, 0, 0, w, h);
  }
  Object.assign(V, saved);
  setV();
}
function start(pr) {
  G.prac = pr;
  init();
  G.run = 1;
  G.pause = 0;
  show(null);
  hudOn(1);
  initTip();
  hud();
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
