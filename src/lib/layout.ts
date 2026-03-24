import dagre from "dagre";
import { Node, Edge, Position } from "@xyflow/react";
import { NODE_WIDTH, LAYOUT_NODE_SEP, LAYOUT_RANK_SEP } from "./constants";

/** Estimate rendered height based on node data content.
 *  Used when the node hasn't been measured yet (e.g., fresh import).
 *  Accounts for p-6 padding (48px), icon+label row, separator, badge,
 *  and each metadata section that may be visible via filters. */
function estimateNodeHeight(node: Node): number {
  const data = node.data as Record<string, unknown>;
  // Base: padding (48) + icon+label row (48) + separator+testType badge (44)
  let height = 140;
  // Each metadata section: label (20) + text (24) + spacing (16) ≈ 60px
  if (data.instructions) height += 60;
  if (data.expectedResults) height += 60;
  if (data.codeRef) height += 55;
  if (data.priority) height += 40;
  if (data.risk) height += 40;
  return height;
}

function getNodeHeight(node: Node): number {
  return node.measured?.height
    ? Math.round(node.measured.height)
    : estimateNodeHeight(node);
}

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const isHorizontal = direction === "LR";

  // Create a fresh graph each call to prevent stale node/edge accumulation
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: LAYOUT_NODE_SEP,
    ranksep: LAYOUT_RANK_SEP,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: getNodeHeight(node) });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    const height = getNodeHeight(node);

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: Math.round(nodeWithPosition.x - NODE_WIDTH / 2),
        y: Math.round(nodeWithPosition.y - height / 2),
      },
    };
  });

  return { nodes: newNodes, edges };
};
