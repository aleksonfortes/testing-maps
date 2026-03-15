"use strict";

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

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
} = createRoomContext(client);
