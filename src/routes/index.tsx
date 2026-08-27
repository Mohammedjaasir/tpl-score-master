import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Radio } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button6 } from "@/components/ui/button-6";

export const Route = createFileRoute("/")({
  component: LandingScreen,
});

function LandingScreen() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      
      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 1: Bright, High-Clarity Full-Bleed Live Cricket Video Background
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-cricket-1.jpg"
          className="w-full h-full object-cover object-center filter brightness-[1.0] contrast-[1.04] saturate-[1.02] select-none scale-[1.01]"
        >
          <source src="/hero-video.webm" type="video/webm" />
          <source src="/hero-video.mp4" type="video/mp4" />
          <img
            src="/hero-cricket-1.jpg"
            alt="TPL Cricket background"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 2: Lightweight Gradient (Clear Video in Middle & Top, Contrast at Bottom)
          ══════════════════════════════════════════════════════════════════════════════ */}
      {/* Soft top vignette for header legibility */}
      <div 
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Bottom gradient strictly behind the text area */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Ambient Red Brand Glow */}
      <div 
        className="absolute -left-20 bottom-10 w-80 h-80 rounded-full bg-primary/20 blur-[100px] z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 3: Top Navigation Header
          ══════════════════════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 px-6 pt-6 pb-2 flex items-center justify-between mx-auto max-w-lg w-full">
        <Logo size="lg" />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-white/25 backdrop-blur-md px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-white uppercase shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            TPL 2026
          </span>
        </div>
      </header>

      {/* Center Spacer to showcase full bright video action */}
      <div className="flex-1 min-h-[140px] sm:min-h-[220px]" />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 4: Foreground Content & Action Buttons (Crisp Typography with Drop Shadows)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <main className="relative z-30 px-6 pb-8 pt-4 mx-auto max-w-lg w-full flex flex-col gap-4">
        
        {/* Season Tag & Main Typography */}
        <div>
          <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-primary uppercase mb-1.5 flex items-center gap-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            <span>SEASON 2026 · CRICKET TOURNAMENT</span>
          </p>
          
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl uppercase tracking-[-0.03em] text-white leading-[0.88] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            THUNDUWA<br />
            <span className="text-primary drop-shadow-[0_2px_12px_rgba(235,70,55,0.5)]">PREMIER LEAGUE</span>
          </h1>
          
          <p className="mt-3 text-xs sm:text-sm font-semibold text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            The official live match center and scoring system for TPL 2026. Follow every ball, boundary, wicket, and real-time scorecard directly from the tournament grounds.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 pt-1">
          {/* Primary CTA Button (Button-6 Component) */}
          <Link to="/home" className="w-full">
            <Button6
              className="w-full cursor-pointer"
              hoverText={
                <>
                  <span>Start Scoring Match</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              }
            >
              <span>Enter Scorer Console</span>
              <ArrowRight className="h-4 w-4" />
            </Button6>
          </Link>

          {/* Secondary CTA Button */}
          <Link
            to="/live"
            className="tap w-full min-h-12 bg-black/40 hover:bg-black/60 active:scale-[0.98] border border-white/30 backdrop-blur-md text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-transform shadow-md"
          >
            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>View Live Matches</span>
          </Link>
        </div>

        {/* Tournament Metadata Highlights */}
        <div className="flex items-center justify-between text-[10px] font-bold text-white/80 uppercase tracking-widest pt-1 px-1 border-t border-white/15 drop-shadow-sm">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Verified Scores
          </span>
          <span>•</span>
          <span>Ball by Ball</span>
          <span>•</span>
          <span>Full Fixtures</span>
        </div>

      </main>

      {/* Subtle Bottom Accent Gradient Line */}
      <div className="relative z-30 h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

    </div>
  );
}
