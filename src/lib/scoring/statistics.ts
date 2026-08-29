/**
 * TPL 2026 — Comprehensive Pure-Functional Statistics & Awards Engine
 * 
 * Provides single-match statistics, tournament-wide leaderboards,
 * record book calculations, and official tournament awards.
 * Adheres strictly to authoritative persisted match data.
 */

import type { Match, MatchState, InningsState, BatterStat, BowlerStat, Delivery } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText, totalRunsOf, bowlerRunsOf, batterRunsOf, isLegal } from "@/lib/scoring/engine";
import { calculateMatchMVP, type PlayerMVPScore, formatMOTMPerformanceSummary } from "@/lib/scoring/playerPerformance";

// ── CONFIGURABLE QUALIFICATION THRESHOLDS ────────────────────────────────────
export const STAT_THRESHOLDS = {
  MIN_BALLS_MATCH_STRIKER: 5,
  MIN_BALLS_TOURNAMENT_STRIKER: 15,
  MIN_INNINGS_BATTING_AVG: 2,
  MIN_DISMISSALS_BATTING_AVG: 1,
  MIN_OVERS_BOWLING_ECONOMY: 2, // 12 legal balls
  MIN_WICKETS_BOWLING_AVG: 2,
};

// ── 1. SINGLE MATCH STATISTICS INTERFACES ────────────────────────────────────

export interface SingleMatchBatterStats {
  playerId: string;
  playerName: string;
  playerRole?: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
  battingPosition: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dotBalls: number;
  singles: number;
  doubles: number;
  triples: number;
  boundaryRuns: number;
  teamScorePercent: number;
  isNotOut: boolean;
  dismissalText?: string;
}

export interface SingleMatchBowlerStats {
  playerId: string;
  playerName: string;
  playerRole?: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
  oversText: string;
  legalBalls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  dotBalls: number;
  boundariesConceded: number;
  foursConceded: number;
  sixesConceded: number;
  bowlingStrikeRate: number | null;
  bowlingAverage: number | null;
  bestBowling: string;
}

export interface SingleMatchFieldingStats {
  playerId: string;
  playerName: string;
  teamId: string;
  teamShortName: string;
  catches: number;
  runOuts: number;
  stumpings: number;
  totalDismissals: number;
}

export interface SingleMatchRecords {
  manOfTheMatch?: PlayerMVPScore;
  bestBatter?: SingleMatchBatterStats;
  bestBowler?: SingleMatchBowlerStats;
  bestStriker?: SingleMatchBatterStats;
  bestBowlingFigures?: SingleMatchBowlerStats;
  highestIndividualScore?: SingleMatchBatterStats;
  mostSixes?: { playerId: string; playerName: string; sixes: number; runs: number };
  mostFours?: { playerId: string; playerName: string; fours: number; runs: number };
  bestFielder?: SingleMatchFieldingStats;
}

export interface SingleMatchStats {
  match: Match;
  state: MatchState;
  batters: SingleMatchBatterStats[];
  bowlers: SingleMatchBowlerStats[];
  fielders: SingleMatchFieldingStats[];
  records: SingleMatchRecords;
  mvpRanking: PlayerMVPScore[];
}

// ── 2. SINGLE MATCH STATS CALCULATION ────────────────────────────────────────

export function calculateSingleMatchStats(state: MatchState): SingleMatchStats {
  const match = state.match;
  const batters: SingleMatchBatterStats[] = [];
  const bowlers: SingleMatchBowlerStats[] = [];
  const fieldersMap = new Map<string, SingleMatchFieldingStats>();

  // Extract deliveries per batter for dot balls / singles / boundary analysis
  state.innings.forEach((inn) => {
    const totalTeamRuns = Math.max(1, inn.runs);

    inn.batters.forEach((b, bIdx) => {
      const p = lookup.player(b.playerId);
      const t = lookup.team(inn.battingTeamId);

      // Analyze specific scoring shots for this batter
      let dotBalls = 0;
      let singles = 0;
      let doubles = 0;
      let triples = 0;

      inn.overGroups.forEach((og) => {
        og.balls.forEach((bs) => {
          if (bs.delivery.strikerId === b.playerId && bs.delivery.extraType !== "wide") {
            const r = bs.delivery.batterRuns;
            if (r === 0) dotBalls++;
            else if (r === 1) singles++;
            else if (r === 2) doubles++;
            else if (r === 3) triples++;
          }
        });
      });

      const boundaryRuns = b.fours * 4 + b.sixes * 6;
      const sr = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;
      const teamScorePercent = (b.runs / totalTeamRuns) * 100;

      batters.push({
        playerId: b.playerId,
        playerName: p?.name ?? b.playerId,
        playerRole: p?.role,
        teamId: inn.battingTeamId,
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        battingPosition: bIdx + 1,
        runs: b.runs,
        balls: b.balls,
        fours: b.fours,
        sixes: b.sixes,
        strikeRate: sr,
        dotBalls,
        singles,
        doubles,
        triples,
        boundaryRuns,
        teamScorePercent,
        isNotOut: !b.out,
        dismissalText: b.dismissal,
      });
    });

    // Bowlers
    inn.bowlers.forEach((bw) => {
      const p = lookup.player(bw.playerId);
      const t = lookup.team(inn.bowlingTeamId);

      let dotBalls = 0;
      let foursConceded = 0;
      let sixesConceded = 0;

      inn.overGroups.forEach((og) => {
        og.balls.forEach((bs) => {
          if (bs.delivery.bowlerId === bw.playerId) {
            const r = bs.delivery.batterRuns;
            if (r === 0 && bs.delivery.extraType !== "wide" && bs.delivery.extraType !== "noball") {
              dotBalls++;
            }
            if (r === 4 && !bs.delivery.extraType) foursConceded++;
            if (r === 6 && !bs.delivery.extraType) sixesConceded++;
          }
        });
      });

      const bSR = bw.wickets > 0 ? bw.legalBalls / bw.wickets : null;
      const bAvg = bw.wickets > 0 ? bw.runs / bw.wickets : null;

      bowlers.push({
        playerId: bw.playerId,
        playerName: p?.name ?? bw.playerId,
        playerRole: p?.role,
        teamId: inn.bowlingTeamId,
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        oversText: oversText(bw.legalBalls),
        legalBalls: bw.legalBalls,
        maidens: bw.maidens,
        runsConceded: bw.runs,
        wickets: bw.wickets,
        economy: bw.economy ?? 0,
        dotBalls,
        boundariesConceded: foursConceded + sixesConceded,
        foursConceded,
        sixesConceded,
        bowlingStrikeRate: bSR,
        bowlingAverage: bAvg,
        bestBowling: `${bw.wickets}/${bw.runs}`,
      });
    });

    // Fielding
    inn.overGroups.forEach((og) => {
      og.balls.forEach((bs) => {
        const w = bs.delivery.wicket;
        if (w?.fielderId) {
          const fId = w.fielderId;
          if (!fieldersMap.has(fId)) {
            const p = lookup.player(fId);
            const t = lookup.team(inn.bowlingTeamId);
            fieldersMap.set(fId, {
              playerId: fId,
              playerName: p?.name ?? fId,
              teamId: inn.bowlingTeamId,
              teamShortName: t?.shortName ?? "TPL",
              catches: 0,
              runOuts: 0,
              stumpings: 0,
              totalDismissals: 0,
            });
          }
          const f = fieldersMap.get(fId)!;
          if (w.type === "Caught") f.catches++;
          else if (w.type === "Run Out") f.runOuts++;
          else if (w.type === "Stumped") f.stumpings++;
          f.totalDismissals++;
        }
      });
    });
  });

  const fielders = Array.from(fieldersMap.values());
  const mvpRanking = calculateMatchMVP(state);

  // Single Match Records & Accolades
  const sortedBattersByRuns = [...batters].sort((a, b) => b.runs - a.runs || b.strikeRate - a.strikeRate);
  const bestBatter = sortedBattersByRuns[0];

  const sortedBowlersByWickets = [...bowlers].sort(
    (a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded || a.economy - b.economy
  );
  const bestBowler = sortedBowlersByWickets[0];

  const qualifiedStrikers = batters
    .filter((b) => b.balls >= STAT_THRESHOLDS.MIN_BALLS_MATCH_STRIKER)
    .sort((a, b) => b.strikeRate - a.strikeRate || b.runs - a.runs);
  const bestStriker = qualifiedStrikers[0] || sortedBattersByRuns[0];

  const highestScore = sortedBattersByRuns[0];
  const bestBowlingFigures = sortedBowlersByWickets[0];

  const sixHitters = [...batters].filter((b) => b.sixes > 0).sort((a, b) => b.sixes - a.sixes || b.runs - a.runs);
  const fourHitters = [...batters].filter((b) => b.fours > 0).sort((a, b) => b.fours - a.fours || b.runs - a.runs);
  const bestFielder = [...fielders].sort((a, b) => b.totalDismissals - a.totalDismissals)[0];

  const records: SingleMatchRecords = {
    manOfTheMatch: mvpRanking[0],
    bestBatter,
    bestBowler,
    bestStriker,
    bestBowlingFigures,
    highestIndividualScore: highestScore,
    mostSixes: sixHitters[0] ? { playerId: sixHitters[0].playerId, playerName: sixHitters[0].playerName, sixes: sixHitters[0].sixes, runs: sixHitters[0].runs } : undefined,
    mostFours: fourHitters[0] ? { playerId: fourHitters[0].playerId, playerName: fourHitters[0].playerName, fours: fourHitters[0].fours, runs: fourHitters[0].runs } : undefined,
    bestFielder,
  };

  return {
    match,
    state,
    batters,
    bowlers,
    fielders,
    records,
    mvpRanking,
  };
}

// ── 3. TOURNAMENT-WIDE STATISTICS & LEADERBOARDS ─────────────────────────────

export interface TournamentLeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  playerRole?: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
}

export interface OrangeCapEntry extends TournamentLeaderboardEntry {
  runs: number;
  innings: number;
  balls: number;
  highestScore: string;
  average: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  notOuts: number;
}

export interface PurpleCapEntry extends TournamentLeaderboardEntry {
  wickets: number;
  innings: number;
  oversText: string;
  legalBalls: number;
  runsConceded: number;
  economy: number;
  average: number;
  bestBowling: string;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  maidens: number;
  dotBalls: number;
}

export interface BestStrikerEntry extends TournamentLeaderboardEntry {
  strikeRate: number;
  balls: number;
  runs: number;
  fours: number;
  sixes: number;
  innings: number;
}

export interface BestAverageEntry extends TournamentLeaderboardEntry {
  average: number;
  runs: number;
  innings: number;
  dismissals: number;
  notOuts: number;
  strikeRate: number;
}

export interface BestBowlingAverageEntry extends TournamentLeaderboardEntry {
  average: number;
  wickets: number;
  runsConceded: number;
  economy: number;
  oversText: string;
}

export interface BestBowlingSpellEntry extends TournamentLeaderboardEntry {
  wickets: number;
  runsConceded: number;
  oversText: string;
  economy: number;
  matchId: string;
  matchNumber: number;
  opponentTeamName: string;
  matchDate?: string;
}

export interface HighestInningsScoreEntry extends TournamentLeaderboardEntry {
  runs: number;
  balls: number;
  isNotOut: boolean;
  strikeRate: number;
  fours: number;
  sixes: number;
  matchId: string;
  matchNumber: number;
  opponentTeamName: string;
}

export interface BestAllRounderEntry extends TournamentLeaderboardEntry {
  allRounderIndex: number;
  runs: number;
  wickets: number;
  catches: number;
  battingAverage: number;
  bowlingEconomy: number;
  matchesPlayed: number;
}

export interface BestFielderEntry extends TournamentLeaderboardEntry {
  totalDismissals: number;
  catches: number;
  runOuts: number;
  stumpings: number;
  matchesPlayed: number;
}

export interface TournamentMVPEntry extends TournamentLeaderboardEntry {
  mvpPoints: number;
  runs: number;
  wickets: number;
  catches: number;
  matchesPlayed: number;
  motmAwardsCount: number;
}

export interface OfficialTournamentAwards {
  manOfTheTournament?: TournamentMVPEntry;
  orangeCapWinner?: OrangeCapEntry;
  purpleCapWinner?: PurpleCapEntry;
  bestBatter?: OrangeCapEntry;
  bestBowler?: PurpleCapEntry;
  bestStriker?: BestStrikerEntry;
  bestBattingAverage?: BestAverageEntry;
  bestBowlingAverage?: BestBowlingAverageEntry;
  bestBowlingFigures?: BestBowlingSpellEntry;
  highestIndividualScore?: HighestInningsScoreEntry;
  mostSixesWinner?: { playerId: string; playerName: string; teamShortName: string; sixes: number; runs: number };
  mostFoursWinner?: { playerId: string; playerName: string; teamShortName: string; fours: number; runs: number };
  bestAllRounder?: BestAllRounderEntry;
  bestFielder?: BestFielderEntry;
  tournamentMVP?: TournamentMVPEntry;
}

export interface TournamentStats {
  completedMatchesCount: number;
  totalTournamentRuns: number;
  totalTournamentWickets: number;
  totalTournamentSixes: number;
  totalTournamentFours: number;
  orangeCap: OrangeCapEntry[];
  purpleCap: PurpleCapEntry[];
  bestStrikers: BestStrikerEntry[];
  bestAverages: BestAverageEntry[];
  bestBowlingAverages: BestBowlingAverageEntry[];
  bestBowlingSpells: BestBowlingSpellEntry[];
  highestInningsScores: HighestInningsScoreEntry[];
  mostSixes: Array<TournamentLeaderboardEntry & { sixes: number; runs: number; innings: number }>;
  mostFours: Array<TournamentLeaderboardEntry & { fours: number; runs: number; innings: number }>;
  mostBoundaries: Array<TournamentLeaderboardEntry & { totalBoundaries: number; fours: number; sixes: number; runs: number }>;
  mostDotBalls: Array<TournamentLeaderboardEntry & { dotBalls: number; oversText: string; wickets: number }>;
  bestEconomies: Array<TournamentLeaderboardEntry & { economy: number; oversText: string; runsConceded: number; wickets: number }>;
  bestAllRounders: BestAllRounderEntry[];
  bestFielders: BestFielderEntry[];
  mvpLeaderboard: TournamentMVPEntry[];
  awards: OfficialTournamentAwards;
}

// Helper to safely format decimal values
export function formatStatDecimal(val: number | null | undefined, digits = 2): string {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return val.toFixed(digits);
}

/**
 * Calculates complete, tournament-wide statistics from all authoritative match records.
 */
export function calculateTournamentStats(matches: Match[]): TournamentStats {
  const allPlayers = lookup.players();
  const STORAGE_PREFIX = "tpl-scoring:";

  interface Accumulator {
    playerId: string;
    matchesPlayed: number;
    motmCount: number;
    // Batting
    battingInnings: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    fifties: number;
    hundreds: number;
    notOuts: number;
    highestScoreRuns: number;
    highestScoreIsNotOut: boolean;
    // Bowling
    bowlingInnings: number;
    legalBalls: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    dotBalls: number;
    bestBowlingWickets: number;
    bestBowlingRuns: number;
    // Fielding
    catches: number;
    runOuts: number;
    stumpings: number;
    // MVP
    totalMvpPoints: number;
  }

  const map = new Map<string, Accumulator>();

  const getAcc = (pId: string): Accumulator => {
    if (!map.has(pId)) {
      map.set(pId, {
        playerId: pId,
        matchesPlayed: 0,
        motmCount: 0,
        battingInnings: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        fifties: 0,
        hundreds: 0,
        notOuts: 0,
        highestScoreRuns: 0,
        highestScoreIsNotOut: false,
        bowlingInnings: 0,
        legalBalls: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        dotBalls: 0,
        bestBowlingWickets: 0,
        bestBowlingRuns: 999,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
        totalMvpPoints: 0,
      });
    }
    return map.get(pId)!;
  };

  const highestInningsScoresList: HighestInningsScoreEntry[] = [];
  const bestBowlingSpellsList: BestBowlingSpellEntry[] = [];

  let completedMatchesCount = 0;
  let totalTournamentRuns = 0;
  let totalTournamentWickets = 0;
  let totalTournamentSixes = 0;
  let totalTournamentFours = 0;

  // Process all match records
  matches.forEach((m) => {
    let state: MatchState | null = null;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + m.id);
        if (raw) {
          const doc = JSON.parse(raw);
          if (doc && doc.deliveries) {
            const { buildMatchState: bms } = require("@/lib/scoring/engine");
            state = bms({
              match: m,
              setup: doc.setup,
              deliveries: doc.deliveries,
              secondInningsStarted: doc.secondInningsStarted,
              ...(doc.secondInningsOpeners ? { secondInningsOpeners: doc.secondInningsOpeners } : {}),
            });
          }
        }
      } catch {}
    }

    if (!state) return;
    if (m.status === "COMPLETED" || state.phase === "complete") {
      completedMatchesCount++;
    }

    const motmId = m.manOfTheMatchId ?? state.match.manOfTheMatchId;
    if (motmId) {
      getAcc(motmId).motmCount++;
    }

    const matchMvpScores = calculateMatchMVP(state);
    matchMvpScores.forEach((item) => {
      getAcc(item.playerId).totalMvpPoints += item.totalPoints;
    });

    const matchPlayerIds = new Set<string>();

    state.innings.forEach((inn) => {
      const oppTeam = lookup.team(inn.bowlingTeamId);
      const oppTeamName = oppTeam?.name ?? "Opponent";

      // Batting
      inn.batters.forEach((b) => {
        matchPlayerIds.add(b.playerId);
        const acc = getAcc(b.playerId);

        if (b.balls > 0 || b.out) {
          acc.battingInnings++;
          acc.runs += b.runs;
          acc.balls += b.balls;
          acc.fours += b.fours;
          acc.sixes += b.sixes;
          if (!b.out) acc.notOuts++;
          if (b.runs >= 100) acc.hundreds++;
          else if (b.runs >= 50) acc.fifties++;

          totalTournamentRuns += b.runs;
          totalTournamentFours += b.fours;
          totalTournamentSixes += b.sixes;

          if (
            b.runs > acc.highestScoreRuns ||
            (b.runs === acc.highestScoreRuns && !b.out && !acc.highestScoreIsNotOut)
          ) {
            acc.highestScoreRuns = b.runs;
            acc.highestScoreIsNotOut = !b.out;
          }

          if (b.runs > 0) {
            const p = lookup.player(b.playerId);
            const t = lookup.team(p?.teamId);
            highestInningsScoresList.push({
              rank: 0,
              playerId: b.playerId,
              playerName: p?.name ?? b.playerId,
              playerAvatar: p?.avatar,
              playerRole: p?.role,
              teamId: p?.teamId ?? "",
              teamName: t?.name ?? "Team",
              teamShortName: t?.shortName ?? "TPL",
              runs: b.runs,
              balls: b.balls,
              isNotOut: !b.out,
              strikeRate: b.balls > 0 ? (b.runs / b.balls) * 100 : 0,
              fours: b.fours,
              sixes: b.sixes,
              matchId: m.id,
              matchNumber: m.matchNumber,
              opponentTeamName: oppTeamName,
            });
          }
        }
      });

      // Bowling
      inn.bowlers.forEach((bw) => {
        matchPlayerIds.add(bw.playerId);
        const acc = getAcc(bw.playerId);

        if (bw.legalBalls > 0) {
          acc.bowlingInnings++;
          acc.legalBalls += bw.legalBalls;
          acc.runsConceded += bw.runs;
          acc.wickets += bw.wickets;
          acc.maidens += bw.maidens;
          acc.dotBalls += bw.dots;
          totalTournamentWickets += bw.wickets;

          if (
            bw.wickets > acc.bestBowlingWickets ||
            (bw.wickets === acc.bestBowlingWickets && bw.runs < acc.bestBowlingRuns)
          ) {
            acc.bestBowlingWickets = bw.wickets;
            acc.bestBowlingRuns = bw.runs;
          }

          if (bw.wickets > 0 || bw.legalBalls >= 6) {
            const p = lookup.player(bw.playerId);
            const t = lookup.team(p?.teamId);
            const bowlEcon = bw.legalBalls > 0 ? (bw.runs / bw.legalBalls) * 6 : 0;
            bestBowlingSpellsList.push({
              rank: 0,
              playerId: bw.playerId,
              playerName: p?.name ?? bw.playerId,
              playerAvatar: p?.avatar,
              playerRole: p?.role,
              teamId: p?.teamId ?? "",
              teamName: t?.name ?? "Team",
              teamShortName: t?.shortName ?? "TPL",
              wickets: bw.wickets,
              runsConceded: bw.runs,
              oversText: oversText(bw.legalBalls),
              economy: bowlEcon,
              matchId: m.id,
              matchNumber: m.matchNumber,
              opponentTeamName: lookup.team(inn.battingTeamId)?.name ?? "Opponent",
              matchDate: m.scheduledAt,
            });
          }
        }
      });

      // Fielding
      inn.overGroups.forEach((og) => {
        og.balls.forEach((bs) => {
          const w = bs.delivery.wicket;
          if (w?.fielderId) {
            matchPlayerIds.add(w.fielderId);
            const acc = getAcc(w.fielderId);
            if (w.type === "Caught") acc.catches++;
            else if (w.type === "Run Out") acc.runOuts++;
            else if (w.type === "Stumped") acc.stumpings++;
          }
        });
      });
    });

    matchPlayerIds.forEach((pId) => {
      getAcc(pId).matchesPlayed++;
    });
  });

  const accumulators = Array.from(map.values()).filter((a) => a.matchesPlayed > 0);

  // ── 1. Orange Cap (Top Run Scorers) ────────────────────────────────────────
  const orangeCap: OrangeCapEntry[] = accumulators
    .filter((a) => a.runs > 0)
    .map((a) => {
      const p = lookup.player(a.playerId);
      const t = lookup.team(p?.teamId);
      const dismissals = Math.max(0, a.battingInnings - a.notOuts);
      const avg = dismissals > 0 ? a.runs / dismissals : a.runs;
      const sr = a.balls > 0 ? (a.runs / a.balls) * 100 : 0;
      const hs = `${a.highestScoreRuns}${a.highestScoreIsNotOut ? "*" : ""}`;

      return {
        rank: 0,
        playerId: a.playerId,
        playerName: p?.name ?? a.playerId,
        playerAvatar: p?.avatar,
        playerRole: p?.role,
        teamId: p?.teamId ?? "",
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        runs: a.runs,
        innings: a.battingInnings,
        balls: a.balls,
        highestScore: hs,
        average: avg,
        strikeRate: sr,
        fours: a.fours,
        sixes: a.sixes,
        fifties: a.fifties,
        hundreds: a.hundreds,
        notOuts: a.notOuts,
      };
    })
    .sort((a, b) => b.runs - a.runs || b.average - a.average || b.strikeRate - a.strikeRate || a.innings - b.innings)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 2. Purple Cap (Top Wicket Takers) ──────────────────────────────────────
  const purpleCap: PurpleCapEntry[] = accumulators
    .filter((a) => a.wickets > 0 || a.legalBalls > 0)
    .map((a) => {
      const p = lookup.player(a.playerId);
      const t = lookup.team(p?.teamId);
      const econ = a.legalBalls > 0 ? (a.runsConceded / a.legalBalls) * 6 : 0;
      const avg = a.wickets > 0 ? a.runsConceded / a.wickets : 0;
      const bb = a.bestBowlingWickets > 0 ? `${a.bestBowlingWickets}/${a.bestBowlingRuns}` : "-";

      return {
        rank: 0,
        playerId: a.playerId,
        playerName: p?.name ?? a.playerId,
        playerAvatar: p?.avatar,
        playerRole: p?.role,
        teamId: p?.teamId ?? "",
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        wickets: a.wickets,
        innings: a.bowlingInnings,
        oversText: oversText(a.legalBalls),
        legalBalls: a.legalBalls,
        runsConceded: a.runsConceded,
        economy: econ,
        average: avg,
        bestBowling: bb,
        bestBowlingWickets: a.bestBowlingWickets,
        bestBowlingRuns: a.bestBowlingRuns,
        maidens: a.maidens,
        dotBalls: a.dotBalls,
      };
    })
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy || a.average - b.average || a.runsConceded - b.runsConceded)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 3. Best Strikers (Min 15 balls faced) ──────────────────────────────────
  const bestStrikers: BestStrikerEntry[] = orangeCap
    .filter((a) => a.balls >= STAT_THRESHOLDS.MIN_BALLS_TOURNAMENT_STRIKER)
    .sort((a, b) => b.strikeRate - a.strikeRate || b.runs - a.runs)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  // ── 4. Best Batting Averages (Min 2 dismissals or 2 innings) ───────────────
  const bestAverages: BestAverageEntry[] = orangeCap
    .filter((a) => a.innings >= STAT_THRESHOLDS.MIN_INNINGS_BATTING_AVG)
    .map((a) => ({
      ...a,
      dismissals: Math.max(0, a.innings - a.notOuts),
    }))
    .sort((a, b) => b.average - a.average || b.runs - a.runs)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  // ── 5. Best Bowling Averages (Min 2 wickets) ──────────────────────────────
  const bestBowlingAverages: BestBowlingAverageEntry[] = purpleCap
    .filter((a) => a.wickets >= STAT_THRESHOLDS.MIN_WICKETS_BOWLING_AVG)
    .sort((a, b) => a.average - b.average || a.economy - b.economy || b.wickets - a.wickets)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  // ── 6. Best Bowling Spells in Tournament ──────────────────────────────────
  const bestBowlingSpells: BestBowlingSpellEntry[] = bestBowlingSpellsList
    .sort(
      (a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded || a.economy - b.economy
    )
    .slice(0, 10)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 7. Highest Individual Innings Scores ──────────────────────────────────
  const highestInningsScores: HighestInningsScoreEntry[] = highestInningsScoresList
    .sort((a, b) => b.runs - a.runs || b.strikeRate - a.strikeRate)
    .slice(0, 10)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 8. Most Sixes & Most Fours ────────────────────────────────────────────
  const mostSixes = orangeCap
    .filter((item) => item.sixes > 0)
    .sort((a, b) => b.sixes - a.sixes || b.runs - a.runs)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const mostFours = orangeCap
    .filter((item) => item.fours > 0)
    .sort((a, b) => b.fours - a.fours || b.runs - a.runs)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const mostBoundaries = orangeCap
    .filter((item) => item.fours + item.sixes > 0)
    .map((item) => ({
      ...item,
      totalBoundaries: item.fours + item.sixes,
    }))
    .sort((a, b) => b.totalBoundaries - a.totalBoundaries || b.runs - a.runs)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 9. Most Dot Balls & Best Economies ────────────────────────────────────
  const mostDotBalls = purpleCap
    .filter((item) => item.dotBalls > 0)
    .sort((a, b) => b.dotBalls - a.dotBalls || b.wickets - a.wickets)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const bestEconomies = purpleCap
    .filter((item) => item.legalBalls >= STAT_THRESHOLDS.MIN_OVERS_BOWLING_ECONOMY * 6)
    .sort((a, b) => a.economy - b.economy || b.wickets - a.wickets)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 10. Best All-Rounders Index (Normalized Dual Bat+Bowl+Field Score) ──────
  const bestAllRounders: BestAllRounderEntry[] = accumulators
    .filter((a) => (a.runs > 0 && a.wickets > 0) || (a.runs >= 20 && a.catches >= 1))
    .map((a) => {
      const p = lookup.player(a.playerId);
      const t = lookup.team(p?.teamId);
      const dismissals = Math.max(0, a.battingInnings - a.notOuts);
      const bAvg = dismissals > 0 ? a.runs / dismissals : a.runs;
      const bEcon = a.legalBalls > 0 ? (a.runsConceded / a.legalBalls) * 6 : 0;
      
      // Normalized impact: (runs * 1) + (wickets * 25) + (catches * 10)
      const allRounderIndex = a.runs * 1 + a.wickets * 25 + (a.catches + a.runOuts + a.stumpings) * 10;

      return {
        rank: 0,
        playerId: a.playerId,
        playerName: p?.name ?? a.playerId,
        playerAvatar: p?.avatar,
        playerRole: p?.role,
        teamId: p?.teamId ?? "",
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        allRounderIndex,
        runs: a.runs,
        wickets: a.wickets,
        catches: a.catches + a.runOuts + a.stumpings,
        battingAverage: bAvg,
        bowlingEconomy: bEcon,
        matchesPlayed: a.matchesPlayed,
      };
    })
    .sort((a, b) => b.allRounderIndex - a.allRounderIndex || b.wickets - a.wickets || b.runs - a.runs)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 11. Best Fielders ─────────────────────────────────────────────────────
  const bestFielders: BestFielderEntry[] = accumulators
    .filter((a) => a.catches > 0 || a.runOuts > 0 || a.stumpings > 0)
    .map((a) => {
      const p = lookup.player(a.playerId);
      const t = lookup.team(p?.teamId);
      const tot = a.catches + a.runOuts + a.stumpings;

      return {
        rank: 0,
        playerId: a.playerId,
        playerName: p?.name ?? a.playerId,
        playerAvatar: p?.avatar,
        playerRole: p?.role,
        teamId: p?.teamId ?? "",
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        totalDismissals: tot,
        catches: a.catches,
        runOuts: a.runOuts,
        stumpings: a.stumpings,
        matchesPlayed: a.matchesPlayed,
      };
    })
    .sort((a, b) => b.totalDismissals - a.totalDismissals || b.catches - a.catches)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 12. Tournament MVP Leaderboard ────────────────────────────────────────
  const mvpLeaderboard: TournamentMVPEntry[] = accumulators
    .filter((a) => a.totalMvpPoints > 0)
    .map((a) => {
      const p = lookup.player(a.playerId);
      const t = lookup.team(p?.teamId);

      return {
        rank: 0,
        playerId: a.playerId,
        playerName: p?.name ?? a.playerId,
        playerAvatar: p?.avatar,
        playerRole: p?.role,
        teamId: p?.teamId ?? "",
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        mvpPoints: a.totalMvpPoints,
        runs: a.runs,
        wickets: a.wickets,
        catches: a.catches + a.runOuts + a.stumpings,
        matchesPlayed: a.matchesPlayed,
        motmAwardsCount: a.motmCount,
      };
    })
    .sort((a, b) => b.mvpPoints - a.mvpPoints || b.motmAwardsCount - a.motmCount || b.wickets - a.wickets || b.runs - a.runs)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // ── 13. Official Tournament Awards ────────────────────────────────────────
  const awards: OfficialTournamentAwards = {
    manOfTheTournament: mvpLeaderboard[0],
    orangeCapWinner: orangeCap[0],
    purpleCapWinner: purpleCap[0],
    bestBatter: orangeCap[0],
    bestBowler: purpleCap[0],
    bestStriker: bestStrikers[0] || orangeCap[0] as any,
    bestBattingAverage: bestAverages[0] || orangeCap[0] as any,
    bestBowlingAverage: bestBowlingAverages[0] || purpleCap[0] as any,
    bestBowlingFigures: bestBowlingSpells[0],
    highestIndividualScore: highestInningsScores[0],
    mostSixesWinner: mostSixes[0] ? { playerId: mostSixes[0].playerId, playerName: mostSixes[0].playerName, teamShortName: mostSixes[0].teamShortName, sixes: mostSixes[0].sixes, runs: mostSixes[0].runs } : undefined,
    mostFoursWinner: mostFours[0] ? { playerId: mostFours[0].playerId, playerName: mostFours[0].playerName, teamShortName: mostFours[0].teamShortName, fours: mostFours[0].fours, runs: mostFours[0].runs } : undefined,
    bestAllRounder: bestAllRounders[0],
    bestFielder: bestFielders[0],
    tournamentMVP: mvpLeaderboard[0],
  };

  return {
    completedMatchesCount,
    totalTournamentRuns,
    totalTournamentWickets,
    totalTournamentSixes,
    totalTournamentFours,
    orangeCap,
    purpleCap,
    bestStrikers,
    bestAverages,
    bestBowlingAverages,
    bestBowlingSpells,
    highestInningsScores,
    mostSixes,
    mostFours,
    mostBoundaries,
    mostDotBalls,
    bestEconomies,
    bestAllRounders,
    bestFielders,
    mvpLeaderboard,
    awards,
  };
}
