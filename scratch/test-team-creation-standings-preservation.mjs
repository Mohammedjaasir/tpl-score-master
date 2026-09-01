import assert from "node:assert";
import { lookup, toTeam, toMatch } from "../src/lib/repositories.ts";
import { calculateStandings, getGroupedTournamentStandings } from "../src/lib/scoring/standings.ts";

console.log("================================================================================");
console.log("TPL 2026: TEAM CREATION STANDINGS PERSISTENCE & PRESERVATION TEST");
console.log("================================================================================");

const initialRawTeams = [
  { id: "team-bmr", name: "Bary Mawathe Royals", slug: "bary-mawathe-royals", group_name: "Group 1", short_name: "BMR" },
  { id: "team-du", name: "Dainagoda United", slug: "dainagoda-united", group_name: "Group 1", short_name: "DU" },
  { id: "team-kl", name: "Kurunduwatte Legends", slug: "kurunduwatte-legends", group_name: "Group 1", short_name: "KL" },
  { id: "team-ngw", name: "New Garden Warriors", slug: "new-garden-warriors", group_name: "Group 2", short_name: "NGW" },
  { id: "team-rk", name: "Riverside Kings", slug: "riverside-kings", group_name: "Group 2", short_name: "RK" },
  { id: "team-tc", name: "Thundu Capital", slug: "thundu-capital", group_name: "Group 2", short_name: "TC" },
];

let currentTeams = initialRawTeams.map(toTeam);
lookup.setTeams(currentTeams);

// 1 Completed match (BMR beats NGW) + 8 Scheduled matches
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

const matches = [match1, ...scheduledMatches];
lookup.setMatches(matches);

// ── STEP 1: VERIFY INITIAL STANDINGS ─────────────────────────────────────────
console.log("\n[STEP 1: Initial 6 Teams with Match 1 Completed]");
const initialStandings = getGroupedTournamentStandings(currentTeams, matches);
assert.strictEqual(initialStandings.groupA.length, 3, "Group A must have 3 teams initially");
assert.strictEqual(initialStandings.groupB.length, 3, "Group B must have 3 teams initially");
assert.strictEqual(initialStandings.groupA.find((t) => t.teamId === "team-bmr")?.points, 2);
console.log("  ✓ Initial State: Group A (3 teams, BMR: 2 pts), Group B (3 teams, NGW: 0 pts).");

// ── STEP 2: CREATE TEAM 7 (ABC Warriors in Group A) ──────────────────────────
console.log("\n[STEP 2: Create Team 7 -> ABC Warriors (Group A)]");
const team7 = toTeam({
  id: "team-abc",
  name: "ABC Warriors",
  slug: "abc-warriors",
  group_name: "Group 1",
  short_name: "ABC",
});

currentTeams = [...currentTeams, team7];
lookup.setTeams(currentTeams);

const standingsAfterTeam7 = getGroupedTournamentStandings(currentTeams, matches);

console.log("Group A Teams after Team 7 created:");
standingsAfterTeam7.groupA.forEach((s) => console.log(`  ${s.pos}. ${s.teamName.padEnd(24)} | P:${s.played} W:${s.won} PTS:${s.points}`));

console.log("Group B Teams after Team 7 created:");
standingsAfterTeam7.groupB.forEach((s) => console.log(`  ${s.pos}. ${s.teamName.padEnd(24)} | P:${s.played} W:${s.won} PTS:${s.points}`));

// Assertions for Team 7 creation:
assert.strictEqual(standingsAfterTeam7.groupA.length, 4, "Group A must now have 4 teams!");
assert.strictEqual(standingsAfterTeam7.groupB.length, 3, "Group B must still have 3 teams!");

const bmrAfter = standingsAfterTeam7.groupA.find((t) => t.teamId === "team-bmr");
assert.ok(bmrAfter, "BMR must still exist in Group A");
assert.strictEqual(bmrAfter.points, 2, "BMR points must remain 2");

const abcStanding = standingsAfterTeam7.groupA.find((t) => t.teamId === "team-abc");
assert.ok(abcStanding, "ABC Warriors must be present in Group A standings");
assert.strictEqual(abcStanding.played, 0, "ABC Warriors played must be 0");
assert.strictEqual(abcStanding.points, 0, "ABC Warriors points must be 0");
assert.strictEqual(abcStanding.nrr, 0, "ABC Warriors NRR must be 0");

console.log("  ✓ STEP 2 PASS: Team 7 added to Group A with 0 statistics without breaking existing standings!");

// ── STEP 3: CREATE TEAM 8 (XYZ Strikers in Group B) ──────────────────────────
console.log("\n[STEP 3: Create Team 8 -> XYZ Strikers (Group B)]");
const team8 = toTeam({
  id: "team-xyz",
  name: "XYZ Strikers",
  slug: "xyz-strikers",
  group_name: "Group 2",
  short_name: "XYZ",
});

currentTeams = [...currentTeams, team8];
lookup.setTeams(currentTeams);

const standingsAfterTeam8 = getGroupedTournamentStandings(currentTeams, matches);

assert.strictEqual(standingsAfterTeam8.groupA.length, 4, "Group A must have 4 teams");
assert.strictEqual(standingsAfterTeam8.groupB.length, 4, "Group B must have 4 teams");

const xyzStanding = standingsAfterTeam8.groupB.find((t) => t.teamId === "team-xyz");
assert.ok(xyzStanding, "XYZ Strikers must be present in Group B standings");
assert.strictEqual(xyzStanding.played, 0);
assert.strictEqual(xyzStanding.points, 0);

console.log("  ✓ STEP 3 PASS: Team 8 added to Group B with 0 statistics!");

// ── STEP 4: SCHEDULE & COMPLETE A MATCH FOR NEW TEAM ─────────────────────────
console.log("\n[STEP 4: Match between ABC Warriors and XYZ Strikers Completed]");
const match10 = {
  id: "match-10",
  tournament: "TPL 2026",
  matchNumber: 10,
  teamAId: "team-abc",
  teamBId: "team-xyz",
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T18:00:00Z",
  status: "COMPLETED",
  winnerId: "team-abc",
  resultText: "ABC Warriors won by 8 runs",
};

const allMatchesUpdated = [...matches, match10];
const finalStandings = getGroupedTournamentStandings(currentTeams, allMatchesUpdated);

const abcFinal = finalStandings.groupA.find((t) => t.teamId === "team-abc");
const xyzFinal = finalStandings.groupB.find((t) => t.teamId === "team-xyz");

assert.strictEqual(abcFinal.played, 1);
assert.strictEqual(abcFinal.won, 1);
assert.strictEqual(abcFinal.points, 2);

assert.strictEqual(xyzFinal.played, 1);
assert.strictEqual(xyzFinal.lost, 1);
assert.strictEqual(xyzFinal.points, 0);

console.log("  ✓ STEP 4 PASS: ABC Warriors (Group A: 2 pts) and XYZ Strikers (Group B: 0 pts) updated accurately.");

console.log("\n================================================================================");
console.log(">>> ALL TEAM CREATION STANDINGS PRESERVATION TESTS PASSED (100% GREEN)!");
console.log("================================================================================");
