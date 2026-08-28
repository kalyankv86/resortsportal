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
              <span className="leading-tight text-ivory">
                <span className="block font-heading text-xl">Centurion University</span>
                <span className="block font-ui text-[0.65rem] italic tracking-wide text-ivory/60">
                  Shaping Lives… Empowering Communities…
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
