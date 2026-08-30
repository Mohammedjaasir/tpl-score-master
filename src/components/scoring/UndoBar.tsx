import { useState } from "react";
import { RotateCcw, AlertTriangle, X } from "lucide-react";
import type { BallSummary } from "@/types/cricket";

interface Props {
  onUndo: () => void;
  canUndo: boolean;
  lastBallSummary?: BallSummary;
}

export function UndoBar({ onUndo, canUndo, lastBallSummary }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!canUndo) return null;

  const ballLabelText = lastBallSummary
    ? `${lastBallSummary.oversText} — ${
        lastBallSummary.kind === "wicket"
          ? "WICKET"
          : lastBallSummary.delivery.batterRuns === 4
          ? "FOUR (4 Runs)"
          : lastBallSummary.delivery.batterRuns === 6
          ? "SIX (6 Runs)"
          : lastBallSummary.delivery.extraType
          ? `EXTRA (${lastBallSummary.label})`
          : `${lastBallSummary.totalRuns} Run${lastBallSummary.totalRuns !== 1 ? "s" : ""}`
      }`
    : "Last Recorded Delivery";

  return (
    <>
      {confirming && (
        <div
          className="fixed inset-0 z-50 glass-overlay flex items-end justify-center"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white border-t border-[#E5E5E5] p-6 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="text-base font-black uppercase tracking-wider text-[#111111]">
                  UNDO LAST BALL?
                </p>
              </div>
              <button
                onClick={() => setConfirming(false)}
                className="tap h-8 w-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[#5F6368] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ball identifier */}
            <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] text-center mb-4">
              <span className="text-xs font-bold text-[#5F6368] uppercase block">Delivery to be removed:</span>
              <p className="text-base font-black text-[#111111] mt-0.5 tracking-wide">
                {ballLabelText}
              </p>
            </div>

            {/* Warning list */}
            <div className="flex flex-col gap-1.5 text-xs text-[#5F6368] mb-6">
              <p className="font-extrabold uppercase text-[10px] tracking-wider text-[#111111] mb-0.5">
                This will automatically remove:
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Delivery record & total match runs
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Batter runs, balls faced & boundaries
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Bowler figures & maiden status
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Partnership balls & run tally
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Wagon Wheel shot marker & commentary
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="tap flex-1 min-h-14 rounded-2xl bg-[#F7F7F5] hover:bg-[#E5E5E5] text-sm font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5] transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  onUndo();
                  setConfirming(false);
                }}
                className="tap flex-1 min-h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                CONFIRM UNDO
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="tap flex w-full items-center justify-center gap-2 min-h-12 rounded-2xl border border-[#E5E5E5] bg-white text-xs font-black text-[#5F6368] uppercase tracking-widest hover:border-red-400 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
        aria-label="Undo last ball"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        UNDO LAST BALL
      </button>
    </>
  );
}
