"use strict";
// Player models: a 3D skeleton with two-bone IK, drawn into small pixel sprites. Also the ball.
// ---------- characters: 3D skeleton with two-bone IK, drawn as thick capsules
function ik(A, Tg, l1, l2, pv) {
  const dx = Tg[0] - A[0],
    dy = Tg[1] - A[1],
    dz = Tg[2] - A[2];
  let d = hy(dx, dy, dz) || 0.001;
  d = Math.min(d, l1 + l2 - 0.01);
  const ux = dx / d,
    uy = dy / d,
    uz = dz / d,
    a = (l1 * l1 - l2 * l2 + d * d) / (2 * d),
    h = Math.sqrt(Math.max(0, l1 * l1 - a * a)),
    dd = pv[0] * ux + pv[1] * uy + pv[2] * uz;
  let px = pv[0] - ux * dd,
    py = pv[1] - uy * dd,
    pz = pv[2] - uz * dd;
  const pl = hy(px, py, pz) || 1;
  return [
    [A[0] + ux * a + (px / pl) * h, A[1] + uy * a + (py / pl) * h, A[2] + uz * a + (pz / pl) * h],
    [A[0] + ux * d, A[1] + uy * d, A[2] + uz * d],
  ];
}
const SHC = {};
function shade(h, a) {
  const k = h + a;
  return (
    SHC[k] ||
    (SHC[k] =
      "#" +
      pc(h)
        .map((x) => (cl(a < 0 ? x * (1 + a) : x + (255 - x) * a, 0, 255) | 0).toString(16).padStart(2, "0"))
        .join(""))
  );
}
// Per-look hair style (0 short, 1 tall top, 2 shaved), beard, headband and arm sleeve.
const HST = [1, 0, 2, 3, 4, 0, 2, 0, 1, 3, 4, 2],
  BRD = [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
  BND = [1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  SLV = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1];
function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]),
    lo = [],
    up = [];
  for (const p of pts) {
    while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}
// Body size by position: guards are smaller, centres taller and broader.
// Realistic proportions for a 6'6" player, in feet. Everyone is scaled by their real height (js/teams.js),
// and bigs are a little broader than guards.
const BW = { PG: 0.94, SG: 0.96, SF: 1, PF: 1.06, C: 1.1 };
const bodyScale = (p) => (p.ht || 78) / 78;
const mkSpr = (w, h) => {
  const v = document.createElement("canvas");
  v.width = w;
  v.height = h;
  return { cv: v, x: v.getContext("2d", { willReadFrequently: true }), w, h };
};
const SPN = [0, 1, 2, 3, 4, 5].map(() => mkSpr(128, 256));
// Where the ball sits in the dribbler's local frame (x forward, y left, z up, feet).
// p.hand is the side the ball is on: -1 right, +1 left. Dribble moves carry it to the other hand.
function ballLocal(p) {
  const h = p.hand || -1,
    m = p.mv,
    B = G.ball;
  if (m) {
    const u = cl(m.t / m.d, 0, 1),
      e = sm(u);
    if (m.k === "cross") return [1.0, lp(h * 0.6, -h * 0.6, e), 0.55 + 2.4 * Math.abs(Math.cos(u * Math.PI))];
    if (m.k === "legs")
      return [0.7 - 0.6 * Math.sin(u * Math.PI), lp(h * 0.65, -h * 0.65, e), 0.55 + 2.2 * Math.abs(Math.cos(u * Math.PI))];
    if (m.k === "back") {
      const th = (h * Math.PI) / 2 + h * Math.PI * e;
      return [Math.cos(th) * 0.95, Math.sin(th) * 0.95, u < 0.65 ? 2.3 : lp(2.3, 0.6, (u - 0.65) / 0.35)];
    }
    if (m.k === "hesi") return [0.9, h * 0.55, u < 0.4 ? 2.4 : 0.55 + 2.2 * Math.abs(Math.cos(((u - 0.4) / 0.6) * Math.PI))];
    if (m.k === "snatch") return [0.9 - 1.1 * Math.sin(u * Math.PI), h * 0.5, 0.6 + 1.2 * Math.abs(Math.sin(u * Math.PI * 2))];
    if (m.k === "double")
      return [1.0, h * 0.6 * Math.cos(u * 6.2832), 0.55 + 2.4 * Math.abs(Math.cos(u * 6.2832))];
    if (m.k === "inout") return [1.0, h * 0.6 * (1 - Math.sin(u * Math.PI) * 0.95), 0.55 + 2.2 * Math.abs(Math.cos(u * Math.PI))];
    if (m.k === "stutter") return [0.85, h * 0.5, 0.55 + 1.1 * Math.abs(Math.sin(u * Math.PI * 4))];
    if (m.k === "killer") return [1.1, lp(h * 0.9, -h * 0.9, e), 0.5 + 1.7 * Math.abs(Math.cos(u * Math.PI))];
    if (m.k === "shammgod") {
      if (u < 0.4) return [lp(0.9, 2.1, ease(u / 0.4)), h * 0.4, 0.55 + 1.6 * Math.abs(Math.cos((u / 0.4) * Math.PI))];
      const w = (u - 0.4) / 0.6;
      return [lp(2.1, 0.8, ease(w)), lp(h * 0.4, -h * 0.6, ease(w)), 0.55 + 2.0 * Math.abs(Math.cos(w * Math.PI))];
    }
    // Behind the back from hand hb (path used by the combos below).
    const behind = (hb, w) => {
      const th = (hb * Math.PI) / 2 + hb * Math.PI * sm(w);
      return [Math.cos(th) * 0.95, Math.sin(th) * 0.95, w < 0.65 ? 2.3 : lp(2.3, 0.6, (w - 0.65) / 0.35)];
    };
    if (m.k === "combo") {
      if (u < 0.5) {
        const w = u * 2;
        return [0.7 - 0.6 * Math.sin(w * Math.PI), lp(h * 0.65, -h * 0.65, sm(w)), 0.55 + 2.2 * Math.abs(Math.cos(w * Math.PI))];
      }
      return behind(-h, (u - 0.5) * 2);
    }
    if (m.k === "curry") return u < 0.5 ? behind(h, u * 2) : behind(-h, (u - 0.5) * 2);
    if (m.k === "tweens") {
      const a = u * Math.PI * 3;
      return [0.7 - 0.6 * Math.abs(Math.sin(a)), h * 0.65 * Math.cos(a), 0.55 + 2.0 * Math.abs(Math.cos(a))];
    }
    if (m.k === "ai") {
      if (u < 0.4) return [0.9, h * 0.6, 2.4 - Math.sin((u / 0.4) * Math.PI) * 0.3];
      const w = (u - 0.4) / 0.6;
      return [1.1, lp(h * 0.9, -h * 0.9, sm(w)), 0.5 + 1.7 * Math.abs(Math.cos(w * Math.PI))];
    }
    if (m.k === "tornado") {
      // Ball at the hip through the spin, switched behind the back in the middle.
      const t = cl((u - 0.35) / 0.3, 0, 1);
      return [0.35 - Math.sin(t * Math.PI) * 0.95, lp(h * 0.85, -h * 0.85, ease(t)), 2.4];
    }
    if (m.k === "yoyo") {
      // Slam it down, it bounces way up over the head, then drops back into the hand.
      if (u < 0.2) return [1.0, h * 0.55, lp(2.4, 0.55, ease(u / 0.2))];
      const w = (u - 0.2) / 0.8;
      return [lp(1.0, 1.1, w), h * 0.55 * (1 - Math.sin(w * Math.PI) * 0.6), 0.55 + Math.sin(w * Math.PI) * 7.6 * (1 - w * 0.3) + w * 1.6];
    }
    return [0.35, h * 0.85, 2.5]; // spin and half spin: ball tucked at the hip while the body turns
  }
  return [0.9, h * 0.55, 0.55 + Math.abs(Math.sin(B.bph)) * 2.7];
}
// Characters are real pixel sprites: the skeleton is drawn with flat-capped blocks into a small canvas at screen
// pixel density, alpha is hard-thresholded, a 1px outline is stamped around it, then it is blitted into the world.
// p.port (portrait) draws a large standalone model for the team-select screen instead.
function buildSprite(p) {
  const port = p.port,
    sp = port ? port.spr : SPN[p.id],
    x = sp.x,
    tm = p.team || TM[p.t],
    look = p.look !== undefined ? p.look : p.id;
  p.spr = null;
  let k;
  if (port) k = port.k;
  else {
    const g = P(p.x, p.y, 0);
    if (!g || g[2] < 6) return;
    k = Math.round(cl(g[3], 7, 15));
  }
  const S = bodyScale(p),
    bw = BW[p.pos] || 1,
    K = k * S, // drawing scale for this body
    ox = sp.w >> 1,
    oy = sp.h - 24,
    spd = hy(p.vx, p.vy),
    run = cl(spd / 13, 0, 1.3),
    b = G.ball,
    hold = port ? !!port.ball : b.own === p.id && b.mode === "held",
    shooting = port ? port.pose === "shot" : !!((G.shot && G.shot.p === p) || p.aishot),
    tt = port ? port.t : T;
  // Ball position in this body's frame (model feet), for the dribbling hand.
  let ballL = null;
  if (hold && !shooting) {
    if (port) ballL = port.ball;
    else {
      const cf0 = Math.cos(p.f),
        sf0 = Math.sin(p.f),
        dx = b.x - p.x,
        dy = b.y - p.y;
      ballL = [dx * cf0 + dy * sf0, -dx * sf0 + dy * cf0, b.z - p.z];
    }
    ballL = ballL.map((v) => v / S);
  }
  const ctx = {
    run,
    sprint: cl((spd - 12) / 6, 0, 1),
    idle: 1 - cl(run * 3, 0, 1),
    s1: Math.sin(p.ph),
    c1: Math.cos(p.ph),
    tt,
    bw,
    land: p.land > 0 ? p.land / 0.18 : 0,
    air: p.z > 0.3,
    hold,
    shooting,
    shotU: port ? ((port.t * 0.75) % 1) * 1.15 : p.aishot ? (p.aishot.t / p.aishot.d) * 0.72 : shooting ? G.shot.t / G.shot.d : 0,
    hand: p.hand || -1,
    shotS: styleOf(p, "shot"),
    fol: port ? 0 : p.fol || 0,
    pas: p.pas || 0,
    swp: p.swp || 0,
    cel: port ? port.pose === "cel" : p.stt === "cel",
    celS: styleOf(p, "cel"),
    pun: p.pun > 0 && !p.rag ? p.pun : 0,
    sl: !p.rag && p.sl,
    rag: p.rag,
    mv: port ? port.mv : p.mv,
    ballL,
    guarded: !port && G.pl.length && minDef(p) < 5,
    bph: b.bph,
    dk: port ? port.dk : p.dk,
    trophy: !port && p.trophy,
  };
  let Q = animPose(p, ctx);
  // Dunk/layup hand from the cutscene path (world feet) overrides the ball hand.
  if (p.hw) {
    const cf0 = Math.cos(p.f),
      sf0 = Math.sin(p.f),
      dx = p.hw[0] - p.x,
      dy = p.hw[1] - p.y,
      hl = [(dx * cf0 + dy * sf0) / S, (-dx * sf0 + dy * cf0) / S, (p.hw[2] - p.z) / S - Q.hz];
    Q = clonePose(Q);
    if (hl[1] >= 0 && !p.hw2) Q.aL = hl;
    else Q.aR = hl;
    if (p.hw2) Q.aL = [hl[0], hl[1] + 0.4, hl[2]];
  }
  Q = smoothPose(p, Q, tt, port ? 30 : 26);
  const f = p.f + Q.yaw,
    cf = Math.cos(f),
    sf = Math.sin(f),
    fb = cf * Fx + sf * Fy,
    vis = Math.abs(fb),
    fsx = cf * Rx + sf * Ry,
    ra = Q.pitch,
    rc = Q.recline || 0,
    hz = Q.hz,
    lean = Q.lean,
    twist = Q.twist,
    up = (a) => [a[0], a[1], a[2] + hz], // hand targets are stored relative to the hips
    aL = up(Q.aL),
    aR = up(Q.aR),
    fL = Q.fL,
    fR = Q.fR;
  const hop = ctx.cel ? celHop(ctx.celS, tt) / S : 0; // backflip celebration leaves the floor
  const hL = [0, 0.4 * bw, hz],
    hR = [0, -0.4 * bw, hz],
    sL = [lean - twist, 0.78 * bw, hz + 2.15],
    sR = [lean + twist, -0.78 * bw, hz + 2.15];
  const [eL, wL] = ik(sL, aL, 1.27, 1.22, [-0.3, 0.9, -0.6]),
    [eR, wR] = ik(sR, aR, 1.27, 1.22, [-0.3, -0.9, -0.6]),
    [kL, ftL] = ik(hL, fL, 1.72, 1.66, [1, 0.1, 0]),
    [kR, ftR] = ik(hR, fR, 1.72, 1.66, [1, -0.1, 0]);
  x.clearRect(0, 0, sp.w, sp.h);
  let X0 = 1e9,
    X1 = -1e9,
    Y0 = 1e9,
    Y1 = -1e9;
  const bb = (a, w) => {
    X0 = Math.min(X0, a[0] - w);
    X1 = Math.max(X1, a[0] + w);
    Y0 = Math.min(Y0, a[1] - w);
    Y1 = Math.max(Y1, a[1] + w);
  };
  const pj = (v) => {
    let x0 = v[0],
      z0 = v[2];
    // Recline: tilt only the upper body back around the hips (legs stay put), e.g. the slide tackle.
    if (rc && z0 > hz - 0.1) {
      const zz = z0 - hz,
        cc = Math.cos(rc),
        ss = Math.sin(rc);
      x0 = v[0] * cc - zz * ss;
      z0 = v[0] * ss + zz * cc + hz;
    }
    if (ra) {
      const zz = z0 - hz,
        cc = Math.cos(ra),
        ss = Math.sin(ra);
      x0 = v[0] * cc - zz * ss;
      z0 = v[0] * ss + zz * cc + hz - (hz - 0.45) * ss;
    }
    const rx = x0 * cf - v[1] * sf,
      ry = x0 * sf + v[1] * cf,
      z = z0 + p.z + hop;
    return [ox + (rx * Rx + ry * Ry) * K, oy - (rx * Ux + ry * Uy + z * Uz) * K, rx * Fx + ry * Fy + z * Fz];
  };
  const quad = (A, B, w, col) => {
    let dx = B[0] - A[0],
      dy = B[1] - A[1];
    const L = hy(dx, dy) || 1;
    dx /= L;
    dy /= L;
    const e = w * 0.35,
      nx = (-dy * w) / 2,
      ny = (dx * w) / 2,
      ax = A[0] - dx * e,
      ay = A[1] - dy * e,
      bx = B[0] + dx * e,
      by = B[1] + dy * e;
    x.fillStyle = col;
    x.beginPath();
    x.moveTo(ax + nx, ay + ny);
    x.lineTo(bx + nx, by + ny);
    x.lineTo(bx - nx, by - ny);
    x.lineTo(ax - nx, ay - ny);
    x.closePath();
    x.fill();
    bb(A, w);
    bb(B, w);
  };
  const blk = (cx, cy, w, h, col) => {
    cx = Math.round(cx);
    cy = Math.round(cy);
    w = Math.max(2, Math.round(w));
    h = Math.max(2, Math.round(h));
    x.fillStyle = col;
    x.fillRect(cx - (w >> 1) + 1, cy - (h >> 1), w - 2, h);
    x.fillRect(cx - (w >> 1), cy - (h >> 1) + 1, w, h - 2);
    bb([cx, cy], Math.max(w, h));
  };
  const it = [],
    add = (a, q, w, col, bias) => {
      const A = pj(a),
        B = pj(q);
      it.push({ A, B, w: w * K, col, d: (A[2] + B[2]) / 2 - (bias || 0) });
    },
    mid = (a, q, t) => [lp(a[0], q[0], t), lp(a[1], q[1], t), lp(a[2], q[2], t)];
  const shoe = shoeOf(p),
    sk = p.sk,
    hr = p.hcol || ["#16100d", "#2a1a10", "#0b0b0b"][look % 3],
    hc = [lean + 0.1, 0, hz + 2.87],
    hs = p.hair !== undefined ? p.hair : HST[look % 12];
  for (const [h, kn, ft, sd] of [
    [hL, kL, ftL, 1],
    [hR, kR, ftR, -1],
  ]) {
    const th = mid(h, kn, 0.62),
      cf2 = mid(kn, ft, 0.5);
    add(h, th, 0.9, tm.s);
    add(th, kn, 0.5, sk);
    add([h[0], h[1] + sd * 0.55, h[2] + 0.1], [th[0], th[1] + sd * 0.55, th[2]], 0.16, tm.t, 0.3);
    add(kn, cf2, 0.5, sk);
    add(cf2, ft, 0.46, "#f3f3f3");
    // Shoes: the equipped pair (js/shoes.js) for your team, team colours for everyone else.
    add([ft[0], ft[1], ft[2] + 0.5], [ft[0], ft[1], ft[2] + 0.05], 0.5, shoe ? shoe.ov : tm.j);
    add(ft, [ft[0] + 0.8, ft[1], ft[2] - 0.02], 0.62, shoe ? shoe.up : tm.j);
    add([ft[0], ft[1], ft[2] - 0.28], [ft[0] + 0.8, ft[1], ft[2] - 0.28], 0.16, shoe ? shoe.so : "#f4f4f4", 0.2);
    add([ft[0] + 0.15, ft[1], ft[2] + 0.2], [ft[0] + 0.7, ft[1], ft[2] + 0.22], 0.34, shoe ? shoe.ac : tm.t, 0.1);
  }
  add([0, 0, hz + 0.3], [0, 0, hz - 0.35], (1.15 + 0.5 * vis) * bw, tm.s);
  add([0, 0, hz + 0.38], [0, 0, hz + 0.24], (1.2 + 0.5 * vis) * bw, tm.t, -0.05);
  const tp = [];
  for (const sx of [-1, 1])
    for (const dx of [-1, 1])
      tp.push(pj([lean + dx * 0.4, sx * 0.8 * bw, hz + 2.2]), pj([dx * 0.34, sx * 0.55 * bw, hz + 0.15]));
  const th2 = hull(tp.map((q) => [q[0], q[1]])),
    pa = [pj([lean, 0.8 * bw, hz + 2.15]), pj([0, 0.55 * bw, hz + 0.12])],
    pb = [pj([lean, -0.8 * bw, hz + 2.15]), pj([0, -0.55 * bw, hz + 0.12])],
    nm = pj([lean, 0, hz + 1.35]);
  it.push({
    d: tp.reduce((a, q) => a + q[2], 0) / 8 - 0.2,
    fn: () => {
      x.beginPath();
      th2.forEach((v, i) => (i ? x.lineTo(v[0], v[1]) : x.moveTo(v[0], v[1])));
      x.closePath();
      x.fillStyle = tm.j;
      x.fill();
      th2.forEach((v) => bb(v, 2));
      x.save();
      x.clip();
      let x0 = 1e9,
        x1 = -1e9,
        y0 = 1e9,
        y1 = -1e9;
      th2.forEach((v) => {
        x0 = Math.min(x0, v[0]);
        x1 = Math.max(x1, v[0]);
        y0 = Math.min(y0, v[1]);
        y1 = Math.max(y1, v[1]);
      });
      const w = x1 - x0;
      x.fillStyle = shade(tm.j, 0.18);
      x.fillRect(x0, y0, w * 0.26, y1 - y0);
      x.fillStyle = shade(tm.j, -0.26);
      x.fillRect(x1 - w * 0.3, y0, w * 0.3, y1 - y0);
      x.restore();
      quad(pa[0], pa[1], Math.max(1.5, 0.15 * K), tm.t);
      quad(pb[0], pb[1], Math.max(1.5, 0.15 * K), tm.t);
      // Neckline: a V at the front, a flat collar at the back.
      const nw = Math.max(1.5, 0.13 * K);
      if (fb < -0.1) {
        const c0 = pj([lean + 0.3, 0, hz + 1.8]);
        quad(pj([lean + 0.08, 0.34 * bw, hz + 2.2]), c0, nw, tm.t);
        quad(pj([lean + 0.08, -0.34 * bw, hz + 2.2]), c0, nw, tm.t);
      } else quad(pj([lean - 0.05, 0.32 * bw, hz + 2.18]), pj([lean - 0.05, -0.32 * bw, hz + 2.18]), nw, tm.t);
    },
  });
  for (const [s0, e, w] of [
    [sL, eL, wL],
    [sR, eR, wR],
  ]) {
    add(s0, e, 0.44, sk);
    add(e, w, 0.38, sk);
    if (SLV[look % 12]) add(mid(s0, e, 0.35), e, 0.5, "#f1f1f1", 0.1);
    add(mid(e, w, 0.7), w, 0.42, "#f1f1f1", 0.1);
    const W = pj(w);
    it.push({ d: W[2] - 0.15, fn: () => blk(W[0], W[1], 0.4 * K, 0.42 * K, sk) }); // hand
  }
  add([lean, 0, hz + 2.1], [lean + 0.08, 0, hz + 2.55], 0.36, shade(sk, -0.12)); // neck
  const H = pj(hc);
  it.push({
    d: H[2] - 0.5,
    fn: () => {
      const w = 0.62 * K,
        h = 0.8 * K,
        cx = H[0],
        cy = H[1],
        sx = Math.abs(fsx) > 0.25 ? Math.sign(fsx) : 0;
      if (fb < -0.25) {
        // Ears either side of the face.
        const ew = Math.max(2, K * 0.16),
          eh = Math.max(2, K * 0.26);
        blk(cx - w * 0.52, cy + h * 0.08, ew, eh, shade(sk, -0.12));
        blk(cx + w * 0.52, cy + h * 0.08, ew, eh, shade(sk, -0.12));
      }
      blk(cx, cy + h * 0.04, w, h, sk);
      // Hair: 0 short, 1 tall top, 2 buzz (thin cap), 3 bald, 4 afro.
      if (hs === 4) blk(cx, cy - h * 0.3, w * 1.45, h * 0.75, hr);
      if (hs !== 3) {
        const cap = hs === 2 ? 0.22 : 0.4;
        if (fb > 0.3) blk(cx, cy - h * 0.06, w + 2, h * (hs === 2 ? 0.7 : 0.9), hr);
        else {
          blk(cx, cy - h * (0.5 - cap / 2), w + 2, h * cap, hr);
          if (sx && fb > -0.25 && hs !== 2) blk(cx - sx * w * 0.3, cy - h * 0.02, w * 0.45, h * 0.7, hr);
        }
      } else if (fb < 0.3) blk(cx - w * 0.15, cy - h * 0.3, w * 0.25, h * 0.12, shade(sk, 0.25)); // scalp shine
      if (hs === 1) {
        blk(cx - w * 0.38, cy - h * 0.56, w * 0.34, h * 0.24, hr);
        blk(cx, cy - h * 0.64, w * 0.4, h * 0.26, hr);
        blk(cx + w * 0.38, cy - h * 0.56, w * 0.34, h * 0.24, hr);
      }
      if (fb < -0.25) {
        x.fillStyle = "#160c0c";
        const ex = Math.max(1, Math.round(K * 0.1)),
          ey = Math.max(1, Math.round(K * 0.14)),
          off = Math.round(w * 0.22),
          sh2 = Math.round(fsx * w * 0.12);
        x.fillRect(Math.round(cx - off + sh2), Math.round(cy), ex, ey);
        x.fillRect(Math.round(cx + off + sh2) - ex + 1, Math.round(cy), ex, ey);
        // Nose and mouth.
        const nz2 = Math.max(1, Math.round(K * 0.1));
        x.fillStyle = shade(sk, -0.22);
        x.fillRect(Math.round(cx + sh2 * 1.4 - nz2 / 2), Math.round(cy + h * 0.17), nz2, nz2 + 1);
        x.fillStyle = shade(sk, -0.4);
        x.fillRect(Math.round(cx + sh2 * 1.2 - w * 0.15), Math.round(cy + h * 0.32), Math.max(2, Math.round(w * 0.3)), 1);
        if (BRD[look % 12]) blk(cx, cy + h * 0.3, w * 0.8, h * 0.3, hr);
      }
      if (BND[look % 12]) blk(cx, cy - h * 0.2, w + 2, Math.max(1.5, K * 0.17), tm.t);
    },
  });
  // The ball, while this player has it, is drawn into the sprite among the body parts, so it really goes
  // behind the back on a behind-the-back move and sits in the hand (not on top of it) when they shoot.
  const BW0 = port ? (port.ball ? [port.ball[0], port.ball[1], port.ball[2] + p.z] : null) : heldBall(p);
  if (BW0) {
    const bx = BW0[0] / S,
      by = BW0[1] / S,
      bz = (BW0[2] - p.z) / S + p.z,
      B = [ox + (bx * Rx + by * Ry) * K, oy - (bx * Ux + by * Uy + bz * Uz) * K, bx * Fx + by * Fy + bz * Fz],
      br = Math.max(3, Math.round(0.55 * k));
    it.push({ d: B[2], fn: () => (ballPix(x, Math.round(B[0]), Math.round(B[1]), br, port ? tt * 6 : b.spin), bb(B, br + 1)) });
    if (!port) G.ballIn = p.id;
  }
  // The winner's trophy, held up over the head (js/showtime.js).
  if (!port && p.trophy) {
    const tz = 7.65 + p.z, // the hands, in the same units as the body (see pj)
      Tp = [ox, oy - tz * Uz * K, tz * Fz];
    it.push({ d: Tp[2] - 0.6, fn: () => (drawTrophy(x, Tp[0], Tp[1] - (1 - p.trophy) * 0.6 * k, k, G.win && G.win.finals), bb([Tp[0], Tp[1] - 3 * k], k)) });
  }
  it.sort((a, q) => q.d - a.d);
  for (const q of it) {
    if (q.fn) {
      q.fn();
      continue;
    }
    const w = Math.max(2, Math.round(q.w));
    quad(q.A, q.B, w, shade(q.col, -0.2));
    if (w >= 4) {
      const o = Math.max(1, Math.round(w * 0.14));
      quad([q.A[0] - o, q.A[1] - o], [q.B[0] - o, q.B[1] - o], w * 0.7, q.col);
      if (w >= 6)
        quad(
          [q.A[0] - o * 2, q.A[1] - o * 2],
          [q.B[0] - o * 2, q.B[1] - o * 2],
          Math.max(1.5, w * 0.2),
          shade(q.col, 0.2),
        );
    }
  }
  if (X1 < X0) return;
  const x0 = Math.max(0, Math.floor(X0) - 2),
    y0 = Math.max(0, Math.floor(Y0) - 2),
    w = Math.min(sp.w, Math.ceil(X1) + 3) - x0,
    h = Math.min(sp.h, Math.ceil(Y1) + 3) - y0;
  if (w < 3 || h < 3) return;
  const im = x.getImageData(x0, y0, w, h),
    d = im.data,
    a = new Uint8Array(w * h),
    rim = SET.lighting === "high";
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] >= 100 ? 1 : 0;
  // Read colours from a copy so the edits below don't feed into each other.
  const src = new Uint8ClampedArray(d);
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const i = yy * w + xx,
        j = i * 4;
      if (a[i]) {
        d[j + 3] = 255;
        // Rim light: pixels on the top and left edges catch the court lights.
        if (rim && ((yy > 0 && !a[i - w]) || (xx > 0 && !a[i - 1]))) {
          d[j] = src[j] + (255 - src[j]) * 0.18;
          d[j + 1] = src[j + 1] + (255 - src[j + 1]) * 0.15;
          d[j + 2] = src[j + 2] + (255 - src[j + 2]) * 0.1;
        } else if ((yy < h - 1 && !a[i + w]) || (xx < w - 1 && !a[i + 1])) {
          // Core shadow on the bottom and right edges.
          d[j] = src[j] * 0.78;
          d[j + 1] = src[j + 1] * 0.78;
          d[j + 2] = src[j + 2] * 0.82;
        }
        continue;
      }
      // Outline pixel: a dark version of the neighbouring colour ("sel-out"), not flat black.
      const n = xx > 0 && a[i - 1] ? i - 1 : xx < w - 1 && a[i + 1] ? i + 1 : yy > 0 && a[i - w] ? i - w : yy < h - 1 && a[i + w] ? i + w : -1;
      if (n < 0) {
        d[j + 3] = 0;
        continue;
      }
      const k2 = n * 4;
      d[j] = src[k2] * 0.3 + 4;
      d[j + 1] = src[k2 + 1] * 0.3 + 4;
      d[j + 2] = src[k2 + 2] * 0.34 + 10;
      d[j + 3] = 255;
    }
  x.putImageData(im, x0, y0);
  p.spr = { cv: sp.cv, x0, y0, w, h, ox, oy, k };
}
function drawP(p, m) {
  const q = p.spr,
    g = P(p.x, p.y, 0);
  if (!q || !g) return;
  const sc = g[3] / q.k,
    fa = cl((g[2] - 6) / 6, 0, 1);
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(g[0]), Math.round(g[1]));
  c.scale(sc, m ? -sc : sc);
  c.globalAlpha = (m ? 0.28 : 1) * fa;
  c.drawImage(q.cv, q.x0, q.y0, q.w, q.h, q.x0 - q.ox, q.y0 - q.oy, q.w, q.h);
  c.restore();
}
// The ball's offset from player p in world feet [dx, dy, height], if p is holding it (or dunking it) right now.
function heldBall(p) {
  const b = G.ball;
  if (!b || !(b.own === p.id && b.mode === "held") && !(b.mode === "cut" && G.cut && G.cut.p === p)) return null;
  return [b.x - p.x, b.y - p.y, b.z];
}
// A pixel basketball of radius r at (cx, cy) on context g, seams turned by spin.
function ballPix(g, cx, cy, r, spin) {
  const ro = Math.round,
    disc = (X, Y, R, col) => {
      g.fillStyle = col;
      for (let dy = -R; dy <= R; dy++) {
        const w = Math.floor(Math.sqrt(R * R - dy * dy + R * 0.5));
        g.fillRect(X - w, Y + dy, 2 * w + 1, 1);
      }
    };
  disc(cx, cy, r + 1, "#2a0f08");
  disc(cx, cy, r, "#b5521a");
  disc(cx - 1, cy - 1, Math.max(1, r - 1), "#e8782b");
  disc(cx - ro(r * 0.3), cy - ro(r * 0.3), Math.max(1, ro(r * 0.55)), "#f59a4a");
  g.fillStyle = "#2a0f08";
  for (let t = -r; t <= r; t++)
    for (const an of [spin, spin + 1.5708]) g.fillRect(cx + ro(Math.cos(an) * t), cy + ro(Math.sin(an) * t), 1, 1);
  g.fillStyle = "#ffd9a0";
  g.fillRect(cx - ro(r * 0.45), cy - ro(r * 0.5), 1, 1);
}
function drawBall(m) {
  const b = G.ball,
    q = P(b.x, b.y, m ? -b.z : b.z);
  if (!q) return;
  const r = Math.max(3, Math.round(0.55 * q[3])),
    cx = Math.round(q[0]),
    cy = Math.round(q[1]);
  c.globalAlpha = m ? 0.3 : 1;
  if ((b.green || b.fire) && b.mode === "shot" && !m) {
    const col = b.fire ? "#ff7a1a" : "#3cff9a";
    c.globalAlpha = 0.3;
    disc0(cx, cy, r + 4, col);
    c.globalAlpha = 0.5;
    disc0(cx, cy, r + 2, col);
    c.globalAlpha = 1;
  }
  ballPix(c, cx, cy, r, b.spin);
  c.globalAlpha = 1;
}
function disc0(X, Y, R, col) {
  c.fillStyle = col;
  for (let dy = -R; dy <= R; dy++) {
    const w = Math.floor(Math.sqrt(R * R - dy * dy + R * 0.5));
    c.fillRect(X - w, Y + dy, 2 * w + 1, 1);
  }
}
