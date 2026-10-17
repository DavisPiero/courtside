"use strict";
// All 30 NBA teams for 2026-27, three of each team's most popular players (not just the best).
// Rosters checked against ESPN's 2026 offseason recap (Sep 2026). Colours only, no logos.
// Team: n name, c code, city, j jersey, t trim, s shorts, k court paint.
// Player: [name, position, overall, height in inches, speed, shooting, finishing, handling, defence, blocking,
//          skin tone 0 (lightest) to 5 (darkest), an approximation for the model]
// The ratings are Claude's estimates (0-99), not official numbers. Edit freely.
const TEAMS = [
  { n: "HAWKS", c: "ATL", city: "ATLANTA", j: "#e03a3e", t: "#c1d32f", s: "#a51d2d", k: "#c8102e", p: [
    ["J. JOHNSON", "SF", 87, 81, 84, 76, 88, 80, 82, 72, 3],
    ["C. MCCOLLUM", "SG", 80, 75, 76, 86, 74, 85, 60, 35, 4],
    ["L. DORT", "SG", 78, 76, 80, 74, 70, 66, 91, 45, 4]] },
  { n: "CELTICS", c: "BOS", city: "BOSTON", j: "#1d8a4f", t: "#ffffff", s: "#0f5430", k: "#0e7a41", p: [
    ["J. TATUM", "SF", 93, 80, 80, 88, 88, 85, 83, 60, 3],
    ["P. GEORGE", "SF", 84, 80, 74, 85, 78, 80, 82, 50, 3],
    ["D. WHITE", "PG", 85, 76, 78, 84, 76, 80, 87, 70, 1]] },
  { n: "NETS", c: "BKN", city: "BROOKLYN", j: "#2a2a2a", t: "#ffffff", s: "#151515", k: "#3a3a3a", p: [
    ["M. PORTER JR.", "SF", 84, 82, 72, 88, 82, 70, 64, 50, 1],
    ["J. RANDLE", "PF", 83, 81, 72, 78, 87, 80, 68, 45, 4],
    ["M. BROWN JR.", "PG", 76, 75, 86, 75, 74, 82, 66, 35, 3]] },
  { n: "HORNETS", c: "CHA", city: "CHARLOTTE", j: "#00788c", t: "#1d1160", s: "#00626f", k: "#00788c", p: [
    ["B. MILLER", "SF", 84, 81, 78, 85, 80, 77, 72, 55, 3],
    ["K. KNUEPPEL", "SG", 82, 79, 74, 90, 74, 76, 66, 35, 0],
    ["C. WHITE", "PG", 81, 77, 88, 84, 78, 82, 62, 30, 3]] },
  { n: "BULLS", c: "CHI", city: "CHICAGO", j: "#ce1141", t: "#111111", s: "#9e0b31", k: "#ce1141", p: [
    ["J. GIDDEY", "PG", 83, 80, 74, 76, 74, 88, 70, 40, 0],
    ["M. BUZELIS", "SF", 80, 82, 80, 78, 82, 72, 74, 74, 1],
    ["C. WILSON", "PF", 76, 82, 82, 68, 84, 66, 72, 70, 4]] },
  { n: "CAVALIERS", c: "CLE", city: "CLEVELAND", j: "#860038", t: "#fdbb30", s: "#5e0028", k: "#860038", p: [
    ["D. MITCHELL", "SG", 92, 75, 86, 88, 90, 88, 72, 40, 4],
    ["J. HARDEN", "PG", 86, 77, 70, 86, 80, 92, 62, 45, 4],
    ["E. MOBLEY", "PF", 89, 84, 78, 72, 88, 74, 92, 88, 4]] },
  { n: "MAVERICKS", c: "DAL", city: "DALLAS", j: "#00538c", t: "#b8c4ca", s: "#002b5e", k: "#00538c", p: [
    ["C. FLAGG", "SF", 87, 81, 82, 80, 86, 80, 84, 72, 0],
    ["K. IRVING", "PG", 88, 74, 82, 89, 90, 97, 64, 35, 3],
    ["D. LIVELY", "C", 81, 85, 72, 40, 86, 50, 82, 85, 3]] },
  { n: "NUGGETS", c: "DEN", city: "DENVER", j: "#0e2240", t: "#fec524", s: "#0a1830", k: "#1d428a", p: [
    ["N. JOKIC", "C", 98, 83, 60, 88, 96, 88, 76, 64, 0],
    ["J. MURRAY", "PG", 88, 76, 80, 89, 84, 86, 66, 35, 1],
    ["A. GORDON", "PF", 83, 80, 76, 72, 90, 68, 82, 60, 4]] },
  { n: "PISTONS", c: "DET", city: "DETROIT", j: "#c8102e", t: "#1d42ba", s: "#1d42ba", k: "#1d42ba", p: [
    ["C. CUNNINGHAM", "PG", 93, 78, 78, 84, 88, 92, 76, 50, 4],
    ["J. DUREN", "C", 85, 82, 74, 40, 90, 52, 82, 80, 5],
    ["A. THOMPSON", "SF", 83, 79, 92, 60, 86, 70, 92, 72, 4]] },
  { n: "WARRIORS", c: "GSW", city: "GOLDEN STATE", j: "#1d428a", t: "#ffc72c", s: "#13306b", k: "#1d428a", p: [
    ["S. CURRY", "PG", 93, 74, 82, 99, 84, 94, 62, 30, 2],
    ["J. BUTLER", "SF", 86, 79, 74, 78, 88, 80, 84, 50, 4],
    ["D. GREEN", "PF", 80, 78, 70, 66, 70, 76, 90, 72, 4]] },
  { n: "ROCKETS", c: "HOU", city: "HOUSTON", j: "#ce1141", t: "#c4ced4", s: "#9e0b31", k: "#ce1141", p: [
    ["K. DURANT", "SF", 91, 83, 72, 94, 88, 84, 72, 70, 4],
    ["A. SENGUN", "C", 89, 83, 64, 70, 90, 82, 76, 72, 1],
    ["A. THOMPSON", "SF", 87, 79, 94, 62, 88, 78, 92, 74, 4]] },
  { n: "PACERS", c: "IND", city: "INDIANA", j: "#002d62", t: "#fdbb30", s: "#001f45", k: "#002d62", p: [
    ["T. HALIBURTON", "PG", 90, 77, 82, 88, 76, 92, 68, 45, 4],
    ["P. SIAKAM", "PF", 87, 80, 76, 80, 88, 80, 76, 60, 5],
    ["I. ZUBAC", "C", 84, 84, 60, 40, 88, 48, 80, 82, 0]] },
  { n: "CLIPPERS", c: "LAC", city: "LOS ANGELES", j: "#c8102e", t: "#1d428a", s: "#1d428a", k: "#1d428a", p: [
    ["D. GARLAND", "PG", 84, 73, 84, 86, 76, 90, 58, 25, 3],
    ["B. INGRAM", "SF", 84, 80, 72, 84, 82, 82, 64, 50, 4],
    ["B. BEAL", "SG", 80, 76, 72, 84, 80, 80, 58, 35, 4]] },
  { n: "LAKERS", c: "LAL", city: "LOS ANGELES", j: "#6a3fb8", t: "#ffc72c", s: "#3b2275", k: "#552583", p: [
    ["L. DONCIC", "PG", 97, 78, 70, 92, 92, 96, 62, 45, 0],
    ["A. REAVES", "SG", 86, 77, 76, 85, 82, 84, 64, 35, 0],
    ["B. JAMES", "SG", 68, 75, 78, 66, 68, 68, 72, 35, 3]] },
  { n: "GRIZZLIES", c: "MEM", city: "MEMPHIS", j: "#12173f", t: "#5d76a9", s: "#0b0f2a", k: "#5d76a9", p: [
    ["Z. EDEY", "C", 80, 88, 50, 30, 88, 36, 76, 84, 0],
    ["C. BOOZER", "PF", 78, 81, 74, 74, 84, 70, 72, 62, 3],
    ["D. RUSSELL", "PG", 77, 76, 70, 84, 70, 84, 56, 30, 4]] },
  { n: "HEAT", c: "MIA", city: "MIAMI", j: "#98002e", t: "#f9a01b", s: "#2a2a2a", k: "#98002e", p: [
    ["G. ANTETOKOUNMPO", "PF", 95, 83, 86, 64, 98, 78, 86, 82, 4],
    ["B. ADEBAYO", "C", 86, 81, 78, 62, 84, 72, 92, 76, 4],
    ["K. THOMPSON", "SG", 78, 78, 62, 88, 66, 62, 66, 45, 2]] },
  { n: "BUCKS", c: "MIL", city: "MILWAUKEE", j: "#00471b", t: "#eee1c6", s: "#00361a", k: "#00471b", p: [
    ["T. HERRO", "SG", 85, 77, 76, 88, 80, 86, 56, 25, 0],
    ["M. TURNER", "C", 83, 83, 66, 80, 78, 52, 80, 92, 3],
    ["J. JAQUEZ JR.", "SF", 79, 78, 72, 70, 84, 76, 72, 45, 2]] },
  { n: "TIMBERWOLVES", c: "MIN", city: "MINNESOTA", j: "#0c2340", t: "#78be20", s: "#081a30", k: "#236192", p: [
    ["A. EDWARDS", "SG", 94, 76, 90, 88, 94, 86, 80, 60, 4],
    ["L. BALL", "PG", 86, 79, 82, 85, 78, 90, 64, 45, 3],
    ["R. GOBERT", "C", 84, 85, 60, 20, 84, 30, 95, 92, 4]] },
  { n: "PELICANS", c: "NOP", city: "NEW ORLEANS", j: "#0c2340", t: "#c8a165", s: "#081a30", k: "#0c2340", p: [
    ["Z. WILLIAMSON", "PF", 86, 78, 82, 52, 96, 76, 66, 55, 4],
    ["T. MURPHY III", "SF", 84, 80, 80, 88, 80, 70, 72, 55, 3],
    ["D. MURRAY", "PG", 82, 76, 80, 78, 78, 84, 80, 40, 4]] },
  { n: "KNICKS", c: "NYK", city: "NEW YORK", j: "#006bb6", t: "#f58426", s: "#005494", k: "#006bb6", p: [
    ["J. BRUNSON", "PG", 92, 74, 78, 88, 90, 92, 60, 25, 3],
    ["K. TOWNS", "C", 89, 84, 66, 90, 84, 70, 68, 66, 2],
    ["M. BRIDGES", "SF", 84, 78, 78, 80, 78, 72, 82, 55, 4]] },
  { n: "THUNDER", c: "OKC", city: "OKLAHOMA CITY", j: "#1f6fe0", t: "#ff8a2a", s: "#123b8a", k: "#1f5fd0", p: [
    ["S. GILGEOUS-ALEXANDER", "SG", 98, 78, 86, 90, 96, 94, 82, 55, 4],
    ["J. WILLIAMS", "SF", 89, 78, 80, 84, 86, 84, 82, 55, 4],
    ["C. HOLMGREN", "C", 88, 85, 74, 80, 82, 66, 86, 94, 0]] },
  { n: "MAGIC", c: "ORL", city: "ORLANDO", j: "#0077c0", t: "#c4ced4", s: "#005a92", k: "#0077c0", p: [
    ["P. BANCHERO", "PF", 89, 82, 74, 78, 90, 82, 74, 55, 2],
    ["F. WAGNER", "SF", 87, 82, 76, 78, 86, 82, 80, 55, 0],
    ["D. BANE", "SG", 84, 77, 74, 88, 76, 76, 70, 35, 4]] },
  { n: "76ERS", c: "PHI", city: "PHILADELPHIA", j: "#006bb6", t: "#ed174c", s: "#002b5c", k: "#006bb6", p: [
    ["L. JAMES", "SF", 88, 81, 72, 82, 90, 88, 70, 55, 4],
    ["T. MAXEY", "PG", 90, 74, 96, 86, 86, 88, 62, 30, 3],
    ["J. EMBIID", "C", 88, 84, 58, 84, 92, 72, 80, 82, 5]] },
  { n: "SUNS", c: "PHX", city: "PHOENIX", j: "#1d1160", t: "#e56020", s: "#140c45", k: "#e56020", p: [
    ["D. BOOKER", "SG", 90, 77, 76, 92, 86, 88, 60, 30, 2],
    ["J. GREEN", "SG", 82, 76, 92, 78, 86, 80, 58, 35, 3],
    ["M. BRIDGES", "PF", 80, 79, 76, 76, 86, 70, 66, 55, 4]] },
  { n: "TRAIL BLAZERS", c: "POR", city: "PORTLAND", j: "#e03a3e", t: "#111111", s: "#111111", k: "#e03a3e", p: [
    ["J. MORANT", "PG", 87, 74, 94, 72, 94, 88, 62, 45, 4],
    ["D. LILLARD", "PG", 86, 74, 74, 92, 78, 88, 56, 25, 4],
    ["D. AVDIJA", "SF", 85, 81, 76, 78, 86, 80, 78, 55, 1]] },
  { n: "KINGS", c: "SAC", city: "SACRAMENTO", j: "#5a2d81", t: "#c4ced4", s: "#3e1f5a", k: "#5a2d81", p: [
    ["D. SABONIS", "C", 86, 84, 60, 66, 90, 78, 72, 55, 0],
    ["Z. LAVINE", "SG", 84, 77, 84, 88, 88, 84, 56, 35, 3],
    ["M. MONK", "SG", 80, 75, 82, 84, 80, 82, 54, 25, 4]] },
  { n: "SPURS", c: "SAS", city: "SAN ANTONIO", j: "#e6eaf0", t: "#22242c", s: "#8f98aa", k: "#4a5468", p: [
    ["V. WEMBANYAMA", "C", 97, 88, 76, 84, 90, 74, 96, 99, 5],
    ["D. FOX", "PG", 87, 75, 94, 80, 86, 86, 70, 35, 4],
    ["S. CASTLE", "SG", 84, 78, 82, 72, 86, 80, 82, 50, 3]] },
  { n: "RAPTORS", c: "TOR", city: "TORONTO", j: "#ce1141", t: "#a1a1a4", s: "#111111", k: "#ce1141", p: [
    ["K. LEONARD", "SF", 88, 79, 70, 88, 86, 82, 86, 60, 4],
    ["S. BARNES", "PF", 87, 79, 80, 72, 86, 82, 86, 72, 4],
    ["R. BARRETT", "SF", 82, 78, 78, 78, 84, 76, 66, 40, 3]] },
  { n: "JAZZ", c: "UTA", city: "UTAH", j: "#3e2680", t: "#f9a01b", s: "#25174f", k: "#3e2680", p: [
    ["J. JACKSON JR.", "PF", 86, 83, 72, 80, 78, 62, 88, 94, 4],
    ["L. MARKKANEN", "PF", 85, 84, 70, 88, 84, 66, 66, 55, 0],
    ["D. PETERSON", "SG", 78, 77, 84, 80, 80, 80, 70, 45, 4]] },
  { n: "WIZARDS", c: "WAS", city: "WASHINGTON", j: "#002b5c", t: "#e31837", s: "#001c3d", k: "#002b5c", p: [
    ["A. DAVIS", "PF", 90, 82, 72, 70, 90, 66, 92, 92, 4],
    ["T. YOUNG", "PG", 87, 73, 82, 86, 78, 94, 50, 25, 3],
    ["A. DYBANTSA", "SF", 79, 81, 82, 76, 84, 78, 70, 55, 4]] },
];
// Default match-up on the setup screen.
const DEFAULT_TEAMS = [TEAMS.findIndex((t) => t.c === "OKC"), TEAMS.findIndex((t) => t.c === "SAS")];
