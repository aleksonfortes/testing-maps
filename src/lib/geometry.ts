import { Position, type InternalNode, type Node } from "@xyflow/react";

// returns the position (top, right, bottom or left) of nodeA relative to nodeB
import { NODE_WIDTH, DEFAULT_NODE_HEIGHT } from "./constants";

function getIntersection(node: InternalNode | Node, otherNode: InternalNode | Node) {
  const width = node.measured?.width ?? NODE_WIDTH;
  const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const centerA = {
    x: node.position.x + halfWidth,
    y: node.position.y + halfHeight,
  };
  const centerB = {
    x: otherNode.position.x + (otherNode.measured?.width ?? NODE_WIDTH) / 2,
    y: otherNode.position.y + (otherNode.measured?.height ?? DEFAULT_NODE_HEIGHT) / 2,
  };

  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;

  // Handle case where nodes are at the exact same position
  if (dx === 0 && dy === 0) {
    return [centerA.x, centerA.y, Position.Top] as const;
  }

  if (Math.abs(dx * halfHeight) > Math.abs(dy * halfWidth)) {
    // Intersection with left or right side
    const x = centerA.x + (dx > 0 ? halfWidth : -halfWidth);
    const y = centerA.y + (dx === 0 ? 0 : (dy * (dx > 0 ? halfWidth : -halfWidth)) / dx);
    const pos = dx > 0 ? Position.Right : Position.Left;
    return [x, y, pos] as const;
  } else {
    // Intersection with top or bottom side
    const y = centerA.y + (dy > 0 ? halfHeight : -halfHeight);
    const x = centerA.x + (dy === 0 ? 0 : (dx * (dy > 0 ? halfHeight : -halfHeight)) / dy);
    const pos = dy > 0 ? Position.Bottom : Position.Top;
    return [x, y, pos] as const;
  }
}

export function getEdgeParams(source: InternalNode | Node, target: InternalNode | Node) {
  const [sx, sy, sourcePos] = getIntersection(source, target);
  const [tx, ty, targetPos] = getIntersection(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}
