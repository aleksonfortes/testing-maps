"use client";

import { MapCanvas } from "@/components/MapCanvas";
import { UIProvider } from "@/context/UIContext";
import { WorkspaceErrorBoundary } from "@/components/WorkspaceErrorBoundary";
import { FilterHUD } from "@/components/FilterHUD";
import { Map, Share2, Layers, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  return (
    <UIProvider>
      <WorkspaceErrorBoundary>
        <main className="flex h-screen flex-col bg-background overflow-hidden text-foreground">
          {/* Workspace Header */}
          <header className="flex h-14 items-center justify-between border-b border-border px-6 glass z-50">
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Map className="w-5 h-5" />
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <h1 className="text-sm font-semibold tracking-tight">Testing Maps</h1>
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Cloud</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                <Share2 className="w-4 h-4" />
                Export
              </button>
              <div className="h-6 w-px bg-border mx-1" />
              <button className="p-2 hover:bg-secondary rounded-full transition-colors group">
                <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </header>

          {/* Sidebar & Canvas Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Tool Sidebar */}
            <aside className="w-14 border-r border-border flex flex-col items-center py-6 gap-6 glass">
              <SidebarItem icon={<Layers className="w-5 h-5" />} tooltip="Scenarios" active />
              <SidebarItem icon={<Map className="w-5 h-5" />} tooltip="Auto-layout" />
            </aside>

            {/* Canvas Area */}
            <div className="flex-1 relative">
              <MapCanvas />
              <FilterHUD />
            </div>
          </div>
        </main>
      </WorkspaceErrorBoundary>
    </UIProvider>
  );
}

function SidebarItem({ icon, tooltip, active = false }: { icon: React.ReactNode; tooltip: string; active?: boolean }) {
  return (
    <div 
      className={cn(
        "p-2.5 rounded-2xl transition-all cursor-pointer relative group",
        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border shadow-xl z-[100]">
        {tooltip}
      </div>
    </div>
  );
}
