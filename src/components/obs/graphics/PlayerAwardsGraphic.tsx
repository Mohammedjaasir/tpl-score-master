import { motion } from "framer-motion";
import { Trophy, Flame, Target } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useMatches } from "@/hooks/useCricketData";
import { calculateTournamentStats } from "@/lib/scoring/statistics";
import { useMemo } from "react";

interface PlayerAwardsGraphicProps {
  payload?: {
    orangeCap?: any;
    purpleCap?: any;
    mvp?: any;
    transition?: string;
  };
  transitionType?: string;
}

export function PlayerAwardsGraphic({ payload, transitionType = "fade" }: PlayerAwardsGraphicProps) {
  const { data: matches = [] } = useMatches();
  const stats = useMemo(() => calculateTournamentStats(matches), [matches]);

  const effectiveTransition = payload?.transition || transitionType;
  const variants = {
    initial: effectiveTransition === "slide" ? { y: "100%" } : { opacity: 0 },
    animate: effectiveTransition === "slide" ? { y: 0 } : { opacity: 1 },
    exit: effectiveTransition === "slide" ? { y: "100%" } : { opacity: 0 },
  };

  // Real tournament leaders
  const orangeLeader = payload?.orangeCap || stats.orangeCap[0];
  const purpleLeader = payload?.purpleCap || stats.purpleCap[0];
  const mvpLeader = payload?.mvp || stats.mvpLeaderboard[0];

  const awards = [
    {
      title: "ORANGE CAP",
      subtitle: orangeLeader && orangeLeader.runs > 0
        ? `MOST RUNS (${orangeLeader.innings} INN · SR ${Math.round(orangeLeader.strikeRate || 0)})`
        : "MOST RUNS (TOURNAMENT LEADER)",
      player: orangeLeader?.playerName || (matches.length > 0 ? "LEADER IN PROGRESS" : "AWAITING MATCHES"),
      team: orangeLeader?.teamShortName || orangeLeader?.teamName || "TPL 2026",
      value: orangeLeader && orangeLeader.runs > 0 ? `${orangeLeader.runs}` : "0",
      unit: "RUNS",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      borderColor: "border-orange-500/30",
    },
    {
      title: "PURPLE CAP",
      subtitle: purpleLeader && purpleLeader.wickets > 0
        ? `MOST WICKETS (ECON ${(purpleLeader.economy || 0).toFixed(1)} · BB ${purpleLeader.bestBowling || "—"})`
        : "MOST WICKETS (TOURNAMENT LEADER)",
      player: purpleLeader?.playerName || (matches.length > 0 ? "LEADER IN PROGRESS" : "AWAITING MATCHES"),
      team: purpleLeader?.teamShortName || purpleLeader?.teamName || "TPL 2026",
      value: purpleLeader && purpleLeader.wickets > 0 ? `${purpleLeader.wickets}` : "0",
      unit: "WICKETS",
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      borderColor: "border-purple-500/30",
    },
    {
      title: "MVP",
      subtitle: mvpLeader && mvpLeader.mvpPoints > 0
        ? `MOST VALUABLE PLAYER (${mvpLeader.runs || 0}R · ${mvpLeader.wickets || 0}W · ${mvpLeader.catches || 0}C)`
        : "MOST VALUABLE PLAYER",
      player: mvpLeader?.playerName || (matches.length > 0 ? "LEADER IN PROGRESS" : "AWAITING MATCHES"),
      team: mvpLeader?.teamShortName || mvpLeader?.teamName || "TPL 2026",
      value: mvpLeader && mvpLeader.mvpPoints > 0 ? `${(mvpLeader.mvpPoints || 0).toFixed(1)}` : "0.0",
      unit: "PTS",
      icon: Trophy,
      color: "text-[#D9A928]",
      bgColor: "bg-[#D9A928]",
      borderColor: "border-[#D9A928]/30",
    },
  ];

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col pt-12 pb-24"
    >
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col items-center justify-center">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-14 text-center">
          <Logo className="h-16 w-auto mb-5 drop-shadow-2xl brightness-150" />
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-[0.2em] text-[#D9A928] drop-shadow-md">
            TOURNAMENT LEADERS
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#888888] mt-2">
            OFFICIAL TOURNAMENT AWARDS & LEADERBOARD
          </p>
        </div>

        {/* Awards Container */}
        <div className="flex items-stretch justify-center gap-8 w-full px-6">
          {awards.map((award, i) => (
            <div
              key={i}
              className={`flex-1 bg-gradient-to-b from-[#141414] to-[#0A0A0A] border ${award.borderColor} rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden min-h-[440px]`}
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${award.bgColor}`} />

              <div
                className={`w-20 h-20 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-5 shadow-xl ${award.color}`}
              >
                <award.icon className="w-10 h-10" />
              </div>

              <h2 className={`text-2xl font-black uppercase tracking-[0.2em] mb-1 ${award.color}`}>
                {award.title}
              </h2>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#888888] mb-6 text-center max-w-[280px]">
                {award.subtitle}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full my-auto">
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-1.5 text-center line-clamp-1">
                  {award.player}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#777777] mb-6">
                  {award.team}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${award.color}`}>
                    {award.value}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-[#888888]">
                    {award.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center items-center">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#666666]">
          POWERED BY <span className="text-white">VALGROW LABS</span>
        </span>
      </div>
    </motion.div>
  );
}
