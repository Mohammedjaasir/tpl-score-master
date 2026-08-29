import React, { useMemo } from "react";
import { X, Trophy, Flame, User, ExternalLink, Compass } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Match, MatchState, Delivery } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { WagonWheel } from "@/components/scoring/WagonWheel";
import { calculateBatterWagonWheel } from "@/lib/scoring/wagon-wheel";
import { TeamLogo } from "@/components/team/TeamLogo";
import { oversText } from "@/lib/scoring/engine";

interface Props {
  playerId: string | null;
  onClose: () => void;
  match: Match;
  state?: MatchState;
  allDeliveries: { delivery: Delivery; innIndex: number; ballIndex: number; oversText: string }[];
  onSelectPlayer: (playerId: string) => void;
}

export function PlayerPerformanceModal({
  playerId,
  onClose,
  match,
  state,
  allDeliveries,
  onSelectPlayer,
}: Props) {
  if (!playerId) return null;

  const player = lookup.player(playerId);
  const team = player ? lookup.team(player.teamId) : null;

  // Find player's match batting stats in this match
  const batterStat = useMemo(() => {
    if (!state) return null;
    for (const inn of state.innings) {
      const b = inn.batters.find((item) => item.playerId === playerId);
      if (b) {
        return {
          ...b,
          inningsIndex: inn.index,
          teamName: lookup.team(inn.battingTeamId)?.shortName ?? "Batting",
        };
      }
    }
    return null;
  }, [state, playerId]);

  // Find player's match bowling stats in this match
  const bowlerStat = useMemo(() => {
    if (!state) return null;
    for (const inn of state.innings) {
      const b = inn.bowlers.find((item) => item.playerId === playerId);
      if (b) {
        return {
          ...b,
          inningsIndex: inn.index,
          teamName: lookup.team(inn.bowlingTeamId)?.shortName ?? "Bowling",
        };
      }
    }
    return null;
  }, [state, playerId]);

  // Extract deliveries where this player was the striker (canonical player ID filter)
  const playerDeliveries = useMemo(() => {
    return allDeliveries
      .filter((d) => d.delivery.strikerId === playerId)
      .map((d) => ({
        strikerId: d.delivery.strikerId,
        runsOffBat: d.delivery.batterRuns ?? (d.delivery as any).runsOffBat ?? (d.delivery as any).runs_off_bat ?? 0,
        shotZone: d.delivery.shotZone ?? (d.delivery as any).shot_zone ?? null,
        overNumber: (d.delivery as any).overNumber ?? 0,
        ballNumber: (d.delivery as any).ballNumber ?? 0,
      }));
  }, [allDeliveries, playerId]);

  const summary = useMemo(() => {
    if (!player) return null;
    return calculateBatterWagonWheel(
      playerId,
      player.name,
      playerDeliveries
    );
  }, [playerId, player, playerDeliveries]);

  // Collect all other active players in this match for quick switching
  const otherMatchPlayers = useMemo(() => {
    if (!state) return [];
    const list: { id: string; name: string; runs: number; balls: number; teamShort: string }[] = [];
    state.innings.forEach((inn) => {
      const innTeam = lookup.team(inn.battingTeamId);
      inn.batters.forEach((b) => {
        const p = lookup.player(b.playerId);
        if (p) {
          list.push({
            id: p.id,
            name: p.name,
            runs: b.runs,
            balls: b.balls,
            teamShort: innTeam?.shortName ?? "Team",
          });
        }
      });
    });
    return list;
  }, [state]);

  const sr = batterStat && batterStat.balls > 0
    ? ((batterStat.runs / batterStat.balls) * 100).toFixed(1)
    : "-";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#0B0F19] rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-2xl text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0F172A]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0">
              {player?.avatar ? (
                <img src={player.avatar} alt="" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <User className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide truncate">
                  {player?.name ?? "Player Performance"}
                </h3>
                {team && (
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-[#D9A928] border border-slate-700">
                    {team.shortName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {player?.role ?? "Player"} • Match #{match.matchNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/players/$playerId"
              params={{ playerId }}
              className="tap p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
              title="View Full Profile"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={onClose}
              className="tap h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white border border-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* Match Batting & Bowling Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Batting Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  Match Batting
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {batterStat ? (batterStat.out ? "Dismissed" : "Not Out") : "Did Not Bat"}
                </span>
              </div>

              {batterStat ? (
                <div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-white tabular-nums">{batterStat.runs}</span>
                      <span className="text-xs text-slate-400 font-bold ml-1.5">runs ({batterStat.balls} balls)</span>
                    </div>
                    <span className="text-xs font-black text-[#D9A928] tabular-nums">SR {sr}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      4s: <strong className="text-white">{batterStat.fours}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      6s: <strong className="text-white">{batterStat.sixes}</strong>
                    </span>
                  </div>
                  {batterStat.dismissal && (
                    <p className="text-[11px] text-slate-400 mt-2 italic border-t border-slate-800/80 pt-1.5 truncate">
                      {batterStat.dismissal}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">Did not bat in this match.</p>
              )}
            </div>

            {/* Bowling Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  Match Bowling
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {bowlerStat ? `${oversText(bowlerStat.legalBalls)} overs` : "Did Not Bowl"}
                </span>
              </div>

              {bowlerStat && bowlerStat.legalBalls > 0 ? (
                <div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-white tabular-nums">{bowlerStat.wickets}</span>
                      <span className="text-xs text-slate-400 font-bold ml-1">/ {bowlerStat.runs}</span>
                    </div>
                    <span className="text-xs font-black text-[#D9A928] tabular-nums">
                      Econ {bowlerStat.economy?.toFixed(2) ?? "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      Overs: <strong className="text-white">{oversText(bowlerStat.legalBalls)}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      Maidens: <strong className="text-white">{bowlerStat.maidens}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">Did not bowl in this match.</p>
              )}
            </div>
          </div>

          {/* Quick Player Switcher Bar */}
          {otherMatchPlayers.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Switch Batter Wagon Wheel
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {otherMatchPlayers.map((p) => {
                  const isSelected = p.id === playerId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p.id)}
                      className={`tap shrink-0 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#D9A928] text-black shadow-md"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? "bg-black/15 text-black" : "bg-slate-800 text-slate-400"}`}>
                        {p.runs} ({p.balls})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Player's Wagon Wheel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-4 w-4 text-[#D9A928]" />
              <h4 className="text-xs font-black uppercase tracking-widest text-white">
                Individual Scoring Wagon Wheel
              </h4>
            </div>

            {summary ? (
              <WagonWheel
                summary={summary}
                batterStat={batterStat ? {
                  runs: batterStat.runs,
                  balls: batterStat.balls,
                  fours: batterStat.fours,
                  sixes: batterStat.sixes,
                  strikeRate: batterStat.strikeRate ?? (batterStat.balls > 0 ? (batterStat.runs / batterStat.balls) * 100 : 0),
                } : undefined}
              />
            ) : (
              <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
                <p className="text-xs text-slate-400 font-bold">
                  NO SHOT LOCATION DATA RECORDED
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
