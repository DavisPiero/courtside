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
};
const RARITIES = ["common", "rare", "epic", "legendary"];
const A = (id, cat, name, rarity, desc) => ({ id, cat, name, rarity, desc });
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
  // Layups
  A("layup.basic", "layup", "Lay-In", "starter", "Off the glass, nice and easy."),
  A("layup.fingerroll", "layup", "Finger Roll", "common", "Reach up high and roll it off your fingertips."),
  A("layup.scoop", "layup", "Scoop", "rare", "Underhand from your hip, up and in."),
  A("layup.reverse", "layup", "Reverse Layup", "rare", "Go under the rim and finish on the other side."),
  A("layup.euro", "layup", "Euro Step", "epic", "One step one way, the next step the other."),
  A("layup.clutch", "layup", "Double Clutch", "legendary", "Up, down, switch hands, and finish."),
  // Dribble moves (added to the E rotation when switched on)
  A("dribble.hesi", "dribble", "Hesitation", "common", "Freeze the defender with a fake stop, then explode."),
  A("dribble.inout", "dribble", "In-and-Out", "common", "Fake the crossover, keep it in the same hand."),
  A("dribble.stutter", "dribble", "Stutter Step", "rare", "Machine-gun feet, then go."),
  A("dribble.snatch", "dribble", "Snatch-Back", "rare", "Yank it back and hop away to make space."),
  A("dribble.double", "dribble", "Double Cross", "epic", "Crossover, then cross right back."),
  A("dribble.killer", "dribble", "Killer Crossover", "epic", "A huge, low, wide cross. Ankles beware."),
  A("dribble.shammgod", "dribble", "Shammgod", "legendary", "Push it out with one hand, pull it back with the other."),
  A("dribble.tornado", "dribble", "Tornado Spin", "legendary", "Spin with a behind-the-back in the middle."),
  // Jump shots
  A("shot.basic", "shot", "Classic Jumper", "starter", "Dip, rise, release at the top."),
  A("shot.set", "shot", "Set Shot", "common", "Old-school: the feet barely leave the floor."),
  A("shot.quick", "shot", "Quick Release", "common", "Short dip, fast set point."),
  A("shot.high", "shot", "High Release", "rare", "Released from the sky."),
  A("shot.fade", "shot", "Fadeaway", "rare", "Lean back away from the defender."),
  A("shot.stepback", "shot", "Step-Back", "epic", "Hop back to make space, then rise."),
  A("shot.oneleg", "shot", "One-Leg Fade", "epic", "Knee up, falling away. Unblockable vibes."),
  A("shot.hook", "shot", "Sky Hook", "legendary", "Side-on, arm sweeping over the top."),
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
  { id: "street", name: "STREET PACK", price: 150, cards: 1, odds: { common: 70, rare: 25, epic: 5, legendary: 0 }, min: null, col: "#5f6b86" },
  { id: "pro", name: "PRO PACK", price: 400, cards: 2, odds: { common: 45, rare: 38, epic: 14, legendary: 3 }, min: "rare", col: "#2f6fd6" },
  { id: "allstar", name: "ALL-STAR PACK", price: 900, cards: 3, odds: { common: 15, rare: 45, epic: 32, legendary: 8 }, min: "epic", col: "#7d3ccf" },
  { id: "hof", name: "HALL OF FAME PACK", price: 2000, cards: 3, odds: { common: 0, rare: 35, epic: 45, legendary: 20 }, min: "legendary", col: "#c98a12" },
];

const owns = (id) => ANIM[id] && (ANIM[id].rarity === "starter" || SAVE.owned.includes(id));
// The style a player uses for a category: yours from the Inventory, the AI's always the starter.
const styleOf = (p, cat) => (p.t === 0 && !p.port ? SAVE.equip[cat] : p.port && p.port.style && p.port.style[cat]) || cat + ".basic";

function rollRarity(odds) {
  let r = Math.random() * 100;
  for (const k of RARITIES) if ((r -= odds[k]) < 0) return k;
  return "common";
}
// Open a pack: returns the cards, adds new animations, refunds duplicates. null if you can't afford it.
function openPack(packId) {
  const pk = SHOP.find((s) => s.id === packId);
  if (!pk || SAVE.cc < pk.price) return null;
  SAVE.cc -= pk.price;
  const rar = [];
  for (let i = 0; i < pk.cards; i++) rar.push(rollRarity(pk.odds));
  // Guarantee: if no card reached the minimum, upgrade the last card to it.
  if (pk.min && !rar.some((r) => RARITIES.indexOf(r) >= RARITIES.indexOf(pk.min))) rar[rar.length - 1] = pk.min;
  rar.sort((a, b) => RARITIES.indexOf(a) - RARITIES.indexOf(b)); // best card revealed last
  const cards = rar.map((r) => {
    const pool = ANIMS.filter((a) => a.rarity === r),
      unowned = pool.filter((a) => !owns(a.id)),
      // A little kinder than pure chance: new animations are three times as likely as ones you have.
      weighted = pool.flatMap((a) => (owns(a.id) ? [a] : [a, a, a])),
      a = weighted[(Math.random() * weighted.length) | 0],
      dupe = owns(a.id);
    if (dupe) SAVE.cc += RARITY[r].refund;
    else {
      SAVE.owned.push(a.id);
      if (a.cat === "dribble" && SAVE.equip.moves.length < MAX_MOVES) SAVE.equip.moves.push(a.id);
    }
    return { a, dupe, refund: dupe ? RARITY[r].refund : 0, fresh: unowned.length > 0 };
  });
  writeSave();
  return cards;
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
