import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/matches")({
  component: Matches,
});

function Matches() {
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  useTeams();

  const live = allMatches.filter((m) => m.status === "LIVE");
  const ready = allMatches.filter((m) => m.status === "READY");
  const upcoming = allMatches.filter((m) => m.status === "UPCOMING");
  const completed = allMatches.filter((m) => m.status === "COMPLETED");

  const sections = [
    { label: "Live Matches", matches: live },
    { label: "Ready to Score", matches: ready },
    { label: "Upcoming Fixtures", matches: upcoming },
    { label: "Completed Matches", matches: completed },
  ].filter((s) => s.matches.length > 0);

  return (
    <AppShell title="Matches">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pt-2 pb-16">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111] px-1">
          Tournament Fixtures & Results
        </h1>

        {/* Matches Sections (Shown immediately from cache if available) */}
        {sections.map((s) => (
          <section key={s.label} className="flex flex-col gap-3">
            <h2 className="text-xs font-black tracking-widest text-[#5F6368] uppercase px-1">
              {s.label}
            </h2>
            <div className="flex flex-col gap-4">
              {s.matches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))}
            </div>
          </section>
        ))}

        {/* Loading (Only if no data in cache) */}
        {isLoading && allMatches.length === 0 && (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
            <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
            <p className="text-xs font-bold text-[#5F6368]">Loading tournament matches...</p>
          </div>
        )}

        {/* Error State with Retry */}
        {isError && allMatches.length === 0 && (
          <div className="card-surface p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-2xl">
            <AlertCircle className="h-8 w-8 text-[#D9A928]" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              Unable to load matches right now
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

        {/* Empty State */}
        {!isLoading && !isError && allMatches.length === 0 && (
          <div className="card-surface p-12 text-center bg-white border border-[#E5E5E5] rounded-2xl">
            <p className="text-xs font-bold text-[#5F6368]">No tournament matches currently found.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
