import assert from "node:assert";
import { lookup, toTeam, toMatch, matchRepository } from "../src/lib/repositories.ts";
import { calculateStandings, getGroupedTournamentStandings } from "../src/lib/scoring/standings.ts";

console.log("================================================================================");
console.log("TPL 2026: RESET PENDING FIXTURES & COMPLETED MATCH IMMUTABILITY TEST SUITE");
console.log("================================================================================");

const rawTeams = [
  { id: "team-bmr", name: "Bary Mawathe Royals", slug: "bary-mawathe-royals", group_name: "Group 1", short_name: "BMR" },
  { id: "team-du", name: "Dainagoda United", slug: "dainagoda-united", group_name: "Group 1", short_name: "DU" },
  { id: "team-kl", name: "Kurunduwatte Legends", slug: "kurunduwatte-legends", group_name: "Group 1", short_name: "KL" },
  { id: "team-ngw", name: "New Garden Warriors", slug: "new-garden-warriors", group_name: "Group 2", short_name: "NGW" },
  { id: "team-rk", name: "Riverside Kings", slug: "riverside-kings", group_name: "Group 2", short_name: "RK" },
  { id: "team-tc", name: "Thundu Capital", slug: "thundu-capital", group_name: "Group 2", short_name: "TC" },
];

const masterTeams = rawTeams.map(toTeam);
lookup.setTeams(masterTeams);

// ── SETUP INITIAL TOURNAMENT STATE ───────────────────────────────────────────
// Match 1: COMPLETED (Bary Mawathe Royals vs New Garden Warriors)
const match1 = {
  id: "match-01",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "team-bmr",
  teamBId: "team-ngw",
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T09:00:00Z",
  status: "COMPLETED",
  winnerId: "team-bmr",
  resultText: "Bary Mawathe Royals won by 15 runs",
};

// Match 2, 3, 4: UPCOMING / SCHEDULED
const match2 = {
  id: "match-02",
  tournament: "TPL 2026",
  matchNumber: 2,
  teamAId: "team-du",
  teamBId: "team-rk",
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T10:00:00Z",
  status: "UPCOMING",
};

const match3 = {
  id: "match-03",
  tournament: "TPL 2026",
  matchNumber: 3,
  teamAId: "team-kl",
  teamBId: "team-tc",
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T11:00:00Z",
  status: "UPCOMING",
};

const match4 = {
  id: "match-04",
  tournament: "TPL 2026",
  matchNumber: 4,
  teamAId: "team-bmr",
  teamBId: "team-rk",
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T12:00:00Z",
  status: "UPCOMING",
};

// Match 5: LIVE
const match5 = {
  id: "match-05",
  tournament: "TPL 2026",
  matchNumber: 5,
  teamAId: "team-du",
  teamBId: "team-tc",
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T13:00:00Z",
  status: "LIVE",
};

lookup.setMatches([match1, match2, match3, match4, match5]);

console.log("\n[TEST 1: Initial Tournament State Verification]");
const initialMatches = lookup.matches();
assert.strictEqual(initialMatches.length, 5);
console.log("  ✓ Total initial matches: 5 (1 COMPLETED, 3 UPCOMING, 1 LIVE)");

// Initial Standings before reset
const standingsBefore = calculateStandings(masterTeams, initialMatches);
const bmrStandingBefore = standingsBefore.find((s) => s.teamId === "team-bmr");
const ngwStandingBefore = standingsBefore.find((s) => s.teamId === "team-ngw");

assert.ok(bmrStandingBefore);
assert.strictEqual(bmrStandingBefore.played, 1);
assert.strictEqual(bmrStandingBefore.won, 1);
assert.strictEqual(bmrStandingBefore.points, 2);

assert.ok(ngwStandingBefore);
assert.strictEqual(ngwStandingBefore.played, 1);
assert.strictEqual(ngwStandingBefore.lost, 1);
assert.strictEqual(ngwStandingBefore.points, 0);
console.log("  ✓ TEST 1 PASS: Initial standings accurately computed from Match #01 (BMR: 2 pts, NGW: 0 pts).");

// ── TEST 2: EXECUTE RESET PENDING FIXTURES ───────────────────────────────────
console.log("\n[TEST 2: Execute resetPendingFixtures()]");
await matchRepository.resetPendingFixtures();

const matchesAfterReset = lookup.matches();
console.log(`  Remaining matches count: ${matchesAfterReset.length}`);

// Match 1 (COMPLETED) MUST STILL EXIST
const preservedCompleted = matchesAfterReset.find((m) => m.id === "match-01");
assert.ok(preservedCompleted, "Completed Match #01 MUST be preserved!");
assert.strictEqual(preservedCompleted.status, "COMPLETED");
assert.strictEqual(preservedCompleted.winnerId, "team-bmr");
assert.strictEqual(preservedCompleted.resultText, "Bary Mawathe Royals won by 15 runs");
console.log("  ✓ Match #01 (COMPLETED) is strictly preserved with all results & winner intact.");

// Match 5 (LIVE) MUST STILL EXIST
const preservedLive = matchesAfterReset.find((m) => m.id === "match-05");
assert.ok(preservedLive, "Live Match #05 MUST be preserved!");
assert.strictEqual(preservedLive.status, "LIVE");
console.log("  ✓ Match #05 (LIVE) is strictly preserved.");

// Match 2, 3, 4 (UPCOMING) MUST BE DELETED
assert.strictEqual(matchesAfterReset.find((m) => m.id === "match-02"), undefined);
assert.strictEqual(matchesAfterReset.find((m) => m.id === "match-03"), undefined);
assert.strictEqual(matchesAfterReset.find((m) => m.id === "match-04"), undefined);
console.log("  ✓ Match #02, #03, #04 (SCHEDULED / UPCOMING) were safely removed.");

assert.strictEqual(matchesAfterReset.length, 2, "Only 2 matches should remain (Match #01 COMPLETED, Match #05 LIVE)");
console.log("  ✓ TEST 2 PASS: Exactly 2 matches remain after resetting pending fixtures.");

// ── TEST 3: POINTS TABLE & STANDINGS ARE PRESERVED ───────────────────────────
console.log("\n[TEST 3: Standings & Points Table Immutability after Reset]");
const standingsAfter = calculateStandings(masterTeams, matchesAfterReset);
const bmrStandingAfter = standingsAfter.find((s) => s.teamId === "team-bmr");
const ngwStandingAfter = standingsAfter.find((s) => s.teamId === "team-ngw");

assert.ok(bmrStandingAfter);
assert.strictEqual(bmrStandingAfter.played, 1);
assert.strictEqual(bmrStandingAfter.won, 1);
assert.strictEqual(bmrStandingAfter.lost, 0);
assert.strictEqual(bmrStandingAfter.points, 2);

assert.ok(ngwStandingAfter);
assert.strictEqual(ngwStandingAfter.played, 1);
assert.strictEqual(ngwStandingAfter.won, 0);
assert.strictEqual(ngwStandingAfter.lost, 1);
assert.strictEqual(ngwStandingAfter.points, 0);

console.log("  ✓ Bary Mawathe Royals: P=1, W=1, PTS=2 (Unchanged)");
console.log("  ✓ New Garden Warriors: P=1, L=1, PTS=0 (Unchanged)");
console.log("  ✓ TEST 3 PASS: Points and Standings are 100% preserved after resetting pending fixtures.");

// ── TEST 4: GROUP ASSIGNMENTS ARE PRESERVED ──────────────────────────────────
console.log("\n[TEST 4: Team Group Assignments Immutability]");
const groupedStandings = getGroupedTournamentStandings(masterTeams, matchesAfterReset);
assert.ok(groupedStandings.hasStandings);

const allTeams = lookup.teams();
assert.strictEqual(allTeams.find((t) => t.id === "team-bmr")?.groupName, "Group 1");
assert.strictEqual(allTeams.find((t) => t.id === "team-du")?.groupName, "Group 1");
assert.strictEqual(allTeams.find((t) => t.id === "team-kl")?.groupName, "Group 1");
assert.strictEqual(allTeams.find((t) => t.id === "team-ngw")?.groupName, "Group 2");
assert.strictEqual(allTeams.find((t) => t.id === "team-rk")?.groupName, "Group 2");
assert.strictEqual(allTeams.find((t) => t.id === "team-tc")?.groupName, "Group 2");
console.log("  ✓ Group 1 and Group 2 team memberships remain 100% intact.");
console.log("  ✓ TEST 4 PASS: Group assignments were not wiped or modified.");

// ── TEST 5: CALLING RESET WITH 0 PENDING FIXTURES ─────────────────────────────
console.log("\n[TEST 5: Calling resetPendingFixtures() when 0 pending fixtures exist]");
// Current matches: Match #01 (COMPLETED), Match #05 (LIVE)
await matchRepository.resetPendingFixtures();

const matchesAfterSecondReset = lookup.matches();
assert.strictEqual(matchesAfterSecondReset.length, 2);
assert.ok(matchesAfterSecondReset.find((m) => m.id === "match-01"));
assert.ok(matchesAfterSecondReset.find((m) => m.id === "match-05"));
console.log("  ✓ TEST 5 PASS: Calling reset with 0 pending fixtures safely preserves all existing completed/live records.");

console.log("\n================================================================================");
console.log(">>> ALL RESET PENDING FIXTURES SAFETY TESTS PASSED (100% GREEN)!");
console.log("================================================================================");
