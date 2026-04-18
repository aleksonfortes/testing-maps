"use client";

import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Layers,
  Cpu,
  Smartphone,
  Code,
  MoreHorizontal,
  Trash2,
  Pencil,
  FileText,
  Target,
  ChevronRight,
  Copy,
  Flag,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/context/UIContext";
import { useMapActions } from "@/components/MapCanvas";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { MAX_LABEL_LENGTH } from "@/lib/constants";
import type { ScenarioData } from "@/lib/types";

interface ScenarioNodeProps {
  id: string;
  data: ScenarioData;
  selected?: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
}

const statusConfig = {
  untested: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/20" },
  verified: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

const typeConfig = {
  manual: { icon: Smartphone, label: "Manual" },
  unit: { icon: Code, label: "Unit" },
  integration: { icon: Layers, label: "Integration" },
  e2e: { icon: Cpu, label: "E2E" },
};

export const ScenarioNode = memo(({ id, data, selected, targetPosition, sourcePosition }: ScenarioNodeProps) => {
  const { activeFilters } = useUI();
  const actionsRef = useMapActions();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteConfirmed = useCallback(() => {
    actionsRef.current.deleteNode(id);
    setShowMenu(false);
  }, [actionsRef, id]);
  const { isPending: confirmDelete, trigger: handleDelete, reset: resetDelete } = useConfirmAction(handleDeleteConfirmed);

  const status = statusConfig[data.status] ?? statusConfig.untested;
  const type = typeConfig[data.testType] ?? typeConfig.manual;
  const Icon = status.icon;
  const TypeIcon = type.icon;

  const isDropTarget = !!data.isDropTarget;
  // eslint-disable-next-line react-hooks/refs
  // Read collapse state from data props (injected by MapCanvas displayNodes)
  // so React Flow re-renders this node when collapse state changes.
  const dataAny = data as Record<string, unknown>;
  const isCollapsed = !!dataAny._collapsed;
  const childCount = (dataAny._childCount as number) || 0;
  const hiddenChildCount = (dataAny._hiddenChildCount as number) || 0;

  const showExpectations = activeFilters.includes("expectedResults");
  const showInstructions = activeFilters.includes("instructions");
  const showTestType = activeFilters.includes("testType");
  const showCodeRef = activeFilters.includes("codeReference");
  const showPriority = activeFilters.includes("priority");
  const showRisk = activeFilters.includes("risk");

  // Auto-focus first menu item when context menu opens
  useEffect(() => {
    if (showMenu && menuRef.current) {
      const firstItem = menuRef.current.querySelector<HTMLElement>("[role='menuitem']");
      firstItem?.focus();
    }
  }, [showMenu]);

  // Sync editLabel when data changes externally (e.g. undo)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isEditingLabel) setEditLabel(data.label);
  }, [data.label, isEditingLabel]);

  const startLabelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditLabel(data.label);
    setIsEditingLabel(true);
    setTimeout(() => labelInputRef.current?.select(), 0);
  };

  const commitLabelEdit = () => {
    // Guard against double-trigger from Enter keydown + blur firing in sequence
    if (!isEditingLabel) return;
    const trimmed = editLabel.trim();
    if (trimmed && trimmed !== data.label) {
      actionsRef.current.updateNodeLabel(id, trimmed);
    } else {
      setEditLabel(data.label);
    }
    setIsEditingLabel(false);
  };


  return (
    <div
      className="group relative h-full w-full"
      data-testid="scenario-node"
      style={{ minWidth: 250, minHeight: 100 }}
      onMouseLeave={() => { setShowMenu(false); resetDelete(); }}
    >
      <NodeResizer
        color="var(--primary)"
        isVisible={selected}
        minWidth={250}
        minHeight={100}
        handleClassName="!h-3.5 !w-3.5 !bg-background !border-2 !border-primary !shadow-lg !rounded-full transition-transform hover:scale-125"
        lineClassName="!border-primary/20 !border-2"
      />
      {/* Handles — invisible but required for ReactFlow edge connections.
           Inline styles override ReactFlow's min-width/min-height/background defaults. */}
      <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="r" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="b" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0 }} />

      <Handle type="source" position={Position.Top} id="s-t" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="s-r" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="s-b" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="s-l" style={{ opacity: 0 }} />

      {/* Content */}
      <div
        className={cn(
          "relative rounded-2xl border-2 transition-all p-6 min-h-[inherit] w-full h-full",
          "bg-card/80 dark:bg-gradient-to-b dark:from-card dark:to-card/50 backdrop-blur-xl shadow-xl flex flex-col items-stretch",
          isDropTarget
            ? "border-blue-500 ring-4 ring-blue-500/20 scale-[1.02]"
            : selected
            ? "border-primary ring-4 ring-primary/10"
            : "border-border hover:border-border/80 shadow-md hover:shadow-xl dark:shadow-none transition-shadow"
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Content */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-start gap-4 w-full">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <div className={cn("p-2.5 rounded-2xl shadow-inner transition-all", status.bg)}>
                  <Icon className={cn("w-5 h-5", status.color)} />
                </div>
              </div>

              <div className="flex-1 pt-1">
                {isEditingLabel ? (
                  <input
                    ref={labelInputRef}
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={commitLabelEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitLabelEdit();
                      if (e.key === "Escape") {
                        setEditLabel(data.label);
                        setIsEditingLabel(false);
                      }
                      e.stopPropagation();
                    }}
                    className="w-full font-bold text-base tracking-tight leading-snug text-left bg-transparent border-b-2 border-primary/40 outline-none py-0.5 -my-0.5"
                    maxLength={MAX_LABEL_LENGTH}
                    autoFocus
                  />
                ) : (
                   <h3
                    onClick={startLabelEdit}
                    className="font-bold text-base tracking-tight leading-snug text-left cursor-text hover:text-primary/80 transition-colors whitespace-pre-wrap break-words"
                    title={data.label}
                  >
                    {data.label.replace(/^\s*\[[\sxyX]*\]\s*/, "")}
                  </h3>
                )}
              </div>

              {/* Menu Button - moved inside flex to prevent overlap */}
              <div className="shrink-0 -mt-1 -mr-2">
                <button
                  ref={menuButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    } else if (e.key === "Escape" && showMenu) {
                      e.stopPropagation();
                      setShowMenu(false);
                    }
                  }}
                  className="p-2 hover:bg-secondary rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all active:scale-95"
                  aria-label="Node options"
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                >
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      role="menu"
                      aria-label="Node actions"
                      className="absolute right-0 top-12 z-50 min-w-[160px] bg-popover border border-border shadow-2xl rounded-2xl p-1.5 backdrop-blur-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.stopPropagation();
                          setShowMenu(false);
                          menuButtonRef.current?.focus();
                        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                          e.preventDefault();
                          e.stopPropagation();
                          const items = menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']");
                          if (!items?.length) return;
                          const current = document.activeElement as HTMLElement;
                          const idx = Array.from(items).indexOf(current);
                          const next = e.key === "ArrowDown"
                            ? items[(idx + 1) % items.length]
                            : items[(idx - 1 + items.length) % items.length];
                          next.focus();
                        }
                      }}
                    >
                      <div className="px-2 py-1.5 mb-1.5 border-b border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Node Actions</p>
                      </div>
                      <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); startLabelEdit(e); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                        Edit Name
                      </button>
                      <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); actionsRef.current.duplicateNode(id); setShowMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <Copy className="w-4 h-4 text-emerald-500" />
                        Duplicate
                      </button>
                      <div className="h-px bg-border/50 my-1" />
                      <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium rounded-lg transition-all text-left",
                          confirmDelete ? "bg-destructive text-destructive-foreground" : "hover:bg-destructive/10 text-destructive"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                        {confirmDelete ? "Confirm Delete" : "Delete"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Metadata Section (Below the "Score Line") */}
          {(showTestType || showPriority || showRisk || showInstructions || showExpectations || showCodeRef) && (
            <div className="space-y-3 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
              {showTestType && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50">
                    <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {type.label}
                    </span>
                  </div>
                </div>
              )}

              {showPriority && data.priority && (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50",
                    data.priority === "critical" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                    data.priority === "high" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                    data.priority === "medium" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                    "bg-secondary/50 text-muted-foreground"
                  )}>
                    <Flag className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {data.priority}
                    </span>
                  </div>
                </div>
              )}

              {showRisk && data.risk && (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50",
                    data.risk === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                    data.risk === "medium" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                    "bg-secondary/50 text-muted-foreground"
                  )}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Risk: {data.risk}
                    </span>
                  </div>
                </div>
              )}

              {showInstructions && data.instructions && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground/60 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Instructions
                  </span>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {data.instructions}
                  </p>
                </div>
              )}
              {showExpectations && data.expectedResults && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-blue-500/60 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Expected
                  </span>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {data.expectedResults}
                  </p>
                </div>
              )}
              {showCodeRef && data.codeRef && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-primary/60 flex items-center gap-1">
                    <Code className="w-3 h-3" /> Code
                  </span>
                  <p className="text-[11px] font-mono text-muted-foreground bg-secondary/30 p-1 rounded border border-border/30 truncate">
                    {data.codeRef}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand toggle — only shown when node has children */}
      {childCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            actionsRef.current.toggleCollapse(id);
          }}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? `Expand ${hiddenChildCount} hidden children` : "Collapse children"}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border-2 border-border shadow-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all active:scale-95 z-20"
          data-testid="collapse-toggle"
        >
          <ChevronRight
            className={cn(
              "w-3 h-3 transition-transform duration-200",
              !isCollapsed && "rotate-90"
            )}
          />
          {isCollapsed && (
            <span className="text-primary/70">+{hiddenChildCount}</span>
          )}
        </button>
      )}
    </div>
  );
});

ScenarioNode.displayName = "ScenarioNode";
