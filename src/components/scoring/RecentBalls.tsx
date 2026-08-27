import type { BallSummary } from "@/types/cricket";

function chipColors(kind: BallSummary["kind"], label: string): string {
  if (kind === "wicket") return "bg-primary text-primary-foreground";
  if (kind === "boundary") {
    if (label === "6") return "bg-success text-white";
    return "bg-warning/20 text-amber-800";
  }
  if (kind === "extra") return "bg-blue-100 text-blue-700";
  if (kind === "dot") return "bg-muted text-muted-foreground";
  return "bg-secondary text-foreground";
}

export function RecentBalls({ balls }: { balls: BallSummary[] }) {
  if (balls.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Recent
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
