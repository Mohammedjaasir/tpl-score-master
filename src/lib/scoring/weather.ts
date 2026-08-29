/**
 * TPL 2026 — Weather & Rain Interruption Engine
 * 
 * Implements official TPL Tournament Weather Guidelines:
 * - Scenario A: Rain Before/During First Innings (Equal reduction, no target recalculation)
 * - Scenario B: Rain During Second Innings (ARR target revision formula)
 */

export type MatchCondition =
  | "NORMAL"
  | "RAIN_DELAY"
  | "RAIN_RESUMED"
  | "REDUCED_OVERS"
  | "MATCH_ABANDONED";

export interface WeatherState {
  condition: MatchCondition;
  isInterrupted: boolean;
  originalOvers: number;
  revisedOvers?: number | null;
  interruptionReason?: string | null;
  targetRevision?: {
    isApplied: boolean;
    teamATotal: number;
    teamAOvers: number;
    teamBReducedOvers: number;
    arr: number;
    revisedTarget: number;
  } | null;
}

/**
 * Scenario A: Rain before or during 1st innings.
 * Both teams' total overs are reduced equally.
 */
export function calculateScenarioA(originalOvers: number, reducedOvers: number) {
  return {
    teamAOvers: reducedOvers,
    teamBOvers: reducedOvers,
    requiresTargetRevision: false,
  };
}

/**
 * Scenario B: Rain during 2nd innings.
 * Team B loses overs. Target is recalculated using Average Run Rate (ARR):
 * Formula: (Team A Total / Team A Overs) × Team B Reduced Overs = Revised Target (rounded + 1)
 */
export function calculateScenarioBTarget(
  teamATotalRuns: number,
  teamAOversFaced: number,
  teamBReducedOvers: number
): {
  arr: number;
  revisedTarget: number;
} {
  const safeOvers = Math.max(0.1, teamAOversFaced);
  const arr = teamATotalRuns / safeOvers;
  // Official rule: (Team A Total / Team A Overs) * Team B Reduced Overs (Target is integer + 1 to win)
  const baseScore = Math.floor(arr * teamBReducedOvers);
  const revisedTarget = baseScore + 1;

  return {
    arr: Number(arr.toFixed(2)),
    revisedTarget: Math.max(1, revisedTarget),
  };
}

/**
 * Format match condition for public display
 */
export function formatMatchCondition(condition?: MatchCondition | null): {
  label: string;
  badgeClass: string;
  isWarning: boolean;
} {
  switch (condition) {
    case "RAIN_DELAY":
      return {
        label: "RAIN DELAY — PLAY SUSPENDED",
        badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse",
        isWarning: true,
      };
    case "RAIN_RESUMED":
      return {
        label: "RAIN RESUMED — PLAY ACTIVE",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        isWarning: false,
      };
    case "REDUCED_OVERS":
      return {
        label: "REDUCED OVERS MATCH",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        isWarning: true,
      };
    case "MATCH_ABANDONED":
      return {
        label: "MATCH ABANDONED (NO RESULT)",
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        isWarning: true,
      };
    case "NORMAL":
    default:
      return {
        label: "MATCH IN PROGRESS",
        badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
        isWarning: false,
      };
  }
}
