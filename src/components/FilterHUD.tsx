"use client";

import React from "react";
import { useUI, DisplayFilter } from "@/context/UIContext";
import { ClipboardList, Info, Code2, LayoutGrid, Network } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterHUD() {
  const { activeFilters, toggleFilter, viewMode, setViewMode } = useUI();

  const filters: { id: DisplayFilter; label: string; icon: React.ReactNode }[] = [
    { id: "expectedResults", label: "Expectations", icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: "instructions", label: "Instructions", icon: <Info className="w-3.5 h-3.5" /> },
    { id: "testType", label: "Test Types", icon: <Network className="w-3.5 h-3.5" /> },
    { id: "codeReference", label: "Code Links", icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-background/95 glass rounded-[2rem] p-2 border border-white/5 island-shadow z-[100] flex items-center gap-2 max-w-[95vw] overflow-x-auto">
      <div className="flex bg-white/5 rounded-[1.25rem] p-1 gap-1 border border-white/5 shrink-0">
        <button
          onClick={() => setViewMode("diagram")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
            viewMode === "diagram"
              ? "bg-white text-black shadow-lg"
              : "text-foreground/50 hover:text-foreground"
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Diagram
        </button>
        <button
          onClick={() => setViewMode("mindmap")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
            viewMode === "mindmap"
              ? "bg-white text-black shadow-lg"
              : "text-foreground/50 hover:text-foreground"
          )}
        >
          <Network className="w-3.5 h-3.5" />
          Mind Map
        </button>
      </div>

      <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />

      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
              activeFilters.includes(f.id)
                ? "bg-white border-white text-black shadow-lg"
                : "bg-transparent border-transparent text-foreground/50 hover:bg-white/5 hover:text-foreground"
            )}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
