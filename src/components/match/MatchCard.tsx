import { CalendarClock, MapPin, ArrowRight } from "lucide-react";
import type { Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { TplLinkButton } from "@/components/ui/tpl-button";

export function StatusPill({ status }: { status: Match["status"] }) {
  const map: Record<Match["status"], string> = {
    LIVE: "bg-[#D9A928] text-[#111111] font-black shadow-sm",
    READY: "bg-[#D9A928]/15 text-[#9A6A05] border border-[#D9A928]/30",
    UPCOMING: "bg-[#F7F7F5] text-[#5F6368] border border-[#E5E5E5]",
    COMPLETED: "bg-[#111111] text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase ${map[status]}`}
    >
      {status === "LIVE" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#111111]" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

export function TeamBadge({ teamId }: { teamId: string }) {
  const team = lookup.team(teamId);
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-black tracking-wide text-[#111111]">
        {team?.shortName}
      </span>
      <span className="truncate text-sm font-bold text-[#111111]">{team?.name}</span>
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const time = new Date(match.scheduledAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const isLive = match.status === "LIVE";
  const isDone = match.status === "COMPLETED";

  return (
    <article className="bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_18px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E5E5] bg-[#FAFAF8] px-4 py-3">
        <p className="truncate text-[11px] font-bold tracking-widest text-[#5F6368] uppercase">
          {match.tournament} — Match #{String(match.matchNumber).padStart(2, "0")}
        </p>
        <StatusPill status={match.status} />
      </div>

      <div className="space-y-3 px-4 py-4">
        <TeamBadge teamId={match.teamAId} />
        <div className="flex items-center gap-3 pl-3">
          <span className="display-xl text-xs text-[#5F6368]">vs</span>
          <span className="h-px flex-1 bg-[#E5E5E5]" />
        </div>
        <TeamBadge teamId={match.teamBId} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-[#5F6368]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-[#D9A928]" aria-hidden="true" /> {time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#D9A928]" aria-hidden="true" /> {match.venue}
          </span>
          <span className="font-semibold text-[#111111]">{match.overs} overs</span>
        </div>

        {isDone && match.resultText && (
          <p className="text-sm font-bold text-[#111111] bg-[#F7F7F5] p-2.5 rounded-xl border border-[#E5E5E5]">{match.resultText}</p>
        )}
      </div>

      <div className="px-4 pb-4">
        {isDone ? (
          <TplLinkButton
            to="/scorecard/$matchId"
            params={{ matchId: match.id }}
            variant="outline"
            size="md"
            fullWidth
            iconRight={ArrowRight}
            className="!text-[#111111] !border-[#E5E5E5] hover:!bg-[#F7F7F5]"
          >
            VIEW SCORECARD
          </TplLinkButton>
        ) : (
          <TplLinkButton
            to="/match/$matchId"
            params={{ matchId: match.id }}
            variant={isLive ? "primary" : "primary"}
            size="md"
            fullWidth
            iconRight={ArrowRight}
            className={isLive ? "" : "!bg-[#111111] hover:!bg-[#1A1A1A] !text-white !border-black"}
          >
            {isLive ? "OPEN SCORING" : "SET UP MATCH"}
          </TplLinkButton>
        )}
      </div>
    </article>
  );
}
