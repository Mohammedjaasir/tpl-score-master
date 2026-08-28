import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { Radio, Calendar, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: PublicHome,
});

function PublicHome() {
  usePrefetchCricketData();
  const { data: allMatches = [], isLoading: queryLoading, isError: queryError, error, refetch } = useMatches();
  useTeams();

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 5000); // 5 seconds hard cap
    return () => clearTimeout(timer);
  }, []);

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");
  const displayMatches = liveMatches.length > 0 ? liveMatches : allMatches.slice(0, 3);

  const isLoading = queryLoading && !timedOut;
  const isError = queryError || (timedOut && displayMatches.length === 0);

  const handleRetry = () => {
    setTimedOut(false);
    refetch();
  };

  return (
    <AppShell title="Dashboard" fullBleedTop={true}>
      {/* Full-Bleed Moving Cricket Hero Banner — Renders Immediately */}
      <MovingCricketHero liveCount={liveMatches.length} />

      {/* Main Public Sections Container */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 flex flex-col gap-6">

        {/* ── LIVE MATCHES SECTION ─────────────────────────────────── */}
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

          {/* If matches exist, show them immediately */}
          {displayMatches.length > 0 && (
            <div className="flex flex-col gap-4">
              {displayMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          )}

          {/* Loading Skeleton (Only shown for max 5 seconds if zero data exists) */}
          {isLoading && displayMatches.length === 0 && (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
              <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
              <p className="text-xs font-bold text-[#5F6368]">Loading live match fixtures...</p>
            </div>
          )}

          {/* Error / Timeout State with Retry */}
          {isError && displayMatches.length === 0 && (
            <div className="card-surface p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
              <AlertCircle className="h-8 w-8 text-[#D9A928]" />
              <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
                Unable to load live matches right now
              </p>
              <p className="text-xs text-[#5F6368] max-w-sm">
                {error instanceof Error ? error.message : "Network is slow or unreachable. Please tap retry."}
              </p>
              <button
                onClick={handleRetry}
                className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* No Matches Found */}
          {!isLoading && !isError && displayMatches.length === 0 && (
            <div className="card-surface p-8 text-center bg-white border border-[#E5E5E5] rounded-2xl">
              <p className="text-xs font-bold text-[#5F6368]">No live matches currently scheduled.</p>
            </div>
          )}

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
      </div>
    </AppShell>
  );
}
