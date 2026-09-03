import assert from "assert";

// Mock localStorage
global.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  }
};

import { toPlayer } from "../src/lib/repositories.ts";

console.log("================================================================================");
console.log("TPL 2026: PLAYER ROLE PARSING AUDIT");
console.log("================================================================================");

function runTests() {
  // Test 1: New player with 'all-rounder' in DB should default to Batter
  const p1Raw = { id: "p1", name: "Player 1", player_role: "All-Rounder", team_id: "t1" };
  const p1 = toPlayer(p1Raw);
  assert.strictEqual(p1.role, "Batter", "Expected All-Rounder in DB to fallback to Batter");
  console.log("  ✓ TEST 1 PASS: 'All-Rounder' in database defaults to 'Batter'");

  // Test 2: 'bowler' in DB should parse as Bowler
  const p2Raw = { id: "p2", name: "Player 2", player_role: "Bowler", team_id: "t1" };
  const p2 = toPlayer(p2Raw);
  assert.strictEqual(p2.role, "Bowler", "Expected Bowler to parse as Bowler");
  console.log("  ✓ TEST 2 PASS: 'Bowler' in database parses as 'Bowler'");

  // Test 3: 'wicketkeeper' in DB should parse as Wicketkeeper
  const p3Raw = { id: "p3", name: "Player 3", player_role: "Wicketkeeper", team_id: "t1" };
  const p3 = toPlayer(p3Raw);
  assert.strictEqual(p3.role, "Wicketkeeper", "Expected Wicketkeeper to parse as Wicketkeeper");
  console.log("  ✓ TEST 3 PASS: 'Wicketkeeper' in database parses as 'Wicketkeeper'");

  // Test 4: Empty or random string should default to Batter
  const p4Raw = { id: "p4", name: "Player 4", player_role: "Superstar", team_id: "t1" };
  const p4 = toPlayer(p4Raw);
  assert.strictEqual(p4.role, "Batter", "Expected unknown role to default to Batter");
  console.log("  ✓ TEST 4 PASS: Unknown role defaults to 'Batter'");

  console.log("================================================================================");
  console.log(">>> ALL 4 PLAYER ROLE TESTS PASSED (100% GREEN)!");
  console.log("================================================================================");
}

runTests();
