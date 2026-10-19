"use strict";
// Shoes: collectable sneakers your whole team wears in games. Real shoe names, no logos (drawn in code).
// You get them from mystery Shoeboxes in the Shop (one shoe a box) or the one shoe in the Daily Shop.
// Equip one in the Inventory (SHOES tab). Rarities use the same table as animations (js/packs.js).
// Colours: up = the upper, ov = overlays (toe, heel, collar), ac = the stripe or swoosh, so = the sole.
// cut: low, mid or high top. glow: the sole lights up (1, or the colour it pulses to). mark: "flame" for Launched,
// "pumpkin" for Jack-O.
const SH = (id, name, rarity, up, ov, ac, so, cut, desc, glow) => ({ id, name, rarity, up, ov, ac, so, cut, desc, glow });
const SHOES = [
  // Common
  SH("af1", "Air Force 1 Low", "common", "#f2f2f2", "#e2e2e2", "#ffffff", "#ffffff", "low", "All white. The classic."),
  SH("chuck", "Chuck Taylor All Star", "common", "#1c1c1f", "#1c1c1f", "#ffffff", "#f1ead8", "high", "Canvas high-tops. Where it all started."),
  SH("superstar", "Adidas Superstar", "common", "#f4f4f4", "#f4f4f4", "#111111", "#f4f4f4", "low", "Shell toe, three stripes."),
  SH("blazer", "Blazer Mid '77", "common", "#f3f3f3", "#f3f3f3", "#111111", "#efe6cf", "mid", "Old-school mid with a vintage sole."),
  SH("clyde", "Puma Clyde", "common", "#c8202f", "#c8202f", "#ffffff", "#f2f2f2", "low", "Suede, smooth, Walt Frazier style."),
  SH("impact", "Air Max Impact", "common", "#1d2a4a", "#1d2a4a", "#ffffff", "#ffffff", "mid", "Navy hoops shoe, all-day bounce."),
  SH("dame", "Adidas Dame 8", "common", "#2b2b2b", "#2b2b2b", "#ffcf3a", "#ffffff", "low", "Built for logo threes."),
  SH("giannis", "Giannis Immortality", "common", "#3a7bd5", "#2d63b0", "#ffffff", "#e9e9e9", "low", "Light, quick, Greek Freak blue."),
  SH("twowxy", "New Balance Two WXY", "common", "#8a8f98", "#6c717a", "#ffffff", "#e9e9e9", "mid", "Grey, clean, quietly good."),
  SH("flow", "Curry Flow 10", "common", "#f4f4f4", "#e7e7e7", "#1d428a", "#ffc72c", "low", "Grippy sole, no rubber needed."),
  // Rare
  SH("aj1royal", "Air Jordan 1 'Royal'", "rare", "#1a3fa0", "#111111", "#111111", "#f2f2f2", "high", "Royal blue and black. A legend."),
  SH("grinch", "Kobe 6 Protro 'Grinch'", "rare", "#7ed321", "#6bbd1a", "#e5242b", "#2b2b2b", "low", "Lime green scales. Christmas Day classic."),
  SH("aj4fire", "Air Jordan 4 'Fire Red'", "rare", "#f4f4f4", "#d0202c", "#111111", "#f4f4f4", "mid", "White, red and black with the mesh wings."),
  SH("lebron21", "LeBron 21", "rare", "#2c2a6b", "#2c2a6b", "#d4af37", "#ffffff", "mid", "Purple and gold, King's colours."),
  SH("question", "Reebok Question 'Red Toe'", "rare", "#f4f4f4", "#c41e3a", "#c41e3a", "#e9e9e9", "mid", "Iverson's first. Red toe, honeycomb sole."),
  SH("kd16", "KD 16 'Aunt Pearl'", "rare", "#ff9fc1", "#ff86b0", "#ffffff", "#ffffff", "low", "Pink, for a great cause."),
  SH("foamroyal", "Foamposite One 'Royal'", "rare", "#1b3fa6", "#152f80", "#111111", "#1b3fa6", "mid", "Shiny moulded shell. From the future."),
  SH("curry11", "Curry 11 'Dub Nation'", "rare", "#1d428a", "#1d428a", "#ffc72c", "#ffffff", "low", "Warriors blue and gold."),
  SH("freak5", "Zoom Freak 5", "rare", "#ff7a1a", "#e2620a", "#111111", "#f4f4f4", "low", "Loud orange for a loud game."),
  // Epic
  SH("aj11concord", "Air Jordan 11 'Concord'", "epic", "#ffffff", "#111111", "#ffffff", "#c9d8f0", "mid", "Patent leather and an icy sole. Pure class."),
  SH("aj3cement", "Air Jordan 3 'Black Cement'", "epic", "#1a1a1a", "#9a9a9a", "#e33b2e", "#e9e9e9", "mid", "Elephant print. Dunk-contest history."),
  SH("kobe5chaos", "Kobe 5 Protro 'Chaos'", "epic", "#7a0f2a", "#5e0b20", "#f2c94c", "#111111", "low", "Joker colours. Pure chaos."),
  SH("aj12flu", "Air Jordan 12 'Flu Game'", "epic", "#c8102e", "#111111", "#111111", "#111111", "mid", "Played sick, scored 38. Red and black."),
  SH("uptempo", "Air More Uptempo", "epic", "#111111", "#111111", "#ffffff", "#f4f4f4", "mid", "AIR, written in giant letters down the side."),
  SH("aj6infra", "Air Jordan 6 'Infrared'", "epic", "#1b1b1b", "#1b1b1b", "#ff2d55", "#1b1b1b", "mid", "Black with infrared hits. First ring."),
  // Legendary
  SH("aj1chicago", "Air Jordan 1 'Chicago'", "legendary", "#f4f4f4", "#c8102e", "#111111", "#f4f4f4", "high", "White, red, black. The one everybody wants."),
  SH("aj11spacejam", "Air Jordan 11 'Space Jam'", "legendary", "#1b1b1b", "#0d0d0d", "#2a3fcf", "#c9d8f0", "mid", "Black patent, blue glow. From the movie."),
  SH("kobe4gold", "Kobe 4 Protro 'Gold Medal'", "legendary", "#f4f4f4", "#d4af37", "#d4af37", "#f4f4f4", "low", "White and gold. Olympic champion."),
  SH("aj5grape", "Air Jordan 5 'Grape'", "legendary", "#f4f4f4", "#5a2a82", "#3fb6a8", "#5a2a82", "mid", "Grape and teal. A 90s icon."),
  // Mythic
  SH("aj1dior", "Air Jordan 1 'Dior'", "mythic", "#c9cdd2", "#ffffff", "#9aa0a8", "#f4f4f4", "high", "Grey and white luxury. Only a few thousand pairs exist."),
  SH("kobeprelude", "Kobe 1 Protro 'Prelude'", "mythic", "#f4f4f4", "#552583", "#fdb927", "#e9e9e9", "low", "Hand-painted tribute. Impossible to find."),
  // Godlike
  SH("airmag", "Nike Air Mag", "godlike", "#b9bec6", "#8d939c", "#ffffff", "#59d8ff", "high", "The self-lacing shoe from the future. The sole glows.", 1),
  SH("aj4undftd", "Air Jordan 4 'Undefeated'", "godlike", "#4a5a2f", "#3a4824", "#e5242b", "#111111", "mid", "Olive and flight-jacket orange. The rarest Jordan ever made."),
  // Session 6b: twelve more
  SH("mb03", "Puma MB.03", "common", "#5b2a86", "#3a1a5a", "#2fe6a4", "#2fe6a4", "low", "LaMelo's alien kicks. Not from this planet."),
  SH("kt8", "Anta KT 8", "common", "#f4f4f4", "#1d6fb8", "#ffd23c", "#ffffff", "low", "Klay's splash shoe. Light and quick."),
  SH("wow10", "Li-Ning Way of Wade 10", "common", "#141414", "#141414", "#c8102e", "#f4f4f4", "mid", "Black and red. Built for the Euro step."),
  SH("aj13bred", "Air Jordan 13 'Bred'", "rare", "#141414", "#c8102e", "#ffffff", "#c8102e", "mid", "Panther-paw sole and a little hologram eye."),
  SH("ja1", "Ja 1 'Bone'", "rare", "#efe6cf", "#d8ccae", "#e5242b", "#efe6cf", "low", "Ja Morant's first. Built to fly."),
  SH("shaqattaq", "Reebok Shaq Attaq", "rare", "#f4f4f4", "#111111", "#1d6fb8", "#f4f4f4", "high", "A big shoe for the Big Diesel."),
  SH("aj7olympic", "Air Jordan 7 'Olympic'", "epic", "#f4f4f4", "#1d2a6b", "#c8102e", "#1d2a6b", "mid", "Dream Team, 1992. Gold-medal summer."),
  SH("penny1", "Air Max Penny 1 'Orlando'", "epic", "#111111", "#111111", "#1d6fb8", "#f4f4f4", "mid", "Magic blue and black. Lil' Penny's favourite."),
  SH("kobe8mamba", "Kobe 8 'Mambacurial'", "epic", "#ff3d7f", "#ff2266", "#1e1e1e", "#ffd23c", "low", "Hot pink and loud. The lightest Kobe ever."),
  SH("aj1shattered", "Air Jordan 1 'Shattered Backboard'", "legendary", "#f4f4f4", "#ff7a1a", "#111111", "#efe6cf", "high", "Orange and black, for the night the glass broke."),
  SH("aj13hgg", "Air Jordan 13 'He Got Game'", "legendary", "#f4f4f4", "#111111", "#c8102e", "#c8102e", "mid", "White and black with a red sole. From the movie."),
  SH("yeezyred", "Air Yeezy 2 'Red October'", "mythic", "#c8102e", "#a00d24", "#e01e3c", "#c8102e", "high", "All red, top to bottom. Dropped with no warning."),
  // Limited: Courtside's own shoe, from the code SNEAKERHEAD only (never in boxes or the Daily Shop)
  { ...SH("launched", "Launched", "limited", "#5b2fb0", "#2b2540", "#ff7a1a", "#9d4dff", "high", "Courtside's own sneaker. Purple and black, a rocket flame down the side and a sole that glows.", "#e6d4ff"), mark: "flame" },
  // Limited, Halloween 2026: from the Halloween quests only (js/event.js)
  { ...SH("jacko", "Jack-O", "limited", "#ff7a1a", "#17121a", "#ff7a1a", "#2a1f2e", "high", "Halloween 2026. Pumpkin orange and black, a carved jack-o'-lantern face and a sole that glows ghost green.", "#7cff6a"), mark: "pumpkin" },
];
const SHOE = Object.fromEntries(SHOES.map((s) => [s.id, s]));
const ownsShoe = (id) => SAVE.shoes.includes(id);
// Mystery Shoeboxes: one shoe each, cheaper than animation packs. New shoes are three times as likely.
const SHOEBOXES = [
  // look: kraft (brown cardboard, a white size label), luxe (matte black, gold band and star), grail (purple, glowing trim, gold clasp)
  { id: "box", name: "SHOEBOX", price: 100, odds: { common: 70, rare: 25, epic: 5 }, col: "#b97a3e", lid: "#d79a5a", look: "kraft" },
  { id: "premium", name: "PREMIUM SHOEBOX", price: 300, odds: { common: 20, rare: 50, epic: 24, legendary: 6 }, col: "#16161c", lid: "#d4af37", look: "luxe" },
  { id: "grail", name: "GRAIL BOX", price: 800, odds: { rare: 30, epic: 42, legendary: 22, mythic: 5, godlike: 1 }, col: "#4b1f8a", lid: "#c79bff", look: "grail" },
];
const SHOE_PRICE = { common: 60, rare: 150, epic: 350, legendary: 700, mythic: 2000, godlike: 5000 };
const SHOE_REFUND = { common: 20, rare: 50, epic: 120, legendary: 250, mythic: 700, godlike: 1800 };
// Open a shoebox: one shoe, or coins if it's a duplicate. null if you can't afford it.
// A free box you've won (SAVE.freeBox) opens before any coins are spent.
function openShoebox(id) {
  const bx = SHOEBOXES.find((b) => b.id === id);
  if (!bx) return null;
  if (SAVE.freeBox[id] > 0) SAVE.freeBox[id]--;
  else if (SAVE.cc < bx.price) return null;
  else SAVE.cc -= bx.price;
  const r = rollRarity(bx.odds),
    pool = SHOES.filter((s) => s.rarity === r).flatMap((s) => (ownsShoe(s.id) ? [s] : [s, s, s])),
    s = pool[(Math.random() * pool.length) | 0];
  const got = grantShoe(s);
  writeSave();
  return got;
}
function grantShoe(s) {
  const dupe = ownsShoe(s.id),
    refund = dupe ? SHOE_REFUND[s.rarity] : 0;
  if (dupe) SAVE.cc += refund;
  else {
    SAVE.shoes.push(s.id);
    if (!SAVE.shoe) SAVE.shoe = s.id; // your first pair goes straight on
  }
  return { s, dupe, refund };
}
// The one shoe in this hour's Daily Shop (common to legendary, sometimes a grail).
function dailyShoe(date) {
  const rnd = seeded(hourKey(date || new Date()) * 7 + 3),
    r = ["common", "common", "rare", "rare", "rare", "epic", "epic", "legendary", "legendary", "mythic", "godlike"][(rnd() * 11) | 0],
    pool = SHOES.filter((s) => s.rarity === r);
  return pool[(rnd() * pool.length) | 0];
}
function buyShoe(id) {
  const s = SHOE[id];
  if (!s || ownsShoe(id) || dailyShoe() !== s || SAVE.cc < SHOE_PRICE[s.rarity]) return false;
  SAVE.cc -= SHOE_PRICE[s.rarity];
  grantShoe(s);
  writeSave();
  return true;
}
// The shoe a player wears in the game: your team wears yours, everyone else their team's colours.
function shoeOf(p) {
  if (p.port) return p.port.shoe ? SHOE[p.port.shoe] : null;
  return p.t === 0 && SAVE.shoe ? SHOE[SAVE.shoe] : null;
}

// A side-on pixel shoe, toe to the right, drawn on context g at (x, y) (top-left), px pixels per shoe pixel.
// The shoe is 24 x 13 shoe pixels: collar at the heel (taller for high tops), laces down the instep, a rounded
// toe box, a stripe sweeping along the side and a two-tone sole. t: time, for the glowing sole.
function drawShoe(g, s, x, y, px, t) {
  const R = (cx, cy, col) => {
    g.fillStyle = col;
    g.fillRect(x + cx * px, y + cy * px, px, px);
  };
  const c0 = { low: 5, mid: 3, high: 1 }[s.cut] || 4,
    top = (i) => (i <= 7 ? c0 : i <= 17 ? Math.round(lp(c0 + 1, 7, (i - 8) / 9)) : i <= 20 ? 7 : i === 21 ? 8 : 9),
    edge = shade(s.ov, -0.5);
  for (let i = 1; i <= 22; i++) {
    const t0 = top(i);
    for (let j = t0; j <= 9; j++) {
      let col = s.up;
      if (i <= 2 || (j === t0 && i <= 7) || (i >= 18 && j >= 8) || (i >= 20 && j >= 7) || (j === 9 && i >= 3)) col = s.ov; // heel, collar, toe cap, mudguard
      if (j === t0) col = shade(col, -0.18);
      R(i, j, col);
    }
    R(i, t0 - 1, edge); // outline along the top
  }
  R(0, c0, edge);
  for (let j = c0; j <= 9; j++) R(0, j, edge);
  // Laces: white stitches down the instep.
  for (let i = 9; i <= 16; i += 2) R(i, top(i) + 1, "#f7f7f7");
  // The stripe: from the heel, dipping under the laces and sweeping up toward the toe.
  [[3, 6], [4, 7], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [13, 7], [14, 6], [15, 6], [16, 7], [6, 7], [10, 7]].forEach(([i, j]) => j >= top(i) && R(i, j, s.ac));
  // Launched: the stripe is a rocket flame, hot yellow at the tail, with a little rocket at its tip.
  if (s.mark === "flame") {
    [[2, 7], [3, 7], [3, 8], [4, 6], [4, 8]].forEach(([i, j]) => j >= top(i) && R(i, j, "#ffe08a"));
    [[5, 7], [6, 6], [7, 7]].forEach(([i, j]) => j >= top(i) && R(i, j, "#ffd23c"));
    [[16, 6], [17, 6], [17, 7], [18, 6]].forEach(([i, j]) => j >= top(i) && R(i, j, "#f2f2f2"));
    R(17, 5, "#c79bff");
  }
  // Jack-O: a carved jack-o'-lantern face on the side, lit from inside, and a green stem at the collar.
  if (s.mark === "pumpkin") {
    // Triangle eyes, a nose and a toothy grin, cut dark into the orange; the ribs of the pumpkin in a darker orange.
    [[11, 6], [12, 7], [14, 8], [15, 7]].forEach(([i, j]) => j >= top(i) && R(i, j, "#c8541a"));
    const face = "#17121a";
    [[4, 4], [8, 4], [3, 5], [4, 5], [5, 5], [7, 5], [8, 5], [9, 5], [6, 6], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [4, 8], [6, 8], [8, 8]].forEach(([i, j]) => R(i, j, face));
    // A flicker of candle light in the eyes.
    if (t !== undefined && Math.sin(t * 7) > 0.2) (R(4, 5, "#ffd23c"), R(8, 5, "#ffd23c"));
    R(3, top(3) - 1, "#3d9a3a");
    R(4, top(4) - 1, "#2c7a2a");
  }
  // Sole: a light midsole stripe, the sole, a darker tread. A glowing sole pulses.
  const so = s.glow && t !== undefined ? (Math.sin(t * 5) > 0 ? s.so : typeof s.glow === "string" ? s.glow : "#d4fbff") : s.so;
  for (let i = 0; i <= 23; i++) {
    R(i, 10, i === 0 || i === 23 ? shade(so, -0.1) : shade(so, 0.18));
    R(i, 11, so);
    if (i > 0 && i < 23) R(i, 12, shade(so, -0.45));
  }
}
// Draw shoe s centred in canvas cv, as big as fits in whole pixels.
function shoeCanvas(cv, s, t) {
  const w = cv.clientWidth || 160,
    h = cv.clientHeight || 90,
    dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const g = cv.getContext("2d"),
    px = Math.max(1, Math.floor(Math.min(cv.width / 26, cv.height / 15)));
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, cv.width, cv.height);
  if (!s) return;
  drawShoe(g, s, Math.round((cv.width - 24 * px) / 2), Math.round((cv.height - 13 * px) / 2), px, t);
}

// ---------- shoebox models: a pixel shoebox seen from the front and a little from above, 52 x 40 box pixels.
// o: { lift (box pixels the lid has risen), drift (sideways), fade (0..1 lid opacity), glow (colour from inside), t }
const QMARK = [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."];
function drawShoebox(g, bx, x, y, px, o) {
  o = o || {};
  const R = (cx, cy, col, w, h) => {
    g.fillStyle = col;
    g.fillRect(x + cx * px, y + cy * px, (w || 1) * px, (h || 1) * px);
  };
  const look = bx.look || "kraft",
    body = look === "luxe" ? "#1b1b22" : bx.col,
    lidc = look === "luxe" ? "#23232c" : look === "grail" ? shade(bx.col, -0.25) : bx.lid,
    acc = bx.lid,
    open = (o.lift || 0) > 0.5;
  // Body: front face, right side, and (once the lid is off) the inside with tissue paper.
  for (let i = 0; i < 6; i++) R(42 + i, 18 - i - 1, shade(body, -0.35), 1, 20);
  R(2, 18, body, 40, 20);
  R(2, 18, shade(body, 0.18), 1, 20);
  R(2, 35, shade(body, -0.22), 40, 3);
  if (open) {
    for (let r = 1; r <= 6; r++) R(2 + r, 18 - r, o.glow || shade(body, -0.6), 40, 1);
    // tissue paper crumpled over the top
    for (let i = 4; i < 46; i++) {
      const hgt = 2 + ((i * 7) % 5) + (i % 3 === 0 ? 2 : 0);
      R(i, 15 - hgt + ((i * 3) % 2), i % 4 ? "#f4efe2" : "#e3dccb", 1, hgt);
    }
  }
  // Decoration on the front of the body.
  if (look === "kraft") {
    R(30, 22, "#f4f1ea", 9, 9);
    R(31, 24, "#9a9a9a", 7, 1);
    R(31, 26, "#9a9a9a", 5, 1);
    R(31, 28, "#c8102e", 3, 1);
  }
  if (look === "luxe") {
    // a gold foil star
    [[33, 22, 1, 2], [31, 24, 5, 1], [32, 25, 3, 1], [32, 26, 1, 1], [34, 26, 1, 1]].forEach(([a, b, w, h]) => R(a, b, acc, w, h));
    R(2, 33, acc, 40, 1);
  }
  if (look === "grail") {
    R(20, 18, "#f2c94c", 4, 4); // the clasp
    R(21, 19, "#8a6a12", 2, 2);
    R(2, 36, acc, 40, 1);
  }
  // A big question mark.
  QMARK.forEach((row, j) => [...row].forEach((ch, i) => ch === "#" && R(8 + i * 2, 21 + j * 2, look === "kraft" ? shade(body, -0.4) : acc, 2, 2)));
  // Lid: front lip, top face and right side, a little bigger than the box. Lifts and fades away when opened.
  if ((o.fade === undefined ? 1 : o.fade) > 0) {
    g.save();
    g.globalAlpha = o.fade === undefined ? 1 : o.fade;
    const ly = -(o.lift || 0),
      lx = o.drift || 0;
    for (let i = 0; i < 6; i++) R(43 + i + lx, 13 - i - 1 + ly, shade(lidc, -0.35), 1, 7);
    for (let r = 1; r <= 6; r++) R(1 + r + lx, 13 - r + ly, shade(lidc, 0.14), 42, 1);
    R(1 + lx, 13 + ly, lidc, 42, 7);
    R(1 + lx, 19 + ly, shade(lidc, -0.3), 42, 1);
    if (look === "luxe") R(1 + lx, 15 + ly, acc, 42, 2), R(7 + lx, 7 + ly, acc, 42, 1);
    if (look === "grail") {
      R(1 + lx, 13 + ly, acc, 42, 1);
      R(7 + lx, 7 + ly, acc, 42, 1);
      const tw = Math.floor((o.t || 0) * 4) % 3; // twinkles on the lid
      [[12, 9], [26, 10], [38, 8]].forEach(([a, b], k) => k !== tw && R(a + lx, b + ly, "#ffffff"));
    }
    if (look === "kraft") R(1 + lx, 16 + ly, shade(lidc, -0.12), 42, 1);
    g.restore();
  }
}
// Draw box bx centred in canvas cv. head: extra box pixels of room above it (for the lid to fly into).
function boxCanvas(cv, bx, o, head) {
  head = head || 0;
  const w = cv.clientWidth || 120,
    h = cv.clientHeight || 90,
    dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const g = cv.getContext("2d"),
    px = Math.max(1, Math.floor(Math.min(cv.width / 52, cv.height / (40 + head))));
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, cv.width, cv.height);
  drawShoebox(g, bx, Math.round((cv.width - 52 * px) / 2), Math.round(cv.height - 40 * px - (cv.height - (40 + head) * px) / 2), px, o);
}
