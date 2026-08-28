import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { useScorerAuth } from "@/lib/auth";
import { Radio, RefreshCw, AlertCircle, ShieldCheck, LogOut, ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/scorer")({
  component: ScorerDashboardPage,
});

function ScorerDashboardPage() {
  const { isAuthenticated, userEmail, logout } = useScorerAuth();
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  useTeams();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/profile" });
  };

  if (!isAuthenticated) {
    return (
      <AppShell title="Scorer Access">
        <div className="max-w-md mx-auto my-12 p-8 bg-white border border-[#E5E5E5] rounded-3xl shadow-xl text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-[#D9A928]/15 text-[#9A6A05] flex items-center justify-center mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-[#111111] uppercase tracking-wide">
            Scorer Login Required
          </h1>
          <p className="text-xs text-[#5F6368] font-medium mt-1 mb-6 leading-relaxed">
            Please log in with your official scorer credentials in the Profile section to access match scoring controls.
          </p>
          <Link
            to="/profile"
            className="tap w-full py-3.5 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Scorer Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AppShell>
    );
  }

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");
  const readyMatches = allMatches.filter((m) => m.status === "READY" || m.status === "UPCOMING");
  const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");

  return (
    <AppShell title="Scorer Console">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-2 pb-16">
        {/* Scorer Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D9A928]/20 text-[#9A6A05] flex items-center justify-center font-black">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-[#111111] uppercase">Official Scorer Console</p>
              <p className="text-xs text-[#5F6368] font-medium">
                Logged in as: <span className="font-bold text-[#111111]">{userEmail || "scorer@tpl.com"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="tap inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground">Loading matches from database...</p>
          </div>
        )}

        {isError && (
          <div className="card-surface p-6 flex flex-col items-center justify-center text-center gap-3 border border-destructive/30">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-extrabold text-foreground">Unable to load matches</p>
            <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Network error"}</p>
            <button
              onClick={() => refetch()}
              className="tap mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Live Matches to Score */}
        {!isLoading && (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#D9A928] animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                  Live Matches (Scoring Active)
                </h2>
              </div>
              {liveMatches.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {liveMatches.map((m) => (
                    <MatchCard key={m.id} match={m} scorerMode={true} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] text-center text-xs font-bold text-[#5F6368]">
                  No live matches currently in progress. Select an upcoming match below to set up toss & start scoring.
                </div>
              )}
            </section>

            {/* Upcoming / Ready Matches to Score */}
            {readyMatches.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                  Upcoming Fixtures (Ready to Score)
                </h2>
                <div className="flex flex-col gap-4">
                  {readyMatches.map((m) => (
                    <MatchCard key={m.id} match={m} scorerMode={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Matches */}
            {completedMatches.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                  Completed Matches
                </h2>
                <div className="flex flex-col gap-4">
                  {completedMatches.map((m) => (
                    <MatchCard key={m.id} match={m} scorerMode={true} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
