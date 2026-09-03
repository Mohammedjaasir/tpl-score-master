import { createFileRoute, Link } from "@tanstack/react-router";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { Copy, ExternalLink, Radio, Tv } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/obs/")({
  component: ObsIndexPage,
});

function ObsIndexPage() {
  const { data: matches = [], isLoading } = useMatches();
  const { data: teams = [] } = useTeams();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  const copyUrl = (matchId: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/obs/match/${matchId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(matchId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Tv className="h-6 w-6 text-[#D9A928]" />
              <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                TPL 2026 OBS OVERLAY HUB
              </h1>
            </div>
            <p className="text-xs text-white/60 font-medium mt-1">
              Select a match to open or copy the 1920×1080 transparent OBS Browser Source URL.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/80">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Browser Source Resolution: 1920 × 1080</span>
          </div>
        </div>

        {/* Master Live Overlay Card */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#141414] border-2 border-[#D9A928] rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-[#D9A928]">
                Recommended for Streamers & OBS Operators
              </span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white">
              Master Live Auto-Follow Overlay
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-xl">
              Add this single URL into OBS Studio. It automatically detects and switches to whichever match is currently active or selected in the OBS Handler without ever needing to update the OBS Browser Source!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => copyUrl("live")}
              className="tap px-5 py-3 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
            >
              <Copy className="h-4 w-4" />
              {copiedId === "live" ? "COPIED URL!" : "COPY LIVE URL"}
            </button>
            <Link
              to="/obs/live"
              target="_blank"
              className="tap px-4 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              OPEN
            </Link>
          </div>
        </div>

        {/* Matches List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#D9A928]">
            Direct Match Overlays (Specific Match Pin)
          </h2>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-bold text-white/40 animate-pulse">
              Loading tournament fixtures...
            </div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-white/60">
              No tournament matches found. Schedule matches in Admin Portal first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m) => {
                const teamA = getTeam(m.teamAId);
                const teamB = getTeam(m.teamBId);
                const isLive = m.status === "LIVE";
                const isCompleted = m.status === "COMPLETED";

                return (
                  <div
                    key={m.id}
                    className={`bg-white/5 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-[#D9A928]/60 ${
                      isLive
                        ? "border-red-500/50 bg-red-950/10"
                        : isCompleted
                        ? "border-white/10 opacity-80"
                        : "border-white/15"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#D9A928]">
                          MATCH #{m.matchNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isLive
                              ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                              : isCompleted
                              ? "bg-white/10 text-white/70 border-white/20"
                              : "bg-white/5 text-white/50 border-white/10"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div className="text-base font-black uppercase text-white truncate">
                        {teamA?.name || "Team A"} <span className="text-white/40">vs</span> {teamB?.name || "Team B"}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {m.venue || "TPL Cricket Ground"} • {m.overs} Overs
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <Link
                        to="/obs/match/$matchId"
                        params={{ matchId: m.id }}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#D9A928] text-black text-xs font-black uppercase tracking-wide hover:bg-[#F4C542] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Overlay
                      </Link>

                      <button
                        onClick={() => copyUrl(m.id)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wide hover:bg-white/20 transition-colors border border-white/15"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedId === m.id ? "Copied!" : "Copy URL"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* OBS Setup Instructions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-xs text-white/70 flex flex-col gap-3">
          <h3 className="font-black text-sm uppercase tracking-wide text-white">
            OBS Studio Browser Source Setup Guide:
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 font-medium leading-relaxed">
            <li>Open OBS Studio and add a new <strong className="text-white">Browser</strong> Source.</li>
            <li>Paste the copied match URL (e.g. <code className="bg-black/50 px-1.5 py-0.5 rounded text-[#D9A928]">http://localhost:8080/obs/match/tpl-fixture-1</code>).</li>
            <li>Set Width to <strong className="text-white">1920</strong> and Height to <strong className="text-white">1080</strong>.</li>
            <li>Check <strong className="text-white">Shutdown source when not visible</strong> and <strong className="text-white">Refresh browser when scene becomes active</strong>.</li>
            <li>Click OK — the transparent scoreboard will appear at the bottom over your live video stream.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
