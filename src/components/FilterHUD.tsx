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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-2xl p-2 border border-border/50 shadow-2xl z-[100] flex items-center gap-2 max-w-[95vw] overflow-x-auto">
      <div className="flex bg-secondary/50 rounded-xl p-1 gap-1 border border-border/20 shrink-0">
        <button
          onClick={() => setViewMode("diagram")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            viewMode === "diagram"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Diagram
        </button>
        <button
          onClick={() => setViewMode("mindmap")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            viewMode === "mindmap"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Network className="w-3.5 h-3.5" />
          Mind Map
        </button>
      </div>

      <div className="h-6 w-px bg-border mx-1 shrink-0" />

      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border whitespace-nowrap",
              activeFilters.includes(f.id)
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
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
