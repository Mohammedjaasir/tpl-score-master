import assert from "node:assert";
import { lookup, toTeam, toMatch } from "../src/lib/repositories.ts";
import { calculateStandings, getGroupedTournamentStandings } from "../src/lib/scoring/standings.ts";
import { calculateTournamentStats } from "../src/lib/scoring/statistics.ts";

console.log("================================================================================");
console.log("TPL 2026: CROSS-GROUP MATCH STANDINGS SYNCHRONIZATION TEST SUITE");
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

// ── SCENARIO: 1 COMPLETED CROSS-GROUP MATCH + 8 SCHEDULED MATCHES ──────────
const match1 = {
  id: "match-01",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "team-bmr", // Group 1 / Group A
  teamBId: "team-ngw", // Group 2 / Group B
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T09:00:00Z",
  status: "COMPLETED",
  winnerId: "team-bmr",
  resultText: "Bary Mawathe Royals won by 15 runs",
};

const scheduledMatches = [
  { id: "match-02", tournament: "TPL 2026", matchNumber: 2, teamAId: "team-du", teamBId: "team-rk", scheduledAt: "2026-08-30T10:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-03", tournament: "TPL 2026", matchNumber: 3, teamAId: "team-kl", teamBId: "team-tc", scheduledAt: "2026-08-30T11:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-04", tournament: "TPL 2026", matchNumber: 4, teamAId: "team-bmr", teamBId: "team-rk", scheduledAt: "2026-08-30T12:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-05", tournament: "TPL 2026", matchNumber: 5, teamAId: "team-du", teamBId: "team-tc", scheduledAt: "2026-08-30T13:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-06", tournament: "TPL 2026", matchNumber: 6, teamAId: "team-kl", teamBId: "team-ngw", scheduledAt: "2026-08-30T14:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-07", tournament: "TPL 2026", matchNumber: 7, teamAId: "team-bmr", teamBId: "team-tc", scheduledAt: "2026-08-30T15:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-08", tournament: "TPL 2026", matchNumber: 8, teamAId: "team-du", teamBId: "team-ngw", scheduledAt: "2026-08-30T16:00:00Z", status: "UPCOMING", overs: 5 },
  { id: "match-09", tournament: "TPL 2026", matchNumber: 9, teamAId: "team-kl", teamBId: "team-rk", scheduledAt: "2026-08-30T17:00:00Z", status: "UPCOMING", overs: 5 },
];

const allMatches = [match1, ...scheduledMatches];
lookup.setMatches(allMatches);

// ── TEST 1: GROUPED TOURNAMENT STANDINGS CALCULATION ─────────────────────────
console.log("\n[TEST 1: Grouped Standings Calculation]");
const { groupA, groupB, all } = getGroupedTournamentStandings(masterTeams, allMatches);

console.log("Group A Standings:");
groupA.forEach((s) => console.log(`  ${s.pos}. ${s.teamName.padEnd(24)} | P:${s.played} W:${s.won} L:${s.lost} PTS:${s.points} NRR:${s.nrr}`));

console.log("\nGroup B Standings:");
groupB.forEach((s) => console.log(`  ${s.pos}. ${s.teamName.padEnd(24)} | P:${s.played} W:${s.won} L:${s.lost} PTS:${s.points} NRR:${s.nrr}`));

// Group A assertions:
const bmrStanding = groupA.find((s) => s.teamId === "team-bmr");
assert.ok(bmrStanding, "BMR must exist in Group A");
assert.strictEqual(bmrStanding.played, 1, "BMR must have played 1 match");
assert.strictEqual(bmrStanding.won, 1, "BMR must have 1 win");
assert.strictEqual(bmrStanding.lost, 0, "BMR must have 0 losses");
assert.strictEqual(bmrStanding.points, 2, "BMR must have 2 points");

const duStanding = groupA.find((s) => s.teamId === "team-du");
assert.strictEqual(duStanding.played, 0);
assert.strictEqual(duStanding.points, 0);

const klStanding = groupA.find((s) => s.teamId === "team-kl");
assert.strictEqual(klStanding.played, 0);
assert.strictEqual(klStanding.points, 0);

// Group B assertions:
const ngwStanding = groupB.find((s) => s.teamId === "team-ngw");
assert.ok(ngwStanding, "NGW must exist in Group B");
assert.strictEqual(ngwStanding.played, 1, "NGW must have played 1 match");
assert.strictEqual(ngwStanding.won, 0, "NGW must have 0 wins");
assert.strictEqual(ngwStanding.lost, 1, "NGW must have 1 loss");
assert.strictEqual(ngwStanding.points, 0, "NGW must have 0 points");

const rkStanding = groupB.find((s) => s.teamId === "team-rk");
assert.strictEqual(rkStanding.played, 0);
assert.strictEqual(rkStanding.points, 0);

const tcStanding = groupB.find((s) => s.teamId === "team-tc");
assert.strictEqual(tcStanding.played, 0);
assert.strictEqual(tcStanding.points, 0);

console.log("  ✓ TEST 1 PASS: Group A (BMR: 2 pts) and Group B (NGW: 0 pts) accurately updated from cross-group match!");

// ── TEST 2: REVERSE WINNER TEST (Dainagoda beats Riverside Kings) ────────────
console.log("\n[TEST 2: Complete Match #2: Dainagoda United beats Riverside Kings]");
const match2Complete = {
  ...scheduledMatches[0],
  status: "COMPLETED",
  winnerId: "team-du",
  resultText: "Dainagoda United won by 4 wickets",
};

const updatedMatches2 = [match1, match2Complete, ...scheduledMatches.slice(1)];
const standings2 = getGroupedTournamentStandings(masterTeams, updatedMatches2);

const du2 = standings2.groupA.find((s) => s.teamId === "team-du");
const rk2 = standings2.groupB.find((s) => s.teamId === "team-rk");

assert.strictEqual(du2.played, 1);
assert.strictEqual(du2.won, 1);
assert.strictEqual(du2.points, 2);

assert.strictEqual(rk2.played, 1);
assert.strictEqual(rk2.lost, 1);
assert.strictEqual(rk2.points, 0);
console.log("  ✓ TEST 2 PASS: Match 2 updates DU (Group A: +2 pts) and RK (Group B: 0 pts).");

// ── TEST 3: TIE MATCH HANDLING ───────────────────────────────────────────────
console.log("\n[TEST 3: Complete Match #3: Tie between Kurunduwatte Legends and Thundu Capital]");
const match3Tie = {
  ...scheduledMatches[1],
  status: "COMPLETED",
  winnerId: null,
  resultText: "Match tied",
};

const updatedMatches3 = [match1, match2Complete, match3Tie, ...scheduledMatches.slice(2)];
const standings3 = getGroupedTournamentStandings(masterTeams, updatedMatches3);

const kl3 = standings3.groupA.find((s) => s.teamId === "team-kl");
const tc3 = standings3.groupB.find((s) => s.teamId === "team-tc");

assert.strictEqual(kl3.played, 1);
assert.strictEqual(kl3.tied, 1);
assert.strictEqual(kl3.points, 1);

assert.strictEqual(tc3.played, 1);
assert.strictEqual(tc3.tied, 1);
assert.strictEqual(tc3.points, 1);
console.log("  ✓ TEST 3 PASS: Tie awards 1 point each to KL (Group A) and TC (Group B).");

// ── TEST 4: SECOND WIN ACCUMULATION (BMR wins second match) ──────────────────
console.log("\n[TEST 4: BMR wins Match #4 against Riverside Kings (4 points total)]");
const match4Complete = {
  ...scheduledMatches[2],
  status: "COMPLETED",
  winnerId: "team-bmr",
  resultText: "Bary Mawathe Royals won by 20 runs",
};

const updatedMatches4 = [match1, match2Complete, match3Tie, match4Complete, ...scheduledMatches.slice(3)];
const standings4 = getGroupedTournamentStandings(masterTeams, updatedMatches4);

const bmr4 = standings4.groupA.find((s) => s.teamId === "team-bmr");
assert.strictEqual(bmr4.played, 2);
assert.strictEqual(bmr4.won, 2);
assert.strictEqual(bmr4.points, 4);
console.log("  ✓ TEST 4 PASS: BMR correctly accumulates 2 wins and 4 points in Group A.");

console.log("\n================================================================================");
console.log(">>> ALL CROSS-GROUP STANDINGS SYNCHRONIZATION TESTS PASSED (100% GREEN)!");
console.log("================================================================================");
