import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { Radio, RefreshCw, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/live")({
  component: LivePage,
});

function LivePage() {
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  useTeams();

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");

  return (
    <AppShell title="Live">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary animate-pulse" />
          <h1 className="font-display text-3xl font-extrabold uppercase text-foreground">Live</h1>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground">Checking for live matches in Supabase...</p>
          </div>
        )}

        {isError && (
          <div className="card-surface p-6 flex flex-col items-center justify-center text-center gap-3 border border-destructive/30">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-extrabold text-foreground">Unable to load live matches</p>
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

        {!isLoading && !isError && liveMatches.length === 0 && (
          <div className="card-surface px-6 py-12 text-center">
            <Radio className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">No live matches right now.</p>
          </div>
        )}

        {!isLoading && !isError && liveMatches.length > 0 && (
          <div className="flex flex-col gap-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
