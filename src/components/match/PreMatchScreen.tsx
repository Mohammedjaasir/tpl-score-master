import { useState } from "react";
import type { Match } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { useTeam } from "@/hooks/useCricketData";
import { lookup } from "@/lib/repositories";
import { MapPin, Clock } from "lucide-react";

import { TeamLogo } from "@/components/team/TeamLogo";
import { formatMatchTime } from "@/lib/utils";

interface Props {
  match: Match;
  store: MatchStore;
}

export function PreMatchScreen({ match, store }: Props) {
  const { data: teamAData } = useTeam(match.teamAId);
  const { data: teamBData } = useTeam(match.teamBId);
  const teamA = teamAData ?? lookup.team(match.teamAId);
  const teamB = teamBData ?? lookup.team(match.teamBId);

  const { doc, updateSetup } = store;
  const setup = doc.setup;

  const [tossWinnerId, setTossWinnerId] = useState(setup.tossWinnerId ?? "");
  const [decision, setDecision] = useState<"bat" | "bowl">(setup.decision ?? "bat");

  const time = formatMatchTime(match.scheduledAt);

  const canProceed = !!tossWinnerId;

  const handleConfirm = () => {
    if (!tossWinnerId) return;
    const battingFirstId =
      decision === "bat"
        ? tossWinnerId
        : tossWinnerId === match.teamAId
          ? match.teamBId
          : match.teamAId;
    updateSetup({ tossWinnerId, decision, battingFirstId });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero header */}
      <div className="bg-foreground px-4 pt-8 pb-10">
        <div className="mx-auto max-w-md text-center">
          <p className="text-[10px] font-bold tracking-widest text-background/50 uppercase mb-1">
            TPL 2026
          </p>
          <p className="font-display text-3xl font-extrabold text-background uppercase tracking-wide">
            Match #{String(match.matchNumber).padStart(2, "0")}
          </p>

          {/* Teams */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 flex flex-col items-center text-center">
              <TeamLogo
                logoUrl={teamA?.logoUrl}
                name={teamA?.name}
                shortName={teamA?.shortName}
                size="lg"
                className="mb-2 shadow-lg"
              />
              <p className="text-sm font-bold text-background leading-tight">{teamA?.name}</p>
            </div>

            <div className="shrink-0">
              <p className="font-display text-2xl font-extrabold text-background/40 uppercase">VS</p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center">
              <TeamLogo
                logoUrl={teamB?.logoUrl}
                name={teamB?.name}
                shortName={teamB?.shortName}
                size="lg"
                className="mb-2 shadow-lg"
              />
              <p className="text-sm font-bold text-background leading-tight">{teamB?.name}</p>
            </div>
          </div>

          {/* Venue / time */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-background/50 font-bold">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {match.venue}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {time}
            </span>
            <span>{match.overs} overs</span>
          </div>
        </div>
      </div>

      {/* Toss section */}
      <div className="flex-1 px-4 py-6 mx-auto w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Toss winner */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
              Toss Winner
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[match.teamAId, match.teamBId].map((id) => {
                const team = id === match.teamAId ? teamA : teamB;
                return (
                  <button
                    key={id}
                    onClick={() => setTossWinnerId(id)}
                    className={`tap flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
                      tossWinnerId === id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-xl text-sm font-extrabold overflow-hidden ${
                        tossWinnerId === id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {team?.logoUrl ? (
                        <img src={team.logoUrl} alt={team?.name} className="h-full w-full object-cover" />
                      ) : (
                        team?.shortName
                      )}
                    </div>
                    <span className="text-xs font-bold text-center leading-tight text-foreground">
                      {team?.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decision */}
          {tossWinnerId && (
            <div className="animate-fade-in">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
                Decision
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["bat", "bowl"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDecision(d)}
                    className={`tap rounded-2xl border-2 py-4 text-sm font-extrabold uppercase tracking-widest transition-colors ${
                      decision === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground"
                    }`}
                  >
                    {d === "bat" ? "🏏 Bat" : "⚾ Bowl"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {tossWinnerId && (
            <div className="animate-fade-in rounded-2xl bg-secondary px-4 py-4">
              <p className="text-sm font-bold text-foreground text-center">
                {(tossWinnerId === match.teamAId ? teamA : teamB)?.name} elected to{" "}
                <span className="text-primary">{decision}</span> first
              </p>
            </div>
          )}

          {/* Proceed */}
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Toss & Set Up Teams
          </button>
        </div>
      </div>
    </div>
  );
}
