import { useEffect, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { testingMapRepository } from "@/lib/repository";
import { SAVE_DEBOUNCE_MS, LOAD_SETTLE_MS } from "@/lib/constants";

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const hasPendingSaveRef = useRef(false);

  // Load from Supabase by mapId
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const data = await testingMapRepository.loadMap(mapId);
        if (cancelled) return;

        if (data) {
          setNodes(data.nodes as Node[]);
          setEdges(data.edges as Edge[]);
          pushSnapshot(data.nodes as Node[], data.edges as Edge[]);
        } else {
          pushSnapshot([], []);
        }

        setTimeout(() => {
          if (!cancelled) setLoadedFromCloud(true);
        }, LOAD_SETTLE_MS);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Cloud load error:", err);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [mapId, setNodes, setEdges]);

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
    return () => clearTimeout(timer);
  }, [nodes, edges, loadedFromCloud, mapId]);

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
        testingMapRepository.saveMap(mapId, getNodes(), getEdges()).catch(() => {});
        hasPendingSaveRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mapId, loadedFromCloud, getNodes, getEdges]);

  return { loadedFromCloud, saveStatus };
}
