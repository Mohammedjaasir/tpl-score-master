const SUPABASE_URL = "https://emlhfbbkwdpmdodjruje.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGhmYmJrd2RwbWRvZGpydWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzOTUwMzQsImV4cCI6MjEwMTk3MTAzNH0.BsP7lzHtfPxobJ9OfOUaqo7Owv_P4QF2ePGupcR5iZY";
const matchId = process.argv[2] || "1b1ebd1a-c8f7-4336-9688-b1741d75ffce";

async function q(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  return r.json();
}

console.log("\n=== TPL PRODUCTION AUDIT === Match:", matchId);

const innings = await q(`innings?match_id=eq.${matchId}&select=*&order=innings_number.asc`);
console.log("\nINNINGS:", innings.length);
for (const inn of innings) {
  console.log(`  Inn${inn.innings_number}: id=${inn.id} runs=${inn.total_runs} wkts=${inn.total_wickets} overs=${inn.overs_completed} complete=${inn.is_completed}`);
}

const ids = innings.map(i => i.id).join(",");
const balls = ids ? await q(`balls?innings_id=in.(${ids})&select=*&order=client_timestamp.asc`) : [];
console.log("\nBALLS:", balls.length, "total");

// Over-by-over bowler map for Inn1
const inn1balls = balls.filter(b => b.innings_id === innings[0]?.id);
console.log("\n--- INN 1 BOWLER MAP (legal balls only) ---");
let lb = 0;
for (const b of inn1balls) {
  const isWide = b.extra_type === "wide";
  const isNB = b.extra_type === "no-ball";
  const legal = !isWide && !isNB;
  const ov = Math.floor(lb / 6);
  if (legal) lb++;
  console.log(`  O${ov}.${b.ball_number} ${legal?"LEGAL":"EXTRA"} | bowler=${b.bowler_id?.slice(-8)} | extra=${b.extra_type}`);
}
console.log(`  => legalBalls=${lb} | oversCompleted=${Math.floor(lb/6)} | inProgress=${lb%6 !== 0}`);
const needsBowler = lb > 0 && lb % 6 === 0;
console.log(`  => needsBowler=${needsBowler} (over just ended = true means BowlerModal should open)`);

// shot_zone per ball
console.log("\n--- SHOT ZONE PER BALL ---");
for (const b of balls) {
  const zone = b.shot_zone;
  const flag = zone === null ? "NULL?" : zone === "unmapped" || zone === "" ? "unmapped??" : `${zone}?`;
  if (b.runs_off_bat >= 1) {
    console.log(`  Ball ${b.id.slice(-8)} | runs=${b.runs_off_bat} | shot_zone=${flag}`);
  }
}

// 4s and 6s specifically
const boundaries = balls.filter(b => b.runs_off_bat === 4 || b.runs_off_bat === 6);
console.log(`\n--- BOUNDARIES (${boundaries.length} total 4s+6s) ---`);
if (boundaries.length === 0) {
  console.log("  No 4s or 6s in this match.");
} else {
  for (const b of boundaries) {
    const zone = b.shot_zone;
    const flag = zone === null ? "NULL?" : zone === "unmapped" || zone === "" ? "unmapped??" : `${zone}?`;
    console.log(`  O${b.over_number}.${b.ball_number} | ${b.runs_off_bat} runs | striker=${b.striker_id?.slice(-8)} | zone=${flag}`);
  }
}

// wagon wheel simulation
console.log("\n--- WAGON WHEEL SIMULATION ---");
const VALID = new Set(["fine_leg","square_leg","mid_wicket","long_on","long_off","mid_off","cover","point","third_man"]);
const strikers = {};
for (const b of balls) {
  if (!b.striker_id) continue;
  if (!strikers[b.striker_id]) strikers[b.striker_id] = { balls: 0, runs: 0, mapped: 0, unmapped: 0, nullZone: 0, shots: [] };
  const s = strikers[b.striker_id];
  s.balls++;
  s.runs += b.runs_off_bat ?? 0;
  const z = b.shot_zone;
  if (z === null || z === undefined) { s.nullZone++; }
  else if (VALID.has(z)) { s.mapped++; if (b.runs_off_bat > 0) s.shots.push({ runs: b.runs_off_bat, zone: z }); }
  else { s.unmapped++; }
}
for (const [sid, s] of Object.entries(strikers)) {
  const hasData = s.mapped > 0;
  console.log(`  Striker ${sid.slice(-8)}: balls=${s.balls} runs=${s.runs} mapped=${s.mapped} unmapped=${s.unmapped} null=${s.nullZone} hasLocationData=${hasData}`);
  for (const sh of s.shots) console.log(`    Shot: ${sh.runs} runs @ ${sh.zone}`);
}

console.log("\n=== AUDIT COMPLETE ===\n");
