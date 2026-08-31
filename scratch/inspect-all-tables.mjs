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

// Query OpenAPI definition of Supabase PostgREST
async function main() {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    }
  });

  const schema = await res.json();
  console.log("=== ALL PUBLIC SUPABASE POSTGREST TABLES / DEFINITIONS ===");
  if (schema.definitions) {
    console.log(Object.keys(schema.definitions));
  } else if (schema.paths) {
    console.log(Object.keys(schema.paths));
  }
}

main().catch(console.error);
