import type { BowlerStat } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText } from "@/lib/scoring/engine";

interface Props {
  bowlerId?: string;
  bowlers: BowlerStat[];
}

export function BowlerPanel({ bowlerId, bowlers }: Props) {
  const stat = bowlers.find((b) => b.playerId === bowlerId);
  const player = lookup.player(bowlerId);

  if (!bowlerId || !player) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Bowler
      </p>
      <div className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-xs font-extrabold text-foreground">
          {player.shortName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{player.shortName}</p>
          <p className="text-[11px] text-muted-foreground">{player.role}</p>
        </div>
        {stat && (
          <div className="flex items-center gap-4 shrink-0 text-right">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Ov</p>
              <p className="text-sm font-extrabold tabular-nums text-foreground">
                {oversText(stat.legalBalls)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Runs</p>
              <p className="text-sm font-extrabold tabular-nums text-foreground">{stat.runs}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Wkts</p>
              <p className="text-sm font-extrabold tabular-nums text-foreground">{stat.wickets}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
