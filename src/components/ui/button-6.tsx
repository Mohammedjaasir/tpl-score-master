import * as React from "react";

export interface Button6Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  hoverText?: React.ReactNode;
}

export const Component = ({
  children = "Hover me",
  hoverText,
  className = "",
  ...props
}: Button6Props) => {
  const displayText = children;
  const displayHover = hoverText ?? children;

  return (
    <button
      className={`group relative inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-primary font-extrabold uppercase tracking-widest text-sm shadow-[0_8px_25px_rgba(235,70,55,0.45)] transition-transform active:scale-[0.98] ${className}`}
      {...props}
    >
      <div className="inline-flex h-14 w-full translate-y-0 items-center justify-center gap-2 px-6 bg-primary text-primary-foreground transition duration-500 group-hover:-translate-y-[150%]">
        {displayText}
      </div>
      <div className="absolute inline-flex h-14 w-full translate-y-[100%] items-center justify-center gap-2 text-white transition duration-500 group-hover:translate-y-0">
        <span className="absolute h-full w-full translate-y-full skew-y-12 scale-y-0 bg-primary/90 dark:bg-primary transition duration-500 group-hover:translate-y-0 group-hover:scale-150"></span>
        <span className="z-10 flex items-center justify-center gap-2">{displayHover}</span>
      </div>
    </button>
  );
};

export const Button6 = Component;
