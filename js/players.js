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
const HST = [1, 0, 2, 1, 2, 0],
  BRD = [0, 1, 0, 1, 0, 1],
  BND = [1, 0, 0, 0, 1, 0],
  SLV = [0, 1, 1, 0, 0, 1];
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
const SPN = [0, 1, 2, 3, 4, 5].map(() => {
  const v = document.createElement("canvas");
  v.width = 128;
  v.height = 256;
  return { cv: v, x: v.getContext("2d", { willReadFrequently: true }) };
});
// Characters are real pixel sprites: the skeleton is drawn with flat-capped blocks (no round shapes) into a small canvas at screen pixel density,
// alpha is hard-thresholded, a 1px outline is stamped around it, then it is blitted 1:1 into the world (and mirrored for the floor reflection).
function buildSprite(p) {
  const sp = SPN[p.id],
    x = sp.x,
    tm = TM[p.t],
    g = P(p.x, p.y, 0);
  p.spr = null;
  if (!g || g[2] < 6) return;
  const k = Math.round(cl(g[3], 7, 15)),
    ox = 64,
    oy = 232,
    f = p.f,
    cf = Math.cos(f),
    sf = Math.sin(f),
    spd = hy(p.vx, p.vy),
    run = cl(spd / 13, 0, 1.3),
    fb = cf * Fx + sf * Fy,
    vis = Math.abs(fb),
    fsx = cf * Rx + sf * Ry,
    b = G.ball,
    air = p.z > 0.3,
    hold = b.own === p.id && b.mode === "held",
    rg = p.rag,
    ra = rg
      ? (rg.t < 0.3 ? sm(rg.t / 0.3) : rg.t > rg.d - 0.6 ? sm(cl((rg.d - rg.t) / 0.6, 0, 1)) : 1) * 1.5
      : p.sl
        ? (p.sl.t < 0.1
            ? sm(p.sl.t / 0.1)
            : p.sl.t > p.sl.d - 0.22
              ? sm(cl((p.sl.d - p.sl.t) / 0.22, 0, 1))
              : 1) * 1.15
        : 0;
  const hz =
      3 -
      (p.def ? 0.55 : 0) -
      (G.shot && G.shot.p === p ? 0.3 : 0) -
      (hold && !G.shot ? 0.15 : 0) +
      Math.sin(p.ph * 2) * 0.05 * run,
    s1 = Math.sin(p.ph),
    c1 = Math.cos(p.ph),
    kk = run * 1.15,
    lean = 0.3 * run + (hold ? 0.2 : 0) + (p.pun > 0 ? 0.4 : 0);
  let fL = [s1 * kk, 0.5, Math.max(0, c1) * 0.8 * run],
    fR = [-s1 * kk, -0.5, Math.max(0, -c1) * 0.8 * run];
  if (p.def) {
    fL = [0.2 + s1 * 0.3 * run, 1.3, 0];
    fR = [-0.2 - s1 * 0.3 * run, -1.3, 0];
  }
  if (air) {
    fL = [0.6, 0.5, 1.2];
    fR = [-0.4, -0.5, 0.6];
  }
  const hL = [0, 0.45, hz],
    hR = [0, -0.45, hz],
    sL = [lean, 0.95, hz + 2.2],
    sR = [lean, -0.95, hz + 2.2];
  let aL = [-s1 * kk * 0.9, 1.15, hz + 0.2 + run * 0.8],
    aR = [s1 * kk * 0.9, -1.15, hz + 0.2 + run * 0.8];
  if (p.def) {
    aL = [0.9, 2.2, hz + 1.7];
    aR = [0.9, -2.2, hz + 1.7];
  }
  if (hold) {
    if (G.shot && G.shot.p === p) {
      aL = [0.7, 0.3, hz + 4.9];
      aR = [0.7, -0.3, hz + 4.9];
    } else {
      const dx = b.x - p.x,
        dy = b.y - p.y;
      aR = [dx * cf + dy * sf, -dx * sf + dy * cf, Math.min(b.z - p.z + 0.3, hz + 2.6)];
      aL = [0.7, 1.3, hz + 1.3];
    }
  }
  if (p.fol > 0) {
    aL = [0.8, 0.2, hz + 5.3];
    aR = [0.8, -0.2, hz + 5.3];
  }
  if (p.stt === "cel") {
    aL = [0, 1.6, hz + 4.4];
    aR = [0, -1.6, hz + 4.4];
  }
  if (p.pun > 0 && !rg) {
    aR = [2.4, -0.2, hz + 2.3];
    aL = [0.2, 1, hz + 1.6];
  }
  if (rg) {
    aL = [-0.3, 1.7, hz + 1.2];
    aR = [-0.3, -1.7, hz + 1.2];
    fL = [0.4, 0.7, 0.4];
    fR = [-0.1, -0.7, 0.2];
  }
  if (p.sl && !rg) {
    aL = [-0.7, 1.5, hz + 0.4];
    aR = [-0.7, -1.5, hz + 0.4];
    fL = [1.7, 0.35, 0.3];
    fR = [0.8, -0.5, 1];
  }
  if (p.hw) {
    const dx = p.hw[0] - p.x,
      dy = p.hw[1] - p.y;
    aR = [dx * cf + dy * sf, -dx * sf + dy * cf, p.hw[2] - p.z];
    aL = p.hw2 ? [aR[0], aR[1] + 0.35, aR[2]] : [0.6, 1.1, hz + 3.8];
  }
  const [eL, wL] = ik(sL, aL, 1.15, 1.15, [-0.3, 0.9, -0.6]),
    [eR, wR] = ik(sR, aR, 1.15, 1.15, [-0.3, -0.9, -0.6]),
    [kL, ftL] = ik(hL, fL, 1.6, 1.6, [1, 0.1, 0]),
    [kR, ftR] = ik(hR, fR, 1.6, 1.6, [1, -0.1, 0]);
  x.clearRect(0, 0, 128, 256);
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
    if (ra) {
      const zz = z0 - hz,
        cc = Math.cos(ra),
        ss = Math.sin(ra);
      x0 = v[0] * cc - zz * ss;
      z0 = v[0] * ss + zz * cc + hz - (hz - 0.45) * ss;
    }
    const rx = x0 * cf - v[1] * sf,
      ry = x0 * sf + v[1] * cf,
      z = z0 + p.z;
    return [ox + (rx * Rx + ry * Ry) * k, oy - (rx * Ux + ry * Uy + z * Uz) * k, rx * Fx + ry * Fy + z * Fz];
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
      it.push({ A, B, w: w * k, col, d: (A[2] + B[2]) / 2 - (bias || 0) });
    },
    mid = (a, q, t) => [lp(a[0], q[0], t), lp(a[1], q[1], t), lp(a[2], q[2], t)];
  const sk = p.sk,
    hr = ["#16100d", "#2a1a10", "#0b0b0b"][p.id % 3],
    hc = [lean + 0.12, 0, hz + 3.3],
    hs = HST[p.id];
  for (const [h, kn, ft, sd] of [
    [hL, kL, ftL, 1],
    [hR, kR, ftR, -1],
  ]) {
    const th = mid(h, kn, 0.62),
      cf2 = mid(kn, ft, 0.5);
    add(h, th, 0.9, tm.s);
    add(th, kn, 0.58, sk);
    add([h[0], h[1] + sd * 0.55, h[2] + 0.1], [th[0], th[1] + sd * 0.55, th[2]], 0.16, tm.t, 0.3);
    add(kn, cf2, 0.6, sk);
    add(cf2, ft, 0.56, "#f3f3f3");
    add([ft[0], ft[1], ft[2] + 0.5], [ft[0], ft[1], ft[2] + 0.05], 0.5, tm.j);
    add(ft, [ft[0] + 0.8, ft[1], ft[2] - 0.02], 0.62, tm.j);
    add([ft[0], ft[1], ft[2] - 0.28], [ft[0] + 0.8, ft[1], ft[2] - 0.28], 0.16, "#f4f4f4", 0.2);
    add([ft[0] + 0.15, ft[1], ft[2] + 0.2], [ft[0] + 0.7, ft[1], ft[2] + 0.22], 0.34, tm.t, 0.1);
  }
  add([0, 0, hz + 0.3], [0, 0, hz - 0.3], 1.1 + 0.5 * vis, tm.s);
  const tp = [];
  for (const sx of [-1, 1])
    for (const dx of [-1, 1])
      tp.push(pj([lean + dx * 0.45, sx * 0.95, hz + 2.3]), pj([dx * 0.38, sx * 0.68, hz + 0.15]));
  const th2 = hull(tp.map((q) => [q[0], q[1]])),
    pa = [pj([lean, 0.95, hz + 2.25]), pj([0, 0.68, hz + 0.12])],
    pb = [pj([lean, -0.95, hz + 2.25]), pj([0, -0.68, hz + 0.12])],
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
      quad(pa[0], pa[1], Math.max(1.5, 0.15 * k), tm.t);
      quad(pb[0], pb[1], Math.max(1.5, 0.15 * k), tm.t);
      if (vis > 0.45) {
        x.fillStyle = tm.t;
        x.font = "900 " + 1.25 * k + "px sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(p.n, nm[0], nm[1]);
      }
    },
  });
  for (const [s0, e, w] of [
    [sL, eL, wL],
    [sR, eR, wR],
  ]) {
    add(s0, e, 0.56, sk);
    add(e, w, 0.46, sk);
    if (SLV[p.id]) add(mid(s0, e, 0.35), e, 0.62, "#f1f1f1", 0.1);
    add(mid(e, w, 0.62), w, 0.5, "#f1f1f1", 0.1);
    const W = pj(w);
    it.push({ d: W[2] - 0.15, fn: () => blk(W[0], W[1], 0.46 * k, 0.46 * k, sk) });
  }
  add([lean, 0, hz + 2.3], [lean + 0.1, 0, hz + 2.95], 0.46, shade(sk, -0.12));
  const H = pj(hc);
  it.push({
    d: H[2] - 0.5,
    fn: () => {
      const w = 0.86 * k,
        h = 0.95 * k,
        cx = H[0],
        cy = H[1],
        sx = Math.abs(fsx) > 0.25 ? Math.sign(fsx) : 0;
      blk(cx, cy + h * 0.04, w, h, sk);
      if (fb > 0.3) blk(cx, cy - h * 0.06, w + 2, h * 0.9, hr);
      else {
        blk(cx, cy - h * 0.34, w + 2, h * 0.4, hr);
        if (sx) blk(cx - sx * w * 0.3, cy - h * 0.02, w * 0.45, h * 0.7, hr);
      }
      if (hs === 1) {
        blk(cx - w * 0.38, cy - h * 0.56, w * 0.34, h * 0.24, hr);
        blk(cx, cy - h * 0.64, w * 0.4, h * 0.26, hr);
        blk(cx + w * 0.38, cy - h * 0.56, w * 0.34, h * 0.24, hr);
      }
      if (fb < -0.25) {
        x.fillStyle = "#160c0c";
        const ex = Math.max(1, Math.round(k * 0.1)),
          ey = Math.max(1, Math.round(k * 0.14)),
          off = Math.round(w * 0.22),
          sh2 = Math.round(fsx * w * 0.12);
        x.fillRect(Math.round(cx - off + sh2), Math.round(cy), ex, ey);
        x.fillRect(Math.round(cx + off + sh2) - ex + 1, Math.round(cy), ex, ey);
        if (BRD[p.id]) blk(cx, cy + h * 0.3, w * 0.8, h * 0.3, hr);
      }
      if (BND[p.id]) blk(cx, cy - h * 0.2, w + 2, Math.max(1.5, k * 0.17), tm.t);
    },
  });
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
    w = Math.min(128, Math.ceil(X1) + 3) - x0,
    h = Math.min(256, Math.ceil(Y1) + 3) - y0;
  if (w < 3 || h < 3) return;
  const im = x.getImageData(x0, y0, w, h),
    d = im.data,
    o = pc(ST[G.style].o),
    a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] >= 100 ? 1 : 0;
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const i = yy * w + xx,
        j = i * 4;
      if (a[i]) d[j + 3] = 255;
      else if (
        (xx > 0 && a[i - 1]) ||
        (xx < w - 1 && a[i + 1]) ||
        (yy > 0 && a[i - w]) ||
        (yy < h - 1 && a[i + w])
      ) {
        d[j] = o[0];
        d[j + 1] = o[1];
        d[j + 2] = o[2];
        d[j + 3] = 255;
      } else d[j + 3] = 0;
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
function drawBall(m) {
  const b = G.ball,
    q = P(b.x, b.y, m ? -b.z : b.z);
  if (!q) return;
  const r = Math.max(3, Math.round(0.55 * q[3])),
    cx = Math.round(q[0]),
    cy = Math.round(q[1]),
    ro = Math.round;
  const disc = (X, Y, R, col) => {
    c.fillStyle = col;
    for (let dy = -R; dy <= R; dy++) {
      const w = Math.floor(Math.sqrt(R * R - dy * dy + R * 0.5));
      c.fillRect(X - w, Y + dy, 2 * w + 1, 1);
    }
  };
  c.globalAlpha = m ? 0.3 : 1;
  if (b.green && b.mode === "shot" && !m) {
    c.globalAlpha = 0.3;
    disc(cx, cy, r + 4, "#3cff9a");
    c.globalAlpha = 0.5;
    disc(cx, cy, r + 2, "#3cff9a");
    c.globalAlpha = 1;
  }
  disc(cx, cy, r + 1, "#2a0f08");
  disc(cx, cy, r, "#b5521a");
  disc(cx - 1, cy - 1, Math.max(1, r - 1), "#e8782b");
  disc(cx - ro(r * 0.3), cy - ro(r * 0.3), Math.max(1, ro(r * 0.55)), "#f59a4a");
  c.fillStyle = "#2a0f08";
  for (let t = -r; t <= r; t++)
    for (const an of [b.spin, b.spin + 1.5708])
      c.fillRect(cx + ro(Math.cos(an) * t), cy + ro(Math.sin(an) * t), 1, 1);
  c.fillStyle = "#ffd9a0";
  c.fillRect(cx - ro(r * 0.45), cy - ro(r * 0.5), 1, 1);
  c.globalAlpha = 1;
}
