import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams } from "@/hooks/useCricketData";
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
  Activity,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

type StatTab =
  | "awards"
  | "orange"
  | "purple"
  | "strikers"
  | "averages"
  | "boundaries"
  | "allrounders"
  | "fielding"
  | "mvp";

function StatsPage() {
  const [activeTab, setActiveTab] = useState<StatTab>("awards");
  const [showMethodology, setShowMethodology] = useState(false);
  const { data: matches = [], isLoading: loadingMatches, isError, refetch } = useMatches();
  useTeams();

  const stats = useMemo(() => calculateTournamentStats(matches), [matches]);
  const completedCount = stats.completedMatchesCount;
  const isLoading = loadingMatches && matches.length === 0;

  return (
    <AppShell title="Tournament Stats">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 pt-2 pb-16 px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-[#9A6A05]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111]">
                TOURNAMENT STATS & AWARDS
              </h1>
              <p className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider">
                TPL 2026 Official Statistics, Accolades & Player Rankings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMethodology(true)}
              className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#222222] text-[10px] font-black text-[#D9A928] uppercase tracking-wider shadow-xs transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              <span>How Stats Are Calculated</span>
            </button>

            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-black text-[#5F6368] uppercase shadow-xs">
              {completedCount} Completed {completedCount === 1 ? "Match" : "Matches"}
            </span>
          </div>
        </div>

        {/* Methodology Modal */}
        <StatisticsMethodologyModal
          isOpen={showMethodology}
          onClose={() => setShowMethodology(false)}
        />

        {/* ── Category Navigation Tabs ───────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "awards", label: "Official Awards", icon: Trophy },
            { id: "orange", label: "Orange Cap", icon: Flame },
            { id: "purple", label: "Purple Cap", icon: Target },
            { id: "strikers", label: "Best Strikers", icon: Zap },
            { id: "averages", label: "Top Averages", icon: Activity },
            { id: "boundaries", label: "Boundaries (6s/4s)", icon: Sparkles },
            { id: "allrounders", label: "All-Rounders", icon: Star },
            { id: "fielding", label: "Fielding", icon: Shield },
            { id: "mvp", label: "Tournament MVP", icon: Award },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StatTab)}
                className={`tap shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#111111] text-[#D9A928] shadow-md"
                    : "bg-white text-[#5F6368] hover:text-[#111111] border border-[#E5E5E5]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card-surface p-12 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
            <p className="text-xs font-bold text-[#5F6368]">Aggregating tournament statistics from match events...</p>
          </div>
        )}

        {/* Error State */}
        {isError && matches.length === 0 && (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <AlertCircle className="h-8 w-8 text-[#D9A928]" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              Unable to load statistics right now
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

        {/* ── TAB 0: OFFICIAL TOURNAMENT AWARDS SHOWCASE ───────────────────── */}
        {!isLoading && activeTab === "awards" && (
          <div className="flex flex-col gap-6">
            {/* Hero Man of the Tournament */}
            {stats.awards.manOfTheTournament ? (
              <div className="bg-gradient-to-r from-[#1A1810] via-black to-[#121316] border-2 border-[#D9A928] rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928]">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-[#D9A928]" />
                        OFFICIAL TOURNAMENT AWARDS
                      </span>
                      <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-white">
                        MAN OF THE TOURNAMENT
                      </h2>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#D9A928] text-black font-black text-xs shadow-md">
                    {stats.awards.manOfTheTournament.mvpPoints} MVP Pts
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-black/60 border-2 border-[#D9A928] p-1 flex items-center justify-center overflow-hidden shrink-0">
                      {stats.awards.manOfTheTournament.playerAvatar ? (
                        <img
                          src={stats.awards.manOfTheTournament.playerAvatar}
                          alt=""
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <User className="h-10 w-10 text-white/50" />
                      )}
                    </div>
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.manOfTheTournament.playerId }}
                        className="text-lg sm:text-2xl font-black uppercase text-white hover:text-[#D9A928] hover:underline block"
                      >
                        {stats.awards.manOfTheTournament.playerName}
                      </Link>
                      <p className="text-xs text-[#D9A928] font-bold mt-0.5">
                        {stats.awards.manOfTheTournament.teamName} ({stats.awards.manOfTheTournament.teamShortName}) • {stats.awards.manOfTheTournament.playerRole ?? "All-Rounder"}
                      </p>
                      <p className="text-xs text-white/80 font-extrabold mt-1">
                        {stats.awards.manOfTheTournament.runs} runs • {stats.awards.manOfTheTournament.wickets} wickets • {stats.awards.manOfTheTournament.catches} catches
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.awards.manOfTheTournament.playerId }}
                      className="tap px-5 py-2.5 rounded-xl bg-[#D9A928] text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#E5B537]"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-surface p-8 bg-white border border-[#E5E5E5] rounded-3xl text-center text-xs font-bold text-[#5F6368] italic">
                NO COMPLETED MATCHES YET TO CALCULATE TOURNAMENT AWARDS.
              </div>
            )}

            {/* Awards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Orange Cap */}
              <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Orange Cap (Best Batter)
                  </h3>
                </div>
                {stats.awards.orangeCapWinner ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.orangeCapWinner.playerId }}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                      >
                        {stats.awards.orangeCapWinner.playerName}
                      </Link>
                      <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                        {stats.awards.orangeCapWinner.teamShortName} • Avg {formatStatDecimal(stats.awards.orangeCapWinner.average)} • SR {formatStatDecimal(stats.awards.orangeCapWinner.strikeRate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-orange-600 tabular-nums">
                        {stats.awards.orangeCapWinner.runs}
                      </p>
                      <p className="text-[9px] font-bold text-[#5F6368] uppercase">Runs</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-2">No batting data yet.</p>
                )}
              </div>

              {/* 2. Purple Cap */}
              <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                  <Target className="h-4 w-4 text-purple-700" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Purple Cap (Best Bowler)
                  </h3>
                </div>
                {stats.awards.purpleCapWinner ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.purpleCapWinner.playerId }}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                      >
                        {stats.awards.purpleCapWinner.playerName}
                      </Link>
                      <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                        {stats.awards.purpleCapWinner.teamShortName} • Econ {formatStatDecimal(stats.awards.purpleCapWinner.economy)} • Best {stats.awards.purpleCapWinner.bestBowling}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-purple-700 tabular-nums">
                        {stats.awards.purpleCapWinner.wickets}
                      </p>
                      <p className="text-[9px] font-bold text-[#5F6368] uppercase">Wickets</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-2">No bowling data yet.</p>
                )}
              </div>

              {/* 3. Best Striker */}
              <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                  <Zap className="h-4 w-4 text-[#D9A928]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Best Striker (Qualified)
                  </h3>
                </div>
                {stats.awards.bestStriker ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.bestStriker.playerId }}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                      >
                        {stats.awards.bestStriker.playerName}
                      </Link>
                      <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                        {stats.awards.bestStriker.teamShortName} • {stats.awards.bestStriker.runs} runs ({stats.awards.bestStriker.balls} balls)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#111111] tabular-nums">
                        {formatStatDecimal(stats.awards.bestStriker.strikeRate)}
                      </p>
                      <p className="text-[9px] font-bold text-[#5F6368] uppercase">Strike Rate</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-2">No qualified striker yet.</p>
                )}
              </div>

              {/* 4. Best All-Rounder */}
              <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                  <Star className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Best All-Rounder
                  </h3>
                </div>
                {stats.awards.bestAllRounder ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.bestAllRounder.playerId }}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                      >
                        {stats.awards.bestAllRounder.playerName}
                      </Link>
                      <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                        {stats.awards.bestAllRounder.teamShortName} • {stats.awards.bestAllRounder.runs} runs • {stats.awards.bestAllRounder.wickets} wkts
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-700 tabular-nums">
                        {stats.awards.bestAllRounder.allRounderIndex}
                      </p>
                      <p className="text-[9px] font-bold text-[#5F6368] uppercase">Index</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-2">No all-rounder data yet.</p>
                )}
              </div>

              {/* 5. Best Fielder */}
              <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Best Fielder
                  </h3>
                </div>
                {stats.awards.bestFielder ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.bestFielder.playerId }}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                      >
                        {stats.awards.bestFielder.playerName}
                      </Link>
                      <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                        {stats.awards.bestFielder.teamShortName} • {stats.awards.bestFielder.catches} catches • {stats.awards.bestFielder.runOuts} run outs
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-blue-700 tabular-nums">
                        {stats.awards.bestFielder.totalDismissals}
                      </p>
                      <p className="text-[9px] font-bold text-[#5F6368] uppercase">Dismissals</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-2">No fielding dismissals recorded yet.</p>
                )}
              </div>

              {/* 6. Highest Individual Score */}
              <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                  <Flame className="h-4 w-4 text-[#D9A928]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    Highest Individual Score
                  </h3>
                </div>
                {stats.awards.highestIndividualScore ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: stats.awards.highestIndividualScore.playerId }}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                      >
                        {stats.awards.highestIndividualScore.playerName}
                      </Link>
                      <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                        vs {stats.awards.highestIndividualScore.opponentTeamName} (Match #{stats.awards.highestIndividualScore.matchNumber})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#111111] tabular-nums">
                        {stats.awards.highestIndividualScore.runs}
                        {stats.awards.highestIndividualScore.isNotOut ? "*" : ""}
                      </p>
                      <p className="text-[9px] font-bold text-[#5F6368] uppercase">
                        ({stats.awards.highestIndividualScore.balls}b)
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-2">No innings scores yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 1: ORANGE CAP (MOST RUNS) ─────────────────────────────── */}
        {!isLoading && activeTab === "orange" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    ORANGE CAP LEADERBOARD
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Top run scorers in TPL 2026
                  </p>
                </div>
              </div>
            </div>

            {stats.orangeCap.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">BATTER</th>
                      <th className="px-3 py-3 text-right">INN</th>
                      <th className="px-3 py-3 text-right font-black text-[#111111]">RUNS</th>
                      <th className="px-3 py-3 text-right">HS</th>
                      <th className="px-3 py-3 text-right">SR</th>
                      <th className="px-3 py-3 text-right">AVG</th>
                      <th className="px-3 py-3 text-right">4s</th>
                      <th className="px-3 py-3 text-right">6s</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {stats.orangeCap.map((b, idx) => (
                      <tr
                        key={b.playerId}
                        className={`hover:bg-[#FAFAF8] transition-colors ${
                          idx === 0 ? "bg-orange-50/40" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              idx === 0
                                ? "bg-orange-500 text-white shadow-xs"
                                : "text-[#5F6368]"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            to="/players/$playerId"
                            params={{ playerId: b.playerId }}
                            className="font-extrabold text-[#111111] hover:text-[#D9A928] hover:underline block"
                          >
                            {b.playerName}
                          </Link>
                          <span className="text-[10px] text-[#5F6368] font-bold uppercase">
                            {b.teamName}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.innings}</td>
                        <td className="px-3 py-3.5 text-right font-black text-[#111111] tabular-nums text-sm bg-orange-500/5">{b.runs}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.highestScore}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{formatStatDecimal(b.strikeRate)}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{formatStatDecimal(b.average)}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.fours}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.sixes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-bold text-[#5F6368] italic">
                NO TOURNAMENT STATS AVAILABLE YET.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: PURPLE CAP (MOST WICKETS) ───────────────────────────── */}
        {!isLoading && activeTab === "purple" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-700" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    PURPLE CAP LEADERBOARD
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Top wicket takers in TPL 2026
                  </p>
                </div>
              </div>
            </div>

            {stats.purpleCap.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">BOWLER</th>
                      <th className="px-3 py-3 text-right">INN</th>
                      <th className="px-3 py-3 text-right font-black text-[#111111]">WKTS</th>
                      <th className="px-3 py-3 text-right">OVERS</th>
                      <th className="px-3 py-3 text-right">RUNS</th>
                      <th className="px-3 py-3 text-right">ECON</th>
                      <th className="px-3 py-3 text-right">AVG</th>
                      <th className="px-3 py-3 text-right">BBI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {stats.purpleCap.map((b, idx) => (
                      <tr
                        key={b.playerId}
                        className={`hover:bg-[#FAFAF8] transition-colors ${
                          idx === 0 ? "bg-purple-50/40" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              idx === 0
                                ? "bg-purple-600 text-white shadow-xs"
                                : "text-[#5F6368]"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            to="/players/$playerId"
                            params={{ playerId: b.playerId }}
                            className="font-extrabold text-[#111111] hover:text-[#D9A928] hover:underline block"
                          >
                            {b.playerName}
                          </Link>
                          <span className="text-[10px] text-[#5F6368] font-bold uppercase">
                            {b.teamName}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.innings}</td>
                        <td className="px-3 py-3.5 text-right font-black text-[#9A6A05] tabular-nums text-sm bg-[#D9A928]/10">{b.wickets}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.oversText}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.runsConceded}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{formatStatDecimal(b.economy)}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{formatStatDecimal(b.average)}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.bestBowling}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-bold text-[#5F6368] italic">
                NO TOURNAMENT STATS AVAILABLE YET.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: BEST STRIKERS ────────────────────────────────────────── */}
        {!isLoading && activeTab === "strikers" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#9A6A05]" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    HIGHEST BATTING STRIKE RATES
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Minimum 15 balls faced qualification
                  </p>
                </div>
              </div>
            </div>

            {stats.bestStrikers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">BATTER</th>
                      <th className="px-3 py-3 text-right">BALLS</th>
                      <th className="px-3 py-3 text-right">RUNS</th>
                      <th className="px-4 py-3 text-right font-black text-[#111111] bg-[#D9A928]/15">STRIKE RATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {stats.bestStrikers.map((b, idx) => (
                      <tr key={b.playerId} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">{idx + 1}</td>
                        <td className="px-4 py-3.5 font-extrabold text-[#111111]">
                          <Link to="/players/$playerId" params={{ playerId: b.playerId }} className="hover:underline">
                            {b.playerName}
                          </Link>
                          <span className="text-[10px] text-[#5F6368] font-bold uppercase block">{b.teamShortName}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.balls}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.runs}</td>
                        <td className="px-4 py-3.5 text-right font-black text-[#111111] tabular-nums text-sm bg-[#D9A928]/10">
                          {formatStatDecimal(b.strikeRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-bold text-[#5F6368] italic">
                NO BATTERS HAVE MET THE 15 BALLS MINIMUM QUALIFICATION THRESHOLD YET.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: TOP AVERAGES ────────────────────────────────────────── */}
        {!isLoading && activeTab === "averages" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batting Average */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-[#FAFAF8] border-b border-[#E5E5E5]">
                <h3 className="text-xs font-black uppercase text-[#111111]">Best Batting Average</h3>
                <p className="text-[9px] text-[#5F6368] font-bold uppercase">Runs / Dismissals (Min 2 Innings)</p>
              </div>
              {stats.bestAverages.length > 0 ? (
                <div className="divide-y divide-[#E5E5E5]">
                  {stats.bestAverages.slice(0, 5).map((b, i) => (
                    <div key={b.playerId} className="p-3.5 flex items-center justify-between">
                      <div>
                        <Link to="/players/$playerId" params={{ playerId: b.playerId }} className="text-xs font-black text-[#111111] hover:underline">
                          {b.playerName}
                        </Link>
                        <p className="text-[10px] text-[#5F6368]">{b.runs} runs in {b.innings} inns</p>
                      </div>
                      <span className="text-sm font-black text-[#111111] tabular-nums">{formatStatDecimal(b.average)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-xs text-[#5F6368] italic">No qualified batters yet.</p>
              )}
            </div>

            {/* Bowling Average */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-[#FAFAF8] border-b border-[#E5E5E5]">
                <h3 className="text-xs font-black uppercase text-[#111111]">Best Bowling Average</h3>
                <p className="text-[9px] text-[#5F6368] font-bold uppercase">Runs Conceded / Wickets (Min 2 Wickets)</p>
              </div>
              {stats.bestBowlingAverages.length > 0 ? (
                <div className="divide-y divide-[#E5E5E5]">
                  {stats.bestBowlingAverages.slice(0, 5).map((bw, i) => (
                    <div key={bw.playerId} className="p-3.5 flex items-center justify-between">
                      <div>
                        <Link to="/players/$playerId" params={{ playerId: bw.playerId }} className="text-xs font-black text-[#111111] hover:underline">
                          {bw.playerName}
                        </Link>
                        <p className="text-[10px] text-[#5F6368]">{bw.wickets} wkts for {bw.runsConceded} runs</p>
                      </div>
                      <span className="text-sm font-black text-[#9A6A05] tabular-nums">{formatStatDecimal(bw.average)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-xs text-[#5F6368] italic">No qualified bowlers yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: BOUNDARIES (6s / 4s) ─────────────────────────────────── */}
        {!isLoading && activeTab === "boundaries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Sixes */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-amber-500/10 border-b border-[#E5E5E5] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#9A6A05]" />
                <h3 className="text-xs font-black uppercase text-[#111111]">Most Sixes (6s)</h3>
              </div>
              {stats.mostSixes.length > 0 ? (
                <div className="divide-y divide-[#E5E5E5]">
                  {stats.mostSixes.slice(0, 10).map((b, idx) => (
                    <div key={b.playerId} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-[#5F6368] w-5">{idx + 1}</span>
                        <div>
                          <Link to="/players/$playerId" params={{ playerId: b.playerId }} className="text-xs font-black text-[#111111] hover:underline">
                            {b.playerName}
                          </Link>
                          <p className="text-[10px] text-[#5F6368]">{b.teamShortName}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#9A6A05] tabular-nums">{b.sixes}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-xs text-[#5F6368] italic">No sixes recorded yet.</p>
              )}
            </div>

            {/* Most Fours */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-yellow-500/10 border-b border-[#E5E5E5] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-black uppercase text-[#111111]">Most Fours (4s)</h3>
              </div>
              {stats.mostFours.length > 0 ? (
                <div className="divide-y divide-[#E5E5E5]">
                  {stats.mostFours.slice(0, 10).map((b, idx) => (
                    <div key={b.playerId} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-[#5F6368] w-5">{idx + 1}</span>
                        <div>
                          <Link to="/players/$playerId" params={{ playerId: b.playerId }} className="text-xs font-black text-[#111111] hover:underline">
                            {b.playerName}
                          </Link>
                          <p className="text-[10px] text-[#5F6368]">{b.teamShortName}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#111111] tabular-nums">{b.fours}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-xs text-[#5F6368] italic">No fours recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: ALL-ROUNDERS ────────────────────────────────────────── */}
        {!isLoading && activeTab === "allrounders" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-emerald-500/10 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-emerald-700" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    ALL-ROUNDER IMPACT INDEX
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Normalized dual contribution: Runs (1 pt) + Wickets (25 pts) + Catches (10 pts)
                  </p>
                </div>
              </div>
            </div>

            {stats.bestAllRounders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">PLAYER</th>
                      <th className="px-3 py-3 text-right">RUNS</th>
                      <th className="px-3 py-3 text-right">WKTS</th>
                      <th className="px-3 py-3 text-right">CATCHES</th>
                      <th className="px-4 py-3 text-right font-black text-[#111111] bg-emerald-500/15">INDEX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {stats.bestAllRounders.map((a, idx) => (
                      <tr key={a.playerId} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">{idx + 1}</td>
                        <td className="px-4 py-3.5 font-extrabold text-[#111111]">
                          <Link to="/players/$playerId" params={{ playerId: a.playerId }} className="hover:underline">
                            {a.playerName}
                          </Link>
                          <span className="text-[10px] text-[#5F6368] font-bold uppercase block">{a.teamShortName}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{a.runs}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{a.wickets}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{a.catches}</td>
                        <td className="px-4 py-3.5 text-right font-black text-emerald-700 tabular-nums text-sm bg-emerald-500/10">
                          {a.allRounderIndex}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-bold text-[#5F6368] italic">
                NO ALL-ROUNDER CONTRIBUTIONS RECORDED YET.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 7: FIELDING ────────────────────────────────────────────── */}
        {!isLoading && activeTab === "fielding" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-blue-500/10 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-700" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    TOP FIELDERS LEADERBOARD
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Actual recorded catches, run outs, and stumpings
                  </p>
                </div>
              </div>
            </div>

            {stats.bestFielders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">FIELDER</th>
                      <th className="px-3 py-3 text-right">CATCHES</th>
                      <th className="px-3 py-3 text-right">RUN OUTS</th>
                      <th className="px-3 py-3 text-right">STUMPINGS</th>
                      <th className="px-4 py-3 text-right font-black text-[#111111] bg-blue-500/15">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {stats.bestFielders.map((f, idx) => (
                      <tr key={f.playerId} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">{idx + 1}</td>
                        <td className="px-4 py-3.5 font-extrabold text-[#111111]">
                          <Link to="/players/$playerId" params={{ playerId: f.playerId }} className="hover:underline">
                            {f.playerName}
                          </Link>
                          <span className="text-[10px] text-[#5F6368] font-bold uppercase block">{f.teamShortName}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{f.catches}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{f.runOuts}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{f.stumpings}</td>
                        <td className="px-4 py-3.5 text-right font-black text-blue-700 tabular-nums text-sm bg-blue-500/10">
                          {f.totalDismissals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-bold text-[#5F6368] italic">
                NO FIELDING DISMISSALS RECORDED YET.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 8: TOURNAMENT MVP ──────────────────────────────────────── */}
        {!isLoading && activeTab === "mvp" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-gradient-to-r from-[#D9A928]/15 via-amber-500/5 to-transparent border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#9A6A05]" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    MOST VALUABLE PLAYER (MVP) INDEX
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Accumulated tournament impact points across all matches
                  </p>
                </div>
              </div>
            </div>

            {stats.mvpLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">PLAYER</th>
                      <th className="px-3 py-3 text-right">RUNS</th>
                      <th className="px-3 py-3 text-right">WKTS</th>
                      <th className="px-3 py-3 text-right">CATCHES</th>
                      <th className="px-3 py-3 text-right">MOTM</th>
                      <th className="px-4 py-3 text-right font-black text-[#111111] bg-[#D9A928]/15">MVP PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {stats.mvpLeaderboard.map((m, idx) => (
                      <tr
                        key={m.playerId}
                        className={`hover:bg-[#FAFAF8] transition-colors ${
                          idx === 0 ? "bg-[#D9A928]/5" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              idx === 0
                                ? "bg-[#D9A928] text-black shadow-xs"
                                : "text-[#5F6368]"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            to="/players/$playerId"
                            params={{ playerId: m.playerId }}
                            className="font-extrabold text-[#111111] hover:text-[#D9A928] hover:underline block"
                          >
                            {m.playerName}
                          </Link>
                          <span className="text-[10px] text-[#5F6368] font-bold uppercase">
                            {m.teamName}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{m.runs}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{m.wickets}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{m.catches}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{m.motmAwardsCount}</td>
                        <td className="px-4 py-3.5 text-right font-black text-[#111111] tabular-nums text-sm bg-[#D9A928]/10">{m.mvpPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-bold text-[#5F6368] italic">
                NO TOURNAMENT STATS AVAILABLE YET.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
