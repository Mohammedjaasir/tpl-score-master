import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { Match, MatchState, InningsState, Delivery, OverGroup } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText, describeDelivery, ballLabel } from "@/lib/scoring/engine";
import { calculateMatchMVP } from "@/lib/scoring/playerPerformance";
import { WagonWheel } from "@/components/scoring/WagonWheel";
import { calculateBatterWagonWheel } from "@/lib/scoring/wagon-wheel";
import { formatMatchCondition, type MatchCondition } from "@/lib/scoring/weather";
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
  Share2,
  Check,
  Filter,
  BarChart3,
  TrendingUp,
  Shield,
  Target,
  ArrowRight,
  User,
  CloudRain,
  Compass,
} from "lucide-react";
import { formatMatchTime, formatDeliveryTimestamp } from "@/lib/utils";
import { TeamLogo } from "@/components/team/TeamLogo";

interface PublicMatchCentreProps {
  match: Match;
  state?: MatchState;
  matchCondition?: MatchCondition;
}

type TabType = "overview" | "commentary" | "scorecard" | "stats" | "wagonwheel" | "playingxi";
type CommentaryFilter = "all" | "wickets" | "fours" | "sixes" | "extras";

export function PublicMatchCentre({ match, state, matchCondition }: PublicMatchCentreProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [commentaryFilter, setCommentaryFilter] = useState<CommentaryFilter>("all");
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAllOvers, setShowAllOvers] = useState(false);
  const [selectedWagonBatterId, setSelectedWagonBatterId] = useState<string | null>(null);

  const teamA = lookup.team(match.teamAId);
  const teamB = lookup.team(match.teamBId);

  // Exact Innings Order: 1st batting team always on top / first
  const battingFirstId = state?.innings[0]?.battingTeamId ?? state?.setup?.battingFirstId;
  const firstTeamId = battingFirstId ? battingFirstId : match.teamAId;
  const secondTeamId = firstTeamId === match.teamAId ? match.teamBId : match.teamAId;

  const teamFirst = lookup.team(firstTeamId);
  const teamSecond = lookup.team(secondTeamId);

  const isLive = match.status === "LIVE" || state?.phase === "innings1" || state?.phase === "innings2";
  const isDone = match.status === "COMPLETED" || state?.phase === "complete";

  const currentInningsIndex = state?.currentInningsIndex ?? 0;
  const currentInnings = state?.innings[currentInningsIndex];
  const firstInnings = state?.innings[0];
  const secondInnings = state?.innings[1];

  const battingTeam = currentInnings ? lookup.team(currentInnings.battingTeamId) : teamFirst;
  const bowlingTeam = currentInnings ? lookup.team(currentInnings.bowlingTeamId) : teamSecond;

  // Active Batters
  const activeBatters = currentInnings?.batters.filter((b) => !b.out) ?? [];
  const striker = activeBatters.find((b) => b.playerId === currentInnings?.strikerId);
  const nonStriker = activeBatters.find((b) => b.playerId === currentInnings?.nonStrikerId);

  // Active Bowler
  const activeBowler = currentInnings?.bowlers.find(
    (b) => b.playerId === currentInnings?.currentBowlerId,
  );

  // Deliveries list (flattened & chronological for commentary)
  const allDeliveries = useMemo(() => {
    const list: { delivery: Delivery; innIndex: number; ballIndex: number; oversText: string }[] = [];
    if (!state) return list;
    state.innings.forEach((inn, iIdx) => {
      inn.overGroups.forEach((og) => {
        og.balls.forEach((bs, bIdx) => {
          list.push({
            delivery: bs.delivery,
            innIndex: iIdx,
            ballIndex: bIdx,
            oversText: bs.oversText,
          });
        });
      });
    });
    return list.reverse(); // latest first
  }, [state]);

  // Filtered Commentary
  const filteredDeliveries = useMemo(() => {
    return allDeliveries.filter(({ delivery }) => {
      if (!delivery) return false;
      if (commentaryFilter === "all") return true;
      if (commentaryFilter === "wickets") return !!delivery.wicket;
      if (commentaryFilter === "fours") return !delivery.extraType && delivery.batterRuns === 4;
      if (commentaryFilter === "sixes") return !delivery.extraType && delivery.batterRuns === 6;
      if (commentaryFilter === "extras") return !!delivery.extraType;
      return true;
    });
  }, [allDeliveries, commentaryFilter]);

  // Deterministic Match Statistics & Team Boundaries
  const matchStats = useMemo(() => {
    const allBattersList = state?.innings.flatMap((inn) => inn.batters) ?? [];
    const allBowlersList = state?.innings.flatMap((inn) => inn.bowlers) ?? [];

    const topBatter = [...allBattersList].sort((a, b) => b.runs - a.runs || a.balls - b.balls)[0];
    const topBowler = [...allBowlersList].sort(
      (a, b) => b.wickets - a.wickets || a.runs - b.runs,
    )[0];

    // Team A specific stats
    let teamAFours = 0;
    let teamASixes = 0;
    let teamARuns = 0;
    let teamAWickets = 0;
    let teamADots = 0;
    let teamAExtras = 0;

    // Team B specific stats
    let teamBFours = 0;
    let teamBSixes = 0;
    let teamBRuns = 0;
    let teamBWickets = 0;
    let teamBDots = 0;
    let teamBExtras = 0;

    let maxOverRuns = 0;
    let maxOverNumber = 0;
    let maxOverTeam = "";

    state?.innings.forEach((inn) => {
      const isTeamA = inn.battingTeamId === teamA?.id;
      const isTeamB = inn.battingTeamId === teamB?.id;

      if (isTeamA) {
        teamARuns += inn.runs;
        teamAWickets += inn.wickets;
        teamAExtras += inn.extras;
        inn.batters.forEach((b) => {
          teamAFours += b.fours;
          teamASixes += b.sixes;
        });
      } else if (isTeamB) {
        teamBRuns += inn.runs;
        teamBWickets += inn.wickets;
        teamBExtras += inn.extras;
        inn.batters.forEach((b) => {
          teamBFours += b.fours;
          teamBSixes += b.sixes;
        });
      }

      inn.overGroups.forEach((og) => {
        if (og.runs > maxOverRuns) {
          maxOverRuns = og.runs;
          maxOverNumber = og.overNumber + 1;
          maxOverTeam = lookup.team(inn.battingTeamId)?.name ?? "Batting Team";
        }
        og.balls.forEach((bs) => {
          if (bs.totalRuns === 0 && !bs.delivery.extraType && !bs.delivery.wicket) {
            if (isTeamA) teamADots++;
            else if (isTeamB) teamBDots++;
          }
        });
      });
    });

    const totalMatchRuns = teamARuns + teamBRuns;
    const totalMatchFours = teamAFours + teamBFours;
    const totalMatchSixes = teamASixes + teamBSixes;
    const totalMatchWickets = teamAWickets + teamBWickets;
    const totalMatchExtras = teamAExtras + teamBExtras;
    const totalDotBalls = teamADots + teamBDots;

    // Highlights bullets (100% derived from real events)
    const highlights: string[] = [];
    if (topBatter && topBatter.runs > 0) {
      const p = lookup.player(topBatter.playerId);
      highlights.push(
        `${p?.name ?? "Top Batter"} top-scored with ${topBatter.runs} runs off ${topBatter.balls} balls (${topBatter.fours}x4, ${topBatter.sixes}x6).`,
      );
    }
    if (topBowler && topBowler.wickets > 0) {
      const p = lookup.player(topBowler.playerId);
      highlights.push(
        `${p?.name ?? "Top Bowler"} claimed ${topBowler.wickets} wickets for ${topBowler.runs} runs in ${oversText(topBowler.legalBalls)} overs.`,
      );
    }
    if (maxOverRuns >= 12) {
      highlights.push(
        `Highest scoring over: ${maxOverRuns} runs in Over ${maxOverNumber} (${maxOverTeam}).`,
      );
    }
    if (totalMatchFours + totalMatchSixes > 0) {
      highlights.push(
        `Match boundaries: ${totalMatchFours} fours and ${totalMatchSixes} sixes scored across innings.`,
      );
    }

    return {
      topBatter,
      topBowler,
      teamA: {
        fours: teamAFours,
        sixes: teamASixes,
        boundaries: teamAFours + teamASixes,
        runs: teamARuns,
        wickets: teamAWickets,
        extras: teamAExtras,
        dots: teamADots,
      },
      teamB: {
        fours: teamBFours,
        sixes: teamBSixes,
        boundaries: teamBFours + teamBSixes,
        runs: teamBRuns,
        wickets: teamBWickets,
        extras: teamBExtras,
        dots: teamBDots,
      },
      totalMatchRuns,
      totalMatchFours,
      totalMatchSixes,
      totalMatchBoundaries: totalMatchFours + totalMatchSixes,
      totalMatchWickets,
      totalMatchExtras,
      totalDotBalls,
      highlights,
    };
  }, [state, teamA, teamB]);

  const matchMvpList = useMemo(() => calculateMatchMVP(state), [state]);

  // Player of the match lookup
  const momPlayerId = match.manOfTheMatchId ?? state?.match.manOfTheMatchId;
  const momPlayer = momPlayerId ? lookup.player(momPlayerId) : undefined;
  const momBatterStat = momPlayerId ? state?.innings.flatMap((i) => i.batters).find((b) => b.playerId === momPlayerId) : undefined;
  const momBowlerStat = momPlayerId ? state?.innings.flatMap((i) => i.bowlers).find((b) => b.playerId === momPlayerId) : undefined;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const title = `${match.tournament}: ${teamA?.name ?? "Team A"} vs ${teamB?.name ?? "Team B"}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Live score & match centre for ${title}`, url: shareUrl });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const time = formatMatchTime(match?.scheduledAt);

  // Runs per over data for the active innings
  const currentOverGroups = currentInnings?.overGroups ?? [];
  const maxOverInInnings = Math.max(1, ...currentOverGroups.map((og) => og.runs));

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* ── TOP NAV / ACTION BAR ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/matches"
          className="tap inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-black text-[#111111] shadow-sm hover:bg-[#F7F7F5] transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>ALL MATCHES</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="tap inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-black text-[#111111] shadow-sm hover:bg-[#F7F7F5] transition-all"
          >
            {copiedShare ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-[#D9A928]" />
                <span>Share</span>
              </>
            )}
          </button>

          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D9A928] text-black text-[10px] font-black tracking-widest uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
              LIVE
            </span>
          )}
          {isDone && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-black tracking-widest uppercase">
              COMPLETED
            </span>
          )}
          {!isLive && !isDone && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 text-[#5F6368] text-[10px] font-black tracking-widest uppercase">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN SCOREBOARD HERO ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121316] border border-white/10 text-white shadow-2xl p-5 sm:p-7">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A928]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Match Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-5 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#D9A928] uppercase tracking-wider">{match.tournament}</span>
            <span>•</span>
            <span className="font-bold uppercase tracking-wider">Match #{match.matchNumber}</span>
            <span>•</span>
            <span>{match.overs} Overs Match</span>
          </div>
          <div className="flex items-center gap-4 text-white/60 text-[11px]">
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#D9A928]" />
                {match.venue}
              </span>
            )}
            {time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#D9A928]" />
                {time}
              </span>
            )}
          </div>
        </div>

        {/* Head-to-Head Scoreboard Grid (1st Innings Team ALWAYS First / On Top) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* 1st Batting Team Score Card */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              currentInnings?.battingTeamId === firstTeamId && isLive
                ? "bg-white/10 border-[#D9A928]/50 shadow-lg shadow-[#D9A928]/10"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <TeamLogo
                logoUrl={teamFirst?.logoUrl}
                name={teamFirst?.name}
                shortName={teamFirst?.shortName}
                size="md"
                isBatting={currentInnings?.battingTeamId === firstTeamId && isLive}
              />
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black uppercase text-white truncate flex items-center gap-1.5">
                  {teamFirst?.name ?? "Team 1"}
                  {currentInnings?.battingTeamId === firstTeamId && isLive && (
                    <span className="h-2 w-2 rounded-full bg-[#D9A928] animate-pulse shrink-0" />
                  )}
                </p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                  {firstInnings ? "1st Innings" : "Batting Squad"}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              {firstInnings && (firstInnings.legalBalls > 0 || firstInnings.runs > 0 || isLive || isDone) ? (
                <>
                  <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                    {firstInnings.runs}
                    <span className="text-white/60">/{firstInnings.wickets}</span>
                  </p>
                  <p className="text-[10px] text-white/60 font-bold tabular-nums">
                    {firstInnings.oversText} ov {firstInnings.crr > 0 ? `• CRR ${firstInnings.crr.toFixed(2)}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-xs text-white/40 font-bold uppercase">Yet to bat</p>
              )}
            </div>
          </div>

          {/* 2nd Batting Team Score Card */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              currentInnings?.battingTeamId === secondTeamId && isLive
                ? "bg-white/10 border-[#D9A928]/50 shadow-lg shadow-[#D9A928]/10"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <TeamLogo
                logoUrl={teamSecond?.logoUrl}
                name={teamSecond?.name}
                shortName={teamSecond?.shortName}
                size="md"
                isBatting={currentInnings?.battingTeamId === secondTeamId && isLive}
              />
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black uppercase text-white truncate flex items-center gap-1.5">
                  {teamSecond?.name ?? "Team 2"}
                  {currentInnings?.battingTeamId === secondTeamId && isLive && (
                    <span className="h-2 w-2 rounded-full bg-[#D9A928] animate-pulse shrink-0" />
                  )}
                </p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                  {secondInnings ? "2nd Innings" : "Bowling Squad"}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              {secondInnings ? (
                <>
                  <p className="text-xl sm:text-2xl font-black text-[#D9A928] tabular-nums">
                    {secondInnings.runs}
                    <span className="text-white/60">/{secondInnings.wickets}</span>
                  </p>
                  <p className="text-[10px] text-white/60 font-bold tabular-nums">
                    {secondInnings.oversText} ov {secondInnings.crr > 0 ? `• CRR ${secondInnings.crr.toFixed(2)}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-xs text-white/40 font-bold uppercase">Yet to bat</p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Match Situation Banner */}
        {state?.isRainAffected && (
          <div className="mt-4 p-3 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <CloudRain className="h-4 w-4 text-blue-400 shrink-0" />
              <span>
                RAIN AFFECTED • {state.revisedOvers ? `${state.revisedOvers} OVERS PER SIDE` : "REDUCED OVERS"}
              </span>
            </div>
            {currentInnings?.isTargetRevised && (
              <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                <span>Original Target: <span className="line-through text-white/50">{currentInnings.originalTarget}</span></span>
                <span className="text-[#D9A928] bg-black/60 px-2 py-0.5 rounded border border-[#D9A928]/40">Revised Target: {currentInnings.target} (ARR Method)</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {isDone ? (
            <div className="flex items-center gap-2 text-sm font-black text-[#D9A928] uppercase tracking-wide">
              <Trophy className="h-4 w-4" />
              <span>{match.resultText ?? state?.resultText ?? "Match Completed"}</span>
            </div>
          ) : currentInnings?.target !== undefined ? (
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <span className="text-[#D9A928] font-black uppercase">
                {currentInnings.isTargetRevised ? `Revised Target: ${currentInnings.target} (ARR)` : `Target: ${currentInnings.target}`}
              </span>
              <span className="text-white">
                Need <strong className="text-white font-black">{currentInnings.runsNeeded}</strong> runs from{" "}
                <strong className="text-white font-black">{currentInnings.ballsRemaining}</strong> balls
              </span>
              {currentInnings.requiredRunRate !== undefined && (
                <span className="text-white/60">
                  RRR: <strong className="text-[#D9A928] font-black">{currentInnings.requiredRunRate.toFixed(2)}</strong>
                </span>
              )}
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
              <span>Current Innings: <strong className="text-white font-black">{battingTeam?.name}</strong></span>
              <span>CRR: <strong className="text-[#D9A928] font-black">{currentInnings?.crr.toFixed(2) ?? "0.00"}</strong></span>
            </div>
          ) : (
            <p className="text-xs text-white/60 font-medium">Match scheduled to begin shortly.</p>
          )}

          {currentInnings && (
            <div className="text-[11px] font-bold text-white/60">
              Current Partnership: <span className="text-white font-black">{currentInnings.partnership.runs}</span> runs ({currentInnings.partnership.balls} balls)
            </div>
          )}
        </div>
      </div>

      {/* ── WEATHER / RAIN DELAY BANNER ────────────────────────────────── */}
      {matchCondition && matchCondition !== "NORMAL" && (
        <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-between gap-4 text-blue-100 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">
                {formatMatchCondition(matchCondition).label}
              </p>
              <p className="text-[11px] text-blue-200">
                Official tournament match condition updated by match referee.
              </p>
            </div>
          </div>
          {currentInnings?.isTargetRevised && currentInnings.target && (
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D9A928]">ARR REVISED TARGET</span>
              <p className="text-lg font-black text-white">{currentInnings.target} Runs</p>
            </div>
          )}
        </div>
      )}

      {/* ── MATCH NAVIGATION TABS ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "commentary", label: "Commentary", icon: Zap },
          { id: "scorecard", label: "Scorecard", icon: Layers },
          { id: "wagonwheel", label: "Wagon Wheel", icon: Compass },
          { id: "stats", label: "Stats & Highlights", icon: BarChart3 },
          { id: "playingxi", label: "Playing XI", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`tap shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
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

      {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Current Batters & Bowler Grid */}
          {isLive && currentInnings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Batters */}
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 shadow-sm">
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
                          <Link
                            to="/players/$playerId"
                            params={{ playerId: b!.playerId }}
                            className="text-sm font-black text-[#111111] hover:text-[#D9A928] flex items-center gap-1.5 truncate group"
                          >
                            <span className="group-hover:underline">{p?.name ?? "Batter"}</span>
                            {isStriker && <span className="text-[#D9A928] font-black">*</span>}
                          </Link>
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
                  {!striker && !nonStriker && (
                    <p className="text-xs text-[#5F6368] italic py-2">No active batters on crease.</p>
                  )}
                </div>
              </div>

              {/* Current Bowler */}
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-3">
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
                            <Link
                              to="/players/$playerId"
                              params={{ playerId: activeBowler.playerId }}
                              className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                            >
                              {p?.name ?? "Bowler"}
                            </Link>
                            <p className="text-[10px] text-[#5F6368] font-bold">{p?.role ?? "Bowling"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#111111] tabular-nums">
                              <span className="text-[#9A6A05] font-black">{activeBowler.wickets}</span>/{activeBowler.runs}{" "}
                              <span className="text-xs text-[#5F6368]">({oversText(activeBowler.legalBalls)} ov)</span>
                            </p>
                            <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                              M: {activeBowler.maidens} • Econ: {(activeBowler.economy ?? 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-[#5F6368] italic py-2">Next bowler awaiting selection</p>
                  )}
                </div>

                {/* Recent Balls Strip */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1.5">
                    This Over Balls
                  </p>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {(currentInnings.recentBalls ?? []).slice(-6).map((b, bi) => {
                      let bg = "bg-[#F7F7F5] text-[#111111] border-[#E5E5E5]";
                      if (b.kind === "wicket") bg = "bg-red-600 text-white border-red-700";
                      else if (b.delivery.batterRuns === 4) bg = "bg-[#D9A928] text-black border-[#C7961A]";
                      else if (b.delivery.batterRuns === 6) bg = "bg-purple-600 text-white border-purple-700";
                      else if (b.kind === "extra") bg = "bg-blue-50 text-blue-800 border-blue-200";

                      return (
                        <span
                          key={bi}
                          className={`h-7 w-7 rounded-lg border text-[11px] font-black flex items-center justify-center tabular-nums shadow-xs ${bg}`}
                        >
                          {b.label}
                        </span>
                      );
                    })}
                    {(!currentInnings.recentBalls?.length) && (
                      <span className="text-xs text-[#5F6368] italic">Over yet to start</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current & Historical Partnerships Section */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#D9A928]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  PARTNERSHIPS ({battingTeam?.name ?? "INNINGS"})
                </h2>
              </div>
              <span className="text-[10px] font-bold text-[#5F6368] uppercase">TPL 2026</span>
            </div>

            {/* Current Ongoing Partnership */}
            {currentInnings && (
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D9A928] bg-black px-2 py-0.5 rounded-full">
                    Current Partnership
                  </span>
                  <p className="text-sm font-black text-[#111111] mt-2">
                    {lookup.player(currentInnings.partnership.batterAId ?? "")?.name ?? "Striker"} &{" "}
                    {lookup.player(currentInnings.partnership.batterBId ?? "")?.name ?? "Non-Striker"}
                  </p>
                  <p className="text-xs text-[#5F6368] font-bold">
                    {currentInnings.partnership.runs} runs off {currentInnings.partnership.balls} balls
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-[#111111] tabular-nums">{currentInnings.partnership.runs}</p>
                  <p className="text-[10px] text-[#5F6368] uppercase font-bold">Runs</p>
                </div>
              </div>
            )}

            {/* Historical Completed Partnerships */}
            {state?.innings.map((inn, idx) => (
              <div key={inn.index} className="flex flex-col gap-2 pt-2">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-[#5F6368]">
                  {idx === 0 ? "1st Innings" : "2nd Innings"} Completed Partnerships
                </h3>
                {inn.partnerships && inn.partnerships.length > 0 ? (
                  <div className="flex flex-col divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-2xl px-4 bg-white">
                    {inn.partnerships.map((p, pi) => {
                      const batterA = lookup.player(p.batterAId);
                      const batterB = lookup.player(p.batterBId);
                      const batterOut = lookup.player(p.batterOutId);
                      return (
                        <div key={pi} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#111111]">
                              <span className="font-black text-[#D9A928]">Wicket {p.wicketNumber}:</span>{" "}
                              {batterA?.name ?? "Batter"} & {batterB?.name ?? "Batter"}
                            </p>
                            <p className="text-[10px] text-[#5F6368]">
                              Ended at {p.oversText} ov ({batterOut?.name ?? "Batter"} out)
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-[#111111] tabular-nums">{p.runs} runs</span>{" "}
                            <span className="text-[#5F6368]">({p.balls}b)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic">No completed partnerships in this innings yet.</p>
                )}
              </div>
            ))}
          </div>

          {/* Over Summary & Runs-Per-Over Visualization */}
          {currentOverGroups.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#D9A928]" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    RUNS PER OVER ({battingTeam?.shortName ?? "INNINGS"})
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-[#5F6368] uppercase">
                  {currentOverGroups.length} Overs Bowled
                </span>
              </div>

              {/* Simple Responsive Bar Chart */}
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-20 gap-2 items-end min-h-[100px] pt-4 pb-2 border-b border-[#E5E5E5]">
                {currentOverGroups.map((og) => {
                  const heightPercent = Math.max(12, Math.round((og.runs / maxOverInInnings) * 100));
                  const isHighOver = og.runs >= 10;
                  const hasWicket = og.wickets > 0;

                  return (
                    <div key={og.overNumber} className="flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-bold text-[#5F6368] opacity-0 group-hover:opacity-100 transition-opacity">
                        {og.runs}r
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[20px] rounded-t-md transition-all ${
                          hasWicket
                            ? "bg-red-500"
                            : isHighOver
                            ? "bg-[#D9A928]"
                            : "bg-[#111111]/80 hover:bg-[#D9A928]"
                        }`}
                      />
                      <span className="text-[9px] font-bold text-[#5F6368]">
                        {og.overNumber + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Over-by-Over Detailed Strip */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                  Recent Over Breakdowns
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(showAllOvers ? currentOverGroups : currentOverGroups.slice(-6)).reverse().map((og) => {
                    const bowler = lookup.player(og.bowlerId);
                    return (
                      <div key={og.overNumber} className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-[#111111]">
                            Over {og.overNumber + 1} • <span className="text-[#5F6368]">{bowler?.shortName ?? "Bowler"}</span>
                          </span>
                          <span className="font-black text-[#D9A928] bg-black px-2 py-0.5 rounded-full text-[10px]">
                            {og.runs} Runs {og.wickets > 0 ? `• ${og.wickets} Wkts` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {og.balls.map((b, bi) => (
                            <span
                              key={bi}
                              className={`h-6 w-6 rounded-md text-[10px] font-black flex items-center justify-center border ${
                                b.kind === "wicket"
                                  ? "bg-red-600 text-white border-red-700"
                                  : b.delivery.batterRuns === 4
                                  ? "bg-[#D9A928] text-black border-[#C7961A]"
                                  : b.delivery.batterRuns === 6
                                  ? "bg-purple-600 text-white border-purple-700"
                                  : "bg-white text-[#111111] border-[#E5E5E5]"
                              }`}
                            >
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentOverGroups.length > 6 && (
                  <button
                    onClick={() => setShowAllOvers(!showAllOvers)}
                    className="self-center mt-2 text-xs font-black uppercase text-[#D9A928] hover:underline"
                  >
                    {showAllOvers ? "Show Less Overs" : `View All ${currentOverGroups.length} Overs →`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Fall of Wickets Timeline */}
          {currentInnings && currentInnings.fallOfWickets.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111] mb-3">
                Fall of Wickets ({battingTeam?.name})
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentInnings.fallOfWickets.map((w, wi) => {
                  const p = lookup.player(w.batterOutId);
                  return (
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: w.batterOutId }}
                      key={wi}
                      className="tap px-3 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:border-[#D9A928] transition-colors"
                    >
                      <span className="text-[#9A6A05] font-black">{wi + 1}-{w.runs}</span>{" "}
                      <span className="text-[#5F6368]">({p?.shortName ?? "Batter"}, {w.oversText} ov)</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COMMENTARY ─────────────────────────────────────────── */}
      {activeTab === "commentary" && (
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#D9A928]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                BALL-BY-BALL COMMENTARY
              </h2>
            </div>

            {/* Commentary Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All" },
                { id: "wickets", label: "Wickets" },
                { id: "fours", label: "4s" },
                { id: "sixes", label: "6s" },
                { id: "extras", label: "Extras" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCommentaryFilter(f.id as CommentaryFilter)}
                  className={`tap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    commentaryFilter === f.id
                      ? "bg-[#D9A928] text-black shadow-xs"
                      : "bg-[#F7F7F5] text-[#5F6368] hover:bg-[#E5E5E5]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredDeliveries.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#E5E5E5]">
              {filteredDeliveries.map(({ delivery, oversText, innIndex }) => {
                if (!delivery) return null;
                const strikerPlayer = lookup.player(delivery.strikerId);
                const bowlerPlayer = lookup.player(delivery.bowlerId);
                const isWicket = !!delivery.wicket;
                const isFour = !delivery.extraType && delivery.batterRuns === 4;
                const isSix = !delivery.extraType && delivery.batterRuns === 6;

                return (
                  <div key={delivery.id} className="py-3.5 flex items-start gap-4 hover:bg-[#FAFAF8] px-2 rounded-xl transition-colors">
                    <span className="px-2.5 py-1 rounded-lg bg-[#111111] text-[#D9A928] text-xs font-black tabular-nums shrink-0 mt-0.5">
                      {oversText}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#111111]">
                        <Link
                          to="/players/$playerId"
                          params={{ playerId: delivery.bowlerId }}
                          className="hover:text-[#D9A928] hover:underline"
                        >
                          {bowlerPlayer?.name ?? "Bowler"}
                        </Link>{" "}
                        to{" "}
                        <Link
                          to="/players/$playerId"
                          params={{ playerId: delivery.strikerId }}
                          className="hover:text-[#D9A928] hover:underline"
                        >
                          {strikerPlayer?.name ?? "Batter"}
                        </Link>
                        ,{" "}
                        <span
                          className={
                            isWicket
                              ? "text-red-600 uppercase font-black"
                              : isFour || isSix
                              ? "text-[#D9A928] uppercase font-black"
                              : "text-[#111111]"
                          }
                        >
                          {describeDelivery(delivery)}
                        </span>
                      </p>

                      {isWicket && (
                        <p className="text-xs text-red-600 font-bold mt-1">
                          OUT! {delivery.wicket?.type} — {lookup.player(delivery.wicket?.batterOutId ?? "")?.name ?? "Batter"} dismissed.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-bold text-[#5F6368]">
              No ball-by-ball scoring data available yet.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: FULL SCORECARD ──────────────────────────────────────── */}
      {activeTab === "scorecard" && (
        <div className="flex flex-col gap-6">
          {state?.innings.map((inn, idx) => {
            const team = lookup.team(inn.battingTeamId);
            const bowlingTeamData = lookup.team(inn.bowlingTeamId);
            const sortedBatters = [...inn.batters].sort((a, b) => a.battingPosition - b.battingPosition);
            const sortedBowlers = [...inn.bowlers];

            return (
              <div key={inn.index} className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-black/5 p-1 flex items-center justify-center">
                      {team?.logoUrl ? <img src={team.logoUrl} alt="" className="h-full w-full object-contain" /> : "🏏"}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#111111] uppercase">
                        {team?.name} Innings ({idx === 0 ? "1st Innings" : "2nd Innings"})
                      </h3>
                      <p className="text-[10px] text-[#5F6368] font-bold">vs {bowlingTeamData?.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-[#111111] tabular-nums">
                      {inn.runs}/{inn.wickets}
                    </p>
                    <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                      {inn.oversText} ov • CRR {inn.crr.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Batting Table */}
                <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                        <th className="px-4 py-3 text-left">Batting</th>
                        <th className="px-3 py-3 text-right">R</th>
                        <th className="px-3 py-3 text-right">B</th>
                        <th className="px-3 py-3 text-right">4s</th>
                        <th className="px-3 py-3 text-right">6s</th>
                        <th className="px-4 py-3 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {sortedBatters.map((b) => {
                        const p = lookup.player(b.playerId);
                        const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
                        return (
                          <tr key={b.playerId} className={b.out ? "hover:bg-[#FAFAF8]" : "bg-[#D9A928]/5"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Link
                                  to="/players/$playerId"
                                  params={{ playerId: b.playerId }}
                                  className="font-extrabold text-[#111111] hover:text-[#D9A928] hover:underline truncate"
                                >
                                  {p?.name ?? b.playerId}
                                </Link>
                                <button
                                  onClick={() => {
                                    setSelectedWagonBatterId(b.playerId);
                                    setActiveTab("wagonwheel");
                                  }}
                                  className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#D9A928] text-slate-700 hover:text-black border border-slate-200 transition-colors"
                                  title="View Wagon Wheel"
                                >
                                  Wagon Wheel ↗
                                </button>
                              </div>
                              <p className="text-[10px] text-[#5F6368] mt-0.5">
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
                      <tr className="bg-[#FAFAF8] border-t border-[#E5E5E5] font-bold text-xs">
                        <td colSpan={6} className="px-4 py-2.5 text-[#5F6368]">
                          Extras: <strong className="text-[#111111]">{inn.extras}</strong> • Total:{" "}
                          <strong className="text-[#111111]">{inn.runs}/{inn.wickets}</strong> ({inn.oversText} ov)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bowling Table */}
                <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                        <th className="px-4 py-3 text-left">Bowling</th>
                        <th className="px-3 py-3 text-right">O</th>
                        <th className="px-3 py-3 text-right">M</th>
                        <th className="px-3 py-3 text-right">R</th>
                        <th className="px-3 py-3 text-right">W</th>
                        <th className="px-4 py-3 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {sortedBowlers.map((b) => {
                        const p = lookup.player(b.playerId);
                        return (
                          <tr key={b.playerId} className="hover:bg-[#FAFAF8]">
                            <td className="px-4 py-3 font-extrabold text-[#111111]">
                              <Link
                                to="/players/$playerId"
                                params={{ playerId: b.playerId }}
                                className="hover:text-[#D9A928] hover:underline"
                              >
                                {p?.name ?? b.playerId}
                              </Link>
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

                {/* Fall of Wickets Section */}
                {inn.fallOfWickets && inn.fallOfWickets.length > 0 && (
                  <div className="bg-[#FAFAF8] border border-[#E5E5E5] rounded-2xl p-4 flex flex-col gap-2.5">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                      Fall of Wickets ({team?.shortName ?? "Innings"})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {inn.fallOfWickets.map((w) => {
                        const p = lookup.player(w.batterOutId);
                        const bowler = lookup.player(w.bowlerId);
                        const fielder = lookup.player(w.fielderId);
                        let dismissalString = w.dismissalType ?? "Dismissed";
                        if (w.dismissalType === "Caught" && fielder && bowler) {
                          dismissalString = `c ${fielder.shortName} b ${bowler.shortName}`;
                        } else if (w.dismissalType === "Bowled" && bowler) {
                          dismissalString = `b ${bowler.shortName}`;
                        } else if (w.dismissalType === "LBW" && bowler) {
                          dismissalString = `lbw b ${bowler.shortName}`;
                        } else if (w.dismissalType === "Run Out" && fielder) {
                          dismissalString = `run out (${fielder.shortName})`;
                        } else if (w.dismissalType === "Stumped" && fielder && bowler) {
                          dismissalString = `st ${fielder.shortName} b ${bowler.shortName}`;
                        }

                        return (
                          <div
                            key={w.wicketNumber}
                            className="bg-white border border-[#E5E5E5] rounded-xl p-2.5 flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#111111] text-xs">
                                <span className="font-black text-[#D9A928]">
                                  {w.wicketNumber} — {w.runs}
                                </span>{" "}
                                <span className="text-[10px] text-[#5F6368]">({w.oversText} ov)</span>
                              </p>
                              <Link
                                to="/players/$playerId"
                                params={{ playerId: w.batterOutId }}
                                className="text-xs font-black text-[#111111] hover:text-[#D9A928] hover:underline block mt-0.5 truncate"
                              >
                                {p?.name ?? "Batter"}
                              </Link>
                              <p className="text-[10px] text-[#5F6368] font-medium mt-0.5 truncate">
                                {dismissalString}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 4: WAGON WHEEL ─────────────────────────────────────────── */}
      {activeTab === "wagonwheel" && (
        <div className="flex flex-col gap-6">
          {(() => {
            const allBatters: { id: string; name: string; runs: number; balls: number; teamName: string }[] = [];
            state?.innings.forEach((inn) => {
              const team = lookup.team(inn.battingTeamId);
              inn.batters.forEach((b) => {
                const p = lookup.player(b.playerId);
                allBatters.push({
                  id: b.playerId,
                  name: p?.name ?? b.playerId,
                  runs: b.runs,
                  balls: b.balls,
                  teamName: team?.shortName ?? "Team",
                });
              });
            });

            const currentSelectedId = selectedWagonBatterId || allBatters[0]?.id;
            const currentBatter = allBatters.find((b) => b.id === currentSelectedId) || allBatters[0];

            // Extract deliveries for selected batter
            const deliveries = allDeliveries
              .filter((d) => d.delivery.strikerId === currentSelectedId)
              .map((d) => ({
                strikerId: d.delivery.strikerId,
                runsOffBat: d.delivery.runsOffBat ?? 0,
                shotZone: (d.delivery as any).shotZone ?? null,
                overNumber: d.delivery.overNumber,
                ballNumber: d.delivery.ballNumber,
              }));

            const summary = currentBatter
              ? calculateBatterWagonWheel(currentBatter.id, currentBatter.name, deliveries)
              : null;

            return (
              <div className="flex flex-col gap-5">
                {/* Batter Pills */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                      Select Batter for Wagon Wheel
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368]">
                      {allBatters.length} Batters
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {allBatters.map((b) => {
                      const isSelected = b.id === currentSelectedId;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelectedWagonBatterId(b.id)}
                          className={`tap shrink-0 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-[#D9A928] text-black shadow-sm"
                              : "bg-[#F7F7F5] text-[#5F6368] hover:text-[#111111] border border-[#E5E5E5]"
                          }`}
                        >
                          <span>{b.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-black/10 text-black" : "bg-white text-[#5F6368]"}`}>
                            {b.runs} ({b.balls})
                          </span>
                        </button>
                      );
                    })}
                    {allBatters.length === 0 && (
                      <p className="text-xs text-[#5F6368] italic py-2">
                        No batting data recorded yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Wagon Wheel Component */}
                {summary ? (
                  <WagonWheel summary={summary} />
                ) : (
                  <div className="card-surface p-12 text-center bg-white border border-[#E5E5E5] rounded-3xl">
                    <p className="text-xs text-[#5F6368] font-bold">
                      Select a batter above to view their Wagon Wheel.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB 5: STATS & HIGHLIGHTS ──────────────────────────────────── */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-6">
          {/* Player of the Match Section */}
          <div className="bg-gradient-to-r from-[#121316] via-black to-[#121316] border border-[#D9A928]/30 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <Trophy className="h-4 w-4 text-[#D9A928]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#D9A928]">
                PLAYER OF THE MATCH
              </h3>
            </div>

            {momPlayer ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-black/60 border-2 border-[#D9A928] p-1 flex items-center justify-center overflow-hidden">
                    {momPlayer.avatar ? (
                      <img src={momPlayer.avatar} alt="" className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <User className="h-8 w-8 text-white/50" />
                    )}
                  </div>
                  <div>
                    <Link
                      to="/players/$playerId"
                      params={{ playerId: momPlayer.id }}
                      className="text-lg font-black text-white hover:text-[#D9A928] hover:underline"
                    >
                      {momPlayer.name}
                    </Link>
                    <p className="text-xs text-[#D9A928] font-bold mt-0.5">
                      {lookup.team(momPlayer.teamId)?.name ?? "TPL Player"} • {momPlayer.role}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {momBatterStat && (
                    <p className="text-sm font-black text-white tabular-nums">
                      {momBatterStat.runs} runs ({momBatterStat.balls}b)
                    </p>
                  )}
                  {momBowlerStat && momBowlerStat.legalBalls > 0 && (
                    <p className="text-xs font-bold text-[#D9A928] tabular-nums">
                      {momBowlerStat.wickets}/{momBowlerStat.runs} ({oversText(momBowlerStat.legalBalls)} ov)
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-2 text-xs font-bold text-white/60 italic">
                {isDone ? "Player of the Match: To be announced" : "Player of the Match will be announced after match completion."}
              </div>
            )}
          </div>

          {/* Top Performers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Batter Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                <Flame className="h-4 w-4 text-[#D9A928]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">Top Batter</h3>
              </div>
              {matchStats.topBatter && matchStats.topBatter.runs > 0 ? (
                (() => {
                  const p = lookup.player(matchStats.topBatter.playerId);
                  return (
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <Link
                          to="/players/$playerId"
                          params={{ playerId: matchStats.topBatter.playerId }}
                          className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                        >
                          {p?.name ?? "Top Batter"}
                        </Link>
                        <p className="text-xs text-[#5F6368] font-bold mt-0.5">
                          {matchStats.topBatter.fours}x4 • {matchStats.topBatter.sixes}x6 • SR {matchStats.topBatter.strikeRate.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#111111]">{matchStats.topBatter.runs}</p>
                        <p className="text-[10px] text-[#5F6368] uppercase font-bold">({matchStats.topBatter.balls} balls)</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-[#5F6368] italic py-4">No batting data available yet.</p>
              )}
            </div>

            {/* Best Bowler Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                <Target className="h-4 w-4 text-[#D9A928]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">Best Bowling</h3>
              </div>
              {matchStats.topBowler && matchStats.topBowler.legalBalls > 0 ? (
                (() => {
                  const p = lookup.player(matchStats.topBowler.playerId);
                  return (
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <Link
                          to="/players/$playerId"
                          params={{ playerId: matchStats.topBowler.playerId }}
                          className="text-base font-black text-[#111111] hover:text-[#D9A928] hover:underline"
                        >
                          {p?.name ?? "Top Bowler"}
                        </Link>
                        <p className="text-xs text-[#5F6368] font-bold mt-0.5">
                          {oversText(matchStats.topBowler.legalBalls)} overs • Econ {(matchStats.topBowler.economy ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#9A6A05]">
                          {matchStats.topBowler.wickets}/{matchStats.topBowler.runs}
                        </p>
                        <p className="text-[10px] text-[#5F6368] uppercase font-bold">Wickets/Runs</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-[#5F6368] italic py-4">No bowling data available yet.</p>
              )}
            </div>
          </div>

          {/* Team-Specific Boundaries & Head-to-Head Comparison */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111] pb-3 border-b border-[#E5E5E5]">
              Team Comparison & Boundary Breakdown
            </h3>

            <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[10px] font-black uppercase text-[#5F6368]">
                    <th className="px-4 py-3 text-left">Statistic</th>
                    <th className="px-4 py-3 text-center">{teamA?.shortName ?? "Team A"}</th>
                    <th className="px-4 py-3 text-center">{teamB?.shortName ?? "Team B"}</th>
                    <th className="px-4 py-3 text-right">Match Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#111111]">Fours (4s)</td>
                    <td className="px-4 py-3 text-center font-black text-[#111111] tabular-nums">{matchStats.teamA.fours}</td>
                    <td className="px-4 py-3 text-center font-black text-[#111111] tabular-nums">{matchStats.teamB.fours}</td>
                    <td className="px-4 py-3 text-right font-black text-[#D9A928] tabular-nums">{matchStats.totalMatchFours}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#111111]">Sixes (6s)</td>
                    <td className="px-4 py-3 text-center font-black text-[#111111] tabular-nums">{matchStats.teamA.sixes}</td>
                    <td className="px-4 py-3 text-center font-black text-[#111111] tabular-nums">{matchStats.teamB.sixes}</td>
                    <td className="px-4 py-3 text-right font-black text-[#D9A928] tabular-nums">{matchStats.totalMatchSixes}</td>
                  </tr>
                  <tr className="bg-[#FAFAF8]">
                    <td className="px-4 py-3 font-black text-[#111111]">Total Boundaries</td>
                    <td className="px-4 py-3 text-center font-black text-[#111111] tabular-nums">{matchStats.teamA.boundaries}</td>
                    <td className="px-4 py-3 text-center font-black text-[#111111] tabular-nums">{matchStats.teamB.boundaries}</td>
                    <td className="px-4 py-3 text-right font-black text-[#111111] tabular-nums">{matchStats.totalMatchBoundaries}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#111111]">Total Runs / Wkts</td>
                    <td className="px-4 py-3 text-center font-bold text-[#5F6368] tabular-nums">{matchStats.teamA.runs}/{matchStats.teamA.wickets}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#5F6368] tabular-nums">{matchStats.teamB.runs}/{matchStats.teamB.wickets}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{matchStats.totalMatchRuns}/{matchStats.totalMatchWickets}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#111111]">Dot Balls</td>
                    <td className="px-4 py-3 text-center font-bold text-[#5F6368] tabular-nums">{matchStats.teamA.dots}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#5F6368] tabular-nums">{matchStats.teamB.dots}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{matchStats.totalDotBalls}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#111111]">Extras</td>
                    <td className="px-4 py-3 text-center font-bold text-[#5F6368] tabular-nums">{matchStats.teamA.extras}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#5F6368] tabular-nums">{matchStats.teamB.extras}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{matchStats.totalMatchExtras}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Match Highlights */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
              <Sparkles className="h-4 w-4 text-[#D9A928]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">Match Highlights</h3>
            </div>
            {matchStats.highlights.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {matchStats.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] mt-1.5 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5F6368] italic">Highlights will appear as the match progresses.</p>
            )}
          </div>

          {/* Match MVP / Top Performers List */}
          {matchMvpList.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#D9A928]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    MOST VALUABLE PLAYERS (MVP)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#5F6368] uppercase">
                  Match Impact Points
                </span>
              </div>
              <div className="flex flex-col divide-y divide-[#E5E5E5]">
                {matchMvpList.slice(0, 5).map((mvp, idx) => (
                  <div key={mvp.playerId} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? "bg-[#D9A928] text-black shadow-xs"
                            : "bg-[#F7F7F5] text-[#5F6368]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <Link
                          to="/players/$playerId"
                          params={{ playerId: mvp.playerId }}
                          className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline truncate block"
                        >
                          {mvp.playerName}
                        </Link>
                        <p className="text-[10px] text-[#5F6368] font-bold truncate">
                          {mvp.teamShortName} • {mvp.breakdown.runs > 0 ? `${mvp.breakdown.runs} runs (${mvp.breakdown.balls}b)` : ""}{" "}
                          {mvp.breakdown.wickets > 0 ? `• ${mvp.breakdown.wickets} wkts (${mvp.breakdown.oversText} ov)` : ""}{" "}
                          {mvp.breakdown.catches > 0 ? `• ${mvp.breakdown.catches} ct` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-[#111111] bg-[#D9A928]/15 px-2.5 py-1 rounded-xl tabular-nums">
                        {mvp.totalPoints} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: PLAYING XI ────────────────────────────────────────── */}
      {activeTab === "playingxi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A XI */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm">
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
                  <Link
                    to="/players/$playerId"
                    params={{ playerId: pId }}
                    key={pId}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs hover:bg-[#F7F7F5] transition-colors group"
                  >
                    <span className="font-bold text-[#111111] group-hover:text-[#D9A928] group-hover:underline">
                      {pIdx + 1}. {player?.name ?? pId}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368] px-2 py-0.5 rounded-full bg-[#F7F7F5]">
                      {player?.role ?? "Player"}
                    </span>
                  </Link>
                );
              })}
              {(!state?.setup.playingXI[teamA?.id ?? ""]?.playerIds?.length) && (
                <p className="text-xs text-[#5F6368] italic py-4 text-center">Playing XI will be announced at toss.</p>
              )}
            </div>
          </div>

          {/* Team B XI */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm">
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
                  <Link
                    to="/players/$playerId"
                    params={{ playerId: pId }}
                    key={pId}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs hover:bg-[#F7F7F5] transition-colors group"
                  >
                    <span className="font-bold text-[#111111] group-hover:text-[#D9A928] group-hover:underline">
                      {pIdx + 1}. {player?.name ?? pId}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368] px-2 py-0.5 rounded-full bg-[#F7F7F5]">
                      {player?.role ?? "Player"}
                    </span>
                  </Link>
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
