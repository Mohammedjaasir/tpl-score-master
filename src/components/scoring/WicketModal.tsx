import { useState } from "react";
import { X } from "lucide-react";
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
  const [type, setType] = useState<DismissalType>("Bowled");
  const [fielderId, setFielderId] = useState("");
  const [newBatterId, setNewBatterId] = useState(innings.yetToBat[0] ?? "");

  const needsFielder = NEEDS_FIELDER.includes(type);
  const inningsOver = innings.yetToBat.length === 0;

  const handleConfirm = () => {
    if (!dismissedId || !type) return;
    const wicket: WicketInfo = {
      type,
      batterOutId: dismissedId,
      ...(needsFielder && fielderId ? { fielderId } : {}),
      ...(inningsOver ? {} : { newBatterId: newBatterId || undefined }),
    };
    onConfirm(wicket);
    onClose();
  };

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
          <h2 className="font-display text-2xl font-extrabold text-primary uppercase tracking-wider">
            Wicket
          </h2>
          <button
            onClick={onClose}
            className="tap grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-6 py-4 flex flex-col gap-4">
          {/* Dismissed batter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Dismissed Batter
            </label>
            <div className="flex flex-col gap-2">
              {activeBatters.map((b) => {
                const p = lookup.player(b.playerId);
                return (
                  <button
                    key={b.playerId}
                    onClick={() => setDismissedId(b.playerId)}
                    className={`tap flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-colors ${
                      dismissedId === b.playerId
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <span className="text-sm font-bold text-foreground">{p?.name ?? "—"}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Dismissal Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DISMISSAL_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => setType(d)}
                  className={`tap rounded-xl px-3 py-2.5 text-sm font-bold border-2 transition-colors ${
                    type === d
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Fielder (for caught, run out, stumped) */}
          {needsFielder && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Fielder
              </label>
              <select
                value={fielderId}
                onChange={(e) => setFielderId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select fielder</option>
                {bowlingXI.map((id) => {
                  const p = lookup.player(id);
                  return (
                    <option key={id} value={id}>
                      {p?.name ?? id}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* New batter */}
          {!inningsOver && innings.yetToBat.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                New Batter
              </label>
              <div className="flex flex-col gap-1.5">
                {innings.yetToBat.map((id) => {
                  const p = lookup.player(id);
                  return (
                    <button
                      key={id}
                      onClick={() => setNewBatterId(id)}
                      className={`tap flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-colors ${
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
            <p className="text-center text-sm text-muted-foreground font-bold py-2">
              No more batters — innings will end.
            </p>
          )}
        </div>

        {/* Confirm */}
        <div className="px-6 pb-8 pt-4 border-t border-border/60">
          <button
            onClick={handleConfirm}
            disabled={!dismissedId || !type}
            className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-base font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Wicket
          </button>
        </div>
      </div>
    </div>
  );
}
