import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Match, MatchState, InningsState, Delivery } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText, describeDelivery, ballLabel } from "@/lib/scoring/engine";
import {
  ChevronLeft,
  Radio,
  Trophy,
  Activity,
  Flame,
  Layers,
  MapPin,
  Clock,
  Users,
  Award,
  Sparkles,
  Zap,
} from "lucide-react";

import { formatMatchTime, formatDeliveryTimestamp } from "@/lib/utils";

interface PublicMatchCentreProps {
  match: Match;
  state?: MatchState;
}

type TabType = "overview" | "scorecard" | "ballbyball" | "partnerships" | "playingxi";

export function PublicMatchCentre({ match, state }: PublicMatchCentreProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const teamA = lookup.team(match.teamAId);
  const teamB = lookup.team(match.teamBId);

  const isLive = match.status === "LIVE" || state?.phase === "innings1" || state?.phase === "innings2";
  const isDone = match.status === "COMPLETED" || state?.phase === "complete";

  const currentInningsIndex = state?.currentInningsIndex ?? 0;
  const currentInnings = state?.innings[currentInningsIndex];
  const firstInnings = state?.innings[0];
  const secondInnings = state?.innings[1];

  const battingTeam = currentInnings ? lookup.team(currentInnings.battingTeamId) : teamA;
  const bowlingTeam = currentInnings ? lookup.team(currentInnings.bowlingTeamId) : teamB;

  // Active batters
  const activeBatters = currentInnings?.batters.filter((b) => !b.out) ?? [];
  const striker = activeBatters.find((b) => b.playerId === currentInnings?.strikerId);
  const nonStriker = activeBatters.find((b) => b.playerId === currentInnings?.nonStrikerId);

  // Active bowler
  const activeBowler = currentInnings?.bowlers.find(
    (b) => b.playerId === currentInnings?.currentBowlerId,
  );

  // Top performers on complete
  const allBatters = state?.innings.flatMap((inn) => inn.batters) ?? [];
  const allBowlers = state?.innings.flatMap((inn) => inn.bowlers) ?? [];
  const topBatter = [...allBatters].sort((a, b) => b.runs - a.runs)[0];
  const topBowler = [...allBowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];

  const time = formatMatchTime(match?.scheduledAt);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* ── Top Nav Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/matches"
          className="tap inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-black text-[#111111] shadow-sm hover:bg-[#F7F7F5] transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>ALL MATCHES</span>
        </Link>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A928] text-black text-[10px] font-black tracking-widest uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
              LIVE MATCH CENTRE
            </span>
          )}
          {isDone && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black tracking-widest uppercase">
              FINAL RESULT
            </span>
          )}
        </div>
      </div>

      {/* ── Main Score Hero Card ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121316] border border-white/10 text-white shadow-2xl p-5 sm:p-7">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A928]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Match Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-5 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#D9A928] uppercase tracking-wider">{match.tournament}</span>
            <span>•</span>
            <span className="font-bold">Match #{String(match.matchNumber).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#D9A928]" /> {time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#D9A928]" /> {match.venue}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[#D9A928]" /> {match.overs} Overs
            </span>
          </div>
        </div>

        {/* Teams & Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Team A */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            currentInnings?.battingTeamId === teamA?.id
              ? "bg-white/[0.08] border-[#D9A928]/40 shadow-inner"
              : "bg-white/[0.03] border-white/5"
          }`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-black/40 border border-white/10 p-1 flex items-center justify-center shrink-0">
                {teamA?.logoUrl ? (
                  <img src={teamA.logoUrl} alt={teamA.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs font-black text-[#D9A928]">{teamA?.shortName ?? "TPL"}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black text-white truncate">{teamA?.name}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">
                  {currentInnings?.battingTeamId === teamA?.id ? "Batting" : "Bowling"}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              {firstInnings && firstInnings.battingTeamId === teamA?.id ? (
                <>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {firstInnings.runs}<span className="text-[#D9A928] text-xl font-bold">/{firstInnings.wickets}</span>
                  </p>
                  <p className="text-[11px] text-white/60 font-bold tabular-nums">{firstInnings.oversText} ov</p>
                </>
              ) : secondInnings && secondInnings.battingTeamId === teamA?.id ? (
                <>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {secondInnings.runs}<span className="text-[#D9A928] text-xl font-bold">/{secondInnings.wickets}</span>
                  </p>
                  <p className="text-[11px] text-white/60 font-bold tabular-nums">{secondInnings.oversText} ov</p>
                </>
              ) : (
                <p className="text-sm font-bold text-white/40">Yet to bat</p>
              )}
            </div>
          </div>

          {/* Team B */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            currentInnings?.battingTeamId === teamB?.id
              ? "bg-white/[0.08] border-[#D9A928]/40 shadow-inner"
              : "bg-white/[0.03] border-white/5"
          }`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-black/40 border border-white/10 p-1 flex items-center justify-center shrink-0">
                {teamB?.logoUrl ? (
                  <img src={teamB.logoUrl} alt={teamB.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs font-black text-[#D9A928]">{teamB?.shortName ?? "TPL"}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black text-white truncate">{teamB?.name}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">
                  {currentInnings?.battingTeamId === teamB?.id ? "Batting" : "Bowling"}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              {firstInnings && firstInnings.battingTeamId === teamB?.id ? (
                <>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {firstInnings.runs}<span className="text-[#D9A928] text-xl font-bold">/{firstInnings.wickets}</span>
                  </p>
                  <p className="text-[11px] text-white/60 font-bold tabular-nums">{firstInnings.oversText} ov</p>
                </>
              ) : secondInnings && secondInnings.battingTeamId === teamB?.id ? (
                <>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {secondInnings.runs}<span className="text-[#D9A928] text-xl font-bold">/{secondInnings.wickets}</span>
                  </p>
                  <p className="text-[11px] text-white/60 font-bold tabular-nums">{secondInnings.oversText} ov</p>
                </>
              ) : (
                <p className="text-sm font-bold text-white/40">Yet to bat</p>
              )}
            </div>
          </div>
        </div>

        {/* Live Match Situation Banner */}
        {currentInnings && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold">
                <Activity className="h-4 w-4 text-[#D9A928]" />
                CRR: <span className="font-black text-[#D9A928]">{(currentInnings.crr ?? 0).toFixed(2)}</span>
              </span>

              {currentInnings.target && currentInnings.runsNeeded !== undefined && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="font-bold">
                    Target: <span className="font-black text-white">{currentInnings.target}</span>
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="font-bold text-[#D9A928]">
                    Need {currentInnings.runsNeeded} off {currentInnings.ballsRemaining} balls (RRR {(currentInnings.requiredRunRate ?? 0).toFixed(2)})
                  </span>
                </>
              )}
            </div>

            {state?.resultText && (
              <div className="px-3 py-1 rounded-full bg-[#D9A928] text-black font-black uppercase text-[11px] tracking-wide">
                {state.resultText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Public Read-Only Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[#E5E5E5] overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "scorecard", label: "Scorecard", icon: Layers },
          { id: "ballbyball", label: "Ball by Ball", icon: Zap },
          { id: "partnerships", label: "Partnerships", icon: Flame },
          { id: "playingxi", label: "Playing XI", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`tap flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#D9A928] text-[#111111] bg-white rounded-t-xl"
                  : "border-transparent text-[#5F6368] hover:text-[#111111]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#D9A928]" : "text-current"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Current Batters & Bowler Card (If Live) */}
          {currentInnings && !currentInnings.isComplete && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Batters */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-[#E5E5E5] pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                    Current Batters
                  </span>
                  <span className="text-[10px] font-bold text-[#5F6368]">R (B) • 4s • 6s • SR</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[striker, nonStriker].filter(Boolean).map((b) => {
                    const p = lookup.player(b!.playerId);
                    const isStriker = b!.playerId === currentInnings.strikerId;
                    const sr = b!.balls > 0 ? ((b!.runs / b!.balls) * 100).toFixed(1) : "-";
                    return (
                      <div key={b!.playerId} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-[#111111] flex items-center gap-1.5 truncate">
                            {p?.name ?? "Batter"}
                            {isStriker && <span className="text-[#D9A928] font-black">*</span>}
                          </p>
                          <p className="text-[10px] text-[#5F6368] font-bold">
                            {isStriker ? "On Strike" : "Non-Striker"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#111111] tabular-nums">
                            {b!.runs} <span className="text-xs text-[#5F6368]">({b!.balls})</span>
                          </p>
                          <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                            4s: {b!.fours} • 6s: {b!.sixes} • SR: {sr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bowler & Recent Balls */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-[#E5E5E5] pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                      Current Bowler
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368]">O • M • R • W • Econ</span>
                  </div>
                  {activeBowler ? (
                    (() => {
                      const p = lookup.player(activeBowler.playerId);
                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-black text-[#111111]">{p?.name ?? "Bowler"}</p>
                            <p className="text-[10px] text-[#5F6368] font-bold">{p?.role ?? "Bowling"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#111111] tabular-nums">
                              <span className="text-[#9A6A05]">{activeBowler.wickets}</span>/{activeBowler.runs}{" "}
                              <span className="text-xs text-[#5F6368]">({oversText(activeBowler.legalBalls)} ov)</span>
                            </p>
                            <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                              Econ: {(activeBowler.economy ?? 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-[#5F6368] italic">Next bowler awaiting selection</p>
                  )}
                </div>

                {/* Recent Balls Strip */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-2">
                    Recent Deliveries
                  </p>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {currentInnings.recentBalls.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">Innings starting...</span>
                    ) : (
                      currentInnings.recentBalls.map((b, bi) => {
                        const isWicket = b.kind === "wicket";
                        const isBoundary = b.kind === "boundary";
                        const isExtra = b.kind === "extra";
                        const isDot = b.kind === "dot";

                        return (
                          <span
                            key={bi}
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${
                              isWicket
                                ? "bg-red-600 text-white animate-pulse font-black"
                                : isBoundary
                                ? "bg-[#D9A928] text-black font-black"
                                : isExtra
                                ? "bg-amber-500/20 text-amber-800 border border-amber-500/40"
                                : isDot
                                ? "bg-[#E5E5E5] text-[#5F6368]"
                                : "bg-black text-white"
                            }`}
                          >
                            {b.label}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Match Highlights */}
          {isDone && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topBatter && (
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm text-center">
                  <div className="h-9 w-9 mx-auto rounded-full bg-[#D9A928]/15 text-[#9A6A05] flex items-center justify-center mb-2">
                    <Award className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">Top Batter</p>
                  <p className="text-sm font-black text-[#111111] mt-1">
                    {lookup.player(topBatter.playerId)?.name ?? "Player"}
                  </p>
                  <p className="text-xs font-bold text-[#D9A928] mt-0.5">
                    {topBatter.runs} runs ({topBatter.balls}b)
                  </p>
                </div>
              )}

              {topBowler && (
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm text-center">
                  <div className="h-9 w-9 mx-auto rounded-full bg-black/5 text-[#111111] flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">Best Bowler</p>
                  <p className="text-sm font-black text-[#111111] mt-1">
                    {lookup.player(topBowler.playerId)?.name ?? "Player"}
                  </p>
                  <p className="text-xs font-bold text-[#111111] mt-0.5">
                    {topBowler.wickets} / {topBowler.runs} ({oversText(topBowler.legalBalls)} ov)
                  </p>
                </div>
              )}

              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm text-center">
                <div className="h-9 w-9 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                  <Trophy className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">Match Result</p>
                <p className="text-xs font-black text-[#111111] mt-1 line-clamp-2">
                  {state?.resultText ?? match.resultText ?? "Match Concluded"}
                </p>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm text-center">
                <div className="h-9 w-9 mx-auto rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">Total Boundaries</p>
                <p className="text-base font-black text-[#111111] mt-1">
                  {allBatters.reduce((acc, b) => acc + b.fours, 0)} <span className="text-xs text-[#5F6368]">Fours</span> ·{" "}
                  {allBatters.reduce((acc, b) => acc + b.sixes, 0)} <span className="text-xs text-[#5F6368]">Sixes</span>
                </p>
              </div>
            </div>
          )}

          {/* Quick Innings Summary Cards */}
          {state?.innings.map((inn, idx) => {
            const team = lookup.team(inn.battingTeamId);
            return (
              <div key={inn.index} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928]">
                      {idx === 0 ? "1st Innings" : "2nd Innings"}
                    </span>
                    <h3 className="text-base font-black text-[#111111]">{team?.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#111111]">
                      {inn.runs}<span className="text-[#D9A928]">/{inn.wickets}</span>
                    </p>
                    <p className="text-xs text-[#5F6368] font-bold">{inn.oversText} overs (RR: {(inn.crr ?? 0).toFixed(2)})</p>
                  </div>
                </div>

                {/* Top 3 scorers for this innings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[...inn.batters]
                    .sort((a, b) => b.runs - a.runs)
                    .slice(0, 3)
                    .map((b) => {
                      const p = lookup.player(b.playerId);
                      return (
                        <div key={b.playerId} className="p-2.5 rounded-xl bg-[#F7F7F5] flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111111] truncate">{p?.name ?? b.playerId}</span>
                          <span className="text-xs font-black text-[#111111] tabular-nums">
                            {b.runs} <span className="text-[10px] text-[#5F6368]">({b.balls})</span>
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: SCORECARD ────────────────────────────────────────── */}
      {activeTab === "scorecard" && (
        <div className="flex flex-col gap-8">
          {state?.innings && state.innings.length > 0 ? (
            state.innings.map((inn, i) => {
              const team = lookup.team(inn.battingTeamId);
              const sortedBatters = [...inn.batters].sort((a, b) => a.battingPosition - b.battingPosition);
              const sortedBowlers = [...inn.bowlers].sort((a, b) => b.wickets - a.wickets || (a.economy ?? 0) - (b.economy ?? 0));

              return (
                <div key={inn.index} className="flex flex-col gap-5">
                  {/* Innings Banner */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928]">
                        {i === 0 ? "1st Innings" : "2nd Innings"}
                      </span>
                      <h3 className="text-lg font-black text-[#111111]">{team?.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-[#111111]">
                        {inn.runs}<span className="text-[#D9A928]">/{inn.wickets}</span>
                      </p>
                      <p className="text-xs text-[#5F6368] font-bold">{inn.oversText} overs • RR {(inn.crr ?? 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Batting Table */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] bg-[#FAFAF8]">
                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                            Batting
                          </th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">R</th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">B</th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">4s</th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">6s</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-20">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {sortedBatters.map((b) => {
                          const p = lookup.player(b.playerId);
                          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
                          return (
                            <tr key={b.playerId} className={b.out ? "hover:bg-[#FAFAF8]" : "bg-[#D9A928]/5"}>
                              <td className="px-4 py-3">
                                <p className="font-extrabold text-[#111111]">{p?.name ?? b.playerId}</p>
                                <p className="text-[11px] text-[#5F6368] mt-0.5">
                                  {b.out ? b.dismissal : <span className="text-[#16A34A] font-bold">not out</span>}
                                </p>
                              </td>
                              <td className="px-3 py-3 text-right font-black text-[#111111] tabular-nums">{b.runs}</td>
                              <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.balls}</td>
                              <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.fours}</td>
                              <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.sixes}</td>
                              <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{sr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-[#E5E5E5] bg-[#FAFAF8]">
                          <td className="px-4 py-3 text-xs font-bold text-[#5F6368]" colSpan={6}>
                            Extras: <span className="font-extrabold text-[#111111]">{inn.extras}</span> (wides, no balls, byes, leg byes)
                            &nbsp;•&nbsp; Total: <span className="font-extrabold text-[#111111]">{inn.runs}/{inn.wickets}</span> ({inn.oversText} ov)
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Fall of Wickets */}
                  {inn.fallOfWickets.length > 0 && (
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-2">
                        Fall of Wickets
                      </p>
                      <p className="text-xs font-bold text-[#111111] leading-relaxed">
                        {inn.fallOfWickets.map((w, wi) => {
                          const p = lookup.player(w.batterOutId);
                          return `${wi + 1}-${w.runs} (${p?.shortName ?? "?"}, ${w.oversText} ov)`;
                        }).join("  •  ")}
                      </p>
                    </div>
                  )}

                  {/* Bowling Table */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] bg-[#FAFAF8]">
                          <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                            Bowling
                          </th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">O</th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">M</th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">R</th>
                          <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">W</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-20">Econ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {sortedBowlers.map((b) => {
                          const p = lookup.player(b.playerId);
                          return (
                            <tr key={b.playerId} className="hover:bg-[#FAFAF8]">
                              <td className="px-4 py-3 font-extrabold text-[#111111]">
                                {p?.name ?? b.playerId}
                              </td>
                              <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{oversText(b.legalBalls)}</td>
                              <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.maidens}</td>
                              <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.runs}</td>
                              <td className="px-3 py-3 text-right font-black text-[#9A6A05] bg-[#D9A928]/10 tabular-nums">{b.wickets}</td>
                              <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{(b.economy ?? 0).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card-surface p-12 text-center">
              <p className="text-sm font-bold text-[#5F6368]">No scorecard deliveries recorded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: BALL BY BALL ─────────────────────────────────────── */}
      {activeTab === "ballbyball" && (
        <div className="flex flex-col gap-4">
          {state?.innings && state.innings.some((i) => i.overGroups.length > 0) ? (
            state.innings.map((inn, innIdx) => {
              const team = lookup.team(inn.battingTeamId);
              return (
                <div key={inn.index} className="flex flex-col gap-4">
                  <div className="px-4 py-2 rounded-xl bg-black text-white text-xs font-black uppercase tracking-wider flex items-center justify-between">
                    <span>{innIdx === 0 ? "1st Innings" : "2nd Innings"} — {team?.name}</span>
                    <span>{inn.runs}/{inn.wickets} ({inn.oversText} ov)</span>
                  </div>

                  {inn.overGroups.map((og) => {
                    const bowler = lookup.player(og.bowlerId);
                    return (
                      <div key={og.overNumber} className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
                        {/* Over Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF8] border-b border-[#E5E5E5]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#D9A928] text-black text-[10px] font-black uppercase">
                              Over {og.overNumber}
                            </span>
                            <span className="text-xs font-black text-[#111111]">
                              {bowler?.name ?? "Bowler"}
                            </span>
                          </div>
                          <div className="text-right text-xs font-bold text-[#5F6368]">
                            {og.runs} runs • {og.wickets} wkt
                          </div>
                        </div>

                        {/* Deliveries list */}
                        <div className="divide-y divide-[#E5E5E5]">
                          {og.deliveries.map((d, dIdx) => {
                            const strikerP = lookup.player(d.strikerId);
                            const desc = describeDelivery(d);
                            const badge = ballLabel(d);

                            return (
                              <div key={d.id ?? dIdx} className="flex items-center justify-between px-4 py-3 hover:bg-[#FAFAF8]">
                                <div className="flex items-center gap-3">
                                  <span className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm bg-black text-white">
                                    {badge.label}
                                  </span>
                                  <div>
                                    <p className="text-xs font-black text-[#111111]">{desc}</p>
                                    <p className="text-[10px] text-[#5F6368]">{strikerP?.name ?? "Striker"}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-[#5F6368]">
                                  {formatDeliveryTimestamp(d?.timestamp)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="card-surface p-12 text-center">
              <p className="text-sm font-bold text-[#5F6368]">Ball-by-ball commentary will appear as deliveries are bowled.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: PARTNERSHIPS ─────────────────────────────────────── */}
      {activeTab === "partnerships" && (
        <div className="flex flex-col gap-6">
          {currentInnings?.partnership && (
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] mb-1 block">
                Current Unbroken Partnership
              </span>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 text-[#D9A928]" />
                  <div>
                    <p className="text-base font-black text-[#111111]">
                      {lookup.player(currentInnings.partnership.batterAId ?? "")?.name ?? "Striker"} &{" "}
                      {lookup.player(currentInnings.partnership.batterBId ?? "")?.name ?? "Non-Striker"}
                    </p>
                    <p className="text-xs text-[#5F6368] font-bold">
                      {currentInnings.partnership.runs} runs off {currentInnings.partnership.balls} balls
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-[#111111]">{currentInnings.partnership.runs}</p>
                  <p className="text-[10px] text-[#5F6368] uppercase font-bold">Runs</p>
                </div>
              </div>
            </div>
          )}

          {/* Historical Fall of Wickets Partnerships */}
          {state?.innings.map((inn, idx) => (
            <div key={inn.index} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111] mb-3">
                {idx === 0 ? "1st Innings" : "2nd Innings"} Wicket Partnerships
              </h3>
              {inn.fallOfWickets.length > 0 ? (
                <div className="flex flex-col divide-y divide-[#E5E5E5]">
                  {inn.fallOfWickets.map((w, wi) => {
                    const p = lookup.player(w.batterOutId);
                    return (
                      <div key={wi} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-[#111111]">
                          Wicket {wi + 1}: <span className="font-black">{p?.name ?? "Batter"}</span>
                        </span>
                        <span className="font-black text-[#5F6368]">
                          {w.runs} runs at {w.oversText} ov
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#5F6368] italic">No wickets fallen in this innings.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 5: PLAYING XI ────────────────────────────────────────── */}
      {activeTab === "playingxi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A XI */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5E5E5]">
              <div className="h-10 w-10 rounded-xl bg-black/5 p-1 flex items-center justify-center">
                {teamA?.logoUrl ? <img src={teamA.logoUrl} alt={teamA.name} className="h-full w-full object-contain" /> : "🏏"}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#111111]">{teamA?.name}</h3>
                <p className="text-[10px] font-bold text-[#5F6368] uppercase">Playing XI</p>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-[#E5E5E5]">
              {(state?.setup.playingXI[teamA?.id ?? ""]?.playerIds ?? []).map((pId, pIdx) => {
                const player = lookup.player(pId);
                return (
                  <div key={pId} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111]">
                      {pIdx + 1}. {player?.name ?? pId}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368] px-2 py-0.5 rounded-full bg-[#F7F7F5]">
                      {player?.role ?? "Player"}
                    </span>
                  </div>
                );
              })}
              {(!state?.setup.playingXI[teamA?.id ?? ""]?.playerIds?.length) && (
                <p className="text-xs text-[#5F6368] italic py-4 text-center">Playing XI will be announced at toss.</p>
              )}
            </div>
          </div>

          {/* Team B XI */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5E5E5]">
              <div className="h-10 w-10 rounded-xl bg-black/5 p-1 flex items-center justify-center">
                {teamB?.logoUrl ? <img src={teamB.logoUrl} alt={teamB.name} className="h-full w-full object-contain" /> : "🏏"}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#111111]">{teamB?.name}</h3>
                <p className="text-[10px] font-bold text-[#5F6368] uppercase">Playing XI</p>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-[#E5E5E5]">
              {(state?.setup.playingXI[teamB?.id ?? ""]?.playerIds ?? []).map((pId, pIdx) => {
                const player = lookup.player(pId);
                return (
                  <div key={pId} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111]">
                      {pIdx + 1}. {player?.name ?? pId}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368] px-2 py-0.5 rounded-full bg-[#F7F7F5]">
                      {player?.role ?? "Player"}
                    </span>
                  </div>
                );
              })}
              {(!state?.setup.playingXI[teamB?.id ?? ""]?.playerIds?.length) && (
                <p className="text-xs text-[#5F6368] italic py-4 text-center">Playing XI will be announced at toss.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
