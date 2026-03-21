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
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px] text-amber-500/60">
          <span>Onboarding & Beta Info</span>
        </div>
        <h4 className="text-sm font-bold text-amber-500 mt-1">
          Zero-Friction, Local-First
        </h4>
      </div>
      
      <p className="max-w-[340px] text-center text-xs leading-relaxed font-medium text-amber-500/80">
        Testing Maps is in beta and designed for privacy. Your work is saved <span className="text-amber-500 font-bold underline underline-offset-2">locally in your browser</span>. 
        To keep your maps safe, we recommend exporting them as markdown files regularly.
        <span className="block mt-2 opacity-60 italic">Any feedback is welcome!</span>
      </p>
    </div>
  );
}
