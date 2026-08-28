import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { calculateTournamentLeaderboards } from "@/lib/scoring/playerPerformance";
import { lookup } from "@/lib/repositories";
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
} from "lucide-react";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

type StatTab = "orange" | "purple" | "mvp" | "sixes" | "fours";

function StatsPage() {
  const [activeTab, setActiveTab] = useState<StatTab>("orange");
  const { data: matches = [], isLoading: loadingMatches, isError, refetch } = useMatches();
  useTeams();

  const leaderboards = useMemo(
    () => calculateTournamentLeaderboards(matches),
    [matches],
  );

  const completedCount = matches.filter((m) => m.status === "COMPLETED").length;
  const isLoading = loadingMatches && matches.length === 0;

  return (
    <AppShell title="Tournament Stats">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 pt-2 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-[#9A6A05]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111]">
                TOURNAMENT STATS
              </h1>
              <p className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider">
                TPL 2026 Official Leaderboards & Player Rankings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-black text-[#5F6368] uppercase shadow-xs">
              {completedCount} Completed {completedCount === 1 ? "Match" : "Matches"}
            </span>
          </div>
        </div>

        {/* ── Category Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "orange", label: "Orange Cap (Runs)", icon: Flame },
            { id: "purple", label: "Purple Cap (Wickets)", icon: Target },
            { id: "mvp", label: "Tournament MVP", icon: Trophy },
            { id: "sixes", label: "Most 6s", icon: Zap },
            { id: "fours", label: "Most 4s", icon: Sparkles },
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
            <p className="text-xs font-bold text-[#5F6368]">Aggregating tournament statistics...</p>
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

            {leaderboards.orangeCap.length > 0 ? (
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
                    {leaderboards.orangeCap.map((b, idx) => (
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
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.strikeRate.toFixed(1)}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.average.toFixed(1)}</td>
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

            {leaderboards.purpleCap.length > 0 ? (
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
                      <th className="px-3 py-3 text-right">BBI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {leaderboards.purpleCap.map((b, idx) => (
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
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.economy.toFixed(2)}</td>
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

        {/* ── TAB 3: TOURNAMENT MVP ──────────────────────────────────────── */}
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
                    Accumulated tournament impact points (Batting + Bowling + Fielding)
                  </p>
                </div>
              </div>
            </div>

            {leaderboards.mvpLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">PLAYER</th>
                      <th className="px-3 py-3 text-right">RUNS</th>
                      <th className="px-3 py-3 text-right">WKTS</th>
                      <th className="px-3 py-3 text-right">CATCHES</th>
                      <th className="px-4 py-3 text-right font-black text-[#111111] bg-[#D9A928]/15">MVP PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {leaderboards.mvpLeaderboard.map((m, idx) => (
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
                        <td className="px-4 py-3.5 text-right font-black text-[#111111] tabular-nums text-sm bg-[#D9A928]/10">{m.points}</td>
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

        {/* ── TAB 4: MOST SIXES & FOURS ──────────────────────────────────── */}
        {!isLoading && (activeTab === "sixes" || activeTab === "fours") && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-[#D9A928]/5 to-transparent border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#9A6A05]" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                    {activeTab === "sixes" ? "MAXIMUM SIXES (6s)" : "MAXIMUM FOURS (4s)"}
                  </h2>
                  <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                    Tournament boundary hitters
                  </p>
                </div>
              </div>
            </div>

            {(activeTab === "sixes" ? leaderboards.mostSixes : leaderboards.mostFours).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                      <th className="px-3 sm:px-4 py-3 text-center w-12">POS</th>
                      <th className="px-4 py-3 text-left">BATTER</th>
                      <th className="px-3 py-3 text-right">INN</th>
                      <th className="px-3 py-3 text-right">TOTAL RUNS</th>
                      <th className="px-4 py-3 text-right font-black text-[#111111] bg-[#D9A928]/15">
                        {activeTab === "sixes" ? "SIXES (6s)" : "FOURS (4s)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {(activeTab === "sixes" ? leaderboards.mostSixes : leaderboards.mostFours).map((b, idx) => (
                      <tr
                        key={b.playerId}
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
                        <td className="px-3 py-3.5 text-right font-bold text-[#5F6368] tabular-nums">{b.runs}</td>
                        <td className="px-4 py-3.5 text-right font-black text-[#111111] tabular-nums text-sm bg-[#D9A928]/10">
                          {activeTab === "sixes" ? (b as any).sixes : (b as any).fours}
                        </td>
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
