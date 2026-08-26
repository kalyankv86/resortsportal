"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 font-ui text-sm text-forest-800 outline-none transition-colors focus:border-sage";

/** Non-wired contact form — posts nowhere until the CRM milestone. */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="font-heading text-xl text-forest-800">Thank you.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This form is a preview — message delivery is enabled with the CRM
          module. Meanwhile, please email resorts@cutm.ac.in.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-4 rounded-card border border-border bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={field} placeholder="Full name" required />
        <input className={field} type="email" placeholder="Email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={field} placeholder="Phone" />
        <select className={field} defaultValue="">
          <option value="" disabled>How can we help?</option>
          <option>Booking a stay</option>
          <option>Wellness programme advice</option>
          <option>Corporate retreat</option>
          <option>Careers</option>
          <option>Something else</option>
        </select>
      </div>
      <textarea className={field} rows={4} placeholder="Your message" />
      <div className="flex items-center gap-3">
        <Button type="submit">Send message</Button>
        <span className="font-ui text-xs text-muted-foreground">
          Preview form — no data is transmitted.
        </span>
      </div>
    </form>
  );
}

/** Non-wired guest login — authenticates against the Laravel API once live. */
export function LoginForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto grid w-full max-w-md gap-4 rounded-card border border-border bg-surface p-6 sm:p-8"
    >
      <input className={field} type="email" placeholder="Email address" required />
      <input className={field} type="password" placeholder="Password" required />
      <div className="flex items-center justify-between font-ui text-xs text-muted-foreground">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Remember me
        </label>
        <a href="#" className="hover:text-forest-700">Forgot password?</a>
      </div>
      <Button type="submit" className="w-full">Sign in</Button>
      <p className="text-center font-ui text-xs text-muted-foreground">
        Authentication goes live with the guest-portal backend. New guest?{" "}
        <Link href="/book-now" className="text-forest-700 underline">Book a stay</Link>.
      </p>
    </form>
  );
}
