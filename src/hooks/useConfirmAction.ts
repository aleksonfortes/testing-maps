import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIRM_DELETE_TIMEOUT_MS } from "@/lib/constants";

/**
 * Reusable hook for two-step confirm actions (e.g. "Delete" → "Click to confirm").
 * Handles timer cleanup on unmount and auto-reset after timeout.
 */
export function useConfirmAction(onConfirm: () => void) {
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const trigger = useCallback(() => {
    if (isPending) {
      clearTimer();
      setIsPending(false);
      onConfirm();
    } else {
      setIsPending(true);
      clearTimer();
      timerRef.current = setTimeout(() => setIsPending(false), CONFIRM_DELETE_TIMEOUT_MS);
    }
  }, [isPending, onConfirm, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsPending(false);
  }, [clearTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { isPending, trigger, reset };
}
