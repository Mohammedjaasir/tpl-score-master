import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { TplBottomDock } from "@/components/layout/TplDock";

export function AppShell({
  children,
  title,
  hideNav = false,
  fullBleedTop = false,
}: {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
  fullBleedTop?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] flex flex-col">
      {/* ── Minimal Header — Logo only, no nav links ──────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="TPL Home">
            <Logo size="md" />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-black tracking-wide text-[#111111] uppercase">
                Thunduwa Premier League
              </span>
              <span className="text-[10px] font-bold text-[#D9A928] tracking-widest uppercase">
                Season 2026
              </span>
            </div>
          </Link>
          {title && (
            <span className="shrink-0 rounded-full bg-[#F7F7F5] border border-[#E5E5E5] px-3 py-1 text-[11px] font-extrabold tracking-wider text-[#5F6368] uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
              {title}
            </span>
          )}
        </div>
      </header>

      {/* ── Main Content Body ────────────────────────────────────────── */}
      {fullBleedTop ? (
        <main className={`flex-1 ${hideNav ? "pb-4" : "pb-28"}`}>
          {children}
        </main>
      ) : (
        <main className={`flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-4 ${hideNav ? "pb-4" : "pb-28"}`}>
          {children}
        </main>
      )}

      {/* ── Floating Bottom Dock Navigation ──────────────────────────── */}
      {!hideNav && <TplBottomDock />}
    </div>
  );
}
