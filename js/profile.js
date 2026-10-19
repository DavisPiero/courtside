"use strict";
// Your profile on the account page: a profile picture, a title, and a showcase of your best animations and shoe.
// Saved in SAVE.prof (so it goes to your account when you're signed in). Lifetime totals in SAVE.life unlock titles.
// Pictures are 12 x 12 pixel art, drawn in code: each row is a string, each letter a colour from the picture's
// palette ("." is see-through). A few are drawn by a function instead (the ball, your face, your shoe, the ring).

const PICS = [
  { id: "ball", name: "Ball", fn: (R) => picBall(R) },
  { id: "flame", name: "Flame", pal: { r: "#ff3d2a", o: "#ff8a1a", y: "#ffd23c" }, art: [".....r......", "....rr......", "....rrr..r..", "...rrorr.rr.", "..rrroorrrr.", "..rrooorrrr.", ".rrooyooorr.", ".rroyyyoorr.", ".rroyyyyorr.", "..rooyyyor..", "...rooooor..", "....rrrrr..."] },
  { id: "crown", name: "Crown", pal: { y: "#ffd23c", Y: "#c99a1a", r: "#ff3d5a", b: "#4aa3ff" }, art: ["............", "............", ".y...yy...y.", ".yy..yy..yy.", ".yyy.yy.yyy.", ".yyyyyyyyyy.", ".yryyybyyry.", ".yyyyyyyyyy.", ".YYYYYYYYYY.", "............"] },
  { id: "star", name: "Star", pal: { y: "#ffd23c", w: "#fff6c8" }, art: [".....yy.....", ".....wy.....", "....ywyy....", "yyyyywyyyyyy", ".yyyyyyyyyy.", "..yyyyyyyy..", "...yyyyyy...", "..yyyyyyyy..", "..yyy..yyy..", ".yy......yy."] },
  { id: "trophy", name: "Trophy", pal: { y: "#ffd23c", Y: "#c99a1a", w: "#fff6c8" }, art: ["..yyyyyyyy..", "yyywyyyyyyyy", "y.ywyyyyyy.y", "y.yyyyyyyy.y", ".yyyyyyyyyy.", "...yyyyyy...", "....yyyy....", ".....yy.....", ".....yy.....", "....YYYY....", "...YYYYYY...", "...YYYYYY..."] },
  { id: "bolt", name: "Lightning", pal: { y: "#ffe23c", w: "#ffffff" }, art: ["......yyyy..", ".....ywyy...", "....ywyy....", "...yyyy.....", "..yyyyyyyy..", "......yyy...", ".....yyy....", "....yyy.....", "...yy.......", "..y........."] },
  { id: "hoop", name: "Hoop", pal: { w: "#e8eef8", r: "#ff5a2a", n: "#c9d1e6" }, art: ["wwwwwwwwwwww", "w..........w", "w...rrrr...w", "w...r..r...w", "wwwwrrrrwwww", "..rrrrrrrr..", "...n.nn.n...", "...nn..nn...", "....n..n....", "....nnnn...."] },
  { id: "gem", name: "Diamond", pal: { c: "#8af7ff", C: "#3ab8d8", w: "#ffffff" }, art: ["..cccccccc..", ".cwccCccCcc.", "cccccCCccccc", "CCCCCCCCCCCC", ".cCcccccccC.", "..cCccccCc..", "...cCccCc...", "....cCCc....", ".....cc....."] },
  { id: "rocket", name: "Rocket", pal: { w: "#eef2fa", r: "#ff3d4a", b: "#4aa3ff", o: "#ff8a1a", y: "#ffd23c" }, art: [".....rr.....", "....rwwr....", "....wwww....", "...wwbbww...", "...wwbbww...", "...wwwwww...", "...wwwwww...", "..rwwwwwwr..", ".rrwwwwwwrr.", ".rr.oyyo.rr.", ".....oo.....", ".....o......"] },
  { id: "kicks", name: "Your Kicks", fn: (R, g, x, y, px) => picKicks(g, x, y, px) },
  { id: "face", name: "Your Hooper", fn: (R) => picFace(R) },
  // Unlocked by doing things
  { id: "ring", name: "Ring", fn: (R) => picRing(R), need: () => leagueRings() > 0, how: "Win a Career League ring" },
  { id: "pumpkin", name: "Pumpkin", pal: { g: "#3d9a3a", o: "#ff7a1a", O: "#c8541a", y: "#ffd23c" }, art: [".....gg.....", "...ooggoo...", ".oooOooOooo.", "oooOooooOooo", "ooyyoOOoyyoo", "oyyyoOOoyyyo", "oooooyyooooo", "ooOooooooOoo", "oyoyyyyyyoyo", "ooyyoyyoyyoo", ".oooOooOooo.", "..oooooooo.."], need: () => evDone("halloween26") >= 2, how: "Halloween 2026: quest 2", lim: 1 },
  { id: "ghost", name: "Ghost", pal: { w: "#f2f2ff", g: "#b8b8d8", k: "#1a1430" }, art: ["....wwww....", "..wwwwwwww..", ".wwwwwwwwww.", ".wwkkwwkkww.", ".wwkkwwkkww.", "wwwwwwwwwwww", "wwwwwkkwwwww", "wwwwwkkwwwww", "wwwwwwwwwwgw", "wgwwwwwwwwww", "ww..wwww..ww", "w....ww....w"], need: () => evDone("halloween26") >= 6, how: "Halloween 2026: quest 6", lim: 1 },
];
const PIC = Object.fromEntries(PICS.map((p) => [p.id, p]));
const picOpen = (p) => !p.need || p.need();
const leagueRings = () => (SAVE.league && SAVE.league.rings) || 0;

// Draw picture id into canvas cv, as big as fits in whole pixels, on a dark tile.
function drawPic(cv, id, bg) {
  const w = cv.clientWidth || 64,
    h = cv.clientHeight || 64,
    dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(w * dpr)) (cv.width = Math.round(w * dpr)), (cv.height = Math.round(h * dpr));
  const g = cv.getContext("2d"),
    px = Math.max(1, Math.floor(Math.min(cv.width, cv.height) / 14)),
    x0 = Math.round((cv.width - 12 * px) / 2),
    y0 = Math.round((cv.height - 12 * px) / 2),
    R = (x, y, col) => {
      g.fillStyle = col;
      g.fillRect(x0 + x * px, y0 + y * px, px, px);
    },
    p = PIC[id] || PIC.ball;
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, cv.width, cv.height);
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, cv.width, cv.height);
  }
  if (p.fn) return p.fn(R, g, x0, y0, px);
  const top = Math.floor((12 - p.art.length) / 2);
  p.art.forEach((row, y) => [...row].forEach((ch, x) => ch !== "." && R(x, y + top, p.pal[ch])));
}
// A basketball: an orange disc with one-pixel dark seams (across, down, and two curves) and a highlight.
function picBall(R) {
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const dx = x + 0.5 - 6,
        dy = y + 0.5 - 6,
        d = hy(dx, dy);
      if (d > 6) continue;
      let col = d > 5.1 ? "#9a4614" : "#f08a2a";
      if (x === 6 || y === 6 || Math.abs(hy(dx + 7.2, dy) - 5.4) < 0.5 || Math.abs(hy(dx - 7.2, dy) - 5.4) < 0.5) col = "#4a1c06";
      if ((x === 3 && y === 3) || (x === 4 && y === 2)) col = "#ffc07a";
      R(x, y, col);
    }
}
// The shoes your team wears (a plain white pair until you have some), drawn at half size to fit.
function picKicks(g, x, y, px) {
  const h = Math.max(1, px >> 1),
    s = (SAVE.shoe && SHOE[SAVE.shoe]) || SHOE.af1;
  drawShoe(g, s, x + Math.round((12 * px - 24 * h) / 2), y + Math.round((12 * px - 13 * h) / 2), h, T);
}
// Your hooper's face: skin tone and hair from the campaign.
function picFace(R) {
  const sk = SK[SAVE.skin] || SK[3],
    dk = shade(sk, -0.3),
    hair = "#1a1210";
  for (let y = 1; y < 12; y++)
    for (let x = 2; x < 10; x++) {
      const dx = (x - 5.5) / 3.6,
        dy = (y - 6) / 5;
      if (dx * dx + dy * dy <= 1) R(x, y, sk);
    }
  const H = SAVE.hair;
  if (H !== 3) {
    const rows = H === 1 ? [0, 1, 2] : H === 4 ? [0, 1, 2, 3] : [1, 2];
    for (const y of rows) for (let x = H === 4 ? 1 : 2; x < (H === 4 ? 11 : 10); x++) if (y > 0 || H === 1 || H === 4) R(x, y, hair);
    if (H === 4) for (const y of [4, 5]) (R(1, y, hair), R(10, y, hair));
  }
  for (const x of [4, 7]) R(x, 6, "#1a1430");
  R(5, 8, dk);
  R(6, 8, dk);
  R(5, 9, "#8a2a2a");
  R(6, 9, "#8a2a2a");
}
// A championship ring: a gold band and a big stone.
function picRing(R) {
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const d = hy((x - 5.5) / 1.0, (y - 7) / 0.85);
      if (d > 3.4 && d < 5.4) R(x, y, d < 4.2 ? "#c99a1a" : "#ffd23c");
    }
  for (let y = 0; y < 4; y++) for (let x = 4 - (y === 1 || y === 2); x < 8 + (y === 1 || y === 2); x++) R(x, y, y === 0 ? "#cfe9ff" : "#4aa3ff");
  R(5, 1, "#ffffff");
}

// ---------- titles: shown under your name. Unlocked by things you've done.
const TITLES = [
  { id: "rookie", t: "Rookie", need: () => 1, how: "Everyone starts here" },
  { id: "hooper", t: "Hooper", need: () => (SAVE.life.games || 0) >= 10, how: "Play 10 games" },
  { id: "streetking", t: "Street King", need: () => starsOf(STREET_FINAL) > 0, how: "Win the Summer Jam" },
  { id: "champion", t: "Champion", need: () => starsOf("n3-6") > 0, how: "Win the NBA Finals" },
  { id: "ringchaser", t: "Ring Chaser", need: () => leagueRings() > 0, how: "Win a Career League ring" },
  { id: "pickpocket", t: "Pickpocket", need: () => (SAVE.life.stl || 0) >= 50, how: "Get 50 steals" },
  { id: "highflyer", t: "High Flyer", need: () => (SAVE.life.dunks || 0) >= 100, how: "Dunk 100 times" },
  { id: "sharpshooter", t: "Sharpshooter", need: () => (SAVE.life.threes || 0) >= 100, how: "Make 100 threes" },
  { id: "anklebreaker", t: "Ankle Breaker", need: () => (SAVE.life.ankles || 0) >= 100, how: "Break 100 ankles" },
  { id: "collector", t: "Collector", need: () => SAVE.owned.length >= 50, how: "Own 50 animations" },
  { id: "sneakerhead", t: "Sneakerhead", need: () => SAVE.shoes.length >= 20, how: "Own 20 shoes" },
  { id: "highroller", t: "High Roller", need: () => SAVE.cc >= 10000, how: "Have 10,000 CC at once" },
  { id: "pumpkinking", t: "Pumpkin King", need: () => evDone("halloween26") >= 8, how: "Halloween 2026: finish every quest", lim: 1 },
  // Only the account with the username King (the developer's).
  { id: "developer", t: "Developer", need: () => ACC.state === "in" && ACC.name.toLowerCase() === "king", how: "Made this game", dev: 1, secret: 1 },
];
const TITLE = Object.fromEntries(TITLES.map((t) => [t.id, t]));
// The title you show: the one you picked if you still have it, else Developer for King, else Rookie.
function myTitle() {
  const t = TITLE[SAVE.prof.title];
  if (t && t.need()) return t;
  return TITLE.developer.need() ? TITLE.developer : TITLE.rookie;
}

// ---------- lifetime totals (for titles): a game, campaign game or minigame just finished
function lifeCount(e) {
  const L = SAVE.life,
    add = (k, n) => n && (L[k] = (L[k] || 0) + n);
  if (!e.mini || e.mini === "1v1") add("games", 1);
  if (e.won && !e.mini) add("wins", 1);
  for (const k of ["dunks", "stl", "threes", "ankles", "blk"]) add(k, e.st[k] || 0);
}

// ---------- the account page
const PROF = { pick: "" };
function openProf() {
  show("prof");
  drawProf();
}
function drawProf() {
  const inn = ACC.state === "in",
    t = myTitle();
  drawPic($("pPic"), SAVE.prof.pic);
  drawGear($("gearCv"));
  $("pName").textContent = inn ? ACC.name.toUpperCase() : "GUEST";
  $("bPTitle").innerHTML = `${t.dev ? "★ " : ""}${t.t.toUpperCase()}${t.dev ? " ★" : ""}<u>▾</u>`;
  $("bPTitle").className = "ptitle" + (t.dev ? " dev" : t.lim ? " lim" : "");
  $("pCard").className = "pcard" + (t.dev ? " dev" : "");
  const o = typeof accOwner === "function" && accOwner();
  $("pStat").innerHTML = inn
    ? o && o.dirty
      ? "Saving to your account..."
      : `Signed in · saved ${agoText(ACC.last)}`
    : ACC.state === "off"
      ? "Offline · your progress is saved on this device"
      : `Guest · your progress is only on this device <button class="btn lnk" id="bPSign">SIGN IN</button>`;
  if ($("bPSign")) $("bPSign").onclick = openAcct;
  const nums = [
    ["RATING", hooperOvr()],
    ["RINGS", leagueRings()],
    ["COINS", SAVE.cc.toLocaleString()],
    ["MOVES", `${SAVE.owned.length}/${ANIMS.filter((a) => a.rarity !== "starter").length}`],
    ["SHOES", `${SAVE.shoes.length}/${SHOES.length}`],
    ["WINS", SAVE.life.wins || 0],
  ];
  $("pNums").innerHTML = nums.map(([l, v]) => `<div><b>${v}</b><i>${l}</i></div>`).join("");
  // Showcase: three moves and a pair of shoes.
  const sh = SAVE.prof.show,
    slot = (i) => {
      const a = ANIM[sh[i]] && owns(sh[i]) ? ANIM[sh[i]] : null;
      return a
        ? `<button class="pslot r-${a.rarity}" data-s="${i}"><canvas id="pShow${i}"></canvas><b>${a.name}</b><span class="rtag r-${a.rarity}">${RARITY[a.rarity].name}</span></button>`
        : `<button class="pslot empty" data-s="${i}"><em>+</em><b>ADD A MOVE</b></button>`;
    },
    s = SHOE[SAVE.prof.shoe] && ownsShoe(SAVE.prof.shoe) ? SHOE[SAVE.prof.shoe] : null;
  $("pShow").innerHTML =
    [0, 1, 2].map(slot).join("") +
    (s
      ? `<button class="pslot shoe r-${s.rarity}" data-s="shoe"><canvas id="pShowShoe"></canvas><b>${s.name}</b><span class="rtag r-${s.rarity}">${RARITY[s.rarity].name}</span></button>`
      : `<button class="pslot shoe empty" data-s="shoe"><em>+</em><b>ADD YOUR KICKS</b></button>`);
  $("pShow").querySelectorAll(".pslot").forEach((b) => (b.onclick = () => (b.dataset.s === "shoe" ? pickShoe() : pickMove(+b.dataset.s))));
  $("bPPic").onclick = pickPic;
  $("bPTitle").onclick = pickTitle;
  $("bGear").onclick = openAcct;
  $("bProfX").onclick = () => show("menu");
}
// The showcase moves play on a loop while the page is open (called every frame from js/menus.js invPreview).
function profPreview() {
  if (!$("prof").classList.contains("on") || $("ppick").classList.contains("on")) return;
  SAVE.prof.show.forEach((id, i) => {
    const cv = $("pShow" + i);
    if (cv && ANIM[id]) previewAnim(cv, previewModel("show" + i), id);
  });
  if ($("pShowShoe")) shoeCanvas($("pShowShoe"), SHOE[SAVE.prof.shoe], T);
}
// A little pixel gear: eight teeth round a ring.
function drawGear(cv) {
  const w = cv.clientWidth || 28,
    dpr = devicePixelRatio || 1;
  cv.width = cv.height = Math.round(w * dpr);
  const g = cv.getContext("2d"),
    px = Math.max(1, Math.floor(cv.width / 12));
  g.clearRect(0, 0, cv.width, cv.height);
  g.fillStyle = "#c9d1e6";
  const o = Math.round((cv.width - 12 * px) / 2);
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const dx = x - 5.5,
        dy = y - 5.5,
        d = hy(dx, dy),
        a = Math.atan2(dy, dx);
      if (d > 1.9 && d < (Math.cos(a * 8) > 0.2 ? 6 : 4.6)) g.fillRect(o + x * px, o + y * px, px, px);
    }
}

// ---------- choosers
function openPP(title, html, after) {
  $("ppT").textContent = title;
  $("ppG").innerHTML = html;
  $("ppick").classList.add("on");
  $("bPpX").onclick = closePP;
  if (after) after();
}
function closePP() {
  $("ppick").classList.remove("on");
}
function pickPic() {
  openPP(
    "PICTURE",
    PICS.map((p) => {
      const open = picOpen(p);
      return `<button class="ppopt pic${SAVE.prof.pic === p.id ? " on" : ""}${open ? "" : " locked"}${p.lim ? " r-limited" : ""}" data-v="${p.id}" ${open ? "" : "disabled"}><canvas data-pic="${p.id}"></canvas><b>${p.name}</b>${open ? "" : `<span>${p.how}</span>`}</button>`;
    }).join(""),
    () => {
      $("ppG").querySelectorAll("canvas[data-pic]").forEach((cv) => drawPic(cv, cv.dataset.pic));
      $("ppG").querySelectorAll(".ppopt").forEach((b) => (b.onclick = () => ((SAVE.prof.pic = b.dataset.v), writeSave(), closePP(), drawProf(), accButton())));
    },
  );
}
function pickTitle() {
  const mine = myTitle().id;
  openPP(
    "TITLE",
    TITLES.filter((t) => !t.secret || t.need())
      .map((t) => {
        const open = t.need();
        return `<button class="ppopt ttl${mine === t.id ? " on" : ""}${open ? "" : " locked"}${t.dev ? " dev" : t.lim ? " r-limited" : ""}" data-v="${t.id}" ${open ? "" : "disabled"}><b>${t.t}</b><span>${open ? (t.lim ? "LIMITED · " : "") + t.how : "LOCKED · " + t.how}</span></button>`;
      })
      .join(""),
    () => $("ppG").querySelectorAll(".ppopt").forEach((b) => (b.onclick = () => ((SAVE.prof.title = b.dataset.v), writeSave(), closePP(), drawProf()))),
  );
}
// A showcase slot: any move you own (best first), or empty it.
function pickMove(i) {
  const list = ANIMS.filter((a) => a.rarity !== "starter" && owns(a.id)).sort((a, b) => RANK.indexOf(b.rarity) - RANK.indexOf(a.rarity) || a.name.localeCompare(b.name));
  openPP(
    "SHOWCASE: A MOVE",
    `<button class="ppopt mv" data-v=""><b>EMPTY</b><span>Leave this slot empty</span></button>` +
      (list.length ? "" : `<p class="ppnone">Open packs or visit the Daily Shop to collect moves.</p>`) +
      list.map((a) => `<button class="ppopt mv r-${a.rarity}${SAVE.prof.show[i] === a.id ? " on" : ""}" data-v="${a.id}"><b>${a.name}</b><span class="rtag r-${a.rarity}">${RARITY[a.rarity].name} · ${CATS.find((c) => c[0] === a.cat)[1]}</span></button>`).join(""),
    () =>
      $("ppG").querySelectorAll(".ppopt").forEach(
        (b) =>
          (b.onclick = () => {
            const v = b.dataset.v,
              S = SAVE.prof.show;
            if (v && S.includes(v)) S[S.indexOf(v)] = S[i]; // already in another slot: swap them
            S[i] = v;
            writeSave();
            closePP();
            drawProf();
          }),
      ),
  );
}
function pickShoe() {
  const list = SHOES.filter((s) => ownsShoe(s.id)).sort((a, b) => RANK.indexOf(b.rarity) - RANK.indexOf(a.rarity) || a.name.localeCompare(b.name));
  openPP(
    "SHOWCASE: YOUR KICKS",
    `<button class="ppopt mv" data-v=""><b>EMPTY</b><span>Leave this slot empty</span></button>` +
      (list.length ? "" : `<p class="ppnone">Open Shoeboxes in the Shop to collect shoes.</p>`) +
      list.map((s) => `<button class="ppopt pshoe r-${s.rarity}${SAVE.prof.shoe === s.id ? " on" : ""}" data-v="${s.id}"><canvas data-shoe="${s.id}"></canvas><b>${s.name}</b><span class="rtag r-${s.rarity}">${RARITY[s.rarity].name}</span></button>`).join(""),
    () => {
      $("ppG").querySelectorAll("canvas[data-shoe]").forEach((cv) => shoeCanvas(cv, SHOE[cv.dataset.shoe]));
      $("ppG").querySelectorAll(".ppopt").forEach((b) => (b.onclick = () => ((SAVE.prof.shoe = b.dataset.v), writeSave(), closePP(), drawProf())));
    },
  );
}
