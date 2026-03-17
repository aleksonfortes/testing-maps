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
import { CoverageSummary } from "./CoverageSummary";
import { BulkActionBar } from "./BulkActionBar";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { usePersistence } from "@/hooks/usePersistence";
import { useDragReparent } from "@/hooks/useDragReparent";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CanvasToolbar } from "./CanvasToolbar";
import { getHiddenNodeIds } from "@/lib/tree-utils";
import {
  LAYOUT_DELAY,
  FIT_VIEW_DELAY_MS,
  FIT_VIEW_DURATION_MS,
} from "@/lib/constants";
import { AnimatePresence } from "framer-motion";
import type { ScenarioData } from "@/lib/types";

// ---------------------------------------------------------------------------
// Context for node actions (avoids injecting callbacks into node data)
// ---------------------------------------------------------------------------
interface MapActions {
  deleteNode: (id: string) => void;
  toggleCollapse: (id: string) => void;
  isCollapsed: (id: string) => boolean;
  getChildCount: (id: string) => number;
  getHiddenChildCount: (id: string) => number;
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
// Inner component
// ---------------------------------------------------------------------------
function MapCanvasInner({ mapId }: MapCanvasProps) {
  const { editingNodeId, setEditingNodeId, activeFilters } = useUI();
  const { fitView, getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showMarkdown, setShowMarkdown] = useState(false);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const actionsRef = useRef<MapActions>({
    deleteNode: () => {},
    toggleCollapse: () => {},
    isCollapsed: () => false,
    getChildCount: () => 0,
    getHiddenChildCount: () => 0,
  });

  // Undo/Redo
  const { pushSnapshot, undo, redo, finishRestore, canUndo, canRedo } = useUndoRedo();

  // Persistence (load/save)
  const { loadedFromCloud, saveStatus } = usePersistence({
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

  useEffect(() => {
    actionsRef.current.deleteNode = onDeleteNode;
    actionsRef.current.toggleCollapse = toggleCollapse;
    actionsRef.current.isCollapsed = (id: string) => collapsed.has(id);
    actionsRef.current.getChildCount = (id: string) => childCountMap.get(id) || 0;
    actionsRef.current.getHiddenChildCount = (id: string) => {
      const descendants = getHiddenNodeIds(new Set([id]), edges);
      return descendants.size;
    };
  }, [onDeleteNode, toggleCollapse, collapsed, childCountMap, edges]);

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
  // Bulk status change
  // -----------------------------------------------------------------------
  const onBulkStatusChange = useCallback(
    (status: ScenarioData["status"]) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.selected ? { ...n, data: { ...n.data, status } } : n
        );
        pushSnapshot(updated, getEdges());
        return updated;
      });
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
          ? { x: selectedNode.position.x + 380, y: selectedNode.position.y + (childrenCount - 1) * 150 }
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

      // Separate visible and hidden nodes for layout
      const visibleUpdated: Node[] = [...currentNodes.filter((n) => !n.hidden).map((n) => ({ ...n, selected: false })), newNode];
      const hiddenNodes = currentNodes.filter((n) => n.hidden);
      const visibleEdgesForLayout = currentEdges.filter((e) => !e.hidden);
      const updatedEdges: Edge[] = newEdge ? [...visibleEdgesForLayout, newEdge] : visibleEdgesForLayout;
      const hiddenEdges = currentEdges.filter((e) => e.hidden);

      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(visibleUpdated, updatedEdges, "LR");
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

      // Merge back: laid-out visible + unchanged hidden
      const mergedNodes = [...lNodes, ...hiddenNodes.map((n) => ({ ...n, selected: false }))];
      const mergedEdges = [...styledEdges, ...hiddenEdges];

      setNodes(mergedNodes);
      setEdges(mergedEdges);
      pushSnapshot(mergedNodes, mergedEdges);

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, setNodes, setEdges, fitView, pushSnapshot, collapsed]
  );

  // -----------------------------------------------------------------------
  // Filter layout effect
  // -----------------------------------------------------------------------
  const lastFiltersRef = useRef<string>("");

  useEffect(() => {
    if (!loadedFromCloud) return;
    const filtersKey = [...activeFilters].sort().join(",");
    if (filtersKey !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersKey;
      setTimeout(() => onLayout("LR"), LAYOUT_DELAY);
    }
  }, [activeFilters, onLayout, loadedFromCloud]);

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
    setNodes,
    setEdges,
    handleUndo,
    handleRedo,
    pushSnapshot,
  });

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
          nodes={displayNodes}
          edges={displayEdges}
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

          <CoverageSummary nodes={nodes} />

          <CanvasToolbar
            onAddNode={() => addNode()}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onExport={() => setShowMarkdown(true)}
            onFitView={() => fitView({ duration: FIT_VIEW_DURATION_MS })}
            saveStatus={saveStatus}
          />

          <BulkActionBar nodes={displayNodes} onBulkStatusChange={onBulkStatusChange} />
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

      </div>
    </MapActionsContext.Provider>
  );
}
