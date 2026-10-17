"use strict";
// Hall of Fame teams for Quick Play: each franchise's three best players of all time, rated at their peak.
// Picked by what they did FOR THAT TEAM: titles, MVPs, All-NBA years and their place in the team's record books.
// A franchise's history counts wherever it played (Sonics for OKC, Minneapolis for the Lakers, Royals for the
// Kings, Bullets for the Wizards, ABA Nets and Pacers). Close calls were settled by giving each team a guard,
// a wing and a big. A legend can play for two teams (LeBron: Cavs and Heat; Dr. J: Nets and 76ers).
// Ratings are Claude's estimates (0-99). Same format as js/teams.js; the 12th value is a hair style
// (0 short, 1 tall top, 2 buzz, 3 bald, 4 afro). Colours come from the team in js/teams.js.
const HOF_ROSTERS = {
  ATL: [["T. YOUNG", "PG", 89, 73, 84, 89, 82, 95, 52, 25, 3, 0], ["D. WILKINS", "SF", 93, 80, 88, 82, 96, 82, 70, 55, 4, 2], ["B. PETTIT", "PF", 92, 81, 74, 82, 92, 70, 80, 72, 0, 0]],
  BOS: [["B. COUSY", "PG", 91, 73, 86, 80, 80, 97, 70, 25, 0, 0], ["L. BIRD", "SF", 97, 81, 74, 97, 90, 88, 82, 60, 0, 0], ["B. RUSSELL", "C", 96, 82, 82, 55, 86, 66, 99, 98, 5, 3]],
  BKN: [["J. KIDD", "PG", 92, 76, 84, 76, 80, 96, 88, 45, 3, 3], ["J. ERVING", "SF", 96, 79, 90, 80, 98, 86, 80, 75, 4, 4], ["B. LOPEZ", "C", 86, 84, 62, 82, 86, 60, 76, 86, 0, 1]],
  CHA: [["K. WALKER", "PG", 88, 72, 88, 87, 84, 92, 60, 25, 3, 2], ["G. RICE", "SF", 87, 80, 76, 93, 80, 74, 62, 35, 4, 2], ["L. JOHNSON", "PF", 87, 79, 76, 76, 92, 72, 70, 50, 4, 2]],
  CHI: [["D. ROSE", "PG", 92, 75, 97, 80, 94, 92, 64, 35, 4, 0], ["M. JORDAN", "SG", 99, 78, 94, 92, 99, 94, 96, 62, 4, 3], ["S. PIPPEN", "SF", 93, 80, 90, 78, 88, 88, 97, 66, 4, 0]],
  CLE: [["K. IRVING", "PG", 92, 74, 88, 92, 94, 99, 60, 30, 2, 0], ["L. JAMES", "SF", 99, 81, 92, 86, 99, 92, 90, 72, 4, 0], ["B. DAUGHERTY", "C", 86, 84, 64, 72, 88, 66, 76, 72, 4, 0]],
  DAL: [["L. DONCIC", "PG", 97, 79, 72, 92, 92, 96, 62, 45, 0, 0], ["R. BLACKMAN", "SG", 86, 78, 78, 88, 84, 80, 72, 35, 4, 0], ["D. NOWITZKI", "PF", 96, 84, 66, 98, 88, 74, 68, 60, 0, 0]],
  DEN: [["A. ENGLISH", "SF", 90, 79, 78, 90, 90, 80, 64, 45, 4, 4], ["C. ANTHONY", "SF", 91, 79, 76, 90, 92, 84, 64, 45, 3, 0], ["N. JOKIC", "C", 98, 83, 60, 88, 96, 88, 76, 64, 0, 0]],
  DET: [["I. THOMAS", "PG", 94, 73, 94, 84, 90, 97, 72, 25, 4, 0], ["G. HILL", "SF", 92, 80, 88, 78, 92, 90, 82, 55, 3, 2], ["B. WALLACE", "C", 89, 81, 76, 30, 76, 50, 99, 96, 5, 4]],
  GSW: [["S. CURRY", "PG", 98, 74, 86, 99, 90, 97, 64, 30, 2, 0], ["R. BARRY", "SF", 93, 79, 80, 92, 88, 86, 78, 45, 0, 0], ["W. CHAMBERLAIN", "C", 98, 85, 84, 62, 99, 66, 86, 99, 5, 2]],
  HOU: [["J. HARDEN", "SG", 96, 77, 82, 92, 94, 98, 64, 45, 4, 0], ["H. OLAJUWON", "C", 98, 84, 80, 74, 96, 82, 98, 99, 5, 0], ["M. MALONE", "C", 94, 82, 72, 66, 94, 62, 82, 78, 5, 0]],
  IND: [["R. MILLER", "SG", 91, 79, 80, 98, 80, 82, 64, 30, 4, 3], ["P. GEORGE", "SF", 91, 80, 84, 88, 86, 84, 92, 55, 3, 0], ["M. DANIELS", "C", 89, 81, 68, 60, 90, 56, 84, 86, 4, 0]],
  LAC: [["C. PAUL", "PG", 95, 72, 86, 88, 82, 98, 92, 30, 3, 0], ["K. LEONARD", "SF", 95, 79, 80, 92, 90, 84, 98, 66, 4, 4], ["B. GRIFFIN", "PF", 91, 81, 84, 74, 96, 82, 66, 60, 2, 0]],
  LAL: [["M. JOHNSON", "PG", 98, 81, 84, 82, 92, 99, 76, 45, 4, 0], ["K. BRYANT", "SG", 98, 78, 90, 94, 96, 94, 92, 50, 3, 2], ["S. O'NEAL", "C", 98, 85, 70, 30, 99, 60, 84, 92, 5, 3]],
  MEM: [["J. MORANT", "PG", 91, 74, 97, 76, 95, 92, 60, 35, 3, 0], ["Z. RANDOLPH", "PF", 87, 81, 62, 70, 90, 62, 66, 50, 4, 2], ["M. GASOL", "C", 89, 83, 58, 80, 82, 74, 96, 82, 0, 0]],
  MIA: [["D. WADE", "SG", 96, 76, 92, 78, 97, 90, 84, 72, 3, 0], ["L. JAMES", "SF", 99, 81, 92, 88, 99, 92, 92, 72, 4, 0], ["A. MOURNING", "C", 91, 82, 70, 62, 88, 58, 94, 96, 4, 3]],
  MIL: [["S. MONCRIEF", "SG", 89, 75, 86, 80, 86, 80, 96, 45, 4, 0], ["G. ANTETOKOUNMPO", "PF", 98, 83, 88, 66, 99, 80, 92, 86, 4, 0], ["K. ABDUL-JABBAR", "C", 99, 86, 72, 88, 98, 70, 88, 96, 4, 3]],
  MIN: [["A. EDWARDS", "SG", 94, 76, 90, 88, 94, 86, 80, 60, 4, 0], ["K. GARNETT", "PF", 96, 83, 82, 80, 90, 74, 98, 88, 4, 2], ["K. TOWNS", "C", 89, 84, 66, 90, 86, 70, 68, 66, 2, 0]],
  NOP: [["J. HOLIDAY", "PG", 89, 75, 82, 84, 82, 86, 95, 45, 3, 0], ["Z. WILLIAMSON", "PF", 90, 78, 84, 64, 97, 80, 62, 60, 4, 2], ["A. DAVIS", "PF", 95, 82, 78, 76, 94, 74, 95, 97, 4, 0]],
  NYK: [["W. FRAZIER", "PG", 92, 76, 84, 84, 86, 90, 96, 45, 4, 4], ["W. REED", "C", 91, 81, 70, 80, 90, 60, 86, 82, 4, 0], ["P. EWING", "C", 94, 84, 66, 80, 92, 62, 92, 95, 5, 0]],
  OKC: [["R. WESTBROOK", "PG", 95, 75, 97, 74, 96, 92, 76, 40, 4, 0], ["S. GILGEOUS-ALEXANDER", "SG", 98, 78, 86, 90, 96, 94, 82, 55, 4, 0], ["K. DURANT", "SF", 97, 83, 82, 97, 94, 88, 76, 72, 4, 0]],
  ORL: [["P. HARDAWAY", "PG", 92, 79, 88, 84, 90, 94, 74, 45, 4, 0], ["T. MCGRADY", "SF", 95, 80, 86, 90, 94, 90, 74, 60, 4, 2], ["D. HOWARD", "C", 93, 82, 80, 20, 96, 50, 97, 99, 4, 2]],
  PHI: [["A. IVERSON", "SG", 95, 72, 97, 84, 94, 98, 76, 25, 3, 2], ["J. ERVING", "SF", 96, 79, 90, 80, 98, 86, 80, 75, 4, 4], ["J. EMBIID", "C", 96, 84, 66, 86, 96, 76, 88, 90, 4, 0]],
  PHX: [["S. NASH", "PG", 95, 75, 80, 97, 82, 99, 54, 20, 0, 1], ["D. BOOKER", "SG", 91, 77, 76, 92, 86, 88, 60, 30, 2, 0], ["C. BARKLEY", "PF", 95, 78, 82, 72, 97, 80, 72, 62, 4, 3]],
  POR: [["D. LILLARD", "PG", 94, 74, 84, 96, 86, 94, 58, 30, 4, 0], ["C. DREXLER", "SG", 94, 79, 90, 82, 94, 86, 82, 55, 4, 0], ["B. WALTON", "C", 92, 83, 70, 66, 88, 80, 94, 92, 0, 1]],
  SAC: [["O. ROBERTSON", "PG", 97, 77, 82, 88, 92, 96, 80, 40, 4, 0], ["M. RICHMOND", "SG", 89, 77, 80, 90, 84, 82, 72, 30, 4, 0], ["C. WEBBER", "PF", 92, 82, 76, 74, 90, 84, 78, 80, 4, 3]],
  SAS: [["G. GERVIN", "SG", 93, 79, 82, 92, 94, 84, 66, 50, 4, 4], ["T. DUNCAN", "PF", 98, 83, 70, 76, 94, 72, 97, 95, 4, 0], ["D. ROBINSON", "C", 96, 85, 86, 70, 94, 70, 94, 98, 4, 0]],
  TOR: [["K. LOWRY", "PG", 89, 72, 80, 86, 80, 90, 86, 30, 4, 2], ["V. CARTER", "SG", 93, 78, 92, 86, 98, 86, 70, 55, 4, 0], ["C. BOSH", "PF", 89, 83, 74, 82, 86, 72, 80, 78, 4, 0]],
  UTA: [["J. STOCKTON", "PG", 93, 73, 82, 86, 78, 98, 92, 25, 0, 0], ["A. DANTLEY", "SF", 90, 77, 72, 86, 94, 78, 60, 35, 4, 0], ["K. MALONE", "PF", 96, 81, 80, 78, 96, 70, 86, 66, 4, 2]],
  WAS: [["J. WALL", "PG", 90, 76, 97, 74, 88, 92, 78, 50, 4, 0], ["E. HAYES", "PF", 93, 81, 74, 80, 92, 64, 84, 90, 4, 4], ["W. UNSELD", "C", 91, 79, 62, 52, 84, 66, 90, 76, 4, 0]],
};
// The Hall of Fame league: every team's colours with its legends.
const HOF_TEAMS = TEAMS.map((t, i) => ({ ...t, p: HOF_ROSTERS[t.c], look0: 200 + i * 3, hof: 1 }));
// Quick Play leagues: NBA (today's players) or Hall of Fame (the all-time greats).
const LEAGUES = { nba: { name: "NBA", teams: TEAMS }, hof: { name: "HALL OF FAME", teams: HOF_TEAMS } };
