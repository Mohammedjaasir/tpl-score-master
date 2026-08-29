/**
 * TPL 2026 — Cricket Wagon Wheel Core Engine
 * 
 * Provides pure-functional zone mapping, display names, and SVG coordinate projections.
 * Adheres strictly to real recorded data: never invents or guesses shot locations.
 */

export type ShotZoneKey =
  | "fine_leg"
  | "square_leg"
  | "mid_wicket"
  | "long_on"
  | "long_off"
  | "mid_off"
  | "cover"
  | "point"
  | "third_man"
  | "unmapped";

export interface ShotZoneDefinition {
  key: ShotZoneKey;
  displayName: string;
  angleMin: number; // degrees clockwise from top (12 o'clock / straight down ground / Long Off/On)
  angleMax: number;
  centerAngle: number; // For radial drawing
}

/**
 * Custom readable zone names mapped to human-friendly display labels
 */
export const WAGON_WHEEL_ZONE_DISPLAY_NAMES: Record<ShotZoneKey, string> = {
  fine_leg: "FINE LEG",
  square_leg: "SQUARE LEG",
  mid_wicket: "MID WICKET",
  long_on: "LONG ON",
  long_off: "LONG OFF",
  mid_off: "MID OFF",
  cover: "COVER",
  point: "POINT",
  third_man: "THIRD MAN",
  unmapped: "UNMAPPED / NOT RECORDED",
};

/**
 * 8 Standard Cricket Field Scoring Sectors around the pitch
 * (Oriented for a right-handed batter looking down towards bowler/straight ground)
 */
export const SHOT_ZONES: ShotZoneDefinition[] = [
  { key: "long_off", displayName: "LONG OFF", angleMin: 340, angleMax: 20, centerAngle: 0 },
  { key: "mid_off", displayName: "MID OFF", angleMin: 20, angleMax: 60, centerAngle: 40 },
  { key: "cover", displayName: "COVER", angleMin: 60, angleMax: 105, centerAngle: 82.5 },
  { key: "point", displayName: "POINT", angleMin: 105, angleMax: 150, centerAngle: 127.5 },
  { key: "third_man", displayName: "THIRD MAN", angleMin: 150, angleMax: 195, centerAngle: 172.5 },
  { key: "fine_leg", displayName: "FINE LEG", angleMin: 195, angleMax: 240, centerAngle: 217.5 },
  { key: "square_leg", displayName: "SQUARE LEG", angleMin: 240, angleMax: 285, centerAngle: 262.5 },
  { key: "mid_wicket", displayName: "MID WICKET", angleMin: 285, angleMax: 330, centerAngle: 307.5 },
  { key: "long_on", displayName: "LONG ON", angleMin: 330, angleMax: 360, centerAngle: 345 },
];

export interface WagonWheelShot {
  id: string;
  zone: ShotZoneKey;
  runs: number;
  isFour: boolean;
  isSix: boolean;
  over: number;
  ball: number;
  bowlerName?: string;
}

export interface BatterWagonWheelSummary {
  batterId: string;
  batterName: string;
  totalRuns: number;
  mappedRuns: number;
  unmappedRuns: number;
  shots: WagonWheelShot[];
  zoneBreakdown: Record<ShotZoneKey, { runs: number; shots: number; fours: number; sixes: number }>;
  hasLocationData: boolean;
}

/**
 * Calculate Wagon Wheel aggregates for a given batter from delivery records
 */
export function calculateBatterWagonWheel(
  batterId: string,
  batterName: string,
  deliveries: Array<{
    strikerId: string;
    runsOffBat: number;
    shotZone?: ShotZoneKey | string | null;
    overNumber?: number;
    ballNumber?: number;
  }>
): BatterWagonWheelSummary {
  const batterDeliveries = deliveries.filter((d) => d.strikerId === batterId);
  const shots: WagonWheelShot[] = [];
  
  const zoneBreakdown: Record<ShotZoneKey, { runs: number; shots: number; fours: number; sixes: number }> = {
    fine_leg: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    square_leg: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    mid_wicket: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    long_on: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    long_off: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    mid_off: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    cover: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    point: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    third_man: { runs: 0, shots: 0, fours: 0, sixes: 0 },
    unmapped: { runs: 0, shots: 0, fours: 0, sixes: 0 },
  };

  let totalRuns = 0;
  let mappedRuns = 0;
  let unmappedRuns = 0;
  let recordedLocationCount = 0;

  batterDeliveries.forEach((d, idx) => {
    const runs = d.runsOffBat || 0;
    totalRuns += runs;

    const rawZone = (d.shotZone || "").toLowerCase().replace(/[\s-]/g, "_") as ShotZoneKey;
    const isMapped = rawZone in zoneBreakdown && rawZone !== "unmapped";
    const zoneKey: ShotZoneKey = isMapped ? rawZone : "unmapped";

    if (isMapped) {
      recordedLocationCount++;
      mappedRuns += runs;
    } else {
      unmappedRuns += runs;
    }

    const isFour = runs === 4;
    const isSix = runs === 6;

    zoneBreakdown[zoneKey].runs += runs;
    if (runs > 0) {
      zoneBreakdown[zoneKey].shots += 1;
    }
    if (isFour) zoneBreakdown[zoneKey].fours += 1;
    if (isSix) zoneBreakdown[zoneKey].sixes += 1;

    if (runs > 0 || isMapped) {
      shots.push({
        id: `shot-${idx}`,
        zone: zoneKey,
        runs,
        isFour,
        isSix,
        over: d.overNumber || 0,
        ball: d.ballNumber || 0,
      });
    }
  });

  return {
    batterId,
    batterName,
    totalRuns,
    mappedRuns,
    unmappedRuns,
    shots,
    zoneBreakdown,
    hasLocationData: recordedLocationCount > 0,
  };
}
