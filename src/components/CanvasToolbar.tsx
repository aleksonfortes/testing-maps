"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Panel } from "@xyflow/react";
import { Plus, Undo2, Redo2, FileText, Cloud, CloudOff, Loader2, Maximize, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import type { SaveStatus } from "@/hooks/usePersistence";

interface CanvasToolbarProps {
  onAddNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onFitView: () => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  hasCollapsed: boolean;
  hasExpandable: boolean;
  saveStatus: SaveStatus;
}

function ToolbarButton({
  onClick,
  disabled,
  label,
  shortcut,
  primary,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  shortcut?: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={
            primary
              ? "p-2.5 bg-white text-black rounded-xl hover:scale-105 transition-all active:scale-95 shadow-lg"
              : "p-2.5 text-foreground/60 hover:bg-white/10 hover:text-foreground rounded-xl transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
          }
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={8}
          className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {label}
          {shortcut && (
            <span className="ml-1.5 opacity-50">{shortcut}</span>
          )}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function CanvasToolbar({
  onAddNode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  onFitView,
  onCollapseAll,
  onExpandAll,
  hasCollapsed,
  hasExpandable,
  saveStatus,
}: CanvasToolbarProps) {
  return (
    <Panel position="bottom-right" className="mb-20 mr-6 pointer-events-auto">
      <Tooltip.Provider delayDuration={300}>
        <div className="flex items-center gap-1 glass border border-white/10 p-1.5 rounded-2xl island-shadow">
          <ToolbarButton onClick={onAddNode} label="Add Scenario" shortcut="Tab" primary>
            <Plus className="w-4 h-4" />
          </ToolbarButton>

          <div className="h-6 w-px bg-white/10 mx-0.5" />

          <ToolbarButton onClick={onUndo} disabled={!canUndo} label="Undo" shortcut="Cmd+Z">
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={onRedo} disabled={!canRedo} label="Redo" shortcut="Cmd+Shift+Z">
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>

          <div className="h-6 w-px bg-white/10 mx-0.5" />

          <ToolbarButton onClick={onFitView} label="Fit to Screen">
            <Maximize className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={onCollapseAll} disabled={!hasExpandable} label="Collapse All">
            <ChevronsDownUp className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={onExpandAll} disabled={!hasCollapsed} label="Expand All">
            <ChevronsUpDown className="w-4 h-4" />
          </ToolbarButton>

          <div className="h-6 w-px bg-white/10 mx-0.5" />

          <ToolbarButton onClick={onExport} label="Export Markdown">
            <FileText className="w-4 h-4" />
          </ToolbarButton>

          {/* Save status indicator */}
          <div className="pl-1 pr-1.5 flex items-center" role="status" aria-live="polite">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground/40" />
                <span className="sr-only">Saving changes…</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Cloud className="w-3.5 h-3.5 text-green-500/80" />
                <span className="sr-only">All changes saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <CloudOff className="w-3.5 h-3.5 text-destructive/60" />
                <span className="sr-only">Failed to save</span>
              </>
            )}
          </div>
        </div>
      </Tooltip.Provider>
    </Panel>
  );
}
