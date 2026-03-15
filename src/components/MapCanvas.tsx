"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LiveObject } from "@liveblocks/client";
import { useMyPresence, useOthers, useStorage, useMutation } from "@/liveblocks.config";
import { useUI } from "@/context/UIContext";
import { getLayoutedElements } from "@/lib/layout";
import { ScenarioNode } from "./nodes/ScenarioNode";
import { ScenarioModal } from "./modals/ScenarioModal";
import { MarkdownExport } from "./modals/MarkdownExport";
import { Type, FileText, MoreHorizontal } from "lucide-react";
import { LAYOUT_DELAY } from "@/lib/constants";

const nodeTypes = {
  scenario: ScenarioNode,
};

const initialNodes: any[] = [
  {
    id: "1",
    type: "scenario",
    data: { label: "User Authentication", status: "verified", testType: "integration" },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    type: "scenario",
    data: { label: "Login with Google", status: "verified", testType: "unit" },
    position: { x: 50, y: 250 },
  },
  {
    id: "3",
    type: "scenario",
    data: { label: "Reset Password Flow", status: "untested", testType: "e2e" },
    position: { x: 450, y: 250 },
  },
];

const initialEdges: any[] = [
  { id: "e1-2", source: "1", target: "2", sourceHandle: "source", targetHandle: "target", animated: true },
  { id: "e1-3", source: "1", target: "3", sourceHandle: "source", targetHandle: "target", animated: true },
];

export function MapCanvas() {
  return (
    <ReactFlowProvider>
      <MapCanvasInner />
    </ReactFlowProvider>
  );
}

function MapCanvasInner() {
  const { viewMode, editingNodeId, setEditingNodeId } = useUI();
  const { fitView, getNodes, getEdges } = useReactFlow();
  
  const [nodes, setNodes, onNodesChangeLocal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeLocal] = useEdgesState(initialEdges);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  
  const storageNodes = useStorage((root) => root.nodes);
  const storageEdges = useStorage((root) => root.edges);
  const [myPresence, updatePresence] = useMyPresence();
  const others = useOthers();
  const lastLayoutMode = useRef<string>("");

  // Mutations
  const mutNodesChange = useMutation(({ storage }, jsonChanges: any[]) => {
    const liveNodes = storage.get("nodes");
    jsonChanges.forEach((change) => {
      if (change.type === "position" && change.dragging) {
        const index = liveNodes.findIndex(n => n.get("id") === change.id);
        if (index !== -1) liveNodes.get(index)?.set("position", change.position);
      }
    });
  }, []);

  const mutEdgesChange = useMutation(({ storage }, jsonChanges: any[]) => {
    const liveEdges = storage.get("edges");
    jsonChanges.forEach(change => {
      if (change.type === "remove") {
        const index = liveEdges.findIndex(e => e.get("id") === change.id);
        if (index !== -1) liveEdges.delete(index);
      }
    });
  }, []);

  const mutAddNode = useMutation(({ storage }, newNode: any, newEdge?: any) => {
    const liveNodes = storage.get("nodes");
    const liveEdges = storage.get("edges");
    liveNodes.push(new LiveObject(newNode as any));
    if (newEdge) liveEdges.push(new LiveObject(newEdge as any));
  }, []);

  const mutDeleteNode = useMutation(({ storage }, id: string) => {
    const liveNodes = storage.get("nodes");
    const liveEdges = storage.get("edges");
    const index = liveNodes.findIndex(n => n.get("id") === id);
    if (index !== -1) liveNodes.delete(index);
    let i = liveEdges.length;
    while (i--) {
      const edge = liveEdges.get(i);
      if (edge?.get("source") === id || edge?.get("target") === id) liveEdges.delete(i);
    }
  }, []);

  const mutConnect = useMutation(({ storage }, params: any) => {
    storage.get("edges").push(new LiveObject({ 
      ...params, 
      id: `e${params.source}-${params.target}`, 
      sourceHandle: "source",
      targetHandle: "target",
      type: "smoothstep"
    }));
  }, []);

  // Handlers
  const onNodesChange = useCallback((changes: any[]) => {
    onNodesChangeLocal(changes);
    if (storageNodes && !isRestricted) {
      try { mutNodesChange(changes); } catch (e) { setIsRestricted(true); }
    }
  }, [onNodesChangeLocal, storageNodes, isRestricted, mutNodesChange]);

  const onEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeLocal(changes);
    if (storageEdges && !isRestricted) {
      try { mutEdgesChange(changes); } catch (e) { setIsRestricted(true); }
    }
  }, [onEdgesChangeLocal, storageEdges, isRestricted, mutEdgesChange]);

  const onConnect = useCallback((params: any) => {
    const edge = { ...params, id: `e${params.source}-${params.target}`, animated: true };
    setEdges((eds) => addEdge(edge, eds));
    if (storageEdges && !isRestricted) {
      try { mutConnect(params); } catch (e) { setIsRestricted(true); }
    }
  }, [setEdges, storageEdges, isRestricted, mutConnect]);

  const onDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (storageNodes && !isRestricted) {
      try { mutDeleteNode(id); } catch (e) { setIsRestricted(true); }
    }
  }, [setNodes, setEdges, storageNodes, isRestricted, mutDeleteNode]);

  const onUpdateNode = useCallback((id: string, newData: any) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n)));
  }, [setNodes]);

  const addNode = useCallback((parentId?: string) => {
    const id = Date.now().toString();
    const selectedNode = parentId ? nodes.find(n => n.id === parentId) : (nodes.find(n => n.selected) || nodes[nodes.length - 1]);
    
    // Calculate intelligent offset to avoid direct overlap before layout
    const childrenCount = edges.filter(e => e.source === selectedNode?.id).length;
    const offset = {
      x: 380,
      y: (childrenCount - 1) * 150
    };

    const newNode = {
      id,
      type: "scenario",
      selected: true,
      data: { 
        label: "New Scenario", status: "untested", testType: "manual",
        instructions: "Add instructions here...", expectedResults: "Add expected results here...", codeRef: "",
      },
      position: selectedNode ? 
        { x: selectedNode.position.x + offset.x, y: selectedNode.position.y + offset.y } : 
        { x: 100, y: 100 },
    };
    let newEdge = null;
    if (selectedNode) {
      newEdge = { 
        id: `e${selectedNode.id}-${id}`, 
        source: selectedNode.id, 
        target: id, 
        sourceHandle: "source", 
        targetHandle: "target", 
        animated: true, 
        type: "smoothstep" 
      };
    }
    
    // Deselect others and add new
    const updatedNodes = nodes.map(n => ({ ...n, selected: false })).concat([newNode]);
    const updatedEdges = newEdge ? edges.concat([newEdge]) : edges;
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    
    // Trigger auto-layout to clean up immediately
    const direction = viewMode === "mindmap" ? "LR" : "TB";
    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(updatedNodes, updatedEdges, direction);
    const styledEdges = lEdges.map(e => ({ ...e, type: direction === "LR" ? "smoothstep" : "default", animated: true }));
    
    setNodes(lNodes);
    setEdges(styledEdges);
    
    if (storageNodes && !isRestricted) {
      try { mutAddNode(newNode, newEdge); } catch (e) { setIsRestricted(true); }
    }
    
    setTimeout(() => fitView({ duration: 800 }), 50);
  }, [nodes, edges, setNodes, setEdges, storageNodes, isRestricted, mutAddNode, viewMode, fitView]);

  const onLayout = useCallback((direction: string) => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(currentNodes, currentEdges, direction);
    
    const styledEdges = lEdges.map(e => ({ 
      ...e, 
      type: "smoothstep", 
      animated: true,
      pathOptions: { borderRadius: 20 }
    }));
    
    setNodes(lNodes);
    setEdges(styledEdges);
    
    requestAnimationFrame(() => {
      setTimeout(() => fitView({ duration: 800 }), 50);
    });
  }, [getNodes, getEdges, setNodes, setEdges, fitView]);

  // Sync with Storage
  useEffect(() => {
    if (!storageNodes || isRestricted || storageNodes.length === 0) return;
    const sNodes = storageNodes.map(n => ({ ...n }));
    setNodes(sNodes);
    if (storageEdges && storageEdges.length > 0) {
      const sEdges = storageEdges.map(e => ({ ...e }));
      setEdges(sEdges);
    }
  }, [storageNodes, storageEdges, isRestricted, setNodes, setEdges]);

  // View Mode Layout
  useEffect(() => {
    if (viewMode === "mindmap" && lastLayoutMode.current !== "mindmap") {
      onLayout("LR");
      lastLayoutMode.current = "mindmap";
    } else if (viewMode === "diagram" && lastLayoutMode.current !== "diagram") {
      onLayout("TB");
      lastLayoutMode.current = "diagram";
    }
  }, [viewMode, onLayout]);

  // Automatic Re-Layout on Filter Changes - Guarded to prevent loops
  const { activeFilters } = useUI();
  const lastFiltersRef = useRef<string>("");
  
  useEffect(() => {
    const filtersKey = Array.from(activeFilters || []).sort().join(",");
    if (filtersKey !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersKey;
      const direction = viewMode === "mindmap" ? "LR" : "TB";
      
      // Critical: Wait for React + Browser to finish measuring the new dynamic node heights
      // before triggering the layout engine. This prevents the "fixed height" layout bug.
      setTimeout(() => {
        onLayout(direction);
      }, LAYOUT_DELAY);
    }
  }, [activeFilters, onLayout, viewMode]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) return;
      if (e.key === "Tab") {
        e.preventDefault();
        const selected = nodes.find(n => n.selected);
        addNode(selected?.id);
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        const selected = nodes.filter(n => n.selected);
        if (selected.length > 0 && window.confirm(`Delete ${selected.length} node(s)?`)) {
          selected.forEach(n => onDeleteNode(n.id));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, addNode, onDeleteNode, editingNodeId]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (isRestricted || !updatePresence) return;
    const rect = e.currentTarget.getBoundingClientRect();
    updatePresence({ cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
  }, [updatePresence, isRestricted]);

  const onPointerLeave = useCallback(() => {
    if (isRestricted || !updatePresence) return;
    updatePresence({ cursor: null });
  }, [updatePresence, isRestricted]);

  // Augment nodes with onDelete
  const nodesWithData = useMemo(() => 
    nodes.map(n => ({ ...n, data: { ...n.data, onDelete: onDeleteNode } })), 
    [nodes, onDeleteNode]
  );

  const editingNode = nodesWithData.find(n => n.id === editingNodeId);

  return (
    <div className="h-full w-full relative group" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <ReactFlow
        nodes={nodesWithData}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={(_, node) => setEditingNodeId(node.id)}
        fitView
        className="bg-background"
      >
        <Background gap={32} color="currentColor" className="text-muted-foreground/10" variant={BackgroundVariant.Dots} />
        <Controls className="!bg-card !border-border !rounded-xl !shadow-sm overflow-hidden" />
        <MiniMap className="!bg-card !border-border !rounded-2xl !shadow-lg" maskColor="rgba(0,0,0,0.05)" position="bottom-right" />
        
        <Panel position="top-right" className="flex flex-col gap-2 mt-16 mr-4 pointer-events-auto">
          <button onClick={() => addNode()} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl hover:scale-105 transition-all active:scale-95">
            <div className="bg-white/20 rounded-lg p-1 text-white"><Type className="w-4 h-4" /></div>
            Add Scenario
            <span className="opacity-50 text-[10px] bg-black/10 px-1.5 py-0.5 rounded ml-1">TAB</span>
          </button>
          <button onClick={() => setShowMarkdown(true)} className="flex items-center gap-2 bg-card text-foreground border border-border px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:bg-secondary transition-colors">
            <div className="p-1 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
            View Markdown
          </button>
        </Panel>
      </ReactFlow>

      {editingNode && (
        <ScenarioModal node={editingNode} onUpdate={onUpdateNode} onDelete={onDeleteNode} />
      )}

      {showMarkdown && (
        <MarkdownExport nodes={nodes} edges={edges} onClose={() => setShowMarkdown(false)} />
      )}

      {!isRestricted && others && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          {others.map(({ connectionId, presence }) => {
            if (!presence || !presence.cursor) return null;
            return <Cursor key={connectionId} x={presence.cursor.x} y={presence.cursor.y} color={connectionId % 2 === 0 ? "var(--primary)" : "#06b6d4"} />;
          })}
        </div>
      )}
    </div>
  );
}

function Cursor({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div
      className="absolute flex items-center gap-2 transition-all duration-75"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
        <path d="M5.65376 12.3785L11.6059 13.3857L12.6131 19.3379C12.8273 20.6033 14.5951 20.7262 14.9925 19.5034L19.8242 4.63661C20.1873 3.52 19.123 2.45571 18.0064 2.81878L3.13961 7.65048C1.9168 8.04787 2.03977 9.81561 3.30514 10.0298L9.25732 11.037L5.65376 12.3785Z" fill={color} />
      </svg>
    </div>
  );
}
