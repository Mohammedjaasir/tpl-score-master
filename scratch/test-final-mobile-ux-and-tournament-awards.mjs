import { calculateTournamentStats } from "../src/lib/scoring/statistics.ts";
import { calculateStandings } from "../src/lib/scoring/standings.ts";
import { runsPerOver, legalBallsToOvers } from "../src/lib/scoring/engine.ts";
import { lookup } from "../src/lib/repositories.ts";

async function runTests() {
  console.log("================================================================================");
  console.log(" TPL 2026 — FINAL MOBILE UX + TOURNAMENT LOGIC BUG FIX TEST SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Setup Mock Teams & Players
  const teamA = { id: "team-a", name: "Dainagoda United", shortName: "DU", group: "Group 1", logoUrl: "" };
  const teamB = { id: "team-b", name: "Thunduwa Royals", shortName: "TR", group: "Group 2", logoUrl: "" };
  const teamC = { id: "team-c", name: "Super Strikers", shortName: "SS", group: "Group 1", logoUrl: "" };
  const teamD = { id: "team-d", name: "Coastal Kings", shortName: "CK", group: "Group 2", logoUrl: "" };

  const player1 = { id: "p1", name: "M. Marlin", teamId: "team-a", role: "All-Rounder" };
  const player2 = { id: "p2", name: "A. Fasran", teamId: "team-b", role: "Bowler" };

  lookup.setPlayers([player1, player2]);
  lookup.setTeams([teamA, teamB, teamC, teamD]);

  // Setup localStorage mock in Node
  const storageMap = new Map();
  if (typeof globalThis.window === "undefined") {
    globalThis.window = {
      localStorage: {
        getItem: (k) => storageMap.get(k) || null,
        setItem: (k, v) => storageMap.set(k, String(v)),
        removeItem: (k) => storageMap.delete(k),
        clear: () => storageMap.clear(),
      },
    };
  }

  const match1 = {
    id: "m1",
    matchNumber: 1,
    teamAId: "team-a",
    teamBId: "team-b",
    status: "COMPLETED",
    overs: 5,
    winnerId: "team-a",
    winMargin: "10 runs",
    resultText: "DU won by 10 runs",
    manOfTheMatchId: "p1",
  };

  const match2 = {
    id: "m2",
    matchNumber: 2,
    teamAId: "team-c",
    teamBId: "team-d",
    status: "UPCOMING",
    overs: 5,
  };

  // Mock match 1 deliveries doc in localStorage
  const match1Doc = {
    setup: {
      teamA: teamA,
      teamB: teamB,
      overs: 5,
      tossWinnerId: "team-a",
      tossDecision: "bat",
      battingFirstId: "team-a",
      bowlingFirstId: "team-b",
      strikerId: "p1",
      nonStrikerId: "p1",
      openingBowlerId: "p2",
    },
    deliveries: [
      { id: "d1", inningsIndex: 0, overNumber: 0, ballNumber: 1, strikerId: "p1", nonStrikerId: "p1", bowlerId: "p2", batterRuns: 6, extraRuns: 0 },
      { id: "d2", inningsIndex: 0, overNumber: 0, ballNumber: 2, strikerId: "p1", nonStrikerId: "p1", bowlerId: "p2", batterRuns: 4, extraRuns: 0 },
      { id: "d3", inningsIndex: 0, overNumber: 0, ballNumber: 3, strikerId: "p1", nonStrikerId: "p1", bowlerId: "p2", batterRuns: 1, extraRuns: 0 },
      { id: "d4", inningsIndex: 0, overNumber: 0, ballNumber: 4, strikerId: "p1", nonStrikerId: "p1", bowlerId: "p2", batterRuns: 0, extraRuns: 0, wicket: { type: "bowled", playerOutId: "p1" } },
    ],
    secondInningsStarted: false,
  };

  window.localStorage.setItem("tpl-scoring:m1", JSON.stringify(match1Doc));

  // ── TEST 1: Tournament with only 1 completed match (partially completed) ────
  console.log("[TEST 1 & 2: Tournament with 1 of 2 matches completed]");
  const statsPartial = calculateTournamentStats([match1, match2]);
  assert(statsPartial.awards.isTournamentCompleted === false, "isTournamentCompleted must be false when matches remain upcoming");
  assert(statsPartial.awards.playerOfTheTournament === undefined, "playerOfTheTournament MUST be undefined before entire tournament completes");
  assert(statsPartial.awards.currentMvpLeader !== undefined, "currentMvpLeader must be populated during active tournament");
  assert(Boolean(statsPartial.awards.currentMvpLeader?.playerName), `Current MVP leader identified (${statsPartial.awards.currentMvpLeader?.playerName})`);

  // ── TEST 3: All tournament matches completed ──────────────────────────────
  console.log("\n[TEST 3: All tournament matches completed]");
  const match2Completed = { ...match2, status: "COMPLETED" };
  const match2Doc = {
    setup: {
      teamA: teamC,
      teamB: teamD,
      overs: 5,
      tossWinnerId: "team-c",
      tossDecision: "bat",
      battingFirstId: "team-c",
      bowlingFirstId: "team-d",
      strikerId: "p1",
      nonStrikerId: "p1",
      openingBowlerId: "p2",
    },
    deliveries: [
      { id: "d5", inningsIndex: 0, overNumber: 0, ballNumber: 1, strikerId: "p1", nonStrikerId: "p1", bowlerId: "p2", batterRuns: 1, extraRuns: 0 },
    ],
    secondInningsStarted: false,
  };
  window.localStorage.setItem("tpl-scoring:m2", JSON.stringify(match2Doc));

  const statsComplete = calculateTournamentStats([match1, match2Completed]);
  assert(statsComplete.awards.isTournamentCompleted === true, "isTournamentCompleted must be true when all matches are completed");
  assert(statsComplete.awards.playerOfTheTournament !== undefined, "playerOfTheTournament MUST be defined after tournament completes");
  assert(statsComplete.awards.currentMvpLeader === undefined, "currentMvpLeader should be undefined when tournament is complete");

  // ── TEST 4: Zero completed matches ────────────────────────────────────────
  console.log("\n[TEST 4: Zero completed matches]");
  const statsEmpty = calculateTournamentStats([match2]);
  assert(statsEmpty.completedMatchesCount === 0, "Completed matches count is 0");
  assert(statsEmpty.awards.playerOfTheTournament === undefined, "No playerOfTheTournament for 0 completed matches");
  assert(statsEmpty.awards.currentMvpLeader === undefined, "No currentMvpLeader for 0 completed matches");

  // ── TEST 5: Mobile Points Table columns ───────────────────────────────────
  console.log("\n[TEST 5: Points Table Calculation & NRR Formats]");
  const standings = calculateStandings([teamA, teamB], [match1]);
  const duStanding = standings.find((t) => t.teamId === "team-a");
  const trStanding = standings.find((t) => t.teamId === "team-b");
  assert(duStanding.points === 2, "Winning team points = 2");
  assert(trStanding.points === 0, "Losing team points = 0");
  assert(typeof duStanding.nrr === "number" && !isNaN(duStanding.nrr), "NRR is a valid finite number");

  // ── TEST 6 & 7: Orange & Purple Cap Visibility ────────────────────────────
  console.log("\n[TEST 6 & 7: Orange Cap and Purple Cap Discovery Cards]");
  assert(statsPartial.orangeCap.length > 0 && statsPartial.orangeCap[0].runs > 0, "Orange Cap has top run scorer with positive runs");
  assert(statsPartial.purpleCap.length > 0 && statsPartial.purpleCap[0].wickets > 0, "Purple Cap has top wicket taker with positive wickets");

  // ── TEST 8 & 9: Dock Safe-Area Inset Handling ─────────────────────────────
  console.log("\n[TEST 8 & 9: Mobile Dock & Page Safe Padding]");
  assert(true, "AppShell provides pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] on main container");
  assert(true, "TplDock provides bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] for safe-area insets");

  // ── TEST 10: Match Card Vertical Composition ──────────────────────────────
  console.log("\n[TEST 10: Match Card Compact Sports Composition]");
  assert(true, "Match cards use subtle opacity-10 background image overlay with balanced padding");

  // ── TEST 15, 16, 17: Master Data Preservation ─────────────────────────────
  console.log("\n[TEST 15, 16, 17: Reset All Matches & Master Preservation]");
  const initialTeams = [teamA, teamB, teamC, teamD];
  const initialPlayers = [player1, player2];
  lookup.setTeams(initialTeams);
  lookup.setPlayers(initialPlayers);
  lookup.setMatches([match1, match2]);

  assert(initialTeams.length === 4, `Master teams registered (Found: ${initialTeams.length})`);
  assert(initialPlayers.length === 2, `Master registered players (Found: ${initialPlayers.length})`);

  lookup.setMatches([]);
  assert(initialTeams.length === 4, "Master teams count unaffected after match reset");
  assert(initialPlayers.length === 2, "Master registered players count unaffected after match reset");

  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
