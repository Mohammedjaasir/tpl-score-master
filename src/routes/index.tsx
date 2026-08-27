import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  component: LandingScreen,
});

function LandingScreen() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0c10] text-white flex flex-col justify-between selection:bg-[#D9A928] selection:text-[#111111]">
      
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
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.06] saturate-[1.05] select-none"
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
          LAYER 2: Cinematic Gradient Overlays (Professional Vignettes)
          ══════════════════════════════════════════════════════════════════════════════ */}
      {/* Top soft vignette for navigation clarity */}
      <div 
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Bottom high-contrast gradient strictly behind text & buttons */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 3: Top Navigation Header
          ══════════════════════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 px-6 pt-6 pb-2 flex items-center justify-between mx-auto max-w-lg w-full">
        <Logo size="lg" />
        
        <div className="flex items-center gap-2.5">
          {/* Official Tournament Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            TPL 2026
          </div>

          {/* Header Scorer App Link */}
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase transition-all group"
          >
            <span>SCORER APP</span>
            <ArrowUpRight className="h-3 w-3 text-[#D9A928] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </header>

      {/* Center Spacer */}
      <div className="flex-1 min-h-[120px] sm:min-h-[160px]" />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 4: Foreground Content & Subtle Bent Rectangle Action Button
          ══════════════════════════════════════════════════════════════════════════════ */}
      <main className="relative z-30 px-6 pb-6 pt-2 mx-auto max-w-lg w-full flex flex-col gap-4">
        
        {/* Season Tag & Main Typography */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#D9A928] uppercase mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            <span>SEASON 2026 · CRICKET TOURNAMENT</span>
          </p>
          
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl uppercase tracking-[-0.02em] leading-[0.90] drop-shadow-md">
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
          
          <p className="mt-3 text-xs sm:text-sm font-normal text-white/80 leading-relaxed">
            The official live match center and scoring system for TPL 2026. Follow every ball, boundary, wicket, and real-time scorecard directly from the tournament grounds.
          </p>
        </div>

        {/* ── Translucent Dark Rectangle with Slightly Bent (Subtly Curved) Corners ─ */}
        <div className="pt-2">
          <Link
            to="/home"
            className="tap group w-full h-14 rounded-xl bg-black/50 hover:bg-black/75 active:bg-black/90 border border-white/20 hover:border-[#D9A928]/70 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 px-6 shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-150 active:scale-[0.99]"
          >
            <Trophy className="h-4 w-4 text-[#D9A928] stroke-[2.5]" />
            <span className="text-white font-extrabold tracking-wide">
              ENTER SCORER CONSOLE
            </span>
            <ArrowRight className="h-4 w-4 text-[#D9A928] stroke-[2.5] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Feature Metadata Highlights */}
        <div className="flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-widest pt-2 px-1 border-t border-white/10">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            VERIFIED SCORES
          </span>
          <span className="text-white/30">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            BALL BY BALL
          </span>
          <span className="text-white/30">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
            FULL FIXTURES
          </span>
        </div>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 px-6 py-3 border-t border-white/10 bg-black/40 backdrop-blur-sm text-center text-[10px] font-normal text-white/50">
        <p>© 2026 Thunduwa Premier League. Powered by Valgrow Labs.</p>
      </footer>

      {/* Subtle Bottom TPL Gold Accent Line */}
      <div className="relative z-30 h-1 w-full bg-[#D9A928]" />

    </div>
  );
}
