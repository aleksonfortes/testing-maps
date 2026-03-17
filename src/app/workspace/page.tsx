"use client";

import { useCallback, useEffect, useState } from "react";
import { UIProvider, useUI } from "@/context/UIContext";
import { MapCanvas } from "@/components/MapCanvas";
import { MapDropdown } from "@/components/MapDropdown";
import { FilterHUD } from "@/components/FilterHUD";
import { Map, Layers, Loader2, Plus, FileUp } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { UserMenu } from "@/components/UserMenu";

export default function WorkspacePage() {
  return (
    <UIProvider>
      <WorkspaceContentWrapper />
    </UIProvider>
  );
}

function WorkspaceContentWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  );

  useEffect(() => {
    // Check query param on client only to avoid hydration mismatch
    const params = new URLSearchParams(window.location.search);
    if (params.get("testMode") === "true") {
      setIsTestMode(true);
    }
  }, []);

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

  const testUser = { id: "test-user-id", email: "test@example.com" } as User;
  if (!isTestMode && (!authChecked || !user)) {
    return (
      <main className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const currentUser = user || testUser;

  return (
    <WorkspaceContent 
      currentUser={currentUser} 
      activeMapId={activeMapId} 
      handleSelectMap={handleSelectMap}
      handleSignOut={handleSignOut}
    />
  );
}

function WorkspaceContent({ 
  currentUser, 
  activeMapId, 
  handleSelectMap,
  handleSignOut 
}: { 
  currentUser: User; 
  activeMapId: string | null; 
  handleSelectMap: (id: string) => void;
  handleSignOut: () => void;
}) {
  const { isHeroHidden, setOpenDropdown } = useUI();

  // Determine if we should show the empty state hero
  const showEmptyState = !activeMapId && !isHeroHidden;

  return (
    <main className="flex h-screen w-screen flex-col bg-background overflow-hidden text-foreground relative font-sans" data-hero-hidden={isHeroHidden}>
      {/* Miro-style Floating Interface */}
      
      {/* Top Left Island: Identity & Map Switcher */}
      <div className="fixed top-6 left-6 z-50 flex items-center glass island-shadow rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 hover:scale-[1.01] active:scale-[0.99] transition-transform">
        <div className="flex items-center p-2 border-r border-white/5">
          <Link href="/" className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform" title="Back to home">
            <Layers className="w-[18px] h-[18px] text-black" strokeWidth={2.5} />
          </Link>
        </div>
        
        <div className="flex items-center">
          <MapDropdown 
            userId={currentUser.id} 
            activeMapId={activeMapId} 
            onSelectMap={handleSelectMap} 
          />
        </div>
      </div>

      {/* Top Right Island: User Account */}
      <div className="fixed top-6 right-6 z-50 flex items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="p-2 glass island-shadow rounded-full hover:scale-[1.05] active:scale-[0.95] transition-transform">
          <UserMenu user={currentUser} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Canvas Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Workspace Area */}
        <div className="flex-1 relative">
          {activeMapId ? (
            <MapCanvas
              mapId={activeMapId}
              userId={currentUser.id}
              onSignOut={handleSignOut}
            />
          ) : showEmptyState ? (
            <div
              className="flex flex-col h-full items-center justify-center p-6 bg-background relative"
              data-testid="workspace-hero"
            >
              <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center max-w-lg">
                {/* Icon cluster */}
                <div className="mb-10 relative">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-white flex items-center justify-center shadow-2xl">
                    <Map className="w-9 h-9 text-black" strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight text-center">
                  Map your test scenarios
                </h3>
                <p className="text-sm text-foreground/40 leading-relaxed text-center max-w-sm mb-10">
                  Visually organize, connect, and track your testing strategy. Create a map to get started.
                </p>

                {/* Primary actions */}
                <div className="flex gap-3 mb-10">
                  <button
                    onClick={() => setOpenDropdown("map")}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    New Map
                  </button>
                  <button
                    onClick={() => setOpenDropdown("map")}
                    className="flex items-center gap-2 glass border border-white/10 px-6 py-3 rounded-2xl text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    <FileUp className="w-4 h-4" />
                    Import Markdown
                  </button>
                </div>

                {/* Keyboard shortcut hints */}
                <div className="glass border border-white/5 rounded-2xl px-6 py-4 flex gap-6 text-xs text-foreground/30">
                  <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded-md font-mono border border-white/10">Tab</kbd>
                    Add node
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded-md font-mono border border-white/10">Drag</kbd>
                    Reparent
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded-md font-mono border border-white/10">Del</kbd>
                    Remove
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded-md font-mono border border-white/10">Dbl-click</kbd>
                    Edit
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          <FilterHUD />
        </div>
      </div>
    </main>
  );
}

