import { buildMatchState, buildInnings } from "../src/lib/scoring/engine.ts";

console.log("==================================================");
console.log("TPL 2026 — SCORER RESUME / REOPEN HYDRATION TESTS");
console.log("==================================================");

// Mock Match Master Data (Read-only)
const mockMatch = {
  id: "match-test-resume-101",
  teamAId: "team-a",
  teamBId: "team-b",
  venue: "TPL Central Stadium",
  date: "2026-08-30",
  time: "14:00",
  overs: 6,
  status: "LIVE",
  type: "LEAGUE",
};

// Scenario 1: Over in progress (1.1 overs, 9/3)
// Over 1 (6 balls): Bowler 1 (p-bowl-1)
// Over 2 (1 ball): Bowler 2 (p-bowl-2)
const mockDeliveries1_1 = [
  // Over 1: Bowler 1
  { id: "b1", inningsIndex: 0, bowlerId: "p-bowl-1", strikerId: "p-bat-1", nonStrikerId: "p-bat-2", batterRuns: 4, extraRuns: 0, extraType: null },
  { id: "b2", inningsIndex: 0, bowlerId: "p-bowl-1", strikerId: "p-bat-1", nonStrikerId: "p-bat-2", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Bowled", batterOutId: "p-bat-1", newBatterId: "p-bat-3" } },
  { id: "b3", inningsIndex: 0, bowlerId: "p-bowl-1", strikerId: "p-bat-3", nonStrikerId: "p-bat-2", batterRuns: 1, extraRuns: 0, extraType: null },
  { id: "b4", inningsIndex: 0, bowlerId: "p-bowl-1", strikerId: "p-bat-2", nonStrikerId: "p-bat-3", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "Caught", batterOutId: "p-bat-2", fielderId: "p-field-1", newBatterId: "p-bat-4" } },
  { id: "b5", inningsIndex: 0, bowlerId: "p-bowl-1", strikerId: "p-bat-4", nonStrikerId: "p-bat-3", batterRuns: 0, extraRuns: 0, extraType: null, wicket: { type: "LBW", batterOutId: "p-bat-4", newBatterId: "p-bat-5" } },
  { id: "b6", inningsIndex: 0, bowlerId: "p-bowl-1", strikerId: "p-bat-5", nonStrikerId: "p-bat-3", batterRuns: 2, extraRuns: 0, extraType: null },
  // Over 2: Bowler 2 (1.1 overs)
  { id: "b7", inningsIndex: 0, bowlerId: "p-bowl-2", strikerId: "p-bat-3", nonStrikerId: "p-bat-5", batterRuns: 2, extraRuns: 0, extraType: null },
];

console.log("\n[TEST A & B: Resume During an Over (1.1 overs, 9/3)]");
const state1_1 = buildMatchState({
  match: mockMatch,
  setup: { playingXI: {} }, // Simulated fresh/empty setup (e.g. reopen or incognito)
  deliveries: mockDeliveries1_1,
});

const inn1_1 = state1_1.innings[0];
console.log(`Runs: ${inn1_1.runs}/${inn1_1.wickets} in ${inn1_1.oversText} overs`);
console.log(`Current Striker: ${inn1_1.strikerId}`);
console.log(`Current Non-Striker: ${inn1_1.nonStrikerId}`);
console.log(`Current Bowler: ${inn1_1.currentBowlerId}`);
console.log(`Needs Bowler Modal: ${inn1_1.needsBowler}`);

if (inn1_1.runs === 9 && inn1_1.wickets === 3 && inn1_1.oversText === "1.1") {
  console.log("  ✓ Score and overs accurately reconstructed (9/3 in 1.1 overs).");
} else {
  console.error("  ✗ Score or overs mismatch!");
  process.exit(1);
}

if (inn1_1.currentBowlerId === "p-bowl-2" && !inn1_1.needsBowler) {
  console.log("  ✓ Current in-progress bowler 'p-bowl-2' automatically resolved from persisted over delivery.");
} else {
  console.error("  ✗ Failed to derive current bowler!");
  process.exit(1);
}

if (inn1_1.strikerId && inn1_1.nonStrikerId) {
  console.log(`  ✓ Batters active and ready: Striker=${inn1_1.strikerId}, NonStriker=${inn1_1.nonStrikerId}`);
} else {
  console.error("  ✗ Batters missing!");
  process.exit(1);
}

// Scenario C: Reopen After a Wicket
console.log("\n[TEST C: Resume Immediately After Wicket]");
const mockDeliveriesWicket = mockDeliveries1_1.slice(0, 2); // 4, W (1.0 overs, 4/1)
const stateWicket = buildMatchState({
  match: mockMatch,
  setup: { playingXI: {} },
  deliveries: mockDeliveriesWicket,
});
const innWicket = stateWicket.innings[0];
console.log(`Score: ${innWicket.runs}/${innWicket.wickets} (${innWicket.oversText} ov)`);
console.log(`New Batter at crease: ${innWicket.strikerId}`);
if (innWicket.wickets === 1 && innWicket.strikerId === "p-bat-3") {
  console.log("  ✓ Wicket and new batter correctly restored without data loss.");
} else {
  console.error("  ✗ Wicket resumption failed!");
  process.exit(1);
}

// Scenario D: Reopen at the End of an Over (e.g. 1.0 overs complete)
console.log("\n[TEST D: Resume at Over Boundary (1.0 over complete)]");
const mockDeliveriesOverEnd = mockDeliveries1_1.slice(0, 6); // 6 balls
const stateOverEnd = buildMatchState({
  match: mockMatch,
  setup: { playingXI: {} },
  deliveries: mockDeliveriesOverEnd,
});
const innOverEnd = stateOverEnd.innings[0];
console.log(`Score: ${innOverEnd.runs}/${innOverEnd.wickets} (${innOverEnd.oversText} ov)`);
console.log(`Over In Progress: ${innOverEnd.currentBowlerId ? "Yes" : "No"}`);
console.log(`Needs Bowler for Next Over: ${innOverEnd.needsBowler}`);
console.log(`Previous Bowler (Cannot Bowl Consecutively): ${innOverEnd.previousBowlerId}`);

if (innOverEnd.oversText === "1.0" && innOverEnd.needsBowler && innOverEnd.previousBowlerId === "p-bowl-1") {
  console.log("  ✓ Over boundary properly detected: needsBowler=true, previousBowler preserved.");
} else {
  console.error("  ✗ Over boundary resumption failed!");
  process.exit(1);
}

// Scenario E: Fresh Browser / Incognito Hydration from Pure Supabase Deliveries
console.log("\n[TEST E: Fresh Browser Hydration from Pure Deliveries]");
const stateFresh = buildMatchState({
  match: mockMatch,
  setup: { playingXI: {} },
  deliveries: mockDeliveries1_1,
});

if (stateFresh.phase === "innings1" && stateFresh.innings[0].currentBowlerId === "p-bowl-2") {
  console.log("  ✓ Pure delivery array completely reconstructs live scoring state without requiring local storage.");
} else {
  console.error("  ✗ Pure delivery hydration failed!");
  process.exit(1);
}

console.log("\n>>> ALL SCORER RESUME & HYDRATION TESTS PASSED 100%.");
