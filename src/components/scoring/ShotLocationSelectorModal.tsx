import React from "react";
import {
  SHOT_ZONES,
  WAGON_WHEEL_ZONE_DISPLAY_NAMES,
  type ShotZoneKey,
} from "@/lib/scoring/wagon-wheel";
import { Compass, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onSelectZone: (zone: ShotZoneKey) => void;
  onSkip: () => void;
  runLabel: string;
}

export function ShotLocationSelectorModal({
  isOpen,
  onSelectZone,
  onSkip,
  runLabel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E5E5E5] shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#D9A928]/20 flex items-center justify-center text-[#9A6A05]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                Shot Direction ({runLabel})
              </h3>
              <p className="text-[10px] text-[#5F6368] font-bold">
                Select Wagon Wheel Scoring Zone (Optional)
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="h-7 w-7 rounded-lg bg-[#F7F7F5] flex items-center justify-center text-[#5F6368] hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 9 Cricket Field Zones in Compass/Field Orientation */}
        <div className="grid grid-cols-3 gap-2">
          {/* Top Row: Off-side to On-side Down the ground */}
          <button
            onClick={() => onSelectZone("third_man")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.third_man}
          </button>
          <button
            onClick={() => onSelectZone("long_off")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.long_off}
          </button>
          <button
            onClick={() => onSelectZone("long_on")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.long_on}
          </button>

          {/* Middle Row: Square fields */}
          <button
            onClick={() => onSelectZone("point")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.point}
          </button>
          <button
            onClick={() => onSelectZone("cover")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.cover}
          </button>
          <button
            onClick={() => onSelectZone("mid_wicket")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.mid_wicket}
          </button>

          {/* Bottom Row: Behind the wicket */}
          <button
            onClick={() => onSelectZone("mid_off")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.mid_off}
          </button>
          <button
            onClick={() => onSelectZone("square_leg")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.square_leg}
          </button>
          <button
            onClick={() => onSelectZone("fine_leg")}
            className="p-2.5 rounded-xl bg-[#F7F7F5] hover:bg-[#D9A928] hover:text-black border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#111111] transition-all"
          >
            {WAGON_WHEEL_ZONE_DISPLAY_NAMES.fine_leg}
          </button>
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={onSkip}
          className="tap w-full py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all"
        >
          Skip (Unknown / Not Recorded)
        </button>
      </div>
    </div>
  );
}
