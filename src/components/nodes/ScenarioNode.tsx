import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { useUI } from "@/context/UIContext";
import { ShieldCheck, ShieldAlert, Shield, Info, ClipboardList, Code2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ScenarioNode = memo(({ data }: any) => {
  const { activeFilters, viewMode } = useUI();
  const status = data.status || "untested";
  
  const showExpected = activeFilters.has("expectedResults") && data.expectedResults;
  const showInstructions = activeFilters.has("instructions") && data.instructions;
  const showTestType = activeFilters.has("testType");
  const showCode = activeFilters.has("codeReference") && data.codeRef;

  return (
    <div className={`px-4 py-3 rounded-2xl shadow-sm border transition-all duration-200 group bg-card min-w-[220px] max-w-[320px] hover:shadow-md hover:border-primary/20 ${
      status === "verified" ? "border-green-500/20" : 
      status === "failed" ? "border-red-500/20" : "border-border"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scenario</span>
          {showTestType && data.testType && (
            <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium uppercase tracking-tighter">
              {data.testType}
            </span>
          )}
        </div>
        {status === "verified" ? <ShieldCheck className="w-4 h-4 text-green-500" /> : 
         status === "failed" ? <ShieldAlert className="w-4 h-4 text-red-500" /> : 
         <Shield className="w-4 h-4 text-muted-foreground" />}
      </div>
      
      <div className="text-sm font-semibold tracking-tight text-foreground mb-1 leading-snug">
        {data.label}
      </div>

      <AnimatePresence>
        <div className="space-y-3 mt-3">
          {showInstructions && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 p-2 rounded-lg bg-secondary/30 border border-border/50">
                <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-normal italic">{data.instructions}</p>
              </div>
            </motion.div>
          )}

          {showExpected && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <ClipboardList className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase block mb-0.5">Expected</span>
                  <p className="text-[11px] text-foreground/80 leading-normal">{data.expectedResults}</p>
                </div>
              </div>
            </motion.div>
          )}

          {showCode && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-mono text-primary/80 truncate max-w-[120px]">{data.codeRef}</span>
                </div>
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      {/* Dynamic Handles */}
      <Handle 
        type="target" 
        position={viewMode === "mindmap" ? Position.Left : Position.Top} 
        className={`w-2 h-2 !bg-primary border-none !opacity-0 group-hover:!opacity-100 transition-opacity ${
          viewMode === "mindmap" ? "!left-[-4px]" : "!top-[-4px]"
        }`} 
      />
      <Handle 
        type="source" 
        position={viewMode === "mindmap" ? Position.Right : Position.Bottom} 
        className={`w-2 h-2 !bg-primary border-none !opacity-0 group-hover:!opacity-100 transition-opacity ${
          viewMode === "mindmap" ? "!right-[-4px]" : "!bottom-[-4px]"
        }`} 
      />
    </div>
  );
});

ScenarioNode.displayName = "ScenarioNode";
