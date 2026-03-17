"use client";

import React, { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
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
  Settings,
  FileText,
  Target,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/context/UIContext";
import { useMapActions } from "@/components/MapCanvas";
import { NODE_WIDTH, NODE_MIN_HEIGHT } from "@/lib/constants";
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
  const { setEditingNodeId, activeFilters } = useUI();
  const actionsRef = useMapActions();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = statusConfig[data.status] ?? statusConfig.untested;
  const type = typeConfig[data.testType] ?? typeConfig.manual;
  const Icon = status.icon;
  const TypeIcon = type.icon;

  const finalTargetPos = targetPosition || Position.Left;
  const finalSourcePos = sourcePosition || Position.Right;

  const isDropTarget = !!data.isDropTarget;
  const isCollapsed = actionsRef.current.isCollapsed(id);
  const childCount = actionsRef.current.getChildCount(id);
  const hiddenChildCount = actionsRef.current.getHiddenChildCount(id);

  const showExpectations = activeFilters.includes("expectedResults");
  const showInstructions = activeFilters.includes("instructions");
  const showTestType = activeFilters.includes("testType");
  const showCodeRef = activeFilters.includes("codeReference");

  const handlePositionStyle = (pos: Position) => ({
    position: "absolute" as const,
    top: pos === Position.Top ? 0 : pos === Position.Bottom ? "100%" : "50%",
    left: pos === Position.Left ? 0 : pos === Position.Right ? "100%" : "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 100,
  });

  const handleDelete = () => {
    if (confirmDelete) {
      actionsRef.current.deleteNode(id);
      setShowMenu(false);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="group relative"
      data-testid="scenario-node"
      style={{ width: NODE_WIDTH, minHeight: NODE_MIN_HEIGHT, boxSizing: "border-box" }}
      onMouseLeave={() => { setShowMenu(false); setConfirmDelete(false); }}
    >
      {/* Handles — invisible but required for ReactFlow edge connections.
           Inline styles override ReactFlow's min-width/min-height/background defaults. */}
      <Handle
        id="target"
        type="target"
        position={finalTargetPos}
        style={{
          ...handlePositionStyle(finalTargetPos),
          width: 0, height: 0, minWidth: 0, minHeight: 0,
          background: "transparent", border: "none", padding: 0,
          opacity: 0, visibility: "hidden" as const, overflow: "hidden",
        }}
      />
      <Handle
        id="source"
        type="source"
        position={finalSourcePos}
        style={{
          ...handlePositionStyle(finalSourcePos),
          width: 0, height: 0, minWidth: 0, minHeight: 0,
          background: "transparent", border: "none", padding: 0,
          opacity: 0, visibility: "hidden" as const, overflow: "hidden",
        }}
      />

      {/* Content */}
      <div
        className={cn(
          "relative rounded-2xl border-2 transition-all p-6",
          "bg-card/80 backdrop-blur-xl shadow-xl flex flex-col items-stretch overflow-hidden",
          isDropTarget
            ? "border-blue-500 ring-4 ring-blue-500/20 scale-[1.02]"
            : selected
            ? "border-primary ring-4 ring-primary/10"
            : "border-border hover:border-border/80"
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Menu */}
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-secondary rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-95"
              aria-label="Node options"
            >
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 p-2 bg-card border border-border shadow-2xl rounded-2xl z-[100] overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setEditingNodeId(id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Manage Node</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-xl transition-colors text-left",
                      confirmDelete
                        ? "bg-destructive text-destructive-foreground"
                        : "hover:bg-destructive/10 text-destructive"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {confirmDelete ? "Click to confirm" : "Quick Delete"}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-start gap-4 w-full">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <div className={cn("p-2.5 rounded-2xl shadow-inner transition-all", status.bg)}>
                  <Icon className={cn("w-5 h-5", status.color)} />
                </div>
              </div>

              <div className="flex-1 pt-1">
                <h3 className="font-bold text-base tracking-tight leading-snug text-left">
                  {data.label}
                </h3>

                {showTestType && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50">
                      <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {type.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed info (filtered) */}
          {(showInstructions || showExpectations || showCodeRef) && (
            <div className="space-y-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
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
