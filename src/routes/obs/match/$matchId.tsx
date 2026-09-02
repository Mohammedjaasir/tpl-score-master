import { createFileRoute } from "@tanstack/react-router";
import { useObsMatchStream } from "@/hooks/useObsMatchStream";
import { useObsMatchEvents } from "@/hooks/useObsMatchEvents";
import { ObsLayout } from "@/components/obs/ObsLayout";
import { ScoreboardBar } from "@/components/obs/ScoreboardBar";
import { EventAlertOverlay } from "@/components/obs/EventAlertOverlay";
import { MatchResultOverlay } from "@/components/obs/MatchResultOverlay";

export const Route = createFileRoute("/obs/match/$matchId")({
  component: ObsMatchPage,
});

function ObsMatchPage() {
  const { matchId } = Route.useParams();
  const stream = useObsMatchStream(matchId);
  const events = useObsMatchEvents(stream);

  if (stream.loading) {
    return (
      <ObsLayout>
        <div className="bg-[#111111]/90 text-white border-t-2 border-[#D9A928] px-6 py-3 rounded-xl max-w-md mx-auto shadow-2xl backdrop-blur-md text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9A928] animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-[#D9A928]">
              CONNECTING TO TPL BROADCAST STREAM...
            </span>
          </div>
        </div>
      </ObsLayout>
    );
  }

  // When match is completed, transition to dedicated full-broadcast Match Result graphic
  if (stream.isCompleted) {
    return (
      <ObsLayout>
        <MatchResultOverlay stream={stream} />
      </ObsLayout>
    );
  }

  return (
    <ObsLayout>
      <EventAlertOverlay event={events.currentEvent} />
      <ScoreboardBar stream={stream} />
    </ObsLayout>
  );
}
