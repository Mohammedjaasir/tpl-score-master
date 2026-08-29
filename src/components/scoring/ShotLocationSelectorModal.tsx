import React, { useState } from "react";
import {
  SHOT_ZONES,
  WAGON_WHEEL_ZONE_DISPLAY_NAMES,
  type ShotZoneKey,
} from "@/lib/scoring/wagon-wheel";
import { Compass, X, Check, ArrowRight } from "lucide-react";

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
  const [selectedZone, setSelectedZone] = useState<ShotZoneKey | null>(null);

  if (!isOpen) return null;

  const cx = 160;
  const cy = 160;
  const r = 135;
  const innerR = 75;

  // Converts tap coordinates on SVG to nearest ShotZoneKey
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert SVG viewbox coordinates (320x320)
    const scaleX = 320 / rect.width;
    const scaleY = 320 / rect.height;
    const svgX = clickX * scaleX;
    const svgY = clickY * scaleY;

    const dx = svgX - cx;
    const dy = svgY - cy;

    // Angle clockwise from top (12 o'clock / 0 deg)
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    // Find matching zone
    const matched = SHOT_ZONES.find((z) => {
      if (z.angleMin > z.angleMax) {
        // Wraps around 360 (e.g. 340 to 20)
        return angleDeg >= z.angleMin || angleDeg <= z.angleMax;
      }
      return angleDeg >= z.angleMin && angleDeg <= z.angleMax;
    });

    if (matched) {
      setSelectedZone(matched.key);
    }
  };

  const handleConfirm = () => {
    if (selectedZone) {
      onSelectZone(selectedZone);
    } else {
      onSkip();
    }
  };

  // Helper to create SVG sector wedge path
  const makeSectorPath = (angleMin: number, angleMax: number) => {
    const a1Rad = ((angleMin - 90) * Math.PI) / 180;
    const a2Rad = ((angleMax - 90) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(a1Rad);
    const y1 = cy + r * Math.sin(a1Rad);
    const x2 = cx + r * Math.cos(a2Rad);
    const y2 = cy + r * Math.sin(a2Rad);

    const largeArcFlag = (angleMax - angleMin + 360) % 360 > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0F172A] rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-2xl text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-white">
                  MARK SHOT LOCATION
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#D9A928] text-black font-black text-[10px]">
                  {runLabel}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Where did the batter's shot go?
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Interactive Cricket Ground Graphic */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-full max-w-[280px] aspect-square relative select-none">
            <svg
              viewBox="0 0 320 320"
              onClick={handleSvgClick}
              className="w-full h-full cursor-pointer drop-shadow-xl"
            >
              {/* Outer boundary circle */}
              <circle cx={cx} cy={cy} r={r} fill="#064E3B" stroke="#047857" strokeWidth="2" />
              
              {/* Sector Wedges */}
              {SHOT_ZONES.map((zone) => {
                const isSelected = selectedZone === zone.key;
                return (
                  <path
                    key={zone.key}
                    d={makeSectorPath(zone.angleMin, zone.angleMax)}
                    fill={isSelected ? "#D9A928" : "#065F46"}
                    fillOpacity={isSelected ? 0.75 : 0.35}
                    stroke={isSelected ? "#F59E0B" : "#047857"}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all hover:fill-[#D9A928] hover:fill-opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedZone(zone.key);
                    }}
                  />
                );
              })}

              {/* 30-Yard Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={innerR}
                fill="none"
                stroke="#34D399"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                pointerEvents="none"
              />

              {/* Center Pitch */}
              <rect
                x={cx - 4}
                y={cy - 16}
                width={8}
                height={32}
                fill="#FDE68A"
                rx={1.5}
                pointerEvents="none"
              />
              <line x1={cx - 6} y1={cy + 12} x2={cx + 6} y2={cy + 12} stroke="#FFFFFF" strokeWidth="1.5" pointerEvents="none" />
              <circle cx={cx} cy={cy + 8} r={2.5} fill="#D97706" pointerEvents="none" />

              {/* Zone Label Nodes */}
              {SHOT_ZONES.map((zone) => {
                const angleRad = ((zone.centerAngle - 90) * Math.PI) / 180;
                const labelRadius = r - 22;
                const lx = cx + labelRadius * Math.cos(angleRad);
                const ly = cy + labelRadius * Math.sin(angleRad);
                const isSelected = selectedZone === zone.key;

                return (
                  <g
                    key={`lbl-${zone.key}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedZone(zone.key);
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x={lx - 26}
                      y={ly - 9}
                      width={52}
                      height={18}
                      rx={4}
                      fill={isSelected ? "#D9A928" : "#0F172A"}
                      stroke={isSelected ? "#FFFFFF" : "#334155"}
                      strokeWidth={1}
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      textAnchor="middle"
                      fill={isSelected ? "#111111" : "#F8FAFC"}
                      fontSize="7"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      {WAGON_WHEEL_ZONE_DISPLAY_NAMES[zone.key]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Zone Pill / Indicator */}
          <div className="mt-2 text-center">
            {selectedZone ? (
              <span className="text-xs font-black uppercase tracking-wider text-[#D9A928]">
                Selected: {WAGON_WHEEL_ZONE_DISPLAY_NAMES[selectedZone]}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-bold">
                Tap on field or select a sector below
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="tap flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider transition-all"
            >
              Skip (Not Recorded)
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedZone}
              className={`tap flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                selectedZone
                  ? "bg-[#D9A928] hover:bg-[#F4C542] text-black shadow-lg shadow-[#D9A928]/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Check className="h-4 w-4" />
              <span>Confirm Shot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
