import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Radio, ClipboardList, User } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const navItems = [
  { to: "/home", label: "Dashboard", icon: Home },
  { to: "/matches", label: "Matches", icon: ListChecks },
  { to: "/live", label: "Live Center", icon: Radio, isLive: true },
  { to: "/scorecards", label: "Scorecards", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function TplBottomDock() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] pointer-events-auto">
      <Dock
        panelHeight={56}
        magnification={70}
        distance={120}
        className="bg-white/90 backdrop-blur-xl border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:bg-black/90 dark:border-white/15 px-3 py-1.5 rounded-full items-center"
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.to || (item.to === "/home" && currentPath === "/");
          const Icon = item.icon;

          return (
            <DockItem
              key={item.to}
              className={`aspect-square rounded-full transition-colors ${
                isActive
                  ? "bg-[#D9A928] text-black shadow-md"
                  : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08] dark:bg-white/10 dark:text-white/80"
              }`}
            >
              <DockLabel className="bg-black text-white font-extrabold text-[10px] tracking-wider uppercase border-0 shadow-lg px-2.5 py-1">
                {item.label}
              </DockLabel>
              <DockIcon>
                <Link
                  to={item.to}
                  className="flex h-full w-full items-center justify-center relative"
                  aria-label={item.label}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-black" : "text-current"}`} />
                  {item.isLive && !isActive && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </Link>
              </DockIcon>
            </DockItem>
          );
        })}
      </Dock>
    </div>
  );
}
