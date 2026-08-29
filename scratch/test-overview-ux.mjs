import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildMatchState } from '../src/lib/scoring/engine.ts';

test('Overview Scenario 1: Completed Match Result & Over Group Calculation', () => {
  const match = {
    id: 'comp-match-1',
    matchNumber: 5,
    teamAId: 'team-1',
    teamBId: 'team-2',
    overs: 5,
    status: 'COMPLETED',
    tossWinnerId: 'team-1',
    tossDecision: 'bat',
  };

  // 1st innings: 5 overs
  // Over 1 (10 runs): 1, 3, 2, 0, 1, 3
  // Over 2 (14 runs): 2, 3, 2, 3, 1, 3
  // Over 3 (8 runs): 4, 0, 1, 1, 2, 0
  // Over 4 (6 runs): 1, 1, 1, 1, 1, 1
  // Over 5 (12 runs): 6, 0, 0, 0, 6, 0
  // Total 1st Innings: 50/0
  const deliveries1 = [
    // Over 1
    { id: 'd1', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b1', batterRuns: 1, extraRuns: 0, timestamp: 10 },
    { id: 'd2', inningsIndex: 0, strikerId: 'p2', nonStrikerId: 'p1', bowlerId: 'b1', batterRuns: 3, extraRuns: 0, timestamp: 20 },
    { id: 'd3', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b1', batterRuns: 2, extraRuns: 0, timestamp: 30 },
    { id: 'd4', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b1', batterRuns: 0, extraRuns: 0, timestamp: 40 },
    { id: 'd5', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b1', batterRuns: 1, extraRuns: 0, timestamp: 50 },
    { id: 'd6', inningsIndex: 0, strikerId: 'p2', nonStrikerId: 'p1', bowlerId: 'b1', batterRuns: 3, extraRuns: 0, timestamp: 60 },
    // Over 2
    { id: 'd7', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b2', batterRuns: 2, extraRuns: 0, timestamp: 70 },
    { id: 'd8', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b2', batterRuns: 3, extraRuns: 0, timestamp: 80 },
    { id: 'd9', inningsIndex: 0, strikerId: 'p2', nonStrikerId: 'p1', bowlerId: 'b2', batterRuns: 2, extraRuns: 0, timestamp: 90 },
    { id: 'd10', inningsIndex: 0, strikerId: 'p2', nonStrikerId: 'p1', bowlerId: 'b2', batterRuns: 3, extraRuns: 0, timestamp: 100 },
    { id: 'd11', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b2', batterRuns: 1, extraRuns: 0, timestamp: 110 },
    { id: 'd12', inningsIndex: 0, strikerId: 'p2', nonStrikerId: 'p1', bowlerId: 'b2', batterRuns: 3, extraRuns: 0, timestamp: 120 },
  ];

  // 2nd innings: 2 overs, 30 runs, complete
  const deliveries2 = [
    // Over 1 (15 runs)
    { id: 'd2_1', inningsIndex: 1, strikerId: 'b1', nonStrikerId: 'b2', bowlerId: 'p1', batterRuns: 6, extraRuns: 0, timestamp: 200 },
    { id: 'd2_2', inningsIndex: 1, strikerId: 'b1', nonStrikerId: 'b2', bowlerId: 'p1', batterRuns: 4, extraRuns: 0, timestamp: 210 },
    { id: 'd2_3', inningsIndex: 1, strikerId: 'b1', nonStrikerId: 'b2', bowlerId: 'p1', batterRuns: 1, extraRuns: 0, timestamp: 220 },
    { id: 'd2_4', inningsIndex: 1, strikerId: 'b2', nonStrikerId: 'b1', bowlerId: 'p1', batterRuns: 2, extraRuns: 0, timestamp: 230 },
    { id: 'd2_5', inningsIndex: 1, strikerId: 'b2', nonStrikerId: 'b1', bowlerId: 'p1', batterRuns: 1, extraRuns: 0, timestamp: 240 },
    { id: 'd2_6', inningsIndex: 1, strikerId: 'b1', nonStrikerId: 'b2', bowlerId: 'p1', batterRuns: 1, extraRuns: 0, timestamp: 250 },
  ];

  const state = buildMatchState({
    match,
    setup: {
      teamA: { id: 'team-1', name: 'New Garden Warriors', playingXI: ['p1', 'p2'] },
      teamB: { id: 'team-2', name: 'Super Strikers', playingXI: ['b1', 'b2'] },
      openers: { strikerId: 'p1', nonStrikerId: 'p2' },
      battingFirstId: 'team-1',
    },
    deliveries: [...deliveries1, ...deliveries2],
  });

  // Check 1st innings overGroups
  const inn1 = state.innings[0];
  assert.equal(inn1.overGroups.length, 2);
  assert.equal(inn1.overGroups[0].runs, 10);
  assert.equal(inn1.overGroups[1].runs, 14);

  // Check 2nd innings overGroups
  const inn2 = state.innings[1];
  assert.equal(inn2.overGroups.length, 1);
  assert.equal(inn2.overGroups[0].runs, 15);
});

test('Overview Scenario 2: Live Match In-Progress Over State', () => {
  const match = {
    id: 'live-match-1',
    matchNumber: 6,
    teamAId: 'team-1',
    teamBId: 'team-2',
    overs: 5,
    status: 'LIVE',
    tossWinnerId: 'team-1',
    tossDecision: 'bat',
  };

  const deliveries = [
    { id: 'd1', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b1', batterRuns: 4, extraRuns: 0, timestamp: 10 },
    { id: 'd2', inningsIndex: 0, strikerId: 'p1', nonStrikerId: 'p2', bowlerId: 'b1', batterRuns: 6, extraRuns: 0, timestamp: 20 },
  ];

  const state = buildMatchState({
    match,
    setup: {
      teamA: { id: 'team-1', name: 'Team A', playingXI: ['p1', 'p2'] },
      teamB: { id: 'team-2', name: 'Team B', playingXI: ['b1', 'b2'] },
      openers: { strikerId: 'p1', nonStrikerId: 'p2' },
      battingFirstId: 'team-1',
    },
    deliveries,
  });

  const inn = state.innings[0];
  assert.equal(inn.runs, 10);
  assert.equal(inn.legalBalls, 2);
  assert.equal(inn.recentBalls.length, 2);
  assert.equal(inn.partnership.runs, 10);
  assert.equal(inn.partnership.balls, 2);
});
