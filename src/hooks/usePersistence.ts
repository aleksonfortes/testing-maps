import { useCallback, useEffect, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { testingMapRepository } from "@/lib/repository";
import { SAVE_DEBOUNCE_MS, LOAD_SETTLE_MS, SAVE_ERROR_CLEAR_TIMEOUT_MS } from "@/lib/constants";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  const [loadedFromCloud, setLoadedFromCloud] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const hasPendingSaveRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable ref for pushSnapshot to safely include it in the load effect
  // without causing re-runs when the callback identity changes.
  const pushSnapshotRef = useRef(pushSnapshot);
  pushSnapshotRef.current = pushSnapshot;

  const retryLoad = useCallback(() => {
    setLoadError(null);
    setLoadedFromCloud(false);
  }, []);

  // Load from Supabase by mapId
  useEffect(() => {
    if (loadedFromCloud) return;
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
          if (!cancelled) setLoadedFromCloud(true);
        }, LOAD_SETTLE_MS);
      } catch (err) {
        if (!cancelled) {
          setLoadError("Failed to load map. Check your connection and try again.");
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Cloud load error:", err);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [mapId, setNodes, setEdges, loadedFromCloud]);

  // Persist to Supabase (debounced)
  useEffect(() => {
    if (!loadedFromCloud) return;

    hasPendingSaveRef.current = true;

    const saveData = async () => {
      setSaveStatus("saving");
      try {
        await testingMapRepository.saveMap(mapId, nodes, edges);
        setSaveStatus("saved");
        hasPendingSaveRef.current = false;
      } catch {
        setSaveStatus("error");
      }
    };

    const timer = setTimeout(saveData, SAVE_DEBOUNCE_MS);
    saveTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      saveTimerRef.current = null;
    };
  }, [nodes, edges, loadedFromCloud, mapId]);

  // Clear error status after a delay so the user sees the error briefly
  // then the UI resets, allowing the next save attempt to show fresh status.
  useEffect(() => {
    if (saveStatus !== "error") return;
    const timer = setTimeout(() => setSaveStatus("idle"), SAVE_ERROR_CLEAR_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [saveStatus]);

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
    if (!loadedFromCloud) return;

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
  }, [mapId, loadedFromCloud, getNodes, getEdges]);

  return { loadedFromCloud, loadError, retryLoad, saveStatus };
}
