import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { obsStreamRepository } from "@/lib/obsStreamRepository";
import { obsHandlerService } from "@/lib/obsHandlerService";
import { useMatches } from "@/hooks/useCricketData";
import { Video, Check, Trash2, Settings, ShieldCheck, Radio, Sparkles } from "lucide-react";

export const Route = createFileRoute("/obs-handler/settings")({
  component: ObsHandlerSettingsPage,
});

function ObsHandlerSettingsPage() {
  const { data: matches = [] } = useMatches();
  const [activeMatchId, setActiveMatchId] = useState<string>(() => {
    return obsHandlerService.getActiveMatch() || "";
  });
  const [streamUrl, setStreamUrl] = useState<string>(() => {
    return obsStreamRepository.getStreamUrl(obsHandlerService.getActiveMatch() || undefined) || "";
  });
  const [savedMessage, setSavedMessage] = useState<string>("");

  useEffect(() => {
    if (activeMatchId) {
      setStreamUrl(obsStreamRepository.getStreamUrl(activeMatchId) || "");
    }
  }, [activeMatchId]);

  const handleSave = () => {
    if (!streamUrl.trim()) {
      obsStreamRepository.removeStreamUrl(activeMatchId);
      obsHandlerService.setStreamUrl("", activeMatchId);
      setSavedMessage("Stream URL removed (Transparent overlay mode active)");
    } else {
      const formatted = obsStreamRepository.saveStreamUrl(activeMatchId, streamUrl);
      obsHandlerService.setStreamUrl(formatted, activeMatchId);
      setStreamUrl(formatted);
      setSavedMessage("Stream URL configured successfully!");
    }
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleClear = () => {
    obsStreamRepository.removeStreamUrl(activeMatchId);
    obsHandlerService.setStreamUrl("", activeMatchId);
    setStreamUrl("");
    setSavedMessage("Stream URL cleared.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4 font-sans text-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#222222] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center">
          <Settings className="w-6 h-6 text-[#D9A928]" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            Broadcast & Stream Settings
          </h1>
          <p className="text-xs text-[#888888]">
            Configure live video feed, OBS overlays, and broadcast endpoints
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {savedMessage}
        </div>
      )}

      {/* Live Stream URL Configuration */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-[#D9A928]" />
          <h2 className="text-sm font-black uppercase tracking-wider text-[#D9A928]">
            Live Stream Feed Integration
          </h2>
        </div>

        <p className="text-xs text-[#888888] leading-relaxed">
          Provide a YouTube Live, Twitch, or external stream URL to embed video behind the cricket overlay graphics. If left blank, the overlay renders transparently over your OBS camera source.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#888888]">
            Stream URL (e.g. https://www.youtube.com/live/...)
          </label>
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://www.youtube.com/live/..."
            className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#D9A928] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="tap px-6 py-3 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-black text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
          >
            <Check className="w-4 h-4" />
            Save & Broadcast Stream
          </button>

          {streamUrl && (
            <button
              onClick={handleClear}
              className="tap px-4 py-3 rounded-xl bg-[#222222] hover:bg-red-950/40 hover:text-red-400 border border-[#333333] text-[#888888] text-xs font-bold transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear URL
            </button>
          )}
        </div>
      </div>

      {/* OBS Studio Integration Quick Links */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#D9A928]" />
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            OBS Browser Source URLs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333] flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-black text-[#D9A928] uppercase tracking-wider">
                Live Master Overlay
              </p>
              <p className="text-[11px] text-[#777777]">
                Always syncs to the active match and broadcast graphics
              </p>
            </div>
            <code className="text-[11px] bg-black/60 p-2 rounded text-emerald-400 font-mono select-all break-all">
              http://localhost:8082/obs/live
            </code>
          </div>

          <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333] flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-black text-[#D9A928] uppercase tracking-wider">
                Recommended Canvas Settings
              </p>
              <p className="text-[11px] text-[#777777]">
                Set OBS Browser Source resolution to 1920 x 1080 (60 FPS)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#888888]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hardware acceleration enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
