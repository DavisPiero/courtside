"use strict";
// Sound effects (synthesised) and music playlist.
// Add ?mute to the address (e.g. index.html?mute) to start with all sound and music off. Used for testing.
const QUIET = /[?&](mute|smoke)\b/.test(location.search);
const AU = { x: null, mute: QUIET ? 1 : 0, cg: null };
function ac() {
  if (!MUS.started) {
    MUS.started = 1;
    if (MUS.on) musNext();
  } else if (MUS.on && MUS.pend) {
    MUS.pend = 0;
    const p = MUS.a.play();
    if (p && p.catch)
      p.catch(() => {
        MUS.pend = 1;
      });
  }
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
  g.gain.linearRampToValueAtTime(v, t + 0.004);
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
  g.gain.linearRampToValueAtTime(v, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  g.gain.linearRampToValueAtTime(0, t + d + 0.02);
  s.connect(b);
  b.connect(g);
  g.connect(x.destination);
  s.start(t);
  s.stop(t + d + 0.03);
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
    slide: () => nz(0.4, 0.3, 1400),
  };
  if (m[k]) m[k]();
}
// Music: free hip-hop/trap beats by Kevin MacLeod (incompetech.com), licensed CC BY 4.0, streamed from his site.
// The licence requires the credit, which shows bottom left while a track plays. Full credits in CREDITS.md.
const INC = "https://incompetech.com/music/royalty-free/mp3-royaltyfree/";
const TRACKS = [
  { s: INC + "Lewis%20and%20Dekalb.mp3", n: "Lewis and Dekalb", by: "Kevin MacLeod" },
  { s: INC + "Basic%20Implosion.mp3", n: "Basic Implosion", by: "Kevin MacLeod" },
  { s: INC + "MTA.mp3", n: "MTA", by: "Kevin MacLeod" },
  { s: INC + "Griphop.mp3", n: "Griphop", by: "Kevin MacLeod" },
  { s: INC + "Rocket%20Power.mp3", n: "Rocket Power", by: "Kevin MacLeod" },
];
const MUS = {
  on: QUIET ? 0 : 1,
  a: new Audio(),
  q: [],
  last: "",
  cur: null,
  fail: 0,
  pend: 0,
  started: 0,
  list: TRACKS,
};
MUS.a.volume = 0.45;
MUS.a.preload = "auto";
// Bottom-left credit: song name, then artist and licence. Empty when music is off.
function musShow() {
  const t = MUS.cur,
    np = $("np");
  if (!MUS.on || !t) {
    np.innerHTML = "";
    return;
  }
  np.innerHTML = `<b>♪ ${t.n}</b>${t.by} · incompetech.com · CC BY 4.0`;
}
function musPlay() {
  const p = MUS.a.play();
  if (p && p.catch)
    p.catch(() => {
      MUS.pend = 1;
    });
}
function musNext() {
  if (!MUS.list.length) return;
  if (!MUS.q.length) {
    const a = MUS.list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.length > 1 && a[a.length - 1].s === MUS.last) a.unshift(a.pop());
    MUS.q = a;
  }
  const t = MUS.q.pop();
  MUS.last = t.s;
  MUS.cur = t;
  MUS.a.src = t.s;
  musShow();
  if (MUS.on) musPlay();
}
MUS.a.addEventListener("playing", () => {
  MUS.fail = 0;
  MUS.pend = 0;
  musShow();
});
MUS.a.addEventListener("ended", musNext);
MUS.a.addEventListener("error", () => {
  MUS.fail++;
  if (MUS.fail < MUS.list.length) musNext();
  else {
    // Offline or the host is down: play on without music.
    MUS.on = 0;
    MUS.cur = null;
    $("mu").textContent = "MUSIC: OFF";
    musShow();
  }
});
function musToggle() {
  MUS.on ^= 1;
  $("mu").textContent = "MUSIC: " + (MUS.on ? "ON" : "OFF");
  if (!MUS.on) MUS.a.pause();
  else if (MUS.a.src && !MUS.fail) musPlay();
  else {
    MUS.fail = 0;
    musNext();
  }
  musShow();
}
