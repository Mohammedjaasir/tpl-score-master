import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Shared in-memory OBS state across all browser processes on the local machine
type ServerObsState = {
  activeMatchId: string | null;
  activeGraphic: any | null;
  streamUrl: string | null;
  version: number;
  updatedAt: number;
};

const defaultObsState: ServerObsState = {
  activeMatchId: null,
  activeGraphic: null,
  streamUrl: null,
  version: 0,
  updatedAt: Date.now(),
};

declare global {
  // eslint-disable-next-line no-var
  var __TPL_SERVER_OBS_STATE__: ServerObsState | undefined;
}

function getGlobalObsState(): ServerObsState {
  if (!globalThis.__TPL_SERVER_OBS_STATE__) {
    globalThis.__TPL_SERVER_OBS_STATE__ = { ...defaultObsState };
  }
  return globalThis.__TPL_SERVER_OBS_STATE__;
}

async function handleObsStateApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/obs-state") {
    return null;
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const state = getGlobalObsState();

  if (request.method === "GET") {
    return new Response(JSON.stringify(state), { status: 200, headers: corsHeaders });
  }

  if (request.method === "POST") {
    try {
      const body = (await request.json()) as any;
      if (body.activeMatchId !== undefined) {
        state.activeMatchId = body.activeMatchId;
      }
      if (body.eventType === "SWITCH_MATCH" && body.matchId) {
        state.activeMatchId = body.matchId;
      }
      if (body.eventType === "SET_GRAPHIC") {
        state.activeGraphic = body.graphicState || null;
      } else if (body.eventType === "CLEAR_GRAPHIC") {
        state.activeGraphic = null;
      } else if (body.graphicState !== undefined) {
        state.activeGraphic = body.graphicState;
      }
      if (body.eventType === "SET_STREAM_URL") {
        state.streamUrl = body.streamUrl || null;
      } else if (body.streamUrl !== undefined) {
        state.streamUrl = body.streamUrl || null;
      }
      state.version += 1;
      state.updatedAt = Date.now();
      return new Response(JSON.stringify({ ok: true, state }), { status: 200, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message }), { status: 400, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleObsStateApi(request);
      if (apiResponse) {
        return apiResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error: any) {
      if (
        error?.code === "ECONNRESET" ||
        error?.message?.includes("ECONNRESET") ||
        error?.name === "AbortError"
      ) {
        return new Response(null, { status: 499 });
      }
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

