import { createFileRoute } from "@tanstack/react-router";
import { GraphicRenderer } from "@/components/obs/GraphicRenderer";
import { obsStreamRepository } from "@/lib/obsStreamRepository";
import { obsHandlerService } from "@/lib/obsHandlerService";
import { useMatches } from "@/hooks/useCricketData";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/obs/live")({
  component: ObsLiveMasterPage,
});

function ObsLiveMasterPage() {
  const { data: matches = [], isLoading } = useMatches();
  const [activeMatchId, setActiveMatchId] = useState<string>(() => {
    return obsHandlerService.getActiveMatch() || "";
  });
  const [backgroundStreamUrl, setBackgroundStreamUrl] = useState<string | undefined>(undefined);

  // Auto-resolve initial live match if not set
  useEffect(() => {
    if (!activeMatchId && matches.length > 0 && !isLoading) {
      const live = matches.find((m) => m.status === "LIVE") || matches.find((m) => m.status === "READY") || matches[0];
      if (live) {
        setActiveMatchId(live.id);
        obsHandlerService.setActiveMatch(live.id);
      }
    }
  }, [activeMatchId, matches, isLoading]);

  // Listen for match switching ONLY via localStorage (not BroadcastChannel, to avoid
  // stealing messages from useObsHandlerReceiver inside GraphicRenderer)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tpl-obs-active-match" && e.newValue && e.newValue !== activeMatchId) {
        setActiveMatchId(e.newValue);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    // Also poll /api/obs-state and localStorage every 500ms as a cross-process bridge between Chrome and OBS Studio
    const poll = setInterval(async () => {
      const current = obsHandlerService.getActiveMatch();
      if (current && current !== activeMatchId) {
        setActiveMatchId(current);
        return;
      }
      try {
        const res = await fetch(`/api/obs-state?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.activeMatchId && data.activeMatchId !== activeMatchId) {
            setActiveMatchId(data.activeMatchId);
          }
          if (data?.streamUrl !== undefined) {
            setBackgroundStreamUrl(data.streamUrl || undefined);
          }
        }
      } catch {}
    }, 500);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
      clearInterval(poll);
    };
  }, [activeMatchId]);

  useEffect(() => {
    const url = obsStreamRepository.getStreamUrl(activeMatchId);
    setBackgroundStreamUrl(url || undefined);
  }, [activeMatchId]);

  if (!activeMatchId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="bg-[#111111]/90 text-white border border-[#333333] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#D9A928]">
            WAITING FOR ACTIVE TOURNAMENT MATCH...
          </span>
        </div>
      </div>
    );
  }

  return <GraphicRenderer matchId={activeMatchId} backgroundStreamUrl={backgroundStreamUrl} />;
}

