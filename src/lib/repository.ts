import { get, set } from "idb-keyval";
import type { Node, Edge } from "@xyflow/react";
import type { TestingMap, TestingMapListItem, ScenarioNode, ScenarioEdge } from "./types";
import { TestingMapSchema } from "./types";

const MAX_PAYLOAD_SIZE = 50 * 1024 * 1024; // Expanded to 50MB for local storage

const DB_KEY = "testing_maps_local_db";

type LocalDB = Record<string, TestingMap>;

/** Retrieve the entire database object from IndexedDB */
async function getDB(): Promise<LocalDB> {
  const db = await get<LocalDB>(DB_KEY);
  return db || {};
}

/** Save the entire database object to IndexedDB */
async function saveDB(db: LocalDB): Promise<void> {
  await set(DB_KEY, db);
}

/** Strip runtime-only properties before persisting */
export function sanitizeForStorage(nodes: Node[], edges: Edge[]) {
  const cleanNodes = nodes.map(({ id, type, data, position, width, height }) => {
    const { isDropTarget, ...cleanData } = data as Record<string, unknown>;
    void isDropTarget; // Satisfy no-unused-vars
    return { id, type, data: cleanData, position, width, height };
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
  /** List all local maps, ordered by most recently updated */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listMaps(_userId: string): Promise<TestingMapListItem[]> {
    const db = await getDB();
    const maps = Object.values(db).map((map) => {
      // Validate map structure to avoid showing corrupted maps
      const parsed = TestingMapSchema.safeParse(map);
      if (!parsed.success) {
        if (process.env.NODE_ENV === "development") {
          console.error(`Map data corrupted for ID: ${map.id}`, parsed.error);
        }
        return null;
      }
      return {
        id: map.id,
        name: map.name,
        updated_at: map.updated_at || new Date().toISOString(),
      };
    }).filter(Boolean) as TestingMapListItem[];

    return maps.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  /** Create a new map locally and return its id */
  async createMap(userId: string, name: string): Promise<string> {
    const db = await getDB();
    const newId = crypto.randomUUID();
    
    db[newId] = {
      id: newId,
      user_id: "local-user",
      name,
      nodes: [],
      edges: [],
      updated_at: new Date().toISOString(),
    };

    await saveDB(db);
    return newId;
  },

  /** Create a new map with initial nodes and edges */
  async createMapWithData(
    userId: string,
    name: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<string> {
    const db = await getDB();
    const newId = crypto.randomUUID();
    const { cleanNodes, cleanEdges } = sanitizeForStorage(nodes, edges);

    db[newId] = {
      id: newId,
      user_id: "local-user",
      name,
      nodes: cleanNodes as ScenarioNode[],
      edges: cleanEdges as ScenarioEdge[],
      updated_at: new Date().toISOString(),
    };

    await saveDB(db);
    return newId;
  },

  /** Save nodes/edges to a specific local map */
  async saveMap(mapId: string, nodes: Node[], edges: Edge[]): Promise<void> {
    const db = await getDB();
    
    if (!db[mapId]) {
      throw new Error("Map not found in local storage.");
    }

    const { cleanNodes, cleanEdges } = sanitizeForStorage(nodes, edges);

    // Validate payload size
    const payload = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges });
    if (payload.length > MAX_PAYLOAD_SIZE) {
      throw new Error("Map data exceeds maximum size limit (50MB).");
    }

    db[mapId] = {
      ...db[mapId],
      nodes: cleanNodes as ScenarioNode[],
      edges: cleanEdges as ScenarioEdge[],
      updated_at: new Date().toISOString(),
    };

    await saveDB(db);
  },

  /** Load a specific map by id from IndexedDB */
  async loadMap(mapId: string): Promise<TestingMap | null> {
    const db = await getDB();
    const map = db[mapId];
    if (!map) return null;

    const parsed = TestingMapSchema.safeParse(map);
    if (!parsed.success) {
      console.error("Failed to parse map from local storage:", parsed.error);
      throw new Error("Map data is corrupted.");
    }

    return parsed.data as TestingMap;
  },

  /** Delete a map by id */
  async deleteMap(mapId: string): Promise<void> {
    const db = await getDB();
    if (db[mapId]) {
      delete db[mapId];
      await saveDB(db);
    }
  },

  /** Rename a local map */
  async renameMap(mapId: string, name: string): Promise<void> {
    const db = await getDB();
    if (db[mapId]) {
      db[mapId].name = name;
      db[mapId].updated_at = new Date().toISOString();
      await saveDB(db);
    } else {
      throw new Error("Cannot rename: Map not found in local storage.");
    }
  },
};
