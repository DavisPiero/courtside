"use strict";
// Team select, starting a game and the tip-off.
// ---------- screens
// Only one full-screen layer shows at a time: menu, setup, pause or settings. The HUD shows during play.
const SCREENS = ["load", "device", "menu", "setup", "pause", "sets"];
function show(id) {
  for (const s of SCREENS) $(s) && $(s).classList.toggle("on", s === id);
}
function hudOn(on) {
  $("hud").style.display = on ? "block" : "none";
}
// ---------- settings screen: tabs of rows; each row is a segmented choice. Changes apply and save at once.
const SETUI = { tab: "VIDEO", back: "menu" };
function openSettings(back) {
  SETUI.back = back;
  $("bSetX").onclick = () => show(SETUI.back);
  drawSettings();
  show("sets");
}
function controlRows() {
  return [
    ["WASD", "Move"],
    ["Shift", "Sprint"],
    ["Space", "Shoot (release in the green) / jump / block"],
    ["Q", "Pass / switch player"],
    ["E", "Dribble move (changes every press)"],
    ["F", "Steal / contest"],
    ["Click", "Punch (Mayhem mode)"],
    ["L-Ctrl", "Slide tackle (Mayhem mode)"],
    ["C", "Switch camera"],
    ["Enter", "Skip dunk replay"],
    ["M", "Sound on / off"],
    ["Esc", "Pause"],
  ];
}
function drawSettings() {
  const tabs = ["VIDEO", "AUDIO", "GAMEPLAY", "CONTROLS"];
  $("setTabs").innerHTML = tabs.map((t) => `<button data-t="${t}" class="${t === SETUI.tab ? "on" : ""}">${t}</button>`).join("");
  $("setTabs").querySelectorAll("button").forEach((b) => (b.onclick = () => ((SETUI.tab = b.dataset.t), drawSettings())));
  if (SETUI.tab === "CONTROLS") {
    $("setRows").innerHTML = `<div class="keys">${controlRows().map(([k, t]) => `<div><kbd>${k}</kbd>${t}</div>`).join("")}</div>`;
    return;
  }
  $("setRows").innerHTML = SETTINGS.filter((r) => r.tab === SETUI.tab)
    .map(
      (r) =>
        `<div class="row"><span>${r.label}</span><div class="seg" data-k="${r.k}">${r.opts
          .map(([v, l]) => `<button data-v="${v}" class="${String(SET[r.k]) === String(v) ? "on" : ""}">${l}</button>`)
          .join("")}</div></div>`,
    )
    .join("");
  $("setRows").querySelectorAll(".seg").forEach((g) =>
    g.querySelectorAll("button").forEach(
      (b) =>
        (b.onclick = () => {
          const k = g.dataset.k,
            cur = SET[k];
          SET[k] = typeof cur === "number" ? +b.dataset.v : b.dataset.v;
          applySetting(k);
          saveSettings();
          drawSettings();
        }),
    ),
  );
}

// ---------- setup screen: teams side by side (after the reference), then mode, court and difficulty
const SEL = { a: DEFAULT_TEAMS[0], b: DEFAULT_TEAMS[1], pr: 0 };
function openSel(pr) {
  ac();
  SEL.pr = pr;
  OPT.mode = "clean"; // team select always starts on Clean
  show("setup");
  drawSel();
}
// Team ratings for the rings, from the player ratings in js/teams.js.
// OVR: roster average. OFF: shooting, finishing and handling. DEF: defence and blocking.
function ratings(t) {
  const avg = (f) => Math.round(t.p.reduce((a, q) => a + f(q), 0) / t.p.length);
  return {
    OVR: avg((q) => q[2]),
    OFF: avg((q) => (q[5] + q[6] + q[7]) / 3),
    DEF: avg((q) => (q[8] * 2 + q[9]) / 3),
  };
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
// A standalone model for menus: player ti/i of TEAMS, drawn by the in-game sprite builder.
function portraitPlayer(ti, i, id, hand) {
  const t = TEAMS[ti],
    q = t.p[i];
  return {
    ti, pi: i, id, team: t, look: ti * 3 + i, sk: SK[q[10]], pos: q[1], ht: q[3],
    x: 0, y: 0, z: 0, vx: 0, vy: 0, f: 0, ph: 0, hand,
    port: { spr: mkSpr(PW, PH), k: PK, t: 0, ball: null },
  };
}
// Draw P0 into canvas cv2 from a camera at angle a (radians around the player). ball: world feet or null.
function renderModel(cv2, P0, a) {
  const saved = { ...V };
  Object.assign(V, { x: Math.cos(a) * 30, y: Math.sin(a) * 30, z: 4.2, p: 0.02, fl: 1 });
  V.yaw = Math.atan2(-V.y, -V.x);
  setV();
  buildSprite(P0);
  const S = P0.spr,
    L = P0.port.ball;
  if (S && L) {
    // Ball: projected with the same camera, drawn as a pixel disc onto the sprite.
    const bx = S.ox + (L[0] * Rx + L[1] * Ry) * PK,
      by = S.oy - (L[0] * Ux + L[1] * Uy + (L[2] + P0.z) * Uz) * PK,
      g = S.cv.getContext("2d"),
      br = Math.round(0.55 * PK);
    const disc = (x, y, r, col) => {
      g.fillStyle = col;
      g.beginPath();
      g.arc(Math.round(x), Math.round(y), r, 0, 7);
      g.fill();
    };
    disc(bx, by, br + 1, "#2a0f08");
    disc(bx, by, br, "#d8692a");
    disc(bx - br * 0.3, by - br * 0.3, Math.round(br * 0.45), "#f59a4a");
    g.strokeStyle = "#2a0f08";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(bx - br, by);
    g.lineTo(bx + br, by);
    g.moveTo(bx, by - br);
    g.lineTo(bx, by + br);
    g.stroke();
  }
  Object.assign(V, saved);
  setV();
  if (!S) return;
  // Fit to the canvas: whole-pixel scale, feet on the bottom edge.
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
// Team-select portraits: each team's star dribbling, facing the middle of the screen.
function portraits() {
  if (!$("setup").classList.contains("on")) return;
  for (const [el, ti, right] of [
    [$("sideA"), SEL.a, 0],
    [$("sideB"), SEL.b, 1],
  ]) {
    const cv2 = el.querySelector("canvas.port");
    if (!cv2) continue;
    let P0 = PORT[right];
    if (!P0 || P0.ti !== ti) P0 = PORT[right] = portraitPlayer(ti, star(TEAMS[ti]), 6 + right, right ? 1 : -1);
    P0.port.t = T;
    P0.port.ball = [0.95, P0.hand * 0.6, 0.55 + Math.abs(Math.sin(T * 5.5)) * 2.6];
    renderModel(cv2, P0, right ? -0.75 : 0.75);
  }
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

// ---------- tips: hover a [data-tip] element (or tap it on a touch screen) to see what it does
(function () {
  const tip = $("tip");
  let hideT = 0;
  const showTip = (el) => {
    tip.textContent = el.dataset.tip;
    tip.classList.add("on");
    const r = el.getBoundingClientRect(),
      t = tip.getBoundingClientRect();
    tip.style.left = cl(r.left + r.width / 2 - t.width / 2, 8, innerWidth - t.width - 8) + "px";
    tip.style.top = Math.max(8, r.top - t.height - 10) + "px";
  };
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest && e.target.closest("[data-tip]");
    if (el && e.pointerType === "mouse") showTip(el);
  });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest && e.target.closest("[data-tip]");
    if (el && e.pointerType === "mouse") tip.classList.remove("on");
  });
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest && e.target.closest("[data-tip]");
    if (!el || e.pointerType === "mouse") return;
    showTip(el);
    clearTimeout(hideT);
    hideT = setTimeout(() => tip.classList.remove("on"), 2600);
  });
})();

// ---------- loading screen: a spinning pixel basketball while the font loads and the models warm up
function drawLoadBall(t) {
  const g = $("ldBall").getContext("2d"),
    r = 13,
    a = t * 5; // spin angle
  g.clearRect(0, 0, 32, 32);
  for (let y = -r - 1; y <= r + 1; y++)
    for (let x = -r - 1; x <= r + 1; x++) {
      const d = Math.hypot(x + 0.5, y + 0.5);
      if (d > r + 1) continue;
      let col = d > r ? "#2a0f08" : "#d8692a";
      if (d <= r) {
        // Seams: a vertical great circle that turns with the ball, plus the horizontal seam.
        const sx = Math.sin(a) * Math.sqrt(Math.max(0, r * r - y * y)),
          sx2 = Math.sin(a + Math.PI / 2) * Math.sqrt(Math.max(0, r * r - y * y));
        if (Math.abs(x + 0.5 - sx) < 0.9 || Math.abs(x + 0.5 - sx2) < 0.9 || Math.abs(y + 0.5) < 0.8) col = "#2a0f08";
        else if (x + y < -r * 0.7) col = "#f59a4a";
        else if (x + y > r * 0.9) col = "#a94a1a";
      }
      g.fillStyle = col;
      g.fillRect(x + 16, y + 16, 1, 1);
    }
}
function bootLoad() {
  const t0 = performance.now(),
    fill = $("ldFill");
  let done = 0;
  const spin = () => {
    if ($("load").classList.contains("on")) {
      drawLoadBall((performance.now() - t0) / 1000);
      requestAnimationFrame(spin);
    }
  };
  spin();
  const step = (f) => (fill.style.width = Math.round(f * 100) + "%");
  const font = document.fonts ? document.fonts.load('20px "Jersey 10"').catch(() => {}) : Promise.resolve();
  const timeout = new Promise((r) => setTimeout(r, 2500));
  step(0.2);
  Promise.race([font, timeout]).then(() => {
    step(0.6);
    // Give the arena a few frames to draw behind the loading screen, so the menu appears ready.
    setTimeout(() => {
      step(1);
      const wait = Math.max(0, 1100 - (performance.now() - t0));
      setTimeout(openDevice, wait + 150);
    }, 30);
  });
}
// ---------- device choice: computer (keyboard) or mobile/tablet (touch controls)
function openDevice() {
  const touchy = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1,
    last = SET.device || (touchy ? "touch" : "pc");
  $("dPC").classList.toggle("rec", last === "pc");
  $("dTouch").classList.toggle("rec", last === "touch");
  $("dPC").onclick = () => chooseDevice("pc");
  $("dTouch").onclick = () => chooseDevice("touch");
  show("device");
}
function chooseDevice(d) {
  SET.device = d;
  saveSettings();
  document.body.classList.toggle("touch", d === "touch");
  G.touch = d === "touch";
  show("menu");
}

// ---------- inventory: buy packs with Court Coins and equip them; the selected pack plays on the preview model
const INV = { cat: "dunk", sel: "dunk.basic", P0: null };
function openInv() {
  INV.sel = SAVE.equip[INV.cat] || INV.cat + ".basic";
  if (INV.cat === "dribble") INV.sel = "dribble.hesi";
  drawInv();
  ccShow();
  show("inv");
}
function packButton(k) {
  if (!owns(k.id))
    return `<button class="btn${SAVE.cc >= k.price ? " pri" : ""}" data-buy="${k.id}"${SAVE.cc >= k.price ? "" : " disabled"}>${k.price} CC</button>`;
  if (k.cat === "dribble") {
    const on = SAVE.equip.moves.includes(k.id);
    return `<button class="btn${on ? " own" : ""}" data-eq="${k.id}">${on ? "ON" : "OFF"}</button>`;
  }
  const on = SAVE.equip[k.cat] === k.id;
  return `<button class="btn${on ? " own" : ""}" data-eq="${k.id}">${on ? "EQUIPPED" : "EQUIP"}</button>`;
}
function drawInv() {
  $("invTabs").innerHTML = CATS.map(([c, l]) => `<button data-c="${c}" class="${c === INV.cat ? "on" : ""}">${l}</button>`).join("");
  $("invTabs").querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        INV.cat = b.dataset.c;
        INV.sel = INV.cat === "dribble" ? "dribble.hesi" : SAVE.equip[INV.cat];
        drawInv();
      }),
  );
  $("invRows").innerHTML = PACKS.filter((k) => k.cat === INV.cat)
    .map((k) => `<div class="pack${k.id === INV.sel ? " sel" : ""}" data-id="${k.id}"><b>${k.name}</b><span>${k.desc}</span>${packButton(k)}</div>`)
    .join("");
  $("invRows").querySelectorAll(".pack").forEach((r) => (r.onclick = () => ((INV.sel = r.dataset.id), drawInv())));
  $("invRows").querySelectorAll("[data-buy]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        INV.sel = b.dataset.buy;
        if (buyPack(b.dataset.buy)) sfx("green");
        drawInv();
      }),
  );
  $("invRows").querySelectorAll("[data-eq]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        INV.sel = b.dataset.eq;
        equipPack(b.dataset.eq);
        drawInv();
      }),
  );
  $("invName").textContent = PACK[INV.sel] ? PACK[INV.sel].name.toUpperCase() : "";
  $("bInvX").onclick = () => show("menu");
}
// Preview: your star performs the selected pack on a loop.
function invPreview() {
  if (!$("inv").classList.contains("on")) return;
  const hero = campHero();
  if (!INV.P0 || INV.P0.key !== hero.key) {
    INV.P0 = portraitPlayer(hero.ti, hero.pi, 8, -1);
    INV.P0.key = hero.key;
    if (hero.team) Object.assign(INV.P0, { team: hero.team, sk: hero.sk, look: hero.look, pos: hero.pos, ht: hero.ht, hair: hero.hair });
  }
  const P0 = INV.P0,
    k = PACK[INV.sel],
    port = P0.port,
    S = bodyScale(P0);
  Object.assign(P0, { z: 0, f: 0, hw: null, hw2: null, mv: null, stt: "" });
  port.t = T;
  port.pose = "";
  port.style = { [k.cat]: k.id };
  port.ball = [0.95, -0.6, 0.55 + Math.abs(Math.sin(T * 5.5)) * 2.6];
  if (k.cat === "cel") {
    port.pose = "cel";
    port.ball = null;
  } else if (k.cat === "shot") {
    port.pose = "shot";
    const top = k.id === "shot.high" ? 5.7 : k.id === "shot.set" ? 4.2 : 4.9;
    port.ball = [0.75, 0, (2.75 + top) * S + 0.35];
  } else if (k.cat === "dribble") {
    const M = MOVES[k.id.split(".")[1]],
      cyc = M.d + 0.6,
      u = (T % cyc) / M.d;
    if (u <= 1) P0.mv = { k: k.id.split(".")[1], t: u * M.d, d: M.d, h: -1, mid: 0 };
    port.mv = P0.mv;
    if (P0.mv) port.ball = ballLocal(P0);
  } else if (k.cat === "dunk") {
    // A dunk on a loop: gather, rise, hang, land. Same arm paths as the real dunk.
    const u = (T % 1.8) / 1.8,
      st = k.id;
    let hw = [0.9, -0.5, 4.2];
    if (u > 0.25 && u < 0.85) {
      const kk = (u - 0.25) / 0.6;
      P0.z = Math.sin(kk * Math.PI) * 2.8;
      const z = P0.z,
        sh = [0, 0, z + 5.4];
      hw = [1.2, 0, z + lp(7.6, 9.2, sm(kk))];
      if (st === "dunk.tomahawk" && kk < 0.6) hw = [lp(0.6, -1.1, sm(kk / 0.6)), 0, z + lp(7.4, 8.8, kk / 0.6)];
      if (st === "dunk.windmill" && kk < 0.75) {
        const ph = (kk / 0.75) * Math.PI * 1.35;
        hw = [-Math.sin(ph) * 2.3, 0, sh[2] - Math.cos(ph) * 2.3];
      }
      if (st === "dunk.360") {
        P0.f = 6.2832 * sm(cl(kk / 0.7, 0, 1));
        if (kk < 0.7) hw = [Math.cos(P0.f) * 0.9, Math.sin(P0.f) * 0.9, z + 5.8];
      }
      if (st === "dunk.reverse") {
        P0.f = Math.PI;
        hw = [lp(-0.2, -1.2, kk), 0, z + lp(7.6, 9.2, kk)];
      }
      P0.hw = hw;
      P0.hw2 = st === "dunk.reverse" || st === "dunk.360" || st === "dunk.basic" ? hw : null;
      port.ball = [hw[0], hw[1], hw[2] - z + 0.3];
    }
  }
  renderModel($("invCv"), P0, 0.75);
}
