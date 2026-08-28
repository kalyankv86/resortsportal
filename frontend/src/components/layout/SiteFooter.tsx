import Image from "next/image";
import Link from "next/link";
import { primaryNav, site, utilityNav } from "@/content/site";
import { Container } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-900 text-ivory/80">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ivory/95">
                <Image
                  src="/brand/cutm-crest.png"
                  alt="Centurion University"
                  width={38}
                  height={38}
                  className="h-[38px] w-[38px] object-contain"
                />
              </span>
              <span className="font-heading leading-none text-ivory">
                <span className="block text-xl">Centurion Wellness</span>
                <span className="mt-0.5 block font-ui text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ivory/60">
                  Eco Tourism
                </span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              {site.tagline}. A wellness, Ayurveda and eco-tourism sanctuary — an
              initiative of {site.org}.
            </p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ivory"
              >
                {site.address}
              </a>
              <span className="pt-1 text-ivory/60">{site.contactName}</span>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <span className="font-ui text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                Follow us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={site.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Centurion Wellness on Instagram"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-white/40 hover:text-ivory"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href={site.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Centurion Wellness on Facebook"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-white/40 hover:text-ivory"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {primaryNav.slice(0, 3).map((col) => (
            <div key={col.label} className="flex flex-col gap-3">
              <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-ivory">
                {col.label}
              </h3>
              <ul className="flex flex-col gap-2 text-sm">
                {(col.children ?? []).slice(0, 7).map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="transition-colors hover:text-ivory"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {utilityNav.map((u) => (
              <li key={u.href}>
                <Link href={u.href} className="hover:text-ivory">
                  {u.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ivory/50">
            © {new Date().getFullYear()} {site.org}. {site.name}.
          </p>
        </div>
      </Container>
    </footer>
  );
}
