import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Page-width container: max 1200px with responsive gutters. */
export function Container({
  className,
  children,
  as: As = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: ElementType;
}) {
  return (
    <As className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}>
      {children}
    </As>
  );
}

/** Vertical rhythm wrapper for a page section. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl leading-tight sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
