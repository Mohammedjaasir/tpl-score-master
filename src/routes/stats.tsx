import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { calculateTournamentStats, formatStatDecimal } from "@/lib/scoring/statistics";
import { lookup } from "@/lib/repositories";
import { StatisticsMethodologyModal } from "@/components/public/StatisticsMethodologyModal";
import {
  BarChart2,
  Flame,
  Target,
  Trophy,
  Sparkles,
  Zap,
  Award,
  RefreshCw,
  AlertCircle,
  User,
  Shield,
  Star,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Hash,
} from "lucide-react";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

export function StatsPage() {
  usePrefetchCricketData();
  const [showMethodology, setShowMethodology] = useState(false);
  const { data: matches = [], isLoading: loadingMatches, isError, refetch } = useMatches();
  useTeams();

  const stats = useMemo(() => calculateTournamentStats(matches), [matches]);
  const completedCount = stats.completedMatchesCount;
  const totalMatches = stats.totalMatchesCount;
  const isLoading = loadingMatches && matches.length === 0;

  return (
    <AppShell title="Tournament Stats">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pt-4 pb-24 px-3 sm:px-6 overflow-x-hidden">
        {/* ══════════════════════════════════════════════════════════════════
            1. DASHBOARD HEADER
            ══════════════════════════════════════════════════════════════════ */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E5E5] pb-6">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="h-6 w-6 text-[#9A6A05]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9A6A05]">
                  OFFICIAL ACCOLADES & LEADERBOARDS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111] leading-tight font-display">
                TOURNAMENT STATS & AWARDS
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6368] font-bold uppercase tracking-wider mt-1">
                TPL 2026 Official Statistics, Accolades & Player Rankings
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-start md:self-center">
            {/* Matches Played Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#5F6368] uppercase tracking-wider leading-none">
                  MATCHES PLAYED
                </span>
                <span className="text-xs font-black text-[#111111] tabular-nums mt-0.5">
                  {completedCount} <span className="text-[#5F6368] font-medium">/ {totalMatches || 9} MATCHES</span>
                </span>
              </div>
            </div>

            {/* Methodology Modal Trigger */}
            <button
              onClick={() => setShowMethodology(true)}
              className="tap flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#D9A928]" />
              <span>How Stats Are Calculated</span>
            </button>
          </div>
        </header>

        {/* Methodology Modal */}
        <StatisticsMethodologyModal
          isOpen={showMethodology}
          onClose={() => setShowMethodology(false)}
        />

        {/* ══════════════════════════════════════════════════════════════════
            2. LOADING & ERROR STATES
            ══════════════════════════════════════════════════════════════════ */}
        {isLoading && (
          <div className="card-surface p-12 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl shadow-xs">
            <RefreshCw className="h-7 w-7 text-[#D9A928] animate-spin" />
            <p className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Aggregating Tournament Statistics...
            </p>
            <p className="text-xs text-[#5F6368]">
              Computing official awards from ball-by-ball tournament events.
            </p>
          </div>
        )}

        {isError && matches.length === 0 && !isLoading && (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl shadow-xs">
            <AlertCircle className="h-8 w-8 text-rose-600" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              UNABLE TO LOAD TOURNAMENT STATISTICS
            </p>
            <p className="text-xs text-[#5F6368] max-w-md">
              There was an issue fetching tournament data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            3. EMPTY STATE (WHEN NO COMPLETED MATCHES YET)
            ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && completedCount === 0 && (
          <div className="card-surface p-10 sm:p-16 flex flex-col items-center justify-center text-center gap-4 border border-[#E5E5E5] bg-white rounded-3xl shadow-xs">
            <div className="h-16 w-16 rounded-full bg-[#D9A928]/10 border border-[#D9A928]/30 flex items-center justify-center text-[#9A6A05]">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-[#111111]">
                NO STATISTICS AVAILABLE YET
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6368] font-medium mt-1 max-w-md mx-auto">
                Completed matches will populate tournament statistics, Orange Cap, Purple Cap, and individual awards.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/matches"
                className="tap px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-xs font-black text-[#D9A928] uppercase tracking-wider shadow-sm transition-all"
              >
                View Match Schedule
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            4. ACTIVE TOURNAMENT DASHBOARD (SINGLE-PAGE VERTICAL FLOW)
            ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && completedCount > 0 && (
          <div className="flex flex-col gap-10">
            {/* ── MVP / PLAYER OF THE TOURNAMENT HERO ──────────────────── */}
            {(stats.awards.playerOfTheTournament || stats.awards.currentMvpLeader) && (
              (() => {
                const isComplete = stats.awards.isTournamentCompleted;
                const heroPlayer = stats.awards.playerOfTheTournament ?? stats.awards.currentMvpLeader!;
                const heroHeading = isComplete ? "PLAYER OF THE TOURNAMENT" : "CURRENT MVP LEADER";
                const heroSubtext = isComplete ? "OFFICIAL TOURNAMENT CHAMPION AWARD" : "TOURNAMENT LEADER • PROVISIONAL";

                return (
                  <section className="bg-gradient-to-r from-[#141414] via-[#1A1812] to-[#121316] border-2 border-[#D9A928] rounded-3xl p-5 sm:p-7 shadow-xl text-white flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928] border border-[#D9A928]/40">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#D9A928]" />
                            {heroSubtext}
                          </span>
                          <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-white">
                            {heroHeading}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-full bg-[#D9A928] text-black font-black text-xs uppercase tracking-wider shadow-md">
                          {heroPlayer.mvpPoints} MVP PTS
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-black/60 border-2 border-[#D9A928] p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {heroPlayer.playerAvatar ? (
                            <img
                              src={heroPlayer.playerAvatar}
                              alt=""
                              className="h-full w-full object-cover rounded-xl"
                            />
                          ) : (
                            <User className="h-9 w-9 text-white/40" />
                          )}
                        </div>
                        <div>
                          <Link
                            to="/player/$playerId"
                            params={{ playerId: heroPlayer.playerId }}
                            className="text-lg sm:text-2xl font-black uppercase text-white hover:text-[#D9A928] transition-colors block leading-tight"
                          >
                            {heroPlayer.playerName}
                          </Link>
                          <p className="text-xs text-[#D9A928] font-bold mt-1 uppercase">
                            {heroPlayer.teamName} ({heroPlayer.teamShortName}) • {heroPlayer.playerRole ?? "All-Rounder"}
                          </p>
                          <p className="text-xs text-white/80 font-bold mt-1">
                            {heroPlayer.runs} Runs • {heroPlayer.wickets} Wickets • {heroPlayer.catches} Catches
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                          to="/player/$playerId"
                          params={{ playerId: heroPlayer.playerId }}
                          className="tap px-5 py-2.5 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-wider shadow-md transition-all"
                        >
                          View Full Profile
                        </Link>
                      </div>
                    </div>
                  </section>
                );
              })()
            )}

            {/* ══════════════════════════════════════════════════════════════
                5. PRIMARY AWARDS (ORANGE CAP & PURPLE CAP)
                2 Columns Desktop, 1 Column Mobile
                ══════════════════════════════════════════════════════════════ */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D9A928]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111]">
                    PRIMARY TOURNAMENT AWARDS
                  </h2>
                </div>
                <span className="text-[10px] font-black text-[#5F6368] uppercase tracking-widest">
                  OFFICIAL TPL 2026 CAPS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ── ORANGE CAP CARD ──────────────────────────────────── */}
                <AwardLeaderCard
                  awardTitle="ORANGE CAP"
                  awardSubtitle="LEADING RUN SCORER"
                  badgeIcon={<Flame className="h-4 w-4 text-orange-600" />}
                  badgeBg="bg-orange-500/10 border-orange-500/30 text-orange-700"
                  accentBorder="border-orange-400"
                  primaryColor="text-orange-600"
                  leader={stats.orangeCap[0]}
                  primaryStatValue={stats.orangeCap[0] ? `${stats.orangeCap[0].runs} RUNS` : "—"}
                  supportingStats={
                    stats.orangeCap[0]
                      ? [
                          `${stats.orangeCap[0].balls} Balls`,
                          `SR ${formatStatDecimal(stats.orangeCap[0].strikeRate)}`,
                          `Avg ${formatStatDecimal(stats.orangeCap[0].average)}`,
                          `${stats.orangeCap[0].fours}x4 · ${stats.orangeCap[0].sixes}x6`,
                        ]
                      : []
                  }
                  runnerUps={stats.orangeCap.slice(1, 5).map((entry) => ({
                    rank: entry.rank,
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    teamShortName: entry.teamShortName,
                    primaryMetric: `${entry.runs} R`,
                    secondaryMetric: `${entry.balls}b · SR ${formatStatDecimal(entry.strikeRate)}`,
                  }))}
                  emptyText="No batting statistics recorded yet."
                />

                {/* ── PURPLE CAP CARD ──────────────────────────────────── */}
                <AwardLeaderCard
                  awardTitle="PURPLE CAP"
                  awardSubtitle="LEADING WICKET TAKER"
                  badgeIcon={<Target className="h-4 w-4 text-purple-700" />}
                  badgeBg="bg-purple-500/10 border-purple-500/30 text-purple-700"
                  accentBorder="border-purple-400"
                  primaryColor="text-purple-700"
                  leader={stats.purpleCap[0] && stats.purpleCap[0].wickets > 0 ? stats.purpleCap[0] : undefined}
                  primaryStatValue={
                    stats.purpleCap[0] && stats.purpleCap[0].wickets > 0
                      ? `${stats.purpleCap[0].wickets} WICKETS`
                      : "—"
                  }
                  supportingStats={
                    stats.purpleCap[0] && stats.purpleCap[0].wickets > 0
                      ? [
                          `${stats.purpleCap[0].oversText} Overs`,
                          `Econ ${formatStatDecimal(stats.purpleCap[0].economy)}`,
                          `Best ${stats.purpleCap[0].bestBowling}`,
                          `${stats.purpleCap[0].dotBalls} Dots`,
                        ]
                      : []
                  }
                  runnerUps={stats.purpleCap
                    .filter((e) => e.wickets > 0)
                    .slice(1, 5)
                    .map((entry) => ({
                      rank: entry.rank,
                      playerId: entry.playerId,
                      playerName: entry.playerName,
                      teamShortName: entry.teamShortName,
                      primaryMetric: `${entry.wickets} W`,
                      secondaryMetric: `${entry.oversText} ov · Econ ${formatStatDecimal(entry.economy)}`,
                    }))}
                  emptyText="No bowling wickets recorded yet."
                />
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                6. OFFICIAL TOURNAMENT AWARDS & SECONDARY STATISTICS
                2 Columns Desktop, 1 Column Mobile (Zero horizontal tab scroll)
                ══════════════════════════════════════════════════════════════ */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#111111]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111]">
                    OFFICIAL TOURNAMENT AWARDS & BENCHMARKS
                  </h2>
                </div>
                <span className="text-[10px] font-black text-[#5F6368] uppercase tracking-widest">
                  CATEGORY LEADERS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. MOST SIXES */}
                <AwardLeaderCard
                  awardTitle="MOST SIXES"
                  awardSubtitle="MAXIMUMS CHAMPION"
                  badgeIcon={<Sparkles className="h-4 w-4 text-rose-600" />}
                  badgeBg="bg-rose-500/10 border-rose-500/30 text-rose-700"
                  primaryColor="text-rose-600"
                  leader={stats.mostSixes[0] && stats.mostSixes[0].sixes > 0 ? stats.mostSixes[0] : undefined}
                  primaryStatValue={
                    stats.mostSixes[0] && stats.mostSixes[0].sixes > 0
                      ? `${stats.mostSixes[0].sixes} SIXES`
                      : "—"
                  }
                  supportingStats={
                    stats.mostSixes[0] && stats.mostSixes[0].sixes > 0
                      ? [
                          `${stats.mostSixes[0].innings} Innings`,
                          `${stats.mostSixes[0].runs} Total Runs`,
                          `${stats.mostSixes[0].sixes * 6} Runs from 6s`,
                        ]
                      : []
                  }
                  runnerUps={stats.mostSixes
                    .filter((e) => e.sixes > 0)
                    .slice(1, 4)
                    .map((entry) => ({
                      rank: entry.rank,
                      playerId: entry.playerId,
                      playerName: entry.playerName,
                      teamShortName: entry.teamShortName,
                      primaryMetric: `${entry.sixes} Sixes`,
                      secondaryMetric: `${entry.innings} inn · ${entry.runs} runs`,
                    }))}
                  emptyText="No sixes recorded yet."
                />

                {/* 2. MOST FOURS */}
                <AwardLeaderCard
                  awardTitle="MOST FOURS"
                  awardSubtitle="BOUNDARY SPECIALIST"
                  badgeIcon={<Zap className="h-4 w-4 text-amber-600" />}
                  badgeBg="bg-amber-500/10 border-amber-500/30 text-amber-700"
                  primaryColor="text-amber-600"
                  leader={stats.mostFours[0] && stats.mostFours[0].fours > 0 ? stats.mostFours[0] : undefined}
                  primaryStatValue={
                    stats.mostFours[0] && stats.mostFours[0].fours > 0
                      ? `${stats.mostFours[0].fours} FOURS`
                      : "—"
                  }
                  supportingStats={
                    stats.mostFours[0] && stats.mostFours[0].fours > 0
                      ? [
                          `${stats.mostFours[0].innings} Innings`,
                          `${stats.mostFours[0].runs} Total Runs`,
                          `${stats.mostFours[0].fours * 4} Runs from 4s`,
                        ]
                      : []
                  }
                  runnerUps={stats.mostFours
                    .filter((e) => e.fours > 0)
                    .slice(1, 4)
                    .map((entry) => ({
                      rank: entry.rank,
                      playerId: entry.playerId,
                      playerName: entry.playerName,
                      teamShortName: entry.teamShortName,
                      primaryMetric: `${entry.fours} Fours`,
                      secondaryMetric: `${entry.innings} inn · ${entry.runs} runs`,
                    }))}
                  emptyText="No fours recorded yet."
                />

                {/* 3. BEST STRIKE RATE */}
                <AwardLeaderCard
                  awardTitle="BEST STRIKE RATE"
                  awardSubtitle="POWER HITTER (QUALIFIED)"
                  badgeIcon={<Zap className="h-4 w-4 text-blue-600" />}
                  badgeBg="bg-blue-500/10 border-blue-500/30 text-blue-700"
                  primaryColor="text-blue-700"
                  leader={stats.bestStrikers[0]}
                  primaryStatValue={
                    stats.bestStrikers[0] ? `SR ${formatStatDecimal(stats.bestStrikers[0].strikeRate)}` : "—"
                  }
                  supportingStats={
                    stats.bestStrikers[0]
                      ? [
                          `${stats.bestStrikers[0].runs} Runs`,
                          `${stats.bestStrikers[0].balls} Balls`,
                          `${stats.bestStrikers[0].fours}x4 · ${stats.bestStrikers[0].sixes}x6`,
                        ]
                      : []
                  }
                  runnerUps={stats.bestStrikers.slice(1, 4).map((entry) => ({
                    rank: entry.rank,
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    teamShortName: entry.teamShortName,
                    primaryMetric: `SR ${formatStatDecimal(entry.strikeRate)}`,
                    secondaryMetric: `${entry.runs} runs (${entry.balls}b)`,
                  }))}
                  emptyText="No qualified batter yet (Min 15 balls)."
                />

                {/* 4. BEST BOWLING SPELL */}
                <AwardLeaderCard
                  awardTitle="BEST BOWLING SPELL"
                  awardSubtitle="MATCH DEFINING SPELL"
                  badgeIcon={<Award className="h-4 w-4 text-purple-700" />}
                  badgeBg="bg-purple-500/10 border-purple-500/30 text-purple-700"
                  primaryColor="text-purple-700"
                  leader={
                    stats.bestBowlingSpells[0] && stats.bestBowlingSpells[0].wickets > 0
                      ? stats.bestBowlingSpells[0]
                      : undefined
                  }
                  primaryStatValue={
                    stats.bestBowlingSpells[0] && stats.bestBowlingSpells[0].wickets > 0
                      ? `${stats.bestBowlingSpells[0].figures} (${stats.bestBowlingSpells[0].oversText} ov)`
                      : "—"
                  }
                  supportingStats={
                    stats.bestBowlingSpells[0] && stats.bestBowlingSpells[0].wickets > 0
                      ? [
                          `vs ${stats.bestBowlingSpells[0].opponentTeamShortName || "Opponent"}`,
                          `Match #${stats.bestBowlingSpells[0].matchNumber}`,
                          `Econ ${formatStatDecimal(stats.bestBowlingSpells[0].economy)}`,
                          `${stats.bestBowlingSpells[0].dotBalls} Dots`,
                        ]
                      : []
                  }
                  runnerUps={stats.bestBowlingSpells
                    .filter((e) => e.wickets > 0)
                    .slice(1, 4)
                    .map((entry) => ({
                      rank: entry.rank,
                      playerId: entry.playerId,
                      playerName: entry.playerName,
                      teamShortName: entry.teamShortName,
                      primaryMetric: entry.figures,
                      secondaryMetric: `vs ${entry.opponentTeamShortName || "Opponent"} (M#${entry.matchNumber})`,
                    }))}
                  emptyText="No bowling spell recorded yet."
                />

                {/* 5. BEST BOWLING ECONOMY */}
                <AwardLeaderCard
                  awardTitle="BEST BOWLING ECONOMY"
                  awardSubtitle="MOST MISERLY SPELL (QUALIFIED)"
                  badgeIcon={<Target className="h-4 w-4 text-emerald-600" />}
                  badgeBg="bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                  primaryColor="text-emerald-700"
                  leader={stats.bestEconomies[0]}
                  primaryStatValue={
                    stats.bestEconomies[0] ? `ECON ${formatStatDecimal(stats.bestEconomies[0].economy)}` : "—"
                  }
                  supportingStats={
                    stats.bestEconomies[0]
                      ? [
                          `${stats.bestEconomies[0].oversText} Overs`,
                          `${stats.bestEconomies[0].runsConceded} Runs`,
                          `${stats.bestEconomies[0].wickets} Wickets`,
                          `${stats.bestEconomies[0].dotBalls} Dots`,
                        ]
                      : []
                  }
                  runnerUps={stats.bestEconomies.slice(1, 4).map((entry) => ({
                    rank: entry.rank,
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    teamShortName: entry.teamShortName,
                    primaryMetric: `Econ ${formatStatDecimal(entry.economy)}`,
                    secondaryMetric: `${entry.runsConceded}r in ${entry.oversText} ov`,
                  }))}
                  emptyText="No qualified bowler yet (Min 2.0 overs)."
                />

                {/* 6. MOST DOT BALLS */}
                <AwardLeaderCard
                  awardTitle="MOST DOT BALLS"
                  awardSubtitle="PRESSURE BUILDER"
                  badgeIcon={<CircleDot className="h-4 w-4 text-slate-700" />}
                  badgeBg="bg-slate-500/10 border-slate-500/30 text-slate-700"
                  primaryColor="text-slate-800"
                  leader={stats.mostDotBalls[0] && stats.mostDotBalls[0].dotBalls > 0 ? stats.mostDotBalls[0] : undefined}
                  primaryStatValue={
                    stats.mostDotBalls[0] && stats.mostDotBalls[0].dotBalls > 0
                      ? `${stats.mostDotBalls[0].dotBalls} DOT BALLS`
                      : "—"
                  }
                  supportingStats={
                    stats.mostDotBalls[0] && stats.mostDotBalls[0].dotBalls > 0
                      ? [
                          `${stats.mostDotBalls[0].oversText} Overs`,
                          `${stats.mostDotBalls[0].wickets} Wickets`,
                          `Dot %: ${((stats.mostDotBalls[0].dotBalls / Math.max(1, stats.mostDotBalls[0].legalBalls)) * 100).toFixed(0)}%`,
                        ]
                      : []
                  }
                  runnerUps={stats.mostDotBalls
                    .filter((e) => e.dotBalls > 0)
                    .slice(1, 4)
                    .map((entry) => ({
                      rank: entry.rank,
                      playerId: entry.playerId,
                      playerName: entry.playerName,
                      teamShortName: entry.teamShortName,
                      primaryMetric: `${entry.dotBalls} Dots`,
                      secondaryMetric: `${entry.oversText} ov · ${entry.wickets} wkts`,
                    }))}
                  emptyText="No dot balls recorded yet."
                />

                {/* 7. BEST ALL-ROUNDER */}
                <AwardLeaderCard
                  awardTitle="BEST ALL-ROUNDER"
                  awardSubtitle="DUAL IMPACT PERFORMER"
                  badgeIcon={<Star className="h-4 w-4 text-emerald-600" />}
                  badgeBg="bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                  primaryColor="text-emerald-700"
                  leader={stats.bestAllRounders[0]}
                  primaryStatValue={
                    stats.bestAllRounders[0] ? `${stats.bestAllRounders[0].allRounderIndex} INDEX` : "—"
                  }
                  supportingStats={
                    stats.bestAllRounders[0]
                      ? [
                          `${stats.bestAllRounders[0].runs} Runs`,
                          `${stats.bestAllRounders[0].wickets} Wickets`,
                          `${stats.bestAllRounders[0].catches} Catches`,
                          `Bat SR ${formatStatDecimal(stats.bestAllRounders[0].battingStrikeRate)}`,
                        ]
                      : []
                  }
                  runnerUps={stats.bestAllRounders.slice(1, 4).map((entry) => ({
                    rank: entry.rank,
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    teamShortName: entry.teamShortName,
                    primaryMetric: `${entry.allRounderIndex} Pts`,
                    secondaryMetric: `${entry.runs} runs · ${entry.wickets} wkts`,
                  }))}
                  emptyText="No all-rounder data recorded yet."
                />

                {/* 8. BEST FIELDER */}
                <AwardLeaderCard
                  awardTitle="BEST FIELDER"
                  awardSubtitle="SAFE HANDS CHAMPION"
                  badgeIcon={<Shield className="h-4 w-4 text-blue-600" />}
                  badgeBg="bg-blue-500/10 border-blue-500/30 text-blue-700"
                  primaryColor="text-blue-700"
                  leader={stats.bestFielders[0] && stats.bestFielders[0].totalDismissals > 0 ? stats.bestFielders[0] : undefined}
                  primaryStatValue={
                    stats.bestFielders[0] && stats.bestFielders[0].totalDismissals > 0
                      ? `${stats.bestFielders[0].totalDismissals} DISMISSALS`
                      : "—"
                  }
                  supportingStats={
                    stats.bestFielders[0] && stats.bestFielders[0].totalDismissals > 0
                      ? [
                          `${stats.bestFielders[0].catches} Catches`,
                          `${stats.bestFielders[0].runOuts} Run Outs`,
                          `${stats.bestFielders[0].stumpings} Stumpings`,
                        ]
                      : []
                  }
                  runnerUps={stats.bestFielders
                    .filter((e) => e.totalDismissals > 0)
                    .slice(1, 4)
                    .map((entry) => ({
                      rank: entry.rank,
                      playerId: entry.playerId,
                      playerName: entry.playerName,
                      teamShortName: entry.teamShortName,
                      primaryMetric: `${entry.totalDismissals} Dism`,
                      secondaryMetric: `${entry.catches} catches · ${entry.runOuts} ro`,
                    }))}
                  emptyText="No fielding dismissals recorded yet."
                />

                {/* 9. HIGHEST INDIVIDUAL SCORE */}
                {stats.awards.highestIndividualScore && (
                  <div className="col-span-1 md:col-span-2 bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20">
                          <Flame className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#9A6A05]">
                            RECORD PERFORMANCE
                          </span>
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111]">
                            HIGHEST INDIVIDUAL SCORE IN AN INNINGS
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center overflow-hidden shrink-0">
                          <User className="h-6 w-6 text-[#9A6A05]" />
                        </div>
                        <div>
                          <Link
                            to="/player/$playerId"
                            params={{ playerId: stats.awards.highestIndividualScore.playerId }}
                            className="text-base sm:text-lg font-black uppercase text-[#111111] hover:text-[#9A6A05] hover:underline"
                          >
                            {stats.awards.highestIndividualScore.playerName}
                          </Link>
                          <p className="text-xs text-[#5F6368] font-bold mt-0.5">
                            {stats.awards.highestIndividualScore.teamShortName} vs{" "}
                            {stats.awards.highestIndividualScore.opponentTeamName} (Match #{stats.awards.highestIndividualScore.matchNumber})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:text-right">
                        <div>
                          <p className="text-2xl sm:text-3xl font-black text-orange-600 tabular-nums">
                            {stats.awards.highestIndividualScore.runs}
                            {stats.awards.highestIndividualScore.isNotOut ? "*" : ""}
                            <span className="text-xs text-[#5F6368] font-bold ml-1 uppercase">
                              ({stats.awards.highestIndividualScore.balls}b)
                            </span>
                          </p>
                          <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                            SR {((stats.awards.highestIndividualScore.runs / Math.max(1, stats.awards.highestIndividualScore.balls)) * 100).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                7. TOURNAMENT RECORD SUMMARY
                ══════════════════════════════════════════════════════════════ */}
            <section className="bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-[#9A6A05]" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111]">
                    TPL 2026 TOURNAMENT STATISTICAL SUMMARY
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#5F6368] uppercase">
                  {completedCount} Completed Matches
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368]">
                    TOTAL RUNS SCORED
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-[#111111] tabular-nums mt-1">
                    {stats.tournamentRecords.totalRunsScored}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368]">
                    TOTAL WICKETS TAKEN
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-purple-700 tabular-nums mt-1">
                    {stats.tournamentRecords.totalWicketsTaken}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368]">
                    TOTAL SIXES HIT
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-rose-600 tabular-nums mt-1">
                    {stats.tournamentRecords.totalSixesHit}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368]">
                    TOTAL FOURS HIT
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-amber-600 tabular-nums mt-1">
                    {stats.tournamentRecords.totalFoursHit}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REUSABLE AWARD LEADER CARD COMPONENT (RESPONSIVE 2-COL / 1-COL)
// ════════════════════════════════════════════════════════════════════════════

interface RunnerUpItem {
  rank: number;
  playerId: string;
  playerName: string;
  teamShortName: string;
  primaryMetric: string;
  secondaryMetric?: string;
}

interface AwardLeaderCardProps {
  awardTitle: string;
  awardSubtitle: string;
  badgeIcon: React.ReactNode;
  badgeBg: string;
  accentBorder?: string;
  primaryColor?: string;
  leader?: {
    playerId: string;
    playerName: string;
    playerAvatar?: string;
    playerRole?: string;
    teamName: string;
    teamShortName: string;
  };
  primaryStatValue: string;
  supportingStats: string[];
  runnerUps?: RunnerUpItem[];
  emptyText: string;
}

function AwardLeaderCard({
  awardTitle,
  awardSubtitle,
  badgeIcon,
  badgeBg,
  accentBorder = "border-[#E5E5E5]",
  primaryColor = "text-[#111111]",
  leader,
  primaryStatValue,
  supportingStats,
  runnerUps = [],
  emptyText,
}: AwardLeaderCardProps) {
  const [showAllRunnerUps, setShowAllRunnerUps] = useState(false);

  return (
    <div
      className={`bg-white border ${accentBorder} rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all`}
    >
      {/* ── Card Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-xl border ${badgeBg} flex items-center justify-center shrink-0`}>
            {badgeIcon}
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5F6368] block">
              {awardSubtitle}
            </span>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111]">
              {awardTitle}
            </h3>
          </div>
        </div>

        {leader && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#111111] text-[#D9A928]">
            #1 LEADER
          </span>
        )}
      </div>

      {/* ── Leader Profile & Highlight ───────────────────────────────── */}
      {leader ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {leader.playerAvatar ? (
                  <img src={leader.playerAvatar} alt="" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <User className="h-6 w-6 text-[#5F6368]" />
                )}
              </div>
              <div className="min-w-0">
                <Link
                  to="/player/$playerId"
                  params={{ playerId: leader.playerId }}
                  className="text-sm sm:text-base font-black uppercase text-[#111111] hover:text-[#9A6A05] transition-colors truncate block leading-tight"
                >
                  {leader.playerName}
                </Link>
                <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate mt-0.5">
                  {leader.teamName} <span className="text-[#111111]">({leader.teamShortName})</span>
                </p>
                {leader.playerRole && (
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider text-[#9A6A05] bg-[#D9A928]/15 px-2 py-0.5 rounded mt-1">
                    {leader.playerRole}
                  </span>
                )}
              </div>
            </div>

            {/* Primary Stat Highlight */}
            <div className="text-right shrink-0">
              <p className={`text-xl sm:text-2xl font-black ${primaryColor} tabular-nums leading-none`}>
                {primaryStatValue}
              </p>
              <span className="text-[9px] font-bold uppercase text-[#5F6368] tracking-wider block mt-1">
                LEADING
              </span>
            </div>
          </div>

          {/* Supporting Metric Badges */}
          {supportingStats.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {supportingStats.map((stat, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold text-[#111111] bg-[#FAFAF8] border border-[#E5E5E5] px-2.5 py-1 rounded-lg"
                >
                  {stat}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-xs text-[#5F6368] italic font-medium">{emptyText}</p>
        </div>
      )}

      {/* ── Runner-ups / Contenders (Inline Table) ────────────────────── */}
      {runnerUps.length > 0 && (
        <div className="border-t border-[#F0F0EE] pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#5F6368] tracking-wider">
              TOP CONTENDERS
            </span>
            {runnerUps.length > 2 && (
              <button
                onClick={() => setShowAllRunnerUps((prev) => !prev)}
                className="tap text-[10px] font-bold text-[#9A6A05] hover:underline flex items-center gap-1 uppercase"
              >
                <span>{showAllRunnerUps ? "Show Less" : `View All (${runnerUps.length})`}</span>
                {showAllRunnerUps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          <div className="flex flex-col divide-y divide-[#F5F5F3]">
            {(showAllRunnerUps ? runnerUps : runnerUps.slice(0, 2)).map((ru) => (
              <div key={ru.playerId} className="flex items-center justify-between py-1.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-black text-[#5F6368] w-4 text-center tabular-nums">
                    #{ru.rank}
                  </span>
                  <Link
                    to="/player/$playerId"
                    params={{ playerId: ru.playerId }}
                    className="font-bold text-[#111111] hover:text-[#9A6A05] truncate block"
                  >
                    {ru.playerName}
                  </Link>
                  <span className="text-[10px] font-medium text-[#5F6368] uppercase shrink-0">
                    ({ru.teamShortName})
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-[#111111] tabular-nums">{ru.primaryMetric}</span>
                  {ru.secondaryMetric && (
                    <span className="hidden sm:inline text-[10px] text-[#5F6368] ml-1.5">
                      {ru.secondaryMetric}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
