import type { BatterStat } from "@/types/cricket";
import { lookup } from "@/lib/repositories";

function BatterCard({
  stat,
  isStriker,
}: {
  stat: BatterStat;
  isStriker: boolean;
}) {
  const player = lookup.player(stat.playerId);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
        isStriker 
          ? "bg-[#111111] text-white border-2 border-[#D9A928] shadow-md scale-[1.01]" 
          : "bg-white text-[#111111] border border-[#E5E5E5] shadow-sm"
      }`}
    >
      {/* Avatar */}
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black transition-colors ${
          isStriker ? "bg-[#D9A928] text-[#111111]" : "bg-[#F7F7F5] border border-[#E5E5E5] text-[#111111]"
        }`}
      >
        {player?.shortName?.charAt(0) ?? "?"}
      </div>

      {/* Name + runs */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-black flex items-center gap-1.5 ${
            isStriker ? "text-white" : "text-[#111111]"
          }`}
        >
          <span>{player?.shortName ?? "—"}</span>
          {isStriker && (
            <span className="text-[#D9A928] font-black text-base animate-pulse">*</span>
          )}
        </p>
        <p
          className={`text-[11px] font-bold ${isStriker ? "text-[#D9A928]" : "text-[#5F6368]"}`}
        >
          {isStriker ? "On Strike" : "Non-Striker"}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p
            className={`font-display text-2xl font-black leading-none tabular-nums ${
              isStriker ? "text-white" : "text-[#111111]"
            }`}
          >
            {stat.runs}
          </p>
          <p
            className={`text-[11px] font-bold tabular-nums ${
              isStriker ? "text-white/70" : "text-[#5F6368]"
            }`}
          >
            ({stat.balls}b)
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-[10px] font-extrabold tabular-nums ${
              isStriker ? "text-[#F4C542]" : "text-[#5F6368]"
            }`}
          >
            4s: {stat.fours}
          </span>
          <span
            className={`text-[10px] font-extrabold tabular-nums ${
              isStriker ? "text-[#F4C542]" : "text-[#5F6368]"
            }`}
          >
            6s: {stat.sixes}
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
  // Keep active batters in stable batting position order so the active black mark visibly shifts between batters when strike changes
  const activeBatters = batters
    .filter((b) => (b.playerId === strikerId || b.playerId === nonStrikerId) && !b.out)
    .sort((a, b) => a.battingPosition - b.battingPosition);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-extrabold tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
        Current Batters
      </p>
      <div className="flex flex-col gap-2">
        {activeBatters.map((batter) => (
          <BatterCard
            key={batter.playerId}
            stat={batter}
            isStriker={batter.playerId === strikerId}
          />
        ))}
      </div>
    </div>
  );
}
