import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard, StatusPill } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { lookup } from "@/lib/repositories";
import { Radio, CalendarClock, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: ScorerHome,
});

function ScorerHome() {
  const allMatches = lookup.matches();
  const liveMatches = allMatches.filter((m) => m.status === "LIVE");
  const upcomingMatches = allMatches.filter((m) => m.status === "UPCOMING" || m.status === "READY");
  const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");

  return (
    <AppShell title="Scorer Dashboard" fullBleedTop={true}>
      {/* Full-Bleed Moving Cricket Hero Banner */}
      <MovingCricketHero liveCount={liveMatches.length} />

      {/* Main Scorer Sections Container */}
      <div className="mx-auto max-w-6xl px-4 pt-8 flex flex-col gap-8">

        {/* Live match — featured */}
        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                Live Now
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming / Ready */}
        {upcomingMatches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                Upcoming
              </h2>
              <Link
                to="/matches"
                className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingMatches.map((m) => {
                const teamA = lookup.team(m.teamAId);
                const teamB = lookup.team(m.teamBId);
                const time = new Date(m.scheduledAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                });
                const dateLabel = (() => {
                  const d = new Date(m.scheduledAt);
                  const today = new Date();
                  const diff = d.getDate() - today.getDate();
                  if (diff === 0) return "Today";
                  if (diff === 1) return "Tomorrow";
                  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                })();

                return (
                  <Link
                    key={m.id}
                    to="/match/$matchId"
                    params={{ matchId: m.id }}
                    className="tap card-surface flex items-center gap-4 px-4 py-4"
                  >
                    {/* Match number */}
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-xs font-extrabold text-muted-foreground">
                      #{m.matchNumber}
                    </div>

                    {/* Teams */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-foreground">
                        {teamA?.shortName} vs {teamB?.shortName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5 flex items-center gap-2">
                        <CalendarClock className="h-3 w-3" />
                        {dateLabel} · {time}
                      </p>
                    </div>

                    <StatusPill status={m.status} />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedMatches.length > 0 && (
          <section className="pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                Recent Results
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {completedMatches.map((m) => {
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
                    <p className="text-sm font-bold text-foreground">
                      {teamA?.name} vs {teamB?.name}
                    </p>
                    {m.resultText && (
                      <p className="text-xs font-bold text-primary mt-1">{m.resultText}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/scorecard/$matchId"
                        params={{ matchId: m.id }}
                        className="tap inline-flex h-8 items-center rounded-full bg-secondary px-3 text-[10px] font-extrabold uppercase tracking-widest text-foreground"
                      >
                        Scorecard
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
