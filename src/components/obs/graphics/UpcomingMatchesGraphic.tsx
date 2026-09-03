import { motion } from "framer-motion";
import { useMatches, useTeams } from "@/hooks/useCricketData";
import { TeamLogo } from "@/components/team/TeamLogo";
import { lookup } from "@/lib/repositories";
import { Logo } from "@/components/brand/Logo";
import { formatMatchTime } from "@/lib/utils";

export function UpcomingMatchesGraphic({ transitionType = "fade" }: { transitionType?: string }) {
  const { data: matches = [] } = useMatches();
  const { data: teams = [] } = useTeams();

  // Find next 3 upcoming matches
  const upcomingMatches = matches
    .filter(m => m.status === "UPCOMING" || m.status === "READY")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const variants = {
    initial: transitionType === "slide" ? { y: "100%" } : { opacity: 0 },
    animate: transitionType === "slide" ? { y: 0 } : { opacity: 1 },
    exit: transitionType === "slide" ? { y: "100%" } : { opacity: 0 },
  };

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col pt-12 pb-24"
    >
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-16">
          <Logo className="h-16 w-auto mb-6 drop-shadow-2xl brightness-150" />
          <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-[#D9A928]">
            UPCOMING FIXTURES
          </h1>
        </div>

        {/* Fixtures Container */}
        <div className="flex-1 flex justify-center items-center gap-8 px-12">
          {upcomingMatches.length === 0 ? (
            <div className="text-2xl font-bold uppercase tracking-widest text-[#666666]">
              NO UPCOMING MATCHES
            </div>
          ) : (
            upcomingMatches.map((m, i) => {
              const teamA = lookup.team(m.teamAId) || teams.find(t => t.id === m.teamAId);
              const teamB = lookup.team(m.teamBId) || teams.find(t => t.id === m.teamBId);
              
              const dateObj = new Date(m.date);
              const dayStr = dateObj.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
              const timeStr = formatMatchTime(m.time);
              const dateStr = `${dayStr} • ${timeStr}`;

              return (
                <div key={m.id} className="flex-1 bg-gradient-to-b from-[#111111] to-transparent border border-[#222222] rounded-3xl p-8 flex flex-col items-center justify-between h-[450px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D9A928] to-transparent opacity-50" />
                  
                  <div className="text-sm font-black uppercase tracking-widest text-[#888888]">
                    MATCH {String(m.matchNumber).padStart(2, '0')}
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 w-full">
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo teamId={teamA?.id || ""} className="w-20 h-20 drop-shadow-lg" />
                      <div className="text-center">
                        <div className="text-lg font-black uppercase tracking-widest text-white leading-tight">
                          {teamA?.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-[#D9A928] font-black italic text-xl">VS</div>

                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo teamId={teamB?.id || ""} className="w-20 h-20 drop-shadow-lg" />
                      <div className="text-center">
                        <div className="text-lg font-black uppercase tracking-widest text-white leading-tight">
                          {teamB?.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[#D9A928] font-bold tracking-widest uppercase">
                      {dateStr}
                    </div>
                    <div className="text-xs font-bold text-[#888888] uppercase tracking-wider">
                      {m.venue}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#666666]">
          POWERED BY <span className="text-white">VALGROW LABS</span>
        </span>
      </div>
    </motion.div>
  );
}
