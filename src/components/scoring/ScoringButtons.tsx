import { useState } from "react";
import type { ExtraType, InningsState, WicketInfo } from "@/types/cricket";
import type { DeliveryInput } from "@/lib/scoring/store";
import { WicketModal } from "@/components/scoring/WicketModal";
import { ExtraModal } from "@/components/scoring/ExtraModal";

type ExtraMode = Exclude<ExtraType, null>;

interface Props {
  innings: InningsState;
  bowlingXI: string[];
  onRecord: (input: DeliveryInput) => void;
  disabled?: boolean;
}

// Run buttons config
const RUN_BUTTONS = [
  { runs: 0, label: "0", cls: "bg-secondary text-foreground" },
  { runs: 1, label: "1", cls: "bg-secondary text-foreground" },
  { runs: 2, label: "2", cls: "bg-secondary text-foreground" },
  { runs: 3, label: "3", cls: "bg-secondary text-foreground" },
  { runs: 4, label: "4", cls: "bg-warning/15 text-amber-800 border border-warning/30" },
  { runs: 6, label: "6", cls: "bg-success/15 text-green-800 border border-success/30" },
];

const EXTRA_BUTTONS: { mode: ExtraMode; label: string; cls: string }[] = [
  { mode: "wide", label: "WD", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  { mode: "noball", label: "NB", cls: "bg-orange-50 text-orange-700 border border-orange-200" },
  { mode: "bye", label: "BYE", cls: "bg-purple-50 text-purple-700 border border-purple-200" },
  { mode: "legbye", label: "LB", cls: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
];

export function ScoringButtons({ innings, bowlingXI, onRecord, disabled }: Props) {
  const [showWicket, setShowWicket] = useState(false);
  const [extraMode, setExtraMode] = useState<ExtraMode | null>(null);

  const handleRun = (runs: number) => {
    onRecord({ batterRuns: runs, extraRuns: 0, extraType: null });
  };

  const handleWicket = (wicket: WicketInfo) => {
    onRecord({ batterRuns: 0, extraRuns: 0, extraType: null, wicket });
  };

  const handleExtra = (batterRuns: number, extraRuns: number) => {
    if (!extraMode) return;
    onRecord({ batterRuns, extraRuns, extraType: extraMode });
  };

  if (disabled) {
    return (
      <div className="rounded-2xl bg-muted/60 px-4 py-6 text-center">
        <p className="text-sm font-bold text-muted-foreground">
          Select a bowler to continue scoring
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Run buttons */}
        <div className="grid grid-cols-3 gap-3">
          {RUN_BUTTONS.map((b) => (
            <button
              key={b.runs}
              onClick={() => handleRun(b.runs)}
              className={`btn-score ${b.cls} min-h-16 text-3xl`}
              aria-label={`${b.label} run${b.runs !== 1 ? "s" : ""}`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Wicket button — prominent */}
        <button
          onClick={() => setShowWicket(true)}
          className="btn-score w-full min-h-16 bg-primary text-primary-foreground shadow-[var(--shadow-pop)] text-3xl rounded-2xl"
          aria-label="Wicket"
        >
          W
        </button>

        {/* Extras row */}
        <div className="grid grid-cols-4 gap-2">
          {EXTRA_BUTTONS.map((b) => (
            <button
              key={b.mode}
              onClick={() => setExtraMode(b.mode)}
              className={`btn-score ${b.cls} min-h-12 text-lg rounded-2xl`}
              aria-label={b.label}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showWicket && (
        <WicketModal
          innings={innings}
          bowlingXI={bowlingXI}
          onConfirm={handleWicket}
          onClose={() => setShowWicket(false)}
        />
      )}
      {extraMode && (
        <ExtraModal
          mode={extraMode}
          onConfirm={handleExtra}
          onClose={() => setExtraMode(null)}
        />
      )}
    </>
  );
}
