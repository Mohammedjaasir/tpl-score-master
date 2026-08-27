import { Link } from "@tanstack/react-router";
import { CalendarClock, MapPin } from "lucide-react";
import type { Match } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

export function StatusPill({ status }: { status: Match["status"] }) {
  const map: Record<Match["status"], string> = {
    LIVE: "bg-primary text-primary-foreground",
    READY: "bg-success/15 text-success",
    UPCOMING: "bg-secondary text-muted-foreground",
    COMPLETED: "bg-foreground/8 text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase ${map[status]}`}
    >
      {status === "LIVE" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

export function TeamBadge({ teamId }: { teamId: string }) {
  const team = lookup.team(teamId);
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-xs font-extrabold tracking-wide text-foreground">
        {team?.shortName}
      </span>
      <span className="truncate text-sm font-bold text-foreground">{team?.name}</span>
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
    <article className="card-surface overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <p className="truncate text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {match.tournament} — Match #{String(match.matchNumber).padStart(2, "0")}
        </p>
        <StatusPill status={match.status} />
      </div>

      <div className="space-y-3 px-4 py-4">
        <TeamBadge teamId={match.teamAId} />
        <div className="flex items-center gap-3 pl-3">
          <span className="display-xl text-xs text-muted-foreground">vs</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <TeamBadge teamId={match.teamBId} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> {time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {match.venue}
          </span>
          <span>{match.overs} overs</span>
        </div>

        {isDone && match.resultText && (
          <p className="text-sm font-bold text-foreground">{match.resultText}</p>
        )}
      </div>

      <div className="px-4 pb-4">
        {isDone ? (
          <Link
            to="/scorecard/$matchId"
            params={{ matchId: match.id }}
            className="tap flex min-h-11 w-full items-center justify-center rounded-full bg-secondary text-xs font-extrabold tracking-widest text-foreground uppercase"
          >
            View Scorecard
          </Link>
        ) : (
          <Link
            to="/match/$matchId"
            params={{ matchId: match.id }}
            className={`tap flex min-h-12 w-full items-center justify-center rounded-full text-xs font-extrabold tracking-widest uppercase ${
              isLive
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"
                : "bg-foreground text-background"
            }`}
          >
            {isLive ? "Continue Scoring" : "Set Up Match"}
          </Link>
        )}
      </div>
    </article>
  );
}
