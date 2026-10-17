"use strict";
// Game flow: possessions, scoring, passing, shooting, steals, mayhem moves, AI and player input.
// ---------- game flow
// A player's ratings become game numbers. R = [name, pos, ovr, height in, speed, shooting, finishing,
// handling, defence, blocking, skin]. Speed: 10 ft/s at 60 up to about 13 at 95; the opponents also get
// the difficulty multiplier.
function stats(R, t) {
  return {
    ht: R[3],
    spd: R[4],
    sht: R[5],
    fin: R[6],
    hnd: R[7],
    dfn: R[8],
    blk: R[9],
    sp: (10 + ((R[4] - 60) / 35) * 3) * (t ? DIFF[OPT.diff].sp : 1),
  };
}
// How tightly a shooter is guarded right now: 0 wide open, about 1 smothered. Closer, better and taller
// defenders count for more; a tall shooter shoots over people.
function contest(p) {
  let c = 0;
  for (const q of G.pl) {
    if (q.t === p.t || q.rag) continue;
    const d = dist(p, q);
    if (d > 6.5) continue;
    c += (1 - d / 6.5) * (q.dfn / 82) * cl(1 + (q.ht - p.ht) * 0.03, 0.6, 1.5) * (q.z > 0.5 ? 1.25 : 1);
  }
  return cl(c, 0, 1.3);
}
// Half-width of the green zone on the shot meter (as a fraction of the meter). Good shooters get more;
// defence shrinks it, by more on harder difficulties. Your own AI teammates' guarding uses Pro.
function greenZone(p) {
  const base = 0.06 + (p.sht / 99) * 0.035,
    squeeze = (p.t === 0 ? DIFF[OPT.diff] : DIFF[1]).squeeze;
  return Math.max(0.012, base * (1 - Math.min(0.85, contest(p) * squeeze)));
}
// Rules for the next game: quarters and their length, or a first-to-N target; optional starting score.
const RULES_STD = { nq: 4, qlen: 240, target: 0, start: [0, 0] };
G.rules = { ...RULES_STD };
function init() {
  [G.home, G.away] = G.rules.start;
  G.time = G.rules.qlen;
  G.q = 1;
  G.st = { pts: 0, reb: 0, ast: 0, stl: 0, greens: 0, dunks: 0, ankles: 0, threes: 0, blk: 0, drops: 0 };
  G.cut = null;
  G.shot = null;
  G.dead = 0;
  G.fx = [];
  G.stain = [];
  G.pl = [];
  document.body.classList.remove("cine");
  for (let t = 0; t < 2; t++)
    for (let i = 0; i < 3; i++)
      G.pl.push({
        id: t * 3 + i,
        t,
        i,
        x: 47,
        y: 25,
        vx: 0,
        vy: 0,
        f: 0,
        z: 0,
        vz: 0,
        ph: rn(0, 6),
        stam: 100,
        ...stats(NM[t * 3 + i], t),
        look: (TM[t].look0 !== undefined ? TM[t].look0 : TEAMS.indexOf(TM[t]) * 3) + i,
        hair: NM[t * 3 + i][11],
        sk: SK[NM[t * 3 + i][10]],
        pos: NM[t * 3 + i][1],
        hand: -1,
      });
  G.ball = { x: 47, y: 25, z: 3, vx: 0, vy: 0, vz: 0, own: 0, mode: "held", spin: 0, bph: 0 };
  setPoss(0);
}
function setPoss(t) {
  const d = t ? -1 : 1,
    b = G.ball;
  G.poss = t;
  G.sc = 24;
  G.shot = null;
  for (let i = 0; i < 3; i++) {
    const o = G.pl[t * 3 + i],
      q = G.pl[(1 - t) * 3 + i],
      ox = 47 - d * (i ? 9 : 17),
      oy = [25, 12, 38][i];
    Object.assign(o, {
      x: ox,
      y: oy,
      vx: 0,
      vy: 0,
      z: 0,
      vz: 0,
      stt: "",
      hw: null,
      hw2: null,
      def: false,
      f: d > 0 ? 0 : Math.PI,
      fol: 0,
      stun: 0,
    });
    Object.assign(q, {
      x: ox + d * 7,
      y: oy,
      vx: 0,
      vy: 0,
      z: 0,
      vz: 0,
      stt: "",
      hw: null,
      hw2: null,
      def: true,
      f: d > 0 ? Math.PI : 0,
      fol: 0,
      stun: 0,
    });
  }
  Object.assign(b, {
    own: t * 3,
    mode: "held",
    made: false,
    vx: 0,
    vy: 0,
    vz: 0,
    pT: 0,
    missed: false,
    last: t,
  });
  G.ctrl = 0;
  $("meter").classList.remove("on");
}
function toast(m, s = 0.8) {
  const e = $("toast");
  e.textContent = m;
  e.style.opacity = 1;
  G.tt = s;
}
function spark(x, y, z, n, col) {
  for (let i = 0; i < n; i++)
    G.fx.push({
      x,
      y,
      z,
      vx: rn(-9, 9),
      vy: rn(-9, 9),
      vz: rn(2, 14),
      l: rn(0.5, 1.1),
      c: col || (Math.random() < 0.5 ? "#ffcf5c" : "#fff"),
    });
}
function score(t, pts, p, cut) {
  if (t) G.away += pts;
  else G.home += pts;
  const b = G.ball;
  if (t === 0) {
    G.st.pts += pts;
    if (pts === 3) G.st.threes++;
    if (b.pT && T - b.pT < 4 && b.from !== undefined && b.from !== p.id && G.pl[b.from].t === 0) G.st.ast++;
  }
  G.rim[t] = 1;
  G.hype = 1;
  G.next = 1 - t;
  b.pT = 0;
  p.stt = "cel";
  sfx(cut && G.cut && G.cut.kind === "dunk" ? "dunk" : "swish");
  if (!cut) G.hs = 0.05;
  if (b.green) {
    G.gf = 1;
    spark(HX(t), 25, 10, 40, "#3cff9a");
  }
  b.green = false;
  spark(HX(t), 25, 10, 22);
  if (!cut) {
    G.dead = 1.8;
    G.shake = 0.3;
    toast(pts === 3 ? "THREE POINTER!" : "BUCKET!", 1);
  }
}
function bestMate(p, dir) {
  let best = null,
    bs = -1e9;
  G.pl.forEach((q) => {
    if (q.t !== p.t || q === p) return;
    const dx = q.x - p.x,
      dy = q.y - p.y,
      d = hy(dx, dy) || 1;
    let s = -d * 0.02 + minDef(q) * 0.15;
    if (dir) s += ((dx * dir.x + dy * dir.y) / d) * 3;
    if (s > bs) {
      bs = s;
      best = q;
    }
  });
  return best;
}
function passTo(p, q) {
  p.mv = null;
  if (!q) return;
  const b = G.ball,
    d = dist(p, q);
  b.own = -1;
  b.mode = "pass";
  b.sx = p.x;
  b.sy = p.y;
  b.sz = b.z;
  b.pt = 0;
  b.pd = Math.max(0.22, d / 42);
  b.tgt = q.id;
  b.last = p.t;
  b.from = p.id;
  b.pT = T;
  p.pas = 0.25; // chest-pass pose
  sfx("pass");
  if (p.t === 0) {
    G.ctrl = q.id;
    toast("PASS", 0.4);
  }
}
function startSlide(p) {
  if (p.sl || p.rag || p.z > 0 || p.slcd > 0 || p.pun > 0 || G.shot || G.cut || G.tip || G.dead > 0) return;
  const sp = hy(p.vx, p.vy);
  let dx, dy;
  if (sp > 1.5) {
    dx = p.vx / sp;
    dy = p.vy / sp;
  } else if (G.in) {
    dx = G.in.x;
    dy = G.in.y;
  } else {
    dx = Math.cos(p.f);
    dy = Math.sin(p.f);
  }
  const v0 = cl(sp * 2.1 + 2, 7, 40);
  p.sl = { t: 0, d: Math.min(1.05, Math.log(v0 / 1.5) / 3.2 + 0.05), dx, dy, v0 };
  p.f = Math.atan2(dy, dx);
  p.stam = Math.max(0, p.stam - 12);
  sfx("slide");
}
function slideStep(p, dt) {
  const s = p.sl;
  s.t += dt;
  const v = s.v0 * Math.exp(-3.2 * s.t);
  p.vx = s.dx * v;
  p.vy = s.dy * v;
  if (Math.random() < dt * 60)
    G.fx.push({
      x: p.x,
      y: p.y,
      z: 0.3,
      vx: rn(-2, 2) - s.dx * 3,
      vy: rn(-2, 2) - s.dy * 3,
      vz: rn(1, 3),
      l: 0.45,
      c: "rgba(235,225,205,.8)",
    });
  if (!s.hit && v > 4) slideHit(p);
  if (s.t >= s.d || v < 1.5) {
    p.sl = null;
    p.slcd = 0.3;
  }
}
function slideHit(p) {
  const b = G.ball,
    s = p.sl;
  for (const q of G.pl) {
    if (q.t === p.t || q.rag || b.own !== q.id) continue;
    const dx = q.x - p.x,
      dy = q.y - p.y,
      d = hy(dx, dy);
    if (d > 2.9 || (dx * s.dx + dy * s.dy) / (d || 1) < -0.3) continue;
    s.hit = 1;
    s.v0 *= 0.45;
    q.rag = { t: 0, d: 2.8, dx: s.dx, dy: s.dy };
    q.vx = s.dx * 9;
    q.vy = s.dy * 9;
    q.hw = null;
    q.stt = "";
    q.def = false;
    q.sl = null;
    if (G.shot && G.shot.p === q) G.shot = null;
    b.own = p.id;
    b.mode = "held";
    G.poss = p.t;
    G.sc = 24;
    b.made = false;
    if (p.t === 0) G.st.stl++;
    for (let i = 0; i < 18; i++)
      G.fx.push({
        x: q.x,
        y: q.y,
        z: rn(0.3, 2),
        vx: s.dx * rn(2, 9) + rn(-4, 4),
        vy: s.dy * rn(2, 9) + rn(-4, 4),
        vz: rn(2, 8),
        l: rn(0.4, 0.8),
        c: i % 2 ? "#fff" : "#e6dcc4",
      });
    G.hs = 0.08;
    G.shake = 0.55;
    G.hype = 1;
    toast("SWEPT!", 0.9);
    sfx("punch");
    return;
  }
}
function punch(p) {
  if (p.pun > 0 || p.rag || G.cut || G.tip || G.dead > 0) return;
  let v = null,
    bd = 7;
  for (const q of G.pl)
    if (q.t !== p.t && !q.rag) {
      const d = dist(p, q);
      if (d < bd) {
        bd = d;
        v = q;
      }
    }
  const ang = v ? Math.atan2(v.y - p.y, v.x - p.x) : p.f;
  p.pf = ang;
  p.f = ang;
  p.pun = 0.34;
  p.punT = 0.1;
  p.vx += Math.cos(ang) * 7;
  p.vy += Math.sin(ang) * 7;
  G.shot = null;
  sfx("whoosh");
}
function punchHit(p) {
  let v = null,
    bd = 4.4;
  for (const q of G.pl)
    if (q.t !== p.t && !q.rag) {
      const dx = q.x - p.x,
        dy = q.y - p.y,
        d = hy(dx, dy);
      if (d < bd && (dx * Math.cos(p.f) + dy * Math.sin(p.f)) / (d || 1) > 0.2) {
        bd = d;
        v = q;
      }
    }
  if (!v) {
    toast("WHIFF", 0.4);
    return;
  }
  const dx = v.x - p.x,
    dy = v.y - p.y,
    L = hy(dx, dy) || 1,
    b = G.ball;
  v.rag = { t: 0, d: 2.6, dx: dx / L, dy: dy / L };
  v.sl = null;
  v.vx = (dx / L) * 12;
  v.vy = (dy / L) * 12;
  v.hw = null;
  v.stt = "";
  v.def = false;
  if (G.shot && G.shot.p === v) G.shot = null;
  if ((b.own === v.id || b.mode === "loose" || b.mode === "pass") && b.mode !== "cut") {
    b.own = p.id;
    b.mode = "held";
    G.poss = p.t;
    G.sc = 24;
    b.made = false;
    if (p.t === 0) G.st.stl++;
  }
  for (let i = 0; i < 26; i++)
    G.fx.push({
      x: v.x,
      y: v.y,
      z: rn(3.6, 5.4),
      vx: (dx / L) * rn(2, 10) + rn(-4, 4),
      vy: (dy / L) * rn(2, 10) + rn(-4, 4),
      vz: rn(1, 9),
      l: rn(0.5, 1),
      c: ["#b3121f", "#7a0a14", "#d42a36", "#5a0710"][i % 4],
      b: 1,
    });
  G.hs = 0.09;
  G.shake = 0.7;
  G.hype = 1;
  G.gl = 0.25;
  if (p.t === 0) G.st.drops++;
  toast("DROPPED!", 0.9);
  sfx("punch");
}
// Steals are instant: no cutscene. The victim stumbles briefly.
function stealBall(o, v) {
  if (v) v.stun = 0.6;
  doSteal(o);
}
function doSteal(o) {
  const b = G.ball;
  b.own = o.id;
  b.mode = "held";
  G.poss = o.t;
  G.sc = 24;
  if (o.t === 0) G.st.stl++;
  toast("STEAL!", 0.6);
  spark(o.x, o.y, 3, 10, "#fff");
  G.hs = 0.05;
  sfx("steal");
}
function beginShot(p) {
  if (p.mv) return;
  const h = HX(p.t),
    dh = hy(h - p.x, 25 - p.y),
    df = minDef(p),
    mv = hy(p.vx, p.vy),
    tw = (p.vx * (h - p.x) + p.vy * (25 - p.y)) / (mv * dh + 0.01);
  // Open at the rim = guaranteed bucket. Strong finishers need less space; only big or bouncy players dunk.
  if (dh < 10.5 && df > 4.5 - (p.fin - 75) / 12) {
    scripted(p, dh < 9 && mv > 5 && tw > 0.3 && p.fin + (p.ht - 76) * 2 >= 74 ? "dunk" : "layup");
    return;
  }
  G.shot = { p, t: 0, d: 0.85, zw: greenZone(p) };
  p.shotJumped = 0;
  const hop = (SHOTS[styleOf(p, "shot")] || {}).hop;
  if (hop) {
    p.vx += Math.cos(p.f) * hop;
    p.vy += Math.sin(p.f) * hop;
  }
}
function launch(p, q, ai) {
  const b = G.ball,
    h = p.t,
    hx = HX(h),
    dh = hy(hx - p.x, 25 - p.y),
    df = minDef(p);
  const ch = cl(
      0.2 +
        (p.sht - 74) * 0.009 +
        q * 0.5 -
        (dh / 94) * 0.3 -
        (df < 3 ? 0.25 : df < 6 ? 0.1 : 0) +
        (dh < 12 ? 0.12 : 0) -
        (100 - p.stam) * 0.0015,
      0.05,
      0.92,
    ),
    made = (q > 0.82 && !ai) || Math.random() < ch;
  const Tm = 0.7 + dh * 0.024,
    z0 = p.z + 7.2,
    tx = hx + (made ? 0 : rn(-0.9, 0.9)),
    ty = 25 + (made ? 0 : rn(-0.9, 0.9));
  Object.assign(b, {
    own: -1,
    mode: "shot",
    x: p.x,
    y: p.y,
    z: z0,
    vx: (tx - p.x) / Tm,
    vy: (ty - p.y) / Tm,
    vz: (10 - z0) / Tm + 16 * Tm,
    h,
    made,
    pts: dh > 23.7 ? 3 : 2,
    shooter: p.id,
    last: h,
    missed: !made,
  });
  // Shot forms: the set shot barely leaves the floor; the fadeaway drifts back.
  const form = styleOf(p, "shot");
  if (p.z < 0.1 && !p.shotJumped) p.vz = 6;
  p.shotJumped = 0;
  if (form === "shot.fade") {
    p.vx -= Math.cos(p.f) * 5;
    p.vy -= Math.sin(p.f) * 5;
  }
  p.fol = 0.45;
  G.shot = null;
  $("meter").classList.remove("on");
  G.sc = 24;
  if (!ai) toast(q > 0.82 ? "PERFECT!" : q > 0.6 ? "GOOD" : "RUSHED", 0.6);
  b.green = !ai && q > 0.82;
  if (b.green) G.st.greens++;
  if (b.green) {
    G.gf = 1;
    G.hype = Math.max(G.hype, 0.5);
    spark(p.x, p.y, 6.5, 26, "#3cff9a");
    sfx("green");
  }
}
// Dunks and layups play as short cutscenes: approach and gather, take off, rise to the rim, flush or
// release, hang, land. The hand path and leg pose come from the equipped style (js/anim.js rimHand/airLegs).
function scripted(p, kind) {
  if (G.cut) return;
  const dir = p.t ? -1 : 1,
    dk = kind === "dunk",
    style = styleOf(p, dk ? "dunk" : "layup");
  G.shot = null;
  $("meter").classList.remove("on");
  G.cut = {
    p,
    kind,
    t: 0,
    x0: p.x,
    y0: p.y,
    h: HX(p.t),
    dir,
    d: dk ? 1.4 : style === "layup.euro" ? 1.15 : 0.95,
    sc: 0,
    side: Math.random() < 0.5 ? -1 : 1,
    style,
    two: style === "dunk.basic" ? Math.random() < 0.5 : ["dunk.twohand", "dunk.360", "dunk.reverse", "dunk.legs"].includes(style),
    nm: style.endsWith(".basic")
      ? ["TOMAHAWK JAM", "TWO-HAND HAMMER", "THE POSTER", "RIM RATTLER"][(Math.random() * 4) | 0]
      : animName(style).toUpperCase(),
  };
  if (dk) document.body.classList.add("cine");
}
function cutUpd(dt) {
  const c0 = G.cut,
    p = c0.p,
    b = G.ball,
    dk = c0.kind === "dunk",
    st = c0.style;
  let u = c0.t / c0.d;
  c0.t += dt * (dk && u > 0.3 && u < 0.7 ? 0.7 : 1); // brief slow-mo at the rim
  u = cl(c0.t / c0.d, 0, 1);
  const A = dk ? 0.3 : 0.32,
    S = dk ? 0.64 : 0.66,
    rev = st === "layup.reverse",
    // Take-off spot, and where the body ends up at the top (under the rim, or past it for a reverse layup).
    tk = [c0.h - c0.dir * (dk ? 4.6 : 3.4), 25 + (c0.y0 - 25) * 0.3],
    top = [c0.h - c0.dir * (rev ? -0.9 : 1.6), rev ? 25 + c0.side * 0.6 : 25],
    Zm = dk ? 3.2 : 2.3,
    ox = p.x,
    oy = p.y,
    f = c0.dir > 0 ? 0 : Math.PI; // facing the rim
  let face = f;
  if (u < A) {
    // Approach. The euro step swings out to one side, then back across.
    const k = sm(u / A),
      eu = st === "layup.euro" ? Math.sin(k * Math.PI * 2) * 2.4 * c0.side : 0;
    p.x = lp(c0.x0, tk[0], k);
    p.y = lp(c0.y0, tk[1], k) + eu;
    p.z = 0;
    p.dk = k > 0.6 ? { style: st, phase: "gather", k: (k - 0.6) / 0.4 } : null;
  } else if (u < S) {
    const k = (u - A) / (S - A);
    p.x = lp(tk[0], top[0], ease(k));
    p.y = lp(tk[1], top[1], ease(k));
    p.z = Zm * Math.sin((k * Math.PI) / 2);
    p.dk = { style: st, phase: "rise", k };
  } else {
    const k = (u - S) / (1 - S);
    p.x = top[0];
    p.y = top[1];
    // Dunks hang on the rim for a beat; layups float down.
    p.z = Zm * (dk ? (k < 0.4 ? 1 - k * 0.15 : Math.max(0, 0.94 - (k - 0.4) / 0.6)) : Math.max(0, 1 - k * 1.25));
    p.dk = { style: st, phase: dk ? "hang" : "fall", k };
  }
  if (st === "dunk.reverse" && u >= A) face = f + Math.PI;
  if (rev && u >= A) face = f + Math.PI * 0.85 * c0.side;
  p.vx = (p.x - ox) / Math.max(dt, 0.001);
  p.vy = (p.y - oy) / Math.max(dt, 0.001);
  p.f += ad(face - p.f) * Math.min(1, dt * 14);
  if (st === "dunk.360" && u >= A && u < S) p.f = f + 6.2832 * ease((u - A) / (S - A));
  p.ph += hy(p.vx, p.vy) * dt * 0.8 * (u < A ? 1 : 0.2);
  p.def = false;
  if (u < A) {
    p.hw = null;
    b.own = p.id;
    b.mode = "held";
    ballUpd(dt);
  } else if (u < S) {
    // Rise: the hand follows the style's path, in the rim's frame.
    const k = (u - A) / (S - A),
      hl = rimHand(st, k, p.z),
      cf = Math.cos(f),
      sf = Math.sin(f);
    p.hw = [p.x + hl[0] * cf - hl[1] * sf, p.y + hl[0] * sf + hl[1] * cf, p.z + hl[2]];
    p.hw2 = c0.two && k > 0.55 ? p.hw : null;
    b.own = -1;
    b.mode = "cut";
    b.x = p.hw[0] + Math.cos(f) * 0.15;
    b.y = p.hw[1] + Math.sin(f) * 0.15;
    b.z = p.hw[2] + 0.4;
    b.spin += dt * (dk ? 3 : 8);
  } else {
    // Dunk: hand stays on the rim while hanging. Layup: arm stays up in follow-through.
    const k = (u - S) / (1 - S);
    p.hw = dk ? (k < 0.55 ? [c0.h - c0.dir * 0.55, 25, 10.15] : null) : k < 0.5 ? [p.x + Math.cos(f) * 1.0, p.y + Math.sin(f) * 1.0, p.z + 7.4] : null;
    p.hw2 = dk && c0.two && p.hw ? p.hw : null;
    if (!c0.sc) {
      c0.sc = 1;
      Object.assign(b, {
        mode: "loose",
        own: -1,
        x: c0.h,
        y: 25,
        z: 10,
        vx: 0,
        vy: 0,
        vz: -4,
        made: true,
        missed: false,
      });
      score(p.t, 2, p, 1);
      if (dk && p.t === 0) G.st.dunks++;
      G.rim[p.t] = dk ? 2 : 1;
      if (dk) {
        G.flash = 0.7;
        G.shake = 1;
        G.hs = 0.12;
        spark(c0.h, 25, 10, 40);
        $("ttl").innerHTML = "SLAM DUNK!<small>" + c0.nm + "</small>";
        $("ttl").className = "on";
      } else toast(st.endsWith(".basic") ? "LAYUP" : animName(st).toUpperCase(), 0.7);
    }
    ballUpd(dt);
  }
  if (u > 0.9) p.stt = "cel";
  if (u >= 1) {
    G.cut = null;
    p.hw = p.hw2 = null;
    p.dk = null;
    p.land = 0.18;
    G.dead = 0.4;
    document.body.classList.remove("cine");
    $("ttl").className = "";
  }
}
function steal(th, v) {
  th.swp = 0.25;
  if (Math.random() < dk(th).stealWin * (th.dfn / 80) * (1.35 - v.hnd / 150)) {
    v.stun = 0.6;
    stealBall(th, v);
  }
}
function ballUpd(dt) {
  const b = G.ball,
    PL = G.pl;
  if (b.mode === "cut") return;
  if (b.own >= 0) {
    const p = PL[b.own];
    G.poss = p.t;
    b.mode = "held";
    const cf = Math.cos(p.f),
      sf = Math.sin(p.f);
    b.bph += dt * (7 + hy(p.vx, p.vy) * 0.45);
    const bk = (b.bph / Math.PI) | 0;
    if (bk !== b.bk) {
      b.bk = bk;
      if (p.id === G.ctrl) sfx("bounce");
    }
    const su = G.shot && G.shot.p === p ? G.shot.t / G.shot.d : p.aishot ? (p.aishot.t / p.aishot.d) * 0.72 : -1;
    if (su >= 0) {
      // The ball rides in the shooting hand through the dip, rise and set point.
      const L = shotBall(p, su);
      b.x = p.x + cf * L[0] - sf * L[1];
      b.y = p.y + sf * L[0] + cf * L[1];
      b.z = p.z + L[2];
    } else {
      const L = ballLocal(p);
      b.x = p.x + cf * L[0] - sf * L[1];
      b.y = p.y + sf * L[0] + cf * L[1];
      b.z = L[2] + p.z;
    }
    b.vx = b.vy = 0;
    b.spin += dt * 6;
    return;
  }
  if (b.mode === "pass") {
    b.pt += dt;
    const u = cl(b.pt / b.pd, 0, 1),
      q = PL[b.tgt];
    b.x = lp(b.sx, q.x + q.vx * 0.12, u);
    b.y = lp(b.sy, q.y + q.vy * 0.12, u);
    b.z = lp(b.sz, 4.4, u) + Math.sin(u * Math.PI) * 0.7;
    b.spin += dt * 12;
    for (const o of PL)
      if (o.t !== q.t && dist(o, b) < 2.1 && u > 0.15 && u < 0.95 && !b.tip && Math.random() < dt * 3 * dk(o).pick) {
        stealBall(o);
        return;
      }
    if (u >= 1) {
      b.tip = 0;
      b.own = b.tgt;
      b.mode = "held";
      G.poss = q.t;
      if (q.t === 0) G.ctrl = q.id;
    }
    return;
  }
  if (b.mode === "shot") {
    const oz = b.z,
      h = b.h,
      hx = HX(h);
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vz -= 32 * dt;
    b.z += b.vz * dt;
    b.spin += dt * 9;
    // Blocks: only a defender who jumps can block. Good shot-blockers and height help; every inch the
    // shooter has on the blocker makes it harder (a 7'4" shooter is very hard to block).
    const sh = PL[b.shooter];
    for (const o of PL)
      if (
        o.t !== h &&
        o.z > 1 &&
        dist(o, b) < 3 &&
        b.z < o.z + 8.8 * (o.ht / 78) &&
        b.z > o.z + 4 &&
        b.vz > -5 &&
        Math.random() < dt * 14 * (o.blk / 75) * cl(1 + (o.ht - (sh ? sh.ht : 78)) * 0.06, 0.2, 2)
      ) {
        b.mode = "loose";
        b.vx = rn(-12, 12);
        b.vy = rn(-12, 12);
        b.vz = 4;
        b.made = false;
        toast("BLOCKED!");
        if (o.t === 0) G.st.blk++;
        return;
      }
    if (oz > 10 && b.z <= 10 && b.vz < 0) {
      if (b.made) {
        b.x = hx;
        b.y = 25;
        b.mode = "loose";
        b.vx = b.vy = 0;
        b.vz = -5;
        score(h, b.pts, PL[b.shooter]);
      } else if (hy(b.x - hx, b.y - 25) < 1.8) {
        G.rim[h] = 1;
        sfx("rim");
        b.mode = "loose";
        b.vz = rn(6, 11);
        b.vx = (h ? 1 : -1) * rn(3, 9);
        b.vy = rn(-6, 6);
      }
    }
    if (b.z <= 0.5) b.mode = "loose";
    else if (b.mode === "shot") return;
  }
  b.mode = "loose";
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.vz -= 32 * dt;
  b.z += b.vz * dt;
  b.spin += dt * 8;
  b.vx *= Math.pow(0.55, dt);
  b.vy *= Math.pow(0.55, dt);
  if (b.z < 0.5) {
    b.z = 0.5;
    if (b.vz < 0) {
      b.vz = -b.vz * 0.6;
      if (b.vz < 3) b.vz = 0;
      b.vx *= 0.85;
      b.vy *= 0.85;
    }
  }
  if (b.x < 1 || b.x > 93) {
    b.vx *= -0.6;
    b.x = cl(b.x, 1, 93);
  }
  if (b.y < 1 || b.y > 49) {
    b.vy *= -0.6;
    b.y = cl(b.y, 1, 49);
  }
  if (!b.made && !(G.dead > 0)) {
    let best = null,
      bd = 1e9;
    for (const p of PL) {
      const d = dist(p, b);
      // Taller players reach higher and a little further for loose balls.
      const reach = d - (p.ht - 78) * 0.06;
      if (reach < bd && p.z + 8 * (p.ht / 78) > b.z && !p.rag) {
        bd = reach;
        best = p;
      }
    }
    b.lt = (b.lt || 0) + dt;
    if (best && bd < 2.1 + Math.min(3, b.lt * 2.5) && b.z < 7.5 && hy(b.vx, b.vy) < 30) {
      b.lt = 0;
      const miss = b.missed;
      b.own = best.id;
      b.mode = "held";
      b.missed = false;
      G.poss = best.t;
      G.sc = 24;
      if (best.t === 0 && miss) G.st.reb++;
      toast(miss ? "REBOUND" : "LOOSE BALL", 0.5);
    }
  }
}
function mv(p, tx, ty, m, dt) {
  const dx = tx - p.x,
    dy = ty - p.y,
    d = hy(dx, dy),
    sp = p.sp * m * (p.stun > 0 ? 0.2 : 1) * (d < 1.5 ? d / 1.5 : 1);
  const r = Math.min(1, dt * dk(p).react);
  p.vx = lp(p.vx, (dx / (d || 1)) * sp, r);
  p.vy = lp(p.vy, (dy / (d || 1)) * sp, r);
}
// The AI's shot: same dip-rise-release as yours, released at the top.
function aiShotStep(p, dt) {
  const s = p.aishot,
    b = G.ball;
  if (b.own !== p.id) return (p.aishot = null);
  s.t += dt;
  p.vx *= 0.85;
  p.vy *= 0.85;
  p.ft = Math.atan2(25 - p.y, HX(p.t) - p.x);
  jumpForShot(p, (s.t / s.d) * 0.72);
  if (s.t >= s.d) {
    p.aishot = null;
    launch(p, s.q, 1);
  }
}
// Leave the floor at the right moment of the shot animation.
function jumpForShot(p, u) {
  const k = (SHOTS[styleOf(p, "shot")] || SHOTS["shot.basic"]).jump;
  if (u >= k[0] && p.z === 0 && !p.shotJumped) {
    p.vz = k[1];
    p.shotJumped = 1;
  }
}
function handler(p, dt) {
  if (p.aishot) return aiShotStep(p, dt);
  const h = HX(p.t),
    d = p.t ? -1 : 1,
    dh = hy(h - p.x, 25 - p.y),
    df = minDef(p);
  p.ai = (p.ai || 0) + dt;
  mv(p, h - d * 3, 25 + Math.sin(T * 1.4 + p.id) * 6, 0.92, dt);
  if (dh < 10 && df > 4 && p.ai > 0.5) {
    p.ai = 0;
    scripted(p, Math.random() < 0.55 ? "dunk" : "layup");
    return;
  }
  if (p.ai > 1.2 && (G.sc < 4 || (dh < 24 && Math.random() < dt * 0.8))) {
    p.ai = 0;
    p.ft = Math.atan2(25 - p.y, h - p.x);
    // Wind up the jump shot; it's released in aiShotStep().
    p.aishot = { t: 0, d: 0.55, q: cl(0.45 + dk(p).shotQ + (df - 3) * 0.07 + rn(-0.2, 0.2), 0.1, 1) };
    return;
  }
  // Under pressure the AI breaks out a dribble move now and then.
  if (df < 3.5 && !p.mv && Math.random() < dt * 0.5) dribbleMove(p);
  if (p.ai > 0.8 && df < 3.2 && Math.random() < dt * 1.2) {
    p.ai = 0;
    passTo(p, bestMate(p, null));
  }
}
function ai(dt) {
  const b = G.ball,
    PL = G.pl,
    ch = [-1, -1],
    bd = [1e9, 1e9];
  if (b.own < 0 && b.mode !== "pass")
    PL.forEach((p, i) => {
      if (p.rag) return;
      const d = dist(p, b);
      if (d < bd[p.t]) {
        bd[p.t] = d;
        ch[p.t] = i;
      }
    });
  PL.forEach((p, i) => {
    p.def = false;
    if (p.rag || p.sl) return;
    if (i === G.ctrl && !G.auto) return; // G.auto: the smoke test lets the AI play your player too
    const t = p.t,
      d = t ? -1 : 1,
      h = HX(t),
      off = b.own >= 0 ? PL[b.own].t === t : b.mode === "pass" ? PL[b.tgt].t === t : b.last === t;
    if (ch[t] === i) {
      mv(p, b.x, b.y, 1, dt);
      return;
    }
    if (b.own === i) {
      handler(p, dt);
      return;
    }
    if (off) {
      const s = [
        [h - d * 24, 25],
        [h - d * 18, 9],
        [h - d * 18, 41],
      ][p.i];
      mv(p, s[0] + Math.sin(T * 0.8 + i) * 2, s[1] + Math.cos(T * 0.7 + i) * 2, 0.8, dt);
      p.ft = Math.atan2(b.y - p.y, b.x - p.x);
    } else {
      const o = PL[(1 - t) * 3 + p.i],
        hh = HX(1 - t),
        dx = hh - o.x,
        dy = 25 - o.y,
        dl = hy(dx, dy) || 1,
        g = Math.max(1.6, (b.own === o.id ? 2.6 : 3.6) + dk(p).gap);
      mv(p, o.x + (dx / dl) * g, o.y + (dy / dl) * g, 1, dt);
      p.def = true;
      p.ft = Math.atan2(o.y - p.y, o.x - p.x);
      if (b.own === o.id && dist(p, o) < 3.4 && !G.shot && Math.random() < dt * dk(p).stealRate) steal(p, o);
    }
  });
}
function human(dt) {
  if (G.auto) return;
  const p = G.pl[G.ctrl],
    b = G.ball,
    K = (k) => keys.has(k);
  if (p.rag || p.sl) {
    G.click = 0;
    return;
  }
  let ix = (K("KeyD") || K("ArrowRight") ? 1 : 0) - (K("KeyA") || K("ArrowLeft") ? 1 : 0),
    iy = (K("KeyW") || K("ArrowUp") ? 1 : 0) - (K("KeyS") || K("ArrowDown") ? 1 : 0),
    jm = 1; // touch joystick: how far it's pushed (walk when barely pushed, sprint at the edge)
  if (G.joy && G.joy.m > 0.15) {
    ix = G.joy.x;
    iy = -G.joy.y;
    jm = Math.min(1, G.joy.m * 1.4);
  }
  const mg = ix || iy;
  lyaw = V.yaw;
  const l = hy(ix, iy) || 1;
  ix /= l;
  iy /= l;
  const wx = Math.cos(lyaw) * iy + Math.sin(lyaw) * ix,
    wy = Math.sin(lyaw) * iy - Math.cos(lyaw) * ix;
  G.in = mg ? { x: wx, y: wy } : null;
  const spr = mg && (K("ShiftLeft") || K("ShiftRight") || (G.joy && G.joy.m > 0.92)) && p.stam > 5,
    sp = p.sp * jm * (spr ? 1.5 : 1) * (p.stam < 18 ? 0.8 : 1) * (G.shot ? 0.3 : 1) * (p.stun > 0 ? 0.3 : 1);
  const kk = 1 - Math.exp(-(mg ? 11 : 16) * dt);
  p.vx += (wx * sp - p.vx) * kk;
  p.vy += (wy * sp - p.vy) * kk;
  p.stam = cl(p.stam + (spr ? -17 : mg ? 3 : 9) * dt, 0, 100);
  if (G.shot) p.ft = Math.atan2(25 - p.y, HX(p.t) - p.x);
  if (spr && Math.random() < 0.5)
    G.fx.push({
      x: p.x,
      y: p.y,
      z: 0.2,
      vx: rn(-2, 2),
      vy: rn(-2, 2),
      vz: rn(1, 3),
      l: 0.4,
      c: "rgba(255,240,220,.8)",
    });
  const pr = (k) => {
    if (T - (BUF[k] || -9) < 0.14) {
      BUF[k] = -9;
      return true;
    }
    return false;
  };
  // Punch and slide only exist in Mayhem mode.
  if (pr("ControlLeft") && mayhem()) startSlide(p);
  if (G.click) {
    G.click = 0;
    if (mayhem()) punch(p);
  }
  if (pr("Space")) {
    if (b.own === p.id && !G.shot) beginShot(p);
    else if (b.own !== p.id && !p.z) p.vz = 10;
  }
  if (pr("KeyQ")) {
    if (b.own === p.id && !G.shot) passTo(p, bestMate(p, G.in));
    else {
      let bs = null,
        bd = 1e9;
      for (let i = 0; i < 3; i++) {
        const d = dist(G.pl[i], b);
        if (i !== G.ctrl && d < bd) {
          bd = d;
          bs = i;
        }
      }
      G.ctrl = bs;
      G.lock = 1.5;
    }
  }
  if (pr("KeyE") && b.own === p.id) dribbleMove(p);
  if (pr("KeyF") && b.own >= 0 && G.pl[b.own].t !== p.t) {
    const o = G.pl[b.own];
    p.swp = 0.25;
    if (dist(p, o) < 4.2) {
      if (Math.random() < 0.32 * (p.dfn / 80) * (1.35 - o.hnd / 150)) stealBall(p, o);
      else toast("CONTEST", 0.4);
    } else toast("HANDS UP", 0.4);
  }
}
function ctrlSel(dt) {
  const b = G.ball;
  G.lock = Math.max(0, G.lock - dt);
  if (b.mode === "pass" && G.pl[b.tgt].t === 0) return;
  if (b.mode === "shot" && G.pl[b.shooter].t === 0) return;
  if (b.own >= 0 && b.own < 3) {
    G.ctrl = b.own;
    return;
  }
  if (G.lock > 0) return;
  const ref = b.own >= 0 ? G.pl[b.own] : b;
  let best = 0,
    bd = 1e9;
  for (let i = 0; i < 3; i++) {
    const d = dist(G.pl[i], ref);
    if (d < bd && !G.pl[i].rag) {
      bd = d;
      best = i;
    }
  }
  if (best !== G.ctrl && (G.pl[G.ctrl].rag || (bd < dist(G.pl[G.ctrl], ref) - 2.5 && T > G.swT))) {
    G.ctrl = best;
    G.swT = T + 0.45;
  }
}
function integ(p, dt) {
  if (p.rag) {
    const r = p.rag;
    r.t += dt;
    const k = Math.exp(-3.2 * r.t);
    p.vx = r.dx * 12 * k;
    p.vy = r.dy * 12 * k;
    if (r.t >= r.d) p.rag = null;
  }
  if (p.sl) slideStep(p, dt);
  if (p.slcd > 0) p.slcd -= dt;
  if (p.pun > 0) {
    p.pun -= dt;
    if (p.punT > 0) {
      p.punT -= dt;
      if (p.punT <= 0) punchHit(p);
    }
  }
  const sp = hy(p.vx, p.vy);
  p.x = cl(p.x + p.vx * dt, 1, 93);
  p.y = cl(p.y + p.vy * dt, 1, 49);
  p.ph += sp * dt * 0.8;
  if (p.z > 0 || p.vz) {
    p.vz -= 32 * dt;
    p.z += p.vz * dt;
    if (p.z <= 0) {
      p.z = 0;
      p.vz = 0;
      p.land = 0.18; // brief squat on landing
    }
  }
  if (p.land > 0) p.land -= dt;
  if (p.pas > 0) p.pas -= dt;
  if (p.swp > 0) p.swp -= dt;
  if (p.fol > 0) p.fol -= dt;
  if (p.stun > 0) p.stun -= dt;
  const ta =
    p.rag || p.sl
      ? p.f
      : p.pun > 0
        ? p.pf
        : p.ft !== undefined
          ? p.ft
          : sp > 1.5
            ? Math.atan2(p.vy, p.vx)
            : p.f;
  p.f += ad(ta - p.f) * Math.min(1, dt * 9);
  p.ft = undefined;
  if (p.mv) moveStep(p, dt);
}
// ---------- dribble moves: E plays a different one each press (never the same twice running)
// sw: the ball ends in the other hand. Moves from dribble packs only join your rotation when equipped.
const MOVES = {
  cross: { d: 0.3, name: "CROSSOVER", push: 9, sw: 1 },
  legs: { d: 0.38, name: "BETWEEN THE LEGS", push: 6, sw: 1 },
  back: { d: 0.4, name: "BEHIND THE BACK", push: 8, sw: 1 },
  spin: { d: 0.48, name: "SPIN MOVE", push: 8, sw: 1 },
  hesi: { d: 0.45, name: "HESITATION", push: 12, sw: 0 },
  inout: { d: 0.36, name: "IN-AND-OUT", push: 10, sw: 0 },
  stutter: { d: 0.55, name: "STUTTER STEP", push: 13, sw: 0 },
  snatch: { d: 0.4, name: "SNATCH-BACK", push: 9, sw: 0 },
  double: { d: 0.55, name: "DOUBLE CROSS", push: 8, sw: 0 },
  killer: { d: 0.38, name: "KILLER CROSSOVER", push: 12, sw: 1, ankle: 1.4 },
  shammgod: { d: 0.55, name: "SHAMMGOD", push: 11, sw: 1, ankle: 1.5 },
  tornado: { d: 0.6, name: "TORNADO SPIN", push: 10, sw: 1, ankle: 1.5 },
};
const BASE_MOVES = ["cross", "legs", "back", "spin"];
const movePool = (p) => (p.t === 0 ? BASE_MOVES.concat(SAVE.equip.moves.map((id) => id.split(".")[1])) : BASE_MOVES);
function dribbleMove(p) {
  const b = G.ball;
  if (p.mv || G.shot || G.cut || p.z > 0 || b.own !== p.id) return;
  // Your team shares one "last move" so pressing E never repeats, even after switching player.
  const last = p.t === 0 ? G.lastMv : p.lastMv,
    ks = movePool(p).filter((q) => q !== last),
    k = ks[(Math.random() * ks.length) | 0],
    M = MOVES[k],
    h = p.hand || -1,
    d = p.id === G.ctrl && G.in ? G.in : { x: Math.cos(p.f), y: Math.sin(p.f) };
  if (p.t === 0) G.lastMv = k;
  else p.lastMv = k;
  p.mv = { k, t: 0, d: M.d, h, f0: p.f };
  if (k === "spin" || k === "tornado") {
    p.vx += d.x * M.push;
    p.vy += d.y * M.push;
  } else if (k === "hesi" || k === "stutter") {
    // Fake stop first; the burst comes halfway through (moveStep).
    p.vx *= 0.25;
    p.vy *= 0.25;
  } else if (k === "inout") {
    // Fake toward the other side first; the real burst comes halfway.
    p.vx += -Math.sin(p.f) * h * 4;
    p.vy += Math.cos(p.f) * h * 4;
  } else if (k === "shammgod") {
    // Lunge forward first; the pull-back across comes halfway.
    p.vx += d.x * 6;
    p.vy += d.y * 6;
  } else if (k === "snatch") {
    // Hop backwards, away from the defender.
    p.vx -= d.x * M.push;
    p.vy -= d.y * M.push;
  } else {
    // Burst toward the side the ball is moving to (local y = -h).
    const side = -h;
    p.vx += -Math.sin(p.f) * side * M.push + d.x * 2;
    p.vy += Math.cos(p.f) * side * M.push + d.y * 2;
  }
  let hit = 0;
  for (const q of G.pl)
    if (q.t !== p.t && dist(q, p) < 6 && Math.random() < (k === "spin" ? 0.45 : 0.35) * (M.ankle || 1) * (p.hnd / 82)) {
      q.stun = 0.8;
      hit = 1;
    }
  if (p.t === 0) toast(hit ? "ANKLE BREAKER!" : M.name, 0.6);
  if (p.t === 0 && hit) G.st.ankles++;
  p.stam = Math.max(0, p.stam - 4);
}
function moveStep(p, dt) {
  const m = p.mv;
  m.t += dt;
  // The spin turns the body a full circle, away from the ball side.
  if (m.k === "spin" || m.k === "tornado") p.f = m.f0 + -m.h * 6.2832 * sm(cl(m.t / m.d, 0, 1));
  // Second half of two-part moves.
  if (!m.mid && m.t >= m.d * 0.45) {
    m.mid = 1;
    const fx = Math.cos(p.f),
      fy = Math.sin(p.f);
    if (m.k === "hesi" || m.k === "stutter") {
      p.vx += fx * MOVES[m.k].push;
      p.vy += fy * MOVES[m.k].push;
    } else if (m.k === "inout") {
      p.vx += fx * 6 - fy * -m.h * 8; // go the way you faked away from
      p.vy += fy * 6 + fx * -m.h * 8;
    } else if (m.k === "shammgod") {
      p.vx += -fy * -m.h * 12;
      p.vy += fx * -m.h * 12;
    } else if (m.k === "double") {
      p.vx += -fy * m.h * 14; // back toward the starting side, hard
      p.vy += fx * m.h * 14;
    }
  }
  if (m.t >= m.d || G.ball.own !== p.id) {
    if (m.k === "spin" || m.k === "tornado") p.f = m.f0;
    p.hand = MOVES[m.k].sw ? -m.h : m.h;
    // Restart the dribble bounce where the move left the ball.
    G.ball.bph = m.k === "back" ? 0 : Math.PI / 2;
    p.mv = null;
  }
}
function separate() {
  const L = G.pl;
  for (let i = 0; i < 6; i++)
    for (let j = i + 1; j < 6; j++) {
      const a = L[i],
        b = L[j],
        d = dist(a, b);
      if (d < 1.8 && d > 0.01 && !a.sl && !b.sl) {
        const k = (1.8 - d) / 2 / d;
        const dx = (a.x - b.x) * k,
          dy = (a.y - b.y) * k;
        a.x += dx;
        a.y += dy;
        b.x -= dx;
        b.y -= dy;
      }
    }
}
function end() {
  G.run = 0;
  $("vm").style.display = "none";
  hudOn(0);
  document.body.classList.remove("cine", "bars");
  if (G.prac) show("menu");
  else showResults();
}
