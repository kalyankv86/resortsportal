"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

interface UserRow {
  id: number;
  name: string;
  email: string;
  status: string;
  is_staff: boolean;
  roles: string[];
  last_login_at: string | null;
}

const field = "rounded-xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage";

export function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState({ name: "", email: "", role: "reception" });

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [u, r] = await Promise.all([
        api<{ data: UserRow[] }>("/admin/users", { token }),
        api<{ data: string[] }>("/admin/users/roles", { token }),
      ]);
      setUsers(u.data);
      setRoles(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load users.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function create() {
    setError("");
    setNotice("");
    try {
      const res = await api<{ temp_password: string }>("/admin/users", {
        method: "POST",
        token: token ?? undefined,
        body: { name: creating.name, email: creating.email, roles: [creating.role] },
      });
      setNotice(`Created ${creating.email} — temporary password: ${res.temp_password}`);
      setCreating({ name: "", email: "", role: "reception" });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Create failed.");
    }
  }

  async function setRole(u: UserRow, role: string) {
    await api(`/admin/users/${u.id}`, { method: "PATCH", token: token ?? undefined, body: { roles: [role] } });
    await load();
  }

  async function toggleStatus(u: UserRow) {
    await api(`/admin/users/${u.id}`, {
      method: "PATCH",
      token: token ?? undefined,
      body: { status: u.status === "active" ? "suspended" : "active" },
    });
    await load();
  }

  async function resetPw(u: UserRow) {
    const res = await api<{ temp_password: string }>(`/admin/users/${u.id}/reset-password`, { method: "POST", token: token ?? undefined });
    setNotice(`New temporary password for ${u.email}: ${res.temp_password}`);
  }

  return (
    <section className="mt-4">
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      {notice && <p className="rounded-2xl bg-sage-100/70 px-4 py-2 font-ui text-sm text-forest-700">{notice}</p>}

      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-4">
        <input className={field} placeholder="Name" value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} />
        <input className={field} type="email" placeholder="Email" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} />
        <select className={field} value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value })}>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
        <Button size="sm" onClick={create} disabled={!creating.name || !creating.email}>Add user</Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-forest-800">{u.name}<span className="block text-xs text-muted-foreground">{u.email}</span></td>
                <td className="px-4 py-3">
                  <select className={field} value={u.roles[0] ?? ""} onChange={(e) => setRole(u, e.target.value)}>
                    {roles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 capitalize">{u.status}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => toggleStatus(u)}>{u.status === "active" ? "Suspend" : "Activate"}</Button>
                    <Button size="sm" variant="secondary" onClick={() => resetPw(u)}>Reset pw</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
