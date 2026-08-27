import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface Props {
  onUndo: () => void;
  canUndo: boolean;
}

export function UndoBar({ onUndo, canUndo }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!canUndo) return null;

  return (
    <>
      {confirming && (
        <div
          className="fixed inset-0 z-50 glass-overlay flex items-end justify-center"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-md animate-slide-up rounded-t-3xl bg-background p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-base font-extrabold text-foreground mb-1">
              Undo last ball?
            </p>
            <p className="text-center text-sm text-muted-foreground mb-6">
              This will restore the previous scoring state.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="tap flex-1 min-h-12 rounded-full bg-secondary text-sm font-extrabold text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUndo();
                  setConfirming(false);
                }}
                className="tap flex-1 min-h-12 rounded-full bg-primary text-sm font-extrabold text-primary-foreground"
              >
                Undo
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setConfirming(true)}
        className="tap flex w-full items-center justify-center gap-2 min-h-11 rounded-full border border-border bg-background text-xs font-extrabold text-muted-foreground uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-colors"
        aria-label="Undo last ball"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Undo Last Ball
      </button>
    </>
  );
}
