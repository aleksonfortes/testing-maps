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
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-secondary/80 group",
          isOpen ? "bg-secondary" : "bg-transparent"
        )}
      >
        <div className="p-1 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Map className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-semibold tracking-tight truncate max-w-[200px]">
          {activeMap ? activeMap.name : "Select a Map"}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-72 bg-popover border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden glass"
          >
            {/* Search */}
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search maps..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
            <div className="p-1.5 bg-secondary/30 border-t border-border/50 grid grid-cols-2 gap-1.5">
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                data-testid="new-map-button"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                New Map
              </button>
              <button
                onClick={() => {
                  setShowImport(true);
                  setIsOpen(false);
                }}
                disabled={isImporting}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-card text-foreground border border-border rounded-xl text-xs font-bold hover:bg-secondary transition-colors disabled:opacity-50"
                data-testid="import-button"
              >
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
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
