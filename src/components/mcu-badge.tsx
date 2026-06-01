"use client";

import { Badge } from "@/components/ui/badge";

interface MCUBadgeProps {
  name: string;
}

export function MCUBadge({ name }: MCUBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="px-4 py-1.5 text-xs font-medium border-[#1E1E2E] bg-[#12121A] text-[#00D4FF] hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/5 transition-all duration-200 cursor-default whitespace-nowrap select-none"
      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
    >
      <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#00D4FF] opacity-60" />
      {name}
    </Badge>
  );
}
