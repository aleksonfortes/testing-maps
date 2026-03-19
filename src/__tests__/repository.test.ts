import { describe, it, expect } from "vitest";
import { sanitizeForStorage } from "@/lib/repository";
import type { Node, Edge } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(id: string, extraData: Record<string, unknown> = {}): Node {
  return {
    id,
    type: "scenario",
    data: {
      label: "Test",
      status: "untested",
      testType: "manual",
      instructions: "Do it",
      expectedResults: "It works",
      codeRef: "test.ts",
      ...extraData,
    },
    position: { x: 100, y: 200 },
  };
}

function makeEdge(source: string, target: string): Edge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    sourceHandle: "source",
    targetHandle: "target",
    type: "smoothstep",
    animated: true,
    // Extra runtime properties that should be stripped
    selected: true,
    hidden: false,
  } as Edge;
}

// ===========================================================================
// Tests
// ===========================================================================
describe("sanitizeForStorage", () => {
  it("strips isDropTarget from node data", () => {
    const nodes = [makeNode("1", { isDropTarget: true })];
    const { cleanNodes } = sanitizeForStorage(nodes, []);
    expect(cleanNodes[0].data).not.toHaveProperty("isDropTarget");
  });

  it("preserves all other node data fields", () => {
    const nodes = [makeNode("1")];
    const { cleanNodes } = sanitizeForStorage(nodes, []);
    const data = cleanNodes[0].data as Record<string, unknown>;
    expect(data.label).toBe("Test");
    expect(data.status).toBe("untested");
    expect(data.testType).toBe("manual");
    expect(data.instructions).toBe("Do it");
    expect(data.expectedResults).toBe("It works");
    expect(data.codeRef).toBe("test.ts");
  });

  it("handles nodes without isDropTarget (no crash)", () => {
    const nodes = [makeNode("1")]; // no isDropTarget
    const { cleanNodes } = sanitizeForStorage(nodes, []);
    expect(cleanNodes).toHaveLength(1);
    expect(cleanNodes[0].id).toBe("1");
  });

  it("handles empty arrays", () => {
    const { cleanNodes, cleanEdges } = sanitizeForStorage([], []);
    expect(cleanNodes).toEqual([]);
    expect(cleanEdges).toEqual([]);
  });

  it("cleans edge properties to only essential fields", () => {
    const edges = [makeEdge("1", "2")];
    const { cleanEdges } = sanitizeForStorage([], edges);
    expect(cleanEdges[0]).toEqual({
      id: "e-1-2",
      source: "1",
      target: "2",
      sourceHandle: "source",
      targetHandle: "target",
      type: "smoothstep",
      animated: true,
    });
    // Should NOT have selected or hidden
    expect(cleanEdges[0]).not.toHaveProperty("selected");
    expect(cleanEdges[0]).not.toHaveProperty("hidden");
  });

  it("only keeps id, type, data, position from nodes", () => {
    const node = {
      ...makeNode("1"),
      selected: true,
      hidden: false,
      dragging: true,
    } as Node;
    const { cleanNodes } = sanitizeForStorage([node], []);
    expect(cleanNodes[0]).toHaveProperty("id");
    expect(cleanNodes[0]).toHaveProperty("type");
    expect(cleanNodes[0]).toHaveProperty("data");
    expect(cleanNodes[0]).toHaveProperty("position");
    expect(cleanNodes[0]).not.toHaveProperty("selected");
    expect(cleanNodes[0]).not.toHaveProperty("hidden");
    expect(cleanNodes[0]).not.toHaveProperty("dragging");
  });
});
