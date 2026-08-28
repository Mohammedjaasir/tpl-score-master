import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { Radio, RefreshCw, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/live")({
  component: LivePage,
});

function LivePage() {
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  useTeams();

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");

  return (
    <AppShell title="Live Matches">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-2 pb-16">
        <div className="flex items-center gap-2 px-1">
          <Radio className="h-5 w-5 text-[#D9A928] animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111]">
            Live Match Centre
          </h1>
        </div>

        {/* Live Matches List */}
        {liveMatches.length > 0 && (
          <div className="flex flex-col gap-4">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} scorerMode={false} />
            ))}
          </div>
        )}

        {/* Loading (Only if no cached data exists) */}
        {isLoading && liveMatches.length === 0 && allMatches.length === 0 && (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
            <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
            <p className="text-xs font-bold text-[#5F6368]">Checking for live matches...</p>
          </div>
        )}

        {/* Error / Timeout state */}
        {isError && liveMatches.length === 0 && allMatches.length === 0 && (
          <div className="card-surface p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
            <AlertCircle className="h-8 w-8 text-[#D9A928]" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              Unable to load live matches right now
            </p>
            <p className="text-xs text-[#5F6368] max-w-sm">
              {error instanceof Error ? error.message : "Please check your network connection and try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Empty state (Loaded but no live matches) */}
        {!isLoading && !isError && liveMatches.length === 0 && (
          <div className="card-surface p-12 text-center bg-white border border-[#E5E5E5] rounded-2xl flex flex-col items-center gap-3">
            <Radio className="h-10 w-10 text-[#5F6368]/30" />
            <p className="text-sm font-black text-[#111111] uppercase">No live matches right now</p>
            <p className="text-xs text-[#5F6368]">Check the fixtures tab for upcoming match timings.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
