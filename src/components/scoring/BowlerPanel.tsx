import type { BowlerStat } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText } from "@/lib/scoring/engine";

interface Props {
  bowlerId?: string;
  bowlers: BowlerStat[];
  canChangeBowler?: boolean;
  onChangeBowler?: () => void;
}

export function BowlerPanel({ bowlerId, bowlers, canChangeBowler, onChangeBowler }: Props) {
  const stat = bowlers.find((b) => b.playerId === bowlerId);
  const player = lookup.player(bowlerId);

  if (!bowlerId || !player) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
          Current Bowler
        </p>
        {canChangeBowler && onChangeBowler && (
          <button
            onClick={onChangeBowler}
            type="button"
            className="text-[10px] font-black text-[#D9A928] hover:underline uppercase tracking-wider"
          >
            Change Bowler
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-[#E5E5E5] px-4 py-3 shadow-sm">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-black text-[#111111]">
          {player.shortName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#111111]">{player.shortName}</p>
          <p className="text-[11px] font-bold text-[#5F6368]">{player.role}</p>
        </div>
        {stat && (
          <div className="flex items-center gap-4 shrink-0 text-right">
            <div>
              <p className="text-[10px] font-extrabold text-[#5F6368] uppercase">Ov</p>
              <p className="text-sm font-black tabular-nums text-[#111111]">
                {oversText(stat.legalBalls)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#5F6368] uppercase">Runs</p>
              <p className="text-sm font-black tabular-nums text-[#111111]">{stat.runs}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#5F6368] uppercase">Wkts</p>
              <p className="text-sm font-black tabular-nums text-[#9A6A05] bg-[#D9A928]/15 px-2 py-0.5 rounded-md">{stat.wickets}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
