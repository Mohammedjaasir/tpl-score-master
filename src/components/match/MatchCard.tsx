import { Clock, MapPin, Layers, ArrowRight, Radio } from "lucide-react";
import type { Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { Link } from "@tanstack/react-router";

// Preset cricket action backdrops for the stadium effect on the right
const MATCH_BACKDROPS = [
  "/hero-cricket-1.jpg",
  "/hero-cricket-2.jpg",
  "/hero-cricket-3.jpg",
  "/hero-cricket-4.jpg",
  "/hero-cricket-5.jpg",
  "/hero-cricketer.jpg",
];

export function StatusPill({ status }: { status: Match["status"] }) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9A928] px-3 py-1 text-[11px] font-black tracking-widest text-[#111111] uppercase shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[#111111] animate-pulse" aria-hidden="true" />
        LIVE
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black tracking-widest text-white uppercase border border-white/10">
        FINAL
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-white/80 uppercase border border-white/10">
      {status === "READY" ? "READY" : "UPCOMING"}
    </span>
  );
}

export function TeamHeadToHead({ teamId, align = "center" }: { teamId: string; align?: "left" | "center" | "right" }) {
  const team = lookup.team(teamId);
  const words = (team?.name ?? "Team").split(" ");
  const line1 = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
  const line2 = words.length > 1 ? words[words.length - 1] : "";

  return (
    <div className="flex flex-col items-center text-center gap-2 min-w-[90px] sm:min-w-[110px] md:min-w-[130px]">
      {/* Team Crest / Logo */}
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-2xl bg-black/40 border border-white/15 p-1.5 flex items-center justify-center shadow-lg group-hover:border-[#D9A928]/40 transition-colors">
        {team?.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={team.name}
            className="h-full w-full object-contain drop-shadow-md"
          />
        ) : (
          <span className="text-sm md:text-base font-black text-[#D9A928]">
            {team?.shortName?.slice(0, 3) || "TPL"}
          </span>
        )}
      </div>

      {/* Team Name Split Lines */}
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[11px] sm:text-xs font-semibold text-white/70 tracking-wider uppercase truncate max-w-[120px] sm:max-w-[140px]">
          {line1}
        </span>
        {line2 ? (
          <span className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide uppercase truncate max-w-[120px] sm:max-w-[140px]">
            {line2}
          </span>
        ) : (
          <span className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide uppercase truncate max-w-[120px] sm:max-w-[140px]">
            {line1}
          </span>
        )}
      </div>
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "LIVE";
  const isDone = match.status === "COMPLETED";

  const time = new Date(match.scheduledAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const backdropIndex = Math.abs(match.matchNumber - 1) % MATCH_BACKDROPS.length;
  const backdropImage = MATCH_BACKDROPS[backdropIndex];

  return (
    <article className="group relative overflow-hidden rounded-2xl md:rounded-[22px] bg-[#121316] border border-white/[0.12] shadow-2xl transition-all duration-300 hover:border-[#D9A928]/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {/* Background Stadium Glow & Cricket Action on the right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Right side player & floodlights image */}
        <img
          src={backdropImage}
          alt=""
          className="absolute right-0 top-0 h-full w-2/5 sm:w-1/3 md:w-2/5 object-cover object-center opacity-30 md:opacity-45 mix-blend-lighten scale-105 group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient Mask to smoothly blend image into the dark card */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121316] via-[#121316]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent opacity-80" />
        
        {/* Golden Stadium Floodlight / Particle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#D9A928]/10 rounded-full blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
        {/* ── Left Column: Status, Match Title, Metadata ───────── */}
        <div className="flex flex-col items-start gap-2.5 w-full md:w-auto md:min-w-[200px] lg:min-w-[240px]">
          <StatusPill status={match.status} />

          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white uppercase">
              TPL 2026 – MATCH #{String(match.matchNumber).padStart(2, "0")}
            </h3>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-white/75 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#D9A928] shrink-0" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#D9A928] shrink-0" />
              <span className="truncate max-w-[190px]">{match.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#D9A928] shrink-0" />
              <span>{match.overs} overs</span>
            </div>
          </div>
        </div>

        {/* ── Center Column: Head-to-Head Teams (Team A vs Team B) ── */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 my-2 md:my-0 flex-1">
          <TeamHeadToHead teamId={match.teamAId} />

          <div className="flex items-center gap-1.5 sm:gap-2 px-1">
            <span className="h-px w-3 sm:w-5 bg-[#D9A928]/50" />
            <span className="text-xs sm:text-sm md:text-base font-black tracking-widest text-[#D9A928] uppercase">
              VS
            </span>
            <span className="h-px w-3 sm:w-5 bg-[#D9A928]/50" />
          </div>

          <TeamHeadToHead teamId={match.teamBId} />
        </div>

        {/* ── Right Column: Action Button ─────────────────────── */}
        <div className="flex flex-col items-center md:items-end justify-center w-full md:w-auto shrink-0 pt-2 md:pt-0">
          {isDone ? (
            <Link
              to="/scorecard/$matchId"
              params={{ matchId: match.id }}
              className="tap flex items-center justify-center gap-2.5 w-full md:w-auto px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border border-white/20 transition-all shadow-md"
            >
              <span>VIEW SCORECARD</span>
              <ArrowRight className="h-4 w-4 text-[#D9A928]" />
            </Link>
          ) : (
            <Link
              to="/match/$matchId"
              params={{ matchId: match.id }}
              className="tap group/btn flex items-center justify-center gap-2.5 w-full md:w-auto px-7 py-3.5 rounded-lg bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#9A6A05] text-[#111111] font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_20px_rgba(217,169,40,0.35)] transition-all hover:shadow-[0_6px_25px_rgba(217,169,40,0.5)] hover:scale-[1.02]"
            >
              <span>{isLive ? "OPEN SCORING" : "OPEN SCORING"}</span>
              <ArrowRight className="h-4 w-4 text-[#111111] transition-transform group-hover/btn:translate-x-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Result strip if completed */}
      {isDone && match.resultText && (
        <div className="relative z-10 border-t border-white/10 bg-black/40 px-4 py-2 text-center">
          <p className="text-xs font-black text-[#D9A928] uppercase tracking-wide">
            {match.resultText}
          </p>
        </div>
      )}
    </article>
  );
}
