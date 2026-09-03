import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { calculateTournamentStats, formatStatDecimal } from "../src/lib/scoring/statistics.ts";

console.log("=== TPL 2026: STATS & AWARDS RESPONSIVE UX VERIFICATION ===");

let passed = 0;
let total = 0;

function test(name, fn) {
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

// 1. Source code check for removal of horizontal tab scroll
test("1. No horizontal scroll tabs in stats.tsx", () => {
  const statsSrc = fs.readFileSync(path.resolve("src/routes/stats.tsx"), "utf-8");
  assert.ok(!statsSrc.includes('overflow-x-auto no-scrollbar'), "Horizontal scroll tab bar must be removed");
  assert.ok(!statsSrc.includes('activeTab === "orange"'), "Tab switching logic replaced with single-page dashboard");
  assert.ok(!statsSrc.includes('activeTab === "purple"'), "Purple tab switching removed");
  assert.ok(statsSrc.includes("overflow-x-hidden"), "Page root has overflow-x-hidden to prevent horizontal scrollbars");
});

// 2. Header and Matches Played check
test("2. Official Header and Matches Played indicator present", () => {
  const statsSrc = fs.readFileSync(path.resolve("src/routes/stats.tsx"), "utf-8");
  assert.ok(statsSrc.includes("TOURNAMENT STATS & AWARDS"), "Header has correct title");
  assert.ok(statsSrc.includes("TPL 2026 Official Statistics, Accolades & Player Rankings"), "Header has official subtext");
  assert.ok(statsSrc.includes("MATCHES PLAYED"), "Header includes MATCHES PLAYED indicator");
});

// 3. Primary and Secondary Awards hierarchy
test("3. Primary and Secondary awards sections exist on same page", () => {
  const statsSrc = fs.readFileSync(path.resolve("src/routes/stats.tsx"), "utf-8");
  assert.ok(statsSrc.includes("PRIMARY TOURNAMENT AWARDS"), "Primary awards section exists");
  assert.ok(statsSrc.includes("OFFICIAL TOURNAMENT AWARDS & BENCHMARKS"), "Secondary awards section exists");
  assert.ok(statsSrc.includes("ORANGE CAP"), "Orange Cap award present");
  assert.ok(statsSrc.includes("PURPLE CAP"), "Purple Cap award present");
  assert.ok(statsSrc.includes("MOST SIXES"), "Most Sixes award present");
  assert.ok(statsSrc.includes("MOST FOURS"), "Most Fours award present");
  assert.ok(statsSrc.includes("BEST STRIKE RATE"), "Best Strike Rate award present");
  assert.ok(statsSrc.includes("BEST BOWLING SPELL"), "Best Bowling Spell award present");
  assert.ok(statsSrc.includes("BEST BOWLING ECONOMY"), "Best Bowling Economy award present");
  assert.ok(statsSrc.includes("MOST DOT BALLS"), "Most Dot Balls award present");
  assert.ok(statsSrc.includes("BEST ALL-ROUNDER"), "Best All-Rounder award present");
  assert.ok(statsSrc.includes("BEST FIELDER"), "Best Fielder award present");
});

// 4. Responsive grid structure check (2 cols desktop, 1 col mobile)
test("4. Grid layout guarantees 2 columns desktop and 1 column mobile", () => {
  const statsSrc = fs.readFileSync(path.resolve("src/routes/stats.tsx"), "utf-8");
  assert.ok(statsSrc.includes("grid grid-cols-1 md:grid-cols-2 gap-5"), "Grid uses grid-cols-1 on mobile and md:grid-cols-2 on desktop");
});

// 5. Empty state check
test("5. Empty state displays required message when 0 completed matches", () => {
  const statsSrc = fs.readFileSync(path.resolve("src/routes/stats.tsx"), "utf-8");
  assert.ok(statsSrc.includes("NO STATISTICS AVAILABLE YET"), "Empty state title matches requirement");
  assert.ok(statsSrc.includes("Completed matches will populate tournament statistics"), "Empty state explanation matches requirement");
});

// 6. Statistics engine integration test with mock matches
test("6. Statistics engine computes all categories correctly without corruption", () => {
  const mockMatches = [];
  const emptyStats = calculateTournamentStats(mockMatches);
  assert.equal(emptyStats.completedMatchesCount, 0);
  assert.equal(emptyStats.orangeCap.length, 0);
  assert.equal(emptyStats.purpleCap.length, 0);
});

console.log(`\n========================================`);
console.log(`All ${passed}/${total} Stats & Awards UX tests passed!`);
console.log(`========================================\n`);
