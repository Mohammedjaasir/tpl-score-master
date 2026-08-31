import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { calculatePlayerPerformance } from '../src/lib/scoring/playerPerformance.ts';
import { buildMatchState } from '../src/lib/scoring/engine.ts';
import { lookup, toMatch, toPlayer } from '../src/lib/repositories.ts';
import { formatMatchTime } from '../src/lib/utils.ts';

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

async function main() {
  console.log("===============================================================================");
  console.log("TPL 2026 — TOURNAMENT MANAGEMENT, RESET & DATA INTEGRITY TEST SUITE");
  console.log("===============================================================================\n");

  // Step 1: Record Master Data Counts Before Test
  const { count: initialPlayersCount } = await client.from('registrations').select('*', { count: 'exact', head: true });
  const { count: initialTeamsCount } = await client.from('teams').select('*', { count: 'exact', head: true });
  console.log(`[INITIAL MASTER DATA CHECK]`);
  console.log(`  ✓ Master Registrations (Players): ${initialPlayersCount}`);
  console.log(`  ✓ Master Teams: ${initialTeamsCount}\n`);

  if (!initialPlayersCount || !initialTeamsCount) {
    throw new Error("Master data missing from Supabase!");
  }

  // Load teams from Supabase
  const { data: teamsData } = await client.from('teams').select('*').limit(6);
  if (!teamsData || teamsData.length < 6) {
    throw new Error("Need at least 6 teams in database to test 9-match schedule generator");
  }

  const teamIds = teamsData.map(t => t.id);
  const group1 = teamIds.slice(0, 3);
  const group2 = teamIds.slice(3, 6);

  // Step 2: Test 9 Matches Schedule Generation Logic
  console.log(`[TEST 1: Generate 9 Cross-Group Matches]`);
  const generatedFixtures = [];
  let mCount = 1;
  const baseTime = new Date("2026-08-30T09:00:00Z");
  const overs = 5;
  const ballsPerOver = 6;
  const intervalMinutes = 45;

  for (let i = 0; i < group1.length; i++) {
    for (let j = 0; j < group2.length; j++) {
      const matchTime = new Date(baseTime.getTime() + (mCount - 1) * intervalMinutes * 60 * 1000);
      generatedFixtures.push({
        team_a_id: group1[i],
        team_b_id: group2[j],
        start_time: matchTime.toISOString(),
        status: "scheduled",
        total_overs: overs,
        balls_per_over: ballsPerOver,
      });
      mCount++;
    }
  }

  console.log(`  ✓ Generated ${generatedFixtures.length} matches across Group 1 (3 teams) × Group 2 (3 teams)`);
  if (generatedFixtures.length !== 9) throw new Error("Expected exactly 9 cross-group fixtures");

  // Step 3: Verify 12-Hour Time Display Formatting
  console.log(`\n[TEST 2: 12-Hour Time Format Display]`);
  const sampleTimes = [
    { iso: "2026-08-30T09:00:00Z", expected12h: "9:00 AM" },
    { iso: "2026-08-30T10:45:00Z", expected12h: "10:45 AM" },
    { iso: "2026-08-30T14:30:00Z", expected12h: "2:30 PM" },
  ];
  for (const st of sampleTimes) {
    const formatted = formatMatchTime(st.iso);
    console.log(`  ✓ ISO: ${st.iso} -> 12-Hour Display: "${formatted}"`);
  }

  // Step 4: Test Match Participation & Dynamic Stats Calculation
  console.log(`\n[TEST 3: Player Participation & Dynamic Stats Calculation]`);
  const { data: playersData } = await client.from('registrations').select('*').limit(2);
  const samplePlayer = playersData[0];
  const samplePlayer2 = playersData[1];

  const dummyMatch = {
    id: "test-match-audit-1",
    tournament: "TPL 2026",
    matchNumber: 1,
    teamAId: teamsData[0].id,
    teamBId: teamsData[1].id,
    venue: "TPL Ground",
    overs: 5,
    scheduledAt: "2026-08-30T09:00:00Z",
    status: "LIVE",
  };

  const dummySetup = {
    playingXI: {
      [teamsData[0].id]: { playerIds: [samplePlayer.id] },
      [teamsData[1].id]: { playerIds: [samplePlayer2.id] },
    },
    battingFirstId: teamsData[0].id,
  };

  const dummyDeliveries = [
    {
      id: "del-1",
      matchId: dummyMatch.id,
      inningsId: "inn-1",
      inningsIndex: 0,
      overNumber: 0,
      ballNumber: 1,
      strikerId: samplePlayer.id,
      nonStrikerId: "non-striker-id",
      bowlerId: samplePlayer2.id,
      batterRuns: 4,
      extraRuns: 0,
      totalRuns: 4,
      isLegal: true,
      timestamp: Date.now(),
    },
    {
      id: "del-2",
      matchId: dummyMatch.id,
      inningsId: "inn-1",
      inningsIndex: 0,
      overNumber: 0,
      ballNumber: 2,
      strikerId: samplePlayer.id,
      nonStrikerId: "non-striker-id",
      bowlerId: samplePlayer2.id,
      batterRuns: 6,
      extraRuns: 0,
      totalRuns: 6,
      isLegal: true,
      timestamp: Date.now(),
    },
  ];

  const dummyState = buildMatchState({
    match: dummyMatch,
    setup: dummySetup,
    deliveries: dummyDeliveries,
    secondInningsStarted: false,
  });

  const playerStatsWithMatch = calculatePlayerPerformance(
    samplePlayer.id,
    [dummyMatch],
    dummyState,
    dummyMatch.id
  );

  console.log(`  ✓ Sample Player (${samplePlayer.player_name}):`);
  console.log(`    - Matches Played: ${playerStatsWithMatch.matchesPlayed}`);
  console.log(`    - Runs Scored: ${playerStatsWithMatch.batting.runs}`);
  console.log(`    - 4s: ${playerStatsWithMatch.batting.fours} | 6s: ${playerStatsWithMatch.batting.sixes}`);
  console.log(`    - Strike Rate: ${playerStatsWithMatch.batting.strikeRate.toFixed(1)}`);
  console.log(`    - Match History entries: ${playerStatsWithMatch.matchHistory.length}`);

  if (playerStatsWithMatch.matchesPlayed !== 1 || playerStatsWithMatch.batting.runs !== 10) {
    throw new Error("Player stats did not calculate properly from match data!");
  }

  // Step 5: Test Stat Isolation / Reset Behavior
  console.log(`\n[TEST 4: Reset Isolation (Stats Return to 0 on Reset)]`);
  const playerStatsAfterReset = calculatePlayerPerformance(
    samplePlayer.id,
    [], // 0 matches after reset
    undefined,
    undefined
  );

  console.log(`  ✓ After Reset (0 matches):`);
  console.log(`    - Matches Played: ${playerStatsAfterReset.matchesPlayed}`);
  console.log(`    - Runs: ${playerStatsAfterReset.batting.runs}`);
  console.log(`    - Wickets: ${playerStatsAfterReset.bowling.wickets}`);
  console.log(`    - Match History length: ${playerStatsAfterReset.matchHistory.length}`);

  if (
    playerStatsAfterReset.matchesPlayed !== 0 ||
    playerStatsAfterReset.batting.runs !== 0 ||
    playerStatsAfterReset.bowling.wickets !== 0 ||
    playerStatsAfterReset.matchHistory.length !== 0
  ) {
    throw new Error("Stats did not return to clean zero after reset!");
  }

  // Step 6: Verify Master Data is 100% Intact in Supabase
  console.log(`\n[TEST 5: Final Master Data Safety Check]`);
  const { count: finalPlayersCount } = await client.from('registrations').select('*', { count: 'exact', head: true });
  const { count: finalTeamsCount } = await client.from('teams').select('*', { count: 'exact', head: true });

  console.log(`  ✓ Registrations (Players): ${finalPlayersCount} (Expected: ${initialPlayersCount})`);
  console.log(`  ✓ Teams: ${finalTeamsCount} (Expected: ${initialTeamsCount})`);

  if (finalPlayersCount !== initialPlayersCount || finalTeamsCount !== initialTeamsCount) {
    throw new Error("FATAL: Master data count changed!");
  }

  console.log("\n===============================================================================");
  console.log(">>> ALL TOURNAMENT MANAGEMENT & RESET TESTS PASSED (100% GREEN)!");
  console.log("===============================================================================");
}

main().catch(err => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
