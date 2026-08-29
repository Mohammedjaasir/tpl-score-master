import { calculateMatchMVP, formatMOTMPerformanceSummary } from "../src/lib/scoring/playerPerformance.ts";
import { buildMatchState } from "../src/lib/scoring/engine.ts";

console.log("==================================================");
console.log("TPL 2026 — AUTOMATIC MAN OF THE MATCH TESTS");
console.log("==================================================");

// ----------------------------------------------------
// TEST 1: BATTER WIN
// Batter 1 scores 32 runs (2x4, 4x6) in 6 balls
// ----------------------------------------------------
const mockMatch1 = {
  id: "test-match-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "team-a",
  teamBId: "team-b",
  venue: "Ground",
  overs: 1,
  scheduledAt: "2026-08-29T10:00:00Z",
  status: "COMPLETED",
};

const mockSetup1 = {
  playingXI: {
    "team-a": { teamId: "team-a", playerIds: ["batter-1", "batter-2", "allrounder", "bowler-a"] },
    "team-b": { teamId: "team-b", playerIds: ["bowler-1", "bowler-2", "batter-b1", "batter-b2"] },
  },
  battingFirstId: "team-a",
  openers: { strikerId: "batter-1", nonStrikerId: "batter-2" },
  openingBowlerId: "bowler-1",
};

const deliveries1 = [
  { id: "b1", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 1 },
  { id: "b2", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 2 },
  { id: "b3", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 3 },
  { id: "b4", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 4 },
  { id: "b5", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 5 },
  { id: "b6", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 6 },
];

const state1 = buildMatchState({ match: mockMatch1, setup: mockSetup1, deliveries: deliveries1 });
const mvp1 = calculateMatchMVP(state1);

console.log("\n[TEST 1: Batter Dominated Performance]");
console.log("Top Performer (Rank #1):", mvp1[0]?.playerName, "| Points:", mvp1[0]?.totalPoints);
console.log("Performance Summary:", mvp1[0]?.performanceSummary);

if (mvp1[0]?.playerId === "batter-1" && mvp1[0].totalPoints > 40) {
  console.log(">>> TEST 1 PASS! (Batter wins MOTM)");
} else {
  console.error(">>> TEST 1 FAILED!");
  process.exit(1);
}

// ----------------------------------------------------
// TEST 2: BOWLER WIN
// Bowler 2 takes 3 wickets for 3 runs in 1 over
// ----------------------------------------------------
const deliveries2 = [
  { id: "w1", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "batter-1", newBatterId: "allrounder" }, timestamp: 10 },
  { id: "w2", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "allrounder", newBatterId: "bowler-a" }, timestamp: 11 },
  { id: "w3", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "bowler-a", nonStrikerId: "batter-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "bowler-a" }, timestamp: 12 },
  { id: "w4", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-2", nonStrikerId: "batter-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 13 },
  { id: "w5", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-2", nonStrikerId: "batter-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 14 },
  { id: "w6", inningsIndex: 0, bowlerId: "bowler-2", strikerId: "batter-2", nonStrikerId: "batter-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 15 },
];

const state2 = buildMatchState({ match: mockMatch1, setup: mockSetup1, deliveries: deliveries2 });
const mvp2 = calculateMatchMVP(state2);

console.log("\n[TEST 2: Bowler Dominated Performance]");
console.log("Top Performer (Rank #1):", mvp2[0]?.playerName, "| Points:", mvp2[0]?.totalPoints);
console.log("Performance Summary:", mvp2[0]?.performanceSummary);

if (mvp2[0]?.playerId === "bowler-2" && mvp2[0]?.breakdown.wickets === 3) {
  console.log(">>> TEST 2 PASS! (Bowler wins MOTM with 3-wicket haul & low economy)");
} else {
  console.error(">>> TEST 2 FAILED!");
  process.exit(1);
}

// ----------------------------------------------------
// TEST 3: ALL-ROUNDER WIN
// Allrounder scores 36 runs (6b) in Innings 0 + takes 2 wickets for 0 runs in Innings 1
// ----------------------------------------------------
const mockMatch3 = {
  id: "test-match-3",
  tournament: "TPL 2026",
  matchNumber: 3,
  teamAId: "team-a",
  teamBId: "team-b",
  venue: "Ground",
  overs: 1,
  scheduledAt: "2026-08-29T10:00:00Z",
  status: "COMPLETED",
};

const mockSetup3 = {
  playingXI: {
    "team-a": { teamId: "team-a", playerIds: ["allrounder", "batter-2", "batter-1", "bowler-a"] },
    "team-b": { teamId: "team-b", playerIds: ["bowler-1", "bowler-2", "batter-b1", "batter-b2"] },
  },
  battingFirstId: "team-a",
  openers: { strikerId: "allrounder", nonStrikerId: "batter-2" },
  openingBowlerId: "bowler-1",
};

const deliveries3 = [
  // Innings 0: Allrounder scores 36 (6 balls = completes 1 over)
  { id: "ar1", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 20 },
  { id: "ar2", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 21 },
  { id: "ar3", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 22 },
  { id: "ar4", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 23 },
  { id: "ar5", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 24 },
  { id: "ar6", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "allrounder", nonStrikerId: "batter-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 25 },
  // Innings 1: Allrounder bowls and takes 2 wickets
  { id: "ar7", inningsIndex: 1, bowlerId: "allrounder", strikerId: "batter-b1", nonStrikerId: "batter-b2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "batter-b1", newBatterId: "bowler-1" }, timestamp: 26 },
  { id: "ar8", inningsIndex: 1, bowlerId: "allrounder", strikerId: "bowler-1", nonStrikerId: "batter-b2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "bowler-1" }, timestamp: 27 },
];

const state3 = buildMatchState({
  match: mockMatch3,
  setup: mockSetup3,
  deliveries: deliveries3,
  secondInningsStarted: true,
  secondInningsOpeners: { strikerId: "batter-b1", nonStrikerId: "batter-b2" },
});
const mvp3 = calculateMatchMVP(state3);

console.log("\n[TEST 3: All-Rounder Dual Impact Performance]");
console.log("Top Performer (Rank #1):", mvp3[0]?.playerName, "| Points:", mvp3[0]?.totalPoints);
console.log("Performance Summary:", mvp3[0]?.performanceSummary);

if (mvp3[0]?.playerId === "allrounder" && mvp3[0]?.breakdown.runs === 36 && mvp3[0]?.breakdown.wickets === 2) {
  console.log(">>> TEST 3 PASS! (All-Rounder wins MOTM with bat + ball contribution)");
} else {
  console.error(">>> TEST 3 FAILED!");
  process.exit(1);
}

// ----------------------------------------------------
// TEST 4: FIELDING IMPACT
// ----------------------------------------------------
const deliveries4 = [
  { id: "f1", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-1", nonStrikerId: "batter-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Caught", batterOutId: "batter-1", fielderId: "bowler-2" }, timestamp: 30 },
  { id: "f2", inningsIndex: 0, bowlerId: "bowler-1", strikerId: "batter-2", nonStrikerId: "allrounder", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Caught", batterOutId: "batter-2", fielderId: "bowler-2" }, timestamp: 31 },
];
const state4 = buildMatchState({ match: mockMatch1, setup: mockSetup1, deliveries: deliveries4 });
const mvp4 = calculateMatchMVP(state4);
const fielderEntry = mvp4.find(p => p.playerId === "bowler-2");

console.log("\n[TEST 4: Fielding Points Verification]");
console.log("Fielder Catches:", fielderEntry?.breakdown.catches, "| Fielding Points:", fielderEntry?.breakdown.fieldingPoints);
if (fielderEntry?.breakdown.catches === 2 && fielderEntry.breakdown.fieldingPoints === 20) {
  console.log(">>> TEST 4 PASS!");
} else {
  console.error(">>> TEST 4 FAILED!");
  process.exit(1);
}

// ----------------------------------------------------
// TEST 5: DETERMINISTIC TIE-BREAKING
// ----------------------------------------------------
console.log("\n[TEST 5: Deterministic Tie-Breaking]");
const tiedRun1 = calculateMatchMVP(state3);
const tiedRun2 = calculateMatchMVP(state3);
const orderMatch = tiedRun1.every((p, idx) => p.playerId === tiedRun2[idx].playerId && p.totalPoints === tiedRun2[idx].totalPoints);
console.log("Deterministic Run 1 vs Run 2 identical:", orderMatch);

if (orderMatch) {
  console.log(">>> TEST 5 PASS! (100% deterministic ranking)");
} else {
  console.error(">>> TEST 5 FAILED!");
  process.exit(1);
}

console.log("\nALL AUTOMATIC MAN OF THE MATCH ENGINE TESTS PASSED SUCCESSFULLY.");
