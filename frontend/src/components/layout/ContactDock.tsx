"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const ic = "h-[19px] w-[19px]";

const IG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={ic}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FB = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={ic}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Phone = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={ic}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.94.68 2.86a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.22-1.22a2 2 0 0 1 2.11-.45c.92.32 1.88.55 2.86.68A2 2 0 0 1 22 16.92z" />
  </svg>
);
const Mail = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={ic}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const Chat = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={ic}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const links = [
  { label: "Instagram", href: site.socials.instagram, external: true, hover: "hover:border-[#E1306C] hover:bg-[#E1306C]", icon: IG },
  { label: "Facebook", href: site.socials.facebook, external: true, hover: "hover:border-[#1877F2] hover:bg-[#1877F2]", icon: FB },
  { label: "Call reception", href: `tel:${site.phone.replace(/\s/g, "")}`, hover: "hover:border-forest-700 hover:bg-forest-700", icon: Phone },
  { label: "Email us", href: `mailto:${site.email}`, hover: "hover:border-terracotta-600 hover:bg-terracotta-600", icon: Mail },
];

const btn =
  "group relative grid h-11 w-11 place-items-center rounded-full border border-border/60 bg-ivory/95 text-forest-700 shadow-lift backdrop-blur-sm transition-colors duration-200 hover:text-white";
const tip =
  "pointer-events-none absolute right-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-forest-900 px-2.5 py-1 font-ui text-[0.7rem] font-medium text-ivory opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100";
const fieldC =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-ui text-sm text-forest-800 outline-none transition-colors focus:border-sage";

export function ContactDock() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  // Gentle scroll-reactive drift: the rail eases toward an offset driven by
  // scroll velocity, then springs back to centre. Skipped for reduced motion.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = window.scrollY;
    let target = 0;
    let cur = 0;

    const onScroll = () => {
      const dy = window.scrollY - last;
      last = window.scrollY;
      target = Math.max(-48, Math.min(48, target + dy * 0.25));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cur += (target - cur) * 0.12;
      target *= 0.9;
      el.style.transform = `translateY(calc(-50% + ${cur.toFixed(2)}px))`;
      if (Math.abs(cur) > 0.3 || Math.abs(target) > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        el.style.transform = "translateY(-50%)";
        raf = 0;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        ref={railRef}
        className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 print:hidden sm:right-4"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Send an enquiry"
          className={`${btn} border-forest-700 bg-forest-700 text-ivory hover:bg-forest-800`}
        >
          {Chat}
          <span className={tip}>Enquire</span>
        </button>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={l.label}
            className={`${btn} ${l.hover}`}
          >
            {l.icon}
            <span className={tip}>{l.label}</span>
          </a>
        ))}
      </div>

      {open ? <EnquiryModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function EnquiryModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      await api("/enquiries", {
        method: "POST",
        body: {
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone") || undefined,
          topic: "Website enquiry",
          message: f.get("message") || undefined,
        },
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof ApiError
          ? err.message
          : `Something went wrong. Please email ${site.email}.`,
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Send an enquiry"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-lift sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-terracotta">Enquire</p>
            <h2 className="mt-1 text-2xl">Send us a message</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-sage-100/70 hover:text-forest-800"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "sent" ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface-muted p-6 text-center">
            <p className="font-heading text-lg text-forest-800">Thank you.</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your enquiry has reached our reservations desk — we&rsquo;ll be in touch shortly.
            </p>
            <Button onClick={onClose} className="mt-4" size="sm">Close</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 grid gap-3">
            <input name="name" className={fieldC} placeholder="Full name" required autoComplete="name" />
            <input name="email" className={fieldC} type="email" placeholder="Email" required autoComplete="email" />
            <input name="phone" className={fieldC} placeholder="Phone (optional)" autoComplete="tel" />
            <textarea name="message" className={fieldC} rows={4} placeholder="How can we help?" required />
            {status === "error" ? <p className="text-sm text-terracotta-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send enquiry"}
            </Button>
            <p className="text-center font-ui text-[0.7rem] text-muted-foreground">
              Goes straight to {site.email}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
