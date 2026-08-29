import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateBatterWagonWheel,
  SHOT_ZONES,
  WAGON_WHEEL_ZONE_DISPLAY_NAMES,
} from '../src/lib/scoring/wagon-wheel.ts';

import {
  calculateScenarioA,
  calculateScenarioBTarget,
  formatMatchCondition,
} from '../src/lib/scoring/weather.ts';

import {
  buildInnings,
  buildMatchState,
} from '../src/lib/scoring/engine.ts';

import {
  toTeam,
  toPlayer,
} from '../src/lib/repositories.ts';

test('Scenario 1: Wagon Wheel End-to-End Delivery Mapping & Calculation', () => {
  const sampleDeliveries = [
    { strikerId: 'player-1', runsOffBat: 4, shotZone: 'cover', overNumber: 1, ballNumber: 1 },
    { strikerId: 'player-1', runsOffBat: 6, shotZone: 'long_on', overNumber: 1, ballNumber: 2 },
    { strikerId: 'player-1', runsOffBat: 1, shotZone: 'square_leg', overNumber: 1, ballNumber: 3 },
    { strikerId: 'player-1', runsOffBat: 2, shotZone: 'point', overNumber: 1, ballNumber: 4 },
    { strikerId: 'player-1', runsOffBat: 0, shotZone: 'unmapped', overNumber: 1, ballNumber: 5 },
    { strikerId: 'player-2', runsOffBat: 4, shotZone: 'mid_wicket', overNumber: 1, ballNumber: 6 },
  ];

  const p1Deliveries = sampleDeliveries.filter((d) => d.strikerId === 'player-1');
  const summary = calculateBatterWagonWheel('player-1', 'Player One', p1Deliveries);

  assert.equal(summary.totalRuns, 13);
  assert.equal(summary.mappedRuns, 13);
  assert.equal(summary.unmappedRuns, 0);
  assert.equal(summary.hasLocationData, true);
  assert.equal(summary.zoneBreakdown.cover.runs, 4);
  assert.equal(summary.zoneBreakdown.cover.fours, 1);
  assert.equal(summary.zoneBreakdown.long_on.runs, 6);
  assert.equal(summary.zoneBreakdown.long_on.sixes, 1);
  assert.equal(summary.zoneBreakdown.square_leg.runs, 1);
  assert.equal(summary.zoneBreakdown.point.runs, 2);
});

test('Scenario 2: Wagon Wheel with Skip / Unmapped Deliveries (No Fake Coordinates)', () => {
  const unmappedDeliveries = [
    { strikerId: 'player-1', runsOffBat: 4, shotZone: 'unmapped', overNumber: 1, ballNumber: 1 },
    { strikerId: 'player-1', runsOffBat: 1, shotZone: null, overNumber: 1, ballNumber: 2 },
  ];

  const summary = calculateBatterWagonWheel('player-1', 'Player One', unmappedDeliveries);

  assert.equal(summary.totalRuns, 5);
  assert.equal(summary.mappedRuns, 0);
  assert.equal(summary.unmappedRuns, 5);
  assert.equal(summary.hasLocationData, false);
});

test('Scenario 3: Rain Delay Condition formatting & preservation', () => {
  const normal = formatMatchCondition('NORMAL');
  assert.equal(normal.isWarning, false);

  const delay = formatMatchCondition('RAIN_DELAY');
  assert.equal(delay.isWarning, true);
  assert.match(delay.label, /RAIN DELAY/i);

  const resumed = formatMatchCondition('RAIN_RESUMED');
  assert.equal(resumed.isWarning, false);
  assert.match(resumed.label, /RAIN RESUMED/i);

  const abandoned = formatMatchCondition('MATCH_ABANDONED');
  assert.equal(abandoned.isWarning, true);
  assert.match(abandoned.label, /MATCH ABANDONED/i);
});

test('Scenario 4: Scenario A Rain Interruption (Equal Reduction Before 1st Innings)', () => {
  const result = calculateScenarioA(10, 8);
  assert.equal(result.teamAOvers, 8);
  assert.equal(result.teamBOvers, 8);
  assert.equal(result.requiresTargetRevision, false);
});

test('Scenario 5: Scenario B Rain Interruption (ARR Target Revision in 2nd Innings)', () => {
  // Team A scored 80 runs in 10 overs (ARR = 8.00). Team B revised overs = 6.
  // Base = floor(8.00 * 6) = 48. Target = 48 + 1 = 49.
  const targetObj = calculateScenarioBTarget(80, 10, 6);
  assert.equal(targetObj.arr, 8.00);
  assert.equal(targetObj.revisedTarget, 49);
});

test('Scenario 6: Match State preserves deliveries on Rain Delay and Revised Overs', () => {
  const match = {
    id: 'test-match-1',
    matchNumber: 1,
    teamAId: 'team-1',
    teamBId: 'team-2',
    overs: 10,
    status: 'LIVE',
    tossWinnerId: 'team-1',
    tossDecision: 'bat',
  };

  const deliveries = [
    {
      id: 'd1',
      inningsIndex: 0,
      strikerId: 'p1',
      nonStrikerId: 'p2',
      bowlerId: 'b1',
      batterRuns: 4,
      extraRuns: 0,
      shotZone: 'cover',
      timestamp: 1000,
    },
    {
      id: 'd2',
      inningsIndex: 0,
      strikerId: 'p1',
      nonStrikerId: 'p2',
      bowlerId: 'b1',
      batterRuns: 6,
      extraRuns: 0,
      shotZone: 'long_on',
      timestamp: 2000,
    },
  ];

  const stateNormal = buildMatchState({
    match,
    setup: {
      teamA: { id: 'team-1', name: 'Team A', playingXI: ['p1', 'p2'] },
      teamB: { id: 'team-2', name: 'Team B', playingXI: ['b1', 'b2'] },
      openers: { strikerId: 'p1', nonStrikerId: 'p2' },
      battingFirstId: 'team-1',
    },
    deliveries,
  });

  assert.equal(stateNormal.innings[0].runs, 10);
  assert.equal(stateNormal.innings[0].legalBalls, 2);

  // Apply Rain Delay & Revised Overs in setup
  const stateRain = buildMatchState({
    match,
    setup: {
      teamA: { id: 'team-1', name: 'Team A', playingXI: ['p1', 'p2'] },
      teamB: { id: 'team-2', name: 'Team B', playingXI: ['b1', 'b2'] },
      openers: { strikerId: 'p1', nonStrikerId: 'p2' },
      battingFirstId: 'team-1',
      reducedOvers: 8,
      weatherCondition: 'RAIN_DELAY',
      targetRevisionReason: 'RAIN DELAY',
    },
    deliveries,
  });

  // Ensure deliveries, runs, and balls are 100% preserved
  assert.equal(stateRain.innings[0].runs, 10);
  assert.equal(stateRain.innings[0].legalBalls, 2);
  assert.equal(stateRain.innings[0].maxOvers, 8);
});

test('Scenario 7: Master Data Domain Mapping Invariants (Teams & Players)', () => {
  const teamRow = {
    id: 'team-1',
    name: 'Super Strikers',
    slug: 'super-strikers',
    logo_url: 'https://example.com/logo.png',
  };
  const team = toTeam(teamRow);
  assert.equal(team.name, 'Super Strikers');
  assert.equal(team.shortName, 'SS');

  const playerRow = {
    id: 'player-1',
    player_name: 'Farhath Mohamed',
    player_role: 'All-rounder',
    team_id: 'team-1',
    reference_id: 'TPL-001',
  };
  const player = toPlayer(playerRow);
  assert.equal(player.name, 'Farhath Mohamed');
  assert.equal(player.shortName, 'F. Mohamed');
  assert.equal(player.role, 'All-rounder');
});
