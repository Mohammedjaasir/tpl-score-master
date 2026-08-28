import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { calculateStandings } from "@/lib/scoring/standings";
import { Trophy, RefreshCw, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { TeamLogo } from "@/components/team/TeamLogo";

export const Route = createFileRoute("/pointables")({
  component: PointablesPage,
});

function PointablesPage() {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { data: matches = [], isLoading: loadingMatches, isError, refetch } = useMatches();

  const standings = calculateStandings(teams, matches);
  const completedCount = matches.filter((m) => m.status === "COMPLETED").length;
  const isLoading = (loadingTeams || loadingMatches) && teams.length === 0;

  return (
    <AppShell title="Pointables">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 pt-2 pb-16">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-[#9A6A05]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111]">
                POINTABLES
              </h1>
              <p className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider">
                TPL 2026 Tournament Standings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-black text-[#5F6368] uppercase shadow-xs">
              {completedCount} Completed {completedCount === 1 ? "Match" : "Matches"}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card-surface p-12 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
            <p className="text-xs font-bold text-[#5F6368]">Calculating tournament standings...</p>
          </div>
        )}

        {/* Error State */}
        {isError && teams.length === 0 && (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <AlertCircle className="h-8 w-8 text-[#D9A928]" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              Unable to load standings right now
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

        {/* Standings Table (Real Data) */}
        {!isLoading && standings.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#111111] text-white border-b border-black text-[10px] font-black uppercase tracking-wider">
                    <th className="px-3 sm:px-4 py-3.5 text-center w-12">POS</th>
                    <th className="px-3 sm:px-4 py-3.5 text-left min-w-[160px]">TEAM</th>
                    <th className="px-2.5 sm:px-3 py-3.5 text-center">P</th>
                    <th className="px-2.5 sm:px-3 py-3.5 text-center">W</th>
                    <th className="px-2.5 sm:px-3 py-3.5 text-center">L</th>
                    <th className="px-2 sm:px-3 py-3.5 text-center">T</th>
                    <th className="px-2 sm:px-3 py-3.5 text-center">NR</th>
                    <th className="px-3 sm:px-4 py-3.5 text-center font-black text-[#D9A928] bg-white/10">PTS</th>
                    <th className="px-3 sm:px-4 py-3.5 text-right font-black">NRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {standings.map((team, idx) => {
                    const isTop4 = idx < 4;
                    const nrrFormatted = (team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3));

                    return (
                      <tr
                        key={team.teamId}
                        className={`hover:bg-[#FAFAF8] transition-colors ${
                          idx === 0 ? "bg-[#D9A928]/5" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              idx === 0
                                ? "bg-[#D9A928] text-black shadow-xs"
                                : isTop4
                                ? "bg-black text-white"
                                : "text-[#5F6368]"
                            }`}
                          >
                            {team.pos}
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <TeamLogo
                              logoUrl={team.logoUrl}
                              name={team.teamName}
                              shortName={team.teamShortName}
                              size="xs"
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-[#111111] uppercase truncate">
                                {team.teamName}
                              </p>
                              <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                                {team.teamShortName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-2.5 sm:px-3 py-3.5 text-center font-bold text-[#5F6368] tabular-nums">
                          {team.played}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3.5 text-center font-black text-emerald-700 tabular-nums">
                          {team.won}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3.5 text-center font-bold text-rose-700 tabular-nums">
                          {team.lost}
                        </td>
                        <td className="px-2 sm:px-3 py-3.5 text-center font-bold text-[#5F6368] tabular-nums">
                          {team.tied}
                        </td>
                        <td className="px-2 sm:px-3 py-3.5 text-center font-bold text-[#5F6368] tabular-nums">
                          {team.noResult}
                        </td>
                        <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] bg-[#D9A928]/10 tabular-nums text-sm">
                          {team.points}
                        </td>
                        <td className="px-3 sm:px-4 py-3.5 text-right font-black tabular-nums text-[#111111]">
                          {team.played > 0 ? nrrFormatted : "0.000"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rules explanation footer */}
            <div className="bg-[#F7F7F5] border-t border-[#E5E5E5] px-4 py-3 text-[10px] text-[#5F6368] flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">
                Win: <strong className="text-[#111111]">2 pts</strong> • Tie/NR: <strong className="text-[#111111]">1 pt</strong> • Loss: <strong className="text-[#111111]">0 pts</strong>
              </span>
              <span className="font-bold">
                Top 4 teams qualify for knockouts
              </span>
            </div>
          </div>
        )}

        {/* Empty Standings State if 0 teams */}
        {!isLoading && standings.length === 0 && (
          <div className="card-surface p-12 text-center bg-white border border-[#E5E5E5] rounded-3xl flex flex-col items-center gap-3">
            <Trophy className="h-10 w-10 text-[#5F6368]/30" />
            <p className="text-sm font-black text-[#111111] uppercase">NO POINTS DATA AVAILABLE YET</p>
            <p className="text-xs text-[#5F6368]">Tournament teams and standings will appear here once loaded.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
