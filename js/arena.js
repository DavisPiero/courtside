"use strict";
// The arena: crowd, stands, lights, jumbotron and court floor.
// ---------- arena
const crowd = [];
(function () {
  const cols = ["#8a3a3a", "#33508f", "#a8843a", "#7d869e", "#5a429c", "#2f3752", "#a79f8f", "#a85a2a"];
  const add = (x, y, z) =>
    crowd.push({ x, y, z, c: cols[(Math.random() * 8) | 0], p: rn(0, 6), k: (Math.random() * 6) | 0 });
  for (let k = 6; k >= 0; k--)
    for (let r = 1; r >= 0; r--) {
      const o = 7 + k * 3.4 + r * 0.9,
        z = 2.2 + k * 2.6 + r * 0.7;
      for (let x = -12; x < 106; x += 1.1) {
        add(x + rn(0, 0.7), -o, z);
        add(x + rn(0, 0.7), 50 + o, z);
      }
      for (let y = -8; y < 58; y += 1.1) {
        add(-o, y + rn(0, 0.7), z);
        add(94 + o, y + rn(0, 0.7), z);
      }
    }
})();
const BD = [
  [
    [-3, 53],
    [97, 53],
  ],
  [
    [97, 53],
    [97, -3],
  ],
  [
    [97, -3],
    [-3, -3],
  ],
  [
    [-3, -3],
    [-3, 53],
  ],
];
function arena() {
  const S = ST[G.style];
  let g = c.createLinearGradient(0, 0, 0, RH);
  g.addColorStop(0, S.bg);
  g.addColorStop(1, "#1b2146");
  c.fillStyle = g;
  c.fillRect(0, 0, RW, RH);
  const sf = G.style === "neon" ? "#070a1c" : "#0c1128";
  for (const q of [
    [
      [-14, -7, 0],
      [108, -7, 0],
      [108, -31, 19],
      [-14, -31, 19],
    ],
    [
      [-14, 57, 0],
      [108, 57, 0],
      [108, 81, 19],
      [-14, 81, 19],
    ],
    [
      [-7, -14, 0],
      [-7, 64, 0],
      [-31, 64, 19],
      [-31, -14, 19],
    ],
    [
      [101, -14, 0],
      [101, 64, 0],
      [125, 64, 19],
      [125, -14, 19],
    ],
  ])
    poly(
      q.map((v) => P(v[0], v[1], v[2])),
      sf,
    );
  const bob = 0.3 + G.hype * 1.4;
  for (const s of crowd) {
    const q = P(s.x, s.y, s.z + Math.max(0, Math.sin(T * (2.5 + (s.p % 3)) + s.p * 7)) * 0.3 * bob);
    if (!q) continue;
    const w = Math.min(5, Math.max(1.5, q[3] * 0.8)) | 0 || 1,
      x = q[0] | 0,
      y = q[1] | 0;
    c.globalAlpha = cl(1.1 - q[2] / 140, 0.4, 0.95);
    c.fillStyle = s.c;
    c.fillRect((x - w / 2) | 0, y - w, w + 1, w);
    c.fillStyle = SK[s.k];
    c.fillRect(
      ((x - w / 2) | 0) + (w > 2 ? 1 : 0),
      y - w - ((w * 0.7) | 0),
      Math.max(1, w - 1),
      Math.max(1, (w * 0.7) | 0),
    );
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 4 + G.hype * 14; i++) {
    const s = crowd[(Math.random() * crowd.length) | 0],
      q = P(s.x, s.y, s.z + 1.5);
    if (q) {
      c.fillStyle = "#fff";
      c.fillRect(q[0] | 0, q[1] | 0, 2, 2);
    }
  }
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 22; i++) {
    for (const y of [-16, 66]) {
      const q = P(i * 5 - 6, y, 40);
      if (q) {
        c.fillStyle = i % 3 ? "rgba(255,225,160,.35)" : "rgba(120,170,255,.35)";
        c.beginPath();
        c.arc(q[0], q[1], cl(q[3] * 1.6, 2, 14), 0, 7);
        c.fill();
      }
    }
  }
  c.globalCompositeOperation = "source-over";
  const cs = ["#ffcf5c", lite(TM[0].t), lite(TM[1].t)],
    tx = ["COURTSIDE", TM[0].n, TM[1].n];
  BD.forEach(([a, b]) => {
    const L = hy(b[0] - a[0], b[1] - a[1]),
      ux = (b[0] - a[0]) / L,
      uy = (b[1] - a[1]) / L;
    poly(
      [
        [a[0], a[1], 0],
        [b[0], b[1], 0],
        [b[0], b[1], 2.4],
        [a[0], a[1], 2.4],
      ].map((v) => P(v[0], v[1], v[2])),
      "#0d1330",
    );
    for (let i = 0; i < 3; i++) {
      const m = L * (0.2 + i * 0.3),
        o = [a[0] + ux * m, a[1] + uy * m, 1.2];
      txt3(tx[i], o, [ux, uy, 0], [0, 0, -1], 1.5, cs[i], 0.95);
    }
  });
}
const LPS = [15, 47, 79].flatMap((x) => [8, 42].map((y) => [x, y])),
  LP = (x, y) => {
    let q = 0;
    for (const l of LPS) q += Math.exp(-((x - l[0]) ** 2 + (y - l[1]) ** 2) / 70);
    return q * 0.1;
  };
const clockStr = () => Math.floor(G.time / 60) + ":" + String(Math.floor(G.time % 60)).padStart(2, "0");
function beams() {
  c.save();
  c.globalCompositeOperation = "lighter";
  for (const l of LPS) {
    const a = P(l[0], l[1], 42),
      f = P(l[0], l[1], 0);
    if (!a || !f || a[2] < 30 || f[3] * 7 > RW * 0.5) continue;
    const w = f[3] * 7,
      g = c.createLinearGradient(a[0], a[1], f[0], f[1]);
    g.addColorStop(0, `rgba(255,235,190,${Math.min(0.07, a[2] / 900)})`);
    g.addColorStop(1, "rgba(255,235,190,0)");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(a[0] - 2, a[1]);
    c.lineTo(a[0] + 2, a[1]);
    c.lineTo(f[0] + w, f[1]);
    c.lineTo(f[0] - w, f[1]);
    c.closePath();
    c.fill();
  }
  c.restore();
}
function jumbo() {
  const cx = 47,
    cy = 25,
    z0 = 26,
    z1 = 33,
    r = 8,
    face = (a, b, u, nx, ny) => {
      if ((V.x - a[0]) * nx + (V.y - a[1]) * ny <= 0 || Fx * nx + Fy * ny > -0.2) return;
      poly(
        [
          [a[0], a[1], z0],
          [b[0], b[1], z0],
          [b[0], b[1], z1],
          [a[0], a[1], z1],
        ].map((v) => P(v[0], v[1], v[2])),
        "#080d20",
      );
      c.strokeStyle = "#3d6dff";
      c.lineWidth = 1;
      c.stroke();
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      txt3(
        TM[0].c + "  " + G.home + " - " + G.away + "  " + TM[1].c,
        [m[0], m[1], z1 - 2.2],
        u,
        [0, 0, -1],
        2.6,
        "#ffcf5c",
        1,
      );
      txt3(
        G.prac ? "PRACTICE" : "Q" + G.q + "   " + clockStr(),
        [m[0], m[1], z0 + 2.2],
        u,
        [0, 0, -1],
        2.3,
        "#ff5a4a",
        1,
      );
    };
  face([cx - r, cy - r], [cx + r, cy - r], [1, 0, 0], 0, -1);
  face([cx + r, cy + r], [cx - r, cy + r], [-1, 0, 0], 0, 1);
  face([cx - r, cy + r], [cx - r, cy - r], [0, -1, 0], -1, 0);
  face([cx + r, cy - r], [cx + r, cy + r], [0, 1, 0], 1, 0);
  seg([cx - 4, cy - 4, 33], [cx - 4, cy - 4, 50], 0.2, "#222a44");
  seg([cx + 4, cy + 4, 33], [cx + 4, cy + 4, 50], 0.2, "#222a44");
}
function floor() {
  const x0 = -6,
    y0 = -6,
    nx = 53,
    ny = 31,
    Vt = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) Vt.push(P(x0 + i * 2, y0 + j * 2, 0));
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = Vt[j * 54 + i],
        b = Vt[j * 54 + i + 1],
        d = Vt[j * 54 + 54 + i],
        e = Vt[j * 54 + 55 + i];
      if (!a || !b || !d || !e) continue;
      const x = x0 + i * 2 + 1,
        y = y0 + j * 2 + 1,
        inb = x > 0 && x < 94 && y > 0 && y < 50,
        L = Math.min(
          1.05,
          0.5 + 0.55 * Math.exp(-((x - cfx) ** 2 + (y - cfy) ** 2) / 650) * (1 + G.flash * 0.3) + LP(x, y),
        ),
        key = (x < 19 || x > 75) && y > 17 && y < 33,
        n = 1 + (((i * 7 + j * 13) % 5) - 2) * 0.028,
        w = key ? KC[x > 47 ? 0 : 1] : hy(x - 47, y - 25) < 6 ? KC[0] : !inb ? KD : j & 1 ? wA : wB;
      c.fillStyle = `rgb(${(w[0] * L * n) | 0},${(w[1] * L * n) | 0},${(w[2] * L * n) | 0})`;
      c.strokeStyle = c.fillStyle;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
      c.lineTo(e[0], e[1]);
      c.lineTo(d[0], d[1]);
      c.closePath();
      c.fill();
      c.stroke();
    }
  c.strokeStyle = "rgba(60,30,10,.22)";
  c.lineWidth = 1;
  for (let j = 0; j <= ny; j++) {
    c.beginPath();
    let on = 0;
    for (let i = 0; i <= nx; i++) {
      const q = Vt[j * 54 + i];
      if (!q) {
        on = 0;
        continue;
      }
      on ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]);
      on = 1;
    }
    c.stroke();
  }
  const lw = Math.max(1, RH / 150),
    Ln = (p) => ln(p, ST[G.style].l, lw);
  Ln([
    [0, 0],
    [94, 0],
    [94, 50],
    [0, 50],
    [0, 0],
  ]);
  Ln([
    [47, 0],
    [47, 50],
  ]);
  Ln(arc(47, 25, 6, 0, 6.3));
  for (const e of [0, 94]) {
    const s = e ? -1 : 1,
      a = s > 0 ? 0 : Math.PI;
    Ln([
      [e, 17],
      [e + s * 19, 17],
      [e + s * 19, 33],
      [e, 33],
    ]);
    Ln(arc(e + s * 19, 25, 6, 0, 6.3));
    Ln([
      [e, 3],
      [e + s * 14.2, 3],
    ]);
    Ln([
      [e, 47],
      [e + s * 14.2, 47],
    ]);
    Ln(arc(e + s * 5.25, 25, 23.75, a - 1.185, a + 1.185, 34));
    Ln(arc(e + s * 5.25, 25, 4, a - 1.57, a + 1.57));
  }
}
