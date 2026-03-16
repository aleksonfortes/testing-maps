"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, X, FileUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { parseMarkdown } from "@/lib/markdown-parser";
import type { Node, Edge } from "@xyflow/react";
import type { ScenarioData } from "@/lib/types";

type ImportMode = "replace" | "create";

interface MarkdownImportProps {
  onImport: (nodes: Node<ScenarioData>[], edges: Edge[], mode: ImportMode) => void;
  onClose: () => void;
}

export function MarkdownImport({ onImport, onClose }: MarkdownImportProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<ImportMode>("replace");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);

  const preview = markdown.trim()
    ? (() => {
        try {
          const result = parseMarkdown(markdown);
          return result;
        } catch {
          return null;
        }
      })()
    : null;

  const handleImport = useCallback(() => {
    if (!markdown.trim()) {
      setError("Please paste or upload markdown content.");
      return;
    }
    try {
      const { nodes, edges } = parseMarkdown(markdown);
      if (nodes.length === 0) {
        setError("No scenarios found in the markdown. Check the format.");
        return;
      }
      onImport(nodes, edges, mode);
      onClose();
    } catch {
      setError("Failed to parse markdown. Check the format and try again.");
    }
  }, [markdown, mode, onImport, onClose]);

  const handleFileRead = useCallback((file: File) => {
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt") && !file.name.endsWith(".markdown")) {
      setError("Please upload a .md, .txt, or .markdown file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setMarkdown(text);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead]
  );

  // Focus trap + Escape key
  useEffect(() => {
    setMounted(true);
    const modal = modalRef.current;
    if (!modal) return () => setMounted(false);

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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      setMounted(false);
    };
  }, [onClose]);

  const modalContent = (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 lg:p-12 bg-background/80 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Markdown Import"
      ref={modalRef}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] glass shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
      >
        <header className="p-8 border-b border-border flex justify-between items-center bg-secondary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Import from Markdown</h3>
              <p className="text-sm text-muted-foreground">
                Paste markdown or drop a .md file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-secondary rounded-full transition-all hover:rotate-90"
            aria-label="Close import"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-6 custom-scrollbar">
          {/* Drop zone / textarea */}
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => {
                setMarkdown(e.target.value);
                setError(null);
              }}
              placeholder={`Paste your markdown here or drag a .md file...\n\nExample format:\n# My Testing Map\n\n- **Login Flow** [VERIFIED] (e2e)\n  - *Instructions:* Test the login page\n  - **Email Login** [UNTESTED] (unit)\n  - **Google OAuth** [VERIFIED] (integration)`}
              className="w-full min-h-[200px] bg-transparent p-4 text-sm font-mono focus:outline-none resize-y"
            />
            {!markdown && (
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  Upload file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.markdown"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Import mode */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode("replace")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                mode === "replace"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Replace current map
            </button>
            <button
              onClick={() => setMode("create")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                mode === "create"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Create new map
            </button>
          </div>

          {/* Preview */}
          {preview && preview.nodes.length > 0 && (
            <div className="bg-secondary/30 rounded-xl p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Preview: {preview.nodes.length} scenario{preview.nodes.length !== 1 ? "s" : ""}, {preview.edges.length} connection{preview.edges.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-0.5 mt-2 max-h-32 overflow-y-auto">
                {preview.nodes.slice(0, 10).map((n) => (
                  <li key={n.id} className="truncate">
                    {(n.data as ScenarioData).label} [{(n.data as ScenarioData).status.toUpperCase()}]
                  </li>
                ))}
                {preview.nodes.length > 10 && (
                  <li className="italic">...and {preview.nodes.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-border flex justify-end gap-4 bg-secondary/10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!markdown.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Import {mode === "replace" ? "(Replace)" : "(Create New)"}
          </button>
        </footer>
      </motion.div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
