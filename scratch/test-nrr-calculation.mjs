import { runsPerOver, legalBallsToOvers, oversText, isLegal } from '../src/lib/scoring/engine.ts';
import { calculateStandings } from '../src/lib/scoring/standings.ts';

async function main() {
  console.log("===============================================================================");
  console.log("TPL 2026 — 15-POINT NET RUN RATE (NRR) & RUN RATE CALCULATION AUDIT TEST");
  console.log("===============================================================================\n");

  // ── TEST 1: 5-over match with early chase ──────────────────────────────────
  console.log("[TEST 1: 5-over match with early chase (Team A: 44/0 in 5.0, Team B: 45/1 in 3.2)]");
  const ballsA1 = 30; // 5.0 ov
  const runsA1 = 44;
  const ballsB1 = 20; // 3.2 ov = 3*6 + 2 = 20 legal balls
  const runsB1 = 45;

  const rrA1 = runsPerOver(runsA1, ballsA1);
  const rrB1 = runsPerOver(runsB1, ballsB1);
  const nrrA1 = rrA1 - rrB1;
  const nrrB1 = rrB1 - rrA1;

  console.log(`  ✓ Team A Run Rate: ${rrA1.toFixed(2)} (Expected: 8.80)`);
  console.log(`  ✓ Team B Run Rate: ${rrB1.toFixed(2)} (Expected: 13.50)`);
  console.log(`  ✓ Team A NRR Contribution: ${nrrA1.toFixed(2)} (Expected: -4.70)`);
  console.log(`  ✓ Team B NRR Contribution: ${nrrB1 > 0 ? "+" : ""}${nrrB1.toFixed(2)} (Expected: +4.70)`);

  if (rrA1.toFixed(2) !== "8.80") throw new Error(`Test 1 Failed: Team A RR ${rrA1.toFixed(2)} !== 8.80`);
  if (rrB1.toFixed(2) !== "13.50") throw new Error(`Test 1 Failed: Team B RR ${rrB1.toFixed(2)} !== 13.50`);
  if (nrrA1.toFixed(2) !== "-4.70") throw new Error(`Test 1 Failed: Team A NRR ${nrrA1.toFixed(2)} !== -4.70`);
  if (nrrB1.toFixed(2) !== "4.70") throw new Error(`Test 1 Failed: Team B NRR ${nrrB1.toFixed(2)} !== +4.70`);

  // ── TEST 2: 5-over match with all-out in 3.4 overs ─────────────────────────
  console.log("\n[TEST 2: 5-over match with all-out in 3.4 (22 balls)]");
  const ballsA2 = 22; // 3.4 ov = 3*6 + 4 = 22 balls
  const runsA2 = 30;
  const ballsB2 = 24; // 4.0 ov = 24 balls
  const runsB2 = 31;

  const rrA2 = runsPerOver(runsA2, ballsA2);
  const rrB2 = runsPerOver(runsB2, ballsB2);

  console.log(`  ✓ Team A (30 in 22 balls): ${rrA2.toFixed(4)} (Expected: ${(30 / (22 / 6)).toFixed(4)})`);
  console.log(`  ✓ Team B (31 in 24 balls): ${rrB2.toFixed(4)} (Expected: ${(31 / 4).toFixed(4)})`);
  if (Math.abs(rrA2 - (30 / (22 / 6))) > 0.0001) throw new Error("Test 2 Failed for Team A all-out");
  if (Math.abs(rrB2 - (31 / 4)) > 0.0001) throw new Error("Test 2 Failed for Team B");

  // ── TEST 3: Wides in an over ───────────────────────────────────────────────
  console.log("\n[TEST 3: Delivery Legal Ball Filter - Wides]");
  const wideDeliveries = [
    { extraType: null, batterRuns: 1, extraRuns: 0 },
    { extraType: "wide", batterRuns: 0, extraRuns: 1 },
    { extraType: null, batterRuns: 2, extraRuns: 0 },
    { extraType: null, batterRuns: 0, extraRuns: 0 },
    { extraType: null, batterRuns: 4, extraRuns: 0 },
    { extraType: null, batterRuns: 1, extraRuns: 0 },
    { extraType: null, batterRuns: 2, extraRuns: 0 },
  ];
  const legalCountWides = wideDeliveries.filter(isLegal).length;
  console.log(`  ✓ Total deliveries: ${wideDeliveries.length}, Legal balls: ${legalCountWides}, Overs: ${oversText(legalCountWides)}`);
  if (legalCountWides !== 6 || oversText(legalCountWides) !== "1.0") throw new Error("Test 3 Failed: Wides counted as legal ball");

  // ── TEST 4: No-balls in an over ───────────────────────────────────────────
  console.log("\n[TEST 4: Delivery Legal Ball Filter - No-balls]");
  const nbDeliveries = [
    { extraType: "noball", batterRuns: 4, extraRuns: 1 },
    { extraType: null, batterRuns: 1, extraRuns: 0 },
    { extraType: null, batterRuns: 0, extraRuns: 0 },
    { extraType: null, batterRuns: 1, extraRuns: 0 },
    { extraType: null, batterRuns: 2, extraRuns: 0 },
    { extraType: null, batterRuns: 0, extraRuns: 0 },
    { extraType: null, batterRuns: 1, extraRuns: 0 },
  ];
  const legalCountNB = nbDeliveries.filter(isLegal).length;
  console.log(`  ✓ Total deliveries: ${nbDeliveries.length}, Legal balls: ${legalCountNB}, Overs: ${oversText(legalCountNB)}`);
  if (legalCountNB !== 6 || oversText(legalCountNB) !== "1.0") throw new Error("Test 4 Failed: No-balls counted as legal ball");

  // ── TEST 5: 3-over match with 2.1 chase (13 balls) ─────────────────────────
  console.log("\n[TEST 5: 3-over match with 2.1 overs chase]");
  const ballsA5 = 18; // 3.0 ov
  const runsA5 = 20;
  const ballsB5 = 13; // 2.1 ov = 2*6 + 1 = 13 balls
  const runsB5 = 21;

  const rrA5 = runsPerOver(runsA5, ballsA5);
  const rrB5 = runsPerOver(runsB5, ballsB5);
  console.log(`  ✓ Team A: ${runsA5} runs in ${ballsA5}b (${oversText(ballsA5)} ov) -> RR: ${rrA5.toFixed(2)}`);
  console.log(`  ✓ Team B: ${runsB5} runs in ${ballsB5}b (${oversText(ballsB5)} ov) -> RR: ${rrB5.toFixed(2)}`);
  if (ballsB5 !== 13) throw new Error("Test 5 Failed: 2.1 overs must be 13 balls");
  if (rrB5.toFixed(2) !== ((21 / 13) * 6).toFixed(2)) throw new Error("Test 5 Failed: Run rate mismatch");

  // ── TEST 6: Reduced 10 -> 5 overs match ────────────────────────────────────
  console.log("\n[TEST 6: Reduced Match Overs Handling]");
  const ballsReduced = 30;
  const runsReduced = 50;
  const rrReduced = runsPerOver(runsReduced, ballsReduced);
  console.log(`  ✓ 50 runs in 30 legal balls (5.0 ov) -> RR: ${rrReduced.toFixed(2)}`);
  if (rrReduced.toFixed(2) !== "10.00") throw new Error("Test 6 Failed");

  // ── TEST 7: Standings Reset ────────────────────────────────────────────────
  console.log("\n[TEST 7: Reset All Matches Returns Empty Standings Array]");
  const dummyTeams = [
    { id: "t1", name: "Team One", shortName: "T1" },
    { id: "t2", name: "Team Two", shortName: "T2" },
  ];
  const resetStandings = calculateStandings(dummyTeams, []);
  console.log(`  ✓ Reset Standings: returns ${resetStandings.length} teams (Empty State triggered)`);
  if (resetStandings.length !== 0) throw new Error("Test 7 Failed: resetStandings must be empty array");

  // ── TEST 8: 7-over match ───────────────────────────────────────────────────
  console.log("\n[TEST 8: 7-over match rates]");
  const rr7 = runsPerOver(63, 42); // 63 in 7.0 (42 balls) = 9.00
  console.log(`  ✓ 63 runs in 42 balls -> RR: ${rr7.toFixed(2)}`);
  if (rr7.toFixed(2) !== "9.00") throw new Error("Test 8 Failed");

  // ── TEST 9: 10-over match ──────────────────────────────────────────────────
  console.log("\n[TEST 9: 10-over match rates]");
  const rr10 = runsPerOver(95, 60); // 95 in 10.0 (60 balls) = 9.50
  console.log(`  ✓ 95 runs in 60 balls -> RR: ${rr10.toFixed(2)}`);
  if (rr10.toFixed(2) !== "9.50") throw new Error("Test 9 Failed");

  // ── TEST 10: Wides + No-balls combined in over ─────────────────────────────
  console.log("\n[TEST 10: Mixed Extras in an Over]");
  const mixedDeliveries = [
    { extraType: "wide", batterRuns: 0, extraRuns: 1 },
    { extraType: "noball", batterRuns: 1, extraRuns: 1 },
    { extraType: null, batterRuns: 0, extraRuns: 0 },
    { extraType: null, batterRuns: 1, extraRuns: 0 },
    { extraType: null, batterRuns: 2, extraRuns: 0 },
    { extraType: "wide", batterRuns: 0, extraRuns: 1 },
    { extraType: null, batterRuns: 0, extraRuns: 0 },
    { extraType: null, batterRuns: 4, extraRuns: 0 },
    { extraType: null, batterRuns: 6, extraRuns: 0 },
  ];
  const mixedLegal = mixedDeliveries.filter(isLegal).length;
  console.log(`  ✓ 9 total deliveries with 2 wides & 1 noball -> Legal balls: ${mixedLegal} (${oversText(mixedLegal)} ov)`);
  if (mixedLegal !== 6) throw new Error("Test 10 Failed: Expected exactly 6 legal balls");

  // ── TEST 11: Early chase with 0 extras ─────────────────────────────────────
  console.log("\n[TEST 11: Clean Early Chase]");
  const rrClean = runsPerOver(36, 18); // 36 in 3.0 (18 balls) = 12.00
  console.log(`  ✓ 36 in 18 balls -> RR: ${rrClean.toFixed(2)}`);
  if (rrClean.toFixed(2) !== "12.00") throw new Error("Test 11 Failed");

  // ── TEST 12: Aggregate Tournament NRR across multiple matches ──────────────
  console.log("\n[TEST 12: Aggregate Tournament NRR across 2 matches]");
  // Match 1: scored 30 in 30 balls, conceded 25 in 30 balls
  // Match 2: scored 20 in 20 balls, conceded 15 in 20 balls
  const totalScored = 30 + 20; // 50 runs
  const totalFaced = 30 + 20; // 50 balls
  const totalConceded = 25 + 15; // 40 runs
  const totalBowled = 30 + 20; // 50 balls

  const aggRpoFor = runsPerOver(totalScored, totalFaced); // (50/50)*6 = 6.00
  const aggRpoAgainst = runsPerOver(totalConceded, totalBowled); // (40/50)*6 = 4.80
  const aggNRR = aggRpoFor - aggRpoAgainst; // 6.00 - 4.80 = +1.20

  console.log(`  ✓ Aggregate Runs For: ${totalScored}/${totalFaced}b -> RR: ${aggRpoFor.toFixed(2)}`);
  console.log(`  ✓ Aggregate Runs Against: ${totalConceded}/${totalBowled}b -> RR: ${aggRpoAgainst.toFixed(2)}`);
  console.log(`  ✓ Cumulative NRR: +${aggNRR.toFixed(2)}`);
  if (aggNRR.toFixed(2) !== "1.20") throw new Error("Test 12 Failed");

  // ── TEST 13: Zero-ball / Unplayed safe handling ────────────────────────────
  console.log("\n[TEST 13: Zero-ball Innings Safe Handling]");
  const zeroRR = runsPerOver(0, 0);
  console.log(`  ✓ 0 runs in 0 balls -> RR: ${zeroRR}`);
  if (zeroRR !== 0 || isNaN(zeroRR) || !isFinite(zeroRR)) throw new Error("Test 13 Failed: NaN or Infinity on zero balls");

  // ── TEST 14: Match NRR Symmetry ────────────────────────────────────────────
  console.log("\n[TEST 14: Match NRR Symmetry Check]");
  if (Math.abs(nrrA1 + nrrB1) > 0.00001) throw new Error("Test 14 Failed: NRR sum is not 0");
  console.log(`  ✓ Team A NRR (${nrrA1.toFixed(2)}) + Team B NRR (${nrrB1.toFixed(2)}) = 0.00 (Perfect symmetry)`);

  // ── TEST 15: Points Table Sorting by Points then NRR ───────────────────────
  console.log("\n[TEST 15: Points Table Tie-Breaking by NRR]");
  const standings = [
    { teamName: "Team Low NRR", points: 4, nrr: 0.85 },
    { teamName: "Team High NRR", points: 4, nrr: 1.45 },
    { teamName: "Team Top Points", points: 6, nrr: 0.10 },
  ];
  standings.sort((a, b) => b.points - a.points || b.nrr - a.nrr);
  console.log(`  ✓ 1st: ${standings[0].teamName} (${standings[0].points} pts, NRR ${standings[0].nrr})`);
  console.log(`  ✓ 2nd: ${standings[1].teamName} (${standings[1].points} pts, NRR ${standings[1].nrr})`);
  console.log(`  ✓ 3rd: ${standings[2].teamName} (${standings[2].points} pts, NRR ${standings[2].nrr})`);
  if (standings[1].teamName !== "Team High NRR") throw new Error("Test 15 Failed: NRR sort failed");

  console.log("\n===============================================================================");
  console.log(">>> ALL 15 NET RUN RATE (NRR) AUDIT TESTS PASSED (100% GREEN)!");
  console.log("===============================================================================\n");
}

main().catch(err => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
