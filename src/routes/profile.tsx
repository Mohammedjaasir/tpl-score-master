import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useTournamentStats } from "@/hooks/useCricketData";
import { useScorerAuth, useAdminAuth } from "@/lib/auth";
import {
  User,
  Database,
  ShieldCheck,
  RefreshCw,
  Lock,
  Mail,
  Key,
  ArrowRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const stats = useTournamentStats();
  const { isAuthenticated, userEmail, loginWithPassword, loginWithPin, logout, isLoading } = useScorerAuth();
  const { isAdminAuthenticated, adminEmail } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [authMode, setAuthMode] = useState<"password" | "pin">("password");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    const res = await loginWithPassword(email, password);
    if (res.success) {
      navigate({ to: "/scorer" });
    } else {
      setErrorMsg(res.error || "Invalid email or password. Please verify your scorer credentials.");
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!pin) {
      setErrorMsg("Please enter your tournament Scorer PIN.");
      return;
    }

    const success = loginWithPin(pin);
    if (success) {
      navigate({ to: "/scorer" });
    } else {
      setErrorMsg("Invalid Scorer PIN. Please check tournament administration.");
    }
  };

  return (
    <AppShell title="Profile">
      <div className="max-w-md mx-auto flex flex-col items-center gap-6 pt-4 pb-16">
        {/* User / Scorer Avatar */}
        <div className="relative">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#121316] text-[#D9A928] border border-white/10 shadow-lg">
            <User className="h-10 w-10" />
          </div>
          {isAuthenticated && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-wide text-[#111111]">
            {isAuthenticated ? "Official Scorer" : "Scorer & Official Portal"}
          </h1>
          <p className="text-xs text-[#5F6368] font-medium mt-1">
            {isAuthenticated
              ? `Signed in as ${userEmail || "Official Scorer"}`
              : "Sign in with your scorer credentials to access live match scoring controls."}
          </p>
        </div>

        {/* ── AUTHENTICATED SCORER VIEW ───────────────────────────────── */}
        {isAuthenticated ? (
          <div className="w-full flex flex-col gap-4">
            {/* Go to Scorer Console CTA */}
            <Link
              to="/scorer"
              className="tap flex items-center justify-between p-5 rounded-2xl bg-[#D9A928] hover:bg-[#F4C542] text-[#111111] font-black text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(217,169,40,0.35)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6" />
                <div className="text-left leading-tight">
                  <p>OPEN SCORER CONSOLE</p>
                  <p className="text-[10px] font-bold text-black/70">Manage & Score Active Matches</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Account Card */}
            <div className="w-full card-surface p-5 flex flex-col gap-4 border border-[#E5E5E5] bg-white rounded-2xl">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <span className="text-xs font-bold text-[#5F6368]">Account Role</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Authenticated Scorer
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5F6368]">User Email</span>
                <span className="text-xs font-mono font-bold text-[#111111]">{userEmail}</span>
              </div>
            </div>

            {/* Database & Sync Status */}
            <div className="w-full card-surface p-5 flex flex-col gap-4 border border-[#E5E5E5] bg-white rounded-2xl">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <span className="text-xs font-bold text-[#5F6368] flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#D9A928]" />
                  Tournament Database
                </span>
                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="rounded-xl bg-[#F7F7F5] p-3">
                  <p className="text-lg font-black text-[#111111]">
                    {stats.isLoading ? <RefreshCw className="h-4 w-4 mx-auto animate-spin" /> : stats.totalTeams}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368] mt-0.5">Teams</p>
                </div>
                <div className="rounded-xl bg-[#F7F7F5] p-3">
                  <p className="text-lg font-black text-[#111111]">
                    {stats.isLoading ? <RefreshCw className="h-4 w-4 mx-auto animate-spin" /> : stats.totalPlayers}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368] mt-0.5">Players</p>
                </div>
                <div className="rounded-xl bg-[#F7F7F5] p-3">
                  <p className="text-lg font-black text-[#111111]">
                    {stats.isLoading ? <RefreshCw className="h-4 w-4 mx-auto animate-spin" /> : stats.totalMatches}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5F6368] mt-0.5">Matches</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="tap flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out of Scorer Session</span>
            </button>
          </div>
        ) : (
          /* ── UNIFIED SCORER LOGIN FORM ──────────────────────────────── */
          <div className="w-full bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-[#F7F7F5] p-1 border border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  authMode === "password"
                    ? "bg-white text-[#111111] shadow-sm"
                    : "text-[#5F6368] hover:text-[#111111]"
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("pin");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  authMode === "pin"
                    ? "bg-white text-[#111111] shadow-sm"
                    : "text-[#5F6368] hover:text-[#111111]"
                }`}
              >
                Scorer PIN
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email & Password Form */}
            {authMode === "password" ? (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3.5 mt-1">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1">
                    Scorer Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                    <input
                      type="email"
                      required
                      placeholder="scorer@tpl.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-[#F7F7F5] text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#D9A928] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-[#F7F7F5] text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#D9A928] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="tap mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#9A6A05] text-[#111111] font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In & Open Scorer Console</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* PIN Form */
              <form onSubmit={handlePinSubmit} className="flex flex-col gap-3.5 mt-1">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#5F6368] mb-1">
                    Tournament Scorer PIN
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="Enter PIN (e.g. 2026)"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-[#F7F7F5] text-center text-base font-black tracking-widest text-[#111111] focus:outline-none focus:border-[#D9A928] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!pin}
                  className="tap mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#9A6A05] text-[#111111] font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  <span>Verify PIN & Open Scorer Console</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            <div className="border-t border-[#E5E5E5] pt-3 text-center">
              <p className="text-[11px] text-[#5F6368] font-medium">
                Public users can view live scores & scorecards without logging in.
              </p>
            </div>
          </div>
        )}

        {/* ── ADMIN ACCESS ENTRY POINT ─────────────────────────────────── */}
        <div className="w-full card-surface p-5 flex flex-col gap-3.5 border border-[#E5E5E5] bg-white rounded-3xl shadow-md">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-[#121316] text-[#D9A928] flex items-center justify-center shadow-sm">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  {isAdminAuthenticated ? "TPL Admin Portal" : "Tournament Administration"}
                </p>
                <p className="text-[10px] text-[#5F6368] font-medium">
                  {isAdminAuthenticated ? `Authorized as ${adminEmail}` : "Tournament management, fixtures & reports"}
                </p>
              </div>
            </div>
            {isAdminAuthenticated && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            )}
          </div>

          <Link
            to="/admin"
            className="tap flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#121316] hover:bg-[#1C1E23] text-white font-black text-xs uppercase tracking-wider transition-all group shadow-sm"
          >
            <span className="text-[#D9A928]">
              {isAdminAuthenticated ? "ADMIN PORTAL →" : "ADMIN LOGIN →"}
            </span>
            <ArrowRight className="h-4 w-4 text-[#D9A928] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
