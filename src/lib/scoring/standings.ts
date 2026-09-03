import type { Match, Team } from "@/types/cricket";
import { BALLS_PER_OVER, getTeamGroup } from "@/types/cricket";
import { buildMatchState, runsPerOver, legalBallsToOvers, oversText } from "@/lib/scoring/engine";

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
  oversForText: string;
  legalBallsFor: number;
  runsAgainst: number;
  oversAgainst: number;
  oversAgainstText: string;
  legalBallsAgainst: number;
}

/**
 * Authoritative TPL Tournament Standings Calculation Engine.
 *
 * Derives standings strictly from scheduled/active tournament fixtures and completed match results.
 * If no matches are scheduled, returns an empty array to trigger the Points Table empty state.
 */
export function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  // If no matches exist in the tournament or no teams provided, standings are empty
  if (!teams || teams.length === 0 || !matches || matches.length === 0) {
    return [];
  }

  // Every team in the passed group/list is included unconditionally
  const participatingTeams = teams;

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
      legalBallsFor: number;
      runsAgainst: number;
      legalBallsAgainst: number;
    }
  >();

  participatingTeams.forEach((t) => {
    map.set(t.id, {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      runsFor: 0,
      legalBallsFor: 0,
      runsAgainst: 0,
      legalBallsAgainst: 0,
    });
  });

  matches.forEach((m) => {
    let runsForA = 0;
    let nrrBallsForA = 0;
    let runsForB = 0;
    let nrrBallsForB = 0;
    let runsAgainstA = 0;
    let nrrBallsAgainstA = 0;
    let runsAgainstB = 0;
    let nrrBallsAgainstB = 0;

    let winnerId: string | null = m.winnerId ?? null;
    let isTie = false;
    let isMatchCompleted = m.status === "COMPLETED";

    // Attempt to hydrate match state from local storage scoring document
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("tpl-scoring:" + m.id);
        if (raw) {
          const doc = JSON.parse(raw);
          const state = buildMatchState({
            match: m,
            setup: doc.setup || { playingXI: {} },
            deliveries: doc.deliveries || [],
            secondInningsStarted: doc.secondInningsStarted || false,
            secondInningsOpeners: doc.secondInningsOpeners,
          });

          if (doc.isCompleted || state.phase === "complete") {
            isMatchCompleted = true;
          }

          const inn1 = state.innings[0];
          const inn2 = state.innings[1];
          if (inn1) {
            const maxOvers1 = inn1.maxOvers || m.overs || 5;
            const maxOvers2 = inn2?.maxOvers || maxOvers1;

            const runs1 = inn1.runs;
            const balls1 = inn1.legalBalls;
            const isAllOut1 = inn1.isComplete && inn1.wickets >= Math.max(1, (inn1.batters?.length || 11) - 1);
            // Official Tournament NRR Rule: All out uses full overs quota (e.g. 5.0 ov = 25 balls)
            const inn1NrrBalls = isAllOut1 ? maxOvers1 * BALLS_PER_OVER : Math.max(balls1, 1);

            const runs2 = inn2 ? inn2.runs : 0;
            const balls2 = inn2 ? inn2.legalBalls : 0;
            const isAllOut2 = inn2 ? (inn2.isComplete && inn2.wickets >= Math.max(1, (inn2.batters?.length || 11) - 1)) : false;
            const inn2NrrBalls = inn2 ? (isAllOut2 ? maxOvers2 * BALLS_PER_OVER : Math.max(balls2, 1)) : 0;

            if (inn1.battingTeamId === m.teamAId) {
              runsForA = runs1;
              nrrBallsForA = inn1NrrBalls;
              runsAgainstA = runs2;
              nrrBallsAgainstA = inn2NrrBalls;

              runsForB = runs2;
              nrrBallsForB = inn2NrrBalls;
              runsAgainstB = runs1;
              nrrBallsAgainstB = inn1NrrBalls;
            } else {
              runsForB = runs1;
              nrrBallsForB = inn1NrrBalls;
              runsAgainstB = runs2;
              nrrBallsAgainstB = inn2NrrBalls;

              runsForA = runs2;
              nrrBallsForA = inn2NrrBalls;
              runsAgainstA = runs1;
              nrrBallsAgainstA = inn1NrrBalls;
            }

            if (!winnerId) {
              const target = inn2?.target ?? (runs1 + 1);
              if (inn2 && runs2 >= target) {
                winnerId = inn2.battingTeamId;
              } else if (inn2 && (inn2.isComplete || state.phase === "complete" || doc.isCompleted) && runs2 < runs1) {
                winnerId = inn1.battingTeamId;
              } else if (inn1 && !inn2 && (state.phase === "complete" || doc.isCompleted)) {
                winnerId = inn1.battingTeamId;
              } else if (inn2 && (inn2.isComplete || state.phase === "complete" || doc.isCompleted) && runs1 === runs2 && balls2 > 0) {
                isTie = true;
              }
            }
          }
        }
      } catch {}
    }

    // Fallback: Infer winner from resultText or winnerId if not resolved from scoring document
    if (!winnerId && !isTie && m.resultText) {
      const resLower = m.resultText.toLowerCase();
      if (resLower.includes("won by") || resLower.includes(" won")) {
        const teamA = teams.find((t) => t.id === m.teamAId);
        const teamB = teams.find((t) => t.id === m.teamBId);
        if (teamA && (resLower.startsWith(teamA.name.toLowerCase()) || resLower.startsWith(teamA.shortName.toLowerCase()))) {
          winnerId = teamA.id;
        } else if (teamB && (resLower.startsWith(teamB.name.toLowerCase()) || resLower.startsWith(teamB.shortName.toLowerCase()))) {
          winnerId = teamB.id;
        }
      } else if (resLower.includes("tie") || resLower.includes("tied")) {
        isTie = true;
      }
    }

    if (!isMatchCompleted && !winnerId && !isTie) return;

    const statsA = map.get(m.teamAId);
    const statsB = map.get(m.teamBId);
    if (!statsA && !statsB) return;

    if (statsA) {
      statsA.played += 1;
      if (winnerId === m.teamAId) {
        statsA.won += 1;
        statsA.points += 2;
      } else if (winnerId === m.teamBId) {
        statsA.lost += 1;
      } else if (isTie) {
        statsA.tied += 1;
        statsA.points += 1;
      } else {
        statsA.noResult += 1;
        statsA.points += 1;
      }
      statsA.runsFor += runsForA;
      statsA.legalBallsFor += nrrBallsForA;
      statsA.runsAgainst += runsAgainstA;
      statsA.legalBallsAgainst += nrrBallsAgainstA;
    }

    if (statsB) {
      statsB.played += 1;
      if (winnerId === m.teamBId) {
        statsB.won += 1;
        statsB.points += 2;
      } else if (winnerId === m.teamAId) {
        statsB.lost += 1;
      } else if (isTie) {
        statsB.tied += 1;
        statsB.points += 1;
      } else {
        statsB.noResult += 1;
        statsB.points += 1;
      }
      statsB.runsFor += runsForB;
      statsB.legalBallsFor += nrrBallsForB;
      statsB.runsAgainst += runsAgainstB;
      statsB.legalBallsAgainst += nrrBallsAgainstB;
    }
  });

  const list: TeamStanding[] = participatingTeams.map((t) => {
    const s = map.get(t.id)!;
    const rpoFor = runsPerOver(s.runsFor, s.legalBallsFor);
    const rpoAgainst = runsPerOver(s.runsAgainst, s.legalBallsAgainst);
    const nrr = s.played > 0 && (s.legalBallsFor > 0 || s.legalBallsAgainst > 0)
      ? Number((rpoFor - rpoAgainst).toFixed(2))
      : 0;

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
      oversFor: legalBallsToOvers(s.legalBallsFor),
      oversForText: oversText(s.legalBallsFor),
      legalBallsFor: s.legalBallsFor,
      runsAgainst: s.runsAgainst,
      oversAgainst: legalBallsToOvers(s.legalBallsAgainst),
      oversAgainstText: oversText(s.legalBallsAgainst),
      legalBallsAgainst: s.legalBallsAgainst,
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

export const getTournamentStandings = calculateStandings;

export interface GroupedTournamentStandings {
  groupA: TeamStanding[];
  groupB: TeamStanding[];
  hasStandings: boolean;
  all: TeamStanding[];
}

export function getGroupedTournamentStandings(
  teams: Team[],
  matches: Match[],
): GroupedTournamentStandings {
  if (!teams || teams.length === 0) {
    return {
      groupA: [],
      groupB: [],
      hasStandings: false,
      all: [],
    };
  }

  const safeMatches = matches || [];
  const all = calculateStandings(teams, safeMatches);

  const g1Teams = teams.filter((t) => getTeamGroup(t) === "Group 1");
  const g2Teams = teams.filter((t) => getTeamGroup(t) === "Group 2");

  const groupA = calculateStandings(g1Teams, safeMatches);
  const groupB = calculateStandings(g2Teams, safeMatches);

  return {
    groupA,
    groupB,
    hasStandings: groupA.length > 0 || groupB.length > 0 || all.length > 0,
    all,
  };
}
