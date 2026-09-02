import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ObsMatchStreamResult } from "@/hooks/useObsMatchStream";
import { lookup } from "@/lib/repositories";
import { usePlayers, useTeams } from "@/hooks/useCricketData";
import { TeamLogo } from "@/components/team/TeamLogo";
import type { BatterStat, BowlerStat, InningsState } from "@/types/cricket";
import { BALLS_PER_OVER } from "@/types/cricket";

interface MatchResultOverlayProps {
  stream: ObsMatchStreamResult;
}

export function MatchResultOverlay({ stream }: MatchResultOverlayProps) {
  const { match, matchState } = stream;
  const { data: teams = [] } = useTeams();
  const { data: players = [] } = usePlayers();

  const inn1 = matchState?.innings?.[0];
  const inn2 = matchState?.innings?.[1];

  const teamA = useMemo(() => {
    const id = inn1?.battingTeamId || match?.teamAId;
    if (!id) return undefined;
    return lookup.team(id) ?? teams.find((t) => t.id === id);
  }, [inn1?.battingTeamId, match?.teamAId, teams]);

  const teamB = useMemo(() => {
    const id = inn2?.battingTeamId || match?.teamBId;
    if (!id) return undefined;
    return lookup.team(id) ?? teams.find((t) => t.id === id);
  }, [inn2?.battingTeamId, match?.teamBId, teams]);

  // Determine Authoritative Winner
  const winnerTeam = useMemo(() => {
    if (match?.winnerId) {
      return lookup.team(match.winnerId) ?? teams.find((t) => t.id === match.winnerId);
    }
    if (matchState?.resultText) {
      const lower = matchState.resultText.toLowerCase();
      if (teamA && lower.includes(teamA.name.toLowerCase())) return teamA;
      if (teamB && lower.includes(teamB.name.toLowerCase())) return teamB;
    }
    return undefined;
  }, [match?.winnerId, matchState?.resultText, teamA, teamB, teams]);

  // Extract winning statement (e.g. "WON BY 9 WICKETS", "WON BY 18 RUNS", "MATCH TIED")
  const resultStatement = useMemo(() => {
    const raw = (matchState?.resultText || match?.resultText || "").trim();
    if (!raw) {
      return winnerTeam ? `WON THE MATCH` : "MATCH COMPLETED";
    }
    // If text is "Team Name won by X wickets", extract "WON BY X WICKETS"
    const wonByIndex = raw.toLowerCase().indexOf("won by");
    if (wonByIndex !== -1) {
      return raw.substring(wonByIndex).toUpperCase();
    }
    return raw.toUpperCase();
  }, [matchState?.resultText, match?.resultText, winnerTeam]);

  // Determine Player of the Match (Authoritative or match MVP fallback)
  const playerOfTheMatch = useMemo(() => {
    const motmId = match?.manOfTheMatchId;
    if (motmId) {
      const p = lookup.player(motmId) ?? players.find((pl) => pl.id === motmId);
      const bStat = inn1?.batters.find((b) => b.playerId === motmId) || inn2?.batters.find((b) => b.playerId === motmId);
      const bowlStat = inn1?.bowlers.find((b) => b.playerId === motmId) || inn2?.bowlers.find((b) => b.playerId === motmId);
      return { player: p, bStat, bowlStat };
    }

    // Dynamic MVP computation across all innings
    let bestScore = -1;
    let bestPlayerId: string | null = null;
    let bestBStat: BatterStat | undefined;
    let bestBowlStat: BowlerStat | undefined;

    const allBatters = [...(inn1?.batters || []), ...(inn2?.batters || [])];
    const allBowlers = [...(inn1?.bowlers || []), ...(inn2?.bowlers || [])];

    allBatters.forEach((b) => {
      const bowl = allBowlers.find((bw) => bw.playerId === b.playerId);
      const impactScore = b.runs * 1.0 + (bowl ? bowl.wickets * 25 - bowl.runs * 0.5 : 0);
      if (impactScore > bestScore) {
        bestScore = impactScore;
        bestPlayerId = b.playerId;
        bestBStat = b;
        bestBowlStat = bowl;
      }
    });

    allBowlers.forEach((bw) => {
      if (!allBatters.some((b) => b.playerId === bw.playerId)) {
        const impactScore = bw.wickets * 25 - bw.runs * 0.5;
        if (impactScore > bestScore) {
          bestScore = impactScore;
          bestPlayerId = bw.playerId;
          bestBowlStat = bw;
        }
      }
    });

    if (bestPlayerId) {
      return {
        player: lookup.player(bestPlayerId) ?? players.find((p) => p.id === bestPlayerId),
        bStat: bestBStat,
        bowlStat: bestBowlStat,
      };
    }

    return null;
  }, [match?.manOfTheMatchId, inn1, inn2, players]);

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-8 sm:p-14 select-none pointer-events-none font-['Barlow_Condensed',sans-serif]">
      {/* ── BROADCAST AMBIENT ACCENTS (Subtle, TV-Safe Depth) ─────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

      {/* ── 1. TOP BROADCAST BANNER (TOURNAMENT HEADER) ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center justify-center mx-auto"
      >
        <div className="flex items-center gap-0 shadow-2xl">
          {/* Left Angled Accent */}
          <div className="h-10 w-4 bg-[#D9A928] skew-x-[-20deg] -mr-1 z-10 shadow-[0_0_15px_rgba(217,169,40,0.5)]" />
          
          {/* Main Tournament Banner */}
          <div className="h-10 bg-gradient-to-r from-[#0a0a0a] via-[#161616] to-[#0a0a0a] border-y border-[#D9A928]/60 px-8 flex items-center justify-center gap-4">
            <span className="text-[#D9A928] text-lg font-black tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              TPL 2026
            </span>
            <span className="h-3.5 w-[2px] bg-white/20" />
            <span className="text-white text-base font-extrabold tracking-[0.2em] uppercase">
              MATCH RESULT
            </span>
            <span className="h-3.5 w-[2px] bg-white/20" />
            <span className="text-white/60 text-sm font-semibold tracking-widest uppercase">
              MATCH #{match?.matchNumber || 1}
            </span>
          </div>

          {/* Right Angled Accent */}
          <div className="h-10 w-4 bg-[#D9A928] skew-x-[-20deg] -ml-1 z-10 shadow-[0_0_15px_rgba(217,169,40,0.5)]" />
        </div>
      </motion.div>

      {/* ── 2. CENTER STAGE: TEAM LOGOS & SCORES HEAD-TO-HEAD ───────────────── */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto my-auto grid grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-12">
        
        {/* TEAM A (1st Innings) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-end gap-6 sm:gap-8"
        >
          {/* Team A Details & Score */}
          <div className="text-right">
            <div className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wide leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {teamA?.name || "TEAM A"}
            </div>
            <div className="text-xs sm:text-sm font-bold uppercase text-[#D9A928] tracking-[0.25em] mt-1">
              1ST INNINGS • {teamA?.shortName || "T1"}
            </div>

            {/* Score Numbers */}
            <div className="mt-2 flex items-baseline justify-end gap-2">
              <span className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {inn1?.runs ?? 0}
                <span className="text-white/40 font-light mx-1">/</span>
                <span className="text-[#D9A928]">{inn1?.wickets ?? 0}</span>
              </span>
              <span className="text-base sm:text-xl font-extrabold text-white/70 font-mono tracking-wider">
                ({inn1?.oversText ?? "5.0"} OV)
              </span>
            </div>
          </div>

          {/* Team A Large Broadcast Logo Mark */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#D9A928]/15 blur-2xl rounded-full" />
            <div className="relative border-2 border-white/20 bg-black/90 p-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
              <TeamLogo
                logoUrl={teamA?.logoUrl}
                name={teamA?.name}
                shortName={teamA?.shortName}
                size="lg"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-none border-none bg-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* CENTER ANGLED DIVIDER / VS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center px-2"
        >
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-[#D9A928] to-transparent opacity-80" />
          <span className="text-[#D9A928] font-black text-lg sm:text-xl tracking-widest my-2 drop-shadow-[0_0_8px_rgba(217,169,40,0.6)]">
            VS
          </span>
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-[#D9A928] to-transparent opacity-80" />
        </motion.div>

        {/* TEAM B (2nd Innings) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-start gap-6 sm:gap-8"
        >
          {/* Team B Large Broadcast Logo Mark */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#D9A928]/15 blur-2xl rounded-full" />
            <div className="relative border-2 border-white/20 bg-black/90 p-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
              <TeamLogo
                logoUrl={teamB?.logoUrl}
                name={teamB?.name}
                shortName={teamB?.shortName}
                size="lg"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-none border-none bg-transparent"
              />
            </div>
          </div>

          {/* Team B Details & Score */}
          <div className="text-left">
            <div className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wide leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {teamB?.name || "TEAM B"}
            </div>
            <div className="text-xs sm:text-sm font-bold uppercase text-[#D9A928] tracking-[0.25em] mt-1">
              2ND INNINGS • {teamB?.shortName || "T2"}
            </div>

            {/* Score Numbers */}
            <div className="mt-2 flex items-baseline justify-start gap-2">
              <span className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {inn2?.runs ?? 0}
                <span className="text-white/40 font-light mx-1">/</span>
                <span className="text-[#D9A928]">{inn2?.wickets ?? 0}</span>
              </span>
              <span className="text-base sm:text-xl font-extrabold text-white/70 font-mono tracking-wider">
                ({inn2?.oversText ?? "0.0"} OV)
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── 3. LOWER SECTION: WINNER CALLOUT & PLAYER OF THE MATCH ─────────── */}
      <div className="relative z-10 flex flex-col items-center gap-4 max-w-[1300px] w-full mx-auto">
        
        {/* DOMINANT WINNER RIBBON */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
        >
          {/* Angled Gold Broadcast Bar */}
          <div className="bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] border-l-4 border-r-4 border-l-[#D9A928] border-r-[#D9A928] border-y border-[#D9A928]/40 py-3.5 px-8 sm:px-14 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-center sm:text-left">
            
            {/* Winner Label & Team */}
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <div className="bg-[#D9A928] text-black font-black text-xs uppercase px-2.5 py-1 tracking-widest skew-x-[-12deg]">
                <span className="skew-x-[12deg] inline-block">WINNER</span>
              </div>
              <span className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {winnerTeam?.name || "MATCH COMPLETED"}
              </span>
            </div>

            {/* Decisive Result Statement */}
            <div className="flex items-center justify-center sm:justify-end gap-3">
              <span className="text-xl sm:text-3xl font-black uppercase tracking-widest text-[#D9A928] drop-shadow-[0_0_12px_rgba(217,169,40,0.4)]">
                {resultStatement}
              </span>
            </div>

          </div>
        </motion.div>

        {/* PLAYER OF THE MATCH (TV LOWER-THIRD STRIP) */}
        {playerOfTheMatch?.player && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-center"
          >
            <div className="bg-[#0c0c0c]/95 border border-white/15 px-6 py-2.5 flex items-center gap-6 shadow-xl">
              {/* Tag */}
              <div className="flex items-center gap-2 border-r border-white/15 pr-5">
                <span className="h-2 w-2 bg-[#D9A928] rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D9A928]">
                  PLAYER OF THE MATCH
                </span>
              </div>

              {/* Player Name */}
              <span className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                {playerOfTheMatch.player.name}
              </span>

              {/* Performance Stats */}
              <div className="flex items-center gap-4 text-sm font-mono font-bold text-white/90 border-l border-white/15 pl-5">
                {playerOfTheMatch.bStat && playerOfTheMatch.bStat.runs > 0 && (
                  <span>
                    <strong className="text-[#D9A928] font-black text-base">{playerOfTheMatch.bStat.runs}</strong> RUNS ({playerOfTheMatch.bStat.balls}b, {playerOfTheMatch.bStat.fours}x4, {playerOfTheMatch.bStat.sixes}x6)
                  </span>
                )}
                {playerOfTheMatch.bowlStat && playerOfTheMatch.bowlStat.legalBalls > 0 && (
                  <span>
                    <strong className="text-emerald-400 font-black text-base">{playerOfTheMatch.bowlStat.wickets}/{playerOfTheMatch.bowlStat.runs}</strong> ({Math.floor(playerOfTheMatch.bowlStat.legalBalls / BALLS_PER_OVER)}.{playerOfTheMatch.bowlStat.legalBalls % BALLS_PER_OVER} ov)
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
