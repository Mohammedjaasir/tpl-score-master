import { AnimatePresence, motion } from "framer-motion";
import type { ObsBroadcastEvent } from "@/hooks/useObsMatchEvents";
import { Award, Flame, Sparkles, Trophy, Zap } from "lucide-react";

interface EventAlertOverlayProps {
  event: ObsBroadcastEvent | null;
}

export function EventAlertOverlay({ event }: EventAlertOverlayProps) {
  return (
    <div className="w-full flex justify-center mb-3 pointer-events-none">
      <AnimatePresence mode="wait">
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative"
          >
            {/* ── 1. FOUR EVENT ────────────────────────────────────────────── */}
            {event.type === "FOUR" && (
              <div className="flex items-center gap-4 bg-[#111111]/95 text-white border-2 border-emerald-400 px-7 py-3 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500 text-black font-black text-2xl shadow-lg">
                  +4
                </div>
                <div>
                  <div className="text-xl font-black uppercase tracking-wider text-emerald-400 leading-tight">
                    FOUR!
                  </div>
                  <div className="text-xs font-extrabold uppercase text-white/90">
                    {event.batterName} <span className="text-white/50 font-mono">({event.runs})</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. SIX EVENT ─────────────────────────────────────────────── */}
            {event.type === "SIX" && (
              <div className="flex items-center gap-5 bg-[#111111]/95 text-white border-2 border-[#D9A928] px-8 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#F4C542] to-[#D9A928] text-black font-black text-3xl shadow-lg">
                  +6
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black uppercase tracking-widest text-[#D9A928] leading-tight">
                      MAXIMUM!
                    </span>
                    <Sparkles className="h-5 w-5 text-[#D9A928] animate-spin" />
                  </div>
                  <div className="text-sm font-extrabold uppercase text-white">
                    {event.batterName} <span className="text-[#D9A928] font-mono font-black">({event.runs})</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. WICKET EVENT ──────────────────────────────────────────── */}
            {event.type === "WICKET" && (
              <div className="flex items-center gap-5 bg-[#111111]/95 text-white border-2 border-rose-500 px-8 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-rose-600 text-white font-black text-2xl shadow-lg">
                  OUT
                </div>
                <div>
                  <div className="text-xl font-black uppercase tracking-widest text-rose-500 leading-tight">
                    WICKET!
                  </div>
                  <div className="text-sm font-black uppercase text-white">
                    {event.batterName} <span className="text-white/60 font-mono font-bold">{event.runs} ({event.balls})</span>
                  </div>
                  <div className="text-[11px] font-bold text-white/70 italic mt-0.5">
                    {event.dismissalText}
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. FIFTY EVENT ───────────────────────────────────────────── */}
            {event.type === "FIFTY" && (
              <div className="flex items-center gap-4 bg-[#111111]/95 text-white border-2 border-[#D9A928] px-7 py-3 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#D9A928] text-black">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-lg font-black uppercase tracking-widest text-[#D9A928]">
                    HALF CENTURY!
                  </div>
                  <div className="text-sm font-extrabold uppercase text-white">
                    {event.batterName} <span className="text-[#D9A928] font-mono">{event.runs} ({event.balls})</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. CENTURY EVENT ─────────────────────────────────────────── */}
            {event.type === "CENTURY" && (
              <div className="flex items-center gap-4 bg-[#111111]/95 text-white border-2 border-amber-300 px-8 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-amber-400 text-black">
                  <Trophy className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xl font-black uppercase tracking-widest text-amber-300">
                    MAGNIFICENT CENTURY!
                  </div>
                  <div className="text-sm font-extrabold uppercase text-white">
                    {event.batterName} <span className="text-amber-300 font-mono">{event.runs} ({event.balls})</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. NEW BATTER ────────────────────────────────────────────── */}
            {event.type === "NEW_BATTER" && (
              <div className="flex items-center gap-3.5 bg-[#111111]/95 text-white border border-white/20 px-6 py-2.5 rounded-xl shadow-xl backdrop-blur-md">
                <div className="h-2.5 w-2.5 rounded-full bg-[#D9A928]" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] block">
                    NOW BATTING
                  </span>
                  <span className="text-xs font-black uppercase text-white">
                    {event.batterName} <span className="text-white/50 text-[10px] font-mono">0 (0)</span>
                  </span>
                </div>
              </div>
            )}

            {/* ── 7. NEW BOWLER ────────────────────────────────────────────── */}
            {event.type === "NEW_BOWLER" && (
              <div className="flex items-center gap-3.5 bg-[#111111]/95 text-white border border-white/20 px-6 py-2.5 rounded-xl shadow-xl backdrop-blur-md">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                    NEW BOWLER INTO THE ATTACK
                  </span>
                  <span className="text-xs font-black uppercase text-white">
                    {event.bowlerName} {event.role && <span className="text-white/50 text-[10px]">({event.role})</span>}
                  </span>
                </div>
              </div>
            )}

            {/* ── 8. OVER COMPLETE ─────────────────────────────────────────── */}
            {event.type === "OVER_COMPLETE" && (
              <div className="flex items-center gap-4 bg-[#111111]/95 text-white border border-[#D9A928]/40 px-6 py-2.5 rounded-xl shadow-xl backdrop-blur-md">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] block">
                    END OF OVER {event.overNumber}
                  </span>
                  <span className="text-xs font-black uppercase text-white font-mono">
                    Score: {event.runs} / {event.wickets} • CRR: {event.crr.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* ── 9. PARTNERSHIP MILESTONE ───────────────────────────────── */}
            {event.type === "PARTNERSHIP" && (
              <div className="flex items-center gap-6 bg-[#111111]/95 text-white border-2 border-[#D9A928] px-8 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#D9A928]">
                    CURRENT PARTNERSHIP
                  </div>
                  <div className="text-base font-black uppercase text-white mt-1 flex items-center gap-3">
                    <span>{event.batterAName} <strong className="text-[#D9A928] font-mono">{event.batterARuns}</strong> <span className="text-white/50 text-xs">({event.batterABalls})</span></span>
                    <span className="text-white/40">•</span>
                    <span>{event.batterBName} <strong className="text-[#D9A928] font-mono">{event.batterBRuns}</strong> <span className="text-white/50 text-xs">({event.batterBBalls})</span></span>
                  </div>
                  <div className="text-xs font-bold text-white/70 mt-0.5">
                    {event.totalRuns} Runs from {event.totalBalls} Balls
                  </div>
                </div>
              </div>
            )}

            {/* ── 10. MATCH START PRESENTATION ────────────────────────────── */}
            {event.type === "MATCH_START" && (
              <div className="flex items-center gap-6 bg-[#111111]/95 text-white border-2 border-[#D9A928] px-9 py-4 rounded-2xl shadow-2xl backdrop-blur-md">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#D9A928]">
                    TPL 2026 MATCH #{event.matchNumber}
                  </div>
                  <div className="text-xl font-black uppercase text-white mt-1">
                    {event.teamAName} <span className="text-[#D9A928]">VS</span> {event.teamBName}
                  </div>
                  <div className="text-xs font-bold text-white/60 mt-0.5">
                    {event.venue} • {event.overs} Overs Match
                  </div>
                </div>
              </div>
            )}

            {/* ── 11. INNINGS BREAK ─────────────────────────────────────────── */}
            {event.type === "INNINGS_BREAK" && (
              <div className="flex items-center gap-5 bg-[#111111]/95 text-white border-2 border-[#D9A928] px-8 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <div>
                  <div className="text-sm font-black uppercase tracking-widest text-[#D9A928]">
                    INNINGS BREAK
                  </div>
                  <div className="text-base font-black uppercase text-white mt-0.5">
                    {event.battingTeamName}: <span className="text-[#D9A928] font-mono">{event.runs} / {event.wickets}</span> ({event.oversText} OV)
                  </div>
                  {event.target && (
                    <div className="text-xs font-extrabold uppercase text-emerald-400 mt-1">
                      TARGET: {event.target} RUNS
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 12. MATCH RESULT ─────────────────────────────────────────── */}
            {event.type === "MATCH_RESULT" && (
              <div className="flex items-center gap-5 bg-[#111111]/95 text-white border-2 border-[#D9A928] px-9 py-4 rounded-2xl shadow-2xl backdrop-blur-md">
                <Trophy className="h-8 w-8 text-[#D9A928] shrink-0" />
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#D9A928]">
                    OFFICIAL MATCH RESULT
                  </div>
                  <div className="text-base font-black uppercase text-white mt-0.5">
                    {event.resultText}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
