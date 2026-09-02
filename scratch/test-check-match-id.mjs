import { supabase, isSupabaseConfigured } from "../src/lib/supabase.ts";
import { matchRepository, lookup } from "../src/lib/repositories.ts";

console.log("Supabase configured:", isSupabaseConfigured);

async function test() {
  const { data, error } = await supabase.from("matches").select("*");
  console.log("Matches in DB:", data?.length, "Error:", error);
  if (data && data.length > 0) {
    console.log("DB Matches IDs & Status:");
    data.forEach((m) => {
      console.log(`- ID: ${m.id} | Match #${m.match_number} | Status: ${m.match_status} | Team A: ${m.team_a_id} | Team B: ${m.team_b_id}`);
    });
  }
}

test();
