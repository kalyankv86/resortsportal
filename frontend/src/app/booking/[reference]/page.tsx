"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Container } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Booking {
  id: number;
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  programme?: { name: string } | null;
  room_category?: { name: string } | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  amount_paid: number;
  balance_due: number;
  contact_email: string;
  guests: { name: string; is_primary: boolean; age?: number | null }[];
  status_history?: { from_status: string | null; to_status: string; note: string | null; created_at: string }[];
  pass?: { url: string; qr_svg: string };
}

const STATUS_TONE: Record<string, string> = {
  pending: "bg-sand text-forest-800",
  confirmed: "bg-sage-100 text-forest-700",
  checked_in: "bg-forest-700 text-ivory",
  checked_out: "bg-border text-muted-foreground",
  cancelled: "bg-terracotta/15 text-terracotta-600",
};

export default function BookingLookupPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const search = useSearchParams();
  const { token, user } = useAuth();
  const t = search.get("t") ?? "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [email, setEmail] = useState("");
  const [needEmail, setNeedEmail] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (withEmail?: string) => {
      setError("");
      setBusy(true);
      try {
        const query = new URLSearchParams();
        if (t) query.set("t", t);
        if (withEmail) query.set("email", withEmail);
        const res = await api<{ data: Booking }>(
          `/bookings/${encodeURIComponent(reference)}${query.toString() ? `?${query}` : ""}`,
          { token: token ?? undefined },
        );
        setBooking(res.data);
        setNeedEmail(false);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setNeedEmail(true);
          if (withEmail) setError("That email doesn't match this booking.");
        } else {
          setError(err instanceof ApiError ? err.message : "Booking not found.");
        }
      } finally {
        setBusy(false);
      }
    },
    [reference, t, token],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolve booking on mount
    if (t || token) void load();
    else setNeedEmail(true);
  }, [t, token, load]);

  async function cancel() {
    if (!booking || !token) return;
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    try {
      await api(`/bookings/${booking.id}/cancel`, {
        method: "POST",
        token,
        body: { reason: "Cancelled by guest" },
      });
      await load(email || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel.");
    }
  }

  const canManage =
    !!booking && !!token && !!user && ["pending", "confirmed"].includes(booking.status);

  return (
    <div className="pt-28">
      <Container className="py-10">
        <p className="eyebrow text-terracotta">Booking</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">{reference}</h1>

        {needEmail && !booking && (
          <form
            className="mt-8 max-w-md rounded-card border border-border bg-surface p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void load(email);
            }}
          >
            <p className="text-sm text-muted-foreground">
              Enter the email address used for this booking to view its status.
            </p>
            <input
              className="mt-3 w-full rounded-2xl border border-border bg-surface px-4 py-3 font-ui text-sm text-forest-800 outline-none focus:border-sage"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="mt-2 text-sm text-terracotta-600">{error}</p>}
            <Button type="submit" className="mt-4" disabled={busy}>
              {busy ? "Checking…" : "View booking"}
            </Button>
          </form>
        )}

        {error && !needEmail && <p className="mt-6 text-sm text-terracotta-600">{error}</p>}

        {booking && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-card border border-border bg-surface p-6">
              <span
                className={cn(
                  "inline-flex rounded-pill px-3 py-1 font-ui text-xs font-semibold uppercase tracking-wide",
                  STATUS_TONE[booking.status] ?? "bg-border",
                )}
              >
                {booking.status.replace("_", " ")}
              </span>

              <dl className="mt-5 grid gap-3 text-sm">
                <Line label="Stay" value={`${booking.check_in} → ${booking.check_out} · ${booking.nights} nights`} />
                <Line label="Guests" value={`${booking.adults} adult${booking.adults > 1 ? "s" : ""}${booking.children ? `, ${booking.children} children` : ""}`} />
                {booking.programme && <Line label="Programme" value={booking.programme.name} />}
                {booking.room_category && <Line label="Room" value={booking.room_category.name} />}
                <Line label="Party" value={booking.guests.map((g) => g.name).join(", ")} />
              </dl>

              <div className="mt-6 border-t border-border pt-4 text-sm">
                <Line label="Subtotal" value={money(booking.currency, booking.subtotal)} />
                {booking.discount > 0 && <Line label="Discount" value={`− ${money(booking.currency, booking.discount)}`} />}
                <Line label="Tax" value={money(booking.currency, booking.tax)} />
                <Line label="Total" value={money(booking.currency, booking.total)} strong />
                <Line label="Paid" value={money(booking.currency, booking.amount_paid)} />
                <Line label="Balance due" value={money(booking.currency, booking.balance_due)} strong />
              </div>

              {canManage && (
                <div className="mt-6 flex gap-3">
                  <Button variant="secondary" onClick={cancel}>Cancel booking</Button>
                </div>
              )}

              {booking.status_history && booking.status_history.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">History</p>
                  <ul className="mt-2 flex flex-col gap-1.5 text-xs text-muted-foreground">
                    {booking.status_history.map((h, i) => (
                      <li key={i}>
                        {new Date(h.created_at).toLocaleDateString()} · {h.from_status ? `${h.from_status} → ` : ""}
                        {h.to_status}
                        {h.note ? ` — ${h.note}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {booking.pass && (
              <aside className="h-fit rounded-card border border-border bg-surface p-6 text-center">
                <p className="eyebrow text-terracotta">Arrival pass</p>
                <div className="mx-auto mt-4 w-44" dangerouslySetInnerHTML={{ __html: booking.pass.qr_svg }} />
                <p className="mt-3 font-ui text-xs text-muted-foreground">
                  Show this at reception on arrival for fast check-in.
                </p>
              </aside>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-heading text-forest-800" : "text-forest-800"}>{value}</span>
    </div>
  );
}

function money(currency: string, n: number) {
  return `${currency} ${Math.round(n).toLocaleString("en-IN")}`;
}
