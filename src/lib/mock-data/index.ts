import type { Match, Player, PlayerRole, Team } from "@/types/cricket";

export const TOURNAMENT = "TPL 2026";

export const teams: Team[] = [
  { id: "t1", name: "Thunder XI", shortName: "THU" },
  { id: "t2", name: "Warriors CC", shortName: "WAR" },
  { id: "t3", name: "Falcons XI", shortName: "FAL" },
  { id: "t4", name: "Titans CC", shortName: "TIT" },
  { id: "t5", name: "Eagles CC", shortName: "EAG" },
  { id: "t6", name: "Kings XI", shortName: "KIN" },
  { id: "t7", name: "Strikers", shortName: "STR" },
  { id: "t8", name: "Super Giants", shortName: "SGT" },
];

const firstNames = [
  "Arjun",
  "Rohan",
  "Kabir",
  "Ishan",
  "Vikram",
  "Aditya",
  "Neel",
  "Rehan",
  "Dhruv",
  "Sameer",
  "Farhan",
  "Yash",
  "Karan",
];
const lastNames = [
  "Menon",
  "Sharma",
  "Iyer",
  "Khan",
  "Patel",
  "Nair",
  "Rao",
  "Desai",
  "Verma",
  "Joshi",
  "Bose",
  "Gill",
  "Reddy",
];

const roleOrder: PlayerRole[] = [
  "Batsman",
  "Batsman",
  "Batsman",
  "Batsman",
  "Wicketkeeper",
  "All-rounder",
  "All-rounder",
  "Bowler",
  "Bowler",
  "Bowler",
  "Bowler",
  "All-rounder",
  "Batsman",
];

function buildSquad(team: Team, seed: number): Player[] {
  return roleOrder.map((role, i) => {
    const first = firstNames[(seed + i * 3) % firstNames.length];
    const last = lastNames[(seed * 2 + i * 5) % lastNames.length];
    const name = `${first} ${last}`;
    return {
      id: `${team.id}-p${i + 1}`,
      name,
      shortName: `${first[0]}. ${last}`,
      role,
      teamId: team.id,
    };
  });
}

export const players: Player[] = teams.flatMap((t, idx) => buildSquad(t, idx + 1));

const today = new Date();
function at(hours: number, dayOffset = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export const matches: Match[] = [
  {
    id: "m8",
    tournament: TOURNAMENT,
    matchNumber: 8,
    teamAId: "t1",
    teamBId: "t2",
    venue: "TPL Cricket Ground",
    overs: 20,
    scheduledAt: at(14),
    status: "LIVE",
  },
  {
    id: "m9",
    tournament: TOURNAMENT,
    matchNumber: 9,
    teamAId: "t3",
    teamBId: "t6",
    venue: "TPL Cricket Ground",
    overs: 20,
    scheduledAt: at(16),
    status: "READY",
  },
  {
    id: "m10",
    tournament: TOURNAMENT,
    matchNumber: 10,
    teamAId: "t7",
    teamBId: "t8",
    venue: "Riverside Oval",
    overs: 20,
    scheduledAt: at(10, 1),
    status: "UPCOMING",
  },
  {
    id: "m7",
    tournament: TOURNAMENT,
    matchNumber: 7,
    teamAId: "t4",
    teamBId: "t5",
    venue: "TPL Cricket Ground",
    overs: 20,
    scheduledAt: at(14, -1),
    status: "COMPLETED",
    resultText: "Titans CC won by 6 wickets",
  },
  {
    id: "m6",
    tournament: TOURNAMENT,
    matchNumber: 6,
    teamAId: "t2",
    teamBId: "t6",
    venue: "Riverside Oval",
    overs: 20,
    scheduledAt: at(10, -2),
    status: "COMPLETED",
    resultText: "Warriors CC won by 18 runs",
  },
];
