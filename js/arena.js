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
  if (SET.lighting !== "high") return;
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
// Street court colours: asphalt in bounds, concrete outside, keys painted in faded team colours.
const ASPH = [[58, 64, 80], [55, 61, 77]],
  CONC = [84, 87, 95],
  fade = (k) => k.map((v, i) => (v * 0.5 + ASPH[0][i] * 0.5) | 0);
const FOG = { arena: [26, 30, 58], street: [104, 78, 112] };
// A haze band over the background (crowd and stands, or the skyline) so the court pops.
function fogBand() {
  if (!SET.fog) return;
  const street = OPT.court === "street",
    far = P(V.x + Math.cos(V.yaw) * 3000, V.y + Math.sin(V.yaw) * 3000, 0),
    hz = far ? cl(far[1], -RH, RH * 2) : RH * 0.4,
    F = street ? FOG.street : FOG.arena,
    g = c.createLinearGradient(0, hz - RH * 0.55, 0, hz + RH * 0.05);
  g.addColorStop(0, `rgba(${F},0)`);
  g.addColorStop(0.7, `rgba(${F},${street ? 0.45 : 0.4})`);
  g.addColorStop(1, `rgba(${F},${street ? 0.6 : 0.5})`);
  c.fillStyle = g;
  c.fillRect(0, 0, RW, RH);
}
// Street lamps throw warm pools of light on the asphalt (Dramatic lighting only).
function lampPools() {
  if (SET.lighting !== "high") return;
  c.save();
  c.globalCompositeOperation = "lighter";
  for (const [x, y] of [[-5, -5], [99, 55], [-5, 55], [99, -5]]) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * 6.2832;
      pts.push(P(x + Math.cos(t) * 16, y + Math.sin(t) * 16, 0));
    }
    if (pts.some((q) => !q)) continue;
    poly(pts, "rgba(255,170,90,.07)");
    const inner = pts.map((q, i) => {
      const t = (i / 16) * 6.2832;
      return P(x + Math.cos(t) * 8, y + Math.sin(t) * 8, 0);
    });
    if (inner.every(Boolean)) poly(inner, "rgba(255,190,120,.08)");
  }
  c.restore();
}
function floor() {
  const street = OPT.court === "street",
    x0 = -6,
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
        L = street
          ? 0.82 + 0.2 * Math.exp(-((x - cfx) ** 2 + (y - cfy) ** 2) / 900)
          : Math.min(
              1.05,
              SET.lighting === "high"
                ? 0.5 + 0.55 * Math.exp(-((x - cfx) ** 2 + (y - cfy) ** 2) / 650) * (1 + G.flash * 0.3) + LP(x, y)
                : 0.82 + G.flash * 0.15,
            ),
        key = (x < 19 || x > 75) && y > 17 && y < 33,
        n = street ? 1 + ((((i * 73856093) ^ (j * 19349663)) >>> 0) % 7 - 3) * 0.012 : 1 + (((i * 7 + j * 13) % 5) - 2) * 0.028,
        w = street
          ? key
            ? fade(KC[x > 47 ? 0 : 1])
            : hy(x - 47, y - 25) < 6
              ? fade(KC[0])
              : !inb
                ? CONC
                : ASPH[0]
          : key
            ? KC[x > 47 ? 0 : 1]
            : hy(x - 47, y - 25) < 6
              ? KC[0]
              : !inb
                ? KD
                : j & 1
                  ? wA
                  : wB;
      // Depth fog: far tiles fade toward the haze colour.
      const fg = SET.fog ? cl((a[2] - 28) / 120, 0, 0.5) : 0,
        F = street ? FOG.street : FOG.arena;
      c.fillStyle = `rgb(${lp(w[0] * L * n, F[0], fg) | 0},${lp(w[1] * L * n, F[1], fg) | 0},${lp(w[2] * L * n, F[2], fg) | 0})`;
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
  // Board seams on the hardwood only.
  for (let j = 0; j <= ny && !street; j++) {
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
    Ln = (p) => ln(p, street ? "rgba(236,232,220,.85)" : ST[G.style].l, lw);
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

// ---------- street court: dusk sky, city skyline, chain-link fence, asphalt, pole hoops with chain nets
const FENCE = { x0: -7, x1: 101, y0: -7, y1: 57, h: 12 };
// Skyline: blocks of buildings on all four sides, well outside the fence. Fixed seed so it never changes.
const SKY = [];
(function () {
  let sd = 7;
  const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const add = (x, y, w, d, h) => {
    const win = [];
    for (let i = 0; i < 26; i++) win.push([r(), r(), r() < 0.45]);
    SKY.push({ x, y, w, d, h, c: ["#1c2240", "#232a4c", "#191d36", "#2a2f52"][(r() * 4) | 0], win });
  };
  for (let x = -70; x < 170; x += 16 + r() * 10) {
    add(x, -60 - r() * 25, 12 + r() * 10, 12, 25 + r() * 60);
    add(x, 98 + r() * 25, 12 + r() * 10, 12, 25 + r() * 60);
  }
  for (let y = -40; y < 90; y += 16 + r() * 10) {
    add(-70 - r() * 25, y, 12, 12 + r() * 10, 25 + r() * 60);
    add(152 + r() * 25, y, 12, 12 + r() * 10, 25 + r() * 60);
  }
})();
function streetBg() {
  // Sky above the horizon, ground below it.
  const far = P(V.x + Math.cos(V.yaw) * 3000, V.y + Math.sin(V.yaw) * 3000, 0),
    hz = far ? cl(far[1], -RH, RH * 2) : RH * 0.4,
    g = c.createLinearGradient(0, hz - RH * 0.7, 0, hz);
  g.addColorStop(0, "#151c45");
  g.addColorStop(0.65, "#5b3c6e");
  g.addColorStop(1, "#e3825c");
  c.fillStyle = g;
  c.fillRect(0, 0, RW, Math.max(0, hz + 1));
  c.fillStyle = "#3b3e48";
  c.fillRect(0, Math.max(0, hz), RW, RH);
  // Buildings: draw the faces that point at the camera, far ones first.
  const bs = SKY.map((b) => ({ b, d: dp(b.x + b.w / 2, b.y + b.d / 2, 0) })).sort((a, q) => q.d - a.d);
  for (const { b } of bs) {
    const faces = [
      [[b.x, b.y], [b.x + b.w, b.y], 0, -1],
      [[b.x + b.w, b.y + b.d], [b.x, b.y + b.d], 0, 1],
      [[b.x, b.y + b.d], [b.x, b.y], -1, 0],
      [[b.x + b.w, b.y], [b.x + b.w, b.y + b.d], 1, 0],
    ];
    for (const [a, e, nx, ny] of faces) {
      if ((V.x - a[0]) * nx + (V.y - a[1]) * ny <= 0) continue;
      const q = [P(a[0], a[1], 0), P(e[0], e[1], 0), P(e[0], e[1], b.h), P(a[0], a[1], b.h)];
      if (q.some((v) => !v)) continue;
      poly(q, nx ? shade(b.c, -0.25) : b.c);
      c.fillStyle = "#ffcf7a";
      for (const [u, v, on] of b.win) {
        if (!on) continue;
        const w = P(lp(a[0], e[0], 0.1 + u * 0.8), lp(a[1], e[1], 0.1 + u * 0.8), 4 + v * (b.h - 8));
        if (w) c.fillRect(w[0] | 0, w[1] | 0, Math.max(1, w[3] * 0.9) | 0, Math.max(1, w[3] * 1.2) | 0);
      }
    }
  }
  // Pavement apron around the fence.
  poly(
    [[-20, -20], [114, -20], [114, 70], [-20, 70]].map((v) => P(v[0], v[1], 0)),
    "#4a4d57",
  );
}
// Chain-link fence. Sides between the camera and the court are skipped so they never cover the play.
function fence() {
  const F = FENCE,
    sides = [
      [[F.x0, F.y0], [F.x1, F.y0], V.y > F.y0 + 2],
      [[F.x1, F.y1], [F.x0, F.y1], V.y < F.y1 - 2],
      [[F.x0, F.y1], [F.x0, F.y0], V.x > F.x0 + 2],
      [[F.x1, F.y0], [F.x1, F.y1], V.x < F.x1 - 2],
    ],
    mesh = "rgba(190,198,212,.32)";
  for (const [a, e, show] of sides) {
    if (!show) continue;
    const L = hy(e[0] - a[0], e[1] - a[1]),
      ux = (e[0] - a[0]) / L,
      uy = (e[1] - a[1]) / L,
      at = (s, z) => [a[0] + ux * s, a[1] + uy * s, z];
    // Diamond mesh: two sets of diagonals, clipped to the panel.
    c.strokeStyle = mesh;
    c.lineWidth = 1;
    c.beginPath();
    const step = 1.6;
    for (let s = -F.h; s < L; s += step)
      for (const dir of [1, -1]) {
        // A diagonal runs up the fence: along-position pos(t) for height t in [0, h], clipped to the panel.
        const pos = (t) => (dir > 0 ? s + t : s + F.h - t),
          t0 = dir > 0 ? Math.max(0, -s) : Math.max(0, s + F.h - L),
          t1 = dir > 0 ? Math.min(F.h, L - s) : Math.min(F.h, s + F.h);
        if (t1 <= t0) continue;
        const A = P(...at(pos(t0), t0)),
          B = P(...at(pos(t1), t1));
        if (!A || !B) continue;
        c.moveTo(A[0], A[1]);
        c.lineTo(B[0], B[1]);
      }
    c.stroke();
    // Posts and rails.
    for (let s = 0; s <= L + 0.01; s += L / Math.round(L / 10)) seg(at(s, 0), at(s, F.h + 0.3), 0.3, "#8a919e");
    seg(at(0, F.h), at(L, F.h), 0.22, "#a3aab6");
    seg(at(0, 0.4), at(L, 0.4), 0.15, "#7c838f");
  }
  // Two street lamps in the far corners.
  for (const [x, y] of [[F.x0 + 1, F.y0 + 1], [F.x1 - 1, F.y1 - 1], [F.x0 + 1, F.y1 - 1], [F.x1 - 1, F.y0 + 1]]) {
    seg([x, y, 0], [x, y, 22], 0.35, "#4b505c");
    const q = P(x, y, 22);
    if (!q) continue;
    c.save();
    c.globalCompositeOperation = "lighter";
    c.fillStyle = "rgba(255,190,110,.18)";
    c.beginPath();
    c.arc(q[0], q[1], cl(q[3] * 4, 3, 30), 0, 7);
    c.fill();
    c.fillStyle = "rgba(255,225,170,.9)";
    c.fillRect(q[0] - 1, q[1] - 1, 3, 2);
    c.restore();
  }
}
