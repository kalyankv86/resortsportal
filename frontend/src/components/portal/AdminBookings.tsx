"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Row {
  id: number;
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  nights: number;
  total: string;
  currency: string;
  booking_type: string;
  guest?: { first_name: string; last_name: string; email: string } | null;
  program?: { name: string } | null;
  room_category?: { name: string } | null;
}

const FILTERS = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;

const NEXT: Record<string, { label: string; to: string }[]> = {
  pending: [
    { label: "Confirm", to: "confirmed" },
    { label: "Cancel", to: "cancelled" },
  ],
  confirmed: [
    { label: "Check in", to: "checked_in" },
    { label: "Cancel", to: "cancelled" },
  ],
  checked_in: [{ label: "Check out", to: "checked_out" }],
};

export function AdminBookings() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const qs = filter === "all" ? "" : `?status=${filter}`;
      const res = await api<{ data: Row[] }>(`/admin/bookings${qs}`, { token });
      setRows(res.data);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount / filter change
    void load();
  }, [load]);

  async function move(row: Row, to: string) {
    if (to === "cancelled" && !confirm(`Cancel ${row.reference}?`)) return;
    setBusyId(row.id);
    try {
      await api(`/admin/bookings/${row.id}/status`, {
        method: "PATCH",
        token: token ?? undefined,
        body: { status: to },
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Bookings</h2>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-pill px-3 py-1.5 font-ui text-xs font-semibold capitalize transition-colors",
                filter === f ? "bg-forest-700 text-ivory" : "bg-surface text-muted-foreground hover:bg-sage-100",
              )}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-terracotta-600">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Stay</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-muted-foreground">No bookings.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-forest-800">
                    <Link href={`/booking/${r.reference}`} className="underline decoration-sage underline-offset-2">
                      {r.reference}
                    </Link>
                    {r.booking_type !== "individual" && (
                      <span className="ml-2 rounded bg-sand px-1.5 py-0.5 text-[0.6rem] uppercase text-forest-800">
                        {r.booking_type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.guest ? `${r.guest.first_name} ${r.guest.last_name}` : "—"}
                    <span className="block text-xs text-muted-foreground">{r.guest?.email}</span>
                  </td>
                  <td className="px-4 py-3">{r.program?.name ?? r.room_category?.name ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.check_in} → {r.check_out}
                    <span className="block text-xs text-muted-foreground">{r.nights} nights</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {r.currency} {Number(r.total).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {(NEXT[r.status] ?? []).map((a) => (
                        <Button
                          key={a.to}
                          size="sm"
                          variant={a.to === "cancelled" ? "secondary" : "primary"}
                          onClick={() => move(r, a.to)}
                          disabled={busyId === r.id}
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
