interface SponsorSlotProps {
  sponsor?: {
    name?: string;
    logoUrl?: string;
    tagline?: string;
  } | null;
}

export function SponsorSlot({ sponsor }: SponsorSlotProps) {
  if (!sponsor || !sponsor.name) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-white/70">
      <span className="text-white/40">PARTNER:</span>
      {sponsor.logoUrl ? (
        <img src={sponsor.logoUrl} alt={sponsor.name} className="h-3.5 max-w-[80px] object-contain" />
      ) : (
        <span className="text-[#D9A928] font-black tracking-wider">{sponsor.name}</span>
      )}
    </div>
  );
}
