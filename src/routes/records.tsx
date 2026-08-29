import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { calculateTournamentStats, formatStatDecimal } from "@/lib/scoring/statistics";
import { lookup } from "@/lib/repositories";
import { StatisticsMethodologyModal } from "@/components/public/StatisticsMethodologyModal";
import {
  Trophy,
  Flame,
  Target,
  Zap,
  Sparkles,
  Shield,
  Star,
  Activity,
  Award,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
});

function RecordsPage() {
  const [showMethodology, setShowMethodology] = useState(false);
  const { data: matches = [], isLoading: loadingMatches } = useMatches();
  useTeams();

  const stats = useMemo(() => calculateTournamentStats(matches), [matches]);
  const completedCount = stats.completedMatchesCount;

  return (
    <AppShell title="TPL Record Book">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 pt-2 pb-16 px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-[#9A6A05]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111]">
                TPL 2026 RECORD BOOK
              </h1>
              <p className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider">
                Official All-Time Tournament Records & Historic Milestones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMethodology(true)}
              className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#222222] text-[10px] font-black text-[#D9A928] uppercase tracking-wider shadow-xs transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              <span>Record Methodology</span>
            </button>

            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-black text-[#5F6368] uppercase shadow-xs">
              {completedCount} Completed Matches
            </span>
          </div>
        </div>

        {/* Methodology Modal */}
        <StatisticsMethodologyModal
          isOpen={showMethodology}
          onClose={() => setShowMethodology(false)}
          initialCategory="RECORDS"
        />

        {/* ── BATTING RECORDS ────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
            <Flame className="h-5 w-5 text-orange-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
              Batting Records & Milestones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Highest Individual Score */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5F6368] block">
                  Highest Individual Score
                </span>
                {stats.highestInningsScores[0] ? (
                  <div className="mt-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.highestInningsScores[0].playerId }}
                      className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate"
                    >
                      {stats.highestInningsScores[0].playerName}
                    </Link>
                    <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                      {stats.highestInningsScores[0].teamShortName} vs {stats.highestInningsScores[0].opponentTeamName}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic mt-2">No data yet</p>
                )}
              </div>
              {stats.highestInningsScores[0] && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xl font-black text-[#111111] tabular-nums">
                    {stats.highestInningsScores[0].runs}{stats.highestInningsScores[0].isNotOut ? "*" : ""}
                    <span className="text-xs text-[#5F6368] font-bold ml-1">({stats.highestInningsScores[0].balls}b)</span>
                  </span>
                  <Link
                    to="/scorecard/$matchId"
                    params={{ matchId: stats.highestInningsScores[0].matchId }}
                    className="text-[10px] font-black uppercase text-[#9A6A05] hover:underline flex items-center gap-1"
                  >
                    <span>Match #{stats.highestInningsScores[0].matchNumber}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Most Sixes in Tournament */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5F6368] block">
                  Most Tournament Sixes
                </span>
                {stats.mostSixes[0] ? (
                  <div className="mt-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.mostSixes[0].playerId }}
                      className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate"
                    >
                      {stats.mostSixes[0].playerName}
                    </Link>
                    <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                      {stats.mostSixes[0].teamShortName} • {stats.mostSixes[0].runs} total runs
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic mt-2">No data yet</p>
                )}
              </div>
              {stats.mostSixes[0] && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xl font-black text-[#9A6A05] tabular-nums">
                    {stats.mostSixes[0].sixes} <span className="text-xs text-[#5F6368] font-bold">Sixes</span>
                  </span>
                  <Link to="/stats" className="text-[10px] font-black uppercase text-[#5F6368] hover:underline">
                    View Leaderboard
                  </Link>
                </div>
              )}
            </div>

            {/* Most Fours in Tournament */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5F6368] block">
                  Most Tournament Fours
                </span>
                {stats.mostFours[0] ? (
                  <div className="mt-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.mostFours[0].playerId }}
                      className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate"
                    >
                      {stats.mostFours[0].playerName}
                    </Link>
                    <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                      {stats.mostFours[0].teamShortName} • {stats.mostFours[0].runs} total runs
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic mt-2">No data yet</p>
                )}
              </div>
              {stats.mostFours[0] && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xl font-black text-[#111111] tabular-nums">
                    {stats.mostFours[0].fours} <span className="text-xs text-[#5F6368] font-bold">Fours</span>
                  </span>
                  <Link to="/stats" className="text-[10px] font-black uppercase text-[#5F6368] hover:underline">
                    View Leaderboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BOWLING RECORDS ────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
            <Target className="h-5 w-5 text-purple-700" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
              Bowling Records & Best Spells
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Best Bowling Figures in a Match */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5F6368] block">
                  Best Bowling Figures (Match)
                </span>
                {stats.bestBowlingSpells[0] ? (
                  <div className="mt-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.bestBowlingSpells[0].playerId }}
                      className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate"
                    >
                      {stats.bestBowlingSpells[0].playerName}
                    </Link>
                    <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                      {stats.bestBowlingSpells[0].teamShortName} vs {stats.bestBowlingSpells[0].opponentTeamName}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic mt-2">No data yet</p>
                )}
              </div>
              {stats.bestBowlingSpells[0] && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xl font-black text-purple-700 tabular-nums">
                    {stats.bestBowlingSpells[0].wickets}/{stats.bestBowlingSpells[0].runsConceded}
                    <span className="text-xs text-[#5F6368] font-bold ml-1">({stats.bestBowlingSpells[0].oversText} ov)</span>
                  </span>
                  <Link
                    to="/scorecard/$matchId"
                    params={{ matchId: stats.bestBowlingSpells[0].matchId }}
                    className="text-[10px] font-black uppercase text-[#9A6A05] hover:underline flex items-center gap-1"
                  >
                    <span>Match #{stats.bestBowlingSpells[0].matchNumber}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Most Tournament Wickets */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5F6368] block">
                  Most Tournament Wickets
                </span>
                {stats.purpleCap[0] ? (
                  <div className="mt-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.purpleCap[0].playerId }}
                      className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate"
                    >
                      {stats.purpleCap[0].playerName}
                    </Link>
                    <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                      {stats.purpleCap[0].teamShortName} • Econ {formatStatDecimal(stats.purpleCap[0].economy)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic mt-2">No data yet</p>
                )}
              </div>
              {stats.purpleCap[0] && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xl font-black text-purple-700 tabular-nums">
                    {stats.purpleCap[0].wickets} <span className="text-xs text-[#5F6368] font-bold">Wickets</span>
                  </span>
                  <Link to="/stats" className="text-[10px] font-black uppercase text-[#5F6368] hover:underline">
                    View Leaderboard
                  </Link>
                </div>
              )}
            </div>

            {/* Most Dot Balls Bowled */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5F6368] block">
                  Most Dot Balls Bowled
                </span>
                {stats.mostDotBalls[0] ? (
                  <div className="mt-2">
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: stats.mostDotBalls[0].playerId }}
                      className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate"
                    >
                      {stats.mostDotBalls[0].playerName}
                    </Link>
                    <p className="text-[11px] text-[#5F6368] font-bold mt-0.5">
                      {stats.mostDotBalls[0].teamShortName} • {stats.mostDotBalls[0].oversText} overs bowled
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic mt-2">No data yet</p>
                )}
              </div>
              {stats.mostDotBalls[0] && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xl font-black text-[#111111] tabular-nums">
                    {stats.mostDotBalls[0].dotBalls} <span className="text-xs text-[#5F6368] font-bold">Dots</span>
                  </span>
                  <Link to="/stats" className="text-[10px] font-black uppercase text-[#5F6368] hover:underline">
                    View Leaderboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TOURNAMENT AGGREGATE SUMMARY ───────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#121316] via-black to-[#121316] border border-[#D9A928]/30 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5">
            <Sparkles className="h-5 w-5 text-[#D9A928]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#D9A928]">
              Tournament Overall Numbers
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{stats.totalTournamentRuns}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase mt-1">Total Runs</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-2xl sm:text-3xl font-black text-[#D9A928] tabular-nums">{stats.totalTournamentWickets}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase mt-1">Total Wickets</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">{stats.totalTournamentSixes}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase mt-1">Total 6s</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-2xl sm:text-3xl font-black text-yellow-300 tabular-nums">{stats.totalTournamentFours}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase mt-1">Total 4s</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
