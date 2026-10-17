"use strict";
// Game camera, dunk cutscene camera and tip-off camera.
// ---------- camera
function camUpd(dt) {
  const b = G.ball,
    fo = b.own >= 0 ? G.pl[b.own] : b;
  if (!G.run) {
    const a = T * 0.12;
    cam.x = 47 + Math.cos(a) * 50;
    cam.y = 25 + Math.sin(a) * 34;
    cam.z = 16;
    cam.yaw = Math.atan2(25 - cam.y, 47 - cam.x);
    cam.p = 0.36;
    cam.fl = 1.1;
    cfx = 47;
    cfy = 25;
  } else {
    const bc = G.cm === "b",
      ty = bc ? Math.PI / 2 : G.poss ? Math.PI : 0,
      bk = bc ? 27 : 22,
      hi = bc ? 19 : 12.5,
      la = bc ? 0 : 7;
    cam.yaw += ad(ty - cam.yaw) * Math.min(1, dt * 2.2);
    cfx = lp(cfx, lp(fo.x, HX(G.poss), 0.16), Math.min(1, dt * 4));
    cfy = lp(cfy, bc ? 25 : lp(fo.y, 25, 0.12), Math.min(1, dt * 4));
    cam.x = cl(cfx - Math.cos(cam.yaw) * bk, -16, 110);
    cam.y = cl(cfy - Math.sin(cam.yaw) * bk, -20, 70);
    cam.z = hi;
    cam.p = Math.atan2(hi - 3.2, bk + la);
    cam.fl = 1.1;
  }
  const k = G.cut;
  // Buzzer shot in the air: lean in a little.
  G.bbz = lp(G.bbz || 0, G.bb && !G.bb.done ? 1 : 0, Math.min(1, dt * 4));
  if (G.win) winCam();
  else if (k && k.kind === "dunk") {
    const u = cl(k.t / k.d, 0, 1),
      w = sm(cl(Math.min(u / 0.12, (1 - u) / 0.1), 0, 1)),
      a0 = Math.atan2(k.side * 9, -k.dir * 11) + (u - 0.5) * 0.5,
      R = 19,
      px = k.h + Math.cos(a0) * R,
      py = 25 + Math.sin(a0) * R,
      pz = 6 + u * 1.5,
      lx = k.h - k.dir * 1.2,
      ly = 25,
      lz = 8,
      yw = Math.atan2(ly - py, lx - px),
      pt = Math.atan2(pz - lz, hy(lx - px, ly - py));
    V.x = lp(cam.x, px, w);
    V.y = lp(cam.y, py, w);
    V.z = lp(cam.z, pz, w);
    V.yaw = cam.yaw + ad(yw - cam.yaw) * w;
    V.p = lp(cam.p, pt, w);
    V.fl = lp(cam.fl, 1.15 + 0.25 * sm(cl((u - 0.5) * 4, 0, 1)), w);
  } else {
    Object.assign(V, cam);
    V.fl = cam.fl + 0.3 * G.bbz;
  }
  camOv();
}
function camOv() {
  let o = null;
  const k = G.cut;
  if (G.tip) o = { x: 47 + Math.sin(T * 0.3) * 3, y: -2, z: 9, lx: 47, ly: 25, lz: 5.5, fl: 1.1, w: 1 };
  if (!o) return;
  const w = o.w,
    yw = Math.atan2(o.ly - o.y, o.lx - o.x),
    pt = Math.atan2(o.z - o.lz, hy(o.lx - o.x, o.ly - o.y));
  V.x = lp(V.x, o.x, w);
  V.y = lp(V.y, o.y, w);
  V.z = lp(V.z, o.z, w);
  V.yaw = V.yaw + ad(yw - V.yaw) * w;
  V.p = lp(V.p, pt, w);
  V.fl = lp(V.fl, o.fl, w);
}
