import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/match/MatchCard";
import { NoLiveMatchesCard } from "@/components/home/NoLiveMatchesCard";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import {
  ClipboardList,
  Radio,
  Calendar,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/scorecards")({
  component: ScorecardsPage,
});

type TabType = "past" | "live" | "upcoming";

function ScorecardsPage() {
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  useTeams();

  // ── Single Source of Truth: Derive categories directly from matches ────────
  const liveMatches = useMemo(
    () => allMatches.filter((m) => m.status === "LIVE"),
    [allMatches],
  );

  const upcomingMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.status === "UPCOMING" || m.status === "READY")
        .sort((a, b) => {
          const timeA = new Date(a.scheduledAt || "").getTime() || a.matchNumber;
          const timeB = new Date(b.scheduledAt || "").getTime() || b.matchNumber;
          return timeA - timeB;
        }),
    [allMatches],
  );

  const pastMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.status === "COMPLETED")
        .sort((a, b) => {
          // Newest completed first
          const timeA = new Date(a.scheduledAt || "").getTime() || a.matchNumber;
          const timeB = new Date(b.scheduledAt || "").getTime() || b.matchNumber;
          return timeB - timeA;
        }),
    [allMatches],
  );

  // ── Intelligent Default Tab ────────────────────────────────────────────────
  const [selectedTab, setSelectedTab] = useState<TabType | null>(null);

  const activeTab: TabType = useMemo(() => {
    if (selectedTab !== null) return selectedTab;
    if (liveMatches.length > 0) return "live";
    if (upcomingMatches.length > 0) return "upcoming";
    return "past";
  }, [selectedTab, liveMatches.length, upcomingMatches.length]);

  return (
    <AppShell title="Scorecard">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-2 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#111111]">
              SCORECARD
            </h1>
            <p className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider">
              TPL 2026 Match Archive & Live Scores
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-black text-[#5F6368] uppercase shadow-xs">
              {allMatches.length} Total Matches
            </span>
          </div>
        </div>

        {/* ── Sub-Navigation Tabs: PAST | LIVE | UPCOMING ────────────────────── */}
        <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-2 overflow-x-auto no-scrollbar">
          {[
            {
              id: "past",
              label: "PAST MATCHES",
              count: pastMatches.length,
              icon: CheckCircle2,
            },
            {
              id: "live",
              label: "LIVE MATCHES",
              count: liveMatches.length,
              icon: Radio,
              isLiveBadge: liveMatches.length > 0,
            },
            {
              id: "upcoming",
              label: "UPCOMING MATCHES",
              count: upcomingMatches.length,
              icon: Calendar,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as TabType)}
                className={`tap shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#111111] text-[#D9A928] shadow-md"
                    : "bg-white text-[#5F6368] hover:text-[#111111] border border-[#E5E5E5]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    tab.isLiveBadge && !isActive ? "text-red-500 animate-pulse" : ""
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                    isActive
                      ? "bg-[#D9A928] text-black"
                      : "bg-[#F7F7F5] text-[#5F6368]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && allMatches.length === 0 && (
          <div className="card-surface p-12 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
            <p className="text-xs font-bold text-[#5F6368]">Loading matches from database...</p>
          </div>
        )}

        {/* Error State */}
        {isError && allMatches.length === 0 && (
          <div className="card-surface p-8 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl">
            <AlertCircle className="h-8 w-8 text-[#D9A928]" />
            <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
              Unable to load scorecards right now
            </p>
            <p className="text-xs text-[#5F6368] max-w-sm">
              {error instanceof Error ? error.message : "Please check your network connection and try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-md transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ── TAB CONTENT: PAST MATCHES ────────────────────────────────────── */}
        {!isLoading && activeTab === "past" && (
          <div className="flex flex-col gap-4">
            {pastMatches.length > 0 ? (
              pastMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))
            ) : (
              <div className="card-surface p-12 text-center bg-white border border-[#E5E5E5] rounded-3xl flex flex-col items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-[#5F6368]/30" />
                <p className="text-sm font-black text-[#111111] uppercase">NO COMPLETED MATCHES YET.</p>
                <p className="text-xs text-[#5F6368]">
                  Completed matches will appear here automatically when the scorer completes them.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT: LIVE MATCHES ────────────────────────────────────── */}
        {!isLoading && activeTab === "live" && (
          <div className="flex flex-col gap-4">
            {liveMatches.length > 0 ? (
              liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))
            ) : (
              <NoLiveMatchesCard />
            )}
          </div>
        )}

        {/* ── TAB CONTENT: UPCOMING MATCHES ────────────────────────────────── */}
        {!isLoading && activeTab === "upcoming" && (
          <div className="flex flex-col gap-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} scorerMode={false} />
              ))
            ) : (
              <div className="card-surface p-12 text-center bg-white border border-[#E5E5E5] rounded-3xl flex flex-col items-center gap-3">
                <Calendar className="h-10 w-10 text-[#5F6368]/30" />
                <p className="text-sm font-black text-[#111111] uppercase">NO UPCOMING MATCHES SCHEDULED.</p>
                <p className="text-xs text-[#5F6368]">
                  Scheduled tournament fixtures will appear here once announced.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
