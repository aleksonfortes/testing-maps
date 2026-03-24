import { describe, it, expect } from "vitest";
import { parseMarkdown } from "@/lib/markdown-parser";
import { generateMarkdown } from "@/lib/markdown-generator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Shorthand to get node labels from parse result */
function labels(md: string) {
  return parseMarkdown(md).nodes.map((n) => n.data.label);
}

/** Get parent→child label pairs from parse result */
function edgePairs(md: string) {
  const { nodes, edges } = parseMarkdown(md);
  const nodeMap = new Map(nodes.map((n) => [n.id, n.data.label as string]));
  return edges.map((e) => [nodeMap.get(e.source), nodeMap.get(e.target)]);
}

// ===========================================================================
// Basic Parsing
// ===========================================================================
describe("parseMarkdown — basic parsing", () => {
  it("parses a single scenario with status and test type", () => {
    const { nodes, edges } = parseMarkdown("- **Login** [VERIFIED] (e2e)");
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodes[0].data.label).toBe("Login");
    expect(nodes[0].data.status).toBe("verified");
    expect(nodes[0].data.testType).toBe("e2e");
  });

  it("parses a plain list item as untested/manual", () => {
    const { nodes } = parseMarkdown("- Some test case");
    expect(nodes).toHaveLength(1);
    expect(nodes[0].data.label).toBe("Some test case");
    expect(nodes[0].data.status).toBe("untested");
    expect(nodes[0].data.testType).toBe("manual");
  });

  it("parses a heading as a root node", () => {
    const { nodes } = parseMarkdown("# Auth Tests");
    expect(nodes).toHaveLength(1);
    expect(nodes[0].data.label).toBe("Auth Tests");
    expect(nodes[0].data.status).toBe("untested");
  });

  it("all nodes have type 'scenario'", () => {
    const { nodes } = parseMarkdown("- **A** [VERIFIED] (e2e)\n- **B** [FAILED] (unit)");
    expect(nodes.every((n) => n.type === "scenario")).toBe(true);
  });
});

// ===========================================================================
// Nested Scenarios
// ===========================================================================
describe("parseMarkdown — nested scenarios", () => {
  it("creates parent→child edge with 2-space indent", () => {
    const md = "- **Parent** [VERIFIED] (e2e)\n  - **Child** [UNTESTED] (manual)";
    const { nodes, edges } = parseMarkdown(md);
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe(nodes[0].id);
    expect(edges[0].target).toBe(nodes[1].id);
  });

  it("creates 3-level hierarchy correctly", () => {
    const md = [
      "- **Root** [VERIFIED] (e2e)",
      "  - **Child** [UNTESTED] (manual)",
      "    - **Grandchild** [FAILED] (unit)",
    ].join("\n");
    const pairs = edgePairs(md);
    expect(pairs).toEqual([
      ["Root", "Child"],
      ["Child", "Grandchild"],
    ]);
  });

  it("siblings connect to the same parent", () => {
    const md = [
      "- **Parent** [VERIFIED] (e2e)",
      "  - **Child A** [UNTESTED] (manual)",
      "  - **Child B** [UNTESTED] (manual)",
    ].join("\n");
    const { nodes, edges } = parseMarkdown(md);
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
    // Both edges should have the same source (Parent)
    expect(edges[0].source).toBe(edges[1].source);
  });

  it("child followed by sibling at parent level links correctly", () => {
    const md = [
      "- **A** [VERIFIED] (e2e)",
      "  - **B** [UNTESTED] (manual)",
      "- **C** [UNTESTED] (manual)",
    ].join("\n");
    const pairs = edgePairs(md);
    // B is child of A, C is a root — no edge from A to C
    expect(pairs).toEqual([["A", "B"]]);
  });
});

// ===========================================================================
// Sub-fields
// ===========================================================================
describe("parseMarkdown — sub-fields", () => {
  it("captures instructions", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Instructions:* Navigate to /login";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.instructions).toBe("Navigate to /login");
  });

  it("captures expected results", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Expected:* Form renders correctly";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.expectedResults).toBe("Form renders correctly");
  });

  it("captures code ref with backticks stripped", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Code:* `src/auth.ts`";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.codeRef).toBe("src/auth.ts");
  });

  it("captures multiple sub-fields on one node", () => {
    const md = [
      "- **Test** [VERIFIED] (e2e)",
      "  - *Instructions:* Do the thing",
      "  - *Expected:* Thing happens",
      "  - *Code:* `test.ts`",
    ].join("\n");
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.instructions).toBe("Do the thing");
    expect(nodes[0].data.expectedResults).toBe("Thing happens");
    expect(nodes[0].data.codeRef).toBe("test.ts");
  });

  it("does not crash when sub-field appears without parent node", () => {
    const md = "  - *Instructions:* No parent here";
    // Should not throw — sub-field is ignored because currentNode is null
    expect(() => parseMarkdown(md)).not.toThrow();
  });
});

// ===========================================================================
// Status Mapping
// ===========================================================================
describe("parseMarkdown — status mapping", () => {
  it.each([
    ["VERIFIED", "verified"],
    ["FAILED", "failed"],
    ["UNTESTED", "untested"],
  ] as const)("maps [%s] → %s", (input, expected) => {
    const { nodes } = parseMarkdown(`- **Test** [${input}] (manual)`);
    expect(nodes[0].data.status).toBe(expected);
  });

  it("defaults missing status to untested", () => {
    const { nodes } = parseMarkdown("- **Test** (manual)");
    expect(nodes[0].data.status).toBe("untested");
  });

  it("defaults unknown status to untested", () => {
    const { nodes } = parseMarkdown("- **Test** [BLOCKED] (manual)");
    expect(nodes[0].data.status).toBe("untested");
  });

  it("handles lowercase status via toUpperCase", () => {
    const { nodes } = parseMarkdown("- **Test** [verified] (manual)");
    expect(nodes[0].data.status).toBe("verified");
  });
});

// ===========================================================================
// TestType Mapping
// ===========================================================================
describe("parseMarkdown — testType mapping", () => {
  it.each([
    ["manual", "manual"],
    ["unit", "unit"],
    ["integration", "integration"],
    ["e2e", "e2e"],
  ] as const)("maps (%s) → %s", (input, expected) => {
    const { nodes } = parseMarkdown(`- **Test** [UNTESTED] (${input})`);
    expect(nodes[0].data.testType).toBe(expected);
  });

  it("defaults missing test type to manual", () => {
    const { nodes } = parseMarkdown("- **Test** [UNTESTED]");
    expect(nodes[0].data.testType).toBe("manual");
  });

  it("defaults unknown test type to manual", () => {
    const { nodes } = parseMarkdown("- **Test** [UNTESTED] (smoke)");
    expect(nodes[0].data.testType).toBe("manual");
  });
});

// ===========================================================================
// Indentation Variants
// ===========================================================================
describe("parseMarkdown — indentation", () => {
  it("handles 4-space indentation", () => {
    const md = "- **Parent** [VERIFIED] (e2e)\n    - **Child** [UNTESTED] (manual)";
    const pairs = edgePairs(md);
    expect(pairs).toEqual([["Parent", "Child"]]);
  });

  it("handles tab-based indentation", () => {
    const md = "- **Parent** [VERIFIED] (e2e)\n\t- **Child** [UNTESTED] (manual)";
    const pairs = edgePairs(md);
    expect(pairs).toEqual([["Parent", "Child"]]);
  });

  it("handles deep 4-space nesting", () => {
    const md = [
      "- **A** [VERIFIED] (e2e)",
      "    - **B** [UNTESTED] (manual)",
      "        - **C** [UNTESTED] (manual)",
    ].join("\n");
    const pairs = edgePairs(md);
    expect(pairs).toEqual([
      ["A", "B"],
      ["B", "C"],
    ]);
  });
});

// ===========================================================================
// Heading Handling
// ===========================================================================
describe("parseMarkdown — headings", () => {
  it("parses '# Testing Map...' heading as root node", () => {
    const md = "# Testing Map Export\n\n- **Node** [VERIFIED] (e2e)";
    const { nodes, edges } = parseMarkdown(md);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].data.label).toBe("Testing Map Export");
    expect(nodes[1].data.label).toBe("Node");
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe(nodes[0].id);
    expect(edges[0].target).toBe(nodes[1].id);
  });

  it("treats custom headings as root nodes", () => {
    const md = "# My Custom Map\n- **Child** [VERIFIED] (e2e)";
    const { nodes, edges } = parseMarkdown(md);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].data.label).toBe("My Custom Map");
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe(nodes[0].id);
  });

  it("sub-headings (##) also become root nodes", () => {
    const md = "## Section\n- **Item** [UNTESTED] (manual)";
    const { nodes } = parseMarkdown(md);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].data.label).toBe("Section");
  });
});

// ===========================================================================
// Malformed Input
// ===========================================================================
describe("parseMarkdown — malformed input", () => {
  it("returns empty arrays for empty string", () => {
    const { nodes, edges } = parseMarkdown("");
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it("returns empty arrays for whitespace only", () => {
    const { nodes, edges } = parseMarkdown("   \n  \n\t\n");
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it("returns empty arrays for random text (no markers)", () => {
    const { nodes, edges } = parseMarkdown("this is just some random text\nwith multiple lines");
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it("handles missing status brackets gracefully", () => {
    const { nodes } = parseMarkdown("- **No Status** (manual)");
    expect(nodes[0].data.status).toBe("untested");
  });

  it("handles missing test type gracefully", () => {
    const { nodes } = parseMarkdown("- **No Type** [VERIFIED]");
    expect(nodes[0].data.testType).toBe("manual");
  });

  it("handles extra blank lines between items", () => {
    const md = "- **A** [VERIFIED] (e2e)\n\n\n- **B** [FAILED] (unit)";
    expect(labels(md)).toEqual(["A", "B"]);
  });

  it("preserves special characters in labels", () => {
    const { nodes } = parseMarkdown('- **Login & "Signup" <Test>** [VERIFIED] (e2e)');
    expect(nodes[0].data.label).toBe('Login & "Signup" <Test>');
  });

  it("preserves unicode and emoji in labels", () => {
    const { nodes } = parseMarkdown("- **Login ✅ テスト** [VERIFIED] (e2e)");
    expect(nodes[0].data.label).toBe("Login ✅ テスト");
  });

  it("handles very long labels without truncation", () => {
    const longLabel = "A".repeat(500);
    const { nodes } = parseMarkdown(`- **${longLabel}** [VERIFIED] (e2e)`);
    expect(nodes[0].data.label).toBe(longLabel);
  });

  it("handles duplicate labels as separate nodes", () => {
    const md = "- **Same Name** [VERIFIED] (e2e)\n- **Same Name** [FAILED] (unit)";
    const { nodes } = parseMarkdown(md);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).not.toBe(nodes[1].id);
  });

  it("handles deeply nested structure (10+ levels)", () => {
    const lines: string[] = [];
    for (let i = 0; i < 12; i++) {
      lines.push(`${"  ".repeat(i)}- **Level ${i}** [UNTESTED] (manual)`);
    }
    const { nodes, edges } = parseMarkdown(lines.join("\n"));
    expect(nodes).toHaveLength(12);
    expect(edges).toHaveLength(11); // each connects to previous
  });

  it("handles Windows line endings (\\r\\n)", () => {
    const md = "- **A** [VERIFIED] (e2e)\r\n  - **B** [UNTESTED] (manual)\r\n";
    const { nodes, edges } = parseMarkdown(md);
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
  });
});

// ===========================================================================
// Edge Properties
// ===========================================================================
describe("parseMarkdown — edge properties", () => {
  it("all edges have correct handle and style properties", () => {
    const md = "- **A** [VERIFIED] (e2e)\n  - **B** [UNTESTED] (manual)";
    const { edges } = parseMarkdown(md);
    expect(edges[0]).toMatchObject({
      animated: true,
      type: "floating",
    });
    expect(edges[0]).not.toHaveProperty("sourceHandle");
    expect(edges[0]).not.toHaveProperty("targetHandle");
  });

  it("edge IDs are unique", () => {
    const md = [
      "- **Root** [VERIFIED] (e2e)",
      "  - **A** [UNTESTED] (manual)",
      "  - **B** [UNTESTED] (manual)",
    ].join("\n");
    const { edges } = parseMarkdown(md);
    const ids = edges.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("edge IDs start with 'e-'", () => {
    const md = "- **A** [VERIFIED] (e2e)\n  - **B** [UNTESTED] (manual)";
    const { edges } = parseMarkdown(md);
    expect(edges[0].id).toMatch(/^e-/);
  });
});

// ===========================================================================
// Position Calculation
// ===========================================================================
describe("parseMarkdown — node positions", () => {
  it("assigns position based on level and index", () => {
    const md = [
      "- **Root** [VERIFIED] (e2e)",
      "  - **Child** [UNTESTED] (manual)",
    ].join("\n");
    const { nodes } = parseMarkdown(md);
    // Root: level=1, index=0 → x=400, y=0
    // Child: level=2, index=1 → x=800, y=200
    expect(nodes[0].position.x).toBe(400);
    expect(nodes[0].position.y).toBe(0);
    expect(nodes[1].position.x).toBe(800);
    expect(nodes[1].position.y).toBe(200);
  });
});

// ===========================================================================
// Scale Test
// ===========================================================================
describe("parseMarkdown — large files", () => {
  it("parses 100+ node markdown correctly", () => {
    const lines: string[] = [];
    // Create a flat list of 150 items
    for (let i = 0; i < 150; i++) {
      lines.push(`- **Scenario ${i}** [VERIFIED] (e2e)`);
    }
    const { nodes, edges } = parseMarkdown(lines.join("\n"));
    expect(nodes).toHaveLength(150);
    expect(edges).toHaveLength(0); // all roots, no edges
  });

  it("parses 100+ node tree with edges", () => {
    const lines: string[] = [];
    // Create 10 root groups with 10 children each
    for (let g = 0; g < 10; g++) {
      lines.push(`- **Group ${g}** [VERIFIED] (e2e)`);
      for (let c = 0; c < 10; c++) {
        lines.push(`  - **Child ${g}-${c}** [UNTESTED] (manual)`);
      }
    }
    const { nodes, edges } = parseMarkdown(lines.join("\n"));
    expect(nodes).toHaveLength(110); // 10 parents + 100 children
    expect(edges).toHaveLength(100); // 10 children per parent
  });

  it("handles a deep chain of 50 levels", () => {
    const lines: string[] = [];
    for (let i = 0; i < 50; i++) {
      lines.push(`${"  ".repeat(i)}- **Level ${i}** [UNTESTED] (manual)`);
    }
    const { nodes, edges } = parseMarkdown(lines.join("\n"));
    expect(nodes).toHaveLength(50);
    expect(edges).toHaveLength(49);
  });
});

// ===========================================================================
// Round-trip Test
// ===========================================================================
describe("parseMarkdown — round-trip with generator", () => {
  it("generate → parse → generate produces equivalent output", () => {
    const md = [
      "# My Test Map",
      "",
      "- **Login Flow** [VERIFIED] (e2e)",
      "  - *Instructions:* Navigate to /login",
      "  - *Expected:* Form renders",
      "  - **Valid Credentials** [UNTESTED] (manual)",
      "    - *Instructions:* Enter valid user/pass",
      "    - *Expected:* Redirects to dashboard",
      "  - **Invalid Credentials** [FAILED] (unit)",
      "    - *Instructions:* Enter bad password",
      "    - *Expected:* Error shown",
      "    - *Code:* `auth.test.ts`",
      "- **Registration** [UNTESTED] (integration)",
    ].join("\n");

    // First parse
    const result1 = parseMarkdown(md);
    expect(result1.nodes.length).toBeGreaterThan(0);

    // Generate from parsed result
    const generated = generateMarkdown(result1.nodes, result1.edges);

    // Parse again
    const result2 = parseMarkdown(generated);

    // Structural equivalence: same number of nodes and edges
    expect(result2.nodes).toHaveLength(result1.nodes.length);
    expect(result2.edges).toHaveLength(result1.edges.length);

    // Same labels in same order
    const labels1 = result1.nodes.map((n) => n.data.label);
    const labels2 = result2.nodes.map((n) => n.data.label);
    expect(labels2).toEqual(labels1);

    // Same statuses
    const statuses1 = result1.nodes.map((n) => n.data.status);
    const statuses2 = result2.nodes.map((n) => n.data.status);
    expect(statuses2).toEqual(statuses1);
  });
});

// ===========================================================================
// Priority & Risk Fields
// ===========================================================================
describe("parseMarkdown — priority and risk", () => {
  it("captures priority field", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Priority:* high";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.priority).toBe("high");
  });

  it("captures risk field", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Risk:* medium";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.risk).toBe("medium");
  });

  it("captures all priority levels", () => {
    for (const level of ["low", "medium", "high", "critical"]) {
      const md = `- **Test** [VERIFIED] (e2e)\n  - *Priority:* ${level}`;
      const { nodes } = parseMarkdown(md);
      expect(nodes[0].data.priority).toBe(level);
    }
  });

  it("captures all risk levels", () => {
    for (const level of ["low", "medium", "high"]) {
      const md = `- **Test** [VERIFIED] (e2e)\n  - *Risk:* ${level}`;
      const { nodes } = parseMarkdown(md);
      expect(nodes[0].data.risk).toBe(level);
    }
  });

  it("handles priority and risk together with other fields", () => {
    const md = [
      "- **Test** [VERIFIED] (e2e)",
      "  - *Instructions:* Do something",
      "  - *Expected:* It works",
      "  - *Code:* `test.ts`",
      "  - *Priority:* critical",
      "  - *Risk:* high",
    ].join("\n");
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.priority).toBe("critical");
    expect(nodes[0].data.risk).toBe("high");
    expect(nodes[0].data.instructions).toBe("Do something");
    expect(nodes[0].data.expectedResults).toBe("It works");
    expect(nodes[0].data.codeRef).toBe("test.ts");
  });

  it("ignores unknown priority values", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Priority:* urgent";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.priority).toBeUndefined();
  });

  it("ignores unknown risk values", () => {
    const md = "- **Test** [VERIFIED] (e2e)\n  - *Risk:* extreme";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.risk).toBeUndefined();
  });

  it("nodes without priority/risk have undefined values", () => {
    const md = "- **Test** [VERIFIED] (e2e)";
    const { nodes } = parseMarkdown(md);
    expect(nodes[0].data.priority).toBeUndefined();
    expect(nodes[0].data.risk).toBeUndefined();
  });
});
