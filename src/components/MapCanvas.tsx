"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  Node,
  Edge,
  BackgroundVariant,
  SelectionMode,
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
import { KeyboardShortcutsModal } from "./modals/KeyboardShortcutsModal";
import { CoverageSummary } from "./CoverageSummary";
import { FilterHUD } from "./FilterHUD";
import { BulkActionBar } from "./BulkActionBar";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { usePersistence } from "@/hooks/usePersistence";
import { useDragReparent } from "@/hooks/useDragReparent";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CanvasToolbar } from "./CanvasToolbar";
import { MarkdownEditor } from "./MarkdownEditor";
import { getHiddenNodeIds } from "@/lib/tree-utils";
import { generateMarkdown } from "@/lib/markdown-generator";
import { parseMarkdown } from "@/lib/markdown-parser";
import {
  LAYOUT_DELAY,
  FIT_VIEW_DELAY_MS,
  FIT_VIEW_DURATION_MS,
  NEW_NODE_HORIZONTAL_OFFSET,
  CHILD_VERTICAL_SPACING,
} from "@/lib/constants";
import { AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ScenarioData } from "@/lib/types";

// ---------------------------------------------------------------------------
// Context for node actions (avoids injecting callbacks into node data)
// ---------------------------------------------------------------------------
interface MapActions {
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  toggleCollapse: (id: string) => void;
  isCollapsed: (id: string) => boolean;
  getChildCount: (id: string) => number;
  getHiddenChildCount: (id: string) => number;
  updateNodeStatus: (id: string, status: "untested" | "verified" | "failed") => void;
  updateNodeLabel: (id: string, label: string) => void;
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
}

export function MapCanvas({ mapId }: MapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MapCanvasInner key={mapId} mapId={mapId} />
    </ReactFlowProvider>
  );
}

// ---------------------------------------------------------------------------
// Inner component
// ---------------------------------------------------------------------------
function MapCanvasInner({ mapId }: MapCanvasProps) {
  const { editingNodeId, setEditingNodeId, activeFilters, isMarkdownView, setIsMarkdownView } = useUI();
  const { fitView, getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [markdownSnapshot, setMarkdownSnapshot] = useState("");

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isCollapsedHydrated, setIsCollapsedHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`collapsed:${mapId}`);
      if (stored) {
        setCollapsed(new Set(JSON.parse(stored) as string[]));
      }
    } catch { /* ignore */ }
    setIsCollapsedHydrated(true);
  }, [mapId]);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const actionsRef = useRef<MapActions>({
    deleteNode: () => {},
    duplicateNode: () => {},
    toggleCollapse: () => {},
    isCollapsed: () => false,
    getChildCount: () => 0,
    getHiddenChildCount: () => 0,
    updateNodeStatus: () => {},
    updateNodeLabel: () => {},
  });

  // Undo/Redo
  const { pushSnapshot, undo, redo, finishRestore, canUndo, canRedo } = useUndoRedo();

  // Persistence (load/save)
  const { loadedFromStorage, loadError, retryLoad } = usePersistence({
    mapId,
    nodes,
    edges,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    pushSnapshot,
  });

  // Drag-to-reparent
  const { onNodeDrag, onNodeDragStop } = useDragReparent({
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    fitView,
    pushSnapshot,
  });

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

  const onDuplicateNode = useCallback(
    (id: string) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const sourceNode = currentNodes.find((n) => n.id === id);
      if (!sourceNode) return;

      const newId = crypto.randomUUID();
      const sourceData = sourceNode.data as ScenarioData;
      const newNode: Node<ScenarioData> = {
        id: newId,
        type: "scenario",
        selected: true,
        data: { ...sourceData, label: `${sourceData.label} (Copy)` },
        position: { x: sourceNode.position.x + 40, y: sourceNode.position.y + 40 },
      };

      // Find parent edge and create one for the duplicate too
      const parentEdge = currentEdges.find((e) => e.target === id);
      const newEdge: Edge | null = parentEdge
        ? { id: `e-${crypto.randomUUID()}`, source: parentEdge.source, target: newId, sourceHandle: "source", targetHandle: "target", animated: true, type: "smoothstep" }
        : null;

      const updatedNodes = [...currentNodes.map((n) => ({ ...n, selected: false })), newNode];
      const updatedEdges = newEdge ? [...currentEdges, newEdge] : currentEdges;

      setNodes(updatedNodes);
      setEdges(updatedEdges);
      pushSnapshot(updatedNodes, updatedEdges);
      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS, padding: 0.4 }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, setNodes, setEdges, pushSnapshot, fitView]
  );

  // -----------------------------------------------------------------------
  // Collapse / expand
  // -----------------------------------------------------------------------
  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Persist collapse state to localStorage
  useEffect(() => {
    if (!isCollapsedHydrated) return;
    try {
      localStorage.setItem(`collapsed:${mapId}`, JSON.stringify([...collapsed]));
    } catch { /* localStorage full or unavailable */ }
  }, [collapsed, mapId, isCollapsedHydrated]);

  const collapseAll = useCallback(() => {
    const parentIds = new Set(edges.map((e) => e.source));
    setCollapsed(parentIds);
  }, [edges]);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  const hiddenIds = useMemo(
    () => getHiddenNodeIds(collapsed, edges),
    [collapsed, edges]
  );

  // Use ReactFlow's built-in `hidden` property instead of filtering.
  // This keeps all nodes/edges in the store so getNodes()/getEdges() return
  // the full set — preventing data loss in layout, addNode, and snapshots.
  const displayNodes = useMemo(
    () => nodes.map((n) => ({ ...n, hidden: hiddenIds.has(n.id) })),
    [nodes, hiddenIds]
  );

  const displayEdges = useMemo(
    () => edges.map((e) => ({ ...e, hidden: hiddenIds.has(e.source) || hiddenIds.has(e.target) })),
    [edges, hiddenIds]
  );

  const childCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const edge of edges) {
      map.set(edge.source, (map.get(edge.source) || 0) + 1);
    }
    return map;
  }, [edges]);

  const onUpdateNode = useCallback(
    (id: string, newData: Partial<ScenarioData>) => {
      // Capture edges before entering setNodes updater to avoid stale closure
      const currentEdges = getEdges();
      setNodes((nds) => {
        const updated = nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n));
        pushSnapshot(updated, currentEdges);
        return updated;
      });
    },
    [setNodes, pushSnapshot, getEdges]
  );

  useEffect(() => {
    actionsRef.current.deleteNode = onDeleteNode;
    actionsRef.current.duplicateNode = onDuplicateNode;
    actionsRef.current.toggleCollapse = toggleCollapse;
    actionsRef.current.isCollapsed = (id: string) => collapsed.has(id);
    actionsRef.current.getChildCount = (id: string) => childCountMap.get(id) || 0;
    actionsRef.current.getHiddenChildCount = (id: string) => {
      const descendants = getHiddenNodeIds(new Set([id]), edges);
      return descendants.size;
    };
    actionsRef.current.updateNodeStatus = (id: string, status: "untested" | "verified" | "failed") => {
      onUpdateNode(id, { status });
    };
    actionsRef.current.updateNodeLabel = (id: string, label: string) => {
      onUpdateNode(id, { label });
    };
  }, [onDeleteNode, onDuplicateNode, toggleCollapse, collapsed, childCountMap, edges, onUpdateNode]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-loop edges
      if (params.source === params.target) return;

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
  // Bulk status change
  // -----------------------------------------------------------------------
  const onBulkStatusChange = useCallback(
    (status: ScenarioData["status"]) => {
      let count = 0;
      setNodes((nds) => {
        const updated = nds.map((n) => {
          if (n.selected) { count++; return { ...n, data: { ...n.data, status } }; }
          return n;
        });
        pushSnapshot(updated, getEdges());
        return updated;
      });
      toast.success(`${count} scenario${count !== 1 ? "s" : ""} set to ${status}`, { duration: 2000 });
    },
    [setNodes, pushSnapshot, getEdges]
  );

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------
  const onLayout = useCallback(
    (direction: string) => {
      const allNodes = getNodes();
      const allEdges = getEdges();
      // Only layout visible nodes; hidden nodes keep their positions
      const visible = allNodes.filter((n) => !n.hidden);
      const visibleEdges = allEdges.filter((e) => !e.hidden);
      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(visible, visibleEdges, direction);
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

      // Merge: laid-out visible nodes + unchanged hidden nodes
      const laidMap = new Map(lNodes.map((n) => [n.id, n]));
      const styledMap = new Map(styledEdges.map((e) => [e.id, e]));
      setNodes(allNodes.map((n) => laidMap.get(n.id) ?? n));
      setEdges(allEdges.map((e) => styledMap.get(e.id) ?? e));

      requestAnimationFrame(() => {
        setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS, padding: 0.4 }), FIT_VIEW_DELAY_MS);
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
        : currentNodes.find((n) => n.selected);

      // Auto-expand if parent is collapsed
      if (selectedNode && collapsed.has(selectedNode.id)) {
        setCollapsed((prev) => {
          const next = new Set(prev);
          next.delete(selectedNode.id);
          return next;
        });
      }

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
          ? { x: selectedNode.position.x + NEW_NODE_HORIZONTAL_OFFSET, y: selectedNode.position.y + (childrenCount - 1) * CHILD_VERTICAL_SPACING }
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

      // Separate visible and hidden nodes
      const visibleUpdated: Node[] = [...currentNodes.filter((n) => !n.hidden).map((n) => ({ ...n, selected: false })), newNode];
      const hiddenNodes = currentNodes.filter((n) => n.hidden);
      const mergedNodes = [...visibleUpdated, ...hiddenNodes.map((n) => ({ ...n, selected: false }))];
      const mergedEdges = newEdge ? [...currentEdges, newEdge] : currentEdges;

      setNodes(mergedNodes);
      setEdges(mergedEdges);
      pushSnapshot(mergedNodes, mergedEdges);

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS, padding: 0.4 }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, setNodes, setEdges, fitView, pushSnapshot, collapsed]
  );

  // -----------------------------------------------------------------------
  // Filter layout effect
  // -----------------------------------------------------------------------
  const lastFiltersRef = useRef<string>("");

  // -----------------------------------------------------------------------
  // Layout Management (Manual only)
  // -----------------------------------------------------------------------
  // We no longer trigger auto-layout on filter changes to respect 
  // manual node positions set by the user. 
  // Users can click the LR/TB toggle in the toolbar to re-layout.
  
  // -----------------------------------------------------------------------
  // Undo/Redo actions
  // -----------------------------------------------------------------------
  const handleUndo = useCallback(() => {
    const snapshot = undo();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    editingNodeId,
    addNode,
    nodesRef,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    handleUndo,
    handleRedo,
    pushSnapshot,
    onShowShortcuts: () => setShowShortcuts(true),
    onToggleMarkdownView: () => {
      if (isMarkdownView) {
        handleMarkdownCancel();
      } else {
        enterMarkdownView();
      }
    },
    onUpdateSelectedStatus: (status: "verified" | "failed" | "untested") => {
      const currentEdges = getEdges();
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.selected ? { ...n, data: { ...n.data, status } } : n
        );
        pushSnapshot(updated, currentEdges);
        return updated;
      });
    },
  });

  // Edge click: select the clicked edge (deselect others)
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })));
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    },
    [setEdges, setNodes]
  );

  // -----------------------------------------------------------------------
  // Markdown view
  // -----------------------------------------------------------------------
  const mapName = useMemo(() => {
    const rootNode = nodes.find((n) => !edges.some((e) => e.target === n.id));
    return (rootNode?.data as ScenarioData | undefined)?.label;
  }, [nodes, edges]);

  const enterMarkdownView = useCallback(() => {
    const md = generateMarkdown(nodes, edges, mapName);
    setMarkdownSnapshot(md);
    setIsMarkdownView(true);
  }, [nodes, edges, mapName, setIsMarkdownView]);

  const handleMarkdownApply = useCallback(
    (markdown: string) => {
      try {
        const { nodes: newNodes, edges: newEdges } = parseMarkdown(markdown);
        if (newNodes.length === 0 && markdown.trim().length > 0) {
          toast.error("No scenarios found. Check the markdown format.");
          return;
        }
        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
          newNodes,
          newEdges,
          "LR"
        );
        const styledEdges = lEdges.map((e) => ({
          ...e,
          type: "smoothstep",
          animated: true,
        }));

        setNodes(lNodes);
        setEdges(styledEdges);
        pushSnapshot(lNodes, styledEdges);
        setCollapsed(new Set());
        setIsMarkdownView(false);

        toast.success(
          `Applied: ${lNodes.length} scenario${lNodes.length !== 1 ? "s" : ""}`,
          { duration: 2000 }
        );
        setTimeout(
          () => fitView({ duration: FIT_VIEW_DURATION_MS }),
          FIT_VIEW_DELAY_MS
        );
      } catch {
        toast.error("Failed to parse markdown. Fix the format and try again.");
      }
    },
    [setNodes, setEdges, pushSnapshot, fitView, setCollapsed, setIsMarkdownView]
  );

  const handleMarkdownCancel = useCallback(() => {
    setIsMarkdownView(false);
  }, [setIsMarkdownView]);

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------
  const editingNode = nodes.find((n) => n.id === editingNodeId);
  const parentIds = useMemo(() => new Set(edges.map((e) => e.source)), [edges]);
  const hasExpandable = useMemo(() => {
    for (const pid of parentIds) { if (!collapsed.has(pid)) return true; }
    return false;
  }, [parentIds, collapsed]);
  const hasCollapsed = collapsed.size > 0;
  const selectedCount = useMemo(
    () => displayNodes.filter((n) => n.selected && !n.hidden).length,
    [displayNodes]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="glass island-shadow rounded-2xl px-8 py-6 border border-white/5 flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <span className="text-sm font-medium text-muted-foreground">{loadError}</span>
          <button
            onClick={retryLoad}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!loadedFromStorage) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="glass island-shadow rounded-2xl px-8 py-6 border border-white/5 flex items-center gap-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <MapActionsContext.Provider value={actionsRef}>
      <div className="h-full w-full relative group">
        {isMarkdownView ? (
          <MarkdownEditor
            initialMarkdown={markdownSnapshot}
            onApply={handleMarkdownApply}
            onCancel={handleMarkdownCancel}
          />
        ) : (
          <>
            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              onNodeDoubleClick={(_, node) => setEditingNodeId(node.id)}
              onEdgeClick={onEdgeClick}
              selectionOnDrag
              selectionMode={SelectionMode.Partial}
              multiSelectionKeyCode="Shift"
              fitView
              minZoom={0.05}
              maxZoom={2}
              fitViewOptions={{ padding: { top: 0.4, bottom: 0.4, left: 0.1, right: 0.1 } }}
              className="bg-background"
            >
              <Background
                gap={32}
                color="currentColor"
                className="text-muted-foreground/10"
                variant={BackgroundVariant.Dots}
              />

              <CoverageSummary nodes={nodes} hiddenIds={hiddenIds} />

              <CanvasToolbar
                onAddNode={() => addNode()}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                onExport={() => setShowMarkdown(true)}
                onFitView={() => fitView({ duration: FIT_VIEW_DURATION_MS })}
                onCollapseAll={collapseAll}
                onExpandAll={expandAll}
                hasCollapsed={hasCollapsed}
                hasExpandable={hasExpandable}
                onToggleMarkdownView={enterMarkdownView}
              />

              <BulkActionBar nodes={displayNodes} onBulkStatusChange={onBulkStatusChange} />
            </ReactFlow>

            {/* Filter HUD — hidden when bulk action bar is visible */}
            {selectedCount < 2 && <FilterHUD />}

            {/* Empty map guidance */}
            {nodes.length === 0 && loadedFromStorage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="pointer-events-auto glass island-shadow rounded-2xl px-8 py-8 border border-white/5 flex flex-col items-center gap-4 max-w-xs text-center">
                  <p className="text-sm font-medium text-muted-foreground">This map is empty</p>
                  <p className="text-xs text-muted-foreground/60">Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono text-[11px] border border-white/10">Tab</kbd> or click below to add your first scenario.</p>
                  <button
                    onClick={() => addNode()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Scenario
                  </button>
                </div>
              </div>
            )}

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
                <MarkdownExport
                  nodes={nodes}
                  edges={edges}
                  mapName={mapName}
                  onClose={() => setShowMarkdown(false)}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showShortcuts && (
                <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </MapActionsContext.Provider>
  );
}
