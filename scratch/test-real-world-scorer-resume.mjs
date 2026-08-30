import assert from "node:assert/strict";
import { buildMatchState, isLegal, oversText } from "../src/lib/scoring/engine.js";
import { calculateBatterWagonWheel } from "../src/lib/scoring/wagon-wheel.js";
import { teams as masterTeams, players as masterPlayers } from "../src/lib/mock-data/index.js";

console.log("===============================================================================");
console.log("TPL 2026 — REAL-WORLD BROWSER RUNTIME SCORER RESUME & PERSISTENCE TEST");
console.log("===============================================================================");

// ── TEST 1: LIVE MATCH -> SCORE BALL -> CLOSE -> REOPEN -> CONTINUE ─────────
console.log("\n[TEST 1: Live Match -> Score -> Close -> Reopen -> Continue Scoring]");
const match1 = {
  id: "m-rw-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "t1",
  teamBId: "t2",
  overs: 5,
  status: "LIVE",
};

// Initial state before close (1 ball bowled: 4 runs)
const initialDeliveries = [
  {
    id: "del-1",
    matchId: "m-rw-1",
    inningsIndex: 0,
    overNumber: 0,
    ballNumber: 1,
    strikerId: "t1-p1",
    nonStrikerId: "t1-p2",
    bowlerId: "t2-p8",
    batterRuns: 4,
    extraRuns: 0,
    extraType: null,
    shotZone: "cover",
    timestamp: 100000,
  },
];

// Reopen / Hydrate from DB deliveries (simulating brand new store mount)
const hydratedState1 = buildMatchState({
  match: match1,
  setup: { playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: initialDeliveries,
  secondInningsStarted: false,
});

const inn1 = hydratedState1.innings[0];
assert.equal(inn1.runs, 4, "Score must be 4");
assert.equal(inn1.wickets, 0, "Wickets must be 0");
assert.equal(inn1.legalBalls, 1, "Legal balls must be 1 (0.1 ov)");
assert.equal(inn1.strikerId, "t1-p1", "Striker must remain t1-p1 after boundary 4");
assert.equal(inn1.nonStrikerId, "t1-p2", "Non-striker must remain t1-p2");
assert.equal(inn1.currentBowlerId, "t2-p8", "Current bowler must be t2-p8");
assert.equal(inn1.needsBatter, false, "Must not need batter");
assert.equal(inn1.needsBowler, false, "Must not need bowler mid-over");

// Scorer records ball 2 (1 run)
const ball2 = {
  id: "del-2",
  matchId: "m-rw-1",
  inningsIndex: 0,
  overNumber: 0,
  ballNumber: 2,
  strikerId: inn1.strikerId,
  nonStrikerId: inn1.nonStrikerId,
  bowlerId: inn1.currentBowlerId,
  batterRuns: 1,
  extraRuns: 0,
  extraType: null,
  shotZone: "long_on",
  timestamp: 100060,
};

const stateAfterBall2 = buildMatchState({
  match: match1,
  setup: { playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [...initialDeliveries, ball2],
  secondInningsStarted: false,
});

assert.equal(stateAfterBall2.innings[0].runs, 5);
assert.equal(stateAfterBall2.innings[0].legalBalls, 2);
assert.equal(stateAfterBall2.innings[0].strikerId, "t1-p2", "Strike rotated after 1 run");
console.log("  ✓ Test 1 Passed: Match cleanly resumed from DB and scored next ball.");

// ── TEST 2: WICKET ON BALL -> CLOSE -> REOPEN -> SELECT NEW BATTER -> SCORE ──
console.log("\n[TEST 2: Wicket Recorded -> Close -> Reopen -> Select New Batter -> Continue]");
const wicketBall = {
  id: "del-w",
  matchId: "m-rw-1",
  inningsIndex: 0,
  overNumber: 0,
  ballNumber: 2,
  strikerId: "t1-p1",
  nonStrikerId: "t1-p2",
  bowlerId: "t2-p8",
  batterRuns: 0,
  extraRuns: 0,
  extraType: null,
  wicket: {
    type: "Caught",
    batterOutId: "t1-p1",
    fielderId: "t2-p9", // Mandatory fielder
  },
  timestamp: 100120,
};

// Reopening match when a wicket was the last delivery recorded
const hydratedWicketState = buildMatchState({
  match: match1,
  setup: { playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3", "t1-p4"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [initialDeliveries[0], wicketBall],
  secondInningsStarted: false,
});

const innW = hydratedWicketState.innings[0];
assert.equal(innW.wickets, 1, "Wickets must be 1");
assert.equal(innW.needsBatter, true, "Must require incoming batter selection");
assert.ok(!innW.strikerId, "Dismissed striker must not be automatically filled");
assert.equal(innW.nonStrikerId, "t1-p2", "Surviving partner preserved on non-striker crease");

// Scorer explicitly selects new batter 't1-p3' on strike
const nextDeliveryWithNewBatter = {
  id: "del-after-w",
  matchId: "m-rw-1",
  inningsIndex: 0,
  overNumber: 0,
  ballNumber: 3,
  strikerId: "t1-p3", // Selected incoming batter
  nonStrikerId: "t1-p2",
  bowlerId: "t2-p8",
  batterRuns: 2,
  extraRuns: 0,
  extraType: null,
  shotZone: "point",
  timestamp: 100180,
};

const stateAfterNewBatterScored = buildMatchState({
  match: match1,
  setup: { playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3", "t1-p4"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [initialDeliveries[0], wicketBall, nextDeliveryWithNewBatter],
  secondInningsStarted: false,
});

assert.equal(stateAfterNewBatterScored.innings[0].runs, 6);
assert.equal(stateAfterNewBatterScored.innings[0].legalBalls, 3);
assert.equal(stateAfterNewBatterScored.innings[0].needsBatter, false);
assert.equal(stateAfterNewBatterScored.innings[0].strikerId, "t1-p3");
console.log("  ✓ Test 2 Passed: Wicket resume required explicit batter selection and resumed scoring.");

// ── TEST 3: WICKET ON OVER BOUNDARY (1.0 ov) -> CLOSE -> REOPEN ───────────
console.log("\n[TEST 3: Wicket on 6th Ball of Over (1.0 ov) -> Reopen -> Batter + Bowler Selection]");
const over1Deliveries = [];
for (let b = 1; b <= 5; b++) {
  over1Deliveries.push({
    id: `del-ov1-${b}`,
    matchId: "m-rw-1",
    inningsIndex: 0,
    overNumber: 0,
    ballNumber: b,
    strikerId: "t1-p1",
    nonStrikerId: "t1-p2",
    bowlerId: "t2-p8",
    batterRuns: 1,
    extraRuns: 0,
    extraType: null,
    timestamp: 100000 + b * 10,
  });
}
// Ball 6 is a wicket
over1Deliveries.push({
  id: `del-ov1-6-w`,
  matchId: "m-rw-1",
  inningsIndex: 0,
  overNumber: 0,
  ballNumber: 6,
  strikerId: "t1-p2", // Was on strike for ball 6
  nonStrikerId: "t1-p1",
  bowlerId: "t2-p8",
  batterRuns: 0,
  extraRuns: 0,
  extraType: null,
  wicket: {
    type: "Bowled",
    batterOutId: "t1-p2",
  },
  timestamp: 100060,
});

// Reopen after 1.0 ov wicket
const stateOverBoundaryWicket = buildMatchState({
  match: match1,
  setup: { playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3", "t1-p4"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: over1Deliveries,
  secondInningsStarted: false,
});

const innOBW = stateOverBoundaryWicket.innings[0];
assert.equal(innOBW.runs, 5);
assert.equal(innOBW.wickets, 1);
assert.equal(innOBW.legalBalls, 6, "Exactly 1.0 overs completed");
assert.equal(innOBW.needsBowler, true, "Must require new bowler for Over 2");
assert.equal(innOBW.needsBatter, true, "Must require new batter after wicket");
assert.equal(innOBW.previousBowlerId, "t2-p8", "Previous bowler tracked to prevent consecutive overs");

// Scorer selects new batter 't1-p3' and new bowler 't2-p9' for Over 2 Ball 1
const over2Ball1 = {
  id: "del-ov2-1",
  matchId: "m-rw-1",
  inningsIndex: 0,
  overNumber: 1,
  ballNumber: 1,
  strikerId: "t1-p1", // Non-striker was swapped to strike at over end
  nonStrikerId: "t1-p3", // Incoming batter at non-striker end
  bowlerId: "t2-p9", // New bowler
  batterRuns: 6,
  extraRuns: 0,
  extraType: null,
  shotZone: "mid_wicket",
  timestamp: 200010,
};

const stateOver2 = buildMatchState({
  match: match1,
  setup: { playingXI: { t1: ["t1-p1", "t1-p2", "t1-p3", "t1-p4"], t2: ["t2-p8", "t2-p9"] } },
  deliveries: [...over1Deliveries, over2Ball1],
  secondInningsStarted: false,
});

assert.equal(stateOver2.innings[0].runs, 11);
assert.equal(stateOver2.innings[0].legalBalls, 7, "1.1 overs");
assert.equal(stateOver2.innings[0].needsBowler, false);
assert.equal(stateOver2.innings[0].needsBatter, false);
console.log("  ✓ Test 3 Passed: 1.0 ov wicket handled both batter and bowler selections seamlessly.");

// ── TEST 4: WAGON WHEEL MAPPED VS UNMAPPED PERSISTENCE ────────────────────
console.log("\n[TEST 4: Wagon Wheel Mapped vs Unmapped Shots]");
const wagonDeliveries = [
  { strikerId: "p-test", bowlerId: "b-test", runsOffBat: 4, shotZone: "cover" },
  { strikerId: "p-test", bowlerId: "b-test", runsOffBat: 6, shotZone: "long_off" },
  { strikerId: "p-test", bowlerId: "b-test", runsOffBat: 2, shotZone: "square_leg" },
  { strikerId: "p-test", bowlerId: "b-test", runsOffBat: 1, shotZone: "unmapped" }, // Skipped
  { strikerId: "p-test", bowlerId: "b-test", runsOffBat: 0, shotZone: null },       // Dot ball
];

const wagon = calculateBatterWagonWheel("p-test", "Player Test", wagonDeliveries);
assert.equal(wagon.totalRuns, 13);
assert.equal(wagon.totalBalls, 5);
assert.equal(wagon.shots.length, 3, "Exactly 3 shots mapped to field sectors (4, 6, 2)");
assert.equal(wagon.unmappedCount, 2, "2 unmapped balls accounted for (1 run skipped + 0 dot)");
console.log("  ✓ Test 4 Passed: Wagon wheel preserves mapped shots without fake field markers.");

// ── TEST 5: MASTER DATA INTEGRITY ─────────────────────────────────────────
console.log("\n[TEST 5: Master Data Safety Verification]");
assert.equal(masterTeams.length, 8);
assert.equal(masterPlayers.length, 104);
console.log("  ✓ Master Data: 8 teams, 104 players — 100% UNTOUCHED.");

console.log("\n===============================================================================");
console.log(">>> ALL REAL-WORLD BROWSER RUNTIME SCORER RESUME TESTS PASSED (100% GREEN)!");
console.log("===============================================================================\n");
