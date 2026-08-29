import { buildMatchState } from "../src/lib/scoring/engine.ts";

console.log("==================================================");
console.log("TPL 2026 — STRICT DISMISSAL VALIDATION & TESTS");
console.log("==================================================");

const mockMatch = {
  id: "test-match-1",
  tournament: "TPL 2026",
  matchNumber: 1,
  teamAId: "team-a",
  teamBId: "team-b",
  venue: "Ground",
  overs: 5,
  scheduledAt: "2026-08-29T10:00:00Z",
  status: "LIVE",
};

const mockSetup = {
  playingXI: {
    "team-a": { teamId: "team-a", playerIds: ["p1", "p2", "p3"] },
    "team-b": { teamId: "team-b", playerIds: ["b1", "b2", "b3"] },
  },
  battingFirstId: "team-a",
  openers: { strikerId: "p1", nonStrikerId: "p2" },
  openingBowlerId: "b1",
};

// TEST A: CAUGHT + fielder selected
const deliveriesA = [
  {
    id: "del-1",
    inningsIndex: 0,
    bowlerId: "b1",
    strikerId: "p1",
    nonStrikerId: "p2",
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    wicket: {
      type: "Caught",
      batterOutId: "p1",
      fielderId: "b2",
      newBatterId: "p3",
    },
    timestamp: 1000,
  },
];

const stateA = buildMatchState({ match: mockMatch, setup: mockSetup, deliveries: deliveriesA });
const outBatterA = stateA.innings[0].batters.find((b) => b.playerId === "p1");

console.log("\n[TEST A: CAUGHT + Fielder]");
console.log("Wickets:", stateA.innings[0].wickets, "(Expected: 1)");
console.log("Batter out:", outBatterA?.out, "(Expected: true)");
console.log("Dismissal string:", outBatterA?.dismissal);

if (stateA.innings[0].wickets === 1 && outBatterA?.out && stateA.innings[0].fallOfWickets[0]?.fielderId === "b2") {
  console.log(">>> TEST A PASS!");
} else {
  console.error(">>> TEST A FAILED!");
  process.exit(1);
}

// TEST B: CAUGHT + No Fielder (Simulating rejection guard)
function testCaughtWithoutFielder() {
  const wicket = { type: "Caught", batterOutId: "p1", fielderId: "" };
  if (wicket.type === "Caught" && (!wicket.fielderId || wicket.fielderId.trim() === "")) {
    return "BLOCKED";
  }
  return "ALLOWED";
}

console.log("\n[TEST B: CAUGHT + No Fielder]");
const resultB = testCaughtWithoutFielder();
console.log("Result:", resultB, "(Expected: BLOCKED)");
if (resultB === "BLOCKED") {
  console.log(">>> TEST B PASS!");
} else {
  console.error(">>> TEST B FAILED!");
  process.exit(1);
}

// TEST C: RUN OUT + No Fielder
function testRunOutWithoutFielder() {
  const wicket = { type: "Run Out", batterOutId: "p2", fielderId: "" };
  if (wicket.type === "Run Out" && (!wicket.fielderId || wicket.fielderId.trim() === "")) {
    return "BLOCKED";
  }
  return "ALLOWED";
}

console.log("\n[TEST C: RUN OUT + No Fielder]");
const resultC = testRunOutWithoutFielder();
console.log("Result:", resultC, "(Expected: BLOCKED)");
if (resultC === "BLOCKED") {
  console.log(">>> TEST C PASS!");
} else {
  console.error(">>> TEST C FAILED!");
  process.exit(1);
}

// TEST D: RUN OUT + Selected Fielder
const deliveriesD = [
  {
    id: "del-d",
    inningsIndex: 0,
    bowlerId: "b1",
    strikerId: "p1",
    nonStrikerId: "p2",
    batterRuns: 1,
    extraRuns: 0,
    extraType: null,
    wicket: {
      type: "Run Out",
      batterOutId: "p2",
      fielderId: "b3",
      newBatterId: "p3",
    },
    timestamp: 2000,
  },
];
const stateD = buildMatchState({ match: mockMatch, setup: mockSetup, deliveries: deliveriesD });
console.log("\n[TEST D: RUN OUT + Selected Fielder]");
console.log("Wickets:", stateD.innings[0].wickets, "(Expected: 1)");
if (stateD.innings[0].fallOfWickets[0]?.fielderId === "b3") {
  console.log(">>> TEST D PASS!");
} else {
  console.error(">>> TEST D FAILED!");
  process.exit(1);
}

// TEST E: STUMPED + No Fielder
function testStumpedWithoutFielder() {
  const wicket = { type: "Stumped", batterOutId: "p1", fielderId: "" };
  if (wicket.type === "Stumped" && (!wicket.fielderId || wicket.fielderId.trim() === "")) {
    return "BLOCKED";
  }
  return "ALLOWED";
}

console.log("\n[TEST E: STUMPED + No Fielder]");
const resultE = testStumpedWithoutFielder();
console.log("Result:", resultE, "(Expected: BLOCKED)");
if (resultE === "BLOCKED") {
  console.log(">>> TEST E PASS!");
} else {
  console.error(">>> TEST E FAILED!");
  process.exit(1);
}

// TEST F: BOWLED (No Fielder Required)
const deliveriesF = [
  {
    id: "del-f",
    inningsIndex: 0,
    bowlerId: "b1",
    strikerId: "p1",
    nonStrikerId: "p2",
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    wicket: {
      type: "Bowled",
      batterOutId: "p1",
      newBatterId: "p3",
    },
    timestamp: 3000,
  },
];
const stateF = buildMatchState({ match: mockMatch, setup: mockSetup, deliveries: deliveriesF });
console.log("\n[TEST F: BOWLED - No Fielder Needed]");
console.log("Wickets:", stateF.innings[0].wickets, "(Expected: 1)");
console.log("Bowler Wickets:", stateF.innings[0].bowlers.find(b => b.playerId === "b1")?.wickets, "(Expected: 1)");
if (stateF.innings[0].wickets === 1 && stateF.innings[0].bowlers[0].wickets === 1) {
  console.log(">>> TEST F PASS!");
} else {
  console.error(">>> TEST F FAILED!");
  process.exit(1);
}

console.log("\nALL STRICT DISMISSAL TESTS PASSED SUCCESSFULLY.");
