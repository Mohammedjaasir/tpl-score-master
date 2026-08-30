import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { Match, MatchState, InningsState, Delivery, OverGroup } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText, describeDelivery, ballLabel } from "@/lib/scoring/engine";
import { calculateMatchMVP } from "@/lib/scoring/playerPerformance";
import { calculateSingleMatchStats, formatStatDecimal } from "@/lib/scoring/statistics";
import { WagonWheel } from "@/components/scoring/WagonWheel";
import { calculateBatterWagonWheel } from "@/lib/scoring/wagon-wheel";
import { formatMatchCondition, type MatchCondition } from "@/lib/scoring/weather";
import { LiveScoreBroadcastBanner, type LiveScoreEvent } from "@/components/public/LiveScoreBroadcastBanner";
import { PlayerPerformanceModal } from "@/components/public/PlayerPerformanceModal";
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

export function PublicMatchCentre({
  match,
  state,
  matchCondition: propMatchCondition,
}: PublicMatchCentreProps) {
  const [activeTab, setActiveTab] = useState<TabType>("scorecard");
  const [commentaryFilter, setCommentaryFilter] = useState<CommentaryFilter>("all");
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAllOvers, setShowAllOvers] = useState(true);
  const [oversInningsIdx, setOversInningsIdx] = useState<number | null>(null);
  const [selectedWagonBatterId, setSelectedWagonBatterId] = useState<string | null>(null);
  const [selectedPerformancePlayerId, setSelectedPerformancePlayerId] = useState<string | null>(null);
  const [liveEvent, setLiveEvent] = useState<LiveScoreEvent | null>(null);

  const lastDeliveryIdRef = useRef<string | null>(null);
  const isFirstMountRef = useRef(true);

  const teamA = lookup.team(match.teamAId);
  const teamB = lookup.team(match.teamBId);

  // Exact Innings Order: 1st batting team always on top / first
  const firstTeamId = state?.innings[0]?.battingTeamId ?? match.teamAId;
  const secondTeamId = firstTeamId === match.teamAId ? match.teamBId : match.teamAId;
  const teamFirst = lookup.team(firstTeamId) ?? teamA;
  const teamSecond = lookup.team(secondTeamId) ?? teamB;

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

  // Weather / Match Condition
  const effectiveMatchCondition = (
    propMatchCondition ||
    (match.status === "ABANDONED"
      ? "MATCH_ABANDONED"
      : state?.setup?.weatherCondition ||
        (state?.setup?.targetRevisionReason === "RAIN DELAY"
          ? "RAIN_DELAY"
          : state?.setup?.targetRevisionReason === "RAIN RESUMED"
          ? "RAIN_RESUMED"
          : state?.setup?.targetRevisionReason === "REDUCED OVERS"
          ? "REDUCED_OVERS"
          : state?.setup?.targetRevisionReason === "MATCH ABANDONED"
          ? "MATCH_ABANDONED"
          : state?.isRainAffected
          ? "REDUCED_OVERS"
          : "NORMAL"))
  ) as MatchCondition;

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

  // Broadcast Live Score Event Animation (Data-driven, deduplicated via delivery.id)
  useEffect(() => {
    if (!allDeliveries || allDeliveries.length === 0) return;

    const latest = allDeliveries[0]?.delivery;
    if (!latest) return;

    // Prevent flashing old ball on first page mount / refresh
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastDeliveryIdRef.current = latest.id;
      return;
    }

    // Deduplication check: ignore if this ball ID was already animated
    if (latest.id === lastDeliveryIdRef.current) return;
    lastDeliveryIdRef.current = latest.id;

    const isWicket = !!latest.wicket;
    const isFour = !latest.extraType && latest.batterRuns === 4;
    const isSix = !latest.extraType && latest.batterRuns === 6;
    const isExtra = !!latest.extraType;

    let badgeText = "";
    let subText: string | undefined;

    if (isWicket) {
      badgeText = "WICKET!";
      const outP = lookup.player(latest.wicket?.batterOutId ?? "");
      const bowlP = lookup.player(latest.bowlerId);
      const fieldP = latest.wicket?.fielderId ? lookup.player(latest.wicket.fielderId) : undefined;

      if (latest.wicket?.type === "Caught" && fieldP && bowlP) {
        subText = `${outP?.name ?? "Batter"} · c ${fieldP.name} b ${bowlP.name}`;
      } else if (latest.wicket?.type === "Bowled" && bowlP) {
        subText = `${outP?.name ?? "Batter"} · b ${bowlP.name}`;
      } else if (latest.wicket?.type === "LBW" && bowlP) {
        subText = `${outP?.name ?? "Batter"} · lbw b ${bowlP.name}`;
      } else if (latest.wicket?.type === "Run Out" && fieldP) {
        subText = `${outP?.name ?? "Batter"} · run out (${fieldP.name})`;
      } else if (latest.wicket?.type === "Stumped" && fieldP && bowlP) {
        subText = `${outP?.name ?? "Batter"} · st ${fieldP.name} b ${bowlP.name}`;
      } else {
        subText = outP?.name ? `${outP.name} (${latest.wicket?.type ?? "Out"})` : latest.wicket?.type;
      }
    } else if (latest.extraType === "wide") {
      badgeText = `+${latest.extraRuns || 1} WD`;
      subText = "Wide Extra";
    } else if (latest.extraType === "noball") {
      badgeText = `+${latest.extraRuns || 1} NB`;
      subText = "No Ball Extra";
    } else if (latest.extraType === "bye") {
      badgeText = `+${latest.extraRuns} B`;
      subText = "Bye Extra";
    } else if (latest.extraType === "legbye") {
      badgeText = `+${latest.extraRuns} LB`;
      subText = "Leg Bye Extra";
    } else if (isSix) {
      badgeText = "+6";
      subText = "MAXIMUM SIX!";
    } else if (isFour) {
      badgeText = "+4";
      subText = "BOUNDARY FOUR";
    } else if (latest.batterRuns > 0) {
      badgeText = `+${latest.batterRuns}`;
    }

    if (badgeText) {
      setLiveEvent({
        id: latest.id,
        badgeText,
        subText,
        isWicket,
        isFour,
        isSix,
        isExtra,
      });

      const timer = setTimeout(() => {
        setLiveEvent(null);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [allDeliveries]);

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

  const singleMatchStats = useMemo(() => (state ? calculateSingleMatchStats(state) : null), [state]);
  const matchMvpList = useMemo(() => calculateMatchMVP(state), [state]);

  // Player of the match lookup
  const momPlayerId = match.manOfTheMatchId ?? state?.match.manOfTheMatchId;
  const momPlayer = momPlayerId ? lookup.player(momPlayerId) : undefined;
  const momBatterStat = momPlayerId ? state?.innings.flatMap((i) => i.batters).find((b) => b.playerId === momPlayerId) : undefined;
  const momBowlerStat = momPlayerId ? state?.innings.flatMap((i) => i.bowlers).find((b) => b.playerId === momPlayerId) : undefined;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const title = `${match.tournament}: ${teamA?.name ?? "Team A"} vs ${teamB?.name ?? "Team B"}`;
    const scoreSummary = firstInnings ? `${teamFirst?.shortName ?? "Team 1"}: ${firstInnings.runs}/${firstInnings.wickets} (${firstInnings.oversText} ov)` : "";
    const secondSummary = secondInnings ? `\n${teamSecond?.shortName ?? "Team 2"}: ${secondInnings.runs}/${secondInnings.wickets} (${secondInnings.oversText} ov)` : "";
    const result = state?.resultText ? `\n\n🏆 ${state.resultText}` : "";
    const shareText = `🏏 *${match.tournament} — Match #${match.matchNumber}*\n${scoreSummary}${secondSummary}${result}\n\n📱 Live Match Centre & Wagon Wheel:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText);
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

        {/* Live Broadcast Score Event Popup Animation */}
        <LiveScoreBroadcastBanner event={liveEvent} />

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
      {effectiveMatchCondition && effectiveMatchCondition !== "NORMAL" && (
        <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-between gap-4 text-blue-100 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">
                {formatMatchCondition(effectiveMatchCondition).label}
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

      {/* ── MATCH NAVIGATION TABS (Mobile-First Responsive Grid - Zero Horizontal Scrolling) ── */}
      <div
        role="tablist"
        aria-label="Match Centre Sections"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5"
      >
        {[
          { id: "scorecard", label: "Scorecard", icon: Layers, desc: "Live card & innings" },
          { id: "commentary", label: "Commentary", icon: Zap, desc: "Ball-by-ball updates" },
          { id: "wagonwheel", label: "Wagon Wheel", icon: Compass, desc: "Batter shot map" },
          { id: "stats", label: "Stats", icon: BarChart3, desc: "Records & MVP" },
          { id: "playingxi", label: "Playing XI", icon: Users, desc: "Team lineups" },
          { id: "overview", label: "Overview", icon: Activity, desc: "Match summary" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`match-section-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`tap w-full min-h-[48px] h-auto p-2.5 rounded-2xl flex items-center justify-between gap-2 text-left transition-all relative select-none cursor-pointer ${
                isActive
                  ? "bg-[#121316] text-white border-2 border-[#D9A928] shadow-md ring-1 ring-[#D9A928]/30"
                  : "bg-white text-[#111111] hover:bg-[#F9FAFB] border border-[#E5E5E5] shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#D9A928] text-black"
                      : "bg-[#F3F4F6] text-[#5F6368]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-[11px] sm:text-xs font-black uppercase tracking-wider truncate leading-tight ${
                      isActive ? "text-[#D9A928]" : "text-[#111111]"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </div>

              {isActive && (
                <div className="h-4 w-4 rounded-full bg-[#D9A928] text-black flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-4">
          {/* 1. MATCH RESULT / STATUS CARD */}
          {isDone ? (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] bg-black px-2.5 py-0.5 rounded-full">
                  MATCH RESULT
                </span>
                <span className="text-[11px] font-bold text-[#5F6368]">Match #{match.matchNumber}</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-[#111111] tracking-tight">
                  {state?.resultText ? state.resultText.split(" won by ")[0] : (lookup.team(match.winnerId ?? "")?.name ?? "MATCH COMPLETED")}
                </h2>
                <p className="text-sm font-black text-[#D9A928] uppercase mt-0.5">
                  {state?.resultText ?? (match.winnerId ? `${lookup.team(match.winnerId)?.name ?? "Team"} Won` : "Match Completed")}
                </p>
              </div>

              {/* Final Score Summary Strip */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-[#F7F7F5] p-3 rounded-2xl border border-[#E5E5E5]/60">
                  <p className="text-xs font-black uppercase text-[#111111] truncate">
                    {teamFirst?.shortName ?? teamFirst?.name}
                  </p>
                  <p className="text-lg font-black text-[#111111] tabular-nums mt-0.5">
                    {firstInnings?.runs ?? 0}/{firstInnings?.wickets ?? 0}
                    <span className="text-xs text-[#5F6368] font-bold ml-1">
                      ({firstInnings?.oversText ?? "0.0"} ov)
                    </span>
                  </p>
                </div>
                <div className="bg-[#F7F7F5] p-3 rounded-2xl border border-[#E5E5E5]/60">
                  <p className="text-xs font-black uppercase text-[#111111] truncate">
                    {teamSecond?.shortName ?? teamSecond?.name}
                  </p>
                  <p className="text-lg font-black text-[#111111] tabular-nums mt-0.5">
                    {secondInnings ? (
                      <>
                        {secondInnings.runs}/{secondInnings.wickets}
                        <span className="text-xs text-[#5F6368] font-bold ml-1">
                          ({secondInnings.oversText} ov)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-[#5F6368] font-bold uppercase">Yet to bat</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Match Highlights / Report Bullets */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E5E5E5] text-xs text-[#5F6368]">
                {matchStats.highlights.length > 0 ? (
                  matchStats.highlights.slice(0, 3).map((h, i) => (
                    <p key={i} className="flex items-center gap-2 font-medium text-[#111111]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] shrink-0" />
                      <span>{h}</span>
                    </p>
                  ))
                ) : (
                  <p className="flex items-center gap-2 font-medium text-[#111111]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] shrink-0" />
                    <span>Official match concluded with {totalDeliveriesCount || 0} deliveries recorded.</span>
                  </p>
                )}
              </div>

              {/* Player of the Match & Quick Tab Navigators */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E5E5]">
                {matchMVP && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#5F6368]">Player of the Match:</span>
                    <button
                      onClick={() => setSelectedPerformancePlayerId(matchMVP.player.id)}
                      className="font-black text-[#111111] hover:text-[#D9A928] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{matchMVP.player.name}</span>
                      <span className="text-[10px] text-[#5F6368] font-normal">
                        ({lookup.team(matchMVP.player.teamId)?.shortName})
                      </span>
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    onClick={() => setActiveTab("scorecard")}
                    className="tap px-2.5 py-1 rounded-lg bg-[#F7F7F5] hover:bg-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5]"
                  >
                    Full Scorecard
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className="tap px-2.5 py-1 rounded-lg bg-[#F7F7F5] hover:bg-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5]"
                  >
                    Performances
                  </button>
                  <button
                    onClick={() => setActiveTab("wagonwheel")}
                    className="tap px-2.5 py-1 rounded-lg bg-[#F7F7F5] hover:bg-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5]"
                  >
                    Wagon Wheel
                  </button>
                  <Link
                    to="/records"
                    className="tap px-2.5 py-1 rounded-lg bg-[#F7F7F5] hover:bg-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5]"
                  >
                    Records
                  </Link>
                </div>
              </div>
            </div>
          ) : match.status === "ABANDONED" ? (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 text-center shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                MATCH ABANDONED
              </span>
              <h2 className="text-lg font-black uppercase text-[#111111] mt-3">NO RESULT</h2>
              <p className="text-xs text-[#5F6368] mt-1">Match abandoned due to weather / ground conditions.</p>
            </div>
          ) : !isLive && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                  MATCH SCHEDULE
                </span>
                <span className="text-[11px] font-bold text-[#5F6368]">Match #{match.matchNumber}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-[#F7F7F5] p-2.5 rounded-xl">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Start Time</span>
                  <span className="font-black text-[#111111]">{formatMatchTime(match.scheduledAt || match.startTime)}</span>
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-xl">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Overs</span>
                  <span className="font-black text-[#111111]">{match.overs} Overs / Side</span>
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Venue</span>
                  <span className="font-black text-[#111111]">TPL Ground</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. CURRENT BATTERS & CURRENT BOWLER (ONLY WHEN LIVE) */}
          {isLive && currentInnings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Current Batters */}
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2.5 border-b border-[#E5E5E5] pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                    Current Batters
                  </span>
                  <span className="text-[10px] font-bold text-[#5F6368]">R (B) • 4s • 6s • SR</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[striker, nonStriker].filter(Boolean).map((b) => {
                    const p = lookup.player(b!.playerId);
                    const isStriker = b!.playerId === currentInnings.strikerId;
                    const sr = b!.balls > 0 ? ((b!.runs / b!.balls) * 100).toFixed(1) : "-";
                    return (
                      <div key={b!.playerId} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => setSelectedPerformancePlayerId(b!.playerId)}
                            className="text-left text-sm font-black text-[#111111] hover:text-[#D9A928] flex items-center gap-1.5 truncate group cursor-pointer"
                            title="View Player Performance & Wagon Wheel"
                          >
                            <span className="group-hover:underline">{p?.name ?? "Batter"}</span>
                            {isStriker && <span className="text-[#D9A928] font-black">*</span>}
                          </button>
                          <p className="text-[10px] text-[#5F6368] font-bold">
                            {isStriker ? "On Strike" : "Non-Striker"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#111111] tabular-nums">
                            {b!.runs} <span className="text-xs text-[#5F6368] font-normal">({b!.balls})</span>
                          </p>
                          <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                            4s: {b!.fours} • 6s: {b!.sixes} • SR: {sr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {!striker && !nonStriker && (
                    <p className="text-xs text-[#5F6368] italic py-1">No active batters on crease.</p>
                  )}
                </div>
              </div>

              {/* Current Bowler & This Over Balls */}
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2.5 border-b border-[#E5E5E5] pb-2">
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
                            <button
                              onClick={() => setSelectedPerformancePlayerId(activeBowler.playerId)}
                              className="text-left text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate cursor-pointer"
                              title="View Player Performance & Wagon Wheel"
                            >
                              {p?.name ?? "Bowler"}
                            </button>
                            <p className="text-[10px] text-[#5F6368] font-bold">{p?.role ?? "Bowling"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#111111] tabular-nums">
                              <span className="text-[#9A6A05] font-black">{activeBowler.wickets}</span>/{activeBowler.runs}{" "}
                              <span className="text-xs text-[#5F6368] font-normal">
                                ({oversText(activeBowler.legalBalls)} ov)
                              </span>
                            </p>
                            <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                              M: {activeBowler.maidens} • Econ: {(activeBowler.economy ?? 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-[#5F6368] italic py-1">Next bowler awaiting selection</p>
                  )}
                </div>

                {/* 3. THIS OVER BALLS STRIP */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1">
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
                    {!currentInnings.recentBalls?.length && (
                      <span className="text-xs text-[#5F6368] italic">Over yet to start</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. CURRENT PARTNERSHIP (ONLY WHEN LIVE) */}
          {isLive && currentInnings && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] block mb-1">
                  CURRENT PARTNERSHIP
                </span>
                <p className="text-sm font-black text-[#111111]">
                  {lookup.player(currentInnings.partnership.batterAId ?? "")?.name ?? "Striker"} &{" "}
                  {lookup.player(currentInnings.partnership.batterBId ?? "")?.name ?? "Non-Striker"}
                </p>
                <p className="text-xs font-bold text-[#5F6368] mt-0.5">
                  {currentInnings.partnership.runs} runs • {currentInnings.partnership.balls} balls
                </p>
              </div>
              <div className="text-right bg-[#F7F7F5] border border-[#E5E5E5] px-3.5 py-2 rounded-2xl">
                <span className="text-xl font-black text-[#111111] tabular-nums block">
                  {currentInnings.partnership.runs}
                </span>
                <span className="text-[9px] font-bold text-[#5F6368] uppercase block leading-none">
                  Runs
                </span>
              </div>
            </div>
          )}

          {/* 5. RUNS PER OVER (BMR) & OVER-BY-OVER BREAKDOWN */}
          {(() => {
            const hasFirstInnings = (firstInnings?.legalBalls ?? 0) > 0 || (firstInnings?.extras ?? 0) > 0;
            const hasSecondInnings = (secondInnings?.legalBalls ?? 0) > 0 || (secondInnings?.extras ?? 0) > 0;
            const bothInningsHaveData = hasFirstInnings && hasSecondInnings;

            const effectiveInningsIdx =
              oversInningsIdx !== null
                ? oversInningsIdx
                : hasSecondInnings
                ? 1
                : 0;

            const activeInningsForOvers = state?.innings[effectiveInningsIdx] ?? currentInnings;
            const overGroups = activeInningsForOvers?.overGroups ?? [];
            const maxOverRuns = overGroups.reduce((max, og) => Math.max(max, og.runs), 1);
            const inningsBatTeam = activeInningsForOvers ? lookup.team(activeInningsForOvers.battingTeamId) : null;
            const completedCount = overGroups.filter((og) => og.complete).length;
            const hasInProgressOver = overGroups.some((og) => !og.complete);

            if (overGroups.length === 0) {
              return (
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-[#D9A928]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                        OVER BREAKDOWNS
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#5F6368] italic py-2">No over data available yet.</p>
                </div>
              );
            }

            // Show all overs in ascending chronological order: Over 1, Over 2, Over 3, ...
            const displayedOvers = showAllOvers ? overGroups : overGroups.slice(-5);

            return (
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
                {/* Header with Innings Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#D9A928]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                      OVER-BY-OVER BREAKDOWN
                    </h3>
                  </div>

                  {/* Innings Selector if both innings have data */}
                  {bothInningsHaveData ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] self-start sm:self-auto">
                      <button
                        onClick={() => setOversInningsIdx(0)}
                        className={`tap px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          effectiveInningsIdx === 0
                            ? "bg-[#111111] text-[#D9A928] shadow-xs"
                            : "text-[#5F6368] hover:text-[#111111]"
                        }`}
                      >
                        1st Inn ({teamFirst?.shortName ?? "Inn 1"})
                      </button>
                      <button
                        onClick={() => setOversInningsIdx(1)}
                        className={`tap px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          effectiveInningsIdx === 1
                            ? "bg-[#111111] text-[#D9A928] shadow-xs"
                            : "text-[#5F6368] hover:text-[#111111]"
                        }`}
                      >
                        2nd Inn ({teamSecond?.shortName ?? "Inn 2"})
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#5F6368]">
                      {inningsBatTeam?.name} ({activeInningsForOvers?.runs}/{activeInningsForOvers?.wickets})
                    </span>
                  )}
                </div>

                {/* Runs per Over Bar Chart */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                    <span>Runs Per Over</span>
                    <span>{completedCount} Completed {hasInProgressOver ? "· 1 Live" : ""}</span>
                  </div>
                  <div className="flex items-end gap-1.5 sm:gap-2 h-20 pt-3 pb-1 border-b border-[#E5E5E5] overflow-x-auto no-scrollbar">
                    {overGroups.map((og) => {
                      const heightPercent = Math.max(14, Math.round((og.runs / Math.max(maxOverRuns, 1)) * 100));
                      const hasWicket = og.wickets > 0;
                      const isHighOver = og.runs >= 10;
                      const isLiveOver = !og.complete;

                      return (
                        <div
                          key={og.overNumber}
                          className="flex-1 min-w-[24px] max-w-[36px] flex flex-col items-center justify-end h-full group"
                        >
                          <span className="text-[9px] font-black text-[#111111] tabular-nums mb-0.5 group-hover:text-[#D9A928]">
                            {og.runs}
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t transition-all ${
                              hasWicket
                                ? "bg-red-500"
                                : isHighOver
                                ? "bg-[#D9A928]"
                                : isLiveOver
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-[#111111]"
                            }`}
                          />
                          <span className="text-[9px] font-bold text-[#5F6368] mt-1 tabular-nums">
                            {og.overNumber + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chronological Complete Over Breakdowns (Over 1, Over 2, Over 3, Over 4, Over 5...) */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                      All Completed Overs ({displayedOvers.length})
                    </p>
                    {overGroups.length > 5 && (
                      <button
                        onClick={() => setShowAllOvers((prev) => !prev)}
                        className="text-[10px] font-black uppercase text-[#D9A928] hover:underline cursor-pointer"
                      >
                        {showAllOvers ? "Collapse to Recent 5" : `View All ${overGroups.length} Overs`}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col divide-y divide-[#E5E5E5]">
                    {displayedOvers.map((og) => {
                      const bowler = lookup.player(og.bowlerId);
                      const isLiveOver = !og.complete;

                      return (
                        <div
                          key={og.overNumber}
                          className={`py-2.5 flex items-center justify-between gap-2 text-xs transition-colors ${
                            isLiveOver ? "bg-emerald-500/5 -mx-2 px-2 rounded-xl" : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-black text-[#111111]">
                                OVER {og.overNumber + 1}
                              </p>
                              {isLiveOver ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[9px] font-extrabold uppercase">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  Live in progress ({og.balls.length} balls)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-[#5F6368]">
                                  • {bowler?.name ?? bowler?.shortName ?? "Bowler"}
                                </span>
                              )}
                            </div>

                            {/* Ball Chips */}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {og.balls.map((b, bi) => {
                                let bg = "bg-[#F7F7F5] text-[#111111] border-[#E5E5E5]";
                                if (b.kind === "wicket") bg = "bg-red-600 text-white border-red-700 font-black";
                                else if (b.delivery.batterRuns === 4) bg = "bg-[#D9A928] text-black border-[#C7961A] font-black";
                                else if (b.delivery.batterRuns === 6) bg = "bg-purple-600 text-white border-purple-700 font-black";
                                else if (b.kind === "extra") bg = "bg-blue-50 text-blue-800 border-blue-200 font-bold";

                                return (
                                  <span
                                    key={b.delivery.id || `${og.overNumber}-${bi}`}
                                    className={`h-6 min-w-6 px-1 rounded-md text-[10px] font-bold flex items-center justify-center border shadow-2xs tabular-nums ${bg}`}
                                  >
                                    {b.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Over Stats */}
                          <div className="text-right shrink-0">
                            <span className="font-black text-base text-[#111111] tabular-nums">{og.runs}</span>
                            <span className="text-[10px] font-bold text-[#5F6368] uppercase ml-1">RUNS</span>
                            {og.wickets > 0 && (
                              <p className="text-[10px] font-black text-red-600 uppercase tabular-nums">
                                {og.wickets} {og.wickets === 1 ? "Wicket" : "Wickets"}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 7. COMPLETED PARTNERSHIPS */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#D9A928]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  COMPLETED PARTNERSHIPS
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#5F6368]">
                {state?.innings.reduce((acc, inn) => acc + (inn.partnerships?.length ?? 0), 0) ?? 0} Total
              </span>
            </div>

            {state?.innings.map((inn, idx) => (
              <div key={inn.index} className="flex flex-col gap-1.5 pt-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                  {idx === 0 ? (teamFirst?.name ?? "1st Innings") : (teamSecond?.name ?? "2nd Innings")} ({inn.runs}/{inn.wickets})
                </p>
                {inn.partnerships && inn.partnerships.length > 0 ? (
                  <div className="flex flex-col divide-y divide-[#E5E5E5] bg-[#F7F7F5] border border-[#E5E5E5] rounded-2xl px-3.5">
                    {inn.partnerships.map((p, pi) => {
                      const batterA = lookup.player(p.batterAId);
                      const batterB = lookup.player(p.batterBId);
                      const batterOut = lookup.player(p.batterOutId);
                      return (
                        <div key={pi} className="py-2.5 flex items-center justify-between text-xs">
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
                            <span className="text-[#5F6368] font-bold">({p.balls}b)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#5F6368] italic py-1 px-1">No completed wickets in this innings.</p>
                )}
              </div>
            ))}
          </div>
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
                                <button
                                  onClick={() => setSelectedPerformancePlayerId(b.playerId)}
                                  className="text-left font-extrabold text-[#111111] hover:text-[#D9A928] hover:underline truncate"
                                  title="View Player Performance & Wagon Wheel"
                                >
                                  {p?.name ?? b.playerId}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPerformancePlayerId(b.playerId);
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
                              <button
                                onClick={() => setSelectedPerformancePlayerId(b.playerId)}
                                className="text-left hover:text-[#D9A928] hover:underline truncate block"
                                title="View Player Performance & Wagon Wheel"
                              >
                                {p?.name ?? b.playerId}
                              </button>
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
                runsOffBat: d.delivery.batterRuns ?? (d.delivery as any).runsOffBat ?? (d.delivery as any).runs_off_bat ?? 0,
                shotZone: d.delivery.shotZone ?? (d.delivery as any).shot_zone ?? null,
                overNumber: (d.delivery as any).overNumber ?? 0,
                ballNumber: (d.delivery as any).ballNumber ?? 0,
              }));

            const summary = currentBatter
              ? calculateBatterWagonWheel(currentBatter.id, currentBatter.name, deliveries)
              : null;

            return (
              <div className="flex flex-col gap-5">
                {/* Batter Pills */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368] block">
                        BATTER WAGON WHEEL / SHOT MAP
                      </span>
                      <p className="text-xs text-[#111111] font-bold">Select Batter</p>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-[#F3F4F6] text-[#5F6368] px-2.5 py-1 rounded-full">
                      {allBatters.length} Batters
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {allBatters.map((b) => {
                      const isSelected = b.id === currentSelectedId;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelectedWagonBatterId(b.id)}
                          className={`tap px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-[#111111] text-[#D9A928] border-2 border-[#D9A928] shadow-sm"
                              : "bg-[#F7F7F5] text-[#5F6368] hover:text-[#111111] border border-[#E5E5E5]"
                          }`}
                        >
                          <span>{b.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-[#D9A928] text-black font-black" : "bg-white text-[#5F6368]"}`}>
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
                  <WagonWheel
                    summary={summary}
                    batterStat={
                      currentBatter
                        ? {
                            runs: currentBatter.runs,
                            balls: currentBatter.balls,
                            fours: currentBatter.fours,
                            sixes: currentBatter.sixes,
                            strikeRate:
                              currentBatter.balls > 0
                                ? (currentBatter.runs / currentBatter.balls) * 100
                                : 0,
                          }
                        : undefined
                    }
                  />
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
          <div className="bg-gradient-to-r from-[#121316] via-black to-[#121316] border-2 border-[#D9A928] rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#D9A928]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#D9A928]">
                  {isDone ? "🏆 MAN OF THE MATCH" : "CURRENT MATCH MVP LEADER"}
                </h3>
              </div>
              {(() => {
                const targetId = momPlayerId || (isDone ? matchMvpList[0]?.playerId : undefined);
                const mvp = targetId ? matchMvpList.find((m) => m.playerId === targetId) : undefined;
                return mvp ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D9A928] text-black font-black text-[10px]">
                    Impact: {mvp.totalPoints} pts
                  </span>
                ) : null;
              })()}
            </div>

            {(() => {
              const targetId = momPlayerId || (isDone ? matchMvpList[0]?.playerId : undefined);
              const player = targetId ? lookup.player(targetId) : undefined;
              const mvp = targetId ? matchMvpList.find((m) => m.playerId === targetId) : undefined;

              if (!player) {
                return (
                  <div className="py-2 text-xs font-bold text-white/60 italic">
                    {isDone
                      ? "Man of the Match: Awaiting referee confirmation."
                      : "Man of the Match will be calculated upon match completion."}
                  </div>
                );
              }

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-16 rounded-2xl bg-black/60 border-2 border-[#D9A928] p-1 flex items-center justify-center overflow-hidden shrink-0">
                      {player.avatar ? (
                        <img src={player.avatar} alt="" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <User className="h-8 w-8 text-white/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <button
                        onClick={() => setSelectedPerformancePlayerId(player.id)}
                        className="text-left text-lg sm:text-xl font-black text-white hover:text-[#D9A928] hover:underline block truncate"
                        title="View Player Performance & Wagon Wheel"
                      >
                        {player.name}
                      </button>
                      <p className="text-xs text-[#D9A928] font-bold mt-0.5">
                        {lookup.team(player.teamId)?.name ?? "TPL Team"} • {player.role}
                      </p>
                      {mvp?.performanceSummary && (
                        <p className="text-xs text-white/80 font-extrabold mt-1">
                          {mvp.performanceSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => setSelectedPerformancePlayerId(player.id)}
                      className="tap px-4 py-2 rounded-xl bg-[#D9A928] text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#E5B537]"
                    >
                      View Player
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Match Records Grid */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
              <Trophy className="h-5 w-5 text-[#9A6A05]" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Match Records & Top Performers
                </h3>
                <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                  Accolades derived from this match's deliveries
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Best Batter */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-orange-600 mb-1">
                    <Flame className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Top Batter</span>
                  </div>
                  {singleMatchStats?.records.bestBatter && singleMatchStats.records.bestBatter.runs > 0 ? (
                    <div>
                      <button
                        onClick={() => setSelectedPerformancePlayerId(singleMatchStats.records.bestBatter!.playerId)}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate text-left"
                      >
                        {singleMatchStats.records.bestBatter.playerName}
                      </button>
                      <p className="text-[10px] text-[#5F6368] font-bold mt-0.5">
                        {singleMatchStats.records.bestBatter.teamShortName} • SR {formatStatDecimal(singleMatchStats.records.bestBatter.strikeRate)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5F6368] italic py-1">No runs yet</p>
                  )}
                </div>
                {singleMatchStats?.records.bestBatter && singleMatchStats.records.bestBatter.runs > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-base font-black text-orange-600 tabular-nums">
                      {singleMatchStats.records.bestBatter.runs} runs
                    </span>
                    <span className="text-[10px] text-[#5F6368] font-bold">
                      ({singleMatchStats.records.bestBatter.balls}b, {singleMatchStats.records.bestBatter.fours}x4, {singleMatchStats.records.bestBatter.sixes}x6)
                    </span>
                  </div>
                )}
              </div>

              {/* Best Bowler / Figures */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-purple-700 mb-1">
                    <Target className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Best Bowling</span>
                  </div>
                  {singleMatchStats?.records.bestBowlingFigures && singleMatchStats.records.bestBowlingFigures.legalBalls > 0 ? (
                    <div>
                      <button
                        onClick={() => setSelectedPerformancePlayerId(singleMatchStats.records.bestBowlingFigures!.playerId)}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate text-left"
                      >
                        {singleMatchStats.records.bestBowlingFigures.playerName}
                      </button>
                      <p className="text-[10px] text-[#5F6368] font-bold mt-0.5">
                        {singleMatchStats.records.bestBowlingFigures.teamShortName} • Econ {formatStatDecimal(singleMatchStats.records.bestBowlingFigures.economy)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5F6368] italic py-1">No bowling data yet</p>
                  )}
                </div>
                {singleMatchStats?.records.bestBowlingFigures && singleMatchStats.records.bestBowlingFigures.legalBalls > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-base font-black text-purple-700 tabular-nums">
                      {singleMatchStats.records.bestBowlingFigures.wickets}/{singleMatchStats.records.bestBowlingFigures.runsConceded}
                    </span>
                    <span className="text-[10px] text-[#5F6368] font-bold">
                      ({singleMatchStats.records.bestBowlingFigures.oversText} ov)
                    </span>
                  </div>
                )}
              </div>

              {/* Best Striker */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#9A6A05] mb-1">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Best Striker</span>
                  </div>
                  {singleMatchStats?.records.bestStriker && singleMatchStats.records.bestStriker.runs > 0 ? (
                    <div>
                      <button
                        onClick={() => setSelectedPerformancePlayerId(singleMatchStats.records.bestStriker!.playerId)}
                        className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate text-left"
                      >
                        {singleMatchStats.records.bestStriker.playerName}
                      </button>
                      <p className="text-[10px] text-[#5F6368] font-bold mt-0.5">
                        {singleMatchStats.records.bestStriker.teamShortName} • {singleMatchStats.records.bestStriker.runs} runs ({singleMatchStats.records.bestStriker.balls}b)
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5F6368] italic py-1">No striker data yet</p>
                  )}
                </div>
                {singleMatchStats?.records.bestStriker && singleMatchStats.records.bestStriker.runs > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-base font-black text-[#111111] tabular-nums">
                      SR {formatStatDecimal(singleMatchStats.records.bestStriker.strikeRate)}
                    </span>
                    <span className="text-[10px] text-[#5F6368] font-bold">
                      {singleMatchStats.records.bestStriker.boundaryRuns} boundary runs
                    </span>
                  </div>
                )}
              </div>

              {/* Most Sixes in Match */}
              {singleMatchStats?.records.mostSixes && singleMatchStats.records.mostSixes.sixes > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Most Sixes (6s)</span>
                    </div>
                    <button
                      onClick={() => setSelectedPerformancePlayerId(singleMatchStats.records.mostSixes!.playerId)}
                      className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate text-left"
                    >
                      {singleMatchStats.records.mostSixes.playerName}
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-base font-black text-amber-600 tabular-nums">
                      {singleMatchStats.records.mostSixes.sixes} Sixes
                    </span>
                    <span className="text-[10px] text-[#5F6368] font-bold">
                      ({singleMatchStats.records.mostSixes.runs} total runs)
                    </span>
                  </div>
                </div>
              )}

              {/* Most Fours in Match */}
              {singleMatchStats?.records.mostFours && singleMatchStats.records.mostFours.fours > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-yellow-600 mb-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Most Fours (4s)</span>
                    </div>
                    <button
                      onClick={() => setSelectedPerformancePlayerId(singleMatchStats.records.mostFours!.playerId)}
                      className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate text-left"
                    >
                      {singleMatchStats.records.mostFours.playerName}
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-base font-black text-[#111111] tabular-nums">
                      {singleMatchStats.records.mostFours.fours} Fours
                    </span>
                    <span className="text-[10px] text-[#5F6368] font-bold">
                      ({singleMatchStats.records.mostFours.runs} total runs)
                    </span>
                  </div>
                </div>
              )}

              {/* Best Fielder */}
              {singleMatchStats?.records.bestFielder && singleMatchStats.records.bestFielder.totalDismissals > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Top Fielder</span>
                    </div>
                    <button
                      onClick={() => setSelectedPerformancePlayerId(singleMatchStats.records.bestFielder!.playerId)}
                      className="text-sm font-black text-[#111111] hover:text-[#D9A928] hover:underline block truncate text-left"
                    >
                      {singleMatchStats.records.bestFielder.playerName}
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-base font-black text-blue-700 tabular-nums">
                      {singleMatchStats.records.bestFielder.totalDismissals} Dismissals
                    </span>
                    <span className="text-[10px] text-[#5F6368] font-bold">
                      {singleMatchStats.records.bestFielder.catches}c, {singleMatchStats.records.bestFielder.runOuts}ro
                    </span>
                  </div>
                </div>
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
                  <button
                    onClick={() => setSelectedPerformancePlayerId(pId)}
                    key={pId}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs hover:bg-[#F7F7F5] transition-colors group w-full text-left"
                    title="View Player Performance & Wagon Wheel"
                  >
                    <span className="font-bold text-[#111111] group-hover:text-[#D9A928] group-hover:underline">
                      {pIdx + 1}. {player?.name ?? pId}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368] px-2 py-0.5 rounded-full bg-[#F7F7F5]">
                      {player?.role ?? "Player"}
                    </span>
                  </button>
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
                  <button
                    onClick={() => setSelectedPerformancePlayerId(pId)}
                    key={pId}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs hover:bg-[#F7F7F5] transition-colors group w-full text-left"
                    title="View Player Performance & Wagon Wheel"
                  >
                    <span className="font-bold text-[#111111] group-hover:text-[#D9A928] group-hover:underline">
                      {pIdx + 1}. {player?.name ?? pId}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6368] px-2 py-0.5 rounded-full bg-[#F7F7F5]">
                      {player?.role ?? "Player"}
                    </span>
                  </button>
                );
              })}
              {(!state?.setup.playingXI[teamB?.id ?? ""]?.playerIds?.length) && (
                <p className="text-xs text-[#5F6368] italic py-4 text-center">Playing XI will be announced at toss.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PLAYER PERFORMANCE & INDIVIDUAL WAGON WHEEL MODAL ───────── */}
      <PlayerPerformanceModal
        playerId={selectedPerformancePlayerId}
        onClose={() => setSelectedPerformancePlayerId(null)}
        match={match}
        state={state}
        allDeliveries={allDeliveries}
        onSelectPlayer={(id) => setSelectedPerformancePlayerId(id)}
      />
    </div>
  );
}
