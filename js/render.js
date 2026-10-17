"use strict";
// Hoops, shadows, the per-frame render and the post-processing pass.
function hoopB(h) {
  if (OPT.court === "street") return streetHoopB(h);
  const bx = h ? 3.9 : 90.1,
    sx = h ? -4 : 98,
    hx = HX(h),
    fx = h ? bx + 0.25 : bx - 0.25,
    u = h ? [0, 1, 0] : [0, -1, 0],
    tk = TM[1 - h].k,
    V3 = (a) => a.map((v) => P(v[0], v[1], v[2]));
  seg([sx, 25, 0], [sx, 25, 10.8], 0.55, "#171d33");
  seg([sx, 25, 10.8], [bx, 25, 10.8], 0.4, "#171d33");
  seg([sx, 25, 0], [sx, 25, 4.6], 1.5, shade(tk, -0.3));
  seg([sx, 25, 0.3], [sx, 25, 4.3], 1.1, tk);
  const q = V3([
    [bx, 22, 8.8],
    [bx, 28, 8.8],
    [bx, 28, 12.3],
    [bx, 22, 12.3],
  ]);
  if (q.every(Boolean)) {
    poly(q, "rgba(170,215,255,.28)");
    c.strokeStyle = "#f3f8ff";
    c.lineWidth = Math.max(1, 0.22 * q[0][3]);
    c.stroke();
    const s = V3([
      [bx, 24.2, 9.7],
      [bx, 25.8, 9.7],
      [bx, 25.8, 11],
      [bx, 24.2, 11],
    ]);
    poly(s, "rgba(255,255,255,.06)");
    c.lineWidth = Math.max(1, 0.12 * q[0][3]);
    c.stroke();
  }
  const sc = V3([
    [fx, 23.4, 12.5],
    [fx, 26.6, 12.5],
    [fx, 26.6, 13.8],
    [fx, 23.4, 13.8],
  ]);
  poly(sc, "#140808");
  c.strokeStyle = "#3a3a44";
  c.lineWidth = 1;
  c.stroke();
  txt3(G.prac ? "--" : String(Math.ceil(G.sc)), [fx, 25, 13.15], u, [0, 0, -1], 1.05, "#ff3b2a", 1);
  seg([bx, 25, 10], [hx + (h ? -0.75 : 0.75), 25, 10], 0.2, "#ff5a2a");
}
// Street hoop: galvanised pole with a gooseneck, painted steel backboard, no shot clock.
function streetHoopB(h) {
  const bx = h ? 3.9 : 90.1,
    sx = h ? -3.2 : 97.2,
    hx = HX(h),
    s = h ? 1 : -1,
    V3 = (a) => a.map((v) => P(v[0], v[1], v[2]));
  seg([sx, 25, 0], [sx, 25, 11.6], 0.5, "#6d7480");
  seg([sx, 25, 11.6], [bx - s * 0.5, 25, 12.6], 0.42, "#6d7480");
  seg([sx, 25, 7.5], [bx - s * 0.2, 25, 9.6], 0.3, "#5f6672");
  seg([sx - s * 0.4, 25, 0.05], [sx + s * 0.4, 25, 0.05], 1.2, "#2e3138");
  const q = V3([
    [bx, 22.2, 8.9],
    [bx, 27.8, 8.9],
    [bx, 27.8, 12.4],
    [bx, 22.2, 12.4],
  ]);
  if (q.every(Boolean)) {
    poly(q, "#d7dae0");
    c.strokeStyle = "#8b919c";
    c.lineWidth = Math.max(1, 0.18 * q[0][3]);
    c.stroke();
    const sq = V3([
      [bx + s * 0.05, 24.1, 9.7],
      [bx + s * 0.05, 25.9, 9.7],
      [bx + s * 0.05, 25.9, 11.1],
      [bx + s * 0.05, 24.1, 11.1],
    ]);
    if (sq.every(Boolean)) {
      c.beginPath();
      sq.forEach((v, i) => (i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1])));
      c.closePath();
      c.strokeStyle = "#d2562a";
      c.lineWidth = Math.max(1, 0.12 * q[0][3]);
      c.stroke();
    }
  }
  seg([bx, 25, 10], [hx - s * 0.75, 25, 10], 0.2, "#d2562a");
}
function hoopF(h) {
  const hx = HX(h),
    k = G.rim[h],
    zr = 10 + Math.sin(T * 40) * k * 0.12,
    sw = Math.sin(T * 30) * k * 0.15,
    ring = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * 6.2832;
    ring.push([hx + Math.cos(a) * 0.75, 25 + Math.sin(a) * 0.75]);
  }
  const street = OPT.court === "street";
  // Street hoops have chain nets: grey, broken into links.
  c.strokeStyle = street ? "rgba(200,205,215,.9)" : "rgba(255,255,255,.7)";
  c.lineWidth = 1;
  if (street) c.setLineDash([1, 1]);
  for (let i = 0; i < 14; i++) {
    const a = ring[i],
      A = P(a[0], a[1], zr),
      B = P(hx + (a[0] - hx) * 0.55 + sw, 25 + (a[1] - 25) * 0.55, 8.7);
    if (A && B) {
      c.beginPath();
      c.moveTo(A[0], A[1]);
      c.lineTo(B[0], B[1]);
      c.stroke();
    }
  }
  c.setLineDash([]);
  ln(
    ring.map((a) => [a[0] + sw * 0.3, a[1], zr]),
    street ? "rgba(200,205,215,.7)" : "rgba(255,255,255,.6)",
    1,
  );
  const q = P(hx, 25, 10);
  ln(
    ring.map((a) => [a[0], a[1], zr]),
    "#ff5a2a",
    Math.max(1.5, q ? 0.16 * q[3] : 1.5),
  );
}
function shadow(x, y, r, a) {
  const pts = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * 6.2832;
    pts.push(P(x + Math.cos(t) * r, y + Math.sin(t) * r, 0));
  }
  poly(pts, `rgba(0,0,0,${a})`);
}
function render() {
  setV();
  c.save();
  if (G.shake > 0) {
    c.translate(Math.round(rn(-1, 1) * G.shake * 3), Math.round(rn(-1, 1) * G.shake * 3));
    G.shake = Math.max(0, G.shake - 0.03);
  }
  if (OPT.court === "street") {
    streetBg();
    fence();
    floor();
  } else {
    arena();
    jumbo();
    floor();
    beams();
  }
  const b = G.ball,
    PL = G.pl;
  for (const s of G.stain) {
    const q = P(s[0], s[1], 0);
    if (q) {
      c.fillStyle = "#5a0a12";
      c.fillRect(q[0] | 0, q[1] | 0, Math.max(1, (q[3] * 0.28 * s[2]) | 0), Math.max(1, (q[3] * 0.2) | 0));
    }
  }
  PL.forEach((p) => shadow(p.x, p.y, 1.1 - p.z * 0.1, 0.38));
  shadow(b.x, b.y, 0.55 * Math.max(0.3, 1 - b.z * 0.06), 0.3);
  if (G.run && !G.cut && !G.tip) {
    const p = PL[G.ctrl],
      tm = TM[p.t],
      pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * 6.2832;
      pts.push([p.x + Math.cos(a) * 2, p.y + Math.sin(a) * 2]);
    }
    ln(pts, tm.t, 2.2);
    ln(arc(p.x, p.y, 2.6, -1.57, -1.57 + (p.stam / 100) * 6.28), p.stam > 25 ? "#4cff9a" : "#ff5a4a", 2.2);
  }
  if (b.mode === "shot" || b.mode === "pass")
    ln(G.tr, b.green ? "rgba(60,255,150,.85)" : "rgba(255,205,130,.55)", b.green ? 3 : 2);
  PL.forEach(buildSprite);
  const fc = [
    [0, 0],
    [94, 0],
    [94, 50],
    [0, 50],
  ].map((v) => P(v[0], v[1], 0));
  c.save();
  if (fc.every(Boolean)) {
    c.beginPath();
    fc.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
    c.closePath();
    c.clip();
  }
  // Reflections on the polished hardwood only.
  if (OPT.court !== "street") {
    PL.forEach((p) => drawP(p, 1));
    drawBall(1);
  }
  c.restore();
  const ob = [];
  PL.forEach((p) => ob.push({ d: dp(p.x, p.y, 2), f: () => drawP(p, 0) }));
  ob.push({ d: dp(b.x, b.y, b.z), f: () => drawBall(0) });
  for (const h of [0, 1]) {
    ob.push({ d: dp(h ? 3.9 : 90.1, 25, 10) + 0.5, f: () => hoopB(h) });
    ob.push({ d: dp(HX(h), 25, 10) - 0.6, f: () => hoopF(h) });
  }
  ob.sort((a, b) => b.d - a.d).forEach((o) => o.f());
  if (G.run && !G.cut && b.own === G.ctrl && !G.shot) {
    const q = bestMate(PL[G.ctrl], G.in),
      a = q && P(q.x, q.y, 8.3 + Math.sin(T * 8) * 0.25);
    if (a) {
      c.fillStyle = "#ffd23c";
      c.beginPath();
      c.moveTo(a[0] - 3, a[1] - 5);
      c.lineTo(a[0] + 3, a[1] - 5);
      c.lineTo(a[0], a[1]);
      c.fill();
    }
  }
  for (const s of G.fx) {
    const q = P(s.x, s.y, s.z);
    if (q) {
      c.globalAlpha = cl(s.l * 2, 0, 1);
      c.fillStyle = s.c;
      c.fillRect(q[0] | 0, q[1] | 0, 2, 2);
    }
  }
  c.globalAlpha = 1;
  c.restore();
  post();
}
function post() {
  const st = G.style;
  X.globalCompositeOperation = "source-over";
  X.globalAlpha = 1;
  X.imageSmoothingEnabled = st === "paint";
  X.drawImage(buf, 0, 0, W, H);
  if (G.gl > 0) {
    G.gl -= 0.016;
    for (let i = 0; i < 5; i++) {
      const y = (Math.random() * H) | 0,
        h = (8 + Math.random() * 30) | 0;
      X.drawImage(cv, 0, y, W, h, (Math.random() - 0.5) * 40, y, W, h);
    }
  }
  if (st === "paint" || st === "neon") {
    X.save();
    X.globalCompositeOperation = "lighter";
    X.globalAlpha = st === "neon" ? 0.6 : 0.12;
    X.filter = "blur(" + (st === "neon" ? 10 : 14) + "px)";
    X.drawImage(buf, 0, 0, W, H);
    X.restore();
  }
  if (st === "paint") {
    const v = X.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
    v.addColorStop(0, "rgba(255,200,140,0)");
    v.addColorStop(1, "rgba(20,8,24,.55)");
    X.fillStyle = v;
    X.fillRect(0, 0, W, H);
    X.globalAlpha = 0.05;
    for (let i = 0; i < 90; i++) {
      X.fillStyle = i % 2 ? "#fff" : "#000";
      X.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    X.globalAlpha = 1;
  }
  if (st === "pixel" || st === "neon") {
    X.fillStyle = "rgba(0,0,0,.14)";
    for (let y = 0; y < H; y += 4) X.fillRect(0, y, W, 1);
  }
  if (G.gf > 0) {
    const v = X.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
    v.addColorStop(0, "rgba(60,255,150,0)");
    v.addColorStop(1, `rgba(60,255,150,${G.gf * 0.35})`);
    X.fillStyle = v;
    X.fillRect(0, 0, W, H);
    G.gf = Math.max(0, G.gf - 0.03);
  }
  if (G.flash > 0) {
    X.fillStyle = `rgba(255,255,255,${G.flash})`;
    X.fillRect(0, 0, W, H);
    G.flash = Math.max(0, G.flash - 0.035);
  }
  nameTag();
}
// The player you control gets their name floating above their head. Nobody else is named.
function nameTag() {
  if (!G.run || G.cut || G.tip) return;
  const p = G.pl[G.ctrl];
  if (!p || p.t !== 0) return;
  const q = P(p.x, p.y, p.z + 7.4);
  if (!q) return;
  const sx = W / RW,
    sy = H / RH,
    x = Math.round(q[0] * sx),
    y = Math.round(q[1] * sy),
    name = NM[p.id][0],
    fs = Math.round(cl(H / 52, 11, 16));
  X.save();
  X.font = `700 ${fs}px Bahnschrift, "DIN Alternate", "Arial Narrow", system-ui, sans-serif`;
  X.textAlign = "center";
  X.textBaseline = "alphabetic";
  const w = X.measureText(name).width + fs;
  X.globalAlpha = 0.82;
  X.fillStyle = "#0a0f1e";
  X.fillRect(x - w / 2, y - fs - 6, w, fs + 10);
  X.globalAlpha = 1;
  X.fillStyle = TM[0].t === "#ffffff" ? TM[0].j : lite(TM[0].t);
  X.fillRect(x - w / 2, y + 3, w, 2);
  X.fillStyle = "#fff";
  X.fillText(name, x, y);
  X.restore();
}
