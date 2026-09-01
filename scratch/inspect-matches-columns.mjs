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

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

async function main() {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch OpenAPI spec:", res.status, res.statusText);
    return;
  }

  const spec = await res.json();
  console.log("=== PostgREST Definitions ===");
  console.log("Tables:", Object.keys(spec.definitions || {}));

  for (const table of ['matches', 'innings', 'balls', 'registrations', 'teams', 'match_squads']) {
    if (spec.definitions && spec.definitions[table]) {
      console.log(`\n--- ${table} properties ---`);
      console.log(Object.keys(spec.definitions[table].properties || {}));
      console.log(JSON.stringify(spec.definitions[table].properties, null, 2));
    }
  }
}

main().catch(console.error);
