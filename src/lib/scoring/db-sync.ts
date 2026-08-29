import { supabase } from "@/lib/supabase";
import type {
  Delivery,
  DismissalType,
  ExtraType,
  SupabaseBall,
  SupabaseExtraType,
  SupabaseInnings,
  SupabaseWicketType,
  WicketInfo,
} from "@/types/cricket";
import {
  recordBallServerFn,
  startInningsServerFn,
  undoBallServerFn,
} from "@/lib/server-fns/scoring";

/**
 * Maps Supabase extra_type enum to domain ExtraType.
 */
export function mapToDomainExtraType(extraType: SupabaseExtraType): ExtraType {
  switch (extraType) {
    case "wide":
      return "wide";
    case "no-ball":
      return "noball";
    case "bye":
      return "bye";
    case "leg-bye":
      return "legbye";
    case "none":
    default:
      return null;
  }
}

/**
 * Maps domain ExtraType to Supabase extra_type enum.
 */
export function mapToSupabaseExtraType(extraType: ExtraType): SupabaseExtraType {
  switch (extraType) {
    case "wide":
      return "wide";
    case "noball":
      return "no-ball";
    case "bye":
      return "bye";
    case "legbye":
      return "leg-bye";
    default:
      return "none";
  }
}

/**
 * Maps Supabase wicket_type enum to domain DismissalType.
 */
export function mapToDomainDismissalType(wicketType: SupabaseWicketType): DismissalType {
  switch (wicketType) {
    case "bowled":
      return "Bowled";
    case "caught":
      return "Caught";
    case "lbw":
      return "LBW";
    case "run-out":
      return "Run Out";
    case "stumped":
      return "Stumped";
    case "hit-wicket":
      return "Hit Wicket";
    case "retired-hurt":
      return "Retired Hurt";
    case "other":
    default:
      return "Other";
  }
}

/**
 * Maps domain DismissalType to Supabase wicket_type enum.
 */
export function mapToSupabaseWicketType(dismissalType?: DismissalType): SupabaseWicketType {
  if (!dismissalType) return "none";
  switch (dismissalType) {
    case "Bowled":
      return "bowled";
    case "Caught":
      return "caught";
    case "LBW":
      return "lbw";
    case "Run Out":
      return "run-out";
    case "Stumped":
      return "stumped";
    case "Hit Wicket":
      return "hit-wicket";
    case "Retired Hurt":
      return "retired-hurt";
    default:
      return "other";
  }
}

/**
 * Converts a SupabaseBall row into an in-memory Delivery object.
 */
export function supabaseBallToDelivery(ball: SupabaseBall, inningsIndex: 0 | 1): Delivery {
  const extraType = mapToDomainExtraType(ball.extra_type);
  let wicket: WicketInfo | undefined;

  if (ball.is_wicket && ball.wicket_type !== "none") {
    wicket = {
      type: mapToDomainDismissalType(ball.wicket_type),
      batterOutId: ball.player_out_id || ball.striker_id || "",
      fielderId: ball.fielder_id || undefined,
    };
  }

  return {
    id: ball.id,
    inningsIndex,
    bowlerId: ball.bowler_id || "",
    strikerId: ball.striker_id || "",
    nonStrikerId: ball.non_striker_id || "",
    batterRuns: ball.runs_off_bat ?? 0,
    extraRuns: ball.extras ?? 0,
    extraType,
    wicket,
    timestamp: Number(ball.client_timestamp || Date.now()),
  };
}

/**
 * Fetches all persisted innings and balls for a match from Supabase (read-only query).
 */
export async function fetchMatchDeliveriesFromSupabase(
  matchId: string,
): Promise<{ deliveries: Delivery[]; innings: SupabaseInnings[] }> {
  try {
    // 1. Fetch innings for this match
    const { data: inningsData, error: innError } = await supabase
      .from("innings")
      .select("*")
      .eq("match_id", matchId)
      .order("innings_number", { ascending: true });

    if (innError || !inningsData || inningsData.length === 0) {
      return { deliveries: [], innings: [] };
    }

    const inningsList = inningsData as SupabaseInnings[];
    const inningsIdToIdx = new Map<string, 0 | 1>();
    inningsList.forEach((inn) => {
      inningsIdToIdx.set(inn.id, inn.innings_number === 2 ? 1 : 0);
    });

    // 2. Fetch all balls for these innings
    const inningsIds = inningsList.map((i) => i.id);
    const { data: ballsData, error: ballsError } = await supabase
      .from("balls")
      .select("*")
      .in("innings_id", inningsIds)
      .order("client_timestamp", { ascending: true });

    if (ballsError || !ballsData) {
      return { deliveries: [], innings: inningsList };
    }

    const deliveries = (ballsData as SupabaseBall[]).map((b) => {
      const idx = inningsIdToIdx.get(b.innings_id) ?? 0;
      return supabaseBallToDelivery(b, idx);
    });

    return { deliveries, innings: inningsList };
  } catch (err) {
    console.warn("[fetchMatchDeliveriesFromSupabase] read error:", err);
    return { deliveries: [], innings: [] };
  }
}

/**
 * Ensures that an innings row exists in Supabase, creating it via server function if missing.
 */
export async function ensureInningsPersisted(
  matchId: string,
  inningsNumber: 1 | 2,
  battingTeamId: string,
  bowlingTeamId: string,
): Promise<SupabaseInnings> {
  return await startInningsServerFn({
    data: {
      matchId,
      inningsNumber,
      battingTeamId,
      bowlingTeamId,
    },
  });
}

/**
 * Persists a ball to Supabase via server function.
 */
export async function persistBall(params: {
  matchId: string;
  inningsId: string;
  clientTimestamp: number;
  overNumber: number;
  ballNumber: number;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsOffBat: number;
  extras: number;
  extraType: ExtraType;
  wicket?: WicketInfo;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  isInningsComplete?: boolean;
}): Promise<{ success: boolean; ballId: string }> {
  return await recordBallServerFn({
    data: {
      matchId: params.matchId,
      inningsId: params.inningsId,
      clientTimestamp: params.clientTimestamp,
      overNumber: params.overNumber,
      ballNumber: params.ballNumber,
      strikerId: params.strikerId,
      nonStrikerId: params.nonStrikerId,
      bowlerId: params.bowlerId,
      runsOffBat: params.runsOffBat,
      extras: params.extras,
      extraType: mapToSupabaseExtraType(params.extraType),
      isWicket: Boolean(params.wicket),
      wicketType: mapToSupabaseWicketType(params.wicket?.type),
      playerOutId: params.wicket?.batterOutId || null,
      fielderId: params.wicket?.fielderId || null,
      totalRuns: params.totalRuns,
      totalWickets: params.totalWickets,
      oversCompleted: params.oversCompleted,
      isInningsComplete: params.isInningsComplete,
    },
  });
}

/**
 * Undoes the last ball via server function.
 */
export async function undoPersistedBall(params: {
  inningsId: string;
  ballId?: string;
  clientTimestamp?: number;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  isInningsComplete?: boolean;
}): Promise<{ success: boolean }> {
  return await undoBallServerFn({
    data: params,
  });
}
