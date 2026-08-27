export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 shrink-0 text-primary"
        fill="none"
      >
        <path d="M4 26 L20 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M7 29 L11 25"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="25" cy="24" r="5" fill="currentColor" />
      </svg>
      <div className="leading-none">
        <span className="display-xl block text-xl font-extrabold text-foreground">TPL</span>
        {!compact && (
          <span className="block text-[10px] font-bold tracking-[0.28em] text-muted-foreground">
            CRICKET
          </span>
        )}
      </div>
    </div>
  );
}
