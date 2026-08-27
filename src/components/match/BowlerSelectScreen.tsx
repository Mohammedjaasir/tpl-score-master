import { useState } from "react";
import type { Match } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";

interface Props {
  match: Match;
  store: MatchStore;
}

export function BowlerSelectScreen({ match, store }: Props) {
  const { doc, setBowler } = store;
  const setup = doc.setup;

  const battingFirstId = setup.battingFirstId ?? match.teamAId;
  const bowlingTeamId =
    battingFirstId === match.teamAId ? match.teamBId : match.teamAId;
  const bowlingXI = setup.playingXI[bowlingTeamId]?.playerIds ?? [];

  const [selectedId, setSelectedId] = useState("");

  const handleConfirm = () => {
    if (!selectedId) return;
    setBowler(selectedId);
  };

  const bowlingTeam = lookup.team(bowlingTeamId);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-3">
        <div className="mx-auto max-w-md">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Step 4 of 4
          </p>
          <p className="text-base font-extrabold text-foreground mt-0.5">Opening Bowler</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 mx-auto w-full max-w-md flex flex-col gap-6">
        <div className="rounded-2xl bg-foreground/5 px-4 py-3 text-center">
          <p className="text-xs font-bold text-muted-foreground">
            {bowlingTeam?.name} bowling
          </p>
        </div>

        <div className="card-surface divide-y divide-border/50">
          {bowlingXI.map((id) => {
            const p = lookup.player(id);
            const isBowler = p?.role === "Bowler" || p?.role === "All-rounder";
            return (
              <button
                key={id}
                onClick={() => setSelectedId(id)}
                className={`tap w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  selectedId === id ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${
                    selectedId === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {selectedId === id ? "✓" : p?.shortName?.charAt(0) ?? "?"}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-foreground">{p?.name ?? id}</p>
                  <p className="text-[10px] text-muted-foreground">{p?.role}</p>
                </div>
                {isBowler && (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    Bowler
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Innings
        </button>
      </div>
    </div>
  );
}
