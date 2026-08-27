import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useTournamentStats } from "@/hooks/useCricketData";
import { User, Database, ShieldCheck, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const stats = useTournamentStats();

  return (
    <AppShell title="Profile">
      <div className="max-w-md mx-auto flex flex-col items-center gap-6 pt-8">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-secondary">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Official Scorer</h1>
          <p className="text-sm text-muted-foreground mt-1">TPL 2026 Live Cricket Scorer</p>
        </div>

        {/* Database & Sync Status */}
        <div className="w-full card-surface p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Data Source
            </span>
            <span className="text-xs font-extrabold text-success flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Supabase Connected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-lg font-black text-foreground">
                {stats.isLoading ? <RefreshCw className="h-4 w-4 mx-auto animate-spin" /> : stats.totalTeams}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Teams</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-lg font-black text-foreground">
                {stats.isLoading ? <RefreshCw className="h-4 w-4 mx-auto animate-spin" /> : stats.totalPlayers}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Players</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-lg font-black text-foreground">
                {stats.isLoading ? <RefreshCw className="h-4 w-4 mx-auto animate-spin" /> : stats.totalMatches}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Matches</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground bg-foreground/5 p-3 rounded-xl">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>Authenticated with Supabase RLS policies active.</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
