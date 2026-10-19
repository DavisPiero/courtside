"use strict";
// Particle effects for rare moves: the rarer the move, the more it glows. Legendary twinkles, Mythic leaves a
// glowing trail, Godlike wears a golden aura, Celestial throws stars and colour. A few moves have their own look
// (Witching Hour: ghost flames and bats). Only your team uses your animations, so only your team glows.
// Particles live in G.fx (moved by fxStep in js/loop.js). Extra fields used here:
//   gv: the particle's own gravity (0 floats; negative rises), dr: drag per second (0.2 = slows fast),
//   g: a soft glowing blob of size sz (feet), st: a twinkling four-point star, bat: a flapping bat.

const FX_MAX = 420; // never more particles than this, so the game holds 60 fps
function fxAdd(o) {
  if (G.fx.length < FX_MAX) G.fx.push(o);
}
// How each rarity (or special move) glows. rate: particles a second while the move plays; burst: how many at the
// finish; cols: colours; star: share of them that are stars; ring: a ring of light circling the feet;
// helix: particles spiral up the body; bats: bats fly off at the finish.
const FX_LOOK = {
  legendary: { rate: 16, burst: 14, cols: ["#ffb02e", "#ffe08a", "#fff"], star: 0.7, sz: 0.35 },
  mythic: { rate: 35, burst: 26, cols: ["#ff2e4a", "#ff7a5a", "#ff9a3a"], star: 0.2, sz: 0.4 },
  godlike: { rate: 45, burst: 36, cols: ["#fff1a8", "#ffd23c", "#ffb02e"], star: 0.35, sz: 0.45, ring: 1 },
  celestial: { rate: 90, burst: 50, cols: ["#8af7ff", "#c79bff", "#ff9bf0", "#ffffff", "#9dffb8"], star: 0.5, sz: 0.45, ring: 1, helix: 1 },
  witch: { rate: 110, burst: 30, cols: ["#9d4dff", "#7cff6a", "#b46bff", "#ff7a1a", "#4cd83a"], star: 0.1, sz: 0.6, helix: 1, ring: 1, bats: 10 },
};
const FX_MOVE = { "dunk.witch": "witch" };
// The look for a move id, or null for moves too common to glow.
function fxLook(style) {
  if (FX_MOVE[style]) return FX_LOOK[FX_MOVE[style]];
  const a = ANIM[style];
  return (a && FX_LOOK[a.rarity]) || null;
}

// What each of your players is doing right now that should glow: a dunk or layup, a dribble move, a jump shot,
// a celebration. Called every step from fxStep.
function moveFx(dt) {
  if (!G.pl || !G.pl.length) return;
  for (const p of G.pl) {
    if (p.t !== 0 || p.gone || p.port) continue;
    let style = null,
      k = 1;
    if (G.cut && G.cut.p === p) {
      if (G.cut.kind !== "dunk" && G.cut.kind !== "layup") continue;
      const u = G.cut.t / G.cut.d;
      if (u < 0.25 || u > 0.9) continue;
      style = G.cut.style;
    } else if (p.mv) style = "dribble." + p.mv.k;
    else if (G.shot && G.shot.p === p) style = styleOf(p, "shot");
    else if (p.stt === "cel" || p.trophy) (style = styleOf(p, "cel")), (k = 0.6);
    const L = style && fxLook(style);
    if (L) fxAura(p, L, dt * k);
    if (style === "cel.fire") fireBreath(p, dt);
    // Supernova: a burst of stars each time it bursts open (the clip loops every 1/0.7 s, opening at 0.3).
    if (style === "cel.supernova") {
      const u = (T * 0.7) % 1;
      if (u > 0.3 && (p.fxU || 0) <= 0.3) fxBurst(p.x, p.y, p.z + 4.5, style);
      p.fxU = u;
    }
  }
  // A rare jump shot leaves a glowing trail on the ball all the way to the rim.
  const b = G.ball;
  if (b.mode === "shot" && b.shooter !== undefined && G.pl[b.shooter] && G.pl[b.shooter].t === 0) {
    const L = fxLook(styleOf(G.pl[b.shooter], "shot"));
    if (L && Math.random() < dt * L.rate * 0.6) fxAdd({ x: b.x, y: b.y, z: b.z, vx: rn(-1, 1), vy: rn(-1, 1), vz: rn(-1, 1), l: rn(0.3, 0.6), c: fxPick(L.cols), gv: 0, dr: 0.3, g: 1, sz: L.sz * 0.8 });
  }
}
const fxPick = (a) => a[(Math.random() * a.length) | 0];
// Particles around a player while the move plays.
function fxAura(p, L, dt) {
  let n = dt * L.rate;
  while (n > 0) {
    if (Math.random() >= n) break;
    n--;
    const col = fxPick(L.cols),
      star = Math.random() < L.star;
    if (L.helix) {
      // Spiralling up round the body.
      const a = T * 9 + Math.random() * 6.28,
        r = rn(1.1, 1.6);
      fxAdd({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, z: p.z + rn(0, 7), vx: -Math.sin(a) * 4, vy: Math.cos(a) * 4, vz: rn(2, 5), l: rn(0.35, 0.7), c: col, gv: 0, dr: 0.4, g: !star, st: star, sz: L.sz });
    } else
      fxAdd({ x: p.x + rn(-1, 1), y: p.y + rn(-1, 1), z: p.z + rn(0.5, 6.5), vx: rn(-1.5, 1.5), vy: rn(-1.5, 1.5), vz: rn(0.5, 3), l: rn(0.3, 0.7), c: col, gv: 0, dr: 0.5, g: !star, st: star, sz: L.sz });
  }
  // A ring of light circling the feet.
  if (L.ring && Math.random() < dt * 30) {
    const a = T * 6 + Math.random() * 0.4;
    for (const s of [0, Math.PI]) fxAdd({ x: p.x + Math.cos(a + s) * 1.8, y: p.y + Math.sin(a + s) * 1.8, z: p.z + 0.2, vx: 0, vy: 0, vz: 0.6, l: 0.4, c: L.cols[0], gv: 0, g: 1, sz: L.sz * 0.8 });
  }
}
// Fire Breather: a cone of flame out of the mouth while leaning in (the clip in js/anim.js, every 1.25 s).
function fireBreath(p, dt) {
  const u = (T * 0.8) % 1;
  if (u < 0.35 || u > 0.85) return;
  const fx = Math.cos(p.f),
    fy = Math.sin(p.f),
    z = p.z + 6.1 * bodyScale(p);
  for (let i = 0; i < 4; i++) {
    const s = rn(10, 18),
      sp = rn(-0.25, 0.25);
    fxAdd({ x: p.x + fx * 0.8, y: p.y + fy * 0.8, z, vx: (fx - fy * sp) * s, vy: (fy + fx * sp) * s, vz: rn(-0.5, 3), l: rn(0.25, 0.5), c: fxPick(["#ffd23c", "#ff8a1a", "#ff3d2a", "#fff1a8"]), gv: -6, dr: 0.15, g: 1, sz: rn(0.35, 0.6) });
  }
}
// The finish: a dunk slams home, a rare move lands. x, y, z where it bursts.
function fxBurst(x, y, z, style) {
  const L = fxLook(style);
  if (!L) return;
  for (let i = 0; i < L.burst; i++) {
    const a = Math.random() * 6.28,
      s = rn(4, 13),
      star = Math.random() < L.star;
    fxAdd({ x, y, z, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rn(-4, 10), l: rn(0.5, 1.1), c: fxPick(L.cols), gv: 6, dr: 0.25, g: !star, st: star, sz: L.sz });
  }
  for (let i = 0; i < (L.bats || 0); i++) {
    const a = Math.random() * 6.28;
    fxAdd({ x, y, z: z + rn(-0.5, 1), vx: Math.cos(a) * rn(5, 10), vy: Math.sin(a) * rn(5, 10), vz: rn(3, 8), l: rn(0.9, 1.5), c: "#120a18", gv: -2, bat: 1, sz: rn(0.5, 0.8), ph: Math.random() * 6 });
  }
}
// Draw one of the special particles at screen point q (from P()).
function fxDraw(s, q) {
  const a = cl(s.l * 2, 0, 1),
    r = Math.max(1, (s.sz || 0.5) * q[3]);
  if (s.bat) {
    const w = Math.max(2, r * 1.6),
      f = Math.sin(T * 22 + s.ph) * w * 0.7;
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = a;
    c.fillStyle = s.c;
    c.beginPath();
    c.moveTo(q[0] - w, q[1] - f);
    c.lineTo(q[0] - w * 0.3, q[1]);
    c.lineTo(q[0], q[1] - w * 0.3);
    c.lineTo(q[0] + w * 0.3, q[1]);
    c.lineTo(q[0] + w, q[1] - f);
    c.lineTo(q[0], q[1] + w * 0.35);
    c.closePath();
    c.fill();
    return;
  }
  c.globalCompositeOperation = "lighter";
  c.fillStyle = s.c;
  const x = q[0] | 0,
    y = q[1] | 0;
  if (s.st) {
    // A plus-shaped twinkle that pulses.
    const L = Math.max(1, (r * (1.4 + Math.sin(T * 20 + x) * 0.6)) | 0);
    c.globalAlpha = a;
    c.fillRect(x - L, y, L * 2 + 1, 1);
    c.fillRect(x, y - L, 1, L * 2 + 1);
    return;
  }
  // A soft blob: a faint glowing halo, then a solid coloured core (not added, so colours stay colours).
  const h = Math.max(2, (r * 1.3) | 0),
    k = Math.max(1, (r * 0.7) | 0);
  c.globalAlpha = a * 0.16;
  c.fillRect(x - h, y - h, h * 2, h * 2);
  c.globalCompositeOperation = "source-over";
  c.globalAlpha = a * 0.95;
  c.fillRect(x - (k >> 1), y - (k >> 1), k, k);
}
