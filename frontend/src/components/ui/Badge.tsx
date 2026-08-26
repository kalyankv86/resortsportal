import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "sage",
  className,
}: {
  children: ReactNode;
  tone?: "sage" | "forest" | "terracotta" | "sand";
  className?: string;
}) {
  const tones = {
    sage: "bg-sage-100 text-forest-700",
    forest: "bg-forest-700 text-ivory",
    terracotta: "bg-terracotta/15 text-terracotta-600",
    sand: "bg-sand text-forest-800",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 font-ui text-[0.7rem] font-semibold uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
