import React from "react";
import type { ObsMatchStreamResult } from "@/hooks/useObsMatchStream";
import { Sparkles, Tv, Radio } from "lucide-react";

export interface AdvertisementPayload {
  title?: string;
  subtitle?: string;
  tagline?: string;
  sponsorName?: string;
  logoUrl?: string;
  durationSeconds?: number;
}

interface AdvertisementBreakGraphicProps {
  payload?: AdvertisementPayload;
  stream?: ObsMatchStreamResult;
}

export function AdvertisementBreakGraphic({ payload, stream }: AdvertisementBreakGraphicProps) {
  const sponsorName = payload?.sponsorName || "VALGROW LABS";
  const title = payload?.title || "COMMERCIAL BREAK";
  const tagline = payload?.tagline || "Official Technology & Innovation Partner · TPL 2026";
  const subtitle = payload?.subtitle || "ValGrow Labs provides next-generation cloud architectures, real-time analytics, and high-performance digital platforms.";
  const logoUrl = payload?.logoUrl || "/valgrow-labs-logo.jpeg";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans select-none pointer-events-none animate-in fade-in zoom-in-95 duration-500">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-[#D9A928]/15 via-emerald-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Main Glassmorphic Sponsor Ad Container */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#161616]/95 via-[#111111]/95 to-[#0A0A0A]/98 border border-[#D9A928]/50 rounded-3xl p-10 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(217,169,40,0.2)] backdrop-blur-2xl flex flex-col items-center text-center">
        
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#D9A928]/15 border border-[#D9A928]/40 mb-6 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D9A928] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            {title}
          </span>
        </div>

        {/* Sponsor Brand Spotlight */}
        <div className="relative group mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#D9A928]/40 via-amber-300/30 to-[#D9A928]/40 rounded-2xl blur-lg opacity-70 animate-pulse" />
          <div className="relative w-36 h-36 rounded-2xl bg-black/80 border-2 border-[#D9A928] p-2 flex items-center justify-center shadow-2xl overflow-hidden">
            <img
              src={logoUrl}
              alt={sponsorName}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#D9A928] animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F4C542] to-white drop-shadow-md">
            {sponsorName}
          </h2>
          <Sparkles className="w-4 h-4 text-[#D9A928] animate-bounce" />
        </div>

        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#D9A928] mb-3">
          {tagline}
        </p>

        <p className="text-xs sm:text-sm text-white/70 max-w-xl font-medium leading-relaxed mb-6">
          {subtitle}
        </p>

        {/* Match Context Status Strip */}
        <div className="w-full max-w-md pt-5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/60">
          <div className="flex items-center gap-2">
            <Tv className="w-3.5 h-3.5 text-[#D9A928]" />
            <span className="text-white/80 uppercase font-black text-[11px] tracking-wider">
              TPL 2026 PREMIER LEAGUE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 uppercase font-black text-[10px] tracking-widest">
              LIVE ACTION RESUMES SHORTLY
            </span>
          </div>
        </div>

        {/* Animated Accent Bar */}
        <div className="absolute bottom-0 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-[#D9A928] to-transparent rounded-full shadow-[0_0_15px_#D9A928]" />
      </div>
    </div>
  );
}
