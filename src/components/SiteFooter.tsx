"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ContributorsModal } from "@/components/modals/ContributorsModal";

export function SiteFooter() {
  const [showContributors, setShowContributors] = useState(false);

  return (
    <>
      <footer className="w-full py-6 flex justify-center items-center border-t border-border/50">
        <button
          onClick={() => setShowContributors(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Contributors
        </button>
      </footer>

      <AnimatePresence>
        {showContributors && (
          <ContributorsModal onClose={() => setShowContributors(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
