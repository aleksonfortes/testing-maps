import type { Node, Edge } from "@xyflow/react";
import { z } from "zod";

export const ScenarioDataSchema = z.object({
  label: z.string(),
  status: z.enum(["untested", "verified", "failed"]),
  testType: z.enum(["manual", "unit", "integration", "e2e"]),
  instructions: z.string().optional(),
  expectedResults: z.string().optional(),
  codeRef: z.string().optional(),
  isDropTarget: z.boolean().optional(),
}).strip();

export const ScenarioNodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: ScenarioDataSchema,
  width: z.number().optional(),
  height: z.number().optional(),
}).passthrough();

export const ScenarioEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}).passthrough();

export const TestingMapSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  nodes: z.array(ScenarioNodeSchema),
  edges: z.array(ScenarioEdgeSchema),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

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
