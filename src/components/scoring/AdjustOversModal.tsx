import { useState } from "react";
import { CloudRain, X, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentOvers: number;
  originalOvers: number;
  isChase: boolean;
  onApply: (newOvers: number, reason: string) => void;
}

export function AdjustOversModal({
  isOpen,
  onClose,
  currentOvers,
  originalOvers,
  isChase,
  onApply,
}: Props) {
  const [overs, setOvers] = useState<number>(currentOvers);
  const [reason, setReason] = useState<string>("Rain Delay");

  if (!isOpen) return null;

  const handleSave = () => {
    if (overs > 0 && overs <= originalOvers) {
      onApply(overs, reason);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#18191C] border border-white/15 rounded-3xl p-6 w-full max-w-sm text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <CloudRain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide">Adjust Match Overs</h3>
              <p className="text-[10px] text-white/50 font-bold uppercase">Official Weather / Delay Rule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70 mb-1">
              {isChase ? "Second Innings Revised Overs" : "Both Teams Revised Overs"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={originalOvers}
                value={overs}
                onChange={(e) => setOvers(Math.max(1, Math.min(originalOvers, Number(e.target.value))))}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-[#D9A928]"
              />
              <span className="text-xs font-bold text-white/50">/ {originalOvers} ov</span>
            </div>
            <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed">
              {isChase
                ? "Target will be automatically recalculated using Average Run Rate (ARR)."
                : "Both teams will play equal revised overs. No target recalculation."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D9A928]"
            >
              <option value="Rain Delay">Rain Delay</option>
              <option value="Unavoidable Delay">Unavoidable Delay</option>
              <option value="Match Time Restriction">Match Time Restriction</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#D9A928] text-xs font-black text-black hover:bg-[#c49822] transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Apply Overs
          </button>
        </div>
      </div>
    </div>
  );
}
