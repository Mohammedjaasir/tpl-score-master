import type { Match, Player, Team } from "@/types/cricket";
import { matches as mockMatches, players as mockPlayers, teams as mockTeams } from "@/lib/mock-data";

/**
 * Data access contracts. Swap MockXRepository for SupabaseXRepository later
 * without touching the scoring engine or any UI component.
 */
export interface TeamRepository {
  list(): Promise<Team[]>;
  get(id: string): Promise<Team | undefined>;
}

export interface PlayerRepository {
  listByTeam(teamId: string): Promise<Player[]>;
  get(id: string): Promise<Player | undefined>;
}

export interface MatchRepository {
  list(): Promise<Match[]>;
  get(id: string): Promise<Match | undefined>;
}

export class MockTeamRepository implements TeamRepository {
  async list() {
    return mockTeams;
  }
  async get(id: string) {
    return mockTeams.find((t) => t.id === id);
  }
}

export class MockPlayerRepository implements PlayerRepository {
  async listByTeam(teamId: string) {
    return mockPlayers.filter((p) => p.teamId === teamId);
  }
  async get(id: string) {
    return mockPlayers.find((p) => p.id === id);
  }
}

export class MockMatchRepository implements MatchRepository {
  async list() {
    return mockMatches;
  }
  async get(id: string) {
    return mockMatches.find((m) => m.id === id);
  }
}

export const teamRepository: TeamRepository = new MockTeamRepository();
export const playerRepository: PlayerRepository = new MockPlayerRepository();
export const matchRepository: MatchRepository = new MockMatchRepository();

/** Synchronous lookups for render-time convenience (mock source). */
export const lookup = {
  team: (id?: string) => mockTeams.find((t) => t.id === id),
  player: (id?: string) => mockPlayers.find((p) => p.id === id),
  playersOf: (teamId: string) => mockPlayers.filter((p) => p.teamId === teamId),
  match: (id: string) => mockMatches.find((m) => m.id === id),
  matches: () => mockMatches,
};
