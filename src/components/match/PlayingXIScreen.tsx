import { useState } from "react";
import { CheckSquare, Square, Star, Shield } from "lucide-react";
import type { Match, PlayingXI } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";

interface Props {
  match: Match;
  store: MatchStore;
}

const MAX_PLAYING_XI = 11;

function TeamSection({
  teamId,
  xi,
  onToggle,
  onSetCaptain,
  onSetKeeper,
  captainId,
  keeperId,
}: {
  teamId: string;
  xi: Set<string>;
  onToggle: (id: string) => void;
  onSetCaptain: (id: string) => void;
  onSetKeeper: (id: string) => void;
  captainId?: string;
  keeperId?: string;
}) {
  const team = lookup.team(teamId);
  const players = lookup.playersOf(teamId);
  const selected = xi.size;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-foreground">{team?.name}</p>
        <span className={`text-xs font-bold tabular-nums ${selected === MAX_PLAYING_XI ? "text-success" : "text-muted-foreground"}`}>
          {selected}/{MAX_PLAYING_XI}
        </span>
      </div>
      <div className="card-surface divide-y divide-border/50">
        {players.map((p) => {
          const isSelected = xi.has(p.id);
          const isCaptain = p.id === captainId;
          const isKeeper = p.id === keeperId;
          const isDisabled = !isSelected && selected >= MAX_PLAYING_XI;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-3 ${isDisabled ? "opacity-40" : ""}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggle(p.id)}
                disabled={isDisabled}
                className="tap shrink-0"
                aria-label={`${isSelected ? "Deselect" : "Select"} ${p.name}`}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Name + role */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.role}</p>
              </div>

              {/* Captain / Keeper badges */}
              {isSelected && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onSetCaptain(p.id)}
                    title="Set Captain"
                    className={`tap grid h-7 w-7 place-items-center rounded-full transition-colors ${
                      isCaptain ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={isCaptain ? "Captain" : "Set as captain"}
                  >
                    <Star className="h-3.5 w-3.5" fill={isCaptain ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => onSetKeeper(p.id)}
                    title="Set Wicketkeeper"
                    className={`tap grid h-7 w-7 place-items-center rounded-full transition-colors ${
                      isKeeper ? "bg-blue-100 text-blue-600" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={isKeeper ? "Wicketkeeper" : "Set as wicketkeeper"}
                  >
                    <Shield className="h-3.5 w-3.5" fill={isKeeper ? "currentColor" : "none"} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlayingXIScreen({ match, store }: Props) {
  const { doc, updateSetup } = store;
  const setup = doc.setup;
  const battingFirstId = setup.battingFirstId!;
  const bowlingFirstId =
    battingFirstId === match.teamAId ? match.teamBId : match.teamAId;

  // Initialize XI sets from existing setup or auto-select first 11
  const initXI = (teamId: string): Set<string> => {
    const saved = setup.playingXI[teamId]?.playerIds;
    if (saved?.length) return new Set(saved);
    return new Set(lookup.playersOf(teamId).slice(0, 11).map((p) => p.id));
  };

  const [xiA, setXiA] = useState(() => initXI(match.teamAId));
  const [xiB, setXiB] = useState(() => initXI(match.teamBId));
  const [captains, setCaptains] = useState<Record<string, string>>({
    [match.teamAId]: setup.playingXI[match.teamAId]?.captainId ?? "",
    [match.teamBId]: setup.playingXI[match.teamBId]?.captainId ?? "",
  });
  const [keepers, setKeepers] = useState<Record<string, string>>({
    [match.teamAId]: setup.playingXI[match.teamAId]?.keeperId ?? "",
    [match.teamBId]: setup.playingXI[match.teamBId]?.keeperId ?? "",
  });

  const toggle = (teamId: string, pid: string) => {
    const setter = teamId === match.teamAId ? setXiA : setXiB;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else if (next.size < MAX_PLAYING_XI) next.add(pid);
      return next;
    });
  };

  const setCaptain = (teamId: string, pid: string) =>
    setCaptains((p) => ({ ...p, [teamId]: pid }));
  const setKeeper = (teamId: string, pid: string) =>
    setKeepers((p) => ({ ...p, [teamId]: pid }));

  const canProceed =
    xiA.size === MAX_PLAYING_XI && xiB.size === MAX_PLAYING_XI;

  const handleConfirm = () => {
    const playingXI: Record<string, PlayingXI> = {
      [match.teamAId]: {
        teamId: match.teamAId,
        playerIds: [...xiA],
        captainId: captains[match.teamAId] || undefined,
        keeperId: keepers[match.teamAId] || undefined,
      },
      [match.teamBId]: {
        teamId: match.teamBId,
        playerIds: [...xiB],
        captainId: captains[match.teamBId] || undefined,
        keeperId: keepers[match.teamBId] || undefined,
      },
    };
    updateSetup({ playingXI });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Step 2 of 4
          </p>
          <p className="text-base font-extrabold text-foreground mt-0.5">Select Playing XI</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 mx-auto w-full max-w-2xl flex flex-col gap-6">
        <TeamSection
          teamId={match.teamAId}
          xi={xiA}
          onToggle={(id) => toggle(match.teamAId, id)}
          onSetCaptain={(id) => setCaptain(match.teamAId, id)}
          onSetKeeper={(id) => setKeeper(match.teamAId, id)}
          captainId={captains[match.teamAId]}
          keeperId={keepers[match.teamAId]}
        />
        <TeamSection
          teamId={match.teamBId}
          xi={xiB}
          onToggle={(id) => toggle(match.teamBId, id)}
          onSetCaptain={(id) => setCaptain(match.teamBId, id)}
          onSetKeeper={(id) => setKeeper(match.teamBId, id)}
          captainId={captains[match.teamBId]}
          keeperId={keepers[match.teamBId]}
        />

        {/* Help text */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary" fill="currentColor" /> Captain
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-blue-500" fill="currentColor" /> Wicketkeeper
          </span>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canProceed}
          className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {canProceed ? "Confirm Playing XI" : `Select ${MAX_PLAYING_XI} players per team`}
        </button>
      </div>
    </div>
  );
}
