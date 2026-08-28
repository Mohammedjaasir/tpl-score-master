import type { Match, Team } from "@/types/cricket";
import { buildMatchState } from "@/lib/scoring/engine";

export interface TeamStanding {
  pos: number;
  teamId: string;
  teamName: string;
  teamShortName: string;
  logoUrl?: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
}

export function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  // Only process completed matches
  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  const map = new Map<
    string,
    {
      played: number;
      won: number;
      lost: number;
      tied: number;
      noResult: number;
      points: number;
      runsFor: number;
      oversFor: number;
      runsAgainst: number;
      oversAgainst: number;
    }
  >();

  teams.forEach((t) => {
    map.set(t.id, {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      runsFor: 0,
      oversFor: 0,
      runsAgainst: 0,
      oversAgainst: 0,
    });
  });

  completedMatches.forEach((m) => {
    const statsA = map.get(m.teamAId);
    const statsB = map.get(m.teamBId);
    if (!statsA || !statsB) return;

    statsA.played += 1;
    statsB.played += 1;

    let runsA = 0;
    let oversA = 0;
    let runsB = 0;
    let oversB = 0;
    let winnerId: string | null = null;
    let isTie = false;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("tpl-scoring:" + m.id);
        if (raw) {
          const doc = JSON.parse(raw);
          const state = buildMatchState({ match: m, setup: doc.setup, deliveries: doc.deliveries });
          const inn1 = state.innings[0];
          const inn2 = state.innings[1];
          if (inn1 && inn2) {
            const team1Runs = inn1.runs;
            const team2Runs = inn2.runs;
            const xiCount1 = doc.setup?.playingXI[inn1.battingTeamId]?.playerIds?.length || 11;
            const xiCount2 = doc.setup?.playingXI[inn2.battingTeamId]?.playerIds?.length || 11;
            const team1IsAllOut = inn1.wickets >= Math.max(1, xiCount1 - 1);
            const team2IsAllOut = inn2.wickets >= Math.max(1, xiCount2 - 1);
            const scheduledOvers1 = inn1.maxOvers || m.overs || 5;
            const scheduledOvers2 = inn2.maxOvers || m.overs || 5;
            const team1Overs = team1IsAllOut ? scheduledOvers1 : Math.max(0.1, inn1.oversFloat);
            const team2Overs = team2IsAllOut ? scheduledOvers2 : Math.max(0.1, inn2.oversFloat);

            if (inn1.battingTeamId === m.teamAId) {
              runsA = team1Runs;
              oversA = team1Overs;
              runsB = team2Runs;
              oversB = team2Overs;
            } else {
              runsB = team1Runs;
              oversB = team1Overs;
              runsA = team2Runs;
              oversA = team2Overs;
            }

            if (team1Runs > team2Runs) winnerId = inn1.battingTeamId;
            else if (team2Runs > team1Runs) winnerId = inn2.battingTeamId;
            else isTie = true;
          }
        }
      } catch {}
    }

    if (winnerId === m.teamAId) {
      statsA.won += 1;
      statsA.points += 2;
      statsB.lost += 1;
    } else if (winnerId === m.teamBId) {
      statsB.won += 1;
      statsB.points += 2;
      statsA.lost += 1;
    } else if (isTie) {
      statsA.tied += 1;
      statsA.points += 1;
      statsB.tied += 1;
      statsB.points += 1;
    }

    statsA.runsFor += runsA;
    statsA.oversFor += oversA;
    statsA.runsAgainst += runsB;
    statsA.oversAgainst += oversB;

    statsB.runsFor += runsB;
    statsB.oversFor += oversB;
    statsB.runsAgainst += runsA;
    statsB.oversAgainst += oversA;
  });

  const list: TeamStanding[] = teams.map((t) => {
    const s = map.get(t.id)!;
    const rpoFor = s.oversFor > 0 ? s.runsFor / s.oversFor : 0;
    const rpoAgainst = s.oversAgainst > 0 ? s.runsAgainst / s.oversAgainst : 0;
    const nrr = s.played > 0 ? rpoFor - rpoAgainst : 0;

    return {
      pos: 0,
      teamId: t.id,
      teamName: t.name,
      teamShortName: t.shortName,
      logoUrl: t.logoUrl,
      played: s.played,
      won: s.won,
      lost: s.lost,
      tied: s.tied,
      noResult: s.noResult,
      points: s.points,
      nrr,
      runsFor: s.runsFor,
      oversFor: s.oversFor,
      runsAgainst: s.runsAgainst,
      oversAgainst: s.oversAgainst,
    };
  });

  // Official rule: Sort by Points (descending), Net Run Rate (descending), Wins (descending), Name (ascending)
  list.sort(
    (a, b) =>
      b.points - a.points ||
      b.nrr - a.nrr ||
      b.won - a.won ||
      a.teamName.localeCompare(b.teamName),
  );

  list.forEach((item, idx) => {
    item.pos = idx + 1;
  });

  return list;
}
