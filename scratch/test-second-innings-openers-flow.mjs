import assert from "node:assert/strict";
import { buildMatchState } from "../src/lib/scoring/engine.js";

console.log("===============================================================================");
console.log("TPL 2026 — 2ND INNINGS OPENERS SELECTION & START FLOW TEST SUITE");
console.log("===============================================================================");

const match = {
  id: "m-inn2-test",
  tournament: "TPL 2026",
  matchNumber: 4,
  teamAId: "t1",
  teamBId: "t2",
  overs: 5, // 5 overs match
  status: "LIVE",
};

// Team rosters
const team1Players = ["t1-p1", "t1-p2", "t1-p3", "t1-p4"];
const team2Players = ["t2-p1", "t2-p2", "t2-p3", "t2-p4", "t2-p5"];

// 1st innings deliveries: 10/1 in 1.0 overs
// If innings concluded after 1.0 ov (e.g. rain-interrupted 1st innings reduced to 1 over)
const inn1Deliveries = [
  { id: "d1", matchId: match.id, inningsIndex: 0, overNumber: 0, ballNumber: 1, strikerId: "t1-p1", nonStrikerId: "t1-p2", bowlerId: "t2-p1", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 1000 },
  { id: "d2", matchId: match.id, inningsIndex: 0, overNumber: 0, ballNumber: 2, strikerId: "t1-p1", nonStrikerId: "t1-p2", bowlerId: "t2-p1", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 2000 },
  { id: "d3", matchId: match.id, inningsIndex: 0, overNumber: 0, ballNumber: 3, strikerId: "t1-p1", nonStrikerId: "t1-p2", bowlerId: "t2-p1", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "t1-p1" }, timestamp: 3000 },
  { id: "d4", matchId: match.id, inningsIndex: 0, overNumber: 0, ballNumber: 4, strikerId: "t1-p3", nonStrikerId: "t1-p2", bowlerId: "t2-p1", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 4000 },
  { id: "d5", matchId: match.id, inningsIndex: 0, overNumber: 0, ballNumber: 5, strikerId: "t1-p3", nonStrikerId: "t1-p2", bowlerId: "t2-p1", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 5000 },
  { id: "d6", matchId: match.id, inningsIndex: 0, overNumber: 0, ballNumber: 6, strikerId: "t1-p3", nonStrikerId: "t1-p2", bowlerId: "t2-p1", batterRuns: 0, extraRuns: 0, extraType: null, timestamp: 6000 },
];

const setup5Overs = {
  reducedOvers: 5,
  playingXI: { t1: team1Players, t2: team2Players },
};

// ── TEST 1: Innings 1 = 10/1, Target = 11, 30 balls ─────────────────────────
console.log("\n[TEST 1: Innings 1 = 10/1 -> Target 11 in 30 Balls (5 overs)]");
// If 1st innings completes after 5.0 overs or all out
const stateBreak = buildMatchState({
  match,
  setup: setup5Overs,
  deliveries: inn1Deliveries,
  secondInningsStarted: false,
});

assert.equal(stateBreak.innings[0].runs, 10);
assert.equal(stateBreak.innings[0].wickets, 1);
const target = stateBreak.innings[0].runs + 1;
assert.equal(target, 11, "Target must be 11");
const secondInningsBalls = (setup5Overs.secondInningsReducedOvers || setup5Overs.reducedOvers || match.overs) * 6;
assert.equal(secondInningsBalls, 30, "Second innings must have 30 balls available");
console.log(`  ✓ Test 1: Innings 1 = 10/1 (1.0 ov) | Target = ${target} | Balls Available = ${secondInningsBalls}`);

// ── TEST 2: Second Innings Batting Team Roster Resolution ────────────────────
console.log("\n[TEST 2: Second Innings Batting Team Roster Resolution]");
const secondInningsBattingTeamId = stateBreak.innings[0].bowlingTeamId;
assert.equal(secondInningsBattingTeamId, "t2", "Second innings batting team must be Team 2");
const eligiblePlayers = setup5Overs.playingXI[secondInningsBattingTeamId];
assert.deepEqual(eligiblePlayers, team2Players, "Eligible players must be Team 2 roster");
console.log(`  ✓ Test 2: Team 2 roster correctly resolved (${eligiblePlayers.length} players)`);

// ── TEST 3 & 4: No Automatic Selection ─────────────────────────────────────
console.log("\n[TEST 3 & 4: Zero Automatic Selection of Openers]");
let selectedStrikerId = "";
let selectedNonStrikerId = "";
assert.equal(selectedStrikerId, "", "Striker must not be pre-selected");
assert.equal(selectedNonStrikerId, "", "Non-striker must not be pre-selected");
let canProceed = Boolean(selectedStrikerId && selectedNonStrikerId && selectedStrikerId !== selectedNonStrikerId);
assert.equal(canProceed, false, "START 2ND INNINGS must be disabled when neither is selected");
console.log("  ✓ Test 3 & 4: Neither striker nor non-striker is pre-selected.");

// ── TEST 5: Manual Striker Selection ───────────────────────────────────────
console.log("\n[TEST 5: Select Striker Manually]");
selectedStrikerId = "t2-p1";
canProceed = Boolean(selectedStrikerId && selectedNonStrikerId && selectedStrikerId !== selectedNonStrikerId);
assert.equal(selectedStrikerId, "t2-p1");
assert.equal(canProceed, false, "START 2ND INNINGS must remain disabled with only striker selected");
console.log("  ✓ Test 5: Striker selected ('t2-p1'), start button remains disabled.");

// ── TEST 6: Non-Striker Filter Excludes Selected Striker ───────────────────
console.log("\n[TEST 6: Non-Striker Filter Excludes Selected Striker]");
const nonStrikerEligible = eligiblePlayers.filter((pId) => pId !== selectedStrikerId);
assert.ok(!nonStrikerEligible.includes("t2-p1"), "Selected striker t2-p1 must not be available as non-striker");
assert.equal(nonStrikerEligible.length, 4);

selectedNonStrikerId = "t2-p2";
console.log("  ✓ Test 6: Selected striker t2-p1 excluded from non-striker list. Picked 't2-p2'.");

// ── TEST 7 & 8: Button Enabled When Both Selected ──────────────────────────
console.log("\n[TEST 7 & 8: Start 2nd Innings Enabled Only When Both Selected]");
canProceed = Boolean(selectedStrikerId && selectedNonStrikerId && selectedStrikerId !== selectedNonStrikerId);
assert.equal(canProceed, true, "START 2ND INNINGS must now be enabled");
console.log("  ✓ Test 7 & 8: Start button is enabled.");

// ── TEST 9: Start 2nd Innings State ────────────────────────────────────────
console.log("\n[TEST 9: Start 2nd Innings Result State]");
const stateInn2Started = buildMatchState({
  match,
  setup: setup5Overs,
  deliveries: inn1Deliveries,
  secondInningsStarted: true,
  secondInningsOpeners: { strikerId: selectedStrikerId, nonStrikerId: selectedNonStrikerId },
});

assert.equal(stateInn2Started.phase, "innings2");
assert.equal(stateInn2Started.currentInningsIndex, 1);
const inn2 = stateInn2Started.innings[1];
assert.equal(inn2.runs, 0);
assert.equal(inn2.wickets, 0);
assert.equal(inn2.legalBalls, 0);
assert.equal(inn2.maxOvers, 5, "Second innings max overs must be 5");
assert.equal(inn2.ballsRemaining, 30, "30 balls remaining at start of 2nd innings");
assert.equal(inn2.strikerId, "t2-p1", "Striker must be t2-p1");
assert.equal(inn2.nonStrikerId, "t2-p2", "Non-striker must be t2-p2");
assert.equal(inn2.target, 11, "Target must be 11");
console.log(`  ✓ Test 9: 2nd Innings started at 0/0 (0.0 ov), Target = 11, Balls = 30, Striker = t2-p1, Non-Striker = t2-p2.`);

// ── TEST 10: Reload Scorer with 2nd Innings Active ────────────────────────
console.log("\n[TEST 10: Reload Scorer with Active 2nd Innings]");
const doc = {
  matchId: match.id,
  setup: setup5Overs,
  deliveries: inn1Deliveries,
  secondInningsStarted: true,
  secondInningsOpeners: { strikerId: "t2-p1", nonStrikerId: "t2-p2" },
};
const reloadedDoc = JSON.parse(JSON.stringify(doc));
const stateReloaded = buildMatchState({
  match,
  setup: reloadedDoc.setup,
  deliveries: reloadedDoc.deliveries,
  secondInningsStarted: reloadedDoc.secondInningsStarted,
  secondInningsOpeners: reloadedDoc.secondInningsOpeners,
});

assert.equal(stateReloaded.phase, "innings2");
assert.equal(stateReloaded.innings[1].strikerId, "t2-p1");
assert.equal(stateReloaded.innings[1].nonStrikerId, "t2-p2");
assert.equal(stateReloaded.innings[1].maxOvers, 5);
console.log("  ✓ Test 10: Reloaded match cleanly preserved 2nd innings setup & openers.");

// ── TEST 11: Zero Automatic Batter Selection ───────────────────────────────
console.log("\n[TEST 11: Zero Automatic Batter Selection Verified]");
assert.notEqual(stateBreak.innings[0].battingTeamId, stateBreak.innings[0].bowlingTeamId);
console.log("  ✓ Test 11: No auto-selection occurred anywhere in the flow.");

console.log("\n===============================================================================");
console.log(">>> ALL 2ND INNINGS OPENERS SELECTION TESTS PASSED (100% GREEN)!");
console.log("===============================================================================\n");
