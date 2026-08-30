import assert from "node:assert/strict";
import { buildMatchState, isLegal } from "../src/lib/scoring/engine.js";

console.log("===============================================================================");
console.log("TPL 2026 — AUTHORITATIVE MATCH OVERS & ADJUST OVERS MODAL TEST SUITE");
console.log("===============================================================================");

// ── Test Base Match ────────────────────────────────────────────────────────
const match5Overs = {
  id: "m-auth-5ov",
  tournament: "TPL 2026",
  matchNumber: 4,
  teamAId: "t1",
  teamBId: "t2",
  overs: 5, // Authoritative match overs
  status: "LIVE",
};

// Initial setup with no overrides
const initialSetup = {
  playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3"], t2: ["t2-p8", "t2-p9"] },
};

// ── 1. Initial State Check ──────────────────────────────────────────────────
console.log("\n[STEP 1: Initial Match State Verification]");
const stateInitial = buildMatchState({
  match: match5Overs,
  setup: initialSetup,
  deliveries: [],
  secondInningsStarted: false,
});

assert.equal(stateInitial.match.overs, 5, "Authoritative match overs must be 5");
assert.equal(stateInitial.innings[0].maxOvers, 5, "Innings maxOvers must be 5");
console.log("  ✓ Base Match Overs = 5 | Innings maxOvers = 5");

// ── 2. Adjust 5 -> 3 Overs ─────────────────────────────────────────────────
console.log("\n[STEP 2: Adjust 5 -> 3 Overs]");
const setupWith3 = {
  ...initialSetup,
  reducedOvers: 3,
  targetRevisionReason: "REDUCED OVERS",
};

const state3Overs = buildMatchState({
  match: match5Overs,
  setup: setupWith3,
  deliveries: [],
  secondInningsStarted: false,
});

assert.equal(state3Overs.match.overs, 5, "Base match overs remains 5");
assert.equal(state3Overs.innings[0].maxOvers, 3, "Innings maxOvers updated to 3");
console.log("  ✓ Adjusted 5 -> 3: Base = 5, Revised Limit = 3");

// ── 3. Persistence Across Reload with 3 Overs ──────────────────────────────
console.log("\n[STEP 3: Reload Persistence with 3 Overs]");
const reloadedJson = JSON.parse(JSON.stringify(setupWith3));
const stateReloaded = buildMatchState({
  match: match5Overs,
  setup: reloadedJson,
  deliveries: [],
  secondInningsStarted: false,
});

assert.equal(stateReloaded.innings[0].maxOvers, 3, "Reloaded match preserves 3 overs limit");
console.log("  ✓ Reloaded match retained 3 overs");

// ── 4. Test All Reductions: 5 -> 1, 5 -> 2, 5 -> 4, 5 -> 5 ────────────────
console.log("\n[STEP 4: Test All Reductions (5 -> 1, 5 -> 2, 5 -> 4, 5 -> 5)]");
for (const targetOvers of [1, 2, 4, 5]) {
  const setup = {
    ...initialSetup,
    reducedOvers: targetOvers === 5 ? undefined : targetOvers,
  };
  const state = buildMatchState({
    match: match5Overs,
    setup,
    deliveries: [],
    secondInningsStarted: false,
  });
  assert.equal(state.innings[0].maxOvers, targetOvers, `Match maxOvers must be ${targetOvers}`);
  console.log(`  ✓ 5 -> ${targetOvers} overs verified (maxOvers = ${state.innings[0].maxOvers})`);
}

// ── 5. Delivery Preservation on Rain Reduction ─────────────────────────────
console.log("\n[STEP 5: Zero Data Loss on Rain Reduction]");
const deliveries = [
  { id: "d1", matchId: match5Overs.id, inningsIndex: 0, overNumber: 0, ballNumber: 1, strikerId: "t1-p1", nonStrikerId: "t1-p2", bowlerId: "t2-p8", batterRuns: 4, extraRuns: 0, extraType: null, timestamp: 1000 },
  { id: "d2", matchId: match5Overs.id, inningsIndex: 0, overNumber: 0, ballNumber: 2, strikerId: "t1-p1", nonStrikerId: "t1-p2", bowlerId: "t2-p8", batterRuns: 6, extraRuns: 0, extraType: null, timestamp: 2000 },
];

const stateWithDeliveriesReduced = buildMatchState({
  match: match5Overs,
  setup: { ...initialSetup, reducedOvers: 2 },
  deliveries,
  secondInningsStarted: false,
});

assert.equal(stateWithDeliveriesReduced.innings[0].runs, 10, "Runs preserved");
assert.equal(stateWithDeliveriesReduced.innings[0].legalBalls, 2, "Legal balls preserved");
assert.equal(stateWithDeliveriesReduced.innings[0].maxOvers, 2, "Max overs updated to 2");
assert.equal(stateWithDeliveriesReduced.innings[0].isComplete, false, "Innings remains open until 2.0 ov reached");
console.log("  ✓ Deliveries and scores 100% preserved on reduction.");

console.log("\n===============================================================================");
console.log(">>> ALL AUTHORITATIVE MATCH OVERS TESTS PASSED (100% GREEN)!");
console.log("===============================================================================\n");
