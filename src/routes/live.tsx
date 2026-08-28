import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Trophy, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/live")({
  component: LiveRedirectPage,
});

function LiveRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/pointables", replace: true });
  }, [navigate]);

  return (
    <AppShell title="Pointables">
      <div className="card-surface p-12 flex flex-col items-center justify-center text-center gap-3 border border-[#E5E5E5] bg-white rounded-3xl max-w-md mx-auto my-12">
        <Trophy className="h-8 w-8 text-[#D9A928] animate-bounce" />
        <p className="text-sm font-black text-[#111111] uppercase tracking-wide">
          Navigating to Pointables...
        </p>
        <RefreshCw className="h-4 w-4 text-[#5F6368] animate-spin" />
      </div>
    </AppShell>
  );
}
