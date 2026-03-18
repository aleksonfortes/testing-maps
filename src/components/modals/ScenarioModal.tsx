"use client";

import React, { useCallback, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, Trash2, Save, Type, FileText, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useConfirmAction } from "@/hooks/useConfirmAction";
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

  const handleClose = () => setEditingNodeId(null);

  const handleSave = () => {
    onUpdate(nodeId, formData);
    setEditingNodeId(null);
  };

  const handleDeleteConfirmed = useCallback(() => {
    onDelete(nodeId);
    setEditingNodeId(null);
  }, [onDelete, nodeId, setEditingNodeId]);

  const { isPending: confirmDelete, trigger: handleDelete } = useConfirmAction(handleDeleteConfirmed);

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) handleClose(); }}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/60 backdrop-blur-md"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild forceMount>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto relative w-full max-w-2xl glass border border-white/10 shadow-2xl rounded-[2.5rem] island-shadow flex flex-col overflow-hidden max-h-[90vh]">
              {/* Header */}
              <header className="flex items-center justify-between p-8 border-b border-border bg-secondary/20">
                <div>
                  <Dialog.Title className="text-xl font-bold tracking-tight">Edit Test</Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground">
                    Configure testing details for this scenario
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    className="p-3 hover:bg-secondary rounded-full transition-all hover:rotate-90"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </Dialog.Close>
              </header>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <div className="space-y-3">
                  <label htmlFor="scenario-name" className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" />
                    Scenario Name
                  </label>
                  <input
                    id="scenario-name"
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-white/10 transition-all outline-none font-medium"
                    placeholder="Enter scenario name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="scenario-status" className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status
                    </label>
                    <select
                      id="scenario-status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ScenarioData["status"] })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 ring-white/10 font-medium appearance-none"
                    >
                      <option value="untested">Untested</option>
                      <option value="verified">Verified</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="scenario-test-type" className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Test Type
                    </label>
                    <select
                      id="scenario-test-type"
                      value={formData.testType}
                      onChange={(e) => setFormData({ ...formData, testType: e.target.value as ScenarioData["testType"] })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 ring-white/10 font-medium appearance-none"
                    >
                      <option value="manual">Manual</option>
                      <option value="unit">Unit</option>
                      <option value="integration">Integration</option>
                      <option value="e2e">E2E</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="scenario-instructions" className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Instructions
                  </label>
                  <textarea
                    id="scenario-instructions"
                    value={formData.instructions ?? ""}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={3}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-white/10 transition-all outline-none resize-none font-medium leading-relaxed"
                    placeholder="What needs to be tested?"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="scenario-expected" className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Expected Results
                  </label>
                  <textarea
                    id="scenario-expected"
                    value={formData.expectedResults ?? ""}
                    onChange={(e) => setFormData({ ...formData, expectedResults: e.target.value })}
                    rows={3}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-white/10 transition-all outline-none resize-none font-medium leading-relaxed"
                    placeholder="What is the successful outcome?"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="scenario-code-ref" className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Code Reference
                  </label>
                  <input
                    id="scenario-code-ref"
                    type="text"
                    value={formData.codeRef ?? ""}
                    onChange={(e) => setFormData({ ...formData, codeRef: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-mono focus:ring-2 ring-white/10 transition-all outline-none opacity-80"
                    placeholder="e.g. tests/auth.spec.ts"
                  />
                </div>
              </div>

              {/* Footer */}
              <footer className="p-8 border-t border-border flex items-center justify-between gap-4 bg-secondary/10">
                <button
                  onClick={handleDelete}
                  className={
                    confirmDelete
                      ? "flex items-center gap-2 bg-destructive text-destructive-foreground px-5 py-3 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all"
                      : "flex items-center gap-2 text-foreground/30 hover:text-destructive hover:bg-destructive/10 px-5 py-3 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmDelete ? "Confirm Delete" : "Delete"}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black rounded-2xl font-bold text-[13px] uppercase tracking-wider hover:bg-white/90 transition-all active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </footer>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
