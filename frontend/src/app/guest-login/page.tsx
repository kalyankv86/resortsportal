import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { LoginForm } from "@/components/page/LeadForms";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "One sign-in for guests and staff at Centurion Wellness Eco Tourism — choose your account type and go straight to your dashboard.",
  alternates: { canonical: "/guest-login" },
};

const inside = [
  { who: "Guests", what: "Your stay, daily schedule, diet chart, prescriptions, invoices and progress." },
  { who: "Doctors & therapists", what: "Today's patients and appointments, notes, diet charts and prescriptions." },
  { who: "Housekeeping & restaurant", what: "Room-status board, task list and live meal orders." },
  { who: "Administration", what: "Bookings, payments, refunds, content, users, settings and the audit trail." },
];

export default function SignInPage() {
  return (
    <section className="pt-32 pb-20">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="eyebrow text-terracotta">Account</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One sign-in for guests and staff. Choose your account type and you&rsquo;ll
            be taken straight to the right dashboard.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What you&rsquo;ll find inside
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {inside.map((r) => (
              <li key={r.who} className="rounded-2xl border border-border bg-surface p-4">
                <p className="font-ui text-sm font-semibold text-forest-800">{r.who}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
