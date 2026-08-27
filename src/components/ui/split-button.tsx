import * as React from "react";
import { Plus, ChevronDown, type LucideIcon } from "lucide-react";

export interface SplitButtonProps {
  label?: string;
  icon?: LucideIcon;
  onAction?: () => void;
  onDropdown?: () => void;
  variant?: "purple" | "gold" | "dark";
  className?: string;
  children?: React.ReactNode;
}

export function SplitButton({
  label = "New",
  icon: Icon = Plus,
  onAction,
  onDropdown,
  variant = "purple",
  className = "",
  children,
}: SplitButtonProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const variants = {
    purple: {
      container:
        "bg-gradient-to-b from-[#7A3BF6] via-[#6320EE] to-[#4D14D1] shadow-[0_12px_28px_-6px_rgba(108,44,245,0.55),0_4px_12px_rgba(0,0,0,0.4)] border border-[#9A6BFF]/40",
      innerGlow: "shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.3)]",
      divider: "border-l border-white/20 hover:bg-white/10",
      badge: "bg-white/20 border border-white/30 text-white",
      text: "text-white",
      chevron: "text-white/90",
    },
    gold: {
      container:
        "bg-gradient-to-b from-[#F5C744] via-[#D9A928] to-[#9A6A05] shadow-[0_12px_28px_-6px_rgba(217,169,40,0.55),0_4px_12px_rgba(0,0,0,0.4)] border border-[#FDE68A]/50",
      innerGlow: "shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.3)]",
      divider: "border-l border-black/15 hover:bg-black/10",
      badge: "bg-black/15 border border-black/20 text-[#111111]",
      text: "text-[#111111]",
      chevron: "text-[#111111]/90",
    },
    dark: {
      container:
        "bg-gradient-to-b from-[#1E2333] to-[#0E111A] shadow-[0_10px_25px_-6px_rgba(0,0,0,0.6)] border border-white/10",
      innerGlow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
      divider: "border-l border-white/10 hover:bg-white/10",
      badge: "bg-white/10 border border-white/15 text-white",
      text: "text-white",
      chevron: "text-white/80",
    },
  };

  const v = variants[variant];

  return (
    <div
      className={`inline-flex items-stretch rounded-[1.25rem] select-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${v.container} ${v.innerGlow} ${className}`}
    >
      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onAction}
        className={`flex items-center gap-2.5 px-5 py-3 font-semibold text-sm tracking-wide ${v.text} cursor-pointer`}
      >
        <span
          className={`grid h-6 w-6 place-items-center rounded-lg ${v.badge} transition-transform active:scale-95`}
        >
          <Icon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
        </span>
        <span className="font-bold">{children || label}</span>
      </button>

      {/* Split Divider & Dropdown Trigger */}
      <button
        type="button"
        onClick={() => {
          setDropdownOpen((prev) => !prev);
          onDropdown?.();
        }}
        aria-label="Toggle options"
        className={`px-3.5 flex items-center justify-center ${v.divider} transition-colors cursor-pointer rounded-r-[1.25rem]`}
      >
        <ChevronDown
          className={`h-4 w-4 ${v.chevron} transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function GlassPillButton({
  icon: Icon,
  label,
  onClick,
  className = "",
}: {
  icon?: LucideIcon;
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[1.25rem] bg-[#111422]/80 hover:bg-[#1A1E32] border border-white/10 text-white/80 hover:text-white transition-all shadow-md ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />}
      {label && <span className="text-xs font-semibold">{label}</span>}
    </button>
  );
}
