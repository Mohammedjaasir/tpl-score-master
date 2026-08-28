import { Clock, MapPin, Layers, ArrowRight } from "lucide-react";
import type { Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { useMatchStore } from "@/lib/scoring/store";
import { formatMatchTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

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
        FINAL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-white/80 uppercase border border-white/10">
      {status === "READY" ? "READY" : "UPCOMING"}
    </span>
  );
}

// ── Team Crest (with real-time live score overlay if batting) ─────────────────

function TeamCrest({
  teamId,
  scoreText,
  oversText,
  isBatting,
}: {
  teamId: string;
  scoreText?: string;
  oversText?: string;
  isBatting?: boolean;
}) {
  const team = lookup.team(teamId);
  const words = (team?.name ?? "Team").split(" ");
  const line1 = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
  const line2 = words.length > 1 ? words[words.length - 1] : "";

  return (
    <div className="flex flex-col items-center gap-1.5 text-center min-w-0 w-[78px] sm:w-[94px] md:w-[115px]">
      <div className={`relative h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 rounded-xl bg-black/50 border p-1 flex items-center justify-center shadow-md transition-colors ${
        isBatting ? "border-[#D9A928] shadow-[0_0_15px_rgba(217,169,40,0.3)]" : "border-white/15 group-hover:border-[#D9A928]/40"
      }`}>
        {team?.logoUrl ? (
          <img src={team.logoUrl} alt={team.name ?? "team"} className="h-full w-full object-contain drop-shadow-md" />
        ) : (
          <span className="text-[11px] font-black text-[#D9A928]">{team?.shortName?.slice(0, 3) ?? "TPL"}</span>
        )}
      </div>

      <div className="leading-tight">
        <p className="text-[9px] sm:text-[10px] font-semibold text-white/65 uppercase tracking-wider truncate w-[78px] sm:w-[94px] md:w-[115px]">
          {line1}
        </p>
        <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wide truncate w-[78px] sm:w-[94px] md:w-[115px]">
          {line2 || line1}
        </p>

        {/* Live Score if available */}
        {scoreText && (
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

  const isLive = match.status === "LIVE" || state?.phase === "innings1" || state?.phase === "innings2";
  const isDone = match.status === "COMPLETED" || state?.phase === "complete";

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

  const teamAScore = inn1?.battingTeamId === match.teamAId
    ? `${inn1.runs}/${inn1.wickets}`
    : inn2?.battingTeamId === match.teamAId
    ? `${inn2.runs}/${inn2.wickets}`
    : undefined;

  const teamAOvers = inn1?.battingTeamId === match.teamAId
    ? inn1.oversText
    : inn2?.battingTeamId === match.teamAId
    ? inn2.oversText
    : undefined;

  const teamBScore = inn1?.battingTeamId === match.teamBId
    ? `${inn1.runs}/${inn1.wickets}`
    : inn2?.battingTeamId === match.teamBId
    ? `${inn2.runs}/${inn2.wickets}`
    : undefined;

  const teamBOvers = inn1?.battingTeamId === match.teamBId
    ? inn1.oversText
    : inn2?.battingTeamId === match.teamBId
    ? inn2.oversText
    : undefined;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#121316] border border-white/[0.12] shadow-2xl transition-all duration-300 hover:border-[#D9A928]/40">
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

      {/* ── Card Body ────────────────────────────────────────────────────── */}
      <div className="relative z-10">

        {/* ── ROW 1: Status + Match Number ─────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <StatusPill status={isLive ? "LIVE" : match.status} />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Match #{String(match.matchNumber).padStart(2, "0")}
          </span>
        </div>

        {/* ── ROW 2: Left meta + Teams center + (desktop) Button right ─ */}
        <div className="flex items-center gap-3 px-4 pb-3 md:pb-4">

          {/* Left: Metadata (time / venue / overs) */}
          <div className="flex flex-col gap-1 shrink-0 w-[110px] sm:w-[130px] md:w-[170px]">
            <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wide leading-tight">
              TPL 2026
            </p>
            <div className="flex flex-col gap-0.5 text-[10px] sm:text-xs text-white/65 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-[#D9A928] shrink-0" />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-[#D9A928] shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-[110px]">{match.venue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-[#D9A928] shrink-0" />
                <span>{match.overs} overs</span>
              </div>
            </div>
          </div>

          {/* Center: Head-to-head teams with Live Scores */}
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
            <TeamCrest
              teamId={match.teamAId}
              scoreText={teamAScore}
              oversText={teamAOvers}
              isBatting={currentInn?.battingTeamId === match.teamAId}
            />
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <span className="h-px w-4 bg-[#D9A928]/50" />
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#D9A928] uppercase">VS</span>
              <span className="h-px w-4 bg-[#D9A928]/50" />
            </div>
            <TeamCrest
              teamId={match.teamBId}
              scoreText={teamBScore}
              oversText={teamBOvers}
              isBatting={currentInn?.battingTeamId === match.teamBId}
            />
          </div>

          {/* Right: Button (desktop only — on mobile it's below) */}
          <div className="hidden md:flex shrink-0">
            {isDone ? (
              <Link
                to="/scorecard/$matchId"
                params={{ matchId: match.id }}
                className="tap flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs tracking-widest uppercase border border-white/20 transition-all"
              >
                {buttonLabel}
                <ArrowRight className="h-3.5 w-3.5 text-[#D9A928]" />
              </Link>
            ) : (
              <Link
                to={targetRoute}
                params={{ matchId: match.id }}
                className="tap group/btn flex items-center gap-2 px-6 py-3 rounded-lg bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#9A6A05] text-[#111111] font-black text-xs tracking-widest uppercase shadow-[0_4px_16px_rgba(217,169,40,0.4)] transition-all hover:scale-[1.02]"
              >
                {buttonLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {/* ── ROW 3: Mobile action button — full width ──────────────── */}
        <div className="md:hidden border-t border-white/10 px-4 py-3">
          {isDone ? (
            <Link
              to="/scorecard/$matchId"
              params={{ matchId: match.id }}
              className="tap flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs tracking-widest uppercase border border-white/20 transition-all"
            >
              {buttonLabel}
              <ArrowRight className="h-3.5 w-3.5 text-[#D9A928]" />
            </Link>
          ) : (
            <Link
              to={targetRoute}
              params={{ matchId: match.id }}
              className="tap flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#D9A928] hover:bg-[#F4C542] text-[#111111] font-black text-xs tracking-widest uppercase shadow-[0_4px_16px_rgba(217,169,40,0.35)] transition-all"
            >
              {buttonLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Result strip if completed */}
        {(state?.resultText || match.resultText) && (
          <div className="border-t border-white/10 bg-black/40 px-4 py-2 text-center">
            <p className="text-[10px] font-black text-[#D9A928] uppercase tracking-wide">
              {state?.resultText ?? match.resultText}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
