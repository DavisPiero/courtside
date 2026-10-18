"use strict";
// Team select, starting a game and the tip-off.
// ---------- screens
// Only one full-screen layer shows at a time: menu, setup, pause or settings. The HUD shows during play.
const SCREENS = ["load", "device", "menu", "setup", "pause", "sets"];
function show(id) {
  for (const s of SCREENS) $(s) && $(s).classList.toggle("on", s === id);
  if (typeof ccShow === "function") ccShow();
  if (id === "menu" && typeof payday === "function") payday();
}
// ---------- fit to screen
// Panels never shrink: every panel is full size and at most as tall as the visible screen (CSS max-height on
// .scr > .box). A panel taller than that scrolls its middle and its last button row (.act) stays pinned to the
// bottom (.fitscroll). Tabbed screens (Shop, Inventory, Settings) have a fixed height, so switching tabs never
// changes their size.
function fitPanel(p) {
  p.classList.toggle("fitscroll", p.scrollHeight > p.clientHeight + 1);
}
function fitScreens() {
  for (const p of document.querySelectorAll(".scr.on > .box, .scr.on > .dv, .scr.on > .menu-l")) fitPanel(p);
}
// Re-fit whenever a screen opens, its contents change (tabs, chapters) or the window changes size.
let fitQ = 0;
function fitSoon() {
  if (!fitQ) fitQ = requestAnimationFrame(() => ((fitQ = 0), fitScreens()));
}
new MutationObserver((ms) => {
  // ignore the style changes fitPanel makes itself
  if (ms.some((m) => m.type === "childList" || m.attributeName === "class")) fitSoon();
}).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
addEventListener("resize", fitSoon);
if (window.visualViewport) visualViewport.addEventListener("resize", fitSoon);
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
  if (G.touch)
    return [
      ["LEFT", "Joystick: touch anywhere on the left. Push to the edge to sprint."],
      ["SHOOT", "Hold, release in the green. On defence: JUMP / BLOCK."],
      ["PASS", "Pass to the open teammate. On defence: SWITCH player."],
      ["MOVE", "Dribble move. On defence: STEAL."],
      ["PUNCH", "Mayhem only: drop them, take the ball."],
      ["SLIDE", "Mayhem only: slide-tackle the ball carrier."],
      ["II", "Pause"],
      ["CAM", "Switch camera"],
      ["TAP", "Skip the dunk replay"],
    ];
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
const SEL = { a: DEFAULT_TEAMS[0], b: DEFAULT_TEAMS[1], pr: 0, lg: "nba", grid: -1 };
// The teams of the league picked at the top of the setup screen (NBA or Hall of Fame).
const LT = () => LEAGUES[SEL.lg].teams;
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
    const t = LT()[ti],
      r = ratings(t),
      rings = Object.entries(r).map(([k, v]) => `<div class="ring"><b>${v}</b><i>${k}</i></div>`),
      arrows = `<button class="arr" data-d="-1" aria-label="Previous team">‹</button><button class="tpick" data-tip="Pick from all 30 teams">${t.n}<small>▼</small></button><button class="arr" data-d="1" aria-label="Next team">›</button>`;
    el.style.setProperty("--tc", t.k);
    el.innerHTML = `<div class="wm">${t.c}</div><canvas class="port"></canvas>
      <div class="info"><i class="lbl">${right ? "OPPONENT" : "YOUR TEAM"}</i><div class="tn">${arrows}</div>
      <div class="city">${t.city}</div><div class="rings">${(right ? rings : rings.reverse()).join("")}</div></div>`;
    el.querySelectorAll(".arr").forEach((b) => (b.onclick = () => cycle(right, +b.dataset.d)));
    el.querySelector(".tpick").onclick = () => openGrid(right);
  };
  $("lgSeg").querySelectorAll("button").forEach((b) => {
    b.classList.toggle("on", b.dataset.v === SEL.lg);
    b.onclick = () => {
      SEL.lg = b.dataset.v;
      drawSel();
    };
  });
  $("setup").classList.toggle("hof", SEL.lg === "hof");
  side($("sideA"), SEL.a, 0);
  side($("sideB"), SEL.b, 1);
  const A = LT()[SEL.a].p,
    B = LT()[SEL.b].p;
  $("roster").innerHTML =
    `<div class="ra">${A.map((q) => `${q[0]} <u>${q[2]}</u><span>${q[1]}</span>`).join("<br>")}</div><i class="sep"></i>` +
    `<div>${B.map((q) => `<span>${q[1]}</span><u>${q[2]}</u> ${q[0]}`).join("<br>")}</div>`;
  document.querySelectorAll("#setup .seg[data-k]").forEach((g) =>
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
  const n = LT().length;
  if (right) do SEL.b = (SEL.b + d + n) % n; while (SEL.b === SEL.a);
  else do SEL.a = (SEL.a + d + n) % n; while (SEL.a === SEL.b);
  drawSel();
}
// Team grid: every team in the league as a colour tile. right: picking the opponent.
function openGrid(right) {
  SEL.grid = right;
  const mine = right ? SEL.b : SEL.a,
    other = right ? SEL.a : SEL.b;
  $("gridTitle").textContent = (right ? "CHOOSE THE OPPONENT" : "CHOOSE YOUR TEAM") + " · " + LEAGUES[SEL.lg].name;
  $("gridTiles").innerHTML = LT()
    .map((t, i) => {
      const r = ratings(t);
      return `<button class="tile${i === mine ? " on" : ""}" data-i="${i}" style="--tc:${t.k};--tt:${accent(t)}"${i === other ? " disabled" : ""}>
        <b>${t.c}</b><span>${t.n}</span><i>${r.OVR}</i></button>`;
    })
    .join("");
  $("gridTiles").querySelectorAll(".tile").forEach(
    (b) =>
      (b.onclick = () => {
        if (right) SEL.b = +b.dataset.i;
        else SEL.a = +b.dataset.i;
        closeGrid();
        drawSel();
      }),
  );
  $("gridX").onclick = closeGrid;
  $("grid").classList.toggle("hof", SEL.lg === "hof");
  $("grid").classList.add("on");
}
function closeGrid() {
  SEL.grid = -1;
  $("grid").classList.remove("on");
}
// Portraits: the team's star drawn with the in-game model, large, dribbling. Redrawn every frame while visible.
const PORT = [],
  PK = 40, // portrait model scale (sprite pixels per foot)
  PW = 260,
  PH = 440;
// A standalone model for menus: player ti/i of TEAMS, drawn by the in-game sprite builder.
function portraitPlayer(ti, i, id, hand, list) {
  const t = (list || TEAMS)[ti],
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
  const S = P0.spr; // the ball, if any, is drawn into the sprite by buildSprite
  Object.assign(V, saved);
  setV();
  if (!S) return;
  // Fit to the canvas: whole-pixel scale, feet on the bottom edge.
  const hgt = Math.min(cv2.clientHeight || 400, 900), // capped so a canvas can never grow itself
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
    if (!P0 || P0.ti !== ti || P0.lg !== SEL.lg) {
      P0 = PORT[right] = portraitPlayer(ti, star(LT()[ti]), 6 + right, right ? 1 : -1, LT());
      P0.lg = SEL.lg;
    }
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
  chatterReset();
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
  document.querySelectorAll(".dcard em").forEach((e) => (e.textContent = SET.device ? "LAST TIME" : "RECOMMENDED"));
  $("dPC").onclick = () => chooseDevice("pc");
  $("dTouch").onclick = () => chooseDevice("touch");
  show("device");
}
function chooseDevice(d) {
  SET.device = d;
  saveSettings();
  document.body.classList.toggle("touch", d === "touch");
  G.touch = d === "touch";
  orientCheck();
  show("menu");
}

// ---------- animation preview: a model performing one animation on a loop (Inventory, pack opening, Lab)
function previewModel(slot) {
  const hero = campHero();
  let P0 = PREV[slot];
  if (!P0 || P0.key !== hero.key) {
    P0 = PREV[slot] = portraitPlayer(hero.ti, hero.pi, 10 + Object.keys(PREV).length, -1);
    P0.key = hero.key;
    if (hero.team) Object.assign(P0, { team: hero.team, sk: hero.sk, look: hero.look, pos: hero.pos, ht: hero.ht, hair: hero.hair });
  }
  return P0;
}
const PREV = {};
// speed: 1 normal, lower for slow motion (Animation Lab).
function previewAnim(cv, P0, id, speed, angle) {
  const k = ANIM[id] || { cat: id.split(".")[0], id },
    port = P0.port,
    S = bodyScale(P0),
    t = (P0.lt = (P0.lt || 0) + (P0.lastT ? Math.min(0.05, T - P0.lastT) : 0) * (speed || 1));
  P0.lastT = T;
  Object.assign(P0, { z: 0, f: 0, hw: null, hw2: null, mv: null, stt: "", vx: 0, vy: 0 });
  port.t = t;
  port.pose = "";
  port.dk = null;
  port.mv = null;
  port.style = { [k.cat]: k.id };
  // Dunks and layups reach the rim, so draw them smaller to keep the whole jump in view.
  port.k = k.cat === "dunk" || k.cat === "layup" ? 30 : PK;
  port.ball = [0.95, -0.6, 0.55 + Math.abs(Math.sin(t * 5.5)) * 2.6];
  if (k.cat === "cel") {
    port.pose = "cel";
    port.ball = null;
  } else if (k.cat === "shot") {
    port.pose = "shot";
    const u = ((t * 0.75) % 1) * 1.15;
    port.ball = shotBall(P0, Math.min(u, 1));
    // jump in the preview at the same moment as in the game
    const J = (SHOTS[k.id] || SHOTS["shot.basic"]).jump,
      ju = Math.min(u, 1.15);
    if (ju > J[0]) {
      const tt2 = ((ju - J[0]) / 0.75) * 0.85 * (J[1] / 10);
      P0.z = Math.max(0, J[1] * tt2 - 16 * tt2 * tt2);
    }
  } else if (k.cat === "dribble") {
    const mk = k.id.split(".")[1],
      M = MOVES[mk],
      cyc = M.d + 0.7,
      u = (t % cyc) / M.d;
    if (u <= 1) P0.mv = { k: mk, t: u * M.d, d: M.d, h: -1, mid: 0 };
    port.mv = P0.mv;
    if (P0.mv) port.ball = ballLocal(P0);
    if (mk === "spin" || mk === "tornado") P0.f = u <= 1 ? 6.2832 * sm(u) : 0;
    if (mk === "halfspin") P0.f = u <= 1 ? Math.PI * 0.9 * Math.sin(u * Math.PI) : 0;
  } else if (k.cat === "dunk" || k.cat === "layup") {
    // Gather, take off, rise to the rim, flush or release, land. Same paths as the real thing.
    const dk = k.cat === "dunk",
      fx = rimFx(k.id),
      u = (t % (2.2 * (fx.slow || 1))) / (2.2 * (fx.slow || 1)),
      Zm = (dk ? 3.2 : 2.3) * (fx.high || 1);
    if (u < 0.2) port.dk = { style: k.id, phase: "gather", k: u / 0.2 };
    else if (u < 0.55) {
      const kk = (u - 0.2) / 0.35;
      P0.z = Zm * Math.sin((kk * Math.PI) / 2);
      port.dk = { style: k.id, phase: "rise", k: kk };
      const hl = rimHand(k.id, kk, P0.z);
      P0.hw = [hl[0], hl[1], P0.z + hl[2]];
      P0.hw2 = kk > 0.55 && rimFx(k.id).two ? P0.hw : null;
      port.ball = [hl[0] + 0.15, hl[1], hl[2] + 0.4];
      if (fx.spin) P0.f = 6.2832 * fx.spin * ease(kk);
      if (fx.turn) P0.f = fx.turn;
      if (dk && rimFx(k.id).rev) P0.f = Math.PI;
      if (k.id === "layup.reverse") P0.f = Math.PI * 0.85;
    } else if (u < 0.85) {
      const kk = (u - 0.55) / 0.3;
      const hk = fx.honey ? 0.7 : 0.4;
      P0.z = Zm * (dk ? (kk < hk ? 1 : Math.max(0, 1 - (kk - hk) / (1 - hk))) : Math.max(0, 1 - kk * 1.25));
      port.dk = { style: k.id, phase: dk ? "hang" : "fall", k: kk };
      if (dk && kk < (fx.honey ? 0.8 : 0.55)) P0.hw = fx.honey ? [1.5, -0.3, 9.0] : [1.45, 0, 10.15];
      if (dk && rimFx(k.id).rev) P0.f = Math.PI;
      port.ball = null;
    } else port.ball = null;
  }
  renderModel(cv, P0, angle || 0.75);
}

// ---------- inventory: equip the animations and shoes you own (get more in the Shop), or sell animations
const INV = { cat: "dunk", sel: "dunk.basic", sell: null };
const isEquipped = (a) => (a.cat === "dribble" ? SAVE.equip.moves.includes(a.id) : SAVE.equip[a.cat] === a.id);
function openInv() {
  if (INV.cat === "shoe") INV.sel = SAVE.shoe || (SHOES.find((x) => ownsShoe(x.id)) || SHOES[0]).id;
  else INV.sel = INV.cat === "dribble" ? SAVE.equip.moves[0] || "dribble.cross" : SAVE.equip[INV.cat];
  INV.sell = null;
  drawInv();
  show("inv");
}
function animRow(a, sel) {
  const own = owns(a.id);
  let btn;
  if (!own) btn = `<div class="inpk">IN THE SHOP</div>`;
  else if (a.cat === "dribble") {
    const on = SAVE.equip.moves.includes(a.id),
      full = !on && SAVE.equip.moves.length >= MAX_MOVES;
    btn = `<button class="btn${on ? " own" : ""}" data-eq="${a.id}"${full ? " disabled" : ""}>${on ? "ON" : "OFF"}</button>`;
  } else {
    const on = SAVE.equip[a.cat] === a.id;
    btn = `<button class="btn${on ? " own" : ""}" data-eq="${a.id}">${on ? "EQUIPPED" : "EQUIP"}</button>`;
  }
  // Sell: anything you own that isn't a starter, Gametime or equipped. Press twice to be sure.
  const pay = own && !isEquipped(a) ? sellPrice(a) : 0;
  if (pay) btn = `<button class="btn sell${INV.sell === a.id ? " sure" : ""}" data-sell="${a.id}">${INV.sell === a.id ? `SURE? +${pay}` : `SELL ${pay}`}</button>` + btn;
  return `<div class="pack r-${a.rarity}${own ? "" : " lock"}${a.id === sel ? " sel" : ""}" data-id="${a.id}">
    <b>${a.name}</b><span class="rtag">${RARITY[a.rarity].name}</span><span>${a.desc}</span><div class="pbtns">${btn}</div></div>`;
}
function shoeRow(x, sel) {
  const own = ownsShoe(x.id),
    on = SAVE.shoe === x.id;
  return `<div class="pack shoerow r-${x.rarity}${own ? "" : " lock"}${x.id === sel ? " sel" : ""}" data-id="${x.id}">
    <canvas class="shcv" data-s="${x.id}"></canvas><b>${x.name}</b><span class="rtag">${RARITY[x.rarity].name}</span><span>${x.desc}</span>
    <div class="pbtns">${own ? `<button class="btn${on ? " own" : ""}" data-wear="${x.id}">${on ? "WEARING" : "WEAR"}</button>` : `<div class="inpk">IN THE SHOP</div>`}</div></div>`;
}
function drawInv() {
  $("invTabs").innerHTML = [...CATS, ["shoe", "SHOES"]].map(([c, l]) => `<button data-c="${c}" class="${c === INV.cat ? "on" : ""}">${l}</button>`).join("");
  $("invTabs").querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        INV.cat = b.dataset.c;
        openInv();
      }),
  );
  if (INV.cat === "shoe") {
    const list = SHOES.slice().sort((a, b) => ownsShoe(b.id) - ownsShoe(a.id) || RANK.indexOf(b.rarity) - RANK.indexOf(a.rarity));
    $("invRows").innerHTML =
      `<p class="mvcount">Your whole team wears the pair you pick. ${SAVE.shoes.length} / ${SHOES.length} collected.${SAVE.shoe ? ` <button class="btn mini" data-wear="">TEAM COLOURS</button>` : ""}</p>` +
      list.map((x) => shoeRow(x, INV.sel)).join("");
    $("invRows").querySelectorAll("canvas.shcv").forEach((cv) => shoeCanvas(cv, SHOE[cv.dataset.s]));
  } else {
    const list = ANIMS.filter((a) => a.cat === INV.cat).sort((a, b) => owns(b.id) - owns(a.id));
    $("invRows").innerHTML =
      (INV.cat === "dribble"
        ? `<p class="mvcount">Crossover, Between the Legs, Behind the Back and Spin are always on. Switch on up to ${MAX_MOVES} more (${SAVE.equip.moves.length}/${MAX_MOVES}).</p>`
        : "") + list.map((a) => animRow(a, INV.sel)).join("");
  }
  $("invRows").querySelectorAll(".pack").forEach((r) => (r.onclick = () => ((INV.sel = r.dataset.id), (INV.sell = null), drawInv())));
  $("invRows").querySelectorAll("[data-eq]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        INV.sel = b.dataset.eq;
        INV.sell = null;
        equipAnim(b.dataset.eq);
        drawInv();
      }),
  );
  $("invRows").querySelectorAll("[data-wear]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        SAVE.shoe = b.dataset.wear;
        if (SAVE.shoe) INV.sel = SAVE.shoe;
        writeSave();
        drawInv();
      }),
  );
  $("invRows").querySelectorAll("[data-sell]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        const id = b.dataset.sell;
        if (INV.sell !== id) {
          INV.sell = id;
            return drawInv();
        }
        const pay = sellAnim(id);
        INV.sell = null;
        if (pay) {
          sfx("coins");
          burst(b, "#ffcf5c", 18);
        }
        drawInv();
      }),
  );
  const a = INV.cat === "shoe" ? SHOE[INV.sel] : ANIM[INV.sel],
    own = a && (INV.cat === "shoe" ? ownsShoe(a.id) : owns(a.id));
  $("invName").innerHTML = a ? `${a.name.toUpperCase()}${own ? "" : "<br><small>LOCKED</small>"}` : "";
  $("inv").classList.toggle("shoes", INV.cat === "shoe");
  $("bInvX").onclick = () => show("menu");
}
function invPreview() {
  labPreview();
  shopPreview();
  if ($("inv").classList.contains("on") && INV.sel) {
    if (INV.cat === "shoe") shoeCanvas($("invShoe"), SHOE[INV.sel], T);
    else previewAnim($("invCv"), previewModel("inv"), INV.sel);
  }
  if ($("open").classList.contains("on") && OPEN.sel) {
    if (SHOE[OPEN.sel]) shoeCanvas($("openShoe"), SHOE[OPEN.sel], T);
    else previewAnim($("openCv"), previewModel("open"), OPEN.sel);
  }
}

// The Shop and pack opening live in js/shop.js.

// ---------- Animation Lab: every animation, slow motion and from any side, so it can be judged frame by frame
const CORE_ANIMS = [
  ["core.idle", "Idle"],
  ["core.run", "Run"],
  ["core.sprint", "Sprint"],
  ["core.dribble", "Dribble"],
  ["core.def", "Defence slide"],
  ["core.pass", "Chest pass"],
  ["core.swipe", "Steal swipe"],
  ["core.punch", "Punch"],
  ["core.slide", "Slide tackle"],
  ["core.rag", "Knocked down"],
  ["dribble.cross", "Crossover"],
  ["dribble.legs", "Between the legs"],
  ["dribble.back", "Behind the back"],
  ["dribble.spin", "Spin"],
];
const LAB = { sel: "shot.basic", speed: 1, angle: 0.75 };
function openLab() {
  const seg = (el, opts, key) => {
    el.innerHTML = opts.map(([v, l]) => `<button class="${LAB[key] === v ? "on" : ""}" data-v="${v}">${l}</button>`).join("");
    el.querySelectorAll("button").forEach((b) => (b.onclick = () => ((LAB[key] = +b.dataset.v), openLab())));
  };
  seg($("labSpeed"), [[1, "1×"], [0.5, "½×"], [0.25, "¼×"]], "speed");
  seg($("labAngle"), [[0.75, "FRONT"], [1.57, "SIDE"], [2.6, "BACK"]], "angle");
  const row = (id, name) => `<div class="lrow${LAB.sel === id ? " sel" : ""}" data-id="${id}"><span>${name}</span></div>`;
  $("labRows").innerHTML =
    `<div class="lgrp">MOVEMENT AND ACTIONS</div>` +
    CORE_ANIMS.map(([id, n]) => row(id, n)).join("") +
    CATS.map(([c, l]) => `<div class="lgrp">${l}</div>` + ANIMS.filter((a) => a.cat === c).map((a) => row(a.id, `${a.name} <span class="rtag r-${a.rarity}">${RARITY[a.rarity].name}</span>`)).join("")).join("");
  $("labRows").querySelectorAll(".lrow").forEach((r) => (r.onclick = () => ((LAB.sel = r.dataset.id), openLab())));
  const nm = (CORE_ANIMS.find((c) => c[0] === LAB.sel) || [0, animName(LAB.sel)])[1];
  $("labName").textContent = nm.toUpperCase();
  $("bLabX").onclick = () => openSettings(SETUI.back);
  show("lab");
}
function labPreview() {
  if (!$("lab").classList.contains("on")) return;
  const P0 = previewModel("lab"),
    id = LAB.sel;
  if (!id.startsWith("core.")) {
    return previewAnim($("labCv"), P0, id, LAB.speed, LAB.angle);
  }
  // Core movement: drive the same fields the game does.
  const dt = (P0.lastT ? Math.min(0.05, T - P0.lastT) : 0) * LAB.speed,
    t = (P0.lt = (P0.lt || 0) + dt),
    port = P0.port;
  P0.lastT = T;
  Object.assign(P0, { z: 0, f: 0, hw: null, hw2: null, mv: null, stt: "", vx: 0, vy: 0, def: false, pas: 0, swp: 0, pun: 0, sl: null, rag: null });
  port.pose = "";
  port.dk = null;
  port.mv = null;
  port.style = {};
  port.t = t;
  port.k = PK;
  port.ball = null;
  const spd = { "core.run": 9, "core.sprint": 17, "core.dribble": 6, "core.def": 6 }[id] || 0;
  P0.vx = spd;
  P0.ph = (P0.ph || 0) + spd * dt * 0.8;
  if (id === "core.dribble") port.ball = [0.9, -0.55, 0.55 + Math.abs(Math.sin(t * 7.5)) * 2.6];
  if (id === "core.def") {
    P0.def = true;
    P0.vx = 0;
    P0.vy = 6;
  }
  const loop = (d) => t % d;
  if (id === "core.pass") P0.pas = Math.max(0, 0.25 - loop(1.0));
  if (id === "core.swipe") P0.swp = Math.max(0, 0.25 - loop(1.0));
  if (id === "core.punch") P0.pun = Math.max(0, 0.34 - loop(1.1));
  if (id === "core.slide") {
    const u = loop(1.6);
    if (u < 1.05) P0.sl = { t: u, d: 1.05 };
  }
  if (id === "core.rag") {
    const u = loop(3.4);
    if (u < 2.6) P0.rag = { t: u, d: 2.6 };
  }
  renderModel($("labCv"), P0, LAB.angle);
}
