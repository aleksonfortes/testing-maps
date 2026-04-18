"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";

interface Contributor {
  name: string;
  contribution: string;
}

const contributors: Contributor[] = [
  {
    name: "Alison Luis Lamb",
    contribution: "Reported dropdown options invisible in dark mode",
  },
];

interface ContributorsModalProps {
  onClose: () => void;
}

export function ContributorsModal({ onClose }: ContributorsModalProps) {
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
                    <Heart className="w-6 h-6 text-foreground/70" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-bold tracking-tight">
                      Contributors
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      People who helped make this better
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
                {contributors.map(({ name, contribution }) => (
                  <div
                    key={name}
                    className="flex flex-col gap-0.5 py-2.5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">{contribution}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 pb-8">
                <a
                  href="https://github.com/aleksonfortes/testing-maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Want to contribute? Open an issue or PR on GitHub →
                </a>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
