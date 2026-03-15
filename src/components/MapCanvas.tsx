"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMyPresence, useOthers } from "@/liveblocks.config";
import { useUI } from "@/context/UIContext";
import { getLayoutedElements } from "@/lib/layout";
import { ScenarioNode } from "./nodes/ScenarioNode";

const nodeTypes = {
  scenario: ScenarioNode,
};

const initialNodes: any[] = [
  {
    id: "1",
    type: "scenario",
    data: { 
      label: "User Authentication", 
      status: "verified", 
      testType: "integration",
      instructions: "Ensure all auth providers (Google, GitHub) are correctly configured in Supabase.",
      expectedResults: "User successfully redirects to dashboard after login.",
      codeRef: "src/auth/login.test.ts"
    },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    type: "scenario",
    data: { 
      label: "Login with Google", 
      status: "verified", 
      testType: "unit",
      instructions: "Test with valid and expired OAuth tokens.",
      expectedResults: "System creates a new user profile on first login.",
      codeRef: "src/auth/google.test.ts"
    },
    position: { x: 50, y: 250 },
  },
  {
    id: "3",
    type: "scenario",
    data: { 
      label: "Reset Password Flow", 
      status: "untested", 
      testType: "e2e",
      instructions: "Manually verify the email template contains the correct reset link.",
      expectedResults: "Password update is reflected in the database immediately.",
      codeRef: "tests/e2e/reset.spec.ts"
    },
    position: { x: 450, y: 250 },
  },
];

const initialEdges: any[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
];

export function MapCanvas() {
  return (
    <ReactFlowProvider>
      <MapCanvasInner />
    </ReactFlowProvider>
  );
}

function MapCanvasInner() {
  const { viewMode } = useUI();
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [myPresence, updatePresence] = useMyPresence();
  const others = useOthers();
  const lastLayoutMode = useRef<string>("diagram");

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      const edgedWithStyle = layoutedEdges.map(edge => ({
        ...edge,
        type: direction === "LR" ? "smoothstep" : "default",
        animated: true,
      }));

      setNodes([...layoutedNodes]);
      setEdges([...edgedWithStyle]);
      
      // Small timeout to allow layout to settle before fitting view
      setTimeout(() => fitView({ duration: 800 }), 50);
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  useEffect(() => {
    if (viewMode === "mindmap" && lastLayoutMode.current !== "mindmap") {
      onLayout("LR");
      lastLayoutMode.current = "mindmap";
    } else if (viewMode === "diagram" && lastLayoutMode.current !== "diagram") {
      onLayout("TB");
      lastLayoutMode.current = "diagram";
    }
  }, [viewMode, onLayout]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );
  
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updatePresence({ cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
  }, [updatePresence]);

  const onPointerLeave = useCallback(() => {
    updatePresence({ cursor: null });
  }, [updatePresence]);

  const addNode = useCallback(() => {
    const id = Date.now().toString();
    const newNode = {
      id,
      type: "scenario",
      data: { 
        label: "New Scenario", 
        status: "untested", 
        testType: "manual",
        instructions: "Add instructions here...",
        expectedResults: "Add expected results here...",
        codeRef: ""
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="h-full w-full relative group" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-background"
      >
        <Background gap={32} color="currentColor" className="text-muted-foreground/10" variant={BackgroundVariant.Dots} />
        <Controls className="!bg-card !border-border !rounded-xl !shadow-sm overflow-hidden" />
        <MiniMap className="!bg-card !border-border !rounded-2xl !shadow-lg" maskColor="rgba(0,0,0,0.05)" />
        <Panel position="top-right">
          <button 
            onClick={addNode}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            + Add Scenario
          </button>
        </Panel>
      </ReactFlow>

      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
        {others.map(({ connectionId, presence }) => {
          if (!presence || !presence.cursor) return null;

          return (
            <Cursor
              key={connectionId}
              x={presence.cursor.x}
              y={presence.cursor.y}
              color={connectionId % 2 === 0 ? "var(--primary)" : "#06b6d4"}
            />
          );
        })}
      </div>
    </div>
  );
}

function Cursor({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div
      className="absolute flex items-center gap-2 transition-all duration-75"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M5.65376 12.3785L11.6059 13.3857L12.6131 19.3379C12.8273 20.6033 14.5951 20.7262 14.9925 19.5034L19.8242 4.63661C20.1873 3.52 19.123 2.45571 18.0064 2.81878L3.13961 7.65048C1.9168 8.04787 2.03977 9.81561 3.30514 10.0298L9.25732 11.037L5.65376 12.3785Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
