"use strict";
// Animation packs, bought with Court Coins (CC) and equipped in the Inventory.
// cat: dunk (equip one), dribble (each one owned can be switched on; adds a move to the E rotation),
// cel (celebration, equip one), shot (jump-shot form, equip one). Price 0 = free starter.
// Only your team uses your packs; the AI plays the basics.
const PACKS = [
  { id: "dunk.basic", cat: "dunk", name: "Hammer", price: 0, desc: "One or two hands, straight down. The classic." },
  { id: "dunk.tomahawk", cat: "dunk", name: "Tomahawk", price: 300, desc: "Cock it way back behind your head, then hammer it home." },
  { id: "dunk.reverse", cat: "dunk", name: "Reverse", price: 350, desc: "Turn your back to the rim and throw it down backwards." },
  { id: "dunk.windmill", cat: "dunk", name: "Windmill", price: 400, desc: "A full arm circle on the way up. Pure style." },
  { id: "dunk.360", cat: "dunk", name: "360", price: 500, desc: "Spin all the way round in the air before you slam it." },
  { id: "dribble.hesi", cat: "dribble", name: "Hesitation", price: 250, desc: "Freeze the defender with a fake stop, then explode past." },
  { id: "dribble.snatch", cat: "dribble", name: "Snatch-Back", price: 250, desc: "Yank the ball back and hop away to make space." },
  { id: "dribble.double", cat: "dribble", name: "Double Cross", price: 300, desc: "Crossover, then cross right back. Twice the wobble." },
  { id: "cel.basic", cat: "cel", name: "Arms Up", price: 0, desc: "Both arms in the air." },
  { id: "cel.flex", cat: "cel", name: "Flex", price: 150, desc: "Show off the guns." },
  { id: "cel.shh", cat: "cel", name: "Shh", price: 150, desc: "Finger to the lips. Quiet, crowd." },
  { id: "cel.toosmall", cat: "cel", name: "Too Small", price: 200, desc: "Crouch and hold your hand down low. They're too small." },
  { id: "cel.dance", cat: "cel", name: "Dance", price: 200, desc: "A little bounce-and-shimmy." },
  { id: "shot.basic", cat: "shot", name: "Classic Jumper", price: 0, desc: "Square up, rise, release." },
  { id: "shot.set", cat: "shot", name: "Set Shot", price: 150, desc: "Old-school: feet barely leave the floor." },
  { id: "shot.high", cat: "shot", name: "High Release", price: 200, desc: "Arms all the way up, released from the sky." },
  { id: "shot.fade", cat: "shot", name: "Fadeaway", price: 250, desc: "Lean back away from the defender as you shoot." },
];
const PACK = Object.fromEntries(PACKS.map((p) => [p.id, p]));
const CATS = [
  ["dunk", "DUNKS"],
  ["dribble", "DRIBBLE"],
  ["cel", "CELEBRATIONS"],
  ["shot", "SHOT FORM"],
];
const owns = (id) => PACK[id] && (PACK[id].price === 0 || SAVE.owned.includes(id));
// The style a player uses for a category: yours from the Inventory, the AI's always basic.
const styleOf = (p, cat) => (p.t === 0 && !p.port ? SAVE.equip[cat] : p.port && p.port.style && p.port.style[cat]) || cat + ".basic";
function buyPack(id) {
  const k = PACK[id];
  if (!k || owns(id) || SAVE.cc < k.price) return false;
  SAVE.cc -= k.price;
  SAVE.owned.push(id);
  if (k.cat === "dribble") SAVE.equip.moves.push(id);
  else SAVE.equip[k.cat] = id;
  writeSave();
  return true;
}
function equipPack(id) {
  const k = PACK[id];
  if (!owns(id)) return;
  if (k.cat === "dribble") {
    const m = SAVE.equip.moves,
      i = m.indexOf(id);
    if (i >= 0) m.splice(i, 1);
    else m.push(id);
  } else SAVE.equip[k.cat] = id;
  writeSave();
}
