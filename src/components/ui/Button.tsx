import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "neon";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "border border-amber-200/20 bg-[linear-gradient(135deg,rgba(245,201,118,0.94),rgba(210,154,57,0.96))] text-stone-950 shadow-[0_20px_45px_rgba(210,154,57,0.3)] hover:scale-[1.015] hover:shadow-[0_24px_55px_rgba(210,154,57,0.4)]",
      secondary:
        "border border-white/10 bg-white/[0.06] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-white/[0.09] hover:border-white/15",
      outline:
        "border border-white/12 bg-slate-950/45 text-stone-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-200/25 hover:bg-amber-300/[0.06]",
      ghost:
        "bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white",
      neon:
        "border border-amber-300/35 bg-amber-300/[0.07] text-amber-100 shadow-[0_0_24px_rgba(245,201,118,0.12)] hover:bg-amber-300/[0.12] hover:border-amber-200/55",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs",
      md: "h-11 px-4.5 py-2 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-semibold tracking-[-0.02em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
