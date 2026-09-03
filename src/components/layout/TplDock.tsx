import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Trophy, ClipboardList, User } from "lucide-react";

const navItems = [
  { to: "/home", label: "Dashboard", icon: Home },
  { to: "/matches", label: "Matches", icon: ListChecks },
  { to: "/pointables", label: "Standings", icon: Trophy },
  { to: "/scorecards", label: "Scorecards", icon: ClipboardList },
] as const;

export function TplBottomDock() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <>
      {/* ── ValGrow Labs Branding Strip (fixed, just above the dock) ── */}
      <div
        className="md:hidden fixed z-40 pointer-events-none"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "max(90px, calc(env(safe-area-inset-bottom, 0px) + 86px))",
          width: "min(420px, calc(100vw - 28px))",
        }}
      >
        <div className="w-full bg-[#0A0A0A]/90 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center justify-center gap-2 border border-[#2A2A2A] shadow-lg">
          <img
            src="/valgrow-labs-logo.jpeg"
            alt="ValGrow Labs"
            className="h-5 w-5 rounded-md object-cover flex-shrink-0"
          />
          <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
            <span className="text-[#D9A928] font-black">Powered by</span>{" "}
            ValGrow Labs
          </p>
        </div>
      </div>

      <aside
        aria-label="Mobile Navigation"
        className="md:hidden fixed z-40 pointer-events-auto"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "max(14px, calc(env(safe-area-inset-bottom, 0px) + 8px))",
          width: "min(420px, calc(100vw - 28px))",
          height: "68px",
        }}
      >
        <nav className="w-full h-full bg-white/95 dark:bg-[#14161A]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/15 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.28)] flex items-center justify-between px-3 select-none">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.to ||
              (item.to === "/home" && (currentPath === "/" || currentPath === "")) ||
              (item.to === "/matches" && currentPath.startsWith("/match")) ||
              (item.to === "/pointables" && currentPath.startsWith("/pointables")) ||
              (item.to === "/scorecards" && currentPath.startsWith("/scorecard"));

            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`tap group relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#D9A928] text-[#111111] shadow-md scale-105"
                    : "bg-transparent text-[#4B5563] hover:text-[#111111] hover:bg-black/[0.05] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
                }`}
                aria-label={item.label}
                title={item.label}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#111111] stroke-[2.5]" : "stroke-[2]"}`} />
                {isActive && (
                  <span className="sr-only">({item.label} - Active Page)</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

