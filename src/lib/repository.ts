import { supabase } from "./supabase";
import { Node, Edge } from "@xyflow/react";

export interface TestingMap {
  id?: string;
  user_id: string;
  nodes: Node[];
  edges: Edge[];
  updated_at?: string;
}

export const testingMapRepository = {
  async saveMap(userId: string, nodes: Node[], edges: Edge[]) {
    // We'll use a single record per user for the demo, 
    // but this can be expanded to multiple maps.
    const { data, error } = await supabase
      .from("testing_maps")
      .upsert({ 
        user_id: userId, 
        nodes, 
        edges, 
        updated_at: new Date().toISOString() 
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async loadMap(userId: string): Promise<TestingMap | null> {
    const { data, error } = await supabase
      .from("testing_maps")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is 'no rows found'
      throw error;
    }
    return data;
  }
};
