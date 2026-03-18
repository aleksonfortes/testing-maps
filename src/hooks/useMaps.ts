import { useState, useEffect, useCallback } from "react";
import { testingMapRepository } from "@/lib/repository";
import type { TestingMapListItem, ScenarioData } from "@/lib/types";
import type { Node, Edge } from "@xyflow/react";

const isDev = process.env.NODE_ENV === "development";

export function useMaps(userId: string | undefined) {
  const [maps, setMaps] = useState<TestingMapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMaps = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await testingMapRepository.listMaps(userId);
      setMaps(list);
      setError(null);
    } catch (err) {
      setError("Failed to load maps");
      if (isDev) console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  const createMap = useCallback(async (name: string = "Untitled Map") => {
    if (!userId) return null;
    setIsCreating(true);
    try {
      const newId = await testingMapRepository.createMap(userId, name);
      await loadMaps();
      return newId;
    } catch (err) {
      if (isDev) console.error("Failed to create map:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [userId, loadMaps]);

  const importMap = useCallback(async (name: string, nodes: Node<ScenarioData>[], edges: Edge[]) => {
    if (!userId) return null;
    setIsImporting(true);
    try {
      const newId = await testingMapRepository.createMapWithData(userId, name, nodes, edges);
      await loadMaps();
      return newId;
    } catch (err) {
      if (isDev) console.error("Failed to import map:", err);
      return null;
    } finally {
      setIsImporting(false);
    }
  }, [userId, loadMaps]);

  const deleteMap = useCallback(async (mapId: string) => {
    setIsDeleting(true);
    try {
      await testingMapRepository.deleteMap(mapId);
      await loadMaps();
      return true;
    } catch (err) {
      if (isDev) console.error("Failed to delete map:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [loadMaps]);

  const duplicateMap = useCallback(async (mapId: string) => {
    if (!userId) return null;
    setIsDuplicating(true);
    try {
      const source = await testingMapRepository.loadMap(mapId);
      if (!source) throw new Error("Source map not found");
      const newId = await testingMapRepository.createMapWithData(
        userId,
        source.name + " (Copy)",
        source.nodes,
        source.edges
      );
      await loadMaps();
      return newId;
    } catch (err) {
      if (isDev) console.error("Failed to duplicate map:", err);
      return null;
    } finally {
      setIsDuplicating(false);
    }
  }, [userId, loadMaps]);

  const renameMap = useCallback(async (mapId: string, newName: string) => {
    setIsRenaming(true);
    try {
      await testingMapRepository.renameMap(mapId, newName);
      await loadMaps();
      return true;
    } catch (err) {
      if (isDev) console.error("Failed to rename map:", err);
      return false;
    } finally {
      setIsRenaming(false);
    }
  }, [loadMaps]);

  const saveMapData = useCallback(async (mapId: string, nodes: Node<ScenarioData>[], edges: Edge[]) => {
    setIsSaving(true);
    try {
      await testingMapRepository.saveMap(mapId, nodes, edges);
      await loadMaps();
      return true;
    } catch (err) {
      if (isDev) console.error("Failed to save map data:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [loadMaps]);

  return {
    maps,
    loading,
    isCreating,
    isImporting,
    isDeleting,
    isDuplicating,
    isRenaming,
    isSaving,
    error,
    refresh: loadMaps,
    createMap,
    importMap,
    deleteMap,
    duplicateMap,
    renameMap,
    saveMapData,
  };
}
