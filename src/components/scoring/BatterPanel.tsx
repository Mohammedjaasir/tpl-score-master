import type { BatterStat } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-extrabold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function BatterCard({
  stat,
  isStriker,
}: {
  stat: BatterStat;
  isStriker: boolean;
}) {
  const player = lookup.player(stat.playerId);
  const sr = stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(1) : "0.0";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        isStriker ? "bg-foreground text-background" : "bg-secondary"
      }`}
    >
      {/* Avatar */}
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${
          isStriker ? "bg-background/15" : "bg-muted"
        }`}
      >
        {player?.shortName?.charAt(0) ?? "?"}
      </div>

      {/* Name + runs */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-bold ${
            isStriker ? "text-background" : "text-foreground"
          }`}
        >
          {player?.shortName ?? "—"}
          {isStriker && (
            <span className="ml-1 text-primary font-extrabold">*</span>
          )}
        </p>
        <p
          className={`text-[11px] ${isStriker ? "text-background/60" : "text-muted-foreground"}`}
        >
          {isStriker ? "Striker" : "Non-striker"}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p
            className={`font-display text-2xl font-extrabold leading-none tabular-nums ${
              isStriker ? "text-background" : "text-foreground"
            }`}
          >
            {stat.runs}
          </p>
          <p
            className={`text-[11px] tabular-nums ${
              isStriker ? "text-background/60" : "text-muted-foreground"
            }`}
          >
            ({stat.balls})
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-[10px] font-bold tabular-nums ${
              isStriker ? "text-background/70" : "text-muted-foreground"
            }`}
          >
            4s {stat.fours}
          </span>
          <span
            className={`text-[10px] font-bold tabular-nums ${
              isStriker ? "text-background/70" : "text-muted-foreground"
            }`}
          >
            6s {stat.sixes}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  strikerId?: string;
  nonStrikerId?: string;
  batters: BatterStat[];
}

export function BatterPanel({ strikerId, nonStrikerId, batters }: Props) {
  const strikerStat = batters.find((b) => b.playerId === strikerId && !b.out);
  const nonStrikerStat = batters.find((b) => b.playerId === nonStrikerId && !b.out);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Batters
      </p>
      <div className="flex flex-col gap-2">
        {strikerStat && <BatterCard stat={strikerStat} isStriker={true} />}
        {nonStrikerStat && <BatterCard stat={nonStrikerStat} isStriker={false} />}
      </div>
    </div>
  );
}
