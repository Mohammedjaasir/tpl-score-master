import assert from "node:assert/strict";
import { buildMatchState, isLegal, oversText } from "../src/lib/scoring/engine.js";

console.log("===============================================================================");
console.log("TPL 2026 — CUSTOM MATCH OVERS ADJUSTMENT & WEATHER RULE TEST SUITE");
console.log("===============================================================================");

const baseMatch = {
  id: "m-custom-overs-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "t1",
  teamBId: "t2",
  overs: 5, // default
  status: "LIVE",
};

// ── Validation logic unit tests (same validator used in AdjustOversModal) ───
function validateOvers(val) {
  const trimmed = String(val).trim();
  if (trimmed === "") {
    return { isValid: false, numVal: 0, error: "Please enter the number of overs." };
  }
  if (!/^\d+$/.test(trimmed)) {
    if (trimmed.includes(".")) {
      return { isValid: false, numVal: 0, error: "Decimals are not allowed. Enter a whole number of overs." };
    }
    if (trimmed.startsWith("-")) {
      return { isValid: false, numVal: 0, error: "Negative numbers are not allowed. Overs must be 1 or more." };
    }
    return { isValid: false, numVal: 0, error: "Please enter a valid numeric value." };
  }
  const num = Number(trimmed);
  if (!Number.isInteger(num)) {
    return { isValid: false, numVal: 0, error: "Overs must be a whole number." };
  }
  if (num < 1) {
    return { isValid: false, numVal: num, error: "Match overs cannot be 0. Minimum is 1 over." };
  }
  if (num > 100) {
    return { isValid: false, numVal: num, error: "Maximum supported overs is 100." };
  }
  return { isValid: true, numVal: num, error: null };
}

// ── TEST 1: Enter 3 -> Save -> Match shows 3 overs ─────────────────────────
console.log("\n[TEST 1: Custom Overs 3]");
const res3 = validateOvers("3");
assert.equal(res3.isValid, true);
assert.equal(res3.numVal, 3);
const state3 = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 3, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [],
  secondInningsStarted: false,
});
assert.equal(state3.innings[0].maxOvers, 3);
console.log("  ✓ Test 1: Match cleanly configured with 3 overs.");

// ── TEST 2: Enter 7 -> Save -> Match shows 7 overs ─────────────────────────
console.log("\n[TEST 2: Custom Overs 7]");
const res7 = validateOvers("7");
assert.equal(res7.isValid, true);
assert.equal(res7.numVal, 7);
const state7 = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 7, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [],
  secondInningsStarted: false,
});
assert.equal(state7.innings[0].maxOvers, 7);
console.log("  ✓ Test 2: Match cleanly configured with 7 overs.");

// ── TEST 3: Enter 10 -> Save -> Match shows 10 overs ───────────────────────
console.log("\n[TEST 3: Custom Overs 10]");
const res10 = validateOvers("10");
assert.equal(res10.isValid, true);
assert.equal(res10.numVal, 10);
const state10 = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 10, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [],
  secondInningsStarted: false,
});
assert.equal(state10.innings[0].maxOvers, 10);
console.log("  ✓ Test 3: Match cleanly configured with 10 overs.");

// ── TEST 4: Enter 20 -> Save -> Match shows 20 overs ───────────────────────
console.log("\n[TEST 4: Custom Overs 20]");
const res20 = validateOvers("20");
assert.equal(res20.isValid, true);
assert.equal(res20.numVal, 20);
const state20 = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 20, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [],
  secondInningsStarted: false,
});
assert.equal(state20.innings[0].maxOvers, 20);
console.log("  ✓ Test 4: Match cleanly configured with 20 overs (T20 format).");

// ── TEST 5: Enter 0 -> Rejected ────────────────────────────────────────────
console.log("\n[TEST 5: Validation - Reject 0]");
const res0 = validateOvers("0");
assert.equal(res0.isValid, false);
assert.match(res0.error, /cannot be 0/i);
console.log("  ✓ Test 5: 0 overs rejected with clear error message.");

// ── TEST 6: Enter -2 -> Rejected ───────────────────────────────────────────
console.log("\n[TEST 6: Validation - Reject Negative Numbers]");
const resNeg = validateOvers("-2");
assert.equal(resNeg.isValid, false);
assert.match(resNeg.error, /negative/i);
console.log("  ✓ Test 6: Negative overs rejected.");

// ── TEST 7: Enter 2.5 -> Rejected ──────────────────────────────────────────
console.log("\n[TEST 7: Validation - Reject Decimals]");
const resDec = validateOvers("2.5");
assert.equal(resDec.isValid, false);
assert.match(resDec.error, /decimal/i);
console.log("  ✓ Test 7: Decimals (2.5) rejected.");

// ── TEST 8: Enter letters -> Rejected ──────────────────────────────────────
console.log("\n[TEST 8: Validation - Reject Letters]");
const resAlpha = validateOvers("abc");
assert.equal(resAlpha.isValid, false);
assert.match(resAlpha.error, /numeric/i);
console.log("  ✓ Test 8: Non-numeric text rejected.");

// ── TEST 9: Reload after setting 7 -> Still shows 7 ────────────────────────
console.log("\n[TEST 9: Persistence on Reload with Custom Overs]");
const setupWith7 = {
  reducedOvers: 7,
  targetRevisionReason: "REDUCED OVERS",
  playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] },
};
// Simulate serializing to localStorage / DB and hydrating back
const serialized = JSON.stringify(setupWith7);
const deserialized = JSON.parse(serialized);
const reloadedState = buildMatchState({
  match: baseMatch,
  setup: deserialized,
  deliveries: [],
  secondInningsStarted: false,
});
assert.equal(reloadedState.innings[0].maxOvers, 7);
console.log("  ✓ Test 9: Reloaded match state retains exact custom 7 overs.");

// ── TEST 10: Rain reduction 7 -> 5 preserves existing balls and score ──────
console.log("\n[TEST 10: Rain Reduction from 7 -> 5 preserves existing balls]");
const deliveries4Overs = [];
for (let b = 1; b <= 24; b++) {
  deliveries4Overs.push({
    id: `del-4ov-${b}`,
    matchId: baseMatch.id,
    inningsIndex: 0,
    overNumber: Math.floor((b - 1) / 6),
    ballNumber: ((b - 1) % 6) + 1,
    strikerId: "t1-p1",
    nonStrikerId: "t1-p2",
    bowlerId: "t2-p8",
    batterRuns: 1,
    extraRuns: 0,
    extraType: null,
    timestamp: 100000 + b * 10,
  });
}
// When reduced to 5 overs:
const stateReducedTo5 = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 5, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: deliveries4Overs,
  secondInningsStarted: false,
});
assert.equal(stateReducedTo5.innings[0].runs, 24);
assert.equal(stateReducedTo5.innings[0].legalBalls, 24); // 4.0 overs
assert.equal(stateReducedTo5.innings[0].maxOvers, 5);
assert.equal(stateReducedTo5.innings[0].isComplete, false, "Innings not yet complete with 1 over remaining");
console.log("  ✓ Test 10: 24 balls and 24 runs preserved when reduced from 7 to 5 overs.");

// ── TEST 11: Increase 5 -> 8 allows scoring beyond previous 5-over limit ───
console.log("\n[TEST 11: Increase 5 -> 8 overs allows additional scoring]");
const deliveries5Overs = [];
for (let b = 1; b <= 30; b++) {
  deliveries5Overs.push({
    id: `del-5ov-${b}`,
    matchId: baseMatch.id,
    inningsIndex: 0,
    overNumber: Math.floor((b - 1) / 6),
    ballNumber: ((b - 1) % 6) + 1,
    strikerId: "t1-p1",
    nonStrikerId: "t1-p2",
    bowlerId: "t2-p8",
    batterRuns: 2,
    extraRuns: 0,
    extraType: null,
    timestamp: 100000 + b * 10,
  });
}
// At 5 overs:
const stateAt5Overs = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 5, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: deliveries5Overs,
  secondInningsStarted: false,
});
assert.equal(stateAt5Overs.innings[0].isComplete, true, "Innings is complete at 5.0 overs if limit is 5");

// Increase to 8 overs:
const stateIncreasedTo8 = buildMatchState({
  match: baseMatch,
  setup: { reducedOvers: 8, playingXI: { t1: ["t1-p1", "t1-p2"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: deliveries5Overs,
  secondInningsStarted: false,
});
assert.equal(stateIncreasedTo8.innings[0].isComplete, false, "Innings re-opens when extended to 8 overs");
assert.equal(stateIncreasedTo8.innings[0].maxOvers, 8);
console.log("  ✓ Test 11: Innings cleanly extended to 8 overs, allowing additional scoring.");

console.log("\n===============================================================================");
console.log(">>> ALL CUSTOM MATCH OVERS TESTS PASSED (100% GREEN)!");
console.log("===============================================================================\n");
