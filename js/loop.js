"use strict";
// Fixed-step simulation, HUD updates and the main animation loop.
function step(dt) {
  dt = Math.min(dt, 0.04);
  if (G.hs > 0) {
    G.hs -= dt;
    return;
  }
  if (G.tip) {
    tipUpd(dt);
  } else if (G.cut) {
    cutUpd(dt);
  } else if (G.dead > 0) {
    G.dead -= dt;
    G.pl.forEach((p) => {
      p.vx *= 0.92;
      p.vy *= 0.92;
      integ(p, dt);
    });
    ballUpd(dt);
    if (G.dead <= 0) {
      G.dead = 0;
      setPoss(G.next);
    }
  } else {
    ctrlSel(dt);
    human(dt);
    ai(dt);
    G.pl.forEach((p) => integ(p, dt));
    separate();
    ballUpd(dt);
    if (G.shot) {
      G.shot.t += dt;
      const m = G.shot.t / G.shot.d;
      if ((!keys.has("Space") && G.shot.t > 0.1) || m >= 1) {
        const q = 1 - Math.min(1, Math.abs(m - 0.72) * 2.5);
        G.mres = { p: G.shot.p, m: cl(m, 0, 1), g: q > 0.82, until: T + 0.9 };
        launch(G.shot.p, q, 0);
      }
    }
    if (!G.prac) {
      G.time -= dt;
      G.sc -= dt;
      if (G.time <= 0) {
        G.q++;
        if (G.q > 4) {
          end();
          return;
        }
        G.time = 240;
        toast("END OF Q" + (G.q - 1), 1.5);
        sfx("buzz");
        setPoss(G.q % 2 ? 0 : 1);
      }
      if (G.sc <= 0) {
        toast("SHOT CLOCK", 0.8);
        setPoss(1 - G.poss);
      }
    }
  }
  for (let i = G.fx.length - 1; i >= 0; i--) {
    const s = G.fx[i];
    s.l -= dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.z += s.vz * dt;
    s.vz -= 30 * dt;
    if (s.b && s.z < 0 && G.stain.length < 160) G.stain.push([s.x, s.y, Math.random() < 0.5 ? 1 : 2]);
    if (s.l <= 0 || s.z < 0) G.fx.splice(i, 1);
  }
  G.hype *= Math.pow(0.6, dt);
  G.rim[0] = Math.max(0, G.rim[0] - dt * 0.9);
  G.rim[1] = Math.max(0, G.rim[1] - dt * 0.9);
  if (G.tt > 0) {
    G.tt -= dt;
    if (G.tt <= 0) $("toast").style.opacity = 0;
  }
  const bb = G.ball;
  if (bb.mode === "shot" || bb.mode === "pass") {
    G.tr.push([bb.x, bb.y, bb.z]);
    if (G.tr.length > 9) G.tr.shift();
  } else G.tr.length = 0;
  G.was = new Set(keys);
}
function vmUpd() {
  const vm = $("vm");
  let sp = null,
    m = 0,
    cls = "";
  if (G.shot) {
    sp = G.shot.p;
    m = cl(G.shot.t / G.shot.d, 0, 1);
  } else if (G.mres && T < G.mres.until) {
    sp = G.mres.p;
    m = G.mres.m;
    cls = G.mres.g ? "g" : m < 0.65 ? "e" : "l";
  }
  const q = sp && !G.cut ? P(sp.x, sp.y, sp.z + 4.2) : null;
  if (!q) {
    vm.style.display = "none";
    return;
  }
  vm.style.display = "block";
  vm.style.height = cl((q[3] * 5.2 * H) / RH, 90, 170) + "px";
  vm.style.left = ((q[0] + q[3] * 1.9) * W) / RW + "px";
  vm.style.top = (q[1] * H) / RH + "px";
  $("vf").style.height = m * 100 + "%";
  $("vn").style.bottom = "calc(" + m * 100 + "% - 2px)";
  vm.className = cls;
  $("vl").textContent = cls === "g" ? "PERFECT!" : cls === "e" ? "EARLY" : cls === "l" ? "LATE" : "";
}
function hud() {
  vmUpd();
  const p = G.pl[G.ctrl],
    n = NM[G.ctrl];
  $("hn").textContent = TM[0].c;
  $("an").textContent = TM[1].c;
  $("hs").textContent = G.home;
  $("as").textContent = G.away;
  $("qt").textContent = "Q" + G.q;
  $("clk").textContent = G.prac
    ? "--"
    : Math.floor(G.time / 60) + ":" + String(Math.floor(G.time % 60)).padStart(2, "0");
  $("sck").textContent = G.prac ? "--" : Math.ceil(G.sc);
  $("num").textContent = p.n;
  $("pn").textContent = n[0];
  $("pp").textContent = n[1] + " · OVR " + n[2];
  $("s1").textContent = G.st.pts;
  $("s2").textContent = G.st.reb;
  $("s3").textContent = G.st.ast;
  $("s4").textContent = G.st.stl;
  $("fps").textContent = Math.round(G.fps) + " FPS · " + (G.cm === "c" ? "CHASE" : "BROADCAST") + " CAM";
}
let acc = 0;
function loop(t) {
  // Schedule the next frame first, so one bad frame can never freeze the game.
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (t - lt) / 1000 || 0);
  lt = t;
  T = t / 1000;
  G.fps = lp(G.fps, 1 / Math.max(dt, 0.001), 0.05);
  if (G.run && !G.pause) {
    acc += dt;
    let n = 0;
    while (acc >= 1 / 120 && n < 8) {
      step(1 / 120);
      acc -= 1 / 120;
      n++;
    }
    if (n >= 8) acc = 0;
    hud();
  }
  camUpd(dt);
  render();
}
function pause() {
  G.pause = !G.pause;
  $("pause").style.display = G.pause ? "grid" : "none";
  $("ctl").style.display = "none";
  G.click = 0;
  keys.clear();
}
