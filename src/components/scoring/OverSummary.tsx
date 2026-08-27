import type { OverGroup } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

function chipClass(kind: string, label: string) {
  if (kind === "wicket") return "bg-[#DC2626] text-white font-black";
  if (kind === "boundary") {
    if (label === "6") return "bg-[#D9A928] text-[#111111] font-black";
    return "bg-[#D9A928]/20 text-[#9A6A05] border border-[#D9A928]/40 font-black";
  }
  if (kind === "extra") return "bg-[#F7F7F5] text-[#111111] border border-[#D9A928]/40 font-bold";
  if (kind === "dot") return "bg-[#F7F7F5] text-[#5F6368] border border-[#E5E5E5]";
  return "bg-white text-[#111111] border border-[#E5E5E5] font-bold";
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
      <p className="text-[10px] font-extrabold tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
        {currentOverOnly ? "This Over" : "Recent Overs"}
      </p>
      {groups.map((grp) => {
        const bowler = lookup.player(grp.bowlerId);
        return (
          <div key={grp.overNumber} className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-black text-[#111111]">
                Over {grp.overNumber + 1}
              </span>
              <span className="text-[11px] text-[#5F6368] font-bold">
                {bowler?.shortName ?? "—"} · <span className="text-[#111111] font-extrabold">{grp.runs} runs</span> {grp.wickets > 0 ? `· ${grp.wickets}w` : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {grp.balls.map((b, i) => (
                <div key={b.delivery.id + i} className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-[#5F6368] tabular-nums font-semibold">
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
