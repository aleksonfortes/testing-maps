"use client";

import { useCallback, useEffect, useState } from "react";
import { MapCanvas } from "@/components/MapCanvas";
import { MapSidebar } from "@/components/MapSidebar";
import { UIProvider } from "@/context/UIContext";
import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { FilterHUD } from "@/components/FilterHUD";
import { Map, Layers, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function WorkspacePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user: u } }) => {
        setUser(u);
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Sign out failed, redirect anyway
    }
    window.location.href = "/auth";
  }, []);

  const handleSelectMap = useCallback((mapId: string) => {
    setActiveMapId(mapId);
  }, []);

  if (!authChecked) {
    return (
      <main className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <UIProvider>
      <WorkspaceErrorBoundary>
        <main className="flex h-screen flex-col bg-background overflow-hidden text-foreground">
          {/* Workspace Header */}
          <header className="flex h-14 items-center justify-between border-b border-border px-6 glass z-50">
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="Home">
                <Map className="w-5 h-5" />
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <h1 className="text-sm font-semibold tracking-tight">Testing Maps</h1>
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
                  Cloud
                </span>
              </div>
            </div>
          </header>

          {/* Sidebar & Canvas Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Tool Sidebar */}
            <aside className="w-14 border-r border-border flex flex-col items-center py-6 gap-6 glass">
              <SidebarItem
                icon={<Layers className="w-5 h-5" />}
                tooltip="Scenarios"
                active
              />
            </aside>

            {/* Map Sidebar */}
            <MapSidebar
              userId={user.id}
              activeMapId={activeMapId}
              onSelectMap={handleSelectMap}
            />

            {/* Canvas Area */}
            <div className="flex-1 relative">
              {activeMapId ? (
                <MapCanvas
                  mapId={activeMapId}
                  userId={user.id}
                  onSignOut={handleSignOut}
                />
              ) : (
                <div className="flex flex-col h-full items-center justify-center text-muted-foreground animate-in fade-in duration-500">
                  <div className="p-4 rounded-full bg-secondary/50 mb-4">
                    <Map className="w-8 h-8 opacity-20" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">No Map Selected</h3>
                  <p className="text-sm max-w-[240px] text-center mt-2 opacity-60">
                    Select an existing map from the sidebar or create a new one to get started.
                  </p>
                </div>
              )}
              <FilterHUD />
            </div>
          </div>
        </main>
      </WorkspaceErrorBoundary>
    </UIProvider>
  );
}

function SidebarItem({
  icon,
  tooltip,
  active = false,
}: {
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "p-2.5 rounded-2xl transition-all cursor-pointer relative group",
        active
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
      aria-label={tooltip}
    >
      {icon}
      <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border shadow-xl z-[100]">
        {tooltip}
      </div>
    </button>
  );
}
