import { Outlet, createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { 
  MonitorPlay, 
  Tv, 
  Users, 
  Handshake,
  Calendar,
  Trophy,
  CheckSquare,
  Image as ImageIcon,
  Settings,
  LogOut,
  Lock,
  Menu,
  X
} from "lucide-react";

import { useState } from "react";

export const Route = createFileRoute("/obs-handler")({
  component: ObsHandlerLayout,
});

function ObsHandlerLayout() {
  const { isAdminAuthenticated, loginAdmin, logoutAdmin, isLoading } = useAdminAuth();
  const location = useLocation();
  const [operatorAuth, setOperatorAuth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.sessionStorage.getItem("tpl_obs_operator_auth") === "true";
    }
    return false;
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthorized = isAdminAuthenticated || operatorAuth;

  if (isLoading && !operatorAuth) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#D9A928] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#141414] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <Logo size="lg" />
            <h1 className="text-xl font-black text-white uppercase tracking-widest text-center mt-3">
              OBS Handler Auth
            </h1>
            <p className="text-[11px] text-white/50 text-center mt-1">
              Authorized broadcast operator portal
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const clean = password.trim().toLowerCase();
              if (
                clean === "valgrow" ||
                clean === "tpl2026" ||
                clean === "2026" ||
                clean === "valgrow123" ||
                clean === "admin"
              ) {
                if (typeof window !== "undefined") {
                  window.sessionStorage.setItem("tpl_obs_operator_auth", "true");
                }
                setOperatorAuth(true);
                setError("");
                return;
              }

              const result = await loginAdmin("admin@tpl.com", password);
              if (result.success) {
                if (typeof window !== "undefined") {
                  window.sessionStorage.setItem("tpl_obs_operator_auth", "true");
                }
                setOperatorAuth(true);
                setError("");
              } else {
                setError(result.error || "Invalid operator password");
              }
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-[10px] font-black text-[#888888] uppercase tracking-widest mb-2">
                Operator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-[#222222] border border-[#333333] text-white rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[#D9A928] focus:ring-1 focus:ring-[#D9A928] transition-all"
                  placeholder="Enter password (e.g. valgrow)"
                  autoFocus
                />
              </div>
              {error && <p className="mt-2 text-xs text-red-500 font-bold">{error}</p>}
            </div>
            <button
              type="submit"
              className="tap w-full bg-[#D9A928] hover:bg-[#F4C542] text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-colors mt-2"
            >
              Access Handler
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "LIVE MATCH", icon: MonitorPlay, to: "/obs-handler" },
    { label: "BETWEEN MATCHES", icon: Tv, to: "/obs-handler/between-matches" },
    { label: "TEAM SQUADS", icon: Users, to: "/obs-handler/squads" },
    { label: "PARTNERSHIPS", icon: Handshake, to: "/obs-handler/partnerships" },
    { label: "UPCOMING MATCHES", icon: Calendar, to: "/obs-handler/upcoming" },
    { label: "PLAYER AWARDS", icon: Trophy, to: "/obs-handler/awards" },
    { label: "MATCH RESULT", icon: CheckSquare, to: "/obs-handler/result" },
    { label: "MEDIA LIBRARY", icon: ImageIcon, to: "/obs-handler/media" },
    { label: "SETTINGS", icon: Settings, to: "/obs-handler/settings" },
  ];

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("tpl_obs_operator_auth");
    }
    setOperatorAuth(false);
    await logoutAdmin();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row overflow-x-hidden font-sans">
      {/* ── Mobile Header Bar (Sticky) ──────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111111] border-b border-[#222222] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Logo size="sm" className="shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">OBS HANDLER</p>
            <p className="text-[10px] text-[#D9A928] font-extrabold uppercase tracking-widest">TPL 2026</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="p-2 rounded-xl bg-[#222222] border border-[#333333] text-white hover:bg-[#333333] transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Slide-out Drawer Panel ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-[280px] h-full bg-[#111111] flex flex-col justify-between p-4 shadow-2xl overflow-y-auto z-10 animate-in slide-in-from-left duration-200 border-r border-[#222222]">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <div className="flex items-center gap-2.5">
                  <Logo size="sm" className="shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white">OBS HANDLER</p>
                    <p className="text-[10px] text-[#D9A928] font-extrabold uppercase tracking-widest">TPL 2026</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-[#222222] border border-[#333333] text-white hover:bg-[#333333] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        isActive
                          ? "bg-[#D9A928] text-black shadow-md"
                          : "text-[#888888] hover:bg-[#222222] hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#222222] mt-4 flex flex-col gap-2">
              <Link
                to="/obs/live"
                target="_blank"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#D9A928] hover:underline uppercase"
              >
                <Tv className="w-4 h-4" />
                <span>View OBS Master</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar Navigation (Hidden on Mobile) ───────────────── */}
      <div className="hidden md:flex w-64 bg-[#111111] border-r border-[#222222] flex-col flex-shrink-0 z-20">
        <div className="p-6 border-b border-[#222222]">
          <Logo size="md" className="mb-2" />
          <h1 className="text-[10px] font-black uppercase tracking-widest text-[#D9A928]">
            OBS Handler Console
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive 
                    ? "bg-[#D9A928] text-black shadow-sm" 
                    : "text-[#888888] hover:bg-[#222222] hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#222222]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-xs font-black uppercase tracking-wider text-[#888888] hover:bg-[#222222] hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden bg-[#0A0A0A]">
        <header className="hidden md:flex h-16 border-b border-[#222222] bg-[#111111] items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            {navItems.find((n) => n.to === location.pathname)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#25D366]">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
