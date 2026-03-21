"use client";

import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className }: BetaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1 py-0 rounded text-[8px] font-black uppercase bg-primary text-primary-foreground border border-white/20 shadow-lg animate-in fade-in zoom-in-95 duration-500 whitespace-nowrap",
        className
      )}
    >
      Beta
    </span>
  );
}

export function OnboardingGuidance({ className }: BetaBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 items-center justify-center p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 animate-in fade-in slide-in-from-top-2 duration-1000",
        className
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <h4 className="text-sm font-black uppercase tracking-widest text-amber-500">
          Beta Version
        </h4>
      </div>
      
      <p className="max-w-[360px] text-center text-xs leading-relaxed font-medium text-amber-500/80">
        Testing Maps is a free, <span className="text-amber-500 font-bold">open-source</span> tool with no central database. 
        Your work is saved locally in your browser for privacy. 
        While we provide local persistence, please <strong>export your maps</strong> as files to ensure your data is always safe.
        <span className="block mt-2 text-amber-500/60 font-semibold italic">Any feedback is welcome!</span>
      </p>
    </div>
  );
}
