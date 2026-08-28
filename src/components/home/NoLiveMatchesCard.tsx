import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";

export function NoLiveMatchesCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0c0d10] border border-white/10 shadow-2xl p-8 sm:p-12 md:p-14 text-center flex flex-col items-center justify-center min-h-[340px] sm:min-h-[380px]">
      {/* ── Background Stadium & Floodlights Atmosphere ──────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="/no-live-matches.png"
          alt=""
          className="h-full w-full object-cover object-center opacity-60 mix-blend-screen scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10] via-transparent to-[#0c0d10]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0c0d10]/40 to-[#0c0d10]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#D9A928]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Foreground Content ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
        {/* Glowing Golden Cricket Ball Icon */}
        <div className="relative mb-5">
          {/* Sparkle particles */}
          <span className="absolute -top-2 left-2 text-[#D9A928]/60 text-xs select-none">○</span>
          <span className="absolute -top-1 -right-3 text-[#D9A928]/40 text-xs select-none">×</span>
          <span className="absolute -bottom-2 -left-4 text-[#D9A928]/40 text-xs select-none">○</span>
          <span className="absolute -bottom-1 right-4 text-[#D9A928]/60 text-xs select-none">×</span>

          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-[#D9A928] bg-black/60 flex items-center justify-center shadow-[0_0_30px_rgba(217,169,40,0.3)]">
            <svg
              viewBox="0 0 100 100"
              className="h-14 w-14 sm:h-16 sm:w-16 text-[#D9A928]"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="50" cy="50" r="44" strokeWidth="2.5" opacity="0.3" />
              {/* Seam stitches */}
              <path d="M22 28 Q 50 50 78 72" strokeWidth="3" strokeDasharray="3 3" />
              <path d="M28 22 Q 50 50 72 78" strokeWidth="3" strokeDasharray="3 3" />
              <path d="M34 18 Q 50 50 82 66" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              <path d="M18 34 Q 50 50 66 82" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
          NO LIVE MATCHES RIGHT NOW
        </h3>

        {/* Gold Accent Divider */}
        <div className="h-1 w-10 bg-[#D9A928] rounded-full my-3.5 shadow-[0_0_8px_rgba(217,169,40,0.6)]" />

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed max-w-md">
          There are no matches currently live.
          <br />
          Please check back later for live scores and updates.
        </p>

        {/* CTA Button */}
        <Link
          to="/matches"
          className="tap mt-6 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0c0d10]/90 border border-[#D9A928] hover:bg-[#D9A928]/15 active:bg-[#D9A928]/30 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(217,169,40,0.2)] hover:shadow-[0_0_30px_rgba(217,169,40,0.4)] hover:scale-[1.02]"
        >
          <Calendar className="h-4 w-4 text-[#D9A928]" />
          <span>VIEW UPCOMING FIXTURES</span>
        </Link>
      </div>
    </div>
  );
}
