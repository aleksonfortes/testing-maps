import { useCallback, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { MAX_UNDO_HISTORY } from "@/lib/constants";

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

/** Strip ReactFlow runtime properties that aren't cloneable / aren't ours */
function cleanNodes(nodes: Node[]): Node[] {
  return nodes.map(({ id, type, data, position, selected }) => {
    // Strip runtime-only flags like isDropTarget
    const { isDropTarget: _, ...cleanData } = data as Record<string, unknown>;
    return {
      id,
      type,
      data: cleanData,
      position,
      ...(selected !== undefined ? { selected } : {}),
    };
  }) as Node[];
}

function cleanEdges(edges: Edge[]): Edge[] {
  return edges.map(({ id, source, target, sourceHandle, targetHandle, type, animated }) => ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type,
    animated,
  }));
}

export function useUndoRedo() {
  const historyRef = useRef<Snapshot[]>([]);
  const pointerRef = useRef(-1);
  const isRestoringRef = useRef(false);
  // Counter to force re-render so canUndo/canRedo update in the UI
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  /** Push a new snapshot onto the history stack. Clears any redo history. */
  const pushSnapshot = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (isRestoringRef.current) return;

      const snapshot: Snapshot = {
        nodes: cleanNodes(nodes),
        edges: cleanEdges(edges),
      };

      const newHistory = historyRef.current.slice(0, pointerRef.current + 1);
      newHistory.push(snapshot);

      if (newHistory.length > MAX_UNDO_HISTORY) {
        newHistory.shift();
      }

      historyRef.current = newHistory;
      pointerRef.current = newHistory.length - 1;
      bump();
    },
    [bump]
  );

  /** Undo: restore the previous snapshot. Returns null if nothing to undo. */
  const undo = useCallback((): Snapshot | null => {
    if (pointerRef.current <= 0) return null;
    pointerRef.current -= 1;
    isRestoringRef.current = true;
    const snapshot = historyRef.current[pointerRef.current];
    bump();
    return {
      nodes: cleanNodes(snapshot.nodes),
      edges: cleanEdges(snapshot.edges),
    };
  }, [bump]);

  /** Redo: restore the next snapshot. Returns null if nothing to redo. */
  const redo = useCallback((): Snapshot | null => {
    if (pointerRef.current >= historyRef.current.length - 1) return null;
    pointerRef.current += 1;
    isRestoringRef.current = true;
    const snapshot = historyRef.current[pointerRef.current];
    bump();
    return {
      nodes: cleanNodes(snapshot.nodes),
      edges: cleanEdges(snapshot.edges),
    };
  }, [bump]);

  /** Call this after undo/redo state has been applied to allow future snapshots */
  const finishRestore = useCallback(() => {
    isRestoringRef.current = false;
  }, []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  return { pushSnapshot, undo, redo, finishRestore, canUndo, canRedo };
}
