import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { lookup } from "@/lib/repositories";

export const Route = createFileRoute("/matches")({
  component: Matches,
});

function Matches() {
  const allMatches = lookup.matches();
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
        {sections.map((s) => (
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
