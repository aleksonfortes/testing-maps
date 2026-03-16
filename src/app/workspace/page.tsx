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

  if (!authChecked || !user) {
    if (!isTestMode) {
      return (
        <main className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
      {/* Workspace Header */}
      <header className="flex h-12 items-center justify-between border-b border-border px-4 bg-background/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Link href="/" className="p-1.5 hover:bg-secondary rounded-lg transition-colors flex items-center justify-center" aria-label="Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          
          <span className="text-muted-foreground/40 font-light mx-0.5">/</span>
          
          <div className="flex items-center gap-2 px-2 py-1 hover:bg-secondary rounded-lg transition-colors cursor-default group">
            <Layers className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">Projects</span>
          </div>

          <span className="text-muted-foreground/40 font-light mx-0.5">/</span>
          
          {/* Map Selection Dropdown */}
          <MapDropdown 
            userId={currentUser.id} 
            activeMapId={activeMapId} 
            onSelectMap={handleSelectMap} 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSignOut}
            className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

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

