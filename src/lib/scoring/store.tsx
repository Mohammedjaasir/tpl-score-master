import { useCallback, useEffect, useMemo, useState } from "react";
import type { Delivery, ExtraType, Match, MatchSetup, MatchState, WicketInfo } from "@/types/cricket";
import { buildMatchState, setTeamNameResolver } from "@/lib/scoring/engine";
import { lookup, matchRepository, playerRepository, teamRepository } from "@/lib/repositories";

setTeamNameResolver((id) => lookup.team(id)?.name ?? id);

export interface MatchDoc {
  matchId: string;
  setup: MatchSetup;
  deliveries: Delivery[];
  secondInningsStarted: boolean;
  secondInningsOpeners?: { strikerId: string; nonStrikerId: string };
  pendingBowlerIds: [string | null, string | null];
  /** Placeholder for future offline sync: unsynced event ids. */
  syncQueue: string[];
}

const STORAGE_PREFIX = "tpl-scoring:";

function emptyDoc(matchId: string): MatchDoc {
  return {
    matchId,
    setup: { playingXI: {} },
    deliveries: [],
    secondInningsStarted: false,
    pendingBowlerIds: [null, null],
    syncQueue: [],
  };
}

function load(matchId: string): MatchDoc {
  if (typeof window === "undefined") return emptyDoc(matchId);
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + matchId);
    if (!raw) return emptyDoc(matchId);
    return { ...emptyDoc(matchId), ...(JSON.parse(raw) as MatchDoc) };
  } catch {
    return emptyDoc(matchId);
  }
}

export interface DeliveryInput {
  batterRuns: number;
  extraRuns: number;
  extraType: ExtraType;
  wicket?: WicketInfo;
}

export function useMatchStore(matchId: string, initialMatch?: Match) {
  const [doc, setDoc] = useState<MatchDoc>(() => emptyDoc(matchId));
  const [hydrated, setHydrated] = useState(false);
  const [matchData, setMatchData] = useState<Match | undefined>(
    () => initialMatch ?? lookup.match(matchId),
  );

  useEffect(() => {
    setDoc(load(matchId));
    setHydrated(true);
  }, [matchId]);

  useEffect(() => {
    if (initialMatch) {
      setMatchData(initialMatch);
      return;
    }
    const cached = lookup.match(matchId);
    if (cached) {
      setMatchData(cached);
    } else {
      matchRepository.get(matchId).then((m) => {
        if (m) {
          setMatchData(m);
          // Also preload teams and team players for seamless lookups
          teamRepository.get(m.teamAId);
          teamRepository.get(m.teamBId);
          playerRepository.listByTeam(m.teamAId);
          playerRepository.listByTeam(m.teamBId);
        }
      });
    }
  }, [matchId, initialMatch]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + matchId, JSON.stringify(doc));
    } catch {
      /* storage unavailable — scoring continues in memory */
    }
  }, [doc, matchId, hydrated]);

  const match = matchData ?? lookup.match(matchId);

  const state: MatchState | undefined = useMemo(() => {
    if (!match) return undefined;
    return buildMatchState({
      match,
      setup: doc.setup,
      deliveries: doc.deliveries,
      secondInningsStarted: doc.secondInningsStarted,
      ...(doc.secondInningsOpeners ? { secondInningsOpeners: doc.secondInningsOpeners } : {}),
    });
  }, [match, doc]);

  const currentInningsIndex: 0 | 1 = state?.currentInningsIndex ?? 0;
  const innings = state?.innings[currentInningsIndex];
  const pendingBowlerId = doc.pendingBowlerIds[currentInningsIndex];
  const activeBowlerId = innings?.currentBowlerId ?? pendingBowlerId ?? undefined;

  const updateSetup = useCallback((patch: Partial<MatchSetup>) => {
    setDoc((d) => ({ ...d, setup: { ...d.setup, ...patch } }));
  }, []);

  const setBowler = useCallback(
    (bowlerId: string) => {
      setDoc((d) => {
        const next: [string | null, string | null] = [...d.pendingBowlerIds] as [
          string | null,
          string | null,
        ];
        next[currentInningsIndex] = bowlerId;
        return { ...d, pendingBowlerIds: next };
      });
    },
    [currentInningsIndex],
  );

  const record = useCallback(
    (input: DeliveryInput) => {
      setDoc((d) => {
        const built = buildMatchState({
          match: match!,
          setup: d.setup,
          deliveries: d.deliveries,
          secondInningsStarted: d.secondInningsStarted,
          ...(d.secondInningsOpeners ? { secondInningsOpeners: d.secondInningsOpeners } : {}),
        });
        const idx = built.currentInningsIndex;
        const inn = built.innings[idx];
        if (!inn || inn.isComplete) return d;
        const bowlerId = inn.currentBowlerId ?? d.pendingBowlerIds[idx] ?? undefined;
        if (!bowlerId || !inn.strikerId || !inn.nonStrikerId) return d;
        const delivery: Delivery = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          inningsIndex: idx,
          bowlerId,
          strikerId: inn.strikerId,
          nonStrikerId: inn.nonStrikerId,
          batterRuns: input.batterRuns,
          extraRuns: input.extraRuns,
          extraType: input.extraType,
          ...(input.wicket ? { wicket: input.wicket } : {}),
          timestamp: Date.now(),
        };
        return {
          ...d,
          deliveries: [...d.deliveries, delivery],
          syncQueue: [...d.syncQueue, delivery.id],
        };
      });
    },
    [match],
  );

  const undo = useCallback(() => {
    setDoc((d) => {
      if (d.deliveries.length === 0) return d;
      const last = d.deliveries[d.deliveries.length - 1]!;
      return {
        ...d,
        deliveries: d.deliveries.slice(0, -1),
        syncQueue: d.syncQueue.filter((id) => id !== last.id),
      };
    });
  }, []);

  const editDelivery = useCallback((deliveryId: string, patch: Partial<Delivery>) => {
    setDoc((d) => ({
      ...d,
      deliveries: d.deliveries.map((x) => (x.id === deliveryId ? { ...x, ...patch } : x)),
      syncQueue: d.syncQueue.includes(deliveryId) ? d.syncQueue : [...d.syncQueue, deliveryId],
    }));
  }, []);

  const startSecondInnings = useCallback(
    (openers: { strikerId: string; nonStrikerId: string }) => {
      setDoc((d) => ({ ...d, secondInningsStarted: true, secondInningsOpeners: openers }));
    },
    [],
  );

  const reset = useCallback(() => setDoc(emptyDoc(matchId)), [matchId]);

  return {
    doc,
    hydrated,
    match,
    state,
    innings,
    activeBowlerId,
    updateSetup,
    setBowler,
    record,
    undo,
    editDelivery,
    startSecondInnings,
    reset,
  };
}

export type MatchStore = ReturnType<typeof useMatchStore>;
