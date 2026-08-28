import { Clock, MapPin, Layers, ArrowRight } from "lucide-react";
import type { Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { useMatchStore } from "@/lib/scoring/store";
import { formatMatchTime } from "@/lib/utils";
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9A928] px-2.5 py-0.5 text-[10px] font-black tracking-widest text-[#111111] uppercase shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#111111] animate-pulse" aria-hidden="true" />
        LIVE
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase border border-white/10">
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

// ── Team Crest ────────────────────────────────────────────────────────────────

function TeamCrest({
  teamId,
  scoreText,
  oversText,
  isBatting,
  showScore = true,
}: {
  teamId: string;
  scoreText?: string;
  oversText?: string;
  isBatting?: boolean;
  showScore?: boolean;
}) {
  const team = lookup.team(teamId);
  const words = (team?.name ?? "Team").split(" ");
  const line1 = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
  const line2 = words.length > 1 ? words[words.length - 1] : "";

  return (
    <div className="flex flex-col items-center gap-1.5 text-center min-w-0 w-[84px] sm:w-[98px] md:w-[120px]">
      <TeamLogo
        logoUrl={team?.logoUrl}
        name={team?.name}
        shortName={team?.shortName}
        isBatting={isBatting}
        size="md"
      />

      <div className="leading-tight w-full">
        <p className="text-[9px] sm:text-[10px] font-semibold text-white/65 uppercase tracking-wider truncate w-full">
          {line1}
        </p>
        <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wide truncate w-full">
          {line2 || line1}
        </p>

        {/* Live or Final Score (only if match has started/completed) */}
        {showScore && scoreText && (
          <div className="mt-1">
            <span className="inline-block px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] sm:text-xs font-black text-[#D9A928] tabular-nums">
              {scoreText}
            </span>
            {oversText && (
              <p className="text-[8px] sm:text-[9px] font-bold text-white/50">{oversText} ov</p>
            )}
          </div>
        )}
      </div>
    </div>
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

  const time = formatMatchTime(match?.scheduledAt);

  const backdropIndex = Math.abs((match?.matchNumber || 1) - 1) % MATCH_BACKDROPS.length;
  const backdropImage = MATCH_BACKDROPS[backdropIndex];

  const targetRoute = scorerMode && !isDone ? "/match/$matchId" : "/scorecard/$matchId";
  const buttonLabel = isDone
    ? "VIEW SCORECARD"
    : scorerMode
    ? "OPEN SCORING"
    : "MATCH CENTRE";

  // Real-time scores from live engine state
  const inn1 = state?.innings[0];
  const inn2 = state?.innings[1];
  const currentInn = state?.innings[state?.currentInningsIndex ?? 0];

  // Derive innings team order: 1st batting team always on top/left, 2nd batting team on bottom/right
  const battingFirstId = state?.innings[0]?.battingTeamId ?? state?.setup?.battingFirstId;
  const firstTeamId = battingFirstId ? battingFirstId : match.teamAId;
  const secondTeamId = firstTeamId === match.teamAId ? match.teamBId : match.teamAId;

  const firstScore = inn1 && (inn1.legalBalls > 0 || inn1.runs > 0 || isLive || isDone)
    ? `${inn1.runs}/${inn1.wickets}`
    : undefined;
  const firstOvers = inn1 && (inn1.legalBalls > 0 || inn1.runs > 0 || isLive || isDone)
    ? inn1.oversText
    : undefined;

  const secondScore = inn2
    ? `${inn2.runs}/${inn2.wickets}`
    : undefined;
  const secondOvers = inn2
    ? inn2.oversText
    : undefined;

  const resultText = isDone ? (match.resultText ?? state?.resultText) : undefined;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#121316] border border-white/[0.12] shadow-2xl transition-all duration-300 hover:border-[#D9A928]/40 flex flex-col justify-between w-full">
      {/* ── Stadium Backdrop ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src={backdropImage}
          alt=""
          className="absolute right-0 top-0 h-full w-2/5 md:w-1/3 object-cover object-center opacity-25 md:opacity-40 mix-blend-lighten scale-105 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121316] via-[#121316]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent opacity-70" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#D9A928]/8 rounded-full blur-3xl" />
      </div>

      {/* ── Card Content (Fully contained, zero clipping) ────────────────── */}
      <div className="relative z-10 flex flex-col p-4 sm:p-5 gap-4">

        {/* ── TOP BAR: Status + Match # ────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <StatusPill status={effectiveStatus} />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Match #{String(match.matchNumber).padStart(2, "0")}
          </span>
        </div>

        {/* ── CENTER MATCHUP: 1st Innings Team vs 2nd Innings Team ─────────── */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 my-1">
          <TeamCrest
            teamId={firstTeamId}
            scoreText={firstScore}
            oversText={firstOvers}
            isBatting={isLive && currentInn?.battingTeamId === firstTeamId}
            showScore={isLive || isDone}
          />

          <div className="flex flex-col items-center gap-1 shrink-0 px-1">
            <span className="h-px w-4 bg-[#D9A928]/50" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#D9A928] uppercase">VS</span>
            <span className="h-px w-4 bg-[#D9A928]/50" />
          </div>

          <TeamCrest
            teamId={secondTeamId}
            scoreText={secondScore}
            oversText={secondOvers}
            isBatting={isLive && currentInn?.battingTeamId === secondTeamId}
            showScore={isLive || isDone}
          />
        </div>

        {/* ── RESULT BANNER (Only if Completed) ────────────────────────────── */}
        {resultText && (
          <div className="rounded-xl bg-black/50 border border-white/10 py-1.5 px-3 text-center">
            <p className="text-xs font-black text-[#D9A928] uppercase tracking-wide truncate">
              {resultText}
            </p>
          </div>
        )}

        {/* ── BOTTOM ACTION & METADATA BAR ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
          {/* Metadata */}
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-white/60 font-medium overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="h-3 w-3 text-[#D9A928]" />
              <span>{time}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 text-[#D9A928] shrink-0" />
              <span className="truncate">{match.venue}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Layers className="h-3 w-3 text-[#D9A928]" />
              <span>{match.overs} ov</span>
            </div>
          </div>

          {/* CTA Button (100% visible inside card) */}
          <Link
            to={targetRoute}
            params={{ matchId: match.id }}
            className={`tap shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md active:scale-[0.99] ${
              isDone
                ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                : "bg-[#D9A928] hover:bg-[#E5B537] text-[#111111]"
            }`}
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}
