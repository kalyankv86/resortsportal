"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";

interface Booking {
  id: number;
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  nights: number;
  total: string;
  currency: string;
  program?: { name: string } | null;
  room_category?: { name: string } | null;
}

export default function GuestPortalPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (!token) return;
    api<{ data: Booking[] }>("/me/bookings", { token })
      .then((r) => setBookings(r.data))
      .catch(() => setBookings([]));
  }, [token]);

  const upcoming = (bookings ?? []).filter(
    (b) => new Date(b.check_in) >= new Date(new Date().toDateString()),
  );

  return (
    <PortalShell title="Your stay">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming stays" value={bookings ? upcoming.length : "—"} />
        <StatCard label="Total bookings" value={bookings ? bookings.length : "—"} />
        <StatCard label="Loyalty tier" value="Green" />
      </div>

      <h2 className="mt-10 text-2xl">Bookings</h2>
      {bookings === null ? (
        <p className="mt-3 font-ui text-sm text-muted-foreground">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="mt-3 font-ui text-sm text-muted-foreground">
          No bookings yet.{" "}
          <Link href="/book-now" className="text-forest-700 underline">Plan a stay →</Link>
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-forest-800">
                    <Link href={`/booking/${b.reference}`} className="underline decoration-sage underline-offset-2">
                      {b.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{b.program?.name ?? b.room_category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {b.check_in} → {b.check_out} · {b.nights}n
                  </td>
                  <td className="px-4 py-3 capitalize">{b.status}</td>
                  <td className="px-4 py-3 text-right">
                    {b.currency} {Number(b.total).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 font-ui text-xs text-muted-foreground">
        Therapy schedule, diet chart, invoices, medical reports and progress
        tracking arrive with the guest-portal build (Milestone 8).
      </p>
    </PortalShell>
  );
}
