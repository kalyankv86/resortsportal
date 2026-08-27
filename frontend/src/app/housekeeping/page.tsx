"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Room {
  id: number;
  code: string;
  category?: string;
  status: string;
  housekeeping_status: string;
}
interface Task {
  id: number;
  room?: string;
  type: string;
  priority: string;
  status: string;
  note?: string;
  checklist?: { label: string; done: boolean }[];
  due_at?: string;
}

const HK_TONE: Record<string, string> = {
  clean: "bg-sage-100 text-forest-700",
  dirty: "bg-terracotta/15 text-terracotta-600",
  in_progress: "bg-sand text-forest-800",
  inspected: "bg-forest-700 text-ivory",
};

export default function HousekeepingPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{ rooms: Room[]; tasks: Task[]; summary: Record<string, number> } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setData((await api<{ data: typeof data }>("/staff/housekeeping/board", { token })).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function moveTask(id: number, status: string) {
    setBusy(id);
    try {
      await api(`/staff/housekeeping/tasks/${id}`, { method: "PATCH", token: token ?? undefined, body: { status } });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleCheck(task: Task, idx: number) {
    const checklist = (task.checklist ?? []).map((c, i) => (i === idx ? { ...c, done: !c.done } : c));
    setBusy(task.id);
    try {
      await api(`/staff/housekeeping/tasks/${task.id}`, { method: "PATCH", token: token ?? undefined, body: { checklist } });
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function setRoom(id: number, hk: string) {
    setBusy(-id);
    try {
      await api(`/staff/housekeeping/rooms/${id}/status`, { method: "PATCH", token: token ?? undefined, body: { housekeeping_status: hk } });
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <PortalShell title="Housekeeping" requireStaff>
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Rooms to clean" value={data?.summary.dirty ?? "—"} />
        <StatCard label="In progress" value={data?.summary.in_progress ?? "—"} />
        <StatCard label="Open tasks" value={data?.summary.open_tasks ?? "—"} />
      </div>

      <h2 className="mt-8 text-2xl">Room status</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
        {(data?.rooms ?? []).map((r) => (
          <div key={r.id} className={cn("rounded-2xl border border-border p-2 text-center", HK_TONE[r.housekeeping_status])}>
            <p className="font-ui text-xs font-bold">{r.code}</p>
            <p className="text-[0.6rem] capitalize">{r.housekeeping_status.replace("_", " ")}</p>
            <select
              className="mt-1 w-full rounded bg-white/50 text-[0.6rem] text-forest-800"
              value={r.housekeeping_status}
              onChange={(e) => setRoom(r.id, e.target.value)}
              disabled={busy === -r.id}
            >
              {["clean", "dirty", "in_progress", "inspected"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl">Tasks</h2>
      <div className="mt-3 flex flex-col gap-3">
        {(data?.tasks ?? []).map((t) => (
          <div key={t.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-ui text-sm font-semibold text-forest-800 capitalize">
                  {t.type}{t.room ? ` · Room ${t.room}` : ""}
                  {t.priority === "high" && <span className="ml-2 rounded bg-terracotta/15 px-1.5 py-0.5 text-[0.6rem] uppercase text-terracotta-600">high</span>}
                </p>
                {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
              </div>
              <div className="flex gap-1.5">
                {t.status !== "in_progress" && <Button size="sm" variant="secondary" onClick={() => moveTask(t.id, "in_progress")} disabled={busy === t.id}>Start</Button>}
                <Button size="sm" onClick={() => moveTask(t.id, "done")} disabled={busy === t.id}>Done</Button>
              </div>
            </div>
            {t.checklist && t.checklist.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {t.checklist.map((c, i) => (
                  <label key={i} className="flex items-center gap-1.5 font-ui text-xs text-forest-800">
                    <input type="checkbox" checked={c.done} onChange={() => toggleCheck(t, i)} />
                    <span className={c.done ? "line-through opacity-60" : ""}>{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        {(data?.tasks ?? []).length === 0 && <p className="text-sm text-muted-foreground">No open tasks.</p>}
      </div>
    </PortalShell>
  );
}
