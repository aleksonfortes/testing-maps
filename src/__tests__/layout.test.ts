import { describe, it, expect } from "vitest";
import { getLayoutedElements } from "@/lib/layout";
import type { Node, Edge } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(id: string): Node {
  return { id, type: "scenario", data: { label: id }, position: { x: 0, y: 0 } };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target, type: "smoothstep", animated: true };
}

// ===========================================================================
// Tests
// ===========================================================================
describe("getLayoutedElements", () => {
  it("returns empty arrays for empty graph", () => {
    const { nodes, edges } = getLayoutedElements([], []);
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it("positions a single node with valid coordinates", () => {
    const { nodes } = getLayoutedElements([makeNode("A")], []);
    expect(nodes).toHaveLength(1);
    expect(typeof nodes[0].position.x).toBe("number");
    expect(typeof nodes[0].position.y).toBe("number");
    expect(Number.isNaN(nodes[0].position.x)).toBe(false);
    expect(Number.isNaN(nodes[0].position.y)).toBe(false);
  });

  it("LR direction: parent has smaller x than child", () => {
    const nodes = [makeNode("A"), makeNode("B")];
    const edges = [makeEdge("A", "B")];
    const { nodes: laid } = getLayoutedElements(nodes, edges, "LR");
    const nodeA = laid.find((n) => n.id === "A")!;
    const nodeB = laid.find((n) => n.id === "B")!;
    expect(nodeA.position.x).toBeLessThan(nodeB.position.x);
  });

  it("TB direction: parent has smaller y than child", () => {
    const nodes = [makeNode("A"), makeNode("B")];
    const edges = [makeEdge("A", "B")];
    const { nodes: laid } = getLayoutedElements(nodes, edges, "TB");
    const nodeA = laid.find((n) => n.id === "A")!;
    const nodeB = laid.find((n) => n.id === "B")!;
    expect(nodeA.position.y).toBeLessThan(nodeB.position.y);
  });

  it("positions are integers (Math.round applied)", () => {
    const nodes = [makeNode("A"), makeNode("B"), makeNode("C")];
    const edges = [makeEdge("A", "B"), makeEdge("A", "C")];
    const { nodes: laid } = getLayoutedElements(nodes, edges, "LR");
    for (const n of laid) {
      expect(Number.isInteger(n.position.x)).toBe(true);
      expect(Number.isInteger(n.position.y)).toBe(true);
    }
  });

  it("handles disconnected components", () => {
    const nodes = [makeNode("A"), makeNode("B"), makeNode("C"), makeNode("D")];
    const edges = [makeEdge("A", "B"), makeEdge("C", "D")];
    const { nodes: laid } = getLayoutedElements(nodes, edges, "LR");
    expect(laid).toHaveLength(4);
    // All should have valid positions
    for (const n of laid) {
      expect(Number.isNaN(n.position.x)).toBe(false);
      expect(Number.isNaN(n.position.y)).toBe(false);
    }
  });

  it("edges pass through unchanged", () => {
    const nodes = [makeNode("A"), makeNode("B")];
    const edges = [makeEdge("A", "B")];
    const { edges: resultEdges } = getLayoutedElements(nodes, edges, "LR");
    expect(resultEdges).toBe(edges); // same reference
  });

  it("sets correct source/target positions for LR", () => {
    const nodes = [makeNode("A"), makeNode("B")];
    const edges = [makeEdge("A", "B")];
    const { nodes: laid } = getLayoutedElements(nodes, edges, "LR");
    expect(laid[0].sourcePosition).toBe("right");
    expect(laid[0].targetPosition).toBe("left");
  });

  it("sets correct source/target positions for TB", () => {
    const nodes = [makeNode("A"), makeNode("B")];
    const edges = [makeEdge("A", "B")];
    const { nodes: laid } = getLayoutedElements(nodes, edges, "TB");
    expect(laid[0].sourcePosition).toBe("bottom");
    expect(laid[0].targetPosition).toBe("top");
  });
});
