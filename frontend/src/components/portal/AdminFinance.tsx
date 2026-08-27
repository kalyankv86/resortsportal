"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/portal/PortalShell";

interface Summary {
  currency: string;
  collected: number;
  refunded: number;
  net: number;
  outstanding: number;
  pending_refunds: number;
  by_category: Record<string, number>;
}
interface Pay {
  id: number;
  reference: string;
  type: string;
  method: string | null;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  booking?: { reference: string } | null;
}
interface Refund {
  id: number;
  reference: string;
  amount: string;
  currency: string;
  reason: string | null;
  status: string;
  booking?: { reference: string } | null;
  requester?: { name: string } | null;
}

const inr = (n: number | string) => "₹" + Math.round(Number(n)).toLocaleString("en-IN");

export function AdminFinance() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [payments, setPayments] = useState<Pay[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [s, p, r] = await Promise.all([
        api<{ data: Summary }>("/admin/finance/summary", { token }),
        api<{ data: Pay[] }>("/admin/payments", { token }),
        api<{ data: Refund[] }>("/admin/refunds", { token }),
      ]);
      setSummary(s.data);
      setPayments(p.data.slice(0, 8));
      setRefunds(r.data);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load finance data.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load();
  }, [load]);

  async function review(id: number, approve: boolean) {
    setBusyId(id);
    try {
      await api(`/admin/refunds/${id}/review`, {
        method: "POST",
        token: token ?? undefined,
        body: { approve },
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (!summary) {
    return <p className="mt-12 font-ui text-sm text-muted-foreground">Loading finance…</p>;
  }

  const pendingRefunds = refunds.filter((r) => r.status === "requested");

  return (
    <section className="mt-12">
      <h2 className="text-2xl">Finance</h2>
      {error && <p className="mt-2 text-sm text-terracotta-600">{error}</p>}

      <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={`Collected (${summary.currency}, MTD)`} value={inr(summary.collected)} />
        <StatCard label="Refunded (MTD)" value={inr(summary.refunded)} />
        <StatCard label="Net (MTD)" value={inr(summary.net)} />
        <StatCard label="Outstanding" value={inr(summary.outstanding)} />
        <StatCard label="Refunds to review" value={summary.pending_refunds} />
      </div>

      {Object.keys(summary.by_category).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(summary.by_category).map(([k, v]) => (
            <span key={k} className="rounded-pill bg-surface px-3 py-1.5 font-ui text-xs">
              <span className="capitalize text-muted-foreground">{k}</span>{" "}
              <span className="font-semibold text-forest-700">{inr(v)}</span>
            </span>
          ))}
        </div>
      )}

      {pendingRefunds.length > 0 && (
        <div className="mt-8">
          <h3 className="font-heading text-lg text-forest-800">Refund approval queue</h3>
          <div className="mt-3 overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingRefunds.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-forest-800">{r.reference}</td>
                    <td className="px-4 py-3">{r.booking?.reference ?? "—"}</td>
                    <td className="px-4 py-3">{r.reason ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{inr(r.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => review(r.id, true)} disabled={busyId === r.id}>Approve</Button>
                        <Button size="sm" variant="secondary" onClick={() => review(r.id, false)} disabled={busyId === r.id}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-heading text-lg text-forest-800">Recent payments</h3>
        <div className="mt-3 overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Type / method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">No payments yet.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-forest-800">{p.reference}</td>
                    <td className="px-4 py-3">{p.booking?.reference ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{p.type}{p.method ? ` · ${p.method}` : ""}</td>
                    <td className="px-4 py-3 capitalize">{p.status}</td>
                    <td className={"px-4 py-3 text-right " + (p.type === "refund" ? "text-terracotta-600" : "")}>
                      {p.type === "refund" ? "− " : ""}{inr(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
