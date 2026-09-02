import type { Match } from "@/types/cricket";
import { BALLS_PER_OVER } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";
import { OpenersScreen } from "@/components/match/OpenersScreen";
import { Trophy, Flame, Target } from "lucide-react";

interface Props {
  match: Match;
  store: MatchStore;
}

export function InningsBreakScreen({ match, store }: Props) {
  const { state, doc } = store;
  const firstInnings = state?.innings[0];

  if (!firstInnings) return null;

  const battingTeam = lookup.team(firstInnings.battingTeamId);
  const chasingTeam = lookup.team(firstInnings.bowlingTeamId);

  // Top batter in 1st innings
  const topBatter = [...firstInnings.batters].sort((a, b) => b.runs - a.runs)[0];
  const topBatterPlayer = lookup.player(topBatter?.playerId);

  // Top bowler in 1st innings
  const topBowler = [...firstInnings.bowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
  const topBowlerPlayer = lookup.player(topBowler?.playerId);

  // Second innings target & balls calculation
  const secondInningsMaxOvers = doc.setup.secondInningsReducedOvers ?? doc.setup.reducedOvers ?? match.overs;
  const totalSecondInningsBalls = secondInningsMaxOvers * BALLS_PER_OVER;
  const target = firstInnings.runs + 1;

  // If 2nd innings not started yet — show break summary and opener selection
  const needsOpeners = !doc.secondInningsStarted;

  if (needsOpeners) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#111111] pb-16">
        {/* ── Summary Header Banner ────────────────────────────────────────── */}
        <div className="bg-[#111111] text-white px-4 pt-8 pb-10 border-b border-[#E5E5E5] shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A928]/20 text-[#D9A928] text-[10px] font-black uppercase tracking-widest mb-3">
              <Flame className="h-3 w-3" />
              Innings Break Complete
            </span>
            <p className="font-display text-2xl sm:text-3xl font-black text-white">
              {battingTeam?.name}
            </p>

            <div className="mt-3 flex items-baseline justify-center gap-2">
              <span className="font-display text-6xl sm:text-7xl font-black text-white tabular-nums">
                {firstInnings.runs}
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[#D9A928]">
                /{firstInnings.wickets}
              </span>
            </div>

            <p className="mt-2 text-xs font-bold text-white/70">
              {firstInnings.oversText} overs &middot; Run Rate: {firstInnings.crr.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ── Stats & Target Section ───────────────────────────────────────── */}
        <div className="px-4 py-6 mx-auto w-full max-w-md flex flex-col gap-5">
          {/* Target Banner */}
          <div className="rounded-3xl bg-[#D9A928] px-5 py-4 text-center shadow-lg shadow-[#D9A928]/20 text-[#111111]">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Target className="h-4 w-4" />
              <p className="text-[11px] font-black uppercase tracking-widest text-[#111111]/80">
                {chasingTeam?.name} Target
              </p>
            </div>
            <p className="font-display text-4xl sm:text-5xl font-black text-[#111111] leading-tight">
              {target}
            </p>
            <p className="text-xs font-black text-[#111111]/80 mt-0.5">
              runs to win in {totalSecondInningsBalls} balls ({secondInningsMaxOvers} overs)
            </p>
          </div>

          {/* Top Performances */}
          <div className="grid grid-cols-2 gap-3">
            {topBatterPlayer && topBatter && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] text-center shadow-xs">
                <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider mb-1">
                  1st Innings Top Batter
                </p>
                <p className="text-xs font-black text-[#111111] truncate">{topBatterPlayer.name}</p>
                <p className="font-display text-lg font-black text-[#9A6A05] mt-0.5">
                  {topBatter.runs} <span className="text-xs text-[#5F6368]">({topBatter.balls}b)</span>
                </p>
              </div>
            )}
            {topBowlerPlayer && topBowler && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] text-center shadow-xs">
                <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider mb-1">
                  1st Innings Top Bowler
                </p>
                <p className="text-xs font-black text-[#111111] truncate">{topBowlerPlayer.name}</p>
                <p className="font-display text-lg font-black text-[#9A6A05] mt-0.5">
                  {topBowler.wickets}/{topBowler.runs}
                </p>
              </div>
            )}
          </div>

          {/* ── Opener Selection Embedded ─────────────────────────────────── */}
          <div className="mt-2 p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-[#E5E5E5] pb-3">
              <Trophy className="h-5 w-5 text-[#9A6A05]" />
              <div>
                <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
                  Select Opening Batters
                </p>
                <p className="text-[10px] text-[#5F6368] font-bold">
                  {chasingTeam?.name} (Chasing {target} Runs)
                </p>
              </div>
            </div>
            <OpenersScreen match={match} store={store} secondInnings={true} embedded={true} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
