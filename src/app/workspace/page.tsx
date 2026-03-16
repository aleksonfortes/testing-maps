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

  if (!authChecked || !user) {
    // If in test mode, we can bypass this or show a mock. 
    const isTestMode = typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props?.pageProps?.testMode || process.env.NEXT_PUBLIC_TEST_MODE === "true";
    if (!isTestMode) {
      return (
        <main className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </main>
      );
    }
  }

  const testUser = { id: "test-user-id", email: "test@example.com" } as User;
  const currentUser = user || testUser;

  return (
    <UIProvider>
      <WorkspaceContent 
        currentUser={currentUser} 
        activeMapId={activeMapId} 
        handleSelectMap={handleSelectMap}
        handleSignOut={handleSignOut}
      />
    </UIProvider>
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
      <header className="flex h-14 items-center justify-between border-b border-border px-6 glass z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="Home">
            <Map className="w-5 h-5" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          
          {/* Map Selection Dropdown */}
          <MapDropdown 
            userId={currentUser.id} 
            activeMapId={activeMapId} 
            onSelectMap={handleSelectMap} 
          />

          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 ml-2">
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
              Cloud
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Future: User profile / settings / logout could go here */}
        </div>
      </header>

      {/* Canvas Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tool Sidebar (Fixed, slim) */}
        <aside className="w-14 border-r border-border flex flex-col items-center py-6 gap-6 glass shrink-0">
          <SidebarItem
            icon={<Layers className="w-5 h-5" />}
            tooltip="Scenarios"
            active
          />
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 relative">
          {activeMapId ? (
            <MapCanvas
              mapId={activeMapId}
              userId={currentUser.id}
              onSignOut={handleSignOut}
            />
          ) : (
            <AnimatePresence mode="wait">
              {showEmptyState && (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
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
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <FilterHUD />
        </div>
      </div>
    </main>
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
