"use client";

import { useMemo } from "react";

export function useOS() {
  const isMac = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Mac|iPhone|iPad/.test(navigator.userAgent);
  }, []);

  const modKey = isMac ? "⌘" : "Ctrl";
  const modKeyPlus = isMac ? "⌘" : "Ctrl+";

  return { isMac, modKey, modKeyPlus };
}
