"use client";

import { useMemo } from "react";
import { Panel } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface BulkActionBarProps {
  nodes: Node[];
  onBulkStatusChange: (status: ScenarioData["status"]) => void;
}

export function BulkActionBar({ nodes, onBulkStatusChange }: BulkActionBarProps) {
  const selectedCount = useMemo(
    () => nodes.filter((n) => n.selected && !n.hidden).length,
    [nodes]
  );

  if (selectedCount < 2) return null;

  return (
    <Panel position="bottom-center" className="mb-28 pointer-events-auto z-[110]">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="glass island-shadow rounded-2xl px-4 py-2.5 border border-white/10 flex items-center gap-3"
        data-testid="bulk-action-bar"
        role="toolbar"
        aria-label="Bulk status actions"
      >
        <span className="text-xs font-bold text-foreground/70 whitespace-nowrap" aria-live="polite">
          {selectedCount} selected
        </span>

        <div className="h-5 w-px bg-white/10" aria-hidden="true" />

        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40" id="bulk-status-label">
          Set status:
        </span>

        <button
          onClick={() => onBulkStatusChange("verified")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[11px] font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all active:scale-95"
          data-testid="bulk-status-verified"
          aria-label={`Set ${selectedCount} selected nodes to verified`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified
        </button>

        <button
          onClick={() => onBulkStatusChange("failed")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider hover:bg-destructive/20 transition-all active:scale-95"
          data-testid="bulk-status-failed"
          aria-label={`Set ${selectedCount} selected nodes to failed`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Failed
        </button>

        <button
          onClick={() => onBulkStatusChange("untested")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95"
          data-testid="bulk-status-untested"
          aria-label={`Set ${selectedCount} selected nodes to untested`}
        >
          <Circle className="w-3.5 h-3.5" />
          Untested
        </button>
      </motion.div>
    </Panel>
  );
}
