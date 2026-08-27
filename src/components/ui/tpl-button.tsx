import * as React from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";

export type TplButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

export type TplButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<TplButtonVariant, string> = {
  primary:
    "bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#9A6A05] text-[#111111] font-black border border-[#D9A928] shadow-[0_4px_14px_rgba(217,169,40,0.35)]",
  outline:
    "bg-transparent border border-[#D9A928] text-white hover:bg-[#D9A928]/15 active:bg-[#D9A928]/25 font-bold shadow-sm",
  ghost:
    "bg-transparent text-[#D9A928] hover:text-[#F4C542] active:text-[#9A6A05] font-black hover:underline",
  danger:
    "bg-[#B91C1C] hover:bg-[#DC2626] active:bg-[#7F1D1D] text-white font-black border border-red-500/20 shadow-[0_4px_14px_rgba(185,28,28,0.35)]",
  success:
    "bg-[#236B28] hover:bg-[#2E8B34] active:bg-[#184A1C] text-white font-black border border-green-500/20 shadow-[0_4px_14px_rgba(35,107,40,0.35)]",
};

const sizeStyles: Record<TplButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-xl gap-2 min-h-9 font-bold",
  md: "px-6 py-3 text-sm rounded-xl gap-2.5 min-h-12 font-extrabold",
  lg: "px-8 py-4 text-base rounded-2xl gap-3 min-h-14 font-black",
};

export interface TplButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TplButtonVariant;
  size?: TplButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
}

export const TplButton = React.forwardRef<HTMLButtonElement, TplButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      icon: Icon,
      iconRight: IconRight,
      fullWidth = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`tap inline-flex items-center justify-center uppercase tracking-wider transition-all duration-150 select-none cursor-pointer ${
          fullWidth ? "w-full" : ""
        } ${variantStyles[variant]} ${sizeStyles[size]} ${
          disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
        } ${className}`}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {children && <span>{children}</span>}
        {IconRight && <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
      </button>
    );
  },
);

TplButton.displayName = "TplButton";

export interface TplIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
}

export const TplIconButton = React.forwardRef<HTMLButtonElement, TplIconButtonProps>(
  ({ icon: Icon, variant = "outline", size = "md", className = "", ...props }, ref) => {
    const iconSizes = {
      sm: "h-9 w-9 text-xs rounded-xl",
      md: "h-12 w-12 text-sm rounded-xl",
      lg: "h-14 w-14 text-base rounded-2xl",
    };

    const iconVariants = {
      primary:
        "bg-[#D9A928] hover:bg-[#F4C542] active:bg-[#9A6A05] text-[#111111] shadow-[0_4px_14px_rgba(217,169,40,0.35)]",
      outline:
        "bg-transparent border border-[#D9A928] text-[#D9A928] hover:bg-[#D9A928]/15 active:bg-[#D9A928]/25",
    };

    return (
      <button
        ref={ref}
        className={`tap inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer ${iconVariants[variant]} ${iconSizes[size]} ${className}`}
        {...props}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  },
);

TplIconButton.displayName = "TplIconButton";

export interface TplLinkButtonProps extends LinkProps {
  variant?: TplButtonVariant;
  size?: TplButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function TplLinkButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className = "",
  ...props
}: TplLinkButtonProps) {
  return (
    <Link
      className={`tap inline-flex items-center justify-center uppercase tracking-wider transition-all duration-150 select-none ${
        fullWidth ? "w-full" : ""
      } ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </Link>
  );
}
