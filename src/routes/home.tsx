import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { Radio, Calendar, ArrowRight, AlertCircle, RefreshCw, Trophy } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: PublicHome,
});

function PublicHome() {
  usePrefetchCricketData();
  const { data: allMatches = [], isLoading: queryLoading, isError: queryError, error, refetch } = useMatches();
  useTeams();

  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    // Independent component-level timeout enforcing a strict 5s maximum on initial loading state
    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Filter real matches purely by their actual database status
  const liveMatches = allMatches.filter((m) => m.status === "LIVE");
  const upcomingMatches = allMatches.filter((m) => m.status === "UPCOMING" || m.status === "READY");
  const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");

  // Loading state strictly terminates if query finishes OR 5s timer expires OR data is present
  const isLoading = queryLoading && !loadingTimedOut && allMatches.length === 0;
  const isError = (queryError || (loadingTimedOut && allMatches.length === 0)) && allMatches.length === 0;

  const handleRetry = () => {
    setLoadingTimedOut(false);
    refetch();
  };

  return (
    <AppShell title="Dashboard" fullBleedTop={true}>
      {/* Full-Bleed Moving Cricket Hero Banner with Dynamic Live Count */}
      <MovingCricketHero liveCount={liveMatches.length} />

      {/* Main Public Sections Container */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 flex flex-col gap-8">

        {/* ── SECTION 1: LIVE MATCHES (REAL MATCHES ONLY) ───────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Radio className={`h-4 w-4 ${liveMatches.length > 0 ? "text-red-500 animate-pulse" : "text-[#5F6368]"}`} />
              <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#111111]">
                LIVE MATCHES
              </h2>
            </div>
            {liveMatches.length > 0 && (
              <Link
                to="/scorecards"
                className="flex items-center gap-1.5 text-xs font-black text-[#D9A928] hover:underline uppercase tracking-wider"
              >
                Scorecard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
              <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
              <p className="text-xs font-bold text-[#5F6368]">Loading tournament matches from Supabase...</p>
            </div>
          )}

          {/* Error / Timeout State with Retry */}
          {isError && !isLoading && (
            <div className="card-surface p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
              <AlertCircle className="h-8 w-8 text-[#D9A928]" />
              <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
                Unable to load live matches right now
              </p>
              <p className="text-xs text-[#5F6368] max-w-sm">
                {error instanceof Error ? error.message : "Please check your network connection and try again."}
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

          {/* Real Live Match Cards */}
          {!isLoading && !isError && liveMatches.length > 0 && (
            <div className="flex flex-col gap-4">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          )}

          {/* Clean Professional Empty State when 0 matches are live */}
          {!isLoading && !isError && liveMatches.length === 0 && (
            <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E5E5E5] text-center flex flex-col items-center justify-center gap-3 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-[#D9A928]/10 flex items-center justify-center text-[#9A6A05]">
                <Radio className="h-6 w-6 text-[#D9A928]" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                NO LIVE MATCHES RIGHT NOW
              </h3>
              <p className="text-xs text-[#5F6368] max-w-md font-medium">
                Next scheduled matches are available in Fixtures. Stay tuned for live ball-by-ball scoring when matches begin.
              </p>
              <Link
                to="/matches"
                className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#111111] shadow-sm transition-all"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>View Fixtures</span>
              </Link>
            </div>
          )}
        </section>

        {/* ── SECTION 2: UPCOMING FIXTURES (REAL DATA ONLY) ─────────── */}
        {!isLoading && !isError && upcomingMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#D9A928]" />
                <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#111111]">
                  UPCOMING FIXTURES
                </h2>
              </div>
              <Link
                to="/matches"
                className="flex items-center gap-1.5 text-xs font-black text-[#D9A928] hover:underline uppercase tracking-wider"
              >
                Full Schedule <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {upcomingMatches.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 3: RECENT RESULTS (REAL DATA ONLY) ────────────── */}
        {!isLoading && !isError && completedMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#D9A928]" />
                <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#111111]">
                  RECENT RESULTS
                </h2>
              </div>
              <Link
                to="/scorecards"
                className="flex items-center gap-1.5 text-xs font-black text-[#D9A928] hover:underline uppercase tracking-wider"
              >
                All Results <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {completedMatches.slice(0, 2).map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 4: SPONSORS & OFFICIAL TOURNAMENT PARTNERS ───────── */}
        <SponsorsSection />

        {/* Full Fixtures CTA Banner */}
        <Link
          to="/matches"
          className="tap flex items-center justify-between px-6 py-4 rounded-2xl bg-white border border-[#E5E5E5] text-xs font-black uppercase tracking-widest text-[#111111] hover:bg-[#F7F7F5] shadow-sm transition-all group"
        >
          <span className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-[#D9A928]" />
            VIEW ALL FIXTURES & RESULTS
          </span>
          <ArrowRight className="h-4 w-4 text-[#111111] transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </AppShell>
  );
}
