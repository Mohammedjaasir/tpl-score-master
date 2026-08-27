import type { InningsState } from "@/types/cricket";
import { lookup } from "@/lib/repositories";
import { oversText } from "@/lib/scoring/engine";

interface InningsScorecardProps {
  innings: InningsState;
  label: string;
}

function DismissalText({ stat }: { stat: InningsState["batters"][0] }) {
  if (!stat.out) return <span className="text-success font-bold">not out</span>;
  return <span className="text-muted-foreground">{stat.dismissal ?? "out"}</span>;
}

function BattingCard({ innings, label }: InningsScorecardProps) {
  const team = lookup.team(innings.battingTeamId);
  const sortedBatters = [...innings.batters].sort((a, b) => a.battingPosition - b.battingPosition);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{label}</p>
          <p className="text-base font-extrabold text-foreground">{team?.name}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-extrabold text-foreground tabular-nums">
            {innings.runs}
            <span className="text-xl text-muted-foreground">/{innings.wickets}</span>
          </p>
          <p className="text-xs text-muted-foreground font-bold">
            {innings.oversText} ov
          </p>
        </div>
      </div>

      {/* Batting table — desktop */}
      <div className="hidden md:block card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/50">
              <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Batter</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">R</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">B</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">4s</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">6s</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-16">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedBatters.map((b) => {
              const p = lookup.player(b.playerId);
              const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
              return (
                <tr key={b.playerId} className={b.out ? "" : "bg-success/5"}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{p?.name ?? b.playerId}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      <DismissalText stat={b} />
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right font-extrabold text-foreground tabular-nums">{b.runs}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">{b.balls}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">{b.fours}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">{b.sixes}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{sr}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/60 bg-secondary/30">
              <td className="px-4 py-2 text-xs font-bold text-muted-foreground" colSpan={6}>
                Extras: {innings.extras} &nbsp;·&nbsp; Total: {innings.runs}/{innings.wickets} ({innings.oversText} ov)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Batting cards — mobile */}
      <div className="md:hidden flex flex-col divide-y divide-border/50 card-surface overflow-hidden">
        {sortedBatters.map((b) => {
          const p = lookup.player(b.playerId);
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
          return (
            <div key={b.playerId} className={`px-4 py-3 ${b.out ? "" : "bg-success/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{p?.name ?? b.playerId}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <DismissalText stat={b} />
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-xl font-extrabold text-foreground tabular-nums">
                    {b.runs} <span className="text-sm text-muted-foreground">({b.balls})</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    4s {b.fours} · 6s {b.sixes} · SR {sr}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="px-4 py-2.5 bg-secondary/30">
          <p className="text-xs font-bold text-muted-foreground">
            Extras: {innings.extras} · Total: {innings.runs}/{innings.wickets} ({innings.oversText} ov)
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
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Bowling</p>

      {/* Desktop */}
      <div className="hidden md:block card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/50">
              <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Bowler</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">O</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">M</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">R</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-10">W</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-16">Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedBowlers.map((b) => {
              const p = lookup.player(b.playerId);
              return (
                <tr key={b.playerId}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{p?.name ?? b.playerId}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">{oversText(b.legalBalls)}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">{b.maidens}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">{b.runs}</td>
                  <td className="px-3 py-3 text-right font-extrabold text-foreground tabular-nums">{b.wickets}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{b.economy.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col divide-y divide-border/50 card-surface overflow-hidden">
        {sortedBowlers.map((b) => {
          const p = lookup.player(b.playerId);
          return (
            <div key={b.playerId} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{p?.name ?? b.playerId}</p>
                <p className="text-[10px] text-muted-foreground">{oversText(b.legalBalls)} ov</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-xl font-extrabold text-foreground tabular-nums">
                  {b.wickets}/{b.runs}
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  Econ {b.economy.toFixed(2)}
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
        <div key={inn.index} className="flex flex-col gap-4">
          <BattingCard innings={inn} label={i === 0 ? "1st Innings" : "2nd Innings"} />
          <BowlingCard innings={inn} />

          {/* Fall of wickets */}
          {inn.fallOfWickets.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Fall of Wickets</p>
              <div className="card-surface px-4 py-3">
                <p className="text-xs font-bold text-foreground">
                  {inn.fallOfWickets.map((w, wi) => {
                    const p = lookup.player(w.batterOutId);
                    return `${wi + 1}-${w.runs} (${p?.shortName ?? "?"}, ${w.oversText})`;
                  }).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
