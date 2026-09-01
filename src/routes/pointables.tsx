import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { calculateStandings, getGroupedTournamentStandings } from "@/lib/scoring/standings";
import { calculateTournamentStats } from "@/lib/scoring/statistics";
import { lookup } from "@/lib/repositories";
import {
  Trophy,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Target,
  Flame,
  Zap,
  Shield,
  Award,
  Star,
  Activity,
  User,
  Users,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Calendar,
} from "lucide-react";
import { TeamLogo } from "@/components/team/TeamLogo";

export const Route = createFileRoute("/pointables")({
  component: PointablesPage,
});

export function PointablesPage() {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { data: matches = [], isLoading: loadingMatches, isError, refetch } = useMatches();

  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"batting" | "bowling" | "power" | "allrounders" | "fielding" | "potm">("batting");

  const { groupA: group1Standings, groupB: group2Standings, all: standings } = useMemo(
    () => getGroupedTournamentStandings(teams, matches),
    [teams, matches],
  );
  const stats = useMemo(() => calculateTournamentStats(matches), [matches]);
  const completedCount = matches.filter((m) => m.status === "COMPLETED").length;
  const isLoading = (loadingTeams || loadingMatches) && teams.length === 0;

  const hasScheduledMatches = matches.length > 0 && standings.length > 0;
  const hasTournamentData = stats.orangeCap.length > 0 || stats.purpleCap.length > 0 || completedCount > 0;

  // Tournament Leaders Cards Highlights
  const highestRunScorer = stats.orangeCap[0];
  const mostWicketsBowler = stats.purpleCap[0];
  const mostSixesBatter = stats.mostSixes[0];
  const mostFoursBatter = stats.mostFours[0];
  const bestStriker = stats.bestStrikers[0] || (stats.orangeCap.filter(b => b.balls >= 6).sort((a, b) => b.strikeRate - a.strikeRate)[0]);
  const bestEconomyBowler = stats.bestEconomies[0] || (stats.purpleCap.filter(bw => bw.legalBalls >= 6).sort((a, b) => a.economy - b.economy)[0]);
  const topFielder = stats.bestFielders[0];
  const bestBowlingSpell = stats.bestBowlingSpells[0];

  // Top performers per team for Team Performance Summary
  const teamSummaries = useMemo(() => {
    return standings.map((st) => {
      const teamBatters = stats.orangeCap.filter((b) => b.teamId === st.teamId || lookup.player(b.playerId)?.teamId === st.teamId);
      const teamBowlers = stats.purpleCap.filter((bw) => bw.teamId === st.teamId || lookup.player(bw.playerId)?.teamId === st.teamId);
      const topBatter = teamBatters[0];
      const topBowler = teamBowlers[0];

      return {
        ...st,
        topBatter: topBatter ? { name: topBatter.playerName, id: topBatter.playerId, runs: topBatter.runs } : null,
        topBowler: topBowler ? { name: topBowler.playerName, id: topBowler.playerId, wickets: topBowler.wickets, runs: topBowler.runsConceded } : null,
      };
    });
  }, [standings, stats]);

  return (
    <AppShell title="Pointables & Leaderboards">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-2 pb-20 px-3 sm:px-4">
        
        {/* ==================================================================== */}
        {/* HEADER SECTION */}
        {/* ==================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center shadow-xs">
              <Trophy className="h-6 w-6 text-[#9A6A05]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#111111]">
                POINTS TABLE &amp; LEADERS
              </h1>
              <p className="text-xs text-[#5F6368] font-bold uppercase tracking-wider">
                TPL 2026 Official Standings &amp; Player Statistics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/stats"
              className="tap inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D9A928] hover:bg-[#F4C542] text-xs font-black text-black uppercase shadow-xs transition-colors"
            >
              <span>Full Stats</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card-surface p-16 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <RefreshCw className="h-7 w-7 text-[#D9A928] animate-spin" />
            <p className="text-sm font-bold text-[#5F6368]">Calculating tournament standings &amp; statistics...</p>
          </div>
        )}

        {/* Error State */}
        {isError && teams.length === 0 && (
          <div className="card-surface p-10 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              Unable to load tournament standings
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

        {/* Empty Standings State when no matches are scheduled */}
        {!isLoading && !hasScheduledMatches && (
          <div className="card-surface p-12 sm:p-16 flex flex-col items-center justify-center text-center gap-4 border border-[#E5E5E5] bg-white rounded-3xl shadow-sm my-2">
            <div className="h-16 w-16 rounded-2xl bg-[#D9A928]/10 border border-[#D9A928]/30 flex items-center justify-center text-[#9A6A05] mb-1">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="max-w-md flex flex-col gap-1.5">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#111111]">
                No Standings Available
              </h3>
              <p className="text-xs sm:text-sm text-[#5F6368] font-medium leading-relaxed">
                No tournament matches have been scheduled yet.
              </p>
            </div>
          </div>
        )}

        {!isLoading && hasScheduledMatches && (
          <>
            {/* ==================================================================== */}
            {/* 1. STANDINGS TABLES (GROUP A & GROUP B) */}
            {/* ==================================================================== */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Group 1 Points Table */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="px-5 py-3.5 bg-[#111111] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#D9A928]" />
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                          GROUP A STANDINGS
                        </h2>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D9A928]/20 text-[#D9A928] border border-[#D9A928]/30">
                        Top 2 Qualify
                      </span>
                    </div>

                    {/* Mobile Standings Cards (Visible on mobile: md:hidden) */}
                    <div className="md:hidden flex flex-col divide-y divide-[#E5E5E5]">
                      {group1Standings.length === 0 ? (
                        <div className="p-6 text-center text-xs font-bold text-[#5F6368]">
                          No Group A teams registered yet.
                        </div>
                      ) : (
                        group1Standings.map((team, idx) => {
                          const isQualified = idx < 2;
                          const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(2)}` : team.nrr.toFixed(2);

                          return (
                            <div
                              key={team.teamId}
                              className={`p-3.5 flex flex-col gap-2.5 ${
                                idx === 0 ? "bg-[#D9A928]/5" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black shrink-0 ${
                                      isQualified
                                        ? "bg-[#D9A928] text-black shadow-xs"
                                        : "bg-slate-200 text-[#5F6368]"
                                    }`}
                                  >
                                    {team.pos}
                                  </span>
                                  <TeamLogo
                                    logoUrl={team.logoUrl}
                                    name={team.teamName}
                                    shortName={team.teamShortName}
                                    size="xs"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-[#111111] uppercase truncate text-xs">
                                      {team.teamName}
                                    </p>
                                    <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                                      {team.teamShortName}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-black text-xs text-[#111111] bg-[#D9A928]/25 px-2.5 py-1 rounded-lg border border-[#D9A928]/30 tabular-nums">
                                    {team.points} PTS
                                  </span>
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-5 gap-1.5 text-center bg-[#F9FAFB] rounded-xl p-2 border border-[#E5E5E5] text-[11px]">
                                <div>
                                  <span className="block text-[9px] font-bold text-[#5F6368] uppercase">P</span>
                                  <span className="font-black text-[#111111] tabular-nums">{team.played}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-emerald-700 uppercase">W</span>
                                  <span className="font-black text-emerald-700 tabular-nums">{team.won}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-rose-700 uppercase">L</span>
                                  <span className="font-black text-rose-700 tabular-nums">{team.lost}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-[#5F6368] uppercase">T/NR</span>
                                  <span className="font-black text-[#5F6368] tabular-nums">{team.tied + team.noResult}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-[#5F6368] uppercase">NRR</span>
                                  <span className="font-black text-[#111111] tabular-nums">
                                    {team.played > 0 ? nrrFormatted : "0.00"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Desktop & Tablet Table (Hidden on mobile: hidden md:block) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                            <th className="px-3 py-3 text-center w-10">POS</th>
                            <th className="px-3 py-3 text-left min-w-[140px]">TEAM</th>
                            <th className="px-2 py-3 text-center font-bold">P</th>
                            <th className="px-2 py-3 text-center font-bold">W</th>
                            <th className="px-2 py-3 text-center font-bold">L</th>
                            <th className="px-2 py-3 text-center font-bold">T/NR</th>
                            <th className="px-3 py-3 text-center font-black text-[#111111] bg-[#D9A928]/15">PTS</th>
                            <th className="px-3 py-3 text-right font-black">NRR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                          {group1Standings.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-6 text-center text-[#5F6368] font-medium">
                                No Group A teams registered yet.
                              </td>
                            </tr>
                          ) : (
                            group1Standings.map((team, idx) => {
                              const isQualified = idx < 2;
                              const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(2)}` : team.nrr.toFixed(2);

                              return (
                                <tr
                                  key={team.teamId}
                                  className={`hover:bg-[#FAFAF8] transition-colors ${
                                    idx === 0 ? "bg-[#D9A928]/5" : ""
                                  }`}
                                >
                                  <td className="px-3 py-3 text-center font-black text-[#111111] tabular-nums">
                                    <span
                                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                                        isQualified
                                          ? "bg-[#D9A928] text-black shadow-xs"
                                          : "bg-slate-200 text-[#5F6368]"
                                      }`}
                                    >
                                      {team.pos}
                                    </span>
                                  </td>

                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-2">
                                      <TeamLogo
                                        logoUrl={team.logoUrl}
                                        name={team.teamName}
                                        shortName={team.teamShortName}
                                        size="xs"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-extrabold text-[#111111] uppercase truncate text-xs">
                                          {team.teamName}
                                        </p>
                                        <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                                          {team.teamShortName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-2 py-3 text-center font-bold text-[#5F6368] tabular-nums">{team.played}</td>
                                  <td className="px-2 py-3 text-center font-black text-emerald-700 tabular-nums">{team.won}</td>
                                  <td className="px-2 py-3 text-center font-bold text-rose-700 tabular-nums">{team.lost}</td>
                                  <td className="px-2 py-3 text-center font-bold text-[#5F6368] tabular-nums">{team.tied + team.noResult}</td>
                                  <td className="px-3 py-3 text-center font-black text-[#111111] bg-[#D9A928]/10 tabular-nums text-xs sm:text-sm">
                                    {team.points}
                                  </td>
                                  <td className="px-3 py-3 text-right font-black tabular-nums text-[#111111]">
                                    {team.played > 0 ? nrrFormatted : "0.00"}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Group 2 Points Table */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="px-5 py-3.5 bg-[#111111] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                          GROUP B STANDINGS
                        </h2>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        Top 2 Qualify
                      </span>
                    </div>

                    {/* Mobile Standings Cards (Visible on mobile: md:hidden) */}
                    <div className="md:hidden flex flex-col divide-y divide-[#E5E5E5]">
                      {group2Standings.length === 0 ? (
                        <div className="p-6 text-center text-xs font-bold text-[#5F6368]">
                          No Group B teams registered yet.
                        </div>
                      ) : (
                        group2Standings.map((team, idx) => {
                          const isQualified = idx < 2;
                          const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(2)}` : team.nrr.toFixed(2);

                          return (
                            <div
                              key={team.teamId}
                              className={`p-3.5 flex flex-col gap-2.5 ${
                                idx === 0 ? "bg-[#D9A928]/5" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black shrink-0 ${
                                      isQualified
                                        ? "bg-purple-600 text-white shadow-xs"
                                        : "bg-slate-200 text-[#5F6368]"
                                    }`}
                                  >
                                    {team.pos}
                                  </span>
                                  <TeamLogo
                                    logoUrl={team.logoUrl}
                                    name={team.teamName}
                                    shortName={team.teamShortName}
                                    size="xs"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-[#111111] uppercase truncate text-xs">
                                      {team.teamName}
                                    </p>
                                    <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                                      {team.teamShortName}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-black text-xs text-[#111111] bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 tabular-nums">
                                    {team.points} PTS
                                  </span>
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-5 gap-1.5 text-center bg-[#F9FAFB] rounded-xl p-2 border border-[#E5E5E5] text-[11px]">
                                <div>
                                  <span className="block text-[9px] font-bold text-[#5F6368] uppercase">P</span>
                                  <span className="font-black text-[#111111] tabular-nums">{team.played}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-emerald-700 uppercase">W</span>
                                  <span className="font-black text-emerald-700 tabular-nums">{team.won}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-rose-700 uppercase">L</span>
                                  <span className="font-black text-rose-700 tabular-nums">{team.lost}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-[#5F6368] uppercase">T/NR</span>
                                  <span className="font-black text-[#5F6368] tabular-nums">{team.tied + team.noResult}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-bold text-[#5F6368] uppercase">NRR</span>
                                  <span className="font-black text-[#111111] tabular-nums">
                                    {team.played > 0 ? nrrFormatted : "0.00"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Desktop & Tablet Table (Hidden on mobile: hidden md:block) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                            <th className="px-3 py-3 text-center w-10">POS</th>
                            <th className="px-3 py-3 text-left min-w-[140px]">TEAM</th>
                            <th className="px-2 py-3 text-center font-bold">P</th>
                            <th className="px-2 py-3 text-center font-bold">W</th>
                            <th className="px-2 py-3 text-center font-bold">L</th>
                            <th className="px-2 py-3 text-center font-bold">T/NR</th>
                            <th className="px-3 py-3 text-center font-black text-[#111111] bg-purple-500/15">PTS</th>
                            <th className="px-3 py-3 text-right font-black">NRR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                          {group2Standings.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-6 text-center text-[#5F6368] font-medium">
                                No Group B teams registered yet.
                              </td>
                            </tr>
                          ) : (
                            group2Standings.map((team, idx) => {
                              const isQualified = idx < 2;
                              const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(2)}` : team.nrr.toFixed(2);

                              return (
                                <tr
                                  key={team.teamId}
                                  className={`hover:bg-[#FAFAF8] transition-colors ${
                                    idx === 0 ? "bg-purple-500/5" : ""
                                  }`}
                                >
                                  <td className="px-3 py-3 text-center font-black text-[#111111] tabular-nums">
                                    <span
                                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                                        isQualified
                                          ? "bg-purple-600 text-white shadow-xs"
                                          : "bg-slate-200 text-[#5F6368]"
                                      }`}
                                    >
                                      {team.pos}
                                    </span>
                                  </td>

                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-2">
                                      <TeamLogo
                                        logoUrl={team.logoUrl}
                                        name={team.teamName}
                                        shortName={team.teamShortName}
                                        size="xs"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-extrabold text-[#111111] uppercase truncate text-xs">
                                          {team.teamName}
                                        </p>
                                        <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                                          {team.teamShortName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-2 py-3 text-center font-bold text-[#5F6368] tabular-nums">{team.played}</td>
                                  <td className="px-2 py-3 text-center font-black text-emerald-700 tabular-nums">{team.won}</td>
                                  <td className="px-2 py-3 text-center font-bold text-rose-700 tabular-nums">{team.lost}</td>
                                  <td className="px-2 py-3 text-center font-bold text-[#5F6368] tabular-nums">{team.tied + team.noResult}</td>
                                  <td className="px-3 py-3 text-center font-black text-[#111111] bg-purple-500/10 tabular-nums text-xs sm:text-sm">
                                    {team.points}
                                  </td>
                                  <td className="px-3 py-3 text-right font-black tabular-nums text-[#111111]">
                                    {team.played > 0 ? nrrFormatted : "0.00"}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standings Rules Summary Footer */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl px-5 py-3 text-xs text-[#5F6368] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <span className="font-bold">
                  Points: <strong className="text-[#111111]">Win = 2 pts</strong> • <strong className="text-[#111111]">Tie / NR = 1 pt</strong> • <strong className="text-[#111111]">Loss = 0 pts</strong>
                </span>
                <span className="font-bold">
                  Official Tie-Break: <strong className="text-[#111111]">Points → Net Run Rate (NRR) → Total Wins</strong>
                </span>
              </div>
            </div>

            {/* ==================================================================== */}
            {/* 2. TOURNAMENT LEADERS HIGHLIGHT CARDS */}
            {/* ==================================================================== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#D9A928]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-[#111111]">
                    TOURNAMENT LEADERS
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-[#5F6368] uppercase">
                  Active Match Delivery Data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Highest Run Scorer */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#9A6A05] bg-[#D9A928]/15 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      🏏 HIGHEST RUN SCORER
                    </span>
                    <span className="text-[10px] font-black text-[#5F6368]">ORANGE CAP</span>
                  </div>

                  <div className="my-3">
                    {highestRunScorer ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: highestRunScorer.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {highestRunScorer.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {highestRunScorer.teamName} ({highestRunScorer.teamShortName})
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">TOTAL RUNS</span>
                    <span className="text-xl font-black text-[#111111] tabular-nums">
                      {highestRunScorer ? `${highestRunScorer.runs} RUNS` : "—"}
                    </span>
                  </div>
                </div>

                {/* 2. Most Wickets */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      🎯 MOST WICKETS
                    </span>
                    <span className="text-[10px] font-black text-[#5F6368]">PURPLE CAP</span>
                  </div>

                  <div className="my-3">
                    {mostWicketsBowler && mostWicketsBowler.wickets > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: mostWicketsBowler.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {mostWicketsBowler.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {mostWicketsBowler.teamName} ({mostWicketsBowler.teamShortName})
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">WICKETS</span>
                    <span className="text-xl font-black text-purple-700 tabular-nums">
                      {mostWicketsBowler && mostWicketsBowler.wickets > 0 ? `${mostWicketsBowler.wickets} W` : "—"}
                    </span>
                  </div>
                </div>

                {/* 3. Most Sixes */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      💥 MOST SIXES
                    </span>
                    <span className="text-[10px] font-black text-[#5F6368]">POWER</span>
                  </div>

                  <div className="my-3">
                    {mostSixesBatter && mostSixesBatter.sixes > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: mostSixesBatter.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {mostSixesBatter.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {mostSixesBatter.teamName} ({mostSixesBatter.teamShortName})
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">MAXIMUMS</span>
                    <span className="text-xl font-black text-rose-600 tabular-nums">
                      {mostSixesBatter && mostSixesBatter.sixes > 0 ? `${mostSixesBatter.sixes} 6s` : "—"}
                    </span>
                  </div>
                </div>

                {/* 4. Most Fours */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      4️⃣ MOST FOURS
                    </span>
                    <span className="text-[10px] font-black text-[#5F6368]">BOUNDARIES</span>
                  </div>

                  <div className="my-3">
                    {mostFoursBatter && mostFoursBatter.fours > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: mostFoursBatter.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {mostFoursBatter.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {mostFoursBatter.teamName} ({mostFoursBatter.teamShortName})
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">FOURS</span>
                    <span className="text-xl font-black text-blue-600 tabular-nums">
                      {mostFoursBatter && mostFoursBatter.fours > 0 ? `${mostFoursBatter.fours} 4s` : "—"}
                    </span>
                  </div>
                </div>

                {/* 5. Best Strike Rate */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      ⚡ BEST STRIKE RATE
                    </span>
                    <span className="text-[9px] font-bold text-[#5F6368]">MIN 10 BALLS</span>
                  </div>

                  <div className="my-3">
                    {bestStriker && bestStriker.runs > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: bestStriker.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {bestStriker.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {bestStriker.runs}r ({bestStriker.balls}b) • {bestStriker.teamShortName}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">STRIKE RATE</span>
                    <span className="text-xl font-black text-amber-700 tabular-nums">
                      {bestStriker && bestStriker.runs > 0 ? bestStriker.strikeRate.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>

                {/* 6. Best Bowling Economy */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      🎳 BEST ECONOMY
                    </span>
                    <span className="text-[9px] font-bold text-[#5F6368]">MIN 12 BALLS</span>
                  </div>

                  <div className="my-3">
                    {bestEconomyBowler && bestEconomyBowler.legalBalls > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: bestEconomyBowler.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {bestEconomyBowler.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {bestEconomyBowler.oversText} ov, {bestEconomyBowler.runsConceded}r • {bestEconomyBowler.teamShortName}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">ECONOMY</span>
                    <span className="text-xl font-black text-emerald-700 tabular-nums">
                      {bestEconomyBowler && bestEconomyBowler.legalBalls > 0 ? bestEconomyBowler.economy.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>

                {/* 7. Most Catches / Fielders */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      🧤 MOST CATCHES
                    </span>
                    <span className="text-[10px] font-black text-[#5F6368]">FIELDING</span>
                  </div>

                  <div className="my-3">
                    {topFielder && topFielder.totalDismissals > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: topFielder.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {topFielder.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {topFielder.catches}c, {topFielder.runOuts}ro • {topFielder.teamShortName}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">DISMISSALS</span>
                    <span className="text-xl font-black text-cyan-700 tabular-nums">
                      {topFielder && topFielder.totalDismissals > 0 ? `${topFielder.totalDismissals} DISM` : "—"}
                    </span>
                  </div>
                </div>

                {/* 8. Best Bowling Figures */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4.5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A928] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      🔥 BEST BOWLING
                    </span>
                    <span className="text-[10px] font-black text-[#5F6368]">INNINGS</span>
                  </div>

                  <div className="my-3">
                    {bestBowlingSpell && bestBowlingSpell.wickets > 0 ? (
                      <Link
                        to="/player/$playerId"
                        params={{ playerId: bestBowlingSpell.playerId }}
                        className="group/link block"
                      >
                        <p className="font-black text-sm text-[#111111] uppercase truncate group-hover/link:text-[#9A6A05] transition-colors">
                          {bestBowlingSpell.playerName}
                        </p>
                        <p className="text-[11px] font-bold text-[#5F6368] uppercase truncate">
                          {bestBowlingSpell.oversText} ov vs {bestBowlingSpell.opponentTeamName}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-xs font-bold text-[#5F6368] italic">—</p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#F0F0EE] pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368]">FIGURES</span>
                    <span className="text-xl font-black text-indigo-700 tabular-nums">
                      {bestBowlingSpell && bestBowlingSpell.wickets > 0 ? `${bestBowlingSpell.wickets}/${bestBowlingSpell.runsConceded}` : "—"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ==================================================================== */}
            {/* 3. DETAILED TOURNAMENT LEADERBOARDS (TOP 5) */}
            {/* ==================================================================== */}
            <div className="flex flex-col gap-4 bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-[#D9A928]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-[#111111]">
                    TOP PERFORMERS LEADERBOARDS
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F5F3] rounded-xl border border-[#E5E5E5] text-xs">
                  <button
                    onClick={() => setActiveLeaderboardTab("batting")}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all ${
                      activeLeaderboardTab === "batting"
                        ? "bg-white text-black shadow-xs"
                        : "text-[#5F6368] hover:text-black"
                    }`}
                  >
                    🏏 Top Runs
                  </button>
                  <button
                    onClick={() => setActiveLeaderboardTab("bowling")}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all ${
                      activeLeaderboardTab === "bowling"
                        ? "bg-white text-black shadow-xs"
                        : "text-[#5F6368] hover:text-black"
                    }`}
                  >
                    🎯 Wickets
                  </button>
                  <button
                    onClick={() => setActiveLeaderboardTab("power")}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all ${
                      activeLeaderboardTab === "power"
                        ? "bg-white text-black shadow-xs"
                        : "text-[#5F6368] hover:text-black"
                    }`}
                  >
                    💥 Sixes &amp; 4s
                  </button>
                  <button
                    onClick={() => setActiveLeaderboardTab("allrounders")}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all ${
                      activeLeaderboardTab === "allrounders"
                        ? "bg-white text-black shadow-xs"
                        : "text-[#5F6368] hover:text-black"
                    }`}
                  >
                    ⭐ All-Rounders
                  </button>
                  <button
                    onClick={() => setActiveLeaderboardTab("fielding")}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all ${
                      activeLeaderboardTab === "fielding"
                        ? "bg-white text-black shadow-xs"
                        : "text-[#5F6368] hover:text-black"
                    }`}
                  >
                    🧤 Fielding
                  </button>
                  <button
                    onClick={() => setActiveLeaderboardTab("potm")}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all ${
                      activeLeaderboardTab === "potm"
                        ? "bg-white text-black shadow-xs"
                        : "text-[#5F6368] hover:text-black"
                    }`}
                  >
                    🏆 POTM / MVP
                  </button>
                </div>
              </div>

              {/* Tab 1: Top Runs */}
              {activeLeaderboardTab === "batting" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-[#5F6368] font-bold">
                    <span>TOP 5 RUN SCORERS</span>
                    <Link to="/stats" className="text-[#9A6A05] hover:underline font-black flex items-center gap-1">
                      <span>VIEW ALL BATTERS</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 py-3 text-center w-10">#</th>
                          <th className="px-3 py-3 text-left">BATTER</th>
                          <th className="px-2 py-3 text-center">INN</th>
                          <th className="px-2 py-3 text-center">BALLS</th>
                          <th className="px-2 py-3 text-center">4s</th>
                          <th className="px-2 py-3 text-center">6s</th>
                          <th className="px-2.5 py-3 text-center font-bold">AVG</th>
                          <th className="px-2.5 py-3 text-center font-bold">SR</th>
                          <th className="px-3 py-3 text-right font-black bg-[#D9A928]/15 text-[#111111]">RUNS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {stats.orangeCap.slice(0, 5).map((b, idx) => (
                          <tr key={b.playerId} className={idx === 0 ? "bg-[#D9A928]/5" : "hover:bg-[#FAFAF8]"}>
                            <td className="px-3 py-3 text-center font-black text-[#111111]">{idx + 1}</td>
                            <td className="px-3 py-3">
                              <Link to="/player/$playerId" params={{ playerId: b.playerId }} className="hover:text-[#9A6A05]">
                                <p className="font-extrabold text-[#111111] uppercase">{b.playerName}</p>
                                <p className="text-[10px] text-[#5F6368] font-bold">{b.teamShortName}</p>
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{b.innings}</td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{b.balls}</td>
                            <td className="px-2 py-3 text-center font-bold text-blue-700">{b.fours}</td>
                            <td className="px-2 py-3 text-center font-bold text-rose-700">{b.sixes}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-[#111111]">{b.average.toFixed(2)}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-[#111111]">{b.strikeRate.toFixed(2)}</td>
                            <td className="px-3 py-3 text-right font-black text-sm text-[#111111] bg-[#D9A928]/10 tabular-nums">
                              {b.runs}
                            </td>
                          </tr>
                        ))}
                        {stats.orangeCap.length === 0 && (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-xs font-bold text-[#5F6368] italic">
                              NO TOURNAMENT DATA YET — Stats will appear after matches are played.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Wickets */}
              {activeLeaderboardTab === "bowling" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-[#5F6368] font-bold">
                    <span>TOP 5 WICKET TAKERS</span>
                    <Link to="/stats" className="text-[#9A6A05] hover:underline font-black flex items-center gap-1">
                      <span>VIEW ALL BOWLERS</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 py-3 text-center w-10">#</th>
                          <th className="px-3 py-3 text-left">BOWLER</th>
                          <th className="px-2 py-3 text-center">INN</th>
                          <th className="px-2 py-3 text-center">OVERS</th>
                          <th className="px-2 py-3 text-center">RUNS</th>
                          <th className="px-2.5 py-3 text-center font-bold">ECON</th>
                          <th className="px-2.5 py-3 text-center font-bold">BEST</th>
                          <th className="px-3 py-3 text-right font-black bg-purple-100 text-purple-900">WICKETS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {stats.purpleCap.slice(0, 5).map((bw, idx) => (
                          <tr key={bw.playerId} className={idx === 0 ? "bg-purple-500/5" : "hover:bg-[#FAFAF8]"}>
                            <td className="px-3 py-3 text-center font-black text-[#111111]">{idx + 1}</td>
                            <td className="px-3 py-3">
                              <Link to="/player/$playerId" params={{ playerId: bw.playerId }} className="hover:text-[#9A6A05]">
                                <p className="font-extrabold text-[#111111] uppercase">{bw.playerName}</p>
                                <p className="text-[10px] text-[#5F6368] font-bold">{bw.teamShortName}</p>
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{bw.innings}</td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{bw.oversText}</td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{bw.runsConceded}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-[#111111]">{bw.economy.toFixed(2)}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-indigo-700">{bw.bestBowling}</td>
                            <td className="px-3 py-3 text-right font-black text-sm text-purple-700 bg-purple-50 tabular-nums">
                              {bw.wickets}
                            </td>
                          </tr>
                        ))}
                        {stats.purpleCap.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-xs font-bold text-[#5F6368] italic">
                              NO TOURNAMENT DATA YET — Stats will appear after matches are played.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Power (Sixes & Fours) */}
              {activeLeaderboardTab === "power" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Most Sixes */}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-xs font-black text-rose-700 uppercase flex items-center gap-1.5">
                      <span>💥 MOST SIXES</span>
                    </h3>
                    <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase">
                            <th className="px-3 py-2.5 text-center w-8">#</th>
                            <th className="px-3 py-2.5 text-left">BATTER</th>
                            <th className="px-2 py-2.5 text-center">RUNS</th>
                            <th className="px-3 py-2.5 text-right font-black text-rose-700">6s</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                          {stats.mostSixes.slice(0, 5).map((b, idx) => (
                            <tr key={b.playerId} className="hover:bg-[#FAFAF8]">
                              <td className="px-3 py-2 text-center font-black">{idx + 1}</td>
                              <td className="px-3 py-2">
                                <Link to="/player/$playerId" params={{ playerId: b.playerId }} className="font-bold text-[#111111] uppercase hover:text-[#9A6A05]">
                                  {b.playerName} <span className="text-[10px] text-[#5F6368]">({b.teamShortName})</span>
                                </Link>
                              </td>
                              <td className="px-2 py-2 text-center font-bold text-[#5F6368]">{b.runs}</td>
                              <td className="px-3 py-2 text-right font-black text-rose-600 text-sm">{b.sixes}</td>
                            </tr>
                          ))}
                          {stats.mostSixes.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-xs text-[#5F6368] italic">No sixes recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Most Fours */}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-xs font-black text-blue-700 uppercase flex items-center gap-1.5">
                      <span>4️⃣ MOST FOURS</span>
                    </h3>
                    <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase">
                            <th className="px-3 py-2.5 text-center w-8">#</th>
                            <th className="px-3 py-2.5 text-left">BATTER</th>
                            <th className="px-2 py-2.5 text-center">RUNS</th>
                            <th className="px-3 py-2.5 text-right font-black text-blue-700">4s</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                          {stats.mostFours.slice(0, 5).map((b, idx) => (
                            <tr key={b.playerId} className="hover:bg-[#FAFAF8]">
                              <td className="px-3 py-2 text-center font-black">{idx + 1}</td>
                              <td className="px-3 py-2">
                                <Link to="/player/$playerId" params={{ playerId: b.playerId }} className="font-bold text-[#111111] uppercase hover:text-[#9A6A05]">
                                  {b.playerName} <span className="text-[10px] text-[#5F6368]">({b.teamShortName})</span>
                                </Link>
                              </td>
                              <td className="px-2 py-2 text-center font-bold text-[#5F6368]">{b.runs}</td>
                              <td className="px-3 py-2 text-right font-black text-blue-600 text-sm">{b.fours}</td>
                            </tr>
                          ))}
                          {stats.mostFours.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-xs text-[#5F6368] italic">No fours recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: All-Rounders */}
              {activeLeaderboardTab === "allrounders" && (
                <div className="flex flex-col gap-3">
                  <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 py-3 text-center w-10">#</th>
                          <th className="px-3 py-3 text-left">ALL-ROUNDER</th>
                          <th className="px-2 py-3 text-center font-bold">RUNS</th>
                          <th className="px-2 py-3 text-center font-bold">WICKETS</th>
                          <th className="px-2 py-3 text-center font-bold">CATCHES</th>
                          <th className="px-2.5 py-3 text-center font-bold">BAT AVG</th>
                          <th className="px-2.5 py-3 text-center font-bold">BOWL ECON</th>
                          <th className="px-3 py-3 text-right font-black bg-[#D9A928]/15 text-[#111111]">INDEX</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {stats.bestAllRounders.slice(0, 5).map((ar, idx) => (
                          <tr key={ar.playerId} className="hover:bg-[#FAFAF8]">
                            <td className="px-3 py-3 text-center font-black">{idx + 1}</td>
                            <td className="px-3 py-3">
                              <Link to="/player/$playerId" params={{ playerId: ar.playerId }} className="hover:text-[#9A6A05]">
                                <p className="font-extrabold text-[#111111] uppercase">{ar.playerName}</p>
                                <p className="text-[10px] text-[#5F6368] font-bold">{ar.teamShortName}</p>
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-center font-black text-amber-800">{ar.runs}</td>
                            <td className="px-2 py-3 text-center font-black text-purple-700">{ar.wickets}</td>
                            <td className="px-2 py-3 text-center font-bold text-cyan-700">{ar.catches}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-[#111111]">{ar.battingAverage.toFixed(2)}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-[#111111]">{ar.bowlingEconomy.toFixed(2)}</td>
                            <td className="px-3 py-3 text-right font-black text-sm text-[#111111] bg-[#D9A928]/10 tabular-nums">
                              {ar.allRounderIndex}
                            </td>
                          </tr>
                        ))}
                        {stats.bestAllRounders.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-xs font-bold text-[#5F6368] italic">
                              NO ALL-ROUNDER DATA YET — Stats will appear after matches are played.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Fielding */}
              {activeLeaderboardTab === "fielding" && (
                <div className="flex flex-col gap-3">
                  <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 py-3 text-center w-10">#</th>
                          <th className="px-3 py-3 text-left">FIELDER</th>
                          <th className="px-2.5 py-3 text-center">CATCHES</th>
                          <th className="px-2.5 py-3 text-center">RUN OUTS</th>
                          <th className="px-2.5 py-3 text-center">STUMPINGS</th>
                          <th className="px-3 py-3 text-right font-black bg-cyan-100 text-cyan-900">TOTAL DISMISSALS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {stats.bestFielders.slice(0, 5).map((f, idx) => (
                          <tr key={f.playerId} className="hover:bg-[#FAFAF8]">
                            <td className="px-3 py-3 text-center font-black">{idx + 1}</td>
                            <td className="px-3 py-3">
                              <Link to="/player/$playerId" params={{ playerId: f.playerId }} className="hover:text-[#9A6A05]">
                                <p className="font-extrabold text-[#111111] uppercase">{f.playerName}</p>
                                <p className="text-[10px] text-[#5F6368] font-bold">{f.teamShortName}</p>
                              </Link>
                            </td>
                            <td className="px-2.5 py-3 text-center font-bold text-cyan-700">{f.catches}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-amber-700">{f.runOuts}</td>
                            <td className="px-2.5 py-3 text-center font-bold text-purple-700">{f.stumpings}</td>
                            <td className="px-3 py-3 text-right font-black text-sm text-cyan-800 bg-cyan-50 tabular-nums">
                              {f.totalDismissals}
                            </td>
                          </tr>
                        ))}
                        {stats.bestFielders.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-xs font-bold text-[#5F6368] italic">
                              NO FIELDING DATA YET — Stats will appear after matches are played.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 6: POTM / MVP */}
              {activeLeaderboardTab === "potm" && (
                <div className="flex flex-col gap-3">
                  <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#5F6368] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 py-3 text-center w-10">#</th>
                          <th className="px-3 py-3 text-left">PLAYER</th>
                          <th className="px-2 py-3 text-center font-bold">RUNS</th>
                          <th className="px-2 py-3 text-center font-bold">WICKETS</th>
                          <th className="px-2 py-3 text-center font-bold">CATCHES</th>
                          <th className="px-2.5 py-3 text-center font-black text-[#9A6A05]">POTM AWARDS</th>
                          <th className="px-3 py-3 text-right font-black bg-[#D9A928]/15 text-[#111111]">MVP POINTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {stats.mvpLeaderboard.slice(0, 5).map((m, idx) => (
                          <tr key={m.playerId} className="hover:bg-[#FAFAF8]">
                            <td className="px-3 py-3 text-center font-black">{idx + 1}</td>
                            <td className="px-3 py-3">
                              <Link to="/player/$playerId" params={{ playerId: m.playerId }} className="hover:text-[#9A6A05]">
                                <p className="font-extrabold text-[#111111] uppercase">{m.playerName}</p>
                                <p className="text-[10px] text-[#5F6368] font-bold">{m.teamShortName}</p>
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{m.runs}</td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{m.wickets}</td>
                            <td className="px-2 py-3 text-center font-bold text-[#5F6368]">{m.catches}</td>
                            <td className="px-2.5 py-3 text-center font-black text-[#9A6A05]">
                              {m.motmAwardsCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#D9A928]/20 border border-[#D9A928]/40 text-xs">
                                  🏆 {m.motmAwardsCount}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-3 py-3 text-right font-black text-sm text-[#111111] bg-[#D9A928]/10 tabular-nums">
                              {m.mvpPoints} pts
                            </td>
                          </tr>
                        ))}
                        {stats.mvpLeaderboard.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs font-bold text-[#5F6368] italic">
                              NO MVP DATA YET — Stats will appear after matches are played.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* ==================================================================== */}
            {/* 4. TEAM PERFORMANCE SUMMARY */}
            {/* ==================================================================== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D9A928]" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-[#111111]">
                  TEAM PERFORMANCE SUMMARY
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamSummaries.map((team) => {
                  const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(2)}` : team.nrr.toFixed(2);

                  return (
                    <div
                      key={team.teamId}
                      className="bg-white border border-[#E5E5E5] rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-[#D9A928] transition-all"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-[#F0F0EE] pb-3 mb-3">
                          <TeamLogo
                            logoUrl={team.logoUrl}
                            name={team.teamName}
                            shortName={team.teamShortName}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <h3 className="font-black text-sm text-[#111111] uppercase truncate">
                              {team.teamName}
                            </h3>
                            <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                              {team.teamShortName} • {team.played > 0 ? `${team.won}W / ${team.lost}L` : "No matches yet"}
                            </p>
                          </div>
                        </div>

                        {/* Metric Grid */}
                        <div className="grid grid-cols-4 gap-2 text-center bg-[#F9FAFB] rounded-2xl p-2.5 border border-[#E5E5E5] mb-3">
                          <div>
                            <span className="block text-[9px] font-bold text-[#5F6368] uppercase">P</span>
                            <span className="font-black text-xs text-[#111111]">{team.played}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-[#5F6368] uppercase">W</span>
                            <span className="font-black text-xs text-emerald-700">{team.won}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-[#5F6368] uppercase">PTS</span>
                            <span className="font-black text-xs text-[#111111] bg-[#D9A928]/20 px-1.5 py-0.5 rounded">{team.points}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-[#5F6368] uppercase">NRR</span>
                            <span className="font-black text-xs text-[#111111]">{team.played > 0 ? nrrFormatted : "0.00"}</span>
                          </div>
                        </div>

                        {/* Top Performers */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#5F6368] uppercase">Top Batter:</span>
                            {team.topBatter ? (
                              <Link to="/player/$playerId" params={{ playerId: team.topBatter.id }} className="font-bold text-[#111111] hover:text-[#9A6A05] truncate max-w-[150px]">
                                {team.topBatter.name} ({team.topBatter.runs}r)
                              </Link>
                            ) : (
                              <span className="text-[#5F6368] italic text-[11px]">—</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#5F6368] uppercase">Top Bowler:</span>
                            {team.topBowler ? (
                              <Link to="/player/$playerId" params={{ playerId: team.topBowler.id }} className="font-bold text-[#111111] hover:text-[#9A6A05] truncate max-w-[150px]">
                                {team.topBowler.name} ({team.topBowler.wickets}w/{team.topBowler.runs}r)
                              </Link>
                            ) : (
                              <span className="text-[#5F6368] italic text-[11px]">—</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Scored / Conceded runs */}
                      <div className="border-t border-[#F0F0EE] pt-2.5 mt-3 flex items-center justify-between text-[11px] text-[#5F6368]">
                        <span>Scored: <strong className="text-[#111111]">{team.runsFor} runs</strong> ({team.oversForText} ov)</span>
                        <span>Conceded: <strong className="text-[#111111]">{team.runsAgainst} runs</strong> ({team.oversAgainstText} ov)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==================================================================== */}
            {/* 5. OFFICIAL KNOCKOUT STAGE SCHEDULE */}
            {/* ==================================================================== */}
            <div className="bg-[#121316] text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928]">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide">Official Knockout Qualification</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Top 2 from Group A &amp; Top 2 from Group B</p>
                  </div>
                </div>

                <Link
                  to="/rules"
                  className="text-[10px] font-black uppercase tracking-wider text-[#D9A928] hover:underline flex items-center gap-1"
                >
                  <span>View Rules</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#D9A928] uppercase">Semi-Final 1 (Match 10)</span>
                    <p className="text-xs font-black text-white mt-1">Group A Winner</p>
                    <p className="text-[10px] text-white/40 font-bold">vs</p>
                    <p className="text-xs font-black text-white">Group B Runner-up</p>
                  </div>
                  <span className="text-[9px] text-white/40 font-bold uppercase">Scheduled by Admin</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#D9A928] uppercase">Semi-Final 2 (Match 11)</span>
                    <p className="text-xs font-black text-white mt-1">Group B Winner</p>
                    <p className="text-[10px] text-white/40 font-bold">vs</p>
                    <p className="text-xs font-black text-white">Group A Runner-up</p>
                  </div>
                  <span className="text-[9px] text-white/40 font-bold uppercase">Scheduled by Admin</span>
                </div>

                <div className="bg-[#D9A928]/10 border border-[#D9A928]/30 rounded-2xl p-4 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#D9A928] uppercase">The Final (Match 12)</span>
                    <p className="text-xs font-black text-white mt-1">Winner Semi-Final 1</p>
                    <p className="text-[10px] text-white/40 font-bold">vs</p>
                    <p className="text-xs font-black text-white">Winner Semi-Final 2</p>
                  </div>
                  <span className="text-[9px] text-[#D9A928] font-bold uppercase">Championship Match</span>
                </div>
              </div>
            </div>

          </>
        )}

      </div>
    </AppShell>
  );
}
