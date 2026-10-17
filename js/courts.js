"use strict";
// The courts. ARENA is indoors (js/arena.js); the rest are outdoors with pole hoops and no crowd.
// Each outdoor court: floor (in bounds), out (the border), line colour, fog (haze colour), pools (lamp
// light on the floor), bg (sky, ground and far scenery) and around (fences, walls, props near the court).
// Colours are [r, g, b] where the floor code mixes them; everything is drawn in code.
const COURTS = {
  arena: { name: "ARENA", tip: "The official indoor court: crowd, jumbotron, hardwood.", floor: ASPH[0], out: CONC, fog: FOG.arena },
  street: {
    name: "STREET",
    tip: "Asphalt at dusk, chain-link fences, chain nets.",
    floor: ASPH[0],
    out: CONC,
    line: "rgba(236,232,220,.85)",
    fog: FOG.street,
    pools: 1,
    bg: streetBg,
    around: () => fence(),
  },
  roof: {
    name: "ROOFTOP",
    tip: "A painted court on top of a tower at night. The whole city below you.",
    floor: [44, 104, 80],
    out: [132, 54, 50],
    line: "rgba(245,245,235,.9)",
    fog: [48, 44, 96],
    bg: roofBg,
    around: roofAround,
  },
  beach: {
    name: "BEACH",
    tip: "A boardwalk court at sunset: sand, palms, the ocean behind the hoop.",
    floor: [52, 140, 168],
    out: [214, 190, 142],
    line: "rgba(255,255,255,.92)",
    fog: [214, 132, 112],
    bg: beachBg,
    around: beachAround,
  },
  cage: {
    name: "THE CAGE",
    tip: "Under the highway bridge: a tall fence, graffiti walls, orange street lights.",
    floor: [104, 106, 112],
    out: [84, 82, 80],
    line: "rgba(242,206,86,.9)",
    fog: [110, 82, 54],
    pools: 1,
    bg: cageBg,
    around: cageAround,
  },
};
const COURT_IDS = Object.keys(COURTS);
const CT = () => COURTS[OPT.court] || COURTS.street;

// A big flat area drawn in tiles, so parts behind the camera don't stop the rest from drawing.
function groundTiles(x0, y0, x1, y1, step, col) {
  for (let x = x0; x < x1; x += step)
    for (let y = y0; y < y1; y += step) {
      const q = [P(x, y, 0), P(x + step, y, 0), P(x + step, y + step, 0), P(x, y + step, 0)];
      if (q.every(Boolean)) {
        poly(q, typeof col === "function" ? col(x, y) : col);
        c.strokeStyle = c.fillStyle;
        c.lineWidth = 1;
        c.stroke();
      }
    }
}
// An upright box (x, y the near-left corner on the ground). Only faces toward the camera are drawn.
function box(x, y, w, d, z0, z1, col) {
  const faces = [
    [[x, y], [x + w, y], 0, -1],
    [[x + w, y + d], [x, y + d], 0, 1],
    [[x, y + d], [x, y], -1, 0],
    [[x + w, y], [x + w, y + d], 1, 0],
  ];
  for (const [a, e, nx, ny] of faces) {
    if ((V.x - a[0]) * nx + (V.y - a[1]) * ny <= 0) continue;
    poly([P(a[0], a[1], z0), P(e[0], e[1], z0), P(e[0], e[1], z1), P(a[0], a[1], z1)], nx ? shade(col, -0.22) : col);
  }
  if (V.z > z1) poly([P(x, y, z1), P(x + w, y, z1), P(x + w, y + d, z1), P(x, y + d, z1)], shade(col, 0.12));
}
// A glowing dot (lights, the sun). r: radius in feet; col "r,g,b".
function glow(x, y, z, r, col, a) {
  const q = P(x, y, z);
  if (!q) return;
  c.save();
  c.globalCompositeOperation = "lighter";
  c.fillStyle = `rgba(${col},${a || 0.5})`;
  c.beginPath();
  c.arc(q[0], q[1], Math.max(1, r * q[3]), 0, 7);
  c.fill();
  c.restore();
}
// Low wall around the court with sides between the camera and the play left out (like the fence).
function lowWall(x0, y0, x1, y1, h, col, top) {
  const sides = [
    [[x0, y0], [x1, y0], V.y > y0 + 2],
    [[x1, y1], [x0, y1], V.y < y1 - 2],
    [[x0, y1], [x0, y0], V.x > x0 + 2],
    [[x1, y0], [x1, y1], V.x < x1 - 2],
  ];
  for (const [a, e, show] of sides) {
    if (!show) continue;
    poly([P(a[0], a[1], 0), P(e[0], e[1], 0), P(e[0], e[1], h), P(a[0], a[1], h)], col);
    if (top) seg([a[0], a[1], h], [e[0], e[1], h], 0.3, top);
  }
  return sides;
}

// ---------- ROOFTOP: night sky, the city far below, a parapet with a railing, a water tower, flood lights
function roofBg() {
  skyGround("#05081c", "#1a1c48", "#45306a", "#11142c");
  // Stars.
  c.fillStyle = "rgba(255,255,255,.7)";
  for (let i = 0; i < 60; i++) {
    const q = P(V.x + Math.cos(i * 2.4) * 900, V.y + Math.sin(i * 2.4) * 900, 160 + ((i * 37) % 220));
    if (q) c.fillRect(q[0] | 0, q[1] | 0, 1, 1);
  }
  skyline(55);
  // The roof deck: tar with lighter seams.
  groundTiles(-24, -24, 118, 74, 14, (x, y) => ((x / 14 + y / 14) & 1 ? "#34363f" : "#383a44"));
}
function roofAround() {
  const sides = lowWall(-10, -10, 104, 60, 3.4, "#6c6a72", "#8a8890");
  // Railing on top of the parapet.
  for (const [a, e, show] of sides) {
    if (!show) continue;
    const L = hy(e[0] - a[0], e[1] - a[1]);
    for (let s = 0; s <= L; s += 6) {
      const k = s / L;
      seg([lp(a[0], e[0], k), lp(a[1], e[1], k), 3.4], [lp(a[0], e[0], k), lp(a[1], e[1], k), 6.6], 0.12, "#a8b0bc");
    }
    seg([a[0], a[1], 6.6], [e[0], e[1], 6.6], 0.16, "#c2c9d4");
  }
  // Air-conditioning units and a stairwell hut.
  box(-20, 4, 6, 8, 0, 4, "#8d929c");
  box(-20, 36, 6, 8, 0, 4, "#8d929c");
  box(108, 18, 9, 14, 0, 9, "#5a5662");
  // The water tower in the far corner: legs, a wooden tank with bands, a cone roof, a blinking red light.
  const wx = 110,
    wy = 66;
  for (const [dx, dy] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) seg([wx + dx, wy + dy, 0], [wx + dx * 0.8, wy + dy * 0.8, 16], 0.3, "#4a4048");
  const t0 = P(wx, wy, 16),
    t1 = P(wx, wy, 27);
  if (t0 && t1) {
    const w = 4.2 * t0[3];
    c.fillStyle = "#7a5236";
    c.fillRect(t0[0] - w, t1[1], w * 2, t0[1] - t1[1]);
    c.fillStyle = "#5c3c26";
    for (let i = 1; i < 4; i++) c.fillRect(t0[0] - w, lp(t1[1], t0[1], i / 4) | 0, w * 2, Math.max(1, t0[3] * 0.3));
    const tip = P(wx, wy, 31);
    if (tip) {
      c.fillStyle = "#3e2c22";
      c.beginPath();
      c.moveTo(t0[0] - w * 1.1, t1[1]);
      c.lineTo(t0[0] + w * 1.1, t1[1]);
      c.lineTo(tip[0], tip[1]);
      c.closePath();
      c.fill();
    }
  }
  if (Math.sin(T * 3) > 0.3) glow(wx, wy, 31.5, 0.9, "255,40,40", 0.9);
  // Flood lights on two tall poles, cool white.
  for (const [x, y] of [[-8, -8], [102, 58], [-8, 58], [102, -8]]) lamp(x, y, 26, "200,220,255");
}

// ---------- BEACH: sunset, the ocean behind the far side, sand, palms, string lights, a lifeguard tower
const PALMS = [];
(function () {
  let sd = 11;
  const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let x = -14; x <= 108; x += 15 + r() * 8) PALMS.push([x, 64 + r() * 6, 20 + r() * 8, r() * 6]);
  for (let y = 4; y <= 50; y += 22) PALMS.push([-16 - r() * 4, y, 20 + r() * 6, r() * 6], [110 + r() * 4, y, 20 + r() * 6, r() * 6]);
})();
function beachBg() {
  skyGround("#2b3a86", "#d8687a", "#ffc46b", "#2d6593");
  // The sun sitting on the horizon over the water, with its glitter path.
  glow(47, 2400, 60, 140, "255,170,80", 0.35);
  glow(47, 2400, 60, 80, "255,220,140", 0.8);
  for (let i = 0; i < 14; i++) {
    const y = 120 + i * i * 9,
      w = 4 + i * 2.4,
      q0 = P(47 - w + Math.sin(T * 2 + i) * 2, y, 0),
      q1 = P(47 + w + Math.sin(T * 2 + i) * 2, y, 0);
    if (q0 && q1) {
      c.fillStyle = "rgba(255,210,140,.55)";
      c.fillRect(Math.min(q0[0], q1[0]) | 0, q0[1] | 0, Math.abs(q1[0] - q0[0]) | 0, Math.max(1, q0[3] * 0.8) | 0);
    }
  }
  // A sandy spit with the ocean all around it; wet sand at the water's edge.
  groundTiles(-84, -84, 180, 96, 12, (x, y) => (x < -60 || x > 152 || y < -60 || y > 84 ? "#a88f63" : "#d8bf8e"));
  // Waves rolling in.
  c.strokeStyle = "rgba(255,255,255,.55)";
  for (let i = 0; i < 3; i++) {
    const y = 92 + ((T * 3 + i * 9) % 26);
    ln([[-120, y], [-40, y + 1], [40, y], [130, y + 1], [210, y]], "rgba(255,255,255,.5)", 1);
  }
}
function palm(x, y, h, ph) {
  const bend = 2.2,
    pts = [];
  for (let i = 0; i <= 4; i++) {
    const k = i / 4;
    pts.push([x + Math.sin(k * 1.4) * bend, y + Math.sin(k * 1.4) * bend * 0.4, h * k]);
  }
  for (let i = 0; i < 4; i++) seg(pts[i], pts[i + 1], 0.55 - i * 0.07, i & 1 ? "#7b5a3c" : "#8d6a48");
  const top = pts[4],
    sw = Math.sin(T * 1.3 + ph) * 0.15;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * 6.2832 + ph + sw,
      mid = [top[0] + Math.cos(a) * 3.5, top[1] + Math.sin(a) * 3.5, top[2] + 1.2],
      end = [top[0] + Math.cos(a) * 6.5, top[1] + Math.sin(a) * 6.5, top[2] - 2.4];
    seg(top, mid, 0.5, "#2f7a3e");
    seg(mid, end, 0.35, i & 1 ? "#3d9450" : "#2a6a36");
  }
}
function beachAround() {
  // Boardwalk planks along the near-side ends and a low rope fence on posts.
  const sides = lowWall(-8, -8, 102, 58, 0.5, "#9b7a52");
  for (const [a, e, show] of sides) {
    if (!show) continue;
    const L = hy(e[0] - a[0], e[1] - a[1]);
    for (let s = 0; s <= L; s += 8) {
      const k = s / L;
      seg([lp(a[0], e[0], k), lp(a[1], e[1], k), 0], [lp(a[0], e[0], k), lp(a[1], e[1], k), 3], 0.25, "#8a6a44");
    }
    seg([a[0], a[1], 2.6], [e[0], e[1], 2.6], 0.08, "#e6d4a8");
  }
  // Lifeguard tower: stilts, a hut, a red flag.
  const lx = 112,
    ly = 70;
  for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) seg([lx + dx, ly + dy, 0], [lx + dx * 0.7, ly + dy * 0.7, 8], 0.25, "#e8e2d4");
  box(lx - 2.4, ly - 2.4, 4.8, 4.8, 8, 12, "#e8504a");
  seg([lx, ly, 12], [lx, ly, 17], 0.12, "#ddd");
  seg([lx, ly, 17], [lx + 2 + Math.sin(T * 6) * 0.3, ly, 16.2], 0.6, "#ff3b30");
  for (const [x, y, h, ph] of PALMS) palm(x, y, h, ph);
  // String lights between the far palms.
  const far = PALMS.filter((p) => p[1] > 60).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i + 1 < far.length; i++) {
    const a = far[i],
      b = far[i + 1];
    for (let k = 1; k < 8; k++) {
      const u = k / 8;
      glow(lp(a[0], b[0], u), lp(a[1], b[1], u), lp(a[2], b[2], u) * 0.6 - Math.sin(u * Math.PI) * 2.5, 0.35, (i + k) % 3 ? "255,210,120" : "255,120,160", 0.85);
    }
  }
}

// ---------- THE CAGE: night under a highway bridge, concrete pillars, graffiti walls, a tall fence
// Graffiti on the far wall: colour blocks and tags, fixed seed so it never changes.
const GRAF = [];
(function () {
  let sd = 5;
  const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647),
    cols = ["#ff3d7f", "#2fd4ff", "#ffd23c", "#7cff5a", "#b06cff", "#ff8a2a"];
  for (let i = 0; i < 26; i++) GRAF.push([r() * 112 - 10, 1 + r() * 7, 3 + r() * 9, 1 + r() * 3, cols[(r() * 6) | 0]]);
})();
function cageBg() {
  skyGround("#0a0b14", "#231c2a", "#5a3a2a", "#2a2b30");
  skyline(0);
  groundTiles(-30, -30, 124, 80, 16, (x, y) => ((x / 16 + y / 16) & 1 ? "#45464c" : "#404147"));
  // The highway bridge across the far side: pillars, the deck, its rail, and car lights going by.
  for (let x = -60; x <= 160; x += 36) box(x - 2, 84, 4, 4, 0, 30, "#5d606a");
  for (let x = -150; x < 250; x += 20) {
    const q = [P(x, 82, 30), P(x + 20, 82, 30), P(x + 20, 82, 35), P(x, 82, 35)];
    poly(q, "#4c4f58");
    poly([P(x, 82, 30), P(x + 20, 82, 30), P(x + 20, 96, 30), P(x, 96, 30)], "#2a2c33");
  }
  seg([-150, 82, 36], [250, 82, 36], 0.4, "#7a7e88");
  for (let i = 0; i < 9; i++) {
    const dir = i & 1 ? 1 : -1,
      x = (((T * 45 * dir + i * 47) % 400) + 400) % 400 - 150;
    glow(x, 86, 36.5, 0.5, dir > 0 ? "255,245,210" : "255,60,50", 0.9);
  }
}
function cageAround() {
  // Graffiti wall behind the far baseline area (only the side away from the camera).
  if (V.y < 60) {
    poly([P(-12, 64, 0), P(106, 64, 0), P(106, 64, 11), P(-12, 64, 11)], "#6a6460");
    for (const [x, z, w, h, col] of GRAF) poly([P(x, 63.9, z), P(x + w, 63.9, z), P(x + w, 63.9, z + h), P(x, 63.9, z + h)], col);
    txt3("THE CAGE", [20, 63.8, 7.5], [1, 0, 0], [0, 0, -1], 4, "#ffffff", 0.9);
  }
  fence(18, "255,150,60");
}
