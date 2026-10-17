"use strict";
// Campaigns: STREET "King of the Courts" and NBA "Road to the Ring", 3 chapters x 6 games each.
// Each game: 1 star for winning, 1 for its twist goal, 1 for a style goal. Win to unlock the next.
// Player arrays match js/teams.js: [name, pos, ovr, height, speed, shooting, finishing, handling, defence,
// blocking, skin 0-5, hair 0-4 (optional)].

// ---------- your crew: your hooper plus Dex and Big Lou. They improve with every chapter you clear.
function crewTeam() {
  const lv = crewLevel() * 3,
    up = (R) => R.map((v, i) => (i >= 2 && i <= 9 && i !== 3 ? Math.min(99, v + lv) : v));
  return {
    n: (SAVE.name || "ROOKIE") + "'S CREW",
    c: "YOU",
    city: "THE BLOCK",
    j: "#f2b632",
    t: "#16181f",
    s: "#1d1f27",
    k: "#b8862a",
    look0: 91,
    p: [
      up([SAVE.name || "ROOKIE", "SG", 74, 76, 82, 78, 78, 80, 72, 50, SAVE.skin, SAVE.hair]),
      up(["DEX", "PG", 72, 72, 88, 74, 70, 84, 70, 30, 2, 4]),
      up(["BIG LOU", "C", 72, 83, 64, 50, 82, 50, 76, 82, 5, 3]),
    ],
  };
}
// Every boss beaten (in either campaign) makes the crew better, up to four times.
const crewLevel = () => Math.min(4, CAMP_IDS.flatMap((c) => CAMPAIGNS[c].chapters).filter((ch) => (SAVE.stars[ch.games[5].id] || 0) > 0).length);
// A street crew opponent: three players around rating r.
function streetCrew(n, c, j, t, s, r, names, tall) {
  const P = (nm, pos, ht, sk, hair, bias) => [
    nm, pos, r, ht + (tall || 0),
    r + bias[0], r + bias[1], r + bias[2], r + bias[3], r + bias[4], r + bias[5], sk, hair,
  ];
  return {
    n, c, city: "STREET", j, t, s, k: s, look0: 96 + c.length,
    p: [
      P(names[0], "PG", 73, 3, 0, [8, 2, -4, 6, -4, -20]),
      P(names[1], "SF", 78, 1, 2, [0, 0, 4, 0, 2, -6]),
      P(names[2], "C", 82, 4, 3, [-12, -18, 6, -16, 4, 10]),
    ],
  };
}
const NBA = (c) => TEAMS.find((t) => t.c === c);

// Goal kinds: win | margin n (win by n+) | hold n (they score under n) | stat k n (your G.st[k] >= n)
const GOAL_TEXT = {
  win: () => "Win the game",
  margin: (g) => `Win by ${g.n} or more`,
  hold: (g) => `Hold them under ${g.n} points`,
  greens: (g) => `${g.n} perfect release${g.n > 1 ? "s" : ""}`,
  steals: (g) => `${g.n} steals`,
  dunks: (g) => `${g.n} dunk${g.n > 1 ? "s" : ""}`,
  ankles: (g) => `${g.n} ankle breaker${g.n > 1 ? "s" : ""}`,
  threes: (g) => `${g.n} three-pointer${g.n > 1 ? "s" : ""}`,
  blk: (g) => `${g.n} block${g.n > 1 ? "s" : ""}`,
  drops: (g) => `Drop ${g.n} players with punches`,
};
const STATKEY = { greens: "greens", steals: "stl", dunks: "dunks", ankles: "ankles", threes: "threes", blk: "blk", drops: "drops" };
const goal = (k, n) => ({ k, n });
// Game: id, opp (team), court, mode, diff, rules, goals [twist, style], intro lines [[who, text]], outro.
function game(id, opp, court, mode, diff, rules, twist, style, intro, outro) {
  return { id, opp, court, mode, diff, rules: { ...RULES_STD, ...rules }, goals: [goal("win"), twist, style], intro, outro };
}
const STREET11 = { target: 11 },
  STREET15 = { target: 15 },
  STREET21 = { target: 21 },
  SUMMER = { nq: 1, qlen: 180 },
  LEAGUE = { nq: 1, qlen: 240 },
  FINALS = { nq: 2, qlen: 180 };

// Two campaigns. STREET: street courts, Mayhem allowed. NBA: arenas, professional rules only (never Mayhem).
// Each chapter's boss unlocks a Legendary animation the first time you beat it (reward).
const CAMPAIGNS = {
  street: {
    title: "KING OF THE COURTS",
    sub: "Street courts. Your crew against the city's best. Mayhem allowed.",
    chapters: [
      {
        title: "THE BLOCK",
        sub: "Nobody knows your name. Yet.",
        reward: "dribble.tornado",
        games: [
          game("s1-1", () => streetCrew("CORNER KIDS", "CK", "#3fa34d", "#ffffff", "#2b6e35", 62, ["LIL MO", "TREY", "BIGS"]), "street", "clean", 0, STREET11,
            goal("margin", 4), goal("greens", 1),
            [["DEX", "First game on the block. Nobody knows your name yet."], ["BIG LOU", "Let's change that. First to 11."]]),
          game("s1-2", () => streetCrew("BOOKER ST", "BST", "#2f6fd6", "#ffd23c", "#1d4aa0", 64, ["JAYJAY", "BOOKS", "TANKER"]), "street", "clean", 0, STREET11,
            goal("hold", 6), goal("steals", 2),
            [["BOOKER ST", "New kid? Hope you brought your own ball."], ["DEX", "Lock them down. Don't let them get to 6."]]),
          game("s1-3", () => streetCrew("RIM WRECKERS", "RW", "#c0392b", "#111111", "#7d1f16", 66, ["RAZOR", "KNUCKLES", "BRICK"]), "street", "mayhem", 1, STREET11,
            goal("drops", 2), goal("dunks", 1),
            [["BIG LOU", "These guys don't play fair."], ["BIG LOU", "Good news: tonight, neither do we. MAYHEM rules."]]),
          game("s1-4", () => streetCrew("NIGHT SHIFT", "NS", "#3b2a6b", "#9fe7ff", "#251a45", 68, ["NOX", "GHOST", "MOONEY"]), "street", "clean", 1, STREET15,
            goal("margin", 6), goal("ankles", 2),
            [["DEX", "Night Shift only plays after dark. They're quick."], ["DEX", "Shake 'em. Break some ankles."]]),
          game("s1-5", () => streetCrew("SLICK'S FIVE", "SL5", "#e67e22", "#16181f", "#a85a14", 70, ["SLICK", "FINGERS", "DOC"]), "street", "mayhem", 1, { ...STREET15, start: [0, 6] },
            goal("win"), goal("threes", 2),
            [["SLICK", "We spotted you nothing. You're already down six, rookie."], ["BIG LOU", "Comeback time. And it's MAYHEM."]]),
          game("s1-6", () => streetCrew("TANK & THE TOWERS", "TNK", "#5b616e", "#ff5c4d", "#3a3e47", 74, ["TANK", "TOWER", "TOWER JR"], 2), "street", "clean", 1, STREET21,
            goal("margin", 5), goal("greens", 3),
            [["TANK", "This is MY block. You want it? Come take it."], ["DEX", "Boss game. First to 21. Let's go."]],
            [["TANK", "Alright... you can hoop. But downtown is a different story."]]),
        ],
      },
      {
        title: "THE CITY",
        sub: "Downtown courts. Bigger crowds, dirtier games.",
        reward: "dunk.legs",
        games: [
          game("s2-1", () => streetCrew("HARBOR HAWKS", "HH", "#0f7c8c", "#ffffff", "#0a5560", 72, ["GULL", "ANCHOR", "DOCKS"]), "street", "clean", 1, STREET15,
            goal("steals", 3), goal("dunks", 1),
            [["DEX", "Welcome downtown. The Hawks love to pass. Pick it off."]]),
          game("s2-2", () => streetCrew("DOWNTOWN DRIFT", "DD", "#d4145a", "#fbb03b", "#8a0d3b", 73, ["SKIDZ", "TURBO", "NITRO"]), "street", "mayhem", 1, STREET15,
            goal("drops", 3), goal("margin", 5),
            [["BIG LOU", "Drift play dirty. MAYHEM is on."]]),
          game("s2-3", () => streetCrew("CONCRETE KINGS", "CK2", "#7f8c8d", "#f1c40f", "#4d5656", 75, ["CROWN", "SLAB", "MORTAR"]), "street", "clean", 2, STREET15,
            goal("hold", 10), goal("ankles", 2),
            [["DEX", "Kings think they own this city. Defence wins this one."]]),
          game("s2-4", () => streetCrew("ROOFTOP ROYALS", "RR", "#8e44ad", "#ffffff", "#5b2c6f", 76, ["SKY", "PENT", "HOUSE"]), "street", "clean", 2, { ...STREET21, start: [0, 8] },
            goal("threes", 3), goal("greens", 2),
            [["DEX", "We got here late. Down eight already."], ["BIG LOU", "Then we shoot our way back."]]),
          game("s2-5", () => streetCrew("EASTSIDE ELITE", "ESE", "#16a085", "#111111", "#0e6655", 78, ["PRINCE", "ACE", "DUKE"]), "street", "mayhem", 2, STREET21,
            goal("margin", 6), goal("blk", 1),
            [["BIG LOU", "Eastside. Big, mean, and MAYHEM's on."]]),
          game("s2-6", () => streetCrew("TANK & THE TOWERS", "TNK", "#5b616e", "#ff5c4d", "#3a3e47", 80, ["TANK", "TOWER", "TOWER JR"], 2), "street", "mayhem", 2, STREET21,
            goal("margin", 7), goal("ankles", 3),
            [["TANK", "Downtown's my town too. And this time, no rules."], ["DEX", "He's been training. So have we."]],
            [["TANK", "Fine. You're good. The Summer Jam is next week. Everyone who's anyone will be there."]]),
        ],
      },
      {
        title: "THE SUMMER JAM",
        sub: "The city's street tournament. Win it and you're kings.",
        reward: "cel.backflip",
        games: [
          game("s3-1", () => streetCrew("THE TWINS", "TW", "#2c3e50", "#e74c3c", "#1a252f", 79, ["TWIN A", "TWIN B", "BIG SIS"], 3), "street", "clean", 2, STREET21,
            goal("hold", 14), goal("blk", 1),
            [["ANNOUNCER", "Welcome to the SUMMER JAM! First up: the Twins. Tall. Very tall."]]),
          game("s3-2", () => streetCrew("SKYWALKERS", "SKY", "#00a8e8", "#ffffff", "#006c96", 80, ["AIR", "HOPS", "BOUNCE"]), "street", "mayhem", 2, STREET21,
            goal("drops", 3), goal("dunks", 2),
            [["DEX", "Skywalkers dunk on everyone. Keep them on the ground. However you can."]]),
          game("s3-3", () => streetCrew("OLD SCHOOL", "OS", "#a0522d", "#f5deb3", "#6b3a1e", 81, ["POPS", "UNC", "GRANDPA G"]), "street", "clean", 3, { ...STREET21, start: [0, 8] },
            goal("win"), goal("threes", 3),
            [["POPS", "We were winning this tournament before you were born."], ["BIG LOU", "And they're up eight already. Respect your elders. Then beat them."]]),
          game("s3-4", () => streetCrew("NEON NIGHTS", "NEO", "#ff00a0", "#00f0ff", "#8a0060", 82, ["GLOW", "VOLT", "LASER"]), "street", "mayhem", 3, STREET21,
            goal("margin", 6), goal("ankles", 3),
            [["ANNOUNCER", "Quarter-final under the lights! MAYHEM rules!"]]),
          game("s3-5", () => streetCrew("TANK & THE TOWERS", "TNK", "#5b616e", "#ff5c4d", "#3a3e47", 84, ["TANK", "TOWER", "TOWER JR"], 2), "street", "clean", 3, STREET21,
            goal("margin", 7), goal("greens", 4),
            [["TANK", "Semi-final. Of course it's you."], ["DEX", "Last time, Tank. Let's finish it."]],
            [["TANK", "...Go win the whole thing. For the block."]]),
          game("s3-6", () => streetCrew("THE KINGS", "KNG", "#d4af37", "#111111", "#8a7020", 87, ["KING", "QUEEN", "ACE"], 1), "street", "mayhem", 3, STREET21,
            goal("margin", 5), goal("greens", 5),
            [["ANNOUNCER", "THE FINAL! Three-time champs, the Kings! MAYHEM rules, first to 21!"], ["BIG LOU", "Everything we've done leads here."]],
            [["ANNOUNCER", "NEW KINGS OF THE COURTS! From the block to the crown!"]]),
        ],
      },
    ],
  },
  nba: {
    title: "ROAD TO THE RING",
    sub: "Arenas and NBA teams. Professional rules only.",
    chapters: [
      {
        title: "SUMMER LEAGUE",
        sub: "Undrafted. One tryout. Make it count.",
        reward: "shot.hook",
        games: [
          game("n1-1", () => NBA("CHA"), "arena", "clean", 1, SUMMER, goal("margin", 4), goal("greens", 2),
            [["COACH RAY", "Nobody drafted you three. I'm giving you a tryout anyway."], ["COACH RAY", "Don't make me look stupid."]]),
          game("n1-2", () => NBA("CHI"), "arena", "clean", 1, SUMMER, goal("hold", 14), goal("steals", 2),
            [["COACH RAY", "Arena floors are fast. Defence first."]]),
          game("n1-3", () => NBA("BKN"), "arena", "clean", 1, SUMMER, goal("ankles", 2), goal("dunks", 1),
            [["DEX", "No Mayhem in the League, Lou. Just basketball."], ["BIG LOU", "...Fine. I'll dunk on them instead."]]),
          game("n1-4", () => NBA("UTA"), "arena", "clean", 2, SUMMER, goal("margin", 5), goal("ankles", 2),
            [["COACH RAY", "Utah's got size. Go around them."]]),
          game("n1-5", () => NBA("MEM"), "arena", "clean", 2, { ...SUMMER, start: [0, 6] }, goal("win"), goal("threes", 2),
            [["ANNOUNCER", "The tryout kids are down six at the tip!"]]),
          game("n1-6", () => NBA("WAS"), "arena", "clean", 2, SUMMER, goal("margin", 6), goal("greens", 3),
            [["COACH RAY", "Summer League final. Win this and I'll sign all three of you."]],
            [["COACH RAY", "...Welcome to the League. All of you."]]),
        ],
      },
      {
        title: "THE LEAGUE",
        sub: "Rookie season. Every night is a big name.",
        reward: "dunk.360",
        games: [
          game("n2-1", () => NBA("ATL"), "arena", "clean", 2, LEAGUE, goal("margin", 5), goal("steals", 3), [["ANNOUNCER", "Opening night for the undrafted rookies!"]]),
          game("n2-2", () => NBA("SAC"), "arena", "clean", 2, LEAGUE, goal("hold", 16), goal("ankles", 2), [["COACH RAY", "Sacramento shoots it. Close out."]]),
          game("n2-3", () => NBA("PHX"), "arena", "clean", 2, LEAGUE, goal("steals", 4), goal("dunks", 2), [["DEX", "Booker in the desert. Hands up."]]),
          game("n2-4", () => NBA("MIA"), "arena", "clean", 2, LEAGUE, goal("margin", 6), goal("blk", 1), [["COACH RAY", "Giannis in Miami. Stay out of his way. Or block him."]]),
          game("n2-5", () => NBA("LAL"), "arena", "clean", 3, { ...LEAGUE, start: [0, 6] }, goal("win"), goal("threes", 3), [["ANNOUNCER", "Lakers up six early. Big crowd tonight."]]),
          game("n2-6", () => NBA("NYK"), "arena", "clean", 3, LEAGUE, goal("margin", 6), goal("greens", 4),
            [["ANNOUNCER", "The champs at Madison Square Garden. Boss game."]],
            [["COACH RAY", "You just beat the champs. Playoffs, here we come."]]),
        ],
      },
      {
        title: "THE FINALS",
        sub: "Hall of Famer difficulty. Earn the ring.",
        reward: "cel.mic",
        games: [
          game("n3-1", () => NBA("DET"), "arena", "clean", 3, FINALS, goal("margin", 5), goal("steals", 3), [["COACH RAY", "Playoffs. Every possession counts."]]),
          game("n3-2", () => NBA("HOU"), "arena", "clean", 3, FINALS, goal("hold", 24), goal("blk", 2), [["BIG LOU", "Durant and Sengun. Make them work."]]),
          game("n3-3", () => NBA("MIN"), "arena", "clean", 3, FINALS, goal("ankles", 3), goal("dunks", 2), [["DEX", "Ant's the fastest guy we've seen. Be faster."]]),
          game("n3-4", () => NBA("DEN"), "arena", "clean", 3, FINALS, goal("margin", 6), goal("ankles", 3), [["COACH RAY", "Jokic sees everything. Move the ball."]]),
          game("n3-5", () => NBA("SAS"), "arena", "clean", 3, FINALS, goal("margin", 4), goal("greens", 4), [["BIG LOU", "Wemby. Don't shoot over him. Go around."]]),
          game("n3-6", () => NBA("OKC"), "arena", "clean", 3, FINALS, goal("margin", 6), goal("greens", 5),
            [["ANNOUNCER", "Game 7 of the Finals. The undrafted kids against the Thunder."]],
            [["ANNOUNCER", "CHAMPIONS! Undrafted to the ring!"]]),
        ],
      },
    ],
  },
};
// The campaign being played or browsed. CAMP is its list of chapters.
let CAMP = CAMPAIGNS.street.chapters;
const CAMP_IDS = ["street", "nba"];
// Saves from before the split used ids "1-1".."5-6": chapters 1-2 were street, 3-5 NBA.
(function migrateStars() {
  const map = { 1: "s1", 2: "s2", 3: "n1", 4: "n2", 5: "n3" };
  for (const k of Object.keys(SAVE.stars)) {
    const m = k.match(/^([1-5])-([1-6])$/);
    if (m) {
      const nk = map[m[1]] + "-" + m[2];
      SAVE.stars[nk] = Math.max(SAVE.stars[nk] || 0, SAVE.stars[k]);
      delete SAVE.stars[k];
    }
  }
})();
const allGames = (cid) => CAMPAIGNS[cid].chapters.flatMap((c) => c.games);
const starsOf = (id) => SAVE.stars[id] || 0;
const gameUnlocked = (ci, gi) => (gi === 0 ? ci === 0 || starsOf(CAMP[ci - 1].games[5].id) > 0 : starsOf(CAMP[ci].games[gi - 1].id) > 0);
// Score a goal at the end of a game.
function goalMet(gl, won) {
  if (gl.k === "win") return won;
  if (gl.k === "margin") return won && G.home - G.away >= gl.n;
  if (gl.k === "hold") return won && G.away < gl.n;
  return (G.st[STATKEY[gl.k]] || 0) >= gl.n;
}
// The hero shown in the Inventory preview: your campaign hooper if you have one, else the Thunder's star.
function campHero() {
  if (SAVE.name) {
    const T0 = crewTeam(),
      q = T0.p[0];
    return { key: "hero" + SAVE.name + SAVE.skin + SAVE.hair, ti: 0, pi: 0, team: T0, sk: SK[q[10]], look: 91, pos: q[1], ht: q[3], hair: q[11] };
  }
  const ti = TEAMS.findIndex((t) => t.c === "OKC");
  return { key: "okc", ti, pi: star(TEAMS[ti]) };
}
