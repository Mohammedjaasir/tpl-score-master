import { useState, useEffect, useCallback, useRef } from "react";
import { type GraphicState, type ObsCommand, obsHandlerService } from "@/lib/obsHandlerService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export function useObsHandlerMaster(matchId: string | undefined) {
  const [activeGraphic, setActiveGraphic] = useState<GraphicState | null>(() => {
    return obsHandlerService.getActiveGraphic(matchId || "") || obsHandlerService.getGlobalActiveGraphic();
  });
  const [isOverlayConnected, setIsOverlayConnected] = useState<boolean>(false);
  
  // Keep a ref to always have latest state for sync requests without stale closures
  const activeGraphicRef = useRef(activeGraphic);
  useEffect(() => {
    activeGraphicRef.current = activeGraphic;
  }, [activeGraphic]);

  useEffect(() => {
    const targetMatchId = matchId || obsHandlerService.getActiveMatch() || "global";
    const channelName = `obs-handler:${targetMatchId}`;

    let heartbeatTimeout: any = null;

    const handleCommand = (command: any) => {
      if (command.eventType === "OVERLAY_HEARTBEAT") {
        setIsOverlayConnected(true);
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
          setIsOverlayConnected(false);
        }, 6000);
        return;
      }

      if (command.eventType === "REQUEST_SYNC") {
        obsHandlerService.syncState(targetMatchId, activeGraphicRef.current);
      }
    };

    // 1. BroadcastChannels (Match-specific + Global)
    let bc: BroadcastChannel | null = null;
    let bcGlobal: BroadcastChannel | null = null;
    if (typeof window !== "undefined") {
      bc = new BroadcastChannel(channelName);
      bc.onmessage = (event) => {
        handleCommand(event.data);
      };

      bcGlobal = new BroadcastChannel("obs-handler-global");
      bcGlobal.onmessage = (event) => {
        handleCommand(event.data);
      };
    }

    // 2. Supabase Fallback
    let sub: any = null;
    let subGlobal: any = null;
    if (isSupabaseConfigured) {
      sub = supabase.channel(channelName, {
        config: { broadcast: { self: false } },
      });
      sub.on("broadcast", { event: "obs_command" }, ({ payload }) => {
        handleCommand(payload);
      }).subscribe();

      subGlobal = supabase.channel("obs-handler-global", {
        config: { broadcast: { self: false } },
      });
      subGlobal.on("broadcast", { event: "obs_command" }, ({ payload }) => {
        handleCommand(payload);
      }).subscribe();
    }

    return () => {
      if (bc) bc.close();
      if (bcGlobal) bcGlobal.close();
      if (sub) supabase.removeChannel(sub);
      if (subGlobal) supabase.removeChannel(subGlobal);
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
    };
  }, [matchId]);

  const setGraphic = useCallback((state: GraphicState) => {
    const targetId = matchId || obsHandlerService.getActiveMatch() || "global";
    setActiveGraphic(state);
    obsHandlerService.broadcastState(targetId, state);
  }, [matchId]);

  const clearGraphic = useCallback(() => {
    const targetId = matchId || obsHandlerService.getActiveMatch() || "global";
    setActiveGraphic(null);
    obsHandlerService.clearGraphic(targetId);
  }, [matchId]);

  return {
    activeGraphic,
    isOverlayConnected,
    setGraphic,
    clearGraphic,
  };
}
