import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Flame,
  Shield,
  Trophy,
  Activity,
  Award,
  Zap,
  Target,
  User,
  Radio,
  Calendar,
  ArrowRight,
} from "lucide-react";
import type { Player, Team, Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { useMatchStore } from "@/lib/scoring/store";
import { calculatePlayerPerformance } from "@/lib/scoring/playerPerformance";
import { formatMatchDate } from "@/lib/utils";

interface PublicPlayerProfileProps {
  player: Player;
  team?: Team;
  allMatches: Match[];
}

export function PublicPlayerProfile({ player, team, allMatches }: PublicPlayerProfileProps) {
  const router = useRouter();

  // Find if there is an active live match involving this player's team
  const liveMatch = allMatches.find((m) => m.status === "LIVE" && (m.teamAId === player.teamId || m.teamBId === player.teamId));

  // Live match store connection (reactively subscribes to realtime deliveries)
  const liveStore = useMatchStore(liveMatch?.id ?? "");

  // Calculate real aggregated performance
  const stats = calculatePlayerPerformance(
    player.id,
    allMatches,
    liveStore.state,
    liveMatch?.id,
  );

  const teamData = team ?? lookup.team(player.teamId);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 pb-20 flex flex-col gap-6">
      {/* ── TOP NAVIGATION BAR ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.history.back();
            } else {
              router.navigate({ to: "/home" });
            }
          }}
          className="tap inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-black uppercase tracking-wider text-[#111111] hover:bg-[#F7F7F5] shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] bg-black px-3 py-1 rounded-full shadow-sm">
          TPL 2026 PLAYER PROFILE
        </span>
      </div>

      {/* ── PLAYER HERO BANNER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121316] border border-white/[0.12] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A928]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar / Photo */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 shrink-0 rounded-2xl bg-black/60 border-2 border-[#D9A928]/40 p-1 flex items-center justify-center shadow-lg overflow-hidden">
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.name}
                className="h-full w-full object-cover rounded-xl"
              />
            ) : (
              <User className="h-14 w-14 text-white/40" />
            )}
            {teamData?.logoUrl && (
              <div className="absolute bottom-1 right-1 h-7 w-7 rounded-lg bg-black/80 border border-white/20 p-0.5 shadow">
                <img src={teamData.logoUrl} alt="" className="h-full w-full object-contain" />
              </div>
            )}
          </div>

          {/* Player Identity */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-center">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9A928] text-black text-[10px] font-black uppercase tracking-widest">
                {player.role}
              </span>
              {player.referenceId && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-mono">
                  #{player.referenceId}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              {player.name}
            </h1>

            <p className="text-xs sm:text-sm font-bold text-[#D9A928] uppercase tracking-wider mt-1">
              {teamData?.name ?? "Team TPL"}
            </p>
          </div>

          {/* Top Quick Summary Badges */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl shrink-0">
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black text-white tabular-nums">
                {stats.matchesPlayed}
              </p>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Matches</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black text-[#D9A928] tabular-nums">
                {stats.batting.runs}
              </p>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Runs</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black text-[#F4C542] tabular-nums">
                {stats.bowling.wickets}
              </p>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Wickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE MATCH PERFORMANCE STRIP (IF ACTIVELY LIVE) ───────────── */}
      {stats.currentLiveMatch && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-black to-[#121316] border border-red-500/30 shadow-lg text-white">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                LIVE IN MATCH #{stats.currentLiveMatch.match.matchNumber}
              </span>
            </div>
            <Link
              to="/scorecard/$matchId"
              params={{ matchId: stats.currentLiveMatch.match.id }}
              className="text-[10px] font-black text-[#D9A928] uppercase hover:underline flex items-center gap-1"
            >
              Open Match Centre <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.currentLiveMatch.liveBatterStat && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-white/60 uppercase">Current Batting</p>
                <p className="text-lg font-black text-white mt-0.5">
                  {stats.currentLiveMatch.liveBatterStat.runs}
                  {!stats.currentLiveMatch.liveBatterStat.out && "*"}
                  <span className="text-xs font-bold text-white/60 ml-1">
                    ({stats.currentLiveMatch.liveBatterStat.balls}b)
                  </span>
                </p>
                <p className="text-[10px] text-white/60 font-medium mt-1">
                  4s: {stats.currentLiveMatch.liveBatterStat.fours} • 6s: {stats.currentLiveMatch.liveBatterStat.sixes} • SR: {stats.currentLiveMatch.liveBatterStat.strikeRate.toFixed(1)}
                </p>
              </div>
            )}

            {stats.currentLiveMatch.liveBowlerStat && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-white/60 uppercase">Current Bowling</p>
                <p className="text-lg font-black text-[#D9A928] mt-0.5">
                  {stats.currentLiveMatch.liveBowlerStat.wickets}/{stats.currentLiveMatch.liveBowlerStat.runs}
                  <span className="text-xs font-bold text-white/60 ml-1">
                    ({stats.currentLiveMatch.liveBowlerStat.oversText} ov)
                  </span>
                </p>
                <p className="text-[10px] text-white/60 font-medium mt-1">
                  Econ: {stats.currentLiveMatch.liveBowlerStat.economy.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BATTING & BOWLING STAT CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── BATTING PERFORMANCE ────────────────────────────────────── */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#D9A928]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                BATTING PERFORMANCE
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#5F6368] uppercase">TPL 2026</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
              <p className="text-xl font-black text-[#111111] tabular-nums">{stats.batting.runs}</p>
              <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Runs</p>
            </div>
            <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
              <p className="text-xl font-black text-[#111111] tabular-nums">{stats.batting.balls}</p>
              <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Balls</p>
            </div>
            <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
              <p className="text-xl font-black text-[#D9A928] tabular-nums">
                {stats.batting.strikeRate > 0 ? stats.batting.strikeRate.toFixed(1) : "-"}
              </p>
              <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Strike Rate</p>
            </div>
            <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
              <p className="text-xl font-black text-[#111111] tabular-nums">
                {stats.batting.highestScore.runs}
                {stats.batting.highestScore.isNotOut && "*"}
              </p>
              <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Highest</p>
            </div>
            <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
              <p className="text-xl font-black text-[#111111] tabular-nums">
                {stats.batting.average > 0 ? stats.batting.average.toFixed(1) : "-"}
              </p>
              <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Average</p>
            </div>
            <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
              <p className="text-xl font-black text-[#111111] tabular-nums">
                {stats.batting.fours + stats.batting.sixes}
              </p>
              <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Boundaries</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-[#5F6368] pt-2 px-1">
            <span>4s: <strong className="text-[#111111]">{stats.batting.fours}</strong></span>
            <span>6s: <strong className="text-[#111111]">{stats.batting.sixes}</strong></span>
            <span>50s: <strong className="text-[#111111]">{stats.batting.fifties}</strong></span>
            <span>Not Outs: <strong className="text-[#111111]">{stats.batting.notOuts}</strong></span>
          </div>
        </div>

        {/* ── BOWLING PERFORMANCE ────────────────────────────────────── */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#D9A928]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                BOWLING PERFORMANCE
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#5F6368] uppercase">TPL 2026</span>
          </div>

          {stats.bowling.hasBowled ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
                  <p className="text-xl font-black text-[#D9A928] tabular-nums">{stats.bowling.wickets}</p>
                  <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Wickets</p>
                </div>
                <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
                  <p className="text-xl font-black text-[#111111] tabular-nums">{stats.bowling.oversText}</p>
                  <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Overs</p>
                </div>
                <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
                  <p className="text-xl font-black text-[#111111] tabular-nums">
                    {stats.bowling.economy > 0 ? stats.bowling.economy.toFixed(2) : "-"}
                  </p>
                  <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Economy</p>
                </div>
                <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
                  <p className="text-xl font-black text-[#111111] tabular-nums">
                    {stats.bowling.bestBowling.wickets > 0
                      ? `${stats.bowling.bestBowling.wickets}/${stats.bowling.bestBowling.runs}`
                      : "-"}
                  </p>
                  <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Best</p>
                </div>
                <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
                  <p className="text-xl font-black text-[#111111] tabular-nums">{stats.bowling.runsConceded}</p>
                  <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Runs Conceded</p>
                </div>
                <div className="bg-[#F7F7F5] p-3 rounded-2xl text-center">
                  <p className="text-xl font-black text-[#111111] tabular-nums">{stats.bowling.maidens}</p>
                  <p className="text-[9px] font-bold text-[#5F6368] uppercase tracking-wider">Maidens</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#5F6368] pt-2 px-1">
                <span>Innings: <strong className="text-[#111111]">{stats.bowling.innings}</strong></span>
                <span>Avg: <strong className="text-[#111111]">{stats.bowling.average > 0 ? stats.bowling.average.toFixed(1) : "-"}</strong></span>
              </div>
            </>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-[#5F6368]/30" />
              <p className="text-xs font-bold text-[#5F6368]">No bowling performance recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── FIELDING PERFORMANCE ───────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3 mb-4">
          <Shield className="h-4 w-4 text-[#D9A928]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
            FIELDING PERFORMANCE
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#F7F7F5] p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-[#111111] tabular-nums">{stats.fielding.catches}</p>
            <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider mt-0.5">Catches</p>
          </div>
          <div className="bg-[#F7F7F5] p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-[#111111] tabular-nums">{stats.fielding.runOuts}</p>
            <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider mt-0.5">Run Outs</p>
          </div>
          <div className="bg-[#F7F7F5] p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-[#111111] tabular-nums">{stats.fielding.stumpings}</p>
            <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider mt-0.5">Stumpings</p>
          </div>
        </div>
      </div>

      {/* ── MATCH HISTORY / PERFORMANCE TIMELINE ──────────────────────── */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#D9A928]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
              MATCH HISTORY
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#5F6368] uppercase">TPL 2026</span>
        </div>

        {stats.matchHistory.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#E5E5E5]">
            {stats.matchHistory.map((m) => (
              <div key={m.matchId} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] p-1 flex items-center justify-center">
                    {m.opponentTeamLogo ? (
                      <img src={m.opponentTeamLogo} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-black text-[#D9A928]">VS</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#111111] uppercase tracking-wide">
                      Match #{m.matchNumber} vs {m.opponentTeamName}
                    </p>
                    <p className="text-[10px] text-[#5F6368] font-medium">
                      {formatMatchDate(m.matchDate)} {m.resultText ? `• ${m.resultText}` : ""}
                    </p>
                  </div>
                </div>

                {/* Match Figures */}
                <div className="flex items-center gap-4 text-xs">
                  {m.batting && (
                    <div className="text-right">
                      <p className="font-black text-[#111111] tabular-nums">
                        {m.batting.runs}
                        {m.batting.isNotOut && "*"} ({m.batting.balls})
                      </p>
                      <p className="text-[9px] text-[#5F6368] font-bold">
                        {m.batting.fours}x4 • {m.batting.sixes}x6
                      </p>
                    </div>
                  )}

                  {m.bowling && (
                    <div className="text-right">
                      <p className="font-black text-[#9A6A05] tabular-nums">
                        {m.bowling.wickets}/{m.bowling.runs}
                      </p>
                      <p className="text-[9px] text-[#5F6368] font-bold">
                        {m.bowling.oversText} ov
                      </p>
                    </div>
                  )}

                  <Link
                    to="/scorecard/$matchId"
                    params={{ matchId: m.matchId }}
                    className="tap px-3 py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
                  >
                    Match Centre →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-[#5F6368]/30" />
            <p className="text-xs font-bold text-[#5F6368]">
              No match performance recorded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
