import assert from "node:assert";
import {
  formatMatchTime,
  formatMatchDateTime,
  formatMatchDate,
  formatDeliveryTimestamp,
} from "../src/lib/utils.js";

console.log("==========================================================");
console.log("TPL 2026 — 12-HOUR TIME FORMATTING UNIT & REGRESSION TESTS");
console.log("==========================================================\n");

// ----------------------------------------------------
// REQUIRED TEST SUITE: 12-Hour Clock AM/PM Conversions
// ----------------------------------------------------
const REQUIRED_TESTS = [
  { input: "00:00", expected: "12:00 AM" },
  { input: "00:30", expected: "12:30 AM" },
  { input: "09:00", expected: "9:00 AM" },
  { input: "12:00", expected: "12:00 PM" },
  { input: "12:30", expected: "12:30 PM" },
  { input: "13:30", expected: "1:30 PM" },
  { input: "18:00", expected: "6:00 PM" },
  { input: "23:59", expected: "11:59 PM" },
];

console.log("[TEST GROUP 1: Required Exact 12-Hour String Conversions]");
for (const { input, expected } of REQUIRED_TESTS) {
  const result = formatMatchTime(input);
  assert.strictEqual(result, expected, `Expected formatMatchTime("${input}") to equal "${expected}"`);
  console.log(`  ✓ formatMatchTime("${input}") -> "${result}"`);
}

// ----------------------------------------------------
// TEST GROUP 2: Full Date/Time & ISO String Formatting
// ----------------------------------------------------
console.log("\n[TEST GROUP 2: ISO Date / Date Object Conversions]");
{
  // Test local Date objects constructed explicitly
  const d1 = new Date(2026, 7, 15, 0, 0); // 15 Aug 2026 00:00
  assert.strictEqual(formatMatchTime(d1), "12:00 AM");
  assert.strictEqual(formatMatchDateTime(d1), "15 Aug 2026, 12:00 AM");
  console.log(`  ✓ Date(00:00) -> time: "${formatMatchTime(d1)}", full: "${formatMatchDateTime(d1)}"`);

  const d2 = new Date(2026, 7, 15, 9, 0); // 15 Aug 2026 09:00
  assert.strictEqual(formatMatchTime(d2), "9:00 AM");
  assert.strictEqual(formatMatchDateTime(d2), "15 Aug 2026, 9:00 AM");
  console.log(`  ✓ Date(09:00) -> time: "${formatMatchTime(d2)}", full: "${formatMatchDateTime(d2)}"`);

  const d3 = new Date(2026, 7, 15, 13, 30); // 15 Aug 2026 13:30
  assert.strictEqual(formatMatchTime(d3), "1:30 PM");
  assert.strictEqual(formatMatchDateTime(d3), "15 Aug 2026, 1:30 PM");
  console.log(`  ✓ Date(13:30) -> time: "${formatMatchTime(d3)}", full: "${formatMatchDateTime(d3)}"`);

  const d4 = new Date(2026, 7, 15, 18, 0); // 15 Aug 2026 18:00
  assert.strictEqual(formatMatchTime(d4), "6:00 PM");
  assert.strictEqual(formatMatchDateTime(d4), "15 Aug 2026, 6:00 PM");
  console.log(`  ✓ Date(18:00) -> time: "${formatMatchTime(d4)}", full: "${formatMatchDateTime(d4)}"`);

  const d5 = new Date(2026, 7, 15, 23, 59); // 15 Aug 2026 23:59
  assert.strictEqual(formatMatchTime(d5), "11:59 PM");
  assert.strictEqual(formatMatchDateTime(d5), "15 Aug 2026, 11:59 PM");
  console.log(`  ✓ Date(23:59) -> time: "${formatMatchTime(d5)}", full: "${formatMatchDateTime(d5)}"`);
}

// ----------------------------------------------------
// TEST GROUP 3: formatMatchDate
// ----------------------------------------------------
console.log("\n[TEST GROUP 3: formatMatchDate Unit Tests]");
{
  const d = new Date(2026, 7, 30); // 30 Aug 2026
  const dateFormatted = formatMatchDate(d);
  assert.strictEqual(dateFormatted, "30 Aug 2026");
  console.log(`  ✓ formatMatchDate(2026-08-30) -> "${dateFormatted}"`);
}

// ----------------------------------------------------
// TEST GROUP 4: formatDeliveryTimestamp (with seconds)
// ----------------------------------------------------
console.log("\n[TEST GROUP 4: formatDeliveryTimestamp Unit Tests]");
{
  const d = new Date(2026, 7, 15, 14, 30, 45);
  const ts = formatDeliveryTimestamp(d.getTime());
  assert.strictEqual(ts, "2:30:45 PM");
  console.log(`  ✓ formatDeliveryTimestamp(14:30:45) -> "${ts}"`);
}

// ----------------------------------------------------
// TEST GROUP 5: Edge Cases & Null Resilience
// ----------------------------------------------------
console.log("\n[TEST GROUP 5: Edge Cases & Null Resilience]");
{
  assert.strictEqual(formatMatchTime(null), "TBD");
  assert.strictEqual(formatMatchTime(undefined), "TBD");
  assert.strictEqual(formatMatchTime(""), "TBD");
  assert.strictEqual(formatMatchTime("invalid-date-string"), "TBD");

  assert.strictEqual(formatMatchDateTime(null), "TBD");
  assert.strictEqual(formatMatchDateTime(""), "TBD");

  assert.strictEqual(formatDeliveryTimestamp(null), "");
  assert.strictEqual(formatDeliveryTimestamp(undefined), "");

  console.log("  ✓ All null, undefined, empty, and invalid inputs handled gracefully.");
}

console.log("\n>>> ALL 12-HOUR TIME FORMATTING TESTS PASSED 100%!");
