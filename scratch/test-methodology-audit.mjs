import {
  TPL_STATISTICS_METHODOLOGY,
  getAllMethodologiesByCategory,
  METHODOLOGY_VERSION,
  METHODOLOGY_LAST_UPDATED,
} from "../src/lib/scoring/statistics-methodology.ts";

console.log("==================================================");
console.log("TPL 2026 — STATISTICS METHODOLOGY AUDIT");
console.log("==================================================");

console.log(`Methodology Version: ${METHODOLOGY_VERSION}`);
console.log(`Last Updated: ${METHODOLOGY_LAST_UPDATED}`);

const requiredMetrics = [
  "runs",
  "balls_faced",
  "fours",
  "sixes",
  "strike_rate",
  "batting_average",
  "boundary_runs",
  "overs_bowled",
  "runs_conceded",
  "wickets",
  "economy",
  "bowling_average",
  "bowling_strike_rate",
  "best_bowling_figures",
  "catches",
  "run_outs",
  "stumpings",
  "match_points",
  "net_run_rate",
  "match_mvp",
  "man_of_the_match",
  "orange_cap",
  "purple_cap",
  "best_striker_award",
  "best_all_rounder_award",
  "tournament_mvp",
  "man_of_the_tournament",
];

const requiredProperties = [
  "key",
  "name",
  "category",
  "description",
  "scope",
  "sourceData",
  "formula",
  "qualification",
  "rankingRule",
  "tieBreakRule",
  "roundingRule",
  "edgeCases",
  "methodologyVersion",
];

let allPassed = true;

// 1. Verify existence of all required metrics
console.log("\n[TEST 1: Metric Coverage Verification]");
for (const key of requiredMetrics) {
  const metric = TPL_STATISTICS_METHODOLOGY[key];
  if (!metric) {
    console.error(`MISSING METRIC DEFINITION: ${key}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Metric '${key}' (${metric.name}) defined.`);
  }
}

// 2. Verify all properties on each metric
console.log("\n[TEST 2: Property Completeness Verification]");
for (const [key, metric] of Object.entries(TPL_STATISTICS_METHODOLOGY)) {
  for (const prop of requiredProperties) {
    if (!metric[prop] || typeof metric[prop] !== "string") {
      console.error(`Metric '${key}' is missing or has invalid property: ${prop}`);
      allPassed = false;
    }
  }
}
if (allPassed) {
  console.log("  ✓ All metrics contain 100% complete audit properties.");
}

// 3. Category Grouping Verification
console.log("\n[TEST 3: Category Grouping Verification]");
const grouped = getAllMethodologiesByCategory();
for (const [category, list] of Object.entries(grouped)) {
  console.log(`  Category [${category}]: ${list.length} defined metrics`);
  if (list.length === 0 && category !== "RECORDS") {
    console.error(`Empty category: ${category}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("\n>>> ALL STATISTICS METHODOLOGY AUDIT TESTS PASSED SUCCESSFULLY.");
} else {
  console.error("\n>>> STATISTICS METHODOLOGY AUDIT FAILED!");
  process.exit(1);
}
