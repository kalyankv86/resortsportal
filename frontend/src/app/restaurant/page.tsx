"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Order {
  id: number;
  guest: string;
  meal: string;
  time?: string;
  items: string[];
  status: string;
}
interface Chart {
  guest: string;
  title: string;
  meals: { meal: string; items: string[] }[];
  avoid?: string[];
}

const NEXT: Record<string, string> = { planned: "preparing", preparing: "served" };

export default function RestaurantPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    date: string;
    in_house: number;
    diet_charts: Chart[];
    orders: Order[];
    summary: { planned: number; served: number };
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setData((await api<{ data: typeof data }>("/staff/restaurant/board", { token })).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function advance(o: Order) {
    const status = NEXT[o.status];
    if (!status) return;
    setBusy(o.id);
    try {
      await api(`/staff/restaurant/orders/${o.id}`, { method: "PATCH", token: token ?? undefined, body: { status } });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  const meals = [...new Set((data?.orders ?? []).map((o) => o.meal))];

  return (
    <PortalShell title="Wellness kitchen" requireStaff>
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Guests in-house" value={data?.in_house ?? "—"} />
        <StatCard label="Meals to prepare" value={data?.summary.planned ?? "—"} />
        <StatCard label="Served today" value={data?.summary.served ?? "—"} />
      </div>

      <h2 className="mt-8 text-2xl">Today&rsquo;s service · {data?.date}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <div key={meal} className="rounded-card border border-border bg-surface p-4">
            <h3 className="font-heading text-lg capitalize text-forest-800">{meal}</h3>
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {data!.orders.filter((o) => o.meal === meal).map((o) => (
                <li key={o.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-ui text-sm font-semibold text-forest-800">{o.guest}{o.time ? ` · ${o.time}` : ""}</p>
                    <span className={cn(
                      "rounded-pill px-2 py-0.5 font-ui text-[0.6rem] font-semibold uppercase",
                      o.status === "served" ? "bg-sage-100 text-forest-700" : o.status === "preparing" ? "bg-sand text-forest-800" : "bg-surface-muted text-muted-foreground",
                    )}>{o.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.items.join(" · ")}</p>
                  {NEXT[o.status] && (
                    <Button size="sm" variant="secondary" className="mt-2" onClick={() => advance(o)} disabled={busy === o.id}>
                      Mark {NEXT[o.status]}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {meals.length === 0 && <p className="text-sm text-muted-foreground">No meal orders — no in-house guests with an active diet chart.</p>}
      </div>

      {(data?.diet_charts ?? []).length > 0 && (
        <>
          <h2 className="mt-10 text-2xl">Active diet charts</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {data!.diet_charts.map((c, i) => (
              <div key={i} className="rounded-card border border-border bg-surface p-4">
                <p className="font-ui text-sm font-semibold text-forest-800">{c.guest} — {c.title}</p>
                {c.avoid && c.avoid.length > 0 && (
                  <p className="mt-1 text-xs"><span className="font-semibold text-terracotta-600">Avoid:</span> <span className="text-muted-foreground">{c.avoid.join(", ")}</span></p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </PortalShell>
  );
}
