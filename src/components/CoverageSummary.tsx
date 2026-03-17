"use client";

import { useMemo } from "react";
import { Panel } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";

interface CoverageSummaryProps {
  nodes: Node[];
}

export function CoverageSummary({ nodes }: CoverageSummaryProps) {
  const counts = useMemo(() => {
    const scenarioNodes = nodes.filter((n) => n.type === "scenario");
    return {
      total: scenarioNodes.length,
      verified: scenarioNodes.filter((n) => (n.data as ScenarioData).status === "verified").length,
      untested: scenarioNodes.filter((n) => (n.data as ScenarioData).status === "untested").length,
      failed: scenarioNodes.filter((n) => (n.data as ScenarioData).status === "failed").length,
    };
  }, [nodes]);

  if (counts.total === 0) return null;

  return (
    <Panel position="top-center" className="mt-6 pointer-events-auto">
      <div
        className="glass island-shadow rounded-2xl px-5 py-2.5 border border-white/5 flex items-center gap-4 text-xs font-semibold"
        data-testid="coverage-summary"
      >
        <span className="text-foreground/60">
          {counts.total} scenario{counts.total !== 1 ? "s" : ""}
        </span>
        <div className="h-4 w-px bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-green-500/80">{counts.verified}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">{counts.untested}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-destructive/80">{counts.failed}</span>
        </span>
      </div>
    </Panel>
  );
}
