import type { Node, Edge } from "@xyflow/react";
import type { ScenarioData } from "./types";

/**
 * Generate a markdown string from a set of nodes and edges.
 * Uses DFS tree traversal from root nodes (nodes with no incoming edges).
 */
export function generateMarkdown(
  nodes: Node[],
  edges: Edge[],
  mapName?: string
): string {
  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );
  const title = mapName || "Testing Map Export";
  let result = `# ${title}\n\n`;

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

    const children = nodes.filter((n) =>
      edges.some((e) => e.source === node.id && e.target === n.id)
    );
    children.forEach((child) => processNode(child, level + 1, visited));
  };

  rootNodes.forEach((root) => processNode(root, 0, new Set()));
  return result;
}
