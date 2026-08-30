import assert from "node:assert";
import {
  buildMatchState,
  setPlayerNameResolver,
  setTeamNameResolver,
  setTeamPlayersResolver,
} from "../src/lib/scoring/engine.js";

console.log("==========================================================");
console.log("TPL 2026 — EXPLICIT BATTER SELECTION / NO AUTO-SELECT TESTS");
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
  id: "test-match-no-autoselect",
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
// TEST 1: Wicket → No New Batter Selected
// ----------------------------------------------------
console.log("[TEST 1: Wicket recorded with NO incoming batter]");
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
      },
      timestamp: 1000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.wickets, 1, "Wickets must be 1");
  assert.strictEqual(inn.strikerId, undefined, "Striker must be undefined (NO auto-select)");
  assert.strictEqual(inn.nonStrikerId, "p-2", "Non-striker must be surviving batter p-2");
  assert.strictEqual(inn.needsBatter, true, "needsBatter must be true");
  assert.strictEqual(inn.missingBatterRole, "striker", "missingBatterRole must be 'striker'");

  console.log("  ✓ Dismissed batter p-1 removed.");
  console.log("  ✓ No incoming batter automatically selected (strikerId = undefined).");
  console.log("  ✓ Surviving batter p-2 retained at non-striker.");
  console.log("  ✓ State: needsBatter = true, missingBatterRole = 'striker'.");
}

// ----------------------------------------------------
// TEST 2: Wicket → Scorer Explicitly Selects Player C (p-3)
// ----------------------------------------------------
console.log("\n[TEST 2: Wicket → Scorer explicitly selects p-3]");
{
  // Step A: Wicket falls
  const deliveriesA = [
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
        type: "Caught",
        batterOutId: "p-1",
        fielderId: "b-2",
      },
      timestamp: 1000,
    },
  ];

  const stateA = buildMatchState({ match, setup, deliveries: deliveriesA });
  assert.strictEqual(stateA.innings[0].needsBatter, true);

  // Step B: Scorer manually selects p-3
  const deliveriesB = [
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
        type: "Caught",
        batterOutId: "p-1",
        fielderId: "b-2",
        newBatterId: "p-3", // Explicitly assigned by scorer
      },
      timestamp: 1000,
    },
  ];

  const stateB = buildMatchState({ match, setup, deliveries: deliveriesB });
  const innB = stateB.innings[0];

  assert.strictEqual(innB.strikerId, "p-3", "Striker must be explicitly selected p-3");
  assert.strictEqual(innB.nonStrikerId, "p-2", "Non-striker must be p-2");
  assert.strictEqual(innB.needsBatter, false, "needsBatter must now be false");

  // Step C: Scoring next ball succeeds
  const deliveriesC = [
    ...deliveriesB,
    {
      id: "d2",
      inningsIndex: 0,
      bowlerId: "b-1",
      strikerId: "p-3",
      nonStrikerId: "p-2",
      batterRuns: 2,
      extraRuns: 0,
      extraType: null,
      timestamp: 2000,
    },
  ];

  const stateC = buildMatchState({ match, setup, deliveries: deliveriesC });
  assert.strictEqual(stateC.innings[0].runs, 2);
  assert.strictEqual(stateC.innings[0].legalBalls, 2);
  assert.strictEqual(stateC.innings[0].strikerId, "p-3");

  console.log("  ✓ Player p-3 explicitly assigned as striker.");
  console.log("  ✓ needsBatter = false, scoring unlocked.");
  console.log("  ✓ Next ball scored: 2 runs off p-3 (Score: 2/1 in 0.2 ov).");
}

// ----------------------------------------------------
// TEST 3: Reload Immediately After Wicket Before Selecting Batter
// ----------------------------------------------------
console.log("\n[TEST 3: Reload immediately after wicket before selecting batter]");
{
  const persistedDeliveriesFromDb = [
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

  const hydratedState = buildMatchState({ match, setup, deliveries: persistedDeliveriesFromDb });
  const inn = hydratedState.innings[0];

  assert.strictEqual(inn.strikerId, undefined, "Reloaded state MUST NOT auto-assign a batter");
  assert.strictEqual(inn.nonStrikerId, "p-2", "Surviving batter p-2 retained");
  assert.strictEqual(inn.needsBatter, true, "needsBatter MUST remain true");
  assert.strictEqual(inn.missingBatterRole, "striker");

  console.log("  ✓ Reloaded match from DB: zero auto-assigned batters.");
  console.log("  ✓ SELECT NEW BATTER action remains available.");
}

// ----------------------------------------------------
// TEST 4: Wicket at Over Boundary (Ball 6)
// ----------------------------------------------------
console.log("\n[TEST 4: Wicket at Over Boundary (Ball 6)]");
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
  // Ball 6: striker p-1 gets out (no auto-selected replacement)
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
    },
    timestamp: 6000,
  });

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.legalBalls, 6, "1.0 over complete");
  assert.strictEqual(inn.needsBowler, true, "needsBowler MUST be true");
  assert.strictEqual(inn.needsBatter, true, "needsBatter MUST be true");

  // Surviving batter p-2 moved to striker for over 2
  assert.strictEqual(inn.strikerId, "p-2", "Surviving batter p-2 is on strike for Over 2");
  assert.strictEqual(inn.nonStrikerId, undefined, "Non-striker position MUST be empty (NO auto-select)");
  assert.strictEqual(inn.missingBatterRole, "non-striker");

  console.log("  ✓ Over 1.0 complete with ball 6 wicket.");
  console.log("  ✓ No auto-assignment: nonStrikerId = undefined.");
  console.log("  ✓ Surviving batter p-2 on strike for Over 2.");
  console.log("  ✓ Both selections required: needsBowler = true, needsBatter = true.");
}

// ----------------------------------------------------
// TEST 5: Multiple Wickets with Explicit Selection
// ----------------------------------------------------
console.log("\n[TEST 5: Multiple Wickets with Explicit Selection]");
{
  // Wicket 1: p-1 out -> scorer explicitly picks p-3
  const d1 = {
    id: "d1",
    inningsIndex: 0,
    bowlerId: "b-1",
    strikerId: "p-1",
    nonStrikerId: "p-2",
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    wicket: { type: "Bowled", batterOutId: "p-1", newBatterId: "p-3" },
    timestamp: 1000,
  };

  // Ball 2: 1 run by p-3 -> strike rotates (p-2 on strike, p-3 non-striker)
  const d2 = {
    id: "d2",
    inningsIndex: 0,
    bowlerId: "b-1",
    strikerId: "p-3",
    nonStrikerId: "p-2",
    batterRuns: 1,
    extraRuns: 0,
    extraType: null,
    timestamp: 2000,
  };

  // Ball 3: Wicket 2! p-2 gets out -> scorer explicitly picks p-4
  const d3 = {
    id: "d3",
    inningsIndex: 0,
    bowlerId: "b-1",
    strikerId: "p-2",
    nonStrikerId: "p-3",
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    wicket: { type: "Caught", batterOutId: "p-2", fielderId: "b-2", newBatterId: "p-4" },
    timestamp: 3000,
  };

  const state = buildMatchState({ match, setup, deliveries: [d1, d2, d3] });
  const inn = state.innings[0];

  assert.strictEqual(inn.wickets, 2, "Wickets must be 2");
  assert.strictEqual(inn.strikerId, "p-4", "Striker must be explicitly chosen p-4");
  assert.strictEqual(inn.nonStrikerId, "p-3", "Non-striker must be p-3");
  assert.strictEqual(inn.needsBatter, false);

  console.log("  ✓ Wicket 1 handled: p-3 explicitly selected.");
  console.log("  ✓ Wicket 2 handled: p-4 explicitly selected.");
  console.log("  ✓ Both batsmen on crease: p-4* (Striker) & p-3 (Non-Striker).");
}

console.log("\n>>> ALL 5 EXPLICIT BATTER SELECTION TESTS PASSED 100%!");
