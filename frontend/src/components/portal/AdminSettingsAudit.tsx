"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

interface SettingRow {
  id: number;
  group: string;
  key: string;
  value: unknown;
  type: string;
  is_public: boolean;
}
interface AuditRow {
  id: number;
  action: string;
  entity: string;
  by: string;
  changes: Record<string, unknown> | null;
  at: string;
}

export function AdminSettings() {
  const { token } = useAuth();
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setRows((await api<{ data: SettingRow[] }>("/admin/settings", { token })).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load settings.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function save() {
    const settings = Object.entries(dirty).map(([key, raw]) => {
      const r = rows.find((x) => x.key === key)!;
      let value: unknown = raw;
      if (r.type === "int") value = parseInt(raw, 10);
      else if (r.type === "float") value = parseFloat(raw);
      return { key, value };
    });
    if (settings.length === 0) return;
    try {
      await api("/admin/settings", { method: "PATCH", token: token ?? undefined, body: { settings } });
      setDirty({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    }
  }

  const groups = [...new Set(rows.map((r) => r.group))];

  return (
    <section className="mt-4">
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      {groups.map((g) => (
        <div key={g} className="mt-4">
          <h3 className="font-heading text-lg capitalize text-forest-800">{g}</h3>
          <div className="mt-2 overflow-hidden rounded-card border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <tbody>
                {rows.filter((r) => r.group === g).map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-ui text-xs text-muted-foreground">{r.key}{r.is_public ? "" : " · private"}</td>
                    <td className="px-4 py-3">
                      <input
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage"
                        defaultValue={typeof r.value === "object" ? JSON.stringify(r.value) : String(r.value ?? "")}
                        onChange={(e) => setDirty({ ...dirty, [r.key]: e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={Object.keys(dirty).length === 0}>Save changes</Button>
        {saved && <span className="font-ui text-sm text-forest-700">✓ Saved</span>}
      </div>
    </section>
  );
}

export function AdminAudit() {
  const { token } = useAuth();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setRows((await api<{ data: AuditRow[] }>("/admin/audit", { token })).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load audit log.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <section className="mt-4">
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">By</th><th className="px-4 py-3">Changes</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">No audit entries.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0 align-top">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-forest-800">{r.action}</td>
                <td className="px-4 py-3">{r.entity}</td>
                <td className="px-4 py-3">{r.by}</td>
                <td className="px-4 py-3 font-mono text-[0.7rem] text-muted-foreground">
                  {r.changes ? Object.keys(r.changes).slice(0, 6).join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
