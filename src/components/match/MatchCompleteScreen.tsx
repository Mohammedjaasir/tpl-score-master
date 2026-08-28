import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MatchState } from "@/types/cricket";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";
import { Trophy, Award, Check } from "lucide-react";

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

  // Participants for MOM selection
  const allPlayerIds = [
    ...(innings1?.batters.map((b) => b.playerId) ?? []),
    ...(innings1?.bowlers.map((b) => b.playerId) ?? []),
    ...(innings2?.batters.map((b) => b.playerId) ?? []),
    ...(innings2?.bowlers.map((b) => b.playerId) ?? []),
  ];
  const uniquePlayerIds = Array.from(new Set(allPlayerIds));

  const [selectedMomId, setSelectedMomId] = useState<string>(
    store?.doc.playerOfTheMatchId ?? state.match.manOfTheMatchId ?? "",
  );

  const handleSelectMom = (playerId: string) => {
    setSelectedMomId(playerId);
    if (store?.setPlayerOfTheMatch) {
      store.setPlayerOfTheMatch(playerId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
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

      {/* Score comparison */}
      <div className="px-4 py-6 mx-auto w-full max-w-md flex flex-col gap-4">
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

        {/* Scorer Player of the Match Selection */}
        {uniquePlayerIds.length > 0 && (
          <div className="card-surface px-5 py-4 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-2">
              <Award className="h-4 w-4 text-[#D9A928]" />
              <p className="text-xs font-black uppercase text-[#111111]">
                Select Player of the Match
              </p>
            </div>
            <select
              value={selectedMomId}
              onChange={(e) => handleSelectMom(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs font-bold text-[#111111] focus:outline-none focus:border-[#D9A928]"
            >
              <option value="">-- Choose Player --</option>
              {uniquePlayerIds.map((pId) => {
                const p = lookup.player(pId);
                const t = lookup.team(p?.teamId);
                return (
                  <option key={pId} value={pId}>
                    {p?.name ?? pId} ({t?.shortName ?? "TPL"})
                  </option>
                );
              })}
            </select>
            {selectedMomId && (
              <p className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                <Check className="h-3 w-3" /> Player of the Match assigned & broadcasted.
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <Link
            to="/scorecard/$matchId"
            params={{ matchId }}
            className="tap flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#D9A928] text-sm font-extrabold uppercase tracking-widest text-black shadow-md hover:bg-[#E5B537]"
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
