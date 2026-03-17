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
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { usePersistence } from "@/hooks/usePersistence";
import { useDragReparent } from "@/hooks/useDragReparent";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CanvasToolbar } from "./CanvasToolbar";
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
  const { viewMode, editingNodeId, setEditingNodeId, activeFilters } = useUI();
  const { fitView, getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showMarkdown, setShowMarkdown] = useState(false);

  const lastLayoutMode = useRef<string>("");
  const actionsRef = useRef<MapActions>({ deleteNode: () => {} });

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
    viewMode,
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
  // Layout
  // -----------------------------------------------------------------------
  const onLayout = useCallback(
    (direction: string) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(currentNodes, currentEdges, direction);
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

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

      const updatedNodes: Node[] = [...currentNodes.map((n) => ({ ...n, selected: false })), newNode];
      const updatedEdges: Edge[] = newEdge ? [...currentEdges, newEdge] : currentEdges;

      const direction = viewMode === "mindmap" ? "LR" : "TB";
      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(updatedNodes, updatedEdges, direction);
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

      setNodes(lNodes);
      setEdges(styledEdges);
      pushSnapshot(lNodes, styledEdges);

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, setNodes, setEdges, viewMode, fitView, pushSnapshot]
  );

  // -----------------------------------------------------------------------
  // View mode / filter layout effects
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
