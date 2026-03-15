"use client";

import React from "react";
import { Copy, X, FileJson, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MarkdownExportProps {
  nodes: any[];
  edges: any[];
  onClose: () => void;
}

export function MarkdownExport({ nodes, edges, onClose }: MarkdownExportProps) {
  const generateMarkdown = () => {
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => !edges.some(edge => edge.target === node.id));
    
    let markdown = "# Testing Map Export\n\n";

    const processNode = (node: any, level: number) => {
      const indent = "  ".repeat(level);
      const data = node.data;
      markdown += `${indent}- **${data.label}** [${data.status.toUpperCase()}] (${data.testType})\n`;
      if (data.instructions) markdown += `${indent}  - *Instructions:* ${data.instructions}\n`;
      if (data.expectedResults) markdown += `${indent}  - *Expected:* ${data.expectedResults}\n`;
      if (data.codeRef) markdown += `${indent}  - *Code:* \`${data.codeRef}\`\n`;
      
      const children = nodes.filter(n => edges.some(e => e.source === node.id && e.target === n.id));
      children.forEach(child => processNode(child, level + 1));
    };

    rootNodes.forEach(root => processNode(root, 0));
    return markdown;
  };

  const markdown = generateMarkdown();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    alert("Markdown copied to clipboard!");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
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
                <p className="text-xs text-muted-foreground">Hierarchical view of your testing scenarios</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-auto p-6 bg-secondary/5 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {markdown}
          </div>

          <footer className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/10">
            <button 
              onClick={() => {
                const blob = new Blob([markdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'testing-map.md';
                a.click();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
            >
              <Download className="w-4 h-4" />
              Download .md
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              <Copy className="w-4 h-4" />
              Copy Markdown
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
