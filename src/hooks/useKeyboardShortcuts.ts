import { useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";

interface UseKeyboardShortcutsOptions {
  editingNodeId: string | null;
  addNode: (parentId?: string) => void;
  nodesRef: React.RefObject<Node[]>;
  getNodes: () => Node[];
  getEdges: () => Edge[];
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
  getEdges,
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

      // Tab: add child node — works anywhere unless typing in a form field
      if (e.key === "Tab" && !isInput) {
        e.preventDefault();
        // Use nodesRef (React state) instead of getNodes() (ReactFlow store)
        // to avoid stale selection state from store sync timing
        const selected = nodesRef.current.find((n: Node) => n.selected);
        addNode(selected?.id);
      }

      // Select All: Cmd/Ctrl+A — select all visible nodes and edges
      if (isMod && e.key === "a" && !isInput) {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: !n.hidden })));
        setEdges((eds) => eds.map((e) => ({ ...e, selected: !e.hidden })));
        return;
      }

      // Delete/Backspace: batch delete selected nodes and/or edges, skip form fields
      if ((e.key === "Backspace" || e.key === "Delete") && !isInput) {
        const allNodes = getNodes();
        const allEdges = getEdges();
        const selectedNodes = allNodes.filter((n) => n.selected);
        const selectedEdgeIds = new Set(allEdges.filter((e) => e.selected).map((e) => e.id));
        const nodeIds = new Set(selectedNodes.map((n) => n.id));

        if (selectedNodes.length > 0 || selectedEdgeIds.size > 0) {
          const updatedNodes = allNodes.filter((n) => !nodeIds.has(n.id));
          const updatedEdges = allEdges.filter(
            (edge) => !selectedEdgeIds.has(edge.id) && !nodeIds.has(edge.source) && !nodeIds.has(edge.target)
          );
          setNodes(updatedNodes);
          setEdges(updatedEdges);
          pushSnapshot(updatedNodes, updatedEdges);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingNodeId, addNode, nodesRef, getNodes, getEdges, setNodes, setEdges, handleUndo, handleRedo, pushSnapshot]);
}
