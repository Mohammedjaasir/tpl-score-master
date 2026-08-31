import { Clock, MapPin, Layers, ArrowRight, Trophy, Sparkles, Radio } from "lucide-react";
import type { Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { useMatchStore } from "@/lib/scoring/store";
import { formatMatchTime, formatMatchDate } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { TeamLogo } from "@/components/team/TeamLogo";

// Preset cricket action backdrops cycling per match
const MATCH_BACKDROPS = [
  "/hero-cricket-1.jpg",
  "/hero-cricket-2.jpg",
  "/hero-cricket-3.jpg",
  "/hero-cricket-4.jpg",
  "/hero-cricket-5.jpg",
  "/hero-cricketer.jpg",
];

// ── Status Pill ────────────────────────────────────────────────────────────────

export function StatusPill({ status }: { status: Match["status"] }) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9A928] px-3 py-0.5 text-[10px] sm:text-[11px] font-black tracking-widest text-[#111111] uppercase shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[#111111] animate-pulse" aria-hidden="true" />
        LIVE MATCH
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] sm:text-[11px] font-black tracking-widest text-emerald-400 uppercase border border-emerald-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-white/80 uppercase border border-white/10">
      {status === "READY" ? "READY" : "UPCOMING"}
    </span>
  );
}

interface MatchCardProps {
  match: Match;
  scorerMode?: boolean;
}

export function MatchCard({ match, scorerMode = false }: MatchCardProps) {
  const { state } = useMatchStore(match.id, match);

  // Derive unambiguous effective status
  const isDone = match.status === "COMPLETED" || state?.phase === "complete";
  const hasDeliveries = (state?.innings[0]?.legalBalls ?? 0) > 0 || (state?.innings[0]?.extras ?? 0) > 0 || (state?.innings[1]?.legalBalls ?? 0) > 0;
  const isLive = !isDone && (match.status === "LIVE" || (hasDeliveries && (state?.phase === "innings1" || state?.phase === "innings2" || state?.phase === "break")));
  const effectiveStatus = isDone ? "COMPLETED" : isLive ? "LIVE" : match.status === "READY" ? "READY" : "UPCOMING";
  const effectiveMatchOvers = state?.innings[0]?.maxOvers ?? match.overs ?? 5;

  const time = formatMatchTime(match?.scheduledAt || match?.startTime);
  const dateFormatted = formatMatchDate(match?.scheduledAt || match?.startTime);

  const backdropIndex = Math.abs((match?.matchNumber || 1) - 1) % MATCH_BACKDROPS.length;
  const backdropImage = MATCH_BACKDROPS[backdropIndex];

  const targetRoute = scorerMode && !isDone ? "/match/$matchId" : "/scorecard/$matchId";
  const buttonLabel = isDone
    ? "VIEW SCORECARD"
    : scorerMode
    ? "OPEN SCORER"
    : "MATCH CENTRE";

  // Real-time scores from live engine state
  const inn1 = state?.innings[0];
  const inn2 = state?.innings[1];
  const currentInn = state?.innings[state?.currentInningsIndex ?? 0];

  // Derive innings team order: 1st batting team always on top/left, 2nd batting team on bottom/right
  const battingFirstId = state?.innings[0]?.battingTeamId ?? state?.setup?.battingFirstId;
  const firstTeamId = battingFirstId ? battingFirstId : match.teamAId;
  const secondTeamId = firstTeamId === match.teamAId ? match.teamBId : match.teamAId;

  const team1 = lookup.team(firstTeamId);
  const team2 = lookup.team(secondTeamId);

  const firstScore = inn1 && (inn1.legalBalls > 0 || inn1.runs > 0 || isLive || isDone)
    ? `${inn1.runs}/${inn1.wickets}`
    : undefined;
  const firstOvers = inn1 && (inn1.legalBalls > 0 || inn1.runs > 0 || isLive || isDone)
    ? inn1.oversText
    : undefined;

  const secondScore = inn2 && (inn2.legalBalls > 0 || inn2.runs > 0 || isDone)
    ? `${inn2.runs}/${inn2.wickets}`
    : undefined;
  const secondOvers = inn2 && (inn2.legalBalls > 0 || inn2.runs > 0 || isDone)
    ? inn2.oversText
    : undefined;

  const resultText = isDone ? (match.resultText ?? state?.resultText) : undefined;
  const momPlayer = match.manOfTheMatchId ? lookup.player(match.manOfTheMatchId) : undefined;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LIVE MATCH CARD (STADIUM HERO ON DESKTOP & BALANCED ON MOBILE)
  // ─────────────────────────────────────────────────────────────────────────────
  if (effectiveStatus === "LIVE") {
    const battingTeam = currentInn?.battingTeamId ? lookup.team(currentInn.battingTeamId) : team1;
    const isSecondInnings = state?.currentInningsIndex === 1;

    // Authoritative effective match overs from live engine innings state or match record
    const effectiveMatchOvers = state?.innings[0]?.maxOvers ?? match.overs ?? 5;
    const secondInningsMaxOvers = state?.innings[1]?.maxOvers ?? effectiveMatchOvers;
    const targetRuns = inn1 ? (state?.innings[1]?.target ?? inn1.runs + 1) : 0;
    const runsNeeded = isSecondInnings && inn2 ? Math.max(0, targetRuns - inn2.runs) : 0;
    const maxLegalBalls = secondInningsMaxOvers * 6;
    const ballsRemaining = isSecondInnings && inn2 ? Math.max(0, maxLegalBalls - inn2.legalBalls) : 0;

    return (
      <article className="group relative overflow-hidden rounded-3xl bg-[#0E0F12] border-2 border-[#D9A928]/50 shadow-2xl transition-all duration-300 hover:border-[#D9A928] flex flex-col justify-between w-full">
        {/* Stadium Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <img
            src={backdropImage}
            alt=""
            className="absolute right-0 top-0 h-full w-full sm:w-1/2 object-cover object-center opacity-20 sm:opacity-35 mix-blend-screen scale-105 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F12] via-[#0E0F12]/90 to-[#0E0F12]/60" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D9A928]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Card Content */}
        <div className="relative z-10 flex flex-col p-5 sm:p-7 gap-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <StatusPill status="LIVE" />
              <span className="text-xs font-black text-[#D9A928] uppercase tracking-wider hidden sm:inline-block">
                {battingTeam?.name} Batting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-white/70 uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Match #{String(match.matchNumber).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-bold text-white/50 hidden sm:inline-block">
                {effectiveMatchOvers} Overs Match
              </span>
            </div>
          </div>

          {/* Desktop & Mobile Live Center Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4 my-2">
            
            {/* Team 1 (Batting First) */}
            <div className={`sm:col-span-2 flex items-center justify-start gap-4 p-3.5 sm:p-4 rounded-2xl transition-all ${
              currentInn?.battingTeamId === firstTeamId ? "bg-white/[0.08] border border-[#D9A928]/40 shadow-inner" : "bg-black/30"
            }`}>
              <TeamLogo
                logoUrl={team1?.logoUrl}
                name={team1?.name}
                shortName={team1?.shortName}
                isBatting={currentInn?.battingTeamId === firstTeamId}
                size="lg"
                className="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate">
                    {team1?.name}
                  </p>
                  {currentInn?.battingTeamId === firstTeamId && (
                    <span className="h-2 w-2 rounded-full bg-[#D9A928] animate-ping shrink-0" />
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#D9A928] tabular-nums tracking-tight">
                    {firstScore || "0/0"}
                  </span>
                  <span className="text-xs font-extrabold text-white/60 tabular-nums">
                    ({firstOvers || "0.0"} ov)
                  </span>
                </div>
              </div>
            </div>

            {/* Middle VS Pill */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center py-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A928]/20 border border-[#D9A928]/40 text-[#D9A928] text-[10px] font-black uppercase tracking-widest">
                <span>VS</span>
              </div>
            </div>

            {/* Team 2 (Batting Second / Chasing Team) */}
            <div className={`sm:col-span-2 flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl transition-all ${
              currentInn?.battingTeamId === secondTeamId ? "bg-white/[0.08] border border-[#D9A928]/40 shadow-inner" : "bg-black/30"
            }`}>
              <div className="flex items-center justify-start gap-4">
                <TeamLogo
                  logoUrl={team2?.logoUrl}
                  name={team2?.name}
                  shortName={team2?.shortName}
                  isBatting={currentInn?.battingTeamId === secondTeamId}
                  size="lg"
                  className="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate">
                      {team2?.name}
                    </p>
                    {currentInn?.battingTeamId === secondTeamId && (
                      <span className="h-2 w-2 rounded-full bg-[#D9A928] animate-ping shrink-0" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                      {secondScore || (isSecondInnings ? "0/0" : "Yet to bat")}
                    </span>
                    {secondOvers && (
                      <span className="text-xs font-extrabold text-white/60 tabular-nums">
                        ({secondOvers} ov)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chasing Target Strip (Directly attached to Chasing Team on Desktop) */}
              {isSecondInnings && (
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/35 hidden sm:flex items-center justify-between text-[#D9A928] text-[11px] font-black uppercase tracking-wider">
                  <span>NEED {runsNeeded} RUNS</span>
                  <span className="text-white/40">•</span>
                  <span>{ballsRemaining} BALLS</span>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Target Strip (Underneath Chasing Team on Mobile) */}
          {isSecondInnings && (
            <div className="sm:hidden px-4 py-2.5 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/35 flex items-center justify-center gap-2 text-[#D9A928] text-xs font-black uppercase tracking-wider">
              <span>NEED {runsNeeded} RUNS</span>
              <span className="text-white/40">•</span>
              <span>{ballsRemaining} BALLS</span>
            </div>
          )}

          {/* Bottom Bar: Metadata & Match Centre Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-white/70 font-medium">
              <div className="flex items-center gap-1.5 shrink-0">
                <Clock className="h-3.5 w-3.5 text-[#D9A928]" />
                <span className="font-bold">{time}</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-[#D9A928]" />
                <span className="truncate">{match.venue || "TPL Cricket Ground"}</span>
              </div>
              <span className="text-white/30 hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <Layers className="h-3.5 w-3.5 text-[#D9A928]" />
                <span>{effectiveMatchOvers} Overs</span>
              </div>
            </div>

            <Link
              to={targetRoute}
              params={{ matchId: match.id }}
              className="tap inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#D9A928] hover:bg-[#F4C542] text-[#111111] font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-[#D9A928]/20 transition-all active:scale-[0.98]"
            >
              <span>{buttonLabel}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. UPCOMING MATCH CARD (2-COLUMN RESPONSIVE FIXTURE CARD)
  // ─────────────────────────────────────────────────────────────────────────────
  if (effectiveStatus === "UPCOMING" || effectiveStatus === "READY") {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-[#14161A] border border-white/10 shadow-lg hover:border-[#D9A928]/50 transition-all duration-200 flex flex-col justify-between h-full">
        {/* Subtle Backdrop Accent */}
        <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
          <img src={backdropImage} alt="" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14161A] via-[#14161A]/90 to-[#14161A]/70" />
        </div>

        <div className="relative z-10 flex flex-col p-4 sm:p-5 gap-4 flex-1 justify-between">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] bg-[#D9A928]/10 border border-[#D9A928]/30 px-2.5 py-0.5 rounded-full">
              MATCH #{String(match.matchNumber).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-bold text-white/60">
              <span>{dateFormatted}</span>
              <span>•</span>
              <span className="text-[#D9A928]">{time}</span>
            </div>
          </div>

          {/* Teams Matchup Row */}
          <div className="grid grid-cols-7 items-center gap-2 my-2">
            {/* Team A */}
            <div className="col-span-3 flex flex-col items-center text-center gap-2 min-w-0">
              <TeamLogo
                logoUrl={team1?.logoUrl}
                name={team1?.name}
                shortName={team1?.shortName}
                size="md"
                className="w-12 h-12 sm:w-14 sm:h-14"
              />
              <p className="text-xs font-black text-white uppercase tracking-wide truncate w-full">
                {team1?.name}
              </p>
            </div>

            {/* VS Divider */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-[#D9A928] bg-black/40 px-2 py-1 rounded-full border border-white/10">
                VS
              </span>
            </div>

            {/* Team B */}
            <div className="col-span-3 flex flex-col items-center text-center gap-2 min-w-0">
              <TeamLogo
                logoUrl={team2?.logoUrl}
                name={team2?.name}
                shortName={team2?.shortName}
                size="md"
                className="w-12 h-12 sm:w-14 sm:h-14"
              />
              <p className="text-xs font-black text-white uppercase tracking-wide truncate w-full">
                {team2?.name}
              </p>
            </div>
          </div>

          {/* Bottom Bar: Venue, Overs & Action */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-white/50 text-[11px] truncate">
              <span className="truncate">{match.venue || "TPL Ground"}</span>
              <span>•</span>
              <span className="font-bold text-white/70 shrink-0">{effectiveMatchOvers} Overs</span>
            </div>

            <Link
              to={targetRoute}
              params={{ matchId: match.id }}
              className="tap shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#D9A928] text-white hover:text-black font-black text-[11px] uppercase tracking-wider transition-all"
            >
              <span>{buttonLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. COMPLETED MATCH CARD (RECENT RESULTS WITH FINAL SCORE & MVP)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#14161A] border border-white/10 shadow-lg hover:border-white/25 transition-all duration-200 flex flex-col justify-between h-full">
      <div className="relative z-10 flex flex-col p-4 sm:p-5 gap-3.5 flex-1 justify-between">
        
        {/* Top Bar: Completed Badge + Match # */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <StatusPill status="COMPLETED" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Match #{String(match.matchNumber).padStart(2, "0")} • {dateFormatted}
          </span>
        </div>

        {/* Scores Summary Grid */}
        <div className="flex flex-col gap-2 my-1">
          {/* Team 1 Score */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <TeamLogo logoUrl={team1?.logoUrl} name={team1?.name} shortName={team1?.shortName} size="xs" />
              <span className="text-xs font-black text-white uppercase truncate">
                {team1?.name}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-white tabular-nums">
                {firstScore || "0/0"}
              </span>
              <span className="text-[10px] text-white/50 font-bold ml-1.5 tabular-nums">
                ({firstOvers || "0.0"} ov)
              </span>
            </div>
          </div>

          {/* Team 2 Score */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <TeamLogo logoUrl={team2?.logoUrl} name={team2?.name} shortName={team2?.shortName} size="xs" />
              <span className="text-xs font-black text-white uppercase truncate">
                {team2?.name}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-white tabular-nums">
                {secondScore || "0/0"}
              </span>
              <span className="text-[10px] text-white/50 font-bold ml-1.5 tabular-nums">
                ({secondOvers || "0.0"} ov)
              </span>
            </div>
          </div>
        </div>

        {/* Result & MVP Banner */}
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <p className="text-xs font-black text-[#D9A928] uppercase truncate text-center">
            {resultText || "Match Completed"}
          </p>
          {momPlayer && (
            <p className="text-[10px] font-bold text-white/70 text-center truncate flex items-center justify-center gap-1">
              <Trophy className="h-3 w-3 text-[#D9A928] inline" />
              <span>POTM: <strong className="text-white">{momPlayer.name}</strong></span>
            </p>
          )}
        </div>

        {/* Bottom Bar: Action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <span className="text-[10px] font-medium text-white/40">{match.venue || "TPL Ground"}</span>
          <Link
            to={targetRoute}
            params={{ matchId: match.id }}
            className="tap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[11px] uppercase tracking-wider transition-colors"
          >
            <span>VIEW SCORECARD</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}

