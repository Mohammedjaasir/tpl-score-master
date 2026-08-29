import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
ragul
import { useState } from "react";
import {
  ArrowRight,
  Radio,
  ClipboardCheck,
  Trophy,
  Zap,
  BarChart2,
  Calendar,
  CalendarDays,
  UsersRound,
  Star,
  AlignJustify,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import SocialCards from "@/components/ui/card-fan-carousel";

import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { MovingCricketHero } from "@/components/home/MovingCricketHero";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { useMatches, useTeams, usePrefetchCricketData } from "@/hooks/useCricketData";
import { Radio, Calendar, ArrowRight, AlertCircle, RefreshCw, Trophy } from "lucide-react";
main

export const Route = createFileRoute("/")({
  component: PublicHome,
});

function PublicHome() {
  usePrefetchCricketData();
  const { data: allMatches = [], isLoading: queryLoading, isError: queryError, error, refetch } = useMatches();
  useTeams();

ragul
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-0.5 w-5 bg-[#D9A928]" />
      <p className="text-[10px] font-black tracking-[0.25em] text-[#D9A928] uppercase">
        {children}
      </p>
    </div>
  );
}

function LandingScreen() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "FIXTURES", href: "#fixtures" },
    { label: "STANDINGS", href: "#standings" },
    { label: "RESULTS", href: "#results" },
    { label: "TEAMS", href: "#teams" },
  ];
  return (
    <div className="min-h-screen w-full bg-white text-[#0A0A0A] font-sans selection:bg-[#D9A928] selection:text-black overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════════
          1. NAVIGATION
          ══════════════════════════════════════════════════════════════════════ */}
      <header className="absolute top-0 z-50 w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[68px] flex items-center justify-between">

          <div className="flex items-center gap-2.5 shrink-0">
            <Logo size="md" />
            <div className="hidden sm:block leading-none">
              <span className="block text-[11px] font-black tracking-[0.22em] text-[#D9A928] uppercase">TPL 2026</span>
              <span className="block text-[9px] text-white/40 tracking-wider font-semibold uppercase">Premier League</span>
            </div>
          </div>

        </div>

      </header>

      {/* ── Mobile full-screen nav overlay ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex"
          style={{ animation: "mobileNavFadeIn 0.2s ease" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel — slides in from left */}
          <div
            className="relative mr-auto h-full w-[min(85vw,320px)] bg-[#0A0A0A] flex flex-col shadow-2xl"
            style={{ animation: "mobileNavSlideIn 0.25s cubic-bezier(0.32,0.72,0,1)" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 h-[68px] border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <Logo size="md" />
                <div className="leading-none">
                  <span className="block text-[11px] font-black tracking-[0.22em] text-[#D9A928] uppercase">TPL 2026</span>
                  <span className="block text-[9px] text-white/30 tracking-wider font-semibold uppercase">Premier League</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/[0.08] transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            {/* Gold accent line */}
            <div className="h-[2px] w-10 mx-6 mt-8 mb-1 bg-[#D9A928] rounded-full" />

            {/* Nav links */}
            <nav className="flex flex-col px-4 mt-2">
              {navLinks.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-4 px-2 py-4 border-b border-white/[0.06] last:border-0"
                >
                  <span className="text-[10px] font-black text-[#D9A928]/50 tabular-nums w-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-black tracking-[0.2em] text-white/70 group-hover:text-white transition-colors uppercase">
                    {item.label}
                  </span>
                  <ArrowRight className="h-3 w-3 text-[#D9A928] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </nav>

            {/* Footer branding */}
            <div className="mt-auto px-6 py-6 border-t border-white/[0.06]">
              <p className="text-[9px] font-bold tracking-[0.25em] text-white/20 uppercase">TPL 2026 Season</p>
            </div>
          </div>

          <style>{`
            @keyframes mobileNavFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes mobileNavSlideIn {
              from { transform: translateX(-100%); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. HERO — full-screen video background
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex flex-col md:flex-row md:items-center w-full h-auto min-h-0 md:h-[100dvh] md:min-h-[600px]"
        style={{
          backgroundImage: "url('/hero-cricket-1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <video
          src="/hero-video.webm"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-cricket-1.jpg"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.35) 100%)" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 100%)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full pt-20 pb-16 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            {/* Season badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#D9A928]/40 bg-[#D9A928]/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] animate-pulse" />
              <span className="text-[10px] font-extrabold tracking-[0.28em] text-[#D9A928] uppercase">
                SEASON 2026 · CRICKET TOURNAMENT
              </span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] uppercase leading-[0.85] tracking-[-0.02em] text-white drop-shadow-2xl">
              THUNDUWA<br />
              <span style={{ background: "linear-gradient(135deg, #F4C542 0%, #D9A928 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                PREMIER
              </span>
              <br />LEAGUE
            </h1>

            <p className="mt-7 text-sm sm:text-base text-white/70 max-w-lg leading-relaxed">
              The official digital home of TPL 2026. Follow every match, every run,
              every wicket, and every moment of the tournament with live scores,
              ball-by-ball updates, fixtures, results, and tournament standings.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/home"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_32px_rgba(217,169,40,0.55)] active:scale-95"
              >
                <span>ENTER SCORER CONSOLE</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/live"
                className="inline-flex items-center gap-2.5 text-white/80 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-colors group"
              >
                <span className="h-10 w-10 rounded-full bg-white/10 group-hover:bg-white/20 grid place-items-center transition-all border border-white/20">
                  <Radio className="h-4 w-4" />
                </span>
                <span>VIEW LIVE SCORES</span>
              </Link>
            </div>
          </div>
        </div>

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
main

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
<<<<<<ragul
            <Link to="/scorecards" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#D9A928] hover:text-black transition-colors">
              VIEW ALL PLAYERS <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                rank: "01",
                category: "TOP RUN SCORER",
                stat: "286 Runs",
                icon: (
                  <>
                    <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: "absolute" }}>
                      <defs>
                        <filter id="erode-bat">
                          <feMorphology operator="erode" radius="0.08" in="SourceGraphic" />
                        </filter>
                      </defs>
                    </svg>
                    <img
                      src="/cricket-bat-icon.png"
                      alt="Bat Icon"
                      className="h-5 w-5 object-contain"
                      style={{
                        mixBlendMode: "multiply",
                        filter: "url(#erode-bat)"
                      }}
                    />
                  </>
                ),
                color: "#D9A928"
              },
              {
                rank: "02",
                category: "TOP WICKET TAKER",
                stat: "14 Wickets",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3c-2.5 4.5-2.5 13.5 0 18" strokeDasharray="2.5 2" />
                  </svg>
                ),
                color: "#D9A928"
              },
              { rank: "03", category: "PLAYER OF TOURNAMENT", stat: "Leading Performer", icon: <Star className="h-5 w-5" />, color: "#D9A928" },
            ].map((p) => (
              <div key={p.rank} className="relative overflow-hidden rounded-3xl border border-black/[0.08] bg-white p-6 hover:border-[#D9A928]/40 hover:-translate-y-1 transition-all">
                {p.rank === "01" && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none z-0"
                      style={{
                        backgroundImage: "url('/hero-batsman-top-scorer.png')",
                        backgroundSize: "contain",
                        backgroundPosition: "right bottom",
                        backgroundRepeat: "no-repeat",
                        opacity: 0.9,
                        mixBlendMode: "multiply",
                      }}
                    />
                    <div className="absolute inset-0 pointer-events-none z-0 bg-white/20" />
                  </>
                )}
                {p.rank === "02" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      backgroundImage: "url('/hero-bowler-top-wicket-clean.png')",
                      backgroundSize: "contain",
                      backgroundPosition: "right bottom",
                      backgroundRepeat: "no-repeat",
                      opacity: 1.0,
                    }}
                  />
                )}
                {p.rank === "03" && (
                  <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      backgroundImage: "url('/hero-helmet-player-of-tournament-clean.png')",
                      backgroundSize: "contain",
                      backgroundPosition: "right bottom",
                      backgroundRepeat: "no-repeat",
                      opacity: 1.0,
                    }}
                  />
                )}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="h-10 w-10 rounded-xl grid place-items-center text-black"
                      style={{ background: p.color === "#D9A928" ? "linear-gradient(135deg, #F4C542, #D9A928)" : "#0A0A0A" }}
                    >
                      <span style={{ color: p.color === "#D9A928" ? "#000" : "#D9A928" }}>{p.icon}</span>
                    </div>
                    <span className="text-2xl font-black text-black/10">{p.rank}</span>
                  </div>
                  <p className="text-[9px] font-black tracking-widest text-[#D9A928] uppercase mb-2">{p.category}</p>
                  <p className="font-display font-black text-2xl uppercase text-[#0A0A0A] leading-none">PLAYER NAME</p>
                  <p className="mt-2 text-base font-black text-[#0A0A0A]/60">{p.stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          10. MATCH CENTRE OVERVIEW
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="results"
        className="relative pt-2 pb-12 md:py-20 lg:py-28 overflow-hidden"
        style={{
          backgroundImage: "url('/match-centre-bg.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A0A0A]/85 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-8 md:mb-14">
            <SectionLabel>MATCH CENTRE</SectionLabel>
            <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.9] tracking-tight text-white">
              EVERYTHING<br />
              <span style={{ background: "linear-gradient(135deg, #F4C542 0%, #D9A928 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                IN ONE PLACE
              </span>
            </h2>
            <p className="mt-5 text-sm text-white/50 max-w-md mx-auto leading-relaxed">
              From the first ball to the final result.
            </p>
          </div>

          <div className="-mt-20 md:-mt-24 lg:-mt-28 mb-10 w-full flex justify-center">
            <SocialCards
              cards={[
                {
                  icon: (
                    <svg viewBox="0 0 58 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                      <rect width="58" height="22" rx="11" fill="currentColor" fillOpacity="0.18"/>
                      <circle cx="13" cy="11" r="7.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1"/>
                      <polygon points="10.5,7.5 18,11 10.5,14.5" fill="currentColor"/>
                      <text x="24" y="15" fontFamily="Arial, sans-serif" fontSize="8.5" fontWeight="900" fill="currentColor" letterSpacing="1.5">LIVE</text>
                    </svg>
                  ),
                  wideIcon: true,
                  spacer: true,
                  title: "LIVE MATCHES",
                  desc: "Real-time scorecards and match updates.",
                  link: "/live",
                  img: "/card-live.jpg",
                  bgSize: "cover",
                },
                {
                  icon: <ClipboardCheck className="h-5 w-5" />,
                  title: "RESULTS",
                  desc: "Review completed matches and final scores.",
                  link: "/scorecards",
                  img: "/card-results.jpg",
                  bgSize: "cover",
                },
                {
                  icon: <CalendarDays className="h-5 w-5" />,
                  title: "FIXTURES",
                  desc: "Explore upcoming games and tournament schedule.",
                  link: "/matches",
                  img: "/card-fixtures.jpg",
                  bgSize: "cover",
                },
                {
                  icon: <UsersRound className="h-5 w-5" />,
                  title: "TEAMS",
                  desc: "Meet the squads competing for the TPL 2026 title.",
                  link: "/matches",
                  img: "/card-teams.jpg",
                  bgSize: "cover",
                },
              ]}
            />
          </div>

          <div className="text-center">
            <Link
              to="/matches"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-widest transition-all shadow-[0_4px_32px_rgba(217,169,40,0.35)] active:scale-95"
            >
              ENTER MATCH CENTRE
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          12. FINAL CTA
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white border-t border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-8xl uppercase leading-[0.88] tracking-[-0.02em] text-[#0A0A0A]">
            READY FOR THE<br />NEXT BALL?
          </h2>
          <p className="mt-6 text-sm text-black/50 max-w-md mx-auto leading-relaxed">
            Follow TPL 2026 from the first delivery to the final celebration.
          </p>
          <p className="mt-4 text-[10px] font-black tracking-[0.28em] text-[#D9A928] uppercase">
            LIVE SCORES · FIXTURES · RESULTS · STANDINGS
          </p>
          <Link
            to="/live"
            className="mt-10 inline-flex items-center gap-2.5 px-9 py-5 rounded-full bg-[#0A0A0A] hover:bg-[#D9A928] text-white hover:text-black font-black text-sm uppercase tracking-widest transition-all duration-200 shadow-xl active:scale-95"
          >
            EXPLORE TPL 2026
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          13. FOOTER
          ══════════════════════════════════════════════════════════════════════ */}
      <footer className="py-12 bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <p className="font-extrabold text-sm uppercase tracking-wider text-white">THUNDUWA PREMIER LEAGUE · TPL 2026</p>
                <p className="text-[11px] text-white/35 uppercase">Official Tournament Platform</p>
              </div>
=======
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
>>>>>>main
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
