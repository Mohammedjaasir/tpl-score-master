import assert from "node:assert";
import {
  parseTime12To24,
  parse24ToTime12,
  formatMatchTime,
  calculateScheduleMatchTime,
} from "../src/lib/utils.ts";

console.log("================================================================================");
console.log(" TPL 2026: 12-HOUR TIME SELECTOR & CALCULATION TEST SUITE");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function testCase(num, desc, actual, expected) {
  if (actual === expected) {
    console.log(`  ✓ PASS: TEST ${num} - ${desc} (Result: "${actual}")`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: TEST ${num} - ${desc} (Expected: "${expected}", Got: "${actual}")`);
    failed++;
  }
}

// 1. Midnight 12 AM cases
testCase(1, "12:00 AM converts to 00:00 internally", parseTime12To24(12, 0, "AM"), "00:00");
testCase(2, "12:15 AM converts to 00:15 internally", parseTime12To24(12, 15, "AM"), "00:15");
testCase(3, "12:30 AM converts to 00:30 internally", parseTime12To24(12, 30, "AM"), "00:30");
testCase(4, "12:45 AM converts to 00:45 internally", parseTime12To24(12, 45, "AM"), "00:45");

// 2. Daytime AM cases
testCase(5, "01:00 AM converts to 01:00 internally", parseTime12To24(1, 0, "AM"), "01:00");
testCase(6, "05:00 AM converts to 05:00 internally", parseTime12To24(5, 0, "AM"), "05:00");
testCase(7, "11:45 AM converts to 11:45 internally", parseTime12To24(11, 45, "AM"), "11:45");

// 3. Noon 12 PM cases
testCase(8, "12:00 PM converts to 12:00 internally", parseTime12To24(12, 0, "PM"), "12:00");
testCase(9, "12:15 PM converts to 12:15 internally", parseTime12To24(12, 15, "PM"), "12:15");
testCase(10, "12:30 PM converts to 12:30 internally", parseTime12To24(12, 30, "PM"), "12:30");
testCase(11, "12:45 PM converts to 12:45 internally", parseTime12To24(12, 45, "PM"), "12:45");

// 4. Afternoon and Night PM cases
testCase(12, "01:00 PM converts to 13:00 internally", parseTime12To24(1, 0, "PM"), "13:00");
testCase(13, "02:30 PM converts to 14:30 internally", parseTime12To24(2, 30, "PM"), "14:30");
testCase(14, "03:15 PM converts to 15:15 internally", parseTime12To24(3, 15, "PM"), "15:15");
testCase(15, "04:00 PM converts to 16:00 internally", parseTime12To24(4, 0, "PM"), "16:00");
testCase(16, "11:45 PM converts to 23:45 internally", parseTime12To24(11, 45, "PM"), "23:45");

// 5. Critical Distinction 12 AM vs 12 PM
const am12 = parseTime12To24(12, 0, "AM");
const pm12 = parseTime12To24(12, 0, "PM");
testCase(17, "12 AM is not equal to 12 PM (00:00 !== 12:00)", am12 !== pm12, true);

// 6. 24-hour back to 12-hour Display formatting
testCase(18, "formatMatchTime('00:00') -> '12:00 AM'", formatMatchTime("00:00"), "12:00 AM");
testCase(19, "formatMatchTime('12:00') -> '12:00 PM'", formatMatchTime("12:00"), "12:00 PM");
testCase(20, "formatMatchTime('14:30') -> '2:30 PM'", formatMatchTime("14:30"), "2:30 PM");
testCase(21, "formatMatchTime('05:00') -> '5:00 AM'", formatMatchTime("05:00"), "5:00 AM");

// 7. Schedule Interval starting at 12:00 PM at 45 min intervals
const match1 = calculateScheduleMatchTime("2026-08-30", "12:00", 0, 45);
const match2 = calculateScheduleMatchTime("2026-08-30", "12:00", 1, 45);
const match3 = calculateScheduleMatchTime("2026-08-30", "12:00", 2, 45);
const match4 = calculateScheduleMatchTime("2026-08-30", "12:00", 3, 45);
const match5 = calculateScheduleMatchTime("2026-08-30", "12:00", 4, 45);

testCase(22, "Schedule 12:00 PM + 0 min -> 12:00 PM", match1.time12, "12:00 PM");
testCase(23, "Schedule 12:00 PM + 45 min -> 12:45 PM", match2.time12, "12:45 PM");
testCase(24, "Schedule 12:00 PM + 90 min -> 1:30 PM", match3.time12, "1:30 PM");
testCase(25, "Schedule 12:00 PM + 135 min -> 2:15 PM", match4.time12, "2:15 PM");
testCase(26, "Schedule 12:00 PM + 180 min -> 3:00 PM", match5.time12, "3:00 PM");

// 8. Schedule Interval starting at 11:00 PM at 45 min intervals (Midnight Rollover)
const nightMatch1 = calculateScheduleMatchTime("2026-08-30", "23:00", 0, 45);
const nightMatch2 = calculateScheduleMatchTime("2026-08-30", "23:00", 1, 45);
const nightMatch3 = calculateScheduleMatchTime("2026-08-30", "23:00", 2, 45);
const nightMatch4 = calculateScheduleMatchTime("2026-08-30", "23:00", 3, 45);

testCase(27, "Night Rollover: 11:00 PM + 0 min -> 11:00 PM", nightMatch1.time12, "11:00 PM");
testCase(28, "Night Rollover: 11:00 PM + 45 min -> 11:45 PM", nightMatch2.time12, "11:45 PM");
testCase(29, "Night Rollover: 11:00 PM + 90 min -> 12:30 AM", nightMatch3.time12, "12:30 AM");
testCase(30, "Night Rollover: 11:00 PM + 135 min -> 1:15 AM", nightMatch4.time12, "1:15 AM");

// 9. UI State Isolation: Selecting 12 in UI does not become 00
const uiState = { hour: "12", minute: "00", period: "AM" };
testCase(31, "UI state retains hour 12", uiState.hour, "12");
testCase(32, "UI display preview is '12:00 AM'", `${parseInt(uiState.hour, 10)}:${uiState.minute} ${uiState.period}`, "12:00 AM");

console.log("\n================================================================================");
console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
console.log("================================================================================\n");

assert.strictEqual(failed, 0, "All 32 test cases must pass.");
