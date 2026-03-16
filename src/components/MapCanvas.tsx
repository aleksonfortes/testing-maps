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
import { useUI } from "@/context/UIContext";
import { getLayoutedElements } from "@/lib/layout";
import { ScenarioNode } from "./nodes/ScenarioNode";
import { ScenarioModal } from "./modals/ScenarioModal";
import { MarkdownExport } from "./modals/MarkdownExport";
import { Type, FileText, LogOut } from "lucide-react";
import { LAYOUT_DELAY } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { testingMapRepository } from "@/lib/repository";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const lastLayoutMode = useRef<string>("");

  // Fix hydration and check auth
  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      setUser(user);
    });
  }, []);

  // Initial Load from Supabase
  useEffect(() => {
    if (!isMounted || !user) return;

    const loadData = async () => {
      try {
        const data = await testingMapRepository.loadMap(user.id);

        if (data) {
          if (data.nodes && data.nodes.length > 0) setNodes(data.nodes);
          if (data.edges && data.edges.length > 0) setEdges(data.edges);
        }

        setTimeout(() => {
          setIsLoaded(true);
        }, 300);
      } catch (err) {
        console.error("Cloud Load Error:", err);
        setIsLoaded(true);
      }
    };

    loadData();
  }, [isMounted, user, setNodes, setEdges]);

  // Persist to Supabase
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    // Defensive check
    if (nodes.length === 0 && initialNodes.length > 0) return;
    
    const saveData = async () => {
      try {
        await testingMapRepository.saveMap(user.id, nodes, edges);
      } catch (err) {
        console.error("Cloud Save Error:", err);
      }
    };

    // Debounce saves
    const timer = setTimeout(saveData, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, isLoaded, user]);

  const onConnect = useCallback((params: any) => {
    const edge = { 
      ...params, 
      id: `e${params.source}-${params.target}`, 
      animated: true,
      sourceHandle: "source",
      targetHandle: "target",
      type: "smoothstep"
    };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges]);

  const onDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

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
    
    setTimeout(() => fitView({ duration: 800 }), 50);
  }, [nodes, edges, setNodes, setEdges, viewMode, fitView]);

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
    if (!isLoaded) return;
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
  }, [activeFilters, onLayout, viewMode, isLoaded]);

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

  // Augment nodes with onDelete
  const nodesWithData = useMemo(() => 
    nodes.map(n => ({ ...n, data: { ...n.data, onDelete: onDeleteNode } })), 
    [nodes, onDeleteNode]
  );

  const editingNode = nodesWithData.find(n => n.id === editingNodeId);

  if (!isMounted) return null;

  if (!user && isLoaded) {
    router.push("/auth");
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="h-full w-full relative group">
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
          <button onClick={handleSignOut} className="flex items-center gap-2 bg-card text-destructive border border-border px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:bg-destructive/10 transition-colors">
            <div className="p-1 bg-destructive/10 rounded-lg"><LogOut className="w-4 h-4 text-destructive" /></div>
            Sign Out
          </button>
        </Panel>
      </ReactFlow>

      {editingNode && (
        <ScenarioModal node={editingNode} onUpdate={onUpdateNode} onDelete={onDeleteNode} />
      )}

      {showMarkdown && (
        <MarkdownExport nodes={nodes} edges={edges} onClose={() => setShowMarkdown(false)} />
      )}
    </div>
  );
}
