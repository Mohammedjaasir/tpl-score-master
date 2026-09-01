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
 * Server Function: Safely resets ALL tournament matches, innings, deliveries, and match squads.
 * Master players (registrations) and teams are strictly preserved.
 */
export const resetAllTournamentMatchesServerFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Delete from match_squads (if any)
    const { error: squadsError } = await supabaseAdmin
      .from("match_squads")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (squadsError) {
      console.warn("[resetAllTournamentMatchesServerFn] squads notice:", squadsError.message);
    }

    // 2. Delete all deliveries / balls
    const { error: ballsError } = await supabaseAdmin
      .from("balls")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (ballsError) {
      console.warn("[resetAllTournamentMatchesServerFn] balls notice:", ballsError.message);
    }

    // 3. Delete all innings
    const { error: inningsError } = await supabaseAdmin
      .from("innings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (inningsError) {
      console.warn("[resetAllTournamentMatchesServerFn] innings notice:", inningsError.message);
    }

    // 4. Delete all matches
    const { error: matchesError } = await supabaseAdmin
      .from("matches")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (matchesError) {
      throw new Error(`Failed to delete tournament matches: ${matchesError.message}`);
    }

    return {
      success: true,
      message: "All tournament matches and scoring records successfully reset.",
    };
  }
);

export interface GenerateScheduleInput {
  group1TeamIds: string[];
  group2TeamIds: string[];
  startDate: string;
  startTime: string; // HH:mm or parsed 24h
  overs: number;
  ballsPerOver: number;
  intervalMinutes: number;
}

/**
 * Server Function: Generates 9 cross-group tournament matches between Group 1 and Group 2.
 */
export const generateTournamentScheduleServerFn = createServerFn({ method: "POST" })
  .validator((input: GenerateScheduleInput) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    if (!input.group1TeamIds || input.group1TeamIds.length !== 3) {
      throw new Error("Group 1 must contain exactly 3 teams.");
    }
    if (!input.group2TeamIds || input.group2TeamIds.length !== 3) {
      throw new Error("Group 2 must contain exactly 3 teams.");
    }

    const allTeams = [...input.group1TeamIds, ...input.group2TeamIds];
    const uniqueTeams = new Set(allTeams);
    if (uniqueTeams.size !== 6) {
      throw new Error("All 6 selected tournament teams must be distinct.");
    }

    const overs = Math.max(1, Number(input.overs) || 5);
    const ballsPerOver = Math.max(1, Number(input.ballsPerOver) || 6);
    const intervalMinutes = Math.max(15, Number(input.intervalMinutes) || 45);

    // Parse base start datetime (safely handle 00:00 midnight)
    const timeParts = (input.startTime || "09:00").split(":");
    const parsedHour = parseInt(timeParts[0], 10);
    const parsedMin = parseInt(timeParts[1], 10);
    const hours = isNaN(parsedHour) ? 9 : Math.max(0, Math.min(23, parsedHour));
    const minutes = isNaN(parsedMin) ? 0 : Math.max(0, Math.min(59, parsedMin));
    const [y, m, d] = (input.startDate || "2026-08-30").split("-").map(Number);
    const baseDate = new Date(y, (m || 1) - 1, d || 1, hours, minutes, 0, 0);

    const fixturesToInsert: Omit<SupabaseMatch, "id" | "created_at" | "updated_at">[] = [];
    let matchCount = 1;

    // Generate 9 cross-group fixtures (3 x 3)
    for (let i = 0; i < input.group1TeamIds.length; i++) {
      for (let j = 0; j < input.group2TeamIds.length; j++) {
        const scheduledTime = new Date(baseDate.getTime() + (matchCount - 1) * intervalMinutes * 60 * 1000);
        fixturesToInsert.push({
          team_a_id: input.group1TeamIds[i],
          team_b_id: input.group2TeamIds[j],
          start_time: scheduledTime.toISOString(),
          status: "scheduled",
          total_overs: overs,
          balls_per_over: ballsPerOver,
        });
        matchCount++;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("matches")
      .insert(fixturesToInsert)
      .select("*")
      .order("start_time", { ascending: true });

    if (error || !data) {
      const errMsg = (error?.message || "Unknown error").replace(/^(Failed to generate schedule:\s*)+/i, "").trim();
      throw new Error(`Failed to generate schedule: ${errMsg}`);
    }

    return data as SupabaseMatch[];
  });

export interface CreateSingleMatchInput {
  teamAId: string;
  teamBId: string;
  scheduledAt: string;
  overs: number;
  ballsPerOver?: number;
  venue?: string;
  matchNumber?: number;
}

/**
 * Server Function: Creates a single new tournament match fixture with comprehensive server-side validation.
 */
export const createSingleMatchServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateSingleMatchInput) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Validate team inputs
    if (!input.teamAId || !input.teamBId) {
      throw new Error("Both Team 1 and Team 2 must be selected.");
    }
    if (input.teamAId === input.teamBId) {
      throw new Error("Team 1 and Team 2 cannot be the same team.");
    }

    // 2. Validate official teams existence
    const { data: teamRows, error: teamQueryError } = await supabaseAdmin
      .from("teams")
      .select("id, name")
      .in("id", [input.teamAId, input.teamBId]);

    if (teamQueryError || !teamRows || teamRows.length !== 2) {
      throw new Error("Selected teams must be valid official tournament teams.");
    }

    // 3. Validate scheduled date and time
    const parsedDate = new Date(input.scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Please provide a valid match date and start time.");
    }

    // 4. Validate overs & balls per over
    const overs = Math.max(1, Math.min(50, Math.floor(Number(input.overs) || 5)));
    const ballsPerOver = Math.max(1, Math.min(12, Math.floor(Number(input.ballsPerOver) || 6)));

    const row: Omit<SupabaseMatch, "id" | "created_at" | "updated_at"> = {
      team_a_id: input.teamAId,
      team_b_id: input.teamBId,
      start_time: parsedDate.toISOString(),
      status: "scheduled",
      total_overs: overs,
      balls_per_over: ballsPerOver,
    };

    const { data, error } = await supabaseAdmin
      .from("matches")
      .insert([row])
      .select("*")
      .single();

    if (error || !data) {
      const errMsg = (error?.message || "Unknown error").replace(/^(Failed to create match fixture:\s*)+/i, "").trim();
      throw new Error(`Failed to create match fixture: ${errMsg}`);
    }

    return data as SupabaseMatch;
  });

/**
 * Server Function: Alias for backward compatibility.
 */
export const createMatchServerFn = createSingleMatchServerFn;

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

/**
 * Server Function: Authoritatively updates total_overs for a match in Supabase.
 */
export const updateMatchOversServerFn = createServerFn({ method: "POST" })
  .validator((input: { matchId: string; overs: number }) => input)
  .handler(async ({ data: input }) => {
    const supabaseAdmin = getServerSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("matches")
      .update({ total_overs: input.overs })
      .eq("id", input.matchId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to update match overs: ${error?.message || "Unknown error"}`);
    }

    return data as SupabaseMatch;
  });
