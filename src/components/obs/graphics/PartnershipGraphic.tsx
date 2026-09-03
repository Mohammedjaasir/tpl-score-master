import { motion } from "framer-motion";
import type { ObsMatchStreamState } from "@/hooks/useObsMatchStream";
import { TeamLogo } from "@/components/team/TeamLogo";
import { Logo } from "@/components/brand/Logo";

export function PartnershipGraphic({ stream, transitionType = "fade" }: { stream: ObsMatchStreamState, transitionType?: string }) {
  if (stream.loading || !stream.match || !stream.innings) return null;

  const currentPartnership = stream.innings.partnerships?.[stream.innings.partnerships.length - 1];
  
  if (!currentPartnership) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-[#666666]">
          NO ACTIVE PARTNERSHIP
        </h2>
      </div>
    );
  }

  const batter1 = currentPartnership.batter1;
  const batter2 = currentPartnership.batter2;

  // Assuming active batting team is Team A if current innings is 1, etc.
  const battingTeamId = stream.innings.battingTeamId;

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
      <div className="flex-1 max-w-[1200px] w-full mx-auto flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-16">
          <Logo className="h-16 w-auto mb-6 drop-shadow-2xl brightness-150" />
          <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white">
            CURRENT PARTNERSHIP
          </h1>
          <div className="mt-6 bg-[#D9A928] text-black px-8 py-2 rounded-full shadow-2xl">
            <span className="text-2xl font-black tracking-widest">{currentPartnership.runs} RUNS</span>
            <span className="text-sm font-bold ml-2">({currentPartnership.balls} balls)</span>
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center justify-center gap-16 w-full">
          
          {/* Batter 1 */}
          <div className="flex-1 bg-gradient-to-t from-[#111111] to-transparent border border-[#222222] rounded-3xl p-10 flex flex-col items-center shadow-2xl">
            <h3 className="text-3xl font-black uppercase tracking-wider text-white mb-6 text-center line-clamp-1">
              {batter1.name}
            </h3>
            <div className="flex items-end gap-2 text-[#D9A928]">
              <span className="text-7xl font-black font-mono leading-none">{batter1.runs}</span>
              <span className="text-2xl font-bold font-mono text-[#888888] mb-2">({batter1.balls})</span>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-[#666666] text-xs font-black uppercase tracking-widest">FOURS</span>
                <span className="text-xl font-bold text-white font-mono">{batter1.fours}</span>
              </div>
              <div className="w-px bg-[#333333]" />
              <div className="flex flex-col items-center">
                <span className="text-[#666666] text-xs font-black uppercase tracking-widest">SIXES</span>
                <span className="text-xl font-bold text-white font-mono">{batter1.sixes}</span>
              </div>
            </div>
          </div>

          <div className="text-6xl font-black text-[#333333]">&</div>

          {/* Batter 2 */}
          <div className="flex-1 bg-gradient-to-t from-[#111111] to-transparent border border-[#222222] rounded-3xl p-10 flex flex-col items-center shadow-2xl">
            <h3 className="text-3xl font-black uppercase tracking-wider text-white mb-6 text-center line-clamp-1">
              {batter2.name}
            </h3>
            <div className="flex items-end gap-2 text-[#D9A928]">
              <span className="text-7xl font-black font-mono leading-none">{batter2.runs}</span>
              <span className="text-2xl font-bold font-mono text-[#888888] mb-2">({batter2.balls})</span>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-[#666666] text-xs font-black uppercase tracking-widest">FOURS</span>
                <span className="text-xl font-bold text-white font-mono">{batter2.fours}</span>
              </div>
              <div className="w-px bg-[#333333]" />
              <div className="flex flex-col items-center">
                <span className="text-[#666666] text-xs font-black uppercase tracking-widest">SIXES</span>
                <span className="text-xl font-bold text-white font-mono">{batter2.sixes}</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Run Rate context */}
        <div className="mt-12 text-[#888888] font-bold tracking-widest uppercase text-sm">
          Partnership Run Rate: <span className="text-white font-mono">{((currentPartnership.runs / Math.max(1, currentPartnership.balls)) * 6).toFixed(2)}</span>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 w-full flex justify-between px-16 items-center">
        <TeamLogo teamId={battingTeamId} className="w-16 h-16 drop-shadow-2xl opacity-50" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#666666]">
          POWERED BY <span className="text-white">VALGROW LABS</span>
        </span>
      </div>
    </motion.div>
  );
}
