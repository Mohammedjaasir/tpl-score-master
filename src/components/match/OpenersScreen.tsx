import { useState } from "react";
import type { Match } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";

interface Props {
  match: Match;
  store: MatchStore;
  /** Whether this is the 2nd innings openers selection */
  secondInnings?: boolean;
  /** When true, don't render the sticky header / page wrapper */
  embedded?: boolean;
}

function OpenersList({
  battingXI,
  label,
  value,
  disabledId,
  onSelect,
}: {
  battingXI: string[];
  label: string;
  value: string;
  disabledId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
        {label}
      </p>
      <div className="card-surface divide-y divide-border/50">
        {battingXI.map((id) => {
          const p = lookup.player(id);
          const isDisabled = id === disabledId;
          const isSelected = id === value;
          return (
            <button
              key={id}
              disabled={isDisabled}
              onClick={() => onSelect(id)}
              className={`tap w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                isSelected ? "bg-primary/5" : ""
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {isSelected ? "✓" : p?.shortName?.charAt(0) ?? "?"}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-foreground">{p?.name ?? id}</p>
                <p className="text-[10px] text-muted-foreground">{p?.role}</p>
              </div>
              {isSelected && (
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest shrink-0">
                  {label.split(" ")[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OpenersScreen({ match, store, secondInnings = false, embedded = false }: Props) {
  const { doc, updateSetup, startSecondInnings } = store;
  const setup = doc.setup;

  const battingTeamId = secondInnings
    ? (setup.battingFirstId === match.teamAId ? match.teamBId : match.teamAId)
    : (setup.battingFirstId ?? match.teamAId);

  const battingXI = setup.playingXI[battingTeamId]?.playerIds ?? [];
  const existingOpeners = secondInnings ? doc.secondInningsOpeners : setup.openers;

  const [strikerId, setStrikerId] = useState(existingOpeners?.strikerId ?? "");
  const [nonStrikerId, setNonStrikerId] = useState(existingOpeners?.nonStrikerId ?? "");

  const canProceed = strikerId && nonStrikerId && strikerId !== nonStrikerId;

  const handleConfirm = () => {
    if (!canProceed) return;
    const openers = { strikerId, nonStrikerId };
    if (secondInnings) {
      startSecondInnings(openers);
    } else {
      updateSetup({ openers });
    }
  };

  const battingTeam = lookup.team(battingTeamId);

  const content = (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <div className="rounded-2xl bg-foreground/5 px-4 py-3 text-center">
          <p className="text-xs font-bold text-muted-foreground">
            {battingTeam?.name} batting
          </p>
        </div>
      )}

      <OpenersList
        battingXI={battingXI}
        label="🏏 Striker (facing first ball)"
        value={strikerId}
        disabledId={nonStrikerId}
        onSelect={setStrikerId}
      />

      <OpenersList
        battingXI={battingXI}
        label="Non-Striker (other end)"
        value={nonStrikerId}
        disabledId={strikerId}
        onSelect={setNonStrikerId}
      />

      <button
        onClick={handleConfirm}
        disabled={!canProceed}
        className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {secondInnings ? "Start 2nd Innings" : "Select Opening Bowler"}
      </button>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-3">
        <div className="mx-auto max-w-md">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {secondInnings ? "2nd Innings" : "Step 3 of 4"}
          </p>
          <p className="text-base font-extrabold text-foreground mt-0.5">
            {secondInnings ? "Select Opening Batters" : "Select Openers"}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 mx-auto w-full max-w-md">
        {content}
      </div>
    </div>
  );
}
