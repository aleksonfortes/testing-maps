"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Save, Type, FileText, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useUI } from "@/context/UIContext";

interface ScenarioModalProps {
  node: any;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function ScenarioModal({ node, onUpdate, onDelete }: ScenarioModalProps) {
  const { setEditingNodeId } = useUI();
  const [formData, setFormData] = useState(node.data);

  useEffect(() => {
    setFormData(node.data);
  }, [node]);

  const handleSave = () => {
    onUpdate(node.id, formData);
    setEditingNodeId(null);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this scenario? This action cannot be undone.")) {
      onDelete(node.id);
      setEditingNodeId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setEditingNodeId(null)}
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
              <p className="text-sm text-muted-foreground mt-1 font-medium">Configure testing details for this node</p>
            </div>
            <button 
              onClick={() => setEditingNodeId(null)}
              className="p-2.5 hover:bg-secondary rounded-full transition-all border border-border/50 hover:scale-110 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </header>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Label */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Scenario Name
              </label>
              <input 
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                placeholder="Enter scenario name..."
              />
            </div>

            {/* Status & Test Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                >
                  <option value="untested">Untested</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  Test Type
                </label>
                <select 
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                >
                  <option value="manual">Manual</option>
                  <option value="unit">Unit</option>
                  <option value="integration">Integration</option>
                  <option value="e2e">E2E</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Instructions
              </label>
              <textarea 
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 transition-all outline-none resize-none"
                placeholder="What needs to be tested?"
              />
            </div>

            {/* Expected Results */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2 text-blue-500">
                <CheckCircle2 className="w-4 h-4" />
                Expected Results
              </label>
              <textarea 
                value={formData.expectedResults}
                onChange={(e) => setFormData({ ...formData, expectedResults: e.target.value })}
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-blue-500/20 transition-all outline-none resize-none"
                placeholder="What is the successful outcome?"
              />
            </div>

            {/* Code Reference */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary font-mono" />
                Code Reference
              </label>
              <input 
                type="text"
                value={formData.codeRef}
                onChange={(e) => setFormData({ ...formData, codeRef: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 ring-primary/20 transition-all outline-none"
                placeholder="e.g. tests/auth.spec.ts"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <footer className="p-6 border-t border-border flex items-center justify-between gap-4 bg-secondary/10">
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
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
    </AnimatePresence>
  );
}
