import { Shield } from "lucide-react";

interface TeamLogoProps {
  logoUrl?: string;
  name?: string;
  shortName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isBatting?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-7 h-7 sm:w-8 sm:h-8 rounded-lg",
  sm: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl",
  md: "w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-2xl",
  lg: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl",
};

export function TeamLogo({
  logoUrl,
  name,
  shortName,
  size = "md",
  isBatting = false,
  className = "",
}: TeamLogoProps) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`relative ${sizeClass} shrink-0 bg-black/80 border flex items-center justify-center shadow-md overflow-hidden transition-all select-none ${
        isBatting
          ? "border-[#D9A928] ring-2 ring-[#D9A928]/40 shadow-[0_0_16px_rgba(217,169,40,0.35)]"
          : "border-white/20 group-hover:border-[#D9A928]/40"
      } ${className}`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name ?? "Team logo"}
          className="w-full h-full object-cover rounded-[inherit] transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <Shield className="h-4 w-4 text-[#D9A928] mb-0.5" />
          <span className="text-[10px] font-black text-[#D9A928]">
            {shortName?.slice(0, 3) ?? "TPL"}
          </span>
        </div>
      )}
    </div>
  );
}
