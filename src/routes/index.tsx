import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  component: LandingScreen,
});

function LandingScreen() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white flex flex-col justify-between selection:bg-[#D9A928] selection:text-[#111111]">
      
      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 1: 100% Full-Bleed Vivid Live Cricket Video Background
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-cricket-1.jpg"
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.06] saturate-[1.05] select-none scale-[1.01]"
        >
          <source src="/hero-video.webm" type="video/webm" />
          <source src="/hero-video.mp4" type="video/mp4" />
          <img
            src="/hero-cricket-1.jpg"
            alt="TPL Cricket action"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 2: Cinematic Gradient Overlays (Clear Video Center, Contrast at Top/Bottom)
          ══════════════════════════════════════════════════════════════════════════════ */}
      {/* Top soft vignette for navigation clarity */}
      <div 
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 via-black/30 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Bottom high-contrast gradient strictly behind text & buttons */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Subtle Championship Gold Ambient Glow */}
      <div 
        className="absolute -left-20 bottom-16 w-96 h-96 rounded-full bg-[#D9A928]/15 blur-[120px] z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 3: Top Navigation Header
          ══════════════════════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 px-6 pt-6 pb-2 flex items-center justify-between mx-auto max-w-lg w-full">
        <Logo size="lg" />
        
        <div className="flex items-center gap-2.5">
          {/* Official Tournament Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold tracking-widest text-white uppercase shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] animate-pulse" />
            TPL 2026
          </div>

          {/* Header Scorer App Link */}
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-white uppercase transition-all shadow-md group"
          >
            <span>SCORER APP</span>
            <ArrowUpRight className="h-3 w-3 text-[#D9A928] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </header>

      {/* Center Spacer to showcase full bright cricket stadium video */}
      <div className="flex-1 min-h-[120px] sm:min-h-[160px]" />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 4: Foreground Content & Sleek Dark Action Button
          ══════════════════════════════════════════════════════════════════════════════ */}
      <main className="relative z-30 px-6 pb-6 pt-2 mx-auto max-w-lg w-full flex flex-col gap-4">
        
        {/* Season Tag & Main Typography */}
        <div>
          <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-[#D9A928] uppercase mb-1.5 flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            <span>SEASON 2026 · CRICKET TOURNAMENT</span>
          </p>
          
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl uppercase tracking-[-0.03em] leading-[0.88] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            <span className="text-white block">THUNDUWA</span>
            <span 
              className="block mt-1"
              style={{
                background: "linear-gradient(180deg, #F4C542 0%, #D9A928 50%, #9A6A05 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PREMIER LEAGUE
            </span>
          </h1>
          
          <p className="mt-3 text-xs sm:text-sm font-medium text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            The official live match center and scoring system for TPL 2026. Follow every ball, boundary, wicket, and real-time scorecard directly from the tournament grounds.
          </p>
        </div>

        {/* ── Sleek Dark Action Button matching the sample ────────────────────────── */}
        <div className="pt-1">
          <Link
            to="/home"
            className="w-full min-h-14 bg-[#0c0e18] hover:bg-[#151928] active:bg-[#07080f] text-white font-bold text-base rounded-[1.25rem] flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.9)] hover:scale-[1.01] active:scale-[0.98] border border-white/[0.12] hover:border-[#D9A928]/40 group"
          >
            <Trophy className="h-5 w-5 text-[#D9A928] transition-transform group-hover:scale-110" />
            <span className="tracking-wide">Enter Scorer Console</span>
            <ArrowRight className="h-4 w-4 text-[#D9A928] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Feature Metadata Highlights */}
        <div className="flex items-center justify-between text-[10px] font-bold text-white/80 uppercase tracking-widest pt-2 px-1 border-t border-white/15 drop-shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            VERIFIED SCORES
          </span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            BALL BY BALL
          </span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            FULL FIXTURES
          </span>
        </div>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 px-6 py-3 border-t border-white/10 bg-black/40 backdrop-blur-sm text-center text-[10px] font-medium text-white/60">
        <p>© 2026 Thunduwa Premier League. Powered by Valgrow Labs.</p>
      </footer>

      {/* Subtle Bottom TPL Gold Accent Line */}
      <div className="relative z-30 h-1 w-full bg-gradient-to-r from-transparent via-[#D9A928] to-transparent" />

    </div>
  );
}
