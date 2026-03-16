import dagre from "dagre";
import { Node, Edge, Position } from "@xyflow/react";
import { NODE_WIDTH, DEFAULT_NODE_HEIGHT, LAYOUT_NODE_SEP, LAYOUT_RANK_SEP } from "./constants";

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
    const width = NODE_WIDTH;
    const height = node.measured?.height ? Math.round(node.measured.height) : DEFAULT_NODE_HEIGHT;
    graph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    const width = NODE_WIDTH;
    const height = node.measured?.height ? Math.round(node.measured.height) : DEFAULT_NODE_HEIGHT;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: Math.round(nodeWithPosition.x - width / 2),
        y: Math.round(nodeWithPosition.y - height / 2),
      },
    };
  });

  return { nodes: newNodes, edges };
};
