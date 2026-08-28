import type { Match, MatchState, BatterStat, BowlerStat, Delivery } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { buildMatchState, oversText } from "@/lib/scoring/engine";

export interface PlayerMatchPerformance {
  matchId: string;
  matchNumber: number;
  opponentTeamName: string;
  opponentTeamLogo?: string;
  matchDate?: string;
  status: Match["status"];
  resultText?: string;
  batting?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isNotOut: boolean;
    dismissalText?: string;
    strikeRate: number;
  };
  bowling?: {
    legalBalls: number;
    oversText: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  };
  fielding?: {
    catches: number;
    runOuts: number;
    stumpings: number;
  };
}

export interface PlayerCareerStats {
  hasData: boolean;
  matchesPlayed: number;
  batting: {
    innings: number;
    runs: number;
    balls: number;
    highestScore: { runs: number; isNotOut: boolean };
    fours: number;
    sixes: number;
    fifties: number;
    hundreds: number;
    notOuts: number;
    average: number;
    strikeRate: number;
  };
  bowling: {
    hasBowled: boolean;
    innings: number;
    legalBalls: number;
    oversText: string;
    maidens: number;
    runsConceded: number;
    wickets: number;
    economy: number;
    average: number;
    bestBowling: { wickets: number; runs: number };
  };
  fielding: {
    hasFielded: boolean;
    catches: number;
    runOuts: number;
    stumpings: number;
  };
  matchHistory: PlayerMatchPerformance[];
  currentLiveMatch?: {
    match: Match;
    isBattingNow: boolean;
    isOnStrike: boolean;
    isBowlingNow: boolean;
    liveBatterStat?: BatterStat;
    liveBowlerStat?: BowlerStat;
  };
}

const STORAGE_PREFIX = "tpl-scoring:";

function getMatchDocFromStorage(matchId: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + matchId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Calculates complete real tournament performance for a given player ID
 * by aggregating state from all known matches and real-time live docs.
 */
export function calculatePlayerPerformance(
  playerId: string,
  allMatches: Match[],
  liveMatchState?: MatchState,
  liveMatchId?: string,
): PlayerCareerStats {
  const matchHistory: PlayerMatchPerformance[] = [];

  let matchesCount = 0;
  let battingInnings = 0;
  let totalRuns = 0;
  let totalBalls = 0;
  let totalFours = 0;
  let totalSixes = 0;
  let totalNotOuts = 0;
  let fifties = 0;
  let hundreds = 0;
  let highestRuns = 0;
  let highestIsNotOut = false;

  let bowlingInnings = 0;
  let totalLegalBalls = 0;
  let totalMaidens = 0;
  let totalRunsConceded = 0;
  let totalWickets = 0;
  let bestWickets = -1;
  let bestRunsConceded = 999;

  let totalCatches = 0;
  let totalRunOuts = 0;
  let totalStumpings = 0;

  let currentLiveInfo: PlayerCareerStats["currentLiveMatch"] | undefined = undefined;

  for (const match of allMatches) {
    let state: MatchState | undefined = undefined;

    if (liveMatchId && match.id === liveMatchId && liveMatchState) {
      state = liveMatchState;
    } else {
      const doc = getMatchDocFromStorage(match.id);
      if (doc) {
        state = buildMatchState({
          match,
          setup: doc.setup || { playingXI: {} },
          deliveries: doc.deliveries || [],
          secondInningsStarted: Boolean(doc.secondInningsStarted),
          ...(doc.secondInningsOpeners ? { secondInningsOpeners: doc.secondInningsOpeners } : {}),
        });
      }
    }

    // Determine if player was in this match
    const teamA = lookup.team(match.teamAId);
    const teamB = lookup.team(match.teamBId);
    const player = lookup.player(playerId);

    const isInTeamA = player?.teamId === match.teamAId || state?.setup.playingXI[match.teamAId]?.playerIds?.includes(playerId);
    const isInTeamB = player?.teamId === match.teamBId || state?.setup.playingXI[match.teamBId]?.playerIds?.includes(playerId);

    if (!isInTeamA && !isInTeamB && !state) {
      continue;
    }

    const opponentTeam = isInTeamA ? teamB : teamA;

    // Check if player batted or bowled in this match
    let matchBatting: PlayerMatchPerformance["batting"] | undefined = undefined;
    let matchBowling: PlayerMatchPerformance["bowling"] | undefined = undefined;
    let matchFielding: PlayerMatchPerformance["fielding"] | undefined = undefined;

    let playedThisMatch = false;

    if (state) {
      // 1. Batting in any innings
      for (const inn of state.innings) {
        const batterStat = inn.batters.find((b) => b.playerId === playerId);
        if (batterStat) {
          playedThisMatch = true;
          const isNotOut = !batterStat.out;
          matchBatting = {
            runs: batterStat.runs,
            balls: batterStat.balls,
            fours: batterStat.fours,
            sixes: batterStat.sixes,
            isNotOut,
            dismissalText: batterStat.out ? batterStat.dismissal : "Not Out",
            strikeRate: batterStat.strikeRate,
          };

          battingInnings++;
          totalRuns += batterStat.runs;
          totalBalls += batterStat.balls;
          totalFours += batterStat.fours;
          totalSixes += batterStat.sixes;
          if (isNotOut) totalNotOuts++;

          if (batterStat.runs >= 100) hundreds++;
          else if (batterStat.runs >= 50) fifties++;

          if (
            batterStat.runs > highestRuns ||
            (batterStat.runs === highestRuns && isNotOut && !highestIsNotOut)
          ) {
            highestRuns = batterStat.runs;
            highestIsNotOut = isNotOut;
          }
        }

        // 2. Bowling in any innings
        const bowlerStat = inn.bowlers.find((b) => b.playerId === playerId);
        if (bowlerStat) {
          playedThisMatch = true;
          matchBowling = {
            legalBalls: bowlerStat.legalBalls,
            oversText: oversText(bowlerStat.legalBalls),
            maidens: bowlerStat.maidens,
            runs: bowlerStat.runs,
            wickets: bowlerStat.wickets,
            economy: bowlerStat.economy,
          };

          bowlingInnings++;
          totalLegalBalls += bowlerStat.legalBalls;
          totalMaidens += bowlerStat.maidens;
          totalRunsConceded += bowlerStat.runs;
          totalWickets += bowlerStat.wickets;

          if (
            bowlerStat.wickets > bestWickets ||
            (bowlerStat.wickets === bestWickets && bowlerStat.runs < bestRunsConceded)
          ) {
            bestWickets = bowlerStat.wickets;
            bestRunsConceded = bowlerStat.runs;
          }
        }

        // 3. Fielding dismissals
        let matchCatches = 0;
        let matchRunOuts = 0;
        let matchStumpings = 0;

        for (const fow of inn.fallOfWickets) {
          if (fow.dismissal?.kind === "caught" && fow.dismissal.fielderId === playerId) {
            matchCatches++;
            totalCatches++;
            playedThisMatch = true;
          } else if (fow.dismissal?.kind === "runout" && fow.dismissal.fielderId === playerId) {
            matchRunOuts++;
            totalRunOuts++;
            playedThisMatch = true;
          } else if (fow.dismissal?.kind === "stumped" && fow.dismissal.fielderId === playerId) {
            matchStumpings++;
            totalStumpings++;
            playedThisMatch = true;
          }
        }

        if (matchCatches > 0 || matchRunOuts > 0 || matchStumpings > 0) {
          matchFielding = {
            catches: matchCatches,
            runOuts: matchRunOuts,
            stumpings: matchStumpings,
          };
        }
      }

      // Check for live player tracking
      if (match.status === "LIVE" && !currentLiveInfo) {
        const curInn = state.innings[state.currentInningsIndex];
        if (curInn) {
          const isStriker = curInn.strikerId === playerId;
          const isNonStriker = curInn.nonStrikerId === playerId;
          const isBowlingNow = curInn.currentBowlerId === playerId;
          const liveBatter = curInn.batters.find((b) => b.playerId === playerId);
          const liveBowler = curInn.bowlers.find((b) => b.playerId === playerId);

          if (isStriker || isNonStriker || isBowlingNow || liveBatter || liveBowler) {
            currentLiveInfo = {
              match,
              isBattingNow: isStriker || isNonStriker,
              isOnStrike: isStriker,
              isBowlingNow,
              liveBatterStat: liveBatter,
              liveBowlerStat: liveBowler,
            };
          }
        }
      }
    }

    if (playedThisMatch || match.status === "COMPLETED" || match.status === "LIVE") {
      if (playedThisMatch) {
        matchesCount++;
      }
      if (matchBatting || matchBowling || matchFielding) {
        matchHistory.push({
          matchId: match.id,
          matchNumber: match.matchNumber,
          opponentTeamName: opponentTeam?.name ?? "Opponent",
          opponentTeamLogo: opponentTeam?.logoUrl,
          matchDate: match.scheduledAt,
          status: match.status,
          resultText: match.resultText ?? state?.resultText,
          batting: matchBatting,
          bowling: matchBowling,
          fielding: matchFielding,
        });
      }
    }
  }

  const dismissedCount = battingInnings - totalNotOuts;
  const battingAverage = dismissedCount > 0 ? totalRuns / dismissedCount : totalRuns;
  const battingStrikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;

  const bowlingEconomy = totalLegalBalls > 0 ? (totalRunsConceded / totalLegalBalls) * 6 : 0;
  const bowlingAverage = totalWickets > 0 ? totalRunsConceded / totalWickets : 0;

  const hasData = battingInnings > 0 || bowlingInnings > 0 || totalCatches > 0 || matchHistory.length > 0;

  return {
    hasData,
    matchesPlayed: matchesCount,
    batting: {
      innings: battingInnings,
      runs: totalRuns,
      balls: totalBalls,
      highestScore: { runs: highestRuns, isNotOut: highestIsNotOut },
      fours: totalFours,
      sixes: totalSixes,
      fifties,
      hundreds,
      notOuts: totalNotOuts,
      average: battingAverage,
      strikeRate: battingStrikeRate,
    },
    bowling: {
      hasBowled: bowlingInnings > 0,
      innings: bowlingInnings,
      legalBalls: totalLegalBalls,
      oversText: oversText(totalLegalBalls),
      maidens: totalMaidens,
      runsConceded: totalRunsConceded,
      wickets: totalWickets,
      economy: bowlingEconomy,
      average: bowlingAverage,
      bestBowling: {
        wickets: bestWickets >= 0 ? bestWickets : 0,
        runs: bestRunsConceded < 999 ? bestRunsConceded : 0,
      },
    },
    fielding: {
      hasFielded: totalCatches > 0 || totalRunOuts > 0 || totalStumpings > 0,
      catches: totalCatches,
      runOuts: totalRunOuts,
      stumpings: totalStumpings,
    },
    matchHistory,
    currentLiveMatch: currentLiveInfo,
  };
}

// ── Match MVP Scoring ────────────────────────────────────────────────────────
export interface PlayerMVPScore {
  playerId: string;
  playerName: string;
  playerRole?: string;
  playerAvatar?: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
  totalPoints: number;
  breakdown: {
    battingPoints: number;
    bowlingPoints: number;
    fieldingPoints: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    oversText: string;
    runsConceded: number;
    catches: number;
    runOuts: number;
    stumpings: number;
  };
}

export function calculateMatchMVP(state?: MatchState): PlayerMVPScore[] {
  if (!state) return [];
  const map = new Map<string, PlayerMVPScore>();

  const getOrCreate = (playerId: string, teamId: string) => {
    if (!map.has(playerId)) {
      const p = lookup.player(playerId);
      const t = lookup.team(teamId);
      map.set(playerId, {
        playerId,
        playerName: p?.name ?? playerId,
        playerRole: p?.role,
        playerAvatar: p?.avatar,
        teamId,
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        totalPoints: 0,
        breakdown: {
          battingPoints: 0,
          bowlingPoints: 0,
          fieldingPoints: 0,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          wickets: 0,
          oversText: "0.0",
          runsConceded: 0,
          catches: 0,
          runOuts: 0,
          stumpings: 0,
        },
      });
    }
    return map.get(playerId)!;
  };

  state.innings.forEach((inn) => {
    // Batting
    inn.batters.forEach((b) => {
      const entry = getOrCreate(b.playerId, inn.battingTeamId);
      const batPts =
        b.runs * 1 +
        b.fours * 1 +
        b.sixes * 2 +
        (b.runs >= 50 ? 25 : b.runs >= 30 ? 10 : 0);
      entry.breakdown.runs += b.runs;
      entry.breakdown.balls += b.balls;
      entry.breakdown.fours += b.fours;
      entry.breakdown.sixes += b.sixes;
      entry.breakdown.battingPoints += batPts;
      entry.totalPoints += batPts;
    });

    // Bowling
    inn.bowlers.forEach((bw) => {
      const entry = getOrCreate(bw.playerId, inn.bowlingTeamId);
      const bowlPts =
        bw.wickets * 25 +
        bw.maidens * 20 +
        (bw.legalBalls >= 6 && bw.economy <= 6.0 ? 15 : 0);
      entry.breakdown.wickets += bw.wickets;
      entry.breakdown.oversText = oversText(bw.legalBalls);
      entry.breakdown.runsConceded += bw.runs;
      entry.breakdown.bowlingPoints += bowlPts;
      entry.totalPoints += bowlPts;
    });

    // Fielding
    inn.overGroups.forEach((og) => {
      og.balls.forEach((bs) => {
        const w = bs.delivery.wicket;
        if (w?.fielderId) {
          const entry = getOrCreate(w.fielderId, inn.bowlingTeamId);
          if (w.type === "Caught") {
            entry.breakdown.catches += 1;
            entry.breakdown.fieldingPoints += 10;
            entry.totalPoints += 10;
          } else if (w.type === "Run Out") {
            entry.breakdown.runOuts += 1;
            entry.breakdown.fieldingPoints += 15;
            entry.totalPoints += 15;
          } else if (w.type === "Stumped") {
            entry.breakdown.stumpings += 1;
            entry.breakdown.fieldingPoints += 15;
            entry.totalPoints += 15;
          }
        }
      });
    });
  });

  return Array.from(map.values())
    .filter((p) => p.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

// ── Tournament-Wide Stats & Leaderboards ────────────────────────────────────
export interface TournamentLeaderboards {
  orangeCap: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    teamShortName: string;
    runs: number;
    innings: number;
    balls: number;
    highestScore: string;
    fours: number;
    sixes: number;
    strikeRate: number;
    average: number;
  }>;
  purpleCap: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    teamShortName: string;
    wickets: number;
    innings: number;
    oversText: string;
    runsConceded: number;
    economy: number;
    bestBowling: string;
  }>;
  mvpLeaderboard: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    teamShortName: string;
    points: number;
    runs: number;
    wickets: number;
    catches: number;
  }>;
  mostSixes: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    teamShortName: string;
    sixes: number;
    innings: number;
    runs: number;
  }>;
  mostFours: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    teamShortName: string;
    fours: number;
    innings: number;
    runs: number;
  }>;
}

export function calculateTournamentLeaderboards(matches: Match[]): TournamentLeaderboards {
  const allPlayers = lookup.players();
  const playerStatsMap = new Map<string, ReturnType<typeof calculatePlayerPerformance>>();

  allPlayers.forEach((p) => {
    const stats = calculatePlayerPerformance(p.id, matches);
    if (stats.hasData) {
      playerStatsMap.set(p.id, stats);
    }
  });

  const orangeCap = Array.from(playerStatsMap.entries())
    .filter(([_, s]) => s.batting.runs > 0)
    .map(([pId, s]) => {
      const p = lookup.player(pId);
      const t = lookup.team(p?.teamId);
      const hs = `${s.batting.highestScore.runs}${s.batting.highestScore.isNotOut ? "*" : ""}`;
      return {
        playerId: pId,
        playerName: p?.name ?? pId,
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        runs: s.batting.runs,
        innings: s.batting.innings,
        balls: s.batting.balls,
        highestScore: hs,
        fours: s.batting.fours,
        sixes: s.batting.sixes,
        strikeRate: s.batting.strikeRate,
        average: s.batting.average,
      };
    })
    .sort((a, b) => b.runs - a.runs || b.strikeRate - a.strikeRate);

  const purpleCap = Array.from(playerStatsMap.entries())
    .filter(([_, s]) => s.bowling.wickets > 0 || s.bowling.legalBalls > 0)
    .map(([pId, s]) => {
      const p = lookup.player(pId);
      const t = lookup.team(p?.teamId);
      const bb = `${s.bowling.bestBowling.wickets}/${s.bowling.bestBowling.runs}`;
      return {
        playerId: pId,
        playerName: p?.name ?? pId,
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        wickets: s.bowling.wickets,
        innings: s.bowling.innings,
        oversText: s.bowling.oversText,
        runsConceded: s.bowling.runsConceded,
        economy: s.bowling.economy,
        bestBowling: bb,
      };
    })
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

  const mvpLeaderboard = Array.from(playerStatsMap.entries())
    .map(([pId, s]) => {
      const p = lookup.player(pId);
      const t = lookup.team(p?.teamId);
      const pts =
        s.batting.runs * 1 +
        s.batting.fours * 1 +
        s.batting.sixes * 2 +
        s.batting.fifties * 25 +
        s.batting.hundreds * 50 +
        s.bowling.wickets * 25 +
        s.bowling.maidens * 20 +
        s.fielding.catches * 10 +
        s.fielding.runOuts * 15 +
        s.fielding.stumpings * 15;

      return {
        playerId: pId,
        playerName: p?.name ?? pId,
        teamName: t?.name ?? "Team",
        teamShortName: t?.shortName ?? "TPL",
        points: pts,
        runs: s.batting.runs,
        wickets: s.bowling.wickets,
        catches: s.fielding.catches,
      };
    })
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points);

  const mostSixes = orangeCap
    .filter((item) => item.sixes > 0)
    .map((item) => ({
      playerId: item.playerId,
      playerName: item.playerName,
      teamName: item.teamName,
      teamShortName: item.teamShortName,
      sixes: item.sixes,
      innings: item.innings,
      runs: item.runs,
    }))
    .sort((a, b) => b.sixes - a.sixes || b.runs - a.runs);

  const mostFours = orangeCap
    .filter((item) => item.fours > 0)
    .map((item) => ({
      playerId: item.playerId,
      playerName: item.playerName,
      teamName: item.teamName,
      teamShortName: item.teamShortName,
      fours: item.fours,
      innings: item.innings,
      runs: item.runs,
    }))
    .sort((a, b) => b.fours - a.fours || b.runs - a.runs);

  return {
    orangeCap,
    purpleCap,
    mvpLeaderboard,
    mostSixes,
    mostFours,
  };
}
