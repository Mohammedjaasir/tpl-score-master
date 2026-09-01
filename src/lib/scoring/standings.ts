import type { Match, Team } from "@/types/cricket";
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

export function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
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

  teams.forEach((t) => {
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
    let runsA = 0;
    let legalBallsA = 0;
    let runsB = 0;
    let legalBallsB = 0;
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
            const team1Runs = inn1.runs;
            const team1Balls = inn1.legalBalls;
            const team2Runs = inn2 ? inn2.runs : 0;
            const team2Balls = inn2 ? inn2.legalBalls : 0;

            if (inn1.battingTeamId === m.teamAId) {
              runsA = team1Runs;
              legalBallsA = team1Balls;
              runsB = team2Runs;
              legalBallsB = team2Balls;
            } else {
              runsB = team1Runs;
              legalBallsB = team1Balls;
              runsA = team2Runs;
              legalBallsA = team2Balls;
            }

            const target = inn2?.target ?? (team1Runs + 1);
            if (inn2 && team2Runs >= target) {
              winnerId = inn2.battingTeamId;
            } else if (inn2 && (inn2.isComplete || state.phase === "complete" || doc.isCompleted) && team2Runs < team1Runs) {
              winnerId = inn1.battingTeamId;
            } else if (inn1 && !inn2 && (state.phase === "complete" || doc.isCompleted)) {
              winnerId = inn1.battingTeamId;
            } else if (inn2 && (inn2.isComplete || state.phase === "complete" || doc.isCompleted) && team1Runs === team2Runs && team2Balls > 0) {
              isTie = true;
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
    if (!statsA || !statsB) return;

    statsA.played += 1;
    statsB.played += 1;

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
    } else {
      statsA.noResult += 1;
      statsA.points += 1;
      statsB.noResult += 1;
      statsB.points += 1;
    }

    statsA.runsFor += runsA;
    statsA.legalBallsFor += legalBallsA;
    statsA.runsAgainst += runsB;
    statsA.legalBallsAgainst += legalBallsB;

    statsB.runsFor += runsB;
    statsB.legalBallsFor += legalBallsB;
    statsB.runsAgainst += runsA;
    statsB.legalBallsAgainst += legalBallsA;
  });

  const list: TeamStanding[] = teams.map((t) => {
    const s = map.get(t.id)!;
    const rpoFor = runsPerOver(s.runsFor, s.legalBallsFor);
    const rpoAgainst = runsPerOver(s.runsAgainst, s.legalBallsAgainst);
    const nrr = s.played > 0 && (s.legalBallsFor > 0 || s.legalBallsAgainst > 0)
      ? rpoFor - rpoAgainst
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
