"use strict";
// Shared helpers, team rosters, global game state and screen resizing.
const $ = (i) => document.getElementById(i),
  cv = $("g"),
  X = cv.getContext("2d"),
  buf = document.createElement("canvas"),
  c = buf.getContext("2d");
const cl = (v, a, b) => Math.max(a, Math.min(b, v)),
  lp = (a, b, t) => a + (b - a) * t,
  rn = (a, b) => a + Math.random() * (b - a),
  hy = Math.hypot,
  sm = (t) => t * t * (3 - 2 * t),
  ad = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const pc = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16));
const ST = {
  pixel: { h: 170, w: ["#cf8e4c", "#bd7c3c"], o: "#080b18", ow: 1.6, l: "#f6ead2", bg: "#0a0f24" },
  paint: { h: 250, w: ["#c98e55", "#bb8049"], o: "#1a0f1c", ow: 0.9, l: "#f7ecd4", bg: "#12162e" },
  cel: { h: 250, w: ["#e6ab69", "#da9a58"], o: "#070a14", ow: 1.8, l: "#fff", bg: "#151a3c" },
  neon: { h: 210, w: ["#1d2550", "#161c40"], o: "#02030a", ow: 1, l: "#3df2ff", bg: "#03040d" },
};
// Rosters are editable: first player starts with the ball, third is the tip-off jumper. Colours only, no logos.
const TEAMS = [
  {
    n: "THUNDER",
    c: "OKC",
    j: "#1f6fe0",
    t: "#ff8a2a",
    s: "#123b8a",
    k: "#1f5fd0",
    p: [
      ["S. GILGEOUS-ALEXANDER", "SG", 97, 2],
      ["J. WILLIAMS", "SF", 87, 8],
      ["C. HOLMGREN", "C", 86, 7],
    ],
  },
  {
    n: "SPURS",
    c: "SAS",
    j: "#e6eaf0",
    t: "#22242c",
    s: "#8f98aa",
    k: "#4a5468",
    p: [
      ["D. FOX", "PG", 87, 4],
      ["S. CASTLE", "SG", 84, 5],
      ["V. WEMBANYAMA", "C", 95, 1],
    ],
  },
  {
    n: "LAKERS",
    c: "LAL",
    j: "#6a3fb8",
    t: "#ffc72c",
    s: "#3b2275",
    k: "#552583",
    p: [
      ["L. DONCIC", "PG", 96, 77],
      ["A. REAVES", "SG", 83, 15],
      ["L. JAMES", "SF", 90, 23],
    ],
  },
  {
    n: "CELTICS",
    c: "BOS",
    j: "#1d8a4f",
    t: "#ffffff",
    s: "#0f5430",
    k: "#0e7a41",
    p: [
      ["J. TATUM", "SF", 93, 0],
      ["D. WHITE", "PG", 85, 9],
      ["J. BROWN", "SG", 90, 7],
    ],
  },
];
let TM, KC, NM, KD;
function setTeams(a, b) {
  TM = [TEAMS[a], TEAMS[b]];
  KC = TM.map((t) => pc(t.k));
  KD = KC[0].map((v) => (v * 0.5) | 0);
  NM = [...TM[0].p, ...TM[1].p];
}
setTeams(0, 1);
const lite = (c) => (pc(c).reduce((a, b) => a + b) > 330 ? c : "#ffffff");
const SK = ["#8b5a3c", "#b27850", "#5e3a26", "#c58b60", "#7b4b32", "#a96b46"],
  HX = (t) => (t ? 5.25 : 88.75);
const G = {
  run: 0,
  pause: 0,
  style: "paint",
  home: 0,
  away: 0,
  time: 240,
  sc: 24,
  q: 1,
  ctrl: 0,
  poss: 0,
  pl: [],
  ball: null,
  cut: null,
  shot: null,
  shake: 0,
  flash: 0,
  dead: 0,
  fx: [],
  rim: [0, 0],
  st: { pts: 0, reb: 0, ast: 0, stl: 0 },
  fps: 60,
  cm: "c",
  hype: 0,
  next: 0,
  lock: 0,
  prac: 0,
  was: new Set(),
  in: null,
  tt: 0,
  tip: null,
  hs: 0,
  sCd: 0,
  tr: [],
  click: 0,
  swT: 0,
  gf: 0,
  mres: null,
  stain: [],
  gl: 0,
};
const cam = { x: 0, y: 0, z: 10, yaw: 0, p: 0.3, fl: 1.1 },
  V = { x: 0, y: 0, z: 10, yaw: 0, p: 0.3, fl: 1.1 };
let W = 1,
  H = 1,
  RW = 1,
  RH = 1,
  T = 0,
  lt = 0,
  lyaw = 0,
  cfx = 47,
  cfy = 25,
  Fx,
  Fy,
  Fz,
  Rx,
  Ry,
  Ux,
  Uy,
  Uz,
  FL,
  wA,
  wB;
const keys = new Set(),
  BUF = {};
function rs() {
  // The window can briefly report zero size while it opens; never divide by zero.
  W = cv.width = Math.max(1, innerWidth);
  H = cv.height = Math.max(1, innerHeight);
  RH = ST[G.style].h;
  RW = Math.round((RH * W) / H);
  buf.width = RW;
  buf.height = RH;
  wA = pc(ST[G.style].w[0]);
  wB = pc(ST[G.style].w[1]);
}
const dist = (a, b) => hy(a.x - b.x, a.y - b.y),
  minDef = (p) => {
    let m = 99;
    for (const q of G.pl) if (q.t !== p.t) m = Math.min(m, dist(p, q));
    return m;
  },
  dp = (x, y, z) => (x - V.x) * Fx + (y - V.y) * Fy + (z - V.z) * Fz;
