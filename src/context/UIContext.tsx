"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type DisplayFilter = "expectedResults" | "instructions" | "testType" | "codeReference";

interface UIContextType {
  activeFilters: DisplayFilter[];
  toggleFilter: (filter: DisplayFilter) => void;
  viewMode: "diagram" | "mindmap";
  setViewMode: (mode: "diagram" | "mindmap") => void;
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<DisplayFilter[]>(["testType"]);
  const [viewMode, setViewMode] = useState<"diagram" | "mindmap">("diagram");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const toggleFilter = useCallback((filter: DisplayFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }, []);

  return (
    <UIContext.Provider
      value={{
        activeFilters,
        toggleFilter,
        viewMode,
        setViewMode,
        editingNodeId,
        setEditingNodeId,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
