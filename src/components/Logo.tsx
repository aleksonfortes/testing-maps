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
    <div className={cn("relative flex items-center justify-center overflow-hidden rounded-xl bg-black", className)} style={{ width: size, height: size }}>
      <Image
        src="/favicon.ico"
        alt="Testing Maps Logo"
        width={size}
        height={size}
        className={cn("object-contain", className)}
      />
      <BetaBadge className="absolute -top-1 -right-8" />
    </div>
  );
}
