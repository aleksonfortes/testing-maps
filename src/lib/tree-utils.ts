import type { Edge } from "@xyflow/react";

/** Get all descendant node IDs of a given node via edges (source → target). */
export function getDescendantIds(nodeId: string, edges: Edge[]): Set<string> {
  const childMap = new Map<string, string[]>();
  for (const edge of edges) {
    const children = childMap.get(edge.source) || [];
    children.push(edge.target);
    childMap.set(edge.source, children);
  }

  const result = new Set<string>();
  const stack = [nodeId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = childMap.get(current) || [];
    for (const child of children) {
      if (!result.has(child)) {
        result.add(child);
        stack.push(child);
      }
    }
  }
  return result;
}

/**
 * Given a set of collapsed node IDs, return all node IDs that should be hidden
 * (all descendants of collapsed nodes).
 */
export function getHiddenNodeIds(collapsed: Set<string>, edges: Edge[]): Set<string> {
  const hidden = new Set<string>();
  for (const collapsedId of collapsed) {
    const descendants = getDescendantIds(collapsedId, edges);
    for (const id of descendants) {
      hidden.add(id);
    }
  }
  return hidden;
}
