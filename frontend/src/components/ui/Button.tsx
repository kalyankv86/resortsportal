import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "glass";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-ui font-semibold rounded-pill transition-all duration-300 ease-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-700 text-ivory hover:bg-forest-800 shadow-soft hover:shadow-lift hover:-translate-y-0.5",
  secondary:
    "bg-surface text-forest-700 border border-border hover:border-sage hover:-translate-y-0.5 shadow-soft",
  ghost: "text-forest-700 hover:bg-sage-100/60",
  glass: "glass text-forest-800 hover:-translate-y-0.5 hover:shadow-lift",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs tracking-wide",
  md: "h-11 px-6 text-sm tracking-wide",
  lg: "h-14 px-8 text-[0.95rem] tracking-wide",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = StyleProps &
  Omit<ComponentProps<"button">, "className" | "children">;

type LinkProps = StyleProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps | LinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && typeof rest.href === "string") {
    return (
      <Link className={classes} {...(rest as LinkProps)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
