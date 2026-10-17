"use strict";
// 3D projection: court units are feet (x length 0-94, y width 0-50, z up).
// ---------- 3D projection (court units are feet: x length 0-94, y width 0-50, z up)
function setV() {
  const cp = Math.cos(V.p),
    sp = Math.sin(V.p),
    cy = Math.cos(V.yaw),
    sy = Math.sin(V.yaw);
  Fx = cp * cy;
  Fy = cp * sy;
  Fz = -sp;
  Rx = sy;
  Ry = -cy;
  Ux = Ry * Fz;
  Uy = -Rx * Fz;
  Uz = Rx * Fy - Ry * Fx;
  FL = RH * V.fl;
}
function P(x, y, z) {
  const dx = x - V.x,
    dy = y - V.y,
    dz = z - V.z,
    d = dx * Fx + dy * Fy + dz * Fz;
  if (d < 0.5) return null;
  const s = FL / d;
  return [RW / 2 + (dx * Rx + dy * Ry) * s, RH / 2 - (dx * Ux + dy * Uy + dz * Uz) * s, d, s];
}
function seg(a, b, w, col) {
  const A = P(a[0], a[1], a[2]),
    B = P(b[0], b[1], b[2]);
  if (!A || !B) return;
  c.strokeStyle = col;
  c.lineWidth = Math.max(1, (w * (A[3] + B[3])) / 2);
  c.lineCap = "butt";
  c.beginPath();
  c.moveTo(A[0], A[1]);
  c.lineTo(B[0], B[1]);
  c.stroke();
}
function poly(pts, fill) {
  if (pts.some((q) => !q)) return;
  c.beginPath();
  pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}
function ln(pts, col, w) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.lineCap = "butt";
  c.beginPath();
  let on = 0;
  for (const p of pts) {
    const q = P(p[0], p[1], p[2] || 0);
    if (!q) {
      on = 0;
      continue;
    }
    on ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]);
    on = 1;
  }
  c.stroke();
}
const arc = (cx, cy, r, a0, a1, n = 26) => {
  const o = [];
  for (let i = 0; i <= n; i++) {
    const a = lp(a0, a1, i / n);
    o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return o;
};
function txt3(s, o, u, v, sz, col, al) {
  const a = P(o[0], o[1], o[2]),
    b = P(o[0] + u[0], o[1] + u[1], o[2] + u[2]),
    d = P(o[0] + v[0], o[1] + v[1], o[2] + v[2]);
  if (
    !a ||
    !b ||
    !d ||
    a[2] < 8 ||
    hy(b[0] - a[0], b[1] - a[1]) > RH * 0.2 ||
    hy(d[0] - a[0], d[1] - a[1]) > RH * 0.2
  )
    return;
  const k = sz / 10;
  c.save();
  c.transform((b[0] - a[0]) * k, (b[1] - a[1]) * k, (d[0] - a[0]) * k, (d[1] - a[1]) * k, a[0], a[1]);
  c.globalAlpha = al;
  c.fillStyle = col;
  c.font = "900 10px sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(s, 0, 0);
  c.restore();
}
