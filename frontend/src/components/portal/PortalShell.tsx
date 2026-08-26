"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Container } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

/**
 * Client-side auth gate + chrome for the guest / staff portals.
 * `requireStaff` sends non-staff back to the guest portal.
 */
export function PortalShell({
  title,
  requireStaff = false,
  children,
}: {
  title: string;
  requireStaff?: boolean;
  children: ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/guest-login");
    else if (requireStaff && !user.is_staff) router.replace("/guest");
  }, [ready, user, requireStaff, router]);

  if (!ready || !user || (requireStaff && !user.is_staff)) {
    return (
      <Container className="flex min-h-[60svh] items-center justify-center py-32">
        <p className="font-ui text-sm text-muted-foreground">Loading your portal…</p>
      </Container>
    );
  }

  return (
    <div className="min-h-[80svh] bg-surface-muted pt-28">
      <Container className="py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow text-terracotta">{requireStaff ? "Staff portal" : "Guest portal"}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl">{title}</h1>
            <p className="mt-1 font-ui text-sm text-muted-foreground">
              {user.name} · {user.roles.join(", ") || "guest"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button href="/" variant="secondary" size="sm">Back to site</Button>
            <Button
              size="sm"
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        {children}
      </Container>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="font-heading text-3xl text-forest-700">{value}</p>
      <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function PortalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
      {children}
    </Link>
  );
}
