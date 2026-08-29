import { createServerFn } from "@tanstack/react-start";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import type {
  SupabaseBall,
  SupabaseExtraType,
  SupabaseInnings,
  SupabaseMatch,
  SupabaseWicketType,
} from "@/types/cricket";

export interface StartInningsInput {
  matchId: string;
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
}

export interface RecordBallInput {
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
  extraType: SupabaseExtraType;
  isWicket: boolean;
  wicketType: SupabaseWicketType;
  playerOutId?: string | null;
  fielderId?: string | null;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  isInningsComplete?: boolean;
}

export interface UndoBallInput {
  inningsId: string;
  ballId?: string;
  clientTimestamp?: number;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  isInningsComplete?: boolean;
}

/**
 * Server Function: Authoritatively initializes or fetches an innings in Supabase.
 * Respects unique constraint (match_id, innings_number).
 */
export const startInningsServerFn = createServerFn({ method: "POST" })
  .validator((input: StartInningsInput) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Check if innings already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("innings")
      .select("*")
      .eq("match_id", input.matchId)
      .eq("innings_number", input.inningsNumber)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check existing innings: ${checkError.message}`);
    }

    if (existing) {
      return existing as SupabaseInnings;
    }

    // 2. Insert new innings row
    const { data: created, error: insertError } = await supabaseAdmin
      .from("innings")
      .insert([
        {
          match_id: input.matchId,
          innings_number: input.inningsNumber,
          batting_team_id: input.battingTeamId,
          bowling_team_id: input.bowlingTeamId,
          total_runs: 0,
          total_wickets: 0,
          overs_completed: 0,
          is_completed: false,
        },
      ])
      .select("*")
      .single();

    if (insertError || !created) {
      throw new Error(`Failed to initialize innings: ${insertError?.message || "Unknown error"}`);
    }

    // 3. Ensure match is marked live
    await supabaseAdmin
      .from("matches")
      .update({ status: "live" })
      .eq("id", input.matchId);

    return created as SupabaseInnings;
  });

/**
 * Server Function: Authoritatively persists a delivery in the balls table
 * and updates the running aggregates in the innings table.
 */
export const recordBallServerFn = createServerFn({ method: "POST" })
  .validator((input: RecordBallInput) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Deduplication check: prevent inserting the exact same delivery twice
    const { data: existingBall } = await supabaseAdmin
      .from("balls")
      .select("id")
      .eq("innings_id", input.inningsId)
      .eq("client_timestamp", input.clientTimestamp)
      .maybeSingle();

    let savedBallId: string;

    if (existingBall) {
      savedBallId = existingBall.id;
    } else {
      const ballRow: Omit<SupabaseBall, "id" | "created_at"> = {
        match_id: input.matchId,
        innings_id: input.inningsId,
        client_timestamp: input.clientTimestamp,
        over_number: input.overNumber,
        ball_number: input.ballNumber,
        striker_id: input.strikerId || null,
        non_striker_id: input.nonStrikerId || null,
        bowler_id: input.bowlerId || null,
        runs_off_bat: input.runsOffBat,
        extras: input.extras,
        extra_type: input.extraType,
        is_wicket: input.isWicket,
        wicket_type: input.wicketType,
        player_out_id: input.playerOutId || null,
        fielder_id: input.fielderId || null,
      };

      const { data: insertedBall, error: ballError } = await supabaseAdmin
        .from("balls")
        .insert([ballRow])
        .select("*")
        .single();

      if (ballError || !insertedBall) {
        throw new Error(`Failed to persist ball: ${ballError?.message || "Unknown error"}`);
      }

      savedBallId = insertedBall.id;
    }

    // 2. Synchronize innings aggregates
    const { error: inningsError } = await supabaseAdmin
      .from("innings")
      .update({
        total_runs: input.totalRuns,
        total_wickets: input.totalWickets,
        overs_completed: input.oversCompleted,
        is_completed: input.isInningsComplete ?? false,
      })
      .eq("id", input.inningsId);

    if (inningsError) {
      console.warn("[recordBallServerFn] innings update notice:", inningsError.message);
    }

    return { success: true, ballId: savedBallId };
  });

/**
 * Server Function: Authoritatively removes the latest delivery and recalculates innings totals.
 */
export const undoBallServerFn = createServerFn({ method: "POST" })
  .validator((input: UndoBallInput) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Delete target ball
    if (input.ballId) {
      await supabaseAdmin.from("balls").delete().eq("id", input.ballId);
    } else if (input.clientTimestamp) {
      await supabaseAdmin
        .from("balls")
        .delete()
        .eq("innings_id", input.inningsId)
        .eq("client_timestamp", input.clientTimestamp);
    } else {
      // Delete the most recent ball of the innings
      const { data: latestBall } = await supabaseAdmin
        .from("balls")
        .select("id")
        .eq("innings_id", input.inningsId)
        .order("client_timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestBall) {
        await supabaseAdmin.from("balls").delete().eq("id", latestBall.id);
      }
    }

    // 2. Update innings totals
    await supabaseAdmin
      .from("innings")
      .update({
        total_runs: input.totalRuns,
        total_wickets: input.totalWickets,
        overs_completed: input.oversCompleted,
        is_completed: input.isInningsComplete ?? false,
      })
      .eq("id", input.inningsId);

    return { success: true };
  });

/**
 * Server Function: Loads full authoritative match scorecard from DB.
 */
export const loadMatchScorecardServerFn = createServerFn({ method: "GET" })
  .validator((matchId: string) => matchId)
  .handler(async ({ data: matchId }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    const [matchRes, inningsRes, ballsRes] = await Promise.all([
      supabaseAdmin.from("matches").select("*").eq("id", matchId).single(),
      supabaseAdmin
        .from("innings")
        .select("*")
        .eq("match_id", matchId)
        .order("innings_number", { ascending: true }),
      supabaseAdmin
        .from("balls")
        .select("*")
        .eq("match_id", matchId)
        .order("client_timestamp", { ascending: true }),
    ]);

    if (matchRes.error) {
      throw new Error(`Match not found: ${matchRes.error.message}`);
    }

    return {
      match: matchRes.data as SupabaseMatch,
      innings: (inningsRes.data as SupabaseInnings[]) || [],
      balls: (ballsRes.data as SupabaseBall[]) || [],
    };
  });
