"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";
import { AdminBookings } from "@/components/portal/AdminBookings";
import { AdminFinance } from "@/components/portal/AdminFinance";
import { AdminContent } from "@/components/portal/AdminContent";
import { AdminUsers } from "@/components/portal/AdminUsers";
import { AdminSettings, AdminAudit } from "@/components/portal/AdminSettingsAudit";
import { cn } from "@/lib/cn";

interface Overview {
  counts: Record<string, number>;
  revenue: { paid_total: number; currency: string };
  recent_enquiries: {
    id: number;
    name: string;
    topic: string | null;
    status: string;
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

const TABS = ["Overview", "Bookings", "Finance", "Content", "Users", "Settings", "Audit"] as const;

export default function AdminPage() {
  const { token, hasRole } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const admin = hasRole("super-admin", "director");

  useEffect(() => {
    if (!token) return;
    api<{ data: Overview }>("/admin/overview", { token })
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.message ?? "Failed to load"));
  }, [token]);

  const visibleTabs = TABS.filter((t) => admin || !["Users", "Settings", "Audit"].includes(t));

  return (
    <PortalShell title="Master dashboard" requireStaff>
      {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}

      <div className="mb-6 flex flex-wrap gap-1.5">
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-pill px-4 py-2 font-ui text-sm font-semibold transition-colors",
              tab === t ? "bg-forest-700 text-ivory" : "bg-surface text-muted-foreground hover:bg-sage-100",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label={`Revenue (paid, ${data.revenue.currency})`} value={data.revenue.paid_total.toLocaleString("en-IN")} />
              {Object.entries(data.counts).map(([k, v]) => (
                <StatCard key={k} label={LABELS[k] ?? k} value={v} />
              ))}
            </div>
            <section className="mt-10">
              <h2 className="text-2xl">Recent enquiries</h2>
              <div className="mt-3 overflow-x-auto rounded-card border border-border bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Topic</th><th className="px-4 py-3">Status</th></tr>
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
          </>
        ) : (
          <p className="font-ui text-sm text-muted-foreground">Loading dashboard…</p>
        )
      )}

      {tab === "Bookings" && <AdminBookings />}
      {tab === "Finance" && <AdminFinance />}
      {tab === "Content" && <AdminContent />}
      {tab === "Users" && admin && <AdminUsers />}
      {tab === "Settings" && admin && <AdminSettings />}
      {tab === "Audit" && admin && <AdminAudit />}
    </PortalShell>
  );
}
