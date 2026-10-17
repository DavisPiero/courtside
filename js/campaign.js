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
// Every boss beaten (in either campaign) makes you and the crew better, up to six times.
const crewLevel = () => Math.min(6, CAMP_IDS.flatMap((c) => CAMPAIGNS[c].chapters).filter((ch) => (SAVE.stars[ch.games[5].id] || 0) > 0).length);
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
// ---------- story lines: [who, text, mood]. who is a character in js/story.js (CHARS), a player on the
// opposing team, "HERO" (your hooper) or "" (narration, no face). mood picks a pose for the speaker:
// hype, cocky, angry, point, flex, shh, cold, dance, lights (see MOODS in js/story.js).
// Game: id, opp (team), court, mode, diff, rules, goals [twist, style], intro lines, win lines (after a win),
// x: { lose: lines after a loss, mid: lines at half time or halfway to the target }.
function game(id, opp, court, mode, diff, rules, twist, style, intro, win, x) {
  x = x || {};
  return { id, opp, court, mode, diff, rules: { ...RULES_STD, ...rules }, goals: [goal("win"), twist, style], intro, outro: win, lose: x.lose, mid: x.mid };
}
const STREET11 = { target: 11 },
  STREET15 = { target: 15 },
  STREET21 = { target: 21 },
  SUMMER = { nq: 1, qlen: 180 },
  LEAGUE = { nq: 1, qlen: 240 },
  FINALS = { nq: 2, qlen: 180 };
// The NBA campaign's rival, Zeke Knox, is made up. He joins a real team for the games he plays in.
const KNOX = ["Z. KNOX", "SG", 86, 78, 88, 86, 86, 86, 74, 45, 3, 1];
const withKnox = (c, slot) => {
  const t = NBA(c),
    p = t.p.slice();
  p[slot] = KNOX;
  return { ...t, p };
};
const TANKS = (r) => streetCrew("TANK & THE TOWERS", "TNK", "#5b616e", "#ff5c4d", "#3a3e47", r, ["TANK", "TOWER", "TOWER JR"], 2);

// Two campaigns. STREET: street courts, Mayhem allowed. NBA: arenas, professional rules only (never Mayhem).
// Each chapter has an opening scene (intro) and a closing scene after the boss (outro). The first chapter's
// intro is the campaign's prologue. Each chapter's boss unlocks a Legendary animation the first time you beat it.
const CAMPAIGNS = {
  street: {
    title: "KING OF THE COURTS",
    sub: "Street courts. Your crew against the city's best. Mayhem allowed.",
    rival: "TANK",
    chapters: [
      {
        title: "THE BLOCK",
        sub: "Nobody knows your name. Yet.",
        reward: "dribble.tornado",
        intro: [
          ["", "New town. New block. One cracked court behind the laundromat."],
          ["DEX", "Yo, new kid! You hoop? I'm Dex. Fastest hands on the block.", "point"],
          ["BIG LOU", "I'm Big Lou. I dunk. That's it. That's the whole thing.", "flex"],
          ["HERO", "I hoop. So where do you guys play?"],
          ["DEX", "That's the problem. We don't. Tank's crew owns the court."],
          ["BIG LOU", "They took the good net. They took the good ball. They took my sandwich."],
          ["TANK", "Court's closed, little guys. Unless you think you can take it.", "cocky"],
          ["HERO", "Then we'll take it."],
          ["DEX", "Okay. We start small. Beat every crew on the block, and Tank HAS to play us.", "hype"],
        ],
        outro: [
          ["", "The block got its court back. Big Lou got his sandwich back."],
          ["DEX", "Everybody's talking about us. EVERYBODY.", "dance"],
          ["BIG LOU", "My mom made a sign. It says MY SON DUNKS.", "flex"],
          ["HERO", "Downtown, then?"],
          ["DEX", "Downtown.", "point"],
        ],
        games: [
          game("s1-1", () => streetCrew("CORNER KIDS", "CK", "#3fa34d", "#ffffff", "#2b6e35", 62, ["LIL MO", "TREY", "BIGS"]), "street", "clean", 0, STREET11,
            goal("margin", 4), goal("greens", 1),
            [["DEX", "Corner Kids first. They're good, but they're twelve."], ["BIG LOU", "I'm also twelve."], ["DEX", "First to 11. Show 'em what you got, new kid.", "point"]],
            [["LIL MO", "Okay... the new kid is NICE."], ["DEX", "One down. Word's gonna spread.", "hype"]],
            { lose: [["DEX", "Shake it off. Even the Corner Kids had to start somewhere."]], mid: [["DEX", "Halfway! Keep it moving."]] }),
          game("s1-2", () => streetCrew("BOOKER ST", "BST", "#2f6fd6", "#ffd23c", "#1d4aa0", 64, ["JAYJAY", "BOOKS", "TANKER"]), "street", "clean", 0, STREET11,
            goal("hold", 6), goal("steals", 2),
            [["JAYJAY", "New kid? Hope you brought your own ball.", "cocky"], ["HERO", "Brought my own crew."], ["DEX", "Lock them down. Don't let them get to 6."]],
            [["JAYJAY", "...We'll get you next time."], ["BIG LOU", "Next time. That's what they all say.", "shh"]],
            { mid: [["BIG LOU", "Hands up! They hate that."]] }),
          game("s1-3", () => streetCrew("RIM WRECKERS", "RW", "#c0392b", "#111111", "#7d1f16", 66, ["RAZOR", "KNUCKLES", "BRICK"]), "street", "mayhem", 0, STREET11,
            goal("drops", 2), goal("dunks", 1),
            [["RAZOR", "Wreckers don't call fouls. Wreckers don't call anything.", "angry"], ["BIG LOU", "These guys don't play fair."], ["BIG LOU", "Good news: tonight, neither do we. MAYHEM rules.", "flex"]],
            [["RAZOR", "Ow."], ["", "Someone was watching from behind the fence."], ["TANK", "Heh. Not bad, new kid. Don't get comfy.", "cocky"]],
            { mid: [["BIG LOU", "Drop 'em, take the ball. Mayhem, baby!"]] }),
          game("s1-4", () => streetCrew("NIGHT SHIFT", "NS", "#3b2a6b", "#9fe7ff", "#251a45", 68, ["NOX", "GHOST", "MOONEY"]), "cage", "clean", 1, STREET15,
            goal("margin", 6), goal("ankles", 2),
            [["", "The court lights flicker on. Night Shift only plays after dark."], ["NOX", "You can't guard what you can't see.", "shh"], ["DEX", "They're quick. Shake 'em. Break some ankles."]],
            [["NOX", "The kid's... quick."], ["DEX", "Two more crews and Tank has no excuses.", "point"]]),
          game("s1-5", () => streetCrew("SLICK'S FIVE", "SL5", "#e67e22", "#16181f", "#a85a14", 70, ["SLICK", "FINGERS", "DOC"]), "street", "mayhem", 1, { ...STREET15, start: [0, 6] },
            goal("win"), goal("threes", 2),
            [["SLICK", "We already put six on the board. Spotted ourselves.", "cocky"], ["HERO", "That's cheating."], ["SLICK", "That's STREET."], ["BIG LOU", "Comeback time. And it's MAYHEM.", "flex"]],
            [["SLICK", "Six points wasn't ENOUGH?!", "angry"], ["TANK", "Fine. You want my court? Tomorrow. First to 21.", "angry"], ["DEX", "...He said tomorrow. Lou. He said TOMORROW."]],
            { mid: [["DEX", "We're catching up. I can smell it."]] }),
          game("s1-6", () => TANKS(74), "street", "clean", 1, STREET21,
            goal("margin", 5), goal("greens", 3),
            [["TANK", "This is MY block. You want it? Come take it.", "angry"], ["BIG LOU", "He's huge. Why is he so huge."], ["DEX", "Boss game. First to 21. For the block!", "hype"]],
            [["TANK", "...Alright. You can hoop."], ["TANK", "Court's yours. But you're not kings of anything. Downtown would eat you alive."], ["DEX", "Downtown? ...Lou. We're going downtown.", "hype"]],
            { lose: [["TANK", "MY block. Come back when you're grown.", "cocky"]], mid: [["TANK", "Halfway, and you're already tired.", "cocky"], ["DEX", "Don't listen. Keep going."]] }),
        ],
      },
      {
        title: "THE CITY",
        sub: "Downtown courts. Bigger crowds, dirtier games.",
        reward: "dunk.legs",
        intro: [
          ["", "Downtown. Bigger courts. Bigger crowds. Way bigger mouths."],
          ["DEX", "Every crew down here wants one thing: a spot in the Summer Jam."],
          ["HERO", "What's the Summer Jam?"],
          ["BIG LOU", "Only the biggest street tournament in the city. The Kings have won it three years straight."],
          ["KING", "Heard some block kids think they belong downtown. Cute.", "cocky"],
          ["DEX", "That's King. Don't look at him. DON'T LOOK AT HIM."],
        ],
        outro: [
          ["", "Three kids from the block. One spot in the Summer Jam."],
          ["BIG LOU", "Grandma's coming. She's bringing the whole church."],
          ["DEX", "And the Kings will be waiting."],
          ["HERO", "Good. Let them wait.", "cold"],
        ],
        games: [
          game("s2-1", () => streetCrew("HARBOR HAWKS", "HH", "#0f7c8c", "#ffffff", "#0a5560", 72, ["GULL", "ANCHOR", "DOCKS"]), "street", "clean", 1, STREET15,
            goal("steals", 3), goal("dunks", 1),
            [["DEX", "Welcome downtown. The Hawks love to pass."], ["DEX", "Hands up. Pick it off.", "point"]],
            [["GULL", "Who ARE you guys?"], ["BIG LOU", "We're the guys who just beat you.", "flex"]]),
          game("s2-2", () => streetCrew("DOWNTOWN DRIFT", "DD", "#d4145a", "#fbb03b", "#8a0d3b", 73, ["SKIDZ", "TURBO", "NITRO"]), "cage", "mayhem", 1, STREET15,
            goal("drops", 3), goal("margin", 5),
            [["SKIDZ", "Drift don't stop. Drift don't drop.", "cocky"], ["BIG LOU", "Drift play dirty. MAYHEM is on."]],
            [["SKIDZ", "We... dropped."], ["DEX", "Rhymes don't win games, Skidz.", "shh"]]),
          game("s2-3", () => streetCrew("CONCRETE KINGS", "CK2", "#7f8c8d", "#f1c40f", "#4d5656", 75, ["CROWN", "SLAB", "MORTAR"]), "street", "clean", 1, STREET15,
            goal("hold", 10), goal("ankles", 2),
            [["CROWN", "We're the Concrete Kings. The real Kings are our big brothers.", "cocky"], ["DEX", "Then let's send a message to big brother. Defence wins this one."]],
            [["KING", "My little brothers lost? To THEM?", "angry"], ["KING", "Hey. Speedy. Dex, right? Ditch these two. Run with the Kings."], ["KING", "You'd get a Summer Jam spot. Guaranteed."], ["DEX", "...I'll think about it."], ["BIG LOU", "DEX?!"]]),
          game("s2-4", () => streetCrew("ROOFTOP ROYALS", "RR", "#8e44ad", "#ffffff", "#5b2c6f", 76, ["SKY", "PENT", "HOUSE"]), "roof", "clean", 2, { ...STREET21, start: [0, 8] },
            goal("threes", 3), goal("greens", 2),
            [["", "Dex shows up late. Really late. You're already down eight."], ["HERO", "Dex. Are you with us, or with them?"], ["DEX", "...Ask me after we win."], ["BIG LOU", "Then we shoot our way back."]],
            [["DEX", "I told King no. You two are my crew. Always.", "hype"], ["BIG LOU", "I KNEW it. I was SO worried.", "dance"]],
            { lose: [["DEX", "That one's on me. I wasn't all here. Again?"]], mid: [["DEX", "My head's back in it. Let's go."]] }),
          game("s2-5", () => streetCrew("EASTSIDE ELITE", "ESE", "#16a085", "#111111", "#0e6655", 78, ["PRINCE", "ACE", "DUKE"]), "cage", "mayhem", 2, STREET21,
            goal("margin", 6), goal("blk", 1),
            [["PRINCE", "Eastside runs this side of the city.", "cocky"], ["BIG LOU", "Big, mean, and MAYHEM's on."]],
            [["TANK", "Hey. Block kids."], ["TANK", "I'm in the Summer Jam qualifier tomorrow. Beat me and you're in. Lose and you're out.", "angry"]]),
          game("s2-6", () => TANKS(80), "roof", "mayhem", 2, STREET21,
            goal("margin", 7), goal("ankles", 3),
            [["TANK", "Downtown's my town too. And this time, no rules.", "angry"], ["DEX", "He's been training."], ["HERO", "So have we.", "cold"]],
            [["TANK", "Fine. You're good. Really good."], ["TANK", "You're in the Summer Jam. The Kings are waiting."], ["KING", "See you in the final, block kids. If you make it.", "cocky"]],
            { lose: [["TANK", "Qualifier's mine. Try again, block kids.", "cocky"]] }),
        ],
      },
      {
        title: "THE SUMMER JAM",
        sub: "The city's street tournament. Win it and you're kings.",
        reward: "cel.backflip",
        intro: [
          ["ANNOUNCER", "WELCOME... TO THE SUMMER JAAAAM!", "hype"],
          ["", "The boardwalk. Speakers booming. Hundreds of people packed along the sand."],
          ["BIG LOU", "That's my grandma! HI GRANDMA!", "hype"],
          ["KING", "Enjoy it, block kids. You won't make it past round two.", "cocky"],
          ["DEX", "Six games to the crown. Let's go."],
        ],
        outro: [
          ["", "That summer, the cracked court behind the laundromat got brand-new nets."],
          ["TANK", "Pickup game tomorrow? Just for fun?"],
          ["HERO", "Just for fun."],
          ["", "Somewhere in the crowd, a man in a team tracksuit wrote something in a notebook."],
          ["COACH RAY", "Hey. You. Name's Ray. Coached twenty years. Never won a ring. Now I scout.", "point"],
          ["COACH RAY", "Three NBA teams want a look at you. Bottom of the league, all three. Everybody starts somewhere."],
          ["HERO", "Just me? What about Dex and Lou?"],
          ["DEX", "Go. We'll be courtside. Loudest seats in the building.", "hype"],
          ["BIG LOU", "I'm making a new sign. It says MY FRIEND DUNKS.", "flex"],
          ["COACH RAY", "Pick a team. Win there, and better teams will come calling."],
        ],
        games: [
          game("s3-1", () => streetCrew("THE TWINS", "TW", "#2c3e50", "#e74c3c", "#1a252f", 79, ["TWIN A", "TWIN B", "BIG SIS"], 3), "beach", "clean", 2, STREET21,
            goal("hold", 14), goal("blk", 1),
            [["ANNOUNCER", "Round one: THE TWINS! Tall. VERY tall."], ["TWIN A", "We finish each other's..."], ["TWIN B", "...dunks."]],
            [["ANNOUNCER", "The block kids are THROUGH!", "hype"], ["BIG SIS", "My brothers never lose. Ugh."]]),
          game("s3-2", () => streetCrew("SKYWALKERS", "SKY", "#00a8e8", "#ffffff", "#006c96", 80, ["AIR", "HOPS", "BOUNCE"]), "beach", "mayhem", 2, STREET21,
            goal("drops", 3), goal("dunks", 2),
            [["AIR", "Gravity is optional for us.", "cocky"], ["DEX", "Skywalkers dunk on everyone. Keep them on the ground. However you can."]],
            [["BIG LOU", "Gravity: one. Skywalkers: zero.", "flex"], ["KING", "Round two. Huh. Lucky.", "cocky"]]),
          game("s3-3", () => streetCrew("OLD SCHOOL", "OS", "#a0522d", "#f5deb3", "#6b3a1e", 81, ["POPS", "UNC", "GRANDPA G"]), "street", "clean", 2, { ...STREET21, start: [0, 8] },
            goal("win"), goal("threes", 3),
            [["POPS", "We were winning this tournament before you were born."], ["BIG LOU", "And they're up eight already. Respect your elders. Then beat them."]],
            [["POPS", "Kid. You play like we used to. Go get 'em."], ["HERO", "Thanks, Pops."]]),
          game("s3-4", () => streetCrew("NEON NIGHTS", "NEO", "#ff00a0", "#00f0ff", "#8a0060", 82, ["GLOW", "VOLT", "LASER"]), "beach", "mayhem", 2, STREET21,
            goal("margin", 6), goal("ankles", 3),
            [["ANNOUNCER", "Quarter-final under the lights! MAYHEM RULES!", "hype"], ["GLOW", "Lights out, rookies.", "lights"]],
            [["ANNOUNCER", "INTO THE SEMIS!"], ["DEX", "Lights out for THEM.", "lights"]]),
          game("s3-5", () => TANKS(84), "cage", "clean", 3, STREET21,
            goal("margin", 7), goal("greens", 4),
            [["TANK", "Semi-final. Of course it's you."], ["HERO", "Last time, Tank."], ["TANK", "Last time."]],
            [["TANK", "...Go win the whole thing. For the block."], ["TANK", "And hey. King hates getting crossed over. Just saying.", "shh"]],
            { lose: [["TANK", "Not today. Run it back?"]] }),
          game("s3-6", () => streetCrew("THE KINGS", "KNG", "#d4af37", "#111111", "#8a7020", 87, ["KING", "QUEEN", "ACE"], 1), "beach", "mayhem", 3, STREET21,
            goal("margin", 5), goal("greens", 5),
            [["ANNOUNCER", "THE FINAL! Three-time champions... THE KINGS!", "hype"], ["KING", "Three titles. Make it four.", "cocky"], ["DEX", "We came from a cracked court behind a laundromat."], ["BIG LOU", "Everything we've done leads here."], ["HERO", "Let's go."]],
            [["ANNOUNCER", "NEW KINGS OF THE COURTS!", "hype"], ["KING", "...Good game. For real."], ["TANK", "THAT'S MY BLOCK! THAT'S MY BLOCK!", "hype"], ["DEX", "From the block to the crown!", "dance"]],
            { lose: [["KING", "Four titles. Told you.", "cocky"]], mid: [["KING", "Halfway. It's still our crown.", "cocky"], ["BIG LOU", "Not for long."]] }),
        ],
      },
    ],
  },
  nba: {
    title: "ROAD TO THE RING",
    sub: "Arenas and NBA teams. Professional rules only. Unlocked by winning the Summer Jam.",
    rival: "ZEKE KNOX",
    chapters: [
      {
        title: "SUMMER LEAGUE",
        sub: "Undrafted. Signed anyway. Prove it.",
        reward: "shot.hook",
        intro: [
          ["", "Draft night. Sixty names called. Not one of them yours."],
          ["ANNOUNCER", "With the seventh pick... ZEKE KNOX!"],
          ["ZEKE KNOX", "A street-ball kid in the NBA? Ha. Stick to the playground.", "cocky"],
          ["COACH RAY", "Nobody drafted me either. Your new team signed you anyway. That's all that counts."],
          ["COACH RAY", "Summer League first. Six games. Don't make me look stupid."],
          ["DEX", "Front row. Every game. We're not missing one.", "point"],
          ["BIG LOU", "I made the sign bigger.", "flex"],
        ],
        outro: [
          ["", "A real locker. A real jersey with your name on the back."],
          ["DEX", "I bought your jersey. I'm gonna sleep in it. Forever."],
          ["COACH RAY", "Phones are ringing. Better teams. Your call: stay, or move up."],
          ["ZEKE KNOX", "Summer League doesn't count. See you in the real games.", "cocky"],
        ],
        games: [
          game("n1-1", () => NBA("CHA"), "arena", "clean", 1, SUMMER, goal("margin", 4), goal("greens", 2),
            [["COACH RAY", "First game. Breathe. It's just basketball, with nicer floors."]],
            [["COACH RAY", "Huh. Not bad. Don't get a big head."]],
            { lose: [["COACH RAY", "Again. From the top."]] }),
          game("n1-2", () => NBA("CHI"), "arena", "clean", 1, SUMMER, goal("hold", 14), goal("steals", 2),
            [["COACH RAY", "Arena floors are fast. Defence first."]],
            [["DEX", "Coach almost smiled. I SAW it."], ["COACH RAY", "I did not."]]),
          game("n1-3", () => NBA("BKN"), "arena", "clean", 2, SUMMER, goal("ankles", 2), goal("dunks", 1),
            [["DEX", "No Mayhem in the League, Lou. Just basketball."], ["BIG LOU", "...Fine. Dunk on them instead. For me.", "flex"]],
            [["BIG LOU", "You dunked on a pro! I'm framing the photo.", "flex"]]),
          game("n1-4", () => NBA("UTA"), "arena", "clean", 2, SUMMER, goal("margin", 5), goal("ankles", 2),
            [["COACH RAY", "Utah's got size. Go around them."]],
            [["", "That night, on TV..."], ["ZEKE KNOX", "Playground kid beat some backups. Whatever.", "cocky"], ["BIG LOU", "Is he talking about YOU?"]]),
          game("n1-5", () => NBA("MEM"), "arena", "clean", 2, { ...SUMMER, start: [0, 6] }, goal("win"), goal("threes", 2),
            [["ANNOUNCER", "The rookie's team is down six at the tip!"], ["COACH RAY", "Good. Now we find out who you are."]],
            [["COACH RAY", "That's who you are."]]),
          game("n1-6", () => withKnox("WAS", 1), "arena", "clean", 2, SUMMER, goal("margin", 6), goal("greens", 3),
            [["ZEKE KNOX", "Summer League final. The lottery pick against nobody.", "cocky"], ["COACH RAY", "Win this and the whole league knows your name."], ["HERO", "I'm not nobody."]],
            [["ZEKE KNOX", "...That was a fluke."], ["COACH RAY", "Welcome to the League. For real."], ["BIG LOU", "COACH IS CRYING."], ["COACH RAY", "It's allergies, Lou."]],
            { lose: [["ZEKE KNOX", "Back to the playground.", "shh"]] }),
        ],
      },
      {
        title: "THE LEAGUE",
        sub: "Rookie season. Every night is a big name.",
        reward: "dunk.360",
        intro: [
          ["", "Rookie season. Eighty-two games. Every night, a famous name."],
          ["ANNOUNCER", "The undrafted rookie is the story of the year!"],
          ["ZEKE KNOX", "Story of the year? I'M the story of the year.", "angry"],
          ["COACH RAY", "Ignore him. Play the next game. Always the next game."],
        ],
        outro: [
          ["ANNOUNCER", "BREAKING: The champs trade for Zeke Knox!"],
          ["ZEKE KNOX", "The champs wanted a winner. See you in the Finals. If you get there.", "cocky"],
          ["COACH RAY", "Playoffs. Twenty years I waited for this."],
          ["COACH RAY", "And the best teams in the league are calling about you. Stay, or chase the ring somewhere new."],
        ],
        games: [
          game("n2-1", () => NBA("ATL"), "arena", "clean", 2, LEAGUE, goal("margin", 5), goal("steals", 3),
            [["ANNOUNCER", "Opening night for the undrafted rookie!"]],
            [["DEX", "You're one-and-oh in the NBA. ONE. AND. OH.", "dance"]]),
          game("n2-2", () => NBA("SAC"), "arena", "clean", 2, LEAGUE, goal("hold", 16), goal("ankles", 2),
            [["COACH RAY", "Sacramento shoots it. Close out."]],
            [["COACH RAY", "That's how you guard a shooter."]]),
          game("n2-3", () => NBA("PHX"), "arena", "clean", 2, LEAGUE, goal("steals", 4), goal("dunks", 2),
            [["DEX", "Booker in the desert. Hands up."]],
            [["BIG LOU", "It's so hot here. Even my nachos are sweating."]]),
          game("n2-4", () => NBA("MIA"), "arena", "clean", 3, LEAGUE, goal("margin", 6), goal("blk", 1),
            [["COACH RAY", "Giannis in Miami. Stay out of his way. Or block him."]],
            [["BIG LOU", "You touched Giannis. Can I touch your hand?"]]),
          game("n2-5", () => NBA("LAL"), "arena", "clean", 3, { ...LEAGUE, start: [0, 6] }, goal("win"), goal("threes", 3),
            [["ANNOUNCER", "Lakers up six early. Big crowd tonight."]],
            [["ANNOUNCER", "The undrafted kid takes down the Lakers!"], ["ZEKE KNOX", "Enjoy it while it lasts.", "cocky"]]),
          game("n2-6", () => NBA("NYK"), "arena", "clean", 3, LEAGUE, goal("margin", 6), goal("greens", 4),
            [["ANNOUNCER", "The champs at Madison Square Garden. Boss game."], ["COACH RAY", "Beat the champs and we're in the playoffs."]],
            [["COACH RAY", "You just beat the champs. Playoffs, here we come."]]),
        ],
      },
      {
        title: "THE FINALS",
        sub: "Hall of Famer difficulty. Earn the ring.",
        reward: "cel.mic",
        intro: [
          ["", "Playoffs. Win or go home."],
          ["COACH RAY", "Twenty years I've waited for this. Let's go get a ring."],
          ["ZEKE KNOX", "OKC's waiting at the end. So am I.", "cocky"],
          ["HERO", "Then we'll see you at the end."],
        ],
        outro: [
          ["", "Confetti. Gold and white. It took an hour to fall."],
          ["COACH RAY", "Twenty years. Thank you, kid."],
          ["BIG LOU", "Coach is crying again."],
          ["COACH RAY", "...Allergies."],
          ["DEX", "From a cracked court to the ring. Nobody's gonna believe this.", "dance"],
        ],
        games: [
          game("n3-1", () => NBA("DET"), "arena", "clean", 3, FINALS, goal("margin", 5), goal("steals", 3),
            [["COACH RAY", "Playoffs. Every possession counts."]],
            [["COACH RAY", "Round one. Done. Next."]]),
          game("n3-2", () => NBA("HOU"), "arena", "clean", 3, FINALS, goal("hold", 24), goal("blk", 2),
            [["BIG LOU", "Durant and Sengun. Make them work."]],
            [["BIG LOU", "You guarded Durant. DURANT. I got it on video."]]),
          game("n3-3", () => NBA("MIN"), "arena", "clean", 3, FINALS, goal("ankles", 3), goal("dunks", 2),
            [["DEX", "Ant's the fastest guy we've seen. Be faster."]],
            [["DEX", "You were faster. Barely. But you were."]]),
          game("n3-4", () => NBA("DEN"), "arena", "clean", 3, FINALS, goal("margin", 6), goal("ankles", 3),
            [["COACH RAY", "Jokic sees everything. Move the ball."]],
            [["COACH RAY", "Conference finals. One more."]]),
          game("n3-5", () => NBA("SAS"), "arena", "clean", 3, FINALS, goal("margin", 4), goal("greens", 4),
            [["BIG LOU", "Wemby. Don't shoot over him. Go around."]],
            [["ANNOUNCER", "The undrafted kid is going to the FINALS!", "hype"], ["ZEKE KNOX", "Finally. Let's see what you've got.", "cocky"]]),
          game("n3-6", () => withKnox("OKC", 1), "arena", "clean", 3, FINALS, goal("margin", 6), goal("greens", 5),
            [["ANNOUNCER", "Game 7 of the Finals. The undrafted kid against Zeke Knox."], ["ZEKE KNOX", "Playground's over.", "cocky"], ["HERO", "Nah. The playground is where I learned."], ["COACH RAY", "Just basketball. Nicer floors."]],
            [["ANNOUNCER", "CHAMPIONS! Undrafted to the ring!", "hype"], ["ZEKE KNOX", "...Respect. For real."]],
            { lose: [["ZEKE KNOX", "Told you. Playground's over.", "cocky"]], mid: [["COACH RAY", "Half time. Twenty-four minutes from a ring. Let's go."]] }),
        ],
      },
    ],
  },
};
// The campaign being played or browsed. CAMP is its list of chapters.
let CAMP = CAMPAIGNS.street.chapters;
const CAMP_IDS = ["street", "nba"];
const allGames = (cid) => CAMPAIGNS[cid].chapters.flatMap((c) => c.games);
const starsOf = (id) => SAVE.stars[id] || 0;
const gameUnlocked = (ci, gi) => (gi === 0 ? ci === 0 || starsOf(CAMP[ci - 1].games[5].id) > 0 : starsOf(CAMP[ci].games[gi - 1].id) > 0);

// ---------- NBA career. Winning the Summer Jam (the Street campaign's last boss) gets you scouted: you sign
// with an NBA team and play alongside its two best players. First offers come from the league's ten worst
// teams; every NBA chapter you clear brings offers from better ones (the middle ten, then the top ten).
// Your contract pays Court Coins once a day (see payday() in js/campui.js), more for every chapter cleared.
const SALARY = [60, 120, 200, 300]; // CC a day, by NBA chapters cleared (3 = champion)
const PAY_DAYS_MAX = 7; // missed paydays add up, to a week at most
const STREET_FINAL = "s3-6";
const nbaCleared = () => CAMPAIGNS.nba.chapters.filter((ch) => starsOf(ch.games[5].id) > 0).length;
// Open once you've won the Summer Jam. Saves that already had NBA stars (from before the lock) stay open.
const nbaOpen = () => starsOf(STREET_FINAL) > 0 || allGames("nba").some((g) => starsOf(g.id) > 0);
const salary = () => SALARY[nbaCleared()];
// Which tier of teams makes you offers now: 0 worst ten, 1 middle ten, 2 top ten.
const offerTier = () => Math.min(2, nbaCleared());
// New offers are waiting when you've reached a tier you haven't answered yet.
const offersWaiting = () => nbaOpen() && (!SAVE.nba.team || SAVE.nba.tier < offerTier());
// How good a team is for you: the average of the two players you'd play with (the whole roster breaks ties).
const teamOvr = (t) => mates(t).reduce((a, q) => a + q[2], 0) / 2 + t.p.reduce((a, q) => a + q[2], 0) / 1000;
// All 30 team codes, worst to best.
let TEAM_RANK = null;
const teamRank = () => TEAM_RANK || (TEAM_RANK = TEAMS.slice().sort((a, b) => teamOvr(a) - teamOvr(b)).map((t) => t.c));
// Three offers from the current tier, kept in the save so they don't change when you look again.
function nbaOffers() {
  const tier = offerTier(),
    N = SAVE.nba;
  if (N.offerTier !== tier || !N.offers.length) {
    const pool = teamRank()
      .slice(tier * 10, tier * 10 + 10)
      .filter((c) => c !== N.team);
    N.offers = [];
    while (N.offers.length < 3 && pool.length) N.offers.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    N.offerTier = tier;
    writeSave();
  }
  return N.offers;
}
function signWith(code) {
  Object.assign(SAVE.nba, { team: code, tier: offerTier(), offers: [], offerTier: -1 });
  if (!SAVE.payday) SAVE.payday = 0; // first payday comes the next time the menu opens
  writeSave();
}
// The two players you play alongside on a team: its best two.
const mates = (t) => t.p.slice().sort((a, b) => b[2] - a[2]).slice(0, 2);
// Your NBA team: you plus that team's best two, in its colours.
function nbaTeam() {
  const t = NBA(SAVE.nba.team || teamRank()[0]);
  return { ...t, p: [crewTeam().p[0], ...mates(t)] };
}
// If you've signed with a team you're due to play, a team close to it in the rankings plays instead.
function altTeam(code) {
  const R = teamRank(),
    i = R.indexOf(code);
  for (const d of [1, -1, 2, -2, 3])
    if (R[i + d] && R[i + d] !== SAVE.nba.team && R[i + d] !== "OKC" && R[i + d] !== "WAS") return R[i + d];
  return R[0];
}
// Zeke Knox's team: Washington, then OKC for the Finals, unless that's your team.
const knoxTeam = (ci) => {
  const c = ci >= 2 ? "OKC" : "WAS";
  return c === SAVE.nba.team ? altTeam(c) : c;
};
// NBA games go through this: swap the opponent when it's your own team, and swap the lines that name them.
for (const gm of allGames("nba")) {
  const opp0 = gm.opp,
    knox = opp0().p.some((q) => q[0] === KNOX[0]),
    lines = { intro: gm.intro, outro: gm.outro, lose: gm.lose },
    clash = () => !knox && opp0().c === SAVE.nba.team;
  gm.opp = () => (knox ? withKnox(knoxTeam(gm.id[1] === "3" ? 2 : 0), 1) : clash() ? NBA(altTeam(opp0().c)) : opp0());
  const SWAP = {
    intro: () => [["COACH RAY", `Schedule change. You can't play your own team, so it's the ${gm.opp().n} tonight. Same job: win.`]],
    outro: () => [["COACH RAY", "Good win. On to the next one."]],
    lose: () => null,
  };
  for (const k in lines) Object.defineProperty(gm, k, { get: () => (clash() ? SWAP[k]() : lines[k]) });
}

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
