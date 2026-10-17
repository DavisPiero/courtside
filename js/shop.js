"use strict";
// The Shop: Daily Shop (single animations that change every day), Packs, and Player Packs.
// And the pack opening: tear the pack, deal the cards face down, then tap each one. A card shakes and its glow
// climbs through the rarity colours before it flips, so you feel how good it is before you see it.
const SHOPUI = { tab: "daily", sel: null, timer: 0 };
const CAT_NAME = Object.fromEntries(CATS);
function openShop() {
  OPEN.timers.forEach(clearTimeout);
  const have = ANIMS.filter((a) => a.rarity !== "starter" && owns(a.id)).length,
    all = ANIMS.filter((a) => a.rarity !== "starter").length;
  $("shopColl").textContent = `Collection: ${have} / ${all} animations · Duplicates turn into Court Coins`;
  $("shopTabs").innerHTML = [
    ["daily", "DAILY SHOP"],
    ["packs", "PACKS"],
    ["players", "PLAYER PACKS"],
  ]
    .map(([k, l]) => `<button data-t="${k}" class="${SHOPUI.tab === k ? "on" : ""}">${l}</button>`)
    .join("");
  $("shopTabs").querySelectorAll("button").forEach((b) => (b.onclick = () => ((SHOPUI.tab = b.dataset.t), openShop())));
  $("shopBody").className = "sb-" + SHOPUI.tab;
  if (SHOPUI.tab === "daily") drawDaily();
  else if (SHOPUI.tab === "packs") drawPacks();
  else drawPlayerPacks();
  $("bShopX").onclick = () => show("menu");
  clearInterval(SHOPUI.timer);
  SHOPUI.timer = setInterval(() => {
    if (!$("shop").classList.contains("on")) return clearInterval(SHOPUI.timer);
    const el = $("dailyClock");
    if (el) el.textContent = clockHMS(dailyLeft());
    if (dailyLeft() <= 0) openShop(); // midnight: new items
  }, 1000);
  show("shop");
}
const clockHMS = (s) => [s / 3600, (s / 60) % 60, s % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":");
const rarityTag = (a) => `<span class="rtag">${RARITY[a.rarity].name}${a.who ? " · " + a.who : ""}</span>`;

// ---------- Daily Shop
function drawDaily() {
  const items = dailyItems();
  if (!SHOPUI.sel || !items.includes(ANIM[SHOPUI.sel])) SHOPUI.sel = items[0].id;
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
  const a = ANIM[SHOPUI.sel];
  $("shopBody").innerHTML = `<div class="dhead"><b>TODAY'S ITEMS</b><span>NEW ITEMS IN <u id="dailyClock">${clockHMS(dailyLeft())}</u></span></div>
    <div class="dgrid"><div class="dprev r-${a.rarity}"><canvas id="shopCv"></canvas><b>${a.name}</b>${rarityTag(a)}<span>${a.desc}</span></div>
    <div class="ditems">${items.map(tile).join("")}</div></div>`;
  $("shopBody").querySelectorAll(".item").forEach((el) => (el.onclick = () => ((SHOPUI.sel = el.dataset.id), drawDaily())));
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
}
// The selected Daily Shop item, performing.
function shopPreview() {
  if (!$("shop").classList.contains("on") || SHOPUI.tab !== "daily" || !SHOPUI.sel || !$("shopCv")) return;
  previewAnim($("shopCv"), previewModel("shop"), SHOPUI.sel);
}

// ---------- Packs
function packCard(pk, extra) {
  const can = SAVE.cc >= pk.price;
  return `<div class="pk${pk.who ? " ppk" : ""}" style="--pc:${pk.col}">
      <div class="art">${pk.who ? `<canvas class="pkcv" data-pk="${pk.id}"></canvas>` : ""}<span>${pk.name}${pk.who ? "" : " PACK"}<small>${pk.cards} animation${pk.cards > 1 ? "s" : ""}</small></span></div>
      ${extra || ""}
      ${pk.who ? '<div class="olbl">BONUS CARD</div>' : ""}<div class="odds">${RARITIES.filter((r) => pk.odds[r] > 0)
        .map((r) => `<div class="r-${r}">${RARITY[r].name}<span>${pk.odds[r]}%</span><i><b style="width:${pk.odds[r]}%"></b></i></div>`)
        .join("")}</div>
      <div class="guar">${pk.who ? "" : pk.min ? `1 guaranteed ${RARITY[pk.min].name}${pk.min === "legendary" ? "" : " or better"}` : ""}</div>
      <button class="btn${can ? " pri" : ""}" data-pk="${pk.id}"${can ? "" : " disabled"}>${pk.price.toLocaleString()} CC</button>
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

// ---------- pack opening
const OPEN = { pk: null, cards: [], sel: null, timers: [], stage: "", busy: 0, shown: 0 };
const TIERS = ["common", "rare", "epic", "legendary", "iconic"];
function later(f, ms) {
  OPEN.timers.push(setTimeout(f, ms));
}
function openPackScreen(pkId) {
  const pk = SHOP.find((s) => s.id === pkId) || PLAYER_PACKS.find((s) => s.id === pkId),
    cards = openPack(pkId);
  if (!cards) return;
  OPEN.timers.forEach(clearTimeout);
  Object.assign(OPEN, { pk: pkId, cards, sel: null, timers: [], stage: "pack", busy: 0, shown: 0 });
  $("openTitle").textContent = pk.who ? pk.name + " · PLAYER PACK" : pk.name;
  $("open").style.setProperty("--pc", pk.col);
  $("openPack").className = "opack";
  $("openPack").innerHTML = `<b>${pk.name}</b><small>${pk.who ? "PLAYER PACK" : pk.cards + " CARDS"}</small><i>TAP TO OPEN</i>`;
  $("openCards").innerHTML = "";
  $("openInfo").className = "oinfo";
  $("openAct").className = "act hide";
  $("bOpenAll").style.display = "none";
  $("openPack").onclick = () => tearPack(pk);
  const again = $("bOpenAgain");
  again.disabled = SAVE.cc < pk.price;
  again.textContent = `OPEN ANOTHER (${pk.price.toLocaleString()} CC)`;
  again.onclick = () => openPackScreen(pkId);
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
        <div class="fr"><span class="rtag">${RARITY[c.a.rarity].name}</span><b>${c.a.name}</b><span class="cat">${CAT_NAME[c.a.cat]}${c.a.who ? " · " + c.a.who : ""}</span>
        <span class="tag${c.dupe ? " dupe" : ""}">${c.dupe ? `DUPLICATE +${c.refund} CC` : "NEW!"}</span></div></div></div>`,
    )
    .join("");
  $("openCards").querySelectorAll(".card").forEach(
    (el) => (el.onclick = () => (el.classList.contains("up") ? selectCard(+el.dataset.i) : chargeCard(+el.dataset.i))),
  );
  $("openName").textContent = "";
  $("openHint").textContent = "TAP A CARD";
  $("bOpenAll").style.display = "";
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
  const step = quick ? 160 : top >= 3 ? 520 : 360;
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
    big = r === "legendary" || r === "iconic";
  el.classList.remove("charge");
  el.classList.add("up");
  OPEN.busy = 0;
  OPEN.shown++;
  sfxReveal(r);
  if (r !== "common") burst(el, RARITY[r].col, big ? 70 : r === "epic" ? 36 : 16);
  if (big) {
    flashScreen(RARITY[r].col);
    shakeScreen(3);
    banner(r === "iconic" ? `ICONIC! ${c.a.who}` : "LEGENDARY!", RARITY[r].col);
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
    chargeCard(i, OPEN.cards[i].a.rarity !== "legendary" && OPEN.cards[i].a.rarity !== "iconic", () => later(next, 250));
  };
  next();
}
function selectCard(i) {
  const c = OPEN.cards[i];
  OPEN.sel = c.a.id;
  $("openCards").querySelectorAll(".card").forEach((el, j) => el.classList.toggle("sel", j === i));
  $("openInfo").className = "oinfo on r-" + c.a.rarity;
  $("openName").innerHTML = `<b>${c.a.name}</b>${rarityTag(c.a)}<span>${c.a.desc}</span>`;
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
function banner(text, col) {
  const b = $("openBanner");
  b.textContent = text;
  b.style.color = col;
  b.classList.remove("on");
  void b.offsetWidth;
  b.classList.add("on");
}
