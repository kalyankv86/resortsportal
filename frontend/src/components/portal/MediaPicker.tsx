"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface MediaRow {
  id: number;
  url: string;
  alt: string | null;
}

/**
 * Photo picker for catalogue items. Reads the shared media library
 * (/admin/cms/media), lets you upload new images and pick an ordered set;
 * `value` is the ordered list of media-asset ids.
 */
export function MediaPicker({
  token,
  value,
  onChange,
}: {
  token: string | null;
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await api<{ data: MediaRow[] }>("/admin/cms/media", { token });
      setRows(r.data);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load images.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await api<{ data: MediaRow }>("/admin/cms/media", {
        method: "POST",
        token: token ?? undefined,
        body: fd,
      });
      if (fileRef.current) fileRef.current.value = "";
      await load();
      onChange([...value, r.data.id]);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Photos {value.length > 0 ? `· ${value.length} selected` : ""}
        </p>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="max-w-[190px] font-ui text-xs" />
          <Button type="button" size="sm" variant="secondary" onClick={upload} disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
      {err ? <p className="mt-2 text-xs text-terracotta-600">{err}</p> : null}
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">No images yet — upload one to start.</p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {rows.map((m) => {
            const idx = value.indexOf(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                aria-pressed={idx > -1}
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 transition-colors",
                  idx > -1 ? "border-forest-600" : "border-transparent hover:border-border",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full object-cover" />
                {idx > -1 ? (
                  <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-forest-700 font-ui text-[10px] font-bold text-ivory">
                    {idx + 1}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
