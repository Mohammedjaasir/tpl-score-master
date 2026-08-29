import { useState } from "react";
import type { ExtraType, InningsState, WicketInfo } from "@/types/cricket";
import type { DeliveryInput } from "@/lib/scoring/store";
import { WicketModal } from "@/components/scoring/WicketModal";
import { ExtraModal } from "@/components/scoring/ExtraModal";
import { ShotLocationSelectorModal } from "@/components/scoring/ShotLocationSelectorModal";
import type { ShotZoneKey } from "@/lib/scoring/wagon-wheel";
import { TplButton } from "@/components/ui/tpl-button";
import { Compass } from "lucide-react";

type ExtraMode = Exclude<ExtraType, null>;

interface Props {
  innings: InningsState;
  bowlingXI: string[];
  onRecord: (input: DeliveryInput) => void;
  disabled?: boolean;
  /** When disabled, the specific reason: 'bowler' | 'striker' | 'non-striker' | 'innings-complete' */
  disabledReason?: string | null;
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

export function ScoringButtons({ innings, bowlingXI, onRecord, disabled, disabledReason }: Props) {
  const [showWicket, setShowWicket] = useState(false);
  const [extraMode, setExtraMode] = useState<ExtraMode | null>(null);
  const [pendingRuns, setPendingRuns] = useState<number | null>(null);
  const [wagonWheelEnabled, setWagonWheelEnabled] = useState(true);

  const handleRun = (runs: number) => {
    // If Wagon Wheel prompt is enabled and runs is 1, 2, 4, 6, open manual marker modal
    if (wagonWheelEnabled && (runs === 1 || runs === 2 || runs === 4 || runs === 6)) {
      setPendingRuns(runs);
    } else {
      // Immediately record delivery without forcing shot location
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

  const handleTurnOffAndSkip = () => {
    setWagonWheelEnabled(false);
    handleSkipZone();
  };

  const handleWicket = (wicket: WicketInfo) => {
    onRecord({ batterRuns: 0, extraRuns: 0, extraType: null, wicket });
  };

  const handleExtra = (batterRuns: number, extraRuns: number) => {
    if (!extraMode) return;
    onRecord({ batterRuns, extraRuns, extraType: extraMode });
  };

  if (disabled) {
    // Show contextual message based on exact blocking reason
    const isNeedsBowler = disabledReason === "bowler";
    const isInningsComplete = disabledReason === "innings-complete";

    return (
      <div className="rounded-2xl bg-white border border-[#E5E5E5] px-4 py-6 text-center shadow-sm flex flex-col items-center gap-2">
        {isNeedsBowler ? (
          <>
            <div className="h-8 w-8 rounded-full border-4 border-[#D9A928]/30 border-t-[#D9A928] animate-spin mb-1" />
            <p className="text-sm font-extrabold text-[#111111]">
              Select Bowler for Next Over
            </p>
            <p className="text-xs text-[#5F6368] max-w-xs">
              The Bowler Selection panel is opening. Choose the bowler to start the next over.
            </p>
          </>
        ) : isInningsComplete ? (
          <p className="text-sm font-extrabold text-[#5F6368]">
            Innings Complete
          </p>
        ) : (
          <p className="text-sm font-extrabold text-[#5F6368]">
            {disabledReason === "striker"
              ? "Awaiting striker selection"
              : disabledReason === "non-striker"
              ? "Awaiting non-striker selection"
              : "Scoring paused"}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Wagon Wheel Session Quick Toggle Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                wagonWheelEnabled
                  ? "bg-[#D9A928]/20 text-[#9A6A05] border border-[#D9A928]/30"
                  : "bg-[#F3F4F6] text-[#5F6368]"
              }`}
            >
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#111111] block leading-tight">
                WAGON WHEEL
              </span>
              <span className="text-[9px] font-bold text-[#5F6368]">
                {wagonWheelEnabled ? "Prompt on 1, 2, 4, 6 (Skippable)" : "OFF (Fast scoring, no prompts)"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWagonWheelEnabled(!wagonWheelEnabled)}
            className={`tap min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              wagonWheelEnabled
                ? "bg-[#121316] text-[#D9A928] border-2 border-[#D9A928] shadow-xs"
                : "bg-[#F3F4F6] text-[#5F6368] hover:text-[#111111] border border-[#E5E5E5]"
            }`}
            title={wagonWheelEnabled ? "Tap to Turn OFF Wagon Wheel" : "Tap to Turn ON Wagon Wheel"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                wagonWheelEnabled ? "bg-[#D9A928] animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>{wagonWheelEnabled ? "WAGON WHEEL: ON" : "WAGON WHEEL: OFF"}</span>
          </button>
        </div>

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
          onTurnOff={handleTurnOffAndSkip}
        />
      )}
    </>
  );
}

