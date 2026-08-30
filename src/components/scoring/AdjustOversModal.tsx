import { useState, useEffect } from "react";
import { CloudRain, X, Check, Plus, Minus, AlertTriangle, ShieldAlert } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentOvers: number;
  originalOvers: number;
  completedLegalBalls?: number;
  oversText?: string;
  isChase: boolean;
  onApply: (newOvers: number, reason: string) => void;
}

export function AdjustOversModal({
  isOpen,
  onClose,
  currentOvers,
  originalOvers,
  completedLegalBalls = 0,
  oversText = "0.0",
  isChase,
  onApply,
}: Props) {
  const [inputValue, setInputValue] = useState<string>(String(currentOvers));
  const [reason, setReason] = useState<string>("REDUCED OVERS");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever modal opens or currentOvers changes
  useEffect(() => {
    if (isOpen) {
      setInputValue(String(currentOvers));
      setErrorMessage(null);
    }
  }, [isOpen, currentOvers]);

  if (!isOpen) return null;

  const currentCompletedOvers = Math.floor(completedLegalBalls / 6);
  const isOverInProgress = completedLegalBalls % 6 !== 0;

  // Validate the entered input string
  const validateOvers = (val: string): { isValid: boolean; numVal: number; error: string | null } => {
    const trimmed = val.trim();
    if (trimmed === "") {
      return { isValid: false, numVal: 0, error: "Please enter the number of overs." };
    }

    // Check for decimals or non-digit characters
    if (!/^\d+$/.test(trimmed)) {
      if (trimmed.includes(".")) {
        return { isValid: false, numVal: 0, error: "Decimals are not allowed. Enter a whole number of overs." };
      }
      if (trimmed.startsWith("-")) {
        return { isValid: false, numVal: 0, error: "Negative numbers are not allowed. Overs must be 1 or more." };
      }
      return { isValid: false, numVal: 0, error: "Please enter a valid numeric value." };
    }

    const num = Number(trimmed);
    if (!Number.isInteger(num)) {
      return { isValid: false, numVal: 0, error: "Overs must be a whole number." };
    }

    if (num < 1) {
      return { isValid: false, numVal: num, error: "Match overs cannot be 0. Minimum is 1 over." };
    }

    if (num > 100) {
      return { isValid: false, numVal: num, error: "Maximum supported overs is 100." };
    }

    return { isValid: true, numVal: num, error: null };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    const { error } = validateOvers(nextVal);
    setErrorMessage(error);
  };

  const handleIncrement = () => {
    const { isValid, numVal } = validateOvers(inputValue);
    const base = isValid ? numVal : currentOvers;
    const next = Math.min(100, base + 1);
    setInputValue(String(next));
    setErrorMessage(null);
  };

  const handleDecrement = () => {
    const { isValid, numVal } = validateOvers(inputValue);
    const base = isValid ? numVal : currentOvers;
    const next = Math.max(1, base - 1);
    setInputValue(String(next));
    setErrorMessage(null);
  };

  const handleSave = () => {
    const { isValid, numVal, error } = validateOvers(inputValue);
    if (!isValid) {
      setErrorMessage(error || "Invalid overs input.");
      return;
    }

    onApply(numVal, reason);
    onClose();
  };

  const parsedValidation = validateOvers(inputValue);
  const parsedOvers = parsedValidation.isValid ? parsedValidation.numVal : null;
  const isReducingBelowProgress =
    parsedOvers !== null &&
    (parsedOvers < currentCompletedOvers || (parsedOvers === currentCompletedOvers && isOverInProgress));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-6 w-full max-w-sm text-[#111111] shadow-2xl overflow-hidden animate-scale-up flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#D9A928]/15 text-[#9A6A05] flex items-center justify-center font-black">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide text-[#111111]">
                Adjust Match Overs
              </h3>
              <p className="text-[11px] text-[#5F6368] font-bold">
                Weather & Match Configuration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap h-9 w-9 rounded-full bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-center text-[#5F6368] hover:text-[#111111]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current State Info Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-bold">
          <div>
            <span className="text-[#5F6368] text-[10px] uppercase block tracking-wider font-extrabold">Current Match Overs</span>
            <span className="text-sm font-black text-[#111111]">{originalOvers} Overs</span>
            {currentOvers !== originalOvers && (
              <span className="text-[10px] font-bold text-[#9A6A05] block mt-0.5">
                Active Limit: {currentOvers} ov (Revised)
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-[#5F6368] text-[10px] uppercase block tracking-wider font-extrabold">Match Progress</span>
            <span className="text-xs font-black text-[#111111]">{oversText} ov ({completedLegalBalls} balls)</span>
          </div>
        </div>

        {/* Overs Numeric Input Control */}
        <div className="flex flex-col gap-2">
          <label htmlFor="adjust-match-overs-input" className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">
            {isChase ? "Second Innings Revised Overs" : "Revised Match Overs"}
          </label>

          <div className="flex items-center gap-2">
            {/* Decrement Button */}
            <button
              type="button"
              onClick={handleDecrement}
              className="tap min-h-[48px] h-12 w-12 rounded-2xl bg-[#F7F7F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#111111] font-black flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Decrease overs"
            >
              <Minus className="h-5 w-5 stroke-[2.5]" />
            </button>

            {/* Direct Typing Input */}
            <div className="relative flex-1">
              <input
                id="adjust-match-overs-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={handleInputChange}
                className={`min-h-[48px] h-12 w-full text-center text-xl font-black rounded-2xl border-2 transition-all outline-none bg-white text-[#111111] ${
                  errorMessage
                    ? "border-red-500 bg-red-50/30 text-red-700 focus:border-red-600"
                    : "border-[#E5E5E5] focus:border-[#D9A928] focus:ring-2 focus:ring-[#D9A928]/20"
                }`}
                placeholder="Overs"
                autoComplete="off"
              />
            </div>

            {/* Increment Button */}
            <button
              type="button"
              onClick={handleIncrement}
              className="tap min-h-[48px] h-12 w-12 rounded-2xl bg-[#F7F7F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#111111] font-black flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Increase overs"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Validation Error */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold animate-fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Warning Banner if reducing below match progress */}
          {isReducingBelowProgress && !errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium animate-fade-in">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">Reduced Below Current Progress</p>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Match has already progressed to <span className="font-bold">{oversText} overs</span>. Reducing to <span className="font-bold">{parsedOvers} overs</span> will conclude the innings. Existing deliveries and scores will be safely preserved.
                </p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-[#5F6368] font-medium leading-relaxed">
            {isChase
              ? "Target will be automatically recalculated using Average Run Rate (ARR)."
              : "Both teams will play equal revised overs. Allows custom values such as 3, 7, 10, 15, 20."}
          </p>
        </div>

        {/* Condition Reason */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="adjust-match-reason-select" className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">
            Interruption / Revision Reason
          </label>
          <select
            id="adjust-match-reason-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[44px] h-11 w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3 text-xs font-bold text-[#111111] focus:outline-none focus:border-[#D9A928] focus:ring-1 focus:ring-[#D9A928]"
          >
            <option value="REDUCED OVERS">REDUCED OVERS — Weather / Time Constraint</option>
            <option value="RAIN DELAY">RAIN DELAY — Rain Interruption</option>
            <option value="RAIN RESUMED">RAIN RESUMED — Play Resumed</option>
            <option value="TOURNAMENT ADJUSTMENT">TOURNAMENT ADJUSTMENT — Custom Overs</option>
            <option value="NORMAL">NORMAL — Regular Format</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={onClose}
            className="tap min-h-[48px] flex-1 py-3 rounded-2xl bg-[#F7F7F5] hover:bg-[#E5E5E5] text-xs font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={Boolean(errorMessage)}
            className="tap min-h-[48px] flex-1 py-3 rounded-2xl bg-[#D9A928] hover:bg-[#F4C542] disabled:opacity-50 disabled:pointer-events-none text-xs font-black uppercase tracking-wider text-[#111111] shadow-md shadow-[#D9A928]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>Apply Overs</span>
          </button>
        </div>
      </div>
    </div>
  );
}
