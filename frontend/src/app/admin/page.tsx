"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";

interface Overview {
  counts: Record<string, number>;
  revenue: { paid_total: number; currency: string };
  recent_bookings: {
    id: number;
    reference: string;
    status: string;
    check_in: string;
    check_out: string;
    total: string;
    guest?: { first_name: string; last_name: string } | null;
  }[];
  recent_enquiries: {
    id: number;
    name: string;
    email: string;
    topic: string | null;
    status: string;
    created_at: string;
  }[];
}

const LABELS: Record<string, string> = {
  users: "Users",
  guests: "Guests",
  bookings: "Bookings",
  bookings_pending: "Pending",
  bookings_confirmed: "Confirmed",
  room_categories: "Room types",
  therapies: "Therapies",
  doctors: "Doctors",
  enquiries_new: "New enquiries",
};

export default function AdminPage() {
  const { token } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<{ data: Overview }>("/admin/overview", { token })
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.message ?? "Failed to load"));
  }, [token]);

  return (
    <PortalShell title="Master dashboard" requireStaff>
      {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label={`Revenue (paid, ${data.revenue.currency})`}
              value={data.revenue.paid_total.toLocaleString("en-IN")}
            />
            {Object.entries(data.counts).map(([k, v]) => (
              <StatCard key={k} label={LABELS[k] ?? k} value={v} />
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="text-2xl">Recent bookings</h2>
              <div className="mt-3 overflow-x-auto rounded-card border border-border bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Ref</th>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_bookings.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-4 text-muted-foreground">No bookings yet.</td></tr>
                    ) : data.recent_bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium text-forest-800">{b.reference}</td>
                        <td className="px-4 py-3">
                          {b.guest ? `${b.guest.first_name} ${b.guest.last_name}` : "—"}
                        </td>
                        <td className="px-4 py-3 capitalize">{b.status}</td>
                        <td className="px-4 py-3 text-right">₹{Number(b.total).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl">Recent enquiries</h2>
              <div className="mt-3 overflow-x-auto rounded-card border border-border bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_enquiries.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-muted-foreground">No enquiries yet.</td></tr>
                    ) : data.recent_enquiries.map((e) => (
                      <tr key={e.id} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium text-forest-800">{e.name}</td>
                        <td className="px-4 py-3">{e.topic ?? "—"}</td>
                        <td className="px-4 py-3 capitalize">{e.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="mt-8 font-ui text-xs text-muted-foreground">
            Full CMS, user management, CRM, inventory, finance and analytics
            modules arrive in Milestones 6–11.
          </p>
        </>
      ) : (
        <p className="font-ui text-sm text-muted-foreground">Loading dashboard…</p>
      )}
    </PortalShell>
  );
}
