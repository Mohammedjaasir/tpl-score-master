import type { OverGroup } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

function chipClass(kind: string, label: string) {
  if (kind === "wicket") return "bg-primary/10 text-primary font-extrabold";
  if (kind === "boundary") {
    if (label === "6") return "bg-success/15 text-success font-extrabold";
    return "bg-warning/15 text-amber-700 font-extrabold";
  }
  if (kind === "extra") return "bg-blue-50 text-blue-600";
  if (kind === "dot") return "bg-muted text-muted-foreground";
  return "bg-secondary text-foreground";
}

interface Props {
  overGroups: OverGroup[];
  currentOverOnly?: boolean;
}

export function OverSummary({ overGroups, currentOverOnly = false }: Props) {
  const groups = currentOverOnly
    ? overGroups.slice(-1)
    : [...overGroups].reverse().slice(0, 3);

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        {currentOverOnly ? "This Over" : "Recent Overs"}
      </p>
      {groups.map((grp) => {
        const bowler = lookup.player(grp.bowlerId);
        return (
          <div key={grp.overNumber} className="card-surface px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-extrabold text-foreground">
                Over {grp.overNumber + 1}
              </span>
              <span className="text-[10px] text-muted-foreground font-bold">
                {bowler?.shortName ?? "—"} · {grp.runs}r {grp.wickets > 0 ? `${grp.wickets}w` : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {grp.balls.map((b, i) => (
                <div key={b.delivery.id + i} className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {grp.overNumber + 1}.{i + 1}
                  </span>
                  <span
                    className={`chip-ball ${chipClass(b.kind, b.label)}`}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
