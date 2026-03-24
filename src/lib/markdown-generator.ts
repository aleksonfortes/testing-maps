import type { Node, Edge } from "@xyflow/react";
import type { ScenarioData } from "./types";

/**
 * Generate a markdown string from a set of nodes and edges.
 * Uses DFS tree traversal from root nodes (nodes with no incoming edges).
 *
 * When there is a single root node, its label becomes the `# Heading` and
 * only its children are emitted as list items. This keeps the round-trip
 * parse → generate → parse stable.
 */
export function generateMarkdown(
  nodes: Node[],
  edges: Edge[],
  mapName?: string
): string {
  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  const processNode = (node: Node, level: number, visited: Set<string>) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const data = node.data as ScenarioData;
    const status = data.status ? data.status.toUpperCase() : "UNKNOWN";
    const testType = data.testType ?? "unknown";
    result += `${"  ".repeat(level)}- **${data.label ?? "Untitled"}** [${status}] (${testType})\n`;
    if (data.instructions)
      result += `${"  ".repeat(level)}  - *Instructions:* ${data.instructions}\n`;
    if (data.expectedResults)
      result += `${"  ".repeat(level)}  - *Expected:* ${data.expectedResults}\n`;
    if (data.codeRef)
      result += `${"  ".repeat(level)}  - *Code:* \`${data.codeRef}\`\n`;
    if (data.priority)
      result += `${"  ".repeat(level)}  - *Priority:* ${data.priority}\n`;
    if (data.risk)
      result += `${"  ".repeat(level)}  - *Risk:* ${data.risk}\n`;

    const children = nodes.filter((n) =>
      edges.some((e) => e.source === node.id && e.target === n.id)
    );
    children.forEach((child) => processNode(child, level + 1, visited));
  };

  let result: string;

  if (rootNodes.length === 1) {
    const root = rootNodes[0];
    const rootData = root.data as ScenarioData;
    const children = nodes.filter((n) =>
      edges.some((e) => e.source === root.id && e.target === n.id)
    );

    if (children.length > 0) {
      // Single root with children: use its label as the heading, emit children
      // This keeps round-trip (parse → generate → parse) stable
      const title = mapName || rootData.label || "Testing Map Export";
      result = `# ${title}\n\n`;
      const visited = new Set<string>([root.id]);
      children.forEach((child) => processNode(child, 0, visited));
    } else {
      // Single leaf node: emit as list item to preserve metadata
      const title = mapName || "Testing Map Export";
      result = `# ${title}\n\n`;
      processNode(root, 0, new Set());
    }
  } else {
    // Multiple roots: use mapName as heading, emit all roots
    const title = mapName || "Testing Map Export";
    result = `# ${title}\n\n`;
    rootNodes.forEach((root) => processNode(root, 0, new Set()));
  }

  return result;
}
