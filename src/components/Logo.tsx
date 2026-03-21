"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

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
    </div>
  );
}
