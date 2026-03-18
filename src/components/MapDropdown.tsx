"use client";

import { useState, useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  ChevronDown,
  Plus,
  Upload,
  Search,
  Check,
  Loader2,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMaps } from "@/hooks/useMaps";
import { useUI } from "@/context/UIContext";
import { MarkdownImport } from "./modals/MarkdownImport";
import { NewMapModal } from "./modals/NewMapModal";
import { toast } from "sonner";
import type { Node } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";

interface MapDropdownProps {
  userId: string;
  activeMapId: string | null;
  onSelectMap: (mapId: string) => void;
}

export function MapDropdown({ userId, activeMapId, onSelectMap }: MapDropdownProps) {
  const { maps, loading, isImporting, isDuplicating, isRenaming, deleteMap, duplicateMap, renameMap, importMap, saveMapData } = useMaps(userId);
  const { openDropdown, setOpenDropdown, setIsHeroHidden, showImport, setShowImport, showNewMapModal, setShowNewMapModal } = useUI();
  const isOpen = openDropdown === "map";

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmDeleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeMap = maps.find((m) => m.id === activeMapId);

  // Auto-select the most recently used map when maps finish loading
  // and no map is currently active. Maps are sorted by updated_at DESC
  // from the repository, so maps[0] is the most recent.
  useEffect(() => {
    if (!loading && maps.length > 0 && !activeMapId) {
      onSelectMap(maps[0].id);
    }
  }, [loading, maps, activeMapId, onSelectMap]);

  // Clean up confirm-delete timer on unmount
  useEffect(() => {
    return () => {
      if (confirmDeleteTimer.current) clearTimeout(confirmDeleteTimer.current);
    };
  }, []);

  const filteredMaps = maps.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    const map = maps.find((m) => m.id === mapId);
    if (map) {
      setEditName(map.name);
      setIsEditing(true);
      setOpenDropdown(null);
      // Temporarily select this map so rename targets the right one
      if (mapId !== activeMapId) onSelectMap(mapId);
    }
  };

  const handleRenameSubmit = async () => {
    if (!activeMapId || !editName.trim() || editName === activeMap?.name || isRenaming) {
      setIsEditing(false);
      return;
    }

    setIsEditing(false);
    const promise = renameMap(activeMapId, editName.trim());
    toast.promise(promise, {
      loading: "Renaming...",
      success: "Map renamed successfully",
      error: "Failed to rename map",
    });
  };

  const handleCreate = () => {
    setShowNewMapModal(true);
    setIsHeroHidden(true);
    setOpenDropdown(null);
  };

  const handleCreateWithName = async (name: string): Promise<string | null> => {
    // Build a root node with the map name as label
    const rootNode: Node<ScenarioData> = {
      id: "root",
      type: "scenario",
      position: { x: 0, y: 0 },
      data: {
        label: name,
        status: "untested",
        testType: "manual",
      },
    };

    const id = await importMap(name, [rootNode], []);
    if (id) {
      onSelectMap(id);
      setShowNewMapModal(false);
      setIsHeroHidden(false);
    }
    return id;
  };

  const handleNewMapSubmit = async (name: string) => {
    const promise = handleCreateWithName(name);
    toast.promise(promise, {
      loading: "Creating map...",
      success: (id) => {
        if (id) return `"${name}" created`;
        throw new Error("Failed to create map");
      },
      error: "Failed to create map",
    });
    return await promise;
  };

  const handleCloseNewMapModal = () => {
    setShowNewMapModal(false);
    setIsHeroHidden(false);
  };

  const handleDeleteMap = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === mapId) {
      if (confirmDeleteTimer.current) clearTimeout(confirmDeleteTimer.current);
      setConfirmDeleteId(null);
      const promise = deleteMap(mapId);
      toast.promise(promise, {
        loading: "Deleting map...",
        success: () => {
          if (activeMapId === mapId) onSelectMap("");
          return "Map deleted";
        },
        error: "Failed to delete map",
      });
    } else {
      setConfirmDeleteId(mapId);
      if (confirmDeleteTimer.current) clearTimeout(confirmDeleteTimer.current);
      confirmDeleteTimer.current = setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    const promise = duplicateMap(mapId);
    toast.promise(promise, {
      loading: "Duplicating...",
      success: (id) => {
        if (id) {
          onSelectMap(id);
          setOpenDropdown(null);
          return "Map duplicated";
        }
        throw new Error("Failed to duplicate map");
      },
      error: "Failed to duplicate map",
    });
  };

  const handleOpenImport = () => {
    setShowImport(true);
    setIsHeroHidden(true);
    setOpenDropdown(null);
  };

  const handleCloseImport = () => {
    setShowImport(false);
    setIsHeroHidden(false);
  };

  return (
    <div className="relative">
      {isEditing ? (
        <div className="flex items-center h-8 bg-white/5 rounded-lg border border-white/10 px-2 animate-in fade-in zoom-in-95 duration-200">
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
        <Popover.Root
          open={isOpen}
          onOpenChange={(open) => {
            setOpenDropdown(open ? "map" : null);
            if (!open) setConfirmDeleteId(null);
          }}
        >
          <Popover.Trigger asChild>
            <button
              data-testid="map-selection-toggle"
              className={cn(
                "flex items-center gap-2 px-1.5 h-8 rounded-lg transition-all group/identity relative",
                isOpen ? "bg-white/5" : "hover:bg-white/5"
              )}
            >
              <span className="text-[13px] font-semibold text-foreground/90 transition-colors tracking-tight truncate max-w-[200px] select-none">
                {activeMap ? activeMap.name : "Select a Map"}
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-muted-foreground/30 transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
          </Popover.Trigger>

          <AnimatePresence>
            {isOpen && (
              <Popover.Portal forceMount>
                <Popover.Content
                  forceMount
                  asChild
                  align="start"
                  sideOffset={8}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-80 glass z-[100] overflow-hidden rounded-2xl island-shadow border border-white/5 shadow-2xl"
                  >
                    {/* Search */}
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                      <div className="relative group/search">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within/search:text-primary transition-all duration-300" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Find your map..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-foreground/90 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-64 overflow-y-auto p-1.5">
                      {loading && maps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin mb-2" />
                          <span className="text-[10px] font-medium uppercase tracking-widest">
                            Loading maps...
                          </span>
                        </div>
                      ) : filteredMaps.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-xs italic">
                          No maps found
                        </div>
                      ) : (
                        filteredMaps.map((map) => (
                          <div
                            key={map.id}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-0.5 group/item cursor-pointer",
                              activeMapId === map.id
                                ? "bg-white text-black font-bold"
                                : "hover:bg-white/5 text-foreground/70 hover:text-foreground"
                            )}
                            onClick={() => {
                              onSelectMap(map.id);
                              setOpenDropdown(null);
                            }}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all",
                                  activeMapId === map.id
                                    ? "bg-black"
                                    : "bg-white/20"
                                )}
                              />
                              <span className="text-sm font-medium truncate">
                                {map.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {activeMapId === map.id && (
                                <Check className="w-3.5 h-3.5 mr-1" />
                              )}
                              <button
                                onClick={(e) => startEditing(e, map.id)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all opacity-0 group-hover/item:opacity-100",
                                  activeMapId === map.id
                                    ? "hover:bg-black/10 text-black/50 hover:text-black"
                                    : "hover:bg-white/10 text-foreground/30 hover:text-foreground"
                                )}
                                title="Rename map"
                                data-testid="rename-map-button"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDuplicate(e, map.id)}
                                disabled={isDuplicating}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all opacity-0 group-hover/item:opacity-100",
                                  activeMapId === map.id
                                    ? "hover:bg-black/10 text-black/50 hover:text-black"
                                    : "hover:bg-white/10 text-foreground/30 hover:text-foreground"
                                )}
                                title="Duplicate map"
                                data-testid="duplicate-map-button"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteMap(e, map.id)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all",
                                  confirmDeleteId === map.id
                                    ? "bg-destructive text-destructive-foreground opacity-100"
                                    : cn(
                                        "opacity-0 group-hover/item:opacity-100",
                                        activeMapId === map.id
                                          ? "hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                                          : "hover:bg-destructive/10 text-destructive/50 hover:text-destructive"
                                      )
                                )}
                                title={confirmDeleteId === map.id ? "Click to confirm delete" : "Delete map"}
                                data-testid="delete-map-button"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-white/[0.02] border-t border-white/5 grid grid-cols-2 gap-3">
                      <button
                        onClick={handleCreate}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition-all active:scale-[0.98] group/btn"
                        data-testid="new-map-button"
                      >
                        <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                        New Map
                      </button>
                      <button
                        onClick={handleOpenImport}
                        disabled={isImporting}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 text-foreground/70 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 hover:text-foreground transition-all active:scale-[0.98] disabled:opacity-50"
                        data-testid="import-button"
                      >
                        {isImporting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Import
                      </button>
                    </div>
                  </motion.div>
                </Popover.Content>
              </Popover.Portal>
            )}
          </AnimatePresence>
        </Popover.Root>
      )}

      <AnimatePresence>
        {showNewMapModal && (
          <NewMapModal
            onCreateMap={handleNewMapSubmit}
            onClose={handleCloseNewMapModal}
          />
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

              const promise =
                mode === "create"
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
                    handleCloseImport();
                    return mode === "create" ? "New map created" : "Map data replaced";
                  }
                  throw new Error(mode === "create" ? "Import failed" : "Replace failed");
                },
                error: (err) => err.message || "Operation failed",
              });
            }}
            onClose={handleCloseImport}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
