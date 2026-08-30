import assert from "node:assert";
import {
  buildMatchState,
  setPlayerNameResolver,
  setTeamNameResolver,
  setTeamPlayersResolver,
} from "../src/lib/scoring/engine.js";

console.log("==========================================================");
console.log("TPL 2026 — CURRENT BATTERS DISPLAY & POST-WICKET REGRESSION");
console.log("==========================================================\n");

// Mock lookup data
const PLAYERS = {
  // Team A (Batting)
  "p-1": { id: "p-1", name: "A. Mohamed", shortName: "A. Mohamed", teamId: "team-a", role: "Batsman" },
  "p-2": { id: "p-2", name: "F. Raseen", shortName: "F. Raseen", teamId: "team-a", role: "Batsman" },
  "p-3": { id: "p-3", name: "C. Tariq", shortName: "C. Tariq", teamId: "team-a", role: "All-Rounder" },
  "p-4": { id: "p-4", name: "D. Zayd", shortName: "D. Zayd", teamId: "team-a", role: "Batsman" },
  "p-5": { id: "p-5", name: "E. Bilal", shortName: "E. Bilal", teamId: "team-a", role: "Bowler" },

  // Team B (Bowling)
  "b-1": { id: "b-1", name: "X. Imran", shortName: "X. Imran", teamId: "team-b", role: "Bowler" },
  "b-2": { id: "b-2", name: "Y. Farhan", shortName: "Y. Farhan", teamId: "team-b", role: "Bowler" },
};

const TEAMS = {
  "team-a": { id: "team-a", name: "Thunderbolts", shortName: "TB" },
  "team-b": { id: "team-b", name: "Strikers", shortName: "STR" },
};

setTeamNameResolver((id) => TEAMS[id]?.name ?? id);
setPlayerNameResolver((id) => PLAYERS[id]?.name ?? id);
setTeamPlayersResolver((teamId) =>
  Object.values(PLAYERS)
    .filter((p) => p.teamId === teamId)
    .map((p) => p.id),
);

const match = {
  id: "test-match-reg",
  matchNumber: 1,
  teamAId: "team-a",
  teamBId: "team-b",
  overs: 5,
  status: "LIVE",
};

const setup = {
  battingFirstId: "team-a",
  openers: { strikerId: "p-1", nonStrikerId: "p-2" },
  openingBowlerId: "b-1",
  playingXI: {
    "team-a": { playerIds: ["p-1", "p-2", "p-3", "p-4", "p-5"] },
    "team-b": { playerIds: ["b-1", "b-2"] },
  },
};

// ----------------------------------------------------
// REGRESSION 1: 2 Active Batsmen After Normal Scoring
// ----------------------------------------------------
console.log("[REGRESSION 1: 2 Active Batsmen After Normal Scoring]");
{
  const deliveries = [
    // 0.1: 1 run -> strike rotates
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-1",
      nonStrikerId: "p-2",
      batterRuns: 1,
      extraRuns: 0,
      extraType: null,
      timestamp: 1000,
    },
    // 0.2: 4 runs by p-2
    {
      id: "d2",
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-2",
      nonStrikerId: "p-1",
      batterRuns: 4,
      extraRuns: 0,
      extraType: null,
      timestamp: 2000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.strikerId, "p-2", "Striker must be p-2");
  assert.strictEqual(inn.nonStrikerId, "p-1", "Non-Striker must be p-1");
  assert.strictEqual(inn.needsBatter, false, "needsBatter must be false");

  // Verify both batters exist in batters list
  const strikerStat = inn.batters.find((b) => b.playerId === inn.strikerId);
  const nonStrikerStat = inn.batters.find((b) => b.playerId === inn.nonStrikerId);
  assert(strikerStat, "Striker stat must exist");
  assert(nonStrikerStat, "Non-striker stat must exist");
  assert.strictEqual(strikerStat.runs, 4);
  assert.strictEqual(nonStrikerStat.runs, 1);

  console.log("  ✓ Score: 5/0 (0.2 ov). Active: p-2* (4) & p-1 (1).");
}

// ----------------------------------------------------
// REGRESSION 2: Striker Wicket + New Batter
// ----------------------------------------------------
console.log("\n[REGRESSION 2: Striker Wicket + New Batter Replacement]");
{
  const deliveries = [
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-1",
      nonStrikerId: "p-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: {
        type: "Bowled",
        batterOutId: "p-1",
        newBatterId: "p-3",
      },
      timestamp: 1000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.wickets, 1);
  assert.strictEqual(inn.strikerId, "p-3", "Striker must be replaced by new batter p-3");
  assert.strictEqual(inn.nonStrikerId, "p-2", "Surviving batter p-2 must stay at non-striker");
  assert.strictEqual(inn.needsBatter, false);

  const strikerStat = inn.batters.find((b) => b.playerId === "p-3");
  const nonStrikerStat = inn.batters.find((b) => b.playerId === "p-2");
  assert(strikerStat, "New striker p-3 must have batter stat");
  assert(nonStrikerStat, "Non-striker p-2 must have batter stat");

  console.log("  ✓ Striker p-1 dismissed. New active pair: p-3* (0) & p-2 (0).");
}

// ----------------------------------------------------
// REGRESSION 3: Non-Striker Wicket + New Batter
// ----------------------------------------------------
console.log("\n[REGRESSION 3: Non-Striker Wicket (Run Out) + New Batter]");
{
  const deliveries = [
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-1",
      nonStrikerId: "p-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: {
        type: "Run Out",
        batterOutId: "p-2",
        fielderId: "b-2",
        newBatterId: "p-4",
      },
      timestamp: 1000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.wickets, 1);
  assert.strictEqual(inn.strikerId, "p-1", "Striker p-1 must remain on strike");
  assert.strictEqual(inn.nonStrikerId, "p-4", "Dismissed non-striker p-2 must be replaced by p-4");
  assert.strictEqual(inn.needsBatter, false);

  console.log("  ✓ Non-striker p-2 run out. New active pair: p-1* (0) & p-4 (0).");
}

// ----------------------------------------------------
// REGRESSION 4: Wicket on Final Legal Ball of Over (Ball 6)
// ----------------------------------------------------
console.log("\n[REGRESSION 4: Wicket on Over Boundary (Ball 6) Strike Rotation]");
{
  const deliveries = [];
  for (let i = 1; i <= 5; i++) {
    deliveries.push({
      id: `d${i}`,
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-1",
      nonStrikerId: "p-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      timestamp: 1000 * i,
    });
  }
  // Ball 6: Striker p-1 gets out, new batter is p-3
  deliveries.push({
    id: "d6",
    inningsIndex: 0,
    bowlerId: "b-1",
    strikerId: "p-1",
    nonStrikerId: "p-2",
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    wicket: {
      type: "Bowled",
      batterOutId: "p-1",
      newBatterId: "p-3",
    },
    timestamp: 6000,
  });

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.legalBalls, 6);
  assert.strictEqual(inn.oversText, "1.0");
  assert.strictEqual(inn.needsBowler, true);
  assert.strictEqual(inn.needsBatter, false);

  // At over boundary, surviving batter p-2 moves to striker end for Over 2
  // Incoming batter p-3 is placed at non-striker end
  assert.strictEqual(inn.strikerId, "p-2", "Surviving batter p-2 must take strike for Over 2");
  assert.strictEqual(inn.nonStrikerId, "p-3", "Incoming batter p-3 must be at non-striker end");

  console.log("  ✓ Over 1.0 complete. Strike rotated: p-2* (Striker) & p-3 (Non-Striker).");
}

// ----------------------------------------------------
// REGRESSION 5: Page Reload After Wicket (State Recovery)
// ----------------------------------------------------
console.log("\n[REGRESSION 5: Page Reload Recovery After Wicket]");
{
  // Wicket recorded without newBatterId (e.g. from DB load)
  const deliveries = [
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-1",
      nonStrikerId: "p-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: {
        type: "Bowled",
        batterOutId: "p-1",
      },
      timestamp: 1000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.strikerId, undefined, "Striker slot is empty awaiting selection");
  assert.strictEqual(inn.nonStrikerId, "p-2", "Surviving batter p-2 is preserved at non-striker");
  assert.strictEqual(inn.needsBatter, true);
  assert.strictEqual(inn.missingBatterRole, "striker");

  console.log("  ✓ Surviving batter p-2 (F. Raseen) preserved at non-striker.");
  console.log("  ✓ Striker slot clearly identified as missing: needsBatter=true, role=striker.");
}

// ----------------------------------------------------
// REGRESSION 6: Scorer Resume at 16/2 (Exact Production Scenario)
// ----------------------------------------------------
console.log("\n[REGRESSION 6: Scorer Resume at 16/2 Scenario]");
{
  const deliveries = [
    // Over 1 (6 balls, score reaches 9/2)
    { id: "b1", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 1000 },
    { id: "b2", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "p-1", newBatterId: "p-3" }, timestamp: 2000 },
    { id: "b3", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-3", nonStrikerId: "p-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 3000 },
    { id: "b4", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-2", nonStrikerId: "p-3", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 4000 },
    { id: "b5", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-2", nonStrikerId: "p-3", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Caught", batterOutId: "p-3", fielderId: "b-2", newBatterId: "p-4" }, timestamp: 5000 },
    { id: "b6", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-2", nonStrikerId: "p-4", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 6000 },

    // Over 2 (score reaches 16/2 at 1.4 overs)
    { id: "b7", inningsIndex: 0, bowlerId: "b-2", strikerId: "p-4", nonStrikerId: "p-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 7000 },
    { id: "b8", inningsIndex: 0, bowlerId: "b-2", strikerId: "p-2", nonStrikerId: "p-4", batterRuns: 2, extraRuns: 0, extraType: null, timestamp: 8000 },
    { id: "b9", inningsIndex: 0, bowlerId: "b-2", strikerId: "p-2", nonStrikerId: "p-4", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 9000 },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.runs, 16, "Runs should be 16");
  assert.strictEqual(inn.wickets, 2, "Wickets should be 2");
  assert.strictEqual(inn.oversText, "1.3", "Overs should be 1.3");

  // Active pair: p-2 on strike (scored 4 on last ball, no run rotation)
  // p-4 at non-striker end
  assert.strictEqual(inn.strikerId, "p-2", "Striker must be p-2 (F. Raseen)");
  assert.strictEqual(inn.nonStrikerId, "p-4", "Non-Striker must be p-4 (D. Zayd)");
  assert.strictEqual(inn.needsBatter, false, "needsBatter must be false");

  // Verify both batters are present in batters list
  const strikerStat = inn.batters.find((b) => b.playerId === inn.strikerId);
  const nonStrikerStat = inn.batters.find((b) => b.playerId === inn.nonStrikerId);
  assert(strikerStat, "Striker stat for p-2 must exist");
  assert(nonStrikerStat, "Non-striker stat for p-4 must exist");
  assert.strictEqual(strikerStat.runs, 10);
  assert.strictEqual(nonStrikerStat.runs, 1);

  console.log("  ✓ Match at 16/2 (1.3 ov): Exactly TWO active batsmen resolved.");
  console.log(`  ✓ Striker: ${PLAYERS[inn.strikerId].name} (${strikerStat.runs} runs)`);
  console.log(`  ✓ Non-Striker: ${PLAYERS[inn.nonStrikerId].name} (${nonStrikerStat.runs} runs)`);
  console.log("  ✓ Both cards will be rendered simultaneously in CURRENT BATTERS.");
}

console.log("\n>>> ALL 6 REGRESSION TEST SUITES PASSED 100%!");
