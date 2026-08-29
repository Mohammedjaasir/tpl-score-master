import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { MatchState } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";
import { calculateMatchMVP, type PlayerMVPScore } from "@/lib/scoring/playerPerformance";
import { Trophy, Award, Check, Sparkles, User, ChevronRight, Edit3, ShieldCheck } from "lucide-react";

interface Props {
  state: MatchState;
  store?: MatchStore;
}

export function MatchCompleteScreen({ state, store }: Props) {
  const innings1 = state.innings[0];
  const innings2 = state.innings[1];
  const matchId = state.match.id;

  const team1 = lookup.team(innings1?.battingTeamId);
  const team2 = lookup.team(innings2?.battingTeamId);

  // Calculate Match MVP ranking from match-specific events
  const mvpList = useMemo(() => calculateMatchMVP(state), [state]);
  const autoMotm = mvpList[0] as PlayerMVPScore | undefined;

  // Selected MOTM: defaults to store/match MOTM or auto-recommended MVP #1
  const [selectedMomId, setSelectedMomId] = useState<string>(
    store?.doc.playerOfTheMatchId ?? state.match.manOfTheMatchId ?? autoMotm?.playerId ?? "",
  );
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(
    Boolean(store?.doc.playerOfTheMatchId || state.match.manOfTheMatchId)
  );

  // Auto-select #1 MVP on initial complete screen load if not yet assigned
  useEffect(() => {
    if (autoMotm && !selectedMomId) {
      setSelectedMomId(autoMotm.playerId);
      if (store?.setPlayerOfTheMatch) {
        store.setPlayerOfTheMatch(autoMotm.playerId);
      }
    }
  }, [autoMotm, selectedMomId, store]);

  // Participants for manual override
  const allPlayerIds = useMemo(() => {
    const ids = [
      ...(innings1?.batters.map((b) => b.playerId) ?? []),
      ...(innings1?.bowlers.map((b) => b.playerId) ?? []),
      ...(innings2?.batters.map((b) => b.playerId) ?? []),
      ...(innings2?.bowlers.map((b) => b.playerId) ?? []),
    ];
    return Array.from(new Set(ids));
  }, [innings1, innings2]);

  const handleSelectMom = (playerId: string) => {
    setSelectedMomId(playerId);
    setIsConfirmed(true);
    if (store?.setPlayerOfTheMatch) {
      store.setPlayerOfTheMatch(playerId);
    }
  };

  const handleConfirmAuto = () => {
    const targetId = selectedMomId || autoMotm?.playerId || "";
    if (targetId) {
      setSelectedMomId(targetId);
      setIsConfirmed(true);
      if (store?.setPlayerOfTheMatch) {
        store.setPlayerOfTheMatch(targetId);
      }
    }
  };

  const currentSelectedPlayer = lookup.player(selectedMomId);
  const currentSelectedMvp = mvpList.find((m) => m.playerId === selectedMomId);
  const isOverridden = autoMotm && selectedMomId && selectedMomId !== autoMotm.playerId;

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-12">
      {/* Result hero */}
      <div className="bg-[#111111] px-4 pt-10 pb-12 text-white">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#D9A928]/20 border border-[#D9A928]/40">
            <Trophy className="h-8 w-8 text-[#D9A928]" />
          </div>
          <p className="font-display text-3xl font-extrabold text-white uppercase tracking-wide">
            Match Complete
          </p>
          {state.resultText && (
            <p className="mt-3 text-lg font-bold text-[#D9A928]">
              {state.resultText}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-6 mx-auto w-full max-w-md flex flex-col gap-5">
        {/* Score comparison */}
        <div className="flex flex-col gap-3">
          {/* Team 1 */}
          {innings1 && team1 && (
            <div className="card-surface px-5 py-4 bg-white border border-[#E5E5E5] rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#5F6368] uppercase tracking-widest">
                    1st Innings
                  </p>
                  <p className="text-base font-extrabold text-[#111111] mt-0.5">{team1.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-extrabold text-[#111111] tabular-nums">
                    {innings1.runs}
                    <span className="text-xl text-[#5F6368]">/{innings1.wickets}</span>
                  </p>
                  <p className="text-[10px] text-[#5F6368] font-bold">
                    {innings1.oversText} ov · RR {innings1.crr.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Team 2 */}
          {innings2 && team2 && (
            <div className="card-surface px-5 py-4 bg-white border border-[#E5E5E5] rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#5F6368] uppercase tracking-widest">
                    2nd Innings
                  </p>
                  <p className="text-base font-extrabold text-[#111111] mt-0.5">{team2.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-extrabold text-[#111111] tabular-nums">
                    {innings2.runs}
                    <span className="text-xl text-[#5F6368]">/{innings2.wickets}</span>
                  </p>
                  <p className="text-[10px] text-[#5F6368] font-bold">
                    {innings2.oversText} ov · RR {innings2.crr.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── AUTOMATIC MAN OF THE MATCH CARD ──────────────────────────── */}
        <div className="card-surface p-5 bg-gradient-to-b from-[#1E1B11] to-[#121316] border-2 border-[#D9A928] rounded-3xl shadow-xl text-white flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928]">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#D9A928]" />
                  {isOverridden ? "OFFICIAL MAN OF THE MATCH (OVERRIDDEN)" : "AUTO-SELECTED MAN OF THE MATCH"}
                </span>
                <p className="text-xs font-bold text-white/70">
                  {isOverridden ? "Manual Official Selection" : "Performance-Based Algorithm"}
                </p>
              </div>
            </div>

            {currentSelectedMvp && (
              <span className="px-3 py-1 rounded-full bg-[#D9A928] text-black font-black text-xs shadow-md">
                Impact: {currentSelectedMvp.totalPoints} pts
              </span>
            )}
          </div>

          {currentSelectedPlayer ? (
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-black/60 border-2 border-[#D9A928] p-1 flex items-center justify-center overflow-hidden shrink-0">
                {currentSelectedPlayer.avatar ? (
                  <img src={currentSelectedPlayer.avatar} alt="" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <User className="h-7 w-7 text-white/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase text-white truncate">
                    {currentSelectedPlayer.name}
                  </h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-[#D9A928]">
                    {lookup.team(currentSelectedPlayer.teamId)?.shortName ?? "TPL"}
                  </span>
                </div>
                <p className="text-xs text-[#D9A928] font-extrabold mt-0.5">
                  {currentSelectedMvp?.performanceSummary ?? "Match Winning Performance"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/60 italic py-2">No player selected.</p>
          )}

          {/* Audit: if overridden, show both */}
          {isOverridden && autoMotm && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-1">
              <p className="font-bold">
                Auto-Calculated MVP: <strong>{autoMotm.playerName}</strong> ({autoMotm.totalPoints} pts)
              </p>
              <p className="text-[11px] text-amber-300/80">
                Official Selection manually updated by tournament referee.
              </p>
            </div>
          )}

          {/* Confirmation & Override Actions */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {!isOverrideMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmAuto}
                  className="tap flex-1 flex items-center justify-center gap-2 min-h-12 rounded-xl bg-[#D9A928] text-black text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#E5B537]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isConfirmed ? "Man of the Match Confirmed" : "Confirm & Save MOTM"}</span>
                </button>
                <button
                  onClick={() => setIsOverrideMode(true)}
                  className="tap px-3 min-h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1.5"
                  title="Override MOTM"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Change</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-2xl border border-white/10">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70">
                  Manual Official Override
                </label>
                <select
                  value={selectedMomId}
                  onChange={(e) => handleSelectMom(e.target.value)}
                  className="w-full bg-[#1A1D24] border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D9A928]"
                >
                  <option value="">-- Choose Official Override Player --</option>
                  {allPlayerIds.map((pId) => {
                    const p = lookup.player(pId);
                    const t = lookup.team(p?.teamId);
                    const mvp = mvpList.find((m) => m.playerId === pId);
                    return (
                      <option key={pId} value={pId}>
                        {p?.name ?? pId} ({t?.shortName ?? "TPL"}) {mvp ? `· ${mvp.totalPoints} pts` : ""}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => setIsOverrideMode(false)}
                  className="tap py-1.5 text-center text-xs font-bold text-white/60 hover:text-white"
                >
                  Done Editing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── MATCH MVP TOP 5 LEADERBOARD ──────────────────────────────── */}
        {mvpList.length > 0 && (
          <div className="card-surface p-5 bg-white border border-[#E5E5E5] rounded-3xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#D9A928]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Match MVP Ranking (Top 5)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#5F6368]">Impact Scoring</span>
            </div>

            <div className="flex flex-col divide-y divide-[#E5E5E5]">
              {mvpList.slice(0, 5).map((mvp, idx) => (
                <div
                  key={mvp.playerId}
                  onClick={() => handleSelectMom(mvp.playerId)}
                  className={`py-3 px-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    selectedMomId === mvp.playerId ? "bg-[#D9A928]/10" : "hover:bg-[#F7F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0 ? "bg-[#D9A928] text-black" : "bg-slate-100 text-[#5F6368]"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#111111] truncate flex items-center gap-1.5">
                        {mvp.playerName}
                        <span className="text-[9px] font-bold text-[#5F6368]">({mvp.teamShortName})</span>
                        {selectedMomId === mvp.playerId && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-[#D9A928] text-black">
                            Selected
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#5F6368] truncate mt-0.5">
                        {mvp.performanceSummary}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#111111] tabular-nums">
                      {mvp.totalPoints} <span className="text-[10px] text-[#5F6368] font-bold">pts</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <Link
            to="/scorer"
            className="tap flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] hover:bg-[#222222] text-sm font-black uppercase tracking-wider text-white shadow-md transition-all"
          >
            <span>Back to Scorer Match Control</span>
          </Link>

          <Link
            to="/scorecard/$matchId"
            params={{ matchId }}
            className="tap flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#D9A928] text-xs font-black uppercase tracking-widest text-black shadow-sm hover:bg-[#E5B537]"
          >
            View Public Scorecard
          </Link>
          <Link
            to="/scorecards"
            className="tap flex min-h-12 w-full items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] text-xs font-extrabold uppercase tracking-widest text-[#111111] hover:bg-[#F7F7F5]"
          >
            All Scorecards & Past Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
