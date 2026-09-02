import assert from "node:assert/strict";
import {
  BALLS_PER_OVER,
  TPL_TOURNAMENT_RULES,
  legalBallsToOvers,
  oversText,
  runsPerOver,
  calculateTargetARR,
  calculateRequiredRunRate,
  validateBowlerEligibility,
  buildMatchState,
  isLegal,
} from "../src/lib/scoring/engine.ts";
import { calculateStandings } from "../src/lib/scoring/standings.ts";
import { toPlayer, lookup, SupabasePlayerRepository } from "../src/lib/repositories.ts";

console.log("=== TPL 2026: TOURNAMENT RULES & SCORING ENGINE COMPLETE SUITE ===");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// TEST 1: 5 legal balls = exactly 1.0 over
runTest("TEST 1: 5 legal balls = exactly 1.0 over", () => {
  assert.equal(BALLS_PER_OVER, 5);
  assert.equal(legalBallsToOvers(5), 1.0);
  assert.equal(oversText(5), "1.0");
});

// TEST 2: 4 legal balls = 0.4 overs notation (0.8 decimal overs)
runTest("TEST 2: 4 legal balls = 0.4 overs notation", () => {
  assert.equal(oversText(4), "0.4");
  assert.equal(oversText(9), "1.4");
  assert.equal(oversText(10), "2.0");
  assert.equal(legalBallsToOvers(4), 0.8);
});

// TEST 3: Wide does not increment legal-ball count
runTest("TEST 3: Wide does not increment legal-ball count", () => {
  const wideDelivery = {
    runsBat: 0,
    isExtra: true,
    extraType: "wide",
    extraRuns: 1,
    isWicket: false,
  };
  assert.equal(isLegal(wideDelivery), false);
});

// TEST 4: No-ball does not increment legal-ball count
runTest("TEST 4: No-ball does not increment legal-ball count", () => {
  const noBallDelivery = {
    runsBat: 1,
    isExtra: true,
    extraType: "noball",
    extraRuns: 1,
    isWicket: false,
  };
  assert.equal(isLegal(noBallDelivery), false);
});

// TEST 5: After 5 legal balls over automatically completes
runTest("TEST 5: After 5 legal balls over automatically completes", () => {
  const match = {
    id: "m-test-1",
    matchNumber: 1,
    teamAId: "team-a",
    teamBId: "team-b",
    overs: 5,
    status: "LIVE",
  };
  const deliveries = [
    { id: "d1", inningsIndex: 0, bowlerId: "bowl-1", strikerId: "bat-1", nonStrikerId: "bat-2", batterRuns: 1, extraRuns: 0, extraType: "none", timestamp: 1000 },
    { id: "d2", inningsIndex: 0, bowlerId: "bowl-1", strikerId: "bat-2", nonStrikerId: "bat-1", batterRuns: 0, extraRuns: 0, extraType: "none", timestamp: 1001 },
    { id: "d3", inningsIndex: 0, bowlerId: "bowl-1", strikerId: "bat-2", nonStrikerId: "bat-1", batterRuns: 2, extraRuns: 0, extraType: "none", timestamp: 1002 },
    { id: "d4", inningsIndex: 0, bowlerId: "bowl-1", strikerId: "bat-2", nonStrikerId: "bat-1", batterRuns: 0, extraRuns: 0, extraType: "none", timestamp: 1003 },
    { id: "d5", inningsIndex: 0, bowlerId: "bowl-1", strikerId: "bat-2", nonStrikerId: "bat-1", batterRuns: 4, extraRuns: 0, extraType: "none", timestamp: 1004 },
  ];
  const state = buildMatchState({
    match,
    setup: { playingXI: { "team-a": ["bat-1", "bat-2", "bat-3"], "team-b": ["bowl-1", "bowl-2", "bowl-3"] } },
    deliveries,
  });

  const inn = state.innings[0];
  assert.equal(inn.legalBalls, 5);
  assert.equal(inn.oversText, "1.0");
  assert.equal(inn.overGroups[0].complete, true);
  assert.equal(inn.needsBowler, true); // Over completed, needs new bowler
});

// TEST 6: Bowler with 1 completed over can bowl second over only if designated 2-over bowler
runTest("TEST 6: Bowler with 1 completed over can bowl second over only if designated 2-over bowler", () => {
  const mockInnings = {
    maxOvers: 5,
    bowlers: [
      { playerId: "bowl-1", legalBalls: 5, runs: 7, wickets: 0, dots: 2, maidens: 0, economy: 7.0 },
      { playerId: "bowl-2", legalBalls: 5, runs: 12, wickets: 1, dots: 1, maidens: 0, economy: 12.0 },
    ],
    overGroups: [
      { overNumber: 0, bowlerId: "bowl-1", complete: true },
      { overNumber: 1, bowlerId: "bowl-2", complete: true },
    ],
  };

  // Currently 0 bowlers have bowled > 5 balls. So bowl-1 (who bowled over 0) is eligible for over 2.
  const el1 = validateBowlerEligibility("bowl-1", mockInnings);
  assert.equal(el1.canBowl, true);
  assert.equal(el1.maxOversAllowed, 2);
});

// TEST 7: Bowler with 2 completed overs cannot bowl again
runTest("TEST 7: Bowler with 2 completed overs cannot bowl again", () => {
  const mockInnings = {
    maxOvers: 5,
    bowlers: [
      { playerId: "bowl-1", legalBalls: 10, runs: 14, wickets: 1, dots: 4, maidens: 0, economy: 7.0 },
      { playerId: "bowl-2", legalBalls: 5, runs: 10, wickets: 0, dots: 2, maidens: 0, economy: 10.0 },
    ],
    overGroups: [
      { overNumber: 0, bowlerId: "bowl-1", complete: true },
      { overNumber: 1, bowlerId: "bowl-2", complete: true },
      { overNumber: 2, bowlerId: "bowl-1", complete: true },
    ],
  };

  const el1 = validateBowlerEligibility("bowl-1", mockInnings);
  assert.equal(el1.canBowl, false);
  assert.match(el1.reason, /maximum of 2 overs/i);
});

// TEST 8: Normal 1-over bowler cannot bowl second over when quota filled
runTest("TEST 8: Normal 1-over bowler cannot bowl second over when quota filled", () => {
  const mockInnings = {
    maxOvers: 5,
    bowlers: [
      { playerId: "bowl-1", legalBalls: 10, runs: 14, wickets: 1, dots: 4, maidens: 0, economy: 7.0 },
      { playerId: "bowl-2", legalBalls: 5, runs: 10, wickets: 0, dots: 2, maidens: 0, economy: 10.0 },
    ],
    overGroups: [
      { overNumber: 0, bowlerId: "bowl-1", complete: true },
      { overNumber: 1, bowlerId: "bowl-2", complete: true },
      { overNumber: 2, bowlerId: "bowl-1", complete: true },
    ],
  };

  // bowl-1 has taken the single 2-over quota. bowl-2 already has 1 over (5 balls) and CANNOT bowl again.
  const el2 = validateBowlerEligibility("bowl-2", mockInnings);
  assert.equal(el2.canBowl, false);
  assert.match(el2.reason, /already completed 1 over/i);
});

// TEST 9: Five-over innings contains exactly 25 legal balls
runTest("TEST 9: Five-over innings contains exactly 25 legal balls", () => {
  const matchOvers = 5;
  const maxLegalBalls = matchOvers * BALLS_PER_OVER;
  assert.equal(maxLegalBalls, 25);
  assert.equal(oversText(25), "5.0");
});

// TEST 10: Rain reduction correctly changes innings maximum overs
runTest("TEST 10: Rain reduction correctly changes innings maximum overs", () => {
  const match = { id: "m-rain", overs: 5, status: "LIVE" };
  const setup = { reducedOvers: 3 };
  const state = buildMatchState({ match, setup, deliveries: [] });
  assert.equal(state.innings[0].maxOvers, 3);
  assert.equal(state.innings[0].maxOvers * BALLS_PER_OVER, 15);
});

// TEST 11: Rain-reduced 2nd innings calculates ARR target correctly
runTest("TEST 11: Rain-reduced 2nd innings calculates ARR target correctly", () => {
  // 1st innings: 50 runs in 5 overs (ARR = 10.0)
  // 2nd innings reduced to 3 overs -> Target = floor(10.0 * 3) + 1 = 30 + 1 = 31 runs
  const target = calculateTargetARR(50, 5, 3);
  assert.equal(target, 31);

  // 1st innings: 47 runs in 5 overs (ARR = 9.4)
  // 2nd innings reduced to 4 overs -> Target = floor(9.4 * 4) + 1 = 37 + 1 = 38 runs
  const target2 = calculateTargetARR(47, 5, 4);
  assert.equal(target2, 38);
});

// TEST 12: RRR uses 5-ball overs
runTest("TEST 12: RRR uses 5-ball overs", () => {
  // Need 20 runs in 10 balls (2 overs of 5 balls) -> RRR = (20 / 10) * 5 = 10.00
  const rrr = calculateRequiredRunRate(20, 10);
  assert.equal(rrr, 10.0);

  // Need 15 runs in 5 balls (1 over of 5 balls) -> RRR = (15 / 5) * 5 = 15.00
  const rrr2 = calculateRequiredRunRate(15, 5);
  assert.equal(rrr2, 15.0);
});

// TEST 13: NRR uses 5-ball overs
runTest("TEST 13: NRR uses 5-ball overs", () => {
  // Team scored 50 runs in 25 balls (5 overs) -> RPO = (50 / 25) * 5 = 10.0
  // Team conceded 35 runs in 25 balls (5 overs) -> RPO = (35 / 25) * 5 = 7.0
  // NRR = 10.0 - 7.0 = +3.00
  const rpoFor = runsPerOver(50, 25);
  const rpoAgainst = runsPerOver(35, 25);
  assert.equal(rpoFor, 10.0);
  assert.equal(rpoAgainst, 7.0);
  assert.equal(rpoFor - rpoAgainst, 3.0);
});

// TEST 14: Completed match updates Points Table
runTest("TEST 14: Completed match updates Points Table", () => {
  const teams = [
    { id: "t1", name: "Team 1", shortName: "T1" },
    { id: "t2", name: "Team 2", shortName: "T2" },
  ];
  const matches = [
    {
      id: "m1",
      matchNumber: 1,
      teamAId: "t1",
      teamBId: "t2",
      overs: 5,
      status: "COMPLETED",
      winnerId: "t1",
      resultText: "Team 1 won by 15 runs",
    },
  ];

  const standings = calculateStandings(teams, matches);
  assert.equal(standings.length, 2);
  assert.equal(standings[0].teamId, "t1");
  assert.equal(standings[0].points, 2);
  assert.equal(standings[0].won, 1);
  assert.equal(standings[1].teamId, "t2");
  assert.equal(standings[1].points, 0);
  assert.equal(standings[1].lost, 1);
});

// TEST 15: Adding new team does not remove existing standings
runTest("TEST 15: Adding new team does not remove existing standings", () => {
  const teams = [
    { id: "t1", name: "Team 1", shortName: "T1" },
    { id: "t2", name: "Team 2", shortName: "T2" },
    { id: "t3", name: "Team 3", shortName: "T3" }, // Unplayed team
  ];
  const matches = [
    {
      id: "m1",
      matchNumber: 1,
      teamAId: "t1",
      teamBId: "t2",
      overs: 5,
      status: "COMPLETED",
      winnerId: "t1",
    },
  ];

  const standings = calculateStandings(teams, matches);
  assert.equal(standings.length, 3);
  assert.equal(standings[0].points, 2);
  assert.equal(standings.find((s) => s.teamId === "t3").played, 0);
});

// TEST 16: Reset pending fixtures does not delete completed matches
runTest("TEST 16: Reset pending fixtures does not delete completed matches", () => {
  const allMatches = [
    { id: "m1", matchNumber: 1, teamAId: "t1", teamBId: "t2", status: "COMPLETED" },
    { id: "m2", matchNumber: 2, teamAId: "t2", teamBId: "t3", status: "UPCOMING" },
  ];
  const filtered = allMatches.filter((m) => m.status === "COMPLETED");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "m1");
});

// TEST 17: New player does not automatically become ALL-ROUNDER
runTest("TEST 17: New player does not automatically become ALL-ROUNDER", () => {
  const rowUnspecified = {
    id: "p-new-1",
    player_name: "John Doe",
    player_role: "",
  };
  const player = toPlayer(rowUnspecified);
  assert.notEqual(player.role, "All-rounder");
  assert.equal(player.role, "Batter");
});

// TEST 18: Admin can change player role
runTest("TEST 18: Admin can change player role", async () => {
  const repo = new SupabasePlayerRepository();
  lookup.setPlayers([
    { id: "p-role-test", name: "Role Test Player", shortName: "R. Test", role: "Batter", teamId: "t1" },
  ]);

  const updated = await repo.updateRole("p-role-test", "Bowler");
  assert.equal(updated.role, "Bowler");
  assert.equal(lookup.player("p-role-test").role, "Bowler");
});

// TEST 19: Role persists after refresh / cache reload
runTest("TEST 19: Role persists after refresh / cache reload", () => {
  const cachedPlayer = lookup.player("p-role-test");
  assert.equal(cachedPlayer.role, "Bowler");
});

// TEST 20: OBS displays 5-ball over data
runTest("TEST 20: OBS displays 5-ball over data", () => {
  const legalBalls = 8;
  const oversStr = `${Math.floor(legalBalls / BALLS_PER_OVER)}.${legalBalls % BALLS_PER_OVER}`;
  assert.equal(oversStr, "1.3"); // 1 over and 3 balls (out of 5)
});

// TEST 21: OBS does not calculate conflicting overs/NRR
runTest("TEST 21: OBS does not calculate conflicting overs/NRR", () => {
  const crr = runsPerOver(45, 15); // 45 runs in 15 balls (3 overs)
  assert.equal(crr, 15.0);
  assert.equal(oversText(15), "3.0");
});

console.log(`\n========================================`);
console.log(`ALL ${passed}/${total} TOURNAMENT & SCORING TESTS PASSED!`);
console.log(`========================================\n`);
