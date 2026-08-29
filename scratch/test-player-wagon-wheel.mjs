import { calculateBatterWagonWheel } from "../src/lib/scoring/wagon-wheel.ts";

console.log("==================================================");
console.log("TPL 2026 — PLAYER-SPECIFIC WAGON WHEEL TESTS");
console.log("==================================================");

// Scenario 1: Player A vs Player B isolation
const playerADeliveries = [
  { strikerId: "player-a", runsOffBat: 1, shotZone: "point", overNumber: 0, ballNumber: 1 },
  { strikerId: "player-a", runsOffBat: 4, shotZone: "cover", overNumber: 0, ballNumber: 2 },
  { strikerId: "player-a", runsOffBat: 6, shotZone: "long_on", overNumber: 0, ballNumber: 3 },
];

const playerBDeliveries = [
  { strikerId: "player-b", runsOffBat: 2, shotZone: "mid_wicket", overNumber: 1, ballNumber: 1 },
  { strikerId: "player-b", runsOffBat: 4, shotZone: "square_leg", overNumber: 1, ballNumber: 2 },
];

console.log("\n[TEST 1: Player A Individual Wagon Wheel]");
const summaryA = calculateBatterWagonWheel("player-a", "Player A", playerADeliveries);
console.log("Player A Total Runs:", summaryA.totalRuns, "(Expected: 11)");
console.log("Player A Mapped Runs:", summaryA.mappedRuns, "(Expected: 11)");
console.log("Player A Unmapped Runs:", summaryA.unmappedRuns, "(Expected: 0)");
console.log("Player A Shot Count:", summaryA.shots.length, "(Expected: 3)");

const coverA = summaryA.zoneBreakdown.cover;
const pointA = summaryA.zoneBreakdown.point;
const longOnA = summaryA.zoneBreakdown.long_on;
console.log("Player A Cover Runs:", coverA?.runs, "(Expected: 4)");
console.log("Player A Point Runs:", pointA?.runs, "(Expected: 1)");
console.log("Player A Long On Runs:", longOnA?.runs, "(Expected: 6)");

if (summaryA.totalRuns === 11 && coverA?.runs === 4 && pointA?.runs === 1 && longOnA?.runs === 6) {
  console.log(">>> TEST 1 PASS!");
} else {
  console.error(">>> TEST 1 FAILED!");
  process.exit(1);
}

console.log("\n[TEST 2: Player B Individual Wagon Wheel (Complete Isolation)]");
const summaryB = calculateBatterWagonWheel("player-b", "Player B", playerBDeliveries);
console.log("Player B Total Runs:", summaryB.totalRuns, "(Expected: 6)");
console.log("Player B Shot Count:", summaryB.shots.length, "(Expected: 2)");

const midWicketB = summaryB.zoneBreakdown.mid_wicket;
const squareLegB = summaryB.zoneBreakdown.square_leg;
const coverB = summaryB.zoneBreakdown.cover;
console.log("Player B Mid Wicket Runs:", midWicketB?.runs, "(Expected: 2)");
console.log("Player B Square Leg Runs:", squareLegB?.runs, "(Expected: 4)");
console.log("Player B Cover Runs:", coverB?.runs, "(Expected: 0 - isolated from Player A)");

if (summaryB.totalRuns === 6 && midWicketB?.runs === 2 && squareLegB?.runs === 4 && (!coverB || coverB.runs === 0)) {
  console.log(">>> TEST 2 PASS!");
} else {
  console.error(">>> TEST 2 FAILED!");
  process.exit(1);
}

console.log("\n[TEST 3: Unmapped Shot Test (Skip / Not Recorded)]");
const unmappedDeliveries = [
  { strikerId: "player-c", runsOffBat: 4, shotZone: "unmapped", overNumber: 0, ballNumber: 1 },
];
const summaryC = calculateBatterWagonWheel("player-c", "Player C", unmappedDeliveries);
console.log("Player C Total Runs:", summaryC.totalRuns, "(Expected: 4)");
console.log("Player C Mapped Runs:", summaryC.mappedRuns, "(Expected: 0)");
console.log("Player C Unmapped Runs:", summaryC.unmappedRuns, "(Expected: 4)");
console.log("Player C Mapped Shots on Field:", summaryC.shots.length, "(Expected: 0)");

if (summaryC.totalRuns === 4 && summaryC.mappedRuns === 0 && summaryC.unmappedRuns === 4 && summaryC.shots.length === 0) {
  console.log(">>> TEST 3 PASS!");
} else {
  console.error(">>> TEST 3 FAILED!");
  process.exit(1);
}

console.log("\nALL PLAYER-SPECIFIC WAGON WHEEL TESTS PASSED SUCCESSFULLY.");
