"use strict";
// Shoes: collectable sneakers your whole team wears in games. Real shoe names, no logos (drawn in code).
// You get them from mystery Shoeboxes in the Shop (one shoe a box) or the one shoe in the Daily Shop.
// Equip one in the Inventory (SHOES tab). Rarities use the same table as animations (js/packs.js).
// Colours: up = the upper, ov = overlays (toe, heel, collar), ac = the stripe or swoosh, so = the sole.
// cut: low, mid or high top. glow: the sole lights up (Air Mag).
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
];
const SHOE = Object.fromEntries(SHOES.map((s) => [s.id, s]));
const ownsShoe = (id) => SAVE.shoes.includes(id);
// Mystery Shoeboxes: one shoe each, cheaper than animation packs. New shoes are three times as likely.
const SHOEBOXES = [
  { id: "box", name: "SHOEBOX", price: 100, odds: { common: 70, rare: 25, epic: 5 }, col: "#b97a3e", lid: "#d79a5a" },
  { id: "premium", name: "PREMIUM SHOEBOX", price: 300, odds: { common: 20, rare: 50, epic: 24, legendary: 6 }, col: "#16161c", lid: "#d4af37" },
  { id: "grail", name: "GRAIL BOX", price: 800, odds: { rare: 30, epic: 42, legendary: 22, mythic: 5, godlike: 1 }, col: "#4b1f8a", lid: "#c79bff" },
];
const SHOE_PRICE = { common: 60, rare: 150, epic: 350, legendary: 700, mythic: 2000, godlike: 5000 };
const SHOE_REFUND = { common: 20, rare: 50, epic: 120, legendary: 250, mythic: 700, godlike: 1800 };
// Open a shoebox: one shoe, or coins if it's a duplicate. null if you can't afford it.
function openShoebox(id) {
  const bx = SHOEBOXES.find((b) => b.id === id);
  if (!bx || SAVE.cc < bx.price) return null;
  SAVE.cc -= bx.price;
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
  // Sole: a light midsole stripe, the sole, a darker tread. A glowing sole pulses.
  const so = s.glow && t !== undefined ? (Math.sin(t * 5) > 0 ? s.so : "#d4fbff") : s.so;
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
