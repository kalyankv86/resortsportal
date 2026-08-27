"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Appt {
  id: number;
  guest: { id: number; name: string };
  therapy: string;
  booking?: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
  has_note: boolean;
}

const field = "w-full rounded-2xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage";

export default function TherapistPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ date: string; appointments: Appt[]; summary: { total: number; completed: number } } | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [form, setForm] = useState({ observations: "", tolerance: "4", consumables: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await api<{ data: typeof data }>("/staff/therapist/dashboard", { token });
      setData(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function complete(id: number) {
    setBusy(true);
    setError("");
    try {
      const consumables = form.consumables
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((c) => {
          const [item, qty, unit] = c.split(/\s+/);
          return { item, qty: qty ? Number(qty) : undefined, unit };
        });
      await api(`/staff/therapist/appointments/${id}/complete`, {
        method: "POST",
        token: token ?? undefined,
        body: { observations: form.observations || undefined, tolerance: Number(form.tolerance), consumables },
      });
      setOpenId(null);
      setForm({ observations: "", tolerance: "4", consumables: "" });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell title="Therapist" requireStaff>
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's therapies" value={data?.summary.total ?? "—"} />
        <StatCard label="Completed" value={data?.summary.completed ?? "—"} />
        <StatCard label="Date" value={data?.date ?? "—"} />
      </div>

      <div className="mt-8 overflow-hidden rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Therapy</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data?.appointments ?? []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">No therapies scheduled today.</td></tr>
            ) : (
              data!.appointments.map((a) => (
                <Fragment key={a.id}>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-3">{new Date(a.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 font-medium text-forest-800">{a.guest.name}<span className="block text-xs text-muted-foreground">{a.booking}</span></td>
                    <td className="px-4 py-3">{a.therapy} · {a.duration_min}m</td>
                    <td className="px-4 py-3 capitalize">{a.status}{a.has_note ? " · noted" : ""}</td>
                    <td className="px-4 py-3 text-right">
                      {a.status !== "completed" ? (
                        <Button size="sm" onClick={() => setOpenId(openId === a.id ? null : a.id)}>
                          {openId === a.id ? "Close" : "Complete"}
                        </Button>
                      ) : (
                        <span className="font-ui text-xs text-muted-foreground">done</span>
                      )}
                    </td>
                  </tr>
                  {openId === a.id && (
                    <tr>
                      <td colSpan={5} className="bg-surface-muted px-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <textarea className={cn(field, "sm:col-span-2")} rows={2} placeholder="Observations (guest tolerance, skin response, notes)" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
                          <label className="font-ui text-xs text-muted-foreground">Tolerance (1–5)
                            <select className={field} value={form.tolerance} onChange={(e) => setForm({ ...form, tolerance: e.target.value })}>
                              {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                            </select>
                          </label>
                          <label className="font-ui text-xs text-muted-foreground">Consumables (e.g. &quot;Dhanwantharam 200 ml, Cotton 4 pcs&quot;)
                            <input className={field} placeholder="item qty unit, ..." value={form.consumables} onChange={(e) => setForm({ ...form, consumables: e.target.value })} />
                          </label>
                          <div className="sm:col-span-2">
                            <Button size="sm" onClick={() => complete(a.id)} disabled={busy}>{busy ? "Saving…" : "Save & complete"}</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
