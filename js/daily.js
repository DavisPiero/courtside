"use strict";
// Daily: a reward for the first visit each day (a 7-day ladder) and three challenges a day.
// The DAILY button on the main menu opens it; it opens by itself the first time the menu shows each day.

// ---------- daily rewards: one a day, the next step each day you play. Missing a day doesn't reset it.
const DAILY_REWARDS = [{ cc: 100 }, { cc: 150 }, { pack: "street" }, { cc: 250 }, { box: "box" }, { cc: 400 }, { pack: "allstar" }];
const rewardName = (r) => (r.cc ? `${r.cc} CC` : r.pack ? SHOP.find((s) => s.id === r.pack).name : SHOEBOXES.find((b) => b.id === r.box).name);

// ---------- challenges: one easy, one medium and one hard, the same for everyone on the same day.
// e is what just finished: { mini: minigame id or "", won, margin, st (G.st), court, diff, score }.
// one: the best single game counts (otherwise games add up through the day).
const CHALLENGES = [
  [
    { id: "games", t: "Play 2 games", n: 2, add: (e) => (!e.mini || e.mini === "1v1" ? 1 : 0) },
    { id: "greens", t: "Hit 5 perfect releases", n: 5, add: (e) => e.st.greens || 0 },
    { id: "stl", t: "Get 3 steals", n: 3, add: (e) => e.st.stl || 0 },
    { id: "threes", t: "Make 3 threes", n: 3, add: (e) => e.st.threes || 0 },
    { id: "mini", t: "Play any minigame", n: 1, add: (e) => (e.mini ? 1 : 0) },
  ],
  [
    { id: "win", t: "Win a game", n: 1, add: (e) => (e.won && e.mini !== "three" && e.mini !== "dunk" ? 1 : 0) },
    { id: "dunks", t: "Dunk 6 times", n: 6, add: (e) => e.st.dunks || 0 },
    { id: "ankles", t: "Break 3 ankles", n: 3, add: (e) => e.st.ankles || 0 },
    { id: "blk", t: "Block 3 shots", n: 3, add: (e) => e.st.blk || 0 },
    { id: "outside", t: "Play a game on The Cage, the Rooftop or the Beach", n: 1, add: (e) => (!e.mini && ["cage", "roof", "beach"].includes(e.court) ? 1 : 0) },
    { id: "three15", t: "Score 15 in the 3-point contest", n: 15, one: 1, add: (e) => (e.mini === "three" ? e.score : 0) },
  ],
  [
    { id: "win3", t: "Win 3 games", n: 3, add: (e) => (e.won && e.mini !== "three" && e.mini !== "dunk" ? 1 : 0) },
    { id: "margin", t: "Win a game by 10 or more", n: 10, one: 1, add: (e) => (e.won && !e.mini ? e.margin : 0) },
    { id: "dunk4", t: "Dunk 4 times in one game", n: 4, one: 1, add: (e) => (e.mini ? 0 : e.st.dunks || 0) },
    { id: "allstar", t: "Win on All-Star or Hall of Famer", n: 1, add: (e) => (e.won && !e.mini && e.diff >= 2 ? 1 : 0) },
    { id: "oops", t: "Throw 2 alley-oops", n: 2, add: (e) => e.st.oops || 0 },
    { id: "1v1", t: "Win a 1-on-1", n: 1, add: (e) => (e.won && e.mini === "1v1" ? 1 : 0) },
  ],
];
const CHALLENGE_CC = [75, 100, 150];

// Today's three, picked from the date so they stay the same all day.
function dailyToday() {
  const day = dayKey(new Date());
  let D = SAVE.daily;
  if (!D || D.day !== day) {
    let h = day;
    const pick = (list) => list[(h = Math.imul(h ^ (h >>> 13), 2246822507) >>> 0) % list.length].id;
    D = SAVE.daily = { day, ids: CHALLENGES.map(pick), prog: [0, 0, 0], done: [0, 0, 0], claimed: D ? D.claimed : 0, step: D ? D.step : 0 };
    writeSave();
  }
  return D;
}
const dailyList = () => {
  const D = dailyToday();
  return D.ids.map((id, i) => ({ ...CHALLENGES[i].find((c) => c.id === id), i, cc: CHALLENGE_CC[i], prog: D.prog[i], done: D.done[i] }));
};
// A game or minigame just finished: count it, pay any challenge it completes, and return results rows.
function dailyEvent(e) {
  const D = dailyToday(),
    rows = [];
  for (const c of dailyList()) {
    if (c.done) continue;
    const v = c.add(e) || 0;
    D.prog[c.i] = Math.min(c.n, c.one ? Math.max(D.prog[c.i], v) : D.prog[c.i] + v);
    if (D.prog[c.i] >= c.n) {
      D.done[c.i] = 1;
      SAVE.cc += c.cc;
      rows.push([`Daily: ${c.t}`, c.cc]);
    }
  }
  writeSave();
  return rows;
}
const rewardWaiting = () => dailyToday().claimed !== dayKey(new Date());

// ---------- the DAILY pop-up
function openDaily() {
  const D = dailyToday(),
    waiting = rewardWaiting(),
    step = D.step % 7, // today's (or, once claimed, the next) step on the ladder
    shown = waiting ? step : (step + 6) % 7, // the step claimed today
    left = new Date().setHours(24, 0, 0, 0) - Date.now(),
    hrs = Math.floor(left / 36e5),
    mins = Math.floor((left % 36e5) / 6e4);
  $("dlyDays").innerHTML = DAILY_REWARDS.map((r, i) => {
    const cls = i < shown || (i === shown && !waiting) ? "got" : i === shown ? "now" : "";
    return `<div class="dday ${cls}"><i>DAY ${i + 1}</i><b>${r.cc ? r.cc : r.pack ? "PACK" : "BOX"}</b><span>${r.cc ? "CC" : rewardName(r).replace(/ PACK| SHOEBOX/, "")}</span></div>`;
  }).join("");
  $("bDlyClaim").disabled = !waiting;
  $("bDlyClaim").textContent = waiting ? `CLAIM ${rewardName(DAILY_REWARDS[step])}` : "CLAIMED · BACK TOMORROW";
  $("dlyList").innerHTML = dailyList()
    .map(
      (c) => `<div class="dch${c.done ? " ok" : ""}"><div><b>${c.t}</b><i style="--p:${(c.prog / c.n) * 100}%"></i></div>
      <span>${c.done ? "DONE" : `${c.prog}/${c.n}`}</span><em>+${c.cc} CC</em></div>`,
    )
    .join("");
  $("dlyTime").textContent = `New challenges in ${hrs}h ${mins}m`;
  $("daily").classList.add("on");
  dailyBadge();
}
function closeDaily() {
  $("daily").classList.remove("on");
}
function claimDaily() {
  if (!rewardWaiting()) return;
  const D = dailyToday(),
    r = DAILY_REWARDS[D.step % 7];
  if (r.cc) SAVE.cc += r.cc;
  if (r.pack) SAVE.free[r.pack] = (SAVE.free[r.pack] || 0) + 1;
  if (r.box) SAVE.freeBox[r.box] = (SAVE.freeBox[r.box] || 0) + 1;
  D.claimed = dayKey(new Date());
  D.step++;
  writeSave();
  burst($("bDlyClaim"), "#ffcf5c", 50);
  flashBanner(r.cc ? `DAILY REWARD +${r.cc} CC` : `${rewardName(r)}! OPEN IT IN THE SHOP`);
  openDaily();
}
// A dot on the DAILY button while today's reward is waiting.
function dailyBadge() {
  $("bDaily").classList.toggle("new", rewardWaiting());
}
// The first time the menu shows each day, the pop-up opens by itself (not in the smoke test).
function dailyAuto() {
  dailyBadge();
  if (rewardWaiting() && !/[?&](smoke|fitcheck)\b/.test(location.search)) openDaily();
}
$("bDaily").onclick = openDaily;
$("bDlyX").onclick = closeDaily;
$("bDlyClaim").onclick = claimDaily;
