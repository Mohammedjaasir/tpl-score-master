import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Radio,
  Trophy,
  Zap,
  BarChart2,
  Calendar,
  Users,
  Star,
  AlignJustify,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  component: LandingScreen,
});

// ── Palette ──────────────────────────────────────────────────────────────────
// Gold:    #D9A928 / #F4C542
// Dark:    #0A0A0A / #111
// Light:   #F7F7F5 / #FFFFFF
// ─────────────────────────────────────────────────────────────────────────────

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
        className="relative overflow-hidden flex items-center w-full"
        style={{
          height: "100dvh",
          minHeight: "600px",
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

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full py-24 sm:py-28 lg:py-36">
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

        {/* Marquee ticker pinned to bottom */}
        <div className="absolute bottom-0 inset-x-0 z-20 py-2.5 overflow-hidden bg-[#D9A928]/10 backdrop-blur-sm border-t border-[#D9A928]/20">
          <div className="flex whitespace-nowrap gap-12 animate-marquee-ltr text-[10px] font-black uppercase tracking-[0.22em] text-[#D9A928]">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10 shrink-0">
                <span>● LIVE MATCHES</span>
                <span>·</span>
                <span>BALL BY BALL</span>
                <span>·</span>
                <span>OFFICIAL SCORES</span>
                <span>·</span>
                <span>TPL 2026</span>
                <span>·</span>
                <span>THUNDUWA PREMIER LEAGUE</span>
                <span>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. LIVE MATCH
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black tracking-[0.28em] text-rose-400 uppercase">LIVE NOW</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display font-black text-4xl sm:text-5xl uppercase leading-[0.9] tracking-tight text-white">
                FOLLOW THE ACTION
              </h2>
              <p className="mt-4 text-sm text-white/50 max-w-sm leading-relaxed">
                Stay connected to every match as it happens.
              </p>
            </div>

            {/* Live scorecard */}
            <div className="rounded-3xl border border-[#D9A928]/30 bg-[#111] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  LIVE
                </span>
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">TPL 2026</span>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] mb-1">BATTING</p>
                  <p className="text-xl sm:text-2xl font-black text-white uppercase leading-tight">THUNDER XI</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mt-2">142<span className="text-white/40 text-xl">/4</span></p>
                  <p className="text-[11px] text-white/40 mt-1">17.2 Overs</p>
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-2 rounded-xl bg-white/10 text-white text-sm font-black">VS</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">YET TO BAT</p>
                  <p className="text-xl sm:text-2xl font-black text-white uppercase leading-tight">TPL WARRIORS</p>
                  <p className="text-xl font-black text-white/40 mt-2">— —</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                <span>CRR 8.19</span>
                <span className="text-[#D9A928] font-bold">Partnership 48 (32)</span>
              </div>

              <Link
                to="/live"
                className="mt-5 w-full py-3 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-[11px] uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all"
              >
                VIEW LIVE SCORECARD
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. NEXT MATCH
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-[#D9A928]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black tracking-[0.28em] text-black/60 uppercase mb-2">NEXT MATCH</p>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase leading-tight text-black">
                THE NEXT BATTLE STARTS SOON
              </h2>
            </div>
            <div className="flex items-center gap-6 sm:gap-10">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-black uppercase">Thunder XI</p>
                <p className="text-[10px] text-black/50 font-bold mt-1">HOME</p>
              </div>
              <div className="text-center">
                <span className="inline-block px-4 py-2 rounded-xl bg-black/15 text-black text-base font-black">VS</span>
                <p className="text-[9px] text-black/50 font-black mt-2 uppercase tracking-wider">Today · 7:30 PM</p>
                <p className="text-[9px] text-black/40 font-bold uppercase">TPL 2026 · Match 12</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-black uppercase">Kings XI</p>
                <p className="text-[10px] text-black/50 font-bold mt-1">AWAY</p>
              </div>
            </div>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-wider transition-all shrink-0"
            >
              VIEW MATCH CENTRE
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. TOURNAMENT OVERVIEW
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <SectionLabel>TPL 2026</SectionLabel>
              <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.9] tracking-tight text-[#0A0A0A]">
                ONE TOURNAMENT.<br />
                <span style={{ background: "linear-gradient(135deg, #F4C542 0%, #D9A928 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  EVERY MOMENT.
                </span>
              </h2>
              <p className="mt-6 text-sm text-black/55 max-w-sm leading-relaxed">
                TPL 2026 brings competitive cricket, passionate teams, and unforgettable
                moments together on one official platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <Radio className="h-5 w-5" />, title: "LIVE SCORES", desc: "Real-time match updates from the ground." },
                { icon: <Zap className="h-5 w-5" />, title: "BALL BY BALL", desc: "Follow every delivery, boundary, wicket, and milestone." },
                { icon: <Calendar className="h-5 w-5" />, title: "OFFICIAL FIXTURES", desc: "Never miss a match with the complete tournament schedule." },
                { icon: <BarChart2 className="h-5 w-5" />, title: "POINTS TABLE", desc: "Track every team's journey to the top." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/[0.08] bg-[#F7F7F5] p-5 hover:border-[#D9A928]/50 hover:-translate-y-0.5 transition-all">
                  <div className="h-9 w-9 rounded-xl bg-[#D9A928]/10 grid place-items-center text-[#D9A928] mb-3">
                    {item.icon}
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#0A0A0A] mb-1">{item.title}</p>
                  <p className="text-[12px] text-black/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. STATS BANNER
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <p className="text-center text-[10px] font-black tracking-[0.3em] text-[#D9A928] uppercase mb-12">TPL 2026 BY THE NUMBERS</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { val: "24", label: "Matches" },
              { val: "12", label: "Teams" },
              { val: "1,200+", label: "Runs Scored" },
              { val: "80+", label: "Wickets" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-black text-5xl sm:text-6xl text-white leading-none">{s.val}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-white/35">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7. FIXTURES
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="fixtures" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <SectionLabel>UPCOMING FIXTURES</SectionLabel>
              <h2 className="font-display font-black text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tight text-[#0A0A0A]">
                DON'T MISS THE<br />NEXT SHOWDOWN.
              </h2>
            </div>
            <Link to="/matches" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#D9A928] hover:text-black transition-colors">
              VIEW ALL FIXTURES <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { match: "MATCH 13", teams: "Thunder XI vs Kings XI", time: "Tomorrow · 3:30 PM" },
              { match: "MATCH 14", teams: "Warriors CC vs Super Strikers", time: "Tomorrow · 7:30 PM" },
              { match: "MATCH 15", teams: "Royal Challengers vs Thunder XI", time: "28 AUG · 3:30 PM" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-black/[0.07] bg-white px-6 py-5 hover:border-[#D9A928]/40 hover:shadow-sm transition-all">
                <div className="flex items-center gap-5">
                  <span className="text-[10px] font-black tracking-widest text-[#D9A928] uppercase shrink-0">{f.match}</span>
                  <span className="h-4 w-px bg-black/10 hidden sm:block" />
                  <p className="font-black text-base uppercase text-[#0A0A0A]">{f.teams}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">{f.time}</span>
                  <Link to="/matches" className="shrink-0 px-4 py-2 rounded-full bg-[#0A0A0A] hover:bg-[#D9A928] text-white hover:text-black font-black text-[10px] uppercase tracking-wider transition-all">
                    DETAILS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          8. POINTS TABLE
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="standings" className="py-20 lg:py-28 bg-white border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <SectionLabel>POINTS TABLE</SectionLabel>
              <h2 className="font-display font-black text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tight text-[#0A0A0A]">
                THE ROAD<br />TO THE TOP
              </h2>
              <p className="mt-4 text-sm text-black/50 max-w-xs">Follow the race for the championship.</p>
            </div>
            <Link to="/scorecards" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#D9A928] hover:text-black transition-colors">
              VIEW FULL POINTS TABLE <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-black/[0.08] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[3rem_1fr_2.5rem_2.5rem_2.5rem_3rem] gap-2 px-5 py-3 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-wider text-white/50">
              <span>POS</span>
              <span>TEAM</span>
              <span className="text-center">P</span>
              <span className="text-center">W</span>
              <span className="text-center">L</span>
              <span className="text-right">PTS</span>
            </div>
            {[
              { pos: "01", team: "Thunder XI", p: 5, w: 4, l: 1, pts: 8, top: true },
              { pos: "02", team: "Warriors CC", p: 5, w: 4, l: 1, pts: 8, top: false },
              { pos: "03", team: "Kings XI", p: 5, w: 3, l: 2, pts: 6, top: false },
              { pos: "04", team: "Super Strikers", p: 5, w: 3, l: 2, pts: 6, top: false },
            ].map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[3rem_1fr_2.5rem_2.5rem_2.5rem_3rem] gap-2 px-5 py-4 items-center border-b border-black/[0.06] last:border-0 ${row.top ? "bg-[#D9A928]/5" : "bg-white"}`}
              >
                <span className={`text-[11px] font-black ${row.top ? "text-[#D9A928]" : "text-black/30"}`}>{row.pos}</span>
                <span className={`font-black text-sm uppercase ${row.top ? "text-[#0A0A0A]" : "text-[#0A0A0A]"}`}>{row.team}</span>
                <span className="text-center text-sm text-black/50">{row.p}</span>
                <span className="text-center text-sm font-bold text-black">{row.w}</span>
                <span className="text-center text-sm text-black/40">{row.l}</span>
                <span className={`text-right text-sm font-black ${row.top ? "text-[#D9A928]" : "text-[#0A0A0A]"}`}>{row.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9. TOP PERFORMERS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <SectionLabel>TOP PERFORMERS</SectionLabel>
              <h2 className="font-display font-black text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tight text-[#0A0A0A]">
                PLAYERS TO WATCH
              </h2>
              <p className="mt-4 text-sm text-black/50">The performances defining TPL 2026.</p>
            </div>
            <Link to="/scorecards" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#D9A928] hover:text-black transition-colors">
              VIEW ALL PLAYERS <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { rank: "01", category: "TOP RUN SCORER", stat: "286 Runs", icon: <Trophy className="h-5 w-5" />, color: "#D9A928" },
              { rank: "02", category: "TOP WICKET TAKER", stat: "14 Wickets", icon: <Zap className="h-5 w-5" />, color: "#0A0A0A" },
              { rank: "03", category: "PLAYER OF TOURNAMENT", stat: "Leading Performer", icon: <Star className="h-5 w-5" />, color: "#D9A928" },
            ].map((p) => (
              <div key={p.rank} className="rounded-3xl border border-black/[0.08] bg-white p-6 hover:border-[#D9A928]/40 hover:-translate-y-1 transition-all">
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
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          10. MATCH CENTRE OVERVIEW
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="results"
        className="relative py-20 lg:py-28 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/match-centre-bg.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A0A0A]/85 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                icon: <Radio className="h-5 w-5" />,
                title: "LIVE MATCHES",
                desc: "Real-time scorecards and match updates.",
                link: "/live",
                img: "/card-live.jpg",
              },
              {
                icon: <Trophy className="h-5 w-5" />,
                title: "RESULTS",
                desc: "Review completed matches and final scores.",
                link: "/scorecards",
                img: "/card-results.jpg",
              },
              {
                icon: <Calendar className="h-5 w-5" />,
                title: "FIXTURES",
                desc: "Explore upcoming games and tournament schedule.",
                link: "/matches",
                img: "/card-fixtures.jpg",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "TEAMS",
                desc: "Meet the squads competing for the TPL 2026 title.",
                link: "/matches",
                img: "/card-teams.jpg",
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] hover:border-[#D9A928]/40 transition-all"
                style={{ minHeight: "220px" }}
              >
                {/* Photo background */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${item.img}')` }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[#0A0A0A]/75 group-hover:bg-[#0A0A0A]/65 transition-colors" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-5">
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-lg bg-[#D9A928]/15 border border-[#D9A928]/25 grid place-items-center text-[#D9A928]">
                    {item.icon}
                  </div>

                  {/* Text + arrow */}
                  <div className="mt-12">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-1.5">{item.title}</p>
                    <p className="text-[12px] text-white/50 leading-relaxed">{item.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-[#D9A928] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase tracking-wider">View</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-white/40">
              <Link to="/live" className="hover:text-[#D9A928] transition-colors">Live Scores</Link>
              <Link to="/matches" className="hover:text-[#D9A928] transition-colors">Fixtures</Link>
              <Link to="/scorecards" className="hover:text-[#D9A928] transition-colors">Results</Link>
              <Link to="/matches" className="hover:text-[#D9A928] transition-colors">Teams</Link>
              <Link to="/scorecards" className="hover:text-[#D9A928] transition-colors">Points Table</Link>
              <Link to="/home" className="text-[#D9A928] hover:text-[#F4C542] transition-colors">Scorer Console</Link>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/30">
            <p>© 2026 Thunduwa Premier League. Powered by Valgrow Labs.</p>
          </div>
        </div>
      </footer>

      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent, #D9A928, #F4C542, #D9A928, transparent)" }} />
    </div>
  );
}
