import { Link } from "@tanstack/react-router";
import { Radio, ChevronRight } from "lucide-react";

interface MovingCricketHeroProps {
  liveCount: number;
}

const CRICKET_SCENES = [
  { src: "/hero-cricket-1.jpg", alt: "Cricket batsman power shot under stadium floodlights" },
  { src: "/hero-cricket-4.jpg", alt: "Fast bowler delivering the ball in packed cricket stadium" },
  { src: "/hero-cricket-2.jpg", alt: "Cricket shattered stumps and bails celebration" },
  { src: "/hero-cricket-3.jpg", alt: "Cricket batsman dynamic pull shot" },
];

export function MovingCricketHero({ liveCount }: MovingCricketHeroProps) {
  // Quadruple sequence for perfectly seamless continuous infinite marquee loop from left to right
  const backgroundTrack = [
    ...CRICKET_SCENES,
    ...CRICKET_SCENES,
    ...CRICKET_SCENES,
    ...CRICKET_SCENES,
  ];

  return (
    <div className="w-full relative overflow-hidden bg-[#05080b] min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] flex items-center shadow-2xl border-b border-white/10">
      
      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 1: Full-Bleed Large, Clear, Visible Cricket Photography Background (LEFT -> RIGHT)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0" 
        aria-hidden="true"
      >
        <div 
          className="flex h-full w-max animate-marquee-ltr"
          style={{ willChange: "transform" }}
        >
          {backgroundTrack.map((img, idx) => (
            <div
              key={`bg-scene-${idx}`}
              className="h-full w-[110vw] sm:w-[65vw] lg:w-[55vw] min-w-[380px] sm:min-w-[550px] lg:min-w-[850px] shrink-0 relative"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover filter brightness-[0.90] contrast-[1.05] saturate-[0.92] select-none"
                loading={idx < 4 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 2: Lightweight Directional Dark Gradient Overlay
          ══════════════════════════════════════════════════════════════════════════════ */}
      {/* Directional Horizontal Gradient: Dark on left for text legibility, transparent/bright on right */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(5, 8, 11, 0.82) 0%, rgba(5, 8, 11, 0.62) 24%, rgba(5, 8, 11, 0.32) 48%, rgba(5, 8, 11, 0.12) 72%, rgba(5, 8, 11, 0.20) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Subtle Vertical Gradient for Top/Bottom Integration */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#05080b]/35 via-transparent to-[#05080b]/65 z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Subtle Red Atmospheric Brand Glow */}
      <div 
        className="absolute -left-12 -top-12 w-80 h-80 rounded-full bg-primary/15 blur-[100px] z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════════════════════
          LAYER 3: Existing Fixed Hero Content (Non-moving, Crisp Typography & Status CTA)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 mx-auto max-w-6xl w-full px-6 sm:px-8 py-12 sm:py-16 flex flex-col justify-center">
        
        {/* Red Decorative Brand Line */}
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-8 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        </div>

        {/* Season Tag */}
        <p className="text-xs sm:text-sm font-extrabold tracking-[0.3em] text-primary uppercase mb-2">
          SEASON 2026
        </p>

        {/* Main TPL CRICKET Headline */}
        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.86] tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          TPL<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/80">
            CRICKET
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-base sm:text-lg font-bold text-white/90 tracking-wide flex items-center gap-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <span>Live Scoring</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Ball by Ball</span>
        </p>

        {/* Live Matches CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {liveCount > 0 ? (
            <Link
              to="/live"
              className="tap inline-flex items-center gap-3 rounded-full bg-primary hover:bg-primary/95 active:scale-[0.98] border border-primary/60 px-6 py-3.5 shadow-[var(--shadow-pop)] text-primary-foreground font-extrabold text-sm uppercase tracking-widest transition-all group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span>{liveCount} {liveCount === 1 ? "Match" : "Matches"} Live Now</span>
              <Radio className="h-4 w-4 ml-0.5 group-hover:scale-110 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/matches"
              className="tap inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-6 py-3 text-sm font-extrabold text-white uppercase tracking-widest transition-colors backdrop-blur-sm shadow-md"
            >
              <span>View Fixtures</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}

          <Link
            to="/matches"
            className="tap inline-flex items-center gap-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 px-5 py-3 text-xs font-bold text-white/90 uppercase tracking-widest transition-colors backdrop-blur-md shadow-md"
          >
            <span>All Matches</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/70" />
          </Link>
        </div>

      </div>

    </div>
  );
}
