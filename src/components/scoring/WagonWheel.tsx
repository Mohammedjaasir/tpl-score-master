import React, { useState } from "react";
import {
  SHOT_ZONES,
  WAGON_WHEEL_ZONE_DISPLAY_NAMES,
  type BatterWagonWheelSummary,
  type ShotZoneKey,
} from "@/lib/scoring/wagon-wheel";
import { Compass, Info, PieChart, ShieldAlert } from "lucide-react";

interface WagonWheelProps {
  summary: BatterWagonWheelSummary;
  className?: string;
}

export const WagonWheel: React.FC<WagonWheelProps> = ({ summary, className = "" }) => {
  const [selectedZone, setSelectedZone] = useState<ShotZoneKey | null>(null);
  const [filterType, setFilterType] = useState<"all" | "fours" | "sixes" | "singles">("all");

  const cx = 200;
  const cy = 200;
  const fieldRadius = 160;
  const innerRingRadius = 90;

  // Filter shots based on user selection
  const filteredShots = summary.shots.filter((shot) => {
    if (shot.zone === "unmapped") return false;
    if (selectedZone && shot.zone !== selectedZone) return false;
    if (filterType === "fours" && !shot.isFour) return false;
    if (filterType === "sixes" && !shot.isSix) return false;
    if (filterType === "singles" && (shot.isFour || shot.isSix || shot.runs === 0)) return false;
    return true;
  });

  // Calculate endpoint for a shot based on zone angle and shot power
  const getShotEndpoint = (zoneKey: ShotZoneKey, runs: number, isSix: boolean) => {
    const zone = SHOT_ZONES.find((z) => z.key === zoneKey);
    if (!zone) return { x: cx, y: cy };

    // Add slight jitter based on run count so overlapping lines fan out naturally
    const angleRad = ((zone.centerAngle - 90) * Math.PI) / 180;
    const distance = isSix
      ? fieldRadius + 14
      : runs === 4
      ? fieldRadius - 4
      : runs >= 2
      ? innerRingRadius + 35
      : innerRingRadius - 15;

    return {
      x: cx + distance * Math.cos(angleRad),
      y: cy + distance * Math.sin(angleRad),
    };
  };

  return (
    <div className={`flex flex-col gap-5 bg-[#0F172A] text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#D9A928]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928]">
              Match Centre Analytics
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide mt-0.5">
            {summary.batterName}'s Wagon Wheel
          </h3>
        </div>

        {/* Aggregate Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-bold">
            Total Runs: <strong className="text-white">{summary.totalRuns}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            Mapped: <strong className="text-emerald-200">{summary.mappedRuns}</strong>
          </span>
          {summary.unmappedRuns > 0 && (
            <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
              Unmapped: {summary.unmappedRuns}
            </span>
          )}
        </div>
      </div>

      {/* When NO location data is recorded */}
      {!summary.hasLocationData ? (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-slate-900/50 border border-slate-800/80 gap-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <PieChart className="h-6 w-6 text-[#D9A928]" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              NO SHOT LOCATION DATA RECORDED
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Shot-location data is not available for this innings.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-3 pt-3 border-t border-slate-800 w-full max-w-xs text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">
              Runs: <strong className="text-white">{summary.totalRuns}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">
              Shots: <strong className="text-white">{summary.shots.length}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* Real Data Visualization */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* SVG Field Graphic */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[360px] aspect-square">
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                {/* Outfield Grass */}
                <circle cx={cx} cy={cy} r={fieldRadius} fill="#064E3B" stroke="#047857" strokeWidth="2.5" />
                <circle cx={cx} cy={cy} r={fieldRadius + 8} fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

                {/* 30-Yard Circle */}
                <circle cx={cx} cy={cy} r={innerRingRadius} fill="#065F46" fillOpacity="0.6" stroke="#34D399" strokeWidth="1.5" strokeDasharray="4,4" />

                {/* Radial Sector Boundary Lines */}
                {SHOT_ZONES.map((zone) => {
                  const angleRad = ((zone.angleMin - 90) * Math.PI) / 180;
                  const x2 = cx + fieldRadius * Math.cos(angleRad);
                  const y2 = cy + fieldRadius * Math.sin(angleRad);
                  return (
                    <line
                      key={`sector-${zone.key}`}
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      stroke="#047857"
                      strokeWidth="1"
                      strokeDasharray="2,3"
                      opacity="0.6"
                    />
                  );
                })}

                {/* Center Pitch */}
                <rect x={cx - 5} y={cy - 20} width={10} height={40} fill="#FDE68A" rx={2} />
                <line x1={cx - 7} y1={cy + 15} x2={cx + 7} y2={cy + 15} stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx={cx} cy={cy + 10} r={2.5} fill="#D97706" />

                {/* Shot Direction Vectors */}
                {filteredShots.map((shot, idx) => {
                  const endpoint = getShotEndpoint(shot.zone, shot.runs, shot.isSix);
                  const strokeColor = shot.isSix
                    ? "#FBBF24" // Gold for 6
                    : shot.isFour
                    ? "#38BDF8" // Cyan for 4
                    : shot.runs >= 2
                    ? "#A7F3D0" // Soft Emerald for 2/3
                    : "#F1F5F9"; // Crisp White for 1
                  const strokeWidth = shot.isSix ? 3 : shot.isFour ? 2.5 : 1.5;

                  return (
                    <g key={`shot-line-${shot.id}-${idx}`}>
                      <line
                        x1={cx}
                        y1={cy + 10}
                        x2={endpoint.x}
                        y2={endpoint.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        opacity={selectedZone && shot.zone !== selectedZone ? 0.2 : 0.9}
                      />
                      <circle
                        cx={endpoint.x}
                        cy={endpoint.y}
                        r={shot.isSix ? 4.5 : shot.isFour ? 3.5 : 2}
                        fill={strokeColor}
                        stroke="#0F172A"
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}

                {/* Zone Labels Around Boundary */}
                {SHOT_ZONES.map((zone) => {
                  const angleRad = ((zone.centerAngle - 90) * Math.PI) / 180;
                  const labelRadius = fieldRadius - 20;
                  const lx = cx + labelRadius * Math.cos(angleRad);
                  const ly = cy + labelRadius * Math.sin(angleRad);
                  const zoneData = summary.zoneBreakdown[zone.key];
                  const isSelected = selectedZone === zone.key;

                  return (
                    <g
                      key={`label-${zone.key}`}
                      onClick={() => setSelectedZone(isSelected ? null : zone.key)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <circle
                        cx={lx}
                        cy={ly}
                        r={12}
                        fill={isSelected ? "#D9A928" : "#0F172A"}
                        stroke={zoneData.runs > 0 ? "#10B981" : "#334155"}
                        strokeWidth={1.5}
                        opacity={0.9}
                      />
                      <text
                        x={lx}
                        y={ly + 3.5}
                        textAnchor="middle"
                        fill={isSelected ? "#111111" : "#FFFFFF"}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {zoneData.runs}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {[
                { id: "all", label: "All Shots" },
                { id: "sixes", label: "6s Only" },
                { id: "fours", label: "4s Only" },
                { id: "singles", label: "1s & 2s" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    filterType === f.id
                      ? "bg-[#D9A928] text-black shadow-md"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {selectedZone && (
                <button
                  onClick={() => setSelectedZone(null)}
                  className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                >
                  Clear Sector Filter ✕
                </button>
              )}
            </div>
          </div>

          {/* Sector Breakdown Panel */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Scoring Sector Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {SHOT_ZONES.map((zone) => {
                const data = summary.zoneBreakdown[zone.key];
                const isSelected = selectedZone === zone.key;

                return (
                  <div
                    key={zone.key}
                    onClick={() => setSelectedZone(isSelected ? null : zone.key)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-[#D9A928]/15 border-[#D9A928] text-white"
                        : data.runs > 0
                        ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200"
                        : "bg-slate-900/20 border-slate-850 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.runs > 0 ? "#10B981" : "#475569" }} />
                      <span className="font-bold tracking-wider">{WAGON_WHEEL_ZONE_DISPLAY_NAMES[zone.key]}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      {data.sixes > 0 && <span className="text-[#FBBF24] font-black text-[10px]">{data.sixes}x6</span>}
                      {data.fours > 0 && <span className="text-[#38BDF8] font-black text-[10px]">{data.fours}x4</span>}
                      <span className="font-black text-sm text-white">{data.runs} <span className="text-[10px] font-normal text-slate-400">runs</span></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FBBF24]" />
                <span>6 Runs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
                <span>4 Runs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#A7F3D0]" />
                <span>2/3 Runs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>1 Run</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
