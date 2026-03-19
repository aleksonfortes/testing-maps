import { describe, it, expect } from "vitest";
import { getDescendantIds, getHiddenNodeIds } from "@/lib/tree-utils";
import type { Edge } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function edge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target, type: "smoothstep", animated: true };
}

// ===========================================================================
// getDescendantIds
// ===========================================================================
describe("getDescendantIds", () => {
  it("returns direct children", () => {
    const edges = [edge("A", "B"), edge("A", "C")];
    expect(getDescendantIds("A", edges)).toEqual(new Set(["B", "C"]));
  });

  it("returns multi-level descendants", () => {
    const edges = [edge("A", "B"), edge("B", "C"), edge("C", "D")];
    expect(getDescendantIds("A", edges)).toEqual(new Set(["B", "C", "D"]));
  });

  it("returns empty set for leaf node", () => {
    const edges = [edge("A", "B")];
    expect(getDescendantIds("B", edges)).toEqual(new Set());
  });

  it("returns empty set for non-existent node ID", () => {
    const edges = [edge("A", "B")];
    expect(getDescendantIds("Z", edges)).toEqual(new Set());
  });

  it("returns empty set for empty edges array", () => {
    expect(getDescendantIds("A", [])).toEqual(new Set());
  });

  it("handles diamond/merge graph without duplicates", () => {
    // A → B, A → C, B → D, C → D
    const edges = [edge("A", "B"), edge("A", "C"), edge("B", "D"), edge("C", "D")];
    const result = getDescendantIds("A", edges);
    expect(result).toEqual(new Set(["B", "C", "D"]));
  });

  it("handles multiple branches", () => {
    const edges = [edge("A", "B"), edge("A", "C"), edge("B", "D"), edge("C", "E")];
    expect(getDescendantIds("A", edges)).toEqual(new Set(["B", "C", "D", "E"]));
  });

  it("does not include the starting node itself", () => {
    const edges = [edge("A", "B")];
    const result = getDescendantIds("A", edges);
    expect(result.has("A")).toBe(false);
  });

  it("handles self-loop without infinite loop", () => {
    const edges = [edge("A", "A")];
    const result = getDescendantIds("A", edges);
    // A is its own child — gets added to result, then A is popped again
    // but A is already in result, so loop stops
    expect(result).toEqual(new Set(["A"]));
  });
});

// ===========================================================================
// getHiddenNodeIds
// ===========================================================================
describe("getHiddenNodeIds", () => {
  it("hides children of a single collapsed node", () => {
    const edges = [edge("A", "B"), edge("A", "C")];
    const hidden = getHiddenNodeIds(new Set(["A"]), edges);
    expect(hidden).toEqual(new Set(["B", "C"]));
  });

  it("hides descendants of multiple collapsed nodes", () => {
    const edges = [edge("A", "B"), edge("D", "E")];
    const hidden = getHiddenNodeIds(new Set(["A", "D"]), edges);
    expect(hidden).toEqual(new Set(["B", "E"]));
  });

  it("hides nested descendants when parent and child are collapsed", () => {
    const edges = [edge("A", "B"), edge("B", "C")];
    const hidden = getHiddenNodeIds(new Set(["A", "B"]), edges);
    // A collapsed hides B and C; B collapsed also hides C (overlap)
    expect(hidden).toEqual(new Set(["B", "C"]));
  });

  it("returns empty set when nothing is collapsed", () => {
    const edges = [edge("A", "B"), edge("B", "C")];
    expect(getHiddenNodeIds(new Set(), edges)).toEqual(new Set());
  });

  it("returns empty set when collapsed node is a leaf", () => {
    const edges = [edge("A", "B")];
    // Collapsing B (a leaf) — no descendants to hide
    expect(getHiddenNodeIds(new Set(["B"]), edges)).toEqual(new Set());
  });
});
