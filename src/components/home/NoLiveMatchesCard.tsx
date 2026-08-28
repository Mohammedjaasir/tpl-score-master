import { Link } from "@tanstack/react-router";
import { Calendar, Radio, ArrowRight } from "lucide-react";

export function NoLiveMatchesCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#121316] border border-white/10 shadow-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      {/* ── Subtle Ambient Lighting ──────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-[#D9A928]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Clean Icon Badge ────────────────────────────────────────────── */}
      <div className="relative mb-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D9A928] shadow-inner">
          <Radio className="h-7 w-7 sm:h-8 sm:w-8 opacity-90" />
        </div>
      </div>

      {/* ── Typography ──────────────────────────────────────────────────── */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider">
        NO LIVE MATCHES RIGHT NOW
      </h3>

      <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed max-w-md mt-2">
        There are no matches currently in progress.
        <br />
        Check upcoming fixtures below for the full match schedule and live timings.
      </p>

      {/* ── Professional Action Button ──────────────────────────────────── */}
      <Link
        to="/matches"
        className="tap mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-[#111111] px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
      >
        <Calendar className="h-3.5 w-3.5 text-[#111111]" />
        <span>View Upcoming Fixtures</span>
        <ArrowRight className="h-3.5 w-3.5 text-[#111111]" />
      </Link>
    </div>
  );
}
