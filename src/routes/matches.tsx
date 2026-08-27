import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/matches")({
  component: Matches,
});

function Matches() {
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  // Ensure teams are cached
  useTeams();

  const live = allMatches.filter((m) => m.status === "LIVE");
  const ready = allMatches.filter((m) => m.status === "READY");
  const upcoming = allMatches.filter((m) => m.status === "UPCOMING");
  const completed = allMatches.filter((m) => m.status === "COMPLETED");

  const sections = [
    { label: "Live", matches: live },
    { label: "Ready to Score", matches: ready },
    { label: "Upcoming", matches: upcoming },
    { label: "Completed", matches: completed },
  ].filter((s) => s.matches.length > 0);

  return (
    <AppShell title="Matches">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-extrabold uppercase text-foreground">
          All Matches
        </h1>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground">Loading matches from Supabase...</p>
          </div>
        )}

        {isError && (
          <div className="card-surface p-6 flex flex-col items-center justify-center text-center gap-3 border border-destructive/30">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-extrabold text-foreground">Unable to load matches</p>
            <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Network error"}</p>
            <button
              onClick={() => refetch()}
              className="tap mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && allMatches.length === 0 && (
          <div className="card-surface p-12 text-center">
            <p className="text-sm font-bold text-muted-foreground">No matches scheduled in database.</p>
          </div>
        )}

        {!isLoading && sections.map((s) => (
          <section key={s.label}>
            <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
              {s.label}
            </h2>
            <div className="flex flex-col gap-3">
              {s.matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
