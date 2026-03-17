"use client";

import React, { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, X, FileJson, Download, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Node, Edge } from "@xyflow/react";

interface MarkdownExportProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

export function MarkdownExport({ nodes, edges, onClose }: MarkdownExportProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const markdown = useMemo(() => {
    const rootNodes = nodes.filter((node) => !edges.some((edge) => edge.target === node.id));
    let result = "# Testing Map Export\n\n";

    const processNode = (node: Node, level: number, visited: Set<string>) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      const data = node.data as Record<string, string | undefined>;
      const status = data.status ? data.status.toUpperCase() : "UNKNOWN";
      const testType = data.testType ?? "unknown";
      result += `${"  ".repeat(level)}- **${data.label ?? "Untitled"}** [${status}] (${testType})\n`;
      if (data.instructions) result += `${"  ".repeat(level)}  - *Instructions:* ${data.instructions}\n`;
      if (data.expectedResults) result += `${"  ".repeat(level)}  - *Expected:* ${data.expectedResults}\n`;
      if (data.codeRef) result += `${"  ".repeat(level)}  - *Code:* \`${data.codeRef}\`\n`;

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
      // Clipboard API failed
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

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-background/80 backdrop-blur-xl"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild forceMount>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto glass border border-white/10 rounded-[2.5rem] island-shadow w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
              <header className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
                    <FileJson className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-bold">Markdown Structure</Dialog.Title>
                    <Dialog.Description className="text-xs text-muted-foreground">
                      Hierarchical view of your testing scenarios
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                    aria-label="Close export"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </header>

              <div className="flex-1 overflow-auto p-8 bg-black/40 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground/80 border-y border-white/5 selection:bg-white selection:text-black">
                {markdown}
              </div>

              <footer className="p-8 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02]">
                <button
                  onClick={downloadMarkdown}
                  className="flex items-center gap-2 px-8 py-3 bg-white/5 text-foreground/70 border border-white/5 rounded-2xl font-bold text-[13px] uppercase tracking-wider hover:bg-white/10 hover:text-foreground transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-2xl font-bold text-[13px] uppercase tracking-wider hover:bg-white/90 transition-all"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? "Copied" : "Copy"}
                </button>
              </footer>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
