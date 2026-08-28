"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  eyebrow: string | null;
  status: string;
  hero_category: string | null;
  sections_count: number;
  updated_at: string;
}
interface Testimonial { id: number; name: string; origin: string | null; quote: string; rating: number; status: string }
interface Faq { id: number; group: string; question: string; answer: string; status: string }
interface EventRow {
  id: number;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  status: string;
  media: { id: number; url: string; alt: string | null } | null;
}
interface MediaRow { id: number; url: string; alt: string | null; width: number | null; height: number | null; category?: { slug: string; name: string } | null }

const field =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage";

const SUBS = ["pages", "testimonials", "events", "gallery", "faqs"] as const;
type Sub = (typeof SUBS)[number];

export function AdminContent() {
  const { token } = useAuth();
  const [sub, setSub] = useState<Sub>("pages");
  const [pages, setPages] = useState<PageRow[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [p, t, f, e, m] = await Promise.all([
        api<{ data: PageRow[] }>("/admin/cms/pages", { token }),
        api<{ data: Testimonial[] }>("/admin/cms/testimonials", { token }),
        api<{ data: Faq[] }>("/admin/cms/faqs", { token }),
        api<{ data: EventRow[] }>("/admin/cms/events", { token }),
        api<{ data: MediaRow[] }>("/admin/cms/media", { token }),
      ]);
      setPages(p.data);
      setTestimonials(t.data);
      setFaqs(f.data);
      setEvents(e.data);
      setMedia(m.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load content.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function savePage(p: PageRow) {
    try {
      await api(`/admin/cms/pages/${p.id}`, {
        method: "PATCH",
        token: token ?? undefined,
        body: { title: p.title, eyebrow: p.eyebrow, status: p.status },
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    }
  }

  async function toggleStatus(kind: "testimonials" | "faqs", row: Testimonial | Faq) {
    const status = row.status === "published" ? "draft" : "published";
    const body = kind === "testimonials"
      ? { name: (row as Testimonial).name, quote: (row as Testimonial).quote, origin: (row as Testimonial).origin, rating: (row as Testimonial).rating, status }
      : { group: (row as Faq).group, question: (row as Faq).question, answer: (row as Faq).answer, status };
    await api(`/admin/cms/${kind}/${row.id}`, { method: "POST", token: token ?? undefined, body });
    await load();
  }

  return (
    <section className="mt-4">
      {error && <p className="mb-3 text-sm text-terracotta-600">{error}</p>}
      <div className="flex flex-wrap gap-1.5">
        {SUBS.map((s) => (
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

      {sub === "pages" && (
        <div className="mt-4 overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Sections</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Edit</th></tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-forest-800">/{p.slug}</td>
                  <td className="px-4 py-3">
                    {editing?.id === p.id ? (
                      <input className={field} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                    ) : p.title}
                  </td>
                  <td className="px-4 py-3">{p.sections_count}</td>
                  <td className="px-4 py-3">
                    {editing?.id === p.id ? (
                      <select className={field} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                        <option value="published">published</option>
                        <option value="draft">draft</option>
                      </select>
                    ) : <span className="capitalize">{p.status}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing?.id === p.id ? (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => savePage(editing)}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === "testimonials" && (
        <TestimonialsPanel
          rows={testimonials}
          token={token}
          onChange={load}
          onError={setError}
          onToggle={(t) => toggleStatus("testimonials", t)}
        />
      )}

      {sub === "events" && (
        <EventsPanel rows={events} media={media} token={token} onChange={load} onError={setError} />
      )}

      {sub === "gallery" && (
        <GalleryPanel rows={media} token={token} onChange={load} onError={setError} />
      )}

      {sub === "faqs" && (
        <ul className="mt-4 flex flex-col gap-2">
          {faqs.map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4">
              <div>
                <p className="font-ui text-xs uppercase tracking-wide text-muted-foreground">{f.group}</p>
                <p className="font-ui text-sm font-semibold text-forest-800">{f.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => toggleStatus("faqs", f)}>
                {f.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ----------------------------- testimonials ----------------------------- */

function TestimonialsPanel({
  rows,
  token,
  onChange,
  onError,
  onToggle,
}: {
  rows: Testimonial[];
  token: string | null;
  onChange: () => Promise<void> | void;
  onError: (m: string) => void;
  onToggle: (t: Testimonial) => Promise<void> | void;
}) {
  const [form, setForm] = useState({ name: "", origin: "", quote: "", rating: 5 });
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!form.name.trim() || !form.quote.trim()) {
      onError("Name and quote are required.");
      return;
    }
    setBusy(true);
    try {
      await api("/admin/cms/testimonials", {
        method: "POST",
        token: token ?? undefined,
        body: { ...form, origin: form.origin || null, status: "published" },
      });
      setForm({ name: "", origin: "", quote: "", rating: 5 });
      await onChange();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this testimonial?")) return;
    await api(`/admin/cms/testimonials/${id}`, { method: "DELETE", token: token ?? undefined });
    await onChange();
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="font-ui text-sm font-semibold text-forest-800">Add a testimonial</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className={field} placeholder="Guest name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={field} placeholder="City / origin (optional)" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
        </div>
        <textarea className={cn(field, "mt-2 min-h-[80px]")} placeholder="What the guest said" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
        <div className="mt-2 flex items-center gap-3">
          <label className="font-ui text-xs text-muted-foreground">Rating</label>
          <select className={cn(field, "w-20")} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <Button size="sm" onClick={add} disabled={busy}>{busy ? "Saving…" : "Add testimonial"}</Button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <div>
              <p className="font-ui text-sm font-semibold text-forest-800">
                {t.name}{t.origin ? ` · ${t.origin}` : ""} · {"★".repeat(t.rating)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => onToggle(t)}>
                {t.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- events -------------------------------- */

function EventsPanel({
  rows,
  media,
  token,
  onChange,
  onError,
}: {
  rows: EventRow[];
  media: MediaRow[];
  token: string | null;
  onChange: () => Promise<void> | void;
  onError: (m: string) => void;
}) {
  const empty = { title: "", description: "", starts_at: "", ends_at: "", location: "", media_id: "" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!form.title.trim()) {
      onError("Event title is required.");
      return;
    }
    setBusy(true);
    try {
      await api("/admin/cms/events", {
        method: "POST",
        token: token ?? undefined,
        body: {
          title: form.title,
          description: form.description || null,
          starts_at: form.starts_at || null,
          ends_at: form.ends_at || null,
          location: form.location || null,
          media_id: form.media_id ? Number(form.media_id) : null,
          status: "published",
        },
      });
      setForm(empty);
      await onChange();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this event?")) return;
    await api(`/admin/cms/events/${id}`, { method: "DELETE", token: token ?? undefined });
    await onChange();
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="font-ui text-sm font-semibold text-forest-800">Add an event</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className={field} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={field} placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label className="font-ui text-xs text-muted-foreground">Starts
            <input type="datetime-local" className={field} value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </label>
          <label className="font-ui text-xs text-muted-foreground">Ends (optional)
            <input type="datetime-local" className={field} value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </label>
        </div>
        <textarea className={cn(field, "mt-2 min-h-[70px]")} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select className={cn(field, "max-w-[220px]")} value={form.media_id} onChange={(e) => setForm({ ...form, media_id: e.target.value })}>
            <option value="">No image</option>
            {media.map((m) => <option key={m.id} value={m.id}>{m.alt || `Image #${m.id}`}</option>)}
          </select>
          <Button size="sm" onClick={add} disabled={busy}>{busy ? "Saving…" : "Add event"}</Button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <div className="flex gap-3">
              {e.media ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.media.url} alt={e.media.alt ?? ""} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              ) : null}
              <div>
                <p className="font-ui text-sm font-semibold text-forest-800">{e.title}</p>
                <p className="font-ui text-xs text-muted-foreground">
                  {[e.starts_at ? new Date(e.starts_at).toLocaleString("en-IN") : null, e.location].filter(Boolean).join(" · ")}
                </p>
                {e.description ? <p className="mt-1 text-sm text-muted-foreground">{e.description}</p> : null}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => remove(e.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- gallery ------------------------------- */

function GalleryPanel({
  rows,
  token,
  onChange,
  onError,
}: {
  rows: MediaRow[];
  token: string | null;
  onChange: () => Promise<void> | void;
  onError: (m: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      onError("Choose an image first.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (alt) fd.append("alt", alt);
      await api("/admin/cms/media", { method: "POST", token: token ?? undefined, body: fd });
      if (fileRef.current) fileRef.current.value = "";
      setAlt("");
      await onChange();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this image?")) return;
    await api(`/admin/cms/media/${id}`, { method: "DELETE", token: token ?? undefined });
    await onChange();
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="font-ui text-sm font-semibold text-forest-800">Upload a gallery image</p>
        <p className="mt-1 font-ui text-xs text-muted-foreground">JPG, PNG or WebP · up to 8 MB.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="font-ui text-sm" />
          <input className={cn(field, "max-w-[260px]")} placeholder="Caption / alt text" value={alt} onChange={(e) => setAlt(e.target.value)} />
          <Button size="sm" onClick={upload} disabled={busy}>{busy ? "Uploading…" : "Upload"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {rows.map((m) => (
          <figure key={m.id} className="group relative overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full object-cover" />
            <button
              onClick={() => remove(m.id)}
              className="absolute right-1 top-1 rounded-full bg-forest-900/80 px-2 py-0.5 font-ui text-[10px] font-semibold text-ivory opacity-0 transition-opacity group-hover:opacity-100"
            >
              Delete
            </button>
          </figure>
        ))}
      </div>
    </div>
  );
}
