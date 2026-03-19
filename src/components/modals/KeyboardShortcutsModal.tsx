"use client";

import React, { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 bg-white/5 rounded-md font-mono text-[11px] border border-white/10">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const isMac = useMemo(
    () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent),
    []
  );
  const mod = isMac ? "⌘" : "Ctrl";

  const shortcuts = [
    { keys: ["Tab"], description: "Add child node" },
    { keys: ["Del / Backspace"], description: "Delete selected" },
    { keys: [`${mod}+Z`], description: "Undo" },
    { keys: [`${mod}+Shift+Z`], description: "Redo" },
    { keys: [`${mod}+A`], description: "Select all" },
    { keys: ["Dbl-click"], description: "Edit test details" },
    { keys: ["Drag"], description: "Reparent node" },
    { keys: ["Shift+Drag"], description: "Box select" },
    { keys: ["1"], description: "Set verified" },
    { keys: ["2"], description: "Set failed" },
    { keys: ["3"], description: "Set untested" },
    { keys: ["?"], description: "Show this help" },
  ];

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-background/80 backdrop-blur-xl"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild forceMount>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto glass border border-white/10 rounded-[2.5rem] island-shadow w-full max-w-sm overflow-hidden shadow-2xl">
              {/* Header */}
              <header className="p-8 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Keyboard className="w-6 h-6 text-foreground/70" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-bold tracking-tight">
                      Keyboard Shortcuts
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      Quick reference for canvas actions
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button
                    className="p-2.5 hover:bg-secondary rounded-full transition-all hover:rotate-90"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </Dialog.Close>
              </header>

              {/* Body */}
              <div className="p-8 space-y-1">
                {shortcuts.map(({ keys, description }) => (
                  <div
                    key={description}
                    className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-foreground/70">{description}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
