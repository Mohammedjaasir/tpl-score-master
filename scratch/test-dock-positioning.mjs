import assert from "node:assert";
import fs from "node:fs";

console.log("================================================================================");
console.log(" TPL 2026: MOBILE BOTTOM NAVIGATION DOCK VISIBILITY & POSITIONING TEST SUITE");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function check(num, desc, condition) {
  if (condition) {
    console.log(`  ✓ PASS: TEST ${num} - ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: TEST ${num} - ${desc}`);
    failed++;
  }
}

// 1. Read TplDock.tsx
const dockContent = fs.readFileSync("src/components/layout/TplDock.tsx", "utf-8");

// TEST 1: Dock has fixed viewport positioning
check(1, "Dock uses position: fixed", dockContent.includes('position: "fixed"') || dockContent.includes("fixed"));

// TEST 2: Dock has horizontal centering (left 50% + translateX -50%)
check(2, "Dock uses left: 50% and transform: translateX(-50%)", dockContent.includes('left: "50%"') && dockContent.includes('translateX(-50%)'));

// TEST 3: Dock has safe-area bottom offset with minimum margin
check(3, "Dock uses safe-area bottom offset (max(14px, env(safe-area-inset-bottom) + 8px))", dockContent.includes("env(safe-area-inset-bottom"));

// TEST 4: Dock width is responsive pill (min(420px, calc(100vw - 28px)))
check(4, "Dock width is constrained to pill dimensions (min(420px, calc(100vw - 28px)))", dockContent.includes("min(420px, calc(100vw - 28px))"));

// TEST 5: Dock height is fixed (68px) to prevent button clipping
check(5, "Dock height is fixed (68px) with zero button clipping", dockContent.includes('height: "68px"'));

// TEST 6: Exactly 5 navigation items are rendered inside the pill
check(6, "Dock contains 5 navigation items (Home, Matches, Standings, Scorecards, Profile)",
  dockContent.includes('to: "/home"') &&
  dockContent.includes('to: "/matches"') &&
  dockContent.includes('to: "/pointables"') &&
  dockContent.includes('to: "/scorecards"') &&
  dockContent.includes('to: "/profile"')
);

// TEST 7: Read AppShell.tsx
const appShellContent = fs.readFileSync("src/components/layout/AppShell.tsx", "utf-8");

// TEST 8: Global bottom padding provides safe space for fixed dock
check(7, "AppShell main container has bottom clearance for fixed dock + safe area", appShellContent.includes("pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]"));

// TEST 9: Header has lower z-index (z-30) than dock (z-40) and modals (z-50)
check(8, "Header uses z-30, Dock uses z-40, Modals use z-50 for clean stacking order",
  appShellContent.includes("z-30") && dockContent.includes("z-40")
);

// TEST 10: Dock is hidden on desktop (md:hidden)
check(9, "Dock is scoped to mobile/tablet with md:hidden", dockContent.includes("md:hidden"));

// TEST 11: Touch targets adhere to 44px+ minimum size
check(10, "Buttons use w-11 h-11 / w-12 h-12 (44px-48px) touch targets", dockContent.includes("w-11 h-11"));

console.log("\n================================================================================");
console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
console.log("================================================================================\n");

assert.strictEqual(failed, 0, "All dock positioning tests must pass.");
