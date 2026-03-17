import React, { useCallback, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { getLayoutedElements } from "@/lib/layout";
import {
  REPARENT_DISTANCE_THRESHOLD,
  NODE_WIDTH,
  NODE_MIN_HEIGHT,
  FIT_VIEW_DELAY_MS,
  FIT_VIEW_DURATION_MS,
} from "@/lib/constants";

interface UseDragReparentOptions {
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  fitView: (opts?: { duration?: number }) => void;
  pushSnapshot: (nodes: Node[], edges: Edge[]) => void;
}

export function useDragReparent({
  getNodes,
  getEdges,
  setNodes,
  setEdges,
  fitView,
  pushSnapshot,
}: UseDragReparentOptions) {
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const getDescendants = useCallback(
    (nodeId: string, edgeList: Edge[]): Set<string> => {
      const descendants = new Set<string>();
      const queue = [nodeId];
      while (queue.length > 0) {
        const current = queue.pop()!;
        for (const e of edgeList) {
          if (e.source === current && !descendants.has(e.target)) {
            descendants.add(e.target);
            queue.push(e.target);
          }
        }
      }
      return descendants;
    },
    []
  );

  const findDropTarget = useCallback(
    (draggedNode: Node, allNodes: Node[], allEdges: Edge[]): Node | null => {
      const descendants = getDescendants(draggedNode.id, allEdges);
      const cx = draggedNode.position.x + NODE_WIDTH / 2;
      const cy = draggedNode.position.y + NODE_MIN_HEIGHT / 2;

      let closest: Node | null = null;
      let closestDist = REPARENT_DISTANCE_THRESHOLD;

      for (const n of allNodes) {
        if (n.id === draggedNode.id) continue;
        if (descendants.has(n.id)) continue;

        const nx = n.position.x + NODE_WIDTH / 2;
        const ny = n.position.y + NODE_MIN_HEIGHT / 2;
        const dist = Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2);

        if (dist < closestDist) {
          closestDist = dist;
          closest = n;
        }
      }
      return closest;
    },
    [getDescendants]
  );

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const allNodes = getNodes();
      const allEdges = getEdges();
      const target = findDropTarget(draggedNode, allNodes, allEdges);
      const newTargetId = target?.id ?? null;

      if (newTargetId !== dropTargetId) {
        setDropTargetId(newTargetId);
        setNodes((nds) =>
          nds.map((n) => {
            const shouldHighlight = n.id === newTargetId;
            if (shouldHighlight !== !!n.data.isDropTarget) {
              return { ...n, data: { ...n.data, isDropTarget: shouldHighlight } };
            }
            return n;
          })
        );
      }
    },
    [getNodes, getEdges, findDropTarget, dropTargetId, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      setDropTargetId(null);

      setNodes((nds) =>
        nds.map((n) =>
          n.data.isDropTarget ? { ...n, data: { ...n.data, isDropTarget: false } } : n
        )
      );

      const allNodes = getNodes();
      const allEdges = getEdges();
      const target = findDropTarget(draggedNode, allNodes, allEdges);

      if (!target) {
        pushSnapshot(allNodes, allEdges);
        return;
      }

      const existingParentEdge = allEdges.find(
        (e) => e.target === draggedNode.id && e.source === target.id
      );
      if (existingParentEdge) {
        pushSnapshot(allNodes, allEdges);
        return;
      }

      const newEdges = allEdges.filter((e) => e.target !== draggedNode.id);
      const newEdge: Edge = {
        id: `e-${crypto.randomUUID()}`,
        source: target.id,
        target: draggedNode.id,
        sourceHandle: "source",
        targetHandle: "target",
        animated: true,
        type: "smoothstep",
      };
      newEdges.push(newEdge);

      const { nodes: lNodes, edges: lEdges } = getLayoutedElements(allNodes, newEdges, "LR");
      const styledEdges = lEdges.map((e) => ({ ...e, type: "smoothstep", animated: true }));

      setNodes(lNodes);
      setEdges(styledEdges);
      pushSnapshot(lNodes, styledEdges);

      setTimeout(() => fitView({ duration: FIT_VIEW_DURATION_MS }), FIT_VIEW_DELAY_MS);
    },
    [getNodes, getEdges, findDropTarget, setNodes, setEdges, pushSnapshot, fitView]
  );

  return { onNodeDrag, onNodeDragStop };
}
