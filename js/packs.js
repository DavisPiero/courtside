"use strict";
// Animations you can collect, and the Shop packs that contain them.
// You open packs in the Shop with Court Coins (CC); what you get is random, weighted by rarity.
// Better packs cost more and have better odds. Duplicates turn into coins. Equip what you own in the Inventory.
// Only your team uses your animations; the AI plays the starters.

const RARITY = {
  starter: { name: "STARTER", col: "#8f9cc4", refund: 0 },
  common: { name: "COMMON", col: "#c9d1e6", refund: 15 },
  rare: { name: "RARE", col: "#4aa3ff", refund: 40 },
  epic: { name: "EPIC", col: "#b46bff", refund: 100 },
  legendary: { name: "LEGENDARY", col: "#ffb02e", refund: 250 },
  iconic: { name: "ICONIC", col: "#ff3d7f", refund: 300 }, // a famous player's signature: Player Packs and the Daily Shop only
  mythic: { name: "MYTHIC", col: "#ff2e4a", refund: 600 }, // very rare: top packs and the Daily Shop
  godlike: { name: "GODLIKE", col: "#fff1a8", refund: 1500 }, // the rarest you can get by luck
  gametime: { name: "GAMETIME", col: "#9d4dff", refund: 0 }, // one of a kind, from the code LAUNCHED only
};
// Rarities a random pack can roll, worst to best.
const RARITIES = ["common", "rare", "epic", "legendary", "mythic", "godlike"];
// Every rarity, worst to best (for sorting, the reveal build-up and selling).
const RANK = ["starter", "common", "rare", "epic", "legendary", "iconic", "mythic", "godlike", "gametime"];
const A = (id, cat, name, rarity, desc, who) => ({ id, cat, name, rarity, desc, who });
const ANIMS = [
  // Dunks
  A("dunk.basic", "dunk", "Hammer", "starter", "One or two hands, straight down."),
  A("dunk.twohand", "dunk", "Two-Hand Flush", "common", "Both hands, big and simple."),
  A("dunk.tomahawk", "dunk", "Tomahawk", "rare", "Cock it way back behind your head, then hammer it home."),
  A("dunk.reverse", "dunk", "Reverse", "rare", "Back to the rim, thrown down over your head."),
  A("dunk.cradle", "dunk", "Rock the Cradle", "epic", "Rock the ball side to side in your arm, then slam it."),
  A("dunk.windmill", "dunk", "Windmill", "epic", "A full arm circle on the way up."),
  A("dunk.360", "dunk", "360", "legendary", "Spin all the way round in the air."),
  A("dunk.legs", "dunk", "Between the Legs", "legendary", "Pass it under your legs in mid-air. Unreal."),
  A("dunk.pump", "dunk", "Double Pump", "rare", "Up, back down, and up again before the slam."),
  A("dunk.sidemill", "dunk", "Side Windmill", "legendary", "A windmill swung out wide to the side."),
  // Layups
  A("layup.basic", "layup", "Lay-In", "starter", "Off the glass, nice and easy."),
  A("layup.fingerroll", "layup", "Finger Roll", "common", "Reach up high and roll it off your fingertips."),
  A("layup.scoop", "layup", "Scoop", "rare", "Underhand from your hip, up and in."),
  A("layup.reverse", "layup", "Reverse Layup", "rare", "Go under the rim and finish on the other side."),
  A("layup.euro", "layup", "Euro Step", "epic", "One step one way, the next step the other."),
  A("layup.clutch", "layup", "Double Clutch", "legendary", "Up, down, switch hands, and finish."),
  A("layup.floater", "layup", "Floater", "common", "Float it up early, soft over the big man."),
  A("layup.goingup", "layup", "Up-and-Under", "rare", "Fake it up, duck under, finish the other side."),
  // Dribble moves (added to the E rotation when switched on)
  A("dribble.hesi", "dribble", "Hesitation", "common", "Freeze the defender with a fake stop, then explode."),
  A("dribble.inout", "dribble", "In-and-Out", "common", "Fake the crossover, keep it in the same hand."),
  A("dribble.stutter", "dribble", "Stutter Step", "rare", "Machine-gun feet, then go."),
  A("dribble.snatch", "dribble", "Snatch-Back", "rare", "Yank it back and hop away to make space."),
  A("dribble.double", "dribble", "Double Cross", "epic", "Crossover, then cross right back."),
  A("dribble.killer", "dribble", "Killer Crossover", "epic", "A huge, low, wide cross. Ankles beware."),
  A("dribble.shammgod", "dribble", "Shammgod", "legendary", "Push it out with one hand, pull it back with the other."),
  A("dribble.tornado", "dribble", "Tornado Spin", "legendary", "Spin with a behind-the-back in the middle."),
  A("dribble.combo", "dribble", "Between-Behind", "rare", "Between the legs, then straight behind the back."),
  A("dribble.tweens", "dribble", "Tween Combo", "epic", "Three quick between-the-legs. Machine gun."),
  // Jump shots
  A("shot.basic", "shot", "Classic Jumper", "starter", "Dip, rise, release at the top."),
  A("shot.set", "shot", "Set Shot", "common", "Old-school: the feet barely leave the floor."),
  A("shot.quick", "shot", "Quick Release", "common", "Short dip, fast set point."),
  A("shot.high", "shot", "High Release", "rare", "Released from the sky."),
  A("shot.fade", "shot", "Fadeaway", "rare", "Lean back away from the defender."),
  A("shot.stepback", "shot", "Step-Back", "epic", "Hop back to make space, then rise."),
  A("shot.oneleg", "shot", "One-Leg Fade", "epic", "Knee up, falling away. Unblockable vibes."),
  A("shot.hook", "shot", "Sky Hook", "legendary", "Side-on, arm sweeping over the top."),
  A("shot.sidestep", "shot", "Side-Step", "rare", "Hop to the side, then rise."),
  A("shot.turnaround", "shot", "Turnaround", "epic", "Back to the rim, spin and fade."),
  // Celebrations
  A("cel.basic", "cel", "Arms Up", "starter", "Both arms in the air."),
  A("cel.flex", "cel", "Flex", "common", "Show off the guns."),
  A("cel.shh", "cel", "Shh", "common", "Finger to the lips."),
  A("cel.point", "cel", "Point Up", "common", "One finger to the sky."),
  A("cel.toosmall", "cel", "Too Small", "rare", "Hand down low. They're too small."),
  A("cel.chest", "cel", "Chest Thump", "rare", "Pound your chest."),
  A("cel.dance", "cel", "Dance", "epic", "A bounce-and-shimmy."),
  A("cel.lights", "cel", "Lights Out", "epic", "Hands to your cheek. Goodnight."),
  A("cel.ice", "cel", "Ice Veins", "epic", "Tap your wrist. Cold-blooded."),
  A("cel.mic", "cel", "Mic Drop", "legendary", "Hold it up... and drop it."),
  A("cel.backflip", "cel", "Backflip", "legendary", "A full backflip. Yes, really."),
  A("cel.salute", "cel", "Salute", "common", "A sharp salute to the crowd."),
  A("cel.crossarms", "cel", "Arms Crossed", "common", "Lean back. Unbothered."),
  A("cel.wave", "cel", "Crowd Wave", "rare", "Both arms up, get the crowd going."),
  A("cel.robot", "cel", "The Robot", "rare", "Beep. Boop. Bucket."),
  // Session 4
  A("dunk.onehand", "dunk", "One-Hand Jam", "common", "Reach up with one hand and stuff it."),
  A("layup.hook", "layup", "Baby Hook", "rare", "Turn side-on and sweep a little hook off the glass."),
  A("dribble.halfspin", "dribble", "Half Spin", "rare", "Spin halfway, freeze, and spin back out."),
  A("shot.dip", "shot", "Deep Dip", "common", "Sink low, then rise slow and smooth."),
  A("cel.heels", "cel", "Heel Taps", "epic", "Swing the arms, tap the heels. Can't stop."),
  A("cel.bow", "cel", "Take a Bow", "rare", "One arm across, a deep bow to the crowd."),
  // MYTHIC: very rare, from the best packs and sometimes the Daily Shop.
  A("dunk.honey", "dunk", "Honey Dip", "mythic", "Arm through the rim up to the elbow. Hang there. Unreal."),
  A("dunk.double360", "dunk", "Double 360", "mythic", "Two full spins before the slam."),
  A("dribble.yoyo", "dribble", "Yo-Yo", "mythic", "Slam it down so hard it bounces over your head, then catch it in stride."),
  A("shot.sky", "shot", "Skywalker", "mythic", "Rise way higher than anyone should, release from the clouds."),
  // GODLIKE: the rarest you can pull.
  A("dunk.moon", "dunk", "Moonwalk", "godlike", "Take off from way out, walk on the air, and spin it home."),
  A("cel.levitate", "cel", "Levitate", "godlike", "Float up off the floor, legs crossed, slowly turning."),
  // GAMETIME: one of a kind. Only from the code LAUNCHED.
  A("dunk.liftoff", "dunk", "Liftoff", "gametime", "Crouch low and blast off like a rocket, in a trail of sparks."),
  // ICONIC: famous players' signatures, from Player Packs and the Daily Shop.
  A("shot.mj", "shot", "Jordan Fadeaway", "iconic", "Turn, rise, fade, legs kicked out. Unguardable.", "JORDAN"),
  A("dunk.mj", "dunk", "Free Throw Line", "iconic", "Take off from way out and glide in, legs split.", "JORDAN"),
  A("cel.shrug", "cel", "The Shrug", "iconic", "Palms up. 'I can't miss either.'", "JORDAN"),
  A("shot.kobe", "shot", "Mamba Fade", "iconic", "Spin out of the post, fade on one leg.", "KOBE"),
  A("dunk.kobe", "dunk", "Mamba Reverse", "iconic", "Swing it low, turn and hammer it backwards.", "KOBE"),
  A("cel.jaw", "cel", "Jaw Jut", "iconic", "Hands on hips, chin up. Nothing to say.", "KOBE"),
  A("shot.curry", "shot", "Chef Release", "iconic", "Lightning release. Turns away before it lands.", "CURRY"),
  A("dribble.curry", "dribble", "Double Behind", "iconic", "Behind the back, and behind the back again.", "CURRY"),
  A("cel.shimmy", "cel", "Shimmy", "iconic", "Shake the shoulders. Let them know.", "CURRY"),
  A("dribble.ai", "dribble", "The Crossover", "iconic", "Freeze them with a hesi, then cross them into next week.", "IVERSON"),
  A("layup.lbj", "layup", "Spin Layup", "iconic", "A full spin in the air on the way up.", "LEBRON"),
  A("shot.ai", "shot", "Pull-Up J", "iconic", "Stop on a dime off the dribble and rise straight up.", "IVERSON"),
  A("cel.stepover", "cel", "Step Over", "iconic", "Step right over them. Look down.", "IVERSON"),
  A("dunk.shaq", "dunk", "Shaq Attack", "iconic", "Two hands, hang on the rim, legs up. Bring the hoop down.", "SHAQ"),
  A("layup.shaq", "layup", "Drop Step", "iconic", "Back them down, drop step, power it up.", "SHAQ"),
  A("cel.shaq", "cel", "Shaq Shuffle", "iconic", "Side to side, big arms, big smile.", "SHAQ"),
  A("dunk.lbj", "dunk", "Freight Train", "iconic", "Two-hand tomahawk at full speed.", "LEBRON"),
  A("cel.chalk", "cel", "Chalk Toss", "iconic", "Clap, then fling both arms to the sky.", "LEBRON"),
];
const ANIM = Object.fromEntries(ANIMS.map((a) => [a.id, a]));
const animName = (id) => (ANIM[id] ? ANIM[id].name : id);
const CATS = [
  ["dunk", "DUNKS"],
  ["layup", "LAYUPS"],
  ["dribble", "DRIBBLE"],
  ["shot", "JUMP SHOT"],
  ["cel", "CELEBRATE"],
];
const MAX_MOVES = 3; // extra dribble moves you can switch on at once

// Shop packs: price, how many animations, odds per card (percent), and a guaranteed minimum rarity for one card.
const SHOP = [
  { id: "street", name: "STREET PACK", price: 150, cards: 1, odds: { common: 70, rare: 25, epic: 5 }, min: null, col: "#5f6b86" },
  { id: "pro", name: "PRO PACK", price: 400, cards: 2, odds: { common: 45, rare: 38, epic: 14, legendary: 3 }, min: "rare", col: "#2f6fd6" },
  { id: "allstar", name: "ALL-STAR PACK", price: 900, cards: 3, odds: { common: 15, rare: 44, epic: 32, legendary: 8, mythic: 1 }, min: "epic", col: "#7d3ccf" },
  { id: "hof", name: "HALL OF FAME PACK", price: 2000, cards: 3, odds: { common: 0, rare: 33, epic: 44, legendary: 19, mythic: 3.5, godlike: 0.5 }, min: "legendary", col: "#c98a12" },
];

const owns = (id) => ANIM[id] && (ANIM[id].rarity === "starter" || SAVE.owned.includes(id));
// The style a player uses for a category: yours from the Inventory, the AI's always the starter.
// In the dunk contest each round uses its own dunk (js/minigames.js).
const styleOf = (p, cat) =>
  (cat === "dunk" && G.mg && G.mg.style && p.t === 0 && !p.port ? G.mg.style : p.t === 0 && !p.port ? SAVE.equip[cat] : p.port && p.port.style && p.port.style[cat]) || cat + ".basic";

function rollRarity(odds) {
  let r = Math.random() * 100;
  for (const k of RARITIES) if ((r -= odds[k] || 0) < 0) return k;
  return "common";
}
// Pick an animation of rarity r: new ones are three times as likely as ones you have. from: limit the pool.
function drawAnim(r, from) {
  const pool = (from || ANIMS).filter((a) => a.rarity === r),
    weighted = pool.flatMap((a) => (owns(a.id) ? [a] : [a, a, a]));
  return weighted[(Math.random() * weighted.length) | 0];
}
// Add a drawn animation to your collection, or refund it as coins if you have it already.
function grant(a) {
  const dupe = owns(a.id),
    refund = dupe ? RARITY[a.rarity].refund : 0;
  if (dupe) SAVE.cc += refund;
  else {
    SAVE.owned.push(a.id);
    if (a.cat === "dribble" && SAVE.equip.moves.length < MAX_MOVES) SAVE.equip.moves.push(a.id);
  }
  return { a, dupe, refund };
}
// Open a pack: returns the cards, adds new animations, refunds duplicates. null if you can't afford it.
// A free pack you've won (beating a chapter boss) is used before any coins.
function openPack(packId) {
  const pk = SHOP.find((s) => s.id === packId) || PLAYER_PACKS.find((s) => s.id === packId);
  if (!pk) return null;
  if (SAVE.free[packId] > 0) SAVE.free[packId]--;
  else if (SAVE.cc < pk.price) return null;
  else SAVE.cc -= pk.price;
  let cards;
  if (pk.who) {
    // Player pack: one of the player's signatures, plus a bonus card.
    const sig = drawAnim("iconic", ANIMS.filter((a) => a.who === pk.who));
    cards = [grant(drawAnim(rollRarity(pk.odds))), grant(sig)];
  } else {
    const rar = [];
    for (let i = 0; i < pk.cards; i++) rar.push(rollRarity(pk.odds));
    // Guarantee: if no card reached the minimum, upgrade the last card to it.
    if (pk.min && !rar.some((r) => RARITIES.indexOf(r) >= RARITIES.indexOf(pk.min))) rar[rar.length - 1] = pk.min;
    rar.sort((a, b) => RARITIES.indexOf(a) - RARITIES.indexOf(b)); // best card revealed last
    cards = rar.map((r) => grant(drawAnim(r)));
  }
  writeSave();
  return cards;
}

// ---------- Player Packs: a famous player's signature moves. Each pack: 1 signature + 1 bonus card.
// hof: the Hall of Fame team whose colours (and model) the pack shows.
const PLAYER_PACKS = [
  { id: "p.jordan", who: "JORDAN", name: "JORDAN", hof: ["CHI", 1], col: "#ce1141" },
  { id: "p.kobe", who: "KOBE", name: "KOBE", hof: ["LAL", 1], col: "#552583" },
  { id: "p.curry", who: "CURRY", name: "CURRY", hof: ["GSW", 0], col: "#1d428a" },
  { id: "p.iverson", who: "IVERSON", name: "IVERSON", hof: ["PHI", 0], col: "#006bb6" },
  { id: "p.shaq", who: "SHAQ", name: "SHAQ", hof: ["LAL", 2], col: "#b8862a" },
  { id: "p.lebron", who: "LEBRON", name: "LEBRON", hof: ["CLE", 1], col: "#860038" },
].map((p) => ({ ...p, price: 1200, cards: 2, odds: { common: 0, rare: 60, epic: 32, legendary: 8 } }));

// ---------- Daily Shop: five single animations and one shoe, the same for everyone in the same hour, new every hour.
const SINGLE_PRICE = { common: 120, rare: 300, epic: 700, legendary: 1400, iconic: 2000, mythic: 4000, godlike: 10000 };
// Sell an animation back for a quarter of its shop price. Starters and Gametime can't be sold.
const sellPrice = (a) => (SINGLE_PRICE[a.rarity] ? Math.round(SINGLE_PRICE[a.rarity] / 4) : 0);
// Slots: one big featured item (mostly Iconic or Legendary, sometimes Mythic, rarely Godlike), then Epic, two
// Rares, a Common.
const DAILY_SLOTS = [["iconic", "iconic", "legendary", "legendary", "legendary", "mythic", "mythic", "godlike"], ["epic"], ["rare"], ["rare"], ["common"]];
const dayKey = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const hourKey = (d) => dayKey(d) * 100 + d.getHours();
function seeded(n) {
  // Small fast random-number generator (mulberry32) so a date always gives the same shop.
  return () => {
    n = (n + 0x6d2b79f5) | 0;
    let t = Math.imul(n ^ (n >>> 15), 1 | n);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function dailyItems(date) {
  const rnd = seeded(hourKey(date || new Date())),
    taken = new Set();
  return DAILY_SLOTS.map((rs) => {
    const r = rs[(rnd() * rs.length) | 0],
      pool = ANIMS.filter((a) => a.rarity === r && !taken.has(a.id)),
      a = pool[(rnd() * pool.length) | 0];
    taken.add(a.id);
    return a;
  });
}
// Seconds until the shop changes (the next hour).
function dailyLeft() {
  const n = new Date(),
    m = new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours() + 1);
  return Math.max(0, Math.floor((m - n) / 1000));
}
// Buy one animation from today's shop. Returns false if you can't.
function buySingle(id) {
  const a = ANIM[id];
  if (!a || owns(id) || !dailyItems().includes(a) || SAVE.cc < SINGLE_PRICE[a.rarity]) return false;
  SAVE.cc -= SINGLE_PRICE[a.rarity];
  grant(a);
  writeSave();
  return true;
}
// Sell an animation you own for coins. Anything equipped is unequipped first.
function sellAnim(id) {
  const a = ANIM[id],
    pay = a && sellPrice(a);
  if (!pay || !SAVE.owned.includes(id)) return 0;
  SAVE.owned.splice(SAVE.owned.indexOf(id), 1);
  const m = SAVE.equip.moves.indexOf(id);
  if (m >= 0) SAVE.equip.moves.splice(m, 1);
  if (SAVE.equip[a.cat] === id) SAVE.equip[a.cat] = a.cat + ".basic";
  SAVE.cc += pay;
  writeSave();
  return pay;
}
function equipAnim(id) {
  const k = ANIM[id];
  if (!owns(id)) return;
  if (k.cat === "dribble") {
    const m = SAVE.equip.moves,
      i = m.indexOf(id);
    if (i >= 0) m.splice(i, 1);
    else if (m.length < MAX_MOVES) m.push(id);
  } else SAVE.equip[k.cat] = id;
  writeSave();
}
