import { useQuery } from "@tanstack/react-query";
import {
  teamRepository,
  playerRepository,
  matchRepository,
  prefetchCricketMetadata,
  lookup,
} from "@/lib/repositories";
import type { Match, Player, Team } from "@/types/cricket";
import { useEffect } from "react";

export function usePrefetchCricketData() {
  useEffect(() => {
    prefetchCricketMetadata();
  }, []);
}

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => teamRepository.list(),
    initialData: () => {
      const cached = lookup.teams();
      return cached.length > 0 ? cached : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
}

export function useTeam(teamId?: string) {
  return useQuery<Team | undefined>({
    queryKey: ["team", teamId],
    queryFn: () => (teamId ? teamRepository.get(teamId) : Promise.resolve(undefined)),
    initialData: () => (teamId ? lookup.team(teamId) : undefined),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function usePlayers(teamId?: string) {
  return useQuery<Player[]>({
    queryKey: ["players", teamId ?? "all"],
    queryFn: () => (teamId ? playerRepository.listByTeam(teamId) : playerRepository.list()),
    initialData: () => {
      if (teamId) {
        const cached = lookup.playersOf(teamId);
        return cached.length > 0 ? cached : undefined;
      }
      const cached = lookup.players();
      return cached.length > 0 ? cached : undefined;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function usePlayer(playerId?: string) {
  return useQuery<Player | undefined>({
    queryKey: ["player", playerId],
    queryFn: () => (playerId ? playerRepository.get(playerId) : Promise.resolve(undefined)),
    initialData: () => (playerId ? lookup.player(playerId) : undefined),
    enabled: !!playerId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function usePlayerSearch(query: string) {
  return useQuery<Player[]>({
    queryKey: ["playerSearch", query],
    queryFn: () => playerRepository.search(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useMatches() {
  return useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => matchRepository.list(),
    initialData: () => {
      const cached = lookup.matches();
      return cached.length > 0 ? cached : undefined;
    },
    staleTime: 1000 * 30, // 30 seconds for matches
    retry: 1,
    retryDelay: 1000,
  });
}

export function useMatch(matchId?: string) {
  return useQuery<Match | undefined>({
    queryKey: ["match", matchId],
    queryFn: () => (matchId ? matchRepository.get(matchId) : Promise.resolve(undefined)),
    initialData: () => (matchId ? lookup.match(matchId) : undefined),
    enabled: !!matchId,
    staleTime: 1000 * 30,
    retry: 1,
  });
}

export function useTournamentStats() {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { data: players = [], isLoading: loadingPlayers } = usePlayers();
  const { data: matches = [], isLoading: loadingMatches } = useMatches();

  const liveMatchesCount = matches.filter((m) => m.status === "LIVE").length;
  const upcomingMatchesCount = matches.filter((m) => m.status === "UPCOMING" || m.status === "READY").length;
  const completedMatchesCount = matches.filter((m) => m.status === "COMPLETED").length;

  return {
    totalTeams: teams.length,
    totalPlayers: players.length,
    totalMatches: matches.length,
    liveMatchesCount,
    upcomingMatchesCount,
    completedMatchesCount,
    isLoading: loadingTeams || loadingPlayers || loadingMatches,
  };
}
