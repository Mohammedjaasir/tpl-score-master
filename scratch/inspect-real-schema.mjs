import fs from 'node:fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const url = env.VITE_SUPABASE_URL || 'https://jhyxoyvxuhbwnqnjvjwh.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

async function queryTable(tableName) {
  const res = await fetch(`${url}/rest/v1/${tableName}?select=*&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact',
    }
  });

  if (!res.ok) {
    return { exists: false, error: res.statusText };
  }

  const range = res.headers.get('content-range'); // e.g. "0-0/10" or "*/0"
  let count = 0;
  if (range && range.includes('/')) {
    count = parseInt(range.split('/')[1], 10) || 0;
  }

  const data = await res.json();
  return {
    exists: true,
    count,
    sample: data[0] || null,
    columns: data[0] ? Object.keys(data[0]) : []
  };
}

async function main() {
  console.log("=== SUPABASE REAL REST SCHEMA INSPECTION ===");
  console.log("Supabase URL:", url);

  const candidateTables = [
    'matches',
    'innings',
    'balls',
    'registrations',
    'teams',
    'players',
    'partnerships',
    'match_events',
    'player_match_stats',
    'playing_xi',
    'shot_locations',
    'scoring_state',
    'tournaments',
    'match_squads',
    'awards',
    'users'
  ];

  const results = {};

  for (const table of candidateTables) {
    const res = await queryTable(table);
    if (res.exists) {
      console.log(`\n[TABLE EXISTS] "${table}" -> Rows: ${res.count}`);
      console.log(`  Columns:`, res.columns);
      results[table] = res;
    } else {
      console.log(`[NOT FOUND] "${table}" -> (${res.error})`);
    }
  }
}

main().catch(err => {
  console.error(err);
});
