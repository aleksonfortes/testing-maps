"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider id="testing-maps-demo" initialPresence={{ cursor: null }}>
      <ClientSideSuspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground animate-pulse">
          Connecting to workspace...
        </div>
      }>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
