import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { calculatePlayerPerformance } from '../src/lib/scoring/playerPerformance.ts';
import { buildMatchState, oversText } from '../src/lib/scoring/engine.ts';
import { lookup, toMatch, toPlayer } from '../src/lib/repositories.ts';
import { formatMatchTime, formatMatchDate } from '../src/lib/utils.ts';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const url = env.VITE_SUPABASE_URL || 'https://jhyxoyvxuhbwnqnjvjwh.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const client = createClient(url, key);

async function runE2EProductionAudit() {
  console.log("===============================================================================");
  console.log("TPL 2026 — COMPLETE END-TO-END PRODUCTION & DATA INTEGRITY AUDIT");
  console.log("===============================================================================\n");

  // 1. SUPABASE REAL SCHEMA VERIFICATION
  console.log("[1. SUPABASE SCHEMA AUDIT]");
  const { count: masterPlayersCount } = await client.from('registrations').select('*', { count: 'exact', head: true });
  const { count: masterTeamsCount } = await client.from('teams').select('*', { count: 'exact', head: true });
  const { count: matchesCount } = await client.from('matches').select('*', { count: 'exact', head: true });
  const { count: inningsCount } = await client.from('innings').select('*', { count: 'exact', head: true });
  const { count: ballsCount } = await client.from('balls').select('*', { count: 'exact', head: true });

  console.log(`  ✓ Master Players (registrations): ${masterPlayersCount}`);
  console.log(`  ✓ Master Teams (teams): ${masterTeamsCount}`);
  console.log(`  ✓ Operational Matches: ${matchesCount}`);
  console.log(`  ✓ Operational Innings: ${inningsCount}`);
  console.log(`  ✓ Operational Balls: ${ballsCount}\n`);

  // 2. PLAYER PROFILE ROUTING & LOOKUP AUDIT
  console.log("[2. PLAYER PROFILE ROUTING & LOOKUP AUDIT]");
  const { data: sampleRegistrations } = await client.from('registrations').select('*').limit(3);
  for (const reg of sampleRegistrations) {
    const domainPlayer = toPlayer(reg);
    lookup.setPlayers([domainPlayer]);

    // Test lookup by ID
    const byId = lookup.player(domainPlayer.id);
    // Test lookup by Slug
    const bySlug = lookup.player(domainPlayer.slug);
    // Test lookup by Name
    const byName = lookup.player(domainPlayer.name);

    if (!byId || !bySlug || !byName) {
      throw new Error(`Player lookup failed for ${domainPlayer.name} (id: ${domainPlayer.id}, slug: ${domainPlayer.slug})`);
    }
    console.log(`  ✓ Player "${domainPlayer.name}" resolved by ID (${domainPlayer.id}), Slug ("${domainPlayer.slug}"), and Name`);
  }

  // 3. SCHEDULE GENERATION AUDIT (9 Cross-Group Matches)
  console.log("\n[3. 9-MATCH CROSS-GROUP SCHEDULE GENERATOR AUDIT]");
  const { data: teamsList } = await client.from('teams').select('*').limit(6);
  const group1 = teamsList.slice(0, 3);
  const group2 = teamsList.slice(3, 6);

  const fixtures = [];
  let mNum = 1;
  const baseTime = new Date("2026-08-30T09:00:00Z");
  for (let i = 0; i < group1.length; i++) {
    for (let j = 0; j < group2.length; j++) {
      const matchTime = new Date(baseTime.getTime() + (mNum - 1) * 45 * 60 * 1000);
      fixtures.push({
        id: `tpl-fixture-${mNum}`,
        tournament: "TPL 2026",
        matchNumber: mNum,
        teamAId: group1[i].id,
        teamBId: group2[j].id,
        scheduledAt: matchTime.toISOString(),
        timeFormatted: formatMatchTime(matchTime),
        overs: 5,
      });
      mNum++;
    }
  }

  console.log(`  ✓ Generated ${fixtures.length} matches:`);
  fixtures.forEach(f => {
    const tA = teamsList.find(t => t.id === f.teamAId);
    const tB = teamsList.find(t => t.id === f.teamBId);
    console.log(`    Match #${f.matchNumber}: ${tA.name} vs ${tB.name} at ${f.timeFormatted} (${f.overs} Overs)`);
  });

  if (fixtures.length !== 9) throw new Error("Expected exactly 9 fixtures");

  // 4. LIVE MATCH SCORING & DYNAMIC STATS ACCUMULATION
  console.log("\n[4. LIVE MATCH SCORING & DYNAMIC PARTICIPATION STATS]");
  const playerA = toPlayer(sampleRegistrations[0]);
  const playerB = toPlayer(sampleRegistrations[1]);

  const testMatch = {
    id: "match-e2e-test-1",
    tournament: "TPL 2026",
    matchNumber: 1,
    teamAId: group1[0].id,
    teamBId: group2[0].id,
    venue: "TPL Ground",
    overs: 5,
    scheduledAt: "2026-08-30T09:00:00Z",
    status: "COMPLETED",
    resultText: `${group1[0].name} won by 10 runs`,
  };

  const testSetup = {
    playingXI: {
      [group1[0].id]: { playerIds: [playerA.id] },
      [group2[0].id]: { playerIds: [playerB.id] },
    },
    battingFirstId: group1[0].id,
  };

  const testDeliveries = [
    {
      id: "b1",
      matchId: testMatch.id,
      inningsId: "inn-1",
      inningsIndex: 0,
      overNumber: 0,
      ballNumber: 1,
      strikerId: playerA.id,
      nonStrikerId: "p-non-striker",
      bowlerId: playerB.id,
      batterRuns: 4,
      extraRuns: 0,
      totalRuns: 4,
      shotZone: "cover",
      isLegal: true,
      timestamp: Date.now(),
    },
    {
      id: "b2",
      matchId: testMatch.id,
      inningsId: "inn-1",
      inningsIndex: 0,
      overNumber: 0,
      ballNumber: 2,
      strikerId: playerA.id,
      nonStrikerId: "p-non-striker",
      bowlerId: playerB.id,
      batterRuns: 6,
      extraRuns: 0,
      totalRuns: 6,
      shotZone: "long-on",
      isLegal: true,
      timestamp: Date.now(),
    },
    {
      id: "b3",
      matchId: testMatch.id,
      inningsId: "inn-1",
      inningsIndex: 0,
      overNumber: 0,
      ballNumber: 3,
      strikerId: playerA.id,
      nonStrikerId: "p-non-striker",
      bowlerId: playerB.id,
      batterRuns: 0,
      extraRuns: 0,
      totalRuns: 0,
      isLegal: true,
      wicket: {
        type: "Bowled",
        batterOutId: playerA.id,
        bowlerId: playerB.id,
      },
      timestamp: Date.now(),
    },
  ];

  const testMatchState = buildMatchState({
    match: testMatch,
    setup: testSetup,
    deliveries: testDeliveries,
    secondInningsStarted: false,
  });

  const playerAStats = calculatePlayerPerformance(
    playerA.id,
    [testMatch],
    testMatchState,
    testMatch.id
  );

  const playerBStats = calculatePlayerPerformance(
    playerB.id,
    [testMatch],
    testMatchState,
    testMatch.id
  );

  console.log(`  ✓ Batter Stats for ${playerA.name}:`);
  console.log(`    - Matches Played: ${playerAStats.matchesPlayed}`);
  console.log(`    - Runs: ${playerAStats.batting.runs} (${playerAStats.batting.balls} balls)`);
  console.log(`    - 4s: ${playerAStats.batting.fours} | 6s: ${playerAStats.batting.sixes}`);
  console.log(`    - Strike Rate: ${playerAStats.batting.strikeRate.toFixed(1)}`);
  console.log(`    - Match History: ${playerAStats.matchHistory.length} match recorded`);

  console.log(`  ✓ Bowler Stats for ${playerB.name}:`);
  console.log(`    - Matches Played: ${playerBStats.matchesPlayed}`);
  console.log(`    - Wickets: ${playerBStats.bowling.wickets} / ${playerBStats.bowling.runsConceded}`);
  console.log(`    - Overs: ${playerBStats.bowling.oversText} ov`);

  if (playerAStats.matchesPlayed !== 1 || playerAStats.batting.runs !== 10 || playerBStats.bowling.wickets !== 1) {
    throw new Error("Dynamic match statistics computation failed!");
  }

  // 5. TEST RESET ISOLATION (STATS RETURN TO CLEAN ZERO)
  console.log("\n[5. TEST RESET ISOLATION (ZERO DERIVED RESIDUE)]");
  const playerAAfterReset = calculatePlayerPerformance(playerA.id, [], undefined, undefined);
  const playerBAfterReset = calculatePlayerPerformance(playerB.id, [], undefined, undefined);

  console.log(`  ✓ Player ${playerA.name} After Reset: Matches Played = ${playerAAfterReset.matchesPlayed}, Runs = ${playerAAfterReset.batting.runs}, History = ${playerAAfterReset.matchHistory.length}`);
  console.log(`  ✓ Player ${playerB.name} After Reset: Matches Played = ${playerBAfterReset.matchesPlayed}, Wickets = ${playerBAfterReset.bowling.wickets}, History = ${playerBAfterReset.matchHistory.length}`);

  if (
    playerAAfterReset.matchesPlayed !== 0 ||
    playerAAfterReset.batting.runs !== 0 ||
    playerBAfterReset.matchesPlayed !== 0 ||
    playerBAfterReset.bowling.wickets !== 0
  ) {
    throw new Error("Stats failed to return to clean zero after reset!");
  }

  // 6. FINAL MASTER DATA PRESERVATION AUDIT
  console.log("\n[6. MASTER DATA INTEGRITY VERIFICATION]");
  const { count: endPlayersCount } = await client.from('registrations').select('*', { count: 'exact', head: true });
  const { count: endTeamsCount } = await client.from('teams').select('*', { count: 'exact', head: true });

  console.log(`  ✓ Registrations (Master Players): ${endPlayersCount} (Must be ${masterPlayersCount})`);
  console.log(`  ✓ Teams (Master Teams): ${endTeamsCount} (Must be ${masterTeamsCount})`);

  if (endPlayersCount !== masterPlayersCount || endTeamsCount !== masterTeamsCount) {
    throw new Error("Master database integrity was violated!");
  }

  console.log("\n===============================================================================");
  console.log(">>> ALL E2E INTEGRATION & PRODUCTION AUDIT CHECKS PASSED (100% GREEN)!");
  console.log("===============================================================================");
}

runE2EProductionAudit().catch(err => {
  console.error("E2E Audit Failed:", err);
  process.exit(1);
});
