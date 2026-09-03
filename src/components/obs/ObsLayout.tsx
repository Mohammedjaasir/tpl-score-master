import type { ReactNode } from "react";

interface ObsLayoutProps {
  children?: ReactNode;
  backgroundStreamUrl?: string;
  isPreview?: boolean;
}

export function ObsLayout({ children, backgroundStreamUrl, isPreview = false }: ObsLayoutProps) {
  return (
    <div
      id="tpl-obs-overlay"
      className={`${
        isPreview ? "absolute inset-0" : "fixed inset-0 w-screen h-screen"
      } bg-transparent overflow-hidden select-none pointer-events-none font-sans flex flex-col justify-end pb-6 px-6 sm:px-10`}
    >
      {/* Background Live Stream Layer */}
      {backgroundStreamUrl && (
        <div className="absolute inset-0 w-full h-full -z-10 bg-black">
          <iframe
            src={backgroundStreamUrl}
            className="w-full h-full"
            style={{ objectFit: "cover", width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}

      {/* ValGrow Labs Branding — Top Right */}
      <div className="absolute top-5 right-6 sm:right-10 flex items-center gap-3 z-50 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
        <img
          src="/valgrow-labs-logo.jpeg"
          alt="ValGrow Labs"
          className="h-8 w-8 rounded-lg object-cover flex-shrink-0 shadow-md"
        />
        <div className="leading-tight">
          <p className="text-[8px] font-bold text-[#D9A928] uppercase tracking-[0.2em]">Powered by</p>
          <p className="text-xs font-black text-white tracking-wide">ValGrow Labs</p>
        </div>
      </div>

      {/* Broadcast Safe Area Content (Scoreboard / Alerts / Full overlays) */}
      <div className="w-full h-full pointer-events-auto z-10 relative flex flex-col justify-end pb-6 px-6 sm:px-10">
        {children}
      </div>
    </div>
  );
}

