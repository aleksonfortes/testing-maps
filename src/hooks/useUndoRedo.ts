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
    const { isDropTarget, ...cleanData } = data as Record<string, unknown>;
    void isDropTarget; // Satisfy no-unused-vars
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
  return edges.map(({ id, source, target, type, animated }) => ({
    id,
    source,
    target,
    type,
    animated,
  }));
}

export function useUndoRedo() {
  const historyRef = useRef<Snapshot[]>([]);
  const pointerRef = useRef(-1);
  const isRestoringRef = useRef(false);
  
  // Track history state for rendering (satisfies react-hooks/refs)
  const [historyState, setHistoryState] = useState({ 
    pointer: -1, 
    length: 0 
  });

  const bump = useCallback((pointer: number, length: number) => {
    setHistoryState({ pointer, length });
  }, []);

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
      bump(pointerRef.current, historyRef.current.length);
    },
    [bump]
  );

  /** Undo: restore the previous snapshot. Returns null if nothing to undo. */
  const undo = useCallback((): Snapshot | null => {
    if (pointerRef.current <= 0) return null;
    pointerRef.current -= 1;
    isRestoringRef.current = true;
    const snapshot = historyRef.current[pointerRef.current];
    bump(pointerRef.current, historyRef.current.length);
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
    bump(pointerRef.current, historyRef.current.length);
    return {
      nodes: cleanNodes(snapshot.nodes),
      edges: cleanEdges(snapshot.edges),
    };
  }, [bump]);

  /** Call this after undo/redo state has been applied to allow future snapshots */
  const finishRestore = useCallback(() => {
    isRestoringRef.current = false;
  }, []);

  const canUndo = historyState.pointer > 0;
  const canRedo = historyState.pointer < historyState.length - 1;

  return { pushSnapshot, undo, redo, finishRestore, canUndo, canRedo };
}
