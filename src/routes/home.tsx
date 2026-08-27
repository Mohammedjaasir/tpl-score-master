import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { Radio, Calendar, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: ScorerHome,
});

function ScorerHome() {
  usePrefetchCricketData();
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  // Ensure teams are cached
  useTeams();

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");
  const otherMatches = allMatches.filter((m) => m.status !== "LIVE");
  // If there are live matches show them, otherwise show the top matches
  const displayMatches = liveMatches.length > 0 ? liveMatches : allMatches.slice(0, 3);

  return (
    <AppShell title="Scorer Dashboard" fullBleedTop={true}>
      {/* Full-Bleed Moving Cricket Hero Banner */}
      <MovingCricketHero liveCount={liveMatches.length} />

      {/* Main Scorer Sections Container */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 flex flex-col gap-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground">Loading TPL 2026 matches from Supabase...</p>
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
            <p className="text-sm font-bold text-muted-foreground">No matches found in database.</p>
          </div>
        )}

        {/* ── LIVE MATCHES SECTION ────────────────────────────────────────── */}
        {!isLoading && displayMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#D9A928] animate-pulse" />
                <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#111111]">
                  LIVE MATCHES
                </h2>
              </div>
              <Link
                to="/matches"
                className="flex items-center gap-1.5 text-xs font-black text-[#D9A928] hover:underline uppercase tracking-wider"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Match Cards List */}
            <div className="flex flex-col gap-4">
              {displayMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>

            {/* Bottom Full Fixtures Button */}
            <Link
              to="/matches"
              className="tap flex items-center justify-between px-6 py-4 rounded-2xl bg-white border border-[#E5E5E5] text-xs font-black uppercase tracking-widest text-[#111111] hover:bg-[#F7F7F5] shadow-sm transition-all mt-2 group"
            >
              <span className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#D9A928]" />
                VIEW FULL FIXTURES
              </span>
              <ArrowRight className="h-4 w-4 text-[#111111] transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}
