"use strict";
// Limited-time events. Halloween 2026: a pumpkin banner on the main menu opens a short quest track (like a tiny
// battle pass). Quests are done one at a time, in order, and only count in Quick Play games on the event's court
// (Haunted Hollow, js/courts.js). Each pays coins; quest 4 gives the Jack-O shoes, quest 8 the Witching Hour dunk.
// One game can finish at most one quest. Whatever you earn is yours to keep; when the event ends, the banner, the
// court and the quests are gone. The end is on this device's clock. Test other dates with ?date=2026-11-01.

const EVENTS = {
  halloween26: {
    id: "halloween26",
    name: "HALLOWEEN",
    court: "haunt",
    end: new Date(2026, 10, 1).getTime(), // midnight as 1 November begins: Halloween night is the last night
    quests: [
      { t: "Play a game on Haunted Hollow", n: 1, cc: 150, add: () => 1 },
      { t: "Score 20 points", n: 20, cc: 150, add: (e) => e.st.pts || 0, pic: "pumpkin" },
      { t: "Get 3 steals", n: 3, cc: 200, add: (e) => e.st.stl || 0 },
      { t: "Dunk 5 times", n: 5, cc: 250, add: (e) => e.st.dunks || 0, shoe: "jacko" },
      { t: "Make 3 threes", n: 3, cc: 250, add: (e) => e.st.threes || 0 },
      { t: "Win a game", n: 1, cc: 300, add: (e) => (e.won ? 1 : 0), pic: "ghost" },
      { t: "Win a game by 10 or more", n: 10, cc: 300, one: 1, add: (e) => (e.won ? e.margin : 0) },
      { t: "Win on All-Star or Hall of Famer", n: 1, cc: 400, add: (e) => (e.won && e.diff >= 2 ? 1 : 0), anim: "dunk.witch", title: "pumpkinking" },
    ],
  },
};
const EV_NOW = EVENTS.halloween26; // the event the menu banner shows
// Now, or the test date from ?date=yyyy-mm-dd (noon that day).
function evNow() {
  const m = /[?&]date=(\d{4})-(\d\d)-(\d\d)/.exec(location.search);
  return m ? new Date(+m[1], m[2] - 1, +m[3], 12).getTime() : Date.now();
}
const eventOn = (id) => !!EVENTS[id] && evNow() < EVENTS[id].end;
const evState = (id) => SAVE.ev[id] || (SAVE.ev[id] = { q: 0, p: 0 });
const evDone = (id) => (SAVE.ev[id] ? SAVE.ev[id].q : 0);
function evLeft(id) {
  const ms = Math.max(0, EVENTS[id].end - evNow()),
    d = Math.floor(ms / 864e5),
    h = Math.floor((ms % 864e5) / 36e5),
    m = Math.floor((ms % 36e5) / 6e4);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}
// What a quest gives, in words.
function evPrize(q) {
  const out = [`${q.cc} CC`];
  if (q.shoe) out.push(`${SHOE[q.shoe].name.toUpperCase()} SHOES`);
  if (q.anim) out.push(`${ANIM[q.anim].name.toUpperCase()} DUNK`);
  if (q.pic) out.push(`${PIC[q.pic].name.toUpperCase()} PICTURE`);
  if (q.title) out.push(`"${TITLE[q.title].t.toUpperCase()}" TITLE`);
  return out.join(" + ");
}
// A Quick Play game just finished. e: { won, margin, st, court, diff }. Counts it toward the current quest
// (only on the event's court, only while it's on) and pays a quest it finishes. Returns { rows, got }.
function evGame(e) {
  const out = { rows: [], got: [] },
    E = EV_NOW;
  if (!eventOn(E.id) || e.court !== E.court) return out;
  const S = evState(E.id),
    q = E.quests[S.q];
  if (!q) return out;
  const v = q.add(e) || 0;
  S.p = Math.min(q.n, q.one ? Math.max(S.p, v) : S.p + v);
  if (S.p >= q.n) {
    SAVE.cc += q.cc;
    out.rows.push([`Halloween quest ${S.q + 1}: ${q.t}`, q.cc]);
    if (q.shoe && !ownsShoe(q.shoe)) SAVE.shoes.push(q.shoe), out.got.push(`THE ${SHOE[q.shoe].name.toUpperCase()} SHOES ARE YOURS! WEAR THEM FROM THE INVENTORY.`);
    if (q.anim && !SAVE.owned.includes(q.anim)) SAVE.owned.push(q.anim), out.got.push(`THE ${ANIM[q.anim].name.toUpperCase()} DUNK IS YOURS! EQUIP IT IN THE INVENTORY.`);
    if (q.pic) out.got.push(`NEW PROFILE PICTURE: ${PIC[q.pic].name.toUpperCase()}`);
    if (q.title) out.got.push(`NEW TITLE: ${TITLE[q.title].t.toUpperCase()}`);
    S.q++;
    S.p = 0;
  }
  writeSave();
  return out;
}

// ---------- the menu banner and the event pop-up
function evBanner() {
  const b = $("bEvent"),
    E = EV_NOW,
    on = eventOn(E.id);
  b.hidden = !on;
  if (!on) return;
  const S = evState(E.id),
    all = S.q >= E.quests.length;
  $("evbSub").textContent = all ? `ALL QUESTS DONE · ${evLeft(E.id)} LEFT` : `QUEST ${S.q + 1}/${E.quests.length} · ${evLeft(E.id)} LEFT`;
  drawPic($("evbPic"), "pumpkin");
}
function openEvent() {
  const E = EV_NOW,
    S = evState(E.id),
    n = E.quests.length,
    all = S.q >= n;
  $("evLeft").textContent = `LIMITED EVENT · ENDS IN ${evLeft(E.id)}`;
  // The track: one stop per quest, the prizes on the stops that have them.
  $("evTrack").innerHTML = E.quests
    .map((q, i) => {
      const cls = i < S.q ? "got" : i === S.q ? "now" : "",
        big = q.shoe ? "SHOES" : q.anim ? "DUNK" : q.cc;
      return `<div class="evq ${cls}${q.shoe || q.anim ? " big" : ""}"><i>${i + 1}</i><b>${big}</b><span>${q.shoe || q.anim ? `+${q.cc} CC` : "CC"}</span></div>`;
    })
    .join("");
  $("evTrack").style.setProperty("--done", `${(Math.min(S.q, n) / n) * 100}%`);
  const q = E.quests[S.q];
  $("evQuest").innerHTML = all
    ? `<b>EVERY QUEST DONE!</b><span>You're the Pumpkin King. Your Jack-O shoes and Witching Hour dunk are in the Inventory.</span>`
    : `<em>QUEST ${S.q + 1} OF ${n}</em><b>${q.t}</b><i style="--p:${(S.p / q.n) * 100}%"></i><span>${S.p} / ${q.n}${q.one ? " in one game" : ""}</span><u>REWARD: ${evPrize(q)}</u>`;
  const shoeGot = ownsShoe("jacko"),
    dunkGot = SAVE.owned.includes("dunk.witch");
  $("evPrizes").innerHTML = `
    <div class="evp r-limited${shoeGot ? " got" : ""}"><canvas id="evShoe"></canvas><b>JACK-O</b><span class="rtag r-limited">LIMITED SHOES</span><em>${shoeGot ? "YOURS" : "QUEST 4"}</em></div>
    <div class="evp r-limited${dunkGot ? " got" : ""}"><canvas id="evDunk"></canvas><b>WITCHING HOUR</b><span class="rtag r-limited">LIMITED DUNK</span><em>${dunkGot ? "YOURS" : "QUEST 8"}</em></div>`;
  shoeCanvas($("evShoe"), SHOE.jacko, T);
  drawPic($("evDunk"), "ghost");
  $("event").classList.add("on");
  evAnim();
}
// The shoe's sole glows while the pop-up is open.
function evAnim() {
  if (!$("event").classList.contains("on")) return;
  const cv = $("evShoe");
  if (cv) shoeCanvas(cv, SHOE.jacko, performance.now() / 1000);
  requestAnimationFrame(evAnim);
}
function closeEvent() {
  $("event").classList.remove("on");
}
// PLAY: Quick Play on the event's court.
function evPlay() {
  closeEvent();
  OPT.court = EV_NOW.court;
  openSel(0);
}
$("bEvent").onclick = openEvent;
$("bEvX").onclick = closeEvent;
$("bEvGo").onclick = evPlay;
