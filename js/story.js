"use strict";
// Story scenes and in-game chatter for the campaigns.
// A scene is a list of lines [who, text, mood] (see js/campaign.js). Your side (you, Dex, Big Lou, Coach Ray)
// stands on the left, everyone else on the right; the speaker steps forward in a pose that fits the mood,
// and the line types itself out. Tap, click, Space or Enter to go on; SKIP jumps to the end.
SCREENS.push("scene");

// The cast. Players on the opposing team don't need an entry: they're drawn from that team.
// side 0 = left (your side), 1 = right. team: jersey colours. ball: dribbles while listening.
const CAST_TEAMS = {
  coach: { n: "COACH", c: "RAY", j: "#2b3a67", t: "#f2b632", s: "#1d2747", k: "#2b3a67" },
  mic: { n: "ANNOUNCER", c: "MIC", j: "#17171f", t: "#d4af37", s: "#17171f", k: "#17171f" },
  tank: { n: "TOWERS", c: "TNK", j: "#5b616e", t: "#ff5c4d", s: "#3a3e47", k: "#3a3e47" },
  kings: { n: "KINGS", c: "KNG", j: "#d4af37", t: "#111111", s: "#8a7020", k: "#8a7020" },
};
const CHARS = {
  HERO: { side: 0, crew: 0, col: "#f2b632" },
  DEX: { side: 0, crew: 1, col: "#5fd0ff" },
  "BIG LOU": { side: 0, crew: 2, col: "#ff8a4a" },
  "COACH RAY": { side: 0, team: "coach", pos: "PF", ht: 75, skin: 4, hair: 0, hcol: "#a9a9a9", col: "#9fb4ff" },
  ANNOUNCER: { side: 1, team: "mic", pos: "SF", ht: 73, skin: 1, hair: 0, col: "#ffd23c" },
  TANK: { side: 1, team: "tank", pos: "C", ht: 84, skin: 4, hair: 2, ball: 1, col: "#ff5c4d" },
  KING: { side: 1, team: "kings", pos: "SF", ht: 81, skin: 2, hair: 1, ball: 1, col: "#d4af37" },
  "ZEKE KNOX": { side: 1, knox: 1, pos: "SG", ht: 78, skin: 3, hair: 1, ball: 1, col: "#ff4d6d" },
};
// Mood -> celebration pose (js/anim.js CELS).
const MOODS = { hype: "cel.basic", cocky: "cel.toosmall", angry: "cel.chest", point: "cel.point", flex: "cel.flex", shh: "cel.shh", cold: "cel.ice", dance: "cel.dance", lights: "cel.lights" };

const SCN = { lines: [], i: 0, typed: 0, t0: 0, done: null, opp: null, m: [null, null], who: [null, null], chap: null };
// Who's who for this line: a model description, or null for narration.
function castFor(who) {
  if (!who) return null;
  const c = CHARS[who];
  if (c && c.crew !== undefined) {
    const T0 = crewTeam(),
      q = T0.p[c.crew];
    return { key: who + q[10] + q[11] + (SAVE.name || ""), side: 0, team: T0, q, ball: 1, col: c.col, name: c.crew === 0 ? SAVE.name || "ROOKIE" : who };
  }
  // Someone on the team we're about to play (or just played).
  const opp = SCN.opp,
    q = opp && opp.p.find((r) => r[0] === who || (who === "ZEKE KNOX" && r[0] === KNOX[0]));
  if (q) return { key: who + opp.c, side: 1, team: opp, q, ball: 1, col: (c && c.col) || lite(opp.t), name: who };
  if (c) {
    const team = c.knox ? NBA(SCN.ci >= 2 ? "OKC" : "WAS") : CAST_TEAMS[c.team];
    return { key: who + team.c, side: c.side, team, q: [who, c.pos, 80, c.ht, 0, 0, 0, 0, 0, 0, c.skin, c.hair], hcol: c.hcol, ball: c.ball, col: c.col, name: who };
  }
  // Anyone else: a stranger in grey.
  return { key: who, side: 1, team: CAST_TEAMS.mic, q: [who, "SF", 70, 76, 0, 0, 0, 0, 0, 0, 2, 0], ball: 1, col: "#c9d1e6", name: who };
}
function castModel(cs, slot) {
  const P0 = portraitPlayer(0, 0, 20 + slot, slot ? 1 : -1),
    q = cs.q;
  Object.assign(P0, { team: cs.team, sk: SK[q[10]], look: 40 + q[0].length, pos: q[1], ht: q[3], hair: q[11], hcol: cs.hcol, key: cs.key });
  P0.cs = cs;
  return P0;
}
// Play a scene, then call done(). opp: the opposing team (so its players can talk). ci: chapter index.
function playScene(lines, done, opp, ci, chapTitle) {
  if (!lines || !lines.length) return done();
  Object.assign(SCN, { lines, i: -1, done, opp: opp || null, ci: ci || 0, m: [null, null], who: [null, null] });
  $("scnChap").innerHTML = chapTitle ? `<i>${chapTitle[0]}</i><b>${chapTitle[1]}</b>` : "";
  $("scnChap").classList.toggle("on", !!chapTitle);
  $("scene").classList.toggle("haschap", !!chapTitle);
  show("scene");
  // A chapter card holds for a moment before the first line.
  SCN.wait = chapTitle ? T + 1.6 : 0;
  if (chapTitle) {
    sfx("whistle");
    $("scnBox").classList.add("hide");
  } else sceneNext();
}
function sceneNext() {
  SCN.i++;
  if (SCN.i >= SCN.lines.length) return sceneEnd();
  const [who, text] = SCN.lines[SCN.i],
    cs = castFor(who);
  if (cs) {
    if (!SCN.m[cs.side] || SCN.m[cs.side].key !== cs.key) SCN.m[cs.side] = castModel(cs, cs.side);
    SCN.who[cs.side] = cs;
  }
  SCN.speaker = cs ? cs.side : -1;
  SCN.t0 = T;
  SCN.typed = 0;
  SCN.full = text.replace(/HERO/g, SAVE.name || "ROOKIE");
  $("scnBox").classList.remove("hide");
  $("scnBox").classList.toggle("narr", !cs);
  $("scnBox").classList.toggle("r", !!cs && cs.side === 1);
  $("scnWho").textContent = cs ? cs.name : "";
  $("scnWho").style.color = cs ? cs.col : "";
  $("scnText").textContent = "";
  $("scene").dataset.spk = SCN.speaker;
}
function sceneTap() {
  if (!$("scene").classList.contains("on")) return;
  if (SCN.wait) return chapDone(); // skip the chapter card
  if (SCN.typed < SCN.full.length) SCN.typed = SCN.full.length;
  else sceneNext();
}
function chapDone() {
  SCN.wait = 0;
  $("scnChap").classList.remove("on");
  $("scene").classList.remove("haschap");
  sceneNext();
}
function sceneEnd() {
  const d = SCN.done;
  SCN.done = null;
  SCN.wait = 0;
  $("scnChap").classList.remove("on");
  $("scene").classList.remove("haschap");
  if (d) d();
}
// Every frame while a scene shows: type the line, pose the two models.
function scenePreview() {
  if (!$("scene").classList.contains("on")) return;
  if (SCN.wait && T >= SCN.wait) chapDone();
  if (SCN.full && SCN.typed < SCN.full.length) {
    const n = Math.min(SCN.full.length, Math.floor((T - SCN.t0) * 48));
    if (n > SCN.typed) {
      if (n % 3 === 0 && SCN.full[n - 1] !== " ") sfx("blip");
      SCN.typed = n;
    }
    $("scnText").textContent = SCN.full.slice(0, SCN.typed);
  } else if (SCN.full) $("scnText").textContent = SCN.full;
  $("scene").classList.toggle("typed", !SCN.full || SCN.typed >= SCN.full.length);
  for (const side of [0, 1]) {
    const cv2 = $(side ? "scnR" : "scnL"),
      P0 = SCN.m[side];
    cv2.style.visibility = P0 ? "visible" : "hidden";
    if (!P0) continue;
    const talking = SCN.speaker === side,
      line = SCN.lines[SCN.i],
      mood = talking && line && MOODS[line[2]],
      port = P0.port;
    P0.port.t = T;
    port.pose = mood ? "cel" : "";
    port.style = mood ? { cel: mood } : {};
    port.ball = !mood && P0.cs.ball ? [0.95, P0.hand * 0.6, 0.55 + Math.abs(Math.sin(T * 5.5 + side)) * 2.6] : null;
    renderModel(cv2, P0, side ? -0.75 : 0.75);
  }
}
$("scene").addEventListener("pointerdown", (e) => {
  if (e.target.closest("#scnSkip")) return;
  sceneTap();
});
$("scnSkip").onclick = () => sceneEnd();
addEventListener("keydown", (e) => {
  if (!$("scene").classList.contains("on") || e.repeat) return;
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    sceneTap();
  }
  if (e.code === "Escape") sceneEnd();
});

// ---------- chatter: your crew (and the rival) talk during campaign games
// Each event has lines for the Street and NBA roads. HERO lines are never used here: you're busy playing.
const CHAT = {
  dunk: { street: [["BIG LOU", "OHHHH! Put him on a poster!"], ["DEX", "That rim is SCARED of you."], ["BIG LOU", "That's MY move! ...Fine, it's your move too."]], nba: [["BIG LOU", "NBA dunk! Mom, are you watching?!"], ["COACH RAY", "That'll make the highlights."], ["ANNOUNCER", "OH MY! What a slam!"]] },
  ankles: { street: [["DEX", "His ankles are GONE. Somebody call a doctor."], ["BIG LOU", "He fell over! He just fell over!"]], nba: [["DEX", "Ankles. Broken. In the NBA."], ["ANNOUNCER", "He's on the floor! What a move!"]] },
  three: { street: [["DEX", "Splash! From way downtown!"], ["BIG LOU", "Cash money."]], nba: [["ANNOUNCER", "BANG! From three!"], ["COACH RAY", "Good look. Keep shooting it."]] },
  steal: { street: [["DEX", "Pickpocket! That's my kind of play."]], nba: [["COACH RAY", "That's defence. That's how we win."]] },
  block: { street: [["BIG LOU", "GET THAT OUTTA HERE!"]], nba: [["ANNOUNCER", "REJECTED!"]] },
  drop: { street: [["BIG LOU", "Timber!"], ["DEX", "He's taking a nap."]], nba: [] },
  behind: { street: [["DEX", "We're down. Stay calm. Get a stop."], ["BIG LOU", "Come on, crew. Wake up!"]], nba: [["COACH RAY", "Slow down. Run the play. One stop."], ["COACH RAY", "Don't panic. Play our game."]] },
  ahead: { street: [["DEX", "We're cooking now!"], ["BIG LOU", "Keep it going! Don't let up!"]], nba: [["COACH RAY", "Good. Now don't get comfy."], ["ANNOUNCER", "The rookies are pulling away!"]] },
  close: { street: [["DEX", "Next bucket matters. Big time."]], nba: [["COACH RAY", "Last minute. Every possession."], ["ANNOUNCER", "Down to the wire!"]] },
  quarter: { street: [["DEX", "Breathe. We got this."]], nba: [["COACH RAY", "Good quarter. Same again."], ["COACH RAY", "Hydrate. Then go."]] },
  rivalLead: { street: [["TANK", "Too slow, block kid!"], ["KING", "This is what kings look like."]], nba: [["ZEKE KNOX", "Playground's closed!"]] },
};
const CH = { last: 0, prev: null, said: {} };
// Called every HUD frame during a campaign game. Says one line at a time, at most every few seconds.
function chatterUpd() {
  if (!G.camp || G.prac || G.tip) return;
  const s = G.st,
    now = { dunks: s.dunks, ankles: s.ankles, threes: s.threes, stl: s.stl, blk: s.blk, drops: s.drops, home: G.home, away: G.away, q: G.q },
    pv = CH.prev;
  CH.prev = now;
  if (!pv || G.cut) return;
  const tg = G.rules.target,
    gm = CAMPAIGNS[G.camp.cid].chapters[G.camp.ci].games[G.camp.gi];
  // The game's own half-time lines come first, once.
  const hf = Math.ceil(tg / 2),
    half = tg
      ? Math.max(G.home, G.away) >= hf && Math.max(pv.home, pv.away) < hf
      : G.rules.nq > 1
        ? now.q > pv.q && now.q === Math.floor(G.rules.nq / 2) + 1
        : G.time < G.rules.qlen / 2;
  if (gm.mid && !CH.said.mid && half) {
    CH.said.mid = 1;
    return sayLines(gm.mid);
  }
  if (T - CH.last < 4.5) return;
  let ev = null;
  if (now.dunks > pv.dunks) ev = "dunk";
  else if (now.ankles > pv.ankles) ev = "ankles";
  else if (now.drops > pv.drops) ev = "drop";
  else if (now.blk > pv.blk) ev = "block";
  else if (now.threes > pv.threes) ev = "three";
  else if (now.stl > pv.stl && Math.random() < 0.5) ev = "steal";
  else if (now.q > pv.q) ev = "quarter";
  else if (now.away > pv.away && G.away - G.home >= 5 && !CH.said["b" + G.away]) {
    CH.said["b" + G.away] = 1;
    ev = gm.id.endsWith("-6") && Math.random() < 0.6 ? "rivalLead" : "behind";
  } else if (now.home > pv.home && G.home - G.away >= 6 && !CH.said["a" + G.home]) {
    CH.said["a" + G.home] = 1;
    ev = "ahead";
  } else if (!CH.said.close && Math.abs(G.home - G.away) <= 3 && (tg ? Math.max(G.home, G.away) >= tg - 3 : G.q === G.rules.nq && G.time < 40)) {
    CH.said.close = 1;
    ev = "close";
  }
  if (!ev) return;
  let pool = CHAT[ev][G.camp.cid] || [];
  if (ev === "rivalLead") pool = pool.filter(([w]) => TM[1].p.some((r) => r[0] === w || (w === "ZEKE KNOX" && r[0] === KNOX[0])));
  if (!pool.length) return;
  sayLines([pool[(Math.random() * pool.length) | 0]]);
}
function chatterReset() {
  CH.prev = null;
  CH.said = {};
  CH.last = 0;
  clearTimeout(CH.timer);
  $("say").classList.remove("on");
}
// Show lines one after another in the speech bubble above the scoreboard.
function sayLines(lines, i) {
  i = i || 0;
  const l = lines[i];
  if (!l) return;
  const c = CHARS[l[0]],
    el = $("say");
  $("sayWho").textContent = l[0] === "HERO" ? SAVE.name : l[0];
  $("sayWho").style.color = (c && c.col) || "#ffd23c";
  $("sayText").textContent = l[1];
  el.classList.remove("on");
  void el.offsetWidth; // restart the pop-in
  el.classList.add("on");
  CH.last = T;
  clearTimeout(CH.timer);
  CH.timer = setTimeout(() => (i + 1 < lines.length ? sayLines(lines, i + 1) : el.classList.remove("on")), 2600);
}
