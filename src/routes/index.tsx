import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { Radio, Calendar, ArrowRight, AlertCircle, RefreshCw, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
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
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {liveMatches.length} Live
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="card-surface p-10 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
              <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
              <p className="text-xs font-bold text-[#5F6368]">Loading live tournament matches...</p>
            </div>
          ) : isError ? (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
              <AlertCircle className="h-8 w-8 text-[#D9A928]" />
              <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
                Unable to load match data
              </p>
              <p className="text-xs text-[#5F6368] max-w-sm">
                Check your network connection or verify tournament broadcast settings.
              </p>
              <button
                onClick={handleRetry}
                className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : liveMatches.length > 0 ? (
            <div className="flex flex-col gap-4">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          ) : (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-2 border border-[#E5E5E5] bg-white rounded-3xl">
              <Radio className="h-6 w-6 text-[#5F6368]/40 mb-1" />
              <p className="text-xs font-black text-[#5F6368] uppercase tracking-wider">
                NO LIVE MATCHES RIGHT NOW
              </p>
              <p className="text-[11px] text-[#5F6368]/70">
                Check the schedule below or view upcoming match scorecards.
              </p>
            </div>
          )}
        </section>

        {/* ── SECTION 2: UPCOMING MATCHES ───────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D9A928]" />
              <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#111111]">
                UPCOMING FIXTURES
              </h2>
            </div>
            <Link
              to="/scorecards"
              className="flex items-center gap-1.5 text-xs font-black text-[#D9A928] hover:underline uppercase tracking-wider"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!isLoading && !isError && upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.slice(0, 4).map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          ) : !isLoading && !isError ? (
            <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-2 border border-[#E5E5E5] bg-white rounded-3xl">
              <Calendar className="h-6 w-6 text-[#5F6368]/40 mb-1" />
              <p className="text-xs font-black text-[#5F6368] uppercase tracking-wider">
                NO UPCOMING MATCHES SCHEDULED
              </p>
              <p className="text-[11px] text-[#5F6368]/70">
                All tournament group matches have concluded or are being scheduled.
              </p>
            </div>
          ) : null}
        </section>

        {/* ── SECTION 3: RECENT COMPLETED RESULTS ───────────────────── */}
        {completedMatches.length > 0 && (
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
