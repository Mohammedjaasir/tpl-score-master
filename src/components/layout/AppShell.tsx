import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { TplBottomDock } from "@/components/layout/TplDock";
import { Radio, Shield, User, Sparkles } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
  fullBleedTop?: boolean;
}

const DESKTOP_NAV_LINKS = [
  { to: "/home", label: "HOME" },
  { to: "/matches", label: "FIXTURES" },
  { to: "/scorecards", label: "SCORECARD" },
  { to: "/pointables", label: "POINTABLES" },
  { to: "/stats", label: "STATS" },
  { to: "/records", label: "RECORDS" },
  { to: "/rules", label: "RULES" },
] as const;

export function AppShell({
  children,
  title,
  hideNav = false,
  fullBleedTop = false,
}: AppShellProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] flex flex-col font-sans selection:bg-[#D9A928]/30 selection:text-black">
      {/* ── Responsive Top Header ────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 gap-4">
          
          {/* Brand Logo & Tournament Badge */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3.5 min-w-0 group" aria-label="TPL Home">
            <Logo size="sm" className="sm:hidden" />
            <Logo size="md" className="hidden sm:block transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs sm:text-sm font-black tracking-wide text-[#111111] uppercase truncate font-sans">
                Thunduwa Premier League
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#D9A928] tracking-widest uppercase">
                  Season 2026
                </span>
                <span className="hidden sm:inline-block text-[8px] font-bold text-[#9CA3AF]">●</span>
                <span className="hidden sm:inline-block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Official Platform
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on Laptop & Desktop: md:flex) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Primary Navigation">
            {DESKTOP_NAV_LINKS.map((link) => {
              const isActive = currentPath === link.to || (link.to === "/home" && currentPath === "/");
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-150 relative ${
                    isActive
                      ? "bg-[#111111] text-[#D9A928] shadow-sm"
                      : "text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#D9A928] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {title && (
              <span className="md:hidden shrink-0 rounded-full bg-[#F7F7F5] border border-[#E5E5E5] px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-[#5F6368] uppercase flex items-center gap-1 max-w-[120px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928] shrink-0" />
                <span className="truncate">{title}</span>
              </span>
            )}
          </div>

        </div>
      </header>

      {/* ── Main Content Body ────────────────────────────────────────── */}
      {fullBleedTop ? (
        <main className={`flex-1 w-full ${hideNav ? "pb-4" : "pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-12"}`}>
          {children}
        </main>
      ) : (
        <main className={`flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 ${hideNav ? "pb-4" : "pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-12"}`}>
          {children}
        </main>
      )}

      {/* ── Floating Bottom Dock (Mobile & Tablet only: md:hidden) ───── */}
      {!hideNav && (
        <div className="md:hidden">
          <TplBottomDock />
        </div>
      )}

      {/* ── POWERED BY VALGROW LABS — Site-Wide Footer ───────────────── */}
      <footer className="w-full bg-[#0A0A0A] border-t border-[#1F1F1F] mt-auto hidden md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-3">
            <img
              src="/valgrow-labs-logo.jpeg"
              alt="ValGrow Labs"
              className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
            />
            <div className="leading-none">
              <p className="text-[9px] font-bold text-[#D9A928]/60 uppercase tracking-[0.2em]">Powered by</p>
              <p className="text-sm font-black text-white tracking-wide leading-tight">ValGrow Labs</p>
              <p className="text-[9px] font-bold text-[#D9A928] uppercase tracking-widest">AI & Technology Lab</p>
            </div>
          </div>
          {/* Right: copyright */}
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            © 2026 ValGrow Labs · All rights reserved
          </p>
        </div>
      </footer>

    </div>
  );
}
