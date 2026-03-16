"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, X, FileJson, Download, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Node, Edge } from "@xyflow/react";

interface MarkdownExportProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

export function MarkdownExport({ nodes, edges, onClose }: MarkdownExportProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const markdown = useMemo(() => {
    const rootNodes = nodes.filter((node) => !edges.some((edge) => edge.target === node.id));
    let result = "# Testing Map Export\n\n";

    const processNode = (node: Node, level: number, visited: Set<string>) => {
      if (visited.has(node.id)) return; // cycle detection
      visited.add(node.id);

      const data = node.data as Record<string, string | undefined>;
      const status = data.status ? data.status.toUpperCase() : "UNKNOWN";
      const testType = data.testType ?? "unknown";
      result += `${"  ".repeat(level)}- **${data.label ?? "Untitled"}** [${status}] (${testType})\n`;
      if (data.instructions) result += `${"  ".repeat(level)}  - *Instructions:* ${data.instructions}\n`;
      if (data.expectedResults) result += `${"  ".repeat(level)}  - *Expected:* ${data.expectedResults}\n`;
      if (data.codeRef) result += `${"  ".repeat(level)}  - *Code:* \`${data.codeRef}\`\n`;

      // Build child list with an index for efficient lookup
      const children = nodes.filter((n) => edges.some((e) => e.source === node.id && e.target === n.id));
      children.forEach((child) => processNode(child, level + 1, visited));
    };

    rootNodes.forEach((root) => processNode(root, 0, new Set()));
    return result;
  }, [nodes, edges]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Clipboard API failed — fall back silently
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testing-map.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Focus trap + Escape key
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Markdown Export"
      ref={modalRef}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <header className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileJson className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Markdown Structure</h3>
              <p className="text-xs text-muted-foreground">
                Hierarchical view of your testing scenarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Close export"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-secondary/5 font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {markdown}
        </div>

        <footer className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/10">
          <button
            onClick={downloadMarkdown}
            className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
          >
            <Download className="w-4 h-4" />
            Download .md
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copySuccess ? "Copied!" : "Copy Markdown"}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
