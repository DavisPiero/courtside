"use strict";
// The Shop: Daily Shop (five animations and one shoe, new every hour), Packs, Player Packs, Shoeboxes and Codes.
// And the opening: tear the pack (or pop the shoebox lid), deal the cards face down, then tap each one. A card
// shakes and its glow climbs through the rarity colours before it flips, so you feel how good it is first.
const SHOPUI = { tab: "daily", sel: null, timer: 0, msg: "" };
const CAT_NAME = { ...Object.fromEntries(CATS), shoe: "SHOES" };
function openShop() {
  OPEN.timers.forEach(clearTimeout);
  const have = ANIMS.filter((a) => a.rarity !== "starter" && owns(a.id)).length,
    all = ANIMS.filter((a) => a.rarity !== "starter").length;
  $("shopColl").textContent = `Collection: ${have} / ${all} animations · ${SAVE.shoes.length} / ${SHOES.length} shoes · Duplicates turn into Court Coins`;
  $("shopTabs").innerHTML = [
    ["daily", "DAILY SHOP"],
    ["packs", "PACKS"],
    ["players", "PLAYER PACKS"],
    ["boxes", "SHOEBOXES"],
    ["codes", "CODES"],
  ]
    .map(([k, l]) => `<button data-t="${k}" class="${SHOPUI.tab === k ? "on" : ""}">${l}${k === "packs" && freePacks() ? " <em>FREE</em>" : ""}</button>`)
    .join("");
  $("shopTabs").querySelectorAll("button").forEach((b) => (b.onclick = () => ((SHOPUI.tab = b.dataset.t), openShop())));
  $("shopBody").className = "sb-" + SHOPUI.tab;
  ({ daily: drawDaily, packs: drawPacks, players: drawPlayerPacks, boxes: drawBoxes, codes: drawCodes })[SHOPUI.tab]();
  $("bShopX").onclick = () => show("menu");
  clearInterval(SHOPUI.timer);
  SHOPUI.timer = setInterval(() => {
    if (!$("shop").classList.contains("on")) return clearInterval(SHOPUI.timer);
    const el = $("dailyClock");
    if (el) el.textContent = clockHMS(dailyLeft());
    if (dailyLeft() <= 0) openShop(); // on the hour: new items
  }, 1000);
  show("shop");
}
const freePacks = () => Object.values(SAVE.free).reduce((a, n) => a + n, 0);
const clockHMS = (s) => [s / 3600, (s / 60) % 60, s % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":");
const rarityTag = (a) => `<span class="rtag">${RARITY[a.rarity].name}${a.who ? " · " + a.who : ""}</span>`;

// ---------- Daily Shop. SHOPUI.sel is an animation id, or "shoe:" + a shoe id.
function drawDaily() {
  const items = dailyItems(),
    shoe = dailyShoe(),
    sid = "shoe:" + shoe.id;
  if (!SHOPUI.sel || (!items.includes(ANIM[SHOPUI.sel]) && SHOPUI.sel !== sid)) SHOPUI.sel = items[0].id;
  const tile = (a, i) => {
    const own = owns(a.id),
      price = SINGLE_PRICE[a.rarity],
      can = SAVE.cc >= price;
    return `<div class="item r-${a.rarity}${i === 0 ? " feat" : ""}${a.id === SHOPUI.sel ? " sel" : ""}${own ? " owned" : ""}" data-id="${a.id}">
      ${i === 0 ? '<em class="ftag">FEATURED</em>' : ""}
      <span class="icat">${CAT_NAME[a.cat]}</span><b>${a.name}</b>${rarityTag(a)}
      ${i === 0 ? `<p>${a.desc}</p>` : ""}
      ${own ? '<div class="iown">✓ OWNED</div>' : `<button class="btn${can ? " pri" : ""}" data-buy="${a.id}"${can ? "" : " disabled"}>${price.toLocaleString()} CC</button>`}
    </div>`;
  };
  const sOwn = ownsShoe(shoe.id),
    sPrice = SHOE_PRICE[shoe.rarity],
    sCan = SAVE.cc >= sPrice,
    shoeTile = `<div class="item shoe r-${shoe.rarity}${SHOPUI.sel === sid ? " sel" : ""}${sOwn ? " owned" : ""}" data-id="${sid}">
      <span class="icat">SHOES</span><canvas class="shcv" data-s="${shoe.id}"></canvas><b>${shoe.name}</b>${rarityTag(shoe)}
      ${sOwn ? '<div class="iown">✓ OWNED</div>' : `<button class="btn${sCan ? " pri" : ""}" data-shoe="${shoe.id}"${sCan ? "" : " disabled"}>${sPrice.toLocaleString()} CC</button>`}
    </div>`;
  const sel = SHOPUI.sel === sid ? shoe : ANIM[SHOPUI.sel],
    prev = SHOPUI.sel === sid ? `<canvas id="shopShoe" class="bigshoe"></canvas>` : `<canvas id="shopCv"></canvas>`;
  $("shopBody").innerHTML = `<div class="dhead"><b>THIS HOUR'S ITEMS</b><span>NEW ITEMS IN <u id="dailyClock">${clockHMS(dailyLeft())}</u></span></div>
    <div class="dgrid"><div class="dprev r-${sel.rarity}">${prev}<b>${sel.name}</b>${rarityTag(sel)}<span>${sel.desc}</span></div>
    <div class="ditems">${items.map(tile).join("")}${shoeTile}</div></div>`;
  $("shopBody").querySelectorAll(".item").forEach((el) => (el.onclick = () => (sfx("click"), (SHOPUI.sel = el.dataset.id), drawDaily())));
  $("shopBody").querySelectorAll("canvas.shcv").forEach((cv) => shoeCanvas(cv, SHOE[cv.dataset.s]));
  $("shopBody").querySelectorAll("[data-buy]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        const id = b.dataset.buy;
        if (!buySingle(id)) return;
        SHOPUI.sel = id;
        sfxReveal(ANIM[id].rarity);
        burst(b, RARITY[ANIM[id].rarity].col, 26);
        openShop();
      }),
  );
  $("shopBody").querySelectorAll("[data-shoe]").forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        if (!buyShoe(b.dataset.shoe)) return;
        sfxReveal(shoe.rarity);
        burst(b, RARITY[shoe.rarity].col, 26);
        openShop();
      }),
  );
}
// The selected Daily Shop item: an animation performing, or the shoe.
function shopPreview() {
  if (!$("shop").classList.contains("on") || SHOPUI.tab !== "daily" || !SHOPUI.sel) return;
  if ($("shopShoe")) return shoeCanvas($("shopShoe"), SHOE[SHOPUI.sel.slice(5)], T);
  if ($("shopCv")) previewAnim($("shopCv"), previewModel("shop"), SHOPUI.sel);
}

// ---------- Packs
const pct = (v) => (v < 1 ? v : Math.round(v * 10) / 10) + "%";
function oddsRows(odds) {
  return RARITIES.filter((r) => odds[r] > 0)
    .map((r) => `<div class="r-${r}">${RARITY[r].name}<span>${pct(odds[r])}</span><i><b style="width:${Math.max(2, odds[r])}%"></b></i></div>`)
    .join("");
}
function packCard(pk, extra) {
  const free = SAVE.free[pk.id] || 0,
    can = free > 0 || SAVE.cc >= pk.price;
  return `<div class="pk${pk.who ? " ppk" : ""}${free ? " freepk" : ""}" style="--pc:${pk.col}">
      <div class="art">${pk.who ? `<canvas class="pkcv" data-pk="${pk.id}"></canvas>` : ""}<span>${pk.name}<small>${pk.cards} animation${pk.cards > 1 ? "s" : ""}</small></span></div>
      ${extra || ""}
      ${pk.who ? '<div class="olbl">BONUS CARD</div>' : ""}<div class="odds">${oddsRows(pk.odds)}</div>
      <div class="guar">${pk.who ? "" : pk.min ? `1 guaranteed ${RARITY[pk.min].name}${pk.min === "legendary" ? "" : " or better"}` : ""}</div>
      <button class="btn${can ? " pri" : ""}" data-pk="${pk.id}"${can ? "" : " disabled"}>${free ? `OPEN FREE${free > 1 ? " ×" + free : ""}` : pk.price.toLocaleString() + " CC"}</button>
    </div>`;
}
function drawPacks() {
  $("shopBody").innerHTML = `<div class="packs">${SHOP.map((pk) => packCard(pk)).join("")}</div>`;
  $("shopBody").querySelectorAll("button[data-pk]").forEach((b) => (b.onclick = () => openPackScreen(b.dataset.pk)));
}
function drawPlayerPacks() {
  $("shopBody").innerHTML =
    `<p class="pnote">Each Player Pack has <b>1 ICONIC signature move</b> of that player, plus 1 bonus card.</p>` +
    `<div class="packs six">${PLAYER_PACKS.map((pk) => {
      const sig = ANIMS.filter((a) => a.who === pk.who),
        got = sig.filter((a) => owns(a.id)).length;
      return packCard(
        pk,
        `<div class="sigs">${sig.map((a) => `<div class="${owns(a.id) ? "got" : ""}">${owns(a.id) ? "✓" : "·"} ${a.name}</div>`).join("")}<em>${got}/${sig.length} collected</em></div>`,
      );
    }).join("")}</div>`;
  $("shopBody").querySelectorAll("button[data-pk]").forEach((b) => (b.onclick = () => openPackScreen(b.dataset.pk)));
  // Each pack shows its player, drawn once with the game's model.
  $("shopBody").querySelectorAll("canvas.pkcv").forEach((cv2) => {
    const pk = PLAYER_PACKS.find((p) => p.id === cv2.dataset.pk),
      ti = HOF_TEAMS.findIndex((t) => t.c === pk.hof[0]),
      P0 = portraitPlayer(ti, pk.hof[1], 40, -1, HOF_TEAMS);
    P0.port.t = 0.3;
    P0.port.pose = "cel";
    P0.port.style = { cel: "cel.flex" };
    renderModel(cv2, P0, 0.6);
  });
}

// ---------- Shoeboxes: one mystery shoe each
const boxArt = (bx) => `<div class="sbox" style="--bc:${bx.col};--lc:${bx.lid}"><i class="lid"></i><i class="bod"><b>?</b></i></div>`;
function drawBoxes() {
  $("shopBody").innerHTML =
    `<p class="pnote">Every shoebox has <b>1 mystery shoe</b>. Your whole team wears the pair you equip in the Inventory.</p>` +
    `<div class="packs">${SHOEBOXES.map((bx) => {
      const can = SAVE.cc >= bx.price;
      return `<div class="pk boxpk" style="--pc:${bx.col}"><div class="art">${boxArt(bx)}<span>${bx.name}<small>1 shoe</small></span></div>
        <div class="odds">${oddsRows(bx.odds)}</div>
        <button class="btn${can ? " pri" : ""}" data-box="${bx.id}"${can ? "" : " disabled"}>${bx.price.toLocaleString()} CC</button></div>`;
    }).join("")}</div>`;
  $("shopBody").querySelectorAll("button[data-box]").forEach((b) => (b.onclick = () => openBoxScreen(b.dataset.box)));
}

// ---------- Codes: type a code, get a reward. Codes are stored scrambled (FNV-1a hash) so they aren't sitting in
// the source as plain text, though anyone determined could still work them out. Each works once per save.
const CODES = {
  "5673b267": { name: "LAUNCHED", cc: 1000, anim: "dunk.liftoff" },
};
function codeHash(str) {
  let h = 0x811c9dc5;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}
// Returns a message for the player.
function redeemCode(str) {
  const k = codeHash(str.trim()),
    c = CODES[k];
  if (!c) return ["bad", "That code doesn't work. Codes are case sensitive."];
  if (SAVE.codes.includes(k)) return ["bad", "You've already used that code."];
  SAVE.codes.push(k);
  const got = [];
  if (c.cc) {
    SAVE.cc += c.cc;
    got.push(`${c.cc.toLocaleString()} CC`);
  }
  if (c.anim) {
    grant(ANIM[c.anim]);
    got.push(`${RARITY[ANIM[c.anim].rarity].name} ${ANIM[c.anim].name}`);
  }
  writeSave();
  return ["ok", "Unlocked: " + got.join(" + ") + "!", c];
}
function drawCodes() {
  const [cls, text] = SHOPUI.msg || ["", ""];
  $("shopBody").innerHTML = `<div class="codes">
    <p class="pnote">Got a code? Type it in exactly as it's written.</p>
    <div class="crow"><input id="codeIn" maxlength="24" autocomplete="off" spellcheck="false" placeholder="ENTER CODE"><button class="btn pri" id="bCode">REDEEM</button></div>
    <div class="cmsg ${cls}" id="codeMsg">${text}</div></div>`;
  SHOPUI.msg = "";
  const go = () => {
    const r = redeemCode($("codeIn").value);
    SHOPUI.msg = r;
    if (r[0] === "ok") {
      sfxReveal(r[2].anim ? ANIM[r[2].anim].rarity : "rare");
      flashScreen(r[2].anim ? RARITY[ANIM[r[2].anim].rarity].col : "#ffcf5c");
      burst($("bCode"), r[2].anim ? RARITY[ANIM[r[2].anim].rarity].col : "#ffcf5c", 60);
    } else sfx("nope");
    openShop();
  };
  $("bCode").onclick = go;
  $("codeIn").onkeydown = (e) => e.code === "Enter" && (e.preventDefault(), go());
}

// ---------- pack opening (and shoebox unboxing: same cards, one shoe)
const OPEN = { pk: null, cards: [], sel: null, timers: [], stage: "", busy: 0, shown: 0, box: 0 };
const TIERS = ["common", "rare", "epic", "legendary", "iconic", "mythic", "godlike", "gametime"];
const bigR = (r) => TIERS.indexOf(r) >= 3;
function later(f, ms) {
  OPEN.timers.push(setTimeout(f, ms));
}
function openPackScreen(pkId) {
  const pk = SHOP.find((s) => s.id === pkId) || PLAYER_PACKS.find((s) => s.id === pkId),
    cards = openPack(pkId);
  if (!cards) return;
  openStage(pk, cards, 0, () => openPackScreen(pkId), SAVE.free[pkId] > 0 || SAVE.cc >= pk.price);
  $("openTitle").textContent = pk.who ? pk.name + " · PLAYER PACK" : pk.name;
  $("openPack").innerHTML = `<b>${pk.name}</b><small>${pk.who ? "PLAYER PACK" : pk.cards + " CARDS"}</small><i>TAP TO OPEN</i>`;
  $("openPack").onclick = () => tearPack(pk);
}
// A shoebox: the box sits on the table, shakes, the lid pops off, tissue flies, and the shoe card rises out.
function openBoxScreen(id) {
  const bx = SHOEBOXES.find((b) => b.id === id),
    got = openShoebox(id);
  if (!got) return;
  const card = { a: { ...got.s, cat: "shoe", shoe: got.s }, dupe: got.dupe, refund: got.refund };
  openStage(bx, [card], 1, () => openBoxScreen(id), SAVE.cc >= bx.price);
  $("openTitle").textContent = bx.name;
  $("openPack").className = "opack obox";
  $("openPack").innerHTML = boxArt(bx) + `<i>TAP TO OPEN</i>`;
  $("openPack").onclick = () => popBox(bx);
}
function openStage(pk, cards, box, again, canAgain) {
  OPEN.timers.forEach(clearTimeout);
  Object.assign(OPEN, { pk: pk.id, cards, sel: null, timers: [], stage: "pack", busy: 0, shown: 0, box });
  $("open").style.setProperty("--pc", pk.col);
  $("openPack").className = "opack";
  $("openCards").innerHTML = "";
  $("openInfo").className = "oinfo";
  $("openAct").className = "act hide";
  $("bOpenAll").style.display = "none";
  const ag = $("bOpenAgain");
  ag.disabled = !canAgain;
  ag.textContent = SAVE.free[pk.id] > 0 ? "OPEN YOUR FREE PACK" : `OPEN ANOTHER (${pk.price.toLocaleString()} CC)`;
  ag.onclick = again;
  $("bOpenShop").onclick = openShop;
  $("bOpenInv").onclick = () => {
    const c = OPEN.cards[OPEN.cards.length - 1];
    INV.cat = c ? c.a.cat : INV.cat;
    openInv();
    if (c) {
      INV.sel = c.a.id;
      drawInv();
    }
  };
  $("bOpenAll").onclick = revealAll;
  show("open");
  sfx("whoosh");
}
function popBox(bx) {
  if (OPEN.stage !== "pack") return;
  OPEN.stage = "tear";
  $("openPack").classList.add("tear");
  for (let i = 0; i < 5; i++) later(() => sfxTick(i), i * 140);
  later(() => {
    $("openPack").classList.add("pop");
    sfx("pop");
    burst($("openPack"), "#f4efe2", 40); // tissue paper
    burst($("openPack"), bx.lid, 14);
  }, 750);
  later(() => {
    $("openPack").classList.add("gone");
    dealCards(bx);
    $("openCards").firstElementChild.classList.add("rise");
    later(() => chargeCard(0), 450);
  }, 1150);
}
// The pack shakes harder and harder, flashes, and the cards fly out face down.
function tearPack(pk) {
  if (OPEN.stage !== "pack") return;
  OPEN.stage = "tear";
  $("openPack").classList.add("tear");
  for (let i = 0; i < 4; i++) later(() => sfxTick(i), i * 160);
  later(() => {
    $("openPack").classList.add("gone");
    flashScreen("#fff");
    sfx("dunk");
    dealCards(pk);
  }, 700);
}
function dealCards(pk) {
  OPEN.stage = "cards";
  $("openCards").innerHTML = OPEN.cards
    .map(
      (c, i) => `<div class="card r-${c.a.rarity}" data-i="${i}" style="--pc:${pk.col};--d:${i * 0.12}s"><div class="in">
        <div class="bk"><b>?</b><small>${pk.name}</small></div>
        <div class="fr"><span class="rtag">${RARITY[c.a.rarity].name}</span>${c.a.shoe ? `<canvas class="shcv" data-s="${c.a.id}"></canvas>` : ""}<b>${c.a.name}</b><span class="cat">${CAT_NAME[c.a.cat]}${c.a.who ? " · " + c.a.who : ""}</span>
        <span class="tag${c.dupe ? " dupe" : ""}">${c.dupe ? `DUPLICATE +${c.refund} CC` : "NEW!"}</span></div></div></div>`,
    )
    .join("");
  $("openCards").querySelectorAll("canvas.shcv").forEach((cv) => shoeCanvas(cv, SHOE[cv.dataset.s]));
  $("openCards").querySelectorAll(".card").forEach(
    (el) => (el.onclick = () => (el.classList.contains("up") ? selectCard(+el.dataset.i) : chargeCard(+el.dataset.i))),
  );
  $("openName").textContent = "";
  $("openHint").textContent = OPEN.box ? "" : "TAP A CARD";
  $("bOpenAll").style.display = OPEN.box ? "none" : "";
}
// Build-up, then flip. The glow climbs one rarity at a time up to the card's own; sometimes a low card
// flickers one step higher before it settles (so close!). quick: shorter build-up (Reveal All).
function chargeCard(i, quick, done) {
  const el = $("openCards").children[i],
    c = OPEN.cards[i];
  if (!el || el.classList.contains("up") || el.classList.contains("charge") || (OPEN.busy && !quick)) return;
  OPEN.busy = 1;
  $("openHint").textContent = "";
  const top = TIERS.indexOf(c.a.rarity),
    tease = top <= 1 && Math.random() < 0.18, // near miss: climbs one higher, then drops back
    path = [];
  for (let k = 0; k <= top; k++) path.push(k);
  if (tease) path.push(top + 1, top);
  const step = quick ? 160 : top >= 5 ? 620 : top >= 3 ? 520 : 360;
  el.classList.add("charge");
  path.forEach((k, n) =>
    later(() => {
      el.style.setProperty("--gc", RARITY[TIERS[k]].col);
      el.dataset.lv = k;
      sfxTick(k);
      if (k >= 3) shakeScreen(k - 2);
    }, n * step),
  );
  later(() => flipCard(i, done), path.length * step + (top >= 3 && !quick ? 300 : 80));
}
function flipCard(i, done) {
  const el = $("openCards").children[i],
    c = OPEN.cards[i],
    r = c.a.rarity,
    big = bigR(r);
  el.classList.remove("charge");
  el.classList.add("up");
  OPEN.busy = 0;
  OPEN.shown++;
  sfxReveal(r);
  if (r !== "common") burst(el, RARITY[r].col, big ? 70 : r === "epic" ? 36 : 16);
  if (big) {
    flashScreen(RARITY[r].col);
    shakeScreen(3);
    banner(r === "iconic" ? `ICONIC! ${c.a.who}` : { godlike: "GODLIKE!!", gametime: "GAMETIME!", mythic: "MYTHIC!" }[r] || "LEGENDARY!", RARITY[r].col);
    if (TIERS.indexOf(r) >= 5) later(() => (burst(el, RARITY[r].col, 90), flashScreen("#fff")), 350);
  } else if (r === "epic") flashScreen(RARITY.epic.col);
  selectCard(i);
  if (OPEN.shown >= OPEN.cards.length) {
    $("openAct").className = "act";
    $("bOpenAll").style.display = "none";
    $("openHint").textContent = "";
  } else if (!done) $("openHint").textContent = "TAP THE NEXT CARD";
  if (done) done();
}
function revealAll() {
  if (OPEN.busy) return;
  const left = [...$("openCards").children].map((el, i) => (el.classList.contains("up") ? -1 : i)).filter((i) => i >= 0);
  const next = () => {
    const i = left.shift();
    if (i === undefined) return;
    chargeCard(i, !bigR(OPEN.cards[i].a.rarity), () => later(next, 250));
  };
  next();
}
function selectCard(i) {
  const c = OPEN.cards[i];
  OPEN.sel = c.a.id;
  $("openCards").querySelectorAll(".card").forEach((el, j) => el.classList.toggle("sel", j === i));
  $("openInfo").className = "oinfo on r-" + c.a.rarity;
  $("openName").innerHTML = `<b>${c.a.name}</b>${rarityTag(c.a)}<span>${c.a.desc}</span>`;
  $("openInfo").classList.toggle("shoe", !!c.a.shoe);
}

// ---------- effects: screen flash, shake, a burst of pixel confetti, a banner
function flashScreen(col) {
  const f = $("fxFlash");
  f.style.background = col;
  f.classList.remove("on");
  void f.offsetWidth;
  f.classList.add("on");
}
function shakeScreen(n) {
  const s = $("open");
  s.classList.remove("shake1", "shake2", "shake3");
  void s.offsetWidth;
  s.classList.add("shake" + Math.min(3, n));
}
function burst(fromEl, col, n) {
  const r = fromEl.getBoundingClientRect(),
    layer = $("fxLayer"),
    cx = r.left + r.width / 2,
    cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i"),
      a = Math.random() * 6.283,
      d = 80 + Math.random() * 260;
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${Math.random() < 0.3 ? "#fff" : col};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 60}px;animation-delay:${Math.random() * 0.08}s`;
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}
// A big message across the top of any screen (signing bonus, payday and so on).
function flashBanner(text) {
  const el = $("notice");
  el.textContent = text;
  el.classList.remove("on");
  void el.offsetWidth;
  el.classList.add("on");
  sfx("coins");
}
function banner(text, col) {
  const b = $("openBanner");
  b.textContent = text;
  b.style.color = col;
  b.classList.remove("on");
  void b.offsetWidth;
  b.classList.add("on");
}
