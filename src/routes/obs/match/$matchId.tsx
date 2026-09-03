import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraphicRenderer } from "@/components/obs/GraphicRenderer";
import { obsStreamRepository } from "@/lib/obsStreamRepository";
import { obsHandlerService } from "@/lib/obsHandlerService";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/obs/match/$matchId")({
  component: ObsMatchPage,
});

function ObsMatchPage() {
  const { matchId } = Route.useParams();
  const navigate = useNavigate();
  const [currentMatchId, setCurrentMatchId] = useState<string>(() => {
    return obsHandlerService.getActiveMatch() || matchId;
  });
  const [backgroundStreamUrl, setBackgroundStreamUrl] = useState<string | undefined>(undefined);

  // Listen for match switching ONLY via localStorage (not BroadcastChannel,
  // to avoid stealing SET_GRAPHIC messages from useObsHandlerReceiver inside GraphicRenderer)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tpl-obs-active-match" && e.newValue && e.newValue !== currentMatchId) {
        setCurrentMatchId(e.newValue);
        navigate({ to: "/obs/match/$matchId", params: { matchId: e.newValue }, replace: true });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    // Poll localStorage as fallback for same-tab updates
    const poll = setInterval(() => {
      const current = obsHandlerService.getActiveMatch();
      if (current && current !== currentMatchId) {
        setCurrentMatchId(current);
        navigate({ to: "/obs/match/$matchId", params: { matchId: current }, replace: true });
      }
    }, 500);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
      clearInterval(poll);
    };
  }, [currentMatchId, navigate]);

  useEffect(() => {
    const url = obsStreamRepository.getStreamUrl(currentMatchId);
    if (url) {
      setBackgroundStreamUrl(url);
    }
  }, [currentMatchId]);

  return <GraphicRenderer matchId={currentMatchId} backgroundStreamUrl={backgroundStreamUrl} />;
}
