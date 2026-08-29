import { createFileRoute } from "@tanstack/react-router";
import { useMatchStore } from "@/lib/scoring/store";
import { AppShell } from "@/components/layout/AppShell";
import { PublicMatchCentre } from "@/components/public/PublicMatchCentre";

export const Route = createFileRoute("/scorecard/$matchId")({
  component: ScorecardPage,
});

function ScorecardPage() {
  const { matchId } = Route.useParams();
  const store = useMatchStore(matchId);
  const { match, state, hydrated } = store;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5]">
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading match data…</p>
      </div>
    );
  }

  if (!match) {
    return (
      <AppShell title="Match Centre">
        <div className="card-surface p-12 text-center max-w-md mx-auto">
          <p className="text-sm font-bold text-muted-foreground">Match not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Match Centre" hideNav>
      <PublicMatchCentre match={match} state={state} />
    </AppShell>
  );
}
