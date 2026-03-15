"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type DisplayFilter = "expectedResults" | "instructions" | "testType" | "codeReference";

interface UIContextType {
  activeFilters: Set<DisplayFilter>;
  toggleFilter: (filter: DisplayFilter) => void;
  viewMode: "diagram" | "mindmap";
  setViewMode: (mode: "diagram" | "mindmap") => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<Set<DisplayFilter>>(new Set(["testType"]));
  const [viewMode, setViewMode] = useState<"diagram" | "mindmap">("diagram");

  const toggleFilter = (filter: DisplayFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  return (
    <UIContext.Provider value={{ activeFilters, toggleFilter, viewMode, setViewMode }}>
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
