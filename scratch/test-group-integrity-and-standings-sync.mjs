import assert from "node:assert";
import { lookup, toTeam, toPlayer, toMatch } from "../src/lib/repositories.ts";
import { calculateStandings } from "../src/lib/scoring/standings.ts";

console.log("================================================================================");
console.log("TPL 2026: TEAM GROUP IMMUTABILITY & STANDINGS AUTO-UPDATE REGRESSION SUITE");
console.log("================================================================================");

const rawMasterTeams = [
  { id: "team-du", name: "Dainagoda United", slug: "dainagoda-united", group_name: "Group 1", short_name: "DU" },
  { id: "team-bmr", name: "Bary Mawathe Royals", slug: "bary-mawathe-royals", group_name: "Group 1", short_name: "BMR" },
  { id: "team-kl", name: "Kurunduwatte Legends", slug: "kurunduwatte-legends", group_name: "Group 1", short_name: "KL" },
  { id: "team-ngw", name: "New Garden Warriors", slug: "new-garden-warriors", group_name: "Group 2", short_name: "NGW" },
  { id: "team-rk", name: "Riverside Kings", slug: "riverside-kings", group_name: "Group 2", short_name: "RK" },
  { id: "team-tc", name: "Thundu Capital", slug: "thundu-capital", group_name: "Group 2", short_name: "TC" },
];

const rawMasterPlayers = Array.from({ length: 89 }, (_, i) => ({
  id: `p-${i + 1}`,
  player_name: `Player ${i + 1}`,
  team_id: rawMasterTeams[i % 6].id,
  player_role: "All-rounder",
}));

const masterTeams = rawMasterTeams.map(toTeam);
const masterPlayers = rawMasterPlayers.map(toPlayer);

lookup.setTeams(masterTeams);
lookup.setPlayers(masterPlayers);
lookup.setMatches([]);

// TEST 1: Initial state - 0 matches scheduled -> Standings is EMPTY ([])
const initialStandings = calculateStandings(lookup.teams(), lookup.matches());
assert.strictEqual(initialStandings.length, 0, "Standings must be empty array when 0 matches are scheduled");
console.log("  ✓ TEST 1: Initial state: 0 matches -> Standings is EMPTY ([]) to render empty state.");

// TEST 2: Single Match Creation between Intra-Group teams (BMR vs DU) must NOT change groups
const match1 = toMatch({
  id: "m-01",
  team_a_id: "team-bmr",
  team_b_id: "team-du",
  start_time: "2026-08-30T09:00:00Z",
  status: "scheduled",
  total_overs: 5,
  balls_per_over: 6,
}, 1);
lookup.upsertMatch(match1);

assert.strictEqual(lookup.team("team-bmr")?.groupName, "Group 1", "BMR remains Group 1");
assert.strictEqual(lookup.team("team-du")?.groupName, "Group 1", "DU remains Group 1");
console.log("  ✓ TEST 2: Intra-group match creation (BMR vs DU) preserves Group 1 for both teams.");

// TEST 3: Single Match Creation between Cross-Group teams (BMR vs NGW) must NOT change groups
const match2 = toMatch({
  id: "m-02",
  team_a_id: "team-bmr",
  team_b_id: "team-ngw",
  start_time: "2026-08-30T10:00:00Z",
  status: "scheduled",
  total_overs: 5,
  balls_per_over: 6,
}, 2);
lookup.upsertMatch(match2);

assert.strictEqual(lookup.team("team-bmr")?.groupName, "Group 1", "BMR remains Group 1");
assert.strictEqual(lookup.team("team-ngw")?.groupName, "Group 2", "NGW remains Group 2");
console.log("  ✓ TEST 3: Cross-group match creation (BMR vs NGW) preserves Group 1 and Group 2.");

// TEST 4: Generate 9 cross-group fixtures does NOT overwrite team groups
const generatedFixtures = [];
let idx = 3;
for (const g1 of ["team-du", "team-bmr", "team-kl"]) {
  for (const g2 of ["team-ngw", "team-rk", "team-tc"]) {
    generatedFixtures.push(toMatch({
      id: `m-gen-${idx}`,
      team_a_id: g1,
      team_b_id: g2,
      start_time: "2026-08-30T11:00:00Z",
      status: "scheduled",
      total_overs: 5,
      balls_per_over: 6,
    }, idx));
    idx++;
  }
}
lookup.setMatches(generatedFixtures);

assert.strictEqual(lookup.team("team-du")?.groupName, "Group 1");
assert.strictEqual(lookup.team("team-bmr")?.groupName, "Group 1");
assert.strictEqual(lookup.team("team-kl")?.groupName, "Group 1");
assert.strictEqual(lookup.team("team-ngw")?.groupName, "Group 2");
assert.strictEqual(lookup.team("team-rk")?.groupName, "Group 2");
assert.strictEqual(lookup.team("team-tc")?.groupName, "Group 2");
const scheduledStandings = calculateStandings(lookup.teams(), lookup.matches());
assert.strictEqual(scheduledStandings.length, 6, "All 6 participating scheduled teams present in standings");
scheduledStandings.forEach((st) => {
  assert.strictEqual(st.played, 0);
  assert.strictEqual(st.points, 0);
  assert.strictEqual(st.nrr, 0);
});
console.log("  ✓ TEST 4: Schedule generation creates active standings for all 6 teams (all P:0, PTS:0, NRR:0.00).");

// TEST 5: Complete a match (Bary Mawathe Royals wins vs New Garden Warriors)
const completedMatch1 = {
  ...match2,
  status: "COMPLETED",
  winnerId: "team-bmr",
  resultText: "Bary Mawathe Royals won by 15 runs",
};
lookup.setMatches([completedMatch1]);

const standingsAfterMatch1 = calculateStandings(lookup.teams(), lookup.matches());
const bmrStats = standingsAfterMatch1.find((st) => st.teamId === "team-bmr");
const ngwStats = standingsAfterMatch1.find((st) => st.teamId === "team-ngw");
const unplayedStats = standingsAfterMatch1.find((st) => st.teamId === "team-du");

assert.strictEqual(bmrStats?.played, 1, "BMR played 1 match");
assert.strictEqual(bmrStats?.won, 1, "BMR won 1 match");
assert.strictEqual(bmrStats?.lost, 0, "BMR lost 0 matches");
assert.strictEqual(bmrStats?.points, 2, "BMR has 2 points");

assert.strictEqual(ngwStats?.played, 1, "NGW played 1 match");
assert.strictEqual(ngwStats?.won, 0, "NGW won 0 matches");
assert.strictEqual(ngwStats?.lost, 1, "NGW lost 1 match");
assert.strictEqual(ngwStats?.points, 0, "NGW has 0 points");

assert.strictEqual(unplayedStats, undefined, "DU is not in completedMatch1, only participating teams exist in standings");
console.log("  ✓ TEST 5: Match 1 Result auto-updates Standings (Winner: +1 W, +2 PTS; Loser: +1 L, 0 PTS).");

// TEST 6: Complete second match (Riverside Kings wins vs Dainagoda United)
const completedMatch2 = {
  id: "m-03",
  tournament: "TPL 2026",
  matchNumber: 2,
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T12:00:00Z",
  teamAId: "team-du",
  teamBId: "team-rk",
  status: "COMPLETED",
  winnerId: "team-rk",
  resultText: "Riverside Kings won by 4 wickets",
};
lookup.setMatches([completedMatch1, completedMatch2]);

const standingsAfterMatch2 = calculateStandings(lookup.teams(), lookup.matches());
const rkStats = standingsAfterMatch2.find((st) => st.teamId === "team-rk");
const duStats = standingsAfterMatch2.find((st) => st.teamId === "team-du");

assert.strictEqual(rkStats?.played, 1);
assert.strictEqual(rkStats?.won, 1);
assert.strictEqual(rkStats?.points, 2);

assert.strictEqual(duStats?.played, 1);
assert.strictEqual(duStats?.lost, 1);
assert.strictEqual(duStats?.points, 0);
console.log("  ✓ TEST 6: Match 2 Result auto-updates Standings (RK: 2 PTS, DU: 0 PTS).");

// TEST 7: Correcting a match result recalculates standings cleanly without duplicate accumulation
const correctedMatch1 = {
  ...completedMatch1,
  winnerId: "team-ngw",
  resultText: "New Garden Warriors won by 2 runs",
};
lookup.setMatches([correctedMatch1, completedMatch2]);

const correctedStandings = calculateStandings(lookup.teams(), lookup.matches());
const bmrCorrected = correctedStandings.find((st) => st.teamId === "team-bmr");
const ngwCorrected = correctedStandings.find((st) => st.teamId === "team-ngw");

assert.strictEqual(bmrCorrected?.points, 0, "BMR points corrected to 0");
assert.strictEqual(bmrCorrected?.won, 0, "BMR wins corrected to 0");
assert.strictEqual(bmrCorrected?.lost, 1, "BMR losses corrected to 1");

assert.strictEqual(ngwCorrected?.points, 2, "NGW points corrected to 2");
assert.strictEqual(ngwCorrected?.won, 1, "NGW wins corrected to 1");
assert.strictEqual(ngwCorrected?.lost, 0, "NGW losses corrected to 0");
console.log("  ✓ TEST 7: Result correction dynamically updates Standings with 0 duplicate point drift.");

// TEST 8: Tied match awards 1 point each
const tiedMatch = {
  ...completedMatch1,
  winnerId: undefined,
  resultText: "Match Tied (Scores Level)",
};
lookup.setMatches([tiedMatch, completedMatch2]);

const tiedStandings = calculateStandings(lookup.teams(), lookup.matches());
const bmrTied = tiedStandings.find((st) => st.teamId === "team-bmr");
const ngwTied = tiedStandings.find((st) => st.teamId === "team-ngw");

assert.strictEqual(bmrTied?.tied, 1, "BMR tied 1");
assert.strictEqual(bmrTied?.points, 1, "BMR has 1 point from tie");
assert.strictEqual(ngwTied?.tied, 1, "NGW tied 1");
assert.strictEqual(ngwTied?.points, 1, "NGW has 1 point from tie");
console.log("  ✓ TEST 8: Tied match correctly awards 1 point to each team.");

// TEST 9: Reset All Matches returns Standings to empty ([]) and preserves master teams/groups
lookup.setMatches([]);
const resetStandings = calculateStandings(lookup.teams(), lookup.matches());

assert.strictEqual(resetStandings.length, 0, "Reset matches results in empty standings array to trigger empty state");
assert.strictEqual(lookup.teams().length, 6, "6 master teams preserved");
assert.strictEqual(lookup.players().length, 89, "89 registered players preserved");
assert.strictEqual(lookup.team("team-du")?.groupName, "Group 1", "DU is Group 1");
assert.strictEqual(lookup.team("team-tc")?.groupName, "Group 2", "TC is Group 2");
console.log("  ✓ TEST 9: Reset All Matches returns empty standings array while strictly preserving teams, groups, and players.");

console.log("================================================================================");
console.log(">>> ALL TEAM GROUP & STANDINGS INTEGRITY TESTS PASSED (100% GREEN)!");
console.log("================================================================================");
