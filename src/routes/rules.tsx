import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Shield, CloudRain, Calculator, Trophy, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/rules")({
  component: OfficialRulesPage,
});

function OfficialRulesPage() {
  return (
    <AppShell title="Rules & Regulations">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-2 pb-20">
        {/* Header */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-8 text-center sm:text-left">
          <span className="text-[10px] font-black tracking-widest text-[#D9A928] uppercase">
            Official Tournament Guidelines
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight mt-1">
            Rules &amp; Regulations
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368] font-medium mt-1">
            Thunduwa Premier League 2026 Scoring, Squads, Format &amp; Weather Guidelines
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Squads & Playing XI */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#D9A928]/15 flex items-center justify-center text-[#9A6A05] border border-[#D9A928]/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#111111] uppercase tracking-wide">
                  1. Squads &amp; Playing XI
                </h2>
                <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Player Nomination &amp; Substitutes
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#3C4043] leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                <strong className="text-[#111111]">Playing Members:</strong> Before the toss, each captain must nominate their Playing XI. A maximum of 11 players are allowed to actively bat and bowl during the match.
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                <strong className="text-[#111111]">Flexibility:</strong> If a team is short on players, they may take the field with fewer than 11 players (e.g. 9 or 10). However, the opposing team is not obligated to provide substitute fielders.
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                <strong className="text-[#111111]">Substitutes:</strong> Teams may nominate up to 4 substitute players. Substitutes are allowed to field but <em>cannot</em> bat, bowl, or act as captain or wicket-keeper, unless approved by the umpires as a formal Concussion Substitute.
              </div>
            </div>
          </section>

          {/* Section 2: Tournament Format & Knockouts */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 border border-purple-200">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#111111] uppercase tracking-wide">
                  2. Tournament Format &amp; Knockouts
                </h2>
                <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Cross-Pool Group Stage &amp; Finals
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#3C4043] leading-relaxed">
              <p>
                <strong className="text-[#111111]">Group Stage (Cross-Pool):</strong> The tournament consists of 6 teams divided into two groups: Group 1 (Teams A, B, C) and Group 2 (Teams D, E, F). Each team in Group 1 will play against all three teams in Group 2, resulting in a total of 9 Group Stage matches.
              </p>
              <p>
                <strong className="text-[#111111]">Semi-Finals Qualification:</strong> At the end of the 9 Group Stage matches, the Top 2 teams from Group 1 and the Top 2 teams from Group 2 will qualify for the Semi-Finals.
              </p>

              <div className="bg-[#121316] text-white p-5 rounded-2xl border border-white/10 my-3">
                <h3 className="text-[#D9A928] font-black mb-3 text-xs uppercase tracking-wider">
                  Knockout Schedule
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                    <span><strong>Semi-Final 1 (Match 10):</strong> Group 1 Winner vs Group 2 Runner-up</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                    <span><strong>Semi-Final 2 (Match 11):</strong> Group 2 Winner vs Group 1 Runner-up</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                    <span><strong>The Final (Match 12):</strong> Winner of Semi-Final 1 vs Winner of Semi-Final 2</span>
                  </li>
                </ul>
              </div>

              <p className="text-[11px] italic text-[#5F6368]">
                * Note: Knockout matches (Semi-Finals and Finals) are scheduled manually from the Admin Dashboard once the Group Stage points table is finalized.
              </p>
            </div>
          </section>

          {/* Section 3: Rain Delays & Reduced Overs */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#111111] uppercase tracking-wide">
                  3. Rain Delays &amp; Reduced Overs
                </h2>
                <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Average Run Rate (ARR) Target Revision
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#3C4043] leading-relaxed">
              <p>
                In the event of rain or unavoidable delays, the umpires and tournament committee may reduce the total overs of the match to ensure a result. TPL 2026 utilizes the Average Run Rate (ARR) method for target revision.
              </p>

              <div className="bg-[#F7F7F5] p-4 rounded-xl border border-[#E5E5E5]">
                <h3 className="font-black text-[#111111] text-xs uppercase mb-1">
                  Scenario A: Rain Before or During First Innings
                </h3>
                <p className="text-xs text-[#5F6368]">
                  If time is lost before or during the first innings, the total overs for both teams are reduced equally. No target recalculation is necessary. The team batting second simply chases the total posted.
                </p>
              </div>

              <div className="bg-[#F7F7F5] p-4 rounded-xl border border-[#E5E5E5]">
                <h3 className="font-black text-[#111111] text-xs uppercase mb-1">
                  Scenario B: Rain During Second Innings (Target Revision)
                </h3>
                <p className="text-xs text-[#5F6368] mb-3">
                  If the team batting second loses overs due to rain, their target is revised based on the Average Run Rate of the team that batted first.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 font-mono text-xs text-blue-900 font-bold">
                  Formula: (Team A Total / Team A Overs) × Team B Reduced Overs = Revised Target
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Engine Calculations & Net Run Rate (NRR) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 border border-green-200">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#111111] uppercase tracking-wide">
                  4. Engine Calculations (NRR)
                </h2>
                <p className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Automated Net Run Rate &amp; Standings
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#3C4043] leading-relaxed">
              <p>
                The TPL scoring engine automatically calculates all statistics instantly. The tournament standings are sorted by Points, followed by Net Run Rate (NRR).
              </p>

              <ul className="space-y-2.5">
                <li className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                  <strong className="text-[#111111]">Strike Rate (SR):</strong> (Total Runs Scored / Total Legal Deliveries Faced) × 100
                </li>
                <li className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                  <strong className="text-[#111111]">Economy Rate (Econ):</strong> (Total Runs Conceded / Total Overs Bowled)
                </li>
                <li className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                  <strong className="text-[#111111]">Net Run Rate (NRR):</strong>
                  <span className="block font-mono text-[11px] text-black bg-white p-2 rounded border border-[#E5E5E5] mt-1.5 font-bold">
                    (Total Runs Scored / Total Overs Faced) − (Total Runs Conceded / Total Overs Bowled)
                  </span>
                </li>
              </ul>

              <p className="text-[11px] italic text-[#5F6368]">
                * Note: If a team is bowled out before their full quota of overs, the total scheduled overs (e.g. 5.0) are used for NRR calculation rather than the actual overs faced.
              </p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
