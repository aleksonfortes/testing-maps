import { createClient, LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

type Storage = {
  nodes: LiveList<LiveObject<any>>;
  edges: LiveList<LiveObject<any>>;
};

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_placeholder",
});

export const {
  RoomProvider,
  useOthers,
  useMyPresence,
  useSelf,
  useStorage,
  useMutation,
  /* ...other hooks */
} = createRoomContext<any, Storage>(client);
