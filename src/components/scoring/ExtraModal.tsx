import { useState } from "react";
import { X } from "lucide-react";
import type { ExtraType } from "@/types/cricket";

type ExtraMode = Exclude<ExtraType, null>;

interface Props {
  mode: ExtraMode;
  onConfirm: (batterRuns: number, extraRuns: number) => void;
  onClose: () => void;
}

const modeLabels: Record<ExtraMode, string> = {
  wide: "Wide",
  noball: "No Ball",
  bye: "Bye",
  legbye: "Leg Bye",
};

const modeDescriptions: Record<ExtraMode, string> = {
  wide: "Wide = 1 extra. Additional runs scored count as extra runs.",
  noball: "No Ball = 1 extra. Batter can also score runs.",
  bye: "Batter doesn't receive runs. Ball is legal.",
  legbye: "Batter doesn't receive runs. Ball is legal.",
};

export function ExtraModal({ mode, onConfirm, onClose }: Props) {
  const [extraCount, setExtraCount] = useState(0);

  const handleConfirm = () => {
    if (mode === "wide") {
      onConfirm(0, 1 + extraCount);
    } else if (mode === "noball") {
      // For no-ball: batterRuns = extraCount (runs scored off bat), extraRuns = 1 (no-ball penalty)
      onConfirm(extraCount, 1);
    } else {
      // bye/legbye: extraRuns = runs run, batterRuns = 0
      onConfirm(0, extraCount === 0 ? 1 : extraCount);
    }
    onClose();
  };

  const runOptions =
    mode === "wide"
      ? [0, 1, 2, 3, 4]
      : mode === "noball"
        ? [0, 1, 2, 3, 4, 6]
        : [1, 2, 3, 4];

  return (
    <div
      className="fixed inset-0 z-50 glass-overlay flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-3xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60">
          <div>
            <h2 className="font-display text-xl font-extrabold text-foreground uppercase tracking-wider">
              {modeLabels[mode]}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              {modeDescriptions[mode]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="tap grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            {mode === "wide" ? "Additional runs (beyond the 1 wide)" : mode === "noball" ? "Batter runs scored" : "Runs run"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {runOptions.map((r) => (
              <button
                key={r}
                onClick={() => setExtraCount(r)}
                className={`tap btn-score min-h-14 rounded-2xl ${
                  extraCount === r
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8 border-t border-border/60 pt-4">
          <button
            onClick={handleConfirm}
            className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)]"
          >
            Confirm {modeLabels[mode]}
          </button>
        </div>
      </div>
    </div>
  );
}
