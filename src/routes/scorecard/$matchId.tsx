import { createFileRoute, Link } from "@tanstack/react-router";
import { useMatchStore } from "@/lib/scoring/store";
import { AppShell } from "@/components/layout/AppShell";
import { ScorecardView } from "@/components/scorecard/ScorecardView";
import { lookup } from "@/lib/repositories";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/scorecard/$matchId")({
  component: ScorecardPage,
});

function ScorecardPage() {
  const { matchId } = Route.useParams();
  const store = useMatchStore(matchId);
  const { match, state, hydrated } = store;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!match) {
    return (
      <AppShell title="Scorecard">
        <p className="text-sm text-muted-foreground">Match not found.</p>
      </AppShell>
    );
  }

  const teamA = lookup.team(match.teamAId);
  const teamB = lookup.team(match.teamBId);
  const innings = state?.innings ?? [];

  return (
    <AppShell title="Scorecard" hideNav>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/matches"
            className="tap grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              {match.tournament} · Match #{match.matchNumber}
            </p>
            <h1 className="font-display text-xl font-extrabold text-foreground">
              {teamA?.name} vs {teamB?.name}
            </h1>
          </div>
        </div>

        {/* Result */}
        {state?.resultText && (
          <div className="rounded-2xl bg-primary px-4 py-3 text-center">
            <p className="text-sm font-extrabold text-primary-foreground">{state.resultText}</p>
          </div>
        )}

        {innings.length === 0 ? (
          <div className="card-surface px-6 py-10 text-center">
            <p className="text-sm font-bold text-muted-foreground">
              No innings data yet. Score some balls first!
            </p>
          </div>
        ) : (
          <ScorecardView innings={innings} />
        )}
      </div>
    </AppShell>
  );
}
