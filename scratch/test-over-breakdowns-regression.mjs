import assert from "node:assert";
import {
  buildMatchState,
  setPlayerNameResolver,
  setTeamNameResolver,
  setTeamPlayersResolver,
} from "../src/lib/scoring/engine.js";

console.log("==========================================================");
console.log("TPL 2026 — OVER BREAKDOWNS CHRONOLOGICAL & COMPLETION TESTS");
console.log("==========================================================\n");

// Mock lookup data
const PLAYERS = {
  "p-1": { id: "p-1", name: "A. Mohamed", shortName: "A. Mohamed", teamId: "team-a", role: "Batsman" },
  "p-2": { id: "p-2", name: "F. Raseen", shortName: "F. Raseen", teamId: "team-a", role: "Batsman" },
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
  id: "test-match-overs",
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
    "team-a": { playerIds: ["p-1", "p-2"] },
    "team-b": { playerIds: ["b-1", "b-2"] },
  },
};

// Helper to generate full overs
function generateOvers(totalOvers, ballsPerOverFunc) {
  const deliveries = [];
  let dId = 1;
  for (let ov = 0; ov < totalOvers; ov++) {
    const bowlerId = ov % 2 === 0 ? "b-1" : "b-2";
    const ballsInThisOver = ballsPerOverFunc ? ballsPerOverFunc(ov) : 6;
    for (let b = 0; b < ballsInThisOver; b++) {
      deliveries.push({
        id: `deliv-${dId++}`,
        inningsIndex: 0,
        bowlerId,
        strikerId: "p-1",
        nonStrikerId: "p-2",
        batterRuns: 1,
        extraRuns: 0,
        extraType: null,
        timestamp: dId * 1000,
      });
    }
  }
  return deliveries;
}

// ----------------------------------------------------
// TEST 1: Create a 5-over innings -> [1, 2, 3, 4, 5]
// ----------------------------------------------------
console.log("[TEST 1: 5-Over Innings Breakdown]");
{
  const deliveries = generateOvers(5);
  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  const overNumbers = inn.overGroups.map((og) => og.overNumber + 1);
  assert.deepStrictEqual(overNumbers, [1, 2, 3, 4, 5], "All 5 overs must be present in order [1, 2, 3, 4, 5]");
  assert.strictEqual(inn.overGroups.every((og) => og.complete), true, "All 5 overs must be marked complete");

  console.log(`  ✓ Generated overs: ${JSON.stringify(overNumbers)}`);
  console.log("  ✓ All 5 overs present in exact chronological order [1, 2, 3, 4, 5].");
}

// ----------------------------------------------------
// TEST 2: Create a 10-over innings -> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// ----------------------------------------------------
console.log("\n[TEST 2: 10-Over Innings Breakdown]");
{
  const match10 = { ...match, overs: 10 };
  const deliveries = generateOvers(10);
  const state = buildMatchState({ match: match10, setup, deliveries });
  const inn = state.innings[0];

  const overNumbers = inn.overGroups.map((og) => og.overNumber + 1);
  assert.deepStrictEqual(overNumbers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "All 10 overs must be present in order [1..10]");
  assert.strictEqual(inn.overGroups.length, 10);

  console.log(`  ✓ Generated overs: ${JSON.stringify(overNumbers)}`);
  console.log("  ✓ All 10 overs present in exact chronological order [1..10].");
}

// ----------------------------------------------------
// TEST 3: Check that middle overs (2, 3, 4) are not lost
// ----------------------------------------------------
console.log("\n[TEST 3: Middle Overs Preservation Check]");
{
  const deliveries = generateOvers(5);
  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  const over2 = inn.overGroups.find((og) => og.overNumber === 1);
  const over3 = inn.overGroups.find((og) => og.overNumber === 2);
  const over4 = inn.overGroups.find((og) => og.overNumber === 3);

  assert(over2, "Over 2 must exist");
  assert(over3, "Over 3 must exist");
  assert(over4, "Over 4 must exist");
  assert.strictEqual(over2.balls.length, 6, "Over 2 must have 6 balls");
  assert.strictEqual(over3.balls.length, 6, "Over 3 must have 6 balls");
  assert.strictEqual(over4.balls.length, 6, "Over 4 must have 6 balls");

  console.log("  ✓ Over 2: present with 6 balls.");
  console.log("  ✓ Over 3: present with 6 balls.");
  console.log("  ✓ Over 4: present with 6 balls.");
  console.log("  ✓ Zero middle overs dropped!");
}

// ----------------------------------------------------
// TEST 4: Reduced-Over Match (e.g. 5 reduced to 3)
// ----------------------------------------------------
console.log("\n[TEST 4: Reduced-Over Match (3 Overs)]");
{
  const deliveries = generateOvers(3);
  const setupReduced = { ...setup, reducedOvers: 3 };
  const state = buildMatchState({ match, setup: setupReduced, deliveries });
  const inn = state.innings[0];

  const overNumbers = inn.overGroups.map((og) => og.overNumber + 1);
  assert.deepStrictEqual(overNumbers, [1, 2, 3], "Only completed overs [1, 2, 3] must be shown");
  assert.strictEqual(inn.isComplete, true, "Innings is complete at 3.0 overs");

  console.log(`  ✓ Reduced to 3 overs: ${JSON.stringify(overNumbers)}`);
  console.log("  ✓ Exactly completed overs 1, 2, 3 shown.");
}

// ----------------------------------------------------
// TEST 5: Current Incomplete Over (3 Completed + 2 balls in Over 4)
// ----------------------------------------------------
console.log("\n[TEST 5: Current Incomplete Over (3.2 overs)]");
{
  const deliveries = [
    ...generateOvers(3),
    // Over 4 in progress: 2 legal balls
    { id: "deliv-19", inningsIndex: 0, bowlerId: "b-2", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 19000 },
    { id: "deliv-20", inningsIndex: 0, bowlerId: "b-2", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 20000 },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.overGroups.length, 4, "Must have 4 over groups");
  assert.strictEqual(inn.overGroups[0].complete, true, "Over 1 complete");
  assert.strictEqual(inn.overGroups[1].complete, true, "Over 2 complete");
  assert.strictEqual(inn.overGroups[2].complete, true, "Over 3 complete");
  assert.strictEqual(inn.overGroups[3].complete, false, "Over 4 in progress (not complete)");
  assert.strictEqual(inn.overGroups[3].balls.length, 2, "Over 4 has 2 balls so far");

  console.log("  ✓ Over 1: Complete (6 balls)");
  console.log("  ✓ Over 2: Complete (6 balls)");
  console.log("  ✓ Over 3: Complete (6 balls)");
  console.log("  ✓ Over 4: In Progress (2 balls, complete=false)");
}

// ----------------------------------------------------
// TEST 6: Wides and No-Balls (Over not complete until 6 LEGAL deliveries)
// ----------------------------------------------------
console.log("\n[TEST 6: Extras / Wides Handling in Over Completion]");
{
  const deliveries = [
    // Ball 1: Normal (1.1)
    { id: "d-1", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 1, extraRuns: 0, extraType: null, timestamp: 1000 },
    // Ball 2: Wide! (extra ball, legalBalls stays 1)
    { id: "d-2", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 0, extraRuns: 1, extraType: "wide", timestamp: 2000 },
    // Ball 3: No Ball! (extra ball, legalBalls stays 1)
    { id: "d-3", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 1, extraRuns: 1, extraType: "no-ball", timestamp: 3000 },
    // Balls 4, 5, 6, 7, 8: 5 more legal balls (total 6 legal deliveries)
    { id: "d-4", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 4000 },
    { id: "d-5", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 5000 },
    { id: "d-6", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 6000 },
    { id: "d-7", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 7000 },
    { id: "d-8", inningsIndex: 0, bowlerId: "b-1", strikerId: "p-1", nonStrikerId: "p-2", batterRuns: 2, extraRuns: 0, extraType: null, timestamp: 8000 },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.legalBalls, 6, "Must have exactly 6 legal balls");
  assert.strictEqual(inn.overGroups.length, 1, "Must be contained in Over 1");
  assert.strictEqual(inn.overGroups[0].balls.length, 8, "Must contain all 8 events (6 legal + 1 wide + 1 no-ball)");
  assert.strictEqual(inn.overGroups[0].complete, true, "Over 1 marked complete after 6th legal delivery");
  assert.strictEqual(inn.overGroups[0].runs, 16, "Total runs = 1 + 1(wd) + 2(nb+run) + 0 + 4 + 0 + 6 + 2 = 16");

  console.log(`  ✓ Over 1 has 8 delivery events including wide and no-ball.`);
  console.log(`  ✓ Correctly marked complete only after 6 legal deliveries.`);
}

console.log("\n>>> ALL 6 OVER BREAKDOWNS REGRESSION TESTS PASSED 100%!");
