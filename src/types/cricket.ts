/**
 * Core cricket domain types.
 * These are intentionally source-agnostic: mock repositories today,
 * Supabase repositories later, with no change to the scoring engine or UI.
 */

export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper";

export interface Player {
  id: string;
  name: string;
  shortName: string;
  role: PlayerRole;
  teamId: string;
  avatar?: string | undefined;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export type MatchStatus = "UPCOMING" | "READY" | "LIVE" | "COMPLETED";

export interface Match {
  id: string;
  tournament: string;
  matchNumber: number;
  teamAId: string;
  teamBId: string;
  venue: string;
  overs: number;
  scheduledAt: string;
  status: MatchStatus;
  resultText?: string | undefined;
}

export interface PlayingXI {
  teamId: string;
  playerIds: string[];
  captainId?: string | undefined;
  keeperId?: string | undefined;
}

export type TossDecision = "bat" | "bowl";

export interface MatchSetup {
  tossWinnerId?: string | undefined;
  decision?: TossDecision | undefined;
  battingFirstId?: string | undefined;
  playingXI: Record<string, PlayingXI>;
  openers?: { strikerId: string | undefined; nonStrikerId: string };
  openingBowlerId?: string | undefined;
}

export type ExtraType = "wide" | "noball" | "bye" | "legbye" | null;

export type DismissalType =
  | "Bowled"
  | "Caught"
  | "LBW"
  | "Run Out"
  | "Stumped"
  | "Hit Wicket"
  | "Retired Hurt"
  | "Retired Out"
  | "Timed Out"
  | "Other";

export interface WicketInfo {
  type: DismissalType;
  batterOutId: string;
  fielderId?: string | undefined;
  /** Batter walking in (undefined when innings ends on this ball). */
  newBatterId?: string | undefined;
}

/** The single source of truth for all match state. */
export interface Delivery {
  id: string;
  inningsIndex: 0 | 1;
  bowlerId: string;
  /** Recorded for audit; strike is always recomputed by the engine. */
  strikerId: string;
  nonStrikerId: string;
  batterRuns: number;
  /** For wide: 1 + extra runs run. For bye/legbye: runs run. For noball: 1. */
  extraRuns: number;
  extraType: ExtraType;
  wicket?: WicketInfo | undefined;
  timestamp: number;
}

export interface BatterStat {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
  dismissal?: string | undefined;
  strikeRate: number;
  battingPosition: number;
}

export interface BowlerStat {
  playerId: string;
  legalBalls: number;
  runs: number;
  wickets: number;
  maidens: number;
  economy: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  runs: number;
  oversText: string;
  batterOutId: string;
}

export interface BallSummary {
  delivery: Delivery;
  oversText: string;
  label: string;
  kind: "run" | "boundary" | "wicket" | "extra" | "dot";
  totalRuns: number;
}

export interface OverGroup {
  overNumber: number;
  bowlerId: string;
  balls: BallSummary[];
  runs: number;
  wickets: number;
  complete: boolean;
}

export interface Partnership {
  runs: number;
  balls: number;
  batterAId?: string | undefined;
  batterBId?: string | undefined;
}

export interface InningsState {
  index: 0 | 1;
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  legalBalls: number;
  extras: number;
  oversText: string;
  oversFloat: number;
  crr: number;
  strikerId?: string | undefined;
  nonStrikerId?: string | undefined;
  currentBowlerId?: string | undefined;
  previousBowlerId?: string | undefined;
  batters: BatterStat[];
  bowlers: BowlerStat[];
  fallOfWickets: FallOfWicket[];
  overGroups: OverGroup[];
  recentBalls: BallSummary[];
  partnership: Partnership;
  isComplete: boolean;
  needsBowler: boolean;
  yetToBat: string[];
  target?: number | undefined;
  runsNeeded?: number | undefined;
  ballsRemaining?: number | undefined;
  requiredRunRate?: number | undefined;
}

export interface MatchState {
  match: Match;
  setup: MatchSetup;
  innings: InningsState[];
  currentInningsIndex: 0 | 1;
  phase: "setup" | "innings1" | "break" | "innings2" | "complete";
  resultText?: string | undefined;
}
