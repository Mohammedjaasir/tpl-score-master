import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Delivery, ExtraType, Match, MatchSetup, MatchState, WicketInfo } from "@/types/cricket";
import { buildMatchState, setTeamNameResolver } from "@/lib/scoring/engine";
import { lookup, matchRepository, playerRepository, teamRepository } from "@/lib/repositories";
import { supabase } from "@/lib/supabase";

setTeamNameResolver((id) => lookup.team(id)?.name ?? id);

export interface MatchDoc {
  matchId: string;
  setup: MatchSetup;
  deliveries: Delivery[];
  secondInningsStarted: boolean;
  secondInningsOpeners?: { strikerId: string; nonStrikerId: string };
  pendingBowlerIds: [string | null, string | null];
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

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  // ── Load initial state ────────────────────────────────────────────────────
  useEffect(() => {
    setDoc(load(matchId));
    setHydrated(true);
  }, [matchId]);

  // ── Preload match & team entities ─────────────────────────────────────────
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
          teamRepository.get(m.teamAId);
          teamRepository.get(m.teamBId);
          playerRepository.listByTeam(m.teamAId);
          playerRepository.listByTeam(m.teamBId);
        }
      });
    }
  }, [matchId, initialMatch]);

  // ── Live Realtime Sync (Supabase Realtime Channel + BroadcastChannel + Storage)
  useEffect(() => {
    if (!matchId) return;

    // 1. Cross-device Realtime Broadcast Channel via Supabase
    const channelName = `match-live:${matchId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "score_update" }, ({ payload }) => {
        if (payload?.doc && payload.doc.matchId === matchId) {
          setDoc(payload.doc);
          try {
            window.localStorage.setItem(STORAGE_PREFIX + matchId, JSON.stringify(payload.doc));
          } catch {}
        }
      })
      .subscribe();

    channelRef.current = channel;

    // 2. Same-browser Instant Cross-Tab Sync via BroadcastChannel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel(`tpl_match_${matchId}`);
      bc.onmessage = (event) => {
        if (event.data && event.data.matchId === matchId) {
          setDoc(event.data);
        }
      };
      bcRef.current = bc;
    }

    // 3. Fallback Storage Event Listener (for tabs in same origin)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_PREFIX + matchId && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.matchId === matchId) {
            setDoc(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (bcRef.current) {
        bcRef.current.close();
      }
    };
  }, [matchId]);

  // ── Broadcast doc helper (invoked on any scorer action) ────────────────────
  const broadcastDoc = useCallback(
    (newDoc: MatchDoc) => {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + matchId, JSON.stringify(newDoc));
      } catch {}

      // Broadcast to local tabs
      if (bcRef.current) {
        try {
          bcRef.current.postMessage(newDoc);
        } catch {}
      }

      // Broadcast to all remote clients over Supabase Realtime WebSocket
      if (channelRef.current) {
        try {
          channelRef.current.send({
            type: "broadcast",
            event: "score_update",
            payload: { doc: newDoc },
          });
        } catch {}
      }
    },
    [matchId],
  );

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

  const updateSetup = useCallback(
    (patch: Partial<MatchSetup>) => {
      setDoc((d) => {
        const next = { ...d, setup: { ...d.setup, ...patch } };
        broadcastDoc(next);
        return next;
      });
    },
    [broadcastDoc],
  );

  const setBowler = useCallback(
    (bowlerId: string) => {
      setDoc((d) => {
        const nextPending: [string | null, string | null] = [...d.pendingBowlerIds] as [
          string | null,
          string | null,
        ];
        nextPending[currentInningsIndex] = bowlerId;
        const next = { ...d, pendingBowlerIds: nextPending };
        broadcastDoc(next);
        return next;
      });
    },
    [currentInningsIndex, broadcastDoc],
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
        const next = {
          ...d,
          deliveries: [...d.deliveries, delivery],
          syncQueue: [...d.syncQueue, delivery.id],
        };
        broadcastDoc(next);
        return next;
      });
    },
    [match, broadcastDoc],
  );

  const undo = useCallback(() => {
    setDoc((d) => {
      if (d.deliveries.length === 0) return d;
      const last = d.deliveries[d.deliveries.length - 1]!;
      const next = {
        ...d,
        deliveries: d.deliveries.slice(0, -1),
        syncQueue: d.syncQueue.filter((id) => id !== last.id),
      };
      broadcastDoc(next);
      return next;
    });
  }, [broadcastDoc]);

  const editDelivery = useCallback(
    (deliveryId: string, patch: Partial<Delivery>) => {
      setDoc((d) => {
        const next = {
          ...d,
          deliveries: d.deliveries.map((x) => (x.id === deliveryId ? { ...x, ...patch } : x)),
          syncQueue: d.syncQueue.includes(deliveryId) ? d.syncQueue : [...d.syncQueue, deliveryId],
        };
        broadcastDoc(next);
        return next;
      });
    },
    [broadcastDoc],
  );

  const startSecondInnings = useCallback(
    (openers: { strikerId: string; nonStrikerId: string }) => {
      setDoc((d) => {
        const next = { ...d, secondInningsStarted: true, secondInningsOpeners: openers };
        broadcastDoc(next);
        return next;
      });
    },
    [broadcastDoc],
  );

  const reset = useCallback(() => {
    const empty = emptyDoc(matchId);
    setDoc(empty);
    broadcastDoc(empty);
  }, [matchId, broadcastDoc]);

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
