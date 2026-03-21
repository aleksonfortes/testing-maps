import { useCallback, useEffect, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { testingMapRepository } from "@/lib/repository";
import { SAVE_DEBOUNCE_MS, LOAD_SETTLE_MS } from "@/lib/constants";

interface UsePersistenceOptions {
  mapId: string;
  nodes: Node[];
  edges: Edge[];
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  pushSnapshot: (nodes: Node[], edges: Edge[]) => void;
}

export function usePersistence({
  mapId,
  nodes,
  edges,
  getNodes,
  getEdges,
  setNodes,
  setEdges,
  pushSnapshot,
}: UsePersistenceOptions) {
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasPendingSaveRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable ref for pushSnapshot to safely include it in the load effect
  // without causing re-runs when the callback identity changes.
  const pushSnapshotRef = useRef(pushSnapshot);
  useEffect(() => {
    pushSnapshotRef.current = pushSnapshot;
  }, [pushSnapshot]);

  const retryLoad = useCallback(() => {
    setLoadError(null);
    setLoadedFromStorage(false);
  }, []);

  // Load from IndexedDB by mapId
  useEffect(() => {
    if (loadedFromStorage) return;
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoadError(null);
        const data = await testingMapRepository.loadMap(mapId);
        if (cancelled) return;

        if (data) {
          setNodes(data.nodes as Node[]);
          setEdges(data.edges as Edge[]);
          pushSnapshotRef.current(data.nodes as Node[], data.edges as Edge[]);
        } else {
          pushSnapshotRef.current([], []);
        }

        setTimeout(() => {
          if (!cancelled) setLoadedFromStorage(true);
        }, LOAD_SETTLE_MS);
      } catch (err) {
        if (!cancelled) {
          setLoadError("Failed to load map. Check your local storage.");
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Local load error:", err);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [mapId, setNodes, setEdges, loadedFromStorage]);

  // Persist to IndexedDB (debounced)
  useEffect(() => {
    if (!loadedFromStorage) return;

    hasPendingSaveRef.current = true;

    const saveData = async () => {
      try {
        await testingMapRepository.saveMap(mapId, nodes, edges);
        hasPendingSaveRef.current = false;
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Save error:", err);
        }
      }
    };

    const timer = setTimeout(saveData, SAVE_DEBOUNCE_MS);
    saveTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      saveTimerRef.current = null;
    };
  }, [nodes, edges, loadedFromStorage, mapId]);

  // Warn on unload if there are pending changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingSaveRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Flush save on tab hide
  useEffect(() => {
    if (!loadedFromStorage) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && hasPendingSaveRef.current) {
        // Cancel the pending debounce timer to prevent a double save
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        testingMapRepository.saveMap(mapId, getNodes(), getEdges()).catch(() => {});
        hasPendingSaveRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mapId, loadedFromStorage, getNodes, getEdges]);

  return { loadedFromStorage, loadError, retryLoad };
}
