"use client";

import { useCallback, useEffect, useState } from "react";
import { UIProvider, useUI } from "@/context/UIContext";
import { MapCanvas } from "@/components/MapCanvas";
import { MapDropdown } from "@/components/MapDropdown";
import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { FilterHUD } from "@/components/FilterHUD";
import { Map, Layers, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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

  const isQueryTestMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get("testMode") === "true";
  const isEnvTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true";
  const isTestMode = isQueryTestMode || isEnvTestMode;

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
  const { isHeroHidden } = useUI();

  // Determine if we should show the empty state hero
  const showEmptyState = !activeMapId && !isHeroHidden;

  return (
    <main className="flex h-screen flex-col bg-background overflow-hidden text-foreground" data-hero-hidden={isHeroHidden}>
      {/* Bespoke Workspace Header - "The Island" */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-4xl pointer-events-none">
        <header className="flex h-12 items-center justify-between px-1.5 bg-background/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl pointer-events-auto transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)] hover:border-white/20">
          <div className="flex items-center gap-1 h-full">
            <Link href="/" className="px-3 h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors group" aria-label="Home">
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary transition-transform group-hover:scale-110">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            
            <div className="w-px h-4 bg-white/10 mx-1" />
            
            <MapDropdown 
              userId={currentUser.id} 
              activeMapId={activeMapId} 
              onSelectMap={handleSelectMap} 
            />
          </div>
          
          <div className="flex items-center gap-2 pr-1.5">
            <div className="w-px h-4 bg-white/10 mx-2" />
            <button 
              onClick={handleSignOut}
              className="px-4 h-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>
      </div>

      {/* Canvas Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar removed for minimalism - everything is now controlled via the header or node actions */}

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
              className="flex flex-col h-full items-center justify-center text-muted-foreground"
              data-testid="workspace-hero"
            >
              <div className="p-8 rounded-[2.5rem] bg-secondary/30 mb-6 border border-border/50 shadow-2xl">
                <Map className="w-12 h-12 opacity-20" />
              </div>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">No Map Selected</h3>
              <p className="text-sm max-w-[320px] text-center mt-3 opacity-60 leading-relaxed">
                Select an existing map from the dropdown above or create a new one to start mapping your scenarios.
              </p>
            </div>
          ) : null}
          <FilterHUD />
        </div>
      </div>
    </main>
  );
}

