import type { Partnership, InningsState } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

interface Props {
  partnership: Partnership;
  innings: InningsState;
}

export function PartnershipPanel({ partnership, innings }: Props) {
  const batterA = lookup.player(innings.strikerId);
  const batterB = lookup.player(innings.nonStrikerId);
  const strikerStat = innings.batters.find((b) => b.playerId === innings.strikerId && !b.out);
  const nonStrikerStat = innings.batters.find((b) => b.playerId === innings.nonStrikerId && !b.out);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Partnership
      </p>
      <div className="card-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-center min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-muted-foreground">
              {batterA?.shortName ?? "—"}
            </p>
            <p className="font-display text-xl font-extrabold tabular-nums text-foreground">
              {strikerStat?.runs ?? 0}*
            </p>
          </div>

          <div className="text-center shrink-0">
            <p className="font-display text-2xl font-extrabold text-primary tabular-nums">
              {partnership.runs}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground">
              {partnership.balls} balls
            </p>
          </div>

          <div className="text-center min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-muted-foreground">
              {batterB?.shortName ?? "—"}
            </p>
            <p className="font-display text-xl font-extrabold tabular-nums text-foreground">
              {nonStrikerStat?.runs ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
