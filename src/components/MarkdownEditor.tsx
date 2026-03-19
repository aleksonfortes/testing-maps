"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Code2 } from "lucide-react";

interface MarkdownEditorProps {
  initialMarkdown: string;
  onApply: (markdown: string) => void;
  onCancel: () => void;
}

export function MarkdownEditor({
  initialMarkdown,
  onApply,
  onCancel,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialMarkdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDirty = value !== initialMarkdown;

  // Auto-focus the textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleBack = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Discard and return to canvas?"
      );
      if (!confirmed) return;
    }
    onCancel();
  }, [isDirty, onCancel]);

  const handleApply = useCallback(() => {
    onApply(value);
  }, [onApply, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab inserts 2 spaces instead of moving focus
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        setValue(newValue);
        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        });
      }
    },
    [value]
  );

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 glass border-b border-white/10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Canvas
        </button>

        <div className="flex items-center gap-2 text-foreground/50">
          <Code2 className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-tight">
            Markdown View
          </span>
        </div>

        <button
          onClick={handleApply}
          disabled={!isDirty}
          className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-xl text-sm font-bold tracking-wide hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Apply Changes
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full h-full bg-black/40 font-mono text-[13px] leading-relaxed text-foreground/80 border border-white/5 rounded-2xl p-6 resize-none outline-none focus:ring-2 ring-white/10 selection:bg-white selection:text-black"
          placeholder="Write your testing map in markdown..."
        />
      </div>
    </div>
  );
}
