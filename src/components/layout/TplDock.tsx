import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Trophy, ClipboardList, User } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const navItems = [
  { to: "/home", label: "Dashboard", icon: Home },
  { to: "/matches", label: "Matches", icon: ListChecks },
  { to: "/pointables", label: "POINTABLES", icon: Trophy },
  { to: "/scorecards", label: "Scorecards", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function TplBottomDock() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto w-fit z-50 pointer-events-auto flex justify-center px-3 max-w-full">
      <Dock
        panelHeight={52}
        magnification={66}
        distance={110}
        className="bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:bg-black/90 dark:border-white/15 px-2.5 sm:px-3.5 py-1 rounded-full items-center"
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
                  <Icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${isActive ? "text-black" : "text-current"}`} />
                  {item.isLive && !isActive && (
                    <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
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
