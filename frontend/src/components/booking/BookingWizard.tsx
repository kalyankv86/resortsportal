"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { PayPanel } from "@/components/booking/PayPanel";
import { cn } from "@/lib/cn";

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 font-ui text-sm text-forest-800 outline-none transition-colors focus:border-sage";

interface RoomCategory {
  slug: string;
  name: string;
  summary: string;
  base_occupancy: number;
  max_occupancy: number;
  rate_plans?: { nightly_rate: string }[];
}
interface Program {
  slug: string;
  name: string;
  nights: number;
  price_from: string;
  summary: string;
}
interface QuoteLine { label: string; amount: number }
interface Quote {
  nights: number;
  currency: string;
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  gst_percent: number;
  tax: number;
  total: number;
  promo: { code: string; applied: boolean; label: string } | null;
  availability: { available: number; capacity: number } | null;
}
interface CreatedBooking {
  reference: string;
  status: string;
  total: number;
  balance_due: number;
  currency: string;
  check_in: string;
  check_out: string;
  contact_email: string;
  pass: { url: string; qr_svg: string };
}

const STEPS = ["Wellness package", "Room & dates", "Your details", "Review"] as const;

function isoPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function BookingWizard() {
  const params = useSearchParams();
  const { token } = useAuth();

  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState(params.get("checkIn") || isoPlusDays(14));
  const [checkOut, setCheckOut] = useState(params.get("checkOut") || isoPlusDays(21));
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [adults, setAdults] = useState(Number(params.get("guests")) || 2);
  const [children, setChildren] = useState(0);
  const [programSlug, setProgramSlug] = useState<string>("");
  const [roomSlug, setRoomSlug] = useState<string>("");
  const [bookingType, setBookingType] = useState("individual");
  const [promo, setPromo] = useState("");

  const [rooms, setRooms] = useState<RoomCategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const [guest, setGuest] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nationality: "",
    special_requests: "",
  });
  const [q, setQ] = useState({ conditions: "", medications: "", allergies: "", pregnant: false, consent: false });

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteErr, setQuoteErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [created, setCreated] = useState<CreatedBooking | null>(null);

  useEffect(() => {
    api<{ data: RoomCategory[] }>("/rooms").then((r) => setRooms(r.data)).catch(() => {});
    api<{ data: Program[] }>("/programs").then((r) => setPrograms(r.data)).catch(() => {});
  }, []);

  // pre-select a package from ?package=De-Stress & Detox
  useEffect(() => {
    const pkg = params.get("package");
    if (pkg && programs.length && !programSlug) {
      const match = programs.find((p) => p.name.toLowerCase() === pkg.toLowerCase());
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time prefill from query string
      if (match) setProgramSlug(match.slug);
    }
  }, [params, programs, programSlug]);

  // choosing a package sets the stay length to match its day count
  useEffect(() => {
    const p = programs.find((x) => x.slug === programSlug);
    if (p?.nights) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derive checkout from the package length
      setCheckOut(addDays(checkIn, p.nights));
    }
  }, [programSlug, programs, checkIn]);

  const runQuote = useCallback(async () => {
    if (!programSlug && !roomSlug) {
      setQuote(null);
      return;
    }
    setQuoteErr("");
    try {
      const res = await api<{ data: Quote }>("/bookings/quote", {
        method: "POST",
        body: {
          check_in: checkIn,
          check_out: checkOut,
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
          adults,
          children,
          program: programSlug || undefined,
          room_category: roomSlug || undefined,
          promo_code: promo || undefined,
        },
      });
      setQuote(res.data);
    } catch (err) {
      setQuote(null);
      setQuoteErr(err instanceof ApiError ? err.message : "Could not price this stay.");
    }
  }, [checkIn, checkOut, checkInTime, checkOutTime, adults, children, programSlug, roomSlug, promo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-price when inputs change
    if (step >= 1) void runQuote();
  }, [step, runQuote]);

  const nights = useMemo(() => {
    const d = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000;
    return Math.max(0, Math.round(d));
  }, [checkIn, checkOut]);

  const canProceed = useMemo(() => {
    if (step === 0) return true; // a package, or "room only"
    if (step === 1) return nights >= 1 && adults >= 1 && !!roomSlug && !!quote;
    if (step === 2)
      return (
        guest.first_name.trim() &&
        /.+@.+\..+/.test(guest.email) &&
        guest.phone.trim().length >= 6 &&
        q.consent
      );
    return true;
  }, [step, nights, adults, roomSlug, quote, guest, q.consent]);

  async function confirm() {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const res = await api<{ data: CreatedBooking }>("/bookings", {
        method: "POST",
        token: token ?? undefined,
        body: {
          check_in: checkIn,
          check_out: checkOut,
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
          adults,
          children,
          program: programSlug || undefined,
          room_category: roomSlug || undefined,
          promo_code: promo || undefined,
          booking_type: bookingType,
          first_name: guest.first_name,
          last_name: guest.last_name || undefined,
          email: guest.email,
          phone: guest.phone,
          nationality: guest.nationality || undefined,
          special_requests: guest.special_requests || undefined,
          questionnaire: {
            conditions: q.conditions || "none stated",
            medications: q.medications || "none stated",
            allergies: q.allergies || "none stated",
            pregnant: q.pregnant,
          },
        },
      });
      setCreated(res.data);
    } catch (err) {
      setSubmitErr(err instanceof ApiError ? err.message : "Booking could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) return <Confirmation booking={created} />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <ol className="mb-8 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-pill border px-3 py-1.5 font-ui text-xs font-semibold",
                i === step
                  ? "border-forest-700 bg-forest-700 text-ivory"
                  : i < step
                    ? "border-sage bg-sage-100 text-forest-700"
                    : "border-border text-muted-foreground",
              )}
            >
              <span>{i + 1}</span> {label}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-lg text-forest-800">Choose a wellness package</h3>
            <p className="font-ui text-sm text-muted-foreground">
              Package prices are for the treatment guest and are inclusive of GST.
              Accommodation is chosen next and charged per night; diet is ₹800 per
              day. Therapies and charges may vary post consultation.
            </p>
            <div className="mt-1 grid gap-2">
              {programs.map((p) => (
                <Choice
                  key={p.slug}
                  active={programSlug === p.slug}
                  onClick={() => setProgramSlug(p.slug)}
                  title={`${p.name} · ${p.nights}-Day`}
                  sub={p.summary}
                  price={inr(Number(p.price_from))}
                />
              ))}
              <Choice
                active={programSlug === ""}
                onClick={() => setProgramSlug("")}
                title="No package — room only"
                sub="Stay without a structured wellness programme."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Check-in date</span>
                <input type="date" className={field} value={checkIn} min={isoPlusDays(1)} onChange={(e) => setCheckIn(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Check-in time</span>
                <input type="time" className={field} value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Check-out date · {nights} night{nights === 1 ? "" : "s"}</span>
                <input type="date" className={field} value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Check-out time</span>
                <input type="time" className={field} value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Adults</span>
                <select className={field} value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Children</span>
                <select className={field} value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                  {[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Booking type</span>
                <select className={field} value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                  <option value="international">International guest</option>
                </select>
              </label>
            </div>

            <div>
              <h3 className="font-heading text-lg text-forest-800">Room</h3>
              <p className="mt-1 font-ui text-xs text-muted-foreground">
                Travelling with a companion for a treatment guest? Choose a
                double-occupancy room. Rates include food.
              </p>
              <div className="mt-3 grid gap-2">
                {rooms.map((r) => (
                  <Choice
                    key={r.slug}
                    active={roomSlug === r.slug}
                    onClick={() => {
                      setRoomSlug(r.slug);
                      setAdults(Math.max(1, r.base_occupancy || 1));
                    }}
                    title={r.name}
                    sub={r.summary}
                    price={r.rate_plans?.[0] ? `${inr(Number(r.rate_plans[0].nightly_rate))} / night` : undefined}
                  />
                ))}
                {rooms.length === 0 && (
                  <p className="rounded-card border border-dashed border-border p-4 font-ui text-sm text-muted-foreground">
                    No rooms are loaded yet. Please contact reception to book.
                  </p>
                )}
              </div>
            </div>
            {quoteErr && <p className="text-sm text-terracotta-600">{quoteErr}</p>}
            {quote?.availability && quote.availability.available < 1 && (
              <p className="text-sm text-terracotta-600">
                That room is sold out for your dates.{" "}
                <Link href="/contact" className="underline">Join the waitlist</Link>.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <input className={field} placeholder="First name" value={guest.first_name} onChange={(e) => setGuest({ ...guest, first_name: e.target.value })} />
            <input className={field} placeholder="Last name" value={guest.last_name} onChange={(e) => setGuest({ ...guest, last_name: e.target.value })} />
            <input className={field} type="email" placeholder="Email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
            <input className={field} placeholder="Phone" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
            {bookingType === "international" && (
              <input className={field} placeholder="Nationality" value={guest.nationality} onChange={(e) => setGuest({ ...guest, nationality: e.target.value })} />
            )}
            <textarea className={cn(field, "sm:col-span-2")} rows={2} placeholder="Special requests (optional)" value={guest.special_requests} onChange={(e) => setGuest({ ...guest, special_requests: e.target.value })} />

            <div className="sm:col-span-2 rounded-card border border-border bg-surface-muted p-4">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medical questionnaire</p>
              <div className="mt-3 grid gap-3">
                <input className={field} placeholder="Existing conditions (or 'none')" value={q.conditions} onChange={(e) => setQ({ ...q, conditions: e.target.value })} />
                <input className={field} placeholder="Current medications (or 'none')" value={q.medications} onChange={(e) => setQ({ ...q, medications: e.target.value })} />
                <input className={field} placeholder="Allergies (or 'none')" value={q.allergies} onChange={(e) => setQ({ ...q, allergies: e.target.value })} />
                <label className="flex items-center gap-2 font-ui text-sm text-forest-800">
                  <input type="checkbox" checked={q.pregnant} onChange={(e) => setQ({ ...q, pregnant: e.target.checked })} />
                  Pregnant or trying to conceive
                </label>
                <label className="flex items-start gap-2 font-ui text-sm text-forest-800">
                  <input type="checkbox" className="mt-1" checked={q.consent} onChange={(e) => setQ({ ...q, consent: e.target.checked })} />
                  I consent to the clinical team reviewing this information to plan my stay, and agree to the cancellation policy.
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-ui text-xs uppercase tracking-wide text-muted-foreground">Promo or voucher code</span>
              <div className="flex gap-2">
                <input className={field} placeholder="e.g. WELCOME10" value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} />
                <Button type="button" variant="secondary" onClick={() => void runQuote()}>Apply</Button>
              </div>
              {quote?.promo && (
                <span className={cn("font-ui text-xs", quote.promo.applied ? "text-forest-700" : "text-terracotta-600")}>
                  {quote.promo.applied ? `✓ ${quote.promo.label}` : quote.promo.label}
                </span>
              )}
            </label>
            <div className="rounded-card border border-border bg-surface p-5 text-sm">
              <Row label="Stay" value={`${checkIn} → ${checkOut} · ${nights} night${nights === 1 ? "" : "s"}`} />
              <Row label="Check-in / out" value={`${checkInTime} · ${checkOutTime}`} />
              <Row label="Guests" value={`${adults} adult${adults > 1 ? "s" : ""}${children ? `, ${children} children` : ""}`} />
              {programSlug && <Row label="Package" value={programs.find((p) => p.slug === programSlug)?.name ?? programSlug} />}
              {roomSlug && <Row label="Room" value={rooms.find((r) => r.slug === roomSlug)?.name ?? roomSlug} />}
            </div>
            {submitErr && <p className="text-sm text-terracotta-600">{submitErr}</p>}
            <p className="font-ui text-xs text-muted-foreground">
              On the next step you can pay by UPI, card or net-banking, or
              reserve now and pay later — your dates are held either way. A GST
              invoice is issued once payment is received.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={step === 0 ? "invisible" : ""}
          >
            ← Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
              Continue →
            </Button>
          ) : (
            <Button type="button" onClick={confirm} disabled={!canProceed || submitting || !quote}>
              {submitting ? "Confirming…" : "Confirm booking"}
            </Button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-card border border-border bg-surface p-6 lg:sticky lg:top-28">
        <p className="eyebrow text-terracotta">Your quote</p>
        {quote ? (
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {quote.lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="text-muted-foreground">{l.label}</span>
                <span>{inr(l.amount)}</span>
              </div>
            ))}
            <div className="my-2 border-t border-border" />
            <Row label="Subtotal" value={inr(quote.subtotal)} />
            {quote.discount > 0 && <Row label="Discount" value={`− ${inr(quote.discount)}`} />}
            <div className="mt-2 flex justify-between border-t border-border pt-3 font-heading text-xl text-forest-800">
              <span>Total</span>
              <span>{inr(quote.total)}</span>
            </div>
            {quote.gst_percent > 0 && (
              <p className="font-ui text-xs text-muted-foreground">
                Includes GST {quote.gst_percent}% ({inr(quote.tax)}). Diet at ₹800/day billed on site.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 font-ui text-sm text-muted-foreground">
            Pick a package or room to see pricing.
          </p>
        )}
      </aside>
    </div>
  );
}

function Choice({
  active,
  onClick,
  title,
  sub,
  price,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
  price?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-colors",
        active ? "border-forest-700 bg-sage-100/60" : "border-border bg-surface hover:border-sage",
      )}
    >
      <span>
        <span className="block font-heading text-base text-forest-800">{title}</span>
        {sub && <span className="mt-0.5 block text-xs text-muted-foreground">{sub}</span>}
      </span>
      {price && <span className="shrink-0 font-ui text-xs font-semibold text-forest-700">{price}</span>}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-forest-800">{value}</span>
    </div>
  );
}

function Confirmation({ booking }: { booking: CreatedBooking }) {
  const [status, setStatus] = useState(booking.status);
  const [balance, setBalance] = useState(booking.balance_due ?? booking.total);
  const qrToken = booking.pass.url.split("t=")[1] ?? "";

  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[1.1fr_1fr]">
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="eyebrow text-terracotta">Booking received</p>
        <h2 className="mt-2 font-heading text-3xl text-forest-800">{booking.reference}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Status: <span className="capitalize">{status}</span> · {booking.check_in} → {booking.check_out}
        </p>
        <div className="mx-auto mt-6 w-40" dangerouslySetInnerHTML={{ __html: booking.pass.qr_svg }} />
        <p className="mt-4 text-sm text-muted-foreground">
          A confirmation has been sent to <strong>{booking.contact_email}</strong>.
          Show this QR pass at reception on arrival.
        </p>
        <p className="mt-2 font-heading text-lg text-forest-800">
          Total {booking.currency} {Math.round(booking.total).toLocaleString("en-IN")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href={`/booking/${booking.reference}?t=${encodeURIComponent(qrToken)}`}>
            View booking
          </Button>
          <Button href="/" variant="secondary">Back to site</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <PayPanel
          reference={booking.reference}
          token={qrToken}
          balanceDue={balance}
          currency={booking.currency}
          onPaid={() => {
            setStatus("confirmed");
            setBalance(0);
          }}
        />
        {balance > 0 && (
          <p className="font-ui text-xs text-muted-foreground">
            Prefer to pay later? That&rsquo;s fine — your dates are held as{" "}
            <strong>pending</strong> and our team will follow up with payment
            options.
          </p>
        )}
      </div>
    </div>
  );
}
