import dagre from "dagre";
import { Node, Edge, Position } from "@xyflow/react";

import { NODE_WIDTH } from "./constants";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = NODE_WIDTH;
const nodeHeight = 200; 

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 300,
    ranksep: 400,
  });

  nodes.forEach((node) => {
    // Force integer widths and heights to prevent sub-pixel drift
    const width = nodeWidth;
    const height = node.measured?.height ? Math.round(node.measured.height) : nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = nodeWidth;
    const height = node.measured?.height ? Math.round(node.measured.height) : nodeHeight;
    
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        // Use Math.round on results to ensure absolute pixel alignment
        x: Math.round(nodeWithPosition.x - width / 2),
        y: Math.round(nodeWithPosition.y - height / 2),
      },
    };
  });

  return { nodes: newNodes, edges };
};
