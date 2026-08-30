import { useState } from "react";
import { Edit3, X, Check, AlertCircle } from "lucide-react";
import type { Delivery, ExtraType, DismissalType, WicketInfo } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

interface Props {
  delivery: Delivery;
  bowlingXI: string[];
  battingXI: string[];
  onSave: (deliveryId: string, updated: Partial<Delivery>, auditNote?: string) => void;
  onClose: () => void;
}

const DISMISSAL_TYPES: DismissalType[] = [
  "Bowled",
  "Caught",
  "LBW",
  "Run Out",
  "Stumped",
  "Hit Wicket",
  "Retired Hurt",
  "Retired Out",
];

export function EditBallModal({
  delivery,
  bowlingXI,
  battingXI,
  onSave,
  onClose,
}: Props) {
  const [batterRuns, setBatterRuns] = useState<number>(delivery.batterRuns ?? 0);
  const [extraRuns, setExtraRuns] = useState<number>(delivery.extraRuns ?? 0);
  const [extraType, setExtraType] = useState<ExtraType>(delivery.extraType ?? null);
  const [isWicket, setIsWicket] = useState<boolean>(!!delivery.wicket);
  const [wicketType, setWicketType] = useState<DismissalType>(delivery.wicket?.type ?? "Caught");
  const [fielderId, setFielderId] = useState<string>(delivery.wicket?.fielderId ?? "");
  const [batterOutId, setBatterOutId] = useState<string>(delivery.wicket?.batterOutId ?? delivery.strikerId);
  const [strikerId, setStrikerId] = useState<string>(delivery.strikerId);
  const [bowlerId, setBowlerId] = useState<string>(delivery.bowlerId);
  const [error, setError] = useState<string | null>(null);

  const needsFielder = isWicket && (wicketType === "Caught" || wicketType === "Run Out" || wicketType === "Stumped");

  const handleSave = () => {
    setError(null);

    if (isWicket && needsFielder && (!fielderId || fielderId.trim() === "")) {
      setError(`Fielder selection is mandatory for ${wicketType} dismissal.`);
      return;
    }

    let wicket: WicketInfo | undefined = undefined;
    if (isWicket) {
      wicket = {
        type: wicketType,
        batterOutId: batterOutId || strikerId,
        ...(needsFielder ? { fielderId } : {}),
      };
    }

    const updated: Partial<Delivery> = {
      batterRuns,
      extraRuns: extraType ? Math.max(1, extraRuns) : 0,
      extraType,
      strikerId,
      bowlerId,
      wicket,
    };

    const originalDesc = `${delivery.batterRuns}r ${delivery.extraType ? `(${delivery.extraType})` : ""}${delivery.wicket ? " W" : ""}`;
    const newDesc = `${batterRuns}r ${extraType ? `(${extraType})` : ""}${isWicket ? " W" : ""}`;
    const auditNote = `Corrected delivery from [${originalDesc.trim()}] to [${newDesc.trim()}]`;

    onSave(delivery.id, updated, auditNote);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 glass-overlay flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white border-t border-[#E5E5E5] p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#D9A928]/15 text-[#9A6A05] flex items-center justify-center border border-[#D9A928]/30">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-[#111111]">
                CORRECT DELIVERY
              </p>
              <p className="text-[10px] text-[#5F6368] font-bold uppercase">
                Ball ID: {delivery.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tap h-8 w-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[#5F6368] hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 text-xs">
          {/* Batter Runs */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1.5">
              Runs off Bat
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setBatterRuns(r)}
                  className={`tap min-h-11 rounded-xl text-sm font-black transition-all ${
                    batterRuns === r
                      ? "bg-[#111111] text-[#D9A928] border-2 border-[#D9A928] shadow-xs"
                      : "bg-[#F7F7F5] text-[#111111] border border-[#E5E5E5]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1.5">
              Extra Type
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { type: null, label: "None" },
                { type: "wide", label: "WD" },
                { type: "noball", label: "NB" },
                { type: "bye", label: "Bye" },
                { type: "legbye", label: "LB" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setExtraType(item.type as ExtraType);
                    if (item.type && extraRuns === 0) setExtraRuns(1);
                  }}
                  className={`tap min-h-10 rounded-xl text-xs font-black uppercase transition-all ${
                    extraType === item.type
                      ? "bg-[#111111] text-[#D9A928] border-2 border-[#D9A928] shadow-xs"
                      : "bg-[#F7F7F5] text-[#5F6368] border border-[#E5E5E5]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wicket Section */}
          <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#111111]">
                Wicket on this ball?
              </label>
              <button
                type="button"
                onClick={() => setIsWicket(!isWicket)}
                className={`tap px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  isWicket
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-[#5F6368] border border-[#E5E5E5]"
                }`}
              >
                {isWicket ? "WICKET: YES" : "WICKET: NO"}
              </button>
            </div>

            {isWicket && (
              <div className="flex flex-col gap-3 pt-2 border-t border-[#E5E5E5]">
                {/* Dismissal type */}
                <div>
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block mb-1">
                    Dismissal Type
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DISMISSAL_TYPES.map((dt) => (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => setWicketType(dt)}
                        className={`tap p-2 rounded-xl text-left text-xs font-black transition-all ${
                          wicketType === dt
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-white text-[#111111] border border-[#E5E5E5]"
                        }`}
                      >
                        {dt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fielder if caught/runout/stumped */}
                {needsFielder && (
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase block mb-1">
                      Fielder (Mandatory) *
                    </span>
                    <select
                      value={fielderId}
                      onChange={(e) => setFielderId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-red-300 text-xs font-bold text-[#111111] focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">-- Choose Fielder --</option>
                      {bowlingXI.map((pId) => {
                        const p = lookup.player(pId);
                        return (
                          <option key={pId} value={pId}>
                            {p?.name ?? pId}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="tap flex-1 min-h-12 rounded-2xl bg-[#F7F7F5] hover:bg-[#E5E5E5] text-xs font-black uppercase tracking-wider text-[#111111] border border-[#E5E5E5]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="tap flex-1 min-h-12 rounded-2xl bg-[#D9A928] hover:bg-[#F4C542] text-xs font-black uppercase tracking-wider text-[#111111] shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Apply Correction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
