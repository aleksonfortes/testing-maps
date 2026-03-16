"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Save, Type, FileText, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useUI } from "@/context/UIContext";
import type { ScenarioData } from "@/lib/types";

interface ScenarioModalProps {
  nodeId: string;
  initialData: ScenarioData;
  onUpdate: (id: string, data: Partial<ScenarioData>) => void;
  onDelete: (id: string) => void;
}

export function ScenarioModal({ nodeId, initialData, onUpdate, onDelete }: ScenarioModalProps) {
  const { setEditingNodeId } = useUI();
  const [formData, setFormData] = useState<ScenarioData>({ ...initialData });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => setEditingNodeId(null);

  const handleSave = () => {
    const { ...data } = formData;
    onUpdate(nodeId, data);
    setEditingNodeId(null);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(nodeId);
      setEditingNodeId(null);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
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
        handleClose();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Manage Scenario"
      ref={modalRef}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-8 border-b border-border bg-secondary/10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Manage Scenario</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Configure testing details for this node
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 hover:bg-secondary rounded-full transition-all border border-border/50 hover:scale-110 active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-3">
            <label htmlFor="scenario-name" className="text-sm font-bold flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              Scenario Name
            </label>
            <input
              id="scenario-name"
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
              placeholder="Enter scenario name..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="scenario-status" className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Status
              </label>
              <select
                id="scenario-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ScenarioData["status"] })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
              >
                <option value="untested">Untested</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="space-y-3">
              <label htmlFor="scenario-test-type" className="text-sm font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                Test Type
              </label>
              <select
                id="scenario-test-type"
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as ScenarioData["testType"] })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
              >
                <option value="manual">Manual</option>
                <option value="unit">Unit</option>
                <option value="integration">Integration</option>
                <option value="e2e">E2E</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="scenario-instructions" className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Instructions
            </label>
            <textarea
              id="scenario-instructions"
              value={formData.instructions ?? ""}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={3}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 transition-all outline-none resize-none"
              placeholder="What needs to be tested?"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="scenario-expected" className="text-sm font-bold flex items-center gap-2 text-blue-500">
              <CheckCircle2 className="w-4 h-4" />
              Expected Results
            </label>
            <textarea
              id="scenario-expected"
              value={formData.expectedResults ?? ""}
              onChange={(e) => setFormData({ ...formData, expectedResults: e.target.value })}
              rows={3}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-blue-500/20 transition-all outline-none resize-none"
              placeholder="What is the successful outcome?"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="scenario-code-ref" className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary font-mono" />
              Code Reference
            </label>
            <input
              id="scenario-code-ref"
              type="text"
              value={formData.codeRef ?? ""}
              onChange={(e) => setFormData({ ...formData, codeRef: e.target.value })}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 ring-primary/20 transition-all outline-none"
              placeholder="e.g. tests/auth.spec.ts"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-border flex items-center justify-between gap-4 bg-secondary/10">
          <button
            onClick={handleDelete}
            className={
              confirmDelete
                ? "flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                : "flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            }
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete ? "Click again to confirm" : "Delete"}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
