import { Link } from "@tanstack/react-router";
import { Radio, ChevronRight, Trophy, ArrowRight } from "lucide-react";
import { CinematicHeroRotator } from "@/components/brand/CinematicHeroRotator";

interface MovingCricketHeroProps {
  liveCount: number;
}

export function MovingCricketHero({ liveCount }: MovingCricketHeroProps) {
  return (
    <div className="w-full relative overflow-hidden bg-[#0a0c10] min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex items-center shadow-lg border-b border-black/20">
      
      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 1: Cinematic Static Image Rotator (Static + Smooth Crossfade)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0" 
        aria-hidden="true"
      >
        <CinematicHeroRotator />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 2: Directional Dark Gradient Overlay
          ══════════════════════════════════════════════════════════════════════════════ */}
      {/* Directional Horizontal Gradient */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(10, 12, 16, 0.92) 0%, rgba(10, 12, 16, 0.75) 30%, rgba(10, 12, 16, 0.35) 55%, rgba(10, 12, 16, 0.15) 75%, rgba(10, 12, 16, 0.25) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Subtle Vertical Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/40 via-transparent to-[#0a0c10]/70 z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 3: Hero Content (Clean Sports Tournament Header)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 mx-auto max-w-6xl w-full px-6 sm:px-8 py-12 sm:py-16 flex flex-col justify-center">
        
        {/* Season Tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-[#D9A928]" />
          <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#D9A928] uppercase">
            SEASON 2026
          </p>
        </div>

        {/* Main TPL CRICKET Headline */}
        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.88] tracking-tight text-white drop-shadow-md">
          TPL<br />
          <span 
            style={{
              background: "linear-gradient(180deg, #F4C542 0%, #D9A928 50%, #9A6A05 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CRICKET
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-base sm:text-lg font-medium text-white/80 tracking-wide flex items-center gap-2.5">
          <span>Live Scoring</span>
          <span className="text-white/40">•</span>
          <span>Ball by Ball</span>
        </p>

        {/* ── Clean Professional Action Buttons Bar ──────────────────────────── */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {liveCount > 0 ? (
            <Link
              to="/live"
              className="tap group inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#D9A928] hover:bg-[#E5B537] active:bg-[#C2941E] text-[#111111] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(217,169,40,0.3)] active:scale-[0.99]"
            >
              {/* Red Live Dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>

              <span>{liveCount} {liveCount === 1 ? "Match" : "Matches"} Live Now</span>

              <ArrowRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              to="/matches"
              className="tap group inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#D9A928] hover:bg-[#E5B537] active:bg-[#C2941E] text-[#111111] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.99]"
            >
              <Trophy className="h-4 w-4 stroke-[2.5]" />
              <span>View Fixtures</span>
              <ChevronRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <Link
            to="/matches"
            className="tap group inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-3.5 text-xs font-semibold text-white uppercase tracking-wider transition-colors backdrop-blur-sm"
          >
            <span>All Matches</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
}
