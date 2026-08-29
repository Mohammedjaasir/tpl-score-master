import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMatches, useTeams, usePlayers } from "@/hooks/useCricketData";
import { useAdminAuth } from "@/lib/auth";
import { lookup, matchRepository, TOURNAMENT_NAME } from "@/lib/repositories";
import { broadcastTournamentUpdate } from "@/lib/scoring/store";
import { Logo } from "@/components/brand/Logo";
import { TeamLogo } from "@/components/team/TeamLogo";
import { formatMatchTime } from "@/lib/utils";
import type { Match, Player, Team } from "@/types/cricket";
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  BookOpen,
  Gavel,
  Printer,
  History,
  UserCheck,
  Settings,
  LogOut,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  FileText,
  Download,
  Trash2,
  Edit,
  Clock,
  MapPin,
  Play,
  RotateCcw,
  X,
  ExternalLink,
  ChevronRight,
  Menu,
} from "lucide-react";

import {
  TPL_STATISTICS_METHODOLOGY,
  getAllMethodologiesByCategory,
  METHODOLOGY_VERSION,
  METHODOLOGY_LAST_UPDATED,
  OFFICIAL_RULES_REFERENCE_URL,
  type MetricCategory,
} from "@/lib/scoring/statistics-methodology";

export const Route = createFileRoute("/admin")({
  component: AdminPortalPage,
});

type AdminSection =
  | "overview"
  | "players"
  | "teams"
  | "tournament"
  | "methodology"
  | "manuals"
  | "auction"
  | "reports"
  | "changelog"
  | "staff"
  | "settings";

const ADMIN_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "players", label: "Players", icon: Users },
  { id: "teams", label: "Teams", icon: Shield },
  { id: "tournament", label: "Tournament Control", icon: Calendar },
  { id: "methodology", label: "Stats Methodology", icon: BookOpen },
  { id: "manuals", label: "System Manuals", icon: FileText },
  { id: "auction", label: "Auction Manager", icon: Gavel },
  { id: "reports", label: "Print Reports", icon: Printer },
  { id: "changelog", label: "Changelog", icon: History },
  { id: "staff", label: "Staff & Admins", icon: UserCheck },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

function AdminPortalPage() {
  const { authStatus, isAdminAuthenticated, adminEmail, isSubmitting, loginAdmin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: matches = [], refetch: refetchMatches } = useMatches();
  const { data: teams = [], refetch: refetchTeams } = useTeams();
  const { data: players = [], refetch: refetchPlayers } = usePlayers();


  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Player view state
  const [playerTab, setPlayerTab] = useState<"active" | "pending">("active");
  const [playerSearch, setPlayerSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedPlayerForView, setSelectedPlayerForView] = useState<Player | null>(null);

  // Tournament control modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showKnockoutModal, setShowKnockoutModal] = useState(false);
  const [knockoutStage, setKnockoutStage] = useState<"Semi-Final 1" | "Semi-Final 2" | "Final">("Semi-Final 1");
  const [knockoutTeamA, setKnockoutTeamA] = useState("");
  const [knockoutTeamB, setKnockoutTeamB] = useState("");
  const [knockoutTime, setKnockoutTime] = useState("16:00");
  const [knockoutDate, setKnockoutDate] = useState("2026-08-30");

  // Schedule action status state
  const [scheduleActionError, setScheduleActionError] = useState<string | null>(null);
  const [isScheduleActionLoading, setIsScheduleActionLoading] = useState(false);

  // Report modal state
  const [activeReportModal, setActiveReportModal] = useState<string | null>(null);

  // Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffList, setStaffList] = useState([
    { id: "s1", name: "Official Scorer", email: "scorer@tpl.com", role: "Chief Scorer", status: "Active" },
    { id: "s2", name: "Tournament Director", email: "director@tpl.com", role: "Super Admin", status: "Active" },
    { id: "s3", name: "Match Referee", email: "referee@tpl.com", role: "Official Referee", status: "Active" },
  ]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Official Scorer");

  // Filtered players (Unconditional Hook Call)
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (playerTab === "active" && !p.name) return false;
      if (playerSearch.trim()) {
        const q = playerSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesRef = p.referenceId?.toLowerCase().includes(q);
        const matchesTeam = lookup.team(p.teamId)?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesTeam) return false;
      }
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (teamFilter !== "all" && p.teamId !== teamFilter) return false;
      return true;
    });
  }, [players, playerTab, playerSearch, roleFilter, teamFilter]);

  // ── Mobile Drawer Body Scroll Lock & ESC Key Listener ──────────────────────
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
      setAuthError("Please provide both email and password.");
      return;
    }
    const res = await loginAdmin(email, password);
    if (!res.success) {
      setAuthError(res.error || "INVALID ADMIN CREDENTIALS");
    }
  };

  // ── AUTO-GENERATE SCHEDULE HANDLER ────────────────────────────────────────
  const handleAutoGenerateSchedule = async () => {
    if (teams.length < 2) return;
    setIsScheduleActionLoading(true);
    setScheduleActionError(null);

    try {
      let group1 = teams.filter((t) => (t.groupName || "").includes("1") || (t.groupName || "").toUpperCase().includes("A"));
      let group2 = teams.filter((t) => (t.groupName || "").includes("2") || (t.groupName || "").toUpperCase().includes("B"));

      if (group1.length === 0 || group2.length === 0) {
        const half = Math.ceil(teams.length / 2);
        group1 = teams.slice(0, half);
        group2 = teams.slice(half);
      }

      const fixtures: Match[] = [];
      const baseTime = new Date();
      baseTime.setHours(9, 0, 0, 0);
      let matchNum = 1;

      for (let i = 0; i < group1.length; i++) {
        for (let j = 0; j < group2.length; j++) {
          const scheduledDate = new Date(baseTime.getTime() + (matchNum - 1) * 45 * 60 * 1000);
          const teamA = group1[(i + j) % group1.length];
          const teamB = group2[j];

          fixtures.push({
            id: `tpl-fixture-${matchNum}`,
            tournament: TOURNAMENT_NAME,
            matchNumber: matchNum,
            teamAId: teamA.id,
            teamBId: teamB.id,
            venue: "TPL Cricket Ground",
            overs: 5,
            scheduledAt: scheduledDate.toISOString(),
            status: "UPCOMING",
            resultText: undefined,
          });
          matchNum++;
        }
      }

      const savedMatches = await matchRepository.saveSchedule(fixtures);
      queryClient.setQueryData(["matches"], savedMatches);
      broadcastTournamentUpdate();
      await refetchMatches();
    } catch (err: any) {
      console.error("[handleAutoGenerateSchedule] Error:", err);
      setScheduleActionError(err?.message || "Unable to save match schedule. Please try again.");
    } finally {
      setIsScheduleActionLoading(false);
    }
  };

  // ── RESET MATCHES HANDLER ────────────────────────────────────────────────
  const handleResetMatches = async () => {
    setIsScheduleActionLoading(true);
    setScheduleActionError(null);

    try {
      // Clear scoring docs for upcoming matches
      if (typeof window !== "undefined") {
        try {
          matches.filter((m) => m.status === "UPCOMING" || m.status === "READY").forEach((m) => {
            window.localStorage.removeItem("tpl-scoring:" + m.id);
          });
        } catch {}
      }
      await matchRepository.resetSchedule();
      const remainingMatches = await matchRepository.list();
      queryClient.setQueryData(["matches"], remainingMatches);
      broadcastTournamentUpdate();
      setShowResetConfirm(false);
    } catch (err: any) {
      console.error("[handleResetMatches] Error:", err);
      setScheduleActionError(err?.message || "Unable to reset upcoming fixtures. Please try again.");
    } finally {
      setIsScheduleActionLoading(false);
    }
  };

  // ── SCHEDULE KNOCKOUT HANDLER ─────────────────────────────────────────────
  const handleScheduleKnockout = async () => {
    if (!knockoutTeamA || !knockoutTeamB) return;
    setIsScheduleActionLoading(true);
    setScheduleActionError(null);

    try {
      const nextMatchNum = matches.length + 1;
      const scheduledDateTime = new Date(`${knockoutDate}T${knockoutTime}:00`);

      const newMatch: Match = {
        id: `tpl-knockout-${nextMatchNum}`,
        tournament: `${TOURNAMENT_NAME} - ${knockoutStage}`,
        matchNumber: nextMatchNum,
        teamAId: knockoutTeamA,
        teamBId: knockoutTeamB,
        venue: "TPL Cricket Ground",
        overs: 5,
        scheduledAt: scheduledDateTime.toISOString(),
        status: "UPCOMING",
        resultText: undefined,
      };

      const created = await matchRepository.createMatch(newMatch);
      const updated = [...matches, created];
      queryClient.setQueryData(["matches"], updated);
      broadcastTournamentUpdate();
      await refetchMatches();
      setShowKnockoutModal(false);
    } catch (err: any) {
      console.error("[handleScheduleKnockout] Error:", err);
      setScheduleActionError(err?.message || "Unable to schedule knockout match. Please try again.");
    } finally {
      setIsScheduleActionLoading(false);
    }
  };

  // ── State 1: Verification Loading Screen (Clean Light TPL Design) ───────────
  if (authStatus === "LOADING") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size="md" className="mb-2" />
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9A6A05]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>VERIFYING ADMIN ACCESS...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── State 2: Authenticated but Unauthorized Screen ─────────────────────────
  if (authStatus === "UNAUTHORIZED") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 text-center">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase text-[#111827]">ACCESS DENIED</h1>
            <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
              Your authenticated account ({adminEmail}) is not authorized with Administrator privileges for the TPL 2026 portal.
            </p>
          </div>
          <button
            onClick={() => logoutAdmin()}
            className="tap w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  // ── State 3: Unauthenticated Admin Login Screen (Clean White TPL Design) ────
  if (authStatus === "UNAUTHENTICATED" || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[440px] bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
          {/* Official TPL Brand Header */}
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" className="mb-3" />
            <h1 className="text-2xl font-black uppercase tracking-wider text-[#111827]">TPL 2026</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9A6A05] mt-0.5">ADMIN PORTAL</p>
            <p className="text-xs text-[#6B7280] mt-1.5">
              Sign in with your tournament administrator credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#4B5563]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError(null);
                }}
                placeholder="admin@example.com"
                disabled={isSubmitting}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#D9A928] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-all disabled:opacity-50"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#4B5563]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(null);
                }}
                placeholder="•••••••••"
                disabled={isSubmitting}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#D9A928] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-all disabled:opacity-50"
                required
              />
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="tap mt-1 w-full py-3.5 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#C2941E] disabled:opacity-60 text-[#111111] font-black text-xs uppercase tracking-wider shadow-md shadow-[#D9A928]/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#111111]" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280] font-semibold">
            <span>Official TPL 2026 Admin</span>
            <Link to="/home" className="hover:text-[#9A6A05] transition-colors">
              ← PUBLIC SITE
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col md:flex-row">
      {/* ── MOBILE HEADER BAR (Sticky to Viewport) ──────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo size="md" className="shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#111827]">ADMIN PORTAL</p>
            <p className="text-[10px] text-[#9A6A05] font-extrabold uppercase tracking-widest">TPL 2026</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="p-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827] hover:bg-[#E5E7EB] transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── MOBILE VIEWPORT-FIXED NAVIGATION DRAWER & BACKDROP ───────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Admin Navigation Menu">
          {/* Semi-transparent Backdrop with click-to-close */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel: Fixed to Viewport, full height, independent of page scroll */}
          <div className="relative w-full max-w-[280px] sm:max-w-xs h-full bg-white flex flex-col justify-between p-4 shadow-2xl overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col gap-5">
              {/* Drawer Brand Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2.5">
                  <Logo size="md" className="shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#111827]">ADMIN PORTAL</p>
                    <p className="text-[10px] text-[#9A6A05] font-extrabold uppercase tracking-widest">TPL 2026</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827] hover:bg-[#E5E7EB] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id as AdminSection);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                        isActive
                          ? "bg-[#D9A928] text-[#111111] font-black shadow-sm"
                          : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#111111]" : "text-[#9CA3AF]"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#E5E7EB] mt-4">
              <div className="flex flex-col gap-1.5 text-[11px] font-bold text-[#6B7280] px-2">
                <Link
                  to="/scorer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-[#9A6A05] transition-colors py-1"
                >
                  <Play className="h-3.5 w-3.5 text-[#9A6A05]" />
                  <span>Scorer Console</span>
                </Link>
                <Link
                  to="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-[#9A6A05] transition-colors py-1"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span>Public Website</span>
                </Link>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutAdmin();
                }}
                className="tap flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>

              <div className="px-2 pt-1 text-[9px] text-[#9CA3AF] font-bold uppercase tracking-widest text-center">
                Technology Partner: Valgrow Labs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR NAVIGATION (Sticky Viewport Height) ──────────── */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-[#E5E7EB] flex-col justify-between p-4 sticky top-0 h-screen z-20 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <Logo size="md" className="shrink-0" />
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-[#111827]">ADMIN PORTAL</p>
              <p className="text-[10px] text-[#9A6A05] font-extrabold tracking-widest uppercase">Official Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                    isActive
                      ? "bg-[#D9A928] text-[#111111] font-black shadow-sm"
                      : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#111111]" : "text-[#9CA3AF]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#E5E7EB] mt-6">
          <div className="flex flex-col gap-1.5 text-[11px] font-bold text-[#6B7280] px-2">
            <Link to="/scorer" className="flex items-center gap-2 hover:text-[#9A6A05] transition-colors py-1">
              <Play className="h-3.5 w-3.5 text-[#9A6A05]" />
              <span>Scorer Console</span>
            </Link>
            <Link to="/home" className="flex items-center gap-2 hover:text-[#9A6A05] transition-colors py-1">
              <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
              <span>Public Website</span>
            </Link>
          </div>

          <button
            onClick={() => logoutAdmin()}
            className="tap flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="px-2 pt-1 text-[9px] text-[#9CA3AF] font-bold uppercase tracking-widest text-center">
            Technology Partner: Valgrow Labs
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl">
        {/* Top Operational Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#111827]">
              {activeSection.replace("-", " ")}
            </h1>
            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
              TPL 2026 Premier League Tournament Management System
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Database Online
            </span>
            <div className="text-right text-xs">
              <p className="font-bold text-[#111827] truncate max-w-[160px]">{adminEmail || "Administrator"}</p>
              <p className="text-[10px] text-[#9A6A05] font-black uppercase">Administrator</p>
            </div>
          </div>
        </div>

        {/* ── SECTION 1: OVERVIEW ────────────────────────────────────────── */}
        {activeSection === "overview" && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Total Registrations</span>
                <div className="my-2">
                  <p className="text-3xl font-black text-[#111827]">{players.length}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">100% Database verified</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Assigned to Teams</span>
                <div className="my-2">
                  <p className="text-3xl font-black text-[#9A6A05]">{players.filter((p) => p.teamId).length}</p>
                </div>
                <span className="text-[10px] text-[#6B7280] font-bold">Across {teams.length} Official Franchises</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Total Collected (LKR)</span>
                <div className="my-2">
                  <p className="text-3xl font-black text-[#111827]">{(players.length * 1500).toLocaleString()}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">Registration Fees</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Matches Scheduled</span>
                <div className="my-2">
                  <p className="text-3xl font-black text-[#111827]">{matches.length}</p>
                </div>
                <span className="text-[10px] text-[#9A6A05] font-bold">
                  {matches.filter((m) => m.status === "LIVE").length} Live • {matches.filter((m) => m.status === "COMPLETED").length} Completed
                </span>
              </div>
            </div>

            {/* Quick Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Franchise Quick Overview */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#111827]">Tournament Franchises ({teams.length})</h3>
                  <button onClick={() => setActiveSection("teams")} className="text-xs font-black text-[#9A6A05] hover:underline uppercase">
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teams.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TeamLogo logoUrl={t.logoUrl} name={t.name} shortName={t.shortName} size="xs" />
                        <div>
                          <p className="text-xs font-bold text-[#111827] uppercase">{t.name}</p>
                          <p className="text-[10px] text-[#6B7280]">{t.groupName || "Group Stage"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#9A6A05]">
                        {lookup.playersOf(t.id).length} Players
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-3">
                  Recent System Activity
                </h3>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#111827]">Scorer Console Synchronized</p>
                      <p className="text-[10px] text-[#6B7280]">Realtime WebSocket broadcast active</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-[#9A6A05] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#111827]">9 Group Matches Ready</p>
                      <p className="text-[10px] text-[#6B7280]">Cross-pool schedule prepared</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#111827]">Knockout Stage Configured</p>
                      <p className="text-[10px] text-[#6B7280]">Top 2 qualification active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: PLAYERS ─────────────────────────────────────────── */}
        {activeSection === "players" && (
          <div className="flex flex-col gap-5">
            {/* Player Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="flex rounded-xl bg-[#F3F4F6] p-1 border border-[#E5E7EB]">
                <button
                  onClick={() => setPlayerTab("active")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${
                    playerTab === "active" ? "bg-[#D9A928] text-[#111111]" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Active Players ({players.length})
                </button>
                <button
                  onClick={() => setPlayerTab("pending")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${
                    playerTab === "pending" ? "bg-[#D9A928] text-[#111111]" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Pending Queue (0)
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    placeholder="Search player or ref..."
                    className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D9A928]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>

                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none"
                >
                  <option value="all">All Teams</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Players Table */}
            <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F9FAFB] text-[10px] font-black uppercase tracking-wider text-[#4B5563] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-4 py-3.5">PLAYER</th>
                      <th className="px-4 py-3.5">TEAM</th>
                      <th className="px-4 py-3.5">PRIMARY ROLE</th>
                      <th className="px-4 py-3.5">PROFILE STATUS</th>
                      <th className="px-4 py-3.5">ATTENDANCE</th>
                      <th className="px-4 py-3.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredPlayers.map((p) => {
                      const t = lookup.team(p.teamId);
                      return (
                        <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-[#9A6A05]">
                                {p.avatar ? <img src={p.avatar} alt="" className="h-full w-full object-cover" /> : p.name[0]}
                              </div>
                              <div>
                                <p className="font-black text-[#111827]">{p.name}</p>
                                <p className="text-[10px] text-[#6B7280]">{p.referenceId || `REF-${p.id.slice(0, 6)}`}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {t ? (
                              <span className="font-bold text-[#9A6A05]">{t.shortName ?? t.name}</span>
                            ) : (
                              <span className="text-[#9CA3AF] italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-bold text-[#374151]">
                              {p.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold text-[#4B5563]">Present</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedPlayerForView(p)}
                              className="tap inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#D9A928] text-[#111827] hover:text-[#111111] font-black text-[10px] uppercase tracking-wider border border-[#E5E7EB] transition-all"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Profile</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 3: TEAMS ───────────────────────────────────────────── */}
        {activeSection === "teams" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((t) => {
              const teamPlayers = lookup.playersOf(t.id);
              return (
                <div key={t.id} className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-3">
                        <TeamLogo logoUrl={t.logoUrl} name={t.name} shortName={t.shortName} size="md" />
                        <div>
                          <h3 className="text-base font-black text-[#111827] uppercase">{t.name}</h3>
                          <p className="text-xs text-[#9A6A05] font-bold uppercase">{t.groupName || "Group 1"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                        <p className="text-[10px] text-[#6B7280] uppercase font-bold">Owner</p>
                        <p className="font-bold text-[#111827] truncate">{t.ownerName || "Franchise Owner"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                        <p className="text-[10px] text-[#6B7280] uppercase font-bold">Squad Size</p>
                        <p className="font-bold text-[#9A6A05]">{teamPlayers.length} Players</p>
                      </div>
                    </div>

                    {/* Squad Mini List */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#6B7280]">Squad Roster</p>
                      <div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1">
                        {teamPlayers.map((tp, idx) => (
                          <div key={tp.id} className="flex items-center justify-between text-xs py-1 border-b border-[#F3F4F6]">
                            <span className="text-[#111827] font-medium">{idx + 1}. {tp.name}</span>
                            <span className="text-[10px] text-[#6B7280]">{tp.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SECTION 4: TOURNAMENT CONTROL ──────────────────────────────── */}
        {activeSection === "tournament" && (
          <div className="flex flex-col gap-6">
            {scheduleActionError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between gap-3 text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{scheduleActionError}</span>
                </div>
                <button
                  onClick={() => setScheduleActionError(null)}
                  className="text-red-500 hover:text-red-800 text-[10px] uppercase font-black px-2 py-1 bg-white rounded-lg border border-red-200"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Control Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#111827]">Tournament Fixture Control</h3>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Generate cross-pool group matches, schedule knockouts, or reset the schedule.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setScheduleActionError(null);
                    setShowResetConfirm(true);
                  }}
                  disabled={isScheduleActionLoading}
                  className="tap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs font-black uppercase tracking-wider transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Upcoming Fixtures</span>
                </button>

                <button
                  onClick={handleAutoGenerateSchedule}
                  disabled={isScheduleActionLoading}
                  className="tap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] disabled:opacity-50 text-[#111111] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isScheduleActionLoading ? "animate-spin" : ""}`} />
                  <span>Auto-Generate Schedule</span>
                </button>

                <button
                  onClick={() => {
                    setScheduleActionError(null);
                    setShowKnockoutModal(true);
                  }}
                  disabled={isScheduleActionLoading}
                  className="tap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-black disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Schedule Knockout</span>
                </button>
              </div>
            </div>

            {/* Fixtures List */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#6B7280] px-1">
                All Matches ({matches.length})
              </h3>

              {matches.length === 0 ? (
                <div className="p-10 rounded-2xl bg-white border border-[#E5E7EB] text-center shadow-sm flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-full border border-[#E5E7EB]">
                    <Calendar className="h-6 w-6 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-[#111827]">No Matches Scheduled Yet</p>
                    <p className="text-xs text-[#6B7280] font-medium mt-1 max-w-sm mx-auto">
                      Click <span className="font-bold text-[#9A6A05]">"Auto-Generate Schedule"</span> above to generate the tournament fixtures from registered teams.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m) => {
                    const teamA = lookup.team(m.teamAId);
                    const teamB = lookup.team(m.teamBId);
                    const time = formatMatchTime(m.scheduledAt);

                    return (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col justify-between gap-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                            <span className="text-[10px] font-black uppercase text-[#9A6A05] bg-[#D9A928]/10 border border-[#D9A928]/20 px-2.5 py-1 rounded-md">
                              Match #{String(m.matchNumber).padStart(2, "0")}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                              m.status === "LIVE"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : m.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-[#F3F4F6] text-[#4B5563]"
                            }`}>
                              {m.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 py-1">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <TeamLogo logoUrl={teamA?.logoUrl} name={teamA?.name} shortName={teamA?.shortName} size="xs" />
                              <span className="text-xs font-bold text-[#111827] uppercase truncate">{teamA?.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#9A6A05]">VS</span>
                            <div className="flex items-center gap-2.5 min-w-0 justify-end">
                              <span className="text-xs font-bold text-[#111827] uppercase truncate text-right">{teamB?.name}</span>
                              <TeamLogo logoUrl={teamB?.logoUrl} name={teamB?.name} shortName={teamB?.shortName} size="xs" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1 border-t border-[#F3F4F6]">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#9A6A05]" />
                              {time}
                            </span>
                            <span>{m.overs} Overs Match</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 5: SYSTEM MANUALS ──────────────────────────────────── */}
        {activeSection === "manuals" && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-5">
              <div className="border-b border-[#E5E7EB] pb-4">
                <h3 className="text-base font-black uppercase text-[#9A6A05]">Official Scorer Terminal Manual</h3>
                <p className="text-xs text-[#6B7280] mt-1">Official step-by-step operating guidelines for scorers and match officials.</p>
              </div>

              <div className="flex flex-col gap-4 text-xs leading-relaxed text-[#374151]">
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col gap-2">
                  <p className="font-black text-[#111827] uppercase text-sm">1. Scorer Terminal Access & PIN</p>
                  <p>Admins and Scorers access the console via <code className="text-[#9A6A05] font-bold">/scorer</code> using authorized credentials or the 6-digit tournament PIN.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col gap-2">
                  <p className="font-black text-[#111827] uppercase text-sm">2. Toss & Playing XI Setup</p>
                  <p>Select the toss winner and their decision (BAT or BOWL). Select up to 11 players per team. A flexible squad size (2 to 11 players) is supported.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col gap-2">
                  <p className="font-black text-[#111827] uppercase text-sm">3. Ball-by-Ball Live Scoring</p>
                  <p>Input deliveries with run buttons (0, 1, 2, 3, 4, 6) and extras (WD, NB, Bye, Leg Bye). Scoring engine automatically recalculates CRR, RRR, partnerships, and fall of wickets.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col gap-2">
                  <p className="font-black text-[#111827] uppercase text-sm">4. Rain Delay Adjustments</p>
                  <p>Use the <code className="text-[#9A6A05] font-bold">Adjust Overs</code> tool in the scorer console to apply ARR target recalculations if rain interrupts play.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 6: AUCTION MANAGER ─────────────────────────────────── */}
        {activeSection === "auction" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                <span className="text-[10px] font-black text-[#6B7280] uppercase">Total Drafted</span>
                <p className="text-2xl font-black text-[#9A6A05] my-1">
                  {players.filter((p) => p.teamId).length} / {players.length}
                </p>
                <span className="text-[10px] text-[#6B7280]">Players Assigned</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                <span className="text-[10px] font-black text-[#6B7280] uppercase">Franchises Ready</span>
                <p className="text-2xl font-black text-[#111827] my-1">{teams.length}</p>
                <span className="text-[10px] text-emerald-600 font-bold">All 6 Active</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                <span className="text-[10px] font-black text-[#6B7280] uppercase">Average Purse Left</span>
                <p className="text-2xl font-black text-[#111827] my-1">100,000 LKR</p>
                <span className="text-[10px] text-[#6B7280]">Per Franchise</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 7: PRINT REPORTS ───────────────────────────────────── */}
        {activeSection === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { id: "reg_master", title: "Registration Master List", desc: "Full list of all registered players and contact references." },
              { id: "auction_results", title: "Final Auction Results", desc: "Complete breakdown of drafted squad lists and sold amounts." },
              { id: "team_signoff", title: "Team Sign-Off Sheets", desc: "Official squad sign-off sheets for franchise captains." },
              { id: "available_players", title: "Available Players List", desc: "Unassigned draft pool eligible for selection." },
              { id: "team_contacts", title: "Team Contact Lists", desc: "Private administrative directory of captain & owner contacts." },
              { id: "match_scorecards", title: "Official Match Scorecards", desc: "Printable certified scorecards of completed tournament matches." },
            ].map((r) => (
              <div key={r.id} className="p-6 rounded-3xl bg-white border border-[#E5E7EB] flex flex-col justify-between gap-5 shadow-sm">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-[#D9A928]/10 text-[#9A6A05] flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-[#111827]">{r.title}</h3>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{r.desc}</p>
                </div>

                <button
                  onClick={() => setActiveReportModal(r.id)}
                  className="tap w-full py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#D9A928] text-[#111827] hover:text-[#111111] font-black text-xs uppercase tracking-wider border border-[#E5E7EB] transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Generate Report →</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── SECTION 8: CHANGELOG ───────────────────────────────────────── */}
        {activeSection === "changelog" && (
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase text-[#9A6A05]">Platform Release History</h3>
              <div className="space-y-4 text-xs text-[#374151]">
                <div className="border-l-2 border-[#D9A928] pl-3 py-1">
                  <p className="font-black text-[#111827]">v2.4.0 — Unified Scorer Match Control & Official Tournament Rules</p>
                  <p className="text-[#6B7280] text-[11px]">Enforced Scorer-only start match, pure HTML empty state, ARR target revision, and Bowled-out NRR formula.</p>
                </div>
                <div className="border-l-2 border-[#E5E7EB] pl-3 py-1">
                  <p className="font-black text-[#111827]">v2.3.0 — Team Logo Size Normalization</p>
                  <p className="text-[#6B7280] text-[11px]">Equalized logo visual footprint generic scaling across all match cards.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 9: STAFF & ADMINS ──────────────────────────────────── */}
        {activeSection === "staff" && (
          <div className="flex flex-col gap-5 max-w-4xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
              <h3 className="text-sm font-black uppercase text-[#111827]">Authorized Tournament Staff</h3>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="tap inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9A928] hover:bg-[#F4C542] text-[#111111] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Admin / Staff</span>
              </button>
            </div>

            <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F9FAFB] text-[10px] font-black uppercase text-[#4B5563] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">EMAIL</th>
                    <th className="px-4 py-3">ROLE</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-bold text-[#111827]">{s.name}</td>
                      <td className="px-4 py-3 text-[#6B7280] font-mono">{s.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#9A6A05] font-bold text-[10px] border border-[#E5E7EB]">
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SECTION 10: SETTINGS ───────────────────────────────────────── */}
        {activeSection === "settings" && (
          <div className="max-w-2xl p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-black uppercase text-[#111827] border-b border-[#E5E7EB] pb-3">
              Tournament Configuration
            </h3>

            <div className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-[10px] font-black text-[#6B7280] uppercase">Tournament Name</label>
                <input
                  type="text"
                  defaultValue="TPL 2026"
                  disabled
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#111827] font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#6B7280] uppercase">Official Match Venue</label>
                <input
                  type="text"
                  defaultValue="TPL Cricket Ground"
                  disabled
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#111827] font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#6B7280] uppercase">Standard Overs</label>
                <input
                  type="text"
                  defaultValue="5 Overs per innings"
                  disabled
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-[#111827] font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: STATISTICS & AWARDS METHODOLOGY ───────────────────── */}
        {activeSection === "methodology" && (
          <div className="flex flex-col gap-6">
            {/* Header Showcase Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121316] via-black to-[#1E1B11] border-2 border-[#D9A928] text-white shadow-xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] bg-[#D9A928]/10 px-2.5 py-0.5 rounded-full border border-[#D9A928]/20">
                        Methodology Version {METHODOLOGY_VERSION}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        Audited & Deterministic
                      </span>
                    </div>
                    <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-white mt-1">
                      Official Statistics & Awards Methodology Specification
                    </h2>
                  </div>
                </div>

                <a
                  href={OFFICIAL_RULES_REFERENCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap px-4 py-2 rounded-xl bg-[#D9A928] text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#E5B537] flex items-center gap-1.5"
                >
                  <span>Official Rules Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                Every statistic, award, ranking, net run rate (NRR), and points table value in TPL 2026 is evaluated purely from authoritative match deliveries (<code className="text-[#D9A928]">balls</code>) and completed match events. Master player, team, and roster data remain strictly read-only.
              </p>
            </div>

            {/* Methodology Categories */}
            {Object.entries(getAllMethodologiesByCategory()).map(([categoryKey, metrics]) => {
              if (metrics.length === 0) return null;
              return (
                <div key={categoryKey} className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#111827]">
                      {categoryKey.replace("_", " ")} SPECIFICATION
                    </h3>
                    <span className="text-[10px] font-bold text-[#6B7280]">
                      {metrics.length} Defined Metrics
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics.map((m) => (
                      <div key={m.key} className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E7EB] flex flex-col gap-2.5">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black uppercase text-[#111827]">{m.name}</h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-[#4B5563]">
                              {m.scope}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[#6B7280]">{m.methodologyVersion}</span>
                        </div>

                        <p className="text-xs text-[#4B5563] font-medium leading-relaxed">{m.description}</p>

                        <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase text-[#9A6A05]">Formula</span>
                          <code className="text-[11px] font-mono text-[#111827] font-bold">{m.formula}</code>
                        </div>

                        <div className="flex flex-col gap-1 text-[11px] text-[#6B7280]">
                          <p><strong className="text-[#111827]">Qualification:</strong> {m.qualification}</p>
                          <p><strong className="text-[#111827]">Tie-Breaker:</strong> {m.tieBreakRule}</p>
                          <p><strong className="text-[#111827]">Edge Cases:</strong> {m.edgeCases}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── RESET CONFIRMATION MODAL ─────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-black uppercase text-[#111827]">Reset Upcoming Fixtures?</h3>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              This will clear scheduled fixtures that have not started. <span className="font-bold text-[#111827]">LIVE</span> and <span className="font-bold text-[#111827]">COMPLETED</span> matches will not be affected.
            </p>
            {scheduleActionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                {scheduleActionError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setScheduleActionError(null);
                  setShowResetConfirm(false);
                }}
                disabled={isScheduleActionLoading}
                className="py-3 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] disabled:opacity-50 text-[#111827] font-bold text-xs uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetMatches}
                disabled={isScheduleActionLoading}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs uppercase shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {isScheduleActionLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Confirm Reset</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE KNOCKOUT MODAL ──────────────────────────────────────── */}
      {showKnockoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-black uppercase text-[#111827]">Schedule Knockout Match</h3>
              <button onClick={() => setShowKnockoutModal(false)} className="text-[#6B7280] hover:text-[#111827]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#4B5563] uppercase">Knockout Stage</label>
                <select
                  value={knockoutStage}
                  onChange={(e) => setKnockoutStage(e.target.value as any)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-[#111827]"
                >
                  <option value="Semi-Final 1">Semi-Final 1 (Match 10)</option>
                  <option value="Semi-Final 2">Semi-Final 2 (Match 11)</option>
                  <option value="Final">The Final (Match 12)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4B5563] uppercase">Team 1</label>
                <select
                  value={knockoutTeamA}
                  onChange={(e) => setKnockoutTeamA(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-[#111827]"
                >
                  <option value="">-- Choose Team 1 --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4B5563] uppercase">Team 2</label>
                <select
                  value={knockoutTeamB}
                  onChange={(e) => setKnockoutTeamB(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-[#111827]"
                >
                  <option value="">-- Choose Team 2 --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#4B5563] uppercase">Date</label>
                  <input
                    type="date"
                    value={knockoutDate}
                    onChange={(e) => setKnockoutDate(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-[#111827]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4B5563] uppercase">Time</label>
                  <input
                    type="time"
                    value={knockoutTime}
                    onChange={(e) => setKnockoutTime(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl px-3 py-2 text-[#111827]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => setShowKnockoutModal(false)}
                className="py-2.5 rounded-xl bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleKnockout}
                disabled={!knockoutTeamA || !knockoutTeamB}
                className="py-2.5 rounded-xl bg-[#111827] hover:bg-black disabled:opacity-40 text-white font-black text-xs uppercase shadow-sm"
              >
                Schedule Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORT PRINT PREVIEW MODAL ──────────────────────────────────── */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white text-[#111827] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-base font-black uppercase text-[#111827]">
                  {activeReportModal.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-[10px] text-[#6B7280] uppercase font-bold">Official Tournament Report</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setActiveReportModal(null)} className="text-[#6B7280] hover:text-[#111827]">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-y-auto my-4 text-xs border border-[#E5E7EB] rounded-2xl p-4 bg-[#FAFAF8]">
              {activeReportModal === "reg_master" && (
                <div className="flex flex-col gap-2">
                  <p className="font-black uppercase text-sm mb-2 text-[#111827]">Registration Master List ({players.length} Players)</p>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] font-black text-[#4B5563]">
                        <th className="py-2">#</th>
                        <th className="py-2">Player Name</th>
                        <th className="py-2">Role</th>
                        <th className="py-2">Reference ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {players.map((p, idx) => (
                        <tr key={p.id}>
                          <td className="py-1.5 font-bold text-[#111827]">{idx + 1}</td>
                          <td className="py-1.5 font-bold text-[#111827]">{p.name}</td>
                          <td className="py-1.5 text-[#4B5563]">{p.role}</td>
                          <td className="py-1.5 font-mono text-[#6B7280]">{p.referenceId || `REF-${p.id.slice(0, 6)}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeReportModal === "auction_results" && (
                <div className="flex flex-col gap-4">
                  <p className="font-black uppercase text-sm text-[#111827]">Official Auction Squad Allocation</p>
                  {teams.map((t) => (
                    <div key={t.id} className="border border-[#E5E7EB] p-3 rounded-xl bg-white shadow-sm">
                      <p className="font-black uppercase text-xs text-[#111827]">{t.name} ({lookup.playersOf(t.id).length} Players)</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px] mt-2 text-[#4B5563]">
                        {lookup.playersOf(t.id).map((tp, idx) => (
                          <div key={tp.id}>
                            {idx + 1}. {tp.name} ({tp.role})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeReportModal !== "reg_master" && activeReportModal !== "auction_results" && (
                <div className="py-12 text-center text-[#6B7280] font-bold">
                  Report compiled successfully with {players.length} registered players and {teams.length} franchises.
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveReportModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] font-black text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAYER PROFILE VIEW MODAL ───────────────────────────────────── */}
      {selectedPlayerForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-black uppercase text-[#9A6A05]">Player Registration Profile</h3>
              <button onClick={() => setSelectedPlayerForView(null)} className="text-[#6B7280] hover:text-[#111827]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-black text-xl text-[#9A6A05]">
                {selectedPlayerForView.avatar ? (
                  <img src={selectedPlayerForView.avatar} alt="" className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  selectedPlayerForView.name[0]
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-[#111827]">{selectedPlayerForView.name}</h4>
                <p className="text-xs text-[#9A6A05] font-bold">{selectedPlayerForView.role}</p>
                <p className="text-[10px] text-[#6B7280]">{selectedPlayerForView.referenceId || `REF-${selectedPlayerForView.id.slice(0, 6)}`}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-[10px] text-[#6B7280] uppercase font-bold">Assigned Team</p>
                <p className="font-bold text-[#111827] mt-0.5">
                  {lookup.team(selectedPlayerForView.teamId)?.name || "Unassigned"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-[10px] text-[#6B7280] uppercase font-bold">Auction Price</p>
                <p className="font-bold text-[#9A6A05] mt-0.5">
                  {selectedPlayerForView.soldPrice ? `${selectedPlayerForView.soldPrice} LKR` : "Standard"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayerForView(null)}
              className="w-full py-3 rounded-xl bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] font-bold text-xs uppercase mt-2"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
