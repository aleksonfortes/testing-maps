import type { Node, Edge } from "@xyflow/react";

// extends Record<string, unknown> is required by ReactFlow's Node<T> data constraint
export interface ScenarioData extends Record<string, unknown> {
  label: string;
  status: "untested" | "verified" | "failed";
  testType: "manual" | "unit" | "integration" | "e2e";
  instructions?: string;
  expectedResults?: string;
  codeRef?: string;
  /** Runtime-only: set during drag-to-reparent to highlight the drop target */
  isDropTarget?: boolean;
}

export type ScenarioNode = Node<ScenarioData, "scenario">;
export type ScenarioEdge = Edge;

export interface TestingMap {
  id: string;
  user_id: string;
  name: string;
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  created_at?: string;
  updated_at?: string;
}

export interface TestingMapListItem {
  id: string;
  name: string;
  updated_at: string;
}
