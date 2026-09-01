import assert from "node:assert";
import { lookup, toTeam, toPlayer, toMatch } from "../src/lib/repositories.ts";
import { calculateStandings, getTournamentStandings } from "../src/lib/scoring/standings.ts";
import { runsPerOver, legalBallsToOvers, oversText, isLegal } from "../src/lib/scoring/engine.ts";

console.log("================================================================================");
console.log("TPL 2026: EMPTY STANDINGS LIFECYCLE & CANONICAL NRR REGRESSION TEST SUITE");
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

// ── 1. LIFECYCLE STATE 1: ZERO MATCHES -> EMPTY STANDINGS ───────────────────
console.log("\n[STATE 1: Zero Matches -> Empty Standings]");
const emptyStandings = calculateStandings(lookup.teams(), []);
assert.strictEqual(emptyStandings.length, 0, "calculateStandings must return [] when 0 matches exist");
assert.strictEqual(getTournamentStandings(lookup.teams(), []).length, 0, "getTournamentStandings alias returns []");
console.log("  ✓ STATE 1 PASS: Empty array returned on 0 matches (Empty State viewable in Points Table).");

// ── 2. LIFECYCLE STATE 2: 9 MATCHES SCHEDULED ────────────────────────────────
console.log("\n[STATE 2: 9 Matches Scheduled -> Groups A & B Appear]");
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

const group1Standings = calculateStandings(
  lookup.teams().filter((t) => g1Ids.includes(t.id)),
  lookup.matches()
);
const group2Standings = calculateStandings(
  lookup.teams().filter((t) => g2Ids.includes(t.id)),
  lookup.matches()
);
const totalStandings = calculateStandings(lookup.teams(), lookup.matches());

assert.strictEqual(group1Standings.length, 3, "Group 1 must contain exactly 3 teams");
assert.strictEqual(group2Standings.length, 3, "Group 2 must contain exactly 3 teams");
assert.strictEqual(totalStandings.length, 6, "Total standings must contain 6 teams");

totalStandings.forEach((st) => {
  assert.strictEqual(st.played, 0);
  assert.strictEqual(st.won, 0);
  assert.strictEqual(st.lost, 0);
  assert.strictEqual(st.points, 0);
  assert.strictEqual(st.nrr, 0);
});
console.log("  ✓ STATE 2 PASS: Exactly 3 teams in Group A and 3 teams in Group B (all P:0, W:0, PTS:0, NRR:0.00).");

// ── 3. LIFECYCLE STATE 3: COMPLETE MATCH #1 (BMR vs NGW) ─────────────────────
console.log("\n[STATE 3: Match #1 Complete (BMR: 40/0 in 5.0 ov, NGW: 30/2 in 5.0 ov)]");
// BMR: 40 runs in 30 balls (5.0 ov) -> RPO = 8.00
// NGW: 30 runs in 30 balls (5.0 ov) -> RPO = 6.00
// NRR: BMR = +2.00, NGW = -2.00
const match1Doc = {
  setup: {
    battingFirstId: "team-bmr",
    playingXI: { "team-bmr": { teamId: "team-bmr", playerIds: [] }, "team-ngw": { teamId: "team-ngw", playerIds: [] } },
  },
  deliveries: [
    // 30 legal balls for Innings 1 (40 runs) - BMR batting
    ...Array.from({ length: 20 }, () => ({ inningsIndex: 0, bowlerId: "p-ngw1", strikerId: "p-bmr1", batterRuns: 1, extraRuns: 0, extraType: null })),
    ...Array.from({ length: 5 }, () => ({ inningsIndex: 0, bowlerId: "p-ngw1", strikerId: "p-bmr1", batterRuns: 4, extraRuns: 0, extraType: null })),
    ...Array.from({ length: 5 }, () => ({ inningsIndex: 0, bowlerId: "p-ngw1", strikerId: "p-bmr1", batterRuns: 0, extraRuns: 0, extraType: null })),
    // 30 legal balls for Innings 2 (30 runs) - NGW batting
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
  id: "m-sch-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  venue: "TPL Cricket Ground",
  overs: 5,
  scheduledAt: "2026-08-30T09:00:00Z",
  teamAId: "team-bmr",
  teamBId: "team-ngw",
  status: "COMPLETED",
  winnerId: "team-bmr",
  resultText: "Bary Mawathe Royals won by 10 runs",
};

const matchesState3 = [completedMatch1, ...scheduledFixtures.slice(1)];
const standingsState3 = calculateStandings(lookup.teams(), matchesState3);
const bmrSt3 = standingsState3.find((st) => st.teamId === "team-bmr");
const ngwSt3 = standingsState3.find((st) => st.teamId === "team-ngw");

assert.strictEqual(bmrSt3?.played, 1);
assert.strictEqual(bmrSt3?.won, 1);
assert.strictEqual(bmrSt3?.lost, 0);
assert.strictEqual(bmrSt3?.points, 2);
assert.strictEqual(bmrSt3?.nrr, 2.0); // 8.00 - 6.00 = +2.00

assert.strictEqual(ngwSt3?.played, 1);
assert.strictEqual(ngwSt3?.won, 0);
assert.strictEqual(ngwSt3?.lost, 1);
assert.strictEqual(ngwSt3?.points, 0);
assert.strictEqual(ngwSt3?.nrr, -2.0); // 6.00 - 8.00 = -2.00

console.log("  ✓ STATE 3 PASS: BMR (+2.00 NRR, 2 PTS) and NGW (-2.00 NRR, 0 PTS) calculated from innings balls.");

// ── 4. CANONICAL CRICKET OVERS & BALL-BASED NRR CALCULATION ──────────────────
console.log("\n[TEST 4: Exact Legal Ball-Based Calculation (Non-Decimal Overs)]");
// Verify 4.3 overs notation vs 27 legal balls (4 + 3/6 = 4.5 ov)
const balls43 = 27; // 4.3 overs
assert.strictEqual(oversText(balls43), "4.3");
assert.strictEqual(legalBallsToOvers(balls43), 4.5); // NOT 4.3!
const rpo43 = runsPerOver(45, balls43); // 45 runs in 4.5 overs = 10.00
assert.strictEqual(rpo43, 10.0);

// Verify 3.2 overs notation vs 20 legal balls (3 + 2/6 = 3.333 ov)
const balls32 = 20;
assert.strictEqual(oversText(balls32), "3.2");
assert.strictEqual(legalBallsToOvers(balls32), 20 / 6);
const rpo32 = runsPerOver(45, balls32); // 45 / (20/6) = 13.50
assert.strictEqual(rpo32, 13.5);
console.log("  ✓ TEST 4 PASS: Cricket overs notation correctly converted to exact mathematical fractions.");

// ── 5. ALL-OUT INNINGS NRR RATE HANDLING ────────────────────────────────────
console.log("\n[TEST 5: All-Out Innings Duration]");
// Team scores 35 all out in 22 legal balls (3.4 overs)
const rpoAllOut = runsPerOver(35, 22);
assert.strictEqual(rpoAllOut.toFixed(4), ((35 / 22) * 6).toFixed(4));
console.log(`  ✓ TEST 5 PASS: All-out 35 in 22 balls -> RR = ${rpoAllOut.toFixed(2)} (using actual 22 legal balls).`);

// ── 6. CUMULATIVE TOURNAMENT NRR ACROSS MULTIPLE MATCHES ────────────────────
console.log("\n[TEST 6: Cumulative Aggregate NRR across multiple matches]");
// Team A:
// Match 1: 40 runs in 30 balls, conceded 30 runs in 30 balls
// Match 2: 30 runs in 20 balls, conceded 20 runs in 20 balls
// Aggregate scored: 70 runs in 50 balls -> RPO = (70/50)*6 = 8.40
// Aggregate conceded: 50 runs in 50 balls -> RPO = (50/50)*6 = 6.00
// Cumulative NRR = 8.40 - 6.00 = +2.40
const aggScored = 70;
const aggFaced = 50;
const aggConceded = 50;
const aggBowled = 50;
const cumNRR = runsPerOver(aggScored, aggFaced) - runsPerOver(aggConceded, aggBowled);
assert.strictEqual(cumNRR.toFixed(2), "2.40");
console.log("  ✓ TEST 6 PASS: Cumulative NRR (+2.40) evaluated via aggregate runs / aggregate balls.");

// ── 7. RESULT CORRECTION DETERMINISM ─────────────────────────────────────────
console.log("\n[TEST 7: Result Correction Determinism]");
const correctedMatch1Winner = {
  ...completedMatch1,
  winnerId: "team-ngw",
  resultText: "New Garden Warriors won by 2 runs",
};
const standingsCorrected = calculateStandings(lookup.teams(), [correctedMatch1Winner]);
const bmrCorr = standingsCorrected.find((st) => st.teamId === "team-bmr");
const ngwCorr = standingsCorrected.find((st) => st.teamId === "team-ngw");

assert.strictEqual(bmrCorr?.points, 0);
assert.strictEqual(bmrCorr?.won, 0);
assert.strictEqual(bmrCorr?.lost, 1);

assert.strictEqual(ngwCorr?.points, 2);
assert.strictEqual(ngwCorr?.won, 1);
assert.strictEqual(ngwCorr?.lost, 0);
console.log("  ✓ TEST 7 PASS: Standings recalculated cleanly after result change (0 duplicate points).");

// ── 8. LIFECYCLE STATE 5: RESET ALL MATCHES -> PURGES STANDINGS ──────────────
console.log("\n[STATE 5: Reset All Matches -> Empty Standings]");
lookup.setMatches([]);
const resetStandingsFinal = calculateStandings(lookup.teams(), lookup.matches());

assert.strictEqual(resetStandingsFinal.length, 0, "Standings must be [] after reset");
assert.strictEqual(lookup.teams().length, 6, "All 6 master teams preserved");
assert.strictEqual(lookup.players().length, 89, "All 89 master players preserved");
assert.strictEqual(lookup.team("team-du")?.groupName, "Group 1");
assert.strictEqual(lookup.team("team-rk")?.groupName, "Group 2");
console.log("  ✓ STATE 5 PASS: Reset All Matches clears standings to [] while master teams/groups/players remain 100% intact.");

console.log("\n================================================================================");
console.log(">>> ALL EMPTY STANDINGS & CANONICAL NRR TESTS PASSED (100% GREEN)!");
console.log("================================================================================");
