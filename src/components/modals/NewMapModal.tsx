"use client";

import React, { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Map, X, Loader2, Sparkles } from "lucide-react";
import { MAX_MAP_NAME_LENGTH } from "@/lib/constants";
import { motion } from "framer-motion";

interface NewMapModalProps {
  onCreateMap: (name: string) => Promise<string | null>;
  onClose: () => void;
}

export function NewMapModal({ onCreateMap, onClose }: NewMapModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input after mount animation
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateMap(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
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
            <div className="pointer-events-auto glass border border-white/10 rounded-[2.5rem] island-shadow w-full max-w-md overflow-hidden shadow-2xl">
              {/* Header */}
              <header className="p-8 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Map className="w-6 h-6 text-foreground/70" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-bold tracking-tight">
                      New Map
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      Give your map a name to get started
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button
                    className="p-2.5 hover:bg-secondary rounded-full transition-all hover:rotate-90"
                    aria-label="Close"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </Dialog.Close>
              </header>

              {/* Body */}
              <div className="p-8">
                <div className="relative">
                  <input
                    ref={inputRef}
                    data-testid="new-map-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSubmit) handleSubmit();
                    }}
                    placeholder="My Testing Map"
                    disabled={isSubmitting}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-5 text-base text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium disabled:opacity-50"
                    maxLength={MAX_MAP_NAME_LENGTH}
                    autoComplete="off"
                  />
                  {name.trim() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <Sparkles className="w-4 h-4 text-foreground/20" />
                    </motion.div>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground/40 text-center">
                  A root node will be created with this name
                </p>
              </div>

              {/* Footer */}
              <footer className="px-8 pb-8 flex gap-3">
                <Dialog.Close asChild>
                  <button
                    className="flex-1 px-6 py-3.5 bg-white/5 text-foreground/70 border border-white/5 rounded-2xl font-bold text-[13px] uppercase tracking-wider hover:bg-white/10 hover:text-foreground transition-all disabled:opacity-30"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  data-testid="create-map-submit"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-2xl font-bold text-[13px] uppercase tracking-wider hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Map className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Creating..." : "Create Map"}
                </button>
              </footer>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
