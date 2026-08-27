import { Link } from "@tanstack/react-router";
import { Home, ListChecks, Radio, ClipboardList, User } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/matches", label: "Matches", icon: ListChecks },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/scorecards", label: "Scores", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
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
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <Logo />
          </Link>
          <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
            {title ?? "Live Scoring"}
          </span>
        </div>
      </header>

      {fullBleedTop ? (
        <main className={`${hideNav ? "pb-8" : "pb-24"} md:pb-10`}>
          {children}
        </main>
      ) : (
        <main className={`mx-auto max-w-6xl px-4 pt-4 ${hideNav ? "pb-8" : "pb-24"} md:pb-10`}>
          {children}
        </main>
      )}

      {!hideNav && (
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
            {navItems.map((item) => (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className="tap flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5"
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-bold tracking-wide uppercase">
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
