import type { Match } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";
import { OpenersScreen } from "@/components/match/OpenersScreen";

interface Props {
  match: Match;
  store: MatchStore;
}

export function InningsBreakScreen({ match, store }: Props) {
  const { state, doc } = store;
  const firstInnings = state?.innings[0];

  if (!firstInnings) return null;

  const battingTeam = lookup.team(firstInnings.battingTeamId);
  const chasingTeam = lookup.team(firstInnings.bowlingTeamId);

  // Top batter
  const topBatter = [...firstInnings.batters].sort((a, b) => b.runs - a.runs)[0];
  const topBatterPlayer = lookup.player(topBatter?.playerId);

  // Top bowler
  const topBowler = [...firstInnings.bowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
  const topBowlerPlayer = lookup.player(topBowler?.playerId);

  // If 2nd innings not started yet — show break summary and opener selection
  const needsOpeners = !doc.secondInningsStarted;

  if (needsOpeners) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        {/* Summary header */}
        <div className="bg-foreground px-4 pt-8 pb-10">
          <div className="mx-auto max-w-md text-center">
            <p className="text-[10px] font-bold tracking-widest text-background/50 uppercase mb-2">
              Innings Complete
            </p>
            <p className="font-display text-3xl font-extrabold text-background">{battingTeam?.name}</p>

            <div className="mt-4 flex items-baseline justify-center gap-2">
              <span className="font-display text-7xl font-extrabold text-background tabular-nums">
                {firstInnings.runs}
              </span>
              <span className="font-display text-4xl font-bold text-background/50">
                /{firstInnings.wickets}
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-background/60">
              {firstInnings.oversText} overs &middot; RR {firstInnings.crr.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-6 mx-auto w-full max-w-md flex flex-col gap-4">
          {/* Target banner */}
          <div className="rounded-2xl bg-primary px-4 py-4 text-center">
            <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-widest">
              {chasingTeam?.name} need
            </p>
            <p className="font-display text-4xl font-extrabold text-primary-foreground">
              {firstInnings.runs + 1}
            </p>
            <p className="text-xs font-bold text-primary-foreground/70">
              runs to win in {match.overs * 6} balls
            </p>
          </div>

          {/* Top performances */}
          <div className="grid grid-cols-2 gap-3">
            {topBatterPlayer && topBatter && (
              <div className="card-surface px-4 py-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Top Batter
                </p>
                <p className="text-sm font-bold text-foreground truncate">{topBatterPlayer.shortName}</p>
                <p className="font-display text-xl font-extrabold text-primary">
                  {topBatter.runs} <span className="text-sm text-muted-foreground">({topBatter.balls})</span>
                </p>
              </div>
            )}
            {topBowlerPlayer && topBowler && (
              <div className="card-surface px-4 py-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Top Bowler
                </p>
                <p className="text-sm font-bold text-foreground truncate">{topBowlerPlayer.shortName}</p>
                <p className="font-display text-xl font-extrabold text-primary">
                  {topBowler.wickets}/{topBowler.runs}
                </p>
              </div>
            )}
          </div>

          {/* Opener selection embedded */}
          <div className="mt-4">
            <p className="text-base font-extrabold text-foreground mb-4">
              Select Opening Batters for {chasingTeam?.name}
            </p>
            <OpenersScreen match={match} store={store} secondInnings={true} embedded={true} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
