import { useState } from "react";
import { X } from "lucide-react";
import { lookup } from "@/lib/repositories";
import { oversText } from "@/lib/scoring/engine";
import type { BowlerStat } from "@/types/cricket";

interface Props {
  bowlingXI: string[];
  bowlers: BowlerStat[];
  previousBowlerId?: string;
  currentBowlerId?: string;
  onSelect: (id: string) => void;
  onClose?: () => void;
  isOverEnd: boolean;
}

export function BowlerModal({
  bowlingXI,
  bowlers,
  previousBowlerId,
  currentBowlerId,
  onSelect,
  onClose,
  isOverEnd,
}: Props) {
  const [selected, setSelected] = useState(currentBowlerId ?? "");

  const statOf = (id: string) => bowlers.find((b) => b.playerId === id);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose?.();
    }
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
          <div>
            <h2 className="font-display text-xl font-extrabold text-foreground uppercase tracking-wider">
              {isOverEnd ? "Select Bowler" : "Opening Bowler"}
            </h2>
            {isOverEnd && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Over complete — choose next bowler
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="tap grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[60vh] px-6 py-4 flex flex-col gap-2">
          {bowlingXI.map((id) => {
            const player = lookup.player(id);
            const stat = statOf(id);
            const isCurrent = id === currentBowlerId;
            // Prevent same bowler bowling consecutive overs
            const isLocked = isOverEnd && id === previousBowlerId;

            return (
              <button
                key={id}
                disabled={isLocked}
                onClick={() => setSelected(id)}
                className={`tap flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-colors ${
                  selected === id
                    ? "border-primary bg-primary/5"
                    : isLocked
                      ? "border-border/40 bg-muted/40 opacity-50 cursor-not-allowed"
                      : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-xs font-extrabold text-foreground">
                  {player?.shortName?.charAt(0) ?? "?"}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-foreground">
                    {player?.name ?? id}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {player?.role}
                    {isLocked ? " · Previous over" : ""}
                  </p>
                </div>
                {stat && (
                  <div className="shrink-0 text-right text-xs text-muted-foreground tabular-nums font-bold">
                    <p>{oversText(stat.legalBalls)} ov</p>
                    <p>{stat.runs}r {stat.wickets}w</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-8 pt-4 border-t border-border/60">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-foreground text-sm font-extrabold uppercase tracking-widest text-background disabled:opacity-40"
          >
            Confirm Bowler
          </button>
        </div>
      </div>
    </div>
  );
}
