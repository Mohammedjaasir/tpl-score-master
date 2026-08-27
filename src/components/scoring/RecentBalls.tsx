import type { BallSummary } from "@/types/cricket";

function chipColors(kind: BallSummary["kind"], label: string): string {
  if (kind === "wicket") return "bg-[#DC2626] text-white font-black shadow-sm";
  if (kind === "boundary") {
    if (label === "6") return "bg-[#D9A928] text-[#111111] font-black shadow-sm";
    return "bg-[#D9A928]/20 text-[#9A6A05] border border-[#D9A928]/40 font-black";
  }
  if (kind === "extra") return "bg-[#F7F7F5] text-[#111111] border border-[#D9A928]/40 font-bold";
  if (kind === "dot") return "bg-[#F7F7F5] text-[#5F6368] border border-[#E5E5E5]";
  return "bg-white text-[#111111] border border-[#E5E5E5] font-bold";
}

export function RecentBalls({ balls }: { balls: BallSummary[] }) {
  if (balls.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-extrabold tracking-widest text-[#5F6368] uppercase flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D9A928]" />
        This Over / Recent Balls
      </p>
      <div className="flex flex-wrap gap-1.5">
        {balls.map((b, i) => (
          <span
            key={b.delivery.id + i}
            className={`chip-ball ${chipColors(b.kind, b.label)}`}
            aria-label={`Ball ${i + 1}: ${b.label}`}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
