import { createFileRoute } from "@tanstack/react-router";
import { usePlayer, useMatches, useTeam } from "@/hooks/useCricketData";
import { AppShell } from "@/components/layout/AppShell";
import { PublicPlayerProfile } from "@/components/player/PublicPlayerProfile";
import { RefreshCw, UserX } from "lucide-react";

export const Route = createFileRoute("/player/$playerId")({
  component: PlayerPerformancePage,
});

function PlayerPerformancePage() {
  const { playerId } = Route.useParams();
  const { data: player, isLoading: loadingPlayer } = usePlayer(playerId);
  const { data: allMatches = [], isLoading: loadingMatches } = useMatches();
  const { data: team } = useTeam(player?.teamId);

  if (loadingPlayer || loadingMatches) {
    return (
      <AppShell title="Player Performance">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
          <p className="text-xs font-bold text-[#5F6368]">Loading player performance...</p>
        </div>
      </AppShell>
    );
  }

  if (!player) {
    return (
      <AppShell title="Player Profile">
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-[#E5E5E5] rounded-3xl text-center flex flex-col items-center gap-3 shadow-md">
          <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center text-[#5F6368]">
            <UserX className="h-6 w-6" />
          </div>
          <h1 className="text-base font-black text-[#111111] uppercase tracking-wide">
            Player Not Found
          </h1>
          <p className="text-xs text-[#5F6368]">
            The requested player ID or slug does not exist in the TPL 2026 database.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={player.name} hideNav>
      <PublicPlayerProfile player={player} team={team} allMatches={allMatches} />
    </AppShell>
  );
}
