"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BetaBadge } from "@/components/BetaBadge";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 w-full px-6 py-4 flex justify-between items-center glass z-50 border-b border-border/50">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight relative">
        <Logo size={24} className="rounded-lg" />
        <span>Testing Maps</span>
        <BetaBadge className="absolute -top-1 -right-10" />
      </Link>
      <div className="flex items-center gap-5">
        <Link
          href="/guide"
          className={`text-sm font-semibold transition-colors ${
            pathname === "/guide" ? "text-primary" : "hover:text-primary"
          }`}
        >
          Guide
        </Link>
        <Link
          href="/workspace"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
        >
          Open Workspace <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}
