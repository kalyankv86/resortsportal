"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

/** Guest login → POST /api/auth/login, then redirect to the user's home. */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(user.home ?? "/guest");
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
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-4 rounded-card border border-border bg-surface p-6 sm:p-8">
      <input name="email" className={field} type="email" placeholder="Email address" required autoComplete="email" />
      <input name="password" className={field} type="password" placeholder="Password" required autoComplete="current-password" />
      {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center font-ui text-xs text-muted-foreground">
        New guest?{" "}
        <Link href="/book-now" className="text-forest-700 underline">Book a stay</Link>
        {" "}— an account is created with your booking.
      </p>
    </form>
  );
}
