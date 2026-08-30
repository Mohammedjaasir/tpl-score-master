import { useState } from "react";
import { X, AlertCircle, ShieldAlert } from "lucide-react";
import type { InningsState, DismissalType, WicketInfo } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

const DISMISSAL_TYPES: DismissalType[] = [
  "Bowled",
  "Caught",
  "LBW",
  "Run Out",
  "Stumped",
  "Hit Wicket",
  "Retired Hurt",
  "Retired Out",
  "Timed Out",
  "Other",
];

const NEEDS_FIELDER: DismissalType[] = ["Caught", "Run Out", "Stumped"];

interface Props {
  innings: InningsState;
  bowlingXI: string[];
  onConfirm: (wicket: WicketInfo) => void;
  onClose: () => void;
}

export function WicketModal({ innings, bowlingXI, onConfirm, onClose }: Props) {
  const activeBatters = innings.batters.filter((b) => !b.out);
  const striker = activeBatters.find((b) => b.playerId === innings.strikerId);

  const [dismissedId, setDismissedId] = useState(striker?.playerId ?? activeBatters[0]?.playerId ?? "");
  const [type, setType] = useState<DismissalType>("Caught");
  const [fielderId, setFielderId] = useState("");

  const needsFielder = NEEDS_FIELDER.includes(type);

  // Robust eligible batters calculation
  const battingTeamPlayers = lookup.playersOf(innings.battingTeamId).map((p) => p.id);
  const baseBatters = innings.yetToBat.length > 0 ? innings.yetToBat : battingTeamPlayers;
  const dismissedIds = new Set(innings.batters.filter((b) => b.out).map((b) => b.playerId));
  if (dismissedId) dismissedIds.add(dismissedId);
  const onCreaseIds = new Set(activeBatters.map((b) => b.playerId).filter((id) => id !== dismissedId));

  const eligibleBatters = baseBatters.filter((id) => !dismissedIds.has(id) && !onCreaseIds.has(id));

  const [newBatterId, setNewBatterId] = useState(eligibleBatters[0] ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inningsOver = eligibleBatters.length === 0;

  // Validation: For Caught, Run Out, Stumped, fielder is STRICTLY mandatory
  const isFielderMissing = needsFielder && (!fielderId || fielderId.trim() === "");
  const isConfirmDisabled = !dismissedId || !type || isFielderMissing;

  const handleConfirm = () => {
    setErrorMessage(null);

    if (!dismissedId) {
      setErrorMessage("BATTER REQUIRED: Please select the dismissed batter.");
      return;
    }

    if (!type) {
      setErrorMessage("DISMISSAL TYPE REQUIRED: Please select the dismissal type.");
      return;
    }

    // STRICT MULTI-LEVEL VALIDATION: Caught / Run Out / Stumped must have an explicit fielder
    if (needsFielder && (!fielderId || fielderId.trim() === "")) {
      const label = type === "Caught" ? "who took the catch" : type === "Stumped" ? "who completed the stumping" : "who executed the run out";
      setErrorMessage(`FIELDER REQUIRED: Please select the fielder ${label}.`);
      return;
    }

    const wicket: WicketInfo = {
      type,
      batterOutId: dismissedId,
      ...(needsFielder ? { fielderId } : {}),
      ...(inningsOver ? {} : { newBatterId: newBatterId || undefined }),
    };

    onConfirm(wicket);
    onClose();
  };

  const handleTypeChange = (newType: DismissalType) => {
    setType(newType);
    setErrorMessage(null);
    if (!NEEDS_FIELDER.includes(newType)) {
      setFielderId("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 glass-overlay flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-3xl bg-background border-t border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-primary uppercase tracking-wider">
              Wicket Dismissal
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              Official Match Scoring
            </p>
          </div>
          <button
            onClick={onClose}
            className="tap grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center gap-2.5 text-destructive animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-black uppercase tracking-wide">{errorMessage}</p>
          </div>
        )}

        <div className="overflow-y-auto max-h-[65vh] px-6 py-4 flex flex-col gap-4">
          {/* Dismissed batter */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Dismissed Batter <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {activeBatters.map((b) => {
                const p = lookup.player(b.playerId);
                return (
                  <button
                    key={b.playerId}
                    onClick={() => {
                      setDismissedId(b.playerId);
                      setErrorMessage(null);
                    }}
                    className={`tap flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-colors ${
                      dismissedId === b.playerId
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <span className="text-sm font-bold text-foreground">{p?.name ?? "—"}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums font-bold">
                      {b.runs} ({b.balls})
                      {b.playerId === innings.strikerId ? " *" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dismissal type */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Dismissal Type <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DISMISSAL_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => handleTypeChange(d)}
                  className={`tap rounded-xl px-3 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider border-2 transition-colors ${
                    type === d
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Fielder (for CAUGHT, RUN OUT, STUMPED) — STRICTLY MANDATORY */}
          {needsFielder && (
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  FIELDER <span className="text-destructive font-black">*</span>
                </label>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                  Required
                </span>
              </div>

              <select
                value={fielderId}
                onChange={(e) => {
                  setFielderId(e.target.value);
                  setErrorMessage(null);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-bold text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                  !fielderId ? "border-destructive/60 bg-destructive/5" : "border-border"
                }`}
              >
                <option value="">-- Select Fielder (Mandatory) --</option>
                {bowlingXI.map((id) => {
                  const p = lookup.player(id);
                  return (
                    <option key={id} value={id}>
                      {p?.name ?? id} ({p?.role ?? "Fielder"})
                    </option>
                  );
                })}
              </select>

              {!fielderId && (
                <p className="text-[10px] font-bold text-destructive flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="h-3 w-3 shrink-0" />
                  <span>Must select the fielder to confirm {type.toLowerCase()} dismissal.</span>
                </p>
              )}
            </div>
          )}

          {/* New batter */}
          {!inningsOver && eligibleBatters.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Next Batter In
              </label>
              <div className="flex flex-col gap-1.5">
                {eligibleBatters.map((id) => {
                  const p = lookup.player(id);
                  return (
                    <button
                      key={id}
                      onClick={() => setNewBatterId(id)}
                      className={`tap flex items-center gap-3 rounded-xl px-4 py-2.5 border-2 transition-colors ${
                        newBatterId === id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <span className="text-sm font-bold text-foreground">{p?.name ?? id}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{p?.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {inningsOver && (
            <p className="text-center text-xs text-muted-foreground font-black uppercase tracking-wider py-2">
              All out / No more batters — Innings will conclude.
            </p>
          )}
        </div>

        {/* Confirm Action */}
        <div className="px-6 pb-8 pt-4 border-t border-border/60 flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-base font-extrabold uppercase tracking-widest text-primary-foreground shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Confirm Wicket
          </button>
          {isFielderMissing && (
            <p className="text-[10px] text-center font-black uppercase tracking-wider text-destructive">
              Select a fielder above to enable confirmation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
