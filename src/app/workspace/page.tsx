"use client";

import { useCallback, useEffect, useState } from "react";
import { UIProvider, useUI } from "@/context/UIContext";
import { MapCanvas } from "@/components/MapCanvas";
import { MapDropdown } from "@/components/MapDropdown";
import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { FilterHUD } from "@/components/FilterHUD";
import { Map, Layers, ChevronRight, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
    <main className="flex h-screen w-screen flex-col bg-background overflow-hidden text-foreground relative font-sans" data-hero-hidden={isHeroHidden}>
      {/* Miro-style Floating Interface */}
      
      {/* Top Left Island: Identity & Map Switcher */}
      <div className="fixed top-6 left-6 z-50 flex items-center bg-background/95 glass border border-white/10 island-shadow rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 hover:scale-[1.01] active:scale-[0.99] transition-transform">
        <div className="flex items-center p-2 border-r border-white/5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
        <div className="p-2 bg-background/95 glass border border-white/10 island-shadow rounded-full hover:scale-[1.05] active:scale-[0.95] transition-transform">
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
              <div className="bg-background/95 glass border border-white/10 island-shadow rounded-[3rem] p-12 flex flex-col items-center max-w-md animate-in zoom-in-95 duration-700">
                <div className="mb-8 relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl rotate-12">
                    <Map className="w-10 h-10 text-black" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg -rotate-12 border border-white/10">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                  No Map Selected
                </h3>
                <p className="text-sm text-foreground/40 leading-relaxed text-center font-medium italic">
                  Select a test map from the switcher above or create a new one to start your journey.
                </p>
              </div>
            </div>
          ) : null}
          <FilterHUD />
        </div>
      </div>
    </main>
  );
}

