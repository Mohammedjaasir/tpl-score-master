import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  teamRepository,
  playerRepository,
  matchRepository,
  prefetchCricketMetadata,
  lookup,
} from "@/lib/repositories";
import type { Match, Player, Team } from "@/types/cricket";
import { buildMatchState } from "@/lib/scoring/engine";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

function getEffectiveMatch(m: Match): Match {
  if (typeof window === "undefined") return m;
  try {
    const raw = window.localStorage.getItem("tpl-scoring:" + m.id);
    if (raw) {
      const doc = JSON.parse(raw);
      if (doc.isCompleted) {
        const computed = buildMatchState({
          match: m,
          setup: doc.setup || { playingXI: {} },
          deliveries: doc.deliveries || [],
          secondInningsStarted: doc.secondInningsStarted || false,
          secondInningsOpeners: doc.secondInningsOpeners,
        });
        return {
          ...m,
          status: "COMPLETED",
          resultText: computed.resultText ?? m.resultText,
          manOfTheMatchId: doc.playerOfTheMatchId ?? m.manOfTheMatchId,
        };
      }
      if (doc.isStarted || (doc.deliveries && doc.deliveries.length > 0) || doc.setup?.battingFirstId) {
        const computed = buildMatchState({
          match: m,
          setup: doc.setup || { playingXI: {} },
          deliveries: doc.deliveries || [],
          secondInningsStarted: doc.secondInningsStarted || false,
          secondInningsOpeners: doc.secondInningsOpeners,
        });
        if (computed.phase === "complete") {
          return {
            ...m,
            status: "COMPLETED",
            resultText: computed.resultText ?? m.resultText,
            manOfTheMatchId: doc.playerOfTheMatchId ?? m.manOfTheMatchId,
          };
        }
        return {
          ...m,
          status: "LIVE",
          resultText: undefined,
          manOfTheMatchId: doc.playerOfTheMatchId ?? m.manOfTheMatchId,
        };
      }
    }
  } catch {}

  // A match without explicit scorer start/deliveries is strictly UPCOMING / SCHEDULED
  if (m.status === "LIVE") {
    return {
      ...m,
      status: "UPCOMING",
    };
  }

  return m;
}

export function useMatches() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Cross-device Realtime channel for global match updates
    const channel = supabase.channel("tpl-tournament-matches", {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "tournament_updated" }, () => {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      })
      .on("broadcast", { event: "match_status_changed" }, () => {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      })
      .subscribe();

    // 2. BroadcastChannel for instant local cross-tab / cross-window sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("tpl-global-tournament");
      bc.onmessage = () => {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      };
    }

    // 3. Storage event listener for cross-tab local storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("tpl-scoring:") || e.key === "tpl_cache_matches") {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      supabase.removeChannel(channel);
      if (bc) bc.close();
    };
  }, [queryClient]);

  return useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const list = await matchRepository.list();
      return list.map(getEffectiveMatch);
    },
    initialData: () => {
      const cached = lookup.matches();
      return cached.length > 0 ? cached.map(getEffectiveMatch) : undefined;
    },
    staleTime: 1000 * 5, // 5 seconds for live matches
    retry: 1,
    retryDelay: 1000,
  });
}

export function useMatch(matchId?: string) {
  return useQuery<Match | undefined>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!matchId) return undefined;
      const m = await matchRepository.get(matchId);
      return m ? getEffectiveMatch(m) : undefined;
    },
    initialData: () => {
      if (!matchId) return undefined;
      const m = lookup.match(matchId);
      return m ? getEffectiveMatch(m) : undefined;
    },
    enabled: !!matchId,
    staleTime: 1000 * 5,
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
