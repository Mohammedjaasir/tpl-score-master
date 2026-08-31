import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { Radio, Calendar, ArrowRight, AlertCircle, RefreshCw, Trophy, Zap, Shield } from "lucide-react";

import { NoLiveMatchesCard } from "@/components/home/NoLiveMatchesCard";

export const Route = createFileRoute("/home")({
  component: PublicHome,
});

function PublicHome() {
  usePrefetchCricketData();
  const { data: allMatches = [], isLoading: queryLoading, isError: queryError, error, refetch } = useMatches();
  useTeams();

  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    // Strict 5s maximum on initial loading state to avoid indefinite spinners
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

      {/* Main Public Sections Container (Max 1280px-1400px centered with responsive padding) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16 flex flex-col gap-10">

        {/* ── SECTION 1: LIVE MATCHES (HERO PROMINENCE) ────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1 border-b border-[#E5E5E5] pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-red-500/10 text-red-600">
                <Radio className={`h-4 w-4 ${liveMatches.length > 0 ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-[#111111]">
                  LIVE MATCH ACTION
                </h2>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Real-time ball-by-ball tournament scores
                </p>
              </div>
            </div>

            <Link
              to="/scorecards"
              className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F4F6] text-xs font-black text-[#111111] hover:text-[#9A6A05] border border-[#E5E5E5] uppercase tracking-wider shadow-2xs transition-colors"
            >
              <span>Scorecards</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="card-surface p-10 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl shadow-xs">
              <RefreshCw className="h-7 w-7 text-[#D9A928] animate-spin" />
              <p className="text-xs font-bold text-[#5F6368]">Loading live tournament matches from database...</p>
            </div>
          )}

          {/* Error / Timeout State with Retry */}
          {isError && !isLoading && (
            <div className="card-surface p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl shadow-xs">
              <AlertCircle className="h-9 w-9 text-[#D9A928]" />
              <p className="text-sm sm:text-base font-black text-[#111111] uppercase tracking-wide">
                Unable to load live matches right now
              </p>
              <p className="text-xs text-[#5F6368] max-w-sm">
                {error instanceof Error ? error.message : "Please check your network connection and try again."}
              </p>
              <button
                onClick={handleRetry}
                className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Real Live Match Cards (1 or 2 col depending on count) */}
          {!isLoading && !isError && liveMatches.length > 0 && (
            <div className={liveMatches.length === 1 ? "w-full" : "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"}>
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          )}

          {/* Exact Reference Empty State when 0 matches are live */}
          {!isLoading && !isError && liveMatches.length === 0 && (
            <NoLiveMatchesCard />
          )}
        </section>

        {/* ── SECTION 2: UPCOMING FIXTURES (2-COLUMN DESKTOP GRID) ─────── */}
        {!isLoading && !isError && upcomingMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1 border-b border-[#E5E5E5] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-[#D9A928]/15 text-[#9A6A05]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-[#111111]">
                    UPCOMING FIXTURES
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    {upcomingMatches.length} scheduled matches in pipeline
                  </p>
                </div>
              </div>

              <Link
                to="/matches"
                className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F4F6] text-xs font-black text-[#111111] hover:text-[#9A6A05] border border-[#E5E5E5] uppercase tracking-wider shadow-2xs transition-colors"
              >
                <span>All Fixtures ({allMatches.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 2-Column Responsive Grid on Laptop/Desktop, 1-col on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {upcomingMatches.slice(0, 4).map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 3: RECENT RESULTS (2-COLUMN DESKTOP GRID) ────────── */}
        {!isLoading && !isError && completedMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1 border-b border-[#E5E5E5] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-[#9A6A05]">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-[#111111]">
                    RECENT MATCH RESULTS
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Official scorecards & concluded fixtures
                  </p>
                </div>
              </div>

              <Link
                to="/scorecards"
                className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F4F6] text-xs font-black text-[#111111] hover:text-[#9A6A05] border border-[#E5E5E5] uppercase tracking-wider shadow-2xs transition-colors"
              >
                <span>All Results</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 2-Column Responsive Grid on Laptop/Desktop, 1-col on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {completedMatches.slice(0, 4).map((m) => (
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
          className="tap flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E5E5] text-xs sm:text-sm font-black uppercase tracking-widest text-[#111111] hover:bg-[#F7F7F5] shadow-sm transition-all group"
        >
          <span className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#D9A928]" />
            <span>VIEW COMPLETE TOURNAMENT SCHEDULE & RESULTS</span>
          </span>
          <ArrowRight className="h-5 w-5 text-[#111111] transition-transform group-hover:translate-x-1.5" />
        </Link>
      </div>
    </AppShell>
  );
}

