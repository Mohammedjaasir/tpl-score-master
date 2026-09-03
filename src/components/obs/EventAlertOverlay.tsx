import { AnimatePresence, motion } from "framer-motion";
import type { ObsBroadcastEvent } from "@/hooks/useObsMatchEvents";
import { Sparkles } from "lucide-react";

interface EventAlertOverlayProps {
  event: ObsBroadcastEvent | null;
}

export function EventAlertOverlay({ event }: EventAlertOverlayProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.25, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.15, filter: "blur(8px)" }}
            transition={{ type: "spring", damping: 15, stiffness: 280 }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* ── 1. FOUR EVENT (Center TV Pop) ────────────────────────────── */}
            {event.type === "FOUR" && (
              <div className="relative flex flex-col items-center justify-center">
                {/* Radial Golden Burst Glow */}
                <div className="absolute -inset-16 bg-gradient-to-r from-[#D9A928]/35 via-amber-400/25 to-[#D9A928]/35 blur-3xl rounded-full pointer-events-none animate-pulse" />

                {/* Main TV Pop Card */}
                <div className="relative bg-gradient-to-b from-[#181818]/98 via-[#0F0F0F]/98 to-black/98 border-2 border-[#D9A928] rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(217,169,40,0.5),0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col items-center text-center min-w-[340px] max-w-[460px]">
                  
                  {/* Shimmer light sweep */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_1.4s_infinite]" />
                  </div>

                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D9A928]/20 border border-[#D9A928]/60 mb-2 shadow-inner">
                    <span className="h-2 w-2 rounded-full bg-[#D9A928] animate-ping" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-[#D9A928]">
                      BOUNDARY
                    </span>
                  </div>

                  {/* Giant 3D Center 4 */}
                  <div className="relative my-0 select-none">
                    <span className="text-[140px] sm:text-[160px] font-black leading-none font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#FFF0B3] via-[#D9A928] to-[#8C6205] drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
                      4
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[140px] sm:text-[160px] font-black leading-none font-mono tracking-tighter text-[#D9A928]/25 blur-md">
                        4
                      </span>
                    </div>
                  </div>

                  {/* Wordmark */}
                  <div className="text-2xl sm:text-3xl font-black uppercase tracking-[0.35em] text-white -mt-5 mb-2 drop-shadow-md">
                    FOUR
                  </div>

                  {/* Batter Name Pill */}
                  {event.batterName && (
                    <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/90 bg-white/10 px-4 py-1 rounded-full border border-white/15 mb-4 truncate max-w-[280px]">
                      {event.batterName}
                    </div>
                  )}

                  {/* Below the 4: POWERED BY VALGROW LABS */}
                  <div className="w-full pt-4 border-t border-[#D9A928]/40 flex items-center justify-center gap-2.5">
                    <img
                      src="/valgrow-labs-logo.jpeg"
                      alt="ValGrow Labs"
                      className="h-5 w-5 rounded object-cover shadow-md"
                    />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                      <span className="text-[#D9A928]">POWERED BY</span> VALGROW LABS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. SIX EVENT (Center TV Pop) ─────────────────────────────── */}
            {event.type === "SIX" && (
              <div className="relative flex flex-col items-center justify-center">
                {/* Radial Golden Flare Burst Glow */}
                <div className="absolute -inset-20 bg-gradient-to-r from-[#D9A928]/45 via-amber-300/30 to-[#D9A928]/45 blur-3xl rounded-full pointer-events-none animate-pulse" />

                {/* Main TV Pop Card */}
                <div className="relative bg-gradient-to-b from-[#181818]/98 via-[#0F0F0F]/98 to-black/98 border-2 border-[#D9A928] rounded-3xl p-8 sm:p-10 shadow-[0_0_90px_rgba(217,169,40,0.65),0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col items-center text-center min-w-[340px] max-w-[460px]">
                  
                  {/* Shimmer light sweep */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D9A928]/25 to-transparent -translate-x-full animate-[shimmer_1.3s_infinite]" />
                  </div>

                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D9A928]/20 border border-[#D9A928]/60 mb-2 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 text-[#D9A928] animate-spin" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-[#D9A928]">
                      MAXIMUM
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D9A928] animate-spin" />
                  </div>

                  {/* Giant 3D Center 6 */}
                  <div className="relative my-0 select-none">
                    <span className="text-[140px] sm:text-[160px] font-black leading-none font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#FFF0B3] via-[#D9A928] to-[#8C6205] drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
                      6
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[140px] sm:text-[160px] font-black leading-none font-mono tracking-tighter text-[#D9A928]/30 blur-md">
                        6
                      </span>
                    </div>
                  </div>

                  {/* Wordmark */}
                  <div className="text-2xl sm:text-3xl font-black uppercase tracking-[0.35em] text-white -mt-5 mb-2 drop-shadow-md">
                    SIX
                  </div>

                  {/* Batter Name Pill */}
                  {event.batterName && (
                    <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/90 bg-white/10 px-4 py-1 rounded-full border border-white/15 mb-4 truncate max-w-[280px]">
                      {event.batterName}
                    </div>
                  )}

                  {/* Below the 6: POWERED BY VALGROW LABS */}
                  <div className="w-full pt-4 border-t border-[#D9A928]/40 flex items-center justify-center gap-2.5">
                    <img
                      src="/valgrow-labs-logo.jpeg"
                      alt="ValGrow Labs"
                      className="h-5 w-5 rounded object-cover shadow-md"
                    />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                      <span className="text-[#D9A928]">POWERED BY</span> VALGROW LABS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. WICKET EVENT (Center TV Pop) ──────────────────────────── */}
            {event.type === "WICKET" && (
              <div className="relative flex flex-col items-center justify-center">
                <div className="absolute -inset-16 bg-gradient-to-r from-red-600/35 via-rose-600/20 to-red-600/35 blur-3xl rounded-full pointer-events-none animate-pulse" />

                <div className="relative bg-gradient-to-b from-[#1C0606]/98 via-[#0F0404]/98 to-black/98 border-2 border-red-600 rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(220,38,38,0.5),0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col items-center text-center min-w-[340px] max-w-[460px]">
                  
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-600/20 border border-red-600/60 mb-2 shadow-inner">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-red-400">
                      WICKET
                    </span>
                  </div>

                  <div className="my-2 select-none">
                    <span className="text-7xl sm:text-8xl font-black leading-none tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-500 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
                      OUT
                    </span>
                  </div>

                  <div className="text-lg sm:text-xl font-black uppercase tracking-wider text-white mb-1 truncate max-w-[300px]">
                    {event.batterName}
                  </div>

                  {event.dismissalText && (
                    <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-4">
                      {event.dismissalText}
                    </div>
                  )}

                  <div className="w-full pt-4 border-t border-red-600/40 flex items-center justify-center gap-2.5">
                    <img
                      src="/valgrow-labs-logo.jpeg"
                      alt="ValGrow Labs"
                      className="h-5 w-5 rounded object-cover shadow-md"
                    />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                      <span className="text-[#D9A928]">POWERED BY</span> VALGROW LABS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. FIFTY EVENT ───────────────────────────────────────────── */}
            {event.type === "FIFTY" && (
              <div className="relative bg-[#111111]/95 text-white border-2 border-[#D9A928] rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-2 backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D9A928]">
                  HALF CENTURY
                </div>
                <div className="text-2xl font-black uppercase text-white">
                  {event.batterName}
                </div>
                <div className="text-5xl font-black text-[#D9A928] font-mono">
                  {event.runs}
                </div>
              </div>
            )}

            {/* ── 5. CENTURY EVENT ─────────────────────────────────────────── */}
            {event.type === "CENTURY" && (
              <div className="relative bg-[#111111]/95 text-white border-2 border-[#D9A928] rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-2 backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D9A928]">
                  MAGNIFICENT CENTURY
                </div>
                <div className="text-2xl font-black uppercase text-white">
                  {event.batterName}
                </div>
                <div className="text-6xl font-black text-[#D9A928] font-mono">
                  {event.runs}
                </div>
              </div>
            )}

            <style>{`
              @keyframes shimmer {
                100% {
                  transform: translateX(100%);
                }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
