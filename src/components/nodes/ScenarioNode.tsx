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
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/context/UIContext";
import { NODE_WIDTH, NODE_MIN_HEIGHT } from "@/lib/constants";

interface ScenarioData {
  label: string;
  status: "untested" | "verified" | "failed";
  testType: "manual" | "unit" | "integration" | "e2e";
  instructions?: string;
  expectedResults?: string;
  codeRef?: string;
  onDelete?: (id: string) => void;
}

interface ScenarioNodeProps {
  id: string;
  data: ScenarioData;
  selected?: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
}

interface ScenarioNodeProps {
  id: string;
  data: {
    label: string;
    status: "untested" | "verified" | "failed";
    testType: "manual" | "unit" | "integration" | "e2e";
    instructions?: string;
    expectedResults?: string;
    codeRef?: string;
    onDelete?: (id: string) => void;
  };
  selected?: boolean;
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
  const [showMenu, setShowMenu] = useState(false);
  const status = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.untested;
  const type = typeConfig[data.testType as keyof typeof typeConfig] || typeConfig.manual;
  const Icon = status.icon;
  const TypeIcon = type.icon;
  
  // Use props if provided, otherwise default to Left/Right
  const finalTargetPos = targetPosition || Position.Left;
  const finalSourcePos = sourcePosition || Position.Right;

  // Performant filter check
  const hasFilter = (f: string) => {
    return (activeFilters as Set<string>)?.has?.(f) || false;
  };

  const showExpectations = hasFilter("expectedResults");
  const showInstructions = hasFilter("instructions");
  const showTestType = hasFilter("testType");
  const showCodeRef = hasFilter("codeReference");

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="group relative"
      style={{ width: NODE_WIDTH, minHeight: NODE_MIN_HEIGHT, boxSizing: 'border-box' }}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Handles - Mathematically precise connection points */}
      <Handle 
        id="target"
        type="target" 
        position={finalTargetPos} 
        className="!p-0 !m-0 !border-0 !bg-transparent !w-[1px] !h-[1px] !min-w-0 !min-h-0"
        style={{ 
          position: 'absolute',
          top: finalTargetPos === Position.Top ? 0 : finalTargetPos === Position.Bottom ? '100%' : '50%',
          left: finalTargetPos === Position.Left ? 0 : finalTargetPos === Position.Right ? '100%' : '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100
        }}
      />
      <Handle 
        id="source"
        type="source" 
        position={finalSourcePos} 
        className="!p-0 !m-0 !border-0 !bg-transparent !w-[1px] !h-[1px] !min-w-0 !min-h-0"
        style={{ 
          position: 'absolute',
          top: finalSourcePos === Position.Top ? 0 : finalSourcePos === Position.Bottom ? '100%' : '50%',
          left: finalSourcePos === Position.Left ? 0 : finalSourcePos === Position.Right ? '100%' : '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100
        }}
      />

      {/* Visual Indicator Dots - Precisely centered on the handles */}
      <div 
        className="absolute w-2 h-2 bg-black rounded-full z-10 pointer-events-none"
        style={{
          top: finalTargetPos === Position.Top ? 0 : finalTargetPos === Position.Bottom ? '100%' : '50%',
          left: finalTargetPos === Position.Left ? 0 : finalTargetPos === Position.Right ? '100%' : '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      <div 
        className="absolute w-2 h-2 bg-black rounded-full z-10 pointer-events-none"
        style={{
          top: finalSourcePos === Position.Top ? 0 : finalSourcePos === Position.Bottom ? '100%' : '50%',
          left: finalSourcePos === Position.Left ? 0 : finalSourcePos === Position.Right ? '100%' : '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Visual Content Layer - Now relative to allow the parent to grow/shrink with content */}
      <div className={cn(
        "relative rounded-[32px] border-2 transition-all p-6",
        "bg-card/80 backdrop-blur-xl shadow-xl flex flex-col items-stretch overflow-hidden",
        selected ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-border/80"
      )}>
        <div className="flex flex-col gap-4">
          {/* Absolute Menu - Top Right */}
          <div className="absolute right-4 top-4 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 hover:bg-secondary rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-95"
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
                    onClick={() => { setEditingNodeId(id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Manage Node</span>
                  </button>
                  <button 
                    onClick={() => { 
                      if (window.confirm("Are you sure you want to delete this scenario? This will also remove all its sub-scenarios.")) {
                        data.onDelete?.(id); 
                        setShowMenu(false); 
                      }
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Quick Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content - Fixed Left Icon + Label Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-start gap-4 w-full">
              {/* Fixed Status Area */}
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <div className={cn("p-2.5 rounded-2xl shadow-inner transition-all", status.bg)}>
                  <Icon className={cn("w-5 h-5", status.color)} />
                </div>
              </div>
              
              {/* Label Area */}
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-base tracking-tight leading-snug text-left">{data.label}</h3>
                
                {showTestType && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50">
                      <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{type.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Information (Filtered) */}
          {(showInstructions || showExpectations || showCodeRef) && (
            <div className="space-y-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
              {showInstructions && data.instructions && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground/60 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Instructions
                  </span>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{data.instructions}</p>
                </div>
              )}
              {showExpectations && data.expectedResults && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-500/60 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Expected
                  </span>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{data.expectedResults}</p>
                </div>
              )}
              {showCodeRef && data.codeRef && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-primary/60 flex items-center gap-1">
                    <Code className="w-3 h-3" /> Code
                  </span>
                  <p className="text-[10px] font-mono text-muted-foreground bg-secondary/30 p-1 rounded border border-border/30 truncate">
                    {data.codeRef}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

ScenarioNode.displayName = "ScenarioNode";
