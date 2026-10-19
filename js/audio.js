"use strict";
// Sound effects, synthesised in code. There is no music (removed by David's call, 2026-10-17).
// Add ?mute to the address (e.g. index.html?mute) to start silent. Used for testing.
const QUIET = /[?&](mute|smoke)\b/.test(location.search);
const AU = { x: null, mute: QUIET || !SET.sfx ? 1 : 0, cg: null };
function ac() {
  if (!AU.x) {
    try {
      const x = (AU.x = new (window.AudioContext || window.webkitAudioContext)()),
        n = x.createBuffer(1, x.sampleRate * 2, x.sampleRate),
        d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      AU.nb = n;
    } catch (e) {
      AU.x = null;
    }
  }
  if (AU.x && AU.x.state === "suspended") AU.x.resume();
}
function tone(ty, f0, f1, d, v) {
  const x = AU.x,
    t = x.currentTime,
    o = x.createOscillator(),
    g = x.createGain();
  o.type = ty;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v * (SET.volume / 100), t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  g.gain.linearRampToValueAtTime(0, t + d + 0.02);
  o.connect(g);
  g.connect(x.destination);
  o.start(t);
  o.stop(t + d + 0.03);
}
function nz(d, v, f) {
  const x = AU.x,
    t = x.currentTime,
    s = x.createBufferSource(),
    b = x.createBiquadFilter(),
    g = x.createGain();
  s.buffer = AU.nb;
  b.type = "bandpass";
  b.frequency.value = f;
  b.Q.value = 0.8;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v * (SET.volume / 100), t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  g.gain.linearRampToValueAtTime(0, t + d + 0.02);
  s.connect(b);
  b.connect(g);
  g.connect(x.destination);
  s.start(t);
  s.stop(t + d + 0.03);
}
// Pack opening: a tick that climbs in pitch with each rarity step, and a reveal sound per rarity.
function sfxTick(k) {
  if (!AU.x || AU.mute) return;
  tone("square", 330 * Math.pow(1.26, k), 335 * Math.pow(1.26, k), 0.07, 0.07);
}
function sfxReveal(r) {
  if (!AU.x || AU.mute) return;
  const notes =
    {
      common: [523],
      rare: [523, 784],
      epic: [523, 659, 784, 1047],
      legendary: [392, 523, 659, 784, 1047, 1319],
      iconic: [392, 523, 659, 784, 1047, 1319, 1568],
      mythic: [330, 392, 523, 659, 784, 1047, 1319, 1568],
      godlike: [262, 330, 392, 523, 659, 784, 1047, 1319, 1568, 2093],
      celestial: [262, 330, 392, 523, 659, 784, 1047, 1319, 1568, 2093, 2637],
      limited: [294, 370, 440, 587, 740, 880, 1175, 1480],
    }[r] || [523];
  notes.forEach((f, i) => setTimeout(() => !AU.mute && tone("triangle", f, f, 0.22, 0.12), i * 70));
  if (RANK.indexOf(r) >= RANK.indexOf("legendary")) setTimeout(() => !AU.mute && nz(0.6, 0.35, 900), 60);
  if (r === "celestial") setTimeout(() => !AU.mute && (tone("sine", 784, 3136, 1.4, 0.12), nz(1.6, 0.3, 5000)), 800);
  if (r === "godlike" || r === "limited" || r === "celestial") setTimeout(() => !AU.mute && (tone("sine", 1047, 2093, 0.9, 0.12), nz(1.2, 0.3, 4000)), 500);
}
// Story talk: a little garble of blips, pitched per character (like someone mumbling fast).
function sfxTalk(pitch) {
  if (!AU.x || AU.mute) return;
  const f = pitch * (0.85 + Math.random() * 0.35);
  tone(Math.random() < 0.5 ? "square" : "triangle", f, f * (0.8 + Math.random() * 0.5), 0.05, 0.04);
}
function sfx(k) {
  if (!AU.x || AU.mute) return;
  const m = {
    bounce: () => tone("sine", 150, 55, 0.09, 0.2),
    swish: () => nz(0.4, 0.5, 3200),
    rim: () => {
      tone("triangle", 430, 250, 0.3, 0.3);
      nz(0.1, 0.2, 1500);
    },
    dunk: () => {
      tone("sine", 95, 28, 0.6, 0.8);
      nz(0.45, 0.5, 350);
    },
    steal: () => {
      nz(0.2, 0.4, 1800);
      tone("sawtooth", 300, 900, 0.16, 0.07);
    },
    pass: () => tone("sine", 320, 180, 0.08, 0.2),
    blip: () => tone("square", 760, 740, 0.025, 0.035), // story text typing
    buzz: () => tone("square", 220, 215, 0.7, 0.15),
    whistle: () => tone("sine", 2400, 2300, 0.4, 0.1),
    green: () => {
      tone("sine", 500, 1000, 0.3, 0.25);
      tone("triangle", 750, 1500, 0.35, 0.15);
    },
    punch: () => {
      tone("square", 180, 40, 0.14, 0.45);
      nz(0.12, 0.5, 900);
      tone("sine", 70, 30, 0.25, 0.6);
    },
    whoosh: () => nz(0.12, 0.18, 2200),
    // Menus
    click: () => tone("square", 880, 660, 0.04, 0.05),
    hover: () => tone("square", 1320, 1300, 0.015, 0.02),
    nope: () => (tone("square", 220, 160, 0.12, 0.08), setTimeout(() => !AU.mute && tone("square", 180, 120, 0.14, 0.08), 110)),
    coins: () => [988, 1319, 1568].forEach((f, i) => setTimeout(() => !AU.mute && tone("square", f, f, 0.08, 0.05), i * 60)),
    pop: () => (tone("sine", 300, 900, 0.12, 0.25), nz(0.25, 0.25, 2600)),
    // Game
    board: () => (tone("triangle", 200, 120, 0.12, 0.25), nz(0.08, 0.3, 700)),
    squeak: () => tone("sine", 2600 + Math.random() * 600, 3300, 0.06, 0.035),
    fire: () => (nz(0.5, 0.3, 500), tone("sawtooth", 140, 420, 0.4, 0.08)),
    cheer: () => (nz(1.4, 0.22, 1100), nz(1.2, 0.15, 2400)),
    horn: () => (tone("sawtooth", 196, 196, 0.6, 0.09), tone("sawtooth", 247, 247, 0.6, 0.07)),
    lob: () => tone("sine", 400, 900, 0.18, 0.15),
    slide: () => nz(0.4, 0.3, 1400),
  };
  if (m[k]) m[k]();
}
