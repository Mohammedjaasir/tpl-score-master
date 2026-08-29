import { calculateBatterWagonWheel, WAGON_WHEEL_ZONE_DISPLAY_NAMES } from "../src/lib/scoring/wagon-wheel.ts";

console.log("==================================================");
console.log("TPL 2026 — WAGON WHEEL UNIT & SCENARIO TESTS");
console.log("==================================================");

// TEST 1: Batter A with 4 specific shots
const batterADeliveries = [
  { strikerId: "batter-a", runsOffBat: 1, shotZone: "point", overNumber: 0, ballNumber: 1 },
  { strikerId: "batter-a", runsOffBat: 4, shotZone: "cover", overNumber: 0, ballNumber: 2 },
  { strikerId: "batter-a", runsOffBat: 2, shotZone: "mid_wicket", overNumber: 0, ballNumber: 3 },
  { strikerId: "batter-a", runsOffBat: 6, shotZone: "long_on", overNumber: 0, ballNumber: 4 },
];

const summaryA = calculateBatterWagonWheel("batter-a", "Batter Alpha", batterADeliveries);

console.log("\n[TEST 1: Batter A - 4 Explicit Shots]");
console.log("Total Runs:", summaryA.totalRuns, "(Expected: 13)");
console.log("Mapped Runs:", summaryA.mappedRuns, "(Expected: 13)");
console.log("Unmapped Runs:", summaryA.unmappedRuns, "(Expected: 0)");
console.log("Point Runs:", summaryA.zoneBreakdown.point.runs, "(Expected: 1)");
console.log("Cover Runs (4s):", summaryA.zoneBreakdown.cover.runs, "4s:", summaryA.zoneBreakdown.cover.fours, "(Expected: 4, 1)");
console.log("Mid Wicket Runs:", summaryA.zoneBreakdown.mid_wicket.runs, "(Expected: 2)");
console.log("Long On Runs (6s):", summaryA.zoneBreakdown.long_on.runs, "6s:", summaryA.zoneBreakdown.long_on.sixes, "(Expected: 6, 1)");

if (
  summaryA.totalRuns === 13 &&
  summaryA.mappedRuns === 13 &&
  summaryA.zoneBreakdown.point.runs === 1 &&
  summaryA.zoneBreakdown.cover.runs === 4 &&
  summaryA.zoneBreakdown.mid_wicket.runs === 2 &&
  summaryA.zoneBreakdown.long_on.runs === 6
) {
  console.log(">>> TEST 1 PASS!");
} else {
  console.error(">>> TEST 1 FAILED!");
  process.exit(1);
}

// TEST 2: Batter B with Unmapped / Skip option
const batterBDeliveries = [
  { strikerId: "batter-b", runsOffBat: 1, shotZone: "unmapped", overNumber: 1, ballNumber: 1 },
  { strikerId: "batter-b", runsOffBat: 4, shotZone: null, overNumber: 1, ballNumber: 2 },
];

const summaryB = calculateBatterWagonWheel("batter-b", "Batter Beta", batterBDeliveries);

console.log("\n[TEST 2: Batter B - Unmapped / Skip Option]");
console.log("Total Runs:", summaryB.totalRuns, "(Expected: 5)");
console.log("Mapped Runs:", summaryB.mappedRuns, "(Expected: 0)");
console.log("Unmapped Runs:", summaryB.unmappedRuns, "(Expected: 5)");
console.log("Has Location Data:", summaryB.hasLocationData, "(Expected: false)");

if (
  summaryB.totalRuns === 5 &&
  summaryB.mappedRuns === 0 &&
  summaryB.unmappedRuns === 5 &&
  summaryB.hasLocationData === false
) {
  console.log(">>> TEST 2 PASS! (No automatic fallback/guessing)");
} else {
  console.error(">>> TEST 2 FAILED!");
  process.exit(1);
}

// TEST 3: Mixed Deliveries & Player Filter Isolation
const combinedDeliveries = [...batterADeliveries, ...batterBDeliveries];
const isolatedSummaryA = calculateBatterWagonWheel("batter-a", "Batter Alpha", combinedDeliveries);
const isolatedSummaryB = calculateBatterWagonWheel("batter-b", "Batter Beta", combinedDeliveries);

console.log("\n[TEST 3: Player Filter Isolation]");
console.log("Isolated Batter A Total:", isolatedSummaryA.totalRuns, "Shots:", isolatedSummaryA.shots.length);
console.log("Isolated Batter B Total:", isolatedSummaryB.totalRuns, "Shots:", isolatedSummaryB.shots.length);

if (
  isolatedSummaryA.totalRuns === 13 &&
  isolatedSummaryA.shots.length === 4 &&
  isolatedSummaryB.totalRuns === 5 &&
  isolatedSummaryB.shots.length === 2
) {
  console.log(">>> TEST 3 PASS! (Players isolated completely)");
} else {
  console.error(">>> TEST 3 FAILED!");
  process.exit(1);
}

console.log("\nALL WAGON WHEEL SCENARIOS VERIFIED SUCCESSFULLY.");
