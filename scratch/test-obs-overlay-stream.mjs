import assert from "node:assert";
import { lookup, toTeam, toMatch, toPlayer } from "../src/lib/repositories.ts";
import { buildMatchState } from "../src/lib/scoring/engine.ts";

console.log("================================================================================");
console.log("TPL 2026: OBS LIVE BROADCAST OVERLAY STREAM TEST SUITE");
console.log("================================================================================");

// 1. Setup Mock Master Teams and Players
const teamA = toTeam({ id: "team-bmr", name: "Bary Mawathe Royals", short_name: "BMR" });
const teamB = toTeam({ id: "team-ngw", name: "New Garden Warriors", short_name: "NGW" });

const p1 = toPlayer({ id: "p1", player_name: "Farhath Fairoos", team_id: "team-ngw" });
const p2 = toPlayer({ id: "p2", player_name: "Mohamed Abrar", team_id: "team-ngw" });
const p3 = toPlayer({ id: "p3", player_name: "Mohamed Imran", team_id: "team-bmr" });

lookup.setTeams([teamA, teamB]);
lookup.setPlayers([p1, p2, p3]);

const match = toMatch({
  id: "tpl-fixture-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  team_a_id: "team-bmr",
  team_b_id: "team-ngw",
  total_overs: 5,
  start_time: "2026-08-30T09:00:00Z",
  status: "live",
});

lookup.setMatches([match]);

// ── TEST 1: Initial State (0 balls bowled) ──────────────────────────────────
console.log("\n[TEST 1: Initial Match State Verification]");
const setup = {
  battingFirstId: "team-ngw",
  openers: { strikerId: "p1", nonStrikerId: "p2" },
  openingBowlerId: "p3",
  playingXI: {},
};

let deliveries = [];
let state = buildMatchState({ match, setup, deliveries });

assert.strictEqual(state.innings[0].runs, 0, "Initial runs must be 0");
assert.strictEqual(state.innings[0].wickets, 0, "Initial wickets must be 0");
assert.strictEqual(state.innings[0].oversText, "0.0", "Initial overs must be 0.0");
assert.strictEqual(state.innings[0].strikerId, "p1", "Farhath Fairoos must be striker");
assert.strictEqual(state.innings[0].nonStrikerId, "p2", "Mohamed Abrar must be non-striker");
assert.strictEqual(setup.openingBowlerId, "p3", "Opening bowler in setup must be p3");
console.log("  ✓ TEST 1 PASS: Initial scoreboard state initialized accurately.");

// ── TEST 2: Record Deliveries (1 run, 4, 6, dot, 2, wicket) ─────────────────
console.log("\n[TEST 2: Sequential Deliveries Real-Time Processing]");

// Ball 1: 1 run (strike rotates to p2)
deliveries.push({
  id: "d1",
  inningsIndex: 0,
  bowlerId: "p3",
  strikerId: "p1",
  nonStrikerId: "p2",
  batterRuns: 1,
  extraRuns: 0,
  extraType: null,
  timestamp: Date.now(),
});
state = buildMatchState({ match, setup, deliveries });
assert.strictEqual(state.innings[0].runs, 1);
assert.strictEqual(state.innings[0].oversText, "0.1");
assert.strictEqual(state.innings[0].strikerId, "p2", "Strike must rotate to p2 on single");

// Ball 2: 4 runs (by p2)
deliveries.push({
  id: "d2",
  inningsIndex: 0,
  bowlerId: "p3",
  strikerId: "p2",
  nonStrikerId: "p1",
  batterRuns: 4,
  extraRuns: 0,
  extraType: null,
  timestamp: Date.now() + 1000,
});
state = buildMatchState({ match, setup, deliveries });
assert.strictEqual(state.innings[0].runs, 5);
assert.strictEqual(state.innings[0].oversText, "0.2");

// Ball 3: 6 runs (by p2)
deliveries.push({
  id: "d3",
  inningsIndex: 0,
  bowlerId: "p3",
  strikerId: "p2",
  nonStrikerId: "p1",
  batterRuns: 6,
  extraRuns: 0,
  extraType: null,
  timestamp: Date.now() + 2000,
});
state = buildMatchState({ match, setup, deliveries });
assert.strictEqual(state.innings[0].runs, 11);
assert.strictEqual(state.innings[0].oversText, "0.3");

// Ball 4: Dot ball
deliveries.push({
  id: "d4",
  inningsIndex: 0,
  bowlerId: "p3",
  strikerId: "p2",
  nonStrikerId: "p1",
  batterRuns: 0,
  extraRuns: 0,
  extraType: null,
  timestamp: Date.now() + 3000,
});
state = buildMatchState({ match, setup, deliveries });
assert.strictEqual(state.innings[0].runs, 11);
assert.strictEqual(state.innings[0].oversText, "0.4");

// Ball 5: 2 runs
deliveries.push({
  id: "d5",
  inningsIndex: 0,
  bowlerId: "p3",
  strikerId: "p2",
  nonStrikerId: "p1",
  batterRuns: 2,
  extraRuns: 0,
  extraType: null,
  timestamp: Date.now() + 4000,
});
state = buildMatchState({ match, setup, deliveries });
assert.strictEqual(state.innings[0].runs, 13);
assert.strictEqual(state.innings[0].oversText, "0.5");

// Ball 6: Wicket (p2 caught)
deliveries.push({
  id: "d6",
  inningsIndex: 0,
  bowlerId: "p3",
  strikerId: "p2",
  nonStrikerId: "p1",
  batterRuns: 0,
  extraRuns: 0,
  extraType: null,
  wicket: {
    type: "Caught",
    batterOutId: "p2",
    bowlerId: "p3",
  },
  timestamp: Date.now() + 5000,
});
state = buildMatchState({ match, setup, deliveries });
assert.strictEqual(state.innings[0].runs, 13);
assert.strictEqual(state.innings[0].wickets, 1);
assert.strictEqual(state.innings[0].oversText, "1.0");
assert.strictEqual(state.innings[0].recentBalls.length, 6);

const labels = state.innings[0].recentBalls.map((b) => b.label.trim());
console.log("  Over 1 Deliveries:", labels.join("  |  "));
assert.deepStrictEqual(labels, ["1", "4", "6", "0", "2", "W"]);
console.log("  ✓ TEST 2 PASS: 6-ball sequence correctly evaluated (13/1 in 1.0 OV).");

// ── TEST 3: Bowler & Batter Statistics Verification ──────────────────────────
console.log("\n[TEST 3: Individual Statistics in Overlay]");
const p2Stats = state.innings[0].batters.find((b) => b.playerId === "p2");
assert.strictEqual(p2Stats.runs, 12);
assert.strictEqual(p2Stats.balls, 5);
assert.strictEqual(p2Stats.fours, 1);
assert.strictEqual(p2Stats.sixes, 1);
assert.strictEqual(p2Stats.out, true);

const bowlerStats = state.innings[0].bowlers.find((b) => b.playerId === "p3");
assert.strictEqual(bowlerStats.runs, 13);
assert.strictEqual(bowlerStats.wickets, 1);
assert.strictEqual(bowlerStats.legalBalls, 6);
assert.strictEqual(bowlerStats.economy, 13.0);

console.log("  ✓ TEST 3 PASS: Batter and Bowler statistics accurately computed for broadcast ribbon.");

console.log("\n================================================================================");
console.log(">>> ALL OBS LIVE BROADCAST STREAM TESTS PASSED (100% GREEN)!");
console.log("================================================================================");
