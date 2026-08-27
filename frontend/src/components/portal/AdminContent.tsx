"use client";

import { useCallback, useEffect, useState } from "react";
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

const field = "w-full rounded-xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage";

export function AdminContent() {
  const { token } = useAuth();
  const [sub, setSub] = useState<"pages" | "testimonials" | "faqs">("pages");
  const [pages, setPages] = useState<PageRow[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [p, t, f] = await Promise.all([
        api<{ data: PageRow[] }>("/admin/cms/pages", { token }),
        api<{ data: Testimonial[] }>("/admin/cms/testimonials", { token }),
        api<{ data: Faq[] }>("/admin/cms/faqs", { token }),
      ]);
      setPages(p.data);
      setTestimonials(t.data);
      setFaqs(f.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load content.");
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
      <div className="flex gap-1.5">
        {(["pages", "testimonials", "faqs"] as const).map((s) => (
          <button key={s} onClick={() => setSub(s)} className={cn(
            "rounded-pill px-3 py-1.5 font-ui text-xs font-semibold capitalize",
            sub === s ? "bg-forest-700 text-ivory" : "bg-surface text-muted-foreground hover:bg-sage-100",
          )}>{s}</button>
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
        <ul className="mt-4 flex flex-col gap-2">
          {testimonials.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4">
              <div>
                <p className="font-ui text-sm font-semibold text-forest-800">{t.name}{t.origin ? ` · ${t.origin}` : ""} · {"★".repeat(t.rating)}</p>
                <p className="mt-1 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => toggleStatus("testimonials", t)}>
                {t.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </li>
          ))}
        </ul>
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
