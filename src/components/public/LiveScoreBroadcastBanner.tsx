import React from "react";
import { Sparkles, Trophy, Zap, AlertTriangle } from "lucide-react";

export interface LiveScoreEvent {
  id: string;
  badgeText: string;
  subText?: string;
  isWicket: boolean;
  isFour: boolean;
  isSix: boolean;
  isExtra: boolean;
}

interface Props {
  event: LiveScoreEvent | null;
}

export const LiveScoreBroadcastBanner: React.FC<Props> = ({ event }) => {
  if (!event) return null;

  const isBoundary = event.isFour || event.isSix;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-4">
      <div
        key={event.id}
        className={`flex flex-col items-center justify-center px-6 py-3.5 rounded-3xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in zoom-in-75 fade-in ${
          event.isWicket
            ? "bg-rose-950/95 border-rose-500 text-rose-100 shadow-[0_0_50px_rgba(244,63,94,0.6)] scale-105"
            : event.isSix
            ? "bg-[#1C1808]/95 border-[#D9A928] text-amber-100 shadow-[0_0_50px_rgba(217,169,40,0.6)] scale-105"
            : event.isFour
            ? "bg-[#06242E]/95 border-[#38BDF8] text-cyan-100 shadow-[0_0_40px_rgba(56,189,248,0.5)] scale-105"
            : event.isExtra
            ? "bg-slate-900/95 border-amber-400 text-amber-200 shadow-xl"
            : "bg-black/90 border-[#D9A928]/60 text-white shadow-xl"
        }`}
      >
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {event.isWicket ? (
            <>
              <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                Wicket Falling
              </span>
            </>
          ) : event.isSix ? (
            <>
              <Sparkles className="h-4 w-4 text-[#D9A928] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928]">
                Maximum Six
              </span>
            </>
          ) : event.isFour ? (
            <>
              <Zap className="h-4 w-4 text-[#38BDF8] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">
                Boundary Four
              </span>
            </>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
              Live Ball
            </span>
          )}
        </div>

        {/* Big Score Badge */}
        <div
          className={`font-black tracking-tight uppercase tabular-nums ${
            event.isWicket
              ? "text-3xl sm:text-4xl text-rose-200"
              : event.isSix
              ? "text-4xl sm:text-5xl text-[#FDE047] drop-shadow-[0_2px_12px_rgba(253,224,71,0.5)]"
              : event.isFour
              ? "text-4xl sm:text-5xl text-[#7DD3FC] drop-shadow-[0_2px_12px_rgba(125,211,252,0.5)]"
              : "text-3xl sm:text-4xl text-white"
          }`}
        >
          {event.badgeText}
        </div>

        {/* Subtext info (e.g. dismissals or extra details) */}
        {event.subText && (
          <p className="text-xs font-extrabold text-white/90 text-center mt-1 max-w-xs truncate">
            {event.subText}
          </p>
        )}
      </div>
    </div>
  );
};
