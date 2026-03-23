"use client";

import { useCallback, useState } from "react";
import { UIProvider, useUI } from "@/context/UIContext";
import { MapCanvas } from "@/components/MapCanvas";
import { MapDropdown } from "@/components/MapDropdown";
import { Plus, FileUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { useOS } from "@/hooks/useOS";
import { BetaBadge, OnboardingGuidance } from "@/components/BetaBadge";

export default function WorkspacePage() {
  return (
    <UIProvider>
      <WorkspaceContentWrapper />
    </UIProvider>
  );
}

function WorkspaceContentWrapper() {
  const [activeMapId, setActiveMapId] = useState<string | null>(null);

  const handleSelectMap = useCallback((mapId: string) => {
    setActiveMapId(mapId || null);
  }, []);

  return (
    <WorkspaceContent 
      activeMapId={activeMapId} 
      handleSelectMap={handleSelectMap}
    />
  );
}

function WorkspaceContent({ 
  activeMapId, 
  handleSelectMap
}: { 
  activeMapId: string | null; 
  handleSelectMap: (id: string) => void;
}) {
  const { isHeroHidden, setIsHeroHidden, setShowImport, setShowNewMapModal, isMarkdownView } = useUI();
  const { modKeyPlus: modKey } = useOS();

  // Determine if we should show the empty state hero
  const showEmptyState = !activeMapId && !isHeroHidden;

  const handleHeroCreate = () => {
    setShowNewMapModal(true);
    setIsHeroHidden(true);
  };

  const handleHeroImport = () => {
    setShowImport(true);
  };

  return (
    <main className="flex h-screen w-screen flex-col bg-background overflow-hidden text-foreground relative font-sans" data-hero-hidden={isHeroHidden}>
      {/* Top Left Island: Identity & Map Switcher — hidden in markdown view */}
      {!isMarkdownView && (
        <div className="fixed top-6 left-6 z-50 flex items-center glass island-shadow rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 hover:scale-[1.01] active:scale-[0.99] transition-transform">
          <div className="flex items-center p-2 border-r border-white/5 relative h-full">
            <Link href="/" className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform overflow-hidden" title="Back to home">
              <Logo size={32} className="rounded-none bg-transparent scale-110" />
            </Link>
            <BetaBadge className="absolute -top-1 -right-3 z-10" />
          </div>
          
          <div className="flex items-center px-2">
            <MapDropdown 
              activeMapId={activeMapId} 
              onSelectMap={handleSelectMap} 
            />
          </div>
        </div>
      )}

      {/* Top Right Island: User Account — hidden in markdown view */}
      {!isMarkdownView && (
        <div className="fixed top-6 right-6 z-50 flex items-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-2 glass island-shadow rounded-full hover:scale-[1.05] active:scale-[0.95] transition-transform">
            <UserMenu />
          </div>
        </div>
      )}

      {/* Canvas Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Workspace Area */}
        <div className="flex-1 relative">
          {activeMapId ? (
            <MapCanvas
              mapId={activeMapId}
            />
          ) : showEmptyState ? (
            <div
              className="flex flex-col h-full items-center justify-center p-6 bg-background relative"
              data-testid="workspace-hero"
            >
              <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center max-w-lg">
                <div className="mb-10 relative">
                  <Logo size={80} className="rounded-[1.75rem] shadow-2xl" />
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight text-center">
                  Map your test scenarios
                </h3>
                <p className="text-sm text-foreground/40 leading-relaxed text-center max-w-sm mb-10">
                  Visually organize, connect, and track your testing strategy. Create a map to get started.
                </p>

                <div className="flex gap-3 mb-10">
                  <button
                    onClick={handleHeroCreate}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    New Map
                  </button>
                  <button
                    onClick={handleHeroImport}
                    className="flex items-center gap-2 glass border border-white/10 px-6 py-3 rounded-2xl text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    <FileUp className="w-4 h-4" />
                    Import Markdown
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2.5 text-xs text-foreground/30 mb-12">
                  <span className="flex items-center gap-2">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 bg-white/5 rounded-md font-mono text-[11px] border border-white/10">Tab</kbd>
                    <span>Add a child node</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 bg-white/5 rounded-md font-mono text-[11px] border border-white/10">Drag</kbd>
                    <span>Reparent node</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 bg-white/5 rounded-md font-mono text-[11px] border border-white/10">Del</kbd>
                    <span>Delete selected</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 bg-white/5 rounded-md font-mono text-[11px] border border-white/10 whitespace-nowrap">Dbl-click</kbd>
                    <span>Edit details</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd suppressHydrationWarning className="inline-flex items-center gap-0.5 justify-center min-w-[2rem] px-1.5 py-0.5 bg-white/5 rounded-md font-mono text-[11px] border border-white/10">{modKey}Z</kbd>
                    <span>Undo / Redo</span>
                  </span>
                </div>

                <div className="mt-8 flex justify-center w-full">
                  <OnboardingGuidance />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

