"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav, site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const [hasHero, setHasHero] = useState(true);
  const [open, setOpen] = useState(false);

  // Solid (frosted) unless we're at the top of a page that has a dark hero
  // behind the header.
  const scrolled = !atTop || !hasHero;

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Sync with the DOM: does the current page render a dark hero behind us?
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHero(!!document.querySelector("[data-page-hero]"));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxury",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between rounded-pill px-4 py-2.5 transition-all duration-500 ease-luxury sm:px-6",
            scrolled
              ? "glass"
              : "bg-transparent border border-transparent shadow-none",
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label={`${site.shortName} home`}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
                scrolled ? "bg-transparent" : "bg-ivory/95 shadow-soft",
              )}
            >
              <Image
                src="/brand/cutm-crest.png"
                alt="Centurion University"
                width={36}
                height={36}
                priority
                className="h-9 w-9 object-contain"
              />
            </span>
            <span
              className={cn(
                "font-heading text-lg leading-none transition-colors sm:text-xl",
                scrolled ? "text-forest-800" : "text-ivory",
              )}
            >
              Centurion Wellness
              <span className="block font-ui text-[0.6rem] font-semibold uppercase tracking-[0.24em] opacity-70">
                Eco Tourism Resorts
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((node) => (
              <div key={node.label} className="group relative">
                <Link
                  href={node.href}
                  className={cn(
                    "rounded-pill px-3 py-2 font-ui text-sm font-medium transition-colors",
                    scrolled
                      ? "text-forest-800 hover:bg-sage-100/70"
                      : "text-ivory/90 hover:bg-white/10 hover:text-ivory",
                  )}
                >
                  {node.label}
                </Link>
                {node.children ? (
                  <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                    <ul className="glass w-60 rounded-3xl p-2">
                      {node.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className="block rounded-2xl px-4 py-2.5 font-ui text-sm text-forest-800 transition-colors hover:bg-sage-100/70"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              href="/guest-login"
              variant={scrolled ? "ghost" : "glass"}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Guest Login
            </Button>
            <Button href="/book-now" size="sm" className="hidden sm:inline-flex">
              Book Now
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
                scrolled ? "text-forest-800" : "text-ivory",
              )}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 bg-current transition-all",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-all",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 bg-current transition-all",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 top-0 z-40 overflow-y-auto bg-forest-900/95 px-6 pb-16 pt-24 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-md flex-col gap-2">
            {primaryNav.map((node) => (
              <div key={node.label} className="border-b border-white/10 py-3">
                <Link
                  href={node.href}
                  onClick={() => setOpen(false)}
                  className="font-heading text-2xl text-ivory"
                >
                  {node.label}
                </Link>
                {node.children ? (
                  <ul className="mt-2 flex flex-col gap-1">
                    {node.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-1.5 font-ui text-sm text-ivory/70"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Button href="/book-now" size="lg" onClick={() => setOpen(false)}>
                Book Now
              </Button>
              <Button
                href="/guest-login"
                variant="glass"
                size="lg"
                onClick={() => setOpen(false)}
              >
                Guest Login
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

