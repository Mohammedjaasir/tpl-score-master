import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { useScorerAuth } from "@/lib/auth";
import { lookup } from "@/lib/repositories";
import { startMatchSession, loadMatchDoc } from "@/lib/scoring/store";
import { TeamLogo } from "@/components/team/TeamLogo";
import { formatMatchTime } from "@/lib/utils";
import type { Match } from "@/types/cricket";
import {
  Radio,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Lock,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/scorer")({
  component: ScorerDashboardPage,
});

function ScorerDashboardPage() {
  const { isAuthenticated, userEmail, logout } = useScorerAuth();
  const { data: allMatches = [], isLoading, isError, error, refetch } = useMatches();
  useTeams();
  const navigate = useNavigate();

  // Confirmation Modal State
  const [selectedMatchToStart, setSelectedMatchToStart] = useState<Match | null>(null);
  const [isStarting, setIsStarting] = useState(false);

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
  const upcomingMatches = allMatches.filter(
    (m) =>
      m.status === "READY" ||
      m.status === "UPCOMING" ||
      (m.status as string) === "SCHEDULED" ||
      (m.status as string) === "PENDING"
  );
  const completedMatches = allMatches.filter((m) => m.status === "COMPLETED");

  const handleConfirmStart = () => {
    if (!selectedMatchToStart) return;
    setIsStarting(true);
    try {
      startMatchSession(selectedMatchToStart.id);
      const targetId = selectedMatchToStart.id;
      setSelectedMatchToStart(null);
      setIsStarting(false);
      refetch();
      navigate({
        to: "/match/$matchId",
        params: { matchId: targetId },
      });
    } catch {
      setIsStarting(false);
    }
  };

  return (
    <AppShell title="Scorer Console">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-2 pb-20 px-2 sm:px-4">
        {/* ── Scorer Header Banner ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-[#D9A928]/20 text-[#9A6A05] flex items-center justify-center font-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-black text-[#111111] uppercase">
                Official Scorer Console
              </p>
              <p className="text-xs text-[#5F6368] font-medium">
                Logged in: <span className="font-bold text-[#111111]">{userEmail || "scorer@tpl.com"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="tap inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-[#EAEAE8] transition-all"
              title="Refresh match schedule"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#5F6368]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="tap inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* ── Loading / Error States ──────────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-6 w-6 text-[#D9A928] animate-spin" />
            <p className="text-sm font-bold text-[#5F6368]">Loading tournament schedule...</p>
          </div>
        )}

        {isError && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-sm font-black text-red-900">Unable to load tournament matches</p>
            <p className="text-xs text-red-700">{error instanceof Error ? error.message : "Network error"}</p>
            <button
              onClick={() => refetch()}
              className="tap mt-2 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* ── MATCH CONTROL SECTIONS ───────────────────────────────────────── */}
        {!isLoading && !isError && (
          <div className="flex flex-col gap-8">

            {/* 1. LIVE MATCHES (Active Scoring) */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-[#D9A928] animate-pulse" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111]">
                    LIVE MATCHES ({liveMatches.length})
                  </h2>
                </div>
                {liveMatches.length > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D9A928] bg-[#D9A928]/10 px-2.5 py-1 rounded-full">
                    Scoring Active
                  </span>
                )}
              </div>

              {liveMatches.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {liveMatches.map((m) => {
                    const teamA = lookup.team(m.teamAId);
                    const teamB = lookup.team(m.teamBId);
                    const doc = loadMatchDoc(m.id);
                    const time = formatMatchTime(m.scheduledAt);

                    return (
                      <div
                        key={m.id}
                        className="rounded-3xl bg-[#121316] border-2 border-[#D9A928]/60 p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 transition-all"
                      >
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A928] text-black text-[10px] font-black tracking-widest uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                              LIVE
                            </span>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                              Match #{String(m.matchNumber).padStart(2, "0")} • {m.tournament}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6 my-1">
                            <div className="flex items-center gap-2.5">
                              <TeamLogo logoUrl={teamA?.logoUrl} name={teamA?.name} shortName={teamA?.shortName} size="sm" />
                              <span className="text-sm sm:text-base font-black uppercase">{teamA?.shortName ?? teamA?.name}</span>
                            </div>
                            <span className="text-xs font-black text-[#D9A928]">VS</span>
                            <div className="flex items-center gap-2.5">
                              <TeamLogo logoUrl={teamB?.logoUrl} name={teamB?.name} shortName={teamB?.shortName} size="sm" />
                              <span className="text-sm sm:text-base font-black uppercase">{teamB?.shortName ?? teamB?.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#D9A928]" />
                              Scheduled: {time}
                            </span>
                            {doc.startedAt && (
                              <span className="flex items-center gap-1 text-[#D9A928]">
                                <Play className="h-3 w-3" />
                                Started: {new Date(doc.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Link
                            to="/match/$matchId"
                            params={{ matchId: m.id }}
                            className="tap w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D9A928]/20 transition-all"
                          >
                            <Play className="h-4 w-4 fill-black" />
                            <span>Continue Scoring</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] text-center text-xs font-bold text-[#5F6368]">
                  No live matches currently in progress. Select an upcoming match below and click <span className="text-[#111111] font-black">START MATCH</span>.
                </div>
              )}
            </section>

            {/* 2. UPCOMING / SCHEDULED MATCHES (Scorer Controls Start) */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#D9A928]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111]">
                    UPCOMING FIXTURES ({upcomingMatches.length})
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Scorer controls match start
                </span>
              </div>

              {upcomingMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMatches.map((m) => {
                    const teamA = lookup.team(m.teamAId);
                    const teamB = lookup.team(m.teamBId);
                    const time = formatMatchTime(m.scheduledAt);

                    return (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#D9A928]/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-2.5">
                            <span className="text-[10px] font-black text-white bg-[#111111] px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Match #{String(m.matchNumber).padStart(2, "0")}
                            </span>
                            <span className="text-xs font-bold text-[#5F6368] flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#D9A928]" />
                              {time}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 py-1">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <TeamLogo logoUrl={teamA?.logoUrl} name={teamA?.name} shortName={teamA?.shortName} size="sm" />
                              <span className="text-xs sm:text-sm font-black text-[#111111] uppercase truncate">
                                {teamA?.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-[#D9A928] shrink-0">VS</span>
                            <div className="flex items-center gap-2.5 min-w-0 justify-end">
                              <span className="text-xs sm:text-sm font-black text-[#111111] uppercase truncate text-right">
                                {teamB?.name}
                              </span>
                              <TeamLogo logoUrl={teamB?.logoUrl} name={teamB?.name} shortName={teamB?.shortName} size="sm" />
                            </div>
                          </div>

                          {m.venue && (
                            <p className="text-[11px] text-[#5F6368] flex items-center gap-1 font-medium">
                              <MapPin className="h-3 w-3 text-[#D9A928]" />
                              {m.venue}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#F0F0EE]">
                          <button
                            onClick={() => setSelectedMatchToStart(m)}
                            className="tap w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#D9A928] text-white hover:text-black font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                          >
                            <Play className="h-3.5 w-3.5 text-[#D9A928] group-hover:text-black" />
                            <span>Start Match</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] text-center text-xs font-bold text-[#5F6368]">
                  No upcoming matches scheduled.
                </div>
              )}
            </section>

            {/* 3. COMPLETED MATCHES */}
            {completedMatches.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111]">
                      COMPLETED MATCHES ({completedMatches.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedMatches.map((m) => {
                    const teamA = lookup.team(m.teamAId);
                    const teamB = lookup.team(m.teamBId);

                    return (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-white border border-[#E5E5E5] p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-2">
                          <span className="text-[10px] font-black text-[#5F6368] bg-[#F7F7F5] px-2 py-0.5 rounded-full uppercase">
                            Match #{String(m.matchNumber).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-bold text-green-700 uppercase bg-green-50 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <TeamLogo logoUrl={teamA?.logoUrl} name={teamA?.name} shortName={teamA?.shortName} size="xs" />
                            <span className="text-xs font-bold text-[#111111] uppercase truncate">
                              {teamA?.shortName ?? teamA?.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#5F6368]">vs</span>
                          <div className="flex items-center gap-2 min-w-0 justify-end">
                            <span className="text-xs font-bold text-[#111111] uppercase truncate text-right">
                              {teamB?.shortName ?? teamB?.name}
                            </span>
                            <TeamLogo logoUrl={teamB?.logoUrl} name={teamB?.name} shortName={teamB?.shortName} size="xs" />
                          </div>
                        </div>

                        {m.resultText && (
                          <p className="text-[11px] font-black text-[#D9A928] bg-black/5 px-2.5 py-1 rounded-lg text-center truncate">
                            {m.resultText}
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#F0F0EE]">
                          <Link
                            to="/scorecard/$matchId"
                            params={{ matchId: m.id }}
                            className="tap w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F7F5] hover:bg-[#EAEAE8] text-[#111111] font-bold text-xs uppercase tracking-wider transition-all"
                          >
                            <span>View Scorecard</span>
                            <ExternalLink className="h-3 w-3 text-[#5F6368]" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}

        {/* ── START MATCH CONFIRMATION MODAL ──────────────────────────────── */}
        {selectedMatchToStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-white border border-[#E5E5E5] p-6 shadow-2xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2 text-[#D9A928]">
                  <Play className="h-5 w-5 fill-[#D9A928]" />
                  <h3 className="text-base font-black text-[#111111] uppercase tracking-wide">
                    Start Match #{selectedMatchToStart.matchNumber}?
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMatchToStart(null)}
                  className="tap p-1.5 rounded-full hover:bg-black/5 text-[#5F6368]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Match Summary */}
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#5F6368]">
                  <span>{selectedMatchToStart.tournament}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#D9A928]" />
                    {formatMatchTime(selectedMatchToStart.scheduledAt)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <TeamLogo
                      logoUrl={lookup.team(selectedMatchToStart.teamAId)?.logoUrl}
                      name={lookup.team(selectedMatchToStart.teamAId)?.name}
                      shortName={lookup.team(selectedMatchToStart.teamAId)?.shortName}
                      size="sm"
                    />
                    <span className="text-xs font-black uppercase text-[#111111]">
                      {lookup.team(selectedMatchToStart.teamAId)?.shortName}
                    </span>
                  </div>

                  <span className="text-xs font-black text-[#D9A928] px-2">VS</span>

                  <div className="flex flex-col items-center gap-1">
                    <TeamLogo
                      logoUrl={lookup.team(selectedMatchToStart.teamBId)?.logoUrl}
                      name={lookup.team(selectedMatchToStart.teamBId)?.name}
                      shortName={lookup.team(selectedMatchToStart.teamBId)?.shortName}
                      size="sm"
                    />
                    <span className="text-xs font-black uppercase text-[#111111]">
                      {lookup.team(selectedMatchToStart.teamBId)?.shortName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Match Warning if another match is already live */}
              {liveMatches.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Note:</span> Match #{liveMatches[0].matchNumber} is currently LIVE. Starting this match will make it live in the scorer console.
                  </p>
                </div>
              )}

              <p className="text-xs text-[#5F6368] font-medium leading-relaxed">
                You are starting this match now. Once started, this match will immediately become <span className="font-black text-[#111111]">LIVE</span> on the public website and open the scorer toss screen.
              </p>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatchToStart(null)}
                  disabled={isStarting}
                  className="tap py-3 rounded-xl bg-[#F7F7F5] hover:bg-[#EAEAE8] text-[#111111] font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStart}
                  disabled={isStarting}
                  className="tap py-3 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isStarting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-black" />
                      <span>Start Match Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
