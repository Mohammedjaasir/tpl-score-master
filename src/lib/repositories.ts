import type {
  Match,
  MatchStatus,
  Player,
  PlayerRole,
  SupabaseMatch,
  SupabaseRegistration,
  SupabaseTeam,
  Team,
} from "@/types/cricket";
import { supabase } from "@/lib/supabase";

export const TOURNAMENT_NAME = "TPL 2026";
const REQUEST_TIMEOUT_MS = 6000; // 6 seconds maximum

/**
 * Strict timeout wrapper preventing infinite network hangs on mobile devices.
 */
async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs = REQUEST_TIMEOUT_MS,
  fallbackMsg = "Request timed out",
): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(fallbackMsg)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate a concise short name / abbreviation for a team name.
 */
function deriveTeamShortName(name: string, slug?: string | null): string {
  if (slug) {
    const parts = slug.split("-").filter(Boolean);
    if (parts.length >= 2) {
      return parts.map((p) => p[0]?.toUpperCase()).join("");
    }
  }
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();
  if (words.length === 2) return (words[0]![0]! + words[1]!.slice(0, 2)).toUpperCase();
  return words.map((w) => w[0]!.toUpperCase()).join("").slice(0, 4);
}

/**
 * Generate a short display name for a player (e.g. "Mohamed Imran" -> "M. Imran").
 */
function derivePlayerShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName.trim();
  const last = parts[parts.length - 1];
  const initial = parts[0]![0]?.toUpperCase();
  return `${initial}. ${last}`;
}

export function toTeam(row: SupabaseTeam): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: deriveTeamShortName(row.name, row.slug),
    logoUrl: row.logo_url ?? undefined,
    ownerName: row.owner_name ?? undefined,
    groupName: row.group_name ?? undefined,
    purseBalance: row.purse_balance ?? undefined,
    slug: row.slug ?? undefined,
  };
}

export function toPlayer(row: SupabaseRegistration): Player {
  const rawRole = (row.player_role || "").toLowerCase();
  let role: PlayerRole = "All-rounder";
  if (rawRole.includes("bat")) role = "Batsman";
  else if (rawRole.includes("bowl")) role = "Bowler";
  else if (rawRole.includes("keep")) role = "Wicketkeeper";

  return {
    id: row.id,
    name: row.player_name?.trim() || "Unknown Player",
    shortName: derivePlayerShortName(row.player_name || "Unknown Player"),
    role,
    teamId: row.team_id || "",
    avatar: row.profile_photo_url || undefined,
    referenceId: row.reference_id || undefined,
    soldPrice: row.sold_price || undefined,
    teamRole: row.team_role || undefined,
    auctionStatus: row.auction_status || undefined,
    phone: row.player_phone || undefined,
    dateOfBirth: row.date_of_birth || undefined,
  };
}

export function toMatch(row: SupabaseMatch, matchNumber = 1): Match {
  let status: MatchStatus = "UPCOMING";
  const raw = row.status?.toLowerCase();
  if (raw === "live") status = "LIVE";
  else if (raw === "completed") status = "COMPLETED";
  else if (raw === "scheduled") {
    const start = new Date(row.start_time).getTime();
    const now = Date.now();
    if (!isNaN(start) && now >= start - 2 * 60 * 60 * 1000) {
      status = "READY";
    } else {
      status = "UPCOMING";
    }
  }

  return {
    id: row.id,
    tournament: TOURNAMENT_NAME,
    matchNumber,
    teamAId: row.team_a_id,
    teamBId: row.team_b_id,
    venue: "TPL Cricket Ground",
    overs: row.total_overs || 5,
    scheduledAt: row.start_time,
    status,
    resultText: undefined,
  };
}

// ── In-Memory & LocalStorage Persistent Lookup Cache ────────────────────────
const CACHE_TEAMS_KEY = "tpl_cache_teams";
const CACHE_PLAYERS_KEY = "tpl_cache_players";
const CACHE_MATCHES_KEY = "tpl_cache_matches";

class LookupCache {
  private teamsMap = new Map<string, Team>();
  private playersMap = new Map<string, Player>();
  private matchesMap = new Map<string, Match>();
  private initialHydrated = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const rawTeams = window.localStorage.getItem(CACHE_TEAMS_KEY);
        if (rawTeams) {
          const parsed = JSON.parse(rawTeams);
          if (Array.isArray(parsed)) parsed.forEach((t) => this.teamsMap.set(t.id, t));
        }

        const rawMatches = window.localStorage.getItem(CACHE_MATCHES_KEY);
        if (rawMatches) {
          const parsed = JSON.parse(rawMatches);
          if (Array.isArray(parsed)) parsed.forEach((m) => this.matchesMap.set(m.id, m));
        }

        const rawPlayers = window.localStorage.getItem(CACHE_PLAYERS_KEY);
        if (rawPlayers) {
          const parsed = JSON.parse(rawPlayers);
          if (Array.isArray(parsed)) parsed.forEach((p) => this.playersMap.set(p.id, p));
        }
      } catch {}
    }
  }

  setTeams(teams: Team[]) {
    teams.forEach((t) => this.teamsMap.set(t.id, t));
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CACHE_TEAMS_KEY, JSON.stringify(teams));
      } catch {}
    }
  }

  setPlayers(players: Player[]) {
    players.forEach((p) => this.playersMap.set(p.id, p));
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CACHE_PLAYERS_KEY, JSON.stringify(players));
      } catch {}
    }
  }

  setMatches(matches: Match[]) {
    matches.forEach((m) => this.matchesMap.set(m.id, m));
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CACHE_MATCHES_KEY, JSON.stringify(matches));
      } catch {}
    }
  }

  team(id?: string): Team | undefined {
    if (!id) return undefined;
    return this.teamsMap.get(id);
  }

  player(id?: string): Player | undefined {
    if (!id) return undefined;
    return this.playersMap.get(id);
  }

  playersOf(teamId: string): Player[] {
    return Array.from(this.playersMap.values()).filter((p) => p.teamId === teamId);
  }

  match(id: string): Match | undefined {
    return this.matchesMap.get(id);
  }

  matches(): Match[] {
    return Array.from(this.matchesMap.values()).sort(
      (a, b) => a.matchNumber - b.matchNumber,
    );
  }

  teams(): Team[] {
    return Array.from(this.teamsMap.values());
  }

  players(): Player[] {
    return Array.from(this.playersMap.values());
  }

  isHydrated(): boolean {
    return this.initialHydrated || this.matchesMap.size > 0;
  }

  markHydrated() {
    this.initialHydrated = true;
  }
}

export const lookup = new LookupCache();

// ── Repository Contracts ─────────────────────────────────────────────────────

export interface TeamRepository {
  list(): Promise<Team[]>;
  get(id: string): Promise<Team | undefined>;
}

export interface PlayerRepository {
  list(): Promise<Player[]>;
  listByTeam(teamId: string): Promise<Player[]>;
  get(id: string): Promise<Player | undefined>;
  search(query: string): Promise<Player[]>;
}

export interface MatchRepository {
  list(): Promise<Match[]>;
  get(id: string): Promise<Match | undefined>;
}

// ── Supabase Repositories with Strict Timeout & Resilient Fallbacks ─────────

export class SupabaseTeamRepository implements TeamRepository {
  async list(): Promise<Team[]> {
    try {
      const response = await withTimeout(
        supabase.from("teams").select("*").order("name", { ascending: true }),
        REQUEST_TIMEOUT_MS,
        "Teams load timed out",
      );

      const { data, error } = response;
      if (error) {
        console.warn("[SupabaseTeamRepository] list warning:", error.message);
        if (lookup.teams().length > 0) return lookup.teams();
        throw new Error(`Failed to load teams: ${error.message}`);
      }

      const domainTeams = (data as SupabaseTeam[] || []).map(toTeam);
      lookup.setTeams(domainTeams);
      return domainTeams;
    } catch (err) {
      if (lookup.teams().length > 0) {
        return lookup.teams();
      }
      throw err;
    }
  }

  async get(id: string): Promise<Team | undefined> {
    const cached = lookup.team(id);
    if (cached) return cached;

    try {
      const response = await withTimeout(
        supabase.from("teams").select("*").eq("id", id).single(),
        REQUEST_TIMEOUT_MS,
      );

      const { data, error } = response;
      if (error || !data) return undefined;

      const team = toTeam(data as SupabaseTeam);
      lookup.setTeams([team]);
      return team;
    } catch {
      return lookup.team(id);
    }
  }
}

export class SupabasePlayerRepository implements PlayerRepository {
  async list(): Promise<Player[]> {
    try {
      const response = await withTimeout(
        supabase.from("registrations").select("*").order("player_name", { ascending: true }),
        REQUEST_TIMEOUT_MS,
        "Players load timed out",
      );

      const { data, error } = response;
      if (error) {
        console.warn("[SupabasePlayerRepository] list warning:", error.message);
        if (lookup.players().length > 0) return lookup.players();
        throw new Error(`Failed to load players: ${error.message}`);
      }

      const domainPlayers = (data as SupabaseRegistration[] || []).map(toPlayer);
      lookup.setPlayers(domainPlayers);
      return domainPlayers;
    } catch (err) {
      if (lookup.players().length > 0) return lookup.players();
      throw err;
    }
  }

  async listByTeam(teamId: string): Promise<Player[]> {
    try {
      const response = await withTimeout(
        supabase.from("registrations").select("*").eq("team_id", teamId).order("player_name", { ascending: true }),
        REQUEST_TIMEOUT_MS,
      );

      const { data, error } = response;
      if (error) {
        const cached = lookup.playersOf(teamId);
        if (cached.length > 0) return cached;
        throw new Error(`Failed to load players for team: ${error.message}`);
      }

      const domainPlayers = (data as SupabaseRegistration[] || []).map(toPlayer);
      lookup.setPlayers(domainPlayers);
      return domainPlayers;
    } catch (err) {
      const cached = lookup.playersOf(teamId);
      if (cached.length > 0) return cached;
      throw err;
    }
  }

  async get(id: string): Promise<Player | undefined> {
    const cached = lookup.player(id);
    if (cached) return cached;

    try {
      const response = await withTimeout(
        supabase.from("registrations").select("*").eq("id", id).single(),
        REQUEST_TIMEOUT_MS,
      );

      const { data, error } = response;
      if (error || !data) return undefined;

      const player = toPlayer(data as SupabaseRegistration);
      lookup.setPlayers([player]);
      return player;
    } catch {
      return lookup.player(id);
    }
  }

  async search(query: string): Promise<Player[]> {
    const trimmed = query.trim();
    if (!trimmed) return this.list();

    try {
      const response = await withTimeout(
        supabase
          .from("registrations")
          .select("*")
          .or(`player_name.ilike.%${trimmed}%,reference_id.ilike.%${trimmed}%`)
          .order("player_name", { ascending: true })
          .limit(50),
        REQUEST_TIMEOUT_MS,
      );

      const { data, error } = response;
      if (error) throw new Error(`Failed to search players: ${error.message}`);

      const domainPlayers = (data as SupabaseRegistration[] || []).map(toPlayer);
      lookup.setPlayers(domainPlayers);
      return domainPlayers;
    } catch (err) {
      const cachedMatches = lookup
        .players()
        .filter((p) => p.name.toLowerCase().includes(trimmed.toLowerCase()));
      if (cachedMatches.length > 0) return cachedMatches;
      throw err;
    }
  }
}

export class SupabaseMatchRepository implements MatchRepository {
  async list(): Promise<Match[]> {
    try {
      const response = await withTimeout(
        supabase.from("matches").select("*").order("start_time", { ascending: true }),
        REQUEST_TIMEOUT_MS,
        "Matches load timed out",
      );

      const { data, error } = response;
      if (error) {
        console.warn("[SupabaseMatchRepository] list warning:", error.message);
        if (lookup.matches().length > 0) return lookup.matches();
        throw new Error(`Failed to load matches: ${error.message}`);
      }

      const domainMatches = (data as SupabaseMatch[] || []).map((m, idx) =>
        toMatch(m, idx + 1),
      );
      lookup.setMatches(domainMatches);
      return domainMatches;
    } catch (err) {
      if (lookup.matches().length > 0) {
        return lookup.matches();
      }
      throw err;
    }
  }

  async get(id: string): Promise<Match | undefined> {
    const cached = lookup.match(id);
    if (cached) return cached;

    try {
      const response = await withTimeout(
        supabase.from("matches").select("*").eq("id", id).single(),
        REQUEST_TIMEOUT_MS,
      );

      const { data, error } = response;
      if (error || !data) return undefined;

      const matches = await this.list();
      return matches.find((m) => m.id === id);
    } catch {
      return lookup.match(id);
    }
  }
}

export const teamRepository: TeamRepository = new SupabaseTeamRepository();
export const playerRepository: PlayerRepository = new SupabasePlayerRepository();
export const matchRepository: MatchRepository = new SupabaseMatchRepository();

/**
 * Preloads baseline metadata in the background with timeout safety.
 */
export async function prefetchCricketMetadata(): Promise<void> {
  try {
    const [teams, players, matches] = await Promise.allSettled([
      teamRepository.list(),
      playerRepository.list(),
      matchRepository.list(),
    ]);

    if (teams.status === "fulfilled") lookup.setTeams(teams.value);
    if (players.status === "fulfilled") lookup.setPlayers(players.value);
    if (matches.status === "fulfilled") lookup.setMatches(matches.value);
    lookup.markHydrated();
  } catch (err) {
    console.warn("Background prefetch finished with notice:", err);
  }
}
