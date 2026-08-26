import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Frosted-glass surface with the house 28px radius. */
export function GlassPanel({
  children,
  className,
  tone = "light",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
  as?: ElementType;
}) {
  return (
    <As
      className={cn(
        "rounded-card p-6 sm:p-8",
        tone === "light" ? "glass" : "glass-dark text-ivory",
        className,
      )}
    >
      {children}
    </As>
  );
}
