import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import dns from "node:dns";

// Optimize DNS lookup to prefer IPv4 first
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

class ServerDummyWebSocket {}

/**
 * Ultra-fast IPv4 fetch wrapper that bypasses Node 20 Undici IPv6 connect timeouts.
 * Guarantees sub-second connection to Supabase PostgREST on Windows environments.
 */
function createIpv4Fetch(): typeof fetch {
  return (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    return new Promise((resolve, reject) => {
      try {
        const targetUrl = typeof input === "string" ? input : (input as any).url || input.toString();
        const urlObj = new URL(targetUrl);
        const rawHeaders: Record<string, string> = {};

        if (init.headers) {
          if (typeof (init.headers as any).forEach === "function") {
            (init.headers as any).forEach((val: string, key: string) => {
              rawHeaders[key] = val;
            });
          } else if (Array.isArray(init.headers)) {
            for (const [k, v] of init.headers) rawHeaders[k] = v;
          } else {
            Object.assign(rawHeaders, init.headers);
          }
        }

        const body = init.body as any;
        if (body && !rawHeaders["content-length"] && !rawHeaders["Content-Length"]) {
          rawHeaders["Content-Length"] = String(Buffer.byteLength(body));
        }

        const req = https.request(
          urlObj,
          {
            method: init.method || "GET",
            headers: rawHeaders,
            family: 4, // CRITICAL: Force IPv4 to eliminate 10s IPv6 connect timeouts on Windows
            timeout: 20000,
          },
          (res) => {
            let responseBody = "";
            res.on("data", (chunk) => (responseBody += chunk));
            res.on("end", () => {
              const bodyPayload =
                res.statusCode === 204 || res.statusCode === 205 || res.statusCode === 304
                  ? null
                  : responseBody;
              resolve(
                new Response(bodyPayload, {
                  status: res.statusCode,
                  statusText: res.statusMessage,
                  headers: res.headers as any,
                }),
              );
            });
          },
        );

        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy(new Error("Supabase HTTPS connection timed out (IPv4)."));
        });

        if (body) req.write(body);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  };
}

let serverAdminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client with service role authorization.
 * CRITICAL SECURITY: This module must NEVER be imported in client-side code.
 * It is only utilized inside server functions (createServerFn / Nitro handlers).
 */
export function getServerSupabaseAdmin(): SupabaseClient {
  if (serverAdminClient) return serverAdminClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://emlhfbbkwdpmdodjruje.supabase.co";

  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
        if (match) serviceRoleKey = match[1].trim();
      }
    } catch {}
  }

  if (!serviceRoleKey) {
    throw new Error(
      "[Supabase Server Admin] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Server-side mutations cannot proceed.",
    );
  }

  serverAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: { transport: ServerDummyWebSocket as any },
    global: { fetch: createIpv4Fetch() },
  });

  return serverAdminClient;
}

