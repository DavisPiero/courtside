"use strict";
// Campaign: "Streets to the League". 5 chapters x 6 games. Your crew starts on the street courts and works up
// to the NBA. Each game: 1 star for winning, 1 for its twist goal, 1 for a style goal. Win to unlock the next.
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
const crewLevel = () => CAMP.filter((ch, i) => (SAVE.stars[ch.games[5].id] || 0) > 0 && i < 4).length;
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

const CAMP = [
  {
    title: "THE BLOCK",
    sub: "Nobody knows your name. Yet.",
    games: [
      game("1-1", () => streetCrew("CORNER KIDS", "CK", "#3fa34d", "#ffffff", "#2b6e35", 62, ["LIL MO", "TREY", "BIGS"]), "street", "clean", 0, STREET11,
        goal("margin", 4), goal("greens", 1),
        [["DEX", "First game on the block. Nobody knows your name yet."], ["BIG LOU", "Let's change that. First to 11."]]),
      game("1-2", () => streetCrew("BOOKER ST", "BST", "#2f6fd6", "#ffd23c", "#1d4aa0", 64, ["JAYJAY", "BOOKS", "TANKER"]), "street", "clean", 0, STREET11,
        goal("hold", 6), goal("steals", 2),
        [["BOOKER ST", "New kid? Hope you brought your own ball."], ["DEX", "Lock them down. Don't let them get to 6."]]),
      game("1-3", () => streetCrew("RIM WRECKERS", "RW", "#c0392b", "#111111", "#7d1f16", 66, ["RAZOR", "KNUCKLES", "BRICK"]), "street", "mayhem", 1, STREET11,
        goal("drops", 2), goal("dunks", 1),
        [["BIG LOU", "These guys don't play fair."], ["BIG LOU", "Good news: tonight, neither do we. MAYHEM rules."]]),
      game("1-4", () => streetCrew("NIGHT SHIFT", "NS", "#3b2a6b", "#9fe7ff", "#251a45", 68, ["NOX", "GHOST", "MOONEY"]), "street", "clean", 1, STREET15,
        goal("margin", 6), goal("ankles", 2),
        [["DEX", "Night Shift only plays after dark. They're quick."], ["DEX", "Shake 'em. Break some ankles."]]),
      game("1-5", () => streetCrew("SLICK'S FIVE", "SL5", "#e67e22", "#16181f", "#a85a14", 70, ["SLICK", "FINGERS", "DOC"]), "street", "clean", 1, { ...STREET15, start: [0, 6] },
        goal("win"), goal("threes", 2),
        [["SLICK", "We spotted you nothing. You're already down six, rookie."], ["BIG LOU", "Comeback time. From downtown if we have to."]]),
      game("1-6", () => streetCrew("TANK & THE TOWERS", "TNK", "#5b616e", "#ff5c4d", "#3a3e47", 74, ["TANK", "TOWER", "TOWER JR"], 2), "street", "clean", 1, STREET21,
        goal("margin", 5), goal("greens", 3),
        [["TANK", "This is MY block. You want it? Come take it."], ["DEX", "Boss game. First to 21. Let's go."]],
        [["TANK", "Alright... you can hoop. See you downtown."]]),
    ],
  },
  {
    title: "THE CITY",
    sub: "Downtown courts. Bigger crowds, better hoopers.",
    games: [
      game("2-1", () => streetCrew("HARBOR HAWKS", "HH", "#0f7c8c", "#ffffff", "#0a5560", 72, ["GULL", "ANCHOR", "DOCKS"]), "street", "clean", 1, STREET15,
        goal("steals", 3), goal("dunks", 1),
        [["DEX", "Welcome downtown. The Hawks love to pass. Pick it off."]]),
      game("2-2", () => streetCrew("DOWNTOWN DRIFT", "DD", "#d4145a", "#fbb03b", "#8a0d3b", 73, ["SKIDZ", "TURBO", "NITRO"]), "street", "mayhem", 1, STREET15,
        goal("drops", 3), goal("margin", 5),
        [["BIG LOU", "Drift play dirty. MAYHEM is on."]]),
      game("2-3", () => streetCrew("CONCRETE KINGS", "CK2", "#7f8c8d", "#f1c40f", "#4d5656", 75, ["CROWN", "SLAB", "MORTAR"]), "street", "clean", 2, STREET15,
        goal("hold", 10), goal("ankles", 2),
        [["DEX", "Kings think they own this city. Defence wins this one."]]),
      game("2-4", () => streetCrew("ROOFTOP ROYALS", "RR", "#8e44ad", "#ffffff", "#5b2c6f", 76, ["SKY", "PENT", "HOUSE"]), "street", "clean", 2, { ...STREET21, start: [0, 8] },
        goal("threes", 3), goal("greens", 2),
        [["DEX", "We got here late. Down eight already."], ["BIG LOU", "Then we shoot our way back."]]),
      game("2-5", () => streetCrew("EASTSIDE ELITE", "ESE", "#16a085", "#111111", "#0e6655", 78, ["PRINCE", "ACE", "DUKE"]), "street", "mayhem", 2, STREET21,
        goal("margin", 6), goal("blk", 1),
        [["BIG LOU", "Eastside. Big, mean, and MAYHEM's on."]]),
      game("2-6", () => streetCrew("TANK & THE TOWERS", "TNK", "#5b616e", "#ff5c4d", "#3a3e47", 80, ["TANK", "TOWER", "TOWER JR"], 2), "street", "clean", 2, STREET21,
        goal("margin", 7), goal("ankles", 3),
        [["TANK", "Downtown's my town too. Round two."], ["DEX", "He's been training. So have we."]],
        [["SCOUT", "Kid. Summer League. Monday. Don't be late."]]),
    ],
  },
  {
    title: "SUMMER LEAGUE",
    sub: "Real arena, real refs, NBA teams watching.",
    games: [
      game("3-1", () => NBA("CHA"), "arena", "clean", 1, SUMMER, goal("margin", 4), goal("greens", 2), [["ANNOUNCER", "From the street courts... it's the new kids!"]]),
      game("3-2", () => NBA("CHI"), "arena", "clean", 1, SUMMER, goal("hold", 14), goal("steals", 2), [["DEX", "Arena floors are fast. Keep your feet."]]),
      game("3-3", () => NBA("BKN"), "arena", "mayhem", 1, SUMMER, goal("drops", 2), goal("dunks", 1), [["BIG LOU", "Summer League MAYHEM night. Nobody told the refs."]]),
      game("3-4", () => NBA("UTA"), "arena", "clean", 2, SUMMER, goal("margin", 5), goal("ankles", 2), [["DEX", "Utah's got size. Go around them."]]),
      game("3-5", () => NBA("MEM"), "arena", "clean", 2, { ...SUMMER, start: [0, 6] }, goal("win"), goal("threes", 2), [["ANNOUNCER", "Down six at the tip. Can the street kids come back?"]]),
      game("3-6", () => NBA("WAS"), "arena", "clean", 2, SUMMER, goal("margin", 6), goal("greens", 3),
        [["ANNOUNCER", "Summer League final! Winner gets a contract."]],
        [["SCOUT", "Welcome to the League."]]),
    ],
  },
  {
    title: "THE LEAGUE",
    sub: "Rookie season. Every night is a big name.",
    games: [
      game("4-1", () => NBA("ATL"), "arena", "clean", 2, LEAGUE, goal("margin", 5), goal("steals", 3), [["ANNOUNCER", "Opening night for the rookies!"]]),
      game("4-2", () => NBA("SAC"), "arena", "clean", 2, LEAGUE, goal("hold", 16), goal("ankles", 2), [["DEX", "Light the beam? Not tonight."]]),
      game("4-3", () => NBA("PHX"), "arena", "mayhem", 2, LEAGUE, goal("drops", 3), goal("dunks", 2), [["BIG LOU", "MAYHEM in the desert."]]),
      game("4-4", () => NBA("MIA"), "arena", "clean", 2, LEAGUE, goal("margin", 6), goal("blk", 1), [["DEX", "Giannis in Miami. Stay out of his way. Or block him."]]),
      game("4-5", () => NBA("LAL"), "arena", "clean", 3, { ...LEAGUE, start: [0, 6] }, goal("win"), goal("threes", 3), [["ANNOUNCER", "Lakers up six early. Big crowd tonight."]]),
      game("4-6", () => NBA("NYK"), "arena", "clean", 3, LEAGUE, goal("margin", 6), goal("greens", 4),
        [["ANNOUNCER", "The champs. Madison Square Garden. Boss game."]],
        [["ANNOUNCER", "The rookies just beat the champs! Next stop: the Finals run."]]),
    ],
  },
  {
    title: "THE FINALS",
    sub: "Hall of Famer difficulty. Earn the ring.",
    games: [
      game("5-1", () => NBA("DET"), "arena", "clean", 3, FINALS, goal("margin", 5), goal("steals", 3), [["DEX", "Playoffs. Every possession counts."]]),
      game("5-2", () => NBA("HOU"), "arena", "clean", 3, FINALS, goal("hold", 24), goal("blk", 2), [["BIG LOU", "Durant and Sengun. Make them work."]]),
      game("5-3", () => NBA("MIN"), "arena", "mayhem", 3, FINALS, goal("drops", 3), goal("dunks", 2), [["ANNOUNCER", "A MAYHEM playoff game? Nobody's ever seen this."]]),
      game("5-4", () => NBA("DEN"), "arena", "clean", 3, FINALS, goal("margin", 6), goal("ankles", 3), [["DEX", "Jokic sees everything. Be faster than he thinks."]]),
      game("5-5", () => NBA("SAS"), "arena", "clean", 3, FINALS, goal("margin", 4), goal("greens", 4), [["BIG LOU", "Wemby. Don't shoot over him. Go around."]]),
      game("5-6", () => NBA("OKC"), "arena", "clean", 3, FINALS, goal("margin", 6), goal("greens", 5),
        [["ANNOUNCER", "Game 7 of the Finals. The kids from the block against the Thunder."]],
        [["ANNOUNCER", "CHAMPIONS! From the street courts to the ring!"]]),
    ],
  },
];
const allGames = () => CAMP.flatMap((c) => c.games);
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
