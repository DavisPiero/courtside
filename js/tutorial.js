"use strict";
// The tutorial (TUTORIAL under the logo). A first draft.
// Part 1, on court: short "do this" steps on an empty practice court with your two teammates. Each step ticks
// itself off when you've done it (or press SKIP). Keyboard or touch wording follows your device.
// Part 2, the rest of the game: a few cards about the campaign, Quick Play, minigames, the Shop, the Inventory,
// upgrading your hooper and Court Coins.
SCREENS.push("tutc");
// Each court step: title, keyboard text, touch text, and a check that's true once you've done it.
// info: no check, just a NEXT button.
const TUT_STEPS = [
  { t: "MOVE", k: "Move with W A S D (or the arrow keys).", m: "Touch the left side of the screen and drag to move.", ok: (s) => s.moved > 10 },
  { t: "SPRINT", k: "Hold SHIFT while you move to sprint. Watch the ring under you: that's your stamina.", m: "Push the joystick all the way to the edge to sprint. The ring under you is your stamina.", ok: (s) => s.sprint > 1 },
  { t: "DRIBBLE MOVE", k: "Press E for a dribble move. Every press does a different one. Near a defender it can break their ankles!", m: "Press MOVE for a dribble move. Every press does a different one.", ok: () => G.pl[G.ctrl].mv },
  { t: "SHOOT", k: "Hold SPACE to rise, let go to shoot.", m: "Hold SHOOT to rise, let go to shoot.", ok: () => G.ball.mode === "shot" },
  { t: "PERFECT RELEASE", k: "Let go of SPACE when the meter is in the GREEN zone. A perfect release always goes in, even from half court!", m: "Let go of SHOOT when the meter is in the GREEN zone. A perfect release always goes in!", ok: () => G.st.greens > 0 },
  { t: "LAYUPS AND DUNKS", k: "Run at the rim with the ball and press SPACE close to it: layup, or a dunk if you're moving fast.", m: "Run at the rim with the ball and press SHOOT close to it: layup, or a dunk if you're moving fast.", ok: () => !!G.cut },
  { t: "PASS", k: "Press Q to pass to the open teammate. Steer with WASD to pick who.", m: "Press PASS to pass to the open teammate.", ok: () => G.ball.mode === "pass" || (G.st.oops || 0) > 0 },
  { t: "ALLEY-OOP", k: "Teammates cut to the rim. When a gold arrow shows over one, press Q: they catch the lob and dunk it.", m: "Teammates cut to the rim. When a gold arrow shows over one, PASS turns into OOP!: press it for the lob.", ok: () => (G.st.oops || 0) > 0, info: 1 },
  { t: "ON FIRE", k: "Score three times in a row without the other team scoring and your team is ON FIRE: a flaming ball and a bigger green zone.", m: "Score three times in a row without the other team scoring and your team is ON FIRE: a flaming ball and a bigger green zone.", info: 1 },
  { t: "DEFENCE", k: "Without the ball: F to steal, SPACE to jump and block, Q to switch to the teammate nearest the ball.", m: "Without the ball: STEAL, JUMP to block, SWITCH to the teammate nearest the ball.", info: 1 },
  { t: "MAYHEM", k: "In MAYHEM mode anything goes: CLICK to punch (drop them and take the ball), CTRL to slide-tackle. Every punch costs a few coins.", m: "In MAYHEM mode anything goes: PUNCH to drop them and take the ball, SLIDE to tackle. Every punch costs a few coins.", info: 1 },
  { t: "BUZZER BEATERS", k: "A shot in the air when the clock hits zero still counts. Time slows down while it flies.", m: "A shot in the air when the clock hits zero still counts. Time slows down while it flies.", info: 1 },
];
// Part 2: the rest of the game.
const TUT_CARDS = [
  ["CAMPAIGN", "Make your hooper and start on the Street: The Block, The City, the Summer Jam. Win the Summer Jam and NBA scouts call. Every game has three stars to win. Beating a chapter boss wins a free All-Star Pack."],
  ["YOUR HOOPER", "On EDIT HOOPER, spend Court Coins to upgrade Speed, Accuracy, Range, Finishing, Handling, Defence, Hops and Stamina. Each upgrade costs a bit more. Campaign games show a recommended rating."],
  ["NBA CAREER", "Choose a team and sign: 1250 CC signing bonus, and your contract pays Court Coins every day. Clear a chapter and better teams make offers."],
  ["QUICK PLAY AND MINIGAMES", "Quick Play: any two teams, today's NBA or the Hall of Fame. Minigames: the 3-point contest, the dunk contest and 1-on-1."],
  ["COURT COINS", "You earn CC for winning, for style (perfect releases, dunks, ankle breakers, threes, steals, blocks), for campaign stars, minigames and your NBA contract."],
  ["THE SHOP", "The Daily Shop changes every hour. Packs and Player Packs have random animations, Shoeboxes have one mystery shoe. Got a code? Type it in the CODES tab."],
  ["INVENTORY", "Equip your dunk, layup, jump shot, celebration and up to 3 extra dribble moves, and pick the shoes your team wears. Don't need an animation? SELL it for coins."],
  ["THAT'S IT!", "Settings has video, sound and controls, and the Animation Lab to watch every move slowly. Now go hoop."],
];
const TUT = { on: 0, i: 0, s: null, done: 0, card: 0 };
function openTutorial() {
  // Your crew (or OKC) against nobody: an empty court to learn on.
  const you = SAVE.name ? crewTeam() : NBA("OKC");
  Object.assign(OPT, { mode: "clean", court: "arena", diff: 0 });
  G.rules = { ...RULES_STD };
  G.camp = G.mg = null;
  setTeamObjs(you, NBA("SAS"));
  start(1);
  G.tip = null;
  document.body.classList.remove("bars");
  G.pl.forEach((p) => (p.gone = p.t === 1));
  setPoss(0);
  G.pl.forEach((p) => p.gone && Object.assign(p, { x: -400 - p.id * 10, y: -400 }));
  Object.assign(TUT, { on: 1, i: 0, done: 0 });
  tutStep();
}
function tutStep() {
  const st = TUT_STEPS[TUT.i];
  TUT.s = { moved: 0, sprint: 0, x: G.pl[G.ctrl].x, y: G.pl[G.ctrl].y, t: T };
  TUT.done = 0;
  $("tut").className = "on";
  $("tutN").textContent = `${TUT.i + 1} / ${TUT_STEPS.length}`;
  $("tutT").textContent = st.t;
  $("tutX").textContent = G.touch ? st.m : st.k;
  $("bTutNext").textContent = st.info ? "NEXT ▸" : "SKIP ▸";
  $("bTutNext").onclick = tutNext;
  $("bTutEnd").onclick = tutQuit;
}
// Every frame while the court part runs: track what you've done and tick the step off.
function tutUpd(dt) {
  if (!TUT.on || !G.run || G.pause) return;
  const st = TUT_STEPS[TUT.i],
    s = TUT.s,
    p = G.pl[G.ctrl];
  // Keep the ball on your side and nobody else on the court.
  G.pl.forEach((q) => q.gone && Object.assign(q, { x: -400 - q.id * 10, y: -400 }));
  if (G.poss === 1 && !G.dead && !G.cut) setPoss(0);
  s.moved += hy(p.x - s.x, p.y - s.y);
  s.x = p.x;
  s.y = p.y;
  if (hy(p.vx, p.vy) > p.sp * 1.2) s.sprint += dt;
  if (!TUT.done && st.ok && st.ok(s)) {
    TUT.done = 1;
    $("tut").className = "on ok";
    sfx("coins");
    setTimeout(() => TUT.on && TUT_STEPS[TUT.i] === st && tutNext(), 1100);
  }
}
function tutNext() {
  TUT.i++;
  if (TUT.i >= TUT_STEPS.length) return tutCards();
  tutStep();
}
function tutQuit() {
  TUT.on = 0;
  $("tut").className = "";
  quitToMenu();
}
// Part 2: cards about the rest of the game.
function tutCards() {
  TUT.on = 0;
  $("tut").className = "";
  quitToMenu();
  TUT.card = 0;
  drawTutCard();
  show("tutc");
}
function drawTutCard() {
  const [t, x] = TUT_CARDS[TUT.card],
    last = TUT.card === TUT_CARDS.length - 1;
  $("tutcN").textContent = `${TUT.card + 1} / ${TUT_CARDS.length}`;
  $("tutcT").textContent = t;
  $("tutcX").textContent = x;
  $("bTutcBack").disabled = TUT.card === 0;
  $("bTutcBack").onclick = () => ((TUT.card = Math.max(0, TUT.card - 1)), drawTutCard());
  $("bTutcNext").textContent = last ? "DONE" : "NEXT ▸";
  $("bTutcNext").onclick = () => (last ? show("menu") : ((TUT.card += 1), drawTutCard()));
}
