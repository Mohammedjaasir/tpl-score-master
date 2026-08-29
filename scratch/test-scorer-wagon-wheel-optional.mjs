import { calculateBatterWagonWheel } from "../src/lib/scoring/wagon-wheel.ts";

console.log("==================================================");
console.log("TPL 2026 — SCORER WAGON WHEEL OPTIONAL / SKIP TESTS");
console.log("==================================================");

// Mock Deliveries: some with mapped shot zones, some skipped (unmapped or null)
const testDeliveries = [
  { strikerId: "batter-1", runsOffBat: 4, shotZone: "cover", overNumber: 1, ballNumber: 1 },
  { strikerId: "batter-1", runsOffBat: 1, shotZone: "unmapped", overNumber: 1, ballNumber: 2 }, // SKIPPED scoring shot
  { strikerId: "batter-1", runsOffBat: 6, shotZone: "long_on", overNumber: 1, ballNumber: 3 },
  { strikerId: "batter-1", runsOffBat: 2, shotZone: null, overNumber: 1, ballNumber: 4 }, // SKIPPED scoring shot
  { strikerId: "batter-1", runsOffBat: 0, shotZone: "unmapped", overNumber: 1, ballNumber: 5 }, // Dot ball
  { strikerId: "batter-1", runsOffBat: 4, shotZone: "square_leg", overNumber: 1, ballNumber: 6 },
];

console.log("\n[TEST 1: Wagon Wheel Summary Calculation with Skipped Deliveries]");
const summary = calculateBatterWagonWheel("batter-1", "Rahul Silva", testDeliveries);

console.log(`Total Runs: ${summary.totalRuns}`);
console.log(`Mapped Shots on Field: ${summary.shots.length}`);
console.log(`Cover: ${summary.zoneBreakdown.cover.runs} runs (${summary.zoneBreakdown.cover.shots} shots)`);
console.log(`Long On: ${summary.zoneBreakdown.long_on.runs} runs (${summary.zoneBreakdown.long_on.shots} shots)`);
console.log(`Square Leg: ${summary.zoneBreakdown.square_leg.runs} runs (${summary.zoneBreakdown.square_leg.shots} shots)`);
console.log(`Unmapped / Skipped: ${summary.zoneBreakdown.unmapped.runs} runs (${summary.zoneBreakdown.unmapped.shots} scoring shots)`);

// Verification 1: total runs must match exactly (4 + 1 + 6 + 2 + 0 + 4 = 17)
if (summary.totalRuns === 17) {
  console.log("  ✓ Total runs accurately calculated (17 runs).");
} else {
  console.error(`  ✗ Total runs mismatch: expected 17, got ${summary.totalRuns}`);
  process.exit(1);
}

// Verification 2: exactly 3 mapped shots should have coordinates on field (cover, long_on, square_leg)
if (summary.shots.length === 3) {
  console.log("  ✓ Only mapped shots (3 shots) are drawn on field graphic (zero fake points for skipped balls).");
} else {
  console.error(`  ✗ Mapped shot count mismatch: expected 3, got ${summary.shots.length}`);
  process.exit(1);
}

// Verification 3: unmapped breakdown tracks the 2 skipped scoring deliveries (1 + 2 = 3 runs)
if (summary.zoneBreakdown.unmapped.shots === 2 && summary.zoneBreakdown.unmapped.runs === 3) {
  console.log("  ✓ Unmapped deliveries safely isolated without contaminating boundary sectors.");
} else {
  console.error("  ✗ Unmapped breakdown calculation failed!");
  process.exit(1);
}

console.log("\n>>> ALL SCORER WAGON WHEEL OPTIONAL & SKIP TESTS PASSED.");
