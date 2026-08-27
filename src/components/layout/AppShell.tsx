import { Link } from "@tanstack/react-router";
import { Home, ListChecks, Radio, ClipboardList, User } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { to: "/home", label: "Dashboard", icon: Home },
  { to: "/matches", label: "Matches", icon: ListChecks },
  { to: "/live", label: "Live Center", icon: Radio },
  { to: "/scorecards", label: "Scorecards", icon: ClipboardList },
  { to: "/profile", label: "Scorer Profile", icon: User },
] as const;

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
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation Links */}
            {!hideNav && (
              <nav aria-label="Desktop Primary" className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.to === "/home" }}
                    activeProps={{
                      className: "bg-[#D9A928]/10 text-[#111111] font-extrabold border-b-2 border-[#D9A928]",
                    }}
                    inactiveProps={{
                      className: "text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F7F5] font-semibold border-b-2 border-transparent",
                    }}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs uppercase tracking-wider transition-all"
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-full bg-[#F7F7F5] border border-[#E5E5E5] px-3 py-1 text-[11px] font-extrabold tracking-wider text-[#5F6368] uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
              {title ?? "TPL Live Scoring"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content Body ────────────────────────────────────────── */}
      {fullBleedTop ? (
        <main className={`flex-1 ${hideNav ? "pb-8" : "pb-24"} md:pb-10`}>
          {children}
        </main>
      ) : (
        <main className={`flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-4 ${hideNav ? "pb-8" : "pb-24"} md:pb-10`}>
          {children}
        </main>
      )}

      {/* ── Mobile Bottom Navigation Bar ──────────────────────────────── */}
      {!hideNav && (
        <nav
          aria-label="Mobile Navigation"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E5E5] bg-white/95 backdrop-blur-md md:hidden shadow-lg"
        >
          <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
            {navItems.map((item) => (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/home" }}
                  activeProps={{ className: "text-[#D9A928]" }}
                  inactiveProps={{ className: "text-[#5F6368]" }}
                  className="tap flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors"
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[9px] font-extrabold tracking-wide uppercase">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
