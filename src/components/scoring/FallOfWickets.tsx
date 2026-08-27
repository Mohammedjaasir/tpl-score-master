import type { FallOfWicket } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

interface Props {
  fow: FallOfWicket[];
}

export function FallOfWickets({ fow }: Props) {
  if (fow.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Fall of Wickets
      </p>
      <div className="card-surface divide-y divide-border/50">
        {fow.map((w) => {
          const player = lookup.player(w.batterOutId);
          return (
            <div key={w.wicketNumber} className="flex items-center gap-3 px-4 py-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-extrabold text-primary">
                {w.wicketNumber}
              </span>
              <span className="flex-1 truncate text-xs font-bold text-foreground">
                {player?.shortName ?? "—"}
              </span>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {w.runs} ({w.oversText})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
