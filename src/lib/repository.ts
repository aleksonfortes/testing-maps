import { supabase, isSupabaseConfigured } from "./supabase";
import type { Node, Edge } from "@xyflow/react";
import type { TestingMap, TestingMapListItem } from "./types";

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB limit

/** Strip runtime-only properties before persisting */
export function sanitizeForStorage(nodes: Node[], edges: Edge[]) {
  const cleanNodes = nodes.map(({ id, type, data, position }) => {
    const { isDropTarget: _, ...cleanData } = data as Record<string, unknown>;
    return { id, type, data: cleanData, position };
  });
  const cleanEdges = edges.map(({ id, source, target, sourceHandle, targetHandle, type, animated }) => ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type,
    animated,
  }));
  return { cleanNodes, cleanEdges };
}

export const testingMapRepository = {
  /** List all maps for a user, ordered by most recently updated */
  async listMaps(userId: string): Promise<TestingMapListItem[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("testing_maps")
      .select("id, name, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /** Create a new map and return its id */
  async createMap(userId: string, name: string): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot create map.");
    }

    const { data, error } = await supabase
      .from("testing_maps")
      .insert({
        user_id: userId,
        name,
        nodes: [],
        edges: [],
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  },

  /** Create a new map with initial nodes and edges */
  async createMapWithData(
    userId: string,
    name: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot create map.");
    }

    const { cleanNodes, cleanEdges } = sanitizeForStorage(nodes, edges);

    const { data, error } = await supabase
      .from("testing_maps")
      .insert({
        user_id: userId,
        name,
        nodes: cleanNodes,
        edges: cleanEdges,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  },

  /** Save nodes/edges to a specific map */
  async saveMap(mapId: string, nodes: Node[], edges: Edge[]): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot save.");
    }

    const { cleanNodes, cleanEdges } = sanitizeForStorage(nodes, edges);

    // Validate payload size
    const payload = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges });
    if (payload.length > MAX_PAYLOAD_SIZE) {
      throw new Error("Map data exceeds maximum size limit (5MB).");
    }

    const { error } = await supabase
      .from("testing_maps")
      .update({
        nodes: cleanNodes,
        edges: cleanEdges,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mapId);

    if (error) throw error;
  },

  /** Load a specific map by id */
  async loadMap(mapId: string): Promise<TestingMap | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from("testing_maps")
      .select("id, user_id, name, nodes, edges, updated_at")
      .eq("id", mapId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }
    return data;
  },

  /** Delete a map by id */
  async deleteMap(mapId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot delete.");
    }

    const { error } = await supabase
      .from("testing_maps")
      .delete()
      .eq("id", mapId);

    if (error) throw error;
  },

  /** Rename a map */
  async renameMap(mapId: string, name: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot rename.");
    }

    const { error } = await supabase
      .from("testing_maps")
      .update({ name })
      .eq("id", mapId);

    if (error) throw error;
  },
};
