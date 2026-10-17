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
let TM, KC, NM, KD;
function setTeams(a, b) {
  setTeamObjs(TEAMS[a], TEAMS[b]);
}
// Campaign crews aren't in TEAMS, so teams can also be set directly.
function setTeamObjs(A, B) {
  TM = [A, B];
  KC = TM.map((t) => pc(t.k));
  KD = KC[0].map((v) => (v * 0.5) | 0);
  NM = [...TM[0].p, ...TM[1].p];
}
setTeams(...DEFAULT_TEAMS);
const lite = (c) => (pc(c).reduce((a, b) => a + b) > 330 ? c : "#ffffff");
// Skin tones, lightest to darkest. Each player has a tone in js/teams.js.
const SK = ["#f0c8a0", "#e0b08a", "#c8946a", "#a96b46", "#8b5a3c", "#5e3a26"],
  HX = (t) => (t ? 5.25 : 88.75);
// Options chosen on the setup screen.
// mode: "mayhem" (punch, slide, blood) or "clean" (straight basketball). court: "arena" or "street".
const OPT = { mode: "clean", court: "arena", diff: 1 };
// Difficulty for the opposing team's AI. Pro is how the game originally played.
// sp: run-speed multiplier on each player's own speed, stealRate: steal attempts per second when guarding the ball,
// stealWin: chance an attempt works, gap: extra distance they give you on defence (feet), shotQ: shot quality bonus,
// pick: pass interceptions, react: how quickly they change direction,
// squeeze: how much their defence shrinks your green zone (0 none, 1 can close it almost shut).
const DIFF = [
  { name: "ROOKIE", sp: 0.84, stealRate: 0.08, stealWin: 0.25, gap: 1.4, shotQ: -0.18, pick: 0.4, react: 4, squeeze: 0.25 },
  { name: "PRO", sp: 0.94, stealRate: 0.22, stealWin: 0.4, gap: 0, shotQ: 0, pick: 1, react: 6, squeeze: 0.45 },
  { name: "ALL-STAR", sp: 1.0, stealRate: 0.4, stealWin: 0.5, gap: -0.4, shotQ: 0.1, pick: 1.5, react: 8, squeeze: 0.65 },
  { name: "HALL OF FAMER", sp: 1.03, stealRate: 0.55, stealWin: 0.55, gap: -0.6, shotQ: 0.16, pick: 1.9, react: 10, squeeze: 0.8 },
];
// Your AI teammates always play at Pro; the opponents play at the chosen level.
const dk = (p) => (p.t === 1 ? DIFF[OPT.diff] : DIFF[1]);
const mayhem = () => OPT.mode === "mayhem";
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
  cm: SET.camera === "broadcast" ? "b" : "c",
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
// Crisp pixel art: the world renders into a small buffer, then each game pixel becomes an exact PX x PX block
// of screen pixels. PX comes from the Pixel size setting, raised on very large screens to keep it fast.
let PX = 3;
function rs() {
  // The window can briefly report zero size while it opens; never divide by zero.
  W = cv.width = Math.max(1, innerWidth);
  H = cv.height = Math.max(1, innerHeight);
  PX = Math.max(SET.pixel, Math.ceil(H / 420));
  RW = Math.ceil(W / PX);
  RH = Math.ceil(H / PX);
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
