import type { InningsState } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText } from "@/lib/scoring/engine";

interface InningsScorecardProps {
  innings: InningsState;
  label: string;
}

function DismissalText({ stat }: { stat: InningsState["batters"][0] }) {
  if (!stat.out) return <span className="text-[#16A34A] font-extrabold">not out</span>;
  return <span className="text-[#5F6368] font-medium">{stat.dismissal ?? "out"}</span>;
}

function BattingCard({ innings, label }: InningsScorecardProps) {
  const team = lookup.team(innings.battingTeamId);
  const sortedBatters = [...innings.batters].sort((a, b) => a.battingPosition - b.battingPosition);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-[#E5E5E5] p-4 rounded-2xl shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#D9A928]/15 text-[10px] font-black tracking-widest text-[#9A6A05] uppercase mb-1">
            {label}
          </span>
          <p className="text-base sm:text-lg font-black text-[#111111]">{team?.name}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl sm:text-4xl font-black text-[#111111] tabular-nums">
            {innings.runs}
            <span className="text-2xl text-[#9A6A05]">/{innings.wickets}</span>
          </p>
          <p className="text-xs text-[#5F6368] font-extrabold">
            {innings.oversText} overs
          </p>
        </div>
      </div>

      {/* Batting table — desktop */}
      <div className="hidden md:block bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAF8]">
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#5F6368]">Batter</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">R</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">B</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">4s</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">6s</th>
              <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-20">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {sortedBatters.map((b) => {
              const p = lookup.player(b.playerId);
              const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
              return (
                <tr key={b.playerId} className={b.out ? "hover:bg-[#FAFAF8]" : "bg-[#D9A928]/5 hover:bg-[#D9A928]/10"}>
                  <td className="px-4 py-3">
                    <p className="font-extrabold text-[#111111]">{p?.name ?? b.playerId}</p>
                    <p className="text-[11px] mt-0.5">
                      <DismissalText stat={b} />
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right font-black text-[#111111] tabular-nums">{b.runs}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.balls}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.fours}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.sixes}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{sr}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E5E5E5] bg-[#FAFAF8]">
              <td className="px-4 py-3 text-xs font-bold text-[#5F6368]" colSpan={6}>
                Extras: <span className="font-extrabold text-[#111111]">{innings.extras}</span> &nbsp;·&nbsp; Total: <span className="font-extrabold text-[#111111]">{innings.runs}/{innings.wickets}</span> ({innings.oversText} ov)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Batting cards — mobile */}
      <div className="md:hidden flex flex-col divide-y divide-[#E5E5E5] bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
        {sortedBatters.map((b) => {
          const p = lookup.player(b.playerId);
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
          return (
            <div key={b.playerId} className={`px-4 py-3 ${b.out ? "" : "bg-[#D9A928]/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#111111] truncate">{p?.name ?? b.playerId}</p>
                  <p className="text-[11px] mt-0.5">
                    <DismissalText stat={b} />
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-xl font-black text-[#111111] tabular-nums">
                    {b.runs} <span className="text-xs text-[#5F6368] font-bold">({b.balls}b)</span>
                  </p>
                  <p className="text-[10px] text-[#5F6368] font-bold tabular-nums">
                    4s: {b.fours} · 6s: {b.sixes} · SR: {sr}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="px-4 py-3 bg-[#FAFAF8]">
          <p className="text-xs font-bold text-[#5F6368]">
            Extras: <span className="font-extrabold text-[#111111]">{innings.extras}</span> · Total: <span className="font-extrabold text-[#111111]">{innings.runs}/{innings.wickets}</span> ({innings.oversText} ov)
          </p>
        </div>
      </div>
    </div>
  );
}

function BowlingCard({ innings }: { innings: InningsState }) {
  const sortedBowlers = [...innings.bowlers].sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-black tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
        Bowling Analysis
      </p>

      {/* Desktop */}
      <div className="hidden md:block bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAF8]">
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#5F6368]">Bowler</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">O</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">M</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">R</th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-12">W</th>
              <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#5F6368] w-20">Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {sortedBowlers.map((b) => {
              const p = lookup.player(b.playerId);
              return (
                <tr key={b.playerId} className="hover:bg-[#FAFAF8]">
                  <td className="px-4 py-3">
                    <p className="font-extrabold text-[#111111]">{p?.name ?? b.playerId}</p>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{oversText(b.legalBalls)}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.maidens}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.runs}</td>
                  <td className="px-3 py-3 text-right font-black text-[#9A6A05] bg-[#D9A928]/10 tabular-nums">{b.wickets}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#5F6368] tabular-nums">{b.economy.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col divide-y divide-[#E5E5E5] bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
        {sortedBowlers.map((b) => {
          const p = lookup.player(b.playerId);
          return (
            <div key={b.playerId} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-[#111111] truncate">{p?.name ?? b.playerId}</p>
                <p className="text-[10px] font-bold text-[#5F6368]">{oversText(b.legalBalls)} ov</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-xl font-black text-[#111111] tabular-nums">
                  <span className="text-[#9A6A05]">{b.wickets}</span>/{b.runs}
                </p>
                <p className="text-[10px] font-bold text-[#5F6368] tabular-nums">
                  Econ: {b.economy.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScorecardView({ innings }: { innings: InningsState[] }) {
  return (
    <div className="flex flex-col gap-8">
      {innings.map((inn, i) => (
        <div key={inn.index} className="flex flex-col gap-6">
          <BattingCard innings={inn} label={i === 0 ? "1st Innings" : "2nd Innings"} />
          <BowlingCard innings={inn} />

          {/* Fall of wickets */}
          {inn.fallOfWickets.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
                Fall of Wickets
              </p>
              <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm px-4 py-3">
                <p className="text-xs font-extrabold text-[#111111] leading-relaxed">
                  {inn.fallOfWickets.map((w, wi) => {
                    const p = lookup.player(w.batterOutId);
                    return `${wi + 1}-${w.runs} (${p?.shortName ?? "?"}, ${w.oversText} ov)`;
                  }).join("  •  ")}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
