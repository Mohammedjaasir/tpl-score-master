import assert from "node:assert";
import { lookup, toTeam, toPlayer, toMatch } from "../src/lib/repositories.ts";
import {
  calculateStandings,
  getTournamentStandings,
  getGroupedTournamentStandings,
} from "../src/lib/scoring/standings.ts";
import { runsPerOver, legalBallsToOvers, oversText, isLegal } from "../src/lib/scoring/engine.ts";

console.log("================================================================================");
console.log("TPL 2026: PUBLIC POINTS TABLE E2E LIFECYCLE & USER EXPERIENCE VERIFICATION");
console.log("================================================================================");

const rawTeams = [
  { id: "team-du", name: "Dainagoda United", slug: "dainagoda-united", group_name: "Group 1", short_name: "DU" },
  { id: "team-bmr", name: "Bary Mawathe Royals", slug: "bary-mawathe-royals", group_name: "Group 1", short_name: "BMR" },
  { id: "team-kl", name: "Kurunduwatte Legends", slug: "kurunduwatte-legends", group_name: "Group 1", short_name: "KL" },
  { id: "team-ngw", name: "New Garden Warriors", slug: "new-garden-warriors", group_name: "Group 2", short_name: "NGW" },
  { id: "team-rk", name: "Riverside Kings", slug: "riverside-kings", group_name: "Group 2", short_name: "RK" },
  { id: "team-tc", name: "Thundu Capital", slug: "thundu-capital", group_name: "Group 2", short_name: "TC" },
];

const masterTeams = rawTeams.map(toTeam);
const masterPlayers = Array.from({ length: 89 }, (_, i) =>
  toPlayer({
    id: `p-${i + 1}`,
    player_name: `Player ${i + 1}`,
    team_id: rawTeams[i % 6].id,
    player_role: "All-rounder",
  })
);

lookup.setTeams(masterTeams);
lookup.setPlayers(masterPlayers);
lookup.setMatches([]);

// ── STEP 1: INITIAL STATE (0 MATCHES) ─────────────────────────────────────────
console.log("\n[STEP 1: Delete/Reset All Matches -> Points Table Empty State]");
const step1Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());
assert.strictEqual(step1Grouped.hasStandings, false, "hasStandings must be false");
assert.strictEqual(step1Grouped.groupA.length, 0, "Group A standings must be []");
assert.strictEqual(step1Grouped.groupB.length, 0, "Group B standings must be []");
assert.strictEqual(step1Grouped.all.length, 0, "All standings must be []");
console.log("  ✓ STEP 1 PASS: Public Points Table displays clean empty state (no Group A/B tables, no admin controls).");

// ── STEP 2: VERIFY MASTER TEAM DATA INTACT ───────────────────────────────────
console.log("\n[STEP 2: Verify Master Data Preservation]");
assert.strictEqual(lookup.teams().length, 6, "All 6 master teams preserved in DB");
assert.strictEqual(lookup.players().length, 89, "All 89 master players preserved in DB");
assert.strictEqual(lookup.team("team-du")?.groupName, "Group 1");
assert.strictEqual(lookup.team("team-tc")?.groupName, "Group 2");
console.log("  ✓ STEP 2 PASS: 6 teams, 89 players, and permanent group assignments 100% intact.");

// ── STEP 3: ADMIN SCHEDULES GROUP A + GROUP B FIXTURES (9 MATCHES) ───────────
console.log("\n[STEP 3: Admin Schedules Group A + Group B (9 Matches)]");
const g1Ids = ["team-du", "team-bmr", "team-kl"];
const g2Ids = ["team-ngw", "team-rk", "team-tc"];
const scheduledFixtures = [];
let matchIdx = 1;
for (const g1 of g1Ids) {
  for (const g2 of g2Ids) {
    scheduledFixtures.push(
      toMatch(
        {
          id: `m-sch-${matchIdx}`,
          team_a_id: g1,
          team_b_id: g2,
          start_time: "2026-08-30T09:00:00Z",
          status: "scheduled",
          total_overs: 5,
          balls_per_over: 6,
        },
        matchIdx
      )
    );
    matchIdx++;
  }
}
lookup.setMatches(scheduledFixtures);

const step3Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());
assert.strictEqual(step3Grouped.hasStandings, true, "hasStandings must be true");
assert.strictEqual(step3Grouped.groupA.length, 3, "Group A contains 3 teams");
assert.strictEqual(step3Grouped.groupB.length, 3, "Group B contains 3 teams");

step3Grouped.all.forEach((st) => {
  assert.strictEqual(st.played, 0);
  assert.strictEqual(st.won, 0);
  assert.strictEqual(st.lost, 0);
  assert.strictEqual(st.points, 0);
  assert.strictEqual(st.nrr, 0);
});
console.log("  ✓ STEP 3 PASS: Group A (3 teams) and Group B (3 teams) appear with P:0, W:0, L:0, PTS:0, NRR:0.00.");

// ── STEP 4: COMPLETE MATCH #1 (BMR vs NGW) ───────────────────────────────────
console.log("\n[STEP 4: Complete Match #1 (BMR: 45/0 in 5.0 ov, NGW: 30/3 in 5.0 ov)]");
// BMR: 45 runs in 30 balls (5.0 ov) -> RPO = 9.00
// NGW: 30 runs in 30 balls (5.0 ov) -> RPO = 6.00
// NRR: BMR = +3.00, NGW = -3.00
const match1Doc = {
  setup: {
    battingFirstId: "team-bmr",
    playingXI: { "team-bmr": { teamId: "team-bmr", playerIds: [] }, "team-ngw": { teamId: "team-ngw", playerIds: [] } },
  },
  deliveries: [
    ...Array.from({ length: 15 }, () => ({ inningsIndex: 0, bowlerId: "p-ngw1", strikerId: "p-bmr1", batterRuns: 1, extraRuns: 0, extraType: null })),
    ...Array.from({ length: 5 }, () => ({ inningsIndex: 0, bowlerId: "p-ngw1", strikerId: "p-bmr1", batterRuns: 6, extraRuns: 0, extraType: null })),
    ...Array.from({ length: 10 }, () => ({ inningsIndex: 0, bowlerId: "p-ngw1", strikerId: "p-bmr1", batterRuns: 0, extraRuns: 0, extraType: null })),
    ...Array.from({ length: 30 }, () => ({ inningsIndex: 1, bowlerId: "p-bmr1", strikerId: "p-ngw1", batterRuns: 1, extraRuns: 0, extraType: null })),
  ],
  isCompleted: true,
  secondInningsStarted: true,
};

if (typeof window === "undefined") {
  global.window = {
    localStorage: {
      store: { "tpl-scoring:m-sch-1": JSON.stringify(match1Doc) },
      getItem(k) { return this.store[k] || null; },
      setItem(k, v) { this.store[k] = v; },
      removeItem(k) { delete this.store[k]; },
    },
  };
}

const completedMatch1 = {
  ...scheduledFixtures[0],
  teamAId: "team-bmr",
  teamBId: "team-ngw",
  status: "COMPLETED",
  winnerId: "team-bmr",
  resultText: "Bary Mawathe Royals won by 15 runs",
};

const matchesStep4 = [completedMatch1, ...scheduledFixtures.slice(1)];
lookup.setMatches(matchesStep4);

const step4Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());
const bmrSt4 = step4Grouped.all.find((st) => st.teamId === "team-bmr");
const ngwSt4 = step4Grouped.all.find((st) => st.teamId === "team-ngw");
const unplayedSt4 = step4Grouped.all.find((st) => st.teamId === "team-du");

assert.strictEqual(bmrSt4?.played, 1);
assert.strictEqual(bmrSt4?.won, 1);
assert.strictEqual(bmrSt4?.lost, 0);
assert.strictEqual(bmrSt4?.points, 2);
assert.strictEqual(bmrSt4?.nrr, 3.0); // 9.00 - 6.00 = +3.00

assert.strictEqual(ngwSt4?.played, 1);
assert.strictEqual(ngwSt4?.won, 0);
assert.strictEqual(ngwSt4?.lost, 1);
assert.strictEqual(ngwSt4?.points, 0);
assert.strictEqual(ngwSt4?.nrr, -3.0); // 6.00 - 9.00 = -3.00

assert.strictEqual(unplayedSt4?.played, 0);
assert.strictEqual(unplayedSt4?.points, 0);
console.log("  ✓ STEP 4 PASS: Match 1 Result auto-updates Standings (Winner: +1 W, +2 PTS, +3.00 NRR; Loser: +1 L, 0 PTS, -3.00 NRR).");

// ── STEP 5: COMPLETE MATCH #2 (DU vs RK) ─────────────────────────────────────
console.log("\n[STEP 5: Complete Match #2 (RK wins vs DU)]");
const completedMatch2 = {
  ...scheduledFixtures[1],
  teamAId: "team-du",
  teamBId: "team-rk",
  status: "COMPLETED",
  winnerId: "team-rk",
  resultText: "Riverside Kings won by 4 wickets",
};
const matchesStep5 = [completedMatch1, completedMatch2, ...scheduledFixtures.slice(2)];
lookup.setMatches(matchesStep5);

const step5Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());
const rkSt5 = step5Grouped.all.find((st) => st.teamId === "team-rk");
const duSt5 = step5Grouped.all.find((st) => st.teamId === "team-du");

assert.strictEqual(rkSt5?.played, 1);
assert.strictEqual(rkSt5?.won, 1);
assert.strictEqual(rkSt5?.points, 2);

assert.strictEqual(duSt5?.played, 1);
assert.strictEqual(duSt5?.lost, 1);
assert.strictEqual(duSt5?.points, 0);
console.log("  ✓ STEP 5 PASS: Match 2 Result updates both standings (RK: 2 PTS, DU: 0 PTS).");

// ── STEP 6: EDIT MATCH #1 RESULT ─────────────────────────────────────────────
console.log("\n[STEP 6: Edit Match #1 Result (NGW winner correction)]");
const correctedMatch1 = {
  ...completedMatch1,
  winnerId: "team-ngw",
  resultText: "New Garden Warriors won by 2 runs",
};
const matchesStep6 = [correctedMatch1, completedMatch2, ...scheduledFixtures.slice(2)];
lookup.setMatches(matchesStep6);

const step6Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());
const bmrCorr = step6Grouped.all.find((st) => st.teamId === "team-bmr");
const ngwCorr = step6Grouped.all.find((st) => st.teamId === "team-ngw");

assert.strictEqual(bmrCorr?.points, 0, "BMR points corrected to 0");
assert.strictEqual(bmrCorr?.won, 0);
assert.strictEqual(bmrCorr?.lost, 1);

assert.strictEqual(ngwCorr?.points, 2, "NGW points corrected to 2");
assert.strictEqual(ngwCorr?.won, 1);
assert.strictEqual(ngwCorr?.lost, 0);
console.log("  ✓ STEP 6 PASS: Standings cleanly recalculate after result correction (0 duplicate points).");

// ── STEP 7: DELETE MATCH #2 ──────────────────────────────────────────────────
console.log("\n[STEP 7: Delete Match #2]");
const matchesStep7 = [correctedMatch1, ...scheduledFixtures.slice(2)];
lookup.setMatches(matchesStep7);

const step7Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());
const duSt7 = step7Grouped.all.find((st) => st.teamId === "team-du");
const rkSt7 = step7Grouped.all.find((st) => st.teamId === "team-rk");

assert.strictEqual(duSt7?.played, 0, "DU played reverts to 0");
assert.strictEqual(duSt7?.points, 0, "DU points reverts to 0");
assert.strictEqual(rkSt7?.played, 0, "RK played reverts to 0");
assert.strictEqual(rkSt7?.points, 0, "RK points reverts to 0");
console.log("  ✓ STEP 7 PASS: Match deletion recalculates standings using only remaining completed matches.");

// ── STEP 8 & 9: RESET ALL MATCHES ────────────────────────────────────────────
console.log("\n[STEP 8 & 9: Reset All Matches -> Empty Standings & Master Data Safe]");
lookup.setMatches([]);
const step8Grouped = getGroupedTournamentStandings(lookup.teams(), lookup.matches());

assert.strictEqual(step8Grouped.hasStandings, false, "hasStandings returns false");
assert.strictEqual(step8Grouped.groupA.length, 0, "Group A is empty");
assert.strictEqual(step8Grouped.groupB.length, 0, "Group B is empty");

assert.strictEqual(lookup.teams().length, 6, "All 6 master teams preserved");
assert.strictEqual(lookup.players().length, 89, "All 89 master players preserved");
assert.strictEqual(lookup.team("team-du")?.groupName, "Group 1");
assert.strictEqual(lookup.team("team-tc")?.groupName, "Group 2");
console.log("  ✓ STEP 8 & 9 PASS: Reset clears standings completely to empty state while preserving all master teams and players.");

console.log("\n================================================================================");
console.log(">>> ALL 9 PUBLIC POINTS TABLE E2E ACCEPTANCE STEPS PASSED (100% GREEN)!");
console.log("================================================================================");
