import type { ReactNode } from "react";

interface ObsLayoutProps {
  children: ReactNode;
}

export function ObsLayout({ children }: ObsLayoutProps) {
  return (
    <div
      id="tpl-obs-overlay"
      className="fixed inset-0 w-screen h-screen bg-transparent overflow-hidden select-none pointer-events-none font-sans flex flex-col justify-end pb-8 px-12"
      style={{
        width: "1920px",
        height: "1080px",
        maxWidth: "100vw",
        maxHeight: "100vh",
      }}
    >
      {/* Broadcast Safe Area Content */}
      <div className="w-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
