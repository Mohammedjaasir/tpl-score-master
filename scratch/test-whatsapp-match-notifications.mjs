import assert from "assert";

function formatMessage(m, teamAName, teamBName, origin, numSymbol, time, players = []) {
  let message = "";
  if (m.status === "UPCOMING" || m.status === "READY") {
    message = `TPL 2026 — Match Scheduled\n\nMatch ${numSymbol}\n${teamAName} vs ${teamBName}\n\nDate: ${time}\nVenue: ${m.venue || 'TPL Cricket Ground'}\nOvers: ${m.overs}\n\nScorer PIN: ${m.scorerPin || '----'}\n\nScorer:\n${origin}/match/${m.id}\n\nOBS:\n${origin}/obs/match/${m.id}`;
  } else if (m.status === "LIVE") {
    message = `🔴 TPL 2026 LIVE\n\nMatch ${numSymbol}\n${teamAName} vs ${teamBName}\n\nMatch is now LIVE.\n\nLive Score:\n${origin}/match/${m.id}\n\nOBS Broadcast:\n${origin}/obs/match/${m.id}`;
  } else if (m.status === "COMPLETED") {
    let winnerLine = m.resultText || "MATCH COMPLETED";
    let potmText = "";
    if (m.manOfTheMatchId) {
      const potm = players.find(p => p.id === m.manOfTheMatchId);
      if (potm) {
        const slug = potm.slug || potm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        potmText = `Player of the Match:\n${potm.name}\n${origin}/player/${slug}\n\n`;
      }
    }
    
    message = `🏆 TPL 2026 — MATCH RESULT\n\nMatch ${numSymbol}\n\n${teamAName}\nvs\n${teamBName}\n\n🏆 WINNER\n${winnerLine}\n\n${potmText}Scorecard:\n${origin}/match/${m.id}\n\nOBS:\n${origin}/obs/match/${m.id}`;
  } else {
    message = `TPL 2026 Match ${numSymbol}: ${teamAName} vs ${teamBName}`;
  }
  return message;
}

const origin = "https://tpl.valgrowlabs.com";

console.log("TESTING WHATSAPP PAYLOAD GENERATION...");

const upcomMsg = formatMessage(
  { status: "UPCOMING", id: "123", venue: "Dubai", overs: 5, scorerPin: "4512" }, 
  "Team A", "Team B", origin, "1", "2026-08-30 09:00", []
);

assert.ok(upcomMsg.includes("TPL 2026 — Match Scheduled"));
assert.ok(upcomMsg.includes("Team A vs Team B"));
assert.ok(upcomMsg.includes("Scorer PIN: 4512"));
assert.ok(upcomMsg.includes("https://tpl.valgrowlabs.com/match/123"));
assert.ok(upcomMsg.includes("https://tpl.valgrowlabs.com/obs/match/123"));

const liveMsg = formatMessage(
  { status: "LIVE", id: "123" }, 
  "Team A", "Team B", origin, "1", "2026-08-30 09:00", []
);

assert.ok(liveMsg.includes("🔴 TPL 2026 LIVE"));
assert.ok(liveMsg.includes("Match is now LIVE."));

const completedMsg = formatMessage(
  { status: "COMPLETED", id: "123", resultText: "Team A won by 10 runs", manOfTheMatchId: "p1" }, 
  "Team A", "Team B", origin, "1", "2026-08-30 09:00", 
  [{ id: "p1", name: "John Doe", slug: "john-doe" }]
);

assert.ok(completedMsg.includes("🏆 TPL 2026 — MATCH RESULT"));
assert.ok(completedMsg.includes("Team A won by 10 runs"));
assert.ok(completedMsg.includes("Player of the Match:\nJohn Doe\nhttps://tpl.valgrowlabs.com/player/john-doe"));

console.log("✅ All assertions passed.");
