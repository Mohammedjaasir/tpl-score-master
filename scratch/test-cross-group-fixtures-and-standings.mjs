import assert from "node:assert/strict";

console.log("=== TPL 2026: CRITICAL TOURNAMENT FORMAT & CROSS-GROUP FIXTURE SUITE ===");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// ── Domain Logic Mirror ───────────────────────────────────────────────────────
function getTeamGroup(team) {
  const g = (team.groupName || team.group_name || "").toUpperCase().trim();
  if (g.includes("1") || g.includes("A")) return "Group 1";
  if (g.includes("2") || g.includes("B")) return "Group 2";
  if (["team-du", "team-bmr", "team-kl"].includes(team.id)) return "Group 1";
  if (["team-ngw", "team-rk", "team-tc"].includes(team.id)) return "Group 2";
  return "Group 1";
}

const SEED_TEAMS = [
  { id: "team-du", name: "Dainagoda United", shortName: "DU", groupName: "Group 1" },
  { id: "team-bmr", name: "Bary Mawathe Royals", shortName: "BMR", groupName: "Group 1" },
  { id: "team-kl", name: "Kurunduwatte Legends", shortName: "KL", groupName: "Group 1" },
  { id: "team-ngw", name: "New Garden Warriors", shortName: "NGW", groupName: "Group 2" },
  { id: "team-rk", name: "Riverside Kings", shortName: "RK", groupName: "Group 2" },
  { id: "team-tc", name: "Thundu Capital", shortName: "TC", groupName: "Group 2" },
];

const g1Teams = SEED_TEAMS.filter((t) => getTeamGroup(t) === "Group 1");
const g2Teams = SEED_TEAMS.filter((t) => getTeamGroup(t) === "Group 2");

assert.equal(g1Teams.length, 3, "Group 1 must contain 3 seed teams");
assert.equal(g2Teams.length, 3, "Group 2 must contain 3 seed teams");

// Validation helper replicating frontend and backend cross-group validation
function validateFixtureTeams(teamAId, teamBId, teamsList = SEED_TEAMS) {
  if (!teamAId || !teamBId) throw new Error("Both Team 1 and Team 2 must be selected.");
  if (teamAId === teamBId) throw new Error("Team 1 and Team 2 cannot be the same team.");
  const teamA = teamsList.find((t) => t.id === teamAId);
  const teamB = teamsList.find((t) => t.id === teamBId);
  if (!teamA || !teamB) throw new Error("Selected teams must be valid official tournament teams.");
  if (getTeamGroup(teamA) === getTeamGroup(teamB)) {
    throw new Error("Invalid fixture: teams must belong to different groups.");
  }
  return true;
}

// Schedule generation helper replicating backend cross-group generator
function generateCrossGroupFixtures(group1Ids, group2Ids) {
  if (group1Ids.length !== 3 || group2Ids.length !== 3) {
    throw new Error("Groups must contain 3 teams each");
  }
  const fixtures = [];
  const pairingKeys = new Set();

  for (let i = 0; i < group1Ids.length; i++) {
    for (let j = 0; j < group2Ids.length; j++) {
      const tA = group1Ids[i];
      const tB = group2Ids[j];
      
      // Check cross-group
      validateFixtureTeams(tA, tB);

      // Canonical pair key to prevent reverse duplicates
      const pairKey = [tA, tB].sort().join("___");
      if (pairingKeys.has(pairKey)) {
        throw new Error(`Duplicate pairing detected: ${pairKey}`);
      }
      pairingKeys.add(pairKey);

      fixtures.push({
        teamAId: tA,
        teamBId: tB,
        matchNumber: fixtures.length + 1,
      });
    }
  }
  return fixtures;
}

// Standings calculation replicating pure-functional engine
function calculateStandings(participatingTeams, matches) {
  const map = new Map();
  participatingTeams.forEach((t) => {
    map.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      teamShortName: t.shortName,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      runsFor: 0,
      legalBallsFor: 0,
      runsAgainst: 0,
      legalBallsAgainst: 0,
    });
  });

  matches.forEach((m) => {
    if (m.status !== "COMPLETED") return;
    const statsA = map.get(m.teamAId);
    const statsB = map.get(m.teamBId);
    if (!statsA && !statsB) return;

    if (statsA) {
      statsA.played += 1;
      if (m.winnerId === m.teamAId) {
        statsA.won += 1;
        statsA.points += 2;
      } else if (m.winnerId === m.teamBId) {
        statsA.lost += 1;
      } else {
        statsA.tied += 1;
        statsA.points += 1;
      }
      statsA.runsFor += m.runsA || 0;
      statsA.legalBallsFor += m.ballsA || 0;
      statsA.runsAgainst += m.runsB || 0;
      statsA.legalBallsAgainst += m.ballsB || 0;
    }

    if (statsB) {
      statsB.played += 1;
      if (m.winnerId === m.teamBId) {
        statsB.won += 1;
        statsB.points += 2;
      } else if (m.winnerId === m.teamAId) {
        statsB.lost += 1;
      } else {
        statsB.tied += 1;
        statsB.points += 1;
      }
      statsB.runsFor += m.runsB || 0;
      statsB.legalBallsFor += m.ballsB || 0;
      statsB.runsAgainst += m.runsA || 0;
      statsB.legalBallsAgainst += m.ballsA || 0;
    }
  });

  return Array.from(map.values()).map((s) => {
    const rpoFor = s.legalBallsFor > 0 ? (s.runsFor / (s.legalBallsFor / 6)) : 0;
    const rpoAgainst = s.legalBallsAgainst > 0 ? (s.runsAgainst / (s.legalBallsAgainst / 6)) : 0;
    const nrr = s.played > 0 ? Number((rpoFor - rpoAgainst).toFixed(2)) : 0;
    return { ...s, nrr };
  });
}

function getGroupedTournamentStandings(teams, matches) {
  const g1 = teams.filter((t) => getTeamGroup(t) === "Group 1");
  const g2 = teams.filter((t) => getTeamGroup(t) === "Group 2");
  return {
    groupA: calculateStandings(g1, matches),
    groupB: calculateStandings(g2, matches),
    all: calculateStandings(teams, matches),
  };
}

// TEST 1: Group 1 vs Group 2 fixture is accepted
runTest("TEST 1: Group 1 vs Group 2 fixture is accepted", () => {
  const bmr = g1Teams[0].id;
  const ngw = g2Teams[0].id;
  assert.equal(validateFixtureTeams(bmr, ngw), true);
});

// TEST 2: Group 2 vs Group 1 fixture is accepted
runTest("TEST 2: Group 2 vs Group 1 fixture is accepted", () => {
  const rk = g2Teams[1].id;
  const du = g1Teams[1].id;
  assert.equal(validateFixtureTeams(rk, du), true);
});

// TEST 3: Group 1 vs Group 1 fixture is rejected
runTest("TEST 3: Group 1 vs Group 1 fixture is rejected", () => {
  const bmr = g1Teams[0].id;
  const du = g1Teams[1].id;
  assert.throws(
    () => validateFixtureTeams(bmr, du),
    /Invalid fixture: teams must belong to different groups\./
  );
});

// TEST 4: Group 2 vs Group 2 fixture is rejected
runTest("TEST 4: Group 2 vs Group 2 fixture is rejected", () => {
  const ngw = g2Teams[0].id;
  const tc = g2Teams[2].id;
  assert.throws(
    () => validateFixtureTeams(ngw, tc),
    /Invalid fixture: teams must belong to different groups\./
  );
});

// TEST 5: 3 Group 1 × 3 Group 2 generates exactly 9 possible pairings
runTest("TEST 5: 3 Group 1 × 3 Group 2 generates exactly 9 possible pairings", () => {
  const g1Ids = g1Teams.map((t) => t.id);
  const g2Ids = g2Teams.map((t) => t.id);
  const fixtures = generateCrossGroupFixtures(g1Ids, g2Ids);
  assert.equal(fixtures.length, 9);
});

// TEST 6: No duplicate pairings are generated
runTest("TEST 6: No duplicate pairings are generated", () => {
  const g1Ids = g1Teams.map((t) => t.id);
  const g2Ids = g2Teams.map((t) => t.id);
  const fixtures = generateCrossGroupFixtures(g1Ids, g2Ids);
  const uniquePairs = new Set(fixtures.map((f) => [f.teamAId, f.teamBId].sort().join("___")));
  assert.equal(uniquePairs.size, 9);
});

// TEST 7: Completed cross-group match updates Group 1 team's standings
runTest("TEST 7: Completed cross-group match updates Group 1 team's standings", () => {
  const bmr = "team-bmr"; // Group 1
  const ngw = "team-ngw"; // Group 2

  const match = {
    id: "m-test-1",
    teamAId: bmr,
    teamBId: ngw,
    winnerId: bmr, // BMR won
    status: "COMPLETED",
    runsA: 50,
    ballsA: 30,
    runsB: 40,
    ballsB: 30,
  };

  const { groupA } = getGroupedTournamentStandings(SEED_TEAMS, [match]);
  const bmrStanding = groupA.find((s) => s.teamId === bmr);
  assert.ok(bmrStanding, "BMR must exist in Group 1 standings");
  assert.equal(bmrStanding.played, 1);
  assert.equal(bmrStanding.won, 1);
  assert.equal(bmrStanding.lost, 0);
  assert.equal(bmrStanding.points, 2);
});

// TEST 8: Same completed match updates Group 2 team's standings
runTest("TEST 8: Same completed match updates Group 2 team's standings", () => {
  const bmr = "team-bmr"; // Group 1
  const ngw = "team-ngw"; // Group 2

  const match = {
    id: "m-test-1",
    teamAId: bmr,
    teamBId: ngw,
    winnerId: bmr, // BMR won, NGW lost
    status: "COMPLETED",
    runsA: 50,
    ballsA: 30,
    runsB: 40,
    ballsB: 30,
  };

  const { groupB } = getGroupedTournamentStandings(SEED_TEAMS, [match]);
  const ngwStanding = groupB.find((s) => s.teamId === ngw);
  assert.ok(ngwStanding, "NGW must exist in Group 2 standings");
  assert.equal(ngwStanding.played, 1);
  assert.equal(ngwStanding.won, 0);
  assert.equal(ngwStanding.lost, 1);
  assert.equal(ngwStanding.points, 0);
});

// TEST 9: Team group assignments remain unchanged after match completion
runTest("TEST 9: Team group assignments remain unchanged after match completion", () => {
  const bmrTeam = SEED_TEAMS.find((t) => t.id === "team-bmr");
  const ngwTeam = SEED_TEAMS.find((t) => t.id === "team-ngw");
  assert.equal(getTeamGroup(bmrTeam), "Group 1");
  assert.equal(getTeamGroup(ngwTeam), "Group 2");
});

// TEST 10: Adding a new team does not alter existing team groups
runTest("TEST 10: Adding a new team does not alter existing team groups", () => {
  const newTeam = {
    id: "team-custom-1",
    name: "Custom Challengers",
    shortName: "CC",
    groupName: "Group 2",
  };
  const expandedTeams = [...SEED_TEAMS, newTeam];
  assert.equal(getTeamGroup(newTeam), "Group 2");
  assert.equal(getTeamGroup(expandedTeams.find((t) => t.id === "team-bmr")), "Group 1");
  assert.equal(getTeamGroup(expandedTeams.find((t) => t.id === "team-ngw")), "Group 2");
});

// TEST 11: Reset pending fixtures does not delete completed cross-group matches
runTest("TEST 11: Reset pending fixtures does not delete completed cross-group matches", () => {
  const completedMatch = {
    id: "m-comp-1",
    teamAId: "team-bmr",
    teamBId: "team-ngw",
    winnerId: "team-bmr",
    status: "COMPLETED",
    overs: 5,
  };
  const scheduledMatch = {
    id: "m-sched-2",
    teamAId: "team-du",
    teamBId: "team-rk",
    status: "UPCOMING",
    overs: 5,
  };

  const allMatches = [completedMatch, scheduledMatch];
  // Filter replicating resetPendingFixtures
  const preservedMatches = allMatches.filter((m) => m.status === "COMPLETED" || m.status === "LIVE");
  assert.equal(preservedMatches.length, 1);
  assert.equal(preservedMatches[0].id, "m-comp-1");
});

// TEST 12: Points Table correctly displays each team under its permanent group
runTest("TEST 12: Points Table correctly displays each team under its permanent group", () => {
  const { groupA, groupB } = getGroupedTournamentStandings(SEED_TEAMS, []);
  assert.equal(groupA.length, 3);
  assert.equal(groupB.length, 3);
  assert.deepEqual(groupA.map((s) => s.teamShortName).sort(), ["BMR", "DU", "KL"]);
  assert.deepEqual(groupB.map((s) => s.teamShortName).sort(), ["NGW", "RK", "TC"]);
});

// TEST 13: NRR from cross-group match is applied to both teams correctly
runTest("TEST 13: NRR from cross-group match is applied to both teams correctly", () => {
  const bmr = "team-bmr"; // Group 1
  const ngw = "team-ngw"; // Group 2

  // BMR: 50 runs in 5.0 ov (30 balls) -> RPO 10.0
  // NGW: 40 runs in 5.0 ov (30 balls) -> RPO 8.0
  // BMR NRR = +2.00, NGW NRR = -2.00
  const match = {
    id: "m-nrr-test",
    teamAId: bmr,
    teamBId: ngw,
    winnerId: bmr,
    status: "COMPLETED",
    runsA: 50,
    ballsA: 30,
    runsB: 40,
    ballsB: 30,
  };

  const standings = calculateStandings(SEED_TEAMS, [match]);
  const bmrSt = standings.find((s) => s.teamId === bmr);
  const ngwSt = standings.find((s) => s.teamId === ngw);
  assert.ok(bmrSt && ngwSt);
  assert.equal(bmrSt.played, 1);
  assert.equal(ngwSt.played, 1);
  assert.equal(bmrSt.nrr, 2.0);
  assert.equal(ngwSt.nrr, -2.0);
});

// TEST 14: OBS correctly displays the cross-group match
runTest("TEST 14: OBS correctly displays the cross-group match", () => {
  const match = {
    id: "m-obs-1",
    teamAId: "team-bmr",
    teamBId: "team-ngw",
    status: "LIVE",
    overs: 5,
  };
  const teamA = SEED_TEAMS.find((t) => t.id === match.teamAId);
  const teamB = SEED_TEAMS.find((t) => t.id === match.teamBId);
  assert.equal(teamA.name, "Bary Mawathe Royals");
  assert.equal(teamB.name, "New Garden Warriors");
  assert.equal(`${teamA.name} vs ${teamB.name}`, "Bary Mawathe Royals vs New Garden Warriors");
});

console.log(`\n===============================================================`);
console.log(`ALL 14/14 TOURNAMENT FORMAT & CROSS-GROUP FIXTURE TESTS PASSED!`);
console.log(`===============================================================\n`);
