interface LogoProps {
  compact?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-9",
    md: "h-11",
    lg: "h-16",
    xl: "h-24",
  };

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <img
        src="/tpl-logo.png"
        alt="TPL 2026 - Thunduwa Premier League"
        className={`${sizeClasses[size]} w-auto object-contain shrink-0 filter drop-shadow-sm select-none`}
        loading="eager"
      />
    </div>
  );
}
