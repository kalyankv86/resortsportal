"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const PACKAGES = [
  "Panchakarma Detox",
  "Stress Relief",
  "Weight Management",
  "Digital Detox",
  "Immunity Boost",
  "Couple Retreat",
] as const;

function isoPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function BookingWidget({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "sticky";
  className?: string;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(isoPlusDays(7));
  const [checkOut, setCheckOut] = useState(isoPlusDays(12));
  const [guests, setGuests] = useState(2);
  const [pkg, setPkg] = useState<string>(PACKAGES[0]);

  const nights = useMemo(() => {
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(0, Math.round((b - a) / 86_400_000));
  }, [checkIn, checkOut]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      package: pkg,
    });
    router.push(`/book-now?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "glass rounded-card",
        variant === "hero" ? "p-4 sm:p-5" : "p-3",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
        <Field label="Check in">
          <input
            type="date"
            value={checkIn}
            min={isoPlusDays(0)}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent font-ui text-sm text-forest-800 outline-none"
          />
        </Field>
        <Field label={`Check out · ${nights} night${nights === 1 ? "" : "s"}`}>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent font-ui text-sm text-forest-800 outline-none"
          />
        </Field>
        <Field label="Guests">
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-transparent font-ui text-sm text-forest-800 outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Programme">
          <select
            value={pkg}
            onChange={(e) => setPkg(e.target.value)}
            className="w-full bg-transparent font-ui text-sm text-forest-800 outline-none"
          >
            {PACKAGES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="h-full min-h-12 rounded-2xl bg-forest-700 px-6 font-ui text-sm font-semibold tracking-wide text-ivory transition-all duration-300 ease-luxury hover:bg-forest-800 hover:shadow-lift"
        >
          Check Availability
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-surface/50 px-4 py-2.5">
      <span className="font-ui text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
