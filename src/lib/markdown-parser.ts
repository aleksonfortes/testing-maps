import type { Node, Edge } from "@xyflow/react";
import type { ScenarioData } from "./types";

interface ParsedNode {
  id: string;
  label: string;
  status: ScenarioData["status"];
  testType: ScenarioData["testType"];
  instructions: string;
  expectedResults: string;
  codeRef: string;
  level: number;
  parentId: string | null;
}

const STATUS_MAP: Record<string, ScenarioData["status"]> = {
  UNTESTED: "untested",
  VERIFIED: "verified",
  FAILED: "failed",
};

const TEST_TYPE_MAP: Record<string, ScenarioData["testType"]> = {
  manual: "manual",
  unit: "unit",
  integration: "integration",
  e2e: "e2e",
};

/**
 * Detect the indentation unit used in the markdown.
 * Scans for the first indented list item and returns the number of spaces
 * (2, 4, etc.) or -1 if tabs are used. Defaults to 2 if no indented items found.
 */
function detectIndentUnit(lines: string[]): number {
  for (const line of lines) {
    const match = line.match(/^(\s+)-\s/);
    if (match) {
      const indent = match[1];
      if (indent.includes("\t")) return -1; // tab-based
      return indent.length; // first indented item determines unit
    }
  }
  return 2; // default
}

/**
 * Compute the indent level from raw whitespace.
 * Normalizes tabs to the detected indent unit, then divides by unit.
 */
function computeIndentLevel(rawIndent: string, indentUnit: number): number {
  const unit = indentUnit === -1 ? 2 : indentUnit; // tabs count as one unit each
  if (indentUnit === -1) {
    // Tab mode: count tabs, ignore spaces
    const tabCount = (rawIndent.match(/\t/g) || []).length;
    return tabCount;
  }
  return Math.floor(rawIndent.length / unit);
}

/**
 * Parse a markdown string (matching the export format) into nodes and edges.
 *
 * Supported formats:
 *   - **Label** [STATUS] (testType)
 *   -   *Instructions:* text
 *   -   *Expected:* text
 *   -   *Code:* `ref`
 *   - Plain text (becomes untested/manual node)
 *   # Heading (becomes a root node)
 */
export function parseMarkdown(markdown: string): { nodes: Node<ScenarioData>[]; edges: Edge[] } {
  const lines = markdown.split("\n");
  const indentUnit = detectIndentUnit(lines);
  const parsedNodes: ParsedNode[] = [];
  const levelStack: { level: number; id: string }[] = [];

  let currentNode: ParsedNode | null = null;

  for (const line of lines) {
    // Skip empty lines and the title
    if (!line.trim()) continue;
    if (/^#\s+Testing Map/.test(line)) continue;

    // Match heading as root node
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      if (currentNode) parsedNodes.push(currentNode);

      const level = 0;
      const id = crypto.randomUUID();
      currentNode = {
        id,
        label: headingMatch[2].trim(),
        status: "untested",
        testType: "manual",
        instructions: "",
        expectedResults: "",
        codeRef: "",
        level,
        parentId: null,
      };
      levelStack.length = 0;
      levelStack.push({ level, id });
      continue;
    }

    // Match sub-fields (instructions, expected, code) — these belong to the current node
    const subFieldMatch = line.match(/^(\s*)-\s+\*(.+?):\*\s+(.+)/);
    if (subFieldMatch && currentNode) {
      const fieldName = subFieldMatch[2].trim().toLowerCase();
      const fieldValue = subFieldMatch[3].trim();
      if (fieldName === "instructions") {
        currentNode.instructions = fieldValue;
      } else if (fieldName === "expected") {
        currentNode.expectedResults = fieldValue;
      } else if (fieldName === "code") {
        currentNode.codeRef = fieldValue.replace(/^`|`$/g, "");
      }
      continue;
    }

    // Match scenario line: - **Label** [STATUS] (testType)
    // Allow optional checkbox before the bold text
    const scenarioMatch = line.match(/^(\s*)-\s+(?:\[[\sxyX]*\]\s+)?\*\*(.+?)\*\*\s*(?:\[(\w+)\])?\s*(?:\((\w+)\))?/);
    if (scenarioMatch) {
      if (currentNode) parsedNodes.push(currentNode);

      const level = computeIndentLevel(scenarioMatch[1], indentUnit) + 1;
      const id = crypto.randomUUID();

      // Find parent from the level stack
      let parentId: string | null = null;
      while (levelStack.length > 0 && levelStack[levelStack.length - 1].level >= level) {
        levelStack.pop();
      }
      if (levelStack.length > 0) {
        parentId = levelStack[levelStack.length - 1].id;
      }

      const rawStatus = (scenarioMatch[3] ?? "").toUpperCase();
      const rawTestType = (scenarioMatch[4] ?? "").toLowerCase();

      currentNode = {
        id,
        label: scenarioMatch[2].trim().replace(/^\s*\[[\sxyX]*\]\s*/, ""),
        status: STATUS_MAP[rawStatus] ?? "untested",
        testType: TEST_TYPE_MAP[rawTestType] ?? "manual",
        instructions: "",
        expectedResults: "",
        codeRef: "",
        level,
        parentId,
      };
      levelStack.push({ level, id });
      continue;
    }

    // Match plain list item: - Text
    const plainMatch = line.match(/^(\s*)-\s+(.+)/);
    if (plainMatch) {
      if (currentNode) parsedNodes.push(currentNode);

      const level = computeIndentLevel(plainMatch[1], indentUnit) + 1;
      const id = crypto.randomUUID();

      while (levelStack.length > 0 && levelStack[levelStack.length - 1].level >= level) {
        levelStack.pop();
      }
      let parentId: string | null = null;
      if (levelStack.length > 0) {
        parentId = levelStack[levelStack.length - 1].id;
      }

      currentNode = {
        id,
        label: plainMatch[2].trim().replace(/^\s*\[[\sxyX]*\]\s*/, ""),
        status: "untested",
        testType: "manual",
        instructions: "",
        expectedResults: "",
        codeRef: "",
        level,
        parentId,
      };
      levelStack.push({ level, id });
      continue;
    }
  }

  // Push the last node
  if (currentNode) parsedNodes.push(currentNode);

  // Convert to ReactFlow nodes and edges
  const nodes: Node<ScenarioData>[] = parsedNodes.map((pn, i) => ({
    id: pn.id,
    type: "scenario" as const,
    data: {
      label: pn.label,
      status: pn.status,
      testType: pn.testType,
      instructions: pn.instructions,
      expectedResults: pn.expectedResults,
      codeRef: pn.codeRef,
    },
    position: { x: pn.level * 400, y: i * 200 },
  }));

  const edges: Edge[] = parsedNodes
    .filter((pn) => pn.parentId !== null)
    .map((pn) => ({
      id: `e-${crypto.randomUUID()}`,
      source: pn.parentId!,
      target: pn.id,
      sourceHandle: "source",
      targetHandle: "target",
      animated: true,
      type: "smoothstep",
    }));

  return { nodes, edges };
}
