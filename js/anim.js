"use strict";
// ---------- Animation system
// Every pose is a set of joint targets in the player's own frame (x forward, y left, z up, in model feet):
//   hz    hip height            lean  shoulders forward(+)/back(-)   twist  shoulder turn (+ = right shoulder fwd)
//   yaw   extra body turn       pitch whole-body tilt back(+)/forward(-) around the hips (falls, flips)
//   recline  upper body only tilted back, legs stay where they are (slide tackle)
//   aL/aR hand targets: [x, y, z above the hips]      fL/fR foot targets: [x, y, z above the floor]
// Moves are keyframe clips: lists of [time 0..1, partial pose]. Missing values come from the base pose
// (run, idle, defence), so a clip only says what it changes. Keys are blended with an ease curve, and the
// final pose is smoothed every frame, so nothing ever snaps.
// Clips are written right-handed (ball in the right hand, y < 0); mirror() flips them for the left hand.

const ease = (t) => t * t * (3 - 2 * t);
const lerpA = (a, b, t) => [lp(a[0], b[0], t), lp(a[1], b[1], t), lp(a[2], b[2], t)];
const POSE_KEYS = ["hz", "lean", "twist", "yaw", "pitch", "recline"],
  LIMB_KEYS = ["aL", "aR", "fL", "fR"];
function clonePose(s) {
  return { hz: s.hz, lean: s.lean, twist: s.twist, yaw: s.yaw, pitch: s.pitch, recline: s.recline || 0, aL: s.aL.slice(), aR: s.aR.slice(), fL: s.fL.slice(), fR: s.fR.slice() };
}
// Evaluate a clip at time u, filling gaps from the base pose.
function clip(keys, u, base) {
  u = cl(u, 0, 1);
  let i = 0;
  while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const [u0, A] = keys[i],
    [u1, B] = keys[Math.min(i + 1, keys.length - 1)],
    t = u1 > u0 ? ease(cl((u - u0) / (u1 - u0), 0, 1)) : 1,
    out = clonePose(base);
  for (const k of POSE_KEYS) {
    const a = A[k] !== undefined ? A[k] : base[k],
      b = B[k] !== undefined ? B[k] : base[k];
    out[k] = lp(a, b, t);
  }
  for (const k of LIMB_KEYS) out[k] = lerpA(A[k] || base[k], B[k] || base[k], t);
  return out;
}
function blend(a, b, w) {
  if (w <= 0) return a;
  if (w >= 1) return b;
  const o = clonePose(a);
  for (const k of POSE_KEYS) o[k] = lp(a[k], b[k], w);
  for (const k of LIMB_KEYS) o[k] = lerpA(a[k], b[k], w);
  return o;
}
// Left-handed version: swap sides.
function mirror(q) {
  const m = (v) => [v[0], -v[1], v[2]];
  return { hz: q.hz, lean: q.lean, twist: -q.twist, yaw: -q.yaw, pitch: q.pitch, recline: q.recline, aL: m(q.aR), aR: m(q.aL), fL: m(q.fR), fR: m(q.fL) };
}
// Mirror a list of partial keyframes (only the values each key sets).
function mirrorKeys(keys) {
  const m = (v) => v && [v[0], -v[1], v[2]];
  return keys.map(([u, q]) => {
    const o = {};
    for (const k of ["hz", "lean", "pitch", "recline"]) if (q[k] !== undefined) o[k] = q[k];
    if (q.twist !== undefined) o.twist = -q.twist;
    if (q.yaw !== undefined) o.yaw = -q.yaw;
    if (q.aR) o.aL = m(q.aR);
    if (q.aL) o.aR = m(q.aL);
    if (q.fR) o.fL = m(q.fR);
    if (q.fL) o.fR = m(q.fL);
    return [u, o];
  });
}

// ---------- clips: jump shots. u runs with the shot meter: dip, rise, set point, release at 0.72, hold.
// jump: when the feet leave the floor (u) and how hard (vz).
const SHOTS = {
  "shot.basic": {
    jump: [0.34, 10],
    keys: [
      [0, { hz: 2.95, lean: 0.12, aR: [0.65, -0.32, 1.45], aL: [0.65, 0.22, 1.55] }],
      [0.3, { hz: 2.45, lean: 0.2, aR: [0.6, -0.26, 1.95], aL: [0.6, 0.18, 2.0], fL: [0.25, 0.5, 0], fR: [-0.05, -0.5, 0] }],
      [0.56, { hz: 3.3, lean: 0.02, aR: [0.32, -0.26, 3.75], aL: [0.36, 0.12, 3.55] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [0.72, { hz: 3.3, lean: 0, aR: [0.82, -0.2, 4.7], aL: [0.5, 0.28, 3.85] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [1, { hz: 3.3, lean: 0, aR: [0.9, -0.18, 4.65], aL: [0.45, 0.4, 3.5] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
    ],
  },
  "shot.set": {
    jump: [0.6, 3.5],
    keys: [
      [0, { hz: 3.0, lean: 0.1, aR: [0.7, -0.3, 1.6], aL: [0.7, 0.25, 1.65] }],
      [0.35, { hz: 2.75, lean: 0.16, aR: [0.6, -0.28, 2.3], aL: [0.6, 0.2, 2.3] }],
      [0.6, { hz: 3.2, aR: [0.5, -0.25, 2.95], aL: [0.5, 0.18, 2.95] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [0.72, { hz: 3.3, aR: [1.2, -0.2, 3.7], aL: [1.0, 0.22, 3.4] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [1, { hz: 3.3, aR: [1.25, -0.18, 3.75], aL: [0.9, 0.3, 3.2] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
    ],
  },
  "shot.quick": {
    jump: [0.22, 9],
    keys: [
      [0, { hz: 3.0, lean: 0.1, aR: [0.55, -0.3, 2.4], aL: [0.55, 0.2, 2.45] }],
      [0.2, { hz: 2.75, aR: [0.45, -0.28, 3.1], aL: [0.45, 0.16, 3.05] }],
      [0.45, { hz: 3.3, aR: [0.35, -0.26, 3.75], aL: [0.36, 0.12, 3.55] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [0.72, { hz: 3.3, aR: [0.82, -0.2, 4.7], aL: [0.5, 0.28, 3.85] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [1, { aR: [0.9, -0.18, 4.65], aL: [0.45, 0.4, 3.5] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
    ],
  },
  "shot.high": {
    jump: [0.32, 11.5],
    keys: [
      [0, { hz: 2.9, lean: 0.1, aR: [0.6, -0.3, 1.6], aL: [0.6, 0.22, 1.7] }],
      [0.3, { hz: 2.4, lean: 0.18, aR: [0.55, -0.26, 2.2], aL: [0.55, 0.18, 2.25] }],
      [0.58, { hz: 3.3, lean: -0.05, aR: [0.18, -0.24, 4.4], aL: [0.2, 0.1, 4.2] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [0.72, { hz: 3.3, aR: [0.55, -0.18, 5.45], aL: [0.3, 0.3, 4.4] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [1, { aR: [0.6, -0.16, 5.45], aL: [0.3, 0.5, 4.0] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
    ],
  },
  "shot.fade": {
    jump: [0.32, 10.5],
    keys: [
      [0, { hz: 2.95, lean: 0.1, aR: [0.65, -0.32, 1.5], aL: [0.65, 0.22, 1.6] }],
      [0.3, { hz: 2.45, lean: 0.15, aR: [0.6, -0.26, 2.0], aL: [0.6, 0.18, 2.05] }],
      [0.56, { hz: 3.3, lean: -0.45, pitch: 0.18, aR: [0.2, -0.26, 3.9], aL: [0.25, 0.12, 3.7], fL: [0.5, 0.45, 0.2], fR: [0.3, -0.45, 0.1] }],
      [0.72, { hz: 3.3, lean: -0.6, pitch: 0.3, aR: [0.6, -0.2, 4.8], aL: [0.3, 0.28, 3.9], fL: [0.6, 0.45, 0.3], fR: [0.35, -0.45, 0.15] }],
      [1, { lean: -0.6, pitch: 0.3, aR: [0.7, -0.18, 4.7], aL: [0.25, 0.45, 3.5], fL: [0.6, 0.45, 0.3], fR: [0.35, -0.45, 0.15] }],
    ],
  },
  "shot.stepback": {
    jump: [0.38, 10],
    hop: -9, // hops backwards at the start of the shot
    keys: [
      [0, { hz: 2.7, lean: -0.2, aR: [0.5, -0.3, 1.6], aL: [0.5, 0.22, 1.7], fL: [-0.6, 0.6, 0.3], fR: [0.4, -0.6, 0] }],
      [0.25, { hz: 2.35, lean: 0.15, aR: [0.55, -0.26, 2.0], aL: [0.55, 0.18, 2.05], fL: [0.3, 0.75, 0], fR: [-0.3, -0.75, 0] }],
      [0.56, { hz: 3.3, aR: [0.32, -0.26, 3.75], aL: [0.36, 0.12, 3.55] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [0.72, { hz: 3.3, aR: [0.82, -0.2, 4.7], aL: [0.5, 0.28, 3.85] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
      [1, { aR: [0.9, -0.18, 4.65], aL: [0.45, 0.4, 3.5] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
    ],
  },
  "shot.oneleg": {
    jump: [0.34, 10.5],
    keys: [
      [0, { hz: 2.95, lean: 0.1, aR: [0.65, -0.32, 1.5], aL: [0.65, 0.22, 1.6] }],
      [0.3, { hz: 2.5, lean: 0.12, aR: [0.6, -0.26, 2.0], aL: [0.6, 0.18, 2.05] }],
      [0.56, { hz: 3.3, lean: -0.4, pitch: 0.22, aR: [0.18, -0.26, 4.0], aL: [0.22, 0.12, 3.8], fL: [0.75, 0.4, 1.25], fR: [-0.1, -0.4, 0] }],
      [0.72, { lean: -0.55, pitch: 0.3, aR: [0.55, -0.2, 4.95], aL: [0.25, 0.3, 4.0], fL: [0.85, 0.4, 1.4], fR: [-0.15, -0.4, 0] }],
      [1, { lean: -0.55, pitch: 0.3, aR: [0.6, -0.18, 4.9], aL: [0.2, 0.5, 3.6], fL: [0.85, 0.4, 1.4], fR: [-0.15, -0.4, 0] }],
    ],
  },
  "shot.hook": {
    jump: [0.4, 9],
    keys: [
      [0, { hz: 3.0, yaw: 0.9, aR: [0.3, -0.9, 1.6], aL: [0.6, 0.6, 2.3] }],
      [0.35, { hz: 2.7, yaw: 1.2, aR: [-0.1, -1.6, 2.1], aL: [0.7, 0.8, 2.6], fL: [0.7, 0.4, 1.2] }],
      [0.6, { hz: 3.3, yaw: 1.25, aR: [-0.1, -1.4, 3.9], aL: [0.8, 0.9, 2.7], fL: [0.75, 0.4, 1.35] }],
      [0.72, { yaw: 1.2, aR: [0.1, -0.5, 5.2], aL: [0.8, 0.9, 2.7], fL: [0.75, 0.4, 1.35] }],
      [1, { yaw: 1.1, aR: [0.25, -0.2, 5.1], aL: [0.6, 0.8, 2.4] , fL: [0.14, 0.45, 0.05], fR: [-0.02, -0.45, 0] }],
    ],
  },
};
// Where the ball sits during a shot: just above and in front of the shooting hand.
function shotBall(p, u) {
  const k = SHOTS[styleOf(p, "shot")] || SHOTS["shot.basic"],
    q = clip(k.keys, u, BASE0),
    S = bodyScale(p),
    h = p.hand > 0 ? -1 : 1,
    a = q.aR;
  return [(a[0] + 0.25) * S, a[1] * S * h, (q.hz + a[2] + 0.45) * S];
}

// ---------- clips: dribble moves (u 0..1 over the move). The ball path itself is in ballLocal().
const MOVE_POSES = {
  cross: [
    [0, { hz: 2.75, lean: 0.35 }],
    [0.5, { hz: 2.5, lean: 0.45, twist: -0.25, fL: [0.35, 0.95, 0], fR: [-0.15, -0.95, 0] }],
    [1, { hz: 2.75, lean: 0.35, twist: 0.1 }],
  ],
  legs: [
    [0, { hz: 2.7, lean: 0.3 }],
    [0.45, { hz: 2.35, lean: 0.35, fL: [1.05, 0.8, 0], fR: [-0.85, -0.8, 0] }],
    [1, { hz: 2.65, lean: 0.3, fL: [0.9, 0.75, 0], fR: [-0.7, -0.75, 0] }],
  ],
  back: [
    [0, { hz: 2.75, lean: 0.3 }],
    [0.5, { hz: 2.6, lean: 0.4, twist: 0.35 }],
    [1, { hz: 2.75, lean: 0.35, twist: -0.1 }],
  ],
  spin: [
    [0, { hz: 2.65, lean: 0.35, aL: [0.8, 1.3, 1.6] }],
    [0.5, { hz: 2.55, lean: 0.2, aL: [0.2, 1.6, 2.0] }],
    [1, { hz: 2.75, lean: 0.35 }],
  ],
  hesi: [
    [0, { hz: 2.75, lean: 0.35 }],
    [0.35, { hz: 3.25, lean: -0.05, aL: [0.4, 1.0, 1.4] }],
    [0.5, { hz: 2.45, lean: 0.55 }],
    [1, { hz: 2.7, lean: 0.45 }],
  ],
  inout: [
    [0, { hz: 2.75, lean: 0.35 }],
    [0.45, { hz: 2.5, lean: 0.4, twist: -0.3, fL: [0.3, 0.95, 0], fR: [0.2, -0.95, 0] }],
    [1, { hz: 2.7, lean: 0.4, twist: 0.15 }],
  ],
  snatch: [
    [0, { hz: 2.7, lean: 0.3 }],
    [0.4, { hz: 2.55, lean: -0.25, fL: [-0.5, 0.65, 0.4], fR: [-0.6, -0.65, 0.5] }],
    [1, { hz: 2.65, lean: 0.25, fL: [0.25, 0.75, 0], fR: [-0.25, -0.75, 0] }],
  ],
  double: [
    [0, { hz: 2.7, lean: 0.35 }],
    [0.25, { hz: 2.5, lean: 0.45, twist: -0.25 }],
    [0.5, { hz: 2.6, lean: 0.4, twist: 0.25 }],
    [0.75, { hz: 2.45, lean: 0.45, twist: -0.25 }],
    [1, { hz: 2.7, lean: 0.4 }],
  ],
  killer: [
    [0, { hz: 2.7, lean: 0.35 }],
    [0.45, { hz: 2.1, lean: 0.6, twist: -0.45, fL: [0.4, 1.25, 0], fR: [-0.35, -1.25, 0], aL: [0.5, 1.4, 1.2] }],
    [1, { hz: 2.55, lean: 0.5, twist: 0.2 }],
  ],
  stutter: [
    [0, { hz: 2.8, lean: 0.25 }],
    [0.15, { hz: 2.95, fL: [0.25, 0.55, 0.45] }],
    [0.3, { hz: 2.95, fR: [0.25, -0.55, 0.45] }],
    [0.45, { hz: 2.95, fL: [0.25, 0.55, 0.45] }],
    [0.6, { hz: 2.95, fR: [0.25, -0.55, 0.45] }],
    [0.75, { hz: 2.4, lean: 0.55 }],
    [1, { hz: 2.65, lean: 0.45 }],
  ],
  shammgod: [
    [0, { hz: 2.7, lean: 0.35 }],
    [0.4, { hz: 2.45, lean: 0.5, aR: [2.0, -0.4, 0.4], fL: [0.95, 0.7, 0] }],
    [0.7, { hz: 2.5, lean: 0.4, twist: 0.3, aL: [1.2, 0.8, 0.5] }],
    [1, { hz: 2.7, lean: 0.4 }],
  ],
  tornado: [
    [0, { hz: 2.6, lean: 0.35 }],
    [0.5, { hz: 2.45, lean: 0.25, aL: [0.2, 1.6, 2.0] }],
    [1, { hz: 2.7, lean: 0.4 }],
  ],
};

// ---------- clips: celebrations (u loops with time where noted)
const CELS = {
  "cel.basic": (t) => [[0, { aL: [0.1, 1.3, 4.35], aR: [0.1, -1.3, 4.35] }]],
  "cel.flex": () => [[0, { lean: -0.05, aL: [0.2, 1.05, 3.05], aR: [0.2, -1.05, 3.05], fL: [0.2, 0.75, 0], fR: [-0.2, -0.75, 0] }]],
  "cel.shh": () => [[0, { aR: [0.6, -0.05, 2.75], aL: [0.15, 0.95, 0.7] }]],
  "cel.point": () => [[0, { lean: -0.15, aR: [0.3, -0.35, 4.9], aL: [0.15, 0.95, 0.7] }]],
  "cel.toosmall": () => [[0, { hz: 2.35, lean: 0.35, aR: [0.95, -0.7, 0.75], aL: [0.4, 1.1, 1.4] }]],
  "cel.dance": (t) => {
    const s = Math.sin(t * 9);
    return [[0, { hz: 3.1 + Math.abs(s) * 0.2, twist: s * 0.35, aL: [0.3, 1.4, 2.4 + s * 1.2], aR: [0.3, -1.4, 2.4 - s * 1.2], fL: [0.1 + s * 0.2, 0.6, 0], fR: [-0.1 - s * 0.2, -0.6, 0] }]];
  },
  "cel.lights": () => [[0, { lean: 0.05, twist: -0.15, aR: [0.5, -0.15, 2.7], aL: [0.55, 0.05, 2.75] }]],
  "cel.ice": (t) => {
    const tap = Math.abs(Math.sin(t * 7)) * 0.25;
    return [[0, { lean: 0.1, aL: [0.75, 0.3, 1.9], aR: [0.75, -0.05, 2.0 + tap] }]];
  },
  "cel.mic": (t) => {
    const u = (t * 0.7) % 1;
    return [[0, { lean: -0.1, aR: [0.6, -0.5, u < 0.6 ? 3.6 : lp(3.6, 2.0, (u - 0.6) / 0.4)], aL: [0.2, 1.0, 0.7] }]];
  },
  "cel.backflip": (t) => {
    const u = (t * 0.6) % 1,
      f = cl((u - 0.15) / 0.55, 0, 1);
    return [[0, { pitch: ease(f) * 6.2832, hz: u < 0.15 ? 2.6 : 3.1, aL: [0.2, 1.3, u < 0.15 ? 0.5 : 3.6], aR: [0.2, -1.3, u < 0.15 ? 0.5 : 3.6], fL: [0.4, 0.45, f > 0 && f < 1 ? 1.2 : 0], fR: [0.4, -0.45, f > 0 && f < 1 ? 1.2 : 0] }]];
  },
  "cel.chest": (t) => {
    const s = Math.abs(Math.sin(t * 5));
    return [[0, { lean: -0.15 - s * 0.1, aR: [0.6, -0.15, 2.4 - s * 0.2], aL: [0.6, 0.15, 2.4 - s * 0.2] }]];
  },
};
// The jump that goes with some celebrations (backflip).
function celHop(style, t) {
  if (style !== "cel.backflip") return 0;
  const u = (t * 0.6) % 1;
  return u > 0.15 && u < 0.7 ? Math.sin(((u - 0.15) / 0.55) * Math.PI) * 3.2 : 0;
}

// ---------- clips: actions with a fixed length (u 0..1)
const ACTIONS = {
  // Chest pass: step in, both hands push out and snap.
  pass: [
    [0, { lean: 0.1, aL: [0.6, 0.3, 2.0], aR: [0.6, -0.3, 2.0] }],
    [0.35, { lean: 0.35, aL: [2.0, 0.25, 2.05], aR: [2.0, -0.25, 2.05], fL: [0.7, 0.5, 0] }],
    [1, { lean: 0.15, aL: [1.4, 0.4, 1.8], aR: [1.4, -0.4, 1.8] }],
  ],
  // Steal swipe: drop and rake low to high.
  swipe: [
    [0, { hz: 2.7, lean: 0.4, aR: [1.4, -0.9, 0.6] }],
    [0.5, { hz: 2.5, lean: 0.6, twist: 0.4, aR: [2.3, 0.2, 0.9], fR: [0.8, -0.6, 0] }],
    [1, { hz: 2.8, lean: 0.35, aR: [1.4, -0.6, 1.9] }],
  ],
  // Punch: load (shoulder back), drive the hips and throw, then recoil to guard.
  punch: [
    [0, { hz: 2.9, lean: 0.05, twist: -0.1, aR: [0.6, -0.45, 2.2], aL: [0.8, 0.35, 2.4] }],
    [0.22, { hz: 2.75, lean: -0.15, twist: -0.55, aR: [-0.35, -0.75, 2.1], aL: [0.9, 0.45, 2.5], fL: [0.55, 0.55, 0] }],
    [0.42, { hz: 2.7, lean: 0.55, twist: 0.6, aR: [2.6, -0.1, 2.35], aL: [0.3, 0.65, 2.0], fL: [1.0, 0.5, 0], fR: [-0.55, -0.55, 0.15] }],
    [0.7, { hz: 2.75, lean: 0.4, twist: 0.35, aR: [2.2, -0.15, 2.3], fL: [1.0, 0.5, 0], fR: [-0.55, -0.55, 0] }],
    [1, { hz: 2.9, lean: 0.15, twist: 0, aR: [0.7, -0.45, 2.2], aL: [0.8, 0.4, 2.3] }],
  ],
  // Slide tackle: drop to the floor, lead leg out, arm planted behind, then pop back up.
  slide: [
    [0, { hz: 2.7, lean: 0.4, recline: 0 }],
    [0.12, { hz: 0.75, lean: 0, recline: 0.75, fL: [2.6, 0.35, 0.1], fR: [0.9, -0.5, 0.15], aL: [-1.4, 1.0, -0.3], aR: [0.9, -1.1, 1.0] }],
    [0.78, { hz: 0.65, lean: 0, recline: 0.85, fL: [2.7, 0.3, 0.12], fR: [1.0, -0.5, 0.15], aL: [-1.5, 1.0, -0.35], aR: [1.0, -1.1, 0.9] }],
    [1, { hz: 2.8, lean: 0.3, recline: 0 }],
  ],
  // Knocked down: snap back, fall, lie, then climb up.
  rag: [
    [0, { hz: 3.0, pitch: 0, lean: -0.3, aL: [-0.5, 1.6, 2.6], aR: [-0.5, -1.6, 2.6] }],
    [0.12, { hz: 1.6, pitch: 1.1, aL: [-0.6, 1.8, 2.0], aR: [-0.6, -1.8, 2.0], fL: [1.0, 0.6, 1.0], fR: [0.8, -0.6, 0.6] }],
    [0.25, { hz: 0.55, pitch: 1.5, aL: [-0.3, 1.7, 0.9], aR: [-0.3, -1.7, 0.9], fL: [0.8, 0.7, 0.4], fR: [0.5, -0.7, 0.2] }],
    [0.75, { hz: 0.55, pitch: 1.5, aL: [-0.3, 1.7, 0.9], aR: [-0.3, -1.7, 0.9], fL: [0.8, 0.7, 0.4], fR: [0.5, -0.7, 0.2] }],
    [0.9, { hz: 1.6, pitch: 0.4, lean: 0.6, aL: [0.8, 0.9, 0.3], aR: [0.8, -0.9, 0.3], fL: [0.6, 0.6, 0], fR: [-0.3, -0.6, 0] }],
    [1, { hz: 3.0, pitch: 0, lean: 0.2 }],
  ],
};

// ---------- dunks and layups. k runs 0..1 through the rise to the rim; z is the player's height in the air.
// Returns the hand target (local frame, facing the rim, feet as origin) and the leg pose.
// one: one-handed. The rim is 1.6 ft ahead and 10 ft up at the end of the rise.
function rimHand(style, k, z) {
  const end = [1.45, 0, 10.35 - z],
    chest = [0.8, -0.2, 5.6],
    E = ease(k);
  switch (style) {
    case "dunk.tomahawk":
      return k < 0.6 ? lerpA([0.7, -0.3, 6.6], [-1.0, -0.25, 8.6], ease(k / 0.6)) : lerpA([-1.0, -0.25, 8.6], end, ease((k - 0.6) / 0.4));
    case "dunk.windmill": {
      if (k > 0.78) return lerpA([0.9, -0.9, 8.4], end, ease((k - 0.78) / 0.22));
      const a = (k / 0.78) * Math.PI * 1.55;
      return [-Math.sin(a) * 2.3 + 0.3, -0.9, 5.6 - Math.cos(a) * 2.3];
    }
    case "dunk.360":
      return k < 0.72 ? chest : lerpA(chest, end, ease((k - 0.72) / 0.28));
    case "dunk.reverse":
      return lerpA([0.3, -0.2, 6.2], [-0.4, 0, 8.8], E).map((v, i) => (k > 0.7 ? lp(v, end[i], ease((k - 0.7) / 0.3)) : v));
    case "dunk.cradle": {
      if (k > 0.7) return lerpA([0.4, -1.4, 6.0], end, ease((k - 0.7) / 0.3));
      const s = Math.sin(k * 9);
      return [0.5, -0.9 + s * 0.6, 5.2 + s * 0.4];
    }
    case "dunk.legs":
      // Ball goes down and under the raised knees from right hand to left, then up.
      if (k < 0.55) {
        const t = ease(k / 0.55);
        return [lp(0.8, 0.4, t), lp(-0.6, 0.6, t), lp(5.2, 2.6, Math.sin(t * Math.PI) * 0.9 + t * 0.1)];
      }
      return lerpA([0.6, 0.6, 4.6], [1.45, 0.2, 10.35 - z], ease((k - 0.55) / 0.45));
    case "dunk.twohand":
      return lerpA([0.6, 0, 6.6], [1.45, 0, 10.4 - z], E);
    // ----- layups: the ball goes up toward the glass
    case "layup.fingerroll":
      return lerpA([0.7, -0.3, 5.0], [1.3, -0.3, 9.7 - z], E);
    case "layup.scoop":
      return k < 0.5 ? lerpA([0.9, -0.5, 3.6], [1.3, -0.4, 4.6], ease(k / 0.5)) : lerpA([1.3, -0.4, 4.6], [1.5, -0.2, 9.2 - z], ease((k - 0.5) / 0.5));
    case "layup.reverse":
      return lerpA([0.4, -0.3, 6.0], [-0.6, 0.2, 9.4 - z], E);
    case "layup.clutch":
      if (k < 0.45) return lerpA([0.7, -0.3, 5.8], [0.9, -0.3, 8.3], ease(k / 0.45));
      if (k < 0.7) return lerpA([0.9, -0.3, 8.3], [0.6, 0.3, 5.6], ease((k - 0.45) / 0.25));
      return lerpA([0.6, 0.3, 5.6], [1.3, 0.4, 9.5 - z], ease((k - 0.7) / 0.3));
    case "layup.basic":
    case "layup.euro":
      return lerpA([0.7, -0.3, 5.6], [1.25, -0.25, 9.3 - z], E);
    default:
      return lerpA([0.7, -0.2, 6.6], end, E);
  }
}
// Leg pose in the air. Dunks drive one knee hard; the between-the-legs dunk tucks both.
function airLegs(style, k) {
  if (style === "dunk.legs" && k < 0.6) return { fL: [0.75, 0.45, 1.7], fR: [0.75, -0.45, 1.7] };
  if (style === "dunk.twohand" || style === "dunk.360") return { fL: [0.35, 0.45, 1.1], fR: [0.2, -0.45, 0.9] };
  if (style === "dunk.windmill" || style === "dunk.tomahawk") return { fL: [0.9, 0.45, 1.55], fR: [-0.7, -0.45, 0.8] };
  return { fL: [0.85, 0.45, 1.45], fR: [-0.45, -0.45, 0.45] };
}

// ---------- the base pose: idle, run, sprint, defence, in the air, landing
const BASE0 = { hz: 3.25, lean: 0, twist: 0, yaw: 0, pitch: 0, recline: 0, aL: [0, 1.0, 0.35], aR: [0, -1.0, 0.35], fL: [0.15, 0.55, 0], fR: [-0.15, -0.55, 0] };
function basePose(p, c) {
  const { run, sprint, idle, s1, c1, tt, bw } = c,
    stride = run * 1.3,
    q = clonePose(BASE0);
  q.hz = 3.25 + Math.sin(p.ph * 2) * 0.08 * run + Math.sin(tt * 2.4 + (p.look || 0)) * 0.04 * idle - (c.land || 0) * 0.55;
  q.lean = 0.22 * run + 0.3 * sprint + (c.land || 0) * 0.25;
  q.twist = s1 * 0.24 * run;
  // Run: the swing leg lifts its knee, the arms pump opposite and bend at the elbow.
  q.fL = [s1 * stride, 0.45 * bw, Math.max(0, c1) * 1.05 * run];
  q.fR = [-s1 * stride, -0.45 * bw, Math.max(0, -c1) * 1.05 * run];
  q.aL = [-s1 * stride * 0.85, 0.95 * bw, 0.35 + run * 0.55 + Math.max(0, -s1) * run * 0.6];
  q.aR = [s1 * stride * 0.85, -0.95 * bw, 0.35 + run * 0.55 + Math.max(0, s1) * run * 0.6];
  if (idle > 0.5) {
    q.fL = [0.15, 0.6 * bw, 0];
    q.fR = [-0.15, -0.6 * bw, 0];
  }
  if (p.def) {
    // Defensive stance: low hips, wide feet, one hand high to contest and one low for steals, switching slowly.
    const s = Math.sin(tt * 3 + p.id);
    q.hz = 2.65 + Math.sin(p.ph * 2) * 0.05 * run;
    q.lean = 0.35;
    q.fL = [0.2, 1.2 + Math.max(0, s1) * 0.35 * run, Math.max(0, c1) * 0.3 * run];
    q.fR = [-0.2, -1.2 - Math.max(0, -s1) * 0.35 * run, Math.max(0, -c1) * 0.3 * run];
    q.aL = [0.8, 1.6, 2.0 + s * 0.6];
    q.aR = [0.9, -1.7, 1.2 - s * 0.5];
  }
  if (c.air) {
    q.fL = [0.25, 0.42, 0.55];
    q.fR = [-0.1, -0.42, 0.35];
    if (!c.hold) {
      q.aL = [0.35, 0.6, 4.6];
      q.aR = [0.35, -0.6, 4.6];
    }
  }
  return q;
}

// ---------- the full pose for a player this frame
function animPose(p, c) {
  const base = basePose(p, c);
  let q = base;
  const L = c.ballL, // ball in the local frame (model feet), or null
    righty = L ? L[1] < 0 : (c.hand || -1) < 0, // which hand has the ball
    act = (keys, u, w) => (q = blend(q, clip(keys, u, q), w === undefined ? 1 : w)),
    side = (keys) => (righty ? keys : mirrorKeys(keys));
  // Dribbling: the hand rides the top of the ball and waits at the thigh, knees pump with the bounce.
  if (c.hold && !c.shooting && L) {
    const handZ = Math.max(L[2] + 0.5 - q.hz, -1.05),
      hand = [L[0] + 0.05, L[1], handZ],
      guarded = c.guarded,
      off = guarded ? [0.95, 1.25 * c.bw, 1.55] : [0.25, 1.0 * c.bw, 0.6 + c.run * 0.6];
    q.hz -= 0.12 + Math.abs(Math.cos(c.bph || 0)) * 0.1;
    q.lean += 0.12;
    if (righty) {
      q.aR = hand;
      q.aL = off;
    } else {
      q.aL = hand;
      q.aR = [off[0], -off[1], off[2]];
    }
  }
  if (c.mv) {
    const keys = MOVE_POSES[c.mv.k];
    if (keys) act(c.mv.h < 0 ? keys : mirrorKeys(keys), c.mv.t / c.mv.d);
    // re-attach the ball hand after the body pose
    if (L) {
      const hand = [L[0] + 0.05, L[1], Math.max(L[2] + 0.5 - q.hz, -1.25)];
      if (L[1] < 0) q.aR = hand;
      else q.aL = hand;
    }
  }
  if (c.shooting) {
    const k = SHOTS[c.shotS] || SHOTS["shot.basic"];
    act(side(k.keys), c.shotU);
  } else if (c.fol > 0) {
    // Follow-through: hold the release, then relax out of it.
    const k = SHOTS[c.shotS] || SHOTS["shot.basic"];
    act(side(k.keys), 1, cl(c.fol / 0.2, 0, 1));
  }
  if (c.pas > 0) act(ACTIONS.pass, 1 - c.pas / 0.25);
  if (c.swp > 0) act(ACTIONS.swipe, 1 - c.swp / 0.25);
  if (c.cel) act(CELS[c.celS] ? CELS[c.celS](c.tt) : CELS["cel.basic"](c.tt), 0);
  if (c.pun > 0) act(ACTIONS.punch, 1 - c.pun / 0.34);
  if (c.sl) act(ACTIONS.slide, c.sl.t / c.sl.d);
  if (c.rag) act(ACTIONS.rag, c.rag.t / c.rag.d);
  // Dunks and layups: legs from the style, the hand target comes from the cutscene (p.hw).
  if (c.dk) {
    const d = c.dk;
    if (d.phase === "gather") {
      q.hz = lp(q.hz, 2.55, d.k);
      q.lean = lp(q.lean, 0.45, d.k);
      q.aR = lerpA(q.aR, [0.7, -0.2, 2.2], d.k);
      q.aL = lerpA(q.aL, [0.7, 0.25, 2.25], d.k);
    } else if (d.phase === "rise") {
      const lg = airLegs(d.style, d.k);
      q = blend(q, Object.assign(clonePose(q), { hz: 3.25, lean: 0.15, fL: lg.fL, fR: lg.fR }), 0.85);
    } else if (d.phase === "hang") {
      q.hz = 3.25;
      q.lean = -0.1;
      q.fL = [0.2, 0.45, lp(0.9, 0.2, d.k)];
      q.fR = [-0.3, -0.45, lp(0.6, 0.1, d.k)];
    }
  }
  return q;
}
// Smooth the pose over time so changes ease in instead of snapping. rate: higher = snappier.
function smoothPose(p, q, now, rate) {
  const prev = p.ps,
    dt = prev ? cl(now - p.pst, 0, 0.1) : 1;
  p.pst = now;
  if (!prev || dt <= 0) return (p.ps = clonePose(q));
  // Never smooth "the long way round" a full turn (flips, spins): jump by whole turns instead.
  for (const a of ["pitch", "yaw"]) while (Math.abs(q[a] - prev[a]) > Math.PI) prev[a] += Math.sign(q[a] - prev[a]) * 6.2832;
  const k = 1 - Math.exp(-dt * rate);
  const o = blend(prev, q, k);
  p.ps = o;
  return o;
}
