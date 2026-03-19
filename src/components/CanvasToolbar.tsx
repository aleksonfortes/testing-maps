"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Panel } from "@xyflow/react";
import { Plus, Undo2, Redo2, FileText, Maximize, ChevronsDownUp, ChevronsUpDown, Code2 } from "lucide-react";
import { useOS } from "@/hooks/useOS";

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
  onToggleMarkdownView: () => void;
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
  onToggleMarkdownView,
}: CanvasToolbarProps) {
  const { modKeyPlus } = useOS();

  return (
    <Panel position="bottom-right" className="mb-20 mr-6 pointer-events-auto">
      <Tooltip.Provider delayDuration={300}>
        <div className="flex items-center gap-1 glass border border-white/10 p-1.5 rounded-2xl island-shadow">
          <ToolbarButton onClick={onAddNode} label="Add Scenario" shortcut="Tab" primary>
            <Plus className="w-4 h-4" />
          </ToolbarButton>

          <div className="h-6 w-px bg-white/10 mx-0.5" />

          <ToolbarButton onClick={onUndo} disabled={!canUndo} label="Undo" shortcut={`${modKeyPlus}Z`}>
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={onRedo} disabled={!canRedo} label="Redo" shortcut={`${modKeyPlus}Shift+Z`}>
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
          <ToolbarButton onClick={onToggleMarkdownView} label="Markdown View" shortcut={`${modKeyPlus}E`}>
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </Tooltip.Provider>
    </Panel>
  );
}
