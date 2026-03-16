import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Map, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { testingMapRepository } from "@/lib/repository";
import { cn } from "@/lib/utils";
import type { TestingMapListItem } from "@/lib/types";
import { MarkdownImport } from "./modals/MarkdownImport";
import type { Node, Edge } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";

interface MapSidebarProps {
  userId: string;
  activeMapId: string | null;
  onSelectMap: (mapId: string) => void;
}

export function MapSidebar({ userId, activeMapId, onSelectMap }: MapSidebarProps) {
  const [maps, setMaps] = useState<TestingMapListItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const loadMaps = useCallback(async () => {
    try {
      const list = await testingMapRepository.listMaps(userId);
      setMaps(list);

      // Auto-select the first map if none is active
      if (!activeMapId && list.length > 0) {
        onSelectMap(list[0].id);
      }
    } catch {
      // Failed to load maps
    }
  }, [userId, activeMapId, onSelectMap]);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  const handleCreate = async () => {
    try {
      const newId = await testingMapRepository.createMap(userId, "Untitled Map");
      await loadMaps();
      onSelectMap(newId);
    } catch {
      // Failed to create map
    }
  };

  const handleImport = useCallback(
    async (nodes: Node<ScenarioData>[], edges: Edge[]) => {
      try {
        const newId = await testingMapRepository.createMapWithData(
          userId,
          "Imported Map",
          nodes as Node[],
          edges
        );
        await loadMaps();
        onSelectMap(newId);
        setShowImport(false);
      } catch (err) {
        console.error("Failed to import map:", err);
      }
    },
    [userId, loadMaps, onSelectMap]
  );

  const handleDelete = async (mapId: string) => {
    try {
      await testingMapRepository.deleteMap(mapId);
      setDeletingId(null);
      const updatedMaps = maps.filter((m) => m.id !== mapId);
      setMaps(updatedMaps);

      // If we deleted the active map, switch to the first remaining one
      if (activeMapId === mapId) {
        if (updatedMaps.length > 0) {
          onSelectMap(updatedMaps[0].id);
        } else {
          onSelectMap(""); // Clear selection
        }
      }
    } catch {
      // Failed to delete map
    }
  };

  const startRename = (map: TestingMapListItem) => {
    setRenamingId(map.id);
    setRenameValue(map.name);
    setTimeout(() => renameInputRef.current?.focus(), 0);
  };

  const confirmRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await testingMapRepository.renameMap(renamingId, renameValue.trim());
      setMaps((prev) =>
        prev.map((m) => (m.id === renamingId ? { ...m, name: renameValue.trim() } : m))
      );
    } catch {
      // Failed to rename
    }
    setRenamingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (collapsed) {
    return (
      <div className="w-10 border-r border-border flex flex-col items-center py-4 glass">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 border-r border-border flex flex-col glass overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-bold tracking-tight">My Maps</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setShowImport(true)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Import map from markdown"
              title="Import from Markdown"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCreate}
              className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label="Create new map"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      {/* Map list */}
      <div className="flex-1 overflow-y-auto py-2">
        {maps.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-xs">
            <Map className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No maps yet</p>
            <button
              onClick={handleCreate}
              className="mt-2 text-primary hover:underline text-xs font-medium"
            >
              Create your first map
            </button>
          </div>
        ) : (
          maps.map((map) => (
            <div
              key={map.id}
              className={cn(
                "group px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all",
                activeMapId === map.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary/50 border border-transparent"
              )}
              onClick={() => {
                if (renamingId !== map.id) onSelectMap(map.id);
              }}
            >
              {renamingId === map.id ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onBlur={confirmRename}
                    className="flex-1 bg-secondary/50 border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmRename();
                    }}
                    className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{map.name}</span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(map);
                        }}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={`Rename ${map.name}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {deletingId === map.id ? (
                        <div className="flex gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(map.id);
                            }}
                            className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            aria-label="Confirm delete"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
                            aria-label="Cancel delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(map.id);
                          }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Delete ${map.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDate(map.updated_at)}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>

      {showImport && (
        <MarkdownImport
          onImport={(nodes, edges) => handleImport(nodes, edges)}
          onClose={() => setShowImport(false)}
        />
      )}
    </>
  );
}
