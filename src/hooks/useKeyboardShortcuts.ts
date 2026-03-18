import { useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";

interface UseKeyboardShortcutsOptions {
  editingNodeId: string | null;
  addNode: (parentId?: string) => void;
  nodesRef: React.RefObject<Node[]>;
  getNodes: () => Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  handleUndo: () => void;
  handleRedo: () => void;
  pushSnapshot: (nodes: Node[], edges: Edge[]) => void;
}

export function useKeyboardShortcuts({
  editingNodeId,
  addNode,
  nodesRef,
  getNodes,
  setNodes,
  setEdges,
  handleUndo,
  handleRedo,
  pushSnapshot,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) return;

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      const isMod = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl+Z
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
      if ((isMod && e.key === "z" && e.shiftKey) || (isMod && e.key === "y")) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Tab: only when canvas is focused, not in form fields
      if (e.key === "Tab" && !isInput) {
        const isCanvasFocused = target.closest(".react-flow") !== null;
        if (isCanvasFocused) {
          e.preventDefault();
          // Use nodesRef (React state) instead of getNodes() (ReactFlow store)
          // to avoid stale selection state from store sync timing
          const selected = nodesRef.current.find((n: Node) => n.selected);
          addNode(selected?.id);
        }
      }

      // Delete/Backspace: batch delete, skip form fields
      if ((e.key === "Backspace" || e.key === "Delete") && !isInput) {
        const allNodes = getNodes();
        const selectedNodes = allNodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          const ids = new Set(selectedNodes.map((n) => n.id));
          // Compute updated lists from the ReactFlow store snapshot (avoids nested setState)
          const updatedNodes = allNodes.filter((n) => !ids.has(n.id));
          setNodes(updatedNodes);
          setEdges((eds) => {
            const updatedEdges = eds.filter(
              (edge) => !ids.has(edge.source) && !ids.has(edge.target)
            );
            pushSnapshot(updatedNodes, updatedEdges);
            return updatedEdges;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingNodeId, addNode, nodesRef, getNodes, setNodes, setEdges, handleUndo, handleRedo, pushSnapshot]);
}
