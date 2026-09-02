import { matchRepository, lookup } from "../src/lib/repositories.ts";

async function run() {
  const matches = await matchRepository.list();
  console.log("Total matches:", matches.length);
  matches.forEach((m) => {
    const teamA = lookup.team(m.teamAId)?.name || m.teamAId;
    const teamB = lookup.team(m.teamBId)?.name || m.teamBId;
    console.log(`Match #${m.matchNumber} | ID: ${m.id} | Status: ${m.status} | ${teamA} vs ${teamB}`);
  });
}

run();
