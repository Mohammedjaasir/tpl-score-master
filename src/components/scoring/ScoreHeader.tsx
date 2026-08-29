import type { InningsState } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

interface Props {
  innings: InningsState;
  matchOvers: number;
}

export function ScoreHeader({ innings, matchOvers }: Props) {
  const team = lookup.team(innings.battingTeamId);
  const isChase = innings.target !== undefined;

  return (
    <div className="bg-foreground text-background px-4 pt-5 pb-4">
      <div className="mx-auto max-w-6xl">
        {/* Team + Score */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-background/60 uppercase tracking-widest">
              {team?.name}
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className="font-display text-5xl font-extrabold tabular-nums leading-none animate-score"
                key={innings.runs + "-" + innings.wickets}
              >
                {innings.runs}
              </span>
              <span className="font-display text-3xl font-bold text-background/70">
                /{innings.wickets}
              </span>
            </div>
          </div>

          {/* Chase info */}
          {isChase && innings.runsNeeded !== undefined && (
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-background/50 uppercase tracking-widest">Target</p>
              <p className="font-display text-2xl font-extrabold">{innings.target}</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-background/60 font-bold">
          <span>
            <span className="text-background font-extrabold tabular-nums">
              {innings.oversText}
            </span>
            &nbsp;/&nbsp;{matchOvers} ov
          </span>
          <span>
            CRR&nbsp;
            <span className="text-background font-extrabold tabular-nums">
              {(innings.crr ?? 0).toFixed(2)}
            </span>
          </span>
          {isChase && innings.requiredRunRate !== undefined && (
            <span>
              RRR&nbsp;
              <span className="text-background font-extrabold tabular-nums">
                {(innings.requiredRunRate ?? 0).toFixed(2)}
              </span>
            </span>
          )}
          {isChase && innings.runsNeeded !== undefined && innings.ballsRemaining !== undefined && (
            <span>
              Need&nbsp;
              <span className="text-background font-extrabold tabular-nums">
                {innings.runsNeeded}
              </span>
              &nbsp;from&nbsp;
              <span className="text-background font-extrabold tabular-nums">
                {innings.ballsRemaining}
              </span>
              &nbsp;balls
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
