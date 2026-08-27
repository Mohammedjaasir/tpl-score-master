import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { lookup } from "@/lib/repositories";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/live")({
  component: LivePage,
});

function LivePage() {
  const liveMatches = lookup.matches().filter((m) => m.status === "LIVE");

  return (
    <AppShell title="Live">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary animate-pulse" />
          <h1 className="font-display text-3xl font-extrabold uppercase text-foreground">Live</h1>
        </div>

        {liveMatches.length === 0 ? (
          <div className="card-surface px-6 py-12 text-center">
            <Radio className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">No live matches right now.</p>
          </div>
        ) : (
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
