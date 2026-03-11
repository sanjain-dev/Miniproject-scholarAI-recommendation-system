import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:border-amber-200/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all backdrop-blur-xl",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
