"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BetaBadge } from "./BetaBadge";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center rounded-xl bg-black shrink-0", className)} style={{ width: size, height: size }}>
      <Image
        src="/logo.png"
        alt="Testing Maps Logo"
        width={size}
        height={size}
        className={cn("object-contain", className)}
        priority
      />
      <div className="absolute -top-1 -right-1 translate-x-1/2 -translate-y-1/2 z-20">
        <BetaBadge />
      </div>
    </div>
  );
}
