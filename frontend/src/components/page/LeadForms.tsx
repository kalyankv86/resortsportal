"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 font-ui text-sm text-forest-800 outline-none transition-colors focus:border-sage";

/** Contact form → POST /api/enquiries. */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      await api("/enquiries", {
        method: "POST",
        body: {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          topic: form.get("topic") || undefined,
          message: form.get("message") || undefined,
        },
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please email prasant.panda@cutm.ac.in.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="font-heading text-xl text-forest-800">Thank you.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your message has reached our reservations team — we&rsquo;ll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-card border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" className={field} placeholder="Full name" required />
        <input name="email" className={field} type="email" placeholder="Email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="phone" className={field} placeholder="Phone" />
        <select name="topic" className={field} defaultValue="">
          <option value="" disabled>How can we help?</option>
          <option>Booking a stay</option>
          <option>Wellness programme advice</option>
          <option>Corporate retreat</option>
          <option>Careers</option>
          <option>Something else</option>
        </select>
      </div>
      <textarea name="message" className={field} rows={4} placeholder="Your message" />
      {status === "error" ? (
        <p className="text-sm text-terracotta-600">{error}</p>
      ) : null}
      <div>
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}

/**
 * Single sign-in for guests and staff → POST /api/auth/login. The Guest/Staff
 * choice only frames the form; the destination dashboard is resolved from the
 * account's role (user.home), so staff land on the right portal automatically.
 */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"guest" | "staff">("guest");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(user.home ?? (user.is_staff ? "/admin" : "/guest"));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface p-1">
        {(["guest", "staff"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
            }}
            aria-pressed={mode === m}
            className={cn(
              "rounded-xl py-2 font-ui text-sm font-semibold transition-colors",
              mode === m
                ? "bg-forest-700 text-ivory"
                : "text-muted-foreground hover:bg-sage-100/60",
            )}
          >
            {m === "guest" ? "Guest" : "Staff"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 rounded-card border border-border bg-surface p-6 sm:p-8">
        <label className="grid gap-1.5">
          <span className="font-ui text-xs font-semibold text-forest-800">
            {mode === "staff" ? "Work email" : "Email address"}
          </span>
          <input
            name="email"
            className={field}
            type="email"
            placeholder={mode === "staff" ? "you@wellness.cutm.ac.in" : "you@example.com"}
            required
            autoComplete="email"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="font-ui text-xs font-semibold text-forest-800">Password</span>
          <input
            name="password"
            className={field}
            type="password"
            placeholder="Your password"
            required
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : mode === "staff" ? "Sign in to portal" : "Sign in"}
        </Button>
        {mode === "guest" ? (
          <p className="text-center font-ui text-xs text-muted-foreground">
            New guest?{" "}
            <Link href="/book-now" className="text-forest-700 underline">Book a stay</Link>
            {" "}— an account is created with your booking.
          </p>
        ) : (
          <p className="text-center font-ui text-xs text-muted-foreground">
            Staff accounts are issued by the wellness office. You&rsquo;ll be taken
            straight to your dashboard.
          </p>
        )}
      </form>
    </div>
  );
}
