"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";
import { cn } from "@/lib/cn";

/* ---- types ---------------------------------------------------------- */
interface Stay {
  reference: string;
  status: string;
  programme?: { name: string } | null;
  room?: { name: string } | null;
  check_in: string;
  check_out: string;
  nights: number;
  days_until: number;
  in_stay: boolean;
  balance_due: number;
  currency: string;
  pass: { url: string; qr_svg: string };
  schedule: {
    id: number;
    title: string;
    with?: string | null;
    scheduled_at: string;
    duration_min: number;
    status: string;
    type: string;
  }[];
}
interface DietChart {
  title: string;
  meals: { meal: string; time?: string; items: string[] }[];
  avoid?: string[];
  notes?: string;
  doctor?: { name: string } | null;
}
interface Prescription {
  id: number;
  items: { medicine: string; dose: string; timing: string; duration: string; anupana?: string }[];
  advice?: string;
  issued_at: string;
  doctor?: { name: string } | null;
}
interface Progress {
  entries: { entry_date: string; metrics: Record<string, number>; note?: string | null }[];
  dosha: { vata: number; pitta: number; kapha: number; prakriti: string; vikriti: string } | null;
}
interface Rewards {
  points: number;
  tier: string;
  ledger: { points: number; balance_after: number; reason: string; created_at: string }[];
}
interface InvoiceRow {
  booking: string;
  number: string;
  status: string;
  total: number;
  pdf_url: string;
}
interface BookingRow {
  id: number;
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  nights: number;
  total: string;
  currency: string;
  program?: { name: string } | null;
  room_category?: { name: string } | null;
}

const TABS = ["Overview", "Care plan", "Progress", "Billing"] as const;

export default function GuestPortalPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const [stay, setStay] = useState<Stay | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [diet, setDiet] = useState<DietChart | null>(null);
  const [rx, setRx] = useState<Prescription[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);

  const load = useCallback(async () => {
    if (!token) return;
    const opt = { token };
    const [s, b, d, p, pr, rw, iv] = await Promise.allSettled([
      api<{ data: Stay | null }>("/me/stay", opt),
      api<{ data: BookingRow[] }>("/me/bookings", opt),
      api<{ data: DietChart | null }>("/me/diet-chart", opt),
      api<{ data: Prescription[] }>("/me/prescriptions", opt),
      api<{ data: Progress }>("/me/progress", opt),
      api<{ data: Rewards }>("/me/rewards", opt),
      api<{ data: InvoiceRow[] }>("/me/invoices", opt),
    ]);
    if (s.status === "fulfilled") setStay(s.value.data);
    if (b.status === "fulfilled") setBookings(b.value.data);
    if (d.status === "fulfilled") setDiet(d.value.data);
    if (p.status === "fulfilled") setRx(p.value.data);
    if (pr.status === "fulfilled") setProgress(pr.value.data);
    if (rw.status === "fulfilled") setRewards(rw.value.data);
    if (iv.status === "fulfilled") setInvoices(iv.value.data);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load();
  }, [load]);

  return (
    <PortalShell title="Your stay">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label={stay ? (stay.in_stay ? "Currently staying" : "Days until arrival") : "Upcoming stays"}
          value={stay ? (stay.in_stay ? "In residence" : stay.days_until) : bookings.length}
        />
        <StatCard label="Total bookings" value={bookings.length} />
        <StatCard label="Loyalty points" value={rewards?.points ?? "—"} />
        <StatCard label="Tier" value={rewards?.tier ?? "Green"} />
      </div>

      <div className="mt-8 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-pill px-4 py-2 font-ui text-sm font-semibold transition-colors",
              tab === t ? "bg-forest-700 text-ivory" : "bg-surface text-muted-foreground hover:bg-sage-100",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Overview" && <Overview stay={stay} bookings={bookings} />}
        {tab === "Care plan" && <CarePlan diet={diet} rx={rx} dosha={progress?.dosha ?? null} />}
        {tab === "Progress" && <ProgressView progress={progress} />}
        {tab === "Billing" && <Billing invoices={invoices} rewards={rewards} bookings={bookings} />}
      </div>
    </PortalShell>
  );
}

/* ---- Overview ----------------------------------------------------------- */
function Overview({ stay, bookings }: { stay: Stay | null; bookings: BookingRow[] }) {
  if (!stay) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="font-heading text-xl text-forest-800">No upcoming stay</p>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link href="/book-now" className="text-forest-700 underline">Plan a wellness stay →</Link>
        </p>
        {bookings.length > 0 && (
          <p className="mt-4 font-ui text-xs text-muted-foreground">
            You have {bookings.length} past booking{bookings.length > 1 ? "s" : ""} — see Billing.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-card border border-border bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="font-heading text-2xl text-forest-800">
              {stay.programme?.name ?? stay.room?.name ?? "Your stay"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stay.check_in} → {stay.check_out} · {stay.nights} nights · {stay.reference}
            </p>
          </div>
          <span className="rounded-pill bg-sage-100 px-3 py-1 font-ui text-xs font-semibold capitalize text-forest-700">
            {stay.status.replace("_", " ")}
          </span>
        </div>

        {stay.balance_due > 0 && (
          <p className="mt-4 rounded-2xl bg-sand/60 px-4 py-2 font-ui text-sm text-forest-800">
            Balance due {stay.currency} {Math.round(stay.balance_due).toLocaleString("en-IN")} —{" "}
            <Link href={`/booking/${stay.reference}`} className="underline">pay now</Link>
          </p>
        )}

        <h3 className="mt-6 font-heading text-lg text-forest-800">Schedule</h3>
        {stay.schedule.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Your daily schedule appears here once the clinical team sets it.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {stay.schedule.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-ui text-sm font-semibold text-forest-800">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.scheduled_at).toLocaleString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                    {a.with ? ` · ${a.with}` : ""} · {a.duration_min} min
                  </p>
                </div>
                <span className={cn(
                  "rounded-pill px-2.5 py-1 font-ui text-[0.65rem] font-semibold uppercase",
                  a.status === "completed" ? "bg-border text-muted-foreground" : "bg-sage-100 text-forest-700",
                )}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="h-fit rounded-card border border-border bg-surface p-6 text-center">
        <p className="eyebrow text-terracotta">Check-in pass</p>
        <div className="mx-auto mt-4 w-44" dangerouslySetInnerHTML={{ __html: stay.pass.qr_svg }} />
        <p className="mt-3 font-ui text-xs text-muted-foreground">Show at reception on arrival.</p>
        <Link href={`/booking/${stay.reference}`} className="mt-4 inline-block font-ui text-sm font-semibold text-forest-700 underline">
          Full booking details
        </Link>
      </aside>
    </div>
  );
}

/* ---- Care plan -------------------------------------------------------- */
function CarePlan({
  diet,
  rx,
  dosha,
}: {
  diet: DietChart | null;
  rx: Prescription[];
  dosha: Progress["dosha"];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {dosha && (
        <div className="rounded-card border border-border bg-surface p-6 lg:col-span-2">
          <h3 className="font-heading text-lg text-forest-800">Dosha assessment</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prakriti <strong>{dosha.prakriti}</strong> · current imbalance <strong>{dosha.vikriti}</strong>
          </p>
          <div className="mt-4 flex gap-2">
            {(["vata", "pitta", "kapha"] as const).map((k) => (
              <div key={k} className="flex-1">
                <div className="flex justify-between font-ui text-xs text-muted-foreground">
                  <span className="capitalize">{k}</span><span>{dosha[k]}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface-muted">
                  <div className="h-2 rounded-full bg-sage" style={{ width: `${dosha[k]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-surface p-6">
        <h3 className="font-heading text-lg text-forest-800">{diet?.title ?? "Diet chart"}</h3>
        {diet?.doctor && <p className="text-xs text-muted-foreground">by {diet.doctor.name}</p>}
        {!diet ? (
          <p className="mt-2 text-sm text-muted-foreground">Your prescribed diet appears here after your consultation.</p>
        ) : (
          <>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {diet.meals.map((m, i) => (
                <li key={i} className="py-3">
                  <p className="font-ui text-sm font-semibold text-forest-800">
                    {m.meal} {m.time && <span className="text-muted-foreground">· {m.time}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{m.items.join(" · ")}</p>
                </li>
              ))}
            </ul>
            {diet.avoid && diet.avoid.length > 0 && (
              <p className="mt-3 text-sm">
                <span className="font-semibold text-terracotta-600">Avoid:</span>{" "}
                <span className="text-muted-foreground">{diet.avoid.join(", ")}</span>
              </p>
            )}
            {diet.notes && <p className="mt-2 text-xs text-muted-foreground">{diet.notes}</p>}
          </>
        )}
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h3 className="font-heading text-lg text-forest-800">Prescriptions</h3>
        {rx.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No prescriptions yet.</p>
        ) : (
          rx.map((p) => (
            <div key={p.id} className="mt-3">
              <p className="text-xs text-muted-foreground">
                {p.doctor?.name ? `${p.doctor.name} · ` : ""}
                {new Date(p.issued_at).toLocaleDateString()}
              </p>
              <ul className="mt-2 flex flex-col divide-y divide-border">
                {p.items.map((it, i) => (
                  <li key={i} className="py-2 text-sm">
                    <span className="font-semibold text-forest-800">{it.medicine}</span>
                    <span className="block text-xs text-muted-foreground">
                      {it.dose} · {it.timing} · {it.duration}
                      {it.anupana && it.anupana !== "—" ? ` · with ${it.anupana}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {p.advice && <p className="mt-2 text-xs text-muted-foreground">{p.advice}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---- Progress -------------------------------------------------------- */
function ProgressView({ progress }: { progress: Progress | null }) {
  const entries = progress?.entries ?? [];
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Progress metrics appear here as the clinical team records them.</p>;
  }
  const keys = ["weight_kg", "sleep_hours", "sleep_score", "stress_score", "water_l"];
  const labels: Record<string, string> = {
    weight_kg: "Weight (kg)",
    sleep_hours: "Sleep (h)",
    sleep_score: "Sleep score",
    stress_score: "Stress score",
    water_l: "Water (L)",
  };
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-border font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Date</th>
            {keys.map((k) => <th key={k} className="px-4 py-3 text-right">{labels[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-medium text-forest-800">{e.entry_date}</td>
              {keys.map((k) => (
                <td key={k} className="px-4 py-3 text-right">{e.metrics?.[k] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Billing -------------------------------------------------------- */
function Billing({
  invoices,
  rewards,
  bookings,
}: {
  invoices: InvoiceRow[];
  rewards: Rewards | null;
  bookings: BookingRow[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-card border border-border bg-surface p-6">
        <h3 className="font-heading text-lg text-forest-800">Invoices</h3>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {invoices.map((iv) => (
              <li key={iv.number} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-ui text-sm font-semibold text-forest-800">{iv.number}</p>
                  <p className="text-xs text-muted-foreground">{iv.booking} · ₹{Math.round(iv.total).toLocaleString("en-IN")} · {iv.status}</p>
                </div>
                <a href={iv.pdf_url} target="_blank" rel="noreferrer" className="font-ui text-sm font-semibold text-forest-700 underline">
                  PDF
                </a>
              </li>
            ))}
          </ul>
        )}
        <h4 className="mt-6 font-heading text-base text-forest-800">All bookings</h4>
        <ul className="mt-2 flex flex-col divide-y divide-border text-sm">
          {bookings.map((b) => (
            <li key={b.id} className="flex justify-between py-2">
              <Link href={`/booking/${b.reference}`} className="underline decoration-sage underline-offset-2">
                {b.reference}
              </Link>
              <span className="capitalize text-muted-foreground">{b.status.replace("_", " ")}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h3 className="font-heading text-lg text-forest-800">Rewards</h3>
        <p className="mt-1 font-heading text-3xl text-forest-700">{rewards?.points ?? 0} pts</p>
        <p className="text-sm text-muted-foreground">{rewards?.tier ?? "Green"} tier</p>
        <ul className="mt-4 flex flex-col divide-y divide-border text-sm">
          {(rewards?.ledger ?? []).map((l, i) => (
            <li key={i} className="flex justify-between py-2">
              <span className="text-muted-foreground">{l.reason}</span>
              <span className={l.points >= 0 ? "text-forest-700" : "text-terracotta-600"}>
                {l.points >= 0 ? "+" : ""}{l.points}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
