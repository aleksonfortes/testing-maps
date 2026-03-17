"use client";

import React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toggle from "@radix-ui/react-toggle";
import { useUI, DisplayFilter } from "@/context/UIContext";
import { ClipboardList, Info, Code2, LayoutGrid, Network } from "lucide-react";

export function FilterHUD() {
  const { activeFilters, toggleFilter, viewMode, setViewMode } = useUI();

  const filters: { id: DisplayFilter; label: string; icon: React.ReactNode }[] = [
    { id: "expectedResults", label: "Expectations", icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: "instructions", label: "Instructions", icon: <Info className="w-3.5 h-3.5" /> },
    { id: "testType", label: "Test Types", icon: <Network className="w-3.5 h-3.5" /> },
    { id: "codeReference", label: "Code Links", icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-[2rem] p-2 border border-white/5 island-shadow z-[100] flex items-center gap-2 max-w-[95vw] overflow-x-auto scrollbar-hide">
      <ToggleGroup.Root
        type="single"
        value={viewMode}
        onValueChange={(val) => {
          if (val) setViewMode(val as "diagram" | "mindmap");
        }}
        className="flex bg-white/5 rounded-[1.25rem] p-1 gap-1 border border-white/5 shrink-0"
        aria-label="View mode"
      >
        <ToggleGroup.Item
          value="diagram"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all data-[state=on]:bg-white data-[state=on]:text-black data-[state=on]:shadow-lg data-[state=off]:text-foreground/50 data-[state=off]:hover:text-foreground"
          aria-label="Diagram view"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Diagram</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="mindmap"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all data-[state=on]:bg-white data-[state=on]:text-black data-[state=on]:shadow-lg data-[state=off]:text-foreground/50 data-[state=off]:hover:text-foreground"
          aria-label="Mind map view"
        >
          <Network className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mind Map</span>
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />

      <div className="flex gap-1">
        {filters.map((f) => (
          <Toggle.Root
            key={f.id}
            pressed={activeFilters.includes(f.id)}
            onPressedChange={() => toggleFilter(f.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap data-[state=on]:bg-white data-[state=on]:border-white data-[state=on]:text-black data-[state=on]:shadow-lg data-[state=off]:bg-transparent data-[state=off]:border-transparent data-[state=off]:text-foreground/50 data-[state=off]:hover:bg-white/5 data-[state=off]:hover:text-foreground"
            aria-label={f.label}
          >
            {f.icon}
            <span className="hidden sm:inline">{f.label}</span>
          </Toggle.Root>
        ))}
      </div>
    </div>
  );
}
