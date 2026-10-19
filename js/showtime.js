"use strict";
// Showtime: the extras that make a game feel big.
// - ON FIRE: three baskets in a row without the other team scoring sets your team on fire: a flaming ball and a
//   bigger green zone until they score. Works for the opponents too.
// - ALLEY-OOPS: teammates sometimes cut to the rim. When one is open near the rim a gold OOP marker shows over them
//   and PASS (Q, or the PASS button, which says OOP!) throws the lob: they catch it in the air and dunk it.
// - BUZZER BEATERS: a shot in the air when the clock hits zero still counts. Time slows down while it flies, and
//   if it goes in at the end of the game it's a BUZZER BEATER.
// - THE WIN: win a Quick Play or NBA game and your team celebrates at centre court, your best player lifts a
//   trophy, confetti falls. Winning the NBA Finals is CHAMPIONS. Tap, Space or Enter skips.

// ---------- On Fire
const FIRE_AT = 3; // baskets in a row
function fireScore(t) {
  G.streak[t]++;
  G.streak[1 - t] = 0;
  if (G.fire[1 - t]) {
    G.fire[1 - t] = 0;
    if (t === 0) toast("FIRE'S OUT!", 0.9);
  }
  if (!G.fire[t] && G.streak[t] >= FIRE_AT) {
    G.fire[t] = 1;
    sfx("fire");
    G.hype = 1;
    later2(() => (toast(t === 0 ? "ON FIRE!" : "THEY'RE ON FIRE!", 1.4), flashScreen(t === 0 ? "#ff5a12" : "#ff2a12")), 900);
  }
}
// A small delay that's safe if the game ends meanwhile.
function later2(f, ms) {
  setTimeout(() => G.run && f(), ms);
}
// Flames off the ball (while your on-fire team has it or shoots it), every simulation step.
function fireFx(dt) {
  const b = G.ball,
    t = b.own >= 0 ? G.pl[b.own].t : b.mode === "shot" ? b.h : -1;
  b.fire = t >= 0 && G.fire[t] ? 1 : 0;
  if (!b.fire || G.win) return;
  if (Math.random() < dt * 70)
    G.fx.push({
      x: b.x + rn(-0.3, 0.3),
      y: b.y + rn(-0.3, 0.3),
      z: b.z + rn(0, 0.4),
      vx: rn(-1.5, 1.5) - b.vx * 0.15,
      vy: rn(-1.5, 1.5) - b.vy * 0.15,
      vz: rn(2, 5),
      l: rn(0.2, 0.45),
      c: ["#ff7a1a", "#ffcf5c", "#ff3b1a", "#fff1a8"][(Math.random() * 4) | 0],
      up: 1, // rises instead of falling
    });
}

// ---------- Alley-oops
// Off-ball teammates now and then cut hard to the rim. Called from ai() for a player on offence.
// Returns true if this player is cutting (and has been moved).
function oopCut(p, dt) {
  const b = G.ball,
    hx = HX(p.t),
    d = p.t ? -1 : 1,
    hd = b.own >= 0 ? G.pl[b.own] : null;
  if (!hd || hd.t !== p.t) return (p.cut2 = 0), (p.oop = 0), false;
  // Only once the ball is past half court.
  if ((hd.x - 47) * d < 0) return (p.cut2 = 0), (p.oop = 0), false;
  if (!p.cut2) {
    p.cutCd = (p.cutCd || rn(2, 5)) - dt;
    if (p.cutCd > 0) return false;
    p.cut2 = rn(1.6, 2.4); // how long the cut lasts
    p.cutCd = rn(4, 8);
    p.cutY = 25 + rn(-3, 3);
  }
  p.cut2 = Math.max(0, p.cut2 - dt);
  mv(p, hx - d * 2.5, p.cutY, 1.15, dt);
  p.ft = Math.atan2(25 - p.y, hx - p.x);
  const dh = hy(hx - p.x, 25 - p.y);
  p.oop = p.cut2 > 0 && dh < 16 && dh > 3 && minDef(p) > 3 ? 1 : 0;
  return p.cut2 > 0;
}
// The teammate an alley-oop would go to right now, or null.
function oopMate(p) {
  if (!p || G.ball.own !== p.id || G.shot || G.cut) return null;
  for (const q of G.pl) if (q.t === p.t && q !== p && q.oop && !q.rag) return q;
  return null;
}
// Throw the lob: the receiver goes straight into a dunk cutscene and catches the ball in the air.
function alleyOop(p, q) {
  const b = G.ball;
  q.oop = q.cut2 = 0;
  p.pas = 0.25;
  sfx("lob");
  if (p.t === 0) {
    G.ctrl = q.id;
    G.st.ast++;
    G.st.oops = (G.st.oops || 0) + 1;
  }
  b.from = p.id;
  b.pT = T;
  const sx = b.x,
    sy = b.y,
    sz = b.z;
  scripted(q, "dunk");
  if (G.cut) G.cut.oop = { sx, sy, sz };
}
// Where the lobbed ball is during an alley-oop cutscene: arcing from the passer to the catching hand.
// w: 0 at the throw, 1 at the catch. hand: the catcher's hand in world feet.
function oopBall(c0, w, hand) {
  const o = c0.oop,
    e = ease(cl(w, 0, 1));
  return [lp(o.sx, hand[0], e), lp(o.sy, hand[1], e), lp(o.sz, hand[2], e) + Math.sin(e * Math.PI) * 6];
}
// A gold marker over a teammate who's open for an alley-oop (drawn in the world, after the players).
function oopHint() {
  const q = G.run && !G.cut && !G.win && oopMate(G.pl[G.ctrl]);
  if (!q) return;
  const s = P(q.x, q.y, q.z + 8.6 * (q.ht / 78));
  if (!s) return;
  const k = Math.max(2, Math.round(s[3] * 0.32)),
    y = Math.round(s[1] - 2 + Math.sin(T * 10) * 2),
    x = Math.round(s[0]);
  c.fillStyle = "#1a1408";
  c.fillRect(x - k * 2 - 1, y - k - 1, k * 4 + 2, k + 2);
  c.fillStyle = "#ffcf5c";
  // a chevron pointing down
  for (let i = 0; i < k; i++) c.fillRect(x - k * 2 + i * 2, y - k + i, k * 4 - i * 4, 1);
}

// ---------- Buzzer beaters: when the clock hits zero with a shot in the air, it still counts.
// Called from step() instead of ending the quarter. Returns true while it's handling things.
function buzzerStart() {
  const b = G.ball;
  if (b.mode !== "shot") return false;
  G.bb = { t: 0, done: 0, last: G.q >= G.rules.nq, team: b.h };
  sfx("buzz");
  return true;
}
// Every step while a buzzer shot is live. dt is real time; the game runs slowed down until the shot lands.
function buzzerUpd(dt) {
  const k = G.bb,
    b = G.ball;
  k.t += dt;
  if (!k.done && b.mode !== "shot") {
    k.done = k.t;
    if (b.made) {
      if (k.last) {
        $("ttl").innerHTML = "BUZZER BEATER!" + (k.team === 0 ? "<small>AT THE HORN!</small>" : "<small>NOOOO!</small>");
        $("ttl").className = "on";
        sfx("cheer");
        if (k.team === 0) G.st.bb = (G.st.bb || 0) + 1;
      } else toast("AT THE BUZZER!", 1.2);
      G.shake = 0.6;
    }
  }
  if (k.done && k.t - k.done > (b.made && k.last ? 2.2 : 1.0)) {
    G.bb = null;
    G.dead = 0;
    $("ttl").className = "";
    quarterEnd();
  }
}
// ---------- Adaptive AI (js/core.js oppD): every step, the opponents' boost eases toward a target set by your lead
// (from 4 points up, full at 20) plus a little for how far into the game it is. It drops back if they catch up.
function adaptUpd(dt) {
  if (G.prac || (G.mg && G.mg.k !== "1v1")) return (G.adapt = 0);
  const lead = G.home - G.away,
    nq = (G.rules && G.rules.nq) || 4,
    qlen = (G.rules && G.rules.qlen) || 60,
    prog = G.rules && G.rules.target ? Math.max(G.home, G.away) / G.rules.target : cl((G.q - 1 + 1 - G.time / qlen) / nq, 0, 1),
    target = cl(cl((lead - 4) / 16, 0, 1) * 0.85 + prog * 0.25, 0, 1);
  G.adapt = Math.round((G.adapt + (target - G.adapt) * Math.min(1, dt * 0.12)) * 1000) / 1000;
  if (G.adapt > 0.5 && !G.adaptSaid && !G.auto) {
    G.adaptSaid = 1;
    toast("THEY'RE ADJUSTING!", 1.4);
  }
}
// Slow motion while the buzzer shot flies.
const bbSlow = () => (G.bb && !G.bb.done ? 0.35 : 1);
function quarterEnd() {
  G.q++;
  if (G.q > G.rules.nq) return end();
  G.time = G.rules.qlen;
  toast("END OF Q" + (G.q - 1), 1.5);
  sfx("buzz");
  setPoss(G.q % 2 ? 0 : 1);
}

// ---------- The win: a short celebration before the results.
// Which games get it: Quick Play and the NBA campaign (the Street campaign has its own story scenes).
const winsCelebrate = () => !G.prac && !G.mg && G.home > G.away && (!G.camp || G.camp.cid === "nba");
function startWin() {
  const finals = (G.camp && G.camp.cid === "nba" && G.camp.ci === 2 && G.camp.gi === 5) || !!(G.league && G.league.clinch),
    mine = G.pl.filter((p) => p.t === 0),
    star = G.camp || G.league ? G.pl[0] : mine.reduce((a, p) => (NM[p.id][2] > NM[a.id][2] ? p : a), mine[0]);
  G.win = { t: 0, d: finals ? 5.5 : 4.2, finals, star: star.id, cx: 47, cy: 10 };
  G.cut = G.shot = null;
  G.bb = null;
  G.dead = 0;
  $("meter").classList.remove("on");
  $("vm").style.display = "none";
  document.body.classList.add("cine");
  const b = G.ball;
  Object.assign(b, { own: -1, mode: "cut", vx: 0, vy: 0, vz: 0 });
  // Where everyone heads: your three at centre court, the other team walking off.
  G.pl.forEach((p) => {
    p.stun = 0;
    p.rag = p.sl = p.mv = null;
    p.pun = 0;
    p.stt = "";
    p.oop = 0;
    if (p.t === 0) {
      const slot = p.id === star.id ? 0 : p.id === mine.find((q) => q !== star).id ? -1 : 1;
      p.wx = 47 + slot * 3.4;
      p.wy = 25 + Math.abs(slot) * 1.2;
    } else {
      // the losers trudge off, behind your team and away from the camera
      p.wx = 68 + p.i * 7;
      p.wy = 45;
    }
  });
  $("ttl").innerHTML = finals ? "CHAMPIONS!<small>NBA FINALS</small>" : "YOU WIN!" + `<small>${TM[0].c} ${G.home} – ${G.away} ${TM[1].c}</small>`;
  $("ttl").className = "on";
  sfx("horn");
  later2(() => sfx("cheer"), 300);
}
function winUpd(dt) {
  const w = G.win,
    star = G.pl[w.star];
  w.t += dt;
  G.pl.forEach((p) => {
    const dx = p.wx - p.x,
      dy = p.wy - p.y,
      d = hy(dx, dy),
      sp = p.t === 0 ? 14 : 5;
    if (d > 0.3) {
      p.vx = (dx / d) * Math.min(sp, d * 4);
      p.vy = (dy / d) * Math.min(sp, d * 4);
    } else p.vx = p.vy = 0;
    if (p.t === 0) {
      // Face the camera once there; teammates jump up and down.
      if (d < 1) {
        p.ft = Math.atan2(G.win.cy - p.y, G.win.cx - p.x);
        p.stt = p === star ? "" : "cel";
        if (p !== star && p.z === 0 && w.t > 0.8 && Math.random() < dt * 3) p.vz = 9;
      }
    } else p.ft = Math.atan2(p.vy, p.vx);
    integ(p, dt);
  });
  // The trophy goes up once the winner is in place.
  star.trophy = w.t > 0.7 ? Math.min(1, (w.t - 0.7) / 0.5) : 0;
  const b = G.ball;
  Object.assign(b, { x: 47 - 6, y: 30, z: 0.5 });
  // Confetti in your team's colours, floating down.
  const cols = [TM[0].j, TM[0].t, "#ffcf5c", "#ffffff"];
  for (let i = 0; i < (w.finals ? 4 : 2); i++)
    G.fx.push({ x: 47 + rn(-14, 14), y: 25 + rn(-12, 12), z: rn(14, 20), vx: rn(-1, 1), vy: rn(-1, 1), vz: rn(-3, -1), l: 6, c: cols[(Math.random() * 4) | 0], cf: 1 });
  if (w.t >= w.d) winDone();
}
function winSkip() {
  if (G.win && G.win.t > 0.6) G.win.t = G.win.d;
}
function winDone() {
  const star = G.win && G.pl[G.win.star];
  if (star) star.trophy = 0;
  G.win = null;
  G.winDone = 1;
  $("ttl").className = "";
  document.body.classList.remove("cine");
  end();
}
// The win camera: low, in front of your team, slowly circling.
function winCam() {
  const w = G.win,
    a = -Math.PI / 2 + Math.sin(w.t * 0.35) * 0.5,
    R = 21,
    cx = 47,
    cy = 25;
  w.cx = cx + Math.cos(a) * R;
  w.cy = cy + Math.sin(a) * R;
  const px = w.cx,
    py = w.cy,
    pz = 5,
    lz = 8.5;
  V.x = px;
  V.y = py;
  V.z = pz;
  V.yaw = Math.atan2(cy - py, cx - px);
  V.p = Math.atan2(pz - lz, R);
  V.fl = 1.15;
}
// The trophy, drawn into the winner's sprite above their head (see buildSprite). g: the sprite context.
// (x, y): where the hands are, k: pixels per foot. finals: the gold championship trophy with a ball on top.
function drawTrophy(g, x, y, k, finals) {
  const R = (cx, cy, w, h, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x + cx * k), Math.round(y + cy * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)));
  };
  const gold = "#ffcf3a",
    dk = "#b8862a",
    hi = "#fff1a8";
  // base and stem
  R(-0.45, -0.25, 0.9, 0.3, "#3a2a14");
  R(-0.2, -0.75, 0.4, 0.55, dk);
  R(-0.12, -0.75, 0.1, 0.55, gold);
  if (finals) {
    // tall gold body with a ball on top
    R(-0.35, -2.0, 0.7, 1.3, gold);
    R(-0.35, -2.0, 0.15, 1.3, hi);
    R(0.2, -2.0, 0.15, 1.3, dk);
    R(-0.4, -2.75, 0.8, 0.75, gold);
    R(-0.3, -2.65, 0.25, 0.3, hi);
  } else {
    // a cup with handles
    R(-0.6, -1.65, 1.2, 0.9, gold);
    R(-0.6, -1.65, 0.25, 0.9, hi);
    R(0.4, -1.65, 0.2, 0.9, dk);
    R(-0.85, -1.55, 0.25, 0.15, dk);
    R(-0.85, -1.55, 0.12, 0.5, dk);
    R(0.6, -1.55, 0.25, 0.15, dk);
    R(0.73, -1.55, 0.12, 0.5, dk);
  }
}
