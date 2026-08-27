import { Link } from "@tanstack/react-router";
import type { MatchState } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { Trophy } from "lucide-react";

interface Props {
  state: MatchState;
}

export function MatchCompleteScreen({ state }: Props) {
  const innings1 = state.innings[0];
  const innings2 = state.innings[1];
  const matchId = state.match.id;

  const team1 = lookup.team(innings1?.battingTeamId);
  const team2 = lookup.team(innings2?.battingTeamId);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Result hero */}
      <div className="bg-foreground px-4 pt-10 pb-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/20">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <p className="font-display text-3xl font-extrabold text-background uppercase tracking-wide">
            Match Complete
          </p>
          {state.resultText && (
            <p className="mt-3 text-lg font-bold text-primary">
              {state.resultText}
            </p>
          )}
        </div>
      </div>

      {/* Score comparison */}
      <div className="px-4 py-6 mx-auto w-full max-w-md flex flex-col gap-4">
        {/* Team 1 */}
        {innings1 && team1 && (
          <div className="card-surface px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  1st Innings
                </p>
                <p className="text-base font-extrabold text-foreground mt-0.5">{team1.name}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-extrabold text-foreground tabular-nums">
                  {innings1.runs}
                  <span className="text-xl text-muted-foreground">/{innings1.wickets}</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-bold">
                  {innings1.oversText} ov · RR {innings1.crr.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Team 2 */}
        {innings2 && team2 && (
          <div className="card-surface px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  2nd Innings
                </p>
                <p className="text-base font-extrabold text-foreground mt-0.5">{team2.name}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-extrabold text-foreground tabular-nums">
                  {innings2.runs}
                  <span className="text-xl text-muted-foreground">/{innings2.wickets}</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-bold">
                  {innings2.oversText} ov · RR {innings2.crr.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <Link
            to="/scorecard/$matchId"
            params={{ matchId }}
            className="tap flex min-h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-pop)]"
          >
            View Scorecard
          </Link>
          <Link
            to="/matches"
            className="tap flex min-h-12 w-full items-center justify-center rounded-full bg-secondary text-sm font-extrabold uppercase tracking-widest text-foreground"
          >
            Back to Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
