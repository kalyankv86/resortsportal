import Image from "next/image";
import Link from "next/link";
import { footerNav, site, utilityNav } from "@/content/site";
import { Container } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="mt-10 bg-forest-900 text-ivory/80">
      <Container className="py-6">
        <div className="grid gap-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ivory/95">
                <Image
                  src="/brand/cutm-crest.png"
                  alt="Centurion University"
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] object-contain"
                />
              </span>
              <span className="font-heading leading-none text-ivory">
                <span className="block text-lg">Centurion</span>
                <span className="mt-0.5 block font-ui text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/60">
                  Wellness &amp; Eco Tourism
                </span>
              </span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed">
              {site.tagline}. A wellness, Ayurveda and eco-tourism sanctuary — an
              initiative of {site.org}.
            </p>

            {/* Contact widget */}
            <div className="max-w-xs rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <h3 className="font-ui text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ivory/50">
                Get in touch
              </h3>
              <div className="mt-2 flex flex-col gap-1 text-[0.8rem]">
                <a
                  href={site.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-relaxed transition-colors hover:text-ivory"
                >
                  {site.address}
                </a>
                <span className="pt-0.5 text-ivory/60">{site.contactName}</span>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-ivory">
                  {site.phone}
                </a>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-ivory">
                  {site.email}
                </a>
              </div>
              <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
                <span className="font-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ivory/50">
                  Follow
                </span>
                <a
                  href={site.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Centurion Wellness on Instagram"
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-white/40 hover:text-ivory"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-white/40 hover:text-ivory"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {footerNav.map((col) => (
            <div key={col.label} className="flex flex-col gap-2">
              <h3 className="font-ui text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ivory">
                {col.label}
              </h3>
              <ul className="flex flex-col gap-1.5 text-[0.8rem]">
                {col.children.map((c) => (
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

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-3 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.68rem]">
            {utilityNav.map((u) => (
              <li key={u.href}>
                <Link href={u.href} className="hover:text-ivory">
                  {u.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[0.68rem] text-ivory/50">
            © {new Date().getFullYear()} {site.org}. {site.name}.
          </p>
        </div>
      </Container>
    </footer>
  );
}
