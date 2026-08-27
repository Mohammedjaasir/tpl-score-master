import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { lookup } from "@/lib/repositories";
import { StatusPill } from "@/components/match/MatchCard";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/scorecards")({
  component: Scorecards,
});

function Scorecards() {
  const matches = lookup.matches().filter((m) => m.status === "COMPLETED");

  return (
    <AppShell title="Scorecards">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="font-display text-3xl font-extrabold uppercase text-foreground">
          Scorecards
        </h1>

        {matches.length === 0 ? (
          <div className="card-surface px-6 py-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-bold text-muted-foreground">
              No completed matches yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((m) => {
              const teamA = lookup.team(m.teamAId);
              const teamB = lookup.team(m.teamBId);
              return (
                <div key={m.id} className="card-surface px-4 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      Match #{m.matchNumber}
                    </span>
                    <StatusPill status={m.status} />
                  </div>
                  <p className="text-sm font-extrabold text-foreground">
                    {teamA?.name} vs {teamB?.name}
                  </p>
                  {m.resultText && (
                    <p className="text-xs font-bold text-primary mt-1">{m.resultText}</p>
                  )}
                  <div className="mt-3">
                    <Link
                      to="/scorecard/$matchId"
                      params={{ matchId: m.id }}
                      className="tap inline-flex h-9 items-center rounded-full bg-primary px-4 text-[10px] font-extrabold uppercase tracking-widest text-primary-foreground"
                    >
                      View Scorecard
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
