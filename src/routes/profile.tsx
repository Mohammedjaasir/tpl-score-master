import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  return (
    <AppShell title="Profile">
      <div className="max-w-md mx-auto flex flex-col items-center gap-6 pt-8">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-secondary">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Scorer</h1>
          <p className="text-sm text-muted-foreground mt-1">TPL 2026 Official Scorer</p>
        </div>
        <div className="w-full card-surface px-4 py-4">
          <p className="text-sm font-bold text-muted-foreground text-center">
            Profile management coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
