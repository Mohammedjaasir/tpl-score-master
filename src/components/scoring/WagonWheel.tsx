import React, { useState } from "react";
import {
  SHOT_ZONES,
  WAGON_WHEEL_ZONE_DISPLAY_NAMES,
  type BatterWagonWheelSummary,
  type ShotZoneKey,
} from "@/lib/scoring/wagon-wheel";
import { Compass, PieChart, RotateCcw } from "lucide-react";

interface WagonWheelProps {
  summary: BatterWagonWheelSummary;
  className?: string;
  batterStat?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  };
}

type FilterType = "all" | "1s" | "2s" | "3s" | "4s" | "6s";

export const WagonWheel: React.FC<WagonWheelProps> = ({ summary, className = "", batterStat }) => {
  const [selectedZone, setSelectedZone] = useState<ShotZoneKey | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");

  const cx = 200;
  const cy = 200;
  const fieldRadius = 165;
  const innerRingRadius = 95;

  // Filter shots based on user selection
  const filteredShots = summary.shots.filter((shot) => {
    if (shot.zone === "unmapped") return false;
    if (selectedZone && shot.zone !== selectedZone) return false;
    if (filterType === "1s" && shot.runs !== 1) return false;
    if (filterType === "2s" && shot.runs !== 2) return false;
    if (filterType === "3s" && shot.runs !== 3) return false;
    if (filterType === "4s" && !shot.isFour && shot.runs !== 4) return false;
    if (filterType === "6s" && !shot.isSix && shot.runs !== 6) return false;
    return true;
  });

  // Calculate endpoint for a shot based on zone angle and shot power
  const getShotEndpoint = (zoneKey: ShotZoneKey, runs: number, isSix: boolean) => {
    const zone = SHOT_ZONES.find((z) => z.key === zoneKey);
    if (!zone) return { x: cx, y: cy };

    const angleRad = ((zone.centerAngle - 90) * Math.PI) / 180;
    const distance = isSix
      ? fieldRadius + 15
      : runs >= 4
      ? fieldRadius - 5
      : runs >= 2
      ? innerRingRadius + 35
      : innerRingRadius - 15;

    return {
      x: cx + distance * Math.cos(angleRad),
      y: cy + distance * Math.sin(angleRad),
    };
  };

  const runsCount = batterStat?.runs ?? summary.totalRuns;
  const ballsCount = batterStat?.balls ?? summary.totalBalls;
  const foursCount = batterStat?.fours ?? Object.values(summary.zoneBreakdown).reduce((acc, z) => acc + z.fours, 0);
  const sixesCount = batterStat?.sixes ?? Object.values(summary.zoneBreakdown).reduce((acc, z) => acc + z.sixes, 0);
  const srText = batterStat?.strikeRate
    ? batterStat.strikeRate.toFixed(1)
    : ballsCount > 0
    ? ((runsCount / ballsCount) * 100).toFixed(1)
    : "-";

  const mappedShotsCount = summary.shots.filter((s) => s.zone !== "unmapped").length;
  const unmappedShotsCount =
    summary.unmappedCount ??
    summary.shots.filter((s) => s.zone === "unmapped").length;

  return (
    <div className={`flex flex-col gap-4 bg-white border border-[#E5E5E5] rounded-3xl p-4 sm:p-6 shadow-sm ${className}`}>
      {/* ── HEADER & PLAYER STAT LINE ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Compass className="h-3.5 w-3.5 text-[#D9A928]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
              WAGON WHEEL ANALYTICS
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase text-[#111111] tracking-tight">
            {summary.batterName}
          </h3>
        </div>

        {/* Cricket Performance Metrics Bar */}
        <div className="flex items-center gap-3 sm:gap-4 bg-[#F7F7F5] border border-[#E5E5E5] px-3.5 py-2 rounded-2xl">
          <div className="text-center">
            <span className="text-base sm:text-lg font-black text-[#111111] tabular-nums">{runsCount}</span>
            <span className="text-[9px] font-bold text-[#5F6368] uppercase block leading-none">Runs</span>
          </div>
          <div className="h-6 w-px bg-[#E5E5E5]" />
          <div className="text-center">
            <span className="text-base sm:text-lg font-black text-[#111111] tabular-nums">{ballsCount}</span>
            <span className="text-[9px] font-bold text-[#5F6368] uppercase block leading-none">Balls</span>
          </div>
          <div className="h-6 w-px bg-[#E5E5E5]" />
          <div className="text-center">
            <span className="text-base sm:text-lg font-black text-[#D9A928] tabular-nums">{foursCount}</span>
            <span className="text-[9px] font-bold text-[#5F6368] uppercase block leading-none">4s</span>
          </div>
          <div className="h-6 w-px bg-[#E5E5E5]" />
          <div className="text-center">
            <span className="text-base sm:text-lg font-black text-[#DC2626] tabular-nums">{sixesCount}</span>
            <span className="text-[9px] font-bold text-[#5F6368] uppercase block leading-none">6s</span>
          </div>
          <div className="h-6 w-px bg-[#E5E5E5]" />
          <div className="text-center">
            <span className="text-base sm:text-lg font-black text-[#111111] tabular-nums">{srText}</span>
            <span className="text-[9px] font-bold text-[#5F6368] uppercase block leading-none">SR</span>
          </div>
        </div>
      </div>

      {/* Mapped vs Unmapped Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-bold text-[#5F6368]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#111111]">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            Mapped Shots: <strong className="text-[#111111] font-black">{mappedShotsCount}</strong>
          </span>
          <span className="text-[#E5E5E5]">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#94A3B8]" />
            Unmapped Deliveries: <strong className="text-[#111111] font-black">{unmappedShotsCount}</strong>
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[#9A6A05] bg-[#D9A928]/15 px-2 py-0.5 rounded-md font-extrabold border border-[#D9A928]/30">
          Genuine Coordinates Only
        </span>
      </div>

      {/* When NO location data is recorded */}
      {!summary.hasLocationData || mappedShotsCount === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-center text-[#5F6368] shadow-xs">
            <PieChart className="h-6 w-6 text-[#D9A928]" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#111111]">
              NO SHOT LOCATION DATA RECORDED
            </h4>
            <p className="text-xs text-[#5F6368] max-w-sm mt-1">
              Deliveries for this batter were scored without manual shot mapping.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2 pt-3 border-t border-[#E5E5E5] w-full max-w-xs text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E5] text-[#111111] font-bold">
              Total Runs: <strong>{runsCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E5] text-[#111111] font-bold">
              Balls Faced: <strong>{ballsCount}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* Real Data Cricket Field Visualization */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* SVG Field Graphic */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square">
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
                {/* Outfield Grass */}
                <circle cx={cx} cy={cy} r={fieldRadius} fill="#14532D" stroke="#166534" strokeWidth="2.5" />
                <circle cx={cx} cy={cy} r={fieldRadius + 8} fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

                {/* 30-Yard Circle */}
                <circle cx={cx} cy={cy} r={innerRingRadius} fill="#15803D" fillOpacity="0.4" stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="4,4" />

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
                      stroke="#166534"
                      strokeWidth="1"
                      strokeDasharray="2,3"
                      opacity="0.7"
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
                    ? "#EF4444" // Crimson Red for 6s
                    : shot.isFour || shot.runs === 4
                    ? "#D9A928" // TPL Gold for 4s
                    : shot.runs >= 2
                    ? "#38BDF8" // Sky Blue for 2/3 runs
                    : "#F1F5F9"; // Clean Off-White for 1s
                  const strokeWidth = shot.isSix ? 3 : shot.isFour || shot.runs === 4 ? 2.5 : 1.5;

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
                        opacity={selectedZone && shot.zone !== selectedZone ? 0.15 : 0.95}
                      />
                      <circle
                        cx={endpoint.x}
                        cy={endpoint.y}
                        r={shot.isSix ? 4.5 : shot.isFour || shot.runs === 4 ? 3.5 : 2.2}
                        fill={strokeColor}
                        stroke="#0F172A"
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}

                {/* Sector Labels with Runs Badge */}
                {SHOT_ZONES.map((zone) => {
                  const angleRad = ((zone.centerAngle - 90) * Math.PI) / 180;
                  const labelRadius = fieldRadius - 18;
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
                        r={11}
                        fill={isSelected ? "#D9A928" : "#0F172A"}
                        stroke={zoneData.runs > 0 ? "#10B981" : "#334155"}
                        strokeWidth={1.5}
                        opacity={0.95}
                      />
                      <text
                        x={lx}
                        y={ly + 3.5}
                        textAnchor="middle"
                        fill={isSelected ? "#111111" : "#FFFFFF"}
                        fontSize="8.5"
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

            {/* Filter Tabs: ALL | 1s | 2s | 3s | 4s | 6s */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {[
                { id: "all", label: "ALL" },
                { id: "1s", label: "1s" },
                { id: "2s", label: "2s" },
                { id: "3s", label: "3s" },
                { id: "4s", label: "4s" },
                { id: "6s", label: "6s" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as FilterType)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    filterType === f.id
                      ? "bg-[#111111] text-[#D9A928] border border-[#D9A928] shadow-xs"
                      : "bg-[#F7F7F5] text-[#5F6368] hover:text-[#111111] border border-[#E5E5E5]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {selectedZone && (
                <button
                  onClick={() => setSelectedZone(null)}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Sector</span>
                </button>
              )}
            </div>
          </div>

          {/* Sector Breakdown Table */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5F6368]">
                Zone Distribution
              </span>
              <span className="text-[10px] font-bold text-[#5F6368]">
                {filteredShots.length} Shown / {mappedShotsCount} Mapped
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
              {SHOT_ZONES.map((zone) => {
                const data = summary.zoneBreakdown[zone.key];
                const pct = summary.totalRuns > 0 ? Math.round((data.runs / summary.totalRuns) * 100) : 0;
                const isSelected = selectedZone === zone.key;

                return (
                  <div
                    key={zone.key}
                    onClick={() => setSelectedZone(isSelected ? null : zone.key)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#D9A928] bg-[#D9A928]/10 font-bold"
                        : "border-[#E5E5E5] bg-[#F7F7F5] hover:border-[#D9A928]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          data.runs > 0 ? "bg-[#10B981]" : "bg-[#CBD5E1]"
                        }`}
                      />
                      <span className="truncate font-black text-[#111111]">
                        {WAGON_WHEEL_ZONE_DISPLAY_NAMES[zone.key]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-black text-[#111111] tabular-nums">
                        {data.runs}r <span className="text-[#5F6368] font-normal">({data.shots})</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#5F6368] tabular-nums w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
