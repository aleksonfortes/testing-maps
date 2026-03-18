"use client";

import { useMemo } from "react";
import { Panel } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";

interface CoverageSummaryProps {
  nodes: Node[];
  hiddenIds?: Set<string>;
}

export function CoverageSummary({ nodes, hiddenIds }: CoverageSummaryProps) {
  const counts = useMemo(() => {
    const allScenarios = nodes.filter((n) => n.type === "scenario");
    const visibleScenarios = hiddenIds
      ? allScenarios.filter((n) => !hiddenIds.has(n.id))
      : allScenarios;
    const hiddenCount = allScenarios.length - visibleScenarios.length;
    return {
      total: visibleScenarios.length,
      hiddenCount,
      verified: visibleScenarios.filter((n) => (n.data as ScenarioData).status === "verified").length,
      untested: visibleScenarios.filter((n) => (n.data as ScenarioData).status === "untested").length,
      failed: visibleScenarios.filter((n) => (n.data as ScenarioData).status === "failed").length,
    };
  }, [nodes, hiddenIds]);

  if (counts.total === 0 && counts.hiddenCount === 0) return null;

  return (
    <Panel position="top-center" className="mt-6 pointer-events-auto">
      <div
        className="glass island-shadow rounded-2xl px-5 py-2.5 border border-white/5 flex items-center gap-4 text-xs font-semibold"
        data-testid="coverage-summary"
        role="status"
        aria-label={`Coverage: ${counts.verified} verified, ${counts.untested} untested, ${counts.failed} failed out of ${counts.total}${counts.hiddenCount > 0 ? ` (${counts.hiddenCount} hidden)` : ""}`}
      >
        <span className="text-foreground/60">
          {counts.total} scenario{counts.total !== 1 ? "s" : ""}
          {counts.hiddenCount > 0 && (
            <span className="text-foreground/30 ml-1">(+{counts.hiddenCount} hidden)</span>
          )}
        </span>
        <div className="h-4 w-px bg-white/10" aria-hidden="true" />
        <span className="flex items-center gap-1.5" title="Verified">
          <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          <span className="text-green-500/80">{counts.verified}</span>
          <span className="sr-only">verified</span>
        </span>
        <span className="flex items-center gap-1.5" title="Untested">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">{counts.untested}</span>
          <span className="sr-only">untested</span>
        </span>
        <span className="flex items-center gap-1.5" title="Failed">
          <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
          <span className="text-destructive/80">{counts.failed}</span>
          <span className="sr-only">failed</span>
        </span>
      </div>
    </Panel>
  );
}
