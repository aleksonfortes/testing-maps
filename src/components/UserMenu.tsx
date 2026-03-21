"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Sun, Moon, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/context/UIContext";
import { useTheme } from "next-themes";

export function UserMenu() {
  const { openDropdown, setOpenDropdown } = useUI();
  const { theme, setTheme } = useTheme();
  const isOpen = openDropdown === "user";

  const initials = "LW";

  return (
    <DropdownMenu.Root
      open={isOpen}
      onOpenChange={(open) => setOpenDropdown(open ? "user" : null)}
    >
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 transition-all outline-none group",
            isOpen && "bg-white/10"
          )}
          aria-label="App settings"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-black shadow-sm group-hover:bg-white/90 transition-all border border-black/5">
            {initials}
          </div>
          <ChevronDown
            className={cn(
              "w-3 h-3 text-muted-foreground/30 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </DropdownMenu.Trigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content
              forceMount
              asChild
              align="end"
              sideOffset={12}
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-64 glass z-[100] overflow-hidden rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
              >
                <DropdownMenu.Label className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">
                    Environment
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    Local Workspace
                  </p>
                </DropdownMenu.Label>

                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between px-3 py-2 text-[13px] font-medium text-muted-foreground/80">
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Appearance
                    </div>
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                          theme === "dark" ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-white/5 my-1" />

                  <DropdownMenu.Item
                    disabled
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-muted-foreground/40 rounded-xl transition-all cursor-default outline-none"
                  >
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                  </DropdownMenu.Item>
                </div>
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}
