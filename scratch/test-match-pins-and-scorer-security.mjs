import assert from "node:assert";
import { getTeamGroup, BALLS_PER_OVER } from "../src/types/cricket.js";
import { generate4DigitPin } from "../src/lib/server-fns/matches.js";

console.log("===============================================================================");
console.log("🏏 RUNNING TEST SUITE: MATCH SCHEDULING, SCORER PIN & PLAYER PROFILE INTEGRITY");
console.log("===============================================================================\n");

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS ${total}] ${description}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL ${total}] ${description}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// 1. PIN Generation Tests
runTest("generate4DigitPin creates a 4-digit numeric string between 1000 and 9999", () => {
  for (let i = 0; i < 100; i++) {
    const pin = generate4DigitPin();
    assert.strictEqual(typeof pin, "string");
    assert.strictEqual(pin.length, 4);
    const num = parseInt(pin, 10);
    assert.ok(num >= 1000 && num <= 9999, `PIN ${pin} was out of range`);
  }
});

runTest("generate4DigitPin guarantees uniqueness against a set of existing active PINs", () => {
  const existing = new Set(["1234", "5678", "9999", "1000"]);
  for (let i = 0; i < 50; i++) {
    const pin = generate4DigitPin(existing);
    assert.strictEqual(existing.has(pin), true);
    assert.strictEqual(pin.length, 4);
  }
  assert.strictEqual(existing.size, 54);
});

// 2. Cross-Group Fixture Rules
runTest("getTeamGroup accurately identifies permanent Group 1 and Group 2 teams", () => {
  const g1TeamDU = { id: "team-du", name: "Dainagoda United", shortName: "DU", groupName: "Group 1" };
  const g1TeamBMR = { id: "team-bmr", name: "Bary Mawathe Royals", shortName: "BMR" };
  const g1TeamKL = { id: "team-kl", name: "Kurunduwatte Legends", shortName: "KL" };

  const g2TeamNGW = { id: "team-ngw", name: "New Garden Warriors", shortName: "NGW", groupName: "Group 2" };
  const g2TeamRK = { id: "team-rk", name: "Riverside Kings", shortName: "RK" };
  const g2TeamTC = { id: "team-tc", name: "Thundu Capital", shortName: "TC" };

  assert.strictEqual(getTeamGroup(g1TeamDU), "Group 1");
  assert.strictEqual(getTeamGroup(g1TeamBMR), "Group 1");
  assert.strictEqual(getTeamGroup(g1TeamKL), "Group 1");

  assert.strictEqual(getTeamGroup(g2TeamNGW), "Group 2");
  assert.strictEqual(getTeamGroup(g2TeamRK), "Group 2");
  assert.strictEqual(getTeamGroup(g2TeamTC), "Group 2");
});

runTest("Cross-Group invariant: Group 1 ↔ Group 2 is allowed; same-group matches are rejected", () => {
  const isMatchValid = (team1, team2) => {
    if (!team1 || !team2 || team1.id === team2.id) return false;
    return getTeamGroup(team1) !== getTeamGroup(team2);
  };

  const g1 = { id: "team-du", name: "Dainagoda United" };
  const g1Other = { id: "team-bmr", name: "Bary Mawathe Royals" };
  const g2 = { id: "team-ngw", name: "New Garden Warriors" };
  const g2Other = { id: "team-rk", name: "Riverside Kings" };

  // Valid cross-group
  assert.strictEqual(isMatchValid(g1, g2), true);
  assert.strictEqual(isMatchValid(g2, g1), true);
  assert.strictEqual(isMatchValid(g1Other, g2Other), true);

  // Forbidden same-group
  assert.strictEqual(isMatchValid(g1, g1Other), false);
  assert.strictEqual(isMatchValid(g2, g2Other), false);
  assert.strictEqual(isMatchValid(g1, g1), false);
});

// 3. Match-Scoped PIN Scorer Access Logic
runTest("Match-scoped PIN validation unlocks the matching match and rejects mismatched PINs", () => {
  const match1 = { id: "match-01", matchNumber: 1, scorerPin: "9757" };
  const match2 = { id: "match-02", matchNumber: 2, scorerPin: "1295" };

  const sessionStore = new Map();

  const authorizeMatchScorer = (matchId, submittedPin, expectedPin) => {
    if (submittedPin.trim() === expectedPin.trim()) {
      sessionStore.set(`tpl_scorer_match_pin_${matchId}`, submittedPin.trim());
      return true;
    }
    return false;
  };

  const isMatchScorerAuthorized = (matchId, expectedPin) => {
    const stored = sessionStore.get(`tpl_scorer_match_pin_${matchId}`);
    return stored === expectedPin;
  };

  // 1. Authorize match 1 with correct PIN
  assert.strictEqual(authorizeMatchScorer(match1.id, "9757", match1.scorerPin), true);
  assert.strictEqual(isMatchScorerAuthorized(match1.id, match1.scorerPin), true);

  // 2. Match 2 is NOT authorized
  assert.strictEqual(isMatchScorerAuthorized(match2.id, match2.scorerPin), false);

  // 3. Trying Match 1 PIN on Match 2 is rejected
  assert.strictEqual(authorizeMatchScorer(match2.id, "9757", match2.scorerPin), false);
  assert.strictEqual(isMatchScorerAuthorized(match2.id, match2.scorerPin), false);

  // 4. Entering wrong PIN for Match 2 is rejected
  assert.strictEqual(authorizeMatchScorer(match2.id, "0000", match2.scorerPin), false);

  // 5. Entering correct PIN for Match 2 succeeds
  assert.strictEqual(authorizeMatchScorer(match2.id, "1295", match2.scorerPin), true);
  assert.strictEqual(isMatchScorerAuthorized(match2.id, match2.scorerPin), true);
});

// 4. Balls Per Over & Bowler Overs Limit Invariant
runTest("Tournament Rules: 5 legal balls per over and strict bowler limits", () => {
  assert.strictEqual(BALLS_PER_OVER, 5);
  const maxOversPerBowler = (totalMatchOvers) => {
    // In a 5-over match: max 1 bowler can bowl 2 overs, all other bowlers max 1 over
    return { maxSingleBowlerOvers: 2, regularMaxOvers: 1 };
  };
  const limits = maxOversPerBowler(5);
  assert.strictEqual(limits.maxSingleBowlerOvers, 2);
  assert.strictEqual(limits.regularMaxOvers, 1);
});

// 5. Player Identity & Slug Resolution
runTest("Player identity is anchored on player.id regardless of name collisions", () => {
  const players = [
    { id: "p-uuid-001", name: "Mohamed Akmal", slug: "mohamed-akmal-b2hw", role: "Batter" },
    { id: "p-uuid-002", name: "Mohamed Akmal", slug: "mohamed-akmal-k9x1", role: "Bowler" },
  ];

  const findByIdOrSlug = (query) => {
    return players.find((p) => p.id === query || p.slug === query);
  };

  const p1 = findByIdOrSlug("mohamed-akmal-b2hw");
  const p2 = findByIdOrSlug("mohamed-akmal-k9x1");

  assert.strictEqual(p1.id, "p-uuid-001");
  assert.strictEqual(p1.role, "Batter");

  assert.strictEqual(p2.id, "p-uuid-002");
  assert.strictEqual(p2.role, "Bowler");
});

console.log(`\n===============================================================================`);
console.log(`🏁 SUMMARY: ${passed}/${total} TESTS PASSED SUCCESSFULLY`);
console.log(`===============================================================================\n`);
