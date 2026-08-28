"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { MediaPicker } from "./MediaPicker";

const field =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage";

type FieldType = "text" | "textarea" | "number" | "list" | "toggle";
interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  half?: boolean;
  hint?: string;
}

type Row = Record<string, unknown> & { id: number; name: string; slug: string; status: string; photos?: { id: number; url: string }[] };
type Draft = Record<string, unknown> & { id?: number; gallery: number[] };

const SPECS: Record<string, { base: string; noun: string; fields: FieldSpec[] }> = {
  rooms: {
    base: "rooms",
    noun: "room",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "nightly_rate", label: "Nightly rate (₹)", type: "number", half: true },
      { key: "size_sqft", label: "Size (sq ft)", type: "number", half: true },
      { key: "base_occupancy", label: "Base occupancy", type: "number", half: true },
      { key: "max_occupancy", label: "Max occupancy", type: "number", half: true },
      { key: "summary", label: "Short summary", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "amenities", label: "Amenities", type: "list", hint: "one per line" },
    ],
  },
  services: {
    base: "services",
    noun: "service",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "duration_min", label: "Duration (min)", type: "number", half: true },
      { key: "price", label: "Price (₹)", type: "number", half: true },
      { key: "summary", label: "Short summary", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "benefits", label: "Benefits", type: "list", hint: "one per line" },
    ],
  },
  packages: {
    base: "packages",
    noun: "package",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "nights", label: "Nights", type: "number", half: true },
      { key: "price_from", label: "Price from (₹)", type: "number", half: true },
      { key: "goal", label: "Goal / focus", type: "text" },
      { key: "summary", label: "Short summary", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "inclusions", label: "What's included", type: "list", hint: "one per line" },
      { key: "doctor_led", label: "Doctor-led programme", type: "toggle" },
    ],
  },
};

export function AdminCatalogue() {
  const [sub, setSub] = useState<keyof typeof SPECS>("rooms");
  return (
    <section className="mt-4">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(SPECS) as (keyof typeof SPECS)[]).map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={cn(
              "rounded-pill px-3 py-1.5 font-ui text-xs font-semibold capitalize",
              sub === s ? "bg-forest-700 text-ivory" : "bg-surface text-muted-foreground hover:bg-sage-100",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <CrudPanel key={sub} spec={SPECS[sub]} />
    </section>
  );
}

function emptyDraft(fields: FieldSpec[]): Draft {
  const d: Draft = { gallery: [] };
  for (const f of fields) d[f.key] = f.type === "toggle" ? false : "";
  return d;
}

function toDraft(row: Row, fields: FieldSpec[]): Draft {
  const d: Draft = { id: row.id, gallery: (row.photos ?? []).map((p) => p.id) };
  for (const f of fields) {
    const v = row[f.key];
    d[f.key] =
      f.type === "list" && Array.isArray(v)
        ? (v as string[]).join("\n")
        : f.type === "toggle"
          ? Boolean(v)
          : v ?? "";
  }
  return d;
}

function toBody(draft: Draft, fields: FieldSpec[]) {
  const body: Record<string, unknown> = { gallery: draft.gallery };
  for (const f of fields) {
    const raw = draft[f.key];
    if (f.type === "number") {
      body[f.key] = raw === "" || raw == null ? null : Number(raw);
    } else if (f.type === "list") {
      body[f.key] = String(raw ?? "")
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (f.type === "toggle") {
      body[f.key] = Boolean(raw);
    } else {
      body[f.key] = raw === "" ? null : raw;
    }
  }
  return body;
}

function CrudPanel({ spec }: { spec: (typeof SPECS)[string] }) {
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await api<{ data: Row[] }>(`/admin/catalog/${spec.base}`, { token });
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load.");
    }
  }, [token, spec.base]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function save() {
    if (!draft) return;
    if (!String(draft.name ?? "").trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const id = draft.id;
      await api(`/admin/catalog/${spec.base}${id ? `/${id}` : ""}`, {
        method: "POST",
        token: token ?? undefined,
        body: toBody(draft, spec.fields),
      });
      setDraft(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm(`Delete this ${spec.noun}?`)) return;
    await api(`/admin/catalog/${spec.base}/${id}`, { method: "DELETE", token: token ?? undefined });
    await load();
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}

      {draft ? (
        <div className="rounded-card border border-border bg-surface p-5">
          <p className="mb-3 font-ui text-sm font-semibold text-forest-800">
            {draft.id ? `Edit ${spec.noun}` : `New ${spec.noun}`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {spec.fields.map((f) => (
              <div key={f.key} className={f.half ? "" : "sm:col-span-2"}>
                <label className="mb-1 block font-ui text-xs font-semibold text-muted-foreground">
                  {f.label}
                  {f.hint ? <span className="ml-1 font-normal lowercase opacity-70">({f.hint})</span> : null}
                </label>
                {f.type === "textarea" || f.type === "list" ? (
                  <textarea
                    className={cn(field, "min-h-[80px]")}
                    value={String(draft[f.key] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                ) : f.type === "toggle" ? (
                  <label className="flex items-center gap-2 py-2 font-ui text-sm text-forest-800">
                    <input
                      type="checkbox"
                      checked={Boolean(draft[f.key])}
                      onChange={(e) => setDraft({ ...draft, [f.key]: e.target.checked })}
                    />
                    Yes
                  </label>
                ) : (
                  <input
                    className={field}
                    type={f.type === "number" ? "number" : "text"}
                    value={String(draft[f.key] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <MediaPicker
                token={token}
                value={draft.gallery}
                onChange={(ids) => setDraft({ ...draft, gallery: ids })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={save} disabled={busy}>
              {busy ? "Saving…" : draft.id ? "Save changes" : `Create ${spec.noun}`}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div>
          <Button size="sm" onClick={() => setDraft(emptyDraft(spec.fields))}>
            + Add {spec.noun}
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <div className="flex gap-3">
              {r.photos && r.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photos[0].url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-sage-100 font-ui text-[10px] text-muted-foreground">
                  no photo
                </div>
              )}
              <div>
                <p className="font-ui text-sm font-semibold text-forest-800">
                  {r.name}
                  {r.status !== "published" ? (
                    <span className="ml-2 rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {r.status}
                    </span>
                  ) : null}
                </p>
                <p className="font-ui text-xs text-muted-foreground">/{r.slug}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => setDraft(toDraft(r, spec.fields))}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Delete</Button>
            </div>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="rounded-card border border-dashed border-border p-6 text-center font-ui text-sm text-muted-foreground">
            No {spec.base} yet. Use “Add {spec.noun}”.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
