import { Link } from "@tanstack/react-router";
import { Radio, ChevronRight, Trophy } from "lucide-react";
import { CinematicHeroRotator } from "@/components/brand/CinematicHeroRotator";

interface MovingCricketHeroProps {
  liveCount: number;
}

export function MovingCricketHero({ liveCount }: MovingCricketHeroProps) {
  return (
    <div className="w-full relative overflow-hidden bg-[#0a0c10] min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex items-center shadow-2xl border-b border-[#E5E5E5]/20">
      
      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 1: Cinematic Static Image Rotator (6s Static + 1.5s Slow Crossfade)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0" 
        aria-hidden="true"
      >
        <CinematicHeroRotator />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 2: Directional Dark Gradient Overlay with TPL Gold Atmospheric Glow
          ══════════════════════════════════════════════════════════════════════════════ */}
      {/* Directional Horizontal Gradient: Dark on left for text legibility, transparent/bright on right */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(10, 12, 16, 0.88) 0%, rgba(10, 12, 16, 0.70) 28%, rgba(10, 12, 16, 0.35) 54%, rgba(10, 12, 16, 0.15) 75%, rgba(10, 12, 16, 0.25) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Subtle Vertical Gradient for Top/Bottom Integration */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/40 via-transparent to-[#0a0c10]/70 z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* TPL Gold Atmospheric Brand Glow */}
      <div 
        className="absolute -left-12 -top-12 w-80 h-80 rounded-full bg-[#D9A928]/15 blur-[100px] z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 3: Existing Fixed Hero Content (TPL Gold System - Completely Static)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 mx-auto max-w-6xl w-full px-6 sm:px-8 py-12 sm:py-16 flex flex-col justify-center">
        
        {/* Gold Decorative Brand Line */}
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-8 rounded-full bg-[#D9A928]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#F4C542]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#9A6A05]" />
        </div>

        {/* Season Tag */}
        <p className="text-xs sm:text-sm font-extrabold tracking-[0.3em] text-[#D9A928] uppercase mb-2 drop-shadow-md">
          SEASON 2026
        </p>

        {/* Main TPL CRICKET Headline */}
        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.86] tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
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
        <p className="mt-4 text-base sm:text-lg font-bold text-white/90 tracking-wide flex items-center gap-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <span>Live Scoring</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
          <span>Ball by Ball</span>
        </p>

        {/* Live Matches CTA Buttons (Official TPL 2026 Button System) */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {liveCount > 0 ? (
            <Link
              to="/live"
              className="tap inline-flex items-center gap-3 rounded-2xl px-7 py-4 font-black text-sm uppercase tracking-wider text-[#111111] transition-all transform active:scale-[0.98] hover:brightness-105 group shadow-[0_8px_25px_rgba(217,169,40,0.38)] bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#B88716]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#111111] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#111111]" />
              </span>
              <span>{liveCount} {liveCount === 1 ? "Match" : "Matches"} Live Now</span>
              <Radio className="h-4 w-4 ml-0.5 group-hover:scale-110 transition-transform text-[#111111]" />
            </Link>
          ) : (
            <Link
              to="/matches"
              className="tap inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-[#F5F5F0] text-[#111111] px-6 py-3.5 text-sm font-black uppercase tracking-wider transition-all shadow-md"
            >
              <Trophy className="h-4 w-4 text-[#D9A928]" />
              <span>View Fixtures</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}

          <Link
            to="/matches"
            className="tap inline-flex items-center gap-2 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 px-5 py-3.5 text-xs font-extrabold text-white uppercase tracking-wider transition-colors backdrop-blur-md shadow-md"
          >
            <span>All Matches</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/70" />
          </Link>
        </div>

      </div>

    </div>
  );
}
