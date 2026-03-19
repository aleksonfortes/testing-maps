"use client";

import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className }: BetaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in-95 duration-500",
        className
      )}
    >
      Beta
    </span>
  );
}

export function BetaWarning({ className }: BetaBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 items-center justify-center p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80 text-xs animate-in fade-in slide-in-from-top-1 duration-700",
        className
      )}
    >
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]">
        <span>Experimental Alpha</span>
      </div>
      <p className="max-w-[280px] text-center leading-relaxed font-medium">
        Testing Maps is currently in early development. While we strive for stability, your maps and data may be subject to changes or resets.
      </p>
    </div>
  );
}
