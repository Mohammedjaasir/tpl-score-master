import { useState } from "react";
import type { ExtraType, InningsState, WicketInfo } from "@/types/cricket";
import type { DeliveryInput } from "@/lib/scoring/store";
import { WicketModal } from "@/components/scoring/WicketModal";
import { ExtraModal } from "@/components/scoring/ExtraModal";
import { ShotLocationSelectorModal } from "@/components/scoring/ShotLocationSelectorModal";
import type { ShotZoneKey } from "@/lib/scoring/wagon-wheel";
import { TplButton } from "@/components/ui/tpl-button";

type ExtraMode = Exclude<ExtraType, null>;

interface Props {
  innings: InningsState;
  bowlingXI: string[];
  onRecord: (input: DeliveryInput) => void;
  disabled?: boolean;
}

// Run buttons config with official TPL palette
const RUN_BUTTONS = [
  { runs: 0, label: "0", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { runs: 1, label: "1", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { runs: 2, label: "2", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { runs: 3, label: "3", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { runs: 4, label: "4", cls: "bg-[#D9A928]/15 hover:bg-[#D9A928]/25 text-[#9A6A05] border-2 border-[#D9A928] shadow-sm font-black" },
  { runs: 6, label: "6", cls: "bg-[#D9A928] hover:bg-[#F4C542] text-[#111111] shadow-[0_4px_16px_rgba(217,169,40,0.3)] font-black" },
];

const EXTRA_BUTTONS: { mode: ExtraMode; label: string; cls: string }[] = [
  { mode: "wide", label: "WD", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { mode: "noball", label: "NB", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { mode: "bye", label: "BYE", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
  { mode: "legbye", label: "LB", cls: "bg-white hover:bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5] shadow-sm" },
];

export function ScoringButtons({ innings, bowlingXI, onRecord, disabled }: Props) {
  const [showWicket, setShowWicket] = useState(false);
  const [extraMode, setExtraMode] = useState<ExtraMode | null>(null);
  const [pendingRuns, setPendingRuns] = useState<number | null>(null);

  const handleRun = (runs: number) => {
    // Only 1, 2, 4, 6 trigger the Wagon Wheel manual marker per lead requirement
    if (runs === 1 || runs === 2 || runs === 4 || runs === 6) {
      setPendingRuns(runs);
    } else {
      onRecord({ batterRuns: runs, extraRuns: 0, extraType: null, shotZone: "unmapped" });
    }
  };

  const handleConfirmZone = (zone: ShotZoneKey) => {
    if (pendingRuns !== null) {
      onRecord({ batterRuns: pendingRuns, extraRuns: 0, extraType: null, shotZone: zone });
      setPendingRuns(null);
    }
  };

  const handleSkipZone = () => {
    if (pendingRuns !== null) {
      onRecord({ batterRuns: pendingRuns, extraRuns: 0, extraType: null, shotZone: "unmapped" });
      setPendingRuns(null);
    }
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
      <div className="rounded-2xl bg-white border border-[#E5E5E5] px-4 py-6 text-center shadow-sm">
        <p className="text-sm font-extrabold text-[#5F6368]">
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
              className={`btn-score ${b.cls} min-h-16 text-3xl rounded-2xl`}
              aria-label={`${b.label} run${b.runs !== 1 ? "s" : ""}`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Wicket button — Official TPL Danger Button */}
        <TplButton
          variant="danger"
          size="lg"
          fullWidth
          onClick={() => setShowWicket(true)}
          className="min-h-16 text-2xl font-black rounded-2xl"
          aria-label="Wicket"
        >
          WICKET
        </TplButton>

        {/* Extras row */}
        <div className="grid grid-cols-4 gap-2">
          {EXTRA_BUTTONS.map((b) => (
            <button
              key={b.mode}
              onClick={() => setExtraMode(b.mode)}
              className={`btn-score ${b.cls} min-h-12 text-sm font-extrabold rounded-xl`}
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
      {pendingRuns !== null && (
        <ShotLocationSelectorModal
          isOpen={pendingRuns !== null}
          runLabel={`${pendingRuns} Runs`}
          onSelectZone={handleConfirmZone}
          onSkip={handleSkipZone}
        />
      )}
    </>
  );
}
