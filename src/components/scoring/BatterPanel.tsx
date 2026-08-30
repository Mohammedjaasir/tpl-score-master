import type { BatterStat } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { UserPlus } from "lucide-react";

function BatterCard({
  stat,
  isStriker,
}: {
  stat: BatterStat;
  isStriker: boolean;
}) {
  const player = lookup.player(stat.playerId);
  const displayName = player?.shortName || player?.name || "Batter";
  const initial = (player?.shortName || player?.name || "?").charAt(0).toUpperCase();

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
          isStriker
            ? "bg-[#D9A928] text-[#111111]"
            : "bg-[#F7F7F5] border border-[#E5E5E5] text-[#111111]"
        }`}
      >
        {initial}
      </div>

      {/* Name + role */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-black flex items-center gap-1.5 ${
            isStriker ? "text-white" : "text-[#111111]"
          }`}
        >
          <span className="truncate">{displayName}</span>
          {isStriker && (
            <span className="text-[#D9A928] font-black text-base animate-pulse shrink-0">
              *
            </span>
          )}
        </p>
        <p
          className={`text-[11px] font-bold ${
            isStriker ? "text-[#D9A928]" : "text-[#5F6368]"
          }`}
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
        <div className="flex flex-col gap-0.5 text-right">
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
  onSelectBatter?: (role: "striker" | "non-striker") => void;
}

export function BatterPanel({
  strikerId,
  nonStrikerId,
  batters,
  onSelectBatter,
}: Props) {
  // Helper to resolve or construct a BatterStat for an active player ID
  const resolveStat = (playerId?: string): BatterStat | undefined => {
    if (!playerId) return undefined;
    const found = batters.find((b) => b.playerId === playerId);
    if (found) return found;
    return {
      playerId,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      out: false,
      strikeRate: 0,
      battingPosition: 0,
    };
  };

  const strikerStat = resolveStat(strikerId);
  const nonStrikerStat = resolveStat(nonStrikerId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
          Current Batters
        </p>
        {(!strikerId || !nonStrikerId) && (
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D9A928]/20 text-[#9A6A05] border border-[#D9A928]/30 animate-pulse">
            Batter Needed
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* Striker Position */}
        {strikerStat ? (
          <BatterCard stat={strikerStat} isStriker={true} />
        ) : (
          <button
            type="button"
            onClick={() => onSelectBatter?.("striker")}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border-2 border-dashed border-[#D9A928]/60 bg-[#D9A928]/5 hover:bg-[#D9A928]/10 text-left transition-all tap cursor-pointer"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D9A928]/20 text-[#9A6A05] text-xs font-black">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#111111] flex items-center gap-1.5">
                <span>Select Striker</span>
                <span className="text-[#D9A928] font-black text-base animate-pulse">*</span>
              </p>
              <p className="text-[11px] font-bold text-[#9A6A05]">
                Tap to choose incoming batsman on strike
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#D9A928] text-[#111111] shrink-0">
              SELECT
            </span>
          </button>
        )}

        {/* Non-Striker Position */}
        {nonStrikerStat ? (
          <BatterCard stat={nonStrikerStat} isStriker={false} />
        ) : (
          <button
            type="button"
            onClick={() => onSelectBatter?.("non-striker")}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border-2 border-dashed border-[#E5E5E5] bg-[#F7F7F5] hover:border-[#D9A928]/50 text-left transition-all tap cursor-pointer"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white border border-[#E5E5E5] text-[#5F6368] text-xs font-black">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#111111]">
                Select Non-Striker
              </p>
              <p className="text-[11px] font-bold text-[#5F6368]">
                Tap to choose incoming non-striker
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#111111] text-white shrink-0">
              SELECT
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
