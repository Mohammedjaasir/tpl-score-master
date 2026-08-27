import { useEffect, useState } from "react";
import { CheckSquare, Square, Star, Shield, RefreshCw } from "lucide-react";
import type { Match, PlayingXI } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { usePlayers, useTeam } from "@/hooks/useCricketData";
import { lookup } from "@/lib/repositories";

interface Props {
  match: Match;
  store: MatchStore;
}

const DEFAULT_XI_COUNT = 11;

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
  const { data: team } = useTeam(teamId);
  const { data: players = [], isLoading } = usePlayers(teamId);
  const maxAllowed = Math.min(DEFAULT_XI_COUNT, Math.max(1, players.length));
  const selected = xi.size;

  if (isLoading) {
    return (
      <div className="card-surface p-6 flex items-center justify-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
        <span className="text-xs font-bold text-muted-foreground">Loading squad from Supabase...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {team?.logoUrl && (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="h-6 w-6 rounded-full object-cover border border-border"
            />
          )}
          <p className="text-sm font-extrabold text-foreground">{team?.name || "Team"}</p>
        </div>
        <span
          className={`text-xs font-bold tabular-nums ${
            selected === maxAllowed ? "text-success" : "text-muted-foreground"
          }`}
        >
          {selected}/{maxAllowed}
        </span>
      </div>
      <div className="card-surface divide-y divide-border/50">
        {players.map((p) => {
          const isSelected = xi.has(p.id);
          const isCaptain = p.id === captainId;
          const isKeeper = p.id === keeperId;
          const isDisabled = !isSelected && selected >= maxAllowed;

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

              {/* Avatar if present */}
              {p.avatar && (
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="h-7 w-7 rounded-full object-cover shrink-0 border border-border/60"
                />
              )}

              {/* Name + role */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {p.teamRole ? `${p.teamRole} · ` : ""}
                  {p.role}
                </p>
              </div>

              {/* Captain / Keeper badges */}
              {isSelected && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onSetCaptain(p.id)}
                    title="Set Captain"
                    className={`tap grid h-7 w-7 place-items-center rounded-full transition-colors ${
                      isCaptain
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={isCaptain ? "Captain" : "Set as captain"}
                  >
                    <Star className="h-3.5 w-3.5" fill={isCaptain ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => onSetKeeper(p.id)}
                    title="Set Wicketkeeper"
                    className={`tap grid h-7 w-7 place-items-center rounded-full transition-colors ${
                      isKeeper
                        ? "bg-blue-100 text-blue-600"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
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

  const { data: playersA = [] } = usePlayers(match.teamAId);
  const { data: playersB = [] } = usePlayers(match.teamBId);

  const maxA = Math.min(DEFAULT_XI_COUNT, Math.max(1, playersA.length));
  const maxB = Math.min(DEFAULT_XI_COUNT, Math.max(1, playersB.length));

  const [xiA, setXiA] = useState<Set<string>>(() => {
    const saved = setup.playingXI[match.teamAId]?.playerIds;
    if (saved?.length) return new Set(saved);
    const cached = lookup.playersOf(match.teamAId);
    return new Set(cached.slice(0, DEFAULT_XI_COUNT).map((p) => p.id));
  });

  const [xiB, setXiB] = useState<Set<string>>(() => {
    const saved = setup.playingXI[match.teamBId]?.playerIds;
    if (saved?.length) return new Set(saved);
    const cached = lookup.playersOf(match.teamBId);
    return new Set(cached.slice(0, DEFAULT_XI_COUNT).map((p) => p.id));
  });

  // Auto-fill when players query finishes if empty
  useEffect(() => {
    if (xiA.size === 0 && playersA.length > 0) {
      setXiA(new Set(playersA.slice(0, DEFAULT_XI_COUNT).map((p) => p.id)));
    }
  }, [playersA, xiA.size]);

  useEffect(() => {
    if (xiB.size === 0 && playersB.length > 0) {
      setXiB(new Set(playersB.slice(0, DEFAULT_XI_COUNT).map((p) => p.id)));
    }
  }, [playersB, xiB.size]);

  const [captains, setCaptains] = useState<Record<string, string>>({
    [match.teamAId]: setup.playingXI[match.teamAId]?.captainId ?? "",
    [match.teamBId]: setup.playingXI[match.teamBId]?.captainId ?? "",
  });
  const [keepers, setKeepers] = useState<Record<string, string>>({
    [match.teamAId]: setup.playingXI[match.teamAId]?.keeperId ?? "",
    [match.teamBId]: setup.playingXI[match.teamBId]?.keeperId ?? "",
  });

  const toggle = (teamId: string, pid: string) => {
    const isTeamA = teamId === match.teamAId;
    const max = isTeamA ? maxA : maxB;
    const setter = isTeamA ? setXiA : setXiB;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else if (next.size < max) next.add(pid);
      return next;
    });
  };

  const setCaptain = (teamId: string, pid: string) =>
    setCaptains((p) => ({ ...p, [teamId]: pid }));
  const setKeeper = (teamId: string, pid: string) =>
    setKeepers((p) => ({ ...p, [teamId]: pid }));

  const canProceed = xiA.size === maxA && xiB.size === maxB && maxA > 0 && maxB > 0;

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
          {canProceed ? "Confirm Playing XI" : `Select squad (${maxA} & ${maxB} players)`}
        </button>
      </div>
    </div>
  );
}
