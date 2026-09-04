import Image from "next/image";

/**
 * Slim university affiliation bar pinned above the main navigation on every
 * page. Height is 1.25rem (h-5); SiteHeader sits at top-5 to clear it.
 */
export function AffiliationStrip() {
  return (
    <div className="fixed inset-x-0 top-0 z-40 h-5 border-b border-white/10 bg-forest-900 text-ivory">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5">
          <Image
            src="/brand/cutm-crest.png"
            alt="Centurion University"
            width={14}
            height={14}
            className="h-3 w-3 shrink-0 object-contain"
          />
          <span className="truncate font-ui text-[0.65rem] font-medium tracking-wide text-ivory/85">
            An initiative of Centurion University
            <span className="hidden md:inline"> of Technology and Management</span>
          </span>
        </div>
        <a
          href="https://cutm.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 font-ui text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ivory/70 transition-colors hover:text-ivory sm:block"
        >
          cutm.ac.in
        </a>
      </div>
    </div>
  );
}
