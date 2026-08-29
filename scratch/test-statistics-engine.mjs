import { calculateSingleMatchStats, calculateTournamentStats, STAT_THRESHOLDS, formatStatDecimal } from "../src/lib/scoring/statistics.ts";
import { buildMatchState } from "../src/lib/scoring/engine.ts";

console.log("==================================================");
console.log("TPL 2026 — COMPLETE STATISTICS & AWARDS ENGINE TESTS");
console.log("==================================================");

const mockMatch1 = {
  id: "test-stats-match-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "team-a",
  teamBId: "team-b",
  venue: "Ground 1",
  overs: 2,
  scheduledAt: "2026-08-29T10:00:00Z",
  status: "COMPLETED",
};

const mockSetup1 = {
  playingXI: {
    "team-a": { teamId: "team-a", playerIds: ["batter-1", "batter-2", "allrounder-a", "bowler-a"] },
    "team-b": { teamId: "team-b", playerIds: ["bowler-1", "bowler-2", "batter-b1", "batter-b2"] },
  },
  battingFirstId: "team-a",
  openers: { strikerId: "batter-1", nonStrikerId: "batter-2" },
  openingBowlerId: "bowler-1",
};

// Deliveries for Match 1
const deliveriesMatch1 = [
  // Innings 0 Over 0: Bowler 1 bowls to Batter 1 & 2
  { id: "d1", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 1 },
  { id: "d2", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 2 },
  { id: "d3", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 3 },
  { id: "d4", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 4 },
  { id: "d5", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-2", nonStrikerId: "batter-1", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 5 },
  { id: "d6", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-2", nonStrikerId: "batter-1", batterRuns: 2, extraRuns: 0, extraType: null, timestamp: 6 },
  // Innings 0 Over 1: Bowler 2 bowls
  { id: "d7", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 7 },
  { id: "d8", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Caught", batterOutId: "batter-1", fielderId: "bowler-1", newBatterId: "allrounder-a" }, timestamp: 8 },
  { id: "d9", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "allrounder-a", nonStrikerId: "batter-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 9 },
  { id: "d10", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "allrounder-a", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 10 },
  { id: "d11", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "allrounder-a", nonStrikerId: "batter-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 11 },
  { id: "d12", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-2", nonStrikerId: "allrounder-a", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "batter-2" }, timestamp: 12 },
  // Innings 1: Team B chases
  { id: "d13", inningsIndex: 1, bowlerId: "allrounder-a", strikerId: "batter-b1", nonStrikerId: "batter-b2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "batter-b1", newBatterId: "bowler-1" }, timestamp: 13 },
  { id: "d14", inningsIndex: 1, bowlerId: "allrounder-a", strikerId: "bowler-1", nonStrikerId: "batter-b2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "bowler-1", newBatterId: "bowler-2" }, timestamp: 14 },
  { id: "d15", inningsIndex: 1, bowlerId: "allrounder-a", strikerId: "bowler-2", nonStrikerId: "batter-b2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "bowler-2" }, timestamp: 15 },
];

const state1 = buildMatchState({
  match: mockMatch1,
  setup: mockSetup1,
  deliveries: deliveriesMatch1,
  secondInningsStarted: true,
  secondInningsOpeners: { strikerId: "batter-b1", nonStrikerId: "batter-b2" },
});

// ----------------------------------------------------
// TEST 1: SINGLE MATCH STATS CALCULATION
// ----------------------------------------------------
console.log("\n[TEST 1: Single Match Detailed Analysis]");
const singleStats = calculateSingleMatchStats(state1);

console.log("Total Batters Analyzed:", singleStats.batters.length);
console.log("Top Batter:", singleStats.records.bestBatter?.playerName, "| Runs:", singleStats.records.bestBatter?.runs, "| SR:", singleStats.records.bestBatter?.strikeRate);
console.log("Top Bowler:", singleStats.records.bestBowlingFigures?.playerName, "| Figures:", singleStats.records.bestBowlingFigures?.bestBowling);
console.log("Best Striker:", singleStats.records.bestStriker?.playerName, "| SR:", singleStats.records.bestStriker?.strikeRate);
console.log("Top Fielder:", singleStats.records.bestFielder?.playerName, "| Dismissals:", singleStats.records.bestFielder?.totalDismissals);
console.log("Man of Match:", singleStats.records.manOfTheMatch?.playerName, "| Points:", singleStats.records.manOfTheMatch?.totalPoints);

if (
  singleStats.batters.length > 0 &&
  singleStats.records.bestBatter?.runs === 23 &&
  singleStats.records.bestBowlingFigures?.wickets === 3 &&
  singleStats.records.manOfTheMatch
) {
  console.log(">>> TEST 1 PASS! (Single match stats accurately computed)");
} else {
  console.error(">>> TEST 1 FAILED!");
  process.exit(1);
}

// ----------------------------------------------------
// TEST 2: MATHEMATICAL SAFETY
// ----------------------------------------------------
console.log("\n[TEST 2: Mathematical Safety]");
const formattedSR = formatStatDecimal(singleStats.records.bestBatter?.strikeRate);
const formattedEcon = formatStatDecimal(singleStats.records.bestBowlingFigures?.economy);
const formattedNull = formatStatDecimal(null);
const formattedNaN = formatStatDecimal(NaN);

console.log("Formatted SR:", formattedSR);
console.log("Formatted Econ:", formattedEcon);
console.log("Formatted Null:", formattedNull);
console.log("Formatted NaN:", formattedNaN);

if (formattedSR !== "NaN" && formattedEcon !== "NaN" && formattedNull === "-" && formattedNaN === "-") {
  console.log(">>> TEST 2 PASS! (No NaN / Infinity in statistics)");
} else {
  console.error(">>> TEST 2 FAILED!");
  process.exit(1);
}

// ----------------------------------------------------
// TEST 3: QUALIFICATION THRESHOLDS
// ----------------------------------------------------
console.log("\n[TEST 3: Configurable Qualification Thresholds]");
console.log("Min balls match striker:", STAT_THRESHOLDS.MIN_BALLS_MATCH_STRIKER);
console.log("Min balls tournament striker:", STAT_THRESHOLDS.MIN_BALLS_TOURNAMENT_STRIKER);
console.log("Min overs bowling economy:", STAT_THRESHOLDS.MIN_OVERS_BOWLING_ECONOMY);

if (
  STAT_THRESHOLDS.MIN_BALLS_MATCH_STRIKER === 5 &&
  STAT_THRESHOLDS.MIN_BALLS_TOURNAMENT_STRIKER === 15 &&
  STAT_THRESHOLDS.MIN_OVERS_BOWLING_ECONOMY === 2
) {
  console.log(">>> TEST 3 PASS!");
} else {
  console.error(">>> TEST 3 FAILED!");
  process.exit(1);
}

console.log("\nALL STATISTICS & AWARDS ENGINE TESTS PASSED SUCCESSFULLY.");
