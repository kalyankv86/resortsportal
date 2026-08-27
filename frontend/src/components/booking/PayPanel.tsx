"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Method { key: string; label: string }

/**
 * Collects payment for a booking's outstanding balance.
 * Auth: pass the QR `token` for a just-created booking, or rely on the signed-in
 * guest / staff session.
 */
export function PayPanel({
  reference,
  token,
  balanceDue,
  currency,
  onPaid,
}: {
  reference: string;
  token?: string;
  balanceDue: number;
  currency: string;
  onPaid?: () => void;
}) {
  const { token: jwt } = useAuth();
  const [methods, setMethods] = useState<Method[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "info" | "err"; text: string } | null>(null);

  useEffect(() => {
    api<{ data: Method[] }>("/payments/methods")
      .then((r) => {
        setMethods(r.data);
        setSelected(r.data[0]?.key ?? "");
      })
      .catch(() => {});
  }, []);

  if (balanceDue <= 0) {
    return (
      <p className="rounded-2xl bg-sage-100/60 px-4 py-3 font-ui text-sm text-forest-700">
        ✓ Paid in full.
      </p>
    );
  }

  async function pay() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const qs = token ? `?t=${encodeURIComponent(token)}` : "";
      const res = await api<{
        data: { gateway: { mode: string; text?: string }; payment: { status: string }; booking_status: string };
      }>(`/bookings/${encodeURIComponent(reference)}/pay${qs}`, {
        method: "POST",
        token: jwt ?? undefined,
        body: { method: selected },
      });

      const g = res.data.gateway;
      if (g.mode === "instructions") {
        setMsg({ kind: "info", text: g.text ?? "Payment instructions have been emailed to you." });
      } else if (res.data.payment.status === "paid") {
        setMsg({ kind: "ok", text: "Payment successful — your booking is confirmed." });
        onPaid?.();
      } else {
        setMsg({ kind: "info", text: "Payment initiated. We'll confirm once it clears." });
      }
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof ApiError ? err.message : "Payment could not be started." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pay balance</p>
        <p className="font-heading text-lg text-forest-800">
          {currency} {Math.round(balanceDue).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {methods.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelected(m.key)}
            className={cn(
              "rounded-pill px-3 py-1.5 font-ui text-xs font-semibold transition-colors",
              selected === m.key ? "bg-forest-700 text-ivory" : "bg-surface-muted text-muted-foreground hover:bg-sage-100",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="mt-2 font-ui text-[0.68rem] text-muted-foreground">
        Payments are processed securely. A GST invoice is issued once payment is
        received.
      </p>

      {msg && (
        <p
          className={cn(
            "mt-3 rounded-2xl px-3 py-2 font-ui text-sm",
            msg.kind === "ok" && "bg-sage-100/70 text-forest-700",
            msg.kind === "info" && "bg-sand/60 text-forest-800",
            msg.kind === "err" && "bg-terracotta/10 text-terracotta-600",
          )}
        >
          {msg.text}
        </p>
      )}

      <Button className="mt-4 w-full" onClick={pay} disabled={busy || !selected}>
        {busy ? "Processing…" : `Pay ${currency} ${Math.round(balanceDue).toLocaleString("en-IN")}`}
      </Button>
    </div>
  );
}
