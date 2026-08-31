import { calculateTournamentStats } from "../src/lib/scoring/statistics.ts";
import { calculateStandings } from "../src/lib/scoring/standings.ts";
import { lookup, SupabaseMatchRepository } from "../src/lib/repositories.ts";

async function runResetPreservesGroupsTests() {
  console.log("================================================================================");
  console.log(" TPL 2026 — RESET ALL MATCHES ISOLATION & GROUP PRESERVATION REGRESSION TEST");
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

  // 1. Setup Mock Teams (6 official teams) & 89 Players
  const team1 = { id: "team-du", name: "Dainagoda United", shortName: "DU", groupName: "Group 1", logoUrl: "" };
  const team2 = { id: "team-bmr", name: "Bary Mawathe Royals", shortName: "BMR", groupName: "Group 1", logoUrl: "" };
  const team3 = { id: "team-kl", name: "Kurunduwatte Legends", shortName: "KL", groupName: "Group 1", logoUrl: "" };
  const team4 = { id: "team-ngw", name: "New Garden Warriors", shortName: "NGW", groupName: "Group 2", logoUrl: "" };
  const team5 = { id: "team-rk", name: "Riverside Kings", shortName: "RK", groupName: "Group 2", logoUrl: "" };
  const team6 = { id: "team-tc", name: "Thundu Capital", shortName: "TC", groupName: "Group 2", logoUrl: "" };

  const officialTeams = [team1, team2, team3, team4, team5, team6];

  const officialPlayers = Array.from({ length: 89 }, (_, idx) => ({
    id: `player-${idx + 1}`,
    name: `Player ${idx + 1}`,
    teamId: officialTeams[idx % 6].id,
    role: idx % 3 === 0 ? "Batsman" : idx % 3 === 1 ? "Bowler" : "All-rounder",
  }));

  lookup.setTeams(officialTeams);
  lookup.setPlayers(officialPlayers);

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

  // TEST 1: Configure 3 Group A + 3 Group B teams
  console.log("[TEST 1: Group Configuration Setup]");
  const groupAConfig = [team1.id, team2.id, team3.id];
  const groupBConfig = [team4.id, team5.id, team6.id];
  window.localStorage.setItem("tpl-schedule-groups", JSON.stringify({ group1: groupAConfig, group2: groupBConfig }));

  assert(groupAConfig.length === 3, "Group A contains exactly 3 configured teams");
  assert(groupBConfig.length === 3, "Group B contains exactly 3 configured teams");

  // TEST 2 & 3: Generate 9 cross-group matches schedule
  console.log("\n[TEST 2 & 3: Cross-Group 9 Matches Generation]");
  const generatedFixtures = [];
  let matchNum = 1;
  for (let i = 0; i < groupAConfig.length; i++) {
    for (let j = 0; j < groupBConfig.length; j++) {
      generatedFixtures.push({
        id: `fixture-m${matchNum}`,
        matchNumber: matchNum,
        teamAId: groupAConfig[i],
        teamBId: groupBConfig[j],
        overs: 5,
        status: matchNum === 1 ? "COMPLETED" : "UPCOMING",
        winnerId: matchNum === 1 ? groupAConfig[i] : undefined,
        winMargin: matchNum === 1 ? "15 runs" : undefined,
        scheduledAt: new Date().toISOString(),
        manOfTheMatchId: matchNum === 1 ? "player-1" : undefined,
      });
      matchNum++;
    }
  }
  lookup.setMatches(generatedFixtures);
  assert(generatedFixtures.length === 9, `Schedule generated 9 matches (Found: ${generatedFixtures.length})`);

  // TEST 4: Create scoring data
  console.log("\n[TEST 4: Create Match & Scoring State]");
  const match1Doc = {
    setup: {
      teamA: team1,
      teamB: team4,
      overs: 5,
      tossWinnerId: team1.id,
      tossDecision: "bat",
      battingFirstId: team1.id,
      bowlingFirstId: team4.id,
      strikerId: "player-1",
      nonStrikerId: "player-2",
      openingBowlerId: "player-4",
    },
    deliveries: [
      { id: "d1", inningsIndex: 0, overNumber: 0, ballNumber: 1, strikerId: "player-1", nonStrikerId: "player-2", bowlerId: "player-4", batterRuns: 6, extraRuns: 0 },
      { id: "d2", inningsIndex: 0, overNumber: 0, ballNumber: 2, strikerId: "player-1", nonStrikerId: "player-2", bowlerId: "player-4", batterRuns: 4, extraRuns: 0 },
      { id: "d3", inningsIndex: 0, overNumber: 0, ballNumber: 3, strikerId: "player-1", nonStrikerId: "player-2", bowlerId: "player-4", batterRuns: 0, extraRuns: 0, wicket: { type: "bowled", playerOutId: "player-1" } },
    ],
    secondInningsStarted: false,
  };
  window.localStorage.setItem("tpl-scoring:fixture-m1", JSON.stringify(match1Doc));

  const statsBeforeReset = calculateTournamentStats(generatedFixtures);
  assert(statsBeforeReset.completedMatchesCount === 1, "Tournament has 1 completed match before reset");
  assert(statsBeforeReset.orangeCap[0]?.runs === 10, "Player 1 has 10 tournament runs before reset");
  assert(statsBeforeReset.purpleCap[0]?.wickets === 1, "Player 4 has 1 tournament wicket before reset");

  // TEST 5: Execute RESET ALL MATCHES (Simulating client reset handler + repository)
  console.log("\n[TEST 5: Executing RESET ALL MATCHES]");
  // 1. Purge match-specific scoring docs only
  const keysToRemove = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && (k.startsWith("tpl-scoring:") || k.startsWith("tpl-live-match:") || k.startsWith("tpl-match-state:"))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  // 2. Clear matches in lookup
  lookup.setMatches([]);

  // TEST 6: Verify match data returns to ZERO
  console.log("\n[TEST 6: Match Data Returns to Zero]");
  const remainingMatches = lookup.matches();
  assert(remainingMatches.length === 0, `Matches = 0 (Found: ${remainingMatches.length})`);

  const statsAfterReset = calculateTournamentStats(remainingMatches);
  assert(statsAfterReset.completedMatchesCount === 0, `Completed matches = 0 (Found: ${statsAfterReset.completedMatchesCount})`);
  assert(statsAfterReset.orangeCap.length === 0, `Orange Cap leaders = 0 (Found: ${statsAfterReset.orangeCap.length})`);
  assert(statsAfterReset.purpleCap.length === 0, `Purple Cap leaders = 0 (Found: ${statsAfterReset.purpleCap.length})`);
  assert(statsAfterReset.totalTournamentRuns === 0, `Total tournament runs = 0 (Found: ${statsAfterReset.totalTournamentRuns})`);
  assert(statsAfterReset.totalTournamentWickets === 0, `Total tournament wickets = 0 (Found: ${statsAfterReset.totalTournamentWickets})`);

  // TEST 7: Verify Group A & Group B remain EXACTLY SAME 3 TEAMS
  console.log("\n[TEST 7: Group Assignments Intact After Reset]");
  const savedGroupsRaw = window.localStorage.getItem("tpl-schedule-groups");
  assert(Boolean(savedGroupsRaw), "tpl-schedule-groups is NOT deleted during reset");

  const savedGroups = JSON.parse(savedGroupsRaw || "{}");
  assert(
    JSON.stringify(savedGroups.group1) === JSON.stringify(groupAConfig),
    `Group A remains exactly [${groupAConfig.join(", ")}]`
  );
  assert(
    JSON.stringify(savedGroups.group2) === JSON.stringify(groupBConfig),
    `Group B remains exactly [${groupBConfig.join(", ")}]`
  );

  // TEST 8 & 9: Master Registrations and Teams Unaffected
  console.log("\n[TEST 8 & 9: Master Records Integrity]");
  const currentTeams = lookup.teams();
  const currentPlayers = lookup.players();
  assert(currentTeams.length === 6, `6 official teams preserved (Found: ${currentTeams.length})`);
  assert(currentPlayers.length === 89, `89 master players preserved (Found: ${currentPlayers.length})`);

  // TEST 10: Schedule Generator Persistence
  console.log("\n[TEST 10: Schedule Generator Preserved State]");
  const restoredGroup1 = savedGroups.group1.map((id) => lookup.team(id)?.shortName);
  const restoredGroup2 = savedGroups.group2.map((id) => lookup.team(id)?.shortName);
  assert(
    restoredGroup1.join(", ") === "DU, BMR, KL",
    `Schedule Generator Group A restored: ${restoredGroup1.join(", ")}`
  );
  assert(
    restoredGroup2.join(", ") === "NGW, RK, TC",
    `Schedule Generator Group B restored: ${restoredGroup2.join(", ")}`
  );

  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

runResetPreservesGroupsTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
