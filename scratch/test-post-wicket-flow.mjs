import assert from "node:assert";
import {
  buildMatchState,
  setPlayerNameResolver,
  setTeamNameResolver,
  setTeamPlayersResolver,
} from "../src/lib/scoring/engine.js";

console.log("==================================================");
console.log("TPL 2026 — POST-WICKET FLOW & CONTINUATION TESTS");
console.log("==================================================\n");

// Mock lookup data
const PLAYERS = {
  // Team A (Batting)
  "bat-1": { id: "bat-1", name: "A. Mohamed", shortName: "A. Mohamed", teamId: "team-a", role: "Batsman" },
  "bat-2": { id: "bat-2", name: "B. Hassan", shortName: "B. Hassan", teamId: "team-a", role: "Batsman" },
  "bat-3": { id: "bat-3", name: "C. Tariq", shortName: "C. Tariq", teamId: "team-a", role: "All-Rounder" },
  "bat-4": { id: "bat-4", name: "D. Zayd", shortName: "D. Zayd", teamId: "team-a", role: "Batsman" },
  "bat-5": { id: "bat-5", name: "E. Bilal", shortName: "E. Bilal", teamId: "team-a", role: "Bowler" },

  // Team B (Bowling)
  "bowl-1": { id: "bowl-1", name: "X. Imran", shortName: "X. Imran", teamId: "team-b", role: "Bowler" },
  "bowl-2": { id: "bowl-2", name: "Y. Farhan", shortName: "Y. Farhan", teamId: "team-b", role: "Bowler" },
  "bowl-3": { id: "bowl-3", name: "Z. Usman", shortName: "Z. Usman", teamId: "team-b", role: "Bowler" },
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
  id: "test-match-1",
  matchNumber: 1,
  teamAId: "team-a",
  teamBId: "team-b",
  overs: 5,
  status: "LIVE",
};

const setup = {
  battingFirstId: "team-a",
  openers: { strikerId: "bat-1", nonStrikerId: "bat-2" },
  openingBowlerId: "bowl-1",
  playingXI: {
    "team-a": { playerIds: ["bat-1", "bat-2", "bat-3", "bat-4", "bat-5"] },
    "team-b": { playerIds: ["bowl-1", "bowl-2", "bowl-3"] },
  },
};

// ----------------------------------------------------
// TEST CASE 1: Normal Wicket During Over
// ----------------------------------------------------
console.log("[TEST CASE 1: Normal Wicket During Over]");
{
  const deliveries = [
    // Ball 0.1: 1 run (bat-1 to non-striker, bat-2 on strike)
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-1",
      nonStrikerId: "bat-2",
      batterRuns: 1,
      extraRuns: 0,
      extraType: null,
      timestamp: 1000,
    },
    // Ball 0.2: Wicket! (bat-2 is out, newBatterId provided as bat-3)
    {
      id: "d2",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-2",
      nonStrikerId: "bat-1",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: {
        type: "Caught",
        batterOutId: "bat-2",
        fielderId: "bowl-2",
        newBatterId: "bat-3",
      },
      timestamp: 2000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.runs, 1, "Runs should be 1");
  assert.strictEqual(inn.wickets, 1, "Wickets should be 1");
  assert.strictEqual(inn.legalBalls, 2, "Legal balls should be 2");
  assert.strictEqual(inn.strikerId, "bat-3", "Striker should be new batter bat-3");
  assert.strictEqual(inn.nonStrikerId, "bat-1", "Non-striker should be surviving batter bat-1");
  assert.strictEqual(inn.needsBatter, false, "Needs batter should be false");

  const outBatter = inn.batters.find((b) => b.playerId === "bat-2");
  assert.strictEqual(outBatter.out, true, "Dismissed batter must be marked out");

  console.log("  ✓ Wicket recorded and new batter bat-3 placed on strike.");
  console.log("  ✓ Surviving batter bat-1 preserved at non-striker end.");
}

// ----------------------------------------------------
// TEST CASE 2: Wicket WITHOUT Immediate New Batter (Page Reload Scenario)
// ----------------------------------------------------
console.log("\n[TEST CASE 2: Page Reload After Wicket (Missing Batter Detection)]");
{
  const deliveries = [
    // Ball 0.1: 1 run
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-1",
      nonStrikerId: "bat-2",
      batterRuns: 1,
      extraRuns: 0,
      extraType: null,
      timestamp: 1000,
    },
    // Ball 0.2: Wicket without newBatterId (e.g. reloaded from DB)
    {
      id: "d2",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-2",
      nonStrikerId: "bat-1",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: {
        type: "Bowled",
        batterOutId: "bat-2",
      },
      timestamp: 2000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.runs, 1);
  assert.strictEqual(inn.wickets, 1);
  assert.strictEqual(inn.strikerId, undefined, "Striker is undefined (needs new batter)");
  assert.strictEqual(inn.nonStrikerId, "bat-1", "Non-striker is preserved");
  assert.strictEqual(inn.needsBatter, true, "needsBatter MUST be true");
  assert.strictEqual(inn.missingBatterRole, "striker", "missingBatterRole must be 'striker'");

  // Verify eligible batters list excludes bat-2 (out) and bat-1 (on crease)
  const dismissedIds = new Set(inn.batters.filter((b) => b.out).map((b) => b.playerId));
  const eligible = setup.playingXI["team-a"].playerIds.filter(
    (id) => id !== inn.nonStrikerId && !dismissedIds.has(id),
  );

  assert.deepStrictEqual(eligible, ["bat-3", "bat-4", "bat-5"], "Eligible batters must be bat-3, bat-4, bat-5");
  console.log("  ✓ Reload after wicket detected: needsBatter=true, missingBatterRole='striker'");
  console.log("  ✓ Eligible batters correctly filtered: " + eligible.join(", "));

  // Simulate selecting bat-4 as new striker and scoring ball 0.3
  const nextDeliveries = [
    ...deliveries,
    {
      id: "d3",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-4",
      nonStrikerId: "bat-1",
      batterRuns: 4,
      extraRuns: 0,
      extraType: null,
      timestamp: 3000,
    },
  ];

  const stateAfterNextBall = buildMatchState({ match, setup, deliveries: nextDeliveries });
  const innAfter = stateAfterNextBall.innings[0];

  assert.strictEqual(innAfter.runs, 5, "Total runs should be 5");
  assert.strictEqual(innAfter.strikerId, "bat-4", "Striker should now be bat-4");
  assert.strictEqual(innAfter.needsBatter, false, "needsBatter should now be false");
  console.log("  ✓ Next ball successfully scored with bat-4 (Score: 5/1 in 0.3 ov).");
}

// ----------------------------------------------------
// TEST CASE 3: Over Boundary on Wicket (Wicket on Ball 6) - No Deadlock
// ----------------------------------------------------
console.log("\n[TEST CASE 3: Wicket on Over Boundary (Ball 6) - No Deadlock]");
{
  const deliveries = [];
  // Balls 1 to 5: 5 dots
  for (let i = 1; i <= 5; i++) {
    deliveries.push({
      id: `d${i}`,
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-1",
      nonStrikerId: "bat-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      timestamp: 1000 * i,
    });
  }
  // Ball 6 (1.0 over): Wicket! bat-1 is bowled
  deliveries.push({
    id: "d6",
    inningsIndex: 0,
    bowlerId: "bowl-1",
    strikerId: "bat-1",
    nonStrikerId: "bat-2",
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    wicket: {
      type: "Bowled",
      batterOutId: "bat-1",
    },
    timestamp: 6000,
  });

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.legalBalls, 6, "Over 1 is complete (6 balls)");
  assert.strictEqual(inn.oversText, "1.0", "Overs text should be 1.0");
  assert.strictEqual(inn.wickets, 1, "Wickets should be 1");
  assert.strictEqual(inn.needsBowler, true, "needsBowler MUST be true");
  assert.strictEqual(inn.needsBatter, true, "needsBatter MUST be true");
  assert.strictEqual(inn.previousBowlerId, "bowl-1", "Previous bowler must be bowl-1");

  // At over end, surviving batter bat-2 (who was non-striker) rotated to striker!
  // And the new incoming batter will walk in at non-striker end!
  assert.strictEqual(inn.strikerId, "bat-2", "Surviving batter bat-2 takes strike for Over 2");
  assert.strictEqual(inn.nonStrikerId, undefined, "Non-striker slot awaits new batter");
  assert.strictEqual(inn.missingBatterRole, "non-striker", "missingBatterRole must be 'non-striker'");

  console.log("  ✓ Over 1.0 complete with wicket on last ball.");
  console.log("  ✓ needsBowler = true, previousBowler = bowl-1 (cannot bowl consecutive).");
  console.log("  ✓ needsBatter = true, surviving batter bat-2 correctly on strike, non-striker awaiting incoming batter.");
  console.log("  ✓ NO DEADLOCK: Both requirements are clearly reported and resolvable.");
}

// ----------------------------------------------------
// TEST CASE 4: Roster Fallback when Playing XI is Empty
// ----------------------------------------------------
console.log("\n[TEST CASE 4: Roster Fallback for yetToBat when playingXI is Empty]");
{
  const emptyXISetup = {
    battingFirstId: "team-a",
    playingXI: {},
  };

  const deliveries = [
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-1",
      nonStrikerId: "bat-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: {
        type: "Bowled",
        batterOutId: "bat-1",
      },
      timestamp: 1000,
    },
  ];

  const state = buildMatchState({ match, setup: emptyXISetup, deliveries });
  const inn = state.innings[0];

  assert(inn.yetToBat.length > 0, "yetToBat must not be empty even when playingXI is not set");
  assert(inn.yetToBat.includes("bat-3"), "yetToBat must include bat-3 from team roster");
  assert(inn.yetToBat.includes("bat-4"), "yetToBat must include bat-4 from team roster");
  assert(inn.yetToBat.includes("bat-5"), "yetToBat must include bat-5 from team roster");
  assert(!inn.yetToBat.includes("bat-1"), "yetToBat must NOT include dismissed bat-1");
  assert(!inn.yetToBat.includes("bat-2"), "yetToBat must NOT include active bat-2");

  console.log("  ✓ Engine successfully fell back to team roster for yetToBat: " + inn.yetToBat.join(", "));
}

// ----------------------------------------------------
// TEST CASE 5: Full Inning Match Flow with Multiple Wickets
// ----------------------------------------------------
console.log("\n[TEST CASE 5: Consecutive Wickets & Full Scoring Flow]");
{
  const deliveries = [
    // Wicket 1
    {
      id: "d1",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-1",
      nonStrikerId: "bat-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: { type: "Bowled", batterOutId: "bat-1", newBatterId: "bat-3" },
      timestamp: 1000,
    },
    // Wicket 2
    {
      id: "d2",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-3",
      nonStrikerId: "bat-2",
      batterRuns: 0,
      extraRuns: 0,
      extraType: null,
      wicket: { type: "Caught", batterOutId: "bat-3", fielderId: "bowl-2", newBatterId: "bat-4" },
      timestamp: 2000,
    },
    // 4 runs off bat-4
    {
      id: "d3",
      inningsIndex: 0,
      bowlerId: "bowl-1",
      strikerId: "bat-4",
      nonStrikerId: "bat-2",
      batterRuns: 4,
      extraRuns: 0,
      extraType: null,
      timestamp: 3000,
    },
  ];

  const state = buildMatchState({ match, setup, deliveries });
  const inn = state.innings[0];

  assert.strictEqual(inn.runs, 4);
  assert.strictEqual(inn.wickets, 2);
  assert.strictEqual(inn.strikerId, "bat-4");
  assert.strictEqual(inn.nonStrikerId, "bat-2");
  assert.strictEqual(inn.fallOfWickets.length, 2);
  assert.strictEqual(inn.fallOfWickets[0].batterOutId, "bat-1");
  assert.strictEqual(inn.fallOfWickets[1].batterOutId, "bat-3");

  console.log("  ✓ Consecutive wickets accurately handled in score engine.");
  console.log("  ✓ Score: 4/2 in 0.3 overs, Current pair: bat-4* (4) & bat-2 (0).");
}

console.log("\n>>> ALL 5 POST-WICKET ENGINE & CONTINUATION TEST SUITES PASSED 100%!");
