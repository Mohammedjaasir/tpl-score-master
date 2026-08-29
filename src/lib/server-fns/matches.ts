import { createServerFn } from "@tanstack/react-start";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import type { SupabaseMatch } from "@/types/cricket";

export interface FixtureInput {
  id?: string;
  teamAId: string;
  teamBId: string;
  scheduledAt: string;
  overs: number;
}

export interface MatchStatusUpdateInput {
  matchId: string;
  status?: "scheduled" | "live" | "completed" | "abandoned";
  tossWinnerId?: string | null;
  tossDecision?: "bat" | "bowl" | null;
  manOfTheMatchId?: string | null;
}

/**
 * Server Function: Authoritatively reconciles and persists the tournament schedule.
 * Preserves canonical database UUIDs for unchanged/existing fixtures.
 * Only modifies rows with status = 'scheduled'.
 */
export const saveScheduleServerFn = createServerFn({ method: "POST" })
  .validator((fixtures: FixtureInput[]) => fixtures)
  .handler(async ({ data: fixtures }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Fetch all current matches from database
    const { data: existingMatches, error: fetchError } = await supabaseAdmin
      .from("matches")
      .select("*");

    if (fetchError) {
      throw new Error(`Failed to load existing matches: ${fetchError.message}`);
    }

    const allMatches = (existingMatches as SupabaseMatch[]) || [];
    const scheduledRows = allMatches.filter((m) => m.status === "scheduled");

    const matchedExistingIds = new Set<string>();
    const updatesToPerform: Array<{ id: string; patch: Partial<SupabaseMatch> }> = [];
    const rowsToInsert: Array<Omit<SupabaseMatch, "id" | "created_at" | "updated_at">> = [];

    // 2. Reconcile each generated fixture against database
    for (const fixture of fixtures) {
      const exactMatch = scheduledRows.find(
        (m) =>
          m.team_a_id === fixture.teamAId &&
          m.team_b_id === fixture.teamBId &&
          m.start_time === fixture.scheduledAt &&
          (m.total_overs || 5) === (fixture.overs || 5) &&
          !matchedExistingIds.has(m.id),
      );

      if (exactMatch) {
        // UNCHANGED: Exact match found -> PRESERVE CANONICAL DATABASE UUID
        matchedExistingIds.add(exactMatch.id);
      } else {
        const pairingMatch = scheduledRows.find(
          (m) =>
            m.team_a_id === fixture.teamAId &&
            m.team_b_id === fixture.teamBId &&
            !matchedExistingIds.has(m.id),
        );

        if (pairingMatch) {
          // CHANGED: Same pairing, changed time/overs -> UPDATE in place and PRESERVE UUID
          matchedExistingIds.add(pairingMatch.id);
          updatesToPerform.push({
            id: pairingMatch.id,
            patch: {
              start_time: fixture.scheduledAt,
              total_overs: fixture.overs || 5,
            },
          });
        } else {
          // NEW FIXTURE: Genuinely new row to insert
          rowsToInsert.push({
            team_a_id: fixture.teamAId,
            team_b_id: fixture.teamBId,
            start_time: fixture.scheduledAt,
            status: "scheduled",
            total_overs: fixture.overs || 5,
            balls_per_over: 6,
          });
        }
      }
    }

    // 3. Execute updates for changed fixtures
    for (const update of updatesToPerform) {
      const { error: updateError } = await supabaseAdmin
        .from("matches")
        .update(update.patch)
        .eq("id", update.id);

      if (updateError) {
        throw new Error(`Failed to update fixture ${update.id}: ${updateError.message}`);
      }
    }

    // 4. Insert new fixtures
    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("matches")
        .insert(rowsToInsert);

      if (insertError) {
        throw new Error(`Failed to insert new fixtures: ${insertError.message}`);
      }
    }

    // 5. Safely delete only obsolete scheduled fixtures (never live/completed)
    const unneededScheduledIds = scheduledRows
      .filter((m) => !matchedExistingIds.has(m.id))
      .map((m) => m.id);

    if (unneededScheduledIds.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("matches")
        .delete()
        .in("id", unneededScheduledIds);

      if (deleteError) {
        console.warn("[saveScheduleServerFn] delete obsolete notice:", deleteError.message);
      }
    }

    // 6. Return fresh list of all matches
    const { data: updatedMatches, error: refetchError } = await supabaseAdmin
      .from("matches")
      .select("*")
      .order("start_time", { ascending: true });

    if (refetchError) {
      throw new Error(`Failed to refetch matches: ${refetchError.message}`);
    }

    return (updatedMatches as SupabaseMatch[]) || [];
  });

/**
 * Server Function: Safely deletes ONLY scheduled fixtures.
 * Live, Completed, and Abandoned records are strictly protected.
 */
export const resetScheduleServerFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabaseAdmin = getServerSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("matches")
      .delete()
      .eq("status", "scheduled");

    if (error) {
      throw new Error(`Failed to reset upcoming fixtures: ${error.message}`);
    }

    const { data: remainingMatches } = await supabaseAdmin
      .from("matches")
      .select("*")
      .order("start_time", { ascending: true });

    return (remainingMatches as SupabaseMatch[]) || [];
  },
);

/**
 * Server Function: Creates a single new match fixture.
 */
export const createMatchServerFn = createServerFn({ method: "POST" })
  .validator((input: { teamAId: string; teamBId: string; scheduledAt: string; overs: number }) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    const row: Omit<SupabaseMatch, "id" | "created_at" | "updated_at"> = {
      team_a_id: input.teamAId,
      team_b_id: input.teamBId,
      start_time: input.scheduledAt,
      status: "scheduled",
      total_overs: input.overs || 5,
      balls_per_over: 6,
    };

    const { data, error } = await supabaseAdmin
      .from("matches")
      .insert([row])
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create match: ${error?.message || "Unknown error"}`);
    }

    return data as SupabaseMatch;
  });

/**
 * Server Function: Updates match status, toss result, or player of the match.
 */
export const updateMatchStatusServerFn = createServerFn({ method: "POST" })
  .validator((input: MatchStatusUpdateInput) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    const patch: Partial<SupabaseMatch> = {};
    if (input.status) patch.status = input.status;
    if (input.tossWinnerId !== undefined) patch.toss_winner_id = input.tossWinnerId;
    if (input.tossDecision !== undefined) patch.toss_decision = input.tossDecision;
    if (input.manOfTheMatchId !== undefined) patch.man_of_the_match_id = input.manOfTheMatchId;

    const { data, error } = await supabaseAdmin
      .from("matches")
      .update(patch)
      .eq("id", input.matchId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to update match status: ${error?.message || "Unknown error"}`);
    }

    return data as SupabaseMatch;
  });
