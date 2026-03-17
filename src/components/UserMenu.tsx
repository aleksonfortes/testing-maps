"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/context/UIContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserMenuProps {
  user: SupabaseUser;
  onSignOut: () => void;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const { openDropdown, setOpenDropdown } = useUI();
  const isOpen = openDropdown === "user";

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

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
          aria-label="User menu"
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
                    Account
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.email}
                  </p>
                </DropdownMenu.Label>

                <div className="p-2">
                  <DropdownMenu.Item
                    onSelect={onSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400/80 hover:bg-red-400/10 rounded-xl transition-all group/logout cursor-pointer outline-none data-[highlighted]:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4 text-red-400/60 group-hover/logout:text-red-400 transition-colors" />
                    Sign Out
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
