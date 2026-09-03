import { createFileRoute, Link } from "@tanstack/react-router";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { GraphicRenderer } from "@/components/obs/GraphicRenderer";
import { TeamLogo } from "@/components/team/TeamLogo";
import { obsHandlerService } from "@/lib/obsHandlerService";
import { obsStreamRepository } from "@/lib/obsStreamRepository";
import { Copy, ExternalLink, Radio, Tv, Sliders, CheckCircle2, ShieldAlert, Sparkles, Layers } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/obs/")({
  component: ObsIndexPage,
});

function ObsIndexPage() {
  const { data: matches = [], isLoading } = useMatches();
  const { data: teams = [] } = useTeams();
  const [copied, setCopied] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<string>(() => {
    return obsHandlerService.getActiveMatch() || "";
  });

  // Auto-resolve live or first match
  useEffect(() => {
    if (!activeMatchId && matches.length > 0 && !isLoading) {
      const live = matches.find((m) => m.status === "LIVE") || matches.find((m) => m.status === "READY") || matches[0];
      if (live) {
        setActiveMatchId(live.id);
        obsHandlerService.setActiveMatch(live.id);
      }
    }
  }, [activeMatchId, matches, isLoading]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tpl-obs-active-match" && e.newValue && e.newValue !== activeMatchId) {
        setActiveMatchId(e.newValue);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, [activeMatchId]);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const teamA = teams.find((t) => t.id === activeMatch?.teamAId);
  const teamB = teams.find((t) => t.id === activeMatch?.teamBId);
  const streamUrl = obsStreamRepository.getStreamUrl(activeMatchId);

  const copyUniversalUrl = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/obs/live`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/40 flex items-center justify-center text-[#D9A928]">
                <Tv className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                Universal OBS Master Overlay
              </h1>
            </div>
            <p className="text-xs text-white/60 font-medium mt-1.5">
              One single default browser source for all matches. Automatically follows the tournament live broadcast.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-extrabold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AUTO-TRACKING ACTIVE</span>
            </div>
            <Link
              to="/obs-handler"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D9A928] hover:bg-[#F4C542] text-black text-[11px] font-black uppercase tracking-wider transition-all"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Open OBS Handler</span>
            </Link>
          </div>
        </div>

        {/* ── Prominent Universal Overlay Banner ────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#D9A928] bg-gradient-to-br from-[#1A1A1A] via-[#141414] to-[#0A0A0A] p-6 sm:p-8 shadow-[0_0_40px_rgba(217,169,40,0.15)]">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#D9A928]/15 border border-[#D9A928]/40 text-[10px] font-black uppercase tracking-widest text-[#D9A928]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Single URL For Entire Tournament</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Default Master OBS Overlay
              </h2>
              
              <p className="text-xs sm:text-sm text-white/75 mt-2 max-w-2xl leading-relaxed">
                Add this exact URL to OBS Studio as a <strong className="text-white">Browser Source (1920×1080)</strong>. You <strong className="text-[#D9A928]">never need to change match links</strong>. Whichever match is currently live or controlled from the OBS Handler will automatically display on-screen!
              </p>

              {/* URL Preview Box */}
              <div className="mt-4 flex items-center gap-2 bg-black/60 border border-white/15 rounded-2xl p-2.5 sm:p-3 max-w-xl">
                <code className="text-xs sm:text-sm text-[#D9A928] font-mono font-bold truncate flex-1 pl-2">
                  {typeof window !== "undefined" ? `${window.location.origin}/obs/live` : "https://tpl.valgrowlabs.com/obs/live"}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={copyUniversalUrl}
                className="tap px-6 py-4 rounded-2xl bg-[#D9A928] hover:bg-[#F4C542] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(217,169,40,0.4)] transition-all active:scale-95"
              >
                {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY DEFAULT OBS URL"}</span>
              </button>

              <Link
                to="/obs/live"
                target="_blank"
                className="tap px-6 py-3.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all text-center"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Fullscreen Overlay</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Active Live Match Status Card ─────────────────────────────────── */}
        {activeMatch ? (
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TeamLogo teamId={teamA?.id} teamName={teamA?.name} className="h-10 w-10" />
                <span className="text-xs font-black text-white/40">VS</span>
                <TeamLogo teamId={teamB?.id} teamName={teamB?.name} className="h-10 w-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D9A928]">
                    MATCH #{String(activeMatch.matchNumber).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      activeMatch.status === "LIVE"
                        ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                        : "bg-white/10 text-white/70 border-white/20"
                    }`}
                  >
                    {activeMatch.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase text-white mt-0.5">
                  {teamA?.name || "Team A"} <span className="text-white/40">vs</span> {teamB?.name || "Team B"}
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Broadcasting Target</p>
              <p className="text-xs font-bold text-white mt-0.5">{activeMatch.venue || "TPL Cricket Ground"}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-[#141414] border border-white/10 rounded-2xl text-xs font-bold text-white/50">
            Waiting for tournament matches to be scheduled or started...
          </div>
        )}

        {/* ── Live Overlay Interactive Preview ──────────────────────────────── */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#D9A928]" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Live 16:9 Broadcast Preview
              </h3>
            </div>
            <span className="text-[10px] font-bold text-white/50 uppercase">
              Scaled 1920 × 1080 Output
            </span>
          </div>

          <div className="relative w-full aspect-video bg-black/60 border border-white/15 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center isolate">
            {activeMatchId ? (
              <div className="absolute inset-0 origin-top-left flex items-center justify-center w-full h-full">
                <div
                  style={{
                    width: "1920px",
                    height: "1080px",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transformOrigin: "top left",
                  }}
                  className="preview-scaler"
                >
                  <GraphicRenderer
                    matchId={activeMatchId}
                    backgroundStreamUrl={streamUrl || undefined}
                    isPreview={true}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-white/40 uppercase">No active match to preview</p>
            )}

            <style>{`
              .preview-scaler {
                transform: scale(calc(var(--parent-width, 1920) / 1920));
              }
            `}</style>
            <div
              ref={(el) => {
                if (el && el.parentElement) {
                  const ob = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                      const width = entry.contentRect.width;
                      entry.target.style.setProperty("--parent-width", width.toString());
                    }
                  });
                  ob.observe(el.parentElement);
                  return () => ob.disconnect();
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* ── Step-by-Step OBS Studio Instructions ──────────────────────────── */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 text-xs text-white/70 flex flex-col gap-4">
          <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-white flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#D9A928]" />
            OBS Studio 1-Time Setup Guide:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <span className="h-6 w-6 rounded-full bg-[#D9A928] text-black font-black text-xs grid place-items-center">1</span>
              <p className="font-black text-white uppercase text-xs">Add Browser Source</p>
              <p className="text-[11px] text-white/60">In OBS Studio, click (+) in Sources and choose <strong>Browser</strong>.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <span className="h-6 w-6 rounded-full bg-[#D9A928] text-black font-black text-xs grid place-items-center">2</span>
              <p className="font-black text-white uppercase text-xs">Paste Default URL</p>
              <p className="text-[11px] text-white/60">Paste <code className="text-[#D9A928] bg-black/40 px-1 py-0.5 rounded">.../obs/live</code> into the URL field.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <span className="h-6 w-6 rounded-full bg-[#D9A928] text-black font-black text-xs grid place-items-center">3</span>
              <p className="font-black text-white uppercase text-xs">Set 1920 × 1080</p>
              <p className="text-[11px] text-white/60">Set Width: <strong className="text-white">1920</strong> and Height: <strong className="text-white">1080</strong>.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <span className="h-6 w-6 rounded-full bg-[#D9A928] text-black font-black text-xs grid place-items-center">4</span>
              <p className="font-black text-white uppercase text-xs">Ready For All Matches</p>
              <p className="text-[11px] text-white/60">Leave OBS running. Overlays and scores update automatically!</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
