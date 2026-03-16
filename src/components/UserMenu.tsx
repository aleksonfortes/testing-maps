"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserMenuProps {
  user: SupabaseUser;
  onSignOut: () => void;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 transition-all outline-none group",
          isOpen && "bg-white/10"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-black shadow-sm group-hover:bg-white/90 transition-all border border-black/5">
          {initials}
        </div>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground/30 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 glass z-[100] overflow-hidden rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
          >
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Account</p>
              <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
            </div>
            
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-foreground/70 hover:bg-white/5 rounded-xl transition-all group/item">
                <Settings className="w-4 h-4 text-muted-foreground/40 group-hover/item:text-primary transition-colors" />
                Account Settings
              </button>
              
              <div className="h-px bg-white/5 my-1 mx-2" />
              
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400/80 hover:bg-red-400/10 rounded-xl transition-all group/logout"
              >
                <LogOut className="w-4 h-4 text-red-400/60 group-hover/logout:text-red-400 transition-colors" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
