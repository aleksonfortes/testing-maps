import { describe, it, expect } from "vitest";
import { generateMarkdown } from "@/lib/markdown-generator";
import type { Node, Edge } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(
  id: string,
  data: Partial<ScenarioData> = {},
  position = { x: 0, y: 0 }
): Node {
  return {
    id,
    type: "scenario",
    data: {
      label: "Test",
      status: "untested",
      testType: "manual",
      instructions: "",
      expectedResults: "",
      codeRef: "",
      ...data,
    },
    position,
  };
}

function makeEdge(source: string, target: string): Edge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: "smoothstep",
    animated: true,
  };
}

// ===========================================================================
// Basic Generation
// ===========================================================================
describe("generateMarkdown — basic", () => {
  it("produces only title for empty graph", () => {
    const result = generateMarkdown([], []);
    expect(result).toBe("# Testing Map Export\n\n");
  });

  it("uses custom map name in title", () => {
    const result = generateMarkdown([], [], "Login Tests");
    expect(result).toContain("# Login Tests");
  });

  it("uses default title when no map name", () => {
    const result = generateMarkdown([], []);
    expect(result).toContain("# Testing Map Export");
  });

  it("generates a single root node", () => {
    const nodes = [makeNode("1", { label: "Login", status: "verified", testType: "e2e" })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("- **Login** [VERIFIED] (e2e)");
  });
});

// ===========================================================================
// Status & Field Formatting
// ===========================================================================
describe("generateMarkdown — formatting", () => {
  it("formats status as UPPERCASE", () => {
    const nodes = [makeNode("1", { label: "X", status: "failed" })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("[FAILED]");
  });

  it("shows UNKNOWN for null/undefined status", () => {
    const nodes = [makeNode("1", { label: "X", status: undefined as unknown as ScenarioData["status"] })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("[UNKNOWN]");
  });

  it("shows Untitled for null/undefined label", () => {
    const nodes = [makeNode("1", { label: undefined as unknown as string })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("**Untitled**");
  });

  it("shows unknown for null/undefined testType", () => {
    const nodes = [makeNode("1", { label: "X", testType: undefined as unknown as ScenarioData["testType"] })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("(unknown)");
  });
});

// ===========================================================================
// Sub-fields
// ===========================================================================
describe("generateMarkdown — sub-fields", () => {
  it("includes instructions when present", () => {
    const nodes = [makeNode("1", { label: "X", instructions: "Navigate to page" })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("- *Instructions:* Navigate to page");
  });

  it("includes expected results when present", () => {
    const nodes = [makeNode("1", { label: "X", expectedResults: "Form renders" })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("- *Expected:* Form renders");
  });

  it("includes code ref with backticks", () => {
    const nodes = [makeNode("1", { label: "X", codeRef: "auth.ts" })];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("- *Code:* `auth.ts`");
  });

  it("omits empty sub-fields", () => {
    const nodes = [makeNode("1", { label: "X", instructions: "", expectedResults: "", codeRef: "" })];
    const result = generateMarkdown(nodes, []);
    expect(result).not.toContain("*Instructions:*");
    expect(result).not.toContain("*Expected:*");
    expect(result).not.toContain("*Code:*");
  });
});

// ===========================================================================
// Nested Tree
// ===========================================================================
describe("generateMarkdown — nested tree", () => {
  it("indents children by 2 spaces", () => {
    const nodes = [
      makeNode("1", { label: "Root" }),
      makeNode("2", { label: "Child" }),
    ];
    const edges = [makeEdge("1", "2")];
    const result = generateMarkdown(nodes, edges);
    expect(result).toContain("- **Root**");
    expect(result).toContain("  - **Child**");
  });

  it("indents grandchildren by 4 spaces", () => {
    const nodes = [
      makeNode("1", { label: "Root" }),
      makeNode("2", { label: "Child" }),
      makeNode("3", { label: "Grandchild" }),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3")];
    const result = generateMarkdown(nodes, edges);
    expect(result).toContain("    - **Grandchild**");
  });

  it("handles multiple root nodes", () => {
    const nodes = [
      makeNode("1", { label: "Root A" }),
      makeNode("2", { label: "Root B" }),
    ];
    const result = generateMarkdown(nodes, []);
    expect(result).toContain("- **Root A**");
    expect(result).toContain("- **Root B**");
  });
});

// ===========================================================================
// Cycle Protection
// ===========================================================================
describe("generateMarkdown — cycle protection", () => {
  it("does not infinite loop on circular edges", () => {
    const nodes = [
      makeNode("1", { label: "A" }),
      makeNode("2", { label: "B" }),
    ];
    // Circular: A→B and B→A — neither is a root (both are targets)
    // So rootNodes is empty, result is just the title
    const edges = [makeEdge("1", "2"), makeEdge("2", "1")];
    const result = generateMarkdown(nodes, edges);
    // Should not hang and should produce just the title
    expect(result).toContain("# Testing Map Export");
  });

  it("handles self-loop via visited set", () => {
    const nodes = [makeNode("1", { label: "Self" })];
    const edges = [makeEdge("1", "1")];
    // Node 1 is both source and target, so it's NOT a root
    const result = generateMarkdown(nodes, edges);
    expect(result).toBe("# Testing Map Export\n\n");
  });
});
