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

        {/* Standings Tables by Group */}
        {!isLoading && standings.length > 0 && (
          <div className="flex flex-col gap-8">
            {/* Group 1 Points Table */}
            {(() => {
              const group1Teams = teams.filter((t) => (t.groupName || "").includes("1") || (t.groupName || "").toUpperCase().includes("A"));
              const g1TeamIds = new Set(group1Teams.length > 0 ? group1Teams.map((t) => t.id) : teams.slice(0, 3).map((t) => t.id));
              const group1Standings = calculateStandings(
                teams.filter((t) => g1TeamIds.has(t.id)),
                matches
              );

              return (
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  {/* Group 1 Header */}
                  <div className="px-5 py-4 bg-[#111111] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#D9A928]" />
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                        GROUP 1 STANDINGS
                      </h2>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[#D9A928]/20 text-[#D9A928] border border-[#D9A928]/30">
                      Top 2 Qualify
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#4B5563] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 sm:px-4 py-3.5 text-center w-12">POS</th>
                          <th className="px-3 sm:px-4 py-3.5 text-left min-w-[160px]">TEAM</th>
                          <th className="px-2.5 sm:px-3 py-3.5 text-center">P</th>
                          <th className="px-2.5 sm:px-3 py-3.5 text-center">W</th>
                          <th className="px-2.5 sm:px-3 py-3.5 text-center">L</th>
                          <th className="px-2 sm:px-3 py-3.5 text-center">T</th>
                          <th className="px-2 sm:px-3 py-3.5 text-center">NR</th>
                          <th className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] bg-[#D9A928]/15">PTS</th>
                          <th className="px-3 sm:px-4 py-3.5 text-right font-black">NRR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {group1Standings.map((team, idx) => {
                          const isQualified = idx < 2;
                          const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3);

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
                                    isQualified
                                      ? "bg-[#D9A928] text-black shadow-xs"
                                      : "bg-slate-200 text-[#5F6368]"
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
                                    <div className="flex items-center gap-2">
                                      <p className="font-extrabold text-[#111111] uppercase truncate">
                                        {team.teamName}
                                      </p>
                                      {isQualified && (
                                        <span className="hidden sm:inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          QUALIFIED
                                        </span>
                                      )}
                                    </div>
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
                </div>
              );
            })()}

            {/* Group 2 Points Table */}
            {(() => {
              const group2Teams = teams.filter((t) => (t.groupName || "").includes("2") || (t.groupName || "").toUpperCase().includes("B"));
              const g2TeamIds = new Set(group2Teams.length > 0 ? group2Teams.map((t) => t.id) : teams.slice(3, 6).map((t) => t.id));
              const group2Standings = calculateStandings(
                teams.filter((t) => g2TeamIds.has(t.id)),
                matches
              );

              return (
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  {/* Group 2 Header */}
                  <div className="px-5 py-4 bg-[#111111] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                        GROUP 2 STANDINGS
                      </h2>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      Top 2 Qualify
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#F9FAFB] text-[#4B5563] border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider">
                          <th className="px-3 sm:px-4 py-3.5 text-center w-12">POS</th>
                          <th className="px-3 sm:px-4 py-3.5 text-left min-w-[160px]">TEAM</th>
                          <th className="px-2.5 sm:px-3 py-3.5 text-center">P</th>
                          <th className="px-2.5 sm:px-3 py-3.5 text-center">W</th>
                          <th className="px-2.5 sm:px-3 py-3.5 text-center">L</th>
                          <th className="px-2 sm:px-3 py-3.5 text-center">T</th>
                          <th className="px-2 sm:px-3 py-3.5 text-center">NR</th>
                          <th className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] bg-[#D9A928]/15">PTS</th>
                          <th className="px-3 sm:px-4 py-3.5 text-right font-black">NRR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {group2Standings.map((team, idx) => {
                          const isQualified = idx < 2;
                          const nrrFormatted = team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3);

                          return (
                            <tr
                              key={team.teamId}
                              className={`hover:bg-[#FAFAF8] transition-colors ${
                                idx === 0 ? "bg-purple-500/5" : ""
                              }`}
                            >
                              <td className="px-3 sm:px-4 py-3.5 text-center font-black text-[#111111] tabular-nums">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                                    isQualified
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "bg-slate-200 text-[#5F6368]"
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
                                    <div className="flex items-center gap-2">
                                      <p className="font-extrabold text-[#111111] uppercase truncate">
                                        {team.teamName}
                                      </p>
                                      {isQualified && (
                                        <span className="hidden sm:inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          QUALIFIED
                                        </span>
                                      )}
                                    </div>
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
                </div>
              );
            })()}

            {/* Standings Rules Summary Footer */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl px-5 py-3.5 text-xs text-[#5F6368] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <span className="font-bold">
                Points: <strong className="text-[#111111]">Win = 2 pts</strong> • <strong className="text-[#111111]">Tie / No Result = 1 pt</strong> • <strong className="text-[#111111]">Loss = 0 pts</strong>
              </span>
              <span className="font-bold">
                Official Sort: <strong className="text-[#111111]">Points → Net Run Rate (NRR) → Total Wins</strong>
              </span>
            </div>
          </div>
        )}

        {/* Official Knockout Stage Schedule Card */}
        <div className="bg-[#121316] text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928]">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide">Official Knockout Qualification</h3>
                <p className="text-[10px] text-white/50 font-bold uppercase">Top 2 from Group 1 &amp; Top 2 from Group 2</p>
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
                <p className="text-xs font-black text-white mt-1">Group 1 Winner</p>
                <p className="text-[10px] text-white/40 font-bold">vs</p>
                <p className="text-xs font-black text-white">Group 2 Runner-up</p>
              </div>
              <span className="text-[9px] text-white/40 font-bold uppercase">Scheduled by Admin</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-2">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#D9A928] uppercase">Semi-Final 2 (Match 11)</span>
                <p className="text-xs font-black text-white mt-1">Group 2 Winner</p>
                <p className="text-[10px] text-white/40 font-bold">vs</p>
                <p className="text-xs font-black text-white">Group 1 Runner-up</p>
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
