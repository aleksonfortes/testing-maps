"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useUI } from "@/context/UIContext";
import { getLayoutedElements } from "@/lib/layout";
import { ScenarioNode } from "./nodes/ScenarioNode";
import { ScenarioModal } from "./modals/ScenarioModal";
import { MarkdownExport } from "./modals/MarkdownExport";
import { MarkdownImport } from "./modals/MarkdownImport";
import { Type, FileText, Upload, LogOut, Cloud, CloudOff, Loader2, Undo2, Redo2 } from "lucide-react";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import {
  LAYOUT_DELAY,
  SAVE_DEBOUNCE_MS,
  LOAD_SETTLE_MS,
  FIT_VIEW_DELAY_MS,
  FIT_VIEW_DURATION_MS,
  REPARENT_DISTANCE_THRESHOLD,
  NODE_WIDTH,
  NODE_MIN_HEIGHT,
} from "@/lib/constants";
import { testingMapRepository } from "@/lib/repository";
import { AnimatePresence } from "framer-motion";
import type { ScenarioData } from "@/lib/types";

// ---------------------------------------------------------------------------
// Context for node actions (avoids injecting callbacks into node data)
// ---------------------------------------------------------------------------
interface MapActions {
  deleteNode: (id: string) => void;
}

const MapActionsContext = createContext<React.RefObject<MapActions> | null>(null);

export function useMapActions() {
  const ref = useContext(MapActionsContext);
  if (!ref) throw new Error("useMapActions must be used within MapCanvas");
  return ref;
}

// ---------------------------------------------------------------------------
// Node type registration (stable reference)
// ---------------------------------------------------------------------------
const nodeTypes = { scenario: ScenarioNode };


// ---------------------------------------------------------------------------
// Public wrapper
// ---------------------------------------------------------------------------
interface MapCanvasProps {
  mapId: string;
  userId: string;
  onSignOut: () => void;
}

export function MapCanvas({ mapId, userId, onSignOut }: MapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MapCanvasInner key={mapId} mapId={mapId} userId={userId} onSignOut={onSignOut} />
    </ReactFlowProvider>
  );
}

// ---------------------------------------------------------------------------
// Save status type
// ---------------------------------------------------------------------------
type SaveStatus = "idle" | "saving" | "saved" | "error";

// ---------------------------------------------------------------------------
// Inner component
// ---------------------------------------------------------------------------
function MapCanvasInner({ mapId, userId, onSignOut }: MapCanvasProps) {
  const { viewMode, editingNodeId, setEditingNodeId, activeFilters } = useUI();
  const { fitView, getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Load/save state
  const [loadedFromCloud, setLoadedFromCloud] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const hasPendingSaveRef = useRef(false);
  const lastLayoutMode = useRef<string>("");

  // Ref-based actions context (stable reference, never triggers re-renders)
  const actionsRef = useRef<MapActions>({ deleteNode: () => {} });

  // Undo/Redo
  const { pushSnapshot, undo, redo, finishRestore, canUndo, canRedo } = useUndoRedo();

  // -----------------------------------------------------------------------
  // Load from Supabase by mapId
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const data = await testingMapRepository.loadMap(mapId);
        if (cancelled) return;

        if (data) {
          setNodes(data.nodes as Node[]);
          setEdges(data.edges as Edge[]);
          pushSnapshot(data.nodes as Node[], data.edges as Edge[]);
        } else {
          // Push empty baseline so undo has a "before" state
          pushSnapshot([], []);
        }

        setTimeout(() => {
          if (!cancelled) setLoadedFromCloud(true);
        }, LOAD_SETTLE_MS);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Cloud load error:", err);
        }
        // Do NOT enable saves on load failure — prevents overwriting cloud data
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [mapId, setNodes, setEdges]);

  // -----------------------------------------------------------------------
  // Persist to Supabase (debounced)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!loadedFromCloud) return;

    hasPendingSaveRef.current = true;

    const saveData = async () => {
      setSaveStatus("saving");
      try {
        await testingMapRepository.saveMap(mapId, nodes, edges);
        setSaveStatus("saved");
        hasPendingSaveRef.current = false;
      } catch {
        setSaveStatus("error");
      }
    };

    const timer = setTimeout(saveData, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nodes, edges, loadedFromCloud, mapId]);

  // -----------------------------------------------------------------------
  // Warn on unload if there are pending changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingSaveRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Flush save on tab hide
  useEffect(() => {
    if (!loadedFromCloud) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && hasPendingSaveRef.current) {
        testingMapRepository.saveMap(mapId, getNodes(), getEdges()).catch(() => {});
        hasPendingSaveRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mapId, loadedFromCloud, getNodes, getEdges]);

  // -----------------------------------------------------------------------
  // Node CRUD
  // -----------------------------------------------------------------------
  const onDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const updated = nds.filter((n) => n.id !== id);
        setEdges((eds) => {
          const updatedEdges = eds.filter((e) => e.source !== id && e.target !== id);
          pushSnapshot(updated, updatedEdges);
          return updatedEdges;
        });
        return updated;
      });
    },
    [setNodes, setEdges, pushSnapshot]
  );

  // Keep the actions ref current
  useEffect(() => {
    actionsRef.current.deleteNode = onDeleteNode;
  }, [onDeleteNode]);

  const onUpdateNode = useCallback(
    (id: string, newData: Partial<ScenarioData>) => {
      setNodes((nds) => {
        const updated = nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n));
        pushSnapshot(updated, getEdges());
        return updated;
      });
    },
    [setNodes, pushSnapshot, getEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `e-${crypto.randomUUID()}`,
        animated: true,
        sourceHandle: "source",
        targetHandle: "target",
        type: "smoothstep",
      };
      setEdges((eds) => {
        const updated = addEdge(edge, eds);
        pushSnapshot(getNodes(), updated);
        return updated;
      });
    },
    [setEdges, pushSnapshot, getNodes]
  );

  // -----------------------------------------------------------------------
  // Drag-to-reparent: drop a node near another to change its parent
  // -----------------------------------------------------------------------
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  /** Collect all descendant node IDs reachable from `nodeId` */
  const getDescendants = useCallback(
    (nodeId: string, edgeList: Edge[]): Set<string> => {
      const descendants = new Set<string>();
      const queue = [nodeId];
      while (queue.length > 0) {
        const current = queue.pop()!;
        for (const e of edgeList) {
          if (e.source === current && !descendants.has(e.target)) {
            descendants.add(e.target);
            queue.push(e.target);
          }
        }
      }
      return descendants;
    },
    []
  );

  /** Find the nearest non-descendant node within threshold */
  const findDropTarget = useCallback(
    (draggedNode: Node, allNodes: Node[], allEdges: Edge[]): Node | null => {
      const descendants = getDescendants(draggedNode.id, allEdges);
      const cx = draggedNode.position.x + NODE_WIDTH / 2;
      const cy = draggedNode.position.y + NODE_MIN_HEIGHT / 2;

      let closest: Node | null = null;
      let closestDist = REPARENT_DISTANCE_THRESHOLD;

      for (const n of allNodes) {
        if (n.id === draggedNode.id) continue;
        if (descendants.has(n.id)) continue; // can't reparent under own descendant

        const nx = n.position.x + NODE_WIDTH / 2;
        const ny = n.position.y + NODE_MIN_HEIGHT / 2;
        const dist = Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2);

        if (dist < closestDist) {
          closestDist = dist;
          closest = n;
        }
      }
      return closest;
    },
    [getDescendants]
  );

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const allNodes = getNodes();
      const allEdges = getEdges();
      const target = findDropTarget(draggedNode, allNodes, allEdges);
      const newTargetId = target?.id ?? null;

      if (newTargetId !== dropTargetId) {
        setDropTargetId(newTargetId);
        // Update node data to show/hide drop target highlight
        setNodes((nds) =>
          nds.map((n) => {
            const shouldHighlight = n.id === newTargetId;
            if (shouldHighlight !== !!n.data.isDropTarget) {
              return { ...n, data: { ...n.data, isDropTarget: shouldHighlight } };
            }
            return n;
          })
        );
      }
    },
    [getNodes, getEdges, findDropTarget, dropTargetId, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      setDropTargetId(null);

      // Clear all drop target highlights
      setNodes((nds) =>
        nds.map((n) =>
          n.data.isDropTarget ? { ...n, data: { ...n.data, isDropTarget: false } } : n
        )
      );

      const allNodes = getNodes();
      const allEdges = getEdges();
      const target = findDropTarget(draggedNode, allNodes, allEdges);

      if (!target) {
        // Even if no target, node moved. Push snapshot.
        pushSnapshot(allNodes, allEdges);
        return;
      }

      // Check if it's already parented under target
      const existingParentEdge = allEdges.find(
        (e) => e.target === draggedNode.id && e.source === target.id
      );
      if (existingParentEdge) {
        // Just a position change within same parent
        pushSnapshot(allNodes, allEdges);
        return;
      }

      // Remove old parent edge(s) for the dragged node
      const newEdges = allEdges.filter((e) => e.target !== draggedNode.id);

      // Add new parent edge
      const newEdge: Edge = {
        id: `e-${crypto.randomUUID()}`,
        source: target.id,
        target: draggedNode.id,
        sourceHandle: "source",
        targetHandle: "target",
        animated: true,
        type: "smoothstep",
      };
      newEdges.push(newEdge);

      // Re-layout
      const direction = viewMode === "mindmap" ? "LR" : "TB";
      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
        allNodes,
        newEdges,
        direction
      );
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

      setNodes(lNodes);
      setEdges(styledEdges);
      pushSnapshot(lNodes, styledEdges);

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, findDropTarget, viewMode, setNodes, setEdges, pushSnapshot, fitView]
  );

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------
  const onLayout = useCallback(
    (direction: string) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
        currentNodes,
        currentEdges,
        direction
      );

      const styledEdges = lEdges.map((e) => ({
        ...e,
        type: "smoothstep",
        animated: true,
      }));

      setNodes(lNodes);
      setEdges(styledEdges);

      requestAnimationFrame(() => {
        setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
      });
    },
    [getNodes, getEdges, setNodes, setEdges, fitView]
  );

  const addNode = useCallback(
    (parentId?: string) => {
      const id = crypto.randomUUID();
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      const selectedNode = parentId
        ? currentNodes.find((n) => n.id === parentId)
        : currentNodes.find((n) => n.selected) || currentNodes[currentNodes.length - 1];

      const childrenCount = currentEdges.filter((e) => e.source === selectedNode?.id).length;

      const newNode: Node<ScenarioData> = {
        id,
        type: "scenario",
        selected: true,
        data: {
          label: "New Scenario",
          status: "untested",
          testType: "manual",
          instructions: "",
          expectedResults: "",
          codeRef: "",
        },
        position: selectedNode
          ? {
              x: selectedNode.position.x + 380,
              y: selectedNode.position.y + (childrenCount - 1) * 150,
            }
          : { x: 100, y: 100 },
      };

      const newEdge: Edge | null = selectedNode
        ? {
            id: `e-${crypto.randomUUID()}`,
            source: selectedNode.id,
            target: id,
            sourceHandle: "source",
            targetHandle: "target",
            animated: true,
            type: "smoothstep",
          }
        : null;

      const updatedNodes: Node[] = [...currentNodes.map((n) => ({ ...n, selected: false })), newNode];
      const updatedEdges: Edge[] = newEdge ? [...currentEdges, newEdge] : currentEdges;

      // Layout once, set state once
      const direction = viewMode === "mindmap" ? "LR" : "TB";
      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
        updatedNodes,
        updatedEdges,
        direction
      );
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

      setNodes(lNodes);
      setEdges(styledEdges);
      pushSnapshot(lNodes, styledEdges);

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, setNodes, setEdges, viewMode, fitView, pushSnapshot]
  );

  // -----------------------------------------------------------------------
  // View mode layout
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (viewMode === "mindmap" && lastLayoutMode.current !== "mindmap") {
      onLayout("LR");
      lastLayoutMode.current = "mindmap";
    } else if (viewMode === "diagram" && lastLayoutMode.current !== "diagram") {
      onLayout("TB");
      lastLayoutMode.current = "diagram";
    }
  }, [viewMode, onLayout]);

  // Filter change re-layout
  const lastFiltersRef = useRef<string>("");

  useEffect(() => {
    if (!loadedFromCloud) return;
    const filtersKey = [...activeFilters].sort().join(",");
    if (filtersKey !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersKey;
      const direction = viewMode === "mindmap" ? "LR" : "TB";
      setTimeout(() => onLayout(direction), LAYOUT_DELAY);
    }
  }, [activeFilters, onLayout, viewMode, loadedFromCloud]);

  // -----------------------------------------------------------------------
  // Markdown import handler
  // -----------------------------------------------------------------------
  const handleImport = useCallback(
    (importedNodes: Node<ScenarioData>[], importedEdges: Edge[], mode: "replace" | "create") => {
      const direction = viewMode === "mindmap" ? "LR" : "TB";

      if (mode === "replace") {
        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(importedNodes, importedEdges, direction);
        const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));
        setNodes(lNodes);
        setEdges(styledEdges);
        pushSnapshot(lNodes, styledEdges);
      } else {
        // Merge: combine with current nodes/edges
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        const mergedNodes = [...currentNodes, ...importedNodes];
        const mergedEdges = [...currentEdges, ...importedEdges];
        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(mergedNodes, mergedEdges, direction);
        const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));
        setNodes(lNodes);
        setEdges(styledEdges);
        pushSnapshot(lNodes, styledEdges);
      }

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
    },
    [viewMode, getNodes, getEdges, setNodes, setEdges, pushSnapshot, fitView]
  );

  // -----------------------------------------------------------------------
  // Undo/Redo actions
  // -----------------------------------------------------------------------
  const handleUndo = useCallback(() => {
    const snapshot = undo();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      // Allow future snapshots after React processes the state updates
      requestAnimationFrame(() => finishRestore());
    }
  }, [undo, setNodes, setEdges, finishRestore]);

  const handleRedo = useCallback(() => {
    const snapshot = redo();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      requestAnimationFrame(() => finishRestore());
    }
  }, [redo, setNodes, setEdges, finishRestore]);

  // -----------------------------------------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) return;

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      const isMod = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl+Z
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
      if ((isMod && e.key === "z" && e.shiftKey) || (isMod && e.key === "y")) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Tab: only when canvas is focused, not in form fields
      if (e.key === "Tab" && !isInput) {
        const isCanvasFocused = target.closest(".react-flow") !== null;
        if (isCanvasFocused) {
          e.preventDefault();
          const selected = getNodes().find((n) => n.selected);
          addNode(selected?.id);
        }
      }

      // Delete/Backspace: batch delete, skip form fields
      if ((e.key === "Backspace" || e.key === "Delete") && !isInput) {
        const selectedNodes = getNodes().filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          const ids = new Set(selectedNodes.map((n) => n.id));
          setNodes((nds) => {
            const updated = nds.filter((n) => !ids.has(n.id));
            setEdges((eds) => {
              const updatedEdges = eds.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target));
              pushSnapshot(updated, updatedEdges);
              return updatedEdges;
            });
            return updated;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingNodeId, addNode, getNodes, setNodes, setEdges, handleUndo, handleRedo, pushSnapshot]);

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------
  const editingNode = nodes.find((n) => n.id === editingNodeId);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <MapActionsContext.Provider value={actionsRef}>
      <div className="h-full w-full relative group">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeDoubleClick={(_, node) => setEditingNodeId(node.id)}
          fitView
          className="bg-background"
        >
          <Background
            gap={32}
            color="currentColor"
            className="text-muted-foreground/10"
            variant={BackgroundVariant.Dots}
          />
          <Controls className="!bg-card !border-border !rounded-xl !shadow-sm overflow-hidden" />
          <MiniMap
            className="!bg-card !border-border !rounded-2xl !shadow-lg"
            maskColor="var(--color-muted-foreground, rgba(0,0,0,0.05))"
            position="bottom-right"
          />

          <Panel
            position="top-right"
            className="flex flex-col gap-2 mt-16 mr-4 pointer-events-auto"
          >
            <button
              onClick={() => addNode()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              <div className="bg-primary-foreground/20 rounded-lg p-1">
                <Type className="w-4 h-4" />
              </div>
              Add Scenario
              <span className="opacity-50 text-[10px] bg-primary-foreground/10 px-1.5 py-0.5 rounded ml-1">
                TAB
              </span>
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex items-center gap-1.5 bg-card text-foreground border border-border px-4 py-2.5 rounded-2xl text-sm font-bold shadow-xl hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                aria-label="Undo"
              >
                <Undo2 className="w-4 h-4" />
                <span className="opacity-50 text-[10px]">Z</span>
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="flex items-center gap-1.5 bg-card text-foreground border border-border px-4 py-2.5 rounded-2xl text-sm font-bold shadow-xl hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                aria-label="Redo"
              >
                <Redo2 className="w-4 h-4" />
                <span className="opacity-50 text-[10px]">Y</span>
              </button>
            </div>
            <button
              onClick={() => setShowMarkdown(true)}
              className="flex items-center gap-2 bg-card text-foreground border border-border px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:bg-secondary transition-colors"
            >
              <div className="p-1 bg-primary/10 rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              Export Markdown
            </button>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 bg-card text-destructive border border-border px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:bg-destructive/10 transition-colors"
            >
              <div className="p-1 bg-destructive/10 rounded-lg">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              Sign Out
            </button>

            {/* Save status indicator */}
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Cloud className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <CloudOff className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">Save failed</span>
                </>
              )}
            </div>
          </Panel>
        </ReactFlow>

        <AnimatePresence>
          {editingNode && (
            <ScenarioModal
              key={editingNode.id}
              nodeId={editingNode.id}
              initialData={editingNode.data as ScenarioData}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMarkdown && (
            <MarkdownExport nodes={nodes} edges={edges} onClose={() => setShowMarkdown(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showImport && (
            <MarkdownImport onImport={handleImport} onClose={() => setShowImport(false)} />
          )}
        </AnimatePresence>
      </div>
    </MapActionsContext.Provider>
  );
}
