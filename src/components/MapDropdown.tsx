"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  Map, 
  Plus, 
  Upload, 
  Search, 
  Check, 
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMaps } from "@/hooks/useMaps";
import { MarkdownImport } from "./modals/MarkdownImport";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";
import type { TestingMapListItem, ScenarioData } from "@/lib/types";

interface MapDropdownProps {
  userId: string;
  activeMapId: string | null;
  onSelectMap: (mapId: string) => void;
  onImportingChange?: (isImporting: boolean) => void;
}

import { useUI } from "@/context/UIContext";

export function MapDropdown({ userId, activeMapId, onSelectMap }: MapDropdownProps) {
  const { maps, loading, isCreating, isImporting, createMap, deleteMap, renameMap, importMap, saveMapData } = useMaps<ScenarioData>(userId);
  const { setIsHeroHidden } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeMap = maps.find((m) => m.id === activeMapId);

  useEffect(() => {
    setIsHeroHidden(showImport);
  }, [showImport, setIsHeroHidden]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as globalThis.Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMaps = maps.filter((m) => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMap) {
      setEditName(activeMap.name);
      setIsEditing(true);
      setIsOpen(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (!activeMapId || !editName.trim() || editName === activeMap?.name) {
      setIsEditing(false);
      return;
    }

    const promise = renameMap(activeMapId, editName.trim());
    toast.promise(promise, {
      loading: "Renaming...",
      success: "Map renamed successfully",
      error: "Failed to rename map",
    });
    setIsEditing(false);
  };

  const handleCreate = async () => {
    const promise = createMap("Untitled Map");
    toast.promise(promise, {
      loading: "Creating map...",
      success: (id) => {
        if (id) {
          onSelectMap(id);
          setIsOpen(false);
          return "Map created successfully";
        }
        throw new Error("Failed to create map");
      },
      error: "Failed to create map",
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {isEditing ? (
        <div className="flex items-center h-9 ml-2 bg-white/5 rounded-xl border border-primary/30 px-2 animate-in fade-in zoom-in-95 duration-200">
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="bg-transparent border-none outline-none text-sm font-semibold text-foreground w-[200px] py-1"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          data-testid="map-selection-toggle"
          className={cn(
            "flex items-center gap-2.5 pl-3 pr-2 h-9 rounded-xl transition-all group/identity relative",
            isOpen ? "bg-white/5" : "hover:bg-white/5"
          )}
        >
          <span className="text-sm font-semibold text-foreground/90 group-hover/identity:text-foreground transition-colors tracking-tight truncate max-w-[240px]">
            {activeMap ? activeMap.name : "Select a Map"}
          </span>
          
          <div className="flex items-center gap-1 opacity-40 group-hover/identity:opacity-100 transition-opacity">
            <div 
              onClick={startEditing}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Rename map"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover/identity:text-primary">
                <path d="M12 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.2786 2.87868 18.5544 2.93355 18.8118 3.04015C19.0692 3.14676 19.303 3.30301 19.5 3.5C19.697 3.69699 19.8532 3.93083 19.9598 4.18821C20.0665 4.44559 20.1213 4.72143 20.1213 5C20.1213 5.27857 20.0665 5.55441 19.9598 5.81179C19.8532 6.06917 19.697 6.30301 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-white/5 group-hover/identity:bg-white/10 transition-colors">
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-300", isOpen && "rotate-180")} />
            </div>
          </div>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] w-80 bg-[#121212]/90 backdrop-blur-3xl border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.4)] z-[100] overflow-hidden rounded-2xl"
          >
            {/* Search */}
            <div className="p-4 border-b border-white/5">
              <div className="relative group/search">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/search:text-primary transition-colors" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Find your map..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
              {loading && maps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mb-2" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Loading maps...</span>
                </div>
              ) : filteredMaps.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs italic">
                  No maps found
                </div>
              ) : (
                filteredMaps.map((map) => (
                  <button
                    key={map.id}
                    onClick={() => {
                      onSelectMap(map.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-0.5 group/item",
                      activeMapId === map.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-secondary text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activeMapId === map.id ? "bg-primary" : "bg-muted-foreground/30"
                      )} />
                      <span className="text-sm font-medium truncate">{map.name}</span>
                    </div>
                    {activeMapId === map.id && (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="p-2 bg-white/5 border-t border-white/5 grid grid-cols-2 gap-2">
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary transition-all disabled:opacity-50 group/btn"
                data-testid="new-map-button"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />}
                New Map
              </button>
              <button
                onClick={() => {
                  setShowImport(true);
                  setIsOpen(false);
                }}
                disabled={isImporting}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 text-foreground/80 border border-white/5 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-foreground transition-all disabled:opacity-50"
                data-testid="import-button"
              >
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImport && (
          <MarkdownImport
            onImport={async (nodes, edges, mode) => {
              if (mode === "replace" && !activeMapId) {
                toast.error("No map selected to replace. Creating a new one instead.");
                mode = "create";
              }

              const promise = mode === "create" 
                ? importMap("Imported Map", nodes, edges)
                : (async () => {
                    const success = await saveMapData(activeMapId!, nodes, edges);
                    if (success) return activeMapId;
                    throw new Error("Failed to replace map data");
                  })();

              toast.promise(promise, {
                loading: mode === "create" ? "Creating new map..." : "Replacing map data...",
                success: (id) => {
                  if (id) {
                    onSelectMap(id);
                    setShowImport(false);
                    return mode === "create" ? "New map created" : "Map data replaced";
                  }
                  throw new Error(mode === "create" ? "Import failed" : "Replace failed");
                },
                error: (err) => err.message || "Operation failed",
              });
            }}
            onClose={() => setShowImport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
