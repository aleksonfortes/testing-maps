"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type DisplayFilter = "expectedResults" | "instructions" | "testType" | "codeReference";

interface UIContextType {
  activeFilters: DisplayFilter[];
  toggleFilter: (filter: DisplayFilter) => void;
  viewMode: "mindmap";
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  activeTab: "canvas" | "details";
  setActiveTab: (tab: "canvas" | "details") => void;
  isHeroHidden: boolean;
  setIsHeroHidden: (hidden: boolean) => void;
  openDropdown: "map" | "user" | null;
  setOpenDropdown: (id: "map" | "user" | null) => void;
  showImport: boolean;
  setShowImport: (show: boolean) => void;
  showNewMapModal: boolean;
  setShowNewMapModal: (show: boolean) => void;
  isMarkdownView: boolean;
  setIsMarkdownView: (active: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<DisplayFilter[]>(["testType"]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tm:activeFilters");
      if (stored) {
        setActiveFilters(JSON.parse(stored) as DisplayFilter[]);
      }
    } catch { /* ignore */ }
    setIsHydrated(true);
  }, []);
  const viewMode = "mindmap" as const;
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"canvas" | "details">("canvas");
  const [isHeroHidden, setIsHeroHidden] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"map" | "user" | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showNewMapModal, setShowNewMapModal] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);

  const toggleFilter = useCallback((filter: DisplayFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }, []);

  // Persist filter preferences
  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem("tm:activeFilters", JSON.stringify(activeFilters)); }
    catch { /* localStorage unavailable */ }
  }, [activeFilters, isHydrated]);

  return (
    <UIContext.Provider
      value={{
        activeFilters,
        toggleFilter,
        viewMode,
        editingNodeId,
        setEditingNodeId,
        activeTab,
        setActiveTab,
        isHeroHidden,
        setIsHeroHidden,
        openDropdown,
        setOpenDropdown,
        showImport,
        setShowImport,
        showNewMapModal,
        setShowNewMapModal,
        isMarkdownView,
        setIsMarkdownView,
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
