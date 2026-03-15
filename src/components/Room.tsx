"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";

const initialNodes = [
  {
    id: "1",
    type: "scenario",
    data: { label: "User Authentication", status: "verified", testType: "integration" },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    type: "scenario",
    data: { label: "Login with Google", status: "verified", testType: "unit" },
    position: { x: 50, y: 250 },
  },
  {
    id: "3",
    type: "scenario",
    data: { label: "Reset Password Flow", status: "untested", testType: "e2e" },
    position: { x: 450, y: 250 },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
];

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RoomContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room") || "testing-maps-demo";

  return (
    <RoomProvider 
      id={roomId} 
      initialPresence={{ cursor: null }}
      initialStorage={{
        nodes: new LiveList(initialNodes.map(n => new LiveObject(n))),
        edges: new LiveList(initialEdges.map(e => new LiveObject(e))),
      }}
    >
      <div className="h-full w-full">
        <ClientSideSuspense fallback={<div>Loading...</div>}>
          {children}
        </ClientSideSuspense>
      </div>
    </RoomProvider>
  );
}

export function Room({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading workspace...</div>}>
      <RoomContent>{children}</RoomContent>
    </Suspense>
  );
}
